/**
 * What the home page's animated Venus needs from the model: the dates each technology arrives and
 * the day-by-day simulation of the air. The scene only draws; every date and every curve it follows
 * comes from here, so the animation cannot drift from the ledger.
 */
import "server-only";
import { formatQuantity } from "@phosphoros/calc";
import type { HeroData, HeroDays } from "../components/hero/types";
import { model } from "./model";

const DAY_IDS = [
  "program-start",
  "foundry-landing",
  "helios-first-petals",
  "helios-full-power",
  "veil-build-begin",
  "veil-close",
  "ring-build-begin",
  "ring-complete",
  "cooling-start",
  "cooling-end",
  "ice-launch-start",
  "ice-launch-end",
  "first-catch",
  "last-arrival",
  "aegis-online",
  "traj-clear-rain",
  "traj-freeze",
  "traj-cold",
  "traj-warming",
  "lowering-start",
  "lowering-end",
  "forge-start",
  "forge-end",
  "genesis-start",
  "genesis-end",
  "traj-earth-like",
  "deadline",
] as const;

/** What the caption says on each date. Words only; the dates come from the model. */
const EVENTS: { id: (typeof DAY_IDS)[number]; text: string; tech?: string }[] = [
  { id: "program-start", text: "Nine proof experiments begin on Earth" },
  { id: "foundry-landing", text: "A self-copying foundry lands on Mercury", tech: "ouroboros" },
  {
    id: "helios-first-petals",
    text: "The Helios Lattice starts to gather sunlight",
    tech: "helios",
  },
  { id: "veil-close", text: "The Hesperus Veil closes, and Venus goes dark", tech: "veil" },
  {
    id: "cooling-start",
    text: "The Photonic Exhaust begins pumping heat to space",
    tech: "exhaust",
  },
  { id: "ice-launch-start", text: "The first Ice Bricks leave Ceres", tech: "ice-train" },
  { id: "ring-complete", text: "The Braking Ring closes around Venus", tech: "ring" },
  { id: "traj-clear-rain", text: "The Clear Rain: the air itself starts to fall", tech: "cryo" },
  { id: "aegis-online", text: "The Aegis Shield turns the solar wind aside", tech: "aegis" },
  { id: "first-catch", text: "The Ring catches the first Brick", tech: "ring" },
  { id: "forge-start", text: "The Graphite Forges start making oxygen", tech: "forges" },
  { id: "lowering-start", text: "Ice comes down and the first seas fill", tech: "ring" },
  { id: "traj-freeze", text: "The CO₂ seas freeze into continents of dry ice", tech: "cryo" },
  { id: "traj-warming", text: "The ice is sealed and the Veil opens to daylight", tech: "veil" },
  { id: "traj-earth-like", text: "Earth-like: warm air to breathe" },
  { id: "genesis-start", text: "Genesis seeds the new oceans with life", tech: "genesis" },
];

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
    dayTransmission: r.get("veil-day-transmission").value,
    earthLikeTemp: r.get("earth-surface-temp").value,
    surfaceTemp: r.get("venus-surface-temp").value,
  };
}
