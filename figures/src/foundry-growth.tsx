/** Ouroboros Foundry growth: machinery mass on Mercury against time, on a log scale. */
import { dayOf } from "@phosphoros/calc/time";
import {
  decades,
  Frame,
  linear,
  log,
  Milestone,
  path,
  pow10,
  show,
  W,
  YAxis,
  YearAxis,
} from "./kit.tsx";
import type { FigureDef } from "./types.ts";

interface Mark {
  id: string;
  label: string;
  day: number;
  /** A build that takes visible time on the chart is drawn as a span to this day. */
  end?: number;
  mass: number;
  when: string;
  size?: string;
}

interface Props {
  points: [number, number][];
  marks: Mark[];
  from: number;
  to: number;
  doubling: string;
  hold: string;
}

const H = 400;
const M = { l: 70, r: 28, t: 40, b: 44 };

function FoundryGrowth({ points, marks, from, to, doubling }: Props) {
  const x = linear([from, to], [M.l, W - M.r]);
  const y = log([1e5, 1e15], [H - M.b, M.t]);
  const curve = path(points.map(([d, m]) => [x(d), y(m)]));
  const [landing, ...rest] = marks;
  return (
    <Frame
      id="foundry-growth"
      title="Ouroboros Foundry machinery mass, 2028 to 2036"
      desc={`Log scale. The seed lands on Mercury and doubles every ${doubling} until it reaches full scale.`}
      height={H}
    >
      <YAxis
        y={y}
        values={decades(1e5, 1e15, 6)}
        x0={M.l}
        x1={W - M.r}
        format={(v) => `${pow10(v)} kg`}
      />
      <YearAxis x={x} y0={H - M.b} from={from} to={to} />
      <path
        d={`${curve}L${x(points.at(-1)?.[0] ?? to)},${H - M.b}L${x(points[0]?.[0] ?? from)},${H - M.b}Z`}
        className="f-accent-wash"
      />
      <path d={curve} className="f-accent-line f-mark-line" />
      {landing && (
        <Milestone
          x={x(landing.day)}
          y={y(landing.mass)}
          top={y(landing.mass) - 46}
          label={landing.label}
          sub={`${landing.when}, ${landing.size}`}
        />
      )}
      {(() => {
        // The builds bunch together near the top of the curve, so their labels stand in a column
        // to the right, below the plateau, each tied to its dot or span by a leader line.
        const builds = rest.slice(0, -1);
        const full = rest.at(-1);
        const col = Math.max(...builds.map((m) => x(m.end ?? m.day))) + 64;
        const top = y(full?.mass ?? 1e14) + 44;
        return (
          <>
            {builds
              .slice()
              .reverse()
              .map((m, i) => {
                const ly = top + i * 42;
                if (m.end !== undefined) {
                  // Built at full scale: a bar under the plateau, as long as the build takes.
                  const x0 = x(m.day);
                  const x1 = Math.max(x(m.end), x0 + 3);
                  const by = y(m.mass) + 7 + i * 7;
                  return (
                    <g key={m.id}>
                      <path
                        className="f-axis"
                        d={`M${(x0 + x1) / 2},${by + 4}L${col - 8},${ly - 4}`}
                      />
                      <rect className="f-ink" x={x0} y={by} width={x1 - x0} height={4} rx={2} />
                      <text className="f-label" x={col} y={ly}>
                        {m.label}
                      </text>
                      <text className="f-note f-num" x={col} y={ly + 15}>
                        {m.when}, {m.size}
                      </text>
                    </g>
                  );
                }
                const cx = x(m.day);
                const cy = y(m.mass);
                return (
                  <g key={m.id}>
                    <path className="f-axis" d={`M${cx + 5},${cy + 3}L${col - 8},${ly - 4}`} />
                    <circle className="f-ink f-ring" cx={cx} cy={cy} r={4.5} />
                    <text className="f-label" x={col} y={ly}>
                      {m.label}
                    </text>
                    <text className="f-note f-num" x={col} y={ly + 15}>
                      {m.when}, {m.size}
                    </text>
                  </g>
                );
              })}
            {full && (
              <g>
                <circle className="f-accent f-ring" cx={x(full.day)} cy={y(full.mass)} r={4.5} />
                <text className="f-label" x={x(full.day) + 8} y={y(full.mass) - 22}>
                  {full.label}
                </text>
                <text className="f-note f-num" x={x(full.day) + 8} y={y(full.mass) - 8}>
                  {full.when}, {full.size}
                </text>
              </g>
            )}
          </>
        );
      })()}
      <text className="f-note" x={M.l} y={M.t - 18}>
        Machinery mass on Mercury (log scale; each gridline is ten times the last)
      </text>
    </Frame>
  );
}

export const foundryGrowth: FigureDef<Props> = {
  id: "foundry-growth",
  title: "The Foundry's growth",
  file: "figures/src/foundry-growth.tsx",
  build: ({ r }) => {
    const s = r.series.get("foundry-growth");
    if (!s) throw new Error("figures: no foundry-growth series");
    const mark = (id: string, label: string, massOf: string | number, sizeId?: string): Mark => ({
      id,
      label,
      day: r.get(id).value,
      mass: typeof massOf === "number" ? massOf : r.get(massOf).value,
      when: show(r, id, { date: "month" }),
      size: sizeId ? show(r, sizeId) : undefined,
    });
    // "May 2033" and "July 2033" read as "May to July 2033".
    const span = (a: string, b: string) => {
      const [am, ay] = a.split(/\s+/);
      return ay !== undefined && ay === b.split(/\s+/)[1] ? `${am} to ${b}` : `${a} to ${b}`;
    };
    const at = (day: number) => {
      const p = s.points.find((q) => q.x >= day) ?? s.points.at(-1);
      return p?.y ?? 0;
    };
    return {
      points: s.points.map((p) => [p.x, p.y] as [number, number]),
      from: dayOf("2028-07-01"),
      to: r.get("deadline").value,
      doubling: show(r, "foundry-doubling-days"),
      hold: show(r, "veil-diversion-days"),
      marks: [
        mark("foundry-landing", "Seed lands on Mercury", "foundry-seed-mass", "foundry-seed-mass"),
        {
          ...mark(
            "veil-build-begin",
            `Pauses ${show(r, "veil-diversion-days")} to build the Veil`,
            0,
          ),
          mass: at(r.get("veil-build-begin").value),
          size: show(r, "veil-mass"),
        },
        {
          ...mark(
            "foundry-full-scale",
            `Builds the Lattice in ${show(r, "lattice-build-days")}`,
            "foundry-final-mass",
            "helios-mass",
          ),
          end: r.get("helios-full-power").value,
          when: span(
            show(r, "foundry-full-scale", { date: "month" }),
            show(r, "helios-full-power", { date: "month" }),
          ),
        },
        {
          ...mark(
            "ring-build-begin",
            `Then the Ring, in ${show(r, "ring-build-days")}`,
            "foundry-final-mass",
            "ring-mass",
          ),
          end: r.get("ring-build-begin").value + r.get("ring-build-days").value,
        },
        mark("foundry-full-scale", "Full scale", "foundry-final-mass", "foundry-final-mass"),
      ],
    };
  },
  caption: (p) =>
    `The seed doubles every ${p.doubling}. It pauses once, for ${p.hold}, to build the Veil, then grows to full scale and builds the Lattice and the Ring. Every kilogram it builds early is growth it gives up, so the big builds wait until it is large.`,
  describe: (p) => ({
    summary: `The Foundry's machinery mass grows from the seed by doubling every ${p.doubling}, a straight line on this log scale, then levels off at full scale.`,
    head: ["Milestone", "Date", "Mass"],
    rows: p.marks.map((m) => [m.label, m.when, m.size ?? ""]),
  }),
  numbers: () => [
    "foundry-landing",
    "foundry-seed-mass",
    "foundry-doubling-days",
    "veil-build-begin",
    "veil-diversion-days",
    "veil-mass",
    "helios-full-power",
    "lattice-build-days",
    "helios-mass",
    "ring-build-begin",
    "ring-build-days",
    "ring-mass",
    "foundry-full-scale",
    "foundry-final-mass",
  ],
  Component: FoundryGrowth,
};
