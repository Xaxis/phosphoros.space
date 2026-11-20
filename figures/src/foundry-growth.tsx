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
        // to the right, below the plateau, each tied to its dot by a leader line.
        const builds = rest.slice(0, -1);
        const full = rest.at(-1);
        const col = Math.max(...builds.map((m) => x(m.day))) + 64;
        const top = y(full?.mass ?? 1e14) + 44;
        return (
          <>
            {builds
              .slice()
              .reverse()
              .map((m, i) => {
                const cx = x(m.day);
                const cy = y(m.mass);
                const ly = top + i * 42;
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
    const at = (day: number) => {
      const p = s.points.find((q) => q.x >= day) ?? s.points.at(-1);
      return p?.y ?? 0;
    };
    return {
      points: s.points.map((p) => [p.x, p.y] as [number, number]),
      from: dayOf("2028-07-01"),
      to: r.get("deadline").value,
      doubling: show(r, "foundry-doubling-days"),
      marks: [
        mark("foundry-landing", "Seed lands on Mercury", "foundry-seed-mass", "foundry-seed-mass"),
        {
          ...mark("veil-affordable", "Can build the Veil", 0, "veil-mass"),
          mass: at(r.get("veil-affordable").value),
        },
        {
          ...mark("ring-affordable", "Can build the Ring", 0, "ring-mass"),
          mass: at(r.get("ring-affordable").value),
        },
        {
          ...mark("helios-affordable", "Can build the Lattice", 0, "helios-mass"),
          mass: at(r.get("helios-affordable").value),
        },
        mark("foundry-full-scale", "Full scale", "foundry-final-mass", "foundry-final-mass"),
      ],
    };
  },
  caption: (p) =>
    `The seed doubles every ${p.doubling}. Each of the big builds becomes affordable, within one doubling, on the date marked; growth stops at full scale.`,
  describe: (p) => ({
    summary: `The Foundry's machinery mass grows from the seed by doubling every ${p.doubling}, a straight line on this log scale, then levels off at full scale.`,
    head: ["Milestone", "Date", "Mass"],
    rows: p.marks.map((m) => [m.label, m.when, m.size ?? ""]),
  }),
  numbers: () => [
    "foundry-landing",
    "foundry-seed-mass",
    "foundry-doubling-days",
    "veil-affordable",
    "veil-mass",
    "ring-affordable",
    "ring-mass",
    "helios-affordable",
    "helios-mass",
    "foundry-full-scale",
    "foundry-final-mass",
  ],
  Component: FoundryGrowth,
};
