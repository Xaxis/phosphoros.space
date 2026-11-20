/**
 * The atmosphere's path from 2033 to 2036, simulated day by day from the power the plan has.
 *
 * Each day the Lattice and the Ring supply electricity; the Railheads and Forges take their share;
 * the rest drives the Photonic Exhaust, which lifts heat out of the air at the air's own temperature
 * and rejects it at an effective 2,000 K, never more than the installed emitters can shine. The heat
 * removed moves the air down the cooling path (sensible cooling to 304 K, the CO₂ condensing and
 * freezing between 304 K and 216.6 K, then cooling to 195 K), and the CO₂ left in the air follows its
 * vapour curve. Frost Towers then trap the last CO₂, the Forges add oxygen, and once the caps are
 * sealed the beamed power and the opened Veil warm the air and melt the ice to Earth-like.
 *
 * Simplifications, all named: the whole atmosphere shares one temperature; latent heat is released
 * evenly between 304 K and 216.6 K; the Lattice's power grows with the Foundry's mass; receiver loss
 * heat is radiated straight to space by hot receivers above the air.
 */
import { co2LiquidPressure, co2SolidPressure, conductedFlux } from "../physics.ts";
import type { Point, Registry } from "../registry.ts";
import { DAY_S, isoOf } from "../time.ts";
import { foundryMassAt } from "./foundry.ts";

export interface TrajectoryDay {
  day: number;
  temp: number;
  pressure: number;
  co2: number;
  o2: number;
  /** Electrical power driving the Exhaust (W). */
  pumpPower: number;
  /** Heat leaving the air (W). */
  heatOut: number;
  /** Heat entering the air from other sources (W). */
  heatIn: number;
  /** Electrical power spent warming the air and melting ice once the caps are sealed (W). */
  warmPower: number;
  phase: "cooling" | "scavenging" | "holding" | "warming" | "earth-like";
}

export function simulate(v: (id: string) => number): {
  days: TrajectoryDay[];
  events: Record<string, number>;
} {
  const M = v("venus-atmosphere-mass");
  const cp = v("co2-cp");
  const C = M * cp;
  const T0 = v("venus-surface-temp");
  const Tc = v("co2-critical-temp");
  const Tt = v("co2-triple-temp");
  const Tf = v("freeze-target-temp");
  const Th = v("exhaust-effective-temp");
  const Tfrost = v("frost-tower-temp");
  const L = v("co2-deposition-heat");
  const HA = C * (T0 - Tc);
  const HB = v("atmosphere-latent-heat") + C * (Tc - Tt);
  const HC = C * (Tt - Tf);
  const Htotal = HA + HB + HC;
  const area = v("venus-area");
  const g = v("venus-gravity");
  const pN2 = v("n2-pressure");
  const pCO2start = v("venus-column-pressure") - pN2;
  const liquid = (T: number) =>
    co2LiquidPressure(
      T,
      { T: Tt, P: v("co2-triple-pressure") },
      { T: Tc, P: v("co2-critical-pressure") },
    );
  const solid = (T: number) =>
    co2SolidPressure(
      T,
      { T: v("co2-sublimation-ref-temp"), P: v("co2-sublimation-ref-pressure") },
      v("co2-sublimation-enthalpy"),
      v("gas-constant"),
    );

  const foundry = {
    seed: v("foundry-seed-mass"),
    landing: v("foundry-landing"),
    doubling: v("foundry-doubling-days"),
    final: v("foundry-final-mass"),
  };
  const fullPower = v("helios-full-power");
  const fullMass = foundryMassAt(fullPower, foundry);
  const lattice = (d: number) =>
    d < v("helios-first-petals")
      ? 0
      : v("helios-power") * Math.min(1, foundryMassAt(d, foundry) / fullMass);

  const start = v("cooling-start");
  const deadline = v("deadline");
  const stop = deadline + 3 * 365;
  const events: Record<string, number> = {};
  const mark = (k: string, d: number) => {
    if (events[k] === undefined) events[k] = d;
  };

  let H = 0; // heat removed from the air along the cooling path (J)
  let residual = 0; // CO₂ still airborne after the air reaches 195 K (kg)
  let temp = T0;
  let iceCold = 0; // ice lowered while the air was below freezing, still to melt (kg)
  let phase: TrajectoryDay["phase"] = "cooling";
  const days: TrajectoryDay[] = [];
  const pressureOf = (pCO2: number, o2: number, T: number) => {
    const water = T >= 273.15 ? v("final-water-vapour") : 0;
    return pN2 + o2 + pCO2 + water;
  };

  for (let d = start; d <= stop; d += 1) {
    // Power for Venus: the Lattice, less what the Railheads take before the Ring can pay them,
    // plus the Ring's surplus, less the Forges.
    let power = lattice(d);
    const launching = d >= v("ice-launch-start") && d < v("ice-launch-end");
    const catching = d >= v("first-catch") && d < v("last-arrival");
    if (launching && !catching) power -= Math.min(power, v("railhead-power"));
    if (catching) power += v("ring-power") - (launching ? v("railhead-power") : 0);
    const forging = d >= v("forge-start") && d < v("forge-end");
    if (forging) power -= Math.min(power, v("forge-power"));
    power = Math.max(0, power);

    // Heat entering the air.
    const elapsed = (d - start + 1) * DAY_S;
    let heatIn =
      conductedFlux(
        v("rock-conductivity"),
        v("crust-cooling-step"),
        v("rock-diffusivity"),
        elapsed,
      ) *
        area *
        (1 - v("cryo-footprint-share")) +
      (forging ? v("forge-power") * (1 - v("forge-efficiency")) : 0) +
      (phase === "warming" || phase === "earth-like"
        ? 0
        : (1 - v("veil-block-fraction")) * v("venus-absorbed"));
    const lowering = d >= v("lowering-start") && d < v("lowering-end");
    if (lowering) {
      const rate = v("lowering-rate");
      if (temp >= 273.15) heatIn += rate * (v("fall-energy") - v("melt-energy"));
      else {
        heatIn += rate * (v("fall-energy") - v("ice-cp") * Math.max(0, temp - v("brick-temp")));
        iceCold += rate * DAY_S;
      }
    }

    const o2 =
      v("o2-target-pressure") *
      Math.min(1, Math.max(0, (d - v("forge-start")) / (v("forge-end") - v("forge-start"))));
    let pCO2: number;
    let heatOut = 0;
    let pumpPower = 0;
    let warmPower = 0;

    if (phase === "cooling" || phase === "scavenging" || phase === "holding") {
      // The cold side is the air (or the Frost Towers once only the last CO₂ is left).
      const cold = phase === "cooling" ? temp : Tf;
      const maxWork = v("exhaust-peak") * (1 - cold / Th);
      const work = Math.min(power, maxWork);
      const capacity = (work * cold) / (Th - cold);
      pumpPower = work;
      if (phase === "cooling") {
        heatOut = capacity;
        H = Math.max(0, H + (heatOut - heatIn) * DAY_S);
      } else {
        // Hold the air at 195 K first; whatever is left traps CO₂ at the Frost Towers.
        const spareWork = Math.max(0, work - heatIn * ((Th - Tf) / Tf));
        const perKg = L * (Th / Tfrost - 1);
        heatOut = heatIn + (spareWork / perKg) * L;
        residual = Math.max(v("frost-residual-target"), residual - (spareWork / perKg) * DAY_S);
      }
      if (H < HA) temp = T0 - H / C;
      else if (H < HA + HB) temp = Tc - ((H - HA) / HB) * (Tc - Tt);
      else if (H < Htotal) temp = Tt - (H - HA - HB) / C;
      else temp = Tf;

      if (temp <= Tc) mark("clear-rain", d);
      if (temp <= Tt) mark("freeze", d);
      if (H >= Htotal && phase === "cooling") {
        mark("cold", d);
        phase = "scavenging";
        residual = v("frost-residual-co2");
      }
      if (phase === "scavenging" && residual <= v("frost-residual-target")) {
        mark("scavenged", d);
        phase = "holding";
      }
      if (phase === "holding" && d >= v("sealing-end")) {
        phase = "warming";
        mark("warming", d);
      }
      if (phase === "cooling") {
        if (H < HA) pCO2 = pCO2start;
        // While liquid seas exist the air's CO₂ sits on the vapour curve, whatever is left to rain.
        else if (H < HA + HB) pCO2 = Math.min(pCO2start, liquid(temp));
        else pCO2 = solid(temp);
      } else pCO2 = (residual * g) / area;
    } else {
      // Warming: the beamed power becomes heat, the Veil lets in Earth-strength light, and the
      // ice lowered while the air was cold melts first.
      const sun = v("veil-day-transmission") * v("venus-intercepted") * (1 - v("final-albedo"));
      const melt = v("melt-energy") - v("ice-cp") * (Tf - v("brick-temp"));
      const airC = (v("venus-n2-mass") + v("o2-mass")) * v("air-cp");
      const need = iceCold * melt + Math.max(0, v("earth-surface-temp") - temp) * airC;
      const free = (sun + heatIn) * DAY_S;
      const bought = Math.min(power * DAY_S, Math.max(0, need - free));
      warmPower = bought / DAY_S;
      const heat = free + bought;
      const melted = Math.min(iceCold, heat / melt);
      iceCold -= melted;
      const left = heat - melted * melt;
      if (iceCold <= 0) temp = Math.min(v("earth-surface-temp"), temp + left / airC);
      pCO2 = (residual * g) / area;
      heatOut = 0;
      if (temp >= v("earth-like-temp")) mark("warm", d);
    }

    const pressure = pressureOf(pCO2, o2, temp);
    if (
      phase === "warming" &&
      temp >= v("earth-like-temp") &&
      o2 >= v("o2-target-pressure") * 0.999 &&
      pCO2 / pressure <= v("earth-like-co2")
    ) {
      phase = "earth-like";
      mark("earth-like", d);
    }
    days.push({
      day: d,
      temp,
      pressure,
      co2: pCO2,
      o2,
      pumpPower,
      heatOut,
      heatIn,
      warmPower,
      phase,
    });
    if (phase === "earth-like" && d > deadline) break;
  }
  for (const k of ["clear-rain", "freeze", "cold", "scavenged", "warming", "warm", "earth-like"])
    mark(k, stop);
  return { days, events };
}

export function trajectory(r: Registry) {
  const { v } = r.in("model/trajectory.ts");
  let sim: ReturnType<typeof simulate> | undefined;
  const run = () => {
    sim = simulate(v);
    return sim;
  };

  const labels: Record<string, string> = {
    "clear-rain": "The Clear Rain begins: near-surface air below 304 K",
    freeze: "CO₂ seas start to freeze: air below 216.6 K",
    cold: "All the CO₂ is down: air at 195 K",
    scavenged: "Frost Towers bring CO₂ down to the target",
    warming: "Caps sealed; the Veil opens and the air warms",
    warm: "Air reaches 285 K",
    "earth-like": "Earth-like: warm, 0.25 bar of oxygen, CO₂ under 600 ppm",
  };
  for (const [k, label] of Object.entries(labels)) {
    r.q(
      `traj-${k}`,
      {
        label,
        unit: "date",
        formula: "day-by-day simulation (model/trajectory.ts)",
        basis: "physics",
      },
      () => (sim ?? run()).events[k] as number,
    );
  }
  const total = (pick: (t: TrajectoryDay) => number) =>
    (sim ?? run()).days.reduce(
      (sum, t) => (t.day <= v("deadline") ? sum + pick(t) * DAY_S : sum),
      0,
    );
  r.q(
    "traj-pump-energy",
    {
      label: "Heat-pump work to cool Venus, day by day, Frost Towers included",
      unit: "J",
      formula: "Σ pump power × 1 day, to the deadline",
      basis: "physics",
      note: "More than the work for the air alone, because the pumps also carry away heat from the crust, the Forges, the falling ice and the sunlight the closed Veil lets through.",
    },
    () => total((t) => t.pumpPower),
  );
  r.q(
    "traj-heat-added",
    {
      label: "Heat that enters the air during the campaign from other sources",
      unit: "J",
      formula: "Σ (crust + Forges + falling ice + residual sunlight) × 1 day",
      basis: "physics",
    },
    () => total((t) => t.heatIn),
  );
  r.q(
    "traj-warm-energy",
    {
      label: "Beamed power spent warming the air and melting the cold ice after sealing",
      unit: "J",
      formula: "Σ warming power × 1 day",
      basis: "physics",
    },
    () => total((t) => t.warmPower),
  );
  r.q(
    "traj-slack-days",
    {
      label: "Days to spare between Earth-like conditions and the deadline",
      unit: "d",
      sig: 2,
      formula: "deadline − Earth-like date",
      basis: "physics",
    },
    () => v("deadline") - ((sim ?? run()).events["earth-like"] as number),
  );
  const weekly = (pick: (t: TrajectoryDay) => number): Point[] => {
    const out: Point[] = [];
    const days = (sim ?? run()).days;
    for (let i = 0; i < days.length; i += 7) {
      const t = days[i] as TrajectoryDay;
      out.push({ x: t.day, y: pick(t) });
    }
    return out;
  };
  r.s("traj-temperature", { label: "Mean air temperature", x: "date", y: "K" }, () =>
    weekly((t) => t.temp),
  );
  r.s("traj-pressure", { label: "Surface pressure", x: "date", y: "Pa" }, () =>
    weekly((t) => t.pressure),
  );
  r.s("traj-co2", { label: "CO₂ partial pressure", x: "date", y: "Pa" }, () =>
    weekly((t) => t.co2),
  );
  r.s("traj-o2", { label: "Oxygen partial pressure", x: "date", y: "Pa" }, () =>
    weekly((t) => t.o2),
  );
  r.s("traj-pump-power", { label: "Electrical power driving the Exhaust", x: "date", y: "W" }, () =>
    weekly((t) => t.pumpPower),
  );
  r.s("traj-heat-out", { label: "Heat leaving the air", x: "date", y: "W" }, () =>
    weekly((t) => t.heatOut),
  );

  r.c(
    "earth-like-by-deadline",
    { label: "The simulated atmosphere is Earth-like by the deadline", kind: "schedule" },
    () => {
      const d = (sim ?? run()).events["earth-like"] as number;
      return {
        pass: d <= v("deadline"),
        detail: `The day-by-day simulation reaches Earth-like conditions on ${isoOf(d)}; the deadline is ${isoOf(v("deadline"))}.`,
      };
    },
  );
}
