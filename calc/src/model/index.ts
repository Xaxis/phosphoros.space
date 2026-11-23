/**
 * The whole model: compute(inputs) runs every module in order and returns every derived number,
 * series and check. Pure: it reads only the inputs it is handed, so it runs the same in the CLI,
 * the site's build and the reader's browser.
 */
import { type Input, Registry } from "../registry.ts";
import { budget } from "./budget.ts";
import { ceres, READY_TOLERANCE_DAYS } from "./ceres.ts";
import { conventional } from "./conventional.ts";
import { cryo } from "./cryo.ts";
import { chimneys, exhaust, exhaustAverages } from "./exhaust.ts";
import { forges } from "./forges.ts";
import { foundry, foundryProducts, venusHardware } from "./foundry.ts";
import { helios, heliosSchedule } from "./helios.ts";
import { iceTrain } from "./ice.ts";
import { outcome } from "./outcome.ts";
import { ozone } from "./ozone.ts";
import { acid, aegis } from "./shield.ts";
import { summary } from "./summary.ts";
import { trajectory } from "./trajectory.ts";
import { veil } from "./veil.ts";
import { venus } from "./venus.ts";

export const MODULES = [
  venus,
  conventional,
  // The Veil's mass sets how long the Foundry pauses to build it, so the Veil comes first. The
  // Lattice and the hardware at Venus set how far the Foundry grows, so their sizes come before it.
  veil,
  helios,
  chimneys,
  exhaust,
  cryo,
  forges,
  venusHardware,
  foundry,
  heliosSchedule,
  iceTrain,
  ceres,
  foundryProducts,
  // Cooling starts when the hardware at Venus arrives, so the campaign averages follow it.
  exhaustAverages,
  acid,
  aegis,
  outcome,
  trajectory,
  ozone,
  budget,
  summary,
];

function pass(inputs: Map<string, Input>, solved: Record<string, number>): Registry {
  const r = new Registry(inputs, solved);
  for (const m of MODULES) m(r);
  return r;
}

export function compute(inputs: Map<string, Input>): Registry {
  // Launches wait for the Ceres factories when they finish after the Lattice reaches full power.
  // Waiting moves the campaign, and what the factories must build moves with it: the planets are
  // elsewhere on a later date, so the launches may cost more or less. Run the model again from the
  // factories' finish until the first launch is the later of the two dates. A later start lets the
  // factories finish sooner, so plain substitution overshoots and rings; a secant step on the gap
  // between the two dates settles in a few passes. If it never settles, the last pass stands, and
  // its ceres-ready-in-time check fails.
  let r = pass(inputs, {});
  let last: { start: number; gap: number } | undefined;
  for (let i = 0; i < 40; i++) {
    const start = r.get("ice-launch-start").value;
    const due = Math.max(r.get("helios-full-power").value, r.get("ceres-ready").value);
    const gap = due - start;
    if (Math.abs(gap) <= READY_TOLERANCE_DAYS) break;
    const next =
      last && gap !== last.gap ? start - (gap * (start - last.start)) / (gap - last.gap) : due;
    last = { start, gap };
    r = pass(inputs, { "ceres-ready": next });
  }
  return r;
}
