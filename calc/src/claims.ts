/** Compare every number in the version 2 brief with the model. Pure; the CLI reads the file. */
import { formatQuantity } from "./format.ts";
import type { Registry } from "./registry.ts";
import { dayOf } from "./time.ts";

export interface Claim {
  model: string;
  brief: number | string;
  tol?: number;
  where: string;
  correction?: string;
  /** The correction that retired the machine this number describes; the model no longer has it. */
  retired?: string;
  /** For a retired claim, how its number was labelled and shown, since the model cannot say. */
  label?: string;
  unit?: string;
  show?: string;
  note?: string;
}

export interface ClaimResult extends Claim {
  status: "match" | "differs" | "corrected" | "retired";
  model_value: number;
  brief_value: number;
  /** Relative difference (or days, for dates). */
  diff: number;
  label: string;
  shown: { brief: string; model: string };
}

export function checkClaims(r: Registry, claims: Claim[]): ClaimResult[] {
  return claims.map((c) => {
    if (c.retired) {
      if (!c.label || !c.unit) throw new Error(`claims: retired ${c.model} needs a label and unit`);
      const value = typeof c.brief === "string" ? dayOf(c.brief) : c.brief;
      const q = { value, unit: c.unit, show: c.show, sig: 2 };
      return {
        ...c,
        status: "retired" as const,
        model_value: Number.NaN,
        brief_value: value,
        diff: Number.NaN,
        label: c.label,
        shown: { brief: formatQuantity(q, { date: "day" }), model: "Retired" },
      };
    }
    const q = r.get(c.model);
    const isDate = q.unit === "date";
    const brief = typeof c.brief === "string" ? dayOf(c.brief) : c.brief;
    const diff = isDate ? q.value - brief : (q.value - brief) / brief;
    const tol = c.tol ?? (isDate ? 31 : 0.1);
    const within = Math.abs(diff) <= tol + 1e-12;
    const status = c.correction ? "corrected" : within ? "match" : "differs";
    const fmt = (value: number) =>
      formatQuantity({ ...q, value }, { sig: q.sig ?? 2, date: "day" });
    return {
      ...c,
      status,
      model_value: q.value,
      brief_value: brief,
      diff,
      label: q.label,
      shown: { brief: fmt(brief), model: fmt(q.value) },
    };
  });
}
