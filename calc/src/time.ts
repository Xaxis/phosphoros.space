/**
 * Dates in the model are days since the program epoch, 2027-01-01 (UTC). Pure: the epoch is a
 * constant, never the clock.
 */
export const EPOCH_ISO = "2027-01-01";
const EPOCH_MS = Date.UTC(2027, 0, 1);
const DAY_MS = 86_400_000;

/** Seconds in a Julian year, the year the model counts durations in. */
export const YEAR_S = 365.25 * 86_400;
export const DAY_S = 86_400;

/** The Julian day at the Unix epoch, 1970-01-01 00:00 UTC: a definition, not a measurement. */
const UNIX_JULIAN_DAY = 2440587.5;

/** Days since the program epoch for a Julian day (the astronomers' count of days). */
export function dayOfJulian(jd: number): number {
  return jd - UNIX_JULIAN_DAY - EPOCH_MS / DAY_MS;
}

/** Days since the epoch for an ISO date (YYYY-MM-DD). */
export function dayOf(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error(`time: "${iso}" is not YYYY-MM-DD`);
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms)) throw new Error(`time: "${iso}" is not a date`);
  return (ms - EPOCH_MS) / DAY_MS;
}

/** ISO date (YYYY-MM-DD) for days since the epoch, rounded to the nearest day. */
export function isoOf(day: number): string {
  return new Date(EPOCH_MS + Math.round(day) * DAY_MS).toISOString().slice(0, 10);
}

/** Decimal year (2033.5 is mid-2033) for days since the epoch. */
export function yearOf(day: number): number {
  return 2027 + day / 365.25;
}

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

/** "July 2033" for days since the epoch. */
export function monthOf(day: number): string {
  const d = new Date(EPOCH_MS + Math.round(day) * DAY_MS);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "6 July 2033" for days since the epoch. */
export function longDateOf(day: number): string {
  const d = new Date(EPOCH_MS + Math.round(day) * DAY_MS);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
