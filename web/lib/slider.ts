/**
 * The Explorer's sliders: each runs over its input's range in STEPS steps, on a log scale when the
 * range spans more than a factor of four, so a doubling time from 30 to 120 days moves evenly. A
 * range that starts at zero has no log scale (every factor of it is infinite), so it stays linear.
 */
import type { Input } from "@phosphoros/calc/registry";

export const STEPS = 400;

function isLog(lo: number, hi: number): boolean {
  return lo > 0 && hi / lo > 4;
}

/** The slider step that shows a value. */
export function toSlider(q: Input, value: number): number {
  const [lo, hi] = q.range as [number, number];
  const t = isLog(lo, hi) ? Math.log(value / lo) / Math.log(hi / lo) : (value - lo) / (hi - lo);
  return Math.round(Math.min(1, Math.max(0, t)) * STEPS);
}

/** The value a slider step stands for, to three figures. */
export function fromSlider(q: Input, step: number): number {
  const [lo, hi] = q.range as [number, number];
  const t = step / STEPS;
  const v = isLog(lo, hi) ? lo * (hi / lo) ** t : lo + t * (hi - lo);
  return Number(v.toPrecision(3));
}
