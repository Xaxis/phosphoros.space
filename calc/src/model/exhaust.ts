/**
 * Thermal Chimneys and the Photonic Exhaust: lifting Venus's heat to the cloud tops and throwing it
 * into space as light. The heat-pump work follows the cooling path: sensible cooling of the whole
 * atmosphere from today's surface temperature, and the CO₂'s latent heat released between its
 * critical and triple points.
 */
import { bandPumpWork, co2SolidPressure, sensiblePumpWork } from "../physics.ts";
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";

export function chimneys(r: Registry) {
  const { v } = r.in("model/exhaust.ts");
  r.q(
    "chimney-flow-area",
    { label: "Chimney cross-section", unit: "m2", sig: 2, formula: "π (D/2)²", basis: "design" },
    () => Math.PI * (v("chimney-diameter") / 2) ** 2,
  );
  r.q(
    "chimney-mass-flow",
    { label: "Gas flow up one chimney", unit: "kg/s", formula: "ρ v A", basis: "invented" },
    () => v("venus-surface-density") * v("chimney-flow-speed") * v("chimney-flow-area"),
  );
  r.q(
    "chimney-heat",
    { label: "Heat one chimney delivers", unit: "W", formula: "ṁ c_p ΔT", basis: "invented" },
    () => v("chimney-mass-flow") * v("co2-cp") * v("chimney-gas-cooling"),
  );
  r.q(
    "chimney-capacity",
    { label: "Heat all chimneys can deliver", unit: "W", formula: "N × Q", basis: "invented" },
    () => v("chimney-count") * v("chimney-heat"),
  );
  r.q(
    "chimney-vs-peak",
    {
      label: "Chimney capacity over the peak deep heat flow",
      unit: "1",
      sig: 2,
      formula: "N Q / P_peak",
      basis: "design",
    },
    () => v("chimney-capacity") / v("deep-heat-peak"),
  );
  r.q(
    "chimney-spacing",
    {
      label: "Chimney grid spacing",
      unit: "m",
      show: "km",
      sig: 3,
      formula: "√(A / N)",
      basis: "design",
    },
    () => Math.sqrt(v("venus-area") / v("chimney-count")),
  );
  r.q(
    "chimney-height",
    {
      label: "Chimney height",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "top − base",
      basis: "design",
    },
    () => v("chimney-top") - v("chimney-base"),
  );
}

/** Pump work to carry the atmosphere down the cooling path, rejecting at an effective Th. */
export function coolingPathWork(
  v: (id: string) => number,
  Th: number,
): { sensible: number; latent: number; total: number } {
  const sensible = sensiblePumpWork(
    v("venus-atmosphere-mass") * v("co2-cp"),
    v("venus-surface-temp"),
    v("freeze-target-temp"),
    Th,
  );
  const latent = bandPumpWork(
    v("atmosphere-latent-heat"),
    v("co2-critical-temp"),
    v("co2-triple-temp"),
    Th,
  );
  return { sensible, latent, total: sensible + latent };
}

export function exhaust(r: Registry) {
  const { v } = r.in("model/exhaust.ts");

  r.q(
    "exhaust-wavelength",
    {
      label: "Exhaust emission wavelength (from the tile's 0.54 eV bandgap)",
      unit: "m",
      show: "µm",
      sig: 2,
      formula: "h c / E_gap",
      basis: "physics",
    },
    () =>
      (v("planck-constant") * v("speed-of-light")) / (v("exhaust-bandgap") * v("electron-volt")),
  );
  r.q(
    "exhaust-flux",
    {
      label: "Emitter brightness, as bright as a 2,000 K body",
      unit: "W/m2",
      show: "MW/m2",
      sig: 2,
      formula: "σ T_h⁴",
      basis: "invented",
    },
    () => v("stefan-boltzmann") * v("exhaust-effective-temp") ** 4,
  );
  r.q(
    "exhaust-work-sensible",
    {
      label: "Heat-pump work for the sensible cooling",
      unit: "J",
      formula: "∫ M c_p (T_h / T − 1) dT, from 737 K to 195 K",
      basis: "physics",
    },
    () => coolingPathWork(v, v("exhaust-effective-temp")).sensible,
  );
  r.q(
    "exhaust-work-latent",
    {
      label: "Heat-pump work to freeze the CO₂",
      unit: "J",
      formula: "Q_L [T_h ln(T_c / T_t) / (T_c − T_t) − 1]",
      basis: "physics",
      note: "Latent heat released evenly in temperature between CO₂'s critical point (304 K) and triple point (216.6 K).",
    },
    () => coolingPathWork(v, v("exhaust-effective-temp")).latent,
  );
  r.q(
    "exhaust-work",
    {
      label: "Heat-pump work to cool Venus",
      unit: "J",
      sig: 3,
      formula: "W_sensible + W_latent",
      basis: "physics",
    },
    () => v("exhaust-work-sensible") + v("exhaust-work-latent"),
  );
  r.q(
    "exhaust-work-ratio",
    {
      label: "Work per joule of heat moved",
      unit: "1",
      sig: 2,
      formula: "W / Q",
      basis: "physics",
    },
    () => v("exhaust-work") / v("atmosphere-heat"),
  );
  r.q(
    "exhaust-rejected",
    {
      label: "Total energy the Exhaust throws into space",
      unit: "J",
      formula: "Q + W",
      basis: "physics",
    },
    () => v("atmosphere-heat") + v("exhaust-work"),
  );
  r.q(
    "cooling-seconds",
    {
      label: "Length of the active-cooling campaign",
      unit: "s",
      show: "yr",
      sig: 2,
      formula: "end − start",
      basis: "design",
    },
    () => (v("cooling-end") - v("cooling-start")) * DAY_S,
  );
  for (const [id, total, label] of [
    ["exhaust-heat-avg", "atmosphere-heat", "Average heat removed from Venus"],
    ["exhaust-work-avg", "exhaust-work", "Average electrical input"],
    ["exhaust-rejected-avg", "exhaust-rejected", "Average power thrown into space"],
  ] as const) {
    r.q(
      id,
      { label, unit: "W", formula: "E / campaign", basis: "physics" },
      () => v(total) / v("cooling-seconds"),
    );
  }
  r.q(
    "exhaust-area-installed",
    {
      label: "Emitter area installed (sized for the peak)",
      unit: "m2",
      formula: "P_peak / (σ T_h⁴)",
      basis: "invented",
    },
    () => v("exhaust-peak") / v("exhaust-flux"),
  );
  r.q(
    "exhaust-area-working",
    {
      label: "Emitter area working on average",
      unit: "m2",
      formula: "P_avg / (σ T_h⁴)",
      basis: "invented",
    },
    () => v("exhaust-rejected-avg") / v("exhaust-flux"),
  );
  r.q(
    "exhaust-area-share",
    {
      label: "Installed emitter area as a share of Venus",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "A_installed / A_V",
      basis: "invented",
    },
    () => v("exhaust-area-installed") / v("venus-area"),
  );
  r.q(
    "canopy-area",
    { label: "Area of one canopy", unit: "m2", formula: "A_installed / N", basis: "design" },
    () => v("exhaust-area-installed") / v("exhaust-canopies"),
  );
  r.q(
    "canopy-width",
    {
      label: "Canopy width (hexagon, flat to flat)",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "√(2 A / √3)",
      basis: "design",
    },
    () => Math.sqrt((2 * v("canopy-area")) / Math.sqrt(3)),
  );
  r.q(
    "canopy-power-in",
    {
      label: "Electrical power into one canopy",
      unit: "W",
      formula: "W_avg / N",
      basis: "invented",
    },
    () => v("exhaust-work-avg") / v("exhaust-canopies"),
  );
  r.q(
    "canopy-power-out",
    {
      label: "Power one canopy throws into space",
      unit: "W",
      formula: "P_avg / N",
      basis: "invented",
    },
    () => v("exhaust-rejected-avg") / v("exhaust-canopies"),
  );
  r.q(
    "exhaust-vs-passive-heat",
    {
      label: "Exhaust heat removal compared with a shaded Venus radiating alone",
      unit: "1",
      sig: 2,
      formula: "Q_avg / σ (230 K)⁴ A",
      basis: "physics",
    },
    () => v("exhaust-heat-avg") / v("passive-power"),
  );
  r.q(
    "exhaust-vs-passive-light",
    {
      label: "Exhaust light output compared with a shaded Venus radiating alone",
      unit: "1",
      sig: 2,
      formula: "P_avg / σ (230 K)⁴ A",
      basis: "physics",
    },
    () => v("exhaust-rejected-avg") / v("passive-power"),
  );

  // How the choice of effective emitter temperature trades area against work.
  r.s(
    "exhaust-tradeoff",
    {
      label: "Emitter temperature against emitter area (share of Venus) and pump work",
      x: "K",
      y: "1",
      note: "y is the working emitter area as a share of Venus's surface.",
    },
    () => {
      const pts = [];
      for (let Th = 800; Th <= 3000; Th += 50) {
        const w = coolingPathWork(v, Th).total;
        const avg = (w + v("atmosphere-heat")) / v("cooling-seconds");
        pts.push({ x: Th, y: avg / (v("stefan-boltzmann") * Th ** 4) / v("venus-area") });
      }
      return pts;
    },
  );
  r.s(
    "exhaust-tradeoff-work",
    { label: "Emitter temperature against total pump work", x: "K", y: "J" },
    () => {
      const pts = [];
      for (let Th = 800; Th <= 3000; Th += 50) pts.push({ x: Th, y: coolingPathWork(v, Th).total });
      return pts;
    },
  );
  for (const Th of [1000, 1500, 2500]) {
    r.q(
      `exhaust-area-share-${Th}`,
      {
        label: `Working emitter area as a share of Venus at an effective ${Th.toLocaleString("en-US")} K`,
        unit: "1",
        show: "%",
        sig: 2,
        formula: "(Q + W(T_h)) / campaign / (σ T_h⁴ A_V)",
        basis: "physics",
      },
      () => {
        const w = coolingPathWork(v, Th).total;
        return (
          (w + v("atmosphere-heat")) /
          v("cooling-seconds") /
          (v("stefan-boltzmann") * Th ** 4) /
          v("venus-area")
        );
      },
    );
  }

  // Frost Towers: cold traps that pull the last CO₂ out of the air.
  const solid = (T: number) =>
    co2SolidPressure(
      T,
      { T: v("co2-sublimation-ref-temp"), P: v("co2-sublimation-ref-pressure") },
      v("co2-sublimation-enthalpy"),
      v("gas-constant"),
    );
  r.q(
    "co2-pressure-at-freeze",
    {
      label: "CO₂ left in the air at 195 K (its vapour pressure)",
      unit: "Pa",
      show: "bar",
      sig: 2,
      formula: "Clausius-Clapeyron from 1 atm at 194.7 K",
      basis: "physics",
    },
    () => solid(v("freeze-target-temp")),
  );
  r.q(
    "frost-residual-co2",
    {
      label: "Mass of CO₂ still in the air at 195 K",
      unit: "kg",
      formula: "P_CO₂ A / g",
      basis: "physics",
    },
    () => (v("co2-pressure-at-freeze") * v("venus-area")) / v("venus-gravity"),
  );
  r.q(
    "frost-co2-pressure",
    {
      label: "CO₂ pressure Frost Towers leave, cold-trapping at 133 K",
      unit: "Pa",
      sig: 2,
      formula: "P_ref exp[−(ΔH/R)(1/T − 1/T_ref)]",
      basis: "physics",
    },
    () => solid(v("frost-tower-temp")),
  );
  r.q(
    "frost-residual-target",
    {
      label: "CO₂ left airborne once the Frost Towers finish",
      unit: "kg",
      formula: "P_CO₂(133 K) A / g",
      basis: "physics",
    },
    () => (v("frost-co2-pressure") * v("venus-area")) / v("venus-gravity"),
  );
  r.q(
    "frost-work",
    {
      label: "Heat-pump work for the Frost Towers",
      unit: "J",
      formula: "M_residual L (T_h / 133 K − 1)",
      basis: "physics",
    },
    () =>
      v("frost-residual-co2") *
      v("co2-deposition-heat") *
      (v("exhaust-effective-temp") / v("frost-tower-temp") - 1),
  );

  r.c("second-law", { label: "The heat pump never beats Carnot", kind: "second-law" }, () => {
    const Q = v("atmosphere-heat");
    const Th = v("exhaust-effective-temp");
    const best = Q * (Th / v("venus-surface-temp") - 1);
    return {
      pass:
        v("exhaust-work") >= best && v("exhaust-work-ratio") >= Th / v("venus-surface-temp") - 1,
      detail: `Pump work ${v("exhaust-work").toExponential(2)} J for ${Q.toExponential(2)} J of heat, at least the ${best.toExponential(2)} J Carnot demands even if every joule left from 737 K.`,
    };
  });
}
