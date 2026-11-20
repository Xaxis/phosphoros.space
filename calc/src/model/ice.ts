/** Ceres Ice Train: coilguns on Ceres throw water ice onto transfer orbits to Venus. */
import { circularSpeed, hohmann, offWindowPenalty, period } from "../physics.ts";
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";
import { fmt } from "./text.ts";

export function iceTrain(r: Registry) {
  const { v } = r.in("model/ice.ts");
  const transfer = () => hohmann(v("sun-mu"), v("ceres-orbit"), v("venus-orbit"));

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
      label: "Kick to drop from Ceres's orbit onto a transfer to Venus",
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
      label: "Railhead muzzle speed (the kick plus climbing out of Ceres)",
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
      label: "Ice arrival speed relative to Venus, far out",
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
      label: "Transfer time from Ceres to Venus",
      unit: "d",
      show: "yr",
      sig: 3,
      formula: "π √(a_t³ / μ_☉)",
      basis: "physics",
    },
    () => transfer().time / DAY_S,
  );
  r.q(
    "ice-launch-start",
    {
      label: "First Ice Bricks leave Ceres",
      unit: "date",
      formula: "the Lattice's full-power date",
      basis: "design",
      note: "The Railheads need the Lattice's beams, so launches start when it reaches full power.",
    },
    () => v("helios-full-power"),
  );
  r.q(
    "ice-launch-end",
    {
      label: "Last Ice Bricks leave Ceres",
      unit: "date",
      formula: "deadline − transfer time − lowering margin",
      basis: "physics",
    },
    () => v("deadline") - v("ice-transfer-days") - v("ice-lowering-margin"),
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
    () => (v("ice-launch-end") - v("ice-launch-start")) * DAY_S,
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
      formula: "v² / (2a)",
      basis: "invented",
    },
    () => v("ice-launch-speed") ** 2 / (2 * v("railhead-accel") * v("standard-gravity")),
  );
  r.q(
    "railhead-shot-time",
    {
      label: "Time a Brick spends in the barrel",
      unit: "s",
      sig: 2,
      formula: "v / a",
      basis: "invented",
    },
    () => v("ice-launch-speed") / (v("railhead-accel") * v("standard-gravity")),
  );
  r.q(
    "brick-side",
    { label: "Ice Brick edge", unit: "m", sig: 3, formula: "∛(M_brick / ρ_ice)", basis: "design" },
    () => Math.cbrt(v("brick-mass") / v("ice-density")),
  );
  r.q(
    "shot-energy",
    {
      label: "Kinetic energy of one Brick",
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
      label: "Energy drawn per shot at 50% efficiency",
      unit: "J",
      formula: "½ M v² / η",
      basis: "invented",
    },
    () => v("shot-energy") / v("railhead-efficiency"),
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
  const offWindow = () =>
    offWindowPenalty(v("sun-mu"), v("ceres-orbit"), v("venus-orbit"), v("ceres-escape"));
  r.q(
    "launch-offwindow-max",
    {
      label: "Extra launch energy for a shot at the worst time between windows",
      unit: "1",
      show: "%",
      sig: 2,
      formula:
        "max over launch phase of the cheapest transfer that meets Venus, (Δv² + v_esc²) / (Δv_H² + v_esc²) − 1",
      basis: "physics",
      note: "Lambert transfers between circular, coplanar orbits, as the Hohmann transfer assumes, trying every transfer angle for each launch phase.",
    },
    () => offWindow().max,
  );
  r.q(
    "launch-offwindow-mean",
    {
      label: "Average extra launch energy, firing all the time",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "mean over launch phase of the same penalty",
      basis: "physics",
      note: "The Railheads fire at a steady rate through every phase of the synodic cycle, so each phase gets an equal share of the ice.",
    },
    () => offWindow().mean,
  );
  r.q(
    "launch-energy-per-kg-avg",
    {
      label: "Energy drawn per kilogram launched, averaged over the campaign",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 3,
      formula: "½ v² / η × (1 + mean off-window penalty)",
      basis: "invented",
    },
    () => v("launch-energy-per-kg") * (1 + v("launch-offwindow-mean")),
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
      label: "Extra energy for the shots fired between windows",
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
    "ceres-recoil",
    {
      label: "Speed Ceres gains from throwing the ice",
      unit: "m/s",
      show: "km/s",
      sig: 2,
      formula: "M_ice v / (M_C − M_ice)",
      basis: "physics",
      note: "As if thrown all at once; in practice spread over half an orbit.",
    },
    () => (v("ice-mass") * v("ice-launch-speed")) / (v("ceres-mass") - v("ice-mass")),
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
      formula: "first launch + transfer",
      basis: "physics",
    },
    () => v("ice-launch-start") + v("ice-transfer-days"),
  );
  r.q(
    "last-arrival",
    {
      label: "Last Bricks reach Venus",
      unit: "date",
      formula: "last launch + transfer",
      basis: "physics",
    },
    () => v("ice-launch-end") + v("ice-transfer-days"),
  );
  r.q(
    "ice-transfer-years",
    {
      label: "Transfer time in years",
      unit: "s",
      show: "yr",
      sig: 3,
      formula: "days × 86,400 s",
      basis: "physics",
    },
    () => v("ice-transfer-days") * DAY_S,
  );
  r.c(
    "ice-arrives",
    { label: "The last Brick arrives before the deadline", kind: "schedule" },
    () => ({
      pass: v("last-arrival") <= v("deadline"),
      detail: `Last launch ${fmt(r, "ice-launch-end", { date: "day" })}, a ${fmt(r, "ice-transfer-days", { show: "yr" })} transfer, last arrival ${fmt(r, "last-arrival", { date: "day" })}.`,
    }),
  );
}
