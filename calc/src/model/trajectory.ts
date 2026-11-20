/**
 * The atmosphere's path from 2033 to 2036, simulated day by day from the power the plan has.
 *
 * Each day the Lattice and the Ring supply electricity; the Railheads and Forges take their share;
 * the rest drives the Photonic Exhaust, which lifts heat out of the air at the air's own temperature
 * and rejects it at an effective 2,000 K, never more than the installed emitters can shine. The heat
 * removed moves the air down the cooling path (coolingPath: sensible cooling to 304 K, the CO₂
 * condensing along its vapour curve to the triple point, the seas freezing at 216.6 K, the last
 * vapour freezing out as frost down to 195 K). Frost Towers then trap the last CO₂, the Forges add
 * oxygen, and once the caps are sealed the beamed power and the opened Veil warm the air and melt the
 * ice to Earth-like. Heat lifted while the pumps run balances the cooling path, the Frost Towers'
 * share and the heat that enters meanwhile, to rounding.
 *
 * Simplifications, all named: the whole atmosphere shares one temperature; its heat capacity and
 * the CO₂'s deposition heat are averages over the path; the Lattice's power grows with the Foundry's
 * mass; receiver loss heat is radiated straight to space by hot receivers above the air.
 */
import { formatQuantity } from "../format.ts";
import { co2LiquidPressure, co2SublimationPressure, conductedFlux } from "../physics.ts";
import type { Point, Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";
import { fmt } from "./text.ts";

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
  /** Electrical power the chimney fans draw (W). */
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

export function simulate(v: (id: string) => number): {
  days: TrajectoryDay[];
  events: Record<string, number>;
  /** Days the chimneys' capacity, not the power, set how fast the air cooled. */
  chimneyDays: number;
} {
  const Tf = v("freeze-target-temp");
  const Th = v("exhaust-effective-temp");
  const Tfrost = v("frost-tower-temp");
  const L = v("co2-deposition-heat");
  const path = coolingPath(v);
  const area = v("venus-area");
  const g = v("venus-gravity");
  const pN2 = v("n2-pressure");
  const pCO2start = v("venus-column-pressure") - pN2;

  // The full Foundry builds the Lattice after it stops growing, so its power climbs from nothing
  // at full scale to full power as the petals come off the line. The first demonstration petals
  // (2030) are too few to count.
  const ramp0 = v("cooling-start");
  const ramp1 = v("helios-full-power");
  const lattice = (d: number) =>
    v("helios-power") * Math.min(1, Math.max(0, (d - ramp0) / Math.max(1, ramp1 - ramp0)));

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
  let iceCold = 0; // ice lowered while the air was below freezing, still to melt (kg)
  let phase: TrajectoryDay["phase"] = "cooling";
  let chimneyDays = 0; // days the chimneys, not the power, limit the cooling
  const days: TrajectoryDay[] = [];
  const pressureOf = (pCO2: number, o2: number, T: number) => {
    const water = T >= 273.15 ? v("final-water-vapour") : 0;
    return pN2 + o2 + pCO2 + water;
  };

  for (let d = start; d <= stop; d += 1) {
    // The pumps stop on the first day after the last caps are sealed, when the Veil opens.
    if (phase === "holding" && d >= v("sealing-end")) {
      phase = "warming";
      mark("warming", d);
    }
    // Power for Venus: the Lattice, less what the Railheads take before the Ring can pay them,
    // plus the Ring's surplus, less the Forges.
    let power = lattice(d);
    const launching = d >= v("ice-launch-start") && d < v("ice-launch-end");
    const catching = d >= v("first-catch") && d < v("last-arrival");
    if (launching && !catching) power -= Math.min(power, v("railhead-power"));
    if (catching) power += v("ring-power") - (launching ? v("railhead-power") : 0);
    const forging = d >= v("forge-start") && d < v("forge-end");
    if (forging) power -= Math.min(power, v("forge-power"));
    // The chimney fans run while the pumps do.
    const fanPower = phase === "cooling" ? Math.min(power, v("chimney-fan-power")) : 0;
    power -= fanPower;
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
      // While the air cools as a gas, or frost forms from it, the pumps see it through the chimneys'
      // exchangers, colder than the air itself; condensing and freezing CO₂ gives up its heat at the
      // air's own temperature.
      const stage = path.at(H).stage;
      const latent = stage === "condensing" || stage === "freezing";
      const cold = phase === "cooling" ? (latent ? temp : temp * v("chimney-cold-factor")) : Tf;
      const maxWork = v("exhaust-peak") * (1 - cold / Th);
      // Every watt the pumps lift has to come up the chimneys first.
      const chimneyWork = (v("chimney-capacity") * (Th - cold)) / cold;
      const work = Math.min(power, maxWork, chimneyWork);
      if (chimneyWork < Math.min(power, maxWork)) chimneyDays++;
      const capacity = (work * cold) / (Th - cold);
      if (phase === "cooling") {
        // Never past the end of the path: on the last day the pumps lift only what is left.
        heatOut = Math.min(capacity, heatIn + (path.total - H) / DAY_S);
        pumpPower = capacity > 0 ? (work * heatOut) / capacity : 0;
        H += (heatOut - heatIn) * DAY_S;
      } else {
        // Hold the air at 195 K first; whatever is left traps CO₂ at the Frost Towers, never more
        // than is left to trap.
        const holdWork = heatIn * ((Th - Tf) / Tf);
        const perKg = L * (Th / Tfrost - 1);
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

      if (temp <= v("co2-critical-temp")) mark("clear-rain", d);
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
      fanPower,
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
  ])
    mark(k, stop);
  return { days, events, chimneyDays };
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
  const total = (pick: (t: TrajectoryDay) => number) =>
    run().days.reduce((sum, t) => (t.day <= v("deadline") ? sum + pick(t) * DAY_S : sum), 0);
  const pumping = (t: TrajectoryDay) => t.phase !== "warming" && t.phase !== "earth-like";
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
      label: "Heat that enters the air from other sources while the pumps run",
      unit: "J",
      formula:
        "Σ (crust + Forges + falling ice + residual sunlight) × 1 day, until the caps are sealed",
      basis: "physics",
      note: "Heat that enters after the pumps stop warms the air instead of being lifted out.",
    },
    () => total((t) => (pumping(t) ? t.heatIn : 0)),
  );
  r.q(
    "traj-heat-lifted",
    {
      label: "Heat the Exhaust lifts out of the air, day by day, Frost Towers included",
      unit: "J",
      formula: "Σ heat leaving the air × 1 day, to the deadline",
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
    "traj-heat-books",
    { label: "The simulation's heat books balance", kind: "conservation" },
    () => {
      const lifted = v("traj-heat-lifted");
      const owed = v("atmosphere-heat") - v("traj-heat-left-airborne") + v("traj-heat-added");
      const pass = Math.abs(lifted - owed) < 1e-9 * lifted;
      return {
        pass,
        detail: `The Exhaust lifts ${fmt(r, "traj-heat-lifted")}: Venus's ${fmt(r, "atmosphere-heat")}, less the ${fmt(r, "traj-heat-left-airborne")} still held by the CO₂ the Frost Towers leave in the air, plus ${fmt(r, "traj-heat-added")} that enters while the pumps run. ${pass ? "The two sides agree to rounding." : `The two sides differ by ${formatQuantity({ value: lifted - owed, unit: "J" })}.`}`,
      };
    },
  );
  r.q(
    "traj-exhaust-light",
    {
      label: "Light the Exhaust throws into space: the heat it lifts plus the work that lifts it",
      unit: "J",
      formula: "Σ (heat out + pump work) × 1 day, to the deadline",
      basis: "physics",
    },
    () => total((t) => t.heatOut + t.pumpPower),
  );
  r.q(
    "traj-fan-energy",
    {
      label: "Energy the chimney fans use while the pumps run",
      unit: "J",
      formula: "Σ fan power × 1 day",
      basis: "invented",
    },
    () => total((t) => t.fanPower),
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
  r.s("traj-pump-power", { label: "Electrical power driving the Exhaust", x: "date", y: "W" }, () =>
    weekly((t) => t.pumpPower),
  );
  r.s("traj-heat-out", { label: "Heat leaving the air", x: "date", y: "W" }, () =>
    weekly((t) => t.heatOut),
  );

  const day = (id: string) => formatQuantity({ ...r.get(id), value: v(id) }, { date: "day" });
  r.q(
    "genesis-ph-clear",
    {
      label: "The new oceans have held their pH for the release gate",
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
      issue: "freeze-outlasts-sealing",
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
      label: "The sunlit oceans are green with seeded cyanobacteria",
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
      label: "Seeded life greens the oceans by the deadline",
      kind: "schedule",
      issue: "freeze-outlasts-sealing",
    },
    () => ({
      pass: v("genesis-end") <= v("deadline"),
      detail: `Seeding waits for the oxygen (${day("forge-end")}) and for the oceans to hold their pH (${day("genesis-ph-clear")}), so it begins on ${day("genesis-start")}; doubling every ${formatQuantity({ ...r.get("genesis-doubling-days"), value: v("genesis-doubling-days") })}, the cells reach bloom density on ${day("genesis-end")}, against a deadline of ${day("deadline")}.`,
    }),
  );
  r.c(
    "earth-like-by-deadline",
    { label: "The simulated atmosphere is Earth-like by the deadline", kind: "schedule" },
    () => {
      const d = run().events["earth-like"] as number;
      return {
        pass: d <= v("deadline"),
        detail: `The day-by-day simulation reaches Earth-like conditions on ${fmt(r, "traj-earth-like", { date: "day" })}, ${fmt(r, "traj-slack-days")} before the ${fmt(r, "deadline", { date: "day" })} deadline. The chimneys, not the power, set the pace on ${fmt(r, "traj-chimney-days")}.`,
      };
    },
  );
}
