/**
 * Where each world is on each day of the plan, so the home page's journey shows Mercury, Venus,
 * Earth and Ceres where they really are on every date it names. Mercury and Earth move on their
 * ellipses and Venus on its near-circle, by Standish's mean elements; Ceres by its osculating
 * elements, as the Ice Train's schedule places it. Ecliptic longitude and distance from the Sun; latitude is left out, since no world
 * here strays more than about 10° from the ecliptic.
 *
 * placeOf is exported so the browser can place the worlds on any day with the same arithmetic,
 * from the same inputs (PLACE_INPUTS), instead of shipping the sampled series.
 */
import { trueAnomaly } from "../physics.ts";
import type { Registry } from "../registry.ts";
import { dayOfJulian } from "../time.ts";

const RADIAN = Math.PI / 180;

/** Days either side of the decade the series cover, so the journey opens and closes on moving worlds. */
const MARGIN_DAYS = 60;

export type World = "mercury" | "venus" | "earth" | "ceres";
export const WORLDS: World[] = ["mercury", "venus", "earth", "ceres"];

export interface Place {
  /** Ecliptic longitude, degrees, in [0, 360). */
  longitude: number;
  /** Distance from the Sun, AU. */
  distance: number;
}

/** Every input placeOf reads. */
export const PLACE_INPUTS = [
  "au",
  "venus-elements-epoch",
  "mercury-orbit",
  "mercury-mean-longitude",
  "mercury-mean-motion",
  "mercury-eccentricity",
  "mercury-perihelion-longitude",
  "venus-orbit",
  "venus-mean-longitude",
  "venus-mean-motion",
  "earth-mean-longitude",
  "earth-mean-motion",
  "earth-eccentricity",
  "earth-perihelion-longitude",
  "ceres-orbit",
  "ceres-eccentricity",
  "ceres-inclination",
  "ceres-node",
  "ceres-perihelion-argument",
  "ceres-mean-anomaly",
  "ceres-mean-motion",
  "ceres-elements-epoch",
] as const;

const wrap = (deg: number) => ((deg % 360) + 360) % 360;

/** Where a world is on a day (days since 2027-01-01), from the inputs PLACE_INPUTS names. */
export function placeOf(v: (id: string) => number, world: World, day: number): Place {
  const sinceJ2000 = day - dayOfJulian(v("venus-elements-epoch"));
  switch (world) {
    case "mercury":
    case "earth": {
      const e = v(`${world}-eccentricity`);
      const peri = v(`${world}-perihelion-longitude`);
      const meanLon = v(`${world}-mean-longitude`) + v(`${world}-mean-motion`) * sinceJ2000;
      const nu = trueAnomaly(wrap(meanLon - peri) * RADIAN, e);
      // Earth's semi-major axis is the astronomical unit, to the precision drawn here.
      const a = world === "earth" ? 1 : v("mercury-orbit") / v("au");
      return {
        longitude: wrap(peri + nu / RADIAN),
        distance: (a * (1 - e * e)) / (1 + e * Math.cos(nu)),
      };
    }
    case "venus":
      return {
        longitude: wrap(v("venus-mean-longitude") + v("venus-mean-motion") * sinceJ2000),
        distance: v("venus-orbit") / v("au"),
      };
    case "ceres": {
      const e = v("ceres-eccentricity");
      const i = v("ceres-inclination") * RADIAN;
      const node = v("ceres-node") * RADIAN;
      const M =
        (v("ceres-mean-anomaly") +
          v("ceres-mean-motion") * (day - dayOfJulian(v("ceres-elements-epoch")))) *
        RADIAN;
      const nu = trueAnomaly(M, e);
      const u = v("ceres-perihelion-argument") * RADIAN + nu;
      const x = Math.cos(node) * Math.cos(u) - Math.sin(node) * Math.sin(u) * Math.cos(i);
      const y = Math.sin(node) * Math.cos(u) + Math.cos(node) * Math.sin(u) * Math.cos(i);
      return {
        longitude: wrap(Math.atan2(y, x) / RADIAN),
        distance: ((v("ceres-orbit") / v("au")) * (1 - e * e)) / (1 + e * Math.cos(nu)),
      };
    }
  }
}

const NAMES: Record<World, string> = {
  mercury: "Mercury",
  venus: "Venus",
  earth: "Earth",
  ceres: "Ceres",
};
/** Sampling step in days: a fiftieth of an orbit or finer. */
const STEP: Record<World, number> = { mercury: 1, venus: 4, earth: 4, ceres: 8 };

export function places(r: Registry) {
  const { v } = r.in("model/places.ts");
  for (const world of WORLDS) {
    const sample = (pick: (p: Place) => number) => () => {
      const out: { x: number; y: number }[] = [];
      const to = v("deadline") + MARGIN_DAYS;
      for (let day = v("program-start") - MARGIN_DAYS; day <= to; day += STEP[world])
        out.push({ x: day, y: pick(placeOf(v, world, day)) });
      return out;
    };
    r.s(
      `orbit-${world}-longitude`,
      { label: `${NAMES[world]}'s ecliptic longitude`, x: "date", y: "deg" },
      sample((p) => p.longitude),
    );
    r.s(
      `orbit-${world}-distance`,
      { label: `${NAMES[world]}'s distance from the Sun`, x: "date", y: "AU" },
      sample((p) => p.distance),
    );
  }
}
