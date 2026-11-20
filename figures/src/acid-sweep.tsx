/**
 * Acid Sweep: the sulfur's path out of the air and into rock, as three schematic cross-sections of a
 * highland and a lowland basin (grind and dust, the Clear Rain, the oceans), over the masses drawn to
 * scale: the SO₂, the share the CO₂ seas seal away, the sulfur left to sweep, and the lime and basalt.
 */
import { Art, Frame, Link, path, show, textWidth, W } from "./kit.tsx";
import { CurvedArrow, Lines, Tag } from "./space-kit.tsx";
import { Diamond } from "./structure-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Bar {
  id: string;
  label: string;
  sub: string;
  value: number;
  text: string;
  tone: string;
}

interface Props {
  bars: Bar[];
  text: {
    so2: string;
    sealed: string;
    swept: string;
    ppm: string;
    moles: string;
    cao: string;
    basalt: string;
    limeShare: string;
    layer: string;
    crust: string;
    basins: string;
    phMin: string;
    phMax: string;
    phDays: string;
    cooling: string;
    rain: string;
    forges: string;
    warming: string;
    genesis: string;
  };
}

const H = 664;
const PW = 234; // panel width
const GAP = 13;
const PANEL_X = [16, 16 + PW + GAP, 16 + 2 * (PW + GAP)];
const P_TOP = 36;
const P_BOT = 372;
// The ground in every panel: a highland at the left, a lowland basin, a low shore at the right.
const Y_HIGH = 196;
const Y_FLOOR = 246;
const Y_SHORE = 204;
const Y_ROCK = 270;
const Y_CLOUD = [100, 124];
const NOTES_Y = 296;
// The bars: the masses to scale.
const BAR_TOP = 424;
const BAR_X = 236;
const BAR_W = 380;
const BAR_ROW = 34;

/** The ground profile of the panel at x0, left to right. */
function ground(x0: number): [number, number][] {
  return [
    [x0 + 1, Y_HIGH],
    [x0 + 58, Y_HIGH],
    [x0 + 96, Y_FLOOR],
    [x0 + PW - 56, Y_FLOOR],
    [x0 + PW - 24, Y_SHORE],
    [x0 + PW - 1, Y_SHORE],
  ];
}

/** The height of the ground at x, in the panel at x0. */
function groundAt(x0: number, x: number): number {
  const g = ground(x0);
  for (let i = 1; i < g.length; i++) {
    const [ax, ay] = g[i - 1] as [number, number];
    const [bx, by] = g[i] as [number, number];
    if (x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax);
  }
  return Y_SHORE;
}

/** Where a level surface at y meets the basin's two slopes. */
function shores(x0: number, y: number): [number, number] {
  const left = x0 + 58 + ((y - Y_HIGH) / (Y_FLOOR - Y_HIGH)) * 38;
  const right = x0 + PW - 56 + ((Y_FLOOR - y) / (Y_FLOOR - Y_SHORE)) * 32;
  return [left, right];
}

/** The card, header, rock and ground of one panel. */
function Panel({ i, title, when }: { i: number; title: string; when: string }) {
  const x0 = PANEL_X[i] ?? 0;
  const g = ground(x0);
  return (
    <g>
      <rect className="f-axis" x={x0} y={P_TOP} width={PW} height={P_BOT - P_TOP} rx={8} />
      <circle className="f-accent" cx={x0 + 20} cy={58} r={9} />
      <text
        className="f-surface"
        x={x0 + 20}
        y={58}
        dy="0.35em"
        textAnchor="middle"
        fontWeight={700}
        fontSize={11.5}
      >
        {i + 1}
      </text>
      <text className="f-label" x={x0 + 36} y={62} fontWeight={600}>
        {title}
      </text>
      <text className="f-note f-num" x={x0 + 36} y={77}>
        {when}
      </text>
      <path
        className="f-muted-wash"
        d={`${path(g)}L${x0 + PW - 1},${Y_ROCK}L${x0 + 1},${Y_ROCK}Z`}
      />
      <path className="f-ink-line" d={path(g)} strokeWidth={1.5} />
    </g>
  );
}

function AcidSweep({ bars, text: t }: Props) {
  const [a, b, c] = PANEL_X as [number, number, number];
  const max = Math.max(...bars.map((x) => x.value));
  // Panel 1: the canopy over the basin, its drones and the dust they lay.
  const can0 = a + 112;
  const can1 = a + PW - 14;
  const canY = 112;
  // Over the highland and the shore, where the cloud acid would wash into the oceans. The basin floor
  // needs no dust: what lands there is sealed under the caps.
  const drones: [number, number][] = [
    [a + 50, 150],
    [a + PW - 38, 158],
    [a + PW - 14, 150],
  ];
  const canopyName = "Exhaust canopy";
  const canopyBox = {
    x: can1 - textWidth(canopyName, 11.5) - 6,
    y: 84,
    w: textWidth(canopyName, 11.5) + 12,
    h: 17,
  };
  const dust = (x0: number) => (
    <g>
      <rect className="f-soft" x={x0 + 42} y={Y_HIGH - 5} width={18} height={5} rx={1} />
      <path
        className="f-soft"
        d={`M${x0 + PW - 56},${Y_FLOOR}L${x0 + PW - 24},${Y_SHORE}H${x0 + PW - 1}v-5H${x0 + PW - 26}L${x0 + PW - 60},${Y_FLOOR - 5}Z`}
      />
    </g>
  );
  // Panel 2: acid rain onto the dust; liquid CO₂ pooling over it.
  const rain = Array.from({ length: 8 }, (_, k) => b + 18 + k * 28);
  const yCO2 = 234;
  const [co2L, co2R] = shores(b, yCO2);
  // Panel 3: the ocean, its basalt shores and the gate.
  const ySea = 212;
  const [seaL, seaR] = shores(c, ySea);
  const [lipL, lipR] = shores(c, ySea - 8);
  const gate = [
    { text: `Gate: pH above ${t.phMin}`, kind: "label" as const },
    { text: `for ${t.phDays} before any life;`, kind: "note" as const },
    { text: `Genesis from ${t.genesis}`, kind: "note" as const },
  ];
  const gateW = Math.max(...gate.map((l, k) => textWidth(l.text, k ? 11.5 : 13)));
  const gateBox = { x: c + 26, y: 96, w: gateW + 12, h: 14.5 * 2 + 21 };
  const cryo = `The sealed ${t.sealed} needs no lime: the cryo-continents hold it under the caps.`;
  const cryoY = BAR_TOP + bars.length * BAR_ROW + 18;
  return (
    <Frame
      id="acid-sweep"
      title="Acid Sweep: the sulfur's path out of the air and the oceans"
      desc={`Three schematic cross-sections of a highland and a lowland basin. From ${t.cooling}, mills grind ${t.basalt} of basalt and canopy drones lay it ${t.layer} deep on the land outside the basins. By ${t.rain} the acid clouds have rained out onto it and lime turns the acid to gypsum, while the SO₂ dissolves in the liquid CO₂ and freezes with it under the caps: ${t.sealed} of it. From ${t.warming}, shore basalt holds the oceans between pH ${t.phMin} and ${t.phMax}; no life is released until they stay above ${t.phMin} for ${t.phDays}. Below, the masses to scale.`}
      height={H}
      links
    >
      <Art>
        <text className="f-title" x={16} y={22}>
          The sulfur's path, step by step
        </text>
        <Tag x={W - 16} y={20} anchor="end" text="Schematic, not to scale" />

        {/* 1. Grind and dust. */}
        <Panel i={0} title="Grind and dust" when={`from ${t.cooling}`} />
        <rect
          className="f-s4-wash"
          x={a + 1}
          y={Y_CLOUD[0]}
          width={PW - 2}
          height={(Y_CLOUD[1] ?? 0) - (Y_CLOUD[0] ?? 0)}
        />
        <text className="f-note" x={a + 10} y={116}>
          acid clouds
        </text>
        {drones.map(([x, y]) => (
          <g key={x}>
            {[-9, 0, 9].map((dx) => (
              <line
                key={dx}
                className="f-soft-line"
                x1={x}
                y1={y + 5}
                x2={x + dx}
                y2={groundAt(a, x + dx) - 7}
                strokeDasharray="1 3"
              />
            ))}
            <rect className="f-ink" x={x - 5} y={y - 3} width={10} height={6} rx={2} />
          </g>
        ))}
        {dust(a)}
        {/* A rock mill on the highland, sending its dust to the drones. */}
        <path
          className="f-ink"
          d={`M${a + 16},${Y_HIGH}V${Y_HIGH - 12}l8,-6v6l8,-6v6l8,-6V${Y_HIGH}Z`}
        />
        {/* Two short lines, so the arrow to the drones clears the name. */}
        <Lines
          x={a + 12}
          y={Y_HIGH - 46}
          lines={[
            { text: "rock", kind: "note" },
            { text: "mills", kind: "note" },
          ]}
        />
        <CurvedArrow
          from={[a + 42, Y_HIGH - 16]}
          via={[a + 110, 140]}
          to={[a + PW - 48, 156]}
          tone="soft"
          head={6}
        />
      </Art>
      <Link
        href="/technologies/exhaust"
        label={`${canopyName}: its drones dust the highlands and the shores`}
        box={canopyBox}
      >
        <path
          className="f-soft f-node"
          d={`M${can0},${canY}L${can0 + 8},${canY - 5}H${can1 - 8}L${can1},${canY}L${can1 - 8},${canY + 5}H${can0 + 8}Z`}
        />
        <text className="f-note" x={can1} y={96} textAnchor="end">
          {canopyName}
        </text>
      </Link>
      <Art>
        <Lines
          x={a + 12}
          y={NOTES_Y}
          lines={[
            { text: `${t.basalt} of highland basalt,`, kind: "note" },
            { text: `${t.crust} of the crust's top km,`, kind: "note" },
            { text: "ground to dust. Drones lay it", kind: "note" },
            { text: `${t.layer} deep on the land`, kind: "note" },
            { text: "outside the basins.", kind: "note" },
          ]}
        />

        {/* 2. The Clear Rain. */}
        <Panel i={1} title="The Clear Rain" when={`by ${t.rain}`} />
        <rect
          className="f-s4-wash"
          x={b + 1}
          y={Y_CLOUD[0]}
          width={PW - 2}
          height={(Y_CLOUD[1] ?? 0) - (Y_CLOUD[0] ?? 0)}
        />
        {rain.map((x) => (
          <line
            key={x}
            className="f-s4-line"
            x1={x}
            y1={(Y_CLOUD[1] ?? 0) + 4}
            x2={x - 10}
            y2={groundAt(b, x - 10) - 4}
            strokeWidth={1.5}
            strokeDasharray="7 5"
          />
        ))}
        <path
          className="f-cool-wash"
          d={`M${co2L},${yCO2}L${b + 96},${Y_FLOOR}H${b + PW - 56}L${co2R},${yCO2}Z`}
        />
        <line className="f-cool-line" x1={co2L} x2={co2R} y1={yCO2} y2={yCO2} strokeWidth={2} />
        {dust(b)}
        <text className="f-note" x={b + 10} y={116}>
          acid clouds rain out
        </text>
        <Lines
          x={(co2L + co2R) / 2}
          y={yCO2 - 8}
          anchor="middle"
          halo
          lines={[{ text: "liquid CO₂", kind: "note" }]}
        />
        <Lines
          x={b + 12}
          y={NOTES_Y}
          lines={[
            { text: "Acid rain falls on the dust, and", kind: "note" },
            { text: "lime turns it to gypsum. The SO₂", kind: "note" },
            { text: "dissolves in the liquid CO₂ and", kind: "note" },
            { text: "freezes with it under the caps.", kind: "note" },
          ]}
        />

        {/* 3. The oceans. */}
        <Panel i={2} title="The oceans" when={`from ${t.warming}`} />
        <path
          className="f-s1-wash"
          d={`M${seaL},${ySea}L${c + 96},${Y_FLOOR}H${c + PW - 56}L${seaR},${ySea}Z`}
        />
        <line className="f-s1-line" x1={seaL} x2={seaR} y1={ySea} y2={ySea} strokeWidth={2} />
        <path
          className="f-soft-line"
          d={path([
            [lipL, ySea - 8],
            [c + 96, Y_FLOOR - 2],
            [c + PW - 56, Y_FLOOR - 2],
            [lipR, ySea - 8],
          ])}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <text className="f-note" x={(seaL + seaR) / 2} y={Y_FLOOR - 9} textAnchor="middle">
          ocean
        </text>
        <Lines
          x={c + PW - 14}
          y={Y_SHORE - 18}
          anchor="end"
          halo
          lines={[{ text: "basalt shores", kind: "note" }]}
        />
        <Diamond x={c + 18} y={108} r={7} tone="accent" hollow />
      </Art>
      <Link
        href="/technologies/genesis"
        label={`Gate: pH above ${t.phMin} for ${t.phDays} before any life is released; Genesis seeding from ${t.genesis}`}
        box={gateBox}
      >
        <Lines x={c + 32} y={111} lines={gate} />
      </Link>
      <Art>
        <Lines
          x={c + 12}
          y={NOTES_Y}
          lines={[
            { text: "Basalt on the shores and the sea", kind: "note" },
            { text: "floor holds the water between", kind: "note" },
            { text: `pH ${t.phMin} and ${t.phMax}.`, kind: "note" },
          ]}
        />

        {/* The masses, to scale. */}
        <text className="f-title" x={16} y={BAR_TOP - 26}>
          The masses, to scale
        </text>
        {bars.map((bar, k) => {
          const y = BAR_TOP + k * BAR_ROW;
          const w = Math.max(1.5, (bar.value / max) * BAR_W);
          return (
            <g key={bar.id}>
              <text className="f-label" x={BAR_X - 12} y={y + 4} textAnchor="end">
                {bar.label}
              </text>
              <text className="f-note f-num" x={BAR_X - 12} y={y + 18} textAnchor="end">
                {bar.sub}
              </text>
              <path
                className={`f-${bar.tone}`}
                d={
                  w > 8
                    ? `M${BAR_X},${y}h${w - 4}a4,4 0 0 1 4,4v8a4,4 0 0 1 -4,4h${-(w - 4)}Z`
                    : `M${BAR_X},${y}h${w}v16h${-w}Z`
                }
              >
                <title>{`${bar.label}: ${bar.text}`}</title>
              </path>
              <text className="f-num" x={BAR_X + w + 8} y={y + 8} dy="0.32em">
                {bar.text}
              </text>
            </g>
          );
        })}
        <line
          className="f-axis"
          x1={BAR_X}
          x2={BAR_X}
          y1={BAR_TOP - 6}
          y2={BAR_TOP + bars.length * BAR_ROW - 12}
        />
      </Art>
      <Link
        href="/technologies/cryo"
        label={cryo}
        box={{ x: BAR_X - 6, y: cryoY - 13, w: textWidth(cryo, 11.5) + 12, h: 18 }}
      >
        <text className="f-note" x={BAR_X} y={cryoY}>
          {cryo}
        </text>
      </Link>
    </Frame>
  );
}

export const acidSweep: FigureDef<Props> = {
  id: "acid-sweep",
  title: "How the Acid Sweep takes the sulfur out",
  file: "figures/src/acid-sweep.tsx",
  build: ({ r }) => {
    const v = (id: string) => r.get(id).value;
    const bar = (id: string, label: string, sub: string, tone: string): Bar => ({
      id,
      label,
      sub,
      tone,
      value: v(id),
      text: show(r, id),
    });
    return {
      bars: [
        bar(
          "venus-so2-mass",
          "SO₂ in the air",
          `${show(r, "venus-so2-fraction", { show: "ppm" })}, ${show(r, "so2-moles")}`,
          "s4",
        ),
        bar(
          "so2-sealed",
          "Sealed with the CO₂",
          `${show(r, "so2-sealed-share")}, frozen with the seas`,
          "cool",
        ),
        bar("so2-airborne-at-freeze", "SO₂ left in the air", "as the seas start to freeze", "s4"),
        bar("venus-cloud-acid", "Cloud acid", "sulfuric acid, rains out first", "s4"),
        bar(
          "acid-basalt",
          "Basalt for the rest",
          `${show(r, "basalt-cao-fraction")} of basalt is lime`,
          "soft",
        ),
        bar("acid-cao", "Lime in it", "one CaO for each sulfur", "muted"),
      ],
      text: {
        so2: show(r, "venus-so2-mass"),
        sealed: show(r, "so2-sealed"),
        swept: show(r, "acid-swept-share"),
        ppm: show(r, "venus-so2-fraction", { show: "ppm" }),
        moles: show(r, "so2-moles"),
        cao: show(r, "acid-cao"),
        basalt: show(r, "acid-basalt"),
        limeShare: show(r, "basalt-cao-fraction"),
        layer: show(r, "acid-basalt-layer"),
        crust: show(r, "acid-crust-share"),
        basins: show(r, "cryo-footprint-share"),
        phMin: show(r, "genesis-ph-min"),
        phMax: show(r, "acid-ocean-ph-max"),
        phDays: show(r, "genesis-ph-days"),
        cooling: show(r, "cooling-start", { date: "month" }),
        rain: show(r, "traj-clear-rain", { date: "month" }),
        forges: show(r, "forge-start", { date: "month" }),
        warming: show(r, "traj-warming", { date: "month" }),
        genesis: show(r, "genesis-start", { date: "month" }),
      },
    };
  },
  caption: (p) =>
    `The SO₂ dissolves in the liquid CO₂ and ${p.text.sealed} of it freezes into the cryo-continents, leaving ${p.text.swept} of the sulfur for the Sweep. Highland mills grind ${p.text.basalt} of basalt, ${p.text.crust} of the crust's top kilometre, and drones lay it ${p.text.layer} deep on the land outside the basins before the Clear Rain, so the cloud acid lands on lime. Shore basalt then holds the oceans between pH ${p.text.phMin} and ${p.text.phMax}, and no life is released until they stay above ${p.text.phMin} for ${p.text.phDays}.`,
  describe: (p) => ({
    summary: `Three schematic cross-sections of a highland beside a lowland basin, not to scale. First, from ${p.text.cooling}: rock mills on the highland grind ${p.text.basalt} of basalt, ${p.text.crust} of the top kilometre of Venus's crust, and drones from the Exhaust canopies lay the dust ${p.text.layer} deep on the highlands and the shores; the basins, ${p.text.basins} of Venus where the CO₂ will pool, need none. Second, by ${p.text.rain}: the acid clouds have rained out onto the dust, and each molecule of lime (CaO) takes up one of acid, making gypsum and anhydrite; any SO₂ makes calcium sulfite, which turns to sulfate once the Forges add oxygen from ${p.text.forges}. The SO₂ dissolves in the liquid CO₂ of the Clear Rain and runs with it into the basins, where ${p.text.sealed} of it freezes with the seas under the caps. Third, from ${p.text.warming}: the ice melts into oceans, and basalt on the shores and sea floor holds the water between pH ${p.text.phMin} and ${p.text.phMax}. The gate: no organism is released until the pH has stayed above ${p.text.phMin} for ${p.text.phDays}; Genesis seeding starts in ${p.text.genesis}. Below, the masses to scale: the Sweep takes up only ${p.text.swept} of the sulfur, because the sealed SO₂ needs no lime.`,
    head: ["Mass", "Value", "Note"],
    rows: [
      ...p.bars.map((b) => [b.label, b.text, b.sub]),
      [
        "Basalt layer on the land outside the basins",
        p.text.layer,
        `the basins are ${p.text.basins} of Venus`,
      ],
      ["Share of the crust's top kilometre", p.text.crust, "the basalt the Sweep grinds"],
      [
        "Ocean pH",
        `${p.text.phMin} to ${p.text.phMax}`,
        `above ${p.text.phMin} for ${p.text.phDays} before any life`,
      ],
    ],
  }),
  numbers: () => [
    "venus-so2-mass",
    "venus-so2-fraction",
    "so2-moles",
    "so2-sealed",
    "so2-sealed-share",
    "so2-airborne-at-freeze",
    "venus-cloud-acid",
    "acid-swept-share",
    "acid-cao",
    "acid-basalt",
    "basalt-cao-fraction",
    "acid-basalt-layer",
    "acid-crust-share",
    "cryo-footprint-share",
    "genesis-ph-min",
    "acid-ocean-ph-max",
    "genesis-ph-days",
    "cooling-start",
    "traj-clear-rain",
    "forge-start",
    "traj-warming",
    "genesis-start",
  ],
  Component: AcidSweep,
};
