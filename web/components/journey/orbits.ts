/**
 * Where things are, in the scene's units. Pure, and free of three.js so the tests can call it.
 *
 * Every world sits at its true ecliptic longitude on the day shown, from the model's own orbit
 * arithmetic (calc's placeOf). Distances are squeezed so Ceres and Mercury fit one picture: a world
 * r AU from the Sun is drawn SCALE·r^POWER units out. Worlds are drawn far larger than to scale;
 * Venus is one unit across in radius. The scene's ecliptic is the x–z plane with north up (+y), and
 * longitude runs counter-clockwise seen from the north, from +x toward −z.
 */
import { placeOf, type World } from "@phosphoros/calc";
import type { JourneyData } from "./types.ts";

export type Vec3 = [number, number, number];

export const SCALE = 30;
export const POWER = 0.75;

/** Drawn radius of each world, in scene units (not to scale: Venus is the unit). */
export const RADIUS: Record<World | "sun" | "moon", number> = {
  sun: 2.4,
  mercury: 0.55,
  venus: 1,
  earth: 1.05,
  moon: 0.28,
  ceres: 0.42,
};

export const RAD = Math.PI / 180;

/** Drawn distance from the Sun for a true distance in AU. */
export const out = (au: number) => SCALE * au ** POWER;

/** A point in the ecliptic plane at a longitude (degrees) and drawn distance. */
export function polar(longitude: number, distance: number, height = 0): Vec3 {
  return [Math.cos(longitude * RAD) * distance, height, -Math.sin(longitude * RAD) * distance];
}

export function placer(data: JourneyData) {
  const v = (id: string) => {
    const x = data.elements[id];
    if (x === undefined) throw new Error(`journey: no element ${id}`);
    return x;
  };
  /** A world's true longitude (degrees) and distance (AU) on a day. */
  const place = (world: World, day: number) => placeOf(v, world, day);
  /** A world's centre in the scene on a day. */
  const at = (world: World, day: number): Vec3 => {
    const p = place(world, day);
    return polar(p.longitude, out(p.distance));
  };
  return { place, at };
}

/**
 * A craft's place on a coasting transfer between two worlds, a fraction t of the way through its
 * flight. It follows the half-ellipse a Hohmann transfer takes, timed by Kepler's equation, so it
 * leaves slowly from the outer end and races at the inner one, then is stretched round to end on
 * the world's true place on the day it arrives.
 */
export function transfer(
  from: { longitude: number; distance: number },
  to: { longitude: number; distance: number },
  t: number,
): Vec3 {
  const s = Math.min(1, Math.max(0, t));
  const inward = to.distance < from.distance;
  const rp = Math.min(from.distance, to.distance);
  const ra = Math.max(from.distance, to.distance);
  const e = (ra - rp) / (ra + rp);
  // Inward from aphelion (mean anomaly π) to perihelion (2π); outward from perihelion (0) to π.
  const M = (inward ? Math.PI : 0) + Math.PI * s;
  let E = M;
  for (let k = 0; k < 12; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const swept = (((nu - (inward ? Math.PI : 0)) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const share = s >= 1 ? 1 : swept / Math.PI;
  const r = (((ra + rp) / 2) * (1 - e * e)) / (1 + e * Math.cos(nu));
  // Prograde, and the long way round only if the worlds are lined up that way.
  let sweep = (((to.longitude - from.longitude) % 360) + 360) % 360;
  if (sweep < 20) sweep += 360;
  return polar(from.longitude + sweep * share, out(r));
}

/** Smooth step: 0 before a, 1 after b. */
export function ramp(a: number, b: number, x: number): number {
  if (b <= a) return x >= a ? 1 : 0;
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function length3(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

export function normalize3(a: Vec3): Vec3 {
  const l = length3(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
