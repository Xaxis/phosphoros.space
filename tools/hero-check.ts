// Drives the home page's animated Venus in Chromium and fails on the first thing that does not
// work: autoplay, pause, keyboard stepping, reduced motion, the fallback without WebGL 2, and any
// console error. With a folder, also saves the hero at a few dates for a person to look at.
//
//   node tools/hero-check.ts [URL] [SHOTS_DIR]
//   heavy node tools/hero-check.ts http://localhost:3417 /tmp/hero
import type { BrowserContext, Page } from "playwright-core";
import { chromium } from "playwright-core";
import { CHROMIUM_ARGS } from "./lib/chromium.ts";

const url = process.argv[2] ?? "http://localhost:3417";
const shots = process.argv[3];
const EPOCH = Date.UTC(2027, 0, 1);
const SHOT_DATES = [
  "2027-01-01",
  "2033-09-01",
  "2034-10-01",
  "2034-12-05",
  "2035-08-01",
  "2036-04-01",
  "2036-09-20",
  "2036-12-31",
];

const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
let failed = 0;
function check(ok: boolean, what: string, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"} ${what}${detail ? `: ${detail}` : ""}`);
  if (!ok) failed++;
}

async function open(opts: { reduced?: boolean; noWebgl?: boolean; width?: number }) {
  const ctx: BrowserContext = await browser.newContext({
    viewport: { width: opts.width ?? 1440, height: 900 },
    reducedMotion: opts.reduced ? "reduce" : "no-preference",
  });
  if (opts.noWebgl) {
    await ctx.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      // biome-ignore lint/suspicious/noExplicitAny: patching a DOM overload set
      (HTMLCanvasElement.prototype as any).getContext = function (
        type: string,
        ...rest: unknown[]
      ) {
        // biome-ignore lint/suspicious/noExplicitAny: patching a DOM overload set
        return type === "webgl2" ? null : (get as any).call(this, type, ...rest);
      };
    });
  }
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${url}/`, { waitUntil: "load", timeout: 120_000 });
  return { ctx, page, errors };
}

/** Lets the scene draw a frame or two, then reads what the hero says. */
async function read(page: Page) {
  await page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 200))),
      ),
  );
  return page.evaluate(() => {
    const slider = document.querySelector<HTMLInputElement>(".vision-track input");
    return {
      scene: document.querySelector(".hero")?.getAttribute("data-scene") ?? "",
      day: Number(slider?.value ?? Number.NaN),
      valuetext: slider?.getAttribute("aria-valuetext") ?? "",
      play: document.querySelector(".vision-play")?.getAttribute("aria-label") ?? "",
    };
  });
}

const live = (page: Page) =>
  page
    .waitForSelector('[data-scene="live"]', { timeout: 120_000 })
    .then(() => page.waitForTimeout(1800));

{
  const { ctx, page, errors } = await open({});
  await live(page);
  const a = await read(page);
  await page.waitForTimeout(3000);
  const b = await read(page);
  check(b.day > a.day, "plays on its own", `day ${a.day} to ${b.day}`);
  check(b.play === "Pause the animation", "the button offers pause while playing");

  await page.click(".vision-play");
  const c = await read(page);
  await page.waitForTimeout(1500);
  const d = await read(page);
  check(c.play === "Play the animation" && c.day === d.day, "pause holds the date", `${c.day}`);

  await page.focus(".vision-track input");
  await page.keyboard.press("ArrowRight");
  const e = await read(page);
  await page.keyboard.press("ArrowRight");
  const f = await read(page);
  await page.keyboard.press("ArrowLeft");
  const g = await read(page);
  check(
    f.day > e.day && g.day === e.day && e.valuetext.includes(":"),
    "arrow keys step between events",
    `${e.valuetext} | ${f.valuetext}`,
  );

  await page.keyboard.press("End");
  const h = await read(page);
  check(h.valuetext.startsWith("December 2036"), "End shows the deadline", h.valuetext);
  check(
    h.play === "Replay the animation from 2027",
    "at the deadline the button offers replay",
    h.play,
  );
  await page.click(".vision-play");
  await page.waitForTimeout(1200);
  const i = await read(page);
  check(i.day < 400, "play from the end starts again", `day ${i.day}`);

  // Play the last weeks for real: it must stop on the deadline, offer replay, keep the finished
  // planet turning, and never rewind on its own.
  await page.click(".vision-play");
  await page.locator(".vision-track input").fill(String(Number(h.day) - 30));
  await page.click(".vision-play");
  await page.waitForFunction(
    () =>
      document.querySelector(".vision-play")?.getAttribute("aria-label") ===
      "Replay the animation from 2027",
    undefined,
    { timeout: 180_000 },
  );
  const j = await read(page);
  const planet = page.locator(".vision-planet");
  const shotA = await planet.screenshot({ timeout: 180_000 });
  await page.waitForTimeout(4000);
  const shotB = await planet.screenshot({ timeout: 180_000 });
  const k = await read(page);
  check(
    j.day === h.day && k.day === h.day && !shotA.equals(shotB),
    "playing ends on the deadline and the finished planet keeps turning",
    `day ${j.day} then ${k.day}, frames ${shotA.equals(shotB) ? "frozen" : "moving"}`,
  );

  if (shots) {
    await page.click(".vision-play");
    for (const iso of SHOT_DATES) {
      const day = Math.round((Date.parse(`${iso}T00:00:00Z`) - EPOCH) / 86_400_000);
      await page.evaluate((v) => {
        const s = document.querySelector<HTMLInputElement>(".vision-track input");
        if (!s) return;
        s.value = String(v);
        s.dispatchEvent(new Event("input", { bubbles: true }));
      }, day);
      await read(page);
      const box = await page.locator(".hero").boundingBox();
      // A busy machine starves SwiftShader, and the screenshot's font wait with it.
      await page.screenshot({
        path: `${shots}/hero-${iso}.png`,
        clip: box ?? undefined,
        timeout: 180_000,
      });
    }
    console.log(`     shots in ${shots}`);
  }
  const dpr = await page.evaluate(() => document.querySelector("canvas")?.dataset.dpr);
  console.log(`     pixel ratio after playing: ${dpr} (lower on a slow renderer)`);
  check(errors.length === 0, "no console errors", errors.join(" | "));
  await ctx.close();
}

{
  const { ctx, page, errors } = await open({ reduced: true });
  await live(page);
  const a = await read(page);
  await page.waitForTimeout(1500);
  const b = await read(page);
  check(
    a.play === "Play the animation" && a.day === b.day && a.valuetext.includes("Earth-like"),
    "reduced motion starts still on the Earth-like day",
    a.valuetext,
  );
  check(errors.length === 0, "no console errors with reduced motion", errors.join(" | "));
  await ctx.close();
}

{
  const { ctx, page, errors } = await open({ noWebgl: true });
  await page.waitForTimeout(2500);
  const s = await read(page);
  const shown = await page.evaluate(() => ({
    still: getComputedStyle(document.querySelector(".vision-still") as Element).opacity,
    controls: getComputedStyle(document.querySelector(".vision-controls") as Element).display,
  }));
  check(
    s.scene === "none" && shown.still === "1" && shown.controls === "none",
    "without WebGL 2 the still planet shows and the controls go",
    JSON.stringify({ scene: s.scene, ...shown }),
  );
  check(errors.length === 0, "no console errors without WebGL", errors.join(" | "));
  await ctx.close();
}

await browser.close();
if (failed) {
  console.log(`${failed} hero check(s) failed`);
  process.exit(1);
}
console.log("hero checks pass");
