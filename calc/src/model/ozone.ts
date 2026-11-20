/**
 * The ozone layer: how fast the new oxygen becomes a shield against ultraviolet once the Veil lets
 * sunlight in, and how thick it ends up.
 *
 * A one-dimensional Chapman model, global mean. Sunlight below 242 nm splits O₂; each freed atom
 * joins an O₂ to make O₃; O₃ splits again in sunlight and dies when a free atom meets it. Each layer's
 * ozone depends only on the ozone above it (which shades it), so a steady state is one sweep from the
 * top down, and growth from nothing is a march in time, layer by layer, solved exactly over each step.
 * Sunlight and cross-sections are measured (calc/src/spectra.ts, from data/spectra/); the rate
 * constants are IUPAC's. Left out: the Schumann–Runge bands below 205 nm, which make more ozone; the
 * catalytic cycles (nitrogen, hydrogen and chlorine oxides), which destroy it; scattered light; and
 * the winds that carry ozone down into the lower stratosphere. Run on Earth's air with nothing
 * fitted, it gives Earth's column (check `ozone-model-earth`); that agreement is partly luck, since the
 * missing source and the missing sinks roughly cancel.
 */
import { formatQuantity } from "../format.ts";
import type { Point, Registry } from "../registry.ts";
import { SPECTRUM } from "../spectra.ts";
import { DAY_S } from "../time.ts";
import { fmt } from "./text.ts";

/** Global mean sunlight: the Sun at 60° from overhead, for half of each day. */
const MU = 0.5;
const DAYLIGHT = 0.5;
const LAYERS = 60;

interface Air {
  /** Surface pressure, Pa. */
  ps: number;
  /** Oxygen's share of the molecules. */
  xo2: number;
  g: number;
  /** Surface and stratosphere temperatures, K, and the lapse rate between, K/m. */
  ts: number;
  strat: number;
  lapse: number;
}

interface Layer {
  t: number;
  /** Number densities, m⁻³, and thickness, m. */
  o2: number;
  n2: number;
  dz: number;
}

interface Chem {
  k: number;
  /** O + O₂ + M → O₃ + M at 300 K, with O₂ and N₂ as M (m⁶/s), and its temperature exponent. */
  kO2: number;
  kN2: number;
  n: number;
  /** O + O₃ → 2 O₂: pre-factor (m³/s) and activation temperature (K). */
  a: number;
  ta: number;
  /** Mass of one O₂ and one N₂ molecule, kg. */
  mO2: number;
  mN2: number;
}

/** The air in layers of equal log pressure, from the top (a millionth of the surface pressure) down. */
function layers(air: Air, c: Chem): Layer[] {
  const m = air.xo2 * c.mO2 + (1 - air.xo2) * c.mN2;
  const top = air.ps * 1e-6;
  const level = (i: number) => top * (air.ps / top) ** (i / LAYERS);
  const out: Layer[] = [];
  let z = 0;
  for (let i = LAYERS; i > 0; i--) {
    const p0 = level(i);
    const p1 = level(i - 1);
    const t = Math.max(air.strat, air.ts - air.lapse * z);
    const dz = ((c.k * t) / (m * air.g)) * Math.log(p0 / p1);
    z += dz;
    const n = (p0 - p1) / (m * air.g) / dz;
    out.unshift({ t, o2: n * air.xo2, n2: n * (1 - air.xo2), dz });
  }
  return out;
}

/**
 * Daily-mean production P (m⁻³ s⁻¹) and the loss coefficient a (loss = a [O₃]², m³/s) in a layer,
 * given the O₂ and O₃ columns above its middle (m⁻²) and the sunlight as a multiple of 1 AU's.
 */
function rates(l: Layer, o2Above: number, o3Above: number, sun: number, c: Chem) {
  let j2 = 0;
  let j3 = 0;
  for (const [, , photons, s2, s3] of SPECTRUM) {
    const flux = photons * sun * Math.exp(-(s2 * o2Above + s3 * o3Above) / MU);
    j2 += s2 * flux;
    j3 += s3 * flux;
  }
  const k1 = (c.kO2 * l.o2 + c.kN2 * l.n2) * (l.t / 300) ** -c.n;
  const k2 = c.a * Math.exp(-c.ta / l.t);
  return { p: 2 * j2 * l.o2 * DAYLIGHT, a: (2 * k2 * j3 * DAYLIGHT) / (k1 * l.o2) };
}

/** The steady-state ozone column, m⁻²: one sweep down, each layer shaded by those above it. */
function steady(air: Air, sun: number, c: Chem): number {
  let o2 = 0;
  let o3 = 0;
  for (const l of layers(air, c)) {
    let x = 0;
    for (let it = 0; it < 6; it++) {
      const { p, a } = rates(l, o2 + (l.o2 * l.dz) / 2, o3 + (x * l.dz) / 2, sun, c);
      x = Math.sqrt(p / a);
    }
    o2 += l.o2 * l.dz;
    o3 += x * l.dz;
  }
  return o3;
}

/** Ozone columns overhead at which each layer's photolysis rates are tabulated, m⁻². */
const SHADES = [0, ...Array.from({ length: 100 }, (_, k) => 1e18 * 1.15 ** k)];
const LN_STEP = Math.log(1.15);

/**
 * A layer's photolysis rates for O₂ and O₃ (s⁻¹) against the ozone column above it, tabulated once,
 * since O₂'s shading never changes. Read back by interpolating the logarithm.
 */
function photolysis(o2Above: number, sun: number) {
  const lit = SPECTRUM.map(([, , photons, s2, s3]) => ({
    f: photons * sun * Math.exp((-s2 * o2Above) / MU),
    s2,
    s3,
  })).filter((b) => b.f > 1);
  const ln2: number[] = [];
  const ln3: number[] = [];
  for (const shade of SHADES) {
    let j2 = 1e-300;
    let j3 = 1e-300;
    for (const b of lit) {
      const flux = b.f * Math.exp((-b.s3 * shade) / MU);
      j2 += b.s2 * flux;
      j3 += b.s3 * flux;
    }
    ln2.push(Math.log(j2));
    ln3.push(Math.log(j3));
  }
  return (shade: number) => {
    const u = shade < 1e18 ? shade / 1e18 : 1 + Math.log(shade / 1e18) / LN_STEP;
    const k = Math.min(Math.floor(u), SHADES.length - 2);
    const w = u - k;
    const j = (ln: number[]) => Math.exp((ln[k] as number) * (1 - w) + (ln[k + 1] as number) * w);
    return { j2: j(ln2), j3: j(ln3) };
  };
}

/** Steps per day: a hundred times more move the dates by at most a day and the column by under 1%. */
const STEPS = 12;

/**
 * The column, m⁻², at the end of each day after sunlight reaches air with no ozone, until `done`
 * says stop or two years pass. Each step solves dN/dt = P − aN² exactly in each layer, with P and a
 * fixed over the step.
 */
function growth(
  air: Air,
  sun: number,
  c: Chem,
  done: (days: number, column: number) => boolean,
  steps = STEPS,
): number[] {
  const ls = layers(air, c);
  let o2Above = 0;
  const lay = ls.map((l) => {
    const j = photolysis(o2Above + (l.o2 * l.dz) / 2, sun);
    o2Above += l.o2 * l.dz;
    const k1 = (c.kO2 * l.o2 + c.kN2 * l.n2) * (l.t / 300) ** -c.n;
    return { l, j, k2: c.a * Math.exp(-c.ta / l.t), k1 };
  });
  const o3 = ls.map(() => 0);
  const dt = DAY_S / steps;
  const out: number[] = [];
  for (let d = 0; d < 730 && !done(out.length, out.at(-1) ?? 0); d++) {
    for (let s = 0; s < steps; s++) {
      // The sweep runs down, so the layers above are already stepped: each layer is shaded by
      // their ozone averaged over the step, and by half its own, found by iterating.
      let before = 0;
      let after = 0;
      lay.forEach(({ l, j, k1, k2 }, i) => {
        const x = o3[i] as number;
        let y = x;
        for (let it = 0; it < 2; it++) {
          const { j2, j3 } = j((before + after) / 2 + (((x + y) / 2) * l.dz) / 2);
          const p = 2 * j2 * l.o2 * DAYLIGHT;
          const a = (2 * k2 * j3 * DAYLIGHT) / (k1 * l.o2);
          const e = Math.sqrt(p / a);
          const k = Math.sqrt(p * a) * dt;
          y = x < e ? e * Math.tanh(k + Math.atanh(x / e)) : e / Math.tanh(k + Math.atanh(e / x));
        }
        o3[i] = y;
        before += x * l.dz;
        after += y * l.dz;
      });
    }
    out.push(o3.reduce((t, x, i) => t + x * (ls[i] as Layer).dz, 0));
  }
  return out;
}

/** A series' value at x, by straight lines between its points. */
function at(points: Point[], x: number): number {
  const i = points.findIndex((p) => p.x >= x);
  if (i <= 0) return (points[i < 0 ? points.length - 1 : 0] as Point).y;
  const a = points[i - 1] as Point;
  const b = points[i] as Point;
  return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
}

export function ozone(r: Registry) {
  const { v } = r.in("model/ozone.ts");
  const chem = (): Chem => {
    const na = v("gas-constant") / v("boltzmann-constant");
    return {
      k: v("boltzmann-constant"),
      kO2: v("o-o2-rate-o2"),
      kN2: v("o-o2-rate-n2"),
      n: v("o-o2-rate-exponent"),
      a: v("o-o3-rate"),
      ta: v("o-o3-activation-temp"),
      mO2: v("o2-molar-mass") / na,
      mN2: v("n2-molar-mass") / na,
    };
  };
  const earthAir = (): Air => ({
    ps: v("earth-sea-level-pressure"),
    xo2: v("earth-o2-fraction"),
    g: v("standard-gravity"),
    ts: v("earth-surface-temp"),
    strat: v("earth-strat-temp"),
    lapse: v("earth-lapse-rate"),
  });
  /** Venus's new air, given its pressure and oxygen; it is assumed to take Earth's profile. */
  const venusAir = (ps: number, po2: number): Air => ({
    ps,
    xo2: po2 / ps,
    g: v("venus-gravity"),
    ts: v("genesis-air-temp"),
    strat: v("earth-strat-temp"),
    lapse: v("earth-lapse-rate"),
  });

  r.q(
    "ozone-sunlight",
    {
      label: "Sunlight under the open Veil, as a multiple of Earth's",
      unit: "1",
      sig: 3,
      formula: "T_day × (1 AU / a_Venus)²",
      basis: "physics",
      note: "The Veil blocks every colour alike, so the ultraviolet that makes ozone arrives in the same share as the rest of the light.",
    },
    () => v("veil-day-transmission") * (v("au") / v("venus-orbit")) ** 2,
  );
  r.q(
    "ozone-model-earth",
    {
      label: "Earth's ozone column, as this model computes it",
      unit: "1/m2",
      show: "DU",
      sig: 3,
      formula: "steady-state Chapman column, Earth's air, nothing fitted",
      basis: "physics",
    },
    () => steady(earthAir(), 1, chem()),
  );
  r.q(
    "ozone-steady",
    {
      label: "Venus's ozone column once it settles",
      unit: "1/m2",
      show: "DU",
      sig: 3,
      formula: "steady-state Chapman column, the 2036 air, under the open Veil",
      basis: "physics",
    },
    () =>
      steady(venusAir(v("final-pressure"), v("o2-target-pressure")), v("ozone-sunlight"), chem()),
  );
  r.q(
    "ozone-o2-at-opening",
    {
      label: "Oxygen in the air when the Veil opens",
      unit: "Pa",
      show: "bar",
      sig: 2,
      formula: "simulated O₂ pressure on the day the air starts to warm",
      basis: "physics",
    },
    () => {
      v("traj-warming");
      return at(r.series.get("traj-o2")?.points ?? [], v("traj-warming"));
    },
  );

  // Ozone forms only in sunlight, and the Veil is closed until the caps are sealed: start from none.
  let grown: number[] | undefined;
  const grow = () => {
    v("ozone-o2-at-opening");
    v("genesis-start");
    v("ozone-shield-column");
    if (grown) return grown;
    const ps = at(r.series.get("traj-pressure")?.points ?? [], v("traj-warming"));
    const air = venusAir(ps, v("ozone-o2-at-opening"));
    // Grow until seeding and until the shield is up, whichever is later.
    const need = Math.max(1, Math.ceil(v("genesis-start") - v("traj-warming")));
    const shield = v("ozone-shield-column");
    grown = growth(air, v("ozone-sunlight"), chem(), (d, col) => d >= need && col >= shield);
    return grown;
  };
  r.q(
    "ozone-first-day",
    {
      label: "Ozone column one day after the Veil opens",
      unit: "1/m2",
      show: "DU",
      sig: 3,
      formula: "Chapman column grown from none, one day of sunlight",
      basis: "physics",
    },
    () => grow()[0] as number,
  );
  r.q(
    "ozone-shield-days",
    {
      label: "Days of sunlight until the ozone shields the land",
      unit: "d",
      sig: 2,
      formula: "first day the grown column reaches the shield column",
      basis: "physics",
    },
    () => {
      const g = grow();
      const i = g.findIndex((x) => x >= v("ozone-shield-column"));
      return i < 0 ? Number.POSITIVE_INFINITY : i + 1;
    },
  );
  r.q(
    "ozone-shield-date",
    {
      label: "The ozone shields the land",
      unit: "date",
      formula: "Veil opens + days to the shield column",
      basis: "physics",
    },
    () => v("traj-warming") + v("ozone-shield-days"),
  );
  r.q(
    "ozone-at-seeding",
    {
      label: "Ozone column when seeding begins",
      unit: "1/m2",
      show: "DU",
      sig: 3,
      formula: "Chapman column grown from none, from the Veil opening to seeding",
      basis: "physics",
    },
    () => {
      const g = grow();
      return g[Math.max(0, Math.ceil(v("genesis-start") - v("traj-warming")) - 1)] as number;
    },
  );

  r.c(
    "ozone-model-earth",
    {
      label: "The ozone model, run on Earth's air, gives Earth's ozone column",
      kind: "validation",
    },
    () => {
      const ratio = v("ozone-model-earth") / v("earth-ozone-column");
      return {
        pass: Math.abs(ratio - 1) <= 0.25,
        detail: `${fmt(r, "ozone-model-earth")} against ${fmt(r, "earth-ozone-column")} from a three-dimensional model of the pre-industrial Earth, within a quarter either way, with nothing fitted.`,
      };
    },
  );
  r.q(
    "genesis-land-start",
    {
      label: "Land seeding begins: the later of the ocean seeding and the ozone shield",
      unit: "date",
      formula: "max(seeding begins, ozone shields the land)",
      basis: "design",
      note: "Ocean life is shielded by the water above it and starts with the seeding. Lichens and mosses on bare rock wait for the shield.",
    },
    () => Math.max(v("genesis-start"), v("ozone-shield-date")),
  );
  r.c(
    "ozone-shield-in-time",
    { label: "The ozone shields the land before the deadline", kind: "schedule" },
    () => {
      const day = (id: string) => formatQuantity({ ...r.get(id), value: v(id) }, { date: "day" });
      return {
        pass: v("ozone-shield-date") <= v("deadline"),
        detail: `One day of sunlight makes ${fmt(r, "ozone-first-day")}, easily measured. The column reaches ${fmt(r, "ozone-shield-column")} on ${day("ozone-shield-date")}, ${fmt(r, "ozone-shield-days")} after the Veil opens, so lichens and mosses go onto land from ${day("genesis-land-start")}, against a deadline of ${day("deadline")}.`,
      };
    },
  );
}
