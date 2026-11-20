/**
 * The whole model: compute(inputs) runs every module in order and returns every derived number,
 * series and check. Pure: it reads only the inputs it is handed, so it runs the same in the CLI,
 * the site's build and the reader's browser.
 */
import { type Input, Registry } from "../registry.ts";
import { budget } from "./budget.ts";
import { conventional } from "./conventional.ts";
import { cryo } from "./cryo.ts";
import { chimneys, exhaust } from "./exhaust.ts";
import { forges } from "./forges.ts";
import { foundry, foundryProducts } from "./foundry.ts";
import { helios } from "./helios.ts";
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
  // The Veil's mass sets how long the Foundry pauses to build it, so the Veil comes first.
  veil,
  foundry,
  helios,
  chimneys,
  exhaust,
  cryo,
  forges,
  iceTrain,
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

export function compute(inputs: Map<string, Input>): Registry {
  const r = new Registry(inputs);
  for (const m of MODULES) m(r);
  return r;
}
