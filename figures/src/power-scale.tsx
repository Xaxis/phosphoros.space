/** Power scale: what a ten-year campaign needs against the power there is, on one log axis. */
import { Halo, hbar, TechLink } from "./charts-kit.tsx";
import { Art, Frame, log, pow10, show, W } from "./kit.tsx";
import type { FigureDef } from "./types.ts";

interface Bar {
  id: string;
  label: string;
  value: number;
  text: string;
  plan?: boolean;
  tech?: string;
}

interface Group {
  title: string;
  bars: Bar[];
}

interface Props {
  groups: Group[];
  sunlight: { value: number; text: string };
  plan: { value: number; text: string };
  years: string;
}

const M = { l: 262, r: 92, t: 54, b: 52 };
const ROW = 30;
const BAR = 18;
const HEAD = 30;
const DOMAIN: [number, number] = [1e12, 1e21];

function height(groups: Group[]): number {
  return M.t + groups.reduce((h, g) => h + HEAD + g.bars.length * ROW, 0) + M.b;
}

function PowerScale({ groups, sunlight, plan, years }: Props) {
  const H = height(groups);
  const x = log(DOMAIN, [M.l, W - M.r]);
  const top = M.t;
  const bottom = H - M.b;
  const exps: number[] = [];
  for (let e = Math.log10(DOMAIN[0]); e <= Math.log10(DOMAIN[1]); e++) exps.push(10 ** e);
  let y = top;
  const placed = groups.map((g) => {
    const head = y;
    y += HEAD;
    const rows = g.bars.map((b) => {
      const at = y;
      y += ROW;
      return { ...b, y: at };
    });
    return { ...g, head, rows };
  });
  return (
    <Frame
      id="power-scale"
      title={`Power needs against supply, ${years}-year tasks, log scale`}
      desc={`Every conventional ${years}-year task needs more power than all the sunlight Venus intercepts (${sunlight.text}). The Helios Lattice delivers ${plan.text}.`}
      height={H}
      links
    >
      <Art>
        {exps.map((v) => (
          <g key={v}>
            <line className="f-grid" x1={x(v)} x2={x(v)} y1={top} y2={bottom} />
            <text className="f-tick" x={x(v)} y={bottom + 18} textAnchor="middle">
              {pow10(v)}
            </text>
          </g>
        ))}
        <line className="f-axis" x1={M.l} x2={M.l} y1={top} y2={bottom} />
        <text className="f-note" x={M.l} y={bottom + 40}>
          Power in watts (log scale; each gridline is ten times the last)
        </text>
        {/* Two reference lines: what Venus receives from the Sun, and what the plan supplies. */}
        <line
          className="f-muted-line"
          x1={x(sunlight.value)}
          x2={x(sunlight.value)}
          y1={top - 6}
          y2={bottom}
        />
        <text className="f-note" x={x(sunlight.value) - 6} y={top - 26} textAnchor="end">
          All the sunlight
        </text>
        <text className="f-note" x={x(sunlight.value) - 6} y={top - 12} textAnchor="end">
          Venus intercepts
        </text>
        <line
          className="f-accent-line"
          x1={x(plan.value)}
          x2={x(plan.value)}
          y1={top - 6}
          y2={bottom}
        />
        <text className="f-note" x={x(plan.value) + 6} y={top - 26}>
          What the Helios
        </text>
        <text className="f-note" x={x(plan.value) + 6} y={top - 12}>
          Lattice delivers
        </text>
      </Art>
      {placed.map((g) => (
        <g key={g.title}>
          <Art>
            <text className="f-title" x={24} y={g.head + 20}>
              {g.title}
            </text>
          </Art>
          {g.rows.map((b) => {
            const mid = b.y + ROW / 2;
            return (
              <TechLink
                key={b.id}
                tech={b.tech}
                label={`${b.label}: ${b.text}`}
                box={{ x: 20, y: b.y + 1, w: W - 24, h: ROW - 2 }}
              >
                <g>
                  <title>{`${b.label}: ${b.text}`}</title>
                  <text className="f-label" x={M.l - 12} y={mid} dy="0.32em" textAnchor="end">
                    {b.label}
                  </text>
                  <path
                    className={b.plan ? "f-accent" : "f-s1"}
                    d={hbar(M.l, x(b.value), mid - BAR / 2, BAR)}
                  />
                  <Halo className="f-num" x={x(b.value) + 8} y={mid} dy="0.32em">
                    {b.text}
                  </Halo>
                </g>
              </TechLink>
            );
          })}
        </g>
      ))}
    </Frame>
  );
}

export const powerScale: FigureDef<Props> = {
  id: "power-scale",
  title: "Power needs against supply",
  file: "figures/src/power-scale.tsx",
  build: ({ r }) => {
    const bar = (id: string, label: string, extra: Partial<Bar> = {}): Bar => ({
      id,
      label,
      value: r.get(id).value,
      text: show(r, id, { show: "W" }),
      ...extra,
    });
    const years = show(r, "conventional-campaign-years");
    const have = [
      bar("humanity-power", "Humanity's primary power use"),
      bar("passive-power", `A shaded Venus radiating at ${show(r, "cloudtop-temp")}`),
      bar("venus-intercepted", "All the sunlight Venus intercepts"),
      bar("helios-power", "Helios Lattice, the plan's supply", { plan: true, tech: "helios" }),
    ];
    const need = [
      bar("ten-year-cooling-power", "Cool the atmosphere"),
      bar("ten-year-cooling-plus-bosch-power", "Cool it and shed the Bosch heat"),
      bar("co2-escape-power", "Launch the CO₂ to escape speed"),
      bar("spin-up-power", "Spin Venus up to an Earth day"),
    ];
    const byValue = (a: Bar, b: Bar) => a.value - b.value;
    return {
      years,
      groups: [
        { title: "Power there is", bars: have.sort(byValue) },
        { title: `Power a ${years}-year campaign needs`, bars: need.sort(byValue) },
      ],
      sunlight: { value: r.get("venus-intercepted").value, text: show(r, "venus-intercepted") },
      plan: { value: r.get("helios-power").value, text: show(r, "helios-power") },
    };
  },
  caption: (p) =>
    `Every conventional route needs more power for ${p.years} years than all the sunlight Venus intercepts, ${p.sunlight.text}. The plan brings in ${p.plan.text} from the Sun at Mercury instead.`,
  describe: (p) => ({
    summary: `Power on a log scale. Humanity uses far less than the sunlight Venus intercepts (${p.sunlight.text}); every ${p.years}-year task needs more than that sunlight; the Helios Lattice delivers ${p.plan.text}.`,
    head: ["Group", "Item", "Power"],
    rows: p.groups.flatMap((g) => g.bars.map((b) => [g.title, b.label, b.text])),
  }),
  numbers: (p) => [
    ...p.groups.flatMap((g) => g.bars.map((b) => b.id)),
    "cloudtop-temp",
    "conventional-campaign-years",
  ],
  Component: PowerScale,
};
