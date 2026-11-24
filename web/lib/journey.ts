/**
 * What the journey needs from one run of the model: the dates each technology arrives, where the
 * worlds are, the day-by-day simulation of Venus's air, and a few sizes. The scene only draws;
 * every date, place and curve it follows comes from here, so the animation cannot drift from the
 * ledger. Browser-safe: the home page builds it from the published model, the Explorer from the
 * reader's variant.
 */
import { formatQuantity, PLACE_INPUTS, type Registry } from "@phosphoros/calc";
import type { JourneyData, JourneyEvent, Readout } from "../components/journey/types";
import { DAY_IDS, EVENTS } from "./journey-events.ts";

/** Keep about one point a fortnight: plenty for a curve the eye follows, small enough to ship. */
function thin(points: { x: number; y: number }[], every = 14): [number, number][] {
  const out: [number, number][] = [];
  let next = Number.NEGATIVE_INFINITY;
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

export function journeyData(r: Registry): JourneyData {
  const value = (id: string) => r.get(id).value;
  const series = (id: string) => {
    const s = r.series.get(id);
    if (!s) throw new Error(`journey: no series ${id}`);
    return thin(s.points);
  };
  const degrees = (id: string) => {
    const q = r.get(id);
    if (q.unit !== "deg") throw new Error(`journey: ${id} is in ${q.unit}, not degrees`);
    return q.value;
  };
  const days = Object.fromEntries(DAY_IDS.map((id) => [id, value(id)]));
  // An event the simulation never reached did not happen in this variant: with a fast Foundry the
  // air is below freezing before the first Bricks arrive, so their water never rains out.
  const simulated = r.series.get("traj-temperature")?.points.at(-1)?.x ?? Number.POSITIVE_INFINITY;
  const happened = (id: string) => !id.startsWith("traj-") || value(id) <= simulated + 1;

  // Two captions on one day read as one: "The Lattice reaches full power" and "the first Bricks
  // leave Ceres" fall together whenever the factories finish before the Lattice.
  const events: JourneyEvent[] = [];
  for (const e of EVENTS.filter((x) => happened(x.id)).sort((a, b) => value(a.id) - value(b.id))) {
    const day = value(e.id);
    const same = events.find((x) => Math.abs(x.day - day) < 0.5);
    if (same) {
      same.text = `${same.text}; ${e.text.charAt(0).toLowerCase()}${e.text.slice(1)}`;
      same.chapter = e.chapter;
      same.tech = same.tech ?? e.tech;
      continue;
    }
    events.push({
      day,
      when: formatQuantity(r.get(e.id), { date: "month" }),
      text: e.text,
      chapter: e.chapter,
      tech: e.tech,
    });
  }

  const temperature = series("traj-temperature");
  const pressure = series("traj-pressure");
  const oxygen = series("traj-o2");
  const pump = series("traj-pump-power");
  const co2 = series("traj-co2");
  const readouts: Readout[] = [
    {
      id: "traj-temperature",
      label: "Surface",
      points: temperature,
      kind: "temperature",
      holdBefore: true,
    },
    {
      id: "traj-pressure",
      label: "Air pressure",
      points: pressure,
      kind: "pressure",
      holdBefore: true,
    },
    { id: "traj-o2", label: "Oxygen", points: oxygen, kind: "pressure", holdBefore: false },
    {
      id: "traj-pump-power",
      label: "Exhaust pumping",
      points: pump,
      kind: "power",
      holdBefore: false,
    },
  ];

  const venusRadius = value("venus-radius");
  const ceresRadius = value("ceres-radius");
  return {
    start: value("program-start"),
    // The plan ends on its deadline; a variant that runs late ends on its own last event, so the
    // story still shows Venus finished, after the deadline.
    end: Math.max(value("deadline"), ...events.map((e) => e.day)),
    deadline: value("deadline"),
    simulated,
    days,
    events,
    elements: Object.fromEntries(PLACE_INPUTS.map((id) => [id, value(id)])),
    temperature,
    pressure,
    oxygen,
    pump,
    co2,
    readouts,
    dayTransmission: value("veil-day-transmission"),
    surfaceTemp: value("venus-surface-temp"),
    dropLatitude: degrees("ice-drop-latitude"),
    capCover: value("cryo-footprint-share"),
    seaCover: value("sea-cover-share"),
    foundryDoubling: value("foundry-doubling-days"),
    ceresDoubling: value("ceres-doubling-days"),
    latticeInner: value("helios-orbit-inner") / value("au"),
    latticeOuter: value("helios-orbit-outer") / value("au"),
    veilRadius: value("veil-radius") / venusRadius,
    canopyWidth: value("canopy-width") / venusRadius,
    crownRadius: value("crown-radius") / ceresRadius,
    crownFins: value("crown-fin-radius") / ceresRadius,
  };
}
