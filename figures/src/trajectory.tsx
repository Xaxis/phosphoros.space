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
  phases: { from: number; to: number; label?: string[]; tone?: string }[];
  earthLike: Event;
  deadline: Event;
  from: number;
  to: number;
  earthLikeTemp: { value: number; text: string };
  co2Limit: { value: number; text: string };
  ends: { total: string; co2: string; o2: string; start: string; finish: string };
}

const M = { l: 74, r: 112 };
const LABELS = 134;
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
          <g key={ph.from}>
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
          const at = (x(ph.from) + x(ph.to)) / 2;
          return (
            <text key={ph.from} className="f-note" y={yT(410)} textAnchor="middle">
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
      { from, to: day("traj-clear-rain"), label: ["The air cools"] },
      {
        from: day("traj-clear-rain"),
        to: day("traj-freeze"),
        label: ["The CO₂ rains", "out into seas"],
        tone: "muted-wash",
      },
      { from: day("traj-freeze"), to: day("traj-frozen"), label: ["The seas", "freeze"] },
      { from: day("traj-warming"), to: day("traj-earth-like"), tone: "muted-wash" },
      { from: day("traj-earth-like"), to, tone: "cool-wash" },
    ],
    earthLike,
    deadline,
    from,
    to,
    earthLikeTemp: { value: day("earth-like-temp"), text: show(r, "earth-like-temp") },
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
    `The day-by-day simulation cools the air from ${p.ends.start}, rains and freezes the CO₂ out, then warms the air to ${p.ends.finish}. It is Earth-like on ${p.earthLike.when}, ${p.earthLike.day <= p.deadline.day ? "before" : "after"} the deadline of ${p.deadline.when}.`,
  describe: (p) => ({
    summary: `Temperature falls from ${p.ends.start} to the CO₂ frost point and rises to ${p.ends.finish}; surface pressure falls to ${p.ends.total}, with ${p.ends.o2} of oxygen and ${p.ends.co2} of CO₂.`,
    head: ["Event", "Date"],
    rows: p.events.map((e) => [e.label, e.when]),
  }),
  numbers: (p) => [
    ...p.events.map((e) => e.id),
    "cooling-start",
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
