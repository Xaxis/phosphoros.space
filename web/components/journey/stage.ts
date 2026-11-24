/**
 * What the journey shows on a given day of the plan, everywhere at once. Pure: the same day always
 * gives the same picture. Dates come from the model; Venus's air follows the model's day-by-day
 * simulation, so the planet clears, freezes and greens when the plan says it does. Values run
 * from 0 (absent) to 1 (fully there) unless they say otherwise.
 */
import { clamp01, ramp } from "./orbits.ts";
import type { JourneyData } from "./types.ts";

export interface VenusStage {
  /** Sunlight reaching Venus, as a share of today's. */
  sun: number;
  /** How much of the Veil is built at its station. */
  veil: number;
  /** The Veil's slats turned open for daylight. */
  veilOpen: number;
  /** The Aegis coil built, then charged. */
  aegisCoil: number;
  aegis: number;
  /** The canopies afloat over the cloud tops. */
  canopies: number;
  /** Photonic Exhaust activity, from the simulated pump power. */
  exhaust: number;
  /** Lanterns behind Venus lighting its night side. */
  lanterns: number;
  /** The surface's own glow, from the simulated temperature. */
  heat: number;
  /** The sulfuric cloud deck, thinning as the air rains out. */
  deck: number;
  /** How full the CO₂ seas are: the share of the CO₂ that has left the air. */
  co2Level: number;
  dryIce: number;
  sealed: number;
  /** The new water frozen while the air is below freezing. */
  waterIce: number;
  /** The new water as liquid seas: once it rains out, and again once it melts. */
  ocean: number;
  /** The Forge rafts on the CO₂ seas. */
  forges: number;
  life: number;
  /** Earth-blue air, from the simulated oxygen. */
  sky: number;
  waterClouds: number;
  /** Thickness of the air, from the simulated pressure on a log scale. */
  air: number;
  /**
   * The Bricks' stream: its front reaches the air on the first arrival and its tail on the last,
   * so they burst in the air between those dates and at no other time.
   */
  iceFront: number;
  iceTail: number;
}

export interface Stage {
  venus: VenusStage;
  /** Earth: the proof experiments in orbit, and the two seeds' launch (0 to 1 through the climb). */
  experiments: number;
  launch: number;
  /** Mercury: the Foundry's share of its final footprint (by mass), and its mass drivers' work. */
  foundry: number;
  foundryActive: number;
  massDriver: number;
  /** The Lattice: share of the Petals flying. */
  petals: number;
  /** Light from the Lattice to Ceres's Crown, and to Venus's canopies. */
  beamCeres: number;
  beamVenus: number;
  /** Ceres: factories' share of their final mass; the mirrors over them; Railheads and Crown built. */
  factories: number;
  ceresMirrors: number;
  railheads: number;
  crown: number;
  /** The Railheads firing. */
  firing: number;
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

/** Mass as a share of the final mass, doubling every `doubling` days until `full`. */
function grown(day: number, start: number, full: number, doubling: number): number {
  if (day < start) return 0;
  return day >= full ? 1 : 2 ** ((day - full) / doubling);
}

export function dayOf(data: JourneyData) {
  return (id: string) => {
    const v = data.days[id];
    if (v === undefined) throw new Error(`journey: no date ${id}`);
    return v;
  };
}

/** Days the Bricks' last leg takes on screen, from coming into view to bursting in the air. */
const APPROACH = 20;

export function venusAt(day: number, data: JourneyData): VenusStage {
  const d = dayOf(data);
  const temp =
    day < (data.temperature[0]?.[0] ?? 0) ? data.surfaceTemp : sample(data.temperature, day);
  const pressure = sample(data.pressure, day);
  const startPressure = data.pressure[0]?.[1] ?? 9.2e6;
  const o2 = day < (data.oxygen[0]?.[0] ?? 0) ? 0 : sample(data.oxygen, day);
  // The CO₂ seas hold what has left the air, so they drain again when the Bricks' heat boils them back.
  const co2Start = data.co2[0]?.[1] ?? 1;
  const co2Out = day < (data.co2[0]?.[0] ?? 0) ? 0 : clamp01(1 - sample(data.co2, day) / co2Start);
  const pumpMax = Math.max(...data.pump.map((p) => p[1]), 1);
  const pumping =
    day < (data.pump[0]?.[0] ?? 0) || day > (data.pump.at(-1)?.[0] ?? 0)
      ? 0
      : sample(data.pump, day) / pumpMax;

  const closed = ramp(d("veil-close") - 70, d("veil-close"), day);
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
  // When a fast Foundry has cooled the air below freezing before the first Bricks arrive, their water
  // never rains: it lands as ice, as the model has it, and stays ice until the Veil opens.
  const rains = d("traj-water-rain") <= data.simulated + 1;
  const arrived = ramp(d("first-arrival"), d("last-arrival"), day);
  const wet = rains
    ? Math.min(arrived, ramp(d("traj-water-rain"), d("traj-water-frozen"), day))
    : arrived;
  const frozen = rains ? ramp(d("traj-water-frozen") - 15, d("traj-water-frozen") + 15, day) : 1;
  const melt = ramp(d("traj-warming"), d("traj-earth-like"), day);
  // White water clouds while the vapour rains out, and again over the warm, finished planet.
  const raining = rains
    ? 0.6 * ramp(d("first-arrival"), d("traj-water-rain"), day) * (1 - frozen)
    : 0;
  // The canopies float down as the air they ride on rains out, and are gone once the chimneys retire.
  const canopies =
    ramp(d("venus-hardware-ready") - 20, d("venus-hardware-ready"), day) *
    (1 - ramp(d("traj-cold"), d("traj-cold") + 40, day));

  return {
    sun,
    // The first slats reach the station after the same coast as the last, and the disc fills in.
    veil: ramp(
      d("veil-build-begin") + (d("veil-close") - d("veil-build-end")),
      d("veil-close"),
      day,
    ),
    veilOpen: open,
    aegisCoil: ramp(d("veil-close"), d("aegis-online") - 30, day),
    aegis: ramp(d("aegis-online") - 30, d("aegis-online"), day),
    canopies,
    exhaust: pumping * canopies,
    lanterns: ramp(d("venus-hardware-ready") - 20, d("venus-hardware-ready"), day),
    heat: clamp01((temp - 400) / (data.surfaceTemp - 400)),
    deck: clamp01(
      (Math.log10(pressure) - Math.log10(4e5)) / (Math.log10(startPressure) - Math.log10(4e5)),
    ),
    co2Level: co2Out,
    dryIce: ramp(d("traj-freeze") - 15, d("traj-freeze") + 20, day),
    sealed: ramp(d("traj-frozen"), d("sealing-end"), day),
    waterIce: wet * frozen * (1 - melt),
    ocean: wet * (1 - frozen * (1 - melt)),
    forges:
      ramp(d("traj-rerain"), d("forge-start"), day) *
      (1 - ramp(d("forge-end"), d("forge-end") + 20, day)),
    life: ramp(d("genesis-start"), d("genesis-end"), day),
    sky: clamp01(o2 / 21_000),
    waterClouds: Math.max(raining, ramp(d("traj-warming") + 10, d("traj-earth-like"), day)),
    air: clamp01((Math.log10(pressure) - 5) / (Math.log10(startPressure) - 5)),
    iceFront: ramp(d("first-arrival") - APPROACH, d("first-arrival"), day),
    iceTail: ramp(d("last-arrival") - APPROACH, d("last-arrival"), day),
  };
}

/**
 * The seconds of playback the calendar stops for, by day: the launch from Earth takes minutes, so
 * the story holds on that day while the rockets climb.
 */
export function holds(data: JourneyData): Record<number, number> {
  return { [dayOf(data)("foundry-seed-launch")]: 3.4 };
}

/**
 * The stage on a day. `beat` is how far playback is through a hold on that day (0 to 1); paused on
 * a held day, the rockets show mid-climb.
 */
export function stageAt(day: number, data: JourneyData, beat = 0.55): Stage {
  const d = dayOf(data);
  const launch = d("foundry-seed-launch");
  return {
    venus: venusAt(day, data),
    experiments:
      ramp(d("program-start"), d("program-start") + 60, day) *
      (1 - ramp(d("experiments-end"), d("experiments-end") + 60, day)),
    launch: Math.abs(day - launch) < 1e-6 ? clamp01(beat) : day < launch ? 0 : 1,
    foundry: grown(day, d("foundry-landing"), d("foundry-full-scale"), data.foundryDoubling),
    foundryActive: ramp(d("foundry-landing"), d("foundry-landing") + 10, day),
    // The mass drivers throw test Petals, then the Veil's slats, then Petals by the million, then
    // the hardware for Venus.
    massDriver: Math.max(
      0.25 * ramp(d("helios-first-petals") - 20, d("helios-first-petals"), day),
      ramp(d("veil-build-begin") - 3, d("veil-build-begin"), day) *
        (1 - ramp(d("veil-build-end"), d("veil-build-end") + 5, day)),
      ramp(d("foundry-full-scale"), d("foundry-full-scale") + 10, day) *
        (1 - ramp(d("venus-hardware-ready") - 50, d("venus-hardware-ready") - 40, day)),
    ),
    // A few demonstrators, then the mass production between full scale and full power.
    petals: Math.max(
      0.004 * ramp(d("helios-first-petals"), d("helios-first-petals") + 60, day),
      ramp(d("foundry-full-scale"), d("helios-full-power"), day),
    ),
    beamCeres:
      ramp(d("ice-launch-start") - 10, d("ice-launch-start"), day) *
      (1 - ramp(d("ice-launch-end"), d("ice-launch-end") + 10, day)),
    beamVenus:
      ramp(d("cooling-start") - 10, d("cooling-start"), day) *
      (1 - ramp(d("cooling-end"), d("cooling-end") + 30, day)),
    factories: grown(day, d("ceres-landing"), d("ceres-full-scale"), data.ceresDoubling),
    ceresMirrors: ramp(d("ceres-landing") + 200, d("ceres-full-scale"), day),
    railheads: ramp(d("ceres-full-scale"), d("ceres-ready"), day),
    crown: ramp(d("ceres-full-scale") + 10, d("ceres-ready"), day),
    firing:
      ramp(d("ice-launch-start") - 1, d("ice-launch-start"), day) *
      (1 - ramp(d("ice-launch-end"), d("ice-launch-end") + 1, day)),
  };
}
