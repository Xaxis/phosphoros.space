/**
 * The quantity registry: every number Phosphoros publishes is either an input (a constant or an
 * assumption read from data/) or a derived quantity computed here from inputs. A derived quantity
 * records the inputs it read while it was computed, so its provenance is never typed by hand.
 *
 * Pure: no I/O, no clocks, no randomness. The same inputs always give the same model.
 */

/** Where a number stands between proven and imagined. Drives the markers on every page. */
export type Basis =
  | "physics" // measured fact or established physics
  | "precedent" // demonstrated in the real world, cited
  | "invented" // a breakthrough the plan assumes
  | "design"; // a program choice (a date, a size, a count)

export interface Input {
  id: string;
  value: number;
  unit: string;
  label: string;
  basis: Basis;
  /** Display unit, if not the SI unit (see format.ts). */
  show?: string;
  /** Significant figures to display. */
  sig?: number;
  /** Keys into data/sources.yaml. */
  source?: string[];
  note?: string;
  /** For dates: the ISO date the value (days since 2027-01-01) was read from. */
  date?: string;
  /** data/ file and line the input is defined on (filled by the loader). */
  file: string;
  line: number;
  /** Lower and upper bounds a reader may explore in the Explorer, if any. */
  range?: [number, number];
}

export interface Derived {
  id: string;
  value: number;
  unit: string;
  label: string;
  /** Human-readable formula, plain text with Unicode. */
  formula: string;
  /** Ids of inputs and derived quantities this one read, in first-read order. */
  inputs: string[];
  basis?: Basis;
  show?: string;
  sig?: number;
  note?: string;
  /** The calc module that computes it (a path under calc/src/), filled by the model. */
  module: string;
}

export type Quantity = (Input & { kind: "input" }) | (Derived & { kind: "derived" });

export interface Point {
  x: number;
  y: number;
}

export interface Series {
  id: string;
  label: string;
  /** Units of x and y. Dates are days since the epoch (2027-01-01). */
  x: string;
  y: string;
  points: Point[];
  inputs: string[];
  module: string;
  note?: string;
}

export type CheckKind =
  | "conservation" // energy or mass books close
  | "second-law" // no free lunch from heat
  | "force" // things that hover or hang are held by something
  | "capacity" // a machine is asked for no more than it can give
  | "geometry" // beams and lines of sight clear what they must
  | "schedule" // the order of events works
  | "validation"; // a model run on a known case gives the known answer

export interface Check {
  id: string;
  label: string;
  kind: CheckKind;
  pass: boolean;
  /** One plain sentence with the numbers that decided it. */
  detail: string;
  inputs: string[];
  module: string;
  /** Set when the check fails and the plan carries it as an open problem. */
  issue?: string;
}

export type Meta = Omit<Derived, "id" | "value" | "inputs" | "module">;

export class Registry {
  readonly inputs: Map<string, Input>;
  /** Values a previous pass of the model solved for, where two parts of the plan depend on each other. */
  readonly solved: Readonly<Record<string, number>>;
  readonly derived = new Map<string, Derived>();
  readonly series = new Map<string, Series>();
  readonly checks = new Map<string, Check>();
  private reads: Set<string>[] = [];
  private module = "";

  constructor(inputs: Map<string, Input>, solved: Readonly<Record<string, number>> = {}) {
    this.inputs = inputs;
    this.solved = solved;
  }

  /** Name the calc file the following definitions live in. */
  in(module: string): this {
    this.module = module;
    return this;
  }

  /** Read a number: an input or an already-derived quantity. Records the read. */
  v = (id: string): number => {
    const q = this.derived.get(id) ?? this.inputs.get(id);
    if (!q) throw new Error(`calc: unknown quantity "${id}"`);
    for (const r of this.reads) r.add(id);
    return q.value;
  };

  private track<T>(fn: () => T): { value: T; inputs: string[] } {
    const set = new Set<string>();
    this.reads.push(set);
    try {
      const value = fn();
      return { value, inputs: [...set] };
    } finally {
      this.reads.pop();
    }
  }

  /** Define a derived quantity. The function's reads become its inputs. */
  q(id: string, meta: Meta, fn: () => number): number {
    if (this.derived.has(id) || this.inputs.has(id)) throw new Error(`calc: "${id}" defined twice`);
    const { value, inputs } = this.track(fn);
    if (!Number.isFinite(value)) throw new Error(`calc: "${id}" is not finite (${value})`);
    this.derived.set(id, { id, value, inputs, module: this.module, ...meta });
    // A quantity read by an enclosing definition counts as that definition's input.
    for (const r of this.reads) r.add(id);
    return value;
  }

  /** Define a series (chart data). */
  s(id: string, meta: Omit<Series, "id" | "points" | "inputs" | "module">, fn: () => Point[]) {
    if (this.series.has(id)) throw new Error(`calc: series "${id}" defined twice`);
    const { value, inputs } = this.track(fn);
    this.series.set(id, { id, points: value, inputs, module: this.module, ...meta });
    return value;
  }

  /** Define a physics check. */
  c(
    id: string,
    meta: { label: string; kind: CheckKind; issue?: string },
    fn: () => { pass: boolean; detail: string },
  ) {
    if (this.checks.has(id)) throw new Error(`calc: check "${id}" defined twice`);
    const { value, inputs } = this.track(fn);
    this.checks.set(id, { id, inputs, module: this.module, ...meta, ...value });
  }

  get(id: string): Quantity {
    const d = this.derived.get(id);
    if (d) return { ...d, kind: "derived" };
    const i = this.inputs.get(id);
    if (i) return { ...i, kind: "input" };
    throw new Error(`calc: unknown quantity "${id}"`);
  }
}
