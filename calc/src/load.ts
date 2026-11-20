/**
 * Reads data/ into the model's inputs, keeping the file and line each value came from so every
 * number on the site can link to the exact line that defines it. Node only.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { isMap, isScalar, LineCounter, parseDocument } from "yaml";
import { compute } from "./model/index.ts";
import type { Basis, Input, Registry } from "./registry.ts";
import { dayOf } from "./time.ts";

export const ROOT = path.resolve(import.meta.dirname, "../..");
export const INPUT_FILES = ["data/constants.yaml", "data/assumptions.yaml"];
const BASES: Basis[] = ["physics", "precedent", "invented", "design"];

/** Parse a YAML file, returning its plain value and the line each top-level key is on. */
export function readYaml(rel: string): { data: unknown; lines: Map<string, number> } {
  const text = readFileSync(path.join(ROOT, rel), "utf8");
  const counter = new LineCounter();
  const doc = parseDocument(text, { lineCounter: counter, prettyErrors: true });
  if (doc.errors.length) throw new Error(`${rel}: ${doc.errors.map((e) => e.message).join("; ")}`);
  const lines = new Map<string, number>();
  if (isMap(doc.contents)) {
    for (const item of doc.contents.items) {
      if (isScalar(item.key) && item.key.range) {
        lines.set(String(item.key.value), counter.linePos(item.key.range[0]).line);
      }
    }
  }
  return { data: doc.toJS(), lines };
}

function fail(file: string, id: string, why: string): never {
  throw new Error(`${file}: ${id}: ${why}`);
}

/** Read and validate every input. Throws, naming the file and key, on anything malformed. */
export function loadInputs(overrides: Record<string, number> = {}): Map<string, Input> {
  const inputs = new Map<string, Input>();
  for (const file of INPUT_FILES) {
    const { data, lines } = readYaml(file);
    if (!data || typeof data !== "object") throw new Error(`${file}: not a map`);
    for (const [id, raw] of Object.entries(data as Record<string, Record<string, unknown>>)) {
      if (inputs.has(id)) fail(file, id, "defined twice");
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))
        fail(file, id, "ids are lowercase words joined by hyphens");
      const { value, unit, label, basis, source, note, show, sig, range } = raw;
      if (typeof unit !== "string") fail(file, id, "unit is required");
      if (typeof label !== "string") fail(file, id, "label is required");
      if (!BASES.includes(basis as Basis))
        fail(file, id, `basis must be one of ${BASES.join(", ")}`);
      let num: number;
      let date: string | undefined;
      if (unit === "date") {
        if (typeof value !== "string") fail(file, id, "a date is written YYYY-MM-DD");
        date = value;
        num = dayOf(value);
      } else {
        if (typeof value !== "number" || !Number.isFinite(value))
          fail(file, id, "value must be a number");
        num = value;
      }
      if (id in overrides) num = overrides[id] as number;
      inputs.set(id, {
        id,
        value: num,
        unit,
        label,
        basis: basis as Basis,
        file,
        line: lines.get(id) ?? 1,
        ...(typeof show === "string" ? { show } : {}),
        ...(typeof sig === "number" ? { sig } : {}),
        ...(Array.isArray(source) ? { source: source.map(String) } : {}),
        ...(typeof note === "string" ? { note } : {}),
        ...(date ? { date } : {}),
        ...(Array.isArray(range) && range.length === 2
          ? { range: [Number(range[0]), Number(range[1])] }
          : {}),
      });
    }
  }
  for (const id of Object.keys(overrides))
    if (!inputs.has(id)) throw new Error(`override: no input "${id}"`);
  return inputs;
}

/** Line in a calc module where a quantity, series or check id is defined, for "View source" links. */
export function sourceLines(r: Registry): Map<string, { file: string; line: number }> {
  const out = new Map<string, { file: string; line: number }>();
  const cache = new Map<string, string[]>();
  const find = (id: string, module: string) => {
    const file = `calc/src/${module}`;
    let lines = cache.get(file);
    if (!lines) {
      lines = readFileSync(path.join(ROOT, file), "utf8").split("\n");
      cache.set(file, lines);
    }
    // Ids built in loops ("passive-power") are found by their stem.
    const stems = [id, id.replace(/-\d+$/, ""), id.split("-").slice(0, 2).join("-")];
    for (const stem of stems) {
      const i = lines.findIndex((l) => l.includes(`"${stem}`) || l.includes(`\`${stem}`));
      if (i >= 0) return { file, line: i + 1 };
    }
    const k = lines.findIndex((l) => l.includes(`"${id.split("-")[0]}`));
    return { file, line: k >= 0 ? k + 1 : 1 };
  };
  for (const d of r.derived.values()) out.set(d.id, find(d.id, d.module));
  for (const s of r.series.values()) out.set(s.id, find(s.id, s.module));
  for (const c of r.checks.values()) out.set(c.id, find(c.id, c.module));
  return out;
}

/** Load data/ and run the model. */
export function run(overrides: Record<string, number> = {}): Registry {
  return compute(loadInputs(overrides));
}
