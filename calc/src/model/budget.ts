/** The energy and mass budget: what the plan must bring in from outside Venus, and whether it closes. */
import type { Registry } from "../registry.ts";
import { fmt } from "./text.ts";

/** Rows of the energy budget, in the order the site shows them. Labels are templates: fill them. */
export const DEMANDS = [
  ["ice-launch-light", "Launch {ice-mass} of ice from Ceres"],
  ["traj-pump-energy", "Pump the heat out of Venus's air"],
  ["traj-fan-energy", "Run the chimney fans"],
  ["traj-warm-energy", "Warm the air and melt the ice"],
  ["forge-light", "Forge {o2-target-pressure} of oxygen"],
  ["hardware-energy", "Build the Foundry, the Veil, the Lattice and the hardware at Venus"],
] as const;

export function budget(r: Registry) {
  const { v } = r.in("model/budget.ts");

  // The Lattice's output is light. What runs on electricity pays a receiver's loss as well.
  r.q(
    "ice-launch-light",
    {
      label: "Light the Lattice beams to Ceres for the launches",
      unit: "J",
      formula: "E_launch / η_receiver",
      basis: "invented",
    },
    () => v("ice-launch-energy") / v("helios-receiver-efficiency"),
  );
  r.q(
    "forge-light",
    {
      label: "Light the Lattice beams to the Forges' receivers",
      unit: "J",
      formula: "E_Forges / η_receiver",
      basis: "invented",
    },
    () => v("forge-energy") / v("helios-receiver-efficiency"),
  );
  r.q(
    "budget-demand",
    {
      label: "Light the plan needs from the Lattice",
      unit: "J",
      formula: "launches + pump light + fans + warming + forging + hardware",
      basis: "physics",
      note: "The Foundry's own electricity is counted at par with the Lattice's light: a small share, and an overcount.",
    },
    () => DEMANDS.reduce((sum, [id]) => sum + v(id), 0),
  );
  r.q(
    "budget-spare",
    {
      label: "Spare light",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "1 − demand / supply",
      basis: "physics",
    },
    () => 1 - v("budget-demand") / v("helios-supply"),
  );
  r.q(
    "budget-launch-share",
    {
      label: "Share of the Lattice's output that water and cooling take",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "(launches + pump light) / supply",
      basis: "physics",
    },
    () => (v("ice-launch-light") + v("traj-pump-energy")) / v("helios-supply"),
  );
  r.q(
    "venus-heat-out",
    {
      label: "Heat the pumps lift out of Venus's air and throw into space",
      unit: "J",
      formula: "simulated heat lifted",
      basis: "physics",
      note: "The atmosphere's own heat, the Bricks' entry heat and the heat that enters while the pumps run.",
    },
    () => v("traj-heat-lifted"),
  );
  r.c(
    "energy-closes",
    {
      label: "The energy budget closes: supply covers demand",
      kind: "conservation",
    },
    () => ({
      pass: v("helios-supply") >= v("budget-demand"),
      detail: `The Lattice beams ${fmt(r, "helios-supply")} from full power to the deadline, against ${fmt(r, "budget-demand")} the plan needs: ${fmt(r, "budget-spare")} spare.`,
    }),
  );
}
