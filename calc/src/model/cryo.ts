/** Cryo-continents: all of Venus's CO₂, frozen into plateaus and sealed under insulating caps. */
import { co2MeltingTemp, conductedFlux } from "../physics.ts";
import type { Registry } from "../registry.ts";
import { YEAR_S } from "../time.ts";

export function cryo(r: Registry) {
  const { v } = r.in("model/cryo.ts");

  r.q(
    "cryo-volume",
    {
      label: "Volume of Venus's CO₂ as dry ice",
      unit: "m3",
      formula: "M_CO₂ / ρ_ice",
      basis: "physics",
    },
    () => v("venus-co2-mass") / v("dry-ice-density"),
  );
  r.q(
    "cryo-footprint",
    {
      label: "Cryo-continent footprint",
      unit: "m2",
      formula: "V / thickness",
      basis: "design",
    },
    () => v("cryo-volume") / v("cryo-thickness"),
  );
  r.q(
    "cryo-footprint-share",
    {
      label: "Share of Venus the cryo-continents cover",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "A_cryo / A_V",
      basis: "design",
    },
    () => v("cryo-footprint") / v("venus-area"),
  );
  r.q(
    "cryo-cap-mass",
    {
      label: "Carbon aerogel in the caps",
      unit: "kg",
      formula: "A_cryo × thickness × ρ_aerogel",
      basis: "invented",
    },
    () => v("cryo-footprint") * v("cryo-aerogel-thickness") * v("cryo-aerogel-density"),
  );
  r.q(
    "cryo-membrane-mass",
    {
      label: "Graphite membrane in the caps",
      unit: "kg",
      formula: "A_cryo × 1 mm × ρ_graphite",
      basis: "invented",
    },
    () => v("cryo-footprint") * v("cryo-membrane-thickness") * v("graphite-density"),
  );
  r.q(
    "cryo-armour-mass",
    {
      label: "Crushed-basalt armour on the caps",
      unit: "kg",
      formula: "A_cryo × 2 m × ρ_rock",
      basis: "design",
    },
    () => v("cryo-footprint") * v("cryo-armour-thickness") * v("rock-density"),
  );
  r.q(
    "cryo-leak-flux",
    {
      label: "Heat leaking down through a cap",
      unit: "W/m2",
      sig: 2,
      formula: "k_aerogel (T_sky − T_ice) / L",
      basis: "invented",
    },
    () =>
      (v("cryo-aerogel-conductivity") * (v("earth-surface-temp") - v("cryo-ice-temp"))) /
      v("cryo-aerogel-thickness"),
  );
  r.q(
    "cryo-leak-total",
    {
      label: "Heat leaking down through all caps",
      unit: "W",
      show: "TW",
      sig: 2,
      formula: "q A_cryo",
      basis: "invented",
    },
    () => v("cryo-leak-flux") * v("cryo-footprint"),
  );
  for (const yr of [2, 10, 100, 1000]) {
    r.q(
      `cryo-floor-flux-${yr}`,
      {
        label: `Heat rising from the hot rock under the ice, ${yr.toLocaleString("en-US")} years after sealing`,
        unit: "W/m2",
        sig: 2,
        formula: "k ΔT / √(π κ t)",
        basis: "physics",
      },
      () =>
        conductedFlux(
          v("rock-conductivity"),
          v("cryo-floor-step"),
          v("rock-diffusivity"),
          yr * YEAR_S,
        ),
    );
  }
  r.q(
    "cryo-floor-load",
    {
      label: "Heat rising from basin floors at first",
      unit: "W",
      show: "PW",
      sig: 2,
      formula: "q(2 yr) × A_cryo",
      basis: "physics",
    },
    () => v("cryo-floor-flux-2") * v("cryo-footprint"),
  );
  r.q(
    "cryo-floor-load-century",
    {
      label: "Heat rising from basin floors after a century",
      unit: "W",
      show: "PW",
      sig: 2,
      formula: "q(100 yr) × A_cryo",
      basis: "physics",
    },
    () => v("cryo-floor-flux-100") * v("cryo-footprint"),
  );
  r.q(
    "cryo-unrefrigerated-loss",
    {
      label: "Share of the CO₂ the floor heat would sublimate each year, unrefrigerated",
      unit: "1",
      show: "%",
      sig: 1,
      formula: "Q_floor × 1 yr / (L M_CO₂)",
      basis: "physics",
    },
    () => (v("cryo-floor-load") * YEAR_S) / (v("co2-deposition-heat") * v("venus-co2-mass")),
  );
  r.q(
    "cryo-refrigeration-share",
    {
      label: "Lattice share to pump the floor heat away at first (worst case, from 200 K)",
      unit: "1",
      show: "%",
      sig: 1,
      formula: "Q_floor (T_h / 200 K − 1) / P_Lattice",
      basis: "physics",
    },
    () => (v("cryo-floor-load") * (v("exhaust-effective-temp") / 200 - 1)) / v("helios-power"),
  );
  r.q(
    "cryo-cells",
    {
      label: "Number of sealed compartments",
      unit: "count",
      formula: "A_cryo / 100 km²",
      basis: "design",
    },
    () => v("cryo-footprint") / v("cryo-cell-area"),
  );
  r.q(
    "cryo-cell-co2",
    {
      label: "CO₂ in one compartment",
      unit: "kg",
      formula: "100 km² × thickness × ρ_ice",
      basis: "design",
    },
    () => v("cryo-cell-area") * v("cryo-thickness") * v("dry-ice-density"),
  );
  r.q(
    "cryo-base-pressure",
    {
      label: "Pressure at the base of the dry ice, from its own weight",
      unit: "Pa",
      show: "bar",
      sig: 2,
      formula: "ρ_ice g × thickness",
      basis: "physics",
    },
    () => v("dry-ice-density") * v("venus-gravity") * v("cryo-thickness"),
  );
  r.q(
    "cryo-base-melt-temp",
    {
      label: "Temperature at which the base of the dry ice would melt",
      unit: "K",
      sig: 3,
      formula: "root of p_t (1 + a₁ (T/T_t − 1) + a₂ (T/T_t − 1)²) = p_base",
      basis: "physics",
    },
    () =>
      co2MeltingTemp(
        v("cryo-base-pressure"),
        { T: v("co2-triple-temp"), P: v("co2-triple-pressure") },
        v("co2-melting-a1"),
        v("co2-melting-a2"),
      ),
  );
}
