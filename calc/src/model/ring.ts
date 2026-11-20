/** Braking Ring: an orbital ring that catches the ice, turns its speed into electricity and lowers it. */
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";

export function ring(r: Registry) {
  const { v } = r.in("model/ring.ts");

  r.q(
    "ring-radius",
    {
      label: "Ring radius from Venus's centre",
      unit: "m",
      show: "km",
      sig: 4,
      formula: "R_V + h",
      basis: "design",
    },
    () => v("venus-radius") + v("ring-altitude"),
  );
  r.q(
    "ring-circumference",
    {
      label: "Ring circumference",
      unit: "m",
      show: "km",
      sig: 4,
      formula: "2π (R_V + h)",
      basis: "design",
    },
    () => 2 * Math.PI * v("ring-radius"),
  );
  r.q(
    "ring-orbital-speed",
    {
      label: "Orbital speed at the Ring",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "√(G M_V / r)",
      basis: "physics",
    },
    () => Math.sqrt(v("venus-gm") / v("ring-radius")),
  );
  r.q(
    "ring-gravity",
    { label: "Gravity at the Ring", unit: "m/s2", sig: 3, formula: "G M_V / r²", basis: "physics" },
    () => v("venus-gm") / v("ring-radius") ** 2,
  );
  r.q(
    "ring-arrival-speed",
    {
      label: "Brick speed at Ring height",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "√(v∞² + 2 G M_V / r)",
      basis: "physics",
    },
    () => Math.sqrt(v("ice-vinf") ** 2 + (2 * v("venus-gm")) / v("ring-radius")),
  );
  r.q(
    "ring-mass",
    { label: "Ring mass", unit: "kg", formula: "rotor + stator", basis: "invented" },
    () => v("ring-rotor-mass") + v("ring-stator-mass"),
  );
  r.q(
    "ring-catch-energy-per-kg",
    {
      label: "Motion energy per kilogram the catch removes",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 3,
      formula: "½ (v_arrive² − v_orbit²)",
      basis: "physics",
    },
    () => 0.5 * (v("ring-arrival-speed") ** 2 - v("ring-orbital-speed") ** 2),
  );
  r.q(
    "ring-recovered-per-kg",
    {
      label: "Electricity per kilogram caught",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 2,
      formula: "η × ½ (v_arrive² − v_orbit²)",
      basis: "invented",
    },
    () => v("ring-recovery-efficiency") * v("ring-catch-energy-per-kg"),
  );
  r.q(
    "ring-recovered-energy",
    {
      label: "Electricity the Ring recovers catching all the ice",
      unit: "J",
      formula: "M_ice × e",
      basis: "invented",
    },
    () => v("ice-mass") * v("ring-recovered-per-kg"),
  );
  r.q(
    "ring-catch-energy",
    {
      label: "Motion energy of all the ice, caught",
      unit: "J",
      formula: "M_ice ½ (v_arrive² − v_orbit²)",
      basis: "physics",
    },
    () => v("ice-mass") * v("ring-catch-energy-per-kg"),
  );
  r.q(
    "ring-loss-energy",
    {
      label: "Heat the Ring sheds braking all the ice",
      unit: "J",
      formula: "E_caught − E_recovered",
      basis: "physics",
    },
    () => v("ring-catch-energy") - v("ring-recovered-energy"),
  );
  r.q(
    "ring-power",
    { label: "Ring power at the full catch rate", unit: "W", formula: "ṁ × e", basis: "invented" },
    () => v("ice-throughput") * v("ring-recovered-per-kg"),
  );
  r.q(
    "ring-vs-launch",
    {
      label: "Electricity recovered per kilogram over electricity spent to launch it",
      unit: "1",
      sig: 2,
      formula: "e_recovered / e_launch",
      basis: "invented",
    },
    () => v("ring-recovered-per-kg") / v("launch-energy-per-kg"),
  );
  r.q(
    "ring-lowering-recovery",
    {
      label: "Electricity recovered slowing parked ice to rest",
      unit: "J",
      formula: "η M_ice ½ v_orbit²",
      basis: "invented",
    },
    () => v("ring-recovery-efficiency") * v("ice-mass") * 0.5 * v("ring-orbital-speed") ** 2,
  );
  r.q(
    "ring-free-fall-impact",
    {
      label: "Heat ice from Ceres would bring, falling freely onto Venus",
      unit: "J",
      formula: "M_ice ½ (v∞² + v_esc²)",
      basis: "physics",
    },
    () => v("ice-mass") * 0.5 * (v("ice-vinf") ** 2 + v("venus-escape") ** 2),
  );
  r.q(
    "ring-free-fall-speed",
    {
      label: "Speed of ice falling freely onto Venus",
      unit: "m/s",
      show: "km/s",
      sig: 3,
      formula: "√(v∞² + v_esc²)",
      basis: "physics",
    },
    () => Math.sqrt(v("ice-vinf") ** 2 + v("venus-escape") ** 2),
  );
  r.q(
    "ring-free-fall-vs-atmosphere",
    {
      label: "Free-fall heat compared with the atmosphere's heat",
      unit: "1",
      sig: 2,
      formula: "E_impact / E_atm",
      basis: "physics",
    },
    () => v("ring-free-fall-impact") / v("atmosphere-heat"),
  );
  r.q(
    "ring-braking-force",
    {
      label: "Braking force on the Ring at the full catch rate",
      unit: "N",
      sig: 2,
      formula: "ṁ (v_arrive − v_orbit)",
      basis: "physics",
    },
    () => v("ice-throughput") * (v("ring-arrival-speed") - v("ring-orbital-speed")),
  );
  r.q(
    "ring-approach-eccentricity",
    {
      label: "Eccentricity of a Brick's path past Venus at Ring height",
      unit: "1",
      sig: 3,
      formula: "1 + r v∞² / (G M_V)",
      basis: "physics",
    },
    () => 1 + (v("ring-radius") * v("ice-vinf") ** 2) / v("venus-gm"),
  );
  r.q(
    "ring-net-braking-force",
    {
      label: "Net braking force on the Ring, east and west catches together",
      unit: "N",
      sig: 2,
      formula: "F √(1 − 1/e²)",
      basis: "physics",
      note: "Every Brick arrives from the same direction. The eastbound and westbound streams graze the Ring at mirror-image points, each turned half the path's bend, asin(1/e), from that direction. Their sideways pushes cancel; their forward pushes add.",
    },
    () => v("ring-braking-force") * Math.sqrt(1 - 1 / v("ring-approach-eccentricity") ** 2),
  );
  r.q(
    "ring-track-length",
    {
      label: "Catcher track length",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "(v_arrive² − v_orbit²) / (2a)",
      basis: "invented",
    },
    () =>
      (v("ring-arrival-speed") ** 2 - v("ring-orbital-speed") ** 2) /
      (2 * v("ring-catch-accel") * v("standard-gravity")),
  );
  r.q(
    "brick-catch-stress",
    {
      label: "Stress in a Brick braked at 50 g",
      unit: "Pa",
      show: "MPa",
      sig: 2,
      formula: "ρ_ice a L",
      basis: "physics",
    },
    () => v("ice-density") * v("ring-catch-accel") * v("standard-gravity") * v("brick-side"),
  );
  // What holds the Ring up: its rotor moves faster than orbital speed, so it presses outward.
  r.q(
    "ring-lift",
    {
      label: "Spare lift the rotor gives after carrying the stator",
      unit: "N",
      sig: 2,
      formula: "M_rotor (v_rotor² / r − g) − M_stator g",
      basis: "physics",
    },
    () =>
      v("ring-rotor-mass") * (v("ring-rotor-speed") ** 2 / v("ring-radius") - v("ring-gravity")) -
      v("ring-stator-mass") * v("ring-gravity"),
  );
  r.q(
    "ring-net-overload",
    {
      label: "Net braking force over the Ring's spare lift",
      unit: "1",
      sig: 2,
      formula: "F_net / F_lift",
      basis: "physics",
    },
    () => v("ring-net-braking-force") / v("ring-lift"),
  );
  r.q(
    "ring-hang-capacity",
    {
      label: "Mass the Ring can hold hanging at rest",
      unit: "kg",
      sig: 2,
      formula: "F_lift / g",
      basis: "physics",
    },
    () => v("ring-lift") / v("ring-gravity"),
  );
  r.q(
    "lowering-seconds",
    {
      label: "Lowering campaign",
      unit: "s",
      show: "months",
      sig: 2,
      formula: "end − start",
      basis: "design",
    },
    () => (v("lowering-end") - v("lowering-start")) * DAY_S,
  );
  r.q(
    "lowering-rate",
    {
      label: "Ice lowered per second",
      unit: "kg/s",
      sig: 2,
      formula: "M_ice / campaign",
      basis: "design",
    },
    () => v("ice-mass") / v("lowering-seconds"),
  );
  r.q(
    "tether-interval",
    {
      label: "Seconds between Bricks on each tether lift",
      unit: "s",
      sig: 2,
      formula: "N_lifts M_brick / ṁ",
      basis: "design",
    },
    () => (v("ring-tether-lifts") * v("brick-mass")) / v("lowering-rate"),
  );
  r.q(
    "lowering-support",
    {
      label: "Least force needed to lower the ice from the Ring to 100 km",
      unit: "N",
      sig: 2,
      formula: "ṁ √(2 g Δh)",
      basis: "physics",
      note: "Bringing ice to rest 300 km lower takes at least the momentum it would gain falling that far, every second: ṁ times its free-fall speed.",
    },
    () =>
      v("lowering-rate") *
      Math.sqrt(2 * v("ring-gravity") * (v("ring-altitude") - v("lowering-release-altitude"))),
  );
  r.q(
    "lowering-overload",
    {
      label: "Lowering force over the Ring's spare lift",
      unit: "1",
      sig: 2,
      formula: "F_lowering / F_lift",
      basis: "physics",
    },
    () => v("lowering-support") / v("ring-lift"),
  );
  r.q(
    "fall-energy",
    {
      label: "Energy a Brick gains falling from 100 km to the surface",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 2,
      formula: "G M_V (1/R_V − 1/(R_V + 100 km))",
      basis: "physics",
    },
    () =>
      v("venus-gm") *
      (1 / v("venus-radius") - 1 / (v("venus-radius") + v("lowering-release-altitude"))),
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
  r.q(
    "ring-drop-energy",
    {
      label: "Energy a Brick gains falling from rest at the Ring to the surface",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 2,
      formula: "G M_V (1/R_V − 1/(R_V + h))",
      basis: "physics",
    },
    () => v("venus-gm") * (1 / v("venus-radius") - 1 / v("ring-radius")),
  );
  r.q(
    "ring-drop-extra-heat",
    {
      label: "Extra heat if the ice is dropped from the Ring instead of lowered",
      unit: "J",
      formula: "M_ice (e_drop − e_fall)",
      basis: "physics",
    },
    () => v("ice-mass") * (v("ring-drop-energy") - v("fall-energy")),
  );
  r.c(
    "ring-energy-loop",
    { label: "The Ring recovers more power than the Railheads draw", kind: "conservation" },
    () => ({
      pass: v("ring-power") >= v("railhead-power"),
      detail: `Ring ${v("ring-power").toExponential(2)} W recovered against ${v("railhead-power").toExponential(2)} W drawn by the Railheads.`,
    }),
  );
  r.c(
    "ring-net-force",
    {
      label: "The Ring can pass the catch's net braking force to Venus",
      kind: "force",
      issue: "ring-net-force",
    },
    () => ({
      pass: v("ring-net-braking-force") <= v("ring-lift"),
      detail: `Catching half the Bricks eastbound and half westbound cancels the twist, not the force: ${v("ring-net-braking-force").toExponential(1)} N remains along Venus's orbital motion. An orbital ring has no stiff way to hand an in-plane force to the planet; its spare lift is ${v("ring-lift").toExponential(1)} N, ${Math.round(v("ring-net-overload"))} times too little.`,
    }),
  );
  r.c(
    "ring-lowering-load",
    {
      label: "The Ring can carry the force of lowering the ice on tethers",
      kind: "capacity",
      issue: "ring-lowering",
    },
    () => ({
      pass: v("lowering-support") <= v("ring-lift"),
      detail: `Lowering ${v("lowering-rate").toExponential(2)} kg/s needs at least ${v("lowering-support").toExponential(1)} N; the rotor's spare lift is ${v("ring-lift").toExponential(1)} N, ${Math.round(v("lowering-overload"))} times too little.`,
    }),
  );
}
