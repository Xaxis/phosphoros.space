/**
 * The house rules a reviewer would otherwise have to remember.
 *
 *   1. No em dashes anywhere: copy, code, comments, docs, data. Use commas, colons, parentheses or
 *      separate sentences. A spaced en dash used as a dash counts too.
 *   2. No hand-typed quantities in docs/ prose. A number with a unit is a link to the ledger
 *      (numbers.md#id), so it changes when the model does. Years, counts and section numbers are fine.
 *   3. No copy of a model number typed into the prose of a data table (technologies, experiments,
 *      risks, ...). A value the model holds is written {id}, so the two can never drift apart.
 *      Thresholds defined only in a table are fine, and so are the corrections log (it records what
 *      a number was) and the literature table (it quotes other people's plans).
 *
 *   node tools/style.ts          report and fail on any breach
 *   node tools/style.ts FILE...  check only these files
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const TEXT = /\.(md|ts|tsx|mts|js|mjs|css|yaml|yml|json|html|txt|sh|svg)$/;
const SKIP = /(^|\/)(node_modules|\.next|out|pnpm-lock\.yaml)(\/|$)/;

/** Files named on the command line, relative to the repository; with none, every file. */
const ONLY = process.argv.slice(2).map((a) => path.relative(ROOT, path.resolve(a)));
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  cwd: ROOT,
  encoding: "utf8",
})
  .split("\n")
  .filter((f) => f && TEXT.test(f) && !SKIP.test(f) && f !== "tools/style.ts")
  .filter((f) => !ONLY.length || ONLY.includes(f));

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

// --- 3. Model numbers copied into data prose ------------------------------------------------------
const DATA_PROSE = [
  "data/technologies.yaml",
  "data/timeline.yaml",
  "data/experiments.yaml",
  "data/risks.yaml",
  "data/venus.yaml",
  "data/missions.yaml",
].filter((f) => files.includes(f));
if (DATA_PROSE.length) {
  const { compute } = await import("../calc/src/model/index.ts");
  const { loadInputs } = await import("../calc/src/load.ts");
  const r = compute(loadInputs());
  const all = [...r.inputs.values(), ...r.derived.values()];
  // Unit as written -> [model unit, factor to it]. Percentages and day counts are left out: a 50%
  // threshold matching some efficiency is chance, while a matching temperature or power is a copy.
  const SI: Record<string, [string, number]> = {
    K: ["K", 1],
    m: ["m", 1],
    km: ["m", 1e3],
    cm: ["m", 1e-2],
    mm: ["m", 1e-3],
    kg: ["kg", 1],
    t: ["kg", 1e3],
    kt: ["kg", 1e6],
    Mt: ["kg", 1e9],
    W: ["W", 1],
    kW: ["W", 1e3],
    MW: ["W", 1e6],
    GW: ["W", 1e9],
    TW: ["W", 1e12],
    PW: ["W", 1e15],
    pW: ["W", 1e-12],
    J: ["J", 1],
    "W/m²": ["W/m2", 1],
    "kW/m²": ["W/m2", 1e3],
    "MW/m²": ["W/m2", 1e6],
    "m²": ["m2", 1],
    "km²": ["m2", 1e6],
    bar: ["bar", 1],
    "km/s": ["m/s", 1e3],
    "m/s": ["m/s", 1],
  };
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const parse = (num: string): number => {
    const [mant, exp] = num.split("×").map((x) => x.trim());
    const e = exp
      ? Number(
          exp
            .slice(2)
            .replace("⁻", "-")
            .replace(/[⁰-⁹]/g, (c) => String(SUP.indexOf(c))),
        )
      : 0;
    return Number((mant ?? "").replace(/,/g, "")) * 10 ** e;
  };
  for (const f of DATA_PROSE) {
    readFileSync(path.join(ROOT, f), "utf8")
      .split("\n")
      .forEach((line, i) => {
        const text = line
          .replace(/\{[^}]*\}/g, " ")
          .replace(/^\s*(value|range|start|end|date):.*$/, "");
        for (const m of text.matchAll(QUANTITY)) {
          const conv = SI[m[2] as string];
          if (!conv) continue;
          const value = parse(m[1] as string) * conv[1];
          const twin = all.find(
            (q) =>
              q.unit === conv[0] &&
              q.value !== 0 &&
              Math.abs(q.value - value) / Math.abs(q.value) < 0.015,
          );
          if (twin)
            problems.push(
              `${f}:${i + 1}: "${m[0]}" copies ${twin.id} (${twin.label}); write {${twin.id}}`,
            );
        }
      });
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} style problem${problems.length > 1 ? "s" : ""}.`);
  process.exit(1);
}
console.log(`Style: ${files.length} files clean.`);
