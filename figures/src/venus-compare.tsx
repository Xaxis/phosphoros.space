/** Venus today, Venus at the 2036 finish line, and Earth: one row per property, each on its own scale. */
import { toDisplay } from "@phosphoros/calc/format";
import type { Registry } from "@phosphoros/calc/registry";
import { fill } from "@phosphoros/calc/template";
import { Frame, linear, log, type Scale, show, W } from "./kit.tsx";
import type { FigureDef } from "./types.ts";

interface Value {
  /** Position on the row's scale, in the row's display unit; absent for a value with no number. */
  at?: number;
  text: string;
}

interface Row {
  key: string;
  label: string;
  unit: string;
  scale?: {
    kind: "linear" | "log";
    domain: [number, number];
    ticks: { at: number; text: string }[];
  };
  today: Value;
  finish: Value;
  earth: Value;
}

interface Props {
  rows: Row[];
  reached: string;
  ids: string[];
}

const ROW = 52;
const TOP = 70;
const P0 = 186;
const P1 = 408;
const COLS = [436, 540, 650];
const DOT = 5;
const EARTH = 7.5;

function scaleOf(row: Row): Scale | undefined {
  if (!row.scale) return undefined;
  const make = row.scale.kind === "log" ? log : linear;
  return make(row.scale.domain, [P0, P1]);
}

function Track({ row, c }: { row: Row; c: number }) {
  const x = scaleOf(row);
  if (!x || !row.scale) return null;
  const { today, finish, earth } = row;
  const tx = today.at !== undefined ? x(today.at) : undefined;
  const fx = finish.at !== undefined ? x(finish.at) : undefined;
  const ex = earth.at !== undefined ? x(earth.at) : undefined;
  const gap = tx !== undefined && fx !== undefined ? Math.abs(fx - tx) : 0;
  const dir = tx !== undefined && fx !== undefined && fx < tx ? -1 : 1;
  return (
    <g>
      <line className="f-axis" x1={P0} x2={P1} y1={c} y2={c} />
      {row.scale.ticks.map((t) => (
        <g key={t.at}>
          <line className="f-axis" x1={x(t.at)} x2={x(t.at)} y1={c} y2={c + 4} />
          <text className="f-tick" x={x(t.at)} y={c + 17} textAnchor="middle">
            {t.text}
          </text>
        </g>
      ))}
      {tx !== undefined && fx !== undefined && gap > 22 && (
        <g>
          <line
            className="f-muted-line"
            strokeWidth={2}
            x1={tx + dir * (DOT + 3)}
            x2={fx - dir * (DOT + 9)}
            y1={c}
            y2={c}
          />
          <path className="f-muted" d={`M${fx - dir * (DOT + 3)},${c}l${-dir * 7},-4.5v9Z`} />
        </g>
      )}
      {tx !== undefined && (
        <circle className="f-hot f-ring" cx={tx} cy={c} r={DOT}>
          <title>{`${row.label}, Venus today: ${today.text}`}</title>
        </circle>
      )}
      {fx !== undefined && (
        <circle className="f-cool f-ring" cx={fx} cy={c} r={DOT}>
          <title>{`${row.label}, Venus in 2036: ${finish.text}`}</title>
        </circle>
      )}
      {ex !== undefined && (
        <circle className="f-ink-line" strokeWidth={1.5} cx={ex} cy={c} r={EARTH}>
          <title>{`${row.label}, Earth: ${earth.text}`}</title>
        </circle>
      )}
    </g>
  );
}

function VenusCompare({ rows, reached }: Props) {
  const H = TOP + rows.length * ROW + 34;
  const heads = [
    { tone: "hot", text: "Today" },
    { tone: "cool", text: "In 2036" },
    { tone: "earth", text: "Earth" },
  ];
  const head = TOP - 16;
  return (
    <Frame
      id="venus-compare"
      title="Venus today, Venus in 2036, and Earth"
      desc={`Each row has its own scale. Venus in 2036 is the finish line the simulation reaches on ${reached}.`}
      height={H}
    >
      <text className="f-note" x={COLS[0]} y={head - 26}>
        Venus
      </text>
      <line
        className="f-axis"
        x1={COLS[0]}
        x2={(COLS[2] ?? 0) - 22}
        y1={head - 18}
        y2={head - 18}
      />
      {heads.map((h, i) => {
        const x = COLS[i] ?? 0;
        return (
          <g key={h.text}>
            {h.tone === "earth" ? (
              <circle
                className="f-ink-line"
                strokeWidth={1.5}
                cx={x + 6}
                cy={head}
                r={EARTH - 1.5}
              />
            ) : (
              <circle className={`f-${h.tone} f-ring`} cx={x + 6} cy={head} r={DOT} />
            )}
            <text className="f-title" x={x + 18} y={head} dy="0.32em">
              {h.text}
            </text>
          </g>
        );
      })}
      <text className="f-note" x={P0} y={head} dy="0.32em">
        Each row has its own scale
      </text>
      {rows.map((row, i) => {
        const y = TOP + i * ROW;
        const c = y + ROW / 2 - 4;
        return (
          <g key={row.key}>
            <line className="f-grid" x1={24} x2={W - 24} y1={y} y2={y} />
            <text className="f-label" x={24} y={c - 6} dy="0.32em">
              {row.label}
            </text>
            <text className="f-note" x={24} y={c + 11} dy="0.32em">
              {row.unit}
            </text>
            <Track row={row} c={c} />
            {[row.today, row.finish, row.earth].map((v, j) => (
              <text key={j} className="f-num" x={COLS[j]} y={c} dy="0.32em">
                {v.text}
              </text>
            ))}
          </g>
        );
      })}
      <line
        className="f-grid"
        x1={24}
        x2={W - 24}
        y1={TOP + rows.length * ROW}
        y2={TOP + rows.length * ROW}
      />
      <text className="f-note" x={24} y={TOP + rows.length * ROW + 22}>
        {`Venus in 2036 is the plan's finish line; the day-by-day simulation reaches it on ${reached}.`}
      </text>
    </Frame>
  );
}

/** Ticks for a log row: every power of ten in the domain. */
function decadeTicks(domain: [number, number], text: (v: number) => string) {
  const out: { at: number; text: string }[] = [];
  for (let e = Math.ceil(Math.log10(domain[0])); 10 ** e <= domain[1]; e++)
    out.push({ at: 10 ** e, text: text(10 ** e) });
  return out;
}

function build(
  r: Registry,
  finish: { measure: string; today: string; target: string }[],
  cloudsEarth: string,
): Props {
  const ids: string[] = [];
  const val = (id: string, unit: string, opts: Parameters<typeof show>[2] = {}): Value => {
    ids.push(id);
    const q = r.get(id);
    return { at: toDisplay(q.value, q.unit, unit), text: show(r, id, opts) };
  };
  const words = (measure: string, which: "today" | "target"): string => {
    const row = finish.find((f) => f.measure === measure);
    if (!row) throw new Error(`venus-compare: no finish row "${measure}"`);
    return fill(row[which], (id) => r.get(id));
  };
  const grouped = (v: number) => v.toLocaleString("en-US");
  const rows: Row[] = [
    {
      key: "temp",
      label: "Surface temperature",
      unit: "kelvin",
      scale: {
        kind: "linear",
        domain: [150, 800],
        ticks: [200, 400, 600, 800].map((v) => ({ at: v, text: grouped(v) })),
      },
      today: val("venus-surface-temp", "K"),
      finish: val("earth-surface-temp", "K"),
      earth: val("earth-surface-temp", "K"),
    },
    {
      key: "pressure",
      label: "Surface pressure",
      unit: "bar, log scale",
      scale: { kind: "log", domain: [0.4, 250], ticks: decadeTicks([0.4, 250], grouped) },
      today: val("venus-surface-pressure", "bar"),
      finish: val("final-pressure", "bar"),
      earth: val("earth-sea-level-pressure", "bar"),
    },
    {
      key: "co2",
      label: "Carbon dioxide",
      unit: "share of the air, log scale",
      scale: {
        kind: "log",
        domain: [6e-5, 1.6],
        ticks: decadeTicks([6e-5, 1.6], (v) =>
          v < 1e-3 ? `${Math.round(v * 1e6)} ppm` : `${grouped(v * 100)}%`,
        ),
      },
      today: val("venus-co2-fraction", "1"),
      finish: val("final-co2-ppm", "1"),
      earth: val("earth-co2-fraction", "1"),
    },
    {
      key: "o2",
      label: "Oxygen",
      unit: "partial pressure, bar",
      scale: {
        kind: "linear",
        domain: [0, 0.3],
        ticks: [0, 0.1, 0.2, 0.3].map((v) => ({ at: v, text: String(v) })),
      },
      today: { at: 0, text: words("Oxygen", "today") },
      finish: val("o2-target-pressure", "bar"),
      earth: val("earth-o2-pressure", "bar"),
    },
    {
      key: "water",
      label: "Water",
      unit: "10²¹ kilograms",
      scale: {
        kind: "linear",
        domain: [0, 1.5],
        ticks: [0, 0.5, 1, 1.5].map((v) => ({ at: v, text: String(v) })),
      },
      today: { at: 0, text: words("Water", "today") },
      finish: { ...val("ice-mass", "kg"), at: r.get("ice-mass").value / 1e21 },
      earth: { ...val("earth-water-mass", "kg"), at: r.get("earth-water-mass").value / 1e21 },
    },
    {
      key: "day",
      label: "Length of the day",
      unit: "hours, log scale",
      scale: { kind: "log", domain: [8, 6000], ticks: decadeTicks([8, 6000], grouped) },
      today: val("venus-solar-day", "h", { show: "d", sig: 3 }),
      finish: val("day-length", "h"),
      earth: val("earth-solar-day", "h"),
    },
    {
      key: "clouds",
      label: "Clouds",
      unit: "what they are made of",
      today: { text: words("Clouds", "today") },
      finish: { text: words("Clouds", "target") },
      earth: { text: cloudsEarth },
    },
  ];
  ids.push("traj-earth-like");
  return { rows, reached: show(r, "traj-earth-like", { date: "day" }), ids: [...new Set(ids)] };
}

export const venusCompare: FigureDef<Props> = {
  id: "venus-compare",
  title: "Venus today and in 2036",
  file: "figures/src/venus-compare.tsx",
  build: ({ r, content }) => {
    const clouds = content.venus.baseline.find((b) => b.property === "Clouds");
    if (!clouds) throw new Error("venus-compare: no Clouds row in the baseline");
    return build(
      r,
      content.venus.finish,
      fill(clouds.earth, (id) => r.get(id)),
    );
  },
  caption: (p) =>
    `Venus today against the plan's finish line and Earth, one property per row, each on its own scale. The simulation reaches the finish line on ${p.reached}.`,
  describe: (p) => ({
    summary: `Seven properties of Venus today, Venus in 2036 and Earth. The simulation reaches the 2036 values on ${p.reached}.`,
    head: ["Property", "Venus today", "Venus in 2036", "Earth"],
    rows: p.rows.map((row) => [row.label, row.today.text, row.finish.text, row.earth.text]),
  }),
  numbers: (p) => p.ids,
  Component: VenusCompare,
};
