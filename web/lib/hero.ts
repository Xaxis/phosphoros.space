/**
 * What the home page's animated Venus needs from the model: the dates each technology arrives and
 * the day-by-day simulation of the air. The scene only draws; every date and every curve it follows
 * comes from here, so the animation cannot drift from the ledger.
 */
import "server-only";
import { formatQuantity } from "@phosphoros/calc";
import type { HeroData, HeroDays } from "../components/hero/types";
import { DAY_IDS, EVENTS } from "./hero-events";
import { model } from "./model";

/** Keep about one point a fortnight: plenty for a curve the eye follows, small enough to ship. */
function thin(points: { x: number; y: number }[], every = 14): [number, number][] {
  const out: [number, number][] = [];
  let next = -Infinity;
  for (const p of points) {
    if (p.x >= next) {
      out.push([Math.round(p.x), p.y]);
      next = p.x + every;
    }
  }
  const last = points.at(-1);
  if (last && out.at(-1)?.[0] !== Math.round(last.x)) out.push([Math.round(last.x), last.y]);
  return out;
}

function series(id: string): { x: number; y: number }[] {
  const s = model().r.series.get(id);
  if (!s) throw new Error(`hero: no series ${id}`);
  return s.points;
}

export function heroData(): HeroData {
  const { r } = model();
  const day = (id: string) => r.get(id).value;
  const degrees = (id: string) => {
    const q = r.get(id);
    if (q.unit !== "deg") throw new Error(`hero: ${id} is in ${q.unit}, not degrees`);
    return q.value;
  };
  const days: HeroDays = Object.fromEntries(DAY_IDS.map((id) => [id, day(id)]));
  const events = EVENTS.map((e) => ({
    day: day(e.id),
    when: formatQuantity(r.get(e.id), { date: "month" }),
    text: e.text,
    tech: e.tech,
  })).sort((a, b) => a.day - b.day);
  return {
    start: day("program-start"),
    end: day("deadline"),
    days,
    events,
    temperature: thin(series("traj-temperature")),
    pressure: thin(series("traj-pressure")),
    oxygen: thin(series("traj-o2")),
    pump: thin(series("traj-pump-power")),
    co2: thin(series("traj-co2")),
    dayTransmission: r.get("veil-day-transmission").value,
    earthLikeTemp: r.get("earth-surface-temp").value,
    surfaceTemp: r.get("venus-surface-temp").value,
    dropLatitude: degrees("ice-drop-latitude"),
    capCover: r.get("cryo-footprint-share").value,
    seaCover: r.get("sea-cover-share").value,
  };
}
