/**
 * Lets Node run the figures' .tsx files: Node strips TypeScript types itself but not JSX, so this
 * hook compiles .tsx with sucrase on load. Used as: node --import ./tools/lib/register.ts SCRIPT
 */
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import { transform } from "sucrase";

registerHooks({
  load(url, context, nextLoad) {
    if (!url.startsWith("file:") || !url.endsWith(".tsx")) return nextLoad(url, context);
    const file = fileURLToPath(url);
    const { code } = transform(readFileSync(file, "utf8"), {
      transforms: ["typescript", "jsx"],
      jsxRuntime: "automatic",
      production: true,
      filePath: file,
    });
    return { format: "module", source: code, shortCircuit: true };
  },
});
