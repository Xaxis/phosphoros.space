// Checks what screenshots miss: no page wider than a phone, the Explorer's table fits, the page menu
// closes the ways a reader expects, the late-Lattice message, unique ids and the 404 title. Run it
// against a built site (Chromium on SwiftShader, so under heavy):
//
//   heavy node tools/layout-check.ts http://localhost:3417 /tmp/layout
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
  for (const path of paths) {
    const html = await (await fetch(`${base}${path}`)).text();
    const url = html.match(/property="og:url" content="([^"]*)"/)?.[1] ?? "";
    const img = html.match(/property="og:image" content="([^"]*)"/)?.[1] ?? "";
    const local = img.replace(/^https:\/\/phosphoros\.space/, base);
    const res = img ? await fetch(local) : undefined;
    const own = path === "/" || new URL(url || "x:/").pathname === path;
    if (!own || !res?.ok || !/^image\//.test(res.headers.get("content-type") ?? ""))
      wrong.push(`${path} (${url} ${img} ${res?.status})`);
  }
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
  const status = await p
    .locator('[role="status"]')
    .textContent()
    .then((t) => t ?? "")
    .catch(() => "");
  check(/full power after the deadline/.test(status), "status line announces it", status);
  const live = await p.evaluate(() => document.querySelectorAll("[aria-live]").length);
  check(live === 0, "no aria-live region repeats the table", String(live));
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
      /2030/.test(pick ?? ""),
    "timeline filters lanes and the critical path, moves its date and shows a selected row",
    JSON.stringify({ all, noVenus, critical, when, under, pick }),
  );
}
await b.close();
console.log(failed ? `${failed} layout check(s) failed` : "layout checks pass");
process.exit(failed ? 1 : 0);
