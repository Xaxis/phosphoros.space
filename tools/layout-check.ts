// Checks what screenshots miss: no page wider than a phone, the Explorer's table fits, the page menu
// closes the ways a reader expects, the late-Lattice message, unique ids and the 404 title. Run it
// against a built site (Chromium on SwiftShader, so under heavy):
//
//   heavy node tools/layout-check.ts http://localhost:3417 /tmp/layout

import { readFileSync } from "node:fs";
import { chromium, type Page } from "playwright-core";
import { CHROMIUM_ARGS } from "./lib/chromium.ts";

const base = process.argv[2] ?? "http://localhost:3417";
const out = process.argv[3] ?? "/tmp";
const b = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
let failed = 0;
const check = (ok: boolean, what: string, d = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${what}${d ? `: ${d}` : ""}`);
  if (!ok) failed++;
};
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(
  (m) => m[1] || "/",
);
{
  // Each page shares as itself: its own og:url, and a card image that loads.
  const wrong: string[] = [];
  const raw: string[] = [];
  for (const path of paths) {
    const html = await (await fetch(`${base}${path}`)).text();
    const url = html.match(/property="og:url" content="([^"]*)"/)?.[1] ?? "";
    const img = html.match(/property="og:image" content="([^"]*)"/)?.[1] ?? "";
    const local = img.replace(/^https:\/\/phosphoros\.space/, base);
    const res = img ? await fetch(local) : undefined;
    const own = path === "/" || new URL(url || "x:/").pathname === path;
    if (!own || !res?.ok || !/^image\//.test(res.headers.get("content-type") ?? ""))
      wrong.push(`${path} (${url} ${img} ${res?.status})`);
    // A number template the page forgot to fill shows readers "{some-id}".
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
    for (const m of visible.matchAll(/\{[a-z]+(?:-[a-z0-9]+)+(?:\|[a-z=]+)?\}/g))
      raw.push(`${path} ${m[0]}`);
  }
  check(raw.length === 0, "no page shows an unfilled number template", raw.join(", "));
  check(
    wrong.length === 0,
    `every page shares its own URL and card (${paths.length})`,
    wrong.join(", "),
  );
}
for (const width of [320, 390]) {
  const ctx = await b.newContext({ viewport: { width, height: 800 } });
  const p = await ctx.newPage();
  const wide: string[] = [];
  for (const path of [...paths, "/explore"]) {
    await p.goto(`${base}${path}`, { waitUntil: "load" });
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w > width) wide.push(`${path} ${w}`);
  }
  check(
    wide.length === 0,
    `no page wider than ${width}px (${paths.length + 1} pages)`,
    wide.join(", "),
  );
  await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/explore`, { waitUntil: "load" });
  const t = await p.evaluate(() => {
    const r = document.querySelector(".explorer-table")?.getBoundingClientRect();
    const tb = document.querySelector(".explorer-table table")?.getBoundingClientRect();
    return { region: Math.round(r?.right ?? Infinity), table: Math.round(tb?.right ?? Infinity) };
  });
  check(t.region <= 390 && t.table <= 390, "explorer table fits a 390px phone", JSON.stringify(t));
  await p.locator(".explorer-table").screenshot({ path: `${out}/explore-table-phone.png` });
  await p.goto(`${base}/explore?set=foundry-doubling-days:120`, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  const err = await p
    .locator(".explorer-error")
    .textContent()
    .then((t) => t ?? "")
    .catch(() => "");
  check(
    /full power after the deadline/.test(err),
    "late Lattice shows the reason, not negative energy",
    err,
  );
  // The status line speaks once the sliders settle, half a second after the model, and a busy
  // page (the journey compiling its shaders) can hold that back: wait for it to speak.
  const status = await p
    .waitForFunction(
      () =>
        /full power after the deadline/.test(
          document.querySelector('[role="status"]')?.textContent ?? "",
        ),
      undefined,
      { timeout: 30_000 },
    )
    .catch(() => {})
    .then(() => p.locator('[role="status"]').textContent())
    .then((t) => t ?? "")
    .catch(() => "");
  check(/full power after the deadline/.test(status), "status line announces it", status);
  // A late variant's journey runs to 2039: thirteen years on the panel's slider, on a phone.
  await p.goto(`${base}/explore?set=foundry-doubling-days:90`, { waitUntil: "load" });
  await p
    .waitForFunction(
      () => Number(document.querySelector<HTMLInputElement>(".journey-panel input")?.max) > 3652,
      undefined,
      { timeout: 60_000 },
    )
    .catch(() => {});
  const panel = await p.evaluate(() => {
    const card = document.querySelector(".journey-panel-card")?.getBoundingClientRect();
    const years = [...document.querySelectorAll(".journey-panel .vision-years span")].map((s) =>
      s.getBoundingClientRect(),
    );
    return {
      page: document.documentElement.scrollWidth,
      card: Math.round(card?.right ?? Infinity),
      years: years.length,
      last: Math.round(Math.max(...years.map((y) => y.right))),
    };
  });
  check(
    panel.page <= 390 && panel.card <= 390 && panel.years > 10 && panel.last <= panel.card,
    "a late variant's journey panel fits a 390px phone, years and all",
    JSON.stringify(panel),
  );
  const live = await p.evaluate(() => document.querySelectorAll("[aria-live]").length);
  check(live === 0, "no aria-live region repeats the table", String(live));
  await ctx.close();
}
{
  // The Explorer marks basis in words and redraws the schedule, the air and the budget per variant.
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  // The Explorer runs the whole model in the page for a variant, which can take a few seconds on a
  // busy machine, so a variant waits for the verdict to move off the plan's before it is read.
  const look = async (query: string, planWhen?: string) => {
    await p.goto(`${base}/explore${query}`, { waitUntil: "load" });
    await p.waitForTimeout(1200);
    if (planWhen)
      await p
        .waitForFunction(
          (when) =>
            (document.querySelector(".explorer-verdict strong")?.textContent ?? "").replace(
              /\s+/g,
              " ",
            ) !== when,
          planWhen,
          { timeout: 20_000 },
        )
        .catch(() => undefined);
    return p.evaluate(() => {
      const text = (e: Element | null | undefined) => (e?.textContent ?? "").replace(/\s+/g, " ");
      const figs = [...document.querySelectorAll(".explorer-results figure")];
      return {
        figs: figs.filter((f) => f.querySelector("svg")).length,
        badges: document.querySelectorAll(".explorer-controls .explorer-input .basis").length,
        sliders: document.querySelectorAll('.explorer-controls input[type="range"]').length,
        gantt: text(figs[0]?.querySelector("svg")),
        when: text(document.querySelector(".explorer-verdict strong")),
        bands: document.querySelectorAll(".explorer-controls .explorer-band > span").length,
        margin: text(document.querySelector("#x-foundry-doubling-days ~ .explorer-margin")),
      };
    });
  };
  const plan = await look("");
  const slow = await look("?set=foundry-doubling-days:70", plan.when);
  check(
    plan.figs === 3 &&
      plan.badges === plan.sliders &&
      plan.sliders > 0 &&
      plan.gantt.includes(plan.when) &&
      slow.when !== plan.when &&
      slow.gantt.includes(slow.when) &&
      plan.bands === plan.sliders &&
      /holds (up to|between)/.test(plan.margin),
    "explorer marks basis in words, shows each slider's margin and redraws the Gantt for a variant",
    JSON.stringify({ ...plan, gantt: plan.gantt.length, slowWhen: slow.when }),
  );
  await ctx.close();
}
async function menu(p: Page) {
  return p.evaluate(() => document.querySelector("#all-pages")?.matches(":popover-open"));
}
for (const width of [390, 1440]) {
  const ctx = await b.newContext({ viewport: { width, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/plan`, { waitUntil: "load" });
  await p.click('[popovertarget="all-pages"]');
  const open1 = await menu(p);
  await p.keyboard.press("Escape");
  const esc = await menu(p);
  await p.click('[popovertarget="all-pages"]');
  await p.mouse.click(10, 600);
  const outside = await menu(p);
  await p.click('[popovertarget="all-pages"]');
  const links = await p.locator("#all-pages a").count();
  await p.focus("#all-pages a:last-child");
  await p.keyboard.press("Tab");
  const tabbed = await menu(p);
  check(
    open1 === true && esc === false && outside === false && tabbed === false && links === 13,
    `menu at ${width}px opens, and Escape, a tap outside and tabbing out close it`,
    JSON.stringify({ open1, esc, outside, tabbed, links }),
  );
  if (width === 390) {
    await p.click('[popovertarget="all-pages"]');
    await p.screenshot({ path: `${out}/menu-phone.png` });
  }
  await ctx.close();
}
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${base}/no-such-page`);
  check((await p.title()).startsWith("Page not found"), "404 has its own title", await p.title());
  await p.goto(`${base}/plan`);
  const ids = await p.evaluate(() => {
    const seen = new Map<string, number>();
    for (const e of document.querySelectorAll("[id]")) seen.set(e.id, (seen.get(e.id) ?? 0) + 1);
    return [...seen].filter(([, n]) => n > 1).map(([k]) => k);
  });
  check(ids.length === 0, "no duplicate ids on /plan", ids.join(", "));
  const toggle = await (await fetch(`${base}/plan`)).text();
  check(!toggle.includes("Switch to dark theme"), "server HTML does not offer the wrong theme");
  const fig = await p.evaluate(() => {
    const f = document.querySelector(".figure-art");
    return {
      tag: f?.tagName,
      tab: f?.getAttribute("tabindex"),
      label: f?.getAttribute("aria-label"),
    };
  });
  check(
    fig.tab === "0" && !!fig.label,
    "figures are focusable scroll regions",
    JSON.stringify(fig),
  );
  await p.goto(`${base}/contribute`);
  const pre = await p.evaluate(() =>
    [...document.querySelectorAll("pre")].every((e) => e.getAttribute("tabindex") === "0"),
  );
  check(pre, "code blocks take focus");
  await p.goto(`${base}/sources`);
  const a = await p.locator('.source-note a[href^="https://web.archive.org"]').count();
  check(a === 1, "the archive URL in a source note is a link", String(a));

  // The interactive timeline: every row of data/timeline.yaml, filters, the date cursor, a selection.
  // The selected row must show the model's own dates, read from the ledger.
  const ledger = JSON.parse(readFileSync("data/outputs.json", "utf8")) as {
    quantities: Record<string, { shown: string }>;
  };
  const shown = (id: string) => (ledger.quantities[id]?.shown ?? id).replace(/\s+/g, " ");
  await p.goto(`${base}/timeline`, { waitUntil: "load" });
  const rows = () => p.locator(".tl-row").count();
  const all = await rows();
  await p.getByRole("button", { name: "Venus", exact: true }).click();
  const noVenus = await rows();
  await p.getByRole("button", { name: "Venus", exact: true }).click();
  await p.getByRole("button", { name: "Critical path only" }).click();
  const critical = await rows();
  await p.getByRole("button", { name: "Critical path only" }).click();
  await p.locator("#tl-day").fill("1200");
  const when = await p.locator(".tl-date-value").textContent();
  const under = await p.locator(".tl-under li").allTextContents();
  await p.locator(".tl-row", { hasText: "Helios Lattice built" }).locator(".tl-label").click();
  const pick = await p.locator(".tl-facts").textContent();
  check(
    all >= 20 &&
      noVenus < all &&
      critical < all &&
      critical > 0 &&
      when === "April 2030" &&
      under.some((t) => t.includes("Ouroboros growth")) &&
      /Mercury/.test(pick ?? "") &&
      (pick ?? "").replace(/\s+/g, " ").includes(shown("foundry-full-scale")) &&
      (pick ?? "").replace(/\s+/g, " ").includes(shown("helios-full-power")),
    "timeline filters lanes and the critical path, moves its date and shows a selected row",
    JSON.stringify({ all, noVenus, critical, when, under, pick }),
  );
}
await b.close();
console.log(failed ? `${failed} layout check(s) failed` : "layout checks pass");
process.exit(failed ? 1 : 0);
