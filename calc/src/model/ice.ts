/**
 * Ceres Ice Train: coilguns on Ceres throw water ice onto transfer orbits to Venus.
 *
 * The Railheads fire steadily through a short campaign, which starts when the Lattice can power
 * them. Its transfers come from a launch schedule on the campaign's real dates (physics.ts,
 * campaignSchedule): Ceres and Venus are placed by their measured orbits on the first launch day,
 * and each launch slot is booked onto a Lambert transfer in three dimensions between the two
 * orbits, tilted to each other, so that no more than a chosen multiple of the launch rate reaches
 * Venus at once. Simplifications, each named where it is used: the transfers treat both orbits as
 * circles (Ceres's eccentricity, 0.08, only places it along its orbit on the day), and Ceres's
 * drift outward under the recoil is taken as even over the campaign.
 */
import {
  CAMPAIGN_SLOTS,
  type CampaignSchedule,
  campaignSchedule,
  circularSpeed,
  crossingAngles,
  hohmann,
  period,
  trueAnomaly,
} from "../physics.ts";
import type { Registry } from "../registry.ts";
import { DAY_S, dayOfJulian } from "../time.ts";
import { fmt } from "./text.ts";

const RADIAN = Math.PI / 180;

/**
 * Share of the ice that has reached Venus by day x, for a campaign starting on day `start` cut into
 * slots `slot` days wide: each launch slot's share arrives evenly through its arrival slot,
 * `arrivals` counting slots from the start.
 */
export function arrivedShare(
  x: number,
  start: number,
  slot: number,
  arrivals: readonly number[],
): number {
  let sum = 0;
  for (const a of arrivals) sum += Math.min(1, Math.max(0, (x - start - a * slot) / slot));
  return sum / arrivals.length;
}

export function iceTrain(r: Registry) {
  const { v } = r.in("model/ice.ts");
  const transfer = () => hohmann(v("sun-mu"), v("ceres-orbit"), v("venus-orbit"));
  // The site links each id to its first mention in this file, so the helpers that read ids defined
  // here (first, main, iceSchedule, iceArrivals) are declared after the definitions.

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
      note: "The Railheads need the Lattice's beams, so launches start when it reaches full power, unless the Ceres factories are still building the Railheads and the Crown. A later start finds the planets elsewhere, which changes what the launches cost, the Railheads' power and the Crown that sheds their heat, and so the finish, so the model solves for the date where the two meet.",
    },
    () => Math.max(v("helios-full-power"), r.solved["ceres-ready"] ?? Number.NEGATIVE_INFINITY),
  );

  r.q(
    "ice-launch-end",
    {
      label: "Last Ice Bricks leave Ceres",
      unit: "date",
      formula: "first launch + campaign",
      basis: "design",
    },
    () => v("ice-launch-start") + v("ice-campaign-days"),
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
      if (days <= 0) throw new Error("the ice campaign has no days, so no water is launched");
      return days * DAY_S;
    },
  );
  // --- The launch schedule ------------------------------------------------------------------------
  r.q(
    "ice-throw-back",
    {
      label: "Average launch kick against Ceres's motion",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "mean over the campaign of −Δv · v̂_Ceres, from Ceres's starting orbit",
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
      note: "The ice leaves a Brick at a time over the whole campaign, so the rocket equation. v̄ is the average kick against Ceres's motion from its starting orbit; as the orbit widens it is slightly larger.",
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
    "launch-offwindow-mean",
    {
      label: "Average extra launch energy over the campaign, over a launch in a window",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "mean over the campaign's launches of (Δv² + v_esc²) / (Δv_H² + v_esc²) − 1",
      basis: "physics",
      note: "The Railheads fire at a steady rate through the campaign, on its real dates: Ceres and Venus are placed by their measured orbits on the first launch day. Each day's launches are booked onto the Lambert transfer, in three dimensions, that best trades launch energy against arrival speed while leaving an arrival slot free, with no slot taking more than the chosen peak. The plane change is part of the price.",
    },
    () => main().energy / main().hohmann - 1,
  );
  r.q(
    "launch-offwindow-max",
    {
      label: "Extra launch energy for the costliest shot in the campaign",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "max over the campaign of (Δv² + v_esc²) / (Δv_H² + v_esc²) − 1",
      basis: "physics",
    },
    () => main().energyMax / main().hohmann - 1,
  );
  r.q(
    "launch-coplanar-mean",
    {
      label: "Average extra launch energy if Ceres's orbit lay in Venus's plane",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "the same campaign with no tilt between the orbits",
      basis: "physics",
      note: "What the campaign would cost without the plane change; the difference from the full average is what Ceres's tilt adds.",
    },
    () => {
      const flat = iceSchedule(v, v("ceres-drift-orbit"), 0);
      return flat.energy / flat.hohmann - 1;
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
    "launch-energy-per-kg-avg",
    {
      label: "Energy drawn per kilogram launched, averaged over the campaign",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 3,
      formula: "mean over the campaign of ½ (Δv² + v_esc²) / η",
      basis: "invented",
      note: "Each launch leaves from where Ceres is that day, on an orbit the recoil widens evenly through the campaign.",
    },
    () => (0.5 * main().energy) / v("railhead-efficiency"),
  );
  r.q(
    "ice-launch-speed-max",
    {
      label: "Fastest muzzle speed the schedule asks of a Railhead",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "√(max (Δv² + v_esc²)) over the campaign",
      basis: "physics",
    },
    () => Math.sqrt(main().energyMax),
  );
  r.q(
    "ice-vinf-rms",
    {
      label: "Ice arrival speed relative to Venus, far out, averaged over the campaign (rms)",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "rms over the campaign's launches of v∞",
      basis: "physics",
      note: "Includes the plane change left to the arrival: see the out-of-plane parts below.",
    },
    () => main().vinfRms,
  );
  r.q(
    "ice-kick-tilt",
    {
      label:
        "Part of the launch kick out of Ceres's orbital plane, averaged over the campaign (rms)",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "rms over the campaign of Δv · n̂_Ceres",
      basis: "physics",
      note: "How the plane change splits between launch and arrival. A Brick coasts, so it can change plane only where it leaves and where it arrives. Its transfer lies in the plane through the Sun, Ceres at launch and Venus at arrival, which is tilted to both orbits: the Railhead pays the tilt to Ceres's orbit in the kick, and the tilt to Venus's orbit arrives as speed, which ends as heat in Venus's air. The schedule books the cheapest launches, so most of the plane change arrives at Venus.",
    },
    () => main().kickTiltRms,
  );
  r.q(
    "ice-vinf-tilt",
    {
      label:
        "Part of the arrival speed out of Venus's orbital plane, averaged over the campaign (rms)",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "rms over the campaign of v∞ · n̂_Venus",
      basis: "physics",
    },
    () => main().vinfTiltRms,
  );
  r.q(
    "ice-flight-min",
    {
      label: "Fastest transfer the campaign uses",
      unit: "d",
      sig: 3,
      formula: "least flight time in the campaign",
      basis: "physics",
    },
    () => Math.min(...main().flights) / DAY_S,
  );
  r.q(
    "ice-flight-mean",
    {
      label: "Average transfer time over the campaign",
      unit: "d",
      show: "yr",
      sig: 3,
      formula: "mean flight time over the campaign's launches",
      basis: "physics",
    },
    () => main().flights.reduce((a, b) => a + b, 0) / main().flights.length / DAY_S,
  );
  r.q(
    "ice-flight-max",
    {
      label: "Slowest transfer the campaign uses",
      unit: "d",
      sig: 3,
      formula: "greatest flight time in the campaign",
      basis: "physics",
    },
    () => Math.max(...main().flights) / DAY_S,
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
    "ice-arrival-peak-rate",
    {
      label: "Ice reaching Venus per second at the peak of the arrivals",
      unit: "kg/s",
      sig: 3,
      formula: "ṁ × most launch slots booked into one arrival slot",
      basis: "physics",
      note: "Averaged over one arrival slot.",
    },
    () => v("ice-throughput") * main().peak,
  );
  r.q(
    "ice-arrival-slot",
    {
      label: "Span the peak arrival rate is averaged over (one arrival slot)",
      unit: "d",
      sig: 2,
      formula: `campaign / launch slots (one a day, at most ${CAMPAIGN_SLOTS})`,
      basis: "design",
    },
    () => main().slot / DAY_S,
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
    "ice-launch-lead",
    {
      label: "How far Venus leads Ceres along their orbits on the first launch day",
      unit: "deg",
      sig: 3,
      formula: "w₀ − u₀, from their measured orbits",
      basis: "physics",
      note: "Each angle is measured in its own orbit's plane from the line where the two planes cross. Ceres is placed by its eccentric orbit, Venus by its mean longitude.",
    },
    () => {
      const at = placesOn(v, v("ice-launch-start"));
      return ((((at.w - at.u) / RADIAN) % 360) + 360) % 360;
    },
  );
  r.q(
    "ice-window-lead",
    {
      label: "How far Venus must lead Ceres for a Hohmann transfer",
      unit: "deg",
      sig: 3,
      formula: "180° − n_V t_H",
      basis: "physics",
      note: "Venus moves on while the ice falls half a turn round the Sun, so it must start that far ahead of the point opposite Ceres.",
    },
    () => {
      const turned = (Math.sqrt(v("sun-mu") / v("venus-orbit") ** 3) * transfer().time) / RADIAN;
      return (((180 - turned) % 360) + 360) % 360;
    },
  );
  r.q(
    "ice-window-wait",
    {
      label: "Days from the first launch to the next Hohmann window",
      unit: "d",
      sig: 2,
      formula: "(lead needed − lead on the day) / (n_V − n_C)",
      basis: "physics",
    },
    () => {
      const gap = (((v("ice-window-lead") - v("ice-launch-lead")) % 360) + 360) % 360;
      return ((gap / 360) * v("launch-window-period")) / DAY_S;
    },
  );
  r.q(
    "ocean-depth",
    {
      label: "Depth of the water spread evenly over Venus",
      unit: "m",
      sig: 3,
      formula: "M_ice / (ρ_water A)",
      basis: "physics",
    },
    () => v("ice-mass") / (v("water-density") * v("venus-area")),
  );
  r.q(
    "sea-cover-share",
    {
      label: "Share of Venus the new seas cover",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "d_even / d_seas",
      basis: "design",
    },
    () => v("ocean-depth") / v("sea-mean-depth"),
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
    "first-arrival",
    {
      label: "First Bricks reach Venus",
      unit: "date",
      formula: "first launch + the earliest arrival slot",
      basis: "physics",
    },
    () => v("ice-launch-start") + (Math.min(...main().arrivals) * main().slot) / DAY_S,
  );
  r.q(
    "last-arrival",
    {
      label: "Last Bricks reach Venus",
      unit: "date",
      formula: "first launch + the end of the latest arrival slot",
      basis: "physics",
    },
    () => v("ice-launch-start") + ((Math.max(...main().arrivals) + 1) * main().slot) / DAY_S,
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

  // --- Falling into the air ---------------------------------------------------------------------
  // Nothing catches the Bricks: each one plunges into Venus's air and stops there, and its water
  // falls the rest of the way. All its motion energy, and the energy of the fall, becomes heat in
  // the air the pumps are cooling.
  r.q(
    "ice-entry-speed",
    {
      label: "Speed of a Brick reaching Venus's air, averaged over the campaign (rms)",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "√(v∞,rms² + v_esc²)",
      basis: "physics",
    },
    () => Math.sqrt(v("ice-vinf-rms") ** 2 + v("venus-escape") ** 2),
  );
  r.q(
    "ice-entry-energy-per-kg",
    {
      label: "Heat each kilogram of ice brings into Venus, from far out to the ground",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 3,
      formula: "½ (v∞,rms² + v_esc²)",
      basis: "physics",
      note: "A Brick stops high in the air and its water falls the rest of the way: its motion energy far out plus the whole fall into Venus's gravity.",
    },
    () => 0.5 * v("ice-entry-speed") ** 2,
  );
  r.q(
    "brick-entry-energy",
    {
      label: "Heat one Brick releases as it bursts in the air and its water falls",
      unit: "J",
      sig: 2,
      formula: "m_brick × ½ (v∞,rms² + v_esc²)",
      basis: "physics",
      note: "About the energy of a large hydrogen bomb, which is why the Bricks fall at the poles, clear of the canopies.",
    },
    () => v("brick-mass") * v("ice-entry-energy-per-kg"),
  );
  r.q(
    "ice-entry-heat",
    {
      label: "Heat all the ice brings into Venus",
      unit: "J",
      formula: "M_ice × e_entry",
      basis: "physics",
    },
    () => v("ice-mass") * v("ice-entry-energy-per-kg"),
  );
  r.q(
    "ice-entry-vs-atmosphere",
    {
      label: "That heat as a share of the heat the pumps must take out of the air",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "E_entry / E_atm",
      basis: "physics",
    },
    () => v("ice-entry-heat") / v("atmosphere-heat"),
  );
  r.q(
    "ocean-entry-heat",
    {
      label: "Heat a global ocean as deep as Earth's average share would bring, the same way",
      unit: "J",
      formula: "M_water,⊕ × (A_V / A_⊕) × e_entry",
      basis: "physics",
      note: "Water for Venus in Earth's proportion: Earth's oceans scaled by the two planets' areas.",
    },
    () =>
      v("earth-water-mass") *
      (v("venus-area") / (4 * Math.PI * v("earth-radius") ** 2)) *
      v("ice-entry-energy-per-kg"),
  );
  r.q(
    "ocean-entry-vs-atmosphere",
    {
      label: "That heat as a multiple of the heat the pumps must take out of the air",
      unit: "1",
      sig: 2,
      formula: "E_ocean / E_atm",
      basis: "physics",
    },
    () => v("ocean-entry-heat") / v("atmosphere-heat"),
  );
  r.q(
    "melt-energy",
    {
      label: "Energy to melt a kilogram of Brick ice and warm it to 288 K",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 2,
      formula: "c_ice (273 − T_brick) + L_melt + c_water (288 − 273)",
      basis: "physics",
    },
    () =>
      v("ice-cp") * (273.15 - v("brick-temp")) +
      v("ice-melt-heat") +
      v("water-cp") * (v("earth-surface-temp") - 273.15),
  );
  r.c(
    "ice-arrives",
    { label: "The last Brick reaches Venus while the pumps still run", kind: "schedule" },
    () => ({
      pass: v("last-arrival") < v("sealing-end"),
      detail: `Launches run from ${fmt(r, "ice-launch-start", { date: "day" })} to ${fmt(r, "ice-launch-end", { date: "day" })}. The slowest transfer takes ${fmt(r, "ice-flight-max")}, and the last Brick falls into the air on ${fmt(r, "last-arrival", { date: "day" })}, before the pumps stop with the last caps on ${fmt(r, "sealing-end", { date: "day" })}. Its heat is the pumps' to take out.`,
    }),
  );

  // The campaign from Ceres's starting orbit alone (for the recoil that widens it), and with the
  // recoil widening it.
  function first() {
    return iceSchedule(v, v("ceres-orbit"), v("ice-mutual-inclination"));
  }
  function main() {
    return iceSchedule(v, v("ceres-drift-orbit"), v("ice-mutual-inclination"));
  }
}

type Value = (id: string) => number;

/**
 * Where Ceres and Venus are on a day, measured as the schedule measures them: each one's angle in
 * its own plane from the line where Ceres's orbit rises through Venus's.
 */
export function placesOn(v: Value, day: number): { u: number; w: number } {
  const meanAnomaly =
    (v("ceres-mean-anomaly") +
      v("ceres-mean-motion") * (day - dayOfJulian(v("ceres-elements-epoch")))) *
    RADIAN;
  const ceres =
    v("ceres-perihelion-argument") * RADIAN + trueAnomaly(meanAnomaly, v("ceres-eccentricity"));
  const venus =
    (v("venus-mean-longitude") +
      v("venus-mean-motion") * (day - dayOfJulian(v("venus-elements-epoch"))) -
      v("venus-node")) *
    RADIAN;
  return crossingAngles(
    { i: v("ceres-inclination") * RADIAN, node: v("ceres-node") * RADIAN, u: ceres },
    { i: v("venus-inclination") * RADIAN, node: v("venus-node") * RADIAN, u: venus },
  );
}

/**
 * The launch campaign from Ceres, on its real dates, its orbit widening to radius r1End and its
 * plane tilted to Venus's by `tilt` degrees.
 */
function iceSchedule(v: Value, r1End: number, tilt: number): CampaignSchedule {
  const at = placesOn(v, v("ice-launch-start"));
  return campaignSchedule({
    mu: v("sun-mu"),
    r1: v("ceres-orbit"),
    r1End,
    r2: v("venus-orbit"),
    vEscape: v("ceres-escape"),
    inclination: tilt * RADIAN,
    u0: at.u,
    w0: at.w,
    duration: v("ice-campaign"),
    peak: v("ice-arrival-peak"),
    arrivalWeight: v("ice-arrival-weight"),
  });
}

/**
 * The arrivals as they ramp up and down: `share(day)` is the share of the ice that has reached
 * Venus by that day, and `turns` are the days its rate changes. Anything that needs the arrivals
 * day by day, rather than at their mean rate, takes them from here.
 */
export function iceArrivals(v: Value): { share: (day: number) => number; turns: number[] } {
  const s = iceSchedule(v, v("ceres-drift-orbit"), v("ice-mutual-inclination"));
  const start = v("ice-launch-start");
  const slot = s.slot / DAY_S;
  const turns = [...new Set(s.arrivals.flatMap((a) => [a, a + 1]))].map((a) => start + a * slot);
  return { share: (day) => arrivedShare(day, start, slot, s.arrivals), turns };
}
