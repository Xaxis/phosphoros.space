/**
 * Ceres Ice Train: coilguns on Ceres throw water ice onto transfer orbits to Venus.
 *
 * The Railheads fire steadily, so most Bricks leave between the cheap launch windows. Their
 * transfers come from a launch schedule (physics.ts, launchSchedule): Lambert transfers in three
 * dimensions between Ceres's orbit and Venus's, tilted to each other, booked so that no more than a
 * chosen multiple of the mean arrival rate reaches the Ring at once. The schedule is solved twice:
 * from Ceres's starting orbit, and from the wider orbit the recoil has pushed it to by the last
 * launch. Simplifications, each named where it is used: both orbits are circular (Ceres's own
 * eccentricity, 0.08, is left out, as everywhere in the model); the schedule is averaged over
 * Ceres's whole orbit rather than the part the campaign covers; and Ceres's drift is taken at the
 * campaign's two ends, with the average of the two standing for the whole.
 */
import { circularSpeed, hohmann, launchSchedule, period } from "../physics.ts";
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";
import { fmt } from "./text.ts";

const RADIAN = Math.PI / 180;

/**
 * Share of the ice the Ring has caught by day x, for launches running evenly from day `start` to
 * day `end`. `first` and `last` are the schedule's flight times in days, shortest first, from the
 * starting orbit and from the drifted one; the k-th transfer is taken to slow evenly from its first
 * value to its last as Ceres drifts, and to fire evenly through the campaign. (In fact each launch
 * phase fires for a 72nd of every cycle, which moves single arrivals by days, not the totals.)
 */
export function caughtShare(
  x: number,
  start: number,
  end: number,
  first: readonly number[],
  last: readonly number[],
): number {
  let sum = 0;
  for (let k = 0; k < first.length; k++) {
    const from = start + (first[k] as number);
    const to = end + (last[k] as number);
    sum += to > from ? Math.min(1, Math.max(0, (x - from) / (to - from))) : x >= to ? 1 : 0;
  }
  return sum / first.length;
}

export function iceTrain(r: Registry) {
  const { v } = r.in("model/ice.ts");
  const transfer = () => hohmann(v("sun-mu"), v("ceres-orbit"), v("venus-orbit"));
  // The site links each id to its first mention in this file, so the helpers that read ids defined
  // here (first, last, iceSchedule, iceCatch) are declared after the definitions.

  r.q(
    "ceres-gravity",
    {
      label: "Ceres surface gravity",
      unit: "m/s2",
      sig: 2,
      formula: "G M_C / R_C²",
      basis: "physics",
    },
    () => (v("grav-constant") * v("ceres-mass")) / v("ceres-radius") ** 2,
  );
  r.q(
    "ceres-escape",
    {
      label: "Ceres escape speed",
      unit: "m/s",
      sig: 3,
      formula: "√(2 G M_C / R_C)",
      basis: "physics",
    },
    () => Math.sqrt((2 * v("grav-constant") * v("ceres-mass")) / v("ceres-radius")),
  );
  r.q(
    "ice-departure-dv",
    {
      label: "Kick to drop from Ceres's orbit onto a transfer to Venus, in a window",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "v_Ceres − v_aphelion (Hohmann)",
      basis: "physics",
    },
    () => transfer().departDv,
  );
  r.q(
    "ice-launch-speed",
    {
      label: "Railhead muzzle speed in a window (the kick plus climbing out of Ceres)",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "√(Δv² + v_esc²)",
      basis: "physics",
    },
    () => Math.sqrt(v("ice-departure-dv") ** 2 + v("ceres-escape") ** 2),
  );
  r.q(
    "ice-vinf",
    {
      label: "Ice arrival speed relative to Venus, far out, on the Hohmann transfer",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "v_perihelion − v_V (Hohmann)",
      basis: "physics",
    },
    () => transfer().arriveVinf,
  );
  r.q(
    "ice-transfer-days",
    {
      label: "Transfer time from Ceres to Venus on the Hohmann transfer",
      unit: "d",
      show: "yr",
      sig: 3,
      formula: "π √(a_t³ / μ_☉)",
      basis: "physics",
    },
    () => transfer().time / DAY_S,
  );
  r.q(
    "ice-mutual-inclination",
    {
      label: "Tilt of Ceres's orbit to Venus's",
      unit: "deg",
      sig: 2,
      formula: "acos(cos i_V cos i_C + sin i_V sin i_C cos(Ω_C − Ω_V))",
      basis: "physics",
      note: "The angle between the two orbits' planes, from their tilts to the ecliptic and the directions of their ascending nodes.",
    },
    () => {
      const [iv, ic] = [v("venus-inclination") * RADIAN, v("ceres-inclination") * RADIAN];
      const nodes = (v("ceres-node") - v("venus-node")) * RADIAN;
      const c = Math.cos(iv) * Math.cos(ic) + Math.sin(iv) * Math.sin(ic) * Math.cos(nodes);
      return Math.acos(Math.min(1, c)) / RADIAN;
    },
  );
  r.q(
    "ice-launch-start",
    {
      label: "First Ice Bricks leave Ceres",
      unit: "date",
      formula: "the later of the Lattice's full power and the Railheads' finish",
      basis: "design",
      note: "The Railheads need the Lattice's beams, so launches start when it reaches full power, unless the Ceres factories are still building the Railheads and the Crown. A later start shortens the campaign, which raises the Railheads' power, grows the Crown that sheds their heat and makes the finish later, so the model solves for the date where the two meet.",
    },
    () => Math.max(v("helios-full-power"), r.solved["ceres-ready"] ?? Number.NEGATIVE_INFINITY),
  );

  // --- The launch schedule ------------------------------------------------------------------------
  r.q(
    "launch-offwindow-mean",
    {
      label: "Average extra launch energy, firing all the time, over a launch in a window",
      unit: "1",
      show: "%",
      sig: 2,
      formula:
        "mean over the schedule of (Δv² + v_esc²) / (Δv_H² + v_esc²) − 1, from Ceres's starting orbit",
      basis: "physics",
      note: "The Railheads fire at a steady rate through every phase of the synodic cycle. Each launch phase is booked onto the cheapest Lambert transfer, in three dimensions, that leaves an arrival slot free, with no slot taking more than the chosen peak. The plane change is part of the price. Averaged over every launch phase and over Ceres's whole orbit; the campaign covers only part of it.",
    },
    () => first().energy / first().hohmann - 1,
  );
  r.q(
    "launch-offwindow-max",
    {
      label: "Extra launch energy for the costliest shot in the schedule",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "max over the schedule of (Δv² + v_esc²) / (Δv_H² + v_esc²) − 1",
      basis: "physics",
    },
    () => first().energyMax / first().hohmann - 1,
  );
  r.q(
    "launch-coplanar-mean",
    {
      label: "Average extra launch energy if Ceres's orbit lay in Venus's plane",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "the same schedule with no tilt between the orbits",
      basis: "physics",
      note: "What the schedule would cost without the plane change; the difference from the full average is what Ceres's tilt adds.",
    },
    () => {
      const flat = iceSchedule(v, v("ceres-orbit"), 0);
      return flat.energy / flat.hohmann - 1;
    },
  );
  r.q(
    "ice-throw-back",
    {
      label: "Average launch kick against Ceres's motion",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "mean over the schedule of −Δv · v̂_Ceres",
      basis: "physics",
      note: "The part of each kick that pushes Ceres along its orbit. The rest, toward or away from the Sun and out of Ceres's plane, changes the shape and tilt of Ceres's orbit a little but not its size, and is left out.",
    },
    () => first().back,
  );
  r.q(
    "ceres-recoil",
    {
      label: "Speed Ceres gains from throwing the ice",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "v̄ ln(M_C / (M_C − M_ice))",
      basis: "physics",
      note: "The ice leaves a Brick at a time over the whole campaign, so the rocket equation. v̄ is the average kick against Ceres's motion from its starting orbit; from the drifted orbit it is slightly larger.",
    },
    () => v("ice-throw-back") * Math.log(v("ceres-mass") / (v("ceres-mass") - v("ice-mass"))),
  );
  r.q(
    "ceres-drift-orbit",
    {
      label: "Ceres's orbit at the last launch, pushed outward by the recoil",
      unit: "m",
      show: "AU",
      sig: 3,
      formula: "μ_☉ / (√(μ_☉ / a_C) − Δv_recoil)²",
      basis: "physics",
      note: "Edelbaum's result for a steady push along the motion: the orbit stays nearly circular while its speed falls by the push. The campaign lasts only a fraction of Ceres's orbit, so the push also leaves an eccentricity about as large as Ceres's own; like Ceres's own, it is left out, and the drifted orbit is taken as circular.",
    },
    () => {
      const vc = circularSpeed(v("sun-mu"), v("ceres-orbit")) - v("ceres-recoil");
      return v("sun-mu") / vc ** 2;
    },
  );
  r.q(
    "launch-energy-per-kg",
    {
      label: "Energy drawn per kilogram launched in a window",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 2,
      formula: "½ v² / η",
      basis: "invented",
    },
    () => (0.5 * v("ice-launch-speed") ** 2) / v("railhead-efficiency"),
  );
  r.q(
    "launch-energy-per-kg-end",
    {
      label:
        "Energy drawn per kilogram launched at the end of the campaign, from the drifted orbit",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 3,
      formula: "mean over the schedule of ½ (Δv² + v_esc²) / η",
      basis: "invented",
    },
    () => (0.5 * last().energy) / v("railhead-efficiency"),
  );
  r.q(
    "launch-energy-per-kg-avg",
    {
      label: "Energy drawn per kilogram launched, averaged over the campaign",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 3,
      formula: "½ (e_window × (1 + mean penalty) + e_end)",
      basis: "invented",
      note: "The first launches leave from Ceres's starting orbit, the last from its drifted one. The steady recoil moves Ceres outward at a nearly even pace, so the average of the two ends stands for the whole campaign.",
    },
    () =>
      0.5 *
      (v("launch-energy-per-kg") * (1 + v("launch-offwindow-mean")) +
        v("launch-energy-per-kg-end")),
  );
  r.q(
    "ice-launch-speed-max",
    {
      label: "Fastest muzzle speed the schedule asks of a Railhead",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "√(max (Δv² + v_esc²)), over both ends of the campaign",
      basis: "physics",
    },
    () => Math.sqrt(Math.max(first().energyMax, last().energyMax)),
  );
  r.q(
    "ice-vinf-rms",
    {
      label: "Ice arrival speed relative to Venus, far out, averaged over the campaign (rms)",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "√(½ (v∞,first² + v∞,last²)), each the rms over the schedule",
      basis: "physics",
      note: "Includes the plane change the Ring must absorb: see the out-of-plane parts below.",
    },
    () => Math.sqrt(0.5 * (first().vinfRms ** 2 + last().vinfRms ** 2)),
  );
  r.q(
    "ice-kick-tilt",
    {
      label:
        "Part of the launch kick out of Ceres's orbital plane, averaged over the campaign (rms)",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "√(½ (first² + last²)), each the rms over the schedule of Δv · n̂_Ceres",
      basis: "physics",
      note: "How the plane change splits between launch and catch. A Brick coasts, so it can change plane only where it leaves and where it is caught. Its transfer lies in the plane through the Sun, Ceres at launch and Venus at arrival, which is tilted to both orbits: the Railhead pays the tilt to Ceres's orbit in the kick, and the Ring takes the tilt to Venus's orbit as arrival speed. The schedule is chosen for the least launch energy, so it picks transfers whose planes lie close to Ceres's and leaves most of the plane change to the catch, where the Ring recovers the energy. Weighting arrival speed in the schedule as well lowers it only a little, for more launch energy.",
    },
    () => Math.sqrt(0.5 * (first().kickTiltRms ** 2 + last().kickTiltRms ** 2)),
  );
  r.q(
    "ice-vinf-tilt",
    {
      label:
        "Part of the arrival speed out of Venus's orbital plane, averaged over the campaign (rms)",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "√(½ (first² + last²)), each the rms over the schedule of v∞ · n̂_Venus",
      basis: "physics",
    },
    () => Math.sqrt(0.5 * (first().vinfTiltRms ** 2 + last().vinfTiltRms ** 2)),
  );
  r.q(
    "ice-flight-min",
    {
      label: "Fastest transfer the schedule uses",
      unit: "d",
      sig: 3,
      formula: "least flight time in the schedule, from Ceres's starting orbit",
      basis: "physics",
    },
    () => (first().flights[0] as number) / DAY_S,
  );
  r.q(
    "ice-flight-mean",
    {
      label: "Average transfer time over the campaign",
      unit: "d",
      show: "yr",
      sig: 3,
      formula: "½ (mean flight time from the starting orbit + from the drifted orbit)",
      basis: "physics",
    },
    () => {
      const mean = (f: readonly number[]) => f.reduce((a, b) => a + b, 0) / f.length;
      return (0.5 * (mean(first().flights) + mean(last().flights))) / DAY_S;
    },
  );
  r.q(
    "ice-flight-max",
    {
      label: "Slowest transfer the schedule uses, from Ceres's drifted orbit",
      unit: "d",
      sig: 3,
      formula: "greatest flight time in the schedule from the drifted orbit",
      basis: "physics",
      note: "The model does not follow where Venus is on the day of the last launch, so the last Bricks may be on the slowest transfer the schedule uses.",
    },
    () => (last().flights.at(-1) as number) / DAY_S,
  );
  r.q(
    "ice-launch-end",
    {
      label: "Last Ice Bricks leave Ceres",
      unit: "date",
      formula: "deadline − slowest transfer − lowering margin",
      basis: "physics",
    },
    () => v("deadline") - v("ice-flight-max") - v("ice-lowering-margin"),
  );
  r.q(
    "ice-campaign",
    {
      label: "Length of the launch campaign",
      unit: "s",
      show: "yr",
      sig: 2,
      formula: "last launch − first launch",
      basis: "design",
    },
    () => {
      const days = v("ice-launch-end") - v("ice-launch-start");
      // No time to launch means no water, and every rate below would be undefined.
      if (days <= 0)
        throw new Error(
          "the first ice launch comes after the last launch that reaches Venus by the deadline, so no water arrives in time",
        );
      return days * DAY_S;
    },
  );
  r.q(
    "ice-throughput",
    {
      label: "Ice thrown per second",
      unit: "kg/s",
      sig: 3,
      formula: "M_ice / campaign",
      basis: "invented",
    },
    () => v("ice-mass") / v("ice-campaign"),
  );
  r.q(
    "ice-catch-peak",
    {
      label: "Ice reaching the Ring per second at the peak of each cycle",
      unit: "kg/s",
      sig: 3,
      formula: "ṁ × most launch phases booked into one arrival slot",
      basis: "physics",
      note: "Averaged over one arrival slot. The Ring is built for this rate, not the mean.",
    },
    () => v("ice-throughput") * Math.max(first().peak, last().peak),
  );
  r.q(
    "ice-arrival-slot",
    {
      label: "Span the peak catch rate is averaged over (one arrival slot)",
      unit: "d",
      sig: 2,
      formula: "synodic period / number of slots",
      basis: "design",
    },
    () => first().slot / DAY_S,
  );
  r.q(
    "ice-bricks-per-second",
    {
      label: "Ice Bricks per second",
      unit: "count",
      sig: 3,
      formula: "ṁ / M_brick",
      basis: "invented",
    },
    () => v("ice-throughput") / v("brick-mass"),
  );
  r.q(
    "railhead-interval",
    {
      label: "Seconds between shots at each Railhead",
      unit: "s",
      sig: 2,
      formula: "N / (Bricks per second)",
      basis: "invented",
    },
    () => v("railhead-count") / v("ice-bricks-per-second"),
  );
  r.q(
    "railhead-length",
    {
      label: "Railhead length",
      unit: "m",
      show: "km",
      sig: 3,
      formula: "v_max² / (2a)",
      basis: "invented",
      note: "Long enough for the fastest shot the schedule fires.",
    },
    () => v("ice-launch-speed-max") ** 2 / (2 * v("railhead-accel") * v("standard-gravity")),
  );
  r.q(
    "railhead-shot-time",
    {
      label: "Time the fastest Brick spends in the barrel",
      unit: "s",
      sig: 2,
      formula: "v_max / a",
      basis: "invented",
      note: "Slower shots leave the barrel sooner.",
    },
    () => v("ice-launch-speed-max") / (v("railhead-accel") * v("standard-gravity")),
  );
  r.q(
    "brick-side",
    { label: "Ice Brick edge", unit: "m", sig: 3, formula: "∛(M_brick / ρ_ice)", basis: "design" },
    () => Math.cbrt(v("brick-mass") / v("ice-density")),
  );
  r.q(
    "shot-energy",
    {
      label: "Kinetic energy of one Brick launched in a window",
      unit: "J",
      sig: 3,
      formula: "½ M v²",
      basis: "physics",
    },
    () => 0.5 * v("brick-mass") * v("ice-launch-speed") ** 2,
  );
  r.q(
    "shot-energy-drawn",
    {
      label: "Energy drawn per shot in a window at 50% efficiency",
      unit: "J",
      formula: "½ M v² / η",
      basis: "invented",
    },
    () => v("shot-energy") / v("railhead-efficiency"),
  );
  r.q(
    "ice-launch-energy",
    {
      label: "Energy to launch all the ice",
      unit: "J",
      formula: "M_ice × e_avg",
      basis: "invented",
    },
    () => v("ice-mass") * v("launch-energy-per-kg-avg"),
  );
  r.q(
    "ice-launch-energy-window",
    {
      label: "Energy to launch all the ice if every shot left in a window",
      unit: "J",
      formula: "M_ice ½ v² / η",
      basis: "invented",
    },
    () => v("ice-mass") * v("launch-energy-per-kg"),
  );
  r.q(
    "ice-launch-offwindow-energy",
    {
      label:
        "Extra energy for shots fired between windows, out of Venus's plane and from Ceres's drifting orbit",
      unit: "J",
      formula: "E_launch − E_window",
      basis: "physics",
    },
    () => v("ice-launch-energy") - v("ice-launch-energy-window"),
  );
  r.q(
    "ice-launch-motion",
    {
      label: "Motion energy the Railheads give all the ice",
      unit: "J",
      formula: "E_launch × η",
      basis: "physics",
    },
    () => v("ice-launch-energy") * v("railhead-efficiency"),
  );
  r.q(
    "railhead-loss-energy",
    {
      label: "Heat the Railheads shed at Ceres launching all the ice",
      unit: "J",
      formula: "E_launch − E_motion",
      basis: "physics",
    },
    () => v("ice-launch-energy") - v("ice-launch-motion"),
  );
  r.q(
    "railhead-power",
    { label: "Power all Railheads draw", unit: "W", formula: "ṁ × e_avg", basis: "invented" },
    () => v("ice-throughput") * v("launch-energy-per-kg-avg"),
  );
  r.q(
    "railhead-power-each",
    { label: "Power one Railhead draws", unit: "W", formula: "P / N", basis: "invented" },
    () => v("railhead-power") / v("railhead-count"),
  );
  r.q(
    "brick-launch-stress",
    {
      label: "Stress at the back of a Brick under launch acceleration",
      unit: "Pa",
      show: "MPa",
      sig: 2,
      formula: "ρ_ice a L",
      basis: "physics",
      note: "Cold ice crushes at roughly 5 to 25 MPa, so the Brick must ride in a sabot that carries it along its whole length.",
    },
    () => v("ice-density") * v("railhead-accel") * v("standard-gravity") * v("brick-side"),
  );
  r.q(
    "ceres-water",
    { label: "Water in Ceres", unit: "kg", formula: "f_water M_C", basis: "physics" },
    () => v("ceres-water-fraction") * v("ceres-mass"),
  );
  r.q(
    "ice-ceres-water-share",
    {
      label: "Share of Ceres's water shipped",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "M_ice / M_water",
      basis: "physics",
    },
    () => v("ice-mass") / v("ceres-water"),
  );
  r.q(
    "ice-ceres-mass-share",
    {
      label: "Share of Ceres's mass shipped",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "M_ice / M_C",
      basis: "physics",
    },
    () => v("ice-mass") / v("ceres-mass"),
  );
  r.q(
    "ceres-new-aphelion",
    {
      label: "Ceres's new aphelion",
      unit: "m",
      show: "AU",
      sig: 3,
      formula: "2a − r, a from vis-viva with v_C + Δv",
      basis: "physics",
      note: "As if the whole recoil came at once, at Ceres's starting orbit. That puts the aphelion farther out than the steady push of the campaign does, so it is the safe bound to hold against Jupiter.",
    },
    () => {
      const r0 = v("ceres-orbit");
      const vel = circularSpeed(v("sun-mu"), r0) + v("ceres-recoil");
      const a = 1 / (2 / r0 - vel ** 2 / v("sun-mu"));
      return 2 * a - r0;
    },
  );
  r.q(
    "launch-window-period",
    {
      label: "Time between the cheapest launch windows (Venus-Ceres synodic period)",
      unit: "s",
      show: "months",
      sig: 2,
      formula: "1 / (1/P_V − 1/P_C)",
      basis: "physics",
    },
    () => {
      const pv = period(v("sun-mu"), v("venus-orbit"));
      const pc = period(v("sun-mu"), v("ceres-orbit"));
      return 1 / (1 / pv - 1 / pc);
    },
  );
  r.q(
    "launch-windows",
    {
      label: "Cheap launch windows in the campaign",
      unit: "count",
      sig: 2,
      formula: "campaign / synodic period",
      basis: "physics",
    },
    () => v("ice-campaign") / v("launch-window-period"),
  );
  r.q(
    "ocean-depth",
    {
      label: "Global-average ocean depth",
      unit: "m",
      sig: 3,
      formula: "M_ice / (ρ_water A)",
      basis: "physics",
    },
    () => v("ice-mass") / (v("water-density") * v("venus-area")),
  );
  r.q(
    "ice-vs-earth-water",
    {
      label: "Water delivered compared with Earth's",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "M_ice / M_water,⊕",
      basis: "physics",
    },
    () => v("ice-mass") / v("earth-water-mass"),
  );
  r.q(
    "first-catch",
    {
      label: "First Bricks reach Venus",
      unit: "date",
      formula: "first launch + fastest transfer",
      basis: "physics",
      note: "The soonest any of the first launches can arrive: the model does not follow where Venus is on the first launch day.",
    },
    () => v("ice-launch-start") + v("ice-flight-min"),
  );
  r.q(
    "last-arrival",
    {
      label: "Last Bricks reach Venus",
      unit: "date",
      formula: "last launch + slowest transfer from the drifted orbit",
      basis: "physics",
    },
    () => v("ice-launch-end") + v("ice-flight-max"),
  );
  r.q(
    "ice-transfer-years",
    {
      label: "Transfer time in years on the Hohmann transfer",
      unit: "s",
      show: "yr",
      sig: 3,
      formula: "days × 86,400 s",
      basis: "physics",
    },
    () => v("ice-transfer-days") * DAY_S,
  );

  // --- Catching before lowering -------------------------------------------------------------------
  r.q(
    "ice-caught-at-lowering",
    {
      label: "Share of the ice the Ring has caught when lowering begins",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "share of launches whose transfer has arrived by the start of lowering",
      basis: "physics",
      note: "Each transfer in the schedule is taken to fire evenly through the campaign, slowing as Ceres drifts outward.",
    },
    () => iceCatch(v).share(v("lowering-start")),
  );
  r.q(
    "ice-lowering-slack",
    {
      label: "Days between the last Brick's arrival and the end of lowering",
      unit: "d",
      sig: 2,
      formula: "lowering end − last arrival",
      basis: "physics",
    },
    () => v("lowering-end") - v("last-arrival"),
  );
  r.c(
    "ice-arrives",
    { label: "The Ring catches the ice before it must lower it", kind: "schedule" },
    () => {
      // The Ring lowers the ice at a steady rate from lowering-start to lowering-end; at no moment
      // may it have lowered more than it has caught. Both shares are piecewise linear in time, so
      // the worst moment is one where either changes slope.
      const [from, to] = [v("lowering-start"), v("lowering-end")];
      const caught = iceCatch(v);
      let short = 0;
      for (const x of [from, to, ...caught.turns]) {
        if (x >= from && x <= to)
          short = Math.max(short, (x - from) / (to - from) - caught.share(x));
      }
      return {
        pass: short <= 1e-9,
        detail: `Lowering ${fmt(r, "ice-mass")} runs from ${fmt(r, "lowering-start", { date: "day" })} to ${fmt(r, "lowering-end", { date: "day" })}, and the Ring can only lower what it has caught. When lowering begins it holds ${fmt(r, "ice-caught-at-lowering")} of the ice. The last launch, on ${fmt(r, "ice-launch-end", { date: "day" })}, leaves room for the slowest transfer from Ceres's drifted orbit, ${fmt(r, "ice-flight-max")}; the last Brick arrives on ${fmt(r, "last-arrival", { date: "day" })}, ${fmt(r, "ice-lowering-slack")} before lowering ends.${short > 1e-9 ? ` At the worst moment lowering runs ${(100 * short).toPrecision(2)}% of the ice ahead of the catch.` : ""}`,
      };
    },
  );
  r.c(
    "ring-ready-for-ice",
    { label: "The Ring is complete before the first Brick arrives", kind: "schedule" },
    () => ({
      pass: v("ring-complete") <= v("first-catch"),
      detail: `The fastest transfer the schedule uses takes ${fmt(r, "ice-flight-min")}, so Bricks from the first launch on ${fmt(r, "ice-launch-start", { date: "day" })} can reach Venus on ${fmt(r, "first-catch", { date: "day" })}; the Ring is complete on ${fmt(r, "ring-complete", { date: "day" })}.`,
    }),
  );

  // The schedules from Ceres's starting orbit and from its drifted one.
  function first() {
    return iceSchedule(v, v("ceres-orbit"), v("ice-mutual-inclination"));
  }
  function last() {
    return iceSchedule(v, v("ceres-drift-orbit"), v("ice-mutual-inclination"));
  }
}

type Value = (id: string) => number;

/**
 * The steady launch schedule from Ceres on a circular orbit of radius r1, its plane tilted to
 * Venus's by `tilt` degrees.
 */
function iceSchedule(v: Value, r1: number, tilt: number) {
  return launchSchedule({
    mu: v("sun-mu"),
    r1,
    r2: v("venus-orbit"),
    vEscape: v("ceres-escape"),
    inclination: tilt * RADIAN,
    peak: v("ice-arrival-peak"),
  });
}

/**
 * The catch as it ramps up and down: `share(day)` is the share of the ice the Ring has caught by
 * that day, and `turns` are the days its rate changes. Anything that needs the catch day by day,
 * rather than at its mean rate, takes it from here.
 */
export function iceCatch(v: Value): { share: (day: number) => number; turns: number[] } {
  const flights = (r1: number) =>
    iceSchedule(v, r1, v("ice-mutual-inclination")).flights.map((t) => t / DAY_S);
  const [start, end] = [v("ice-launch-start"), v("ice-launch-end")];
  const [first, last] = [flights(v("ceres-orbit")), flights(v("ceres-drift-orbit"))];
  return {
    share: (day) => caughtShare(day, start, end, first, last),
    turns: [...first.map((t) => start + t), ...last.map((t) => end + t)],
  };
}
