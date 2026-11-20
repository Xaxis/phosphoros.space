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
  /** How much of the Braking Ring's loop is built. */
  ring: number;
  /** Helios power beamed to Venus. */
  beams: number;
  /** Photonic Exhaust activity, from the simulated pump power. */
  exhaust: number;
  /** How far the Ice Bricks' leading edge has come from Ceres. */
  iceFront: number;
  /** How far the stream's tail has come, once launches end. */
  iceTail: number;
  /** Bricks arriving at the Ring. */
  catching: number;
  /** The surface's own glow, from the simulated temperature. */
  heat: number;
  /** The sulfuric cloud deck, thinning as the air rains out. */
  deck: number;
  /** How full the CO₂ seas are. */
  co2Level: number;
  dryIce: number;
  sealed: number;
  /** Water ice lowered while the air is cold. */
  waterIce: number;
  /** Liquid oceans, once the air warms. */
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

  const melt = ramp(d("traj-warming"), d("traj-earth-like"), day);
  const lowered = ramp(d("lowering-start"), d("lowering-end"), day);
  const transit = Math.max(1, d("first-catch") - d("ice-launch-start"));

  return {
    sun,
    veil: ramp(d("veil-build-start"), d("veil-close"), day),
    veilOpen: open,
    aegis: ramp(d("aegis-online") - 40, d("aegis-online"), day),
    ring: clamp((day - d("ring-build-start")) / (d("ring-complete") - d("ring-build-start"))),
    beams:
      ramp(d("cooling-start") - 40, d("cooling-start"), day) *
      (1 - 0.5 * ramp(d("traj-earth-like"), d("deadline"), day)),
    exhaust: pumping,
    iceFront: clamp((day - d("ice-launch-start")) / transit),
    iceTail: clamp((day - d("ice-launch-end")) / transit),
    catching:
      ramp(d("first-catch") - 15, d("first-catch"), day) *
      (1 - ramp(d("last-arrival") - 20, d("last-arrival"), day)),
    heat: clamp((temp - 400) / (data.surfaceTemp - 400)),
    deck: clamp(
      (Math.log10(pressure) - Math.log10(4e5)) / (Math.log10(startPressure) - Math.log10(4e5)),
    ),
    co2Level: ramp(d("traj-clear-rain"), d("traj-freeze"), day),
    dryIce: ramp(d("traj-freeze") - 15, d("traj-freeze") + 20, day),
    sealed: ramp(d("traj-cold"), d("traj-warming"), day),
    waterIce: lowered * (1 - melt),
    ocean: lowered * melt,
    life: ramp(d("forge-end"), d("genesis-end"), day),
    sky: clamp(o2 / 21_000),
    waterClouds: ramp(d("traj-warming") + 10, d("traj-earth-like"), day),
    air: clamp((Math.log10(pressure) - 5) / (Math.log10(startPressure) - 5)),
  };
}
