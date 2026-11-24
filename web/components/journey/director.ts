/**
 * The camera's script: for each stretch of the story, what it looks at, how much it fits on screen
 * and from which side. Pure: a day always gives the same view, so scrubbing and playing agree.
 *
 * A close-up turns with its world's orbit, so the Sun stays where the shot put it however fast the
 * years go by; the star sphere turns with it (skyTurn), so the stars hold still too. A wide shot
 * keeps still against the stars, and the worlds run round their orbits under it.
 */
import type { World } from "@phosphoros/calc";
import { lerp3, normalize3, out, placer, RAD, RADIUS, transfer, type Vec3 } from "./orbits.ts";
import type { Timeline } from "./timeline.ts";
import type { Chapter, JourneyData } from "./types.ts";

type Target =
  | { kind: "world"; world: World }
  | { kind: "sun" }
  /** A point between two worlds, a share w of the way from a to b. */
  | { kind: "between"; a: World | "sun"; b: World | "sun"; w: number }
  | { kind: "seed"; to: "mercury" | "ceres" };

export interface Shot {
  /** The day the camera must have arrived by. */
  day: number;
  target: Target;
  /** Scene units to fit within the frame's radius. */
  frame: number;
  /** Degrees round from the side facing the Sun (close-up) or from +x (wide), and above the ecliptic. */
  azim: number;
  elev: number;
  /** "world": turns with the target world's orbit. "fixed": still against the stars. */
  turn: "world" | "fixed";
  chapter: Chapter;
}

export interface Pose {
  target: Vec3;
  /** Unit vector from the target to the camera. */
  dir: Vec3;
  /** Scene units the frame must fit. */
  frame: number;
  /** Radians the star sphere turns about +y so a turning close-up sees still stars. */
  skyTurn: number;
  chapter: Chapter;
}

/** Seconds of playback a camera move takes, ending on the shot's day. */
export const MOVE_SECONDS = 2.4;

export function script(data: JourneyData): Shot[] {
  const d = (id: string) => {
    const v = data.days[id];
    if (v === undefined) throw new Error(`journey: no date ${id}`);
    return v;
  };
  const world = (w: World): Target => ({ kind: "world", world: w });
  const shots: Shot[] = [
    // Earth, its experiments and the seeds' launch.
    {
      day: d("program-start"),
      target: world("earth"),
      frame: RADIUS.earth * 3.4,
      azim: 62,
      elev: 14,
      turn: "world",
      chapter: "earth",
    },
    {
      day: d("foundry-seed-launch") - 20,
      target: world("earth"),
      frame: RADIUS.earth * 1.9,
      azim: 78,
      elev: 6,
      turn: "world",
      chapter: "earth",
    },
    // Out into the inner system, behind the seeds.
    {
      day: d("foundry-seed-launch") + 30,
      target: { kind: "between", a: "sun", b: "earth", w: 0.42 },
      frame: out(1) * 0.9,
      azim: 0,
      elev: 52,
      turn: "fixed",
      chapter: "earth",
    },
    // Mercury: the landing at the pole, and the Foundry spreading.
    {
      day: d("foundry-landing"),
      target: world("mercury"),
      frame: RADIUS.mercury * 1.5,
      azim: 58,
      elev: 38,
      turn: "world",
      chapter: "mercury",
    },
    {
      day: d("ceres-landing") - 40,
      target: world("mercury"),
      frame: RADIUS.mercury * 1.35,
      azim: 40,
      elev: 52,
      turn: "world",
      chapter: "mercury",
    },
    // Ceres: the second seed lands.
    {
      day: d("ceres-landing"),
      target: world("ceres"),
      frame: RADIUS.ceres * 1.7,
      azim: 55,
      elev: 22,
      turn: "world",
      chapter: "ceres",
    },
    // The Lattice: Petals leave Mercury and gather round the Sun.
    {
      day: d("helios-first-petals"),
      target: world("mercury"),
      frame: RADIUS.mercury * 5,
      azim: 70,
      elev: 24,
      turn: "world",
      chapter: "lattice",
    },
    {
      day: d("helios-first-petals") + 260,
      target: { kind: "sun" },
      frame: out(data.latticeOuter) * 1.45,
      azim: 0,
      elev: 28,
      turn: "fixed",
      chapter: "lattice",
    },
    // The Veil: slats thrown from Mercury to Venus, then the Veil closes.
    {
      day: d("veil-build-begin"),
      target: world("mercury"),
      frame: RADIUS.mercury * 2.6,
      azim: 85,
      elev: 30,
      turn: "world",
      chapter: "lattice",
    },
    {
      day: d("veil-build-end") + 20,
      target: { kind: "between", a: "mercury", b: "venus", w: 0.6 },
      frame: out(0.72) * 0.8,
      azim: 0,
      elev: 46,
      turn: "fixed",
      chapter: "lattice",
    },
    {
      day: d("veil-close"),
      target: world("venus"),
      frame: RADIUS.venus * 3.6,
      azim: 64,
      elev: 12,
      turn: "world",
      chapter: "venus",
    },
    // Ceres builds the Railheads and the Crown.
    {
      day: d("ceres-full-scale"),
      target: world("ceres"),
      frame: RADIUS.ceres * data.crownFins * 1.2,
      azim: 48,
      elev: 30,
      turn: "world",
      chapter: "ceres",
    },
    // The Foundry at its full size, covering Mercury's pole, turns out Petals by the million.
    {
      day: d("foundry-full-scale"),
      target: world("mercury"),
      frame: RADIUS.mercury * 2.4,
      azim: 36,
      elev: 48,
      turn: "world",
      chapter: "mercury",
    },
    // The Lattice fills in round the Sun.
    {
      day:
        (d("foundry-full-scale") + Math.max(d("foundry-full-scale"), d("helios-full-power"))) / 2,
      target: { kind: "sun" },
      frame: out(data.latticeOuter) * 1.35,
      azim: 20,
      elev: 58,
      turn: "fixed",
      chapter: "lattice",
    },
    // The Bricks leave Ceres.
    {
      day: d("ice-launch-start"),
      target: world("ceres"),
      frame: RADIUS.ceres * data.crownFins * 1.35,
      azim: 115,
      elev: 24,
      turn: "world",
      chapter: "ceres",
    },
    {
      day: d("ice-launch-end"),
      target: { kind: "between", a: "sun", b: "ceres", w: 0.45 },
      frame: out(2.8) * 0.72,
      azim: 0,
      elev: 62,
      turn: "fixed",
      chapter: "ceres",
    },
    // Venus: the hardware arrives and the Exhaust lights.
    {
      day: d("cooling-start"),
      target: world("venus"),
      frame: RADIUS.venus * 3.2,
      azim: 64,
      elev: 14,
      turn: "world",
      chapter: "venus",
    },
    {
      day: d("aegis-online"),
      target: world("venus"),
      frame: RADIUS.venus * 3.6,
      azim: 58,
      elev: 18,
      turn: "world",
      chapter: "venus",
    },
    // The Bricks close in from behind, then burst over the poles.
    {
      day: d("first-arrival") - 45,
      target: { kind: "between", a: "sun", b: "venus", w: 0.85 },
      frame: out(0.72) * 0.55,
      azim: 0,
      elev: 40,
      turn: "fixed",
      chapter: "venus",
    },
    {
      day: d("first-arrival"),
      target: world("venus"),
      frame: RADIUS.venus * 1.55,
      azim: 48,
      elev: 34,
      turn: "world",
      chapter: "venus",
    },
    {
      day: d("traj-rerain"),
      target: world("venus"),
      frame: RADIUS.venus * 1.4,
      azim: 62,
      elev: 22,
      turn: "world",
      chapter: "venus",
    },
    {
      day: d("traj-freeze"),
      target: world("venus"),
      frame: RADIUS.venus * 1.35,
      azim: 70,
      elev: 28,
      turn: "world",
      chapter: "venus",
    },
    {
      day: d("traj-warming"),
      target: world("venus"),
      frame: RADIUS.venus * 3.2,
      azim: 60,
      elev: 12,
      turn: "world",
      chapter: "venus",
    },
    {
      day: d("traj-earth-like"),
      target: world("venus"),
      frame: RADIUS.venus * 1.35,
      azim: 52,
      elev: 16,
      turn: "world",
      chapter: "venus",
    },
  ];
  return shots.sort((a, b) => a.day - b.day);
}

/**
 * The camera on a day. Between two shots it holds the earlier one, then moves to the next over the
 * MOVE_SECONDS of playback that end on that shot's day: the eye swings, and the frame grows or
 * shrinks evenly in scale.
 */
export function director(data: JourneyData, timeline: Timeline) {
  const shots = script(data);
  const { at, place } = placer(data);
  const seedPath = (to: "mercury" | "ceres", day: number): Vec3 => {
    const launch = data.days[to === "mercury" ? "foundry-seed-launch" : "ceres-seed-launch"] ?? 0;
    const land = data.days[to === "mercury" ? "foundry-landing" : "ceres-landing"] ?? 0;
    const t = (day - launch) / Math.max(1, land - launch);
    if (t <= 0) return at("earth", day);
    if (t >= 1) return at(to, day);
    return transfer(place("earth", launch), place(to, land), t);
  };
  const point = (p: World | "sun", day: number): Vec3 => (p === "sun" ? [0, 0, 0] : at(p, day));
  const targetOf = (t: Target, day: number): Vec3 => {
    switch (t.kind) {
      case "world":
        return at(t.world, day);
      case "sun":
        return [0, 0, 0];
      case "between":
        return lerp3(point(t.a, day), point(t.b, day), t.w);
      case "seed":
        return seedPath(t.to, day);
    }
  };
  /** The world a turning shot turns with, and its longitude in radians. */
  const turnOf = (s: Shot, day: number) =>
    s.turn === "world" && s.target.kind === "world"
      ? place(s.target.world, day).longitude * RAD
      : 0;
  const dirOf = (s: Shot, day: number): Vec3 => {
    const elev = s.elev * RAD;
    if (s.turn === "world" && s.target.kind === "world") {
      // In the world's own frame: azimuth 0 is the side facing the Sun.
      const p = at(s.target.world, day);
      const sunward = Math.atan2(p[2], -p[0]);
      const a = sunward + s.azim * RAD;
      return normalize3([
        Math.cos(a) * Math.cos(elev),
        Math.sin(elev),
        -Math.sin(a) * Math.cos(elev),
      ]);
    }
    const a = s.azim * RAD;
    return normalize3([
      Math.cos(a) * Math.cos(elev),
      Math.sin(elev),
      -Math.sin(a) * Math.cos(elev),
    ]);
  };
  const poseOf = (s: Shot, day: number): Pose => ({
    target: targetOf(s.target, day),
    dir: dirOf(s, day),
    frame: s.frame,
    skyTurn: turnOf(s, day),
    chapter: s.chapter,
  });

  return {
    shots,
    targetOf,
    seedPath,
    pose(day: number): Pose {
      const seconds = timeline.secondsAt(day);
      let i = 0;
      while (i + 1 < shots.length && (shots[i + 1] as Shot).day <= day) i++;
      const current = shots[i] as Shot;
      const next = shots[i + 1];
      const here = poseOf(current, day);
      if (!next) return here;
      const arrive = timeline.secondsAt(next.day);
      const leave = Math.max(timeline.secondsAt(current.day), arrive - MOVE_SECONDS);
      if (seconds <= leave) return here;
      const u = Math.min(1, (seconds - leave) / Math.max(1e-6, arrive - leave));
      const k = u * u * (3 - 2 * u);
      const there = poseOf(next, day);
      return blend(here, there, k);
    },
  };
}

/** Swing the direction along the great circle, move the target straight, scale the frame evenly. */
export function blend(a: Pose, b: Pose, k: number): Pose {
  const dot = Math.min(
    1,
    Math.max(-1, a.dir[0] * b.dir[0] + a.dir[1] * b.dir[1] + a.dir[2] * b.dir[2]),
  );
  const theta = Math.acos(dot);
  let dir: Vec3;
  if (theta < 1e-4) dir = lerp3(a.dir, b.dir, k);
  else {
    const s = Math.sin(theta);
    const wa = Math.sin((1 - k) * theta) / s;
    const wb = Math.sin(k * theta) / s;
    dir = [
      a.dir[0] * wa + b.dir[0] * wb,
      a.dir[1] * wa + b.dir[1] * wb,
      a.dir[2] * wa + b.dir[2] * wb,
    ];
  }
  let turn = b.skyTurn - a.skyTurn;
  turn = Math.atan2(Math.sin(turn), Math.cos(turn));
  // The far end of a big zoom stays put for longer, so the eye is not dragged across the system.
  const zoom = Math.log(b.frame / a.frame);
  return {
    target: lerp3(a.target, b.target, k),
    dir: normalize3(dir),
    frame: a.frame * Math.exp(zoom * k),
    skyTurn: a.skyTurn + turn * k,
    chapter: k < 0.5 ? a.chapter : b.chapter,
  };
}

/** For tests: the distance from the camera to its target for a frame and field of view. */
export function distanceFor(frame: number, fovDeg: number): number {
  return frame / Math.tan((fovDeg / 2) * RAD);
}
