/**
 * The simulated atmosphere, day by day: air temperature, and surface pressure with the CO₂ and
 * oxygen in it, as two small multiples on one time axis. Drawn from the model's day-by-day run.
 */
import type { Registry } from "@phosphoros/calc/registry";
import { Halo, seriesOf } from "./charts-kit.tsx";
import { Frame, Key, linear, log, path, show, textWidth, W, YearAxis } from "./kit.tsx";
import type { FigureDef } from "./types.ts";

interface Event {
  id: string;
  label: string;
  day: number;
  when: string;
}

interface Props {
  temp: [number, number][];
  pressure: [number, number][];
  co2: [number, number][];
  o2: [number, number][];
  events: Event[];
  /** A label's lines stand centred in its phase. */
  /** Ids, not dates, key the phases: in a late variant two can start on the same day. */
  phases: { id: string; from: number; to: number; label?: string[]; tone?: string }[];
  earthLike: Event;
  deadline: Event;
  from: number;
  to: number;
  earthLikeTemp: { value: number; text: string };
  /** The arriving Bricks' heat warms the air back up: when it peaks, by how much, and when the
      Clear Rain begins for good. */
  rewarm: { day: number; text: string; when: string; rerain: string; rerainDay: number };
  co2Limit: { value: number; text: string };
  ends: { total: string; co2: string; o2: string; start: string; finish: string };
}

const M = { l: 74, r: 112 };
const LABELS = 166;
// Room under the lowest event label for the panel title, so the two do not read as one block.
const A = { t: LABELS + 24, h: 156 };
const B = { t: A.t + A.h + 52, h: 196 };
const H = B.t + B.h + 50;

const bar = (pa: number) => {
  const b = pa / 1e5;
  return b >= 1 ? `${b.toLocaleString("en-US")} bar` : `${Number(b.toPrecision(1))} bar`;
};

function Trajectory(p: Props) {
  const x = linear([p.from, p.to], [M.l, W - M.r]);
  const yT = linear([150, 760], [A.t + A.h, A.t]);
  const yP = log([10, 2e7], [B.t + B.h, B.t]);
  const line = (pts: [number, number][], y: (v: number) => number) =>
    path(pts.filter(([, v]) => v > 0).map(([d, v]) => [x(d), y(v)]));
  const last = <T,>(a: T[]) => a[a.length - 1];
  const endT = last(p.temp);
  const endP = last(p.pressure);
  const endC = last(p.co2);
  const endO = last(p.o2);
  const tempAt = (day: number) => (p.temp.find(([d]) => d >= day) ?? endT)?.[1] ?? 0;
  // Event labels stand in rows above the plots, latest at the top, each tied to its line by a
  // leader that never crosses another label.
  const ordered = [...p.events].sort((a, b) => b.day - a.day);
  const rowOf = (i: number) => 16 + i * 16;
  // The re-warming: a note above the bump in the temperature, tied to its peak by a leader. Its
  // lines are haloed where they cross the event lines.
  const peak = { x: x(p.rewarm.day), y: yT(tempAt(p.rewarm.day)) };
  const noteLines = [
    `The Bricks' heat re-warms the air ${p.rewarm.text};`,
    `the Clear Rain falls for good from ${p.rewarm.rerain}`,
  ];
  const noteY = peak.y - 50 - 14.4;
  const noteBottom = noteY + 14.4 + 4;
  const first = p.temp[0];
  // Boxes a phase label must stay clear of: the starting temperature, the re-warming note and the
  // event lines.
  const taken = [
    ...(first
      ? [
          {
            x0: x(first[0]) + 8,
            x1: x(first[0]) + 8 + textWidth(p.ends.start),
            y0: yT(first[1]) - 9,
            y1: yT(first[1]) + 6,
          },
        ]
      : []),
    {
      x0: peak.x + 2,
      x1: peak.x + 6 + Math.max(...noteLines.map((l) => textWidth(l, 11.5))),
      y0: noteY - 10,
      y1: noteBottom,
    },
    // The leader.
    { x0: peak.x - 1, x1: peak.x + 3, y0: noteBottom, y1: peak.y - 4 },
    // The event lines.
    ...p.events.map((e) => ({ x0: x(e.day) - 1, x1: x(e.day) + 1, y0: A.t, y1: A.t + A.h })),
  ];
  // A phase's label sits as near 410 K as it can without touching the temperature curve or the boxes
  // taken, above the Earth-like line: centred in its phase, or else against its right edge.
  const place = (from: number, to: number, lines: string[]) => {
    const w = Math.max(...lines.map((l) => textWidth(l, 11.5)));
    const h = (lines.length - 1) * 14.4;
    const floor = yT(p.earthLikeTemp.value) - 4;
    const ideal = yT(410);
    const ys: number[] = [];
    for (let y = A.t + 14; y + h + 4 <= floor; y += 2) ys.push(y);
    ys.sort((a, b) => Math.abs(a - ideal) - Math.abs(b - ideal));
    const clear = (x0: number, x1: number, y: number) =>
      p.temp.every(([d, v]) => {
        const px = x(d);
        const py = yT(v);
        return px < x0 - 4 || px > x1 + 4 || py < y - 14 || py > y + h + 6;
      }) && taken.every((t) => t.x1 < x0 - 4 || t.x0 > x1 + 4 || t.y1 < y - 14 || t.y0 > y + h + 6);
    const mid = (x(from) + x(to)) / 2;
    const right = x(to) - 6;
    const options = [
      { at: mid, anchor: "middle" as const, x0: mid - w / 2, x1: mid + w / 2 },
      { at: right, anchor: "end" as const, x0: right - w, x1: right },
    ];
    for (const y of ys)
      for (const o of options) if (clear(o.x0, o.x1, y)) return { at: o.at, anchor: o.anchor, y };
    return { at: mid, anchor: "middle" as const, y: ideal };
  };
  const bottom = B.t + B.h;
  return (
    <Frame
      id="trajectory"
      title="The simulated atmosphere, day by day"
      desc={`Day-by-day simulation. The air cools from ${p.ends.start} to the CO₂ frost point, then warms to ${p.ends.finish}; surface pressure falls to ${p.ends.total}. Earth-like on ${p.earthLike.when}.`}
      height={H}
    >
      {/* Phases, shaded alternately across both panels. */}
      {p.phases.map((ph) =>
        ph.tone ? (
          <g key={ph.id}>
            <rect
              className={`f-${ph.tone}`}
              x={x(ph.from)}
              y={A.t}
              width={x(ph.to) - x(ph.from)}
              height={A.h}
            />
            <rect
              className={`f-${ph.tone}`}
              x={x(ph.from)}
              y={B.t}
              width={x(ph.to) - x(ph.from)}
              height={B.h}
            />
          </g>
        ) : null,
      )}
      {p.phases
        .filter((ph) => ph.label)
        .map((ph) => {
          const { at, y, anchor } = place(ph.from, ph.to, ph.label ?? []);
          return (
            <text key={ph.id} className="f-note" y={y} textAnchor={anchor}>
              {ph.label?.map((line, i) => (
                <tspan key={line} x={at} dy={i ? "1.25em" : 0}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}

      {/* Panel A: temperature. */}
      {[200, 300, 400, 500, 600, 700].map((v) => (
        <g key={v}>
          <line className="f-grid" x1={M.l} x2={W - M.r} y1={yT(v)} y2={yT(v)} />
          <text className="f-tick" x={M.l - 8} y={yT(v)} dy="0.32em" textAnchor="end">
            {`${v} K`}
          </text>
        </g>
      ))}
      <text className="f-note" x={M.l} y={A.t - 8}>
        Mean air temperature
      </text>
      <line
        className="f-cool-line"
        x1={M.l}
        x2={W - M.r}
        y1={yT(p.earthLikeTemp.value)}
        y2={yT(p.earthLikeTemp.value)}
      />
      <Halo className="f-note" x={x(p.from) + 6} y={yT(p.earthLikeTemp.value) + 14}>
        {`Earth-like: ${p.earthLikeTemp.text} or warmer`}
      </Halo>
      <g>
        <title>{`The arriving Bricks' heat re-warms the air by ${p.rewarm.text}, most on ${p.rewarm.when}; the Clear Rain falls for good from ${p.rewarm.rerain}`}</title>
        <line className="f-axis" x1={peak.x + 2} x2={peak.x} y1={noteBottom} y2={peak.y - 4} />
        {noteLines.map((l, i) => (
          <Halo key={l} className="f-note" x={peak.x + 6} y={noteY + i * 14.4}>
            {l}
          </Halo>
        ))}
      </g>

      {/* Panel B: pressure, log scale. */}
      {[10, 100, 1e3, 1e4, 1e5, 1e6, 1e7].map((v) => (
        <g key={v}>
          <line className="f-grid" x1={M.l} x2={W - M.r} y1={yP(v)} y2={yP(v)} />
          <text className="f-tick" x={M.l - 8} y={yP(v)} dy="0.32em" textAnchor="end">
            {bar(v)}
          </text>
        </g>
      ))}
      <text className="f-note" x={M.l} y={B.t - 8}>
        Surface pressure (log scale; each gridline is ten times the last)
      </text>
      <Key x={W - M.r - 196} y={B.t - 12} tone="s1" label="Total" line />
      <Key x={W - M.r - 128} y={B.t - 12} tone="s2" label="CO₂" line />
      <Key x={W - M.r - 64} y={B.t - 12} tone="s3" label="Oxygen" line />
      <line
        className="f-cool-line"
        x1={M.l}
        x2={W - M.r}
        y1={yP(p.co2Limit.value)}
        y2={yP(p.co2Limit.value)}
      />
      {/* Two lines where one would run into the first event's line. */}
      {(textWidth(`Earth-like: CO₂ under ${p.co2Limit.text} of the air`, 11.5) <
      x(Math.min(...p.events.map((e) => e.day))) - x(p.from) - 12
        ? [`Earth-like: CO₂ under ${p.co2Limit.text} of the air`]
        : ["Earth-like: CO₂ under", `${p.co2Limit.text} of the air`]
      ).map((l, i, all) => (
        <Halo
          key={l}
          className="f-note"
          x={x(p.from) + 6}
          y={yP(p.co2Limit.value) - 6 - (all.length - 1 - i) * 14}
        >
          {l}
        </Halo>
      ))}

      {/* Event lines through both panels, then the labels above. */}
      {p.events.map((e) => (
        <g key={e.id}>
          <title>{`${e.label}: ${e.when}`}</title>
          <line className="f-axis" x1={x(e.day)} x2={x(e.day)} y1={A.t} y2={A.t + A.h} />
          <line className="f-axis" x1={x(e.day)} x2={x(e.day)} y1={B.t} y2={bottom} />
        </g>
      ))}
      {ordered.map((e, i) => {
        const y = rowOf(i);
        const accent = e.id === p.earthLike.id;
        // Labels read leftward, ending at their own line: every line to the right belongs to a
        // later event and stops at its own label, higher up, so none runs through this one. Only a
        // label with no room to the left reads rightward.
        const right = x(e.day) - 6 - textWidth(e.label) - textWidth(`  ${e.when}`, 11.5) < 0;
        return (
          <g key={e.id}>
            <line
              className={accent ? "f-accent-line" : "f-axis"}
              x1={x(e.day)}
              x2={x(e.day)}
              y1={y + 4}
              y2={A.t}
            />
            <text
              className={accent ? "f-label" : "f-soft"}
              x={x(e.day) + (right ? 6 : -6)}
              y={y}
              textAnchor={right ? "start" : "end"}
            >
              {e.label}
              <tspan className="f-note f-num">{`  ${e.when}`}</tspan>
            </text>
          </g>
        );
      })}
      {/* One segment per panel, like the other event lines, so it never crosses the key between them. */}
      {[
        [A.t, A.t + A.h],
        [B.t, bottom],
      ].map(([y1, y2]) => (
        <line
          key={y1}
          className="f-accent-line"
          strokeWidth={1.5}
          x1={x(p.earthLike.day)}
          x2={x(p.earthLike.day)}
          y1={y1}
          y2={y2}
        />
      ))}

      <path className="f-s1-line f-mark-line" d={line(p.temp, yT)}>
        <title>{`Mean air temperature: ${p.ends.start} to ${p.ends.finish}`}</title>
      </path>
      <path className="f-s3-line f-mark-line" d={line(p.o2, yP)}>
        <title>{`Oxygen partial pressure, rising to ${p.ends.o2}`}</title>
      </path>
      <path className="f-s2-line f-mark-line" d={line(p.co2, yP)}>
        <title>{`CO₂ partial pressure, falling to ${p.ends.co2} of the air`}</title>
      </path>
      <path className="f-s1-line f-mark-line" d={line(p.pressure, yP)}>
        <title>{`Surface pressure, falling to ${p.ends.total}`}</title>
      </path>

      <circle
        className="f-accent f-ring"
        cx={x(p.earthLike.day)}
        cy={yT(tempAt(p.earthLike.day))}
        r={4.5}
      />
      {endT && (
        <text className="f-num" x={x(endT[0]) + 8} y={yT(endT[1])} dy="0.32em">
          {p.ends.finish}
        </text>
      )}
      {p.temp[0] && (
        <Halo className="f-num" x={x(p.temp[0][0]) + 8} y={yT(p.temp[0][1]) + 2} dy="0.32em">
          {p.ends.start}
        </Halo>
      )}
      {endP && (
        <text className="f-num" x={x(endP[0]) + 8} y={yP(endP[1])} dy="0.32em">
          {p.ends.total}
        </text>
      )}
      {endO && (
        <text className="f-num" x={x(endO[0]) + 8} y={yP(endO[1]) + 4} dy="0.32em">
          {p.ends.o2}
        </text>
      )}
      {endC && (
        <text className="f-num" x={x(endC[0]) + 8} y={yP(endC[1])} dy="0.32em">
          {p.ends.co2}
        </text>
      )}

      <YearAxis x={x} y0={bottom} from={p.from} to={p.to} />
    </Frame>
  );
}

function build(r: Registry): Props {
  const temp = seriesOf(r, "traj-temperature");
  const pressure = seriesOf(r, "traj-pressure");
  const co2 = seriesOf(r, "traj-co2");
  const o2 = seriesOf(r, "traj-o2");
  const ev = (id: string, label: string): Event => ({
    id,
    label,
    day: r.get(id).value,
    when: show(r, id, { date: "day" }),
  });
  const events = [
    ev("traj-clear-rain", "The Clear Rain begins"),
    ev("traj-water-rain", "The new water rains out"),
    ev("traj-water-frozen", "The new water freezes"),
    ev("traj-freeze", "The CO₂ seas start to freeze"),
    ev("traj-frozen", "The seas are frozen through"),
    ev("traj-cold", "All the CO₂ is down"),
    ev("traj-scavenged", "Frost Towers finish"),
    ev("traj-warming", "Caps sealed, the Veil opens"),
    ev("traj-earth-like", "Earth-like"),
    ev("deadline", "Deadline"),
  ];
  const day = (id: string) => r.get(id).value;
  const from = day("cooling-start");
  const to = Math.max(day("deadline"), temp.at(-1)?.[0] ?? 0);
  const earthLike = events.find((e) => e.id === "traj-earth-like") as Event;
  const deadline = events.find((e) => e.id === "deadline") as Event;
  return {
    temp,
    pressure,
    co2,
    o2,
    events,
    phases: [
      { id: "cool", from, to: day("traj-clear-rain"), label: ["The air", "cools"] },
      {
        id: "rain",
        from: day("traj-clear-rain"),
        to: day("traj-freeze"),
        label: ["The CO₂ rains", "out into seas"],
        tone: "muted-wash",
      },
      {
        id: "freeze",
        from: day("traj-freeze"),
        to: day("traj-frozen"),
        label: ["The seas", "freeze"],
      },
      { id: "warm", from: day("traj-warming"), to: day("traj-earth-like"), tone: "muted-wash" },
      { id: "earth-like", from: day("traj-earth-like"), to, tone: "cool-wash" },
    ],
    earthLike,
    deadline,
    from,
    to,
    earthLikeTemp: { value: day("earth-like-temp"), text: show(r, "earth-like-temp") },
    rewarm: {
      day: day("traj-rewarm-peak"),
      text: show(r, "traj-rewarm"),
      when: show(r, "traj-rewarm-peak", { date: "day" }),
      rerain: show(r, "traj-rerain", { date: "day" }),
      rerainDay: day("traj-rerain"),
    },
    co2Limit: {
      value: day("earth-like-co2") * day("final-pressure"),
      text: show(r, "earth-like-co2"),
    },
    ends: {
      start: show(r, "venus-surface-temp"),
      finish: show(r, "earth-surface-temp"),
      total: show(r, "final-pressure"),
      o2: show(r, "o2-target-pressure"),
      co2: show(r, "final-co2-ppm"),
    },
  };
}

export const trajectory: FigureDef<Props> = {
  id: "trajectory",
  title: "The simulated atmosphere",
  file: "figures/src/trajectory.tsx",
  build: ({ r }) => build(r),
  caption: (p) =>
    `The day-by-day simulation cools the air from ${p.ends.start}, rains and freezes the CO₂ out, then warms the air to ${p.ends.finish}. The arriving Bricks' heat warms the air back by ${p.rewarm.text} on the way, and lifts some CO₂ back off the seas, before the Clear Rain falls for good from ${p.rewarm.rerain}. It is Earth-like on ${p.earthLike.when}, ${p.earthLike.day <= p.deadline.day ? "before" : "after"} the deadline of ${p.deadline.when}.`,
  describe: (p) => ({
    summary: `Temperature falls from ${p.ends.start} to the CO₂ frost point and rises to ${p.ends.finish}. On the way the arriving Bricks' heat warms the air back by ${p.rewarm.text}, most on ${p.rewarm.when}, and the CO₂ pressure climbs with it; the Clear Rain falls for good from ${p.rewarm.rerain}. Surface pressure falls to ${p.ends.total}, with ${p.ends.o2} of oxygen and ${p.ends.co2} of CO₂.`,
    head: ["Event", "Date"],
    rows: [
      ...p.events,
      {
        day: p.rewarm.day,
        label: `The Bricks' heat has re-warmed the air most, by ${p.rewarm.text}`,
        when: p.rewarm.when,
      },
      { day: p.rewarm.rerainDay, label: "The Clear Rain falls for good", when: p.rewarm.rerain },
    ]
      .sort((a, b) => a.day - b.day)
      .map((e) => [e.label, e.when]),
  }),
  numbers: (p) => [
    ...p.events.map((e) => e.id),
    "cooling-start",
    "traj-rewarm",
    "traj-rewarm-peak",
    "traj-rerain",
    "earth-like-temp",
    "earth-like-co2",
    "final-pressure",
    "venus-surface-temp",
    "earth-surface-temp",
    "o2-target-pressure",
    "final-co2-ppm",
  ],
  Component: Trajectory,
};
