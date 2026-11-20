/** Drawing helpers the structure figures share: arrows, linked boxes, time bands and glyphs. */
import { dayOf } from "@phosphoros/calc/time";
import type { ReactNode } from "react";
import type { Scale } from "./kit.tsx";

/** The flows between machines. Each has its own line, so colour is never the only cue. */
export type Flow = "mass" | "power" | "effect";

const FLOW_TONE: Record<Flow, string> = { mass: "soft", power: "accent", effect: "muted" };
const FLOW_DASH: Record<Flow, string | undefined> = {
  mass: undefined,
  power: "5 3",
  effect: "1.5 3",
};

/** An arrow along a polyline, its head on the last point. */
export function Arrow({
  points,
  flow = "mass",
  title,
}: {
  points: [number, number][];
  flow?: Flow;
  title?: string;
}) {
  const tone = FLOW_TONE[flow];
  const n = points.length;
  const [ax, ay] = points[n - 2] ?? [0, 0];
  const [bx, by] = points[n - 1] ?? [0, 0];
  const len = Math.hypot(bx - ax, by - ay) || 1;
  const ux = (bx - ax) / len;
  const uy = (by - ay) / len;
  const head = 7;
  const half = 3.6;
  // The line stops at the base of the head so a dash never pokes through its tip.
  const line = points.map(([x, y], i) => (i === n - 1 ? [bx - ux * head, by - uy * head] : [x, y]));
  const d = line.map(([x, y], i) => `${i ? "L" : "M"}${x?.toFixed(1)},${y?.toFixed(1)}`).join("");
  const baseX = bx - ux * head;
  const baseY = by - uy * head;
  const tri = `M${bx.toFixed(1)},${by.toFixed(1)}L${(baseX - uy * half).toFixed(1)},${(baseY + ux * half).toFixed(1)}L${(baseX + uy * half).toFixed(1)},${(baseY - ux * half).toFixed(1)}Z`;
  return (
    <g>
      {title && <title>{title}</title>}
      <path
        d={d}
        className={`f-${tone}-line`}
        strokeWidth={1.5}
        strokeDasharray={FLOW_DASH[flow]}
        strokeLinejoin="round"
      />
      <path d={tri} className={`f-${tone}`} />
    </g>
  );
}

/** A legend entry for a flow: a short arrow beside its name. */
export function FlowKey({
  x,
  y,
  flow,
  label,
}: {
  x: number;
  y: number;
  flow: Flow;
  label: string;
}) {
  return (
    <g>
      <Arrow
        points={[
          [x, y],
          [x + 26, y],
        ]}
        flow={flow}
      />
      <text x={x + 32} y={y} dy="0.32em">
        {label}
      </text>
    </g>
  );
}

/**
 * A box that names something: a filled card with a hairline edge. With `href` it is a link; the
 * theme lights the edge (.f-node) on hover and keyboard focus.
 */
export function Card({
  x,
  y,
  w,
  h,
  href,
  title,
  name,
  sub,
  fill = "surface",
  bold = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  href?: string;
  title: string;
  name: string;
  sub?: string;
  fill?: "surface" | "sunk";
  bold?: boolean;
}) {
  const body = (
    <g>
      <title>{title}</title>
      <rect className={`f-${fill}`} x={x} y={y} width={w} height={h} rx={6} />
      <rect className="f-axis f-node" x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={6} />
      <text
        className="f-label"
        x={x + 10}
        y={sub ? y + h / 2 - 3 : y + h / 2}
        dy={sub ? undefined : "0.32em"}
        fontWeight={bold ? 600 : undefined}
      >
        {name}
      </text>
      {sub && (
        <text className="f-note f-num" x={x + 10} y={y + h / 2 + 12}>
          {sub}
        </text>
      )}
    </g>
  );
  return href ? <a href={href}>{body}</a> : body;
}

/** A diamond centred on (x, y): a milestone, or hollow, a gate. */
export function Diamond({
  x,
  y,
  r = 6,
  tone = "ink",
  hollow = false,
}: {
  x: number;
  y: number;
  r?: number;
  tone?: string;
  hollow?: boolean;
}) {
  const d = `M${x},${y - r}L${x + r},${y}L${x},${y + r}L${x - r},${y}Z`;
  return hollow ? (
    <g>
      <path d={d} className="f-surface" />
      <path d={d} className={`f-${tone}-line`} strokeWidth={2} strokeLinejoin="round" />
    </g>
  ) : (
    <path d={d} className={`f-${tone} f-ring`} strokeLinejoin="round" />
  );
}

/**
 * Years as bands on a time axis: a hairline at each January 1st and the year's name centred in the
 * part of its span the axis shows.
 */
export function YearBands({
  x,
  top,
  bottom,
  labelY,
  from,
  to,
}: {
  x: Scale;
  top: number;
  bottom: number;
  labelY: number[];
  from: number;
  to: number;
}) {
  const out: ReactNode[] = [];
  for (let yr = 2027; yr <= 2040; yr++) {
    const d0 = dayOf(`${yr}-01-01`);
    const d1 = dayOf(`${yr + 1}-01-01`);
    if (d0 > to + 1e-9) break;
    if (d0 >= from - 1e-9)
      out.push(
        <line key={`g${yr}`} className="f-grid" x1={x(d0)} x2={x(d0)} y1={top} y2={bottom} />,
      );
    const a = Math.max(d0, from);
    const b = Math.min(d1, to);
    // A year shows its name only when enough of it is on the axis to hold the label.
    if (x(b) - x(a) < 30) continue;
    for (const ly of labelY)
      out.push(
        <text
          key={`t${yr}${ly}`}
          className="f-tick"
          x={(x(a) + x(b)) / 2}
          y={ly}
          textAnchor="middle"
        >
          {yr}
        </text>,
      );
  }
  return <g>{out}</g>;
}
