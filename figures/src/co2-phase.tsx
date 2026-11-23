/**
 * CO₂ phase diagram with the cooling path the simulation follows: log pressure against temperature,
 * the sublimation, vapour and melting curves from the model's physics, and the air's CO₂ partial
 * pressure from the simulation drawn over them.
 */
import {
  co2LiquidPressure,
  co2MeltingPressure,
  co2SublimationPressure,
} from "@phosphoros/calc/physics";
import type { Registry } from "@phosphoros/calc/registry";
import { Frame, Key, log, path, pow10, show, showValue, W } from "./kit.tsx";
import { AxisBreak, Dot, Lines, Region } from "./space-kit.tsx";
import type { FigureDef } from "./types.ts";

type Pt = [number, number];

/** Every number the figure writes, as the site writes it. */
function texts(r: Registry, first: Pt, last: Pt) {
  const day = { date: "day" as const };
  return {
    start: `${show(r, "venus-surface-temp")}, ${showValue(r.get("venus-surface-pressure"), first[1], { sig: 2 })} of CO₂`,
    critical: `${show(r, "co2-critical-temp", { sig: 3 })}, ${show(r, "co2-critical-pressure")}`,
    triple: `${show(r, "co2-triple-temp")}, ${show(r, "co2-triple-pressure")}`,
    clearRain: show(r, "traj-clear-rain", day),
    rerain: show(r, "traj-rerain", day),
    rewarm: show(r, "traj-rewarm"),
    freeze: show(r, "traj-freeze", day),
    frozen: show(r, "traj-frozen", day),
    coldDate: show(r, "traj-cold", day),
    cold: `${show(r, "freeze-target-temp", { sig: 3 })}, ${show(r, "co2-pressure-at-freeze")}`,
    scavenged: show(r, "traj-scavenged", day),
    sealed: show(r, "sealing-end", day),
    sealing:
      r.get("traj-scavenged").value <= r.get("sealing-end").value
        ? `caps sealed by ${show(r, "sealing-end", day)}`
        : `caps were due ${show(r, "sealing-end", day)}`,
    frostT: show(r, "frost-tower-temp"),
    frostP: show(r, "frost-co2-pressure"),
    earthLike: show(r, "traj-earth-like", day),
    end: `${showValue(r.get("earth-surface-temp"), last[0])}, ${showValue(r.get("frost-co2-pressure"), last[1])} of CO₂`,
    iceT: show(r, "cryo-ice-temp"),
    iceThick: show(r, "cryo-thickness"),
    iceTop: show(r, "final-pressure", { sig: 2 }),
    iceBase: show(r, "cryo-base-pressure"),
    iceMelt: show(r, "cryo-base-melt-temp", { sig: 3 }),
  };
}

interface Props {
  path: Pt[];
  sublimation: Pt[];
  vapour: Pt[];
  melting: Pt[];
  critical: Pt;
  triple: Pt;
  cold: Pt;
  scavenged: Pt;
  frost: Pt;
  start: Pt;
  end: Pt;
  ice: { T: number; top: number; base: number; melt: number };
  text: ReturnType<typeof texts>;
}

const H = 520;
const M = { l: 72, r: 24, t: 52, b: 50 };
// A broken temperature axis: the phase diagram itself, then a short stretch around Venus today.
// Both pieces share one scale, so a kelvin is the same width on either side of the break.
const MAIN: [number, number] = [120, 360];
const HOT: [number, number] = [700, 760];
const GAP = 18;
const SCALE = (W - M.l - M.r - GAP) / (MAIN[1] - MAIN[0] + HOT[1] - HOT[0]);
const MAIN_END = M.l + (MAIN[1] - MAIN[0]) * SCALE;
const HOT_START = MAIN_END + GAP;
const P_MIN = 10;
const P_MAX = 1e8;

function tx(T: number): number {
  if (T <= MAIN[1]) return M.l + (T - MAIN[0]) * SCALE;
  if (T >= HOT[0]) return HOT_START + (T - HOT[0]) * SCALE;
  return MAIN_END + ((T - MAIN[1]) / (HOT[0] - MAIN[1])) * GAP;
}
const py = log([P_MIN, P_MAX], [H - M.b, M.t]);
const xy = ([T, P]: Pt): Pt => [tx(T), py(P)];
const inside = ([, P]: Pt) => P >= P_MIN && P <= P_MAX;

function Co2Phase(p: Props) {
  const t = p.text;
  const [cx, cy] = xy(p.critical);
  const [tpx, tpy] = xy(p.triple);
  const [kx, ky] = xy(p.cold);
  const [sx, sy] = xy(p.scavenged);
  const [fx, fy] = xy(p.frost);
  const [vx, vy] = xy(p.start);
  const [ex, ey] = xy(p.end);
  const iceX = tx(p.ice.T);
  const iceTop = py(p.ice.top);
  const iceBase = py(p.ice.base);
  const meltX = tx(p.ice.melt);
  const bottom = H - M.b;
  const right = W - M.r;
  const curve = (pts: Pt[]) => path(pts.filter(inside).map(xy));
  const grid = [1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8];
  const ticks: number[] = [150, 200, 250, 300, 350, 700, 750];
  return (
    <Frame
      id="co2-phase"
      title="CO₂ phase diagram with Venus's simulated cooling path"
      desc={`Pressure on a log scale against temperature. The path starts at Venus today, ${t.start}, crosses the critical point, follows the vapour curve to the triple point and the frost curve to ${t.cold}, then drops to ${t.frostP} as Frost Towers cold-trap the rest.`}
      height={H}
    >
      {/* The supercritical region, where Venus's air is today: above both critical values. */}
      <rect className="f-hot-wash" x={cx} y={M.t} width={MAIN_END - cx} height={cy - M.t} />
      <rect
        className="f-hot-wash"
        x={HOT_START}
        y={M.t}
        width={right - HOT_START}
        height={cy - M.t}
      />

      {grid.map((v) => (
        <g key={v}>
          <line className="f-grid" x1={M.l} x2={MAIN_END} y1={py(v)} y2={py(v)} />
          <line className="f-grid" x1={HOT_START} x2={right} y1={py(v)} y2={py(v)} />
          <text className="f-tick" x={M.l - 8} y={py(v)} dy="0.32em" textAnchor="end">
            {pow10(v)} Pa
          </text>
        </g>
      ))}
      <line className="f-axis" x1={M.l} x2={MAIN_END} y1={bottom} y2={bottom} />
      <line className="f-axis" x1={HOT_START} x2={right} y1={bottom} y2={bottom} />
      <AxisBreak x={MAIN_END + GAP / 2} y={bottom} />
      {ticks.map((T) => (
        <g key={T}>
          <line className="f-axis" x1={tx(T)} x2={tx(T)} y1={bottom} y2={bottom + 4} />
          <text className="f-tick" x={tx(T)} y={bottom + 18} textAnchor="middle">
            {T} K
          </text>
        </g>
      ))}
      <text className="f-note" x={right} y={bottom + 38} textAnchor="end">
        Temperature (the axis is broken between {MAIN[1]} K and {HOT[0]} K)
      </text>
      <text className="f-note" x={M.l} y={M.t - 20}>
        CO₂ pressure (log scale; each gridline is ten times the last)
      </text>

      {/* The supercritical boundaries are not phase changes, so they are dashed. */}
      <line className="f-muted-line" x1={cx} x2={cx} y1={M.t} y2={cy} strokeDasharray="3 3" />
      <line className="f-muted-line" x1={cx} x2={MAIN_END} y1={cy} y2={cy} strokeDasharray="3 3" />
      <line
        className="f-muted-line"
        x1={HOT_START}
        x2={right}
        y1={cy}
        y2={cy}
        strokeDasharray="3 3"
      />

      {/* Phase boundaries. */}
      <g className="f-ink-line" strokeWidth={1.5} fill="none">
        <path d={curve(p.sublimation)}>
          <title>Sublimation curve: solid CO₂ in equilibrium with its vapour</title>
        </path>
        <path d={curve(p.vapour)}>
          <title>Vapour curve: liquid CO₂ in equilibrium with its vapour</title>
        </path>
        <path d={curve(p.melting)}>
          <title>Melting curve: solid and liquid CO₂ in equilibrium</title>
        </path>
      </g>

      <Region x={138} y={py(1.5e4)}>
        SOLID
      </Region>
      <Region x={tx(268)} y={py(3e7)}>
        LIQUID
      </Region>
      <Region x={tx(305)} y={py(3e3)}>
        GAS
      </Region>
      <Region x={(cx + MAIN_END) / 2} y={py(4e7)}>
        SUPERCRITICAL
      </Region>

      {/* The sealed dry ice: 180 K, from the air pressure at its top to its weight at the base. */}
      <line
        className="f-axis"
        x1={iceX}
        x2={meltX}
        y1={iceBase}
        y2={iceBase}
        strokeDasharray="2 3"
      />
      <rect className="f-cool" x={iceX - 4} y={iceBase} width={8} height={iceTop - iceBase} rx={4}>
        <title>{`Sealed dry ice at ${t.iceT}: ${t.iceTop} of air on top, ${t.iceBase} at the base of ${t.iceThick}`}</title>
      </rect>
      <Dot x={meltX} y={iceBase} tone="ink" r={4} title={`The base would melt at ${t.iceMelt}`} />
      <text className="f-note f-num" x={(iceX + meltX) / 2} y={iceBase - 8} textAnchor="middle">
        melts at {t.iceMelt}
      </text>
      <Lines
        x={iceX - 12}
        y={py(2e6)}
        anchor="end"
        lines={["Sealed dry ice", `${t.iceT}, ${t.iceThick} thick`, `${t.iceBase} at the base`]}
      />

      {/* The Frost Towers trap CO₂ at the pressure the air is left with. */}
      <line className="f-axis" x1={fx + 6} x2={sx - 6} y1={fy} y2={sy} strokeDasharray="2 3" />

      {/* The simulated path. */}
      <path className="f-accent-line f-mark-line" d={path(p.path.filter(inside).map(xy))}>
        <title>The air's CO₂ partial pressure against its temperature, week by week</title>
      </path>

      <Dot x={vx} y={vy} tone="hot" title={`Venus today: ${t.start}`} />
      <Lines
        x={(HOT_START + right) / 2}
        y={vy - 30}
        anchor="middle"
        lines={["Venus today", t.start]}
      />

      <Dot x={cx} y={cy} tone="ink" title={`Critical point, ${t.critical}`} />
      <Lines
        x={cx + 9}
        y={cy + 22}
        lines={[
          "Clear Rain begins",
          `${t.clearRain}; for good from`,
          `${t.rerain}, after the Bricks' heat`,
          `at the critical point, ${t.critical}`,
        ]}
      />

      <Dot x={tpx} y={tpy} tone="ink" title={`Triple point, ${t.triple}`} />
      <Lines
        x={tpx + 12}
        y={tpy + 18}
        lines={[`Seas freeze, ${t.freeze} to ${t.frozen}`, `at the triple point, ${t.triple}`]}
      />

      <Dot x={kx} y={ky} title={`All the CO₂ is down: ${t.cold}`} />
      <Lines x={kx + 10} y={ky + 20} lines={[`All the CO₂ is down, ${t.coldDate}`, t.cold]} />

      <Dot x={sx} y={sy} title={`Frost Towers finish: ${t.frostP}`} />
      <Lines x={sx + 10} y={sy - 26} lines={[`Frost Towers finish, ${t.scavenged}`, t.sealing]} />

      <Dot x={fx} y={fy} title={`Frost Tower cold trap: ${t.frostT}, ${t.frostP}`} />
      <Lines
        x={fx}
        y={fy + 22}
        lines={[
          { text: `Frost Towers trap CO₂ at ${t.frostT}`, kind: "label" },
          {
            text: `the frost pressure there, ${t.frostP}, is all the CO₂ the air keeps`,
            kind: "note",
          },
        ]}
      />

      <Dot x={ex} y={ey} tone="cool" title={`Earth-like, ${t.earthLike}: ${t.end}`} />
      <Lines x={ex + 10} y={ey - 4} lines={[`Earth-like, ${t.earthLike}`, t.end]} />

      <Key x={W - 300} y={M.t - 24} tone="accent" label="Simulated path" line />
      <Key x={W - 172} y={M.t - 24} tone="ink" label="Phase boundaries" line />
    </Frame>
  );
}

export const co2Phase: FigureDef<Props> = {
  id: "co2-phase",
  title: "CO₂'s phases and the cooling path",
  file: "figures/src/co2-phase.tsx",
  build: ({ r }) => {
    const v = (id: string) => r.get(id).value;
    const temps = r.series.get("traj-temperature");
    const co2 = r.series.get("traj-co2");
    if (!temps || !co2) throw new Error("figures: no traj-temperature or traj-co2 series");
    const pathPts: Pt[] = temps.points.map((q, i) => [q.y, co2.points[i]?.y ?? 0]);
    const triple = { T: v("co2-triple-temp"), P: v("co2-triple-pressure") };
    const critical = { T: v("co2-critical-temp"), P: v("co2-critical-pressure") };
    const a: [number, number, number] = [
      v("co2-sublimation-a1"),
      v("co2-sublimation-a2"),
      v("co2-sublimation-a3"),
    ];
    const step = (a: number, b: number, n: number) =>
      Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
    const sublimation = step(MAIN[0], triple.T, 200).map(
      (T): Pt => [T, co2SublimationPressure(T, triple, a)],
    );
    const vapour = step(triple.T, critical.T, 200).map(
      (T): Pt => [T, co2LiquidPressure(T, triple, critical)],
    );
    const melting = step(triple.T, MAIN[1], 400).map(
      (T): Pt => [T, co2MeltingPressure(T, triple, v("co2-melting-a1"), v("co2-melting-a2"))],
    );
    const first = pathPts[0] ?? [v("venus-surface-temp"), critical.P];
    const last = pathPts.at(-1) ?? [v("earth-surface-temp"), v("frost-co2-pressure")];
    return {
      path: pathPts,
      sublimation,
      vapour,
      melting,
      critical: [critical.T, critical.P],
      triple: [triple.T, triple.P],
      cold: [v("freeze-target-temp"), v("co2-pressure-at-freeze")],
      scavenged: [v("freeze-target-temp"), v("frost-co2-pressure")],
      frost: [v("frost-tower-temp"), v("frost-co2-pressure")],
      start: first,
      end: last,
      ice: {
        T: v("cryo-ice-temp"),
        top: v("final-pressure"),
        base: v("cryo-base-pressure"),
        melt: v("cryo-base-melt-temp"),
      },
      text: texts(r, first, last),
    };
  },
  caption: (p) =>
    `Venus's CO₂ is supercritical today. Cooled past the critical point it rains out; the arriving Bricks' heat warms the air back by ${p.text.rewarm} for a while, and it rains for good from ${p.text.rerain}. It follows the vapour curve to the triple point and freezes; Frost Towers at ${p.text.frostT} leave ${p.text.frostP} in the air, and the sealed dry ice stays solid at ${p.text.iceT}.`,
  describe: (p) => ({
    summary: `A CO₂ phase diagram, pressure on a log scale against temperature, with the sublimation, vapour and melting curves. The simulated path of the air's CO₂ runs from Venus today (${p.text.start}) to Earth-like on ${p.text.earthLike} (${p.text.end}). The sealed dry ice sits at ${p.text.iceT}, from ${p.text.iceTop} at its top to ${p.text.iceBase} at its base, where it would melt at ${p.text.iceMelt}.`,
    head: ["Point", "When", "State"],
    rows: [
      ["Venus today", "Before cooling", p.text.start],
      ["Critical point: the Clear Rain begins", p.text.clearRain, p.text.critical],
      [
        `Critical point again, after the Bricks' heat warms the air back by ${p.text.rewarm}: the Clear Rain falls for good`,
        p.text.rerain,
        p.text.critical,
      ],
      ["Triple point: the seas start to freeze", p.text.freeze, p.text.triple],
      ["Triple point: the seas are frozen through", p.text.frozen, p.text.triple],
      ["All the CO₂ is down", p.text.coldDate, p.text.cold],
      ["Frost Towers finish", p.text.scavenged, `${p.text.frostP} of CO₂ left in the air`],
      ["Frost Tower cold trap", "", `${p.text.frostT}, ${p.text.frostP}`],
      ["Earth-like", p.text.earthLike, p.text.end],
      [
        "Sealed dry ice",
        `Sealed by ${p.text.sealed}`,
        `${p.text.iceT}, ${p.text.iceBase} at the base; melts there at ${p.text.iceMelt}`,
      ],
    ],
  }),
  numbers: () => [
    "venus-surface-temp",
    "co2-critical-temp",
    "co2-critical-pressure",
    "co2-triple-temp",
    "co2-triple-pressure",
    "co2-sublimation-a1",
    "co2-sublimation-a2",
    "co2-sublimation-a3",
    "co2-melting-a1",
    "co2-melting-a2",
    "traj-clear-rain",
    "traj-rerain",
    "traj-rewarm",
    "traj-freeze",
    "traj-frozen",
    "traj-cold",
    "freeze-target-temp",
    "co2-pressure-at-freeze",
    "traj-scavenged",
    "sealing-end",
    "frost-tower-temp",
    "frost-co2-pressure",
    "traj-earth-like",
    "cryo-ice-temp",
    "cryo-thickness",
    "final-pressure",
    "cryo-base-pressure",
    "cryo-base-melt-temp",
  ],
  Component: Co2Phase,
};
