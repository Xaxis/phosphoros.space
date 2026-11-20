/** Helpers the "charts" set shares: bars with a rounded data end, technology links, model series. */
import type { Registry } from "@phosphoros/calc/registry";
import type { ReactNode } from "react";
import { Art, type Box, Link } from "./kit.tsx";

/**
 * A horizontal bar from x0 (the baseline, square) to x1 (the data end, rounded 4px). Bars too short
 * for the corners shrink the radius instead of overshooting.
 */
export function hbar(x0: number, x1: number, y: number, h: number, r = 4): string {
  const w = Math.max(0, x1 - x0);
  const k = Math.min(r, w, h / 2);
  const f = (n: number) => n.toFixed(1);
  return `M${f(x0)},${f(y)}H${f(x0 + w - k)}A${k},${k} 0 0 1 ${f(x0 + w)},${f(y + k)}V${f(y + h - k)}A${k},${k} 0 0 1 ${f(x0 + w - k)},${f(y + h)}H${f(x0)}Z`;
}

/**
 * A mark that names a technology links to its page (see Link: named by `label`, lit by `box` on
 * focus). One that names none is drawing only, hidden from assistive technology.
 */
export function TechLink({
  tech,
  label,
  box,
  children,
}: {
  tech?: string;
  label: string;
  box?: Box;
  children: ReactNode;
}) {
  if (!tech) return <Art>{children}</Art>;
  return (
    <Link href={`/technologies/${tech}`} label={label} box={box}>
      {children}
    </Link>
  );
}

/**
 * Text with a halo in the surface colour, so a label stays legible where it crosses a gridline or a
 * reference line. The halo is a copy drawn underneath (.f-halo), hidden from assistive technology.
 */
export function Halo({
  x,
  y,
  className = "",
  anchor = "start",
  dy,
  children,
}: {
  x: number;
  y: number;
  className?: string;
  anchor?: "start" | "middle" | "end";
  dy?: string;
  children: ReactNode;
}) {
  return (
    <g>
      <Art>
        <text
          className={`${className} f-halo`}
          x={x}
          y={y}
          dy={dy}
          textAnchor={anchor}
          strokeWidth={5}
        >
          {children}
        </text>
      </Art>
      <text className={className} x={x} y={y} dy={dy} textAnchor={anchor}>
        {children}
      </text>
    </g>
  );
}

/** A model time series as [day, value] pairs. */
export function seriesOf(r: Registry, id: string): [number, number][] {
  const s = r.series.get(id);
  if (!s) throw new Error(`figures: no ${id} series`);
  return s.points.map((p) => [p.x, p.y]);
}
