/** The energy and mass budget: what the plan must bring in from outside Venus, and whether it closes. */
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";

/** Rows of the energy budget, in the order the site shows them. */
export const DEMANDS = [
  ["ice-launch-energy", "Launch 10²⁰ kg of ice from Ceres"],
  ["traj-pump-energy", "Heat-pump work to cool Venus"],
  ["traj-warm-energy", "Warm the air and melt the last ice"],
  ["forge-energy", "Forge 0.25 bar of oxygen"],
  ["hardware-energy", "Build all hardware"],
] as const;

export function budget(r: Registry) {
  const { v } = r.in("model/budget.ts");

  r.q(
    "budget-demand",
    {
      label: "Energy delivered from outside Venus",
      unit: "J",
      formula: "launch + pump work + warming + forging + hardware",
      basis: "physics",
    },
    () => DEMANDS.reduce((sum, [id]) => sum + v(id), 0),
  );
  r.q(
    "budget-spare",
    {
      label: "Spare supply, before counting the Ring's recovered energy",
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
      formula: "(launch + pump work) / supply",
      basis: "physics",
    },
    () => (v("ice-launch-energy") + v("traj-pump-energy")) / v("helios-supply"),
  );
  r.q(
    "budget-supply-total",
    {
      label: "Energy available from outside Venus: the Lattice plus the Ring's recovered energy",
      unit: "J",
      formula: "E_Lattice + E_Ring",
      basis: "invented",
    },
    () => v("helios-supply") + v("ring-recovered-energy"),
  );
  r.q(
    "budget-spare-total",
    {
      label: "Spare, counting the Ring's recovered energy as supply",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "1 − demand / (E_Lattice + E_Ring)",
      basis: "invented",
    },
    () => 1 - v("budget-demand") / v("budget-supply-total"),
  );
  r.q(
    "ice-solar-gain",
    {
      label: "Energy gravity adds to the ice between launch and catch",
      unit: "J",
      formula: "caught motion energy − launch motion energy",
      basis: "physics",
      note: "The ice falls from 2.77 AU to 0.72 AU, deep into the Sun's gravity well, and then into Venus's own well down to the Ring. That is why the Ring recovers more than the Railheads spend.",
    },
    () => v("ring-catch-energy") - v("ice-launch-energy") * v("railhead-efficiency"),
  );
  r.q(
    "ring-pays-from",
    {
      label: "The Ring takes over powering the Railheads",
      unit: "date",
      formula: "first catch",
      basis: "invented",
    },
    () => v("first-catch"),
  );
  r.q(
    "budget-lattice-launch",
    {
      label: "Launch energy the Lattice still pays, before the Ring takes over",
      unit: "J",
      formula: "P_Railheads × (first catch − first launch)",
      basis: "invented",
    },
    () => v("railhead-power") * Math.max(0, v("first-catch") - v("ice-launch-start")) * DAY_S,
  );
  r.q(
    "budget-demand-with-ring",
    {
      label: "Energy the Lattice delivers once the Ring powers the Railheads",
      unit: "J",
      formula: "demand − launch energy + Lattice-paid launch energy",
      basis: "invented",
    },
    () => v("budget-demand") - v("ice-launch-energy") + v("budget-lattice-launch"),
  );
  r.q(
    "budget-spare-with-ring",
    {
      label: "Spare supply once the Ring powers the Railheads",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "1 − demand_with_Ring / supply",
      basis: "invented",
    },
    () => 1 - v("budget-demand-with-ring") / v("helios-supply"),
  );
  r.q(
    "budget-lattice-spare",
    {
      label: "Lattice energy left over once the Ring powers the Railheads",
      unit: "J",
      formula: "E_Lattice − demand_with_Ring",
      basis: "invented",
    },
    () => v("helios-supply") - v("budget-demand-with-ring"),
  );
  r.q(
    "budget-ring-launch",
    {
      label: "Launch energy the Ring pays once it powers the Railheads",
      unit: "J",
      formula: "E_launch − Lattice-paid launch energy",
      basis: "invented",
    },
    () => v("ice-launch-energy") - v("budget-lattice-launch"),
  );
  r.q(
    "budget-ring-surplus",
    {
      label: "Ring energy left over after powering the Railheads",
      unit: "J",
      formula: "E_Ring − Ring-paid launch energy",
      basis: "invented",
    },
    () => v("ring-recovered-energy") - v("budget-ring-launch"),
  );
  r.q(
    "venus-heat-out",
    {
      label: "Heat that leaves Venus itself as light",
      unit: "J",
      formula: "E_atm",
      basis: "physics",
    },
    () => v("atmosphere-heat"),
  );
  r.c(
    "energy-closes",
    { label: "The energy budget closes: supply covers demand", kind: "conservation" },
    () => ({
      pass: v("helios-supply") >= v("budget-demand"),
      detail: `Lattice supply ${v("helios-supply").toExponential(2)} J against demand ${v("budget-demand").toExponential(2)} J: ${(v("budget-spare") * 100).toFixed(0)}% spare before the Ring's recovered energy, ${(v("budget-spare-with-ring") * 100).toFixed(0)}% once the Ring powers the Railheads.`,
    }),
  );
}
