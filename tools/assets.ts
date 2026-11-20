// Renders the site's raster images from their sources, in Chromium (on SwiftShader):
//   - web/app/opengraph-image.png, the home page's 1200x630 share card, from tools/og.html with every
//     {id} filled from the model, so the card's numbers are the site's numbers;
//   - web/public/og/<page>.jpg, every other page's card, from tools/og-page.html and the page's own
//     title and description (tools/lib/cards.ts);
//   - web/app/apple-icon.png (180x180) and web/app/favicon.ico (32x32), from web/app/icon.svg.
// web/public/og/cards.json records a hash of each card's filled HTML; --check (run by pnpm lint, no
// browser) fails when a card no longer matches its page or the model. Run it after changing a title,
// a description or a number on a card, look at the images, and commit them.
//
//   ~/.claude/claude-core/bin/heavy node tools/assets.ts
//   node tools/assets.ts --check
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { compute } from "@phosphoros/calc";
import { loadContent } from "@phosphoros/calc/content";
import { loadInputs } from "@phosphoros/calc/load";
import { fill } from "@phosphoros/calc/template";
import { chromium } from "playwright-core";
import { cardHtml, pageCards } from "./lib/cards.ts";
import { CHROMIUM_ARGS } from "./lib/chromium.ts";

const root = resolve(import.meta.dirname, "..");
const app = join(root, "web/app");
const pub = join(root, "web/public");
const r = compute(loadInputs());
const card = fill(readFileSync(join(root, "tools/og.html"), "utf8"), (id) => r.get(id));
const pageTemplate = readFileSync(join(root, "tools/og-page.html"), "utf8");
const pages = pageCards(root, r, loadContent()).map((c) => ({
  ...c,
  html: cardHtml(pageTemplate, c),
}));
const hash = (html: string) => createHash("sha256").update(html).digest("hex").slice(0, 16);
const want: Record<string, string> = {
  "/opengraph-image.png": hash(card),
  ...Object.fromEntries(pages.map((p) => [p.file, hash(p.html)])),
};
const manifest = join(pub, "og/cards.json");

if (process.argv.includes("--check")) {
  const have: Record<string, string> = existsSync(manifest)
    ? JSON.parse(readFileSync(manifest, "utf8"))
    : {};
  const stale = Object.keys(want).filter(
    (f) =>
      have[f] !== want[f] ||
      !existsSync(f === "/opengraph-image.png" ? join(app, f) : join(pub, f)),
  );
  const extra = Object.keys(have).filter((f) => !(f in want));
  if (stale.length || extra.length) {
    console.error(
      `Share cards are stale: ${[...stale, ...extra].join(", ")}. Run: ~/.claude/claude-core/bin/heavy node tools/assets.ts`,
    );
    process.exit(1);
  }
  console.log(`Share cards are current (${Object.keys(want).length}).`);
  process.exit(0);
}

const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
try {
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.setContent(card, { waitUntil: "networkidle" });
  await og.evaluate(() => document.fonts.ready);
  writeFileSync(join(app, "opengraph-image.png"), await og.screenshot({ type: "png" }));

  mkdirSync(join(pub, "og"), { recursive: true });
  for (const p of pages) {
    await og.setContent(p.html, { waitUntil: "networkidle" });
    await og.evaluate(() => document.fonts.ready);
    writeFileSync(join(pub, p.file), await og.screenshot({ type: "jpeg", quality: 86 }));
  }
  writeFileSync(manifest, `${JSON.stringify(want, null, 2)}\n`);

  const svg = readFileSync(join(app, "icon.svg"), "utf8");
  const shoot = async (size: number, square: boolean): Promise<Buffer> => {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    // The home-screen icon is square and opaque; iOS rounds its corners itself.
    const art = square ? svg.replace('rx="7"', 'rx="0"') : svg;
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${art.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`,
    );
    const png = await page.screenshot({ type: "png", omitBackground: !square });
    await page.close();
    return png;
  };
  writeFileSync(join(app, "apple-icon.png"), await shoot(180, true));

  // An ICO holding one 32x32 PNG: what browsers ask for at /favicon.ico.
  const png = await shoot(32, false);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(32, 6);
  header.writeUInt8(32, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  writeFileSync(join(app, "favicon.ico"), Buffer.concat([header, png]));
} finally {
  await browser.close();
}
console.log(
  JSON.stringify({
    ok: true,
    wrote: ["opengraph-image.png", "apple-icon.png", "favicon.ico", `${pages.length} page cards`],
  }),
);
