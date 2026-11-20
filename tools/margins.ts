/**
 * How far each assumption can move before the plan breaks, and what named what-ifs cost.
 *
 *   node tools/margins.ts           recompute data/margins.json
 *   node tools/margins.ts --check   fail if data/margins.json was computed from other model sources
 *
 * For every input with a `range:` (the Explorer's sliders), this walks out from the plan's value in
 * each direction, in the Explorer's own slider scale, until a check that passes in the plan fails or
 * the model cannot run; then it bisects to the edge. Each input moves alone, everything else as
 * planned. It runs the whole model a few hundred times, so the result is cached under a hash of the
 * model's code and data: tools/docs.ts recomputes it only when they change.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadInputs, ROOT } from "../calc/src/load.ts";
import { compute } from "../calc/src/model/index.ts";
import type { Input, Registry } from "../calc/src/registry.ts";

export interface Edge {
  /** The last value, in SI, at which the plan still holds. */
  holds: number;
  /** The first value tried at which it breaks, and how: the checks that fail, or the model's error. */
  breaks: number;
  fails: string[];
  error?: string;
}

export interface Margin {
  id: string;
  plan: number;
  /** Null when the plan holds all the way to that end of the range. */
  below: Edge | null;
  above: Edge | null;
}

export interface Scenario {
  id: string;
  label: string;
  set: Record<string, number>;
  /** The simulated Earth-like date and its slack (days before the deadline), and what newly fails. */
  earthLike?: number;
  slack?: number;
  fails: string[];
  error?: string;
}

export interface Margins {
  hash: string;
  inputs: Margin[];
  scenarios: Scenario[];
}

export const MARGINS_FILE = "data/margins.json";

/** Every file the model's numbers depend on. */
function sources(): string[] {
  const walk = (dir: string): string[] =>
    readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
  return [
    "data/constants.yaml",
    "data/assumptions.yaml",
    ...walk("data/spectra"),
    ...walk("calc/src").filter((f) => f.endsWith(".ts")),
    "tools/margins.ts",
  ].sort();
}

export function marginsHash(): string {
  const h = createHash("sha256");
  for (const f of sources())
    h.update(f)
      .update("\0")
      .update(readFileSync(path.join(ROOT, f)));
  return h.digest("hex").slice(0, 16);
}

export function readMargins(): Margins | undefined {
  const file = path.join(ROOT, MARGINS_FILE);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Margins) : undefined;
}

/** The Explorer's slider scale: logarithmic when the range spans more than a factor of four. */
function scale(q: Input) {
  const [lo, hi] = q.range as [number, number];
  const log = hi / lo > 4;
  return {
    t: (v: number) => (log ? Math.log(v / lo) / Math.log(hi / lo) : (v - lo) / (hi - lo)),
    v: (t: number) => (log ? lo * (hi / lo) ** t : lo + t * (hi - lo)),
  };
}

export function computeMargins(): Margins {
  const base = loadInputs();
  const plan = compute(base);
  const passing = [...plan.checks.values()].filter((c) => c.pass).map((c) => c.id);
  const variant = (
    set: Record<string, number>,
  ): { r?: Registry; fails: string[]; error?: string } => {
    const inputs = new Map(base);
    for (const [id, value] of Object.entries(set)) {
      const q = inputs.get(id);
      if (!q) throw new Error(`margins: unknown input ${id}`);
      inputs.set(id, { ...q, value });
    }
    try {
      const r = compute(inputs);
      return { r, fails: passing.filter((id) => !r.checks.get(id)?.pass) };
    } catch (e) {
      return { fails: [], error: (e as Error).message };
    }
  };
  const broken = (x: { fails: string[]; error?: string }) => x.fails.length > 0 || !!x.error;

  const inputs: Margin[] = [];
  for (const q of base.values()) {
    if (!q.range) continue;
    const s = scale(q);
    const t0 = s.t(q.value);
    const edge = (dir: -1 | 1): Edge | null => {
      // Walk out in sixteenths of the slider, then halve the gap eight times: to about 0.02%.
      let good = t0;
      let bad: number | undefined;
      let at: ReturnType<typeof variant> | undefined;
      for (let t = t0 + dir / 16; dir < 0 ? t > -1e-9 : t < 1 + 1e-9; t += dir / 16) {
        const x = variant({ [q.id]: s.v(Math.min(1, Math.max(0, t))) });
        if (broken(x)) {
          bad = Math.min(1, Math.max(0, t));
          at = x;
          break;
        }
        good = t;
      }
      if (bad === undefined || !at) {
        const end = dir < 0 ? 0 : 1;
        if (Math.abs(good - end) > 1e-9) {
          const x = variant({ [q.id]: s.v(end) });
          if (!broken(x)) return null;
          bad = end;
          at = x;
        } else return null;
      }
      for (let i = 0; i < 8; i++) {
        const mid = (good + bad) / 2;
        const x = variant({ [q.id]: s.v(mid) });
        if (broken(x)) {
          bad = mid;
          at = x;
        } else good = mid;
      }
      return { holds: s.v(good), breaks: s.v(bad), fails: at.fails, error: at.error };
    };
    inputs.push({ id: q.id, plan: q.value, below: edge(-1), above: edge(1) });
  }

  const what = (id: string, label: string, set: Record<string, number>): Scenario => {
    const x = variant(set);
    return {
      id,
      label,
      set,
      earthLike: x.r?.get("traj-earth-like").value,
      slack: x.r?.get("traj-slack-days").value,
      fails: x.fails,
      error: x.error,
    };
  };
  const scenarios: Scenario[] = [
    what("plan", "The plan", {}),
    what("seed-waits", "The seed waits for every proof experiment to pass before it launches", {
      "foundry-seed-launch": plan.get("experiments-end").value,
    }),
  ];
  return { hash: marginsHash(), inputs, scenarios };
}

export function writeMargins(m: Margins): void {
  writeFileSync(path.join(ROOT, MARGINS_FILE), `${JSON.stringify(m, null, 2)}\n`);
}

if (import.meta.main) {
  if (process.argv.includes("--check")) {
    if (readMargins()?.hash !== marginsHash()) {
      console.error(`${MARGINS_FILE} is stale: run pnpm docs`);
      process.exit(1);
    }
    console.log(`${MARGINS_FILE} is current.`);
  } else {
    const t = performance.now();
    const m = computeMargins();
    writeMargins(m);
    console.log(
      `${MARGINS_FILE} written: ${m.inputs.length} inputs, ${m.scenarios.length} scenarios, ${((performance.now() - t) / 1000).toFixed(1)} s.`,
    );
  }
}
