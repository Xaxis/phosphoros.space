/**
 * The model, run once per build from data/. Server only: it reads files. Pages take every number,
 * table and check from here, so nothing on the site is typed by hand.
 */
import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { type Content, loadContent } from "@phosphoros/calc/content";
import { ROOT, run, sourceLines } from "@phosphoros/calc/load";
import type { Quantity, Registry } from "@phosphoros/calc/registry";

let cached: {
  r: Registry;
  content: Content;
  where: Map<string, { file: string; line: number }>;
} | null = null;

export function model() {
  if (!cached) {
    const r = run();
    cached = { r, content: loadContent(), where: sourceLines(r) };
  }
  return cached;
}

export function quantity(id: string): Quantity {
  return model().r.get(id);
}

/** The repository file and line that defines a number, series or check. */
export function definedAt(id: string): { file: string; line: number } {
  const { r, where } = model();
  const input = r.inputs.get(id);
  if (input) return { file: input.file, line: input.line };
  return where.get(id) ?? { file: "calc/src/model/index.ts", line: 1 };
}

export function readRepoFile(rel: string): string {
  return readFileSync(path.join(/*turbopackIgnore: true*/ ROOT, rel), "utf8");
}

export { ROOT };
