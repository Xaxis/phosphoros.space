/**
 * Thermal Chimneys and the Photonic Exhaust: lifting Venus's heat to the cloud tops and throwing it
 * into space as light. The heat-pump work follows the cooling path: sensible cooling of the whole
 * atmosphere from today's surface temperature, and the CO₂'s latent heat released between its
 * critical and triple points.
 */

import { formatQuantity } from "../format.ts";
import {
  bandPumpWork,
  blackBodyShare,
  co2SublimationPressure,
  sensiblePumpWork,
} from "../physics.ts";
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";
import { fmt } from "./text.ts";

export function chimneys(r: Registry) {
  const { v } = r.in("model/exhaust.ts");
  r.q(
    "chimney-flow-area",
    { label: "Chimney cross-section", unit: "m2", sig: 2, formula: "π (D/2)²", basis: "design" },
    () => Math.PI * (v("chimney-diameter") / 2) ** 2,
  );
  r.q(
    "chimney-mass-flow",
    {
      label: "Hot air drawn through one chimney's exchangers",
      unit: "kg/s",
      formula: "ρ v A",
      basis: "invented",
    },
    () => v("venus-surface-density") * v("chimney-flow-speed") * v("chimney-flow-area"),
  );
  r.q(
    "chimney-heat",
    { label: "Heat one chimney delivers", unit: "W", formula: "ṁ c_p ΔT", basis: "invented" },
    () => v("chimney-mass-flow") * v("co2-cp") * v("chimney-gas-cooling"),
  );
  r.q(
    "chimney-fan-power",
    {
      label: "Power the chimneys' fans draw",
      unit: "W",
      sig: 2,
      formula: "N × K ½ ρ v² × v A",
      basis: "invented",
    },
    () =>
      v("chimney-count") *
      v("chimney-loss-coefficient") *
      0.5 *
      v("venus-surface-density") *
      v("chimney-flow-speed") ** 3 *
      v("chimney-flow-area"),
  );
  r.q(
    "chimney-cold-factor",
    {
      label: "The pumps' effective cold side as a share of the air's temperature",
      unit: "1",
      sig: 3,
      formula: "k / −ln(1 − k), k = ΔT / T_surface",
      basis: "physics",
      note: "The exchangers cool the air passing them by a share k of its temperature, and the liquid loop hands the pumps that heat over the same range. Heat taken from a stream cooling from T to (1 − k)T costs the same work as heat taken at their log-mean temperature. Condensing CO₂ gives up its heat at one temperature, so this applies only while the air cools as a gas.",
    },
    () => {
      const k = v("chimney-gas-cooling") / v("venus-surface-temp");
      return k / -Math.log(1 - k);
    },
  );
  r.q(
    "chimney-capacity",
    { label: "Heat all chimneys can deliver", unit: "W", formula: "N × Q", basis: "invented" },
    () => v("chimney-count") * v("chimney-heat"),
  );
  r.q(
    "chimney-fan-share",
    {
      label: "Fan power as a share of the heat the chimneys can carry",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "P_fans / (N Q)",
      basis: "invented",
    },
    () => v("chimney-fan-power") / v("chimney-capacity"),
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
  // The pumps see the air through the chimneys' exchangers, a little colder than the air itself.
  const sensible = sensiblePumpWork(
    v("venus-atmosphere-mass") * v("co2-cp"),
    v("venus-surface-temp"),
    v("freeze-target-temp"),
    Th / v("chimney-cold-factor"),
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
      note: "The simple estimate: latent heat released evenly in temperature between CO₂'s critical point (304 K) and triple point (216.6 K). The day-by-day simulation releases it where the physics puts it, the heat of fusion at the triple point itself.",
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
    co2SublimationPressure(T, { T: v("co2-triple-temp"), P: v("co2-triple-pressure") }, [
      v("co2-sublimation-a1"),
      v("co2-sublimation-a2"),
      v("co2-sublimation-a3"),
    ]);
  r.q(
    "co2-pressure-at-freeze",
    {
      label: "CO₂ left in the air at 195 K (its vapour pressure)",
      unit: "Pa",
      show: "bar",
      sig: 2,
      formula: "p_t exp[(T_t/T)(a₁ θ + a₂ θ^1.9 + a₃ θ^2.9)], θ = 1 − T/T_t (Span and Wagner)",
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
      formula: "p_t exp[(T_t/T)(a₁ θ + a₂ θ^1.9 + a₃ θ^2.9)], θ = 1 − T/T_t (Span and Wagner)",
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
      detail: `Pump work ${fmt(r, "exhaust-work")} for ${fmt(r, "atmosphere-heat")} of heat, at least the ${formatQuantity({ value: best, unit: "J" })} Carnot demands even if every joule left from ${fmt(r, "venus-surface-temp")}, with the emitters as hot as ${fmt(r, "exhaust-effective-temp")}.`,
    };
  });

  // The second law prices light by its entropy. Spread evenly over a band Δλ and a cone, light of
  // radiance L fills each mode with n = L λ⁵ / (2 h c² Δλ) photons; each mode carries energy n h ν
  // and entropy k[(1 + n) ln(1 + n) − n ln n]. Even spreading gives the most entropy for the energy,
  // so the ratio is the lowest temperature the beamed light can count as.
  r.q(
    "exhaust-radiance",
    {
      label: "Emitter radiance into its cone",
      unit: "W m-2 sr-1",
      sig: 2,
      formula: "F / (π sin²(θ/2))",
      basis: "physics",
    },
    () => v("exhaust-flux") / (Math.PI * Math.sin(((v("exhaust-cone") / 2) * Math.PI) / 180) ** 2),
  );
  r.q(
    "exhaust-photons-per-mode",
    {
      label: "Photons in each mode of the Exhaust's light",
      unit: "1",
      sig: 2,
      formula: "L λ⁵ / (2 h c² Δλ)",
      basis: "physics",
    },
    () =>
      (v("exhaust-radiance") * v("exhaust-wavelength") ** 5) /
      (2 * v("planck-constant") * v("speed-of-light") ** 2 * v("exhaust-band")),
  );
  r.q(
    "exhaust-light-temp",
    {
      label: "Temperature the beamed light counts as, by its entropy",
      unit: "K",
      sig: 2,
      formula: "n h c / λ ÷ k[(1 + n) ln(1 + n) − n ln n]",
      basis: "physics",
      note: "The pumps must put out at least as much entropy as they take from the air, so they work as if their hot side were at this temperature.",
    },
    () => {
      const n = v("exhaust-photons-per-mode");
      const energy = (n * v("planck-constant") * v("speed-of-light")) / v("exhaust-wavelength");
      const entropy = v("boltzmann-constant") * ((1 + n) * Math.log(1 + n) - n * Math.log(n));
      return energy / entropy;
    },
  );
  r.q(
    "exhaust-light-vs-effective",
    {
      label: "The light's entropy temperature over the emitters' effective temperature",
      unit: "1",
      sig: 2,
      formula: "T_light / T_h",
      basis: "physics",
    },
    () => v("exhaust-light-temp") / v("exhaust-effective-temp"),
  );
  r.q(
    "exhaust-work-multiple",
    {
      label:
        "Work to lift a joule from 737 K air into the beamed light, over the work the model charges",
      unit: "1",
      sig: 2,
      formula: "(T_light / T_s − 1) / (T_h / T_s − 1)",
      basis: "physics",
      note: "Larger still for colder air: the gap grows as the campaign goes on.",
    },
    () => {
      const Ts = v("venus-surface-temp");
      return (v("exhaust-light-temp") / Ts - 1) / (v("exhaust-effective-temp") / Ts - 1);
    },
  );
  r.c(
    "exhaust-entropy",
    {
      label: "The Exhaust's beamed light can carry away the entropy its pumps lift",
      kind: "second-law",
      issue: "exhaust-entropy",
    },
    () => ({
      pass: v("exhaust-light-temp") <= v("exhaust-effective-temp"),
      detail: `The model charges pump work as if the hot side were at ${fmt(r, "exhaust-effective-temp")}. Light at ${fmt(r, "exhaust-flux")} squeezed into a ${fmt(r, "exhaust-band")} band around ${fmt(r, "exhaust-wavelength")} and a ${fmt(r, "exhaust-cone")} cone counts as at least ${fmt(r, "exhaust-light-temp")}, ${fmt(r, "exhaust-light-vs-effective")} times hotter. Lifting a joule from the ${fmt(r, "venus-surface-temp")} air into that light takes ${fmt(r, "exhaust-work-multiple")} times the work the budget charges.`,
    }),
  );

  // A Veil clear in the Exhaust's band would let that band of sunlight through to Venus.
  r.q(
    "exhaust-band-sunlight",
    {
      label: "Share of sunlight in the Exhaust's band",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "π ∫ B_λ(T_☉) dλ / σT_☉⁴ over λ ± Δλ / 2",
      basis: "physics",
      note: "The Sun taken as a black body at its effective temperature.",
    },
    () =>
      blackBodyShare(
        v("sun-temp"),
        v("exhaust-wavelength") - v("exhaust-band") / 2,
        v("exhaust-wavelength") + v("exhaust-band") / 2,
        v("planck-constant"),
        v("speed-of-light"),
        v("boltzmann-constant"),
        v("stefan-boltzmann"),
      ),
  );
  r.q(
    "exhaust-band-vs-veil-leak",
    {
      label: "Sunlight in the Exhaust's band compared with all the closed Veil may let through",
      unit: "1",
      sig: 2,
      formula: "band share / (1 − block)",
      basis: "physics",
    },
    () => v("exhaust-band-sunlight") / v("veil-leak-budget"),
  );
  r.q(
    "exhaust-veil-tilt",
    {
      label:
        "How far tiles near the subsolar point tilt their cones off the Sun line to miss the Veil",
      unit: "deg",
      sig: 2,
      formula: "θ / 2 + Veil angular radius",
      basis: "physics",
    },
    () => v("exhaust-cone") / 2 + v("veil-angular-radius"),
  );
  r.c(
    "exhaust-clears-veil",
    { label: "An opaque Veil leaves the Exhaust's cones a clear sky", kind: "geometry" },
    () => {
      const horizon = 90 - v("exhaust-cone") / 2 - v("exhaust-veil-tilt");
      return {
        pass: horizon > 0,
        detail: `Seen from Venus the Veil is ${fmt(r, "veil-angular-radius")} in radius. Tiles that face it tilt their ${fmt(r, "exhaust-cone")} cones ${fmt(r, "exhaust-veil-tilt")} off the Sun line, which keeps every cone ${horizon.toFixed(0)}° clear of the horizon.`,
      };
    },
  );

  // Beam safety: where the tiles must stay dark, and how far out each cone is still bright.
  // A function, not a constant, so each quantity that uses the cone records it as an input.
  const halfCone = () => (v("exhaust-cone") * Math.PI) / 360;
  r.q(
    "exhaust-dark-strip",
    {
      label: "Width of the strip under the Ring's path where tiles stay dark",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "2 (h_Ring − h_canopy) tan(θ / 2)",
      basis: "physics",
      note: "A tile whose cone would reach the Ring must stay dark: any tile closer to the Ring's ground track than the cone's half-width at the Ring's height.",
    },
    () => 2 * (v("ring-altitude") - v("chimney-top")) * Math.tan(halfCone()),
  );
  r.q(
    "exhaust-dark-strip-share",
    {
      label: "Share of Venus's surface under the dark strip",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "w 2π R_V / A_V",
      basis: "physics",
    },
    () => (v("exhaust-dark-strip") * 2 * Math.PI * v("venus-radius")) / v("venus-area"),
  );
  r.q(
    "exhaust-cone-solid-angle",
    {
      label: "Solid angle of one canopy's beam cone",
      unit: "sr",
      sig: 2,
      formula: "2π (1 − cos(θ / 2))",
      basis: "physics",
    },
    () => 2 * Math.PI * (1 - Math.cos(halfCone())),
  );
  r.q(
    "exhaust-cone-safe-distance",
    {
      label:
        "Distance beyond which one canopy's cone, at peak power, is dimmer than the far-field limit",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "√(P_peak / (N Ω F_limit))",
      basis: "physics",
      note: "Per cone. Where the cones of neighbouring canopies overlap, their light adds.",
    },
    () =>
      Math.sqrt(
        v("exhaust-peak") /
          (v("exhaust-canopies") * v("exhaust-cone-solid-angle") * v("exhaust-far-limit")),
      ),
  );
}
