// Drives the home page's journey in Chromium and fails on the first thing that does not work:
// autoplay, pause, keyboard stepping, every captioned day drawn (and drawn the same with a real
// GPU's NaN maths), the full-screen dialog (steps, speed, camera, readings, keyboard, drag, Escape),
// the dialog on a phone, reduced motion, the fallback without WebGL 2, and any console error. With
// a folder, also saves the hero at a few dates for a person to look at.
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
  path?: string;
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
  await page.goto(`${url}${opts.path ?? "/"}`, { waitUntil: "load", timeout: 120_000 });
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

/**
 * Mean brightness, 0 to 255, of what the screen shows in an element's box, and its spread: a blank
 * canvas, or one a NaN blacked out, is one flat colour, while any drawn sky has stars in it.
 */
async function brightness(page: Page, selector: string) {
  return (await picture(page, selector)).mean;
}

async function picture(page: Page, selector: string) {
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
    let sq = 0;
    for (let i = 0; i < d.length; i += 4) {
      const v = ((d[i] ?? 0) + (d[i + 1] ?? 0) + (d[i + 2] ?? 0)) / 3;
      sum += v;
      sq += v * v;
    }
    const n = d.length / 4;
    const mean = sum / n;
    return { mean, spread: Math.sqrt(Math.max(0, sq / n - mean * mean)) };
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
  const blank: string[] = [];
  for (const day of days) {
    await showDay(kind.page, day);
    await showDay(hostile.page, day);
    const a = await picture(kind.page, ".vision-planet");
    const b = await brightness(hostile.page, ".vision-planet");
    if (a.spread < 4) blank.push(`day ${day}: spread ${a.spread.toFixed(1)}`);
    if (b < a.mean * 0.7) dark.push(`day ${day}: ${b.toFixed(1)} against ${a.mean.toFixed(1)}`);
  }
  check(
    blank.length === 0,
    "every captioned day draws a picture, never a blank or black frame",
    blank.join("; "),
  );
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

/** Waits until the journey has drawn what it was asked to and gone quiet. */
async function settled(page: Page) {
  await page.waitForFunction(
    () => {
      const c = document.querySelector<HTMLCanvasElement>("canvas.journey-canvas");
      return c?.dataset.idle === "1";
    },
    undefined,
    { timeout: 180_000 },
  );
  // And the dialog's fade-in has finished, or a screenshot catches the page through it.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running"),
  );
  await read(page);
}

{
  // The planet opens the journey full screen, as a modal dialog over the page.
  const { ctx, page, errors } = await open({});
  await live(page);
  await page.click(".vision-play");
  await page.click(".vision-planet");
  await page.waitForSelector("dialog.journey-dialog[open]", { timeout: 30_000 });
  const opened = await page.evaluate(() => {
    const d = document.querySelector("dialog.journey-dialog");
    return {
      modal: Boolean(d?.matches(":modal")),
      canvas: Boolean(d?.querySelector("canvas.journey-canvas")),
      focus: Boolean(d?.contains(document.activeElement)),
      steps: d?.querySelectorAll(".journey-steps button").length ?? 0,
      readings: [...(d?.querySelectorAll(".journey-reading dd") ?? [])].map((e) => e.textContent),
      scroll: getComputedStyle(document.documentElement).overflow,
    };
  });
  check(
    opened.modal && opened.canvas && opened.focus && opened.scroll === "hidden",
    "the planet opens the journey as a modal dialog, with the canvas and focus inside it",
    JSON.stringify(opened),
  );
  check(
    opened.steps > 20 &&
      opened.readings.length === 4 &&
      opened.readings.every((t) => t && t.length > 1),
    "the dialog lists every step and the four readings",
    `${opened.steps} steps; ${opened.readings.join(" | ")}`,
  );
  await settled(page);
  const before = await picture(page, ".journey-stage");
  check(before.spread > 4, "the dialog draws the scene", `spread ${before.spread.toFixed(1)}`);

  // A step jumps the story there: the caption, the slider and the readings follow.
  const steps = page.locator(".journey-steps button");
  const last = (await steps.count()) - 1;
  await steps.nth(last).click();
  await settled(page);
  const end = await page.evaluate(() => ({
    caption: document.querySelector(".journey-text")?.textContent ?? "",
    current: document.querySelector(".journey-steps [aria-current='step'] .journey-step-text")
      ?.textContent,
    surface: document.querySelector(".journey-reading dd")?.textContent ?? "",
  }));
  check(
    end.caption === end.current && /K \(1\d|K \(2\d/.test(end.surface.replace(/ /g, " ")),
    "a step shows its caption and the air on that day",
    JSON.stringify(end),
  );
  await steps.nth(3).click();
  await settled(page);

  // The camera follows a world the reader picks.
  await page.getByRole("button", { name: "Venus", exact: true }).click();
  await settled(page);
  const venus = await picture(page, ".journey-stage");
  const pressed = await page
    .getByRole("button", { name: "Venus", exact: true })
    .getAttribute("aria-pressed");
  check(
    pressed === "true" && venus.spread > 4,
    "the camera follows the world the reader picks",
    `pressed ${pressed}, spread ${venus.spread.toFixed(1)}`,
  );
  await page.getByRole("button", { name: "The story", exact: true }).click();
  await settled(page);

  // Dragging turns the view; Reset view puts it back.
  const stage = await page.locator(".journey-frame").boundingBox();
  const a = await page.locator(".journey-stage").screenshot({ timeout: 180_000 });
  if (stage) {
    const x = stage.x + stage.width / 2;
    const y = stage.y + stage.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 160, y + 40, { steps: 6 });
    await page.mouse.up();
  }
  await settled(page);
  const b = await page.locator(".journey-stage").screenshot({ timeout: 180_000 });
  check(!a.equals(b), "dragging turns the view");
  await page.getByRole("button", { name: "Reset view" }).click();
  await settled(page);

  // Speed and play.
  await page.getByRole("button", { name: "4×" }).click();
  const speed = await page.getByRole("button", { name: "4×" }).getAttribute("aria-pressed");
  // A click on the scene leaves the keys with the dialog, not with the button last pressed.
  if (stage) await page.mouse.click(stage.x + stage.width / 2, stage.y + stage.height / 2);
  const s0 = await read(page);
  await page.keyboard.press("Space");
  await page.waitForTimeout(2500);
  await page.keyboard.press("Space");
  const s1 = await read(page);
  check(
    speed === "true" && s1.day > s0.day,
    "Space plays and pauses the story in the dialog, at the chosen speed",
    `speed ${speed}, day ${s0.day} to ${s1.day}`,
  );

  // Escape closes it, focus returns to the planet, and the hero has its canvas back.
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("dialog[open]"), undefined, {
    timeout: 30_000,
  });
  await settled(page);
  const closed = await page.evaluate(() => ({
    canvas: Boolean(document.querySelector(".hero-space > canvas.journey-canvas")),
    focus: document.activeElement?.classList.contains("vision-planet") ?? false,
    scroll: getComputedStyle(document.documentElement).overflow,
  }));
  const hero = await picture(page, ".vision-planet");
  check(
    closed.canvas && closed.focus && closed.scroll !== "hidden" && hero.spread > 4,
    "Escape closes the dialog and gives the hero back its canvas and the focus",
    JSON.stringify({ ...closed, spread: hero.spread.toFixed(1) }),
  );
  check(errors.length === 0, "no console errors in the dialog", errors.join(" | "));
  await ctx.close();
}

{
  // On a phone the dialog fits the screen: nothing scrolls sideways, and the controls are in reach.
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${url}/`, { waitUntil: "load", timeout: 120_000 });
  await live(page);
  await page.click(".vision-play");
  await page.click(".vision-planet");
  await page.waitForSelector("dialog.journey-dialog[open]", { timeout: 30_000 });
  await settled(page);
  const fit = await page.evaluate(() => {
    const d = document.querySelector("dialog.journey-dialog") as HTMLElement;
    const r = (sel: string) => d.querySelector(sel)?.getBoundingClientRect();
    const play = r(".journey-controls .vision-play");
    const close = r(".journey-close");
    const frame = r(".journey-frame");
    return {
      sideways: d.scrollWidth > d.clientWidth + 1,
      play: Boolean(play && play.bottom <= innerHeight && play.top >= 0),
      close: Boolean(close && close.right <= innerWidth && close.top >= 0),
      frame: frame ? Math.round(frame.height) : 0,
    };
  });
  check(
    !fit.sideways && fit.play && fit.close && fit.frame > 200,
    "on a phone the dialog fits, with play and close in reach and room for the scene",
    JSON.stringify(fit),
  );
  if (shots) await page.screenshot({ path: `${shots}/dialog-phone.png`, timeout: 180_000 });
  check(errors.length === 0, "no page errors in the phone dialog", errors.join(" | "));
  await ctx.close();
}

{
  // The Explorer flies the reader's variant on the same engine. Doubling every 90 days, the Foundry
  // finishes late: the story runs past the deadline to Venus finished, and says where the deadline was.
  const { ctx, page, errors } = await open({ path: "/explore?set=foundry-doubling-days:90" });
  const idle = () =>
    page.waitForFunction(
      () =>
        document.querySelector<HTMLCanvasElement>(".journey-panel canvas")?.dataset.idle === "1",
      undefined,
      { timeout: 180_000 },
    );
  await page.waitForSelector('.journey-panel[data-scene="live"]', { timeout: 180_000 });
  await page.locator(".journey-panel").scrollIntoViewIfNeeded();
  await idle();
  const panel = () =>
    page.evaluate(() => {
      const q = (sel: string) => document.querySelectorAll(`.journey-panel ${sel}`).length;
      return {
        title: document.querySelector("#journey-panel-title")?.textContent ?? "",
        max: Number(document.querySelector<HTMLInputElement>(".journey-panel input")?.max),
        deadline: q(".vision-mark.is-deadline"),
        plan: q(".vision-mark.is-plan"),
        caption: document.querySelector(".journey-panel .vision-text")?.textContent ?? "",
      };
    });
  const late = await panel();
  // The canvas is marked, to prove a slider move keeps it rather than making another.
  await page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>(".journey-panel canvas");
    if (c) c.dataset.first = "1";
  });
  await page.evaluate(() => {
    const s = document.querySelector<HTMLInputElement>(".journey-panel input");
    if (!s) return;
    s.value = s.max;
    s.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await idle();
  const finish = await panel();
  const drawn = await picture(page, ".journey-panel-stage");
  check(
    late.title === "This variant, flown" &&
      late.max > 3652 &&
      late.deadline === 1 &&
      late.plan > 10 &&
      /green|Earth-like/.test(finish.caption) &&
      drawn.spread > 4,
    "the Explorer flies a late variant past the deadline to its finish",
    JSON.stringify({ ...late, end: finish.caption, spread: drawn.spread.toFixed(1) }),
  );

  // Back to a fast Foundry: the story is on time again, on the same canvas.
  const doubling = page.locator("#x-foundry-doubling-days");
  await doubling.focus();
  await doubling.press("Home");
  await page.waitForTimeout(1500);
  await idle();
  const fast = await panel();
  const same = await page.evaluate(() => ({
    kept: document.querySelector<HTMLCanvasElement>(".journey-panel canvas")?.dataset.first === "1",
    canvases: document.querySelectorAll("canvas.journey-canvas").length,
  }));
  await page.click(".journey-panel-box");
  await page.waitForSelector("dialog.journey-dialog[open]", { timeout: 30_000 });
  const dialogTitle = (await page.locator("#journey-title").textContent()) ?? "";
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("dialog[open]"), undefined, {
    timeout: 30_000,
  });
  const back = await page.evaluate(() =>
    Boolean(document.querySelector(".journey-panel-stage > canvas.journey-canvas")),
  );
  check(
    fast.max <= 3652 &&
      fast.deadline === 0 &&
      same.kept &&
      same.canvases === 1 &&
      dialogTitle.startsWith("This variant") &&
      back,
    "a slider move retells the story on the same canvas, and the card opens full screen",
    JSON.stringify({ max: fast.max, deadline: fast.deadline, ...same, dialogTitle, back }),
  );
  check(errors.length === 0, "no console errors in the Explorer's journey", errors.join(" | "));
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
