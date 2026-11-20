// Renders the site's raster images from their sources, in Chromium (on SwiftShader):
//   - web/app/opengraph-image.png, the 1200x630 share card, from tools/og.html with every {id}
//     filled from the model, so the card's numbers are the site's numbers;
//   - web/app/apple-icon.png (180x180) and web/app/favicon.ico (32x32), from web/app/icon.svg.
// Run it after changing a source or a number on the card, look at the images, and commit them.
//
//   ~/.claude/claude-core/bin/heavy node tools/assets.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { compute } from "@phosphoros/calc";
import { loadInputs } from "@phosphoros/calc/load";
import { fill } from "@phosphoros/calc/template";
import { chromium } from "playwright-core";
import { CHROMIUM_ARGS } from "./lib/chromium.ts";

const root = resolve(import.meta.dirname, "..");
const app = join(root, "web/app");
const r = compute(loadInputs());
const card = fill(readFileSync(join(root, "tools/og.html"), "utf8"), (id) => r.get(id));

const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
try {
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.setContent(card, { waitUntil: "networkidle" });
  await og.evaluate(() => document.fonts.ready);
  writeFileSync(join(app, "opengraph-image.png"), await og.screenshot({ type: "png" }));

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
  JSON.stringify({ ok: true, wrote: ["opengraph-image.png", "apple-icon.png", "favicon.ico"] }),
);
