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
import { chimneys, exhaust } from "./exhaust.ts";
import { forges } from "./forges.ts";
import { foundry, foundryProducts } from "./foundry.ts";
import { helios, heliosSchedule } from "./helios.ts";
import { iceTrain } from "./ice.ts";
import { outcome } from "./outcome.ts";
import { ozone } from "./ozone.ts";
import { ring } from "./ring.ts";
import { acid, aegis } from "./shield.ts";
import { summary } from "./summary.ts";
import { trajectory } from "./trajectory.ts";
import { veil } from "./veil.ts";
import { venus } from "./venus.ts";

export const MODULES = [
  venus,
  conventional,
  // The Veil's mass sets how long the Foundry pauses to build it, so the Veil comes first, and the
  // Lattice's mass sets how far the Foundry grows, so the Lattice's size comes before the Foundry.
  veil,
  helios,
  foundry,
  heliosSchedule,
  chimneys,
  exhaust,
  cryo,
  forges,
  iceTrain,
  ceres,
  ring,
  foundryProducts,
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
  // Waiting shortens the campaign, which grows the Crown and makes the factories later still,
  // so run the model again from the later date until the finish stops moving. If it never settles,
  // the last pass stands, and its ceres-ready-in-time check fails.
  let r = pass(inputs, {});
  for (let i = 0; i < 40; i++) {
    const ready = r.get("ceres-ready").value;
    if (ready <= r.get("ice-launch-start").value + READY_TOLERANCE_DAYS) break;
    r = pass(inputs, { "ceres-ready": ready });
  }
  return r;
}
