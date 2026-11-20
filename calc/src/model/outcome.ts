/** Venus in 2036: the finished air, and the light delays the Choir plans around. */
import type { Registry } from "../registry.ts";

export function outcome(r: Registry) {
  const { v } = r.in("model/outcome.ts");

  r.q(
    "final-water-vapour",
    {
      label: "Water vapour pressure over the new oceans",
      unit: "Pa",
      show: "bar",
      sig: 1,
      formula: "RH × 610.94 exp(17.625 T_C / (T_C + 243.04))",
      basis: "physics",
      note: "Magnus formula at 288 K.",
    },
    () => {
      const tc = v("earth-surface-temp") - 273.15;
      return v("final-humidity") * 610.94 * Math.exp((17.625 * tc) / (tc + 243.04));
    },
  );
  r.q(
    "final-pressure",
    {
      label: "Surface pressure in 2036",
      unit: "Pa",
      show: "bar",
      sig: 2,
      formula: "P_N₂ + P_O₂ + P_CO₂ + P_H₂O",
      basis: "physics",
    },
    () =>
      v("n2-pressure") +
      v("o2-target-pressure") +
      v("frost-co2-pressure") +
      v("final-water-vapour"),
  );
  r.q(
    "final-co2-ppm",
    {
      label: "CO₂ left in the 2036 air",
      unit: "1",
      show: "ppm",
      sig: 2,
      formula: "P_CO₂ / P_total",
      basis: "physics",
    },
    () => v("frost-co2-pressure") / v("final-pressure"),
  );
  r.q(
    "final-co2-vs-earth",
    {
      label: "CO₂ share of the 2036 air as a multiple of Earth's today",
      unit: "1",
      sig: 2,
      formula: "x_CO₂,2036 / x_CO₂,Earth",
      basis: "physics",
    },
    () => v("final-co2-ppm") / v("earth-co2-fraction"),
  );
  r.q(
    "final-o2-share",
    {
      label: "Oxygen share of the 2036 air",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "P_O₂ / P_total",
      basis: "physics",
    },
    () => v("o2-target-pressure") / v("final-pressure"),
  );
  r.q(
    "dive-depth",
    {
      label: "Sea depth on Earth with the same total pressure",
      unit: "m",
      sig: 2,
      formula: "(P − 1 atm) / (ρ_sea g_⊕)",
      basis: "physics",
    },
    () =>
      (v("final-pressure") - v("earth-sea-level-pressure")) /
      (v("seawater-density") * v("standard-gravity")),
  );
  r.q(
    "pressure-drop",
    {
      label: "Surface pressure falls by a factor of",
      unit: "1",
      sig: 2,
      formula: "P_today / P_2036",
      basis: "physics",
    },
    () => v("venus-surface-pressure") / v("final-pressure"),
  );

  for (const [id, label, d] of [
    [
      "delay-mercury-venus-min",
      "Light delay, Mercury to Venus, closest",
      () => Math.abs(v("venus-orbit") - v("mercury-orbit")),
    ],
    [
      "delay-mercury-venus-max",
      "Light delay, Mercury to Venus, farthest",
      () => v("venus-orbit") + v("mercury-orbit"),
    ],
    [
      "delay-venus-ceres-min",
      "Light delay, Venus to Ceres, closest",
      () => v("ceres-orbit") - v("venus-orbit"),
    ],
    [
      "delay-venus-ceres-max",
      "Light delay, Venus to Ceres, farthest",
      () => v("ceres-orbit") + v("venus-orbit"),
    ],
    [
      "delay-earth-ceres-max",
      "Light delay, Earth to Ceres, farthest",
      () => v("ceres-aphelion") + v("au"),
    ],
  ] as const) {
    r.q(
      id,
      { label, unit: "s", show: "min", sig: 2, formula: "distance / c", basis: "physics" },
      () => d() / v("speed-of-light"),
    );
  }

  r.q(
    "cryo-cell-release-ppm",
    {
      label: "CO₂ one torn cell could add to the 2036 air, at most",
      unit: "1",
      show: "ppm",
      sig: 2,
      formula: "m_cell g / A_V / P_final",
      basis: "physics",
      note: "By volume, like the air's CO₂: the cell's whole content, if it were never resealed.",
    },
    () => (v("cryo-cell-co2") * v("venus-gravity")) / v("venus-area") / v("final-pressure"),
  );
  r.q(
    "helios-handshake-delay",
    {
      label: "Age of a receiver's handshake when it reaches its emitter, at the longest beam range",
      unit: "s",
      show: "min",
      sig: 2,
      formula: "range / c",
      basis: "physics",
    },
    () => v("helios-range") / v("speed-of-light"),
  );

  const machines = [
    "helios-petals",
    "veil-slats",
    "exhaust-canopies",
    "chimney-count",
    "forge-count",
    "railhead-count",
    "ring-tether-lifts",
  ];
  r.q(
    "choir-machines",
    {
      label: "Machines the Choir runs that the model counts",
      unit: "count",
      sig: 2,
      formula: "Petals + slats + canopies + chimneys + Forges + Railheads + tether lifts",
      basis: "design",
      note: "A floor. The Foundry's own robots, the crawlers that service the towers and the Ice Bricks are not counted, because the model does not size them.",
    },
    () => machines.reduce((sum, id) => sum + v(id), 0),
  );
}
