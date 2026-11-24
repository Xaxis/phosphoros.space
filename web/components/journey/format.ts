/** Dates, captions and readings as the journey's controls write them. */
import { formatNumber } from "@phosphoros/calc";
import { sample } from "./stage.ts";
import type { JourneyData, Readout } from "./types.ts";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const EPOCH_MS = Date.UTC(2027, 0, 1);

export function monthYear(day: number): string {
  const d = new Date(EPOCH_MS + Math.round(day) * 86_400_000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function yearOf(day: number): number {
  return new Date(EPOCH_MS + Math.round(day) * 86_400_000).getUTCFullYear();
}

/** The caption showing on a day: the last event on or before it. */
export function eventAt(data: JourneyData, day: number): number {
  let index = 0;
  data.events.forEach((e, i) => {
    if (e.day <= day + 0.5) index = i;
  });
  return index;
}

/** The next (or previous) captioned day from `current`, for the arrow keys. */
export function stepDay(data: JourneyData, current: number, direction: 1 | -1): number {
  const days = [data.start, ...data.events.map((e) => e.day), data.end];
  const next =
    direction > 0
      ? days.find((d) => d > current + 0.5)
      : [...days].reverse().find((d) => d < current - 0.5);
  return next ?? current;
}

const NBSP = "\u00a0";

/** A reading on a day, or undefined before its series starts. */
export function readingAt(r: Readout, day: number): number | undefined {
  const first = r.points[0];
  if (!first) return undefined;
  if (!r.holdBefore && day < first[0]) return undefined;
  return sample(r.points, day);
}

/** "735 K (462 °C)", "92.5 bar", "21 kPa", "2.1 × 10²⁰ W", written as the rest of the site writes numbers. */
export function formatReading(r: Readout, value: number | undefined): string {
  if (value === undefined) return "not yet";
  switch (r.kind) {
    case "temperature":
      return `${formatNumber(value, 3)}${NBSP}K (${formatNumber(Math.round(value - 273.15), 3)}${NBSP}°C)`;
    case "pressure":
      if (value >= 1e5) return `${formatNumber(value / 1e5, 3)}${NBSP}bar`;
      if (value >= 1e3) return `${formatNumber(value / 1e3, 3)}${NBSP}kPa`;
      return `${formatNumber(value, 3)}${NBSP}Pa`;
    case "power":
      return value <= 0 ? "off" : `${formatNumber(value, 2)}${NBSP}W`;
    case "share":
      return `${formatNumber(value * 100, 3)}%`;
  }
}
