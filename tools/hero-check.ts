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

/**
 * A real GPU's maths, which SwiftShader's is kinder than: pow() of a negative base is NaN there, and
 * normalize() comes out a hair long, so 1.0 - dot(N, V) can dip below zero. One NaN pixel spreads
 * through the bloom pass and blacks out the whole scene, which is how the Aegis bubble blanked the
 * hero on real screens while every SwiftShader check passed. Every shader is rewritten to behave so.
 */
const HOSTILE_GLSL = `
float hPow(float x, float y) { return x < 0.0 ? sqrt(x) : pow(x, y); }
vec2 hPow(vec2 x, vec2 y) { return vec2(hPow(x.x, y.x), hPow(x.y, y.y)); }
vec3 hPow(vec3 x, vec3 y) { return vec3(hPow(x.x, y.x), hPow(x.y, y.y), hPow(x.z, y.z)); }
vec4 hPow(vec4 x, vec4 y) { return vec4(hPow(x.xyz, y.xyz), hPow(x.w, y.w)); }
float hNorm(float v) { return normalize(v); }
vec2 hNorm(vec2 v) { return normalize(v) * 1.0005; }
vec3 hNorm(vec3 v) { return normalize(v) * 1.0005; }
vec4 hNorm(vec4 v) { return normalize(v) * 1.0005; }
`;

async function open(opts: {
  reduced?: boolean;
  noWebgl?: boolean;
  hostile?: boolean;
  width?: number;
}) {
  const ctx: BrowserContext = await browser.newContext({
    viewport: { width: opts.width ?? 1440, height: 900 },
    reducedMotion: opts.reduced ? "reduce" : "no-preference",
  });
  if (opts.hostile) {
    await ctx.addInitScript((helpers: string) => {
      const source = WebGL2RenderingContext.prototype.shaderSource;
      WebGL2RenderingContext.prototype.shaderSource = function (shader, code) {
        const lines = code.split("\n");
        const at = lines.findLastIndex((l) => /^\s*precision\s/.test(l));
        if (at < 0) return source.call(this, shader, code);
        const body = lines
          .slice(at + 1)
          .join("\n")
          .replace(/\bpow\(/g, "hPow(")
          .replace(/\bnormalize\(/g, "hNorm(");
        (window as unknown as { hostile: number }).hostile =
          ((window as unknown as { hostile?: number }).hostile ?? 0) + 1;
        return source.call(this, shader, [...lines.slice(0, at + 1), helpers, body].join("\n"));
      };
    }, HOSTILE_GLSL);
  }
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

/** Mean brightness, 0 to 255, of what the screen shows in an element's box. */
async function brightness(page: Page, selector: string) {
  const png = await page.locator(selector).screenshot({ timeout: 180_000 });
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d") as CanvasRenderingContext2D;
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += (d[i] ?? 0) + (d[i + 1] ?? 0) + (d[i + 2] ?? 0);
    return sum / (d.length / 4) / 3;
  }, png.toString("base64"));
}

/** Shows a day and lets the scene draw it. */
async function showDay(page: Page, day: number) {
  await page.evaluate((v) => {
    const s = document.querySelector<HTMLInputElement>(".vision-track input");
    if (!s) return;
    s.value = String(v);
    s.dispatchEvent(new Event("input", { bubbles: true }));
  }, day);
  await read(page);
}

{
  // Every captioned day, drawn with a real GPU's maths, must look like the same day drawn kindly:
  // a NaN anywhere would black out the frame.
  const kind = await open({ reduced: true });
  const hostile = await open({ reduced: true, hostile: true });
  await Promise.all([live(kind.page), live(hostile.page)]);
  const rewritten = await hostile.page.evaluate(
    () => (window as unknown as { hostile?: number }).hostile ?? 0,
  );
  const marks = await kind.page.locator(".vision-mark").count();
  const days: number[] = [];
  await showDay(kind.page, 0);
  await kind.page.focus(".vision-track input");
  for (let i = 0; i < marks; i++) {
    await kind.page.keyboard.press("ArrowRight");
    days.push((await read(kind.page)).day);
  }
  const dark: string[] = [];
  for (const day of days) {
    await showDay(kind.page, day);
    await showDay(hostile.page, day);
    const a = await brightness(kind.page, ".vision-planet");
    const b = await brightness(hostile.page, ".vision-planet");
    if (b < a * 0.7) dark.push(`day ${day}: ${b.toFixed(1)} against ${a.toFixed(1)}`);
  }
  check(
    rewritten > 4 && days.length > 10 && dark.length === 0,
    "every captioned day survives a real GPU's NaN maths",
    dark.length ? dark.join("; ") : `${days.length} days, ${rewritten} shaders rewritten`,
  );
  check(
    hostile.errors.length === 0,
    "the rewritten shaders compile",
    hostile.errors.join(" | ").slice(0, 300),
  );
  await kind.ctx.close();
  await hostile.ctx.close();
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
