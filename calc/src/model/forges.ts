/** Graphite Forges: splitting CO₂ into breathable oxygen and graphite. */
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";
import { fmt } from "./text.ts";

export function forges(r: Registry) {
  const { v } = r.in("model/forges.ts");

  r.q(
    "o2-mass",
    { label: "Oxygen for 0.25 bar", unit: "kg", formula: "P_O₂ A / g", basis: "physics" },
    () => (v("o2-target-pressure") * v("venus-area")) / v("venus-gravity"),
  );
  r.q(
    "o2-moles",
    { label: "Moles of oxygen to make", unit: "mol", formula: "M_O₂ / μ_O₂", basis: "physics" },
    () => v("o2-mass") / v("o2-molar-mass"),
  );
  r.q(
    "forge-co2",
    { label: "CO₂ the Forges split", unit: "kg", formula: "n μ_CO₂", basis: "physics" },
    () => v("o2-moles") * v("co2-molar-mass"),
  );
  r.q(
    "forge-co2-share",
    {
      label: "Share of Venus's CO₂ the Forges split",
      unit: "1",
      show: "%",
      sig: 1,
      formula: "M_split / M_CO₂",
      basis: "physics",
    },
    () => v("forge-co2") / v("venus-co2-mass"),
  );
  r.q(
    "forge-graphite",
    { label: "Graphite the Forges make", unit: "kg", formula: "n μ_C", basis: "physics" },
    () => v("o2-moles") * v("c-molar-mass"),
  );
  r.q(
    "forge-energy-per-mol",
    {
      label: "Electricity per mole of CO₂ split at 60% efficiency",
      unit: "J/mol",
      show: "kJ/mol",
      sig: 3,
      formula: "ΔH / η",
      basis: "precedent",
    },
    () => v("co2-split-enthalpy") / v("forge-efficiency"),
  );
  r.q(
    "forge-energy-per-kg",
    {
      label: "Electricity per kilogram of CO₂ split",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 2,
      formula: "ΔH / (η μ_CO₂)",
      basis: "precedent",
    },
    () => v("forge-energy-per-mol") / v("co2-molar-mass"),
  );
  r.q(
    "forge-energy",
    {
      label: "Energy to forge 0.25 bar of oxygen",
      unit: "J",
      formula: "n ΔH / η",
      basis: "precedent",
    },
    () => v("o2-moles") * v("forge-energy-per-mol"),
  );
  r.q(
    "forge-seconds",
    {
      label: "Forging campaign",
      unit: "s",
      show: "months",
      sig: 2,
      formula: "end − start",
      basis: "design",
    },
    () => (v("forge-end") - v("forge-start")) * DAY_S,
  );
  r.q(
    "forge-power",
    { label: "Forge power", unit: "W", formula: "E / campaign", basis: "invented" },
    () => v("forge-energy") / v("forge-seconds"),
  );
  r.q(
    "forge-plant-power",
    {
      label: "Power of one Forge",
      unit: "W",
      show: "TW",
      sig: 2,
      formula: "P / N",
      basis: "invented",
    },
    () => v("forge-power") / v("forge-count"),
  );
  r.q(
    "forge-throughput",
    {
      label: "CO₂ through one Forge",
      unit: "kg/s",
      show: "t/s",
      sig: 2,
      formula: "M_split / campaign / N",
      basis: "invented",
    },
    () => v("forge-co2") / v("forge-seconds") / v("forge-count"),
  );
  r.q(
    "forge-waste-heat",
    { label: "Heat the Forges leave in Venus", unit: "J", formula: "E (1 − η)", basis: "physics" },
    () => v("forge-energy") * (1 - v("forge-efficiency")),
  );
  r.q(
    "graphite-stockpile",
    {
      label: "Graphite left after the caps",
      unit: "kg",
      formula: "M_graphite − M_caps",
      basis: "design",
    },
    () => v("forge-graphite") - v("cryo-cap-mass"),
  );
  r.q(
    "graphite-by-sealing",
    {
      label: "Graphite made by the end of sealing",
      unit: "kg",
      formula: "M_graphite × (sealing end − start) / campaign",
      basis: "design",
    },
    () =>
      v("forge-graphite") *
      Math.min(1, Math.max(0, (v("sealing-end") - v("forge-start")) * DAY_S) / v("forge-seconds")),
  );
  r.q(
    "o2-vs-earth",
    {
      label: "Oxygen pressure compared with Earth's at sea level",
      unit: "1",
      sig: 2,
      formula: "P_O₂ / 0.212 bar",
      basis: "physics",
    },
    () => v("o2-target-pressure") / v("earth-o2-pressure"),
  );
  r.c(
    "graphite-for-caps",
    { label: "The Forges make the cap graphite before sealing ends", kind: "schedule" },
    () => ({
      pass: v("graphite-by-sealing") >= v("cryo-cap-mass"),
      detail: `${fmt(r, "graphite-by-sealing")} of graphite by the end of sealing; the caps need ${fmt(r, "cryo-cap-mass")}.`,
    }),
  );
}
