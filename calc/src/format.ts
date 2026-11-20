/**
 * How numbers are written everywhere: pages, docs, charts and the CLI share this one formatter,
 * so a number reads the same wherever it appears. Pure.
 */
import { isoOf, longDateOf, monthOf, YEAR_S } from "./time.ts";

const SUP: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

/**
 * The space inside a number and between a number and its unit: U+00A0, no-break space, so a line
 * never breaks inside "5.3 × 10²⁶ J" or "60 d". Not U+202F (the narrow SI space): every face has
 * U+00A0 at the width of an ordinary space, so text set before keeps its spacing and its layout.
 */
const NBSP = "\u00a0";

/** Display names for units: SI strings in data/ become typographic ones. */
const UNIT_TEXT: Record<string, string> = {
  "N/A2": "N/A²",
  "J/mol/K": "J/(mol·K)",
  "J s": "J·s",
  m2: "m²",
  m3: "m³",
  "m/s2": "m/s²",
  "W/m2": "W/m²",
  "kW/m2": "kW/m²",
  "MW/m2": "MW/m²",
  "kg/m2": "kg/m²",
  "g/m2": "g/m²",
  "kg/m3": "kg/m³",
  "m2/s": "m²/s",
  "A m2": "A·m²",
  "m3/s2": "m³/s²",
  "m3 kg-1 s-2": "m³ kg⁻¹ s⁻²",
  "W m-2 K-4": "W m⁻² K⁻⁴",
  "W m-2 sr-1": "W m⁻² sr⁻¹",
  "J/K": "J/K",
  "J/kg/K": "J/(kg·K)",
  "W/m/K": "W/(m·K)",
  "km2/s2": "km²/s²",
  "1/m3": "per m³",
  "1/cm3": "per cm³",
  "1/m2": "per m²",
  "m3/s": "m³/s",
  "cm3/s": "cm³/s",
  "m6/s": "m⁶/s",
  "cm6/s": "cm⁶/s",
  km2: "km²",
  "1": "",
  count: "",
  deg: "°",
  "%": "%",
  ppm: "ppm",
};

/** Multiply an SI value by this to show it in the display unit. */
const SCALE: Record<string, Record<string, number>> = {
  m: { km: 1e-3, AU: 1 / 1.495978707e11, µm: 1e6, nm: 1e9, cm: 100, mm: 1000, Mm: 1e-6 },
  kg: { t: 1e-3, Mt: 1e-9, g: 1e3 },
  s: { yr: 1 / YEAR_S, months: 12 / YEAR_S, d: 1 / 86_400, h: 1 / 3600, min: 1 / 60, ms: 1e3 },
  d: { yr: 1 / 365.25, months: 12 / 365.25, h: 24 },
  Pa: { bar: 1e-5, MPa: 1e-6, kPa: 1e-3, GPa: 1e-9 },
  W: { TW: 1e-12, PW: 1e-15, MW: 1e-6, GW: 1e-9 },
  J: { EJ: 1e-18, MJ: 1e-6 },
  "m/s": { "km/s": 1e-3 },
  "m/s2": { g: 1 / 9.80665 },
  "J/kg": { "MJ/kg": 1e-6, "kJ/kg": 1e-3 },
  "J/mol": { "kJ/mol": 1e-3 },
  "W/m2": { "kW/m2": 1e-3, "MW/m2": 1e-6 },
  "kg/m2": { "g/m2": 1e3 },
  "kg/s": { "t/s": 1e-3 },
  m2: { km2: 1e-6 },
  T: { nT: 1e9 },
  "1": { "%": 100, ppm: 1e6 },
  "1/m3": { "1/cm3": 1e-6 },
  // A Dobson unit is 2.687 × 10²⁰ molecules per m²: a layer 10 µm thick at 0 °C and 1 atm.
  "1/m2": { DU: 1 / 2.687e20 },
  "m3/s": { "cm3/s": 1e6 },
  "m6/s": { "cm6/s": 1e12 },
  "K/m": { "K/km": 1e3 },
  "m2/s2": { "km2/s2": 1e-6 },
};

export function unitText(unit: string): string {
  return UNIT_TEXT[unit] ?? unit;
}

/** Convert an SI value to its display unit. */
export function toDisplay(value: number, unit: string, show?: string): number {
  if (!show || show === unit) return value;
  if (unit === "K" && show === "°C") return value - 273.15;
  const f = SCALE[unit]?.[show];
  if (f === undefined) throw new Error(`format: no conversion from ${unit} to ${show}`);
  return value * f;
}

function superscript(n: number): string {
  return String(n)
    .split("")
    .map((c) => SUP[c] ?? c)
    .join("");
}

/** Round to sig significant figures. */
export function roundSig(x: number, sig: number): number {
  if (x === 0 || !Number.isFinite(x)) return x;
  const p = Math.floor(Math.log10(Math.abs(x)));
  const f = 10 ** (sig - 1 - p);
  return Math.round(x * f) / f;
}

/**
 * A number for reading: scientific with a Unicode exponent when large or tiny ("5.3 × 10²⁶"),
 * grouped digits otherwise ("137,000"). Never more digits than sig.
 */
export function formatNumber(x: number, sig = 2): string {
  if (x === 0) return "0";
  if (!Number.isFinite(x)) return String(x);
  const r = roundSig(x, sig);
  const a = Math.abs(r);
  if (a >= 1e6 || a < 1e-3) {
    let e = Math.floor(Math.log10(a));
    let m = r / 10 ** e;
    // Rounding can carry the mantissa to 10.
    if (Math.abs(Number(m.toFixed(Math.max(0, sig - 1)))) >= 10) {
      e += 1;
      m = r / 10 ** e;
    }
    const ms = m.toFixed(Math.max(0, sig - 1));
    if (ms === "1") return `10${superscript(e)}`;
    if (ms === "-1") return `−10${superscript(e)}`;
    return `${ms.replace("-", "−")}${NBSP}×${NBSP}10${superscript(e)}`;
  }
  const decimals = Math.max(0, sig - 1 - Math.floor(Math.log10(a)));
  const s = r.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return s.replace("-", "−");
}

/** Plain ASCII form for Markdown tables and code: 5.3e26. */
export function formatPlain(x: number, sig = 3): string {
  const r = roundSig(x, sig);
  const a = Math.abs(r);
  if (a !== 0 && (a >= 1e6 || a < 1e-3))
    return r.toExponential(Math.max(0, sig - 1)).replace("e+", "e");
  return String(r);
}

export type DateStyle = "year" | "month" | "day" | "iso";

export interface Formattable {
  value: number;
  unit: string;
  show?: string;
  sig?: number;
}

/** A quantity as people read it: "5.3 × 10²⁶ J", "137,000 km", "July 2033", "60%". */
export function formatQuantity(
  q: Formattable,
  opts: { sig?: number; date?: DateStyle } = {},
): string {
  if (q.unit === "date") {
    const style = opts.date ?? (q.show === "day" ? "day" : q.show === "iso" ? "iso" : "month");
    if (style === "iso") return isoOf(q.value);
    if (style === "year") return isoOf(q.value).slice(0, 4);
    if (style === "day") return longDateOf(q.value);
    return monthOf(q.value);
  }
  const show = q.show ?? q.unit;
  const v = toDisplay(q.value, q.unit, show);
  const n = formatNumber(v, opts.sig ?? q.sig ?? 2);
  const u = unitText(show);
  if (!u) return n;
  if (u === "%" || u === "°") return `${n}${u}`;
  // A unit with spaces in it ("W m⁻² K⁻⁴") holds together too.
  return `${n}${NBSP}${u.replaceAll(" ", NBSP)}`;
}
