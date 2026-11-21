/** Drawing helpers every figure shares: the frame, scales, axes and number formatting. */
import { formatQuantity } from "@phosphoros/calc/format";
import type { Quantity, Registry } from "@phosphoros/calc/registry";
import { formatRef, type RefOptions } from "@phosphoros/calc/template";
import { dayOf } from "@phosphoros/calc/time";
import type { ReactNode } from "react";

/** The width every figure is drawn at. Text is sized for this width; small screens scroll. */
export const W = 760;

/**
 * The frame: an accessible SVG named by its title and described by its description. The site shows
 * the full text alternative (the data in words) under it.
 *
 * A figure without links is one image. A figure with links (`links`) is a group of them instead,
 * since an image cannot hold controls: it must draw everything that is not a link inside `Art` and
 * every link with `Link`, so a screen reader meets the title, the description and then each link
 * once, by its own name.
 */
export function Frame({
  id,
  title,
  desc,
  height,
  width = W,
  links = false,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  height: number;
  width?: number;
  links?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      className="fig"
      role={links ? "group" : "img"}
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      data-figure={id}
    >
      <title id={`${id}-t`}>{title}</title>
      <desc id={`${id}-d`}>{desc}</desc>
      {children}
    </svg>
  );
}

/** Drawing that assistive technology skips: in a figure with links, everything but the links. */
export function Art({ children }: { children: ReactNode }) {
  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: an SVG g is never focusable; Biome cannot tell.
  return <g aria-hidden="true">{children}</g>;
}

/**
 * A width that a line of text at `size` px will not exceed: wider than Inter, the site's face, and
 * the common system faces draw it. For boxes drawn around text.
 */
export function textWidth(text: string, size = 13): number {
  return text.length * size * 0.56;
}

/** Text broken at spaces into lines no wider than `width` (by textWidth, so it fits any face). */
export function wrap(text: string, width: number, size = 13): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** A rectangle in figure units. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A link in a figure. Its accessible name is `label` alone; its drawing is hidden from assistive
 * technology so no text is read twice. Keyboard focus and hover light every .f-node inside it in the
 * accent colour: give it a `box` around everything it names unless its drawing already holds an
 * .f-node mark big enough to see when lit.
 */
export function Link({
  href,
  label,
  box,
  children,
}: {
  href: string;
  label: string;
  box?: Box;
  children: ReactNode;
}) {
  return (
    <a href={href} aria-label={label}>
      <Art>{children}</Art>
      {box && (
        <rect
          className="f-node"
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          rx={5}
          fill="none"
          pointerEvents="all"
        />
      )}
    </a>
  );
}

export type Scale = ((v: number) => number) & { domain: [number, number]; range: [number, number] };

export function linear(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const f = ((v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)) as Scale;
  f.domain = domain;
  f.range = range;
  return f;
}

export function log(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain.map(Math.log10) as [number, number];
  const [r0, r1] = range;
  const f = ((v: number) => r0 + ((Math.log10(v) - d0) / (d1 - d0)) * (r1 - r0)) as Scale;
  f.domain = domain;
  f.range = range;
  return f;
}

/** Clean ticks for a linear axis: about `count` steps of 1, 2 or 5 × 10ⁿ. */
export function ticks(min: number, max: number, count = 5): number[] {
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step)
    out.push(Number(v.toPrecision(12)));
  return out;
}

/** Powers of ten across a log axis, thinned to at most `max` labels. */
export function decades(min: number, max: number, most = 8): number[] {
  const lo = Math.ceil(Math.log10(min));
  const hi = Math.floor(Math.log10(max));
  const every = Math.max(1, Math.ceil((hi - lo + 1) / most));
  const out: number[] = [];
  for (let e = lo; e <= hi; e += every) out.push(10 ** e);
  return out;
}

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

/** 10ⁿ as text, for log-axis ticks. */
export function pow10(v: number): string {
  const e = Math.round(Math.log10(v));
  return `10${String(e).replace(/./g, (c) => SUP[c] ?? c)}`;
}

/** January 1st of each year in a span of days, as [day, year]. */
export function years(fromDay: number, toDay: number): [number, number][] {
  const out: [number, number][] = [];
  for (let y = 2027; y <= 2040; y++) {
    const d = dayOf(`${y}-01-01`);
    if (d >= fromDay - 1e-9 && d <= toDay + 1e-9) out.push([d, y]);
  }
  return out;
}

/** A model number as the site writes it. */
export function show(r: Registry, id: string, opts: RefOptions = {}): string {
  return formatRef(r.get(id), opts);
}

/** Data text carried on mid-sentence: only its first letter lowered, so names inside keep theirs. */
export function midSentence(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** A value in a quantity's units, written like the quantity. */
export function showValue(q: Quantity, value: number, opts: RefOptions = {}): string {
  return formatQuantity({ ...q, value }, opts);
}

/** Horizontal gridlines with tick labels at the left. */
export function YAxis({
  y,
  values,
  label,
  x0,
  x1,
  format,
}: {
  y: Scale;
  values: number[];
  label?: string;
  x0: number;
  x1: number;
  format: (v: number) => string;
}) {
  return (
    <g>
      {values.map((v) => (
        <g key={v}>
          <line className="f-grid" x1={x0} x2={x1} y1={y(v)} y2={y(v)} />
          <text className="f-tick" x={x0 - 8} y={y(v)} dy="0.32em" textAnchor="end">
            {format(v)}
          </text>
        </g>
      ))}
      {label && (
        <text className="f-note" x={x0} y={Math.min(...y.range) - 12}>
          {label}
        </text>
      )}
    </g>
  );
}

/** A baseline with year ticks under it. */
export function YearAxis({ x, y0, from, to }: { x: Scale; y0: number; from: number; to: number }) {
  return (
    <g>
      <line className="f-axis" x1={x.range[0]} x2={x.range[1]} y1={y0} y2={y0} />
      {years(from, to).map(([d, yr]) => (
        <g key={yr}>
          <line className="f-axis" x1={x(d)} x2={x(d)} y1={y0} y2={y0 + 4} />
          <text className="f-tick" x={x(d)} y={y0 + 18} textAnchor="middle">
            {yr}
          </text>
        </g>
      ))}
    </g>
  );
}

/** A labelled marker on a time axis: a hairline, a dot on the curve and a label. */
export function Milestone({
  x,
  y,
  top,
  label,
  sub,
  anchor = "start",
  tone = "accent",
}: {
  x: number;
  y: number;
  top: number;
  label: string;
  sub?: string;
  anchor?: "start" | "end" | "middle";
  tone?: "accent" | "ink" | "cool" | "hot";
}) {
  const dx = anchor === "start" ? 6 : anchor === "end" ? -6 : 0;
  return (
    <g>
      <line className="f-axis" x1={x} x2={x} y1={top + (sub ? 24 : 8)} y2={y} />
      <circle className={`f-${tone} f-ring`} cx={x} cy={y} r={4.5} />
      <text className="f-label" x={x + dx} y={top} textAnchor={anchor}>
        {label}
      </text>
      {sub && (
        <text className="f-note f-num" x={x + dx} y={top + 15} textAnchor={anchor}>
          {sub}
        </text>
      )}
    </g>
  );
}

/** A path through points. */
export function path(points: [number, number][]): string {
  return points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
}

/** A legend entry: a swatch beside text, never coloured text. */
export function Key({
  x,
  y,
  tone,
  label,
  line,
}: {
  x: number;
  y: number;
  tone: string;
  label: string;
  line?: boolean;
}) {
  return (
    <g>
      {line ? (
        <line className={`f-${tone}-line f-mark-line`} x1={x} x2={x + 16} y1={y} y2={y} />
      ) : (
        <rect className={`f-${tone}`} x={x} y={y - 5} width={10} height={10} rx={2} />
      )}
      <text x={x + (line ? 22 : 16)} y={y} dy="0.32em">
        {label}
      </text>
    </g>
  );
}
