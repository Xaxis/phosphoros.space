/**
 * What the animated Venus shows on a given day of the plan. Pure: the same day always gives the
 * same picture. Dates come from the model; the air's temperature, pressure and oxygen follow the
 * model's day-by-day simulation, so the planet clears, freezes and greens when the plan says it does.
 */
import type { HeroData } from "./types";

/** Every value runs from 0 (absent) to 1 (fully there). */
export interface Stage {
  /** Sunlight reaching Venus, as a share of today's. */
  sun: number;
  /** How much of the Veil is built. */
  veil: number;
  /** The Veil's slats turned open for daylight. */
  veilOpen: number;
  aegis: number;
  /** Helios light beamed to the Exhaust's tiles on the side of Venus the Lattice sees, while they pump. */
  beams: number;
  /** Photonic Exhaust activity, from the simulated pump power. */
  exhaust: number;
  /** How far the Ice Bricks' leading edge has come from Ceres. */
  iceFront: number;
  /** How far the stream's tail has come, once launches end. */
  iceTail: number;
  /** The surface's own glow, from the simulated temperature. */
  heat: number;
  /** The sulfuric cloud deck, thinning as the air rains out. */
  deck: number;
  /** How full the CO₂ seas are: the share of the CO₂ that has left the air, from the simulation. */
  co2Level: number;
  dryIce: number;
  sealed: number;
  /** The new water frozen while the air is below freezing. */
  waterIce: number;
  /** The new water as liquid seas: once it rains out, and again once it melts. */
  ocean: number;
  life: number;
  /** Earth-blue air, from the simulated oxygen. */
  sky: number;
  waterClouds: number;
  /** Thickness of the air, from the simulated pressure on a log scale. */
  air: number;
}

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

/** 0 before a, 1 after b, smooth between. */
export function ramp(a: number, b: number, x: number): number {
  if (b <= a) return x >= a ? 1 : 0;
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** A series' value on a day: held flat before its first point and after its last. */
export function sample(series: [number, number][], day: number): number {
  const first = series[0];
  const last = series.at(-1);
  if (!first || !last) return 0;
  if (day <= first[0]) return first[1];
  if (day >= last[0]) return last[1];
  let lo = 0;
  let hi = series.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((series[mid] as [number, number])[0] <= day) lo = mid;
    else hi = mid;
  }
  const [x0, y0] = series[lo] as [number, number];
  const [x1, y1] = series[hi] as [number, number];
  return y0 + ((y1 - y0) * (day - x0)) / (x1 - x0);
}

export function stageAt(day: number, data: HeroData): Stage {
  const d = (id: string) => {
    const v = data.days[id];
    if (v === undefined) throw new Error(`hero: no date ${id}`);
    return v;
  };
  const temp =
    day < (data.temperature[0]?.[0] ?? 0) ? data.surfaceTemp : sample(data.temperature, day);
  const pressure = sample(data.pressure, day);
  const startPressure = data.pressure[0]?.[1] ?? 9.2e6;
  const o2 = day < (data.oxygen[0]?.[0] ?? 0) ? 0 : sample(data.oxygen, day);
  // The CO₂ seas hold what has left the air, so they drain again when the Bricks' heat boils them back.
  const co2Start = data.co2[0]?.[1] ?? 1;
  const co2Out = day < (data.co2[0]?.[0] ?? 0) ? 0 : clamp(1 - sample(data.co2, day) / co2Start);
  const pumpMax = Math.max(...data.pump.map((p) => p[1]), 1);
  const pumping =
    day < (data.pump[0]?.[0] ?? 0) || day > (data.pump.at(-1)?.[0] ?? 0)
      ? 0
      : sample(data.pump, day) / pumpMax;

  const closed = ramp(d("veil-close") - 90, d("veil-close"), day);
  const open = ramp(d("traj-warming"), d("traj-warming") + 25, day);
  // Drawn, not measured: closed, the real Veil lets through almost nothing, but the scene keeps
  // a fifth of the light so the seas can be seen forming and freezing. Open, it passes the model's
  // Earth-strength share, shown brighter so the finished planet reads as daylight.
  const closedLight = 0.2;
  const openLight = 0.6 + 0.4 * data.dayTransmission;
  const sun = (1 - closed * (1 - closedLight)) * (1 - open) + openLight * open;

  // The water arrives with the Bricks as vapour in hot air and rains into the lowlands once the air
  // cools to its dew point. Drawn, not measured: the seas fill from the first rain until the air
  // drops below freezing, and never hold more than has arrived. They freeze, and melt again once
  // the Veil opens. Ice and liquid are the same water, so the seas only ever grow.
  const arrived = ramp(d("first-arrival"), d("last-arrival"), day);
  const wet = Math.min(arrived, ramp(d("traj-water-rain"), d("traj-water-frozen"), day));
  const frozen = ramp(d("traj-water-frozen") - 15, d("traj-water-frozen") + 15, day);
  const melt = ramp(d("traj-warming"), d("traj-earth-like"), day);
  // White water clouds while the vapour rains out, and again over the warm, finished planet.
  const raining = 0.6 * ramp(d("first-arrival"), d("traj-water-rain"), day) * (1 - frozen);

  return {
    sun,
    veil: ramp(d("veil-build-begin"), d("veil-close"), day),
    veilOpen: open,
    aegis: ramp(d("aegis-online") - 40, d("aegis-online"), day),
    beams:
      ramp(d("cooling-start") - 40, d("cooling-start"), day) *
      (1 - ramp(d("cooling-end"), d("cooling-end") + 30, day)),
    exhaust: pumping,
    // The first Bricks reach the air on the first arrival, the last on the last.
    iceFront: clamp(
      (day - d("ice-launch-start")) / Math.max(1, d("first-arrival") - d("ice-launch-start")),
    ),
    iceTail: clamp(
      (day - d("ice-launch-end")) / Math.max(1, d("last-arrival") - d("ice-launch-end")),
    ),
    heat: clamp((temp - 400) / (data.surfaceTemp - 400)),
    deck: clamp(
      (Math.log10(pressure) - Math.log10(4e5)) / (Math.log10(startPressure) - Math.log10(4e5)),
    ),
    co2Level: co2Out,
    dryIce: ramp(d("traj-freeze") - 15, d("traj-freeze") + 20, day),
    sealed: ramp(d("traj-cold"), d("traj-warming"), day),
    waterIce: wet * frozen * (1 - melt),
    ocean: wet * (1 - frozen * (1 - melt)),
    life: ramp(d("genesis-start"), d("genesis-end"), day),
    sky: clamp(o2 / 21_000),
    waterClouds: Math.max(raining, ramp(d("traj-warming") + 10, d("traj-earth-like"), day)),
    air: clamp((Math.log10(pressure) - 5) / (Math.log10(startPressure) - 5)),
  };
}
