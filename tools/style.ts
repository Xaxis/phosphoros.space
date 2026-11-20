/**
 * The house rules a reviewer would otherwise have to remember.
 *
 *   1. No em dashes anywhere: copy, code, comments, docs, data. Use commas, colons, parentheses or
 *      separate sentences. A spaced en dash used as a dash counts too.
 *   2. No hand-typed quantities in docs/ prose. A number with a unit is a link to the ledger
 *      (numbers.md#id), so it changes when the model does. Years, counts and section numbers are fine.
 *
 *   node tools/style.ts          report and fail on any breach
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const TEXT = /\.(md|ts|tsx|mts|js|mjs|css|yaml|yml|json|html|txt|sh|svg)$/;
const SKIP = /(^|\/)(node_modules|\.next|out|pnpm-lock\.yaml)(\/|$)/;

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  cwd: ROOT,
  encoding: "utf8",
})
  .split("\n")
  .filter((f) => f && TEXT.test(f) && !SKIP.test(f) && f !== "tools/style.ts");

const problems: string[] = [];
const EM = /—|\s–\s/;

for (const f of files) {
  let text: string;
  try {
    text = readFileSync(path.join(ROOT, f), "utf8");
  } catch {
    continue;
  }
  text.split("\n").forEach((line, i) => {
    if (EM.test(line)) problems.push(`${f}:${i + 1}: em dash: ${line.trim().slice(0, 100)}`);
  });
}

// Units a quantity might be written in. A number directly before one of these, outside a link,
// code or a generated table, is a hand-typed quantity.
const UNITS = (
  "W kW MW GW TW PW J kJ MJ GJ EJ kg t kt Mt K °C bar Pa kPa MPa m cm mm km µm nm m² km² m³ km³ AU " +
  "km/s m/s m/s² W/m² kW/m² MW/m² MJ/kg ppm % nT A MA pW h d days years yr months minutes min s N " +
  "g/m² eV"
).split(" ");
const QUANTITY = new RegExp(
  `(?<![\\w.#/-])(\\d[\\d,]*(?:\\.\\d+)?(?:\\s?×\\s?10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?)\\s?(${UNITS.map((u) => u.replace(/[/.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\w²³/])`,
  "g",
);
const POWER = /\d\s?×\s?10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+|10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]{2,}/g;

function prose(text: string): string {
  return text
    .replace(/<!-- table:[\s\S]*?<!-- \/table -->/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length))
    .replace(/\[[^\]\n]*\]\([^)\n]*\)/g, (m) => " ".repeat(m.length));
}

for (const f of files.filter((x) => x.startsWith("docs/") && x.endsWith(".md"))) {
  if (f === "docs/numbers.md" || f === "docs/sources.md") continue;
  const lines = prose(readFileSync(path.join(ROOT, f), "utf8")).split("\n");
  const original = readFileSync(path.join(ROOT, f), "utf8").split("\n");
  lines.forEach((line, i) => {
    const quantities = [...line.matchAll(QUANTITY)].map((m) => m[0]);
    const powers = [...line.matchAll(POWER)]
      .map((m) => m[0])
      .filter((p) => !quantities.some((q) => q.includes(p)));
    for (const h of new Set([...quantities, ...powers]))
      problems.push(
        `${f}:${i + 1}: hand-typed quantity "${h.trim()}" (link it: [..](numbers.md#id)): ${original[i]?.trim().slice(0, 90)}`,
      );
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} style problem${problems.length > 1 ? "s" : ""}.`);
  process.exit(1);
}
console.log(`Style: ${files.length} files clean.`);
