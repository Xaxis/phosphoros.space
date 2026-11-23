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
    "chimney-capacity-lit",
    {
      label: "Heat the lit canopies' chimneys can deliver at once",
      unit: "W",
      formula: "N × Q × lit share",
      basis: "invented",
      note: "A chimney carries heat only while the Lattice lights its canopy.",
    },
    () => v("chimney-count") * v("chimney-heat") * v("exhaust-lit-share"),
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
  const eta = v("exhaust-carnot-share");
  return { sensible: sensible / eta, latent: latent / eta, total: (sensible + latent) / eta };
}

/**
 * The second law prices light by its entropy. Spread evenly over the tiles' band and the whole sky
 * above them, light of flux F has radiance F / π and fills each mode with n = L λ⁵ / (2 h c² Δλ)
 * photons; each mode carries energy n h ν and entropy k[(1 + n) ln(1 + n) − n ln n]. Their ratio is
 * the lowest temperature the light can count as, and so the hot side every pump is charged for.
 */
export function lightTemp(v: (id: string) => number, flux: number): number {
  const h = v("planck-constant");
  const c = v("speed-of-light");
  const lambda = (h * c) / (v("exhaust-bandgap") * v("electron-volt"));
  const n = ((flux / Math.PI) * lambda ** 5) / (2 * h * c ** 2 * v("exhaust-band"));
  const energy = (n * h * c) / lambda;
  const entropy = v("boltzmann-constant") * ((1 + n) * Math.log(1 + n) - n * Math.log(n));
  return energy / entropy;
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
      label: "Emitter brightness, as bright as a black body at the emitters' temperature",
      unit: "W/m2",
      show: "MW/m2",
      sig: 2,
      formula: "σ T_e⁴",
      basis: "invented",
    },
    () => v("stefan-boltzmann") * v("exhaust-effective-temp") ** 4,
  );
  r.q(
    "exhaust-radiance",
    {
      label: "Emitter radiance, spread over the whole sky above a tile",
      unit: "W m-2 sr-1",
      sig: 2,
      formula: "F / π",
      basis: "physics",
    },
    () => v("exhaust-flux") / Math.PI,
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
      label: "Temperature the tiles' light counts as by its entropy: the pumps' hot side",
      unit: "K",
      sig: 2,
      formula: "n h c / λ ÷ k[(1 + n) ln(1 + n) − n ln n]",
      basis: "physics",
      note: "The pumps must put out at least as much entropy as they take from the air, so every pump work in the model, the simulation's included, is charged as if the hot side were at this temperature. Light squeezed into one narrow band counts as hotter than a black body of the same brightness.",
    },
    () => lightTemp(v, v("exhaust-flux")),
  );
  r.q(
    "exhaust-light-vs-effective",
    {
      label:
        "The light's entropy temperature over the black body's that is as bright: the cost of one narrow band",
      unit: "1",
      sig: 2,
      formula: "T_light / T_e",
      basis: "physics",
    },
    () => v("exhaust-light-temp") / v("exhaust-effective-temp"),
  );
  r.q(
    "exhaust-work-sensible",
    {
      label: "Heat-pump work for the sensible cooling",
      unit: "J",
      formula:
        "∫ M c_p (T_h / (k T) − 1) dT / η_C, from 737 K to 195 K, k the exchangers' cold factor",
      basis: "physics",
    },
    () => coolingPathWork(v, v("exhaust-light-temp")).sensible,
  );
  r.q(
    "exhaust-work-latent",
    {
      label: "Heat-pump work to freeze the CO₂",
      unit: "J",
      formula: "Q_L [T_h ln(T_c / T_t) / (T_c − T_t) − 1] / η_C",
      basis: "physics",
      note: "The simple estimate: latent heat released evenly in temperature between CO₂'s critical point (304 K) and triple point (216.6 K). The day-by-day simulation releases it where the physics puts it, the heat of fusion at the triple point itself.",
    },
    () => coolingPathWork(v, v("exhaust-light-temp")).latent,
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
    "exhaust-area-installed",
    {
      label: "Emitter area installed (sized for the peak, with half of it lit at once)",
      unit: "m2",
      formula: "P_peak / (σ T_e⁴ × lit share)",
      basis: "invented",
      note: "The Lattice orbits inside Venus's orbit, so it can beam only the tiles on the side of Venus facing it. The peak is what the lit tiles throw out together.",
    },
    () => v("exhaust-peak") / (v("exhaust-flux") * v("exhaust-lit-share")),
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
    "canopy-band-share",
    {
      label: "Share of Venus between the Bricks' drop zones, where the canopies stand",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "sin(drop latitude)",
      basis: "physics",
    },
    () => Math.sin((v("ice-drop-latitude") * Math.PI) / 180),
  );
  r.q(
    "canopy-band-cover",
    {
      label: "Share of that band the tiles cover",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "A_installed / (A_V sin(drop latitude))",
      basis: "invented",
    },
    () => v("exhaust-area-share") / v("canopy-band-share"),
  );
  r.c(
    "exhaust-fits-venus",
    {
      label:
        "The tiles fit in the band between the drop zones, the lit ones on the side the Lattice sees",
      kind: "capacity",
    },
    () => ({
      pass: v("canopy-band-cover") <= 1,
      detail: `The lit tiles throw out ${fmt(r, "exhaust-peak")} at ${fmt(r, "exhaust-flux")}, and only ${fmt(r, "exhaust-lit-share")} of them are lit at once, so the tiles cover ${fmt(r, "exhaust-area-share")} of Venus: ${fmt(r, "canopy-band-cover")} of the band within ${fmt(r, "ice-drop-latitude")} of the equator, which leaves the poles to the falling ice.`,
    }),
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
      formula: "M_residual L (T_h / 133 K − 1) / η_C",
      basis: "physics",
    },
    () =>
      (v("frost-residual-co2") *
        v("co2-deposition-heat") *
        (v("exhaust-light-temp") / v("frost-tower-temp") - 1)) /
      v("exhaust-carnot-share"),
  );

  r.c(
    "second-law",
    { label: "The heat pumps are charged more than the reversible work", kind: "second-law" },
    () => {
      const Q = v("atmosphere-heat");
      const Th = v("exhaust-light-temp");
      const best = Q * (Th / v("venus-surface-temp") - 1);
      // A pump at the reversible limit moves heat infinitely slowly: any real rate costs more.
      const real = v("exhaust-carnot-share") < 1;
      return {
        pass: real && v("exhaust-work") >= best,
        detail: real
          ? `The pumps reach ${fmt(r, "exhaust-carnot-share")} of the Carnot limit, so the model charges ${fmt(r, "exhaust-work")} of work for ${fmt(r, "atmosphere-heat")} of heat, more than the ${formatQuantity({ value: best, unit: "J" })} even a reversible pump would need if every joule left from ${fmt(r, "venus-surface-temp")}.`
          : `The pumps are charged exactly the reversible work. A heat pump at the Carnot limit moves heat infinitely slowly, so any pump that cools Venus in years needs more.`,
      };
    },
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
  // Light the tiles send toward the Veil. Light spread evenly over a tile's sky falls on a disc of
  // angular radius θ at zenith angle z in the share cos z sin² θ; spread over the lit side, the
  // tiles see the Veil at an average cos z of a half.
  r.q(
    "exhaust-veil-share",
    {
      label: "Share of the lit tiles' light that strikes the Veil",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "½ sin² θ_Veil",
      basis: "physics",
      note: "A tile right under the Veil sends it twice this share; one at the edge of the lit side, none.",
    },
    () => 0.5 * Math.sin((v("veil-angular-radius") * Math.PI) / 180) ** 2,
  );
  r.q(
    "exhaust-veil-load",
    {
      label: "The Exhaust's light on the Veil at peak",
      unit: "W",
      formula: "P_peak × ½ sin² θ_Veil",
      basis: "physics",
    },
    () => v("exhaust-peak") * v("exhaust-veil-share"),
  );
  r.q(
    "exhaust-veil-load-share",
    {
      label: "That light as a share of the sunlight the closed Veil turns away",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "P_on Veil / P_blocked",
      basis: "physics",
    },
    () => v("exhaust-veil-load") / v("veil-blocked-power"),
  );
  r.c(
    "exhaust-spares-veil",
    {
      label: "The Exhaust's light adds little to the sunlight the Veil turns away",
      kind: "capacity",
    },
    () => ({
      // A tenth more light than it already handles is well inside what a film that turns sunlight
      // aside can take; the Veil bends the Exhaust's light outward like the Sun's.
      pass: v("exhaust-veil-load-share") <= 0.1,
      detail: `Seen from Venus the Veil is ${fmt(r, "veil-angular-radius")} in radius, so the lit tiles send it ${fmt(r, "exhaust-veil-share")} of their light: ${fmt(r, "exhaust-veil-load")} at the Exhaust's peak, ${fmt(r, "exhaust-veil-load-share")} of the ${fmt(r, "veil-blocked-power")} of sunlight it turns away. It pushes the Veil toward the Sun, against the sunlight, and the slats that trim its station take it up.`,
    }),
  );

  // How far out one canopy's light is still bright.
  r.q(
    "exhaust-safe-distance",
    {
      label:
        "Distance beyond which one canopy's light, at peak power, is dimmer than the far-field limit",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "√(P_peak / (N × lit share × π F_limit))",
      basis: "physics",
      note: "Straight above the canopy, where it is brightest. Where the light of neighbouring canopies overlaps, it adds.",
    },
    () =>
      Math.sqrt(
        v("exhaust-peak") /
          (v("exhaust-canopies") * v("exhaust-lit-share") * Math.PI * v("exhaust-far-limit")),
      ),
  );

  // The Lattice's light pumps the tiles directly. Each pump photon the tile absorbs leaves as one of
  // its own, which for a direct-gap semiconductor at temperature T carries on average the bandgap
  // plus 3/2 kT. The difference is heat taken from the air, so a joule of pumping light can carry at
  // most η_ext E_out / E_pump − 1 joules of heat. The model's pumps must ask for no more than that.
  const pumpPhoton = () => (v("planck-constant") * v("speed-of-light")) / v("helios-wavelength");
  const outPhoton = (T: number) =>
    v("exhaust-bandgap") * v("electron-volt") + 1.5 * v("boltzmann-constant") * T;
  const room = (T: number) => (v("exhaust-eqe") * outPhoton(T)) / pumpPhoton() - 1;
  const charged = (T: number) => (v("exhaust-carnot-share") * T) / (v("exhaust-light-temp") - T);
  const hottest = () => v("venus-surface-temp") * v("chimney-cold-factor");
  r.q(
    "exhaust-pump-photon",
    {
      label: "Energy of one photon of the pumping light",
      unit: "J",
      sig: 3,
      formula: "h c / λ_pump",
      basis: "physics",
    },
    pumpPhoton,
  );
  r.q(
    "exhaust-pump-room-start",
    {
      label: "Heat one joule of pumping light can carry from the hottest starting air",
      unit: "1",
      sig: 2,
      formula: "η_ext (E_gap + 3/2 k T) / E_pump − 1",
      basis: "physics",
    },
    () => room(hottest()),
  );
  r.q(
    "exhaust-cop-start",
    {
      label: "Heat the model has each joule of pumping light lift from the hottest starting air",
      unit: "1",
      sig: 2,
      formula: "η_C T / (T_light − T)",
      basis: "physics",
    },
    () => charged(hottest()),
  );
  r.c(
    "exhaust-pump-photons",
    {
      label: "Each pump photon leaves the tile with room for the heat the model has it carry",
      kind: "second-law",
    },
    () => {
      // The charged heat per joule falls faster with the air's temperature than the photons' room,
      // so the hottest air is the tightest; check the whole path to be sure.
      let worst = Number.POSITIVE_INFINITY;
      for (let T = v("frost-tower-temp"); T <= hottest(); T += 1)
        worst = Math.min(worst, room(T) - charged(T));
      return {
        pass: worst >= 0,
        detail: `Pumped at ${fmt(r, "helios-wavelength")}, below the tiles' ${fmt(r, "exhaust-bandgap")} bandgap, each photon leaves at least ${fmt(r, "exhaust-bandgap")} plus the heat of the tile it crossed. From the hottest starting air a joule of pumping light can carry ${fmt(r, "exhaust-pump-room-start")} J of heat; the model has it carry ${fmt(r, "exhaust-cop-start")} J, and less as the air cools.`,
      };
    },
  );
}

/**
 * The Exhaust's campaign averages. They divide by the length of active cooling, which starts only
 * once the hardware at Venus is built, so they run after the Foundry's products.
 */
export function exhaustAverages(r: Registry) {
  const { v } = r.in("model/exhaust.ts");

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

  // How the tiles' brightness trades area against work. A tile as bright as a black body at T_e
  // has light that counts as hotter, and the pumps are charged for that; only the lit share works.
  const tradeoff = (Te: number) => {
    const flux = v("stefan-boltzmann") * Te ** 4;
    const w = coolingPathWork(v, lightTemp(v, flux)).total;
    const area =
      (w + v("atmosphere-heat")) / v("cooling-seconds") / (flux * v("exhaust-lit-share"));
    return { work: w, share: area / v("venus-area") };
  };
  r.s(
    "exhaust-tradeoff",
    {
      label: "Tile brightness (effective temperature) against tile area (share of Venus)",
      x: "K",
      y: "1",
      note: "y is the tile area as a share of Venus's surface, for the campaign's average power with only the lit tiles working.",
    },
    () => {
      const pts = [];
      for (let Te = 800; Te <= 3000; Te += 50) pts.push({ x: Te, y: tradeoff(Te).share });
      return pts;
    },
  );
  r.s(
    "exhaust-tradeoff-work",
    { label: "Tile brightness (effective temperature) against total pump work", x: "K", y: "J" },
    () => {
      const pts = [];
      for (let Te = 800; Te <= 3000; Te += 50) pts.push({ x: Te, y: tradeoff(Te).work });
      return pts;
    },
  );
  for (const Te of [1000, 1500, 2500]) {
    r.q(
      `exhaust-area-share-${Te}`,
      {
        label: `Tile area as a share of Venus, for tiles as bright as a ${Te.toLocaleString("en-US")} K black body`,
        unit: "1",
        show: "%",
        sig: 2,
        formula: "(Q + W(T_light)) / campaign / (σ T_e⁴ × lit share × A_V)",
        basis: "physics",
      },
      () => tradeoff(Te).share,
    );
  }
}
