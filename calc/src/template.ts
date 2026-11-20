/**
 * Text with numbers in it. Data files write `{id}` (or `{id|show=km,sig=2,date=day}`) wherever a
 * model number belongs; docs write a Markdown link to the ledger, `[5.3 × 10²⁶ J](numbers.md#id)`,
 * whose text tools/docs.ts keeps current. Both resolve through here. Pure: no file access.
 */
import { type DateStyle, formatQuantity } from "./format.ts";
import type { Quantity } from "./registry.ts";

export interface RefOptions {
  show?: string;
  sig?: number;
  date?: DateStyle;
}

export type Segment = { text: string } | { ref: string; opts: RefOptions; raw: string };

const REF = /\{([a-z0-9]+(?:-[a-z0-9]+)*)(?:\|([^}]*))?\}/g;
const DATE_STYLES = ["year", "month", "day", "iso"];

export function parseOptions(raw: string | undefined): RefOptions {
  const opts: RefOptions = {};
  if (!raw) return opts;
  for (const pair of raw.split(/[,&]/)) {
    const [k, v] = pair.split("=").map((s) => s.trim());
    if (!k || v === undefined) throw new Error(`template: bad option "${pair}"`);
    if (k === "sig") opts.sig = Number(v);
    else if (k === "show") opts.show = v;
    else if (k === "date" && DATE_STYLES.includes(v)) opts.date = v as DateStyle;
    else throw new Error(`template: unknown option "${pair}"`);
  }
  return opts;
}

/** Split text into literal runs and number references. */
export function parseTemplate(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(REF)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ ref: m[1] as string, opts: parseOptions(m[2]), raw: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** Every id a piece of text refers to. */
export function refsIn(text: string): string[] {
  return [...text.matchAll(REF)].map((m) => m[1] as string);
}

export function formatRef(q: Quantity, opts: RefOptions): string {
  return formatQuantity(
    { value: q.value, unit: q.unit, show: opts.show ?? q.show, sig: opts.sig ?? q.sig },
    opts.date ? { date: opts.date } : {},
  );
}

/** Fill a template with formatted numbers, for plain-text uses (alt text, Markdown tables). */
export function fill(text: string, get: (id: string) => Quantity): string {
  return parseTemplate(text)
    .map((s) => ("text" in s ? s.text : formatRef(get(s.ref), s.opts)))
    .join("");
}

/** Walk any parsed YAML value and yield every string in it. */
export function* stringsIn(value: unknown): Generator<string> {
  if (typeof value === "string") yield value;
  else if (Array.isArray(value)) for (const v of value) yield* stringsIn(v);
  else if (value && typeof value === "object")
    for (const v of Object.values(value)) yield* stringsIn(v);
}

/** Ledger links in Markdown: [text](../numbers.md?sig=2#id). */
export const NUMBER_LINK = /\[([^\]]*)\]\(((?:\.\.\/)*)numbers\.md(?:\?([^#)]*))?#([a-z0-9-]+)\)/g;
