/** The energy budget: what the Helios Lattice must deliver, against what it supplies. */
import { DEMANDS } from "@phosphoros/calc/model/budget";
import { clearOf, Halo, hbar, TechLink } from "./charts-kit.tsx";
import { Art, Frame, Key, linear, show, showValue, textWidth, ticks, W } from "./kit.tsx";
import type { FigureDef } from "./types.ts";

interface Item {
  id: string;
  label: string;
  value: number;
  text: string;
  tech?: string;
}

interface Props {
  demands: Item[];
  total: Item;
  supply: Item;
  share: string;
  spare: string;
  ring: Item;
  caught: string;
  gain: string;
  withRing: Item;
  spareWithRing: string;
  ticks: { value: number; text: string }[];
  max: number;
}

/** Words for each demand row; the ids and their order come from the model's DEMANDS list. */
const NAMES: Record<string, { label: string; tech?: string }> = {
  "ice-launch-energy": { label: "Launch the ice from Ceres", tech: "ice-train" },
  "traj-pump-energy": { label: "Heat-pump work to cool Venus", tech: "exhaust" },
  "traj-fan-energy": { label: "Run the chimney fans", tech: "chimneys" },
  "traj-warm-energy": { label: "Warm the air, melt the last ice" },
  "forge-energy": { label: "Forge the oxygen", tech: "forges" },
  "hardware-energy": { label: "Build all the hardware", tech: "ouroboros" },
};

const M = { l: 236, r: 170 };
const ROW = 28;
const BAR = 16;

function Row({
  item,
  y,
  x,
  tone,
  note,
  sub,
  line,
}: {
  item: Item;
  y: number;
  x: (v: number) => number;
  tone: string;
  note?: string;
  sub?: string;
  /** The supply line, where it runs through this row: the value label stays off it. */
  line?: number;
}) {
  const mid = y + ROW / 2;
  // A linked row lights a box around the whole row: some bars are too short to show focus.
  return (
    <TechLink
      tech={item.tech}
      label={`${item.label}: ${item.text}`}
      box={{ x: 20, y: y + 1, w: W - 24, h: ROW - 2 }}
    >
      <g>
        <title>{`${item.label}: ${item.text}`}</title>
        <text className="f-label" x={M.l - 12} y={sub ? mid - 7 : mid} dy="0.32em" textAnchor="end">
          {item.label}
        </text>
        {sub && (
          <text className="f-note" x={M.l - 12} y={mid + 9} dy="0.32em" textAnchor="end">
            {sub}
          </text>
        )}
        <path className={`f-${tone}`} d={hbar(x(0), x(item.value), mid - BAR / 2, BAR)} />
        {clearOf(x(item.value) + 8, item.text, line === undefined ? [] : [line], note).map(
          ([lx, text]) => (
            <Halo key={text} className="f-num" x={lx} y={mid} dy="0.32em">
              {text}
            </Halo>
          ),
        )}
      </g>
    </TechLink>
  );
}

function LatticeBudget(p: Props) {
  const x = linear([0, p.max], [M.l, W - M.r]);
  const top = 70;
  const rowsEnd = top + p.demands.length * ROW;
  const totalY = rowsEnd + 10;
  const bracketY = totalY + ROW + 2;
  // The bracket's note takes two lines where one would run into the supply line.
  const shareHead = "Launching the water and pumping out the heat:";
  const shareTail = `${p.share} of the supply`;
  const shareLines =
    textWidth(`${shareHead} ${shareTail}`, 11.5) < x(p.supply.value) - 8 - M.l
      ? [`${shareHead} ${shareTail}`]
      : [shareHead, shareTail];
  const supplyY = bracketY + 26 + (shareLines.length - 1) * 14;
  const ringHead = supplyY + ROW + 34;
  const ringY = ringHead + 12;
  const withY = ringY + ROW + 24;
  const axisY = withY + ROW + 10;
  const H = axisY + 52;
  const sx = x(p.supply.value);
  const gridSpans: [number, number][] = [
    [top - 8, ringHead - 22],
    [ringHead + 4, axisY],
  ];
  // The total bar shows its parts, separated by 2px surface gaps.
  let acc = 0;
  const parts = p.demands.map((d) => {
    const x0 = x(acc);
    acc += d.value;
    return { ...d, x0, x1: x(acc) };
  });
  const big = parts.filter((s) => s.x1 - s.x0 >= 2);
  const shareEnd = x((p.demands[0]?.value ?? 0) + (p.demands[1]?.value ?? 0));
  return (
    <Frame
      id="lattice-budget"
      title="Energy the Helios Lattice must deliver, against its supply"
      desc={`Demand ${p.total.text} against supply ${p.supply.text}: ${p.spare}. Launching the water and pumping out the heat take ${p.share} of the supply.`}
      height={H}
      links
    >
      <Art>
        <Key x={24} y={20} tone="s1" label="Demand" />
        <Key x={110} y={20} tone="accent" label="Lattice supply" />
        <Key x={232} y={20} tone="s3" label="Recovered by the Braking Ring" />
        {/* Gridlines pause for the second section's heading, so none runs through it. */}
        {p.ticks.map((t) => (
          <g key={t.value}>
            {gridSpans.map(([y1, y2]) => (
              <line key={y1} className="f-grid" x1={x(t.value)} x2={x(t.value)} y1={y1} y2={y2} />
            ))}
            <text className="f-tick" x={x(t.value)} y={axisY + 18} textAnchor="middle">
              {t.text}
            </text>
          </g>
        ))}
        {gridSpans.map(([y1, y2]) => (
          <line key={y1} className="f-axis" x1={x(0)} x2={x(0)} y1={y1} y2={y2} />
        ))}
        <text className="f-note" x={M.l} y={axisY + 40}>
          Energy over the campaign, to the deadline (linear scale)
        </text>

        <text className="f-title" x={24} y={top - 14}>
          What the Lattice must deliver
        </text>
      </Art>
      {p.demands.map((d, i) => (
        <Row key={d.id} item={d} y={top + i * ROW} x={x} tone="s1" line={sx} />
      ))}

      <Art>
        {/* The supply line runs through every row of demand, so each bar reads against it. It skips
            the Ring's own section: the energy the Ring recovers is not a demand. */}
        <line className="f-accent-line" x1={sx} x2={sx} y1={top - 8} y2={supplyY + ROW + 4} />
        <line className="f-accent-line" x1={sx} x2={sx} y1={withY - 2} y2={axisY} />
        <Halo className="f-note" x={sx + 6} y={top - 14}>
          Lattice supply
        </Halo>

        <g>
          <title>{`${p.total.label}: ${p.total.text}`}</title>
          <text className="f-label" x={M.l - 12} y={totalY + ROW / 2} dy="0.32em" textAnchor="end">
            {p.total.label}
          </text>
          {big.map((s, i) => (
            <path
              key={s.id}
              className="f-s1"
              d={
                i === big.length - 1
                  ? hbar(s.x0, x(p.total.value), totalY + (ROW - BAR) / 2, BAR)
                  : `M${s.x0.toFixed(1)},${totalY + (ROW - BAR) / 2}h${(s.x1 - s.x0 - 2).toFixed(1)}v${BAR}h${-(s.x1 - s.x0 - 2)}Z`
              }
            />
          ))}
          {clearOf(x(p.total.value) + 8, p.total.text, [sx], p.spare).map(([lx, text]) => (
            <Halo key={text} className="f-num" x={lx} y={totalY + ROW / 2} dy="0.32em">
              {text}
            </Halo>
          ))}
        </g>
        <path
          className="f-muted-line"
          d={`M${x(0)},${bracketY}v5H${shareEnd}v-5`}
          strokeWidth={1}
        />
        {shareLines.map((l, i) => (
          <Halo key={l} className="f-note" x={x(0)} y={bracketY + 18 + i * 14}>
            {l}
          </Halo>
        ))}
      </Art>
      <Row item={p.supply} y={supplyY} x={x} tone="accent" />

      <Art>
        <text className="f-title" x={24} y={ringHead - 6}>
          Counted separately: the Braking Ring
        </text>
      </Art>
      <Row item={p.ring} y={ringY} x={x} tone="s3" />
      <Art>
        <Halo className="f-note" x={M.l} y={ringY + ROW + 8}>
          {`Of ${p.caught} caught. Gravity, the Sun's and then Venus's, gave the ice ${p.gain} of it.`}
        </Halo>
      </Art>
      <Row
        item={p.withRing}
        y={withY}
        x={x}
        tone="s1"
        note={p.spareWithRing}
        sub="once the Ring powers the Railheads"
        line={sx}
      />
    </Frame>
  );
}

export const latticeBudget: FigureDef<Props> = {
  id: "lattice-budget",
  title: "The energy budget",
  file: "figures/src/lattice-budget.tsx",
  build: ({ r }) => {
    const item = (id: string, label: string, tech?: string): Item => ({
      id,
      label,
      value: r.get(id).value,
      text: show(r, id),
      tech,
    });
    const demands = DEMANDS.map(([id, label]) =>
      item(id, NAMES[id]?.label ?? label, NAMES[id]?.tech),
    );
    const supply = item("helios-supply", "Lattice supply", "helios");
    const q = r.get("helios-supply");
    const max = Math.max(supply.value, r.get("budget-demand").value) * 1.04;
    // "9.3% spare", or for a variant that does not close, how far short it falls.
    const margin = (id: string) => {
      const m = r.get(id);
      return m.value >= 0 ? `${show(r, id)} spare` : `${showValue(m, -m.value)} short`;
    };
    return {
      demands,
      total: item("budget-demand", "Total demand"),
      supply,
      share: show(r, "budget-launch-share"),
      spare: margin("budget-spare"),
      ring: item("ring-recovered-energy", "Recovered by the Ring", "ring"),
      caught: show(r, "ring-catch-energy"),
      gain: show(r, "ice-solar-gain"),
      withRing: item("budget-demand-with-ring", "Demand on the Lattice"),
      spareWithRing: margin("budget-spare-with-ring"),
      ticks: ticks(0, max, 5).map((v) => ({ value: v, text: showValue(q, v, { sig: 1 }) })),
      max,
    };
  },
  caption: (p) =>
    `The Lattice supplies ${p.supply.text} against a demand of ${p.total.text}: ${p.spare}, and ${p.spareWithRing} once the Braking Ring's recovered energy pays for the launches. Launching the water and pumping out the heat take ${p.share} of the supply.`,
  describe: (p) => ({
    summary: `${p.demands.length} demands add up to ${p.total.text}, against the Lattice's supply of ${p.supply.text} (${p.spare}). The Ring recovers ${p.ring.text} from the falling ice, of ${p.caught} caught; once it powers the Railheads the Lattice's demand falls to ${p.withRing.text} (${p.spareWithRing}).`,
    head: ["Item", "Energy"],
    rows: [
      ...p.demands.map((d) => [d.label, d.text]),
      [p.total.label, p.total.text],
      [p.supply.label, p.supply.text],
      ["Margin", p.spare],
      [p.ring.label, p.ring.text],
      [`${p.withRing.label}, once the Ring powers the Railheads`, p.withRing.text],
      ["Margin once the Ring pays the Railheads", p.spareWithRing],
    ],
  }),
  numbers: (p) => [
    ...p.demands.map((d) => d.id),
    "budget-demand",
    "helios-supply",
    "budget-spare",
    "budget-launch-share",
    "ring-recovered-energy",
    "ring-catch-energy",
    "ice-solar-gain",
    "budget-demand-with-ring",
    "budget-spare-with-ring",
  ],
  Component: LatticeBudget,
};
