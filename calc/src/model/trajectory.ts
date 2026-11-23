/**
 * The atmosphere's path from 2033 to 2036, simulated day by day from the light the plan has.
 *
 * Each day the Lattice beams its light; the Railheads and Forges take their share through
 * receivers; the rest pumps the Photonic Exhaust's lit tiles, which lift heat out of the air at the
 * air's own temperature and are charged as if they rejected it at the temperature their light
 * counts as, never more than the lit tiles can shine or the lit canopies' chimneys can carry. The
 * heat removed moves the air down the cooling path (coolingPath: sensible cooling to 304 K, the CO₂
 * condensing along its vapour curve to the triple point, the seas freezing at 216.6 K, the last
 * vapour freezing out as frost down to 195 K). The Bricks fall into the air as it cools, and their
 * entry heat and their water's heat join everything else the pumps must lift. Frost Towers then trap
 * the last CO₂, the Forges add oxygen, and once the caps are sealed the beamed light and the opened
 * Veil warm the air and melt the ice to Earth-like. Heat lifted while the pumps run balances the
 * cooling path, the Frost Towers' share and the heat that enters meanwhile, to rounding.
 *
 * Simplifications, all named: the whole atmosphere shares one temperature; its heat capacity and
 * the CO₂'s deposition heat are averages over the path; the water's vapour curve is the
 * Clausius–Clapeyron relation with one heat of vaporisation; the Lattice's power grows with the
 * Foundry's mass.
 */
import { formatQuantity } from "../format.ts";
import { co2LiquidPressure, co2SublimationPressure, conductedFlux } from "../physics.ts";
import type { Point, Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";
import { iceArrivals } from "./ice.ts";
import { fmt } from "./text.ts";

export interface TrajectoryDay {
  day: number;
  temp: number;
  pressure: number;
  co2: number;
  o2: number;
  /** Light pumping the Exhaust's tiles (W). */
  pumpPower: number;
  /** Heat leaving the air (W). */
  heatOut: number;
  /** Heat entering the air from other sources (W). */
  heatIn: number;
  /** Light spent warming the air and melting ice once the caps are sealed (W). */
  warmPower: number;
  /** Light the chimney fans' receivers take (W). */
  fanPower: number;
  phase: "cooling" | "scavenging" | "holding" | "warming" | "earth-like";
}

/** What the air is doing at a point on its cooling path. */
type Stage = "gas" | "condensing" | "freezing" | "depositing";

/** A point on the cooling path: heat removed so far (J), the air's temperature, CO₂ still airborne (kg). */
interface PathPoint {
  H: number;
  T: number;
  m: number;
  stage: Stage;
}

/**
 * The air's cooling path from Venus today to 195 K, as heat removed against temperature and the CO₂
 * left in the air: a table fine enough to read between its points.
 *
 * Above 304 K the air cools as a gas. From 304 K to the triple point the CO₂ condenses: the air's CO₂
 * follows its vapour curve, and each kilogram that rains out gives up its heat of condensation. At
 * the triple point the seas freeze, giving up their heat of fusion while the air holds at 216.6 K.
 * Below it the CO₂ still in the air deposits as frost along the sublimation curve, each kilogram
 * giving up the whole deposition heat. Condensation and fusion together are the deposition heat.
 */
export function coolingPath(v: (id: string) => number) {
  const C = v("venus-atmosphere-mass") * v("co2-cp");
  const T0 = v("venus-surface-temp");
  const Tc = v("co2-critical-temp");
  const Tt = v("co2-triple-temp");
  const Tf = v("freeze-target-temp");
  const L = v("co2-deposition-heat");
  const Lf = v("co2-fusion-heat");
  const Lv = L - Lf;
  const M = v("venus-co2-mass");
  const perPa = v("venus-area") / v("venus-gravity"); // kg of airborne CO₂ per pascal
  const triple = { T: Tt, P: v("co2-triple-pressure") };
  const critical = { T: Tc, P: v("co2-critical-pressure") };
  const vapour = (T: number) => Math.min(M, co2LiquidPressure(T, triple, critical) * perPa);
  const a: [number, number, number] = [
    v("co2-sublimation-a1"),
    v("co2-sublimation-a2"),
    v("co2-sublimation-a3"),
  ];
  const frost = (T: number) => co2SublimationPressure(T, triple, a) * perPa;

  const points: PathPoint[] = [{ H: 0, T: T0, m: M, stage: "gas" }];
  const last = () => points[points.length - 1] as PathPoint;
  const add = (dH: number, T: number, m: number, stage: Stage) =>
    points.push({ H: last().H + dH, T, m, stage });
  const steps = 1000;

  add(C * (T0 - Tc), Tc, M, "gas");
  const sensibleEnd = last().H;
  // Condensing. What reaches the critical point above the vapour curve rains out at once.
  add(Lv * (M - vapour(Tc)), Tc, vapour(Tc), "condensing");
  const mt = triple.P * perPa;
  for (let i = 1; i <= steps; i++) {
    const T = Tc - ((Tc - Tt) * i) / steps;
    const m = i === steps ? mt : vapour(T);
    add(C * ((Tc - Tt) / steps) + Lv * (last().m - m), T, m, "condensing");
  }
  const tripleReached = last().H;
  // Freezing: the air holds at the triple point while the seas give up their heat of fusion.
  add(Lf * (M - mt), Tt, mt, "freezing");
  const frozen = last().H;
  // Depositing: the CO₂ still in the air freezes out as frost while the air cools to 195 K.
  for (let i = 1; i <= steps; i++) {
    const T = Tt - ((Tt - Tf) * i) / steps;
    const m = i === steps ? v("frost-residual-co2") : frost(T);
    add(C * ((Tt - Tf) / steps) + L * (last().m - m), T, m, "depositing");
  }
  const total = last().H;

  /** The air's state once H joules have left it along the path. */
  const at = (H: number): PathPoint => {
    if (H <= 0) return { H, T: T0 - H / C, m: M, stage: "gas" };
    if (H >= total) return { ...last(), H };
    let lo = 0;
    let hi = points.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if ((points[mid] as PathPoint).H <= H) lo = mid;
      else hi = mid;
    }
    const p = points[lo] as PathPoint;
    const q = points[hi] as PathPoint;
    const f = (H - p.H) / (q.H - p.H);
    return { H, T: p.T + f * (q.T - p.T), m: p.m + f * (q.m - p.m), stage: q.stage };
  };
  return { sensibleEnd, tripleReached, frozen, total, at };
}

/**
 * Run the plan day by day. Each day the Lattice beams its light: Ceres's receivers take the
 * Railheads' share, receivers at Venus take the Forges' and the fans', and the rest pumps the
 * Exhaust's tiles. Every Brick that arrives brings its entry heat into the air, and its water then
 * gives up heat as it cools, condenses and freezes; all of it is the pumps' to lift.
 */
export function simulate(v: (id: string) => number): {
  days: TrajectoryDay[];
  events: Record<string, number>;
  /** Days the chimneys' capacity, not the power, set how fast the air cooled. */
  chimneyDays: number;
  /** The most the air warmed back while the pumps cooled it, and the day it was warmest again. */
  rewarm: { kelvin: number; day: number };
  /** The last day the air fell below the critical point, after any heat that lifted it back above. */
  rerain: number;
} {
  const Tf = v("freeze-target-temp");
  // The pumps are charged as if they rejected at the temperature the tiles' light counts as.
  const Th = v("exhaust-light-temp");
  // Real pumps need more than the reversible work: every work below is divided by this share.
  const eta = v("exhaust-carnot-share");
  const Tfrost = v("frost-tower-temp");
  const L = v("co2-deposition-heat");
  const path = coolingPath(v);
  const area = v("venus-area");
  const g = v("venus-gravity");
  const pN2 = v("n2-pressure");
  const pCO2start = v("venus-column-pressure") - pN2;
  const receiver = v("helios-receiver-efficiency");
  // Only the canopies on the side the Lattice sees are lit, so only their chimneys carry heat.
  const chimneys = v("chimney-capacity-lit");

  // The full Foundry builds the Lattice after it stops growing, so its power climbs from nothing
  // at full scale to full power as the petals come off the line. The first demonstration petals
  // (2030) are too few to count.
  const ramp0 = v("foundry-full-scale");
  const ramp1 = v("helios-full-power");
  const lattice = (d: number) =>
    v("helios-power") * Math.min(1, Math.max(0, (d - ramp0) / Math.max(1, ramp1 - ramp0)));

  // Water. A Brick warms to the air's temperature as it falls; above freezing its water joins the
  // air's, and the air holds as vapour what its temperature allows. The rest is liquid until the
  // air cools through freezing, and then ice, which melts again once the caps are sealed.
  const Tmelt = 273.15;
  const Lv = v("water-vaporization-heat");
  const Lm = v("ice-melt-heat");
  const cw = v("water-cp");
  const ci = v("ice-cp");
  const Tb = v("brick-temp");
  const entry = v("ice-entry-energy-per-kg");
  // Saturation pressure from the Clausius–Clapeyron relation, anchored at the boiling point.
  const lift = (Lv * v("h2o-molar-mass")) / v("gas-constant");
  const saturation = (T: number) =>
    v("earth-sea-level-pressure") * Math.exp(lift * (1 / v("water-boiling-temp") - 1 / T));
  // Vapour mass the air holds at T: its mole fraction times the total pressure reaches saturation.
  const holds = (T: number, pCO2: number, pO2: number) => {
    const dry = pCO2 + pN2 + pO2;
    const moles =
      (area / g) *
      (pCO2 / v("co2-molar-mass") + pN2 / v("n2-molar-mass") + pO2 / v("o2-molar-mass"));
    const p = saturation(T);
    const a = (v("h2o-molar-mass") * g) / area;
    const n = (-(dry - p) + Math.sqrt((dry - p) ** 2 + 4 * a * p * moles)) / (2 * a);
    return n * v("h2o-molar-mass");
  };
  let vapour = 0;
  let liquid = 0;
  let iceCold = 0; // water frozen while the air was below freezing, still to melt (kg)
  let pending = 0; // heat the water gave up yesterday, entering the air today (J)

  const start = v("cooling-start");
  const deadline = v("deadline");
  const stop = deadline + 3 * 365;
  const events: Record<string, number> = {};
  const mark = (k: string, d: number) => {
    if (events[k] === undefined) events[k] = d;
  };

  // Heat removed from the air along the cooling path (J). Negative while more heat enters than the
  // first, weak pumps lift: the air then warms a little above its starting temperature.
  let H = 0;
  let residual = 0; // CO₂ still airborne after the air reaches 195 K (kg)
  let temp = v("venus-surface-temp");
  let pCO2 = pCO2start;
  let phase: TrajectoryDay["phase"] = "cooling";
  let chimneyDays = 0; // days the chimneys, not the power, limit the cooling
  // The most the air warms back while the pumps cool it, when heat arrives faster than they lift it.
  let coldest = Number.POSITIVE_INFINITY;
  const rewarm = { kelvin: 0, day: start };
  let rerain = Number.NaN; // the day the air is back below the critical point, if heat lifted it above
  // Arrivals ramp up and down as Bricks on fast and slow transfers reach Venus. When the Lattice
  // cannot feed the Railheads in full, fewer Bricks fly, and arrivals shrink by the share of
  // launches made so far (a simplification: a Brick arriving today left months ago).
  const arrivedBy = iceArrivals(v).share;
  const ceres = v("ceres-receiver-incident");
  let thrownSum = 0;
  let launchDays = 0;
  const forgeDays = v("forge-end") - v("forge-start");
  let o2Done = 0; // share of the oxygen the Forges have made
  let forgeShare = 0; // share of their full power the Forges drew yesterday
  const days: TrajectoryDay[] = [];
  const pressureOf = (pCO2: number, o2: number, T: number, cooling: boolean) => {
    const wet = cooling ? (vapour * g) / area : T >= Tmelt ? v("final-water-vapour") : 0;
    return pN2 + o2 + pCO2 + wet;
  };

  for (let d = start; d <= stop; d += 1) {
    // The pumps stop on the first day after the last caps are sealed, when the Veil opens.
    if (phase === "holding" && d >= v("sealing-end")) {
      phase = "warming";
      mark("warming", d);
    }
    // Light for Venus. The Lattice beams Ceres the Railheads' share first; when it has less, the
    // launches slow to what it gives, and fewer Bricks arrive. The Forges take theirs next, and
    // slow down when it runs short, then the fans.
    const beam = lattice(d);
    const launching = d >= v("ice-launch-start") && d < v("ice-launch-end");
    const thrown = launching ? Math.min(1, beam / ceres) : 0;
    if (launching) {
      thrownSum += thrown;
      launchDays++;
    }
    const flown = launchDays > 0 ? thrownSum / launchDays : 1;
    const arriving = (arrivedBy(d + 1) - arrivedBy(d)) * flown * v("ice-mass");
    let light = beam - thrown * ceres;
    // Oxygen made by the start of today: yesterday's forging, for the part of it after the Forges
    // start. Today's draw, if the day reaches past their start, makes tomorrow's.
    o2Done = Math.min(
      1,
      o2Done + (Math.min(1, Math.max(0, d - v("forge-start"))) * forgeShare) / forgeDays,
    );
    const o2 = v("o2-target-pressure") * o2Done;
    const forging = d + 1 > v("forge-start") && o2Done < 1;
    const forgeDraw = forging ? Math.min(Math.max(0, light) * receiver, v("forge-power")) : 0;
    forgeShare = forgeDraw / v("forge-power");
    light -= forgeDraw / receiver;
    // The chimney fans run while the pumps do.
    const fanDraw =
      phase === "cooling" ? Math.min(Math.max(0, light) * receiver, v("chimney-fan-power")) : 0;
    light -= fanDraw / receiver;
    light = Math.max(0, light);

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
      forgeDraw * (1 - v("forge-efficiency")) +
      // The fans' work ends as heat in the gas they push, which the pumps must then lift.
      fanDraw +
      // The receivers at Venus shed their loss into the air.
      (forgeDraw + fanDraw) * (1 / receiver - 1) +
      pending / DAY_S +
      (phase === "warming" || phase === "earth-like"
        ? 0
        : (1 - v("veil-block-fraction")) * v("venus-absorbed"));
    pending = 0;
    // Each arriving Brick stops in the air: its entry heat, less what its ice takes to reach the
    // air's temperature.
    if (arriving > 0) {
      if (temp >= Tmelt) {
        heatIn += (arriving * (entry - ci * (Tmelt - Tb) - Lm - cw * (temp - Tmelt))) / DAY_S;
        liquid += arriving;
      } else {
        heatIn += (arriving * (entry - ci * Math.max(0, temp - Tb))) / DAY_S;
        iceCold += arriving;
      }
    }

    let heatOut = 0;
    let pumpPower = 0;
    let warmPower = 0;
    const before = temp;

    if (phase === "cooling" || phase === "scavenging" || phase === "holding") {
      // The cold side is the air (or the Frost Towers once only the last CO₂ is left).
      // While the air cools as a gas, or frost forms from it, the pumps see it through the chimneys'
      // exchangers, colder than the air itself; condensing and freezing CO₂ gives up its heat at the
      // air's own temperature.
      const stage = path.at(H).stage;
      const latent = stage === "condensing" || stage === "freezing";
      const cold = phase === "cooling" ? (latent ? temp : temp * v("chimney-cold-factor")) : Tf;
      // The lit tiles shine the heat lifted plus the light that lifts it, never more than their peak.
      const maxWork = (v("exhaust-peak") * (Th - cold)) / (Th - cold + eta * cold);
      // Every watt the pumps lift has to come up the lit canopies' chimneys first.
      const chimneyWork = (chimneys * (Th - cold)) / (eta * cold);
      const work = Math.min(light, maxWork, chimneyWork);
      if (chimneyWork < Math.min(light, maxWork)) chimneyDays++;
      const capacity = (eta * work * cold) / (Th - cold);
      if (phase === "cooling") {
        // Never past the end of the path: on the last day the pumps lift only what is left.
        // Pumps only take heat out; on a day the water takes more heat than enters, they idle.
        heatOut = Math.max(0, Math.min(capacity, heatIn + (path.total - H) / DAY_S));
        pumpPower = capacity > 0 ? (work * heatOut) / capacity : 0;
        H += (heatOut - heatIn) * DAY_S;
      } else {
        // Hold the air at 195 K first; whatever is left traps CO₂ at the Frost Towers, never more
        // than is left to trap.
        const holdWork = (heatIn * (Th - Tf)) / (eta * Tf);
        const perKg = (L * (Th / Tfrost - 1)) / eta;
        const trapped =
          phase === "scavenging"
            ? Math.min(
                residual - v("frost-residual-target"),
                (Math.max(0, work - holdWork) / perKg) * DAY_S,
              )
            : 0;
        residual -= trapped;
        heatOut = heatIn + (trapped * L) / DAY_S;
        pumpPower = holdWork + (trapped * perKg) / DAY_S;
      }
      const here = path.at(H);
      temp = here.T;
      if (phase === "cooling") {
        coldest = Math.min(coldest, before);
        if (temp - coldest > rewarm.kelvin) [rewarm.kelvin, rewarm.day] = [temp - coldest, d];
      }

      if (temp <= v("co2-critical-temp")) mark("clear-rain", d);
      if (events["clear-rain"] !== undefined && temp > v("co2-critical-temp")) rerain = Number.NaN;
      else if (events["clear-rain"] !== undefined && Number.isNaN(rerain)) rerain = d;
      if (H >= path.tripleReached) mark("freeze", d);
      if (H >= path.frozen) mark("frozen", d);
      if (H >= path.total && phase === "cooling") {
        mark("cold", d);
        phase = "scavenging";
        residual = v("frost-residual-co2");
      }
      if (phase === "scavenging" && residual <= v("frost-residual-target")) {
        mark("scavenged", d);
        phase = "holding";
      }
      if (phase !== "cooling") pCO2 = (residual * g) / area;
      else if (H < path.sensibleEnd) pCO2 = pCO2start;
      else pCO2 = (here.m * g) / area;

      // The water follows the air. Its heat enters the air tomorrow, for the pumps to lift.
      if (temp >= Tmelt) {
        pending += (vapour + liquid) * cw * (before - temp);
        const wet = vapour + liquid;
        const held = Math.min(wet, holds(temp, pCO2, o2));
        pending += (vapour - held) * Lv;
        if (held < vapour) mark("water-rain", d);
        vapour = held;
        liquid = wet - held;
      } else {
        if (vapour + liquid > 0) {
          // The air has cooled through freezing: what water is left freezes, giving up its heat.
          pending += (vapour + liquid) * cw * Math.max(0, before - Tmelt);
          pending += vapour * (Lv + Lm) + liquid * Lm;
          iceCold += vapour + liquid;
          vapour = 0;
          liquid = 0;
          mark("water-frozen", d);
        }
        pending += iceCold * ci * (Math.min(before, Tmelt) - temp);
      }
    } else {
      // Warming: the beamed light becomes heat, the Veil lets in Earth-strength light, and the
      // ice frozen while the air was cold melts first.
      const sun = v("veil-day-transmission") * v("venus-intercepted") * (1 - v("final-albedo"));
      const melt = ci * (Tmelt - Tf) + Lm + cw * (v("earth-surface-temp") - Tmelt);
      const airC = (v("venus-n2-mass") + v("o2-mass")) * v("air-cp");
      const need = iceCold * melt + Math.max(0, v("earth-surface-temp") - temp) * airC;
      const free = (sun + heatIn) * DAY_S;
      const bought = Math.min(light * DAY_S, Math.max(0, need - free));
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

    const cooling = phase === "cooling" || phase === "scavenging" || phase === "holding";
    const pressure = pressureOf(pCO2, o2, temp, cooling);
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
      fanPower: fanDraw / receiver,
      phase,
    });
    if (phase === "earth-like" && d > deadline) break;
  }
  for (const k of [
    "clear-rain",
    "freeze",
    "frozen",
    "cold",
    "scavenged",
    "warming",
    "warm",
    "earth-like",
    "water-rain",
    "water-frozen",
  ])
    mark(k, stop);
  return { days, events, chimneyDays, rewarm, rerain };
}

export function trajectory(r: Registry) {
  const { v } = r.in("model/trajectory.ts");
  // The simulation runs once. Every quantity that uses it replays the inputs it read, so each one,
  // not just the first, lists them in the ledger.
  let sim: ReturnType<typeof simulate> | undefined;
  const simReads = new Set<string>();
  const run = () => {
    if (sim) {
      for (const id of simReads) v(id);
      return sim;
    }
    sim = simulate((id) => {
      simReads.add(id);
      return v(id);
    });
    return sim;
  };

  const labels: Record<string, string> = {
    "clear-rain": "The Clear Rain begins: near-surface air below 304 K",
    freeze: "CO₂ seas start to freeze: air at the triple point, 216.6 K",
    frozen: "The CO₂ seas are frozen through",
    cold: "All the CO₂ is down: air at 195 K",
    scavenged: "Frost Towers bring CO₂ down to the target",
    warming: "Caps sealed; the Veil opens and the air warms",
    warm: "Air reaches 285 K",
    "earth-like": "Earth-like: warm, 0.25 bar of oxygen, CO₂ under 600 ppm",
    "water-rain": "The air cools to its dew point and the water rains out",
    "water-frozen": "The air cools through freezing and the new water freezes",
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
      () => run().events[k] as number,
    );
  }
  // Over the whole run, not to the deadline: work a late variant still needs is still demand, and
  // the heat books only balance when every day the pumps run is counted.
  const total = (pick: (t: TrajectoryDay) => number) =>
    run().days.reduce((sum, t) => sum + pick(t) * DAY_S, 0);
  const pumping = (t: TrajectoryDay) => t.phase !== "warming" && t.phase !== "earth-like";
  r.q(
    "traj-pump-energy",
    {
      label: "Heat-pump work to cool Venus, day by day, Frost Towers included",
      unit: "J",
      formula: "Σ pump power × 1 day",
      basis: "physics",
      note: "More than the work for the air alone, because the pumps also carry away heat from the crust, the Forges, the receivers, the falling ice and its water, and the sunlight the closed Veil lets through.",
    },
    () => total((t) => t.pumpPower),
  );
  r.q(
    "traj-heat-added",
    {
      label: "Heat that enters the air from other sources while the pumps run",
      unit: "J",
      formula:
        "Σ (crust + Forges + receivers + chimney fans + Bricks and their water + residual sunlight) × 1 day, until the caps are sealed",
      basis: "physics",
      note: "Heat that enters after the pumps stop warms the air instead of being lifted out.",
    },
    () => total((t) => (pumping(t) ? t.heatIn : 0)),
  );
  r.q(
    "traj-rewarm",
    {
      label: "Most the air warms back while the pumps cool it",
      unit: "K",
      sig: 2,
      formula: "max over the cooling of (T − the coldest T so far)",
      basis: "physics",
      note: "When the Bricks bring heat faster than the lit canopies' chimneys can carry it out, the air warms and some of the CO₂ that had rained out boils back, until the pumps catch up.",
    },
    () => run().rewarm.kelvin,
  );
  r.q(
    "traj-rewarm-peak",
    {
      label: "The air is warmest again after the Bricks' heat arrives",
      unit: "date",
      formula: "day-by-day simulation (model/trajectory.ts)",
      basis: "physics",
    },
    () => run().rewarm.day,
  );
  r.q(
    "traj-rerain",
    {
      label: "The Clear Rain begins for good, after any heat that lifts the air back above 304 K",
      unit: "date",
      formula: "day-by-day simulation (model/trajectory.ts)",
      basis: "physics",
      note: "The same day as the first Clear Rain when nothing warms the air back above the critical point.",
    },
    () => run().rerain,
  );
  r.q(
    "traj-heat-lifted",
    {
      label: "Heat the Exhaust lifts out of the air, day by day, Frost Towers included",
      unit: "J",
      formula: "Σ heat leaving the air × 1 day",
      basis: "physics",
      note: "Venus's own heat, less the latent heat of the CO₂ the Frost Towers leave airborne, plus the heat that enters the air while the pumps run.",
    },
    () => total((t) => t.heatOut),
  );
  r.q(
    "traj-heat-left-airborne",
    {
      label: "Latent heat of the CO₂ left in the air, never frozen out",
      unit: "J",
      formula: "M_residual L_deposition",
      basis: "physics",
    },
    () => v("frost-residual-target") * v("co2-deposition-heat"),
  );
  r.c(
    "forges-on-seas",
    { label: "The Forges start once the liquid CO₂ seas are there for good", kind: "schedule" },
    () => ({
      pass: v("forge-start") >= v("traj-rerain"),
      detail: `The Forges float on the seas from ${fmt(r, "forge-start")}; the Clear Rain begins for good on ${fmt(r, "traj-rerain")}.`,
    }),
  );
  r.c(
    "traj-heat-books",
    {
      label: "The simulation's heat books balance: it lifts every joule it counts in",
      kind: "conservation",
    },
    () => {
      const lifted = v("traj-heat-lifted");
      const owed = v("atmosphere-heat") - v("traj-heat-left-airborne") + v("traj-heat-added");
      const pass = Math.abs(lifted - owed) < 1e-9 * lifted;
      return {
        pass,
        detail: `The Exhaust lifts ${fmt(r, "traj-heat-lifted")}: Venus's ${fmt(r, "atmosphere-heat")}, less the ${fmt(r, "traj-heat-left-airborne")} still held by the CO₂ the Frost Towers leave in the air, plus ${fmt(r, "traj-heat-added")} that enters while the pumps run. ${pass ? "The two sides agree to rounding." : `The two sides differ by ${formatQuantity({ value: lifted - owed, unit: "J" })}.`} This confirms the simulation's own bookkeeping; a heat source the simulation leaves out cannot show here.`,
      };
    },
  );
  r.q(
    "traj-exhaust-light",
    {
      label: "Light the Exhaust throws into space: the heat it lifts plus the work that lifts it",
      unit: "J",
      formula: "Σ (heat out + pump work) × 1 day",
      basis: "physics",
    },
    () => total((t) => t.heatOut + t.pumpPower),
  );
  r.q(
    "traj-fan-energy",
    {
      label: "Light the chimney fans' receivers take while the pumps run",
      unit: "J",
      formula: "Σ fan power × 1 day",
      basis: "invented",
    },
    () => total((t) => t.fanPower),
  );
  r.q(
    "traj-warm-energy",
    {
      label: "Beamed light spent warming the air and melting the ice after sealing",
      unit: "J",
      formula: "Σ warming power × 1 day",
      basis: "physics",
    },
    () => total((t) => t.warmPower),
  );
  r.q(
    "traj-chimney-days",
    {
      label: "Days the chimneys, not the power, limit how fast the air cools",
      unit: "d",
      sig: 2,
      formula: "days the simulation caps heat removal at the chimneys' capacity",
      basis: "physics",
    },
    () => run().chimneyDays,
  );
  r.q(
    "traj-heat-peak",
    {
      label: "Fastest heat removal in the simulation",
      unit: "W",
      formula: "max over days of heat leaving the air",
      basis: "physics",
    },
    () => Math.max(...run().days.map((t) => t.heatOut)),
  );
  r.q(
    "sealing-window",
    {
      label: "Time to lay the caps, from the seas frozen through to the last cap sealed",
      unit: "d",
      sig: 2,
      formula: "last caps sealed − seas frozen through",
      basis: "design",
      note: "Dry ice is denser than liquid CO₂, so crystals that form at a sea's surface sink and it fills with ice from the bottom up. There is no firm surface to lay a cap on until the sea is frozen through.",
    },
    () => v("sealing-end") - v("traj-frozen"),
  );
  r.q(
    "cap-laying-rate",
    {
      label: "Area of cap the crawler-rafts must lay each day to finish in the sealing window",
      unit: "m2/s",
      show: "km2/d",
      sig: 2,
      formula: "A_cryo / sealing window",
      basis: "invented",
      note: "Over a window shorter than a day, read it as a day: the window's own check fails first.",
    },
    () => v("cryo-footprint") / (Math.max(1, v("sealing-window")) * DAY_S),
  );
  r.c(
    "frozen-before-sealing",
    { label: "The seas are frozen through before the last caps are sealed", kind: "schedule" },
    () => ({
      pass: v("sealing-window") > 0,
      detail: `The simulated seas are frozen through on ${fmt(r, "traj-frozen", { date: "day" })}, leaving ${fmt(r, "sealing-window")} to the last cap on ${fmt(r, "sealing-end", { date: "day" })}: the crawler-rafts must lay ${fmt(r, "cap-laying-rate")}.`,
    }),
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
    () => v("deadline") - (run().events["earth-like"] as number),
  );
  const weekly = (pick: (t: TrajectoryDay) => number): Point[] => {
    const out: Point[] = [];
    const days = run().days;
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
  r.s("traj-pump-power", { label: "Light pumping the Exhaust", x: "date", y: "W" }, () =>
    weekly((t) => t.pumpPower),
  );
  r.s("traj-heat-out", { label: "Heat leaving the air", x: "date", y: "W" }, () =>
    weekly((t) => t.heatOut),
  );

  const day = (id: string) => formatQuantity({ ...r.get(id), value: v(id) }, { date: "day" });
  r.q(
    "genesis-ph-clear",
    {
      label: "The new seas have held their pH for the release gate",
      unit: "date",
      formula: "ice melts (caps sealed, Veil open) + days the pH must hold",
      basis: "design",
    },
    () => v("traj-warming") + v("genesis-ph-days"),
  );
  r.c(
    "frost-before-sealing",
    {
      label: "The Frost Towers finish before the last caps are sealed",
      kind: "schedule",
    },
    () => ({
      pass: v("traj-scavenged") <= v("sealing-end"),
      detail: `The simulated Frost Towers finish on ${day("traj-scavenged")}; the last caps are sealed on ${day("sealing-end")}.`,
    }),
  );
  r.q(
    "genesis-start",
    {
      label: "Genesis seeding begins: the later of the oxygen and the ocean pH gate",
      unit: "date",
      formula: "max(Forges finish, pH held)",
      basis: "design",
    },
    () => Math.max(v("forge-end"), v("genesis-ph-clear")),
  );
  r.q(
    "genesis-green-days",
    {
      label: "Time for seeded cyanobacteria to grow to bloom density",
      unit: "d",
      sig: 2,
      formula: "t_double log₂(n_bloom / n_seed)",
      basis: "invented",
    },
    () =>
      v("genesis-doubling-days") *
      Math.log2(v("genesis-bloom-density") / v("genesis-seed-density")),
  );
  r.q(
    "genesis-end",
    {
      label: "The sunlit seas are green with seeded cyanobacteria",
      unit: "date",
      formula: "seeding begins + growth to bloom density",
      basis: "invented",
    },
    () => v("genesis-start") + v("genesis-green-days"),
  );
  r.q(
    "genesis-air-temp",
    {
      label: "Mean air temperature, in the simulation, on the day seeding begins",
      unit: "K",
      sig: 3,
      formula: "simulated T on the seeding day (its last day, if it stops sooner)",
      basis: "physics",
      note: "The simulation stops once the air is Earth-like and the deadline has passed, so a later seeding day reads the settled air.",
    },
    () => {
      const start = v("genesis-start");
      const { days } = sim ?? run();
      let temp = Number.NaN;
      for (const t of days) if (t.day <= start || Number.isNaN(temp)) temp = t.temp;
      return temp;
    },
  );
  r.c(
    "genesis-by-deadline",
    {
      label: "Seeded life greens the seas by the deadline",
      kind: "schedule",
    },
    () => ({
      pass: v("genesis-end") <= v("deadline"),
      detail: `Seeding waits for the oxygen (${day("forge-end")}) and for the seas to hold their pH (${day("genesis-ph-clear")}), so it begins on ${day("genesis-start")}; doubling every ${formatQuantity({ ...r.get("genesis-doubling-days"), value: v("genesis-doubling-days") })}, the cells reach bloom density on ${day("genesis-end")}, against a deadline of ${day("deadline")}.`,
    }),
  );
  r.c(
    "earth-like-by-deadline",
    { label: "The simulated atmosphere is Earth-like by the deadline", kind: "schedule" },
    () => {
      const d = run().events["earth-like"] as number;
      const slack = v("traj-slack-days");
      const gap = formatQuantity({ ...r.get("traj-slack-days"), value: Math.abs(slack) });
      return {
        pass: d <= v("deadline"),
        detail: `The day-by-day simulation reaches Earth-like conditions on ${fmt(r, "traj-earth-like", { date: "day" })}, ${gap} ${slack >= 0 ? "before" : "after"} the ${fmt(r, "deadline", { date: "day" })} deadline. The chimneys, not the power, set the pace on ${fmt(r, "traj-chimney-days")} of it.`,
      };
    },
  );
}
