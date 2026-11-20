/**
 * The decade as a Gantt chart, to scale: every workstream and milestone in data/timeline.yaml, by
 * lane, with the critical path marked and the Earth-like date and the deadline accented.
 */
import { fill } from "@phosphoros/calc/template";
import type { ReactNode } from "react";
import { Art, Frame, Link, linear, show, showValue, W } from "./kit.tsx";
import { Diamond, YearBands } from "./structure-kit.tsx";
import type { FigureDef } from "./types.ts";

export interface GanttRow {
  id: string;
  label: string;
  lane: string;
  kind: "bar" | "milestone" | "gate";
  start: number;
  end?: number;
  startText: string;
  endText?: string;
  startId: string;
  endId?: string;
  href?: string;
  critical: boolean;
  accent: boolean;
}

export interface GanttProps {
  lanes: { id: string; label: string }[];
  rows: GanttRow[];
  from: number;
  to: number;
  earthLike: number;
  earthLikeText: string;
  deadline: number;
  deadlineText: string;
  /** Days between the Earth-like date and the deadline, as text, without a sign. */
  slack: string;
  /** Earth-like after the deadline (a variant in the Explorer). */
  late: boolean;
  criticalPath: string;
}

const M = { l: 236, r: 22 };
const ROW = 22;
const LANE = 28;
const TOP = 74;

function Gantt(p: GanttProps) {
  const x = linear([p.from, p.to], [M.l, W - M.r]);
  // Each lane: a heading, then its rows in the order the data gives them.
  let y = TOP;
  const placed: { lane?: { id: string; label: string }; row?: GanttRow; y: number }[] = [];
  for (const lane of p.lanes) {
    const rows = p.rows.filter((r) => r.lane === lane.id);
    if (!rows.length) continue;
    placed.push({ lane, y });
    y += LANE;
    for (const row of rows) {
      placed.push({ row, y });
      y += ROW;
    }
  }
  const bottom = y + 6;
  const H = bottom + 44;
  const xe = x(p.earthLike);
  const xd = x(p.deadline);
  return (
    <Frame
      id="gantt"
      title="The Phosphoros decade, 2027 to 2036"
      desc={`To scale. ${p.rows.length} workstreams and milestones in five lanes, from the proof experiments to the deadline. The critical path is drawn with thicker bars. Earth-like Venus, in the simulation, comes on ${p.earthLikeText}, ${p.slack} ${p.late ? "after" : "before"} the deadline.`}
      height={H}
      links
    >
      <Art>
        {/* Key */}
        <g>
          <rect className="f-s1" x={16} y={14} width={22} height={10} rx={3} />
          <text x={44} y={19} dy="0.32em">
            Workstream
          </text>
          <rect className="f-s2" x={132} y={12} width={22} height={14} rx={4} />
          <text x={160} y={19} dy="0.32em">
            On the critical path
          </text>
          <Diamond x={302} y={19} r={5.5} />
          <text x={313} y={19} dy="0.32em">
            Milestone
          </text>
          <Diamond x={396} y={19} r={5.5} hollow />
          <text x={407} y={19} dy="0.32em">
            Go or no-go gate
          </text>
          <rect className="f-accent-wash" x={530} y={11} width={10} height={16} />
          {/* Solid is Earth-like, dashed the deadline, drawn in the order they fall. */}
          <line
            className="f-accent-line"
            strokeWidth={2}
            x1={p.late ? 540 : 530}
            x2={p.late ? 540 : 530}
            y1={11}
            y2={27}
          />
          <line
            className="f-accent-line"
            strokeWidth={2}
            strokeDasharray="3 2"
            x1={p.late ? 530 : 540}
            x2={p.late ? 530 : 540}
            y1={11}
            y2={27}
          />
          <text x={548} y={19} dy="0.32em">
            {p.late ? "The deadline, then Earth-like" : "Earth-like, then the deadline"}
          </text>
        </g>

        {/* The slack between the simulated Earth-like date and the deadline. */}
        <rect
          className="f-accent-wash"
          x={Math.min(xe, xd)}
          y={TOP - 18}
          width={Math.abs(xd - xe)}
          height={bottom - TOP + 18}
        />
        <YearBands
          x={x}
          top={TOP - 18}
          bottom={bottom}
          labelY={[TOP - 24, bottom + 16]}
          from={p.from}
          to={p.to}
        />
        <line className="f-axis" x1={M.l} x2={W - M.r} y1={bottom} y2={bottom} />
      </Art>

      {placed.map(({ lane, row, y: ry }) => {
        if (lane)
          return (
            <Art key={lane.id}>
              <line className="f-grid" x1={16} x2={W - M.r} y1={ry + 4} y2={ry + 4} />
              <text className="f-title" x={16} y={ry + 20}>
                {lane.label}
              </text>
            </Art>
          );
        if (!row) return null;
        const cy = ry + ROW / 2;
        const when = row.endText ? `${row.startText} to ${row.endText}` : row.startText;
        const tone = row.accent
          ? "accent"
          : row.critical
            ? "s2"
            : row.kind === "bar"
              ? "s1"
              : "ink";
        let mark: ReactNode;
        if (row.kind === "bar" && row.end !== undefined) {
          const h = row.critical ? 14 : 10;
          mark = (
            <rect
              className={`f-${tone}`}
              x={x(row.start)}
              y={cy - h / 2}
              width={Math.max(2, x(row.end) - x(row.start))}
              height={h}
              rx={row.critical ? 4 : 3}
            />
          );
        } else {
          const mx = x(row.start);
          // Dates sit right of their diamond unless they would cross the Earth-like line or run off
          // the edge; then left, and clear of the line.
          const right = mx + 11 + row.startText.length * 6.4 < (mx < xe ? xe : W) - 4;
          mark = (
            <g>
              <Diamond x={mx} y={cy} r={7} tone={tone} hollow={row.kind === "gate"} />
              <text
                className="f-note f-num"
                x={right ? mx + 11 : Math.min(mx, xe) - 11}
                y={cy}
                dy="0.32em"
                textAnchor={right ? "start" : "end"}
              >
                {row.startText}
              </text>
            </g>
          );
        }
        const name = `${row.label}: ${when}${row.critical ? " (critical path)" : ""}`;
        const body = (
          <g>
            <title>{name}</title>
            <text
              className="f-label"
              x={28}
              y={cy}
              dy="0.32em"
              fontWeight={row.critical || row.accent ? 600 : undefined}
            >
              {row.label}
            </text>
            {mark}
          </g>
        );
        // A linked row lights a box around its label, mark and date: a milestone's diamond alone is
        // too small to show focus.
        return (
          <g key={row.id}>
            {row.href ? (
              <Link href={row.href} label={name} box={{ x: 20, y: ry + 1, w: W - 24, h: ROW - 2 }}>
                {body}
              </Link>
            ) : (
              <Art>{body}</Art>
            )}
          </g>
        );
      })}

      {/* The Earth-like date and the deadline run the height of the chart. */}
      <Art>
        <line
          className="f-accent-line"
          strokeWidth={2}
          x1={xe}
          x2={xe}
          y1={TOP - 18}
          y2={bottom + 30}
        />
        <line
          className="f-accent-line"
          strokeWidth={2}
          strokeDasharray="3 2"
          x1={xd}
          x2={xd}
          y1={TOP - 18}
          y2={bottom + 30}
        />
        <path className="f-accent-line" strokeWidth={1.5} d={`M${xe},${bottom + 30}H${xd}`} />
        <text
          className="f-note f-num"
          x={Math.min(xe, xd) - 6}
          y={bottom + 30}
          dy="0.32em"
          textAnchor="end"
        >
          Simulated Earth-like date: {p.slack} {p.late ? "after" : "before"} the deadline
        </text>
      </Art>
    </Frame>
  );
}

export const gantt: FigureDef<GanttProps> = {
  id: "gantt",
  title: "The decade",
  file: "figures/src/gantt.tsx",
  build: ({ r, content }) => {
    const day = (id: string) => r.get(id).value;
    const date = (id: string) => show(r, id, { date: "day" });
    const t = content.timeline;
    const slack = r.get("traj-slack-days");
    const rows: GanttRow[] = t.rows.map((row) => ({
      id: row.id,
      label: row.label,
      lane: row.lane,
      kind: row.kind ?? (row.end ? "bar" : "milestone"),
      start: day(row.start),
      end: row.end ? day(row.end) : undefined,
      startText: date(row.start),
      endText: row.end ? date(row.end) : undefined,
      startId: row.start,
      endId: row.end,
      href: row.tech ? `/technologies/${row.tech}` : row.link ? `/${row.link}` : undefined,
      critical: !!row.critical,
      accent: !!row.accent,
    }));
    return {
      lanes: t.lanes,
      rows,
      from: day("program-start"),
      // The deadline ends the chart, unless a variant runs past it; then the chart runs on.
      to: Math.max(
        day("deadline"),
        day("traj-earth-like"),
        ...rows.map((row) => row.end ?? row.start),
      ),
      earthLike: day("traj-earth-like"),
      earthLikeText: date("traj-earth-like"),
      deadline: day("deadline"),
      deadlineText: date("deadline"),
      slack: showValue(slack, Math.abs(slack.value)),
      late: slack.value < 0,
      criticalPath: fill(t.critical_path, (id) => r.get(id)),
    };
  },
  caption: (p) =>
    `Every workstream to scale, from the first experiments to the deadline. The critical path runs through the Foundry and the ice; the simulated air is Earth-like on ${p.earthLikeText}, ${p.slack} ${p.late ? "late" : "early"}.`,
  describe: (p) => ({
    summary: `${p.criticalPath} Earth-like Venus comes on ${p.earthLikeText} in the simulation, ${p.slack} ${p.late ? "after" : "before"} the deadline of ${p.deadlineText}.`,
    head: ["Lane", "Workstream or milestone", "Start", "End", "Critical path"],
    rows: p.rows.map((row) => [
      p.lanes.find((l) => l.id === row.lane)?.label ?? row.lane,
      row.label,
      row.startText,
      row.endText ?? "",
      row.critical ? "Yes" : "",
    ]),
  }),
  numbers: (p) => [
    ...new Set([
      "program-start",
      ...p.rows.flatMap((row) => (row.endId ? [row.startId, row.endId] : [row.startId])),
      "traj-earth-like",
      "deadline",
      "traj-slack-days",
    ]),
  ],
  Component: Gantt,
};
