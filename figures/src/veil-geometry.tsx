/**
 * Hesperus Veil geometry: the Sun, the Veil just sunward of L1, Venus, and the shadow cones, as a
 * schematic with the true distances written on it; under it, the shade areas drawn to scale.
 */
import { Art, Frame, Link, show, textWidth, W } from "./kit.tsx";
import { Arrow, AxisBreak, Lines, Tag } from "./space-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Props {
  /** True ratios the schematic keeps: Veil and L1 distances, Veil radius over Venus's. */
  l1OverVeil: number;
  veilOverVenus: number;
  bars: { id: string; label: string; sub: string; value: number; text: string; tone: string }[];
  text: {
    sun: string;
    venus: string;
    orbit: string;
    veilDistance: string;
    l1Distance: string;
    beyond: string;
    radius: string;
    margin: string;
    beta: string;
    area: string;
    vsV2: string;
  };
}

const H = 520;
const Y0 = 165; // the Sun-Venus line in the schematic
const SUN_X = 22;
const VENUS_X = 700;
const RV = 22; // Venus's radius in the schematic
const VEIL_PX = 262; // Veil to Venus in the schematic
const TOP = 44; // the schematic's top and bottom edges
const BOTTOM = 258;

function VeilGeometry({ l1OverVeil, veilOverVenus, bars, text: t }: Props) {
  const D = VENUS_X - SUN_X;
  const RVEIL = RV * veilOverVenus;
  // The schematic Sun is sized so that the Veil's radius over Venus's is the true ratio:
  // R_veil = R_V + x (R_sun − R_V) / D, solved for R_sun.
  const RS = RV + ((RVEIL - RV) * D) / VEIL_PX;
  const veilX = VENUS_X - VEIL_PX;
  const l1X = VENUS_X - VEIL_PX * l1OverVeil;
  const rL1 = RV + ((VENUS_X - l1X) * (RS - RV)) / D;
  // A line through two points, evaluated at x.
  const at = (x1: number, y1: number, x2: number, y2: number, x: number) =>
    y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
  const end = VENUS_X + 40;
  // Penumbra edges: from one limb of the Sun through the opposite edge of the Veil.
  const penTop = at(SUN_X, Y0 + RS, veilX, Y0 - RVEIL, end);
  const penBot = at(SUN_X, Y0 - RS, veilX, Y0 + RVEIL, end);
  const dim1 = BOTTOM + 18;
  const dim2 = BOTTOM + 44;
  const barTop = 362;
  const barX = 236;
  const barW = 400;
  const max = Math.max(...bars.map((b) => b.value));
  const veil = `Hesperus Veil: ${t.radius} in radius, ${t.area}, ${t.veilDistance} from Venus`;
  const veilLines = ["Hesperus Veil", `radius ${t.radius}`, t.area];
  const veilY = Y0 - RVEIL - 40;
  const veilW = Math.max(...veilLines.map((l, i) => textWidth(l, i ? 11.5 : 13)));
  const veilBox = { x: veilX - veilW / 2 - 6, y: veilY - 15, w: veilW + 12, h: 2 * 14.5 + 21 };
  return (
    <Frame
      id="veil-geometry"
      title="Hesperus Veil geometry"
      desc={`Schematic, not to scale. The Veil sits ${t.veilDistance} sunward of Venus, ${t.beyond} beyond the L1 point, and must be ${t.radius} in radius to put all of Venus in full shadow. Below, the shade areas to scale.`}
      height={H}
      links
    >
      <Art>
        <defs>
          <clipPath id="veil-geometry-clip">
            <rect x={0} y={TOP} width={W} height={BOTTOM - TOP} />
          </clipPath>
        </defs>
        <g clipPath="url(#veil-geometry-clip)">
          {/* Sunlight bound for Venus, up to the Veil. */}
          <path
            className="f-s4-wash"
            d={`M${SUN_X},${Y0 - RS}L${veilX},${Y0 - RVEIL}L${veilX},${Y0 + RVEIL}L${SUN_X},${Y0 + RS}Z`}
          />
          {/* Umbra: the whole Sun hidden. Its edges meet Venus's limb exactly. */}
          <path
            className="f-muted-wash"
            d={`M${veilX},${Y0 - RVEIL}L${VENUS_X},${Y0 - RV}L${VENUS_X},${Y0 + RV}L${veilX},${Y0 + RVEIL}Z`}
          />
          <g className="f-muted-line" strokeWidth={1}>
            <line x1={SUN_X} y1={Y0 - RS} x2={VENUS_X} y2={Y0 - RV} />
            <line x1={SUN_X} y1={Y0 + RS} x2={VENUS_X} y2={Y0 + RV} />
            <line x1={SUN_X} y1={Y0 + RS} x2={end} y2={penTop} />
            <line x1={SUN_X} y1={Y0 - RS} x2={end} y2={penBot} />
          </g>
          <circle className="f-s4-wash" cx={SUN_X} cy={Y0} r={RS} />
          <circle className="f-s4-line" cx={SUN_X} cy={Y0} r={RS} strokeWidth={1.5} />
        </g>

        <line className="f-axis" x1={SUN_X} x2={end} y1={Y0} y2={Y0} strokeDasharray="2 4" />

        {/* The shade a station exactly at L1 would need, for comparison. */}
        <line
          className="f-ink-line"
          x1={l1X}
          x2={l1X}
          y1={Y0 - rL1}
          y2={Y0 + rL1}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <path
          className="f-ink"
          d={`M${l1X},${Y0 - 5}L${l1X + 5},${Y0}L${l1X},${Y0 + 5}L${l1X - 5},${Y0}Z`}
        >
          <title>{`L1, ${t.l1Distance} from Venus`}</title>
        </path>

        {/* The Veil's radius: Venus's radius plus the margin for the Sun's width. */}
        <g className="f-soft-line" strokeWidth={1}>
          <line x1={veilX - 12} x2={veilX - 12} y1={Y0 - RVEIL} y2={Y0} />
          <line x1={veilX - 16} x2={veilX - 8} y1={Y0 - RVEIL} y2={Y0 - RVEIL} />
          <line x1={veilX - 16} x2={veilX - 8} y1={Y0 - RV} y2={Y0 - RV} />
          <line x1={veilX - 16} x2={veilX - 8} y1={Y0} y2={Y0} />
        </g>
        <Lines
          x={veilX - 20}
          y={Y0 - (RVEIL + RV) / 2 + 4}
          anchor="end"
          halo
          lines={[{ text: `margin, ${t.margin}`, kind: "note" }]}
        />
        <Lines
          x={veilX - 20}
          y={Y0 - RV / 2 + 4}
          anchor="end"
          halo
          lines={[{ text: "Venus's radius", kind: "note" }]}
        />

        <circle className="f-hot" cx={VENUS_X} cy={Y0} r={RV}>
          <title>{`Venus, radius ${t.venus}`}</title>
        </circle>

        <Lines x={SUN_X + 10} y={Y0 - 8} halo lines={["Sun", `radius ${t.sun}`]} />
      </Art>
      {/* The Veil and its name are one link; focus lights the bar and a box round the name. */}
      <Link href="/technologies/veil" label={veil} box={veilBox}>
        <rect
          className="f-accent f-node"
          x={veilX - 3}
          y={Y0 - RVEIL}
          width={6}
          height={2 * RVEIL}
          rx={3}
        >
          <title>{veil}</title>
        </rect>
        <Lines x={veilX} y={veilY} anchor="middle" halo lines={veilLines} />
      </Link>
      <Art>
        <Lines
          x={VENUS_X}
          y={Y0 - RV - 26}
          anchor="middle"
          halo
          lines={["Venus", `radius ${t.venus}`]}
        />
        <Lines
          x={l1X + 9}
          y={Y0 + 17}
          halo
          lines={[
            { text: "L1", kind: "label" },
            { text: "dashed: a shade there", kind: "note" },
          ]}
        />
        <Arrow
          x1={l1X}
          y1={Y0 + rL1 + 12}
          x2={veilX + 1}
          y2={Y0 + rL1 + 12}
          tone="soft"
          head={6}
          width={1.25}
        />
        <Lines
          x={l1X + 10}
          y={Y0 + rL1 + 16}
          halo
          lines={[
            // Two short lines: one long one ran past the right edge of the drawing.
            { text: `Light pressure (β = ${t.beta}) moves the`, kind: "note" },
            { text: `balance point ${t.beyond} sunward of L1`, kind: "note" },
          ]}
        />
        <Lines
          x={(l1X + VENUS_X) / 2 - 6}
          y={Y0 - 7}
          anchor="middle"
          lines={[{ text: "Umbra: all of the Sun hidden", kind: "note" }]}
        />
        <Lines
          x={W - 16}
          y={Y0 - 66}
          anchor="end"
          halo
          lines={[{ text: "Penumbra: part of the Sun hidden", kind: "note" }]}
        />
        <Lines
          x={(SUN_X + veilX) / 2 + 30}
          y={Y0 + 40}
          anchor="middle"
          halo
          lines={[{ text: "Sunlight bound for Venus", kind: "note" }]}
        />

        {/* Distances, true values on a schematic. */}
        <g className="f-soft-line" strokeWidth={1}>
          <line x1={l1X} x2={VENUS_X} y1={dim1} y2={dim1} />
          <line x1={l1X} x2={l1X} y1={dim1 - 4} y2={dim1 + 4} />
          <line x1={veilX} x2={VENUS_X} y1={dim2} y2={dim2} />
          <line x1={veilX} x2={veilX} y1={dim2 - 4} y2={dim2 + 4} />
          <line x1={VENUS_X} x2={VENUS_X} y1={dim1 - 4} y2={dim2 + 4} />
          <line x1={SUN_X} x2={SUN_X} y1={dim2 - 4} y2={dim2 + 4} />
          <line x1={SUN_X} x2={veilX - 150} y1={dim2} y2={dim2} />
          <line x1={veilX - 132} x2={veilX - 20} y1={dim2} y2={dim2} />
        </g>
        <AxisBreak x={veilX - 141} y={dim2} />
        <text className="f-note f-num" x={(l1X + VENUS_X) / 2} y={dim1 - 6} textAnchor="middle">
          L1 to Venus {t.l1Distance}
        </text>
        <text className="f-note f-num" x={(veilX + VENUS_X) / 2} y={dim2 - 6} textAnchor="middle">
          Veil to Venus {t.veilDistance}
        </text>
        <text className="f-note f-num" x={SUN_X + 8} y={dim2 - 6}>
          Sun to Venus {t.orbit}
        </text>
        <Tag x={W - 16} y={26} anchor="end" text="Schematic: not to scale" />

        {/* Shade areas, to scale. */}
        <text className="f-title" x={16} y={barTop - 26}>
          Shade area needed for full shadow (to scale)
        </text>
        {bars.map((b, i) => {
          const y = barTop + i * 34;
          const w = (b.value / max) * barW;
          return (
            <g key={b.id}>
              <text className="f-label" x={barX - 12} y={y + 4} textAnchor="end">
                {b.label}
              </text>
              <text className="f-note" x={barX - 12} y={y + 18} textAnchor="end">
                {b.sub}
              </text>
              <path
                className={`f-${b.tone}`}
                d={`M${barX},${y}h${w - 4}a4,4 0 0 1 4,4v8a4,4 0 0 1 -4,4h${-(w - 4)}Z`}
              >
                <title>{`${b.label}: ${b.text}`}</title>
              </path>
              <text className="f-num" x={barX + w + 8} y={y + 8} dy="0.32em">
                {b.text}
              </text>
            </g>
          );
        })}
        <line
          className="f-axis"
          x1={barX}
          x2={barX}
          y1={barTop - 6}
          y2={barTop + bars.length * 34 - 12}
        />
        <text className="f-note" x={barX} y={H - 12}>
          The Veil is {t.vsV2} times the version 2 statite, which could not have stayed in place.
        </text>
      </Art>
    </Frame>
  );
}

export const veilGeometry: FigureDef<Props> = {
  id: "veil-geometry",
  title: "Where the Veil sits, and how big it must be",
  file: "figures/src/veil-geometry.tsx",
  build: ({ r }) => {
    const v = (id: string) => r.get(id).value;
    const km = { show: "km" };
    const bar = (id: string, label: string, sub: string, tone: string) => ({
      id,
      label,
      sub,
      tone,
      value: v(id),
      text: show(r, id, { sig: 2 }),
    });
    return {
      l1OverVeil: v("venus-l1-distance") / v("veil-distance"),
      veilOverVenus: v("veil-radius") / v("venus-radius"),
      bars: [
        bar(
          "veil-area",
          "Hesperus Veil",
          `at its station, ${show(r, "veil-distance", { sig: 3, show: "km" })} out`,
          "accent",
        ),
        bar("veil-l1-area", "A shade at L1", "for comparison only", "muted"),
        bar(
          "veil-v2-area",
          "Version 2 statite",
          `${show(r, "veil-v2-distance")} out; would fall onto Venus`,
          "muted",
        ),
        bar("venus-disk", "Venus's disk", "for scale", "hot"),
      ],
      text: {
        sun: show(r, "sun-radius", km),
        venus: show(r, "venus-radius", km),
        orbit: show(r, "venus-orbit", { show: "km", sig: 3 }),
        veilDistance: show(r, "veil-distance", { sig: 3, show: "km" }),
        l1Distance: show(r, "venus-l1-distance", { sig: 3, show: "km" }),
        beyond: show(r, "veil-beyond-l1"),
        radius: show(r, "veil-radius", km),
        margin: show(r, "veil-penumbra-margin"),
        beta: show(r, "veil-beta"),
        area: show(r, "veil-area"),
        vsV2: show(r, "veil-area-vs-v2"),
      },
    };
  },
  caption: (p) =>
    `Light pressure moves the Veil's balance point ${p.text.beyond} sunward of L1, to ${p.text.veilDistance} from Venus. To hide the whole Sun from every point on Venus it must reach ${p.text.margin} beyond Venus's radius, ${p.text.area} in all.`,
  describe: (p) => ({
    summary: `Schematic, not to scale: the Sun, the Veil ${p.text.veilDistance} sunward of Venus and ${p.text.beyond} beyond L1 (${p.text.l1Distance} from Venus), and Venus. The Veil's umbra, where the whole Sun is hidden, just covers Venus: its radius is Venus's ${p.text.venus} plus ${p.text.margin}, ${p.text.radius} in all. The Sun is ${p.text.orbit} away and ${p.text.sun} in radius.`,
    head: ["Shade", "Area", "Note"],
    rows: p.bars.map((b) => [b.label, b.text, b.sub]),
  }),
  numbers: () => [
    "sun-radius",
    "venus-radius",
    "venus-orbit",
    "veil-distance",
    "venus-l1-distance",
    "veil-beyond-l1",
    "veil-radius",
    "veil-penumbra-margin",
    "veil-beta",
    "veil-area",
    "veil-l1-area",
    "veil-v2-distance",
    "veil-v2-area",
    "veil-area-vs-v2",
    "venus-disk",
  ],
  Component: VeilGeometry,
};
