/** Drawing helpers for the "space" diagrams: arrows, stacked labels, region names and scale notes. */
import type { ReactNode } from "react";
import { Art } from "./kit.tsx";

export type Anchor = "start" | "middle" | "end";

/** A straight arrow: a line and a solid head, drawn without markers so ids never clash on a page. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  tone = "muted",
  width = 1.5,
  head = 7,
  dash,
  title,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone?: string;
  width?: number;
  head?: number;
  dash?: string;
  title?: string;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const back = (s: number) => [x2 - head * Math.cos(a + s), y2 - head * Math.sin(a + s)];
  const [lx, ly] = back(0.42);
  const [rx, ry] = back(-0.42);
  const ex = x2 - head * 0.8 * Math.cos(a);
  const ey = y2 - head * 0.8 * Math.sin(a);
  return (
    <g>
      {title && <title>{title}</title>}
      <line
        className={`f-${tone}-line`}
        x1={x1}
        y1={y1}
        x2={ex}
        y2={ey}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash}
      />
      <path className={`f-${tone}`} d={`M${x2},${y2}L${lx},${ly}L${rx},${ry}Z`} />
    </g>
  );
}

/** An arrow along a quadratic curve through a control point, its head aligned with the end. */
export function CurvedArrow({
  from,
  via,
  to,
  tone = "muted",
  width = 1.5,
  head = 7,
}: {
  from: [number, number];
  via: [number, number];
  to: [number, number];
  tone?: string;
  width?: number;
  head?: number;
}) {
  const a = Math.atan2(to[1] - via[1], to[0] - via[0]);
  const back = (s: number) => [to[0] - head * Math.cos(a + s), to[1] - head * Math.sin(a + s)];
  const [lx, ly] = back(0.42);
  const [rx, ry] = back(-0.42);
  const ex = to[0] - head * 0.8 * Math.cos(a);
  const ey = to[1] - head * 0.8 * Math.sin(a);
  return (
    <g>
      <path
        className={`f-${tone}-line`}
        d={`M${from[0]},${from[1]}Q${via[0]},${via[1]} ${ex},${ey}`}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <path className={`f-${tone}`} d={`M${to[0]},${to[1]}L${lx},${ly}L${rx},${ry}Z`} />
    </g>
  );
}

export interface Line {
  text: string;
  /** label (ink), note (muted, small) or plain (soft). */
  kind?: "label" | "note" | "plain";
}

/** Lines of text stacked under one another: a label and its notes. */
export function Lines({
  x,
  y,
  lines,
  anchor = "start",
  gap = 14.5,
  halo = false,
}: {
  x: number;
  y: number;
  lines: (Line | string)[];
  anchor?: Anchor;
  gap?: number;
  /**
   * Draw a surface-coloured outline under the text, so it reads where lines cross it: hidden copies
   * (.f-halo), all under all the lines' text, so no halo covers the line above.
   */
  halo?: boolean;
}) {
  const set = lines.map((l, i) => {
    const line = typeof l === "string" ? { text: l, kind: i ? "note" : "label" } : l;
    const cls = line.kind === "label" ? "f-label" : line.kind === "note" ? "f-note f-num" : "";
    return { text: line.text, cls, y: y + i * gap, key: `${i}-${line.text}` };
  });
  return (
    <g>
      {halo && (
        <Art>
          {set.map((l) => (
            <text
              key={l.key}
              className={`${l.cls} f-halo`}
              x={x}
              y={l.y}
              textAnchor={anchor}
              strokeWidth={7}
            >
              {l.text}
            </text>
          ))}
        </Art>
      )}
      {set.map((l) => (
        <text key={l.key} className={l.cls || undefined} x={x} y={l.y} textAnchor={anchor}>
          {l.text}
        </text>
      ))}
    </g>
  );
}

/** The name of a region of a diagram: small capitals in the muted ink. */
export function Region({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: Anchor;
}) {
  return (
    <text
      className="f-muted"
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={11.5}
      fontWeight={600}
      letterSpacing="0.12em"
    >
      {children}
    </text>
  );
}

/** A small boxed note, for "Not to scale" and similar warnings about the drawing itself. */
export function Tag({
  x,
  y,
  text,
  anchor = "start",
}: {
  x: number;
  y: number;
  text: string;
  anchor?: Anchor;
}) {
  const w = text.length * 6.3 + 14;
  const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
  return (
    <g>
      <rect className="f-axis" x={left} y={y - 12} width={w} height={18} rx={9} />
      <text className="f-note" x={left + w / 2} y={y + 0.5} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

/** The two short slashes that mark a break in an axis. */
export function AxisBreak({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line className="f-axis" x1={x - 6} y1={y + 5} x2={x - 2} y2={y - 5} />
      <line className="f-axis" x1={x + 2} y1={y + 5} x2={x + 6} y2={y - 5} />
    </g>
  );
}

/** A dot on a mark: series fill with the surface ring, a native tooltip, and r ≥ 4. */
export function Dot({
  x,
  y,
  tone = "accent",
  r = 4.5,
  title,
}: {
  x: number;
  y: number;
  tone?: string;
  r?: number;
  title?: string;
}) {
  return (
    <circle className={`f-${tone} f-ring`} cx={x} cy={y} r={r}>
      {title && <title>{title}</title>}
    </circle>
  );
}

/** Points along an ellipse with one focus at (fx, fy): semi-major axis a, eccentricity e, rotated by w. */
export function conic(
  fx: number,
  fy: number,
  a: number,
  e: number,
  w = 0,
  from = 0,
  to = 2 * Math.PI,
  steps = 180,
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const nu = from + ((to - from) * i) / steps;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
    out.push([fx + r * Math.cos(nu + w), fy - r * Math.sin(nu + w)]);
  }
  return out;
}
