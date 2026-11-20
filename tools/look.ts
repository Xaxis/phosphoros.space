/**
 * Renders figures/svg/<id>.svg in the dark and light themes to PNGs, to look at a figure the way a
 * reader will before calling it done. In Chromium on SwiftShader.
 *
 *   node tools/look.ts OUT_DIR ID...      writes OUT_DIR/<id>-dark.png and OUT_DIR/<id>-light.png
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { CHROMIUM_ARGS } from "./lib/chromium.ts";

const [out, ...ids] = process.argv.slice(2);
if (!out || !ids.length) {
  console.error("usage: node tools/look.ts OUT_DIR ID...");
  process.exit(2);
}
const root = path.resolve(import.meta.dirname, "..");
const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
try {
  for (const id of ids) {
    const svg = readFileSync(path.join(root, "figures", "svg", `${id}.svg`), "utf8");
    for (const scheme of ["dark", "light"] as const) {
      const page = await browser.newPage({ viewport: { width: 820, height: 900 } });
      await page.emulateMedia({ colorScheme: scheme });
      await page.setContent(
        `<html><body style="margin:20px;background:${scheme === "dark" ? "#090a12" : "#fbf7ef"}"><div style="width:760px">${svg}</div></body></html>`,
      );
      await (await page.$("svg"))?.screenshot({ path: path.join(out, `${id}-${scheme}.png`) });
      await page.close();
    }
  }
} finally {
  await browser.close();
}
console.log(`Wrote ${ids.length * 2} images to ${out}.`);
