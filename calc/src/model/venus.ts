/** Venus today: the derived facts every other module starts from. */
import type { Registry } from "../registry.ts";

export function venus(r: Registry) {
  const { v } = r.in("model/venus.ts");

  r.q(
    "venus-area",
    { label: "Venus surface area", unit: "m2", sig: 4, formula: "4π R_V²", basis: "physics" },
    () => 4 * Math.PI * v("venus-radius") ** 2,
  );
  r.q(
    "venus-disk",
    {
      label: "Venus cross-section (the disk sunlight hits)",
      unit: "m2",
      sig: 4,
      formula: "π R_V²",
      basis: "physics",
    },
    () => Math.PI * v("venus-radius") ** 2,
  );
  r.q(
    "venus-gm",
    {
      label: "Venus gravitational parameter",
      unit: "m3/s2",
      sig: 4,
      formula: "G M_V",
      basis: "physics",
    },
    () => v("grav-constant") * v("venus-mass"),
  );
  r.q(
    "venus-gravity",
    {
      label: "Venus surface gravity",
      unit: "m/s2",
      sig: 3,
      formula: "G M_V / R_V²",
      basis: "physics",
    },
    () => v("venus-gm") / v("venus-radius") ** 2,
  );
  r.q(
    "venus-escape",
    {
      label: "Venus escape speed",
      unit: "m/s",
      show: "km/s",
      sig: 4,
      formula: "√(2 G M_V / R_V)",
      basis: "physics",
    },
    () => Math.sqrt((2 * v("venus-gm")) / v("venus-radius")),
  );
  r.q(
    "venus-orbit-au",
    { label: "Venus orbital radius", unit: "1", sig: 4, formula: "a_V / AU", basis: "physics" },
    () => v("venus-orbit") / v("au"),
  );
  r.q(
    "venus-sunlight",
    {
      label: "Sunlight at the top of Venus's atmosphere",
      unit: "W/m2",
      sig: 4,
      formula: "S_⊕ (AU / a_V)²",
      basis: "physics",
    },
    () => v("solar-constant-earth") * (v("au") / v("venus-orbit")) ** 2,
  );
  r.q(
    "venus-intercepted",
    {
      label: "All the sunlight Venus intercepts",
      unit: "W",
      formula: "S_V π R_V²",
      basis: "physics",
    },
    () => v("venus-sunlight") * v("venus-disk"),
  );
  r.q(
    "venus-absorbed",
    {
      label: "Sunlight Venus absorbs today (after its 77% albedo)",
      unit: "W",
      formula: "S_V π R_V² (1 − A)",
      basis: "physics",
    },
    () => v("venus-intercepted") * (1 - v("venus-albedo")),
  );

  // The atmosphere by mass. Composition is given by volume (mole fraction).
  r.q(
    "venus-mean-molar-mass",
    {
      label: "Mean molar mass of Venus's air",
      unit: "kg/mol",
      sig: 4,
      formula: "x_CO₂ M_CO₂ + x_N₂ M_N₂",
      basis: "physics",
    },
    () =>
      v("venus-co2-fraction") * v("co2-molar-mass") + v("venus-n2-fraction") * v("n2-molar-mass"),
  );
  r.q(
    "venus-co2-mass",
    {
      label: "Mass of Venus's CO₂",
      unit: "kg",
      sig: 3,
      formula: "M_atm x_CO₂ M_CO₂ / M̄",
      basis: "physics",
    },
    () =>
      (v("venus-atmosphere-mass") * v("venus-co2-fraction") * v("co2-molar-mass")) /
      v("venus-mean-molar-mass"),
  );
  r.q(
    "venus-n2-mass",
    {
      label: "Mass of Venus's nitrogen",
      unit: "kg",
      sig: 3,
      formula: "M_atm x_N₂ M_N₂ / M̄",
      basis: "physics",
    },
    () =>
      (v("venus-atmosphere-mass") * v("venus-n2-fraction") * v("n2-molar-mass")) /
      v("venus-mean-molar-mass"),
  );
  r.q(
    "venus-column-pressure",
    {
      label: "Surface pressure from the weight of the whole atmosphere",
      unit: "Pa",
      show: "bar",
      sig: 3,
      formula: "M_atm g / A",
      basis: "physics",
      note: "Stays at this value while the air cools, until CO₂ starts to condense: cooling a gas does not change its weight.",
    },
    () => (v("venus-atmosphere-mass") * v("venus-gravity")) / v("venus-area"),
  );
  r.q(
    "n2-pressure",
    {
      label: "Surface pressure of Venus's nitrogen alone",
      unit: "Pa",
      show: "bar",
      sig: 2,
      formula: "M_N₂ g / A",
      basis: "physics",
    },
    () => (v("venus-n2-mass") * v("venus-gravity")) / v("venus-area"),
  );
  r.q(
    "n2-vs-earth",
    {
      label: "Venus's nitrogen compared with Earth's",
      unit: "1",
      sig: 2,
      formula: "M_N₂,V / M_N₂,⊕",
      basis: "physics",
    },
    () => v("venus-n2-mass") / v("earth-n2-mass"),
  );
  r.q(
    "atmosphere-vs-earth",
    {
      label: "Venus's atmosphere compared with Earth's, by mass",
      unit: "1",
      sig: 2,
      formula: "M_atm,V / M_atm,⊕",
      basis: "physics",
    },
    () => v("venus-atmosphere-mass") / v("earth-atmosphere-mass"),
  );
  r.q(
    "venus-so2-mass",
    {
      label: "Mass of Venus's SO₂",
      unit: "kg",
      sig: 2,
      formula: "x_SO₂ (M_SO₂ / M̄) M_atm",
      basis: "physics",
    },
    () =>
      v("venus-so2-fraction") *
      (v("so2-molar-mass") / v("venus-mean-molar-mass")) *
      v("venus-atmosphere-mass"),
  );
  r.q(
    "venus-surface-density",
    {
      label: "Density of the air at Venus's surface",
      unit: "kg/m3",
      sig: 2,
      formula: "P M̄ / (R T)",
      basis: "physics",
    },
    () =>
      (v("venus-surface-pressure") * v("venus-mean-molar-mass")) /
      (v("gas-constant") * v("venus-surface-temp")),
  );
  r.q(
    "venus-scale-height",
    {
      label: "Scale height of Venus's lower atmosphere",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "R T / (M̄ g)",
      basis: "physics",
    },
    () =>
      (v("gas-constant") * v("venus-surface-temp")) /
      (v("venus-mean-molar-mass") * v("venus-gravity")),
  );
}
