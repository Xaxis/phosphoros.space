/**
 * Hesperus Veil: the sunshade. Version 2 of the plan hovered it 137,000 km sunward as a statite;
 * this module shows why that cannot work (light pressure and Venus's gravity both push toward
 * Venus) and places the Veil where the forces do balance: just sunward of the Sun-Venus L1 point.
 */
import { bisect, sunwardBalance } from "../physics.ts";
import type { Registry } from "../registry.ts";

export function veil(r: Registry) {
  const { v } = r.in("model/veil.ts");

  const shadeRadius = (x: number) =>
    v("venus-radius") + ((v("sun-radius") - v("venus-radius")) * x) / v("venus-orbit");

  // --- Version 2: the statite ------------------------------------------------------------------
  r.q(
    "veil-v2-light-accel",
    {
      label: "Light-pressure acceleration on a 1 g/m² mirror at Venus",
      unit: "m/s2",
      sig: 3,
      formula: "2 S_V / (c σ)",
      basis: "physics",
    },
    () => (2 * v("venus-sunlight")) / (v("speed-of-light") * v("veil-areal-density")),
  );
  r.q(
    "veil-v2-distance",
    {
      label: "Version 2 statite distance, where light pressure equals Venus's gravity",
      unit: "m",
      show: "km",
      sig: 3,
      formula: "√(G M_V / a_light)",
      basis: "physics",
    },
    () => Math.sqrt(v("venus-gm") / v("veil-v2-light-accel")),
  );
  r.q(
    "veil-v2-radius",
    {
      label: "Version 2 shade radius for full shadow",
      unit: "m",
      show: "km",
      sig: 3,
      formula: "R_V + x (R_☉ − R_V) / a_V",
      basis: "physics",
    },
    () => shadeRadius(v("veil-v2-distance")),
  );
  r.q(
    "veil-v2-area",
    { label: "Version 2 shade area", unit: "m2", formula: "π R²", basis: "physics" },
    () => Math.PI * v("veil-v2-radius") ** 2,
  );
  r.q(
    "veil-v2-mass",
    { label: "Version 2 shade mass", unit: "kg", formula: "σ A", basis: "physics" },
    () => v("veil-areal-density") * v("veil-v2-area"),
  );
  r.q(
    "veil-v2-net-accel",
    {
      label: "Unbalanced acceleration on the version 2 statite, toward Venus",
      unit: "m/s2",
      sig: 3,
      formula: "a_light + G M_V / x² − 3 n² x",
      basis: "physics",
      note: "Sunlight travels from the Sun toward Venus, so it pushes a sunward shade toward Venus, the same way Venus's gravity pulls it. Nothing pulls back.",
    },
    () => {
      const x = v("veil-v2-distance");
      const n2 = (v("sun-mu") + v("venus-gm")) / v("venus-orbit") ** 3;
      return v("veil-v2-light-accel") + v("venus-gm") / x ** 2 - 3 * n2 * x;
    },
  );
  r.q(
    "veil-v2-fall-days",
    {
      label: "Days for the version 2 statite to fall onto Venus",
      unit: "d",
      sig: 2,
      formula: "≈ √(2x / a)",
      basis: "physics",
      note: "Constant-acceleration estimate: the acceleration grows as it falls, so the real fall is faster.",
    },
    () => Math.sqrt((2 * v("veil-v2-distance")) / v("veil-v2-net-accel")) / 86_400,
  );
  r.c(
    "veil-v2-hovers",
    {
      label: "Version 2: a statite Veil 137,000 km sunward of Venus can hover",
      kind: "force",
      issue: "veil-statite",
    },
    () => ({
      pass: Math.abs(v("veil-v2-net-accel")) < 1e-6,
      detail: `Light pressure (${v("veil-v2-light-accel").toFixed(4)} m/s²) and Venus's gravity both point toward Venus; the shade falls with ${v("veil-v2-net-accel").toFixed(4)} m/s² and reaches Venus in about ${Math.max(1, Math.round(v("veil-v2-fall-days")))} day${Math.round(v("veil-v2-fall-days")) > 1 ? "s" : ""}.`,
    }),
  );

  // --- Version 3: sunward of L1 ----------------------------------------------------------------
  const balance = (x: number, beta: number) =>
    sunwardBalance(x, { muSun: v("sun-mu"), muPlanet: v("venus-gm"), a: v("venus-orbit"), beta });

  r.q(
    "venus-l1-distance",
    {
      label: "Distance from Venus to the Sun-Venus L1 point",
      unit: "m",
      show: "km",
      sig: 3,
      formula: "root of the rotating-frame force balance, β = 0",
      basis: "physics",
    },
    () => bisect((x) => balance(x, 0), 1e8, 5e9),
  );
  r.q(
    "veil-beta",
    {
      label: "Veil lightness: light pressure over solar gravity",
      unit: "1",
      sig: 2,
      formula: "f L_☉ / (4π c σ G M_☉)",
      basis: "invented",
      note: "f is the share of sunlight's momentum the light-bending film takes up. A mirror takes up to 2, a black sheet 1; a film that bends light by a few degrees takes about 0.01.",
    },
    () =>
      (v("veil-momentum-fraction") * v("sun-luminosity")) /
      (4 * Math.PI * v("speed-of-light") * v("veil-areal-density") * v("sun-mu")),
  );
  r.q(
    "veil-distance",
    {
      label: "Veil station, sunward of Venus",
      unit: "m",
      show: "km",
      sig: 3,
      formula: "root of the rotating-frame force balance with light pressure β",
      basis: "physics",
    },
    () => bisect((x) => balance(x, v("veil-beta")), v("venus-l1-distance") * 0.999, 1e10),
  );
  r.q(
    "veil-radius",
    {
      label: "Veil radius for full shadow",
      unit: "m",
      show: "km",
      sig: 3,
      formula: "R_V + x (R_☉ − R_V) / a_V",
      basis: "physics",
    },
    () => shadeRadius(v("veil-distance")),
  );
  r.q(
    "veil-penumbra-margin",
    {
      label: "How far the Veil reaches beyond Venus's radius",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "R − R_V",
      basis: "physics",
    },
    () => v("veil-radius") - v("venus-radius"),
  );
  r.q(
    "veil-area",
    { label: "Veil area", unit: "m2", formula: "π R²", basis: "invented" },
    () => Math.PI * v("veil-radius") ** 2,
  );
  r.q(
    "veil-mass",
    { label: "Veil mass", unit: "kg", formula: "σ A", basis: "invented" },
    () => v("veil-areal-density") * v("veil-area"),
  );
  r.q(
    "veil-area-vs-v2",
    {
      label: "Veil area compared with the version 2 statite",
      unit: "1",
      sig: 2,
      formula: "A / A_v2",
      basis: "physics",
    },
    () => v("veil-area") / v("veil-v2-area"),
  );
  r.q(
    "veil-l1-area",
    {
      label: "Area of a full shade exactly at L1",
      unit: "m2",
      formula: "π (R_V + x_L1 (R_☉ − R_V) / a_V)²",
      basis: "physics",
    },
    () => Math.PI * shadeRadius(v("venus-l1-distance")) ** 2,
  );
  r.q(
    "veil-slat-area",
    {
      label: "Area of one slat",
      unit: "m2",
      show: "km2",
      sig: 2,
      formula: "side²",
      basis: "design",
    },
    () => v("veil-slat-side") ** 2,
  );
  r.q(
    "veil-slats",
    { label: "Number of slats", unit: "count", formula: "A / A_slat", basis: "design" },
    () => v("veil-area") / v("veil-slat-area"),
  );
  r.q(
    "veil-slat-mass",
    {
      label: "Mass of one slat",
      unit: "kg",
      show: "t",
      sig: 2,
      formula: "σ A_slat",
      basis: "design",
    },
    () => v("veil-areal-density") * v("veil-slat-area"),
  );
  r.q(
    "veil-net-accel",
    {
      label: "Residual acceleration at the Veil's station",
      unit: "m/s2",
      sig: 1,
      formula: "rotating-frame force balance at x",
      basis: "physics",
    },
    () => balance(v("veil-distance"), v("veil-beta")),
  );
  r.c(
    "veil-hovers",
    {
      label: "The Veil's station balances gravity, light pressure and orbital motion",
      kind: "force",
    },
    () => ({
      pass: Math.abs(v("veil-net-accel")) < 1e-9,
      detail: `At ${(v("veil-distance") / 1e9).toFixed(3)} million km sunward the residual is ${v("veil-net-accel").toExponential(1)} m/s², nil; slats trim the small, slow drift of this unstable point by tilting.`,
    }),
  );
  r.q(
    "veil-light-delay",
    {
      label: "Light time from Venus to the Veil",
      unit: "s",
      sig: 2,
      formula: "x / c",
      basis: "physics",
    },
    () => v("veil-distance") / v("speed-of-light"),
  );
  r.q(
    "veil-blocked-power",
    {
      label: "Sunlight the closed Veil turns away",
      unit: "W",
      formula: "block × S_V π R_V²",
      basis: "physics",
    },
    () => v("veil-block-fraction") * v("venus-intercepted"),
  );
  r.q(
    "veil-day-transmission",
    {
      label: "Veil setting for Earth-strength daylight",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "S_⊕ / S_V",
      basis: "physics",
    },
    () => v("solar-constant-earth") / v("venus-sunlight"),
  );
  r.q(
    "lantern-area",
    {
      label: "Lantern mirror area to light the night side at Earth strength",
      unit: "m2",
      formula: "(S_⊕ / S_V) π R_V²",
      basis: "physics",
    },
    () => v("veil-day-transmission") * v("venus-disk"),
  );
}
