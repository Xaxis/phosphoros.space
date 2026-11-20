/**
 * Aegis Shield: the coil at the Veil's station and the magnetic bubble it holds in the solar wind,
 * seen along the Sun-Venus line, with the bubble and Venus to scale; under it the coil magnified, its
 * open problem, and the Mini-Aegis test that comes first.
 *
 * The bubble's outline is schematic: the standard magnetopause form r = r₀ √(2 / (1 + cos θ)), with
 * r₀ the model's bubble radius. Only that nose distance and Venus's radius are the model's.
 */
import { fill, refsIn } from "@phosphoros/calc/template";
import { Art, Frame, Link, midSentence, path, show, textWidth, W } from "./kit.tsx";
import { Arrow, AxisBreak, CurvedArrow, Lines, Tag } from "./space-kit.tsx";
import { Diamond } from "./structure-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Step {
  when: string;
  label: string;
  note: string[];
  href?: string;
  kind: "gate" | "milestone" | "on";
}

interface Props {
  /** Venus's radius over the bubble's: the two are drawn to the same scale. */
  venusOverBubble: number;
  steps: Step[];
  /** Numbers the Mini-Aegis experiment's own text refers to. */
  refs: string[];
  text: {
    density: string;
    speed: string;
    pressure: string;
    field: string;
    bubble: string;
    dipole: string;
    vsEarth: string;
    coil: string;
    ampereTurns: string;
    turns: string;
    current: string;
    temp: string;
    distance: string;
    l1: string;
    venus: string;
    online: string;
  };
}

const H = 662;
const Y0 = 200; // the Sun-Venus line
const CX = 200; // the coil
const R0 = 50; // the bubble's nose, from the coil
const TAIL_END = 512;
const BREAK_X = 546;
const VX = 680; // Venus
const DIM = 360; // the distance line
const IN_TOP = 384; // the panels below
const deg = Math.PI / 180;
const TILT = 20 * deg; // the dipole axis, drawn turned from upright

/** The bubble's outline, upper half, from its nose downstream to the end of the drawn tail. */
function outline(): [number, number][] {
  const out: [number, number][] = [];
  for (let th = 0; th < Math.PI; th += 0.5 * deg) {
    const r = R0 * Math.sqrt(2 / (1 + Math.cos(th)));
    const x = CX - r * Math.cos(th);
    if (x > TAIL_END) break;
    out.push([x, Y0 - r * Math.sin(th)]);
  }
  return out;
}

const UPPER = outline();

/** Half the bubble's width at x: zero ahead of the nose. */
function halfWidth(x: number): number {
  let prev: [number, number] | undefined;
  for (const p of UPPER) {
    if (p[0] >= x) {
      if (!prev) return 0;
      const t = (x - prev[0]) / (p[0] - prev[0]);
      return Y0 - (prev[1] + t * (p[1] - prev[1]));
    }
    prev = p;
  }
  return Y0 - (UPPER[UPPER.length - 1]?.[1] ?? Y0);
}

/** A smooth maximum, so a streamline bends round the nose instead of turning a corner. */
const smax = (a: number, b: number, s: number) => (a + b) / 2 + Math.hypot((a - b) / 2, s) - s;

/** One streamline of the solar wind, `h` off the axis far upstream, kept `gap` outside the bubble. */
function streamline(h: number, gap: number, side: 1 | -1): [number, number][] {
  const pts: [number, number][] = [];
  for (let x = 16; x <= BREAK_X - 14; x += 3) {
    pts.push([x, Y0 - side * smax(h, halfWidth(x) + gap, 12)]);
  }
  return pts;
}

/** A dipole field line through distance L on the magnetic equator, on one side of the axis. */
function fieldLine(L: number, side: 1 | -1): [number, number][] {
  const ax = Math.sin(TILT);
  const ay = -Math.cos(TILT);
  const ex = side * Math.cos(TILT);
  const ey = side * Math.sin(TILT);
  const lim = Math.acos(Math.sqrt(6 / L));
  const pts: [number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const lam = -lim + (2 * lim * i) / 60;
    const r = L * Math.cos(lam) ** 2;
    const u = Math.cos(lam);
    const v = Math.sin(lam);
    pts.push([CX + r * (u * ex + v * ax), Y0 + r * (u * ey + v * ay)]);
  }
  return pts;
}

/** An unknown, marked as such: a muted dot with a "?" beside a label and its notes. */
function Question({ x, y, notes }: { x: number; y: number; notes: string[] }) {
  return (
    <g>
      <circle className="f-muted" cx={x} cy={y - 4} r={7} />
      <text
        x={x}
        y={y - 4}
        dy="0.35em"
        textAnchor="middle"
        className="f-surface"
        fontWeight={700}
        fontSize={11}
      >
        ?
      </text>
      <Lines
        x={x + 12}
        y={y}
        halo
        lines={[
          { text: "Open question", kind: "label" },
          ...notes.map((text) => ({ text, kind: "note" as const })),
        ]}
      />
    </g>
  );
}

/** An open problem, marked as on the Braking Ring figure: a danger dot with a "!". */
function Problem({ x, y, notes }: { x: number; y: number; notes: string[] }) {
  return (
    <g>
      <circle className="f-danger" cx={x} cy={y - 4} r={7} />
      <text
        x={x}
        y={y - 4}
        dy="0.35em"
        textAnchor="middle"
        className="f-surface"
        fontWeight={700}
        fontSize={11}
      >
        !
      </text>
      <Lines
        x={x + 12}
        y={y}
        halo
        lines={[
          { text: "Open problem", kind: "label" },
          ...notes.map((text) => ({ text, kind: "note" as const })),
        ]}
      />
    </g>
  );
}

/** Words into lines of at most `max` characters. */
function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && line.length + 1 + word.length > max) {
      out.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out;
}

function AegisShield({ venusOverBubble, steps, text: t }: Props) {
  const lower = UPPER.map(([x, y]): [number, number] => [x, 2 * Y0 - y]);
  const last = UPPER[UPPER.length - 1] ?? [TAIL_END, Y0];
  const bubble = `${path(UPPER)}L${last[0]},${2 * Y0 - last[1]}${path([...lower].reverse()).replace(/^M/, "L")}Z`;
  const winds: [number, number][] = [
    [24, 10],
    [56, 18],
    [92, 26],
    [128, 34],
  ];
  const ax = Math.sin(TILT);
  const ay = -Math.cos(TILT);
  const reach = R0 - 5;
  const turn = (a: number, rr: number): [number, number] => [
    CX + rr * Math.sin(TILT + a),
    Y0 - rr * Math.cos(TILT + a),
  ];
  const rv = R0 * venusOverBubble;
  const station = `Coil beside the Veil, just sunward of L1: ${t.distance} from Venus`;
  const stationBox = {
    x: CX + 4,
    y: DIM - 21,
    w: textWidth(station, 11.5) + 12,
    h: 18,
  };
  // The coil, magnified.
  const KX = 112;
  const KY = IN_TOP + 86;
  const KR = 62;
  const KRy = 21;
  // The timeline.
  const TX = 412;
  const stepY = [IN_TOP + 46, IN_TOP + 128, IN_TOP + 180, IN_TOP + 232];
  return (
    <Frame
      id="aegis-shield"
      title="Aegis Shield: a magnetic bubble against the solar wind"
      desc={`Along the Sun-Venus line, bubble and Venus to scale, distance not. The solar wind, ${t.density} at ${t.speed}, flows round a magnetic bubble whose nose is ${t.bubble} from the coil, where the field of ${t.field} balances the wind's ${t.pressure}. The coil sits beside the Veil, ${t.distance} from Venus. Whether the sheltered region reaches Venus is an open question; holding the coil together against its own field is an open problem.`}
      height={H}
      links
    >
      <Art>
        <Lines
          x={16}
          y={24}
          lines={[
            { text: "Solar wind, from the Sun", kind: "label" },
            { text: `${t.density} at ${t.speed},`, kind: "note" },
            { text: `pushing with ${t.pressure}`, kind: "note" },
          ]}
        />
        <Tag
          x={W - 16}
          y={22}
          anchor="end"
          text="Bubble and Venus to scale; coil and distance not"
        />

        {/* The Sun-Venus line, broken: the true distance is written below. */}
        <line className="f-axis" x1={16} x2={BREAK_X - 8} y1={Y0} y2={Y0} strokeDasharray="2 4" />
        <line
          className="f-axis"
          x1={BREAK_X + 8}
          x2={W - 16}
          y1={Y0}
          y2={Y0}
          strokeDasharray="2 4"
        />
        <AxisBreak x={BREAK_X} y={Y0} />

        {/* The bubble and the shelter behind it. */}
        <path className="f-s1-wash" d={bubble} />
        <path className="f-s1-line" d={path(UPPER)} strokeWidth={1.5} />
        <path className="f-s1-line" d={path(lower)} strokeWidth={1.5} />
        {[18, 30, 42].flatMap((L) =>
          ([1, -1] as const).map((side) => (
            <path
              key={`${L}${side}`}
              className="f-s1-line"
              d={path(fieldLine(L, side))}
              strokeWidth={1}
            />
          )),
        )}

        {/* The wind, bent round the bubble. */}
        {winds.flatMap(([h, gap]) =>
          ([1, -1] as const).map((side) => {
            const s = streamline(h, gap, side);
            const at = (x: number) => s.findIndex(([px]) => px >= x);
            const i = at(64);
            const j = at(BREAK_X - 40);
            const p = s[i];
            const q = s[j];
            return (
              <g key={`${h}${side}`}>
                <path className="f-s2-line" d={path(s)} strokeWidth={1.25} />
                {p && <Arrow x1={p[0] - 8} y1={p[1]} x2={p[0] + 4} y2={p[1]} tone="s2" width={0} />}
                {q && (
                  <Arrow
                    x1={q[0] - 8}
                    y1={(s[j - 3] ?? q)[1]}
                    x2={q[0] + 4}
                    y2={q[1]}
                    tone="s2"
                    width={0}
                  />
                )}
              </g>
            );
          }),
        )}

        {/* The dipole's axis, turned slowly to follow the wind's own field. */}
        <line
          className="f-accent-line"
          x1={CX - ax * reach}
          y1={Y0 - ay * reach}
          x2={CX + ax * reach}
          y2={Y0 + ay * reach}
          strokeWidth={1.25}
          strokeDasharray="3 3"
        />
        <CurvedArrow
          from={turn(-34 * deg, reach + 4)}
          via={turn(-17 * deg, reach + 10)}
          to={turn(-2 * deg, reach + 4)}
          tone="accent"
          head={6}
          width={1.25}
        />
        {/* The coil, edge on: drawn far larger than its true size. */}
        <line
          className="f-accent-line"
          x1={CX - 7 * Math.cos(TILT)}
          y1={Y0 - 7 * Math.sin(TILT)}
          x2={CX + 7 * Math.cos(TILT)}
          y2={Y0 + 7 * Math.sin(TILT)}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Inside the bubble no line crosses a label, so none needs a halo against the wash. */}
        <Lines
          x={272}
          y={Y0 - 56}
          lines={[
            { text: "Magnetic bubble", kind: "label" },
            { text: `nose ${t.bubble} from the coil, where`, kind: "note" },
            { text: `${t.field} balances the wind's push`, kind: "note" },
          ]}
        />
        <line className="f-soft-line" x1={CX + 9} y1={Y0 + 9} x2={266} y2={Y0 + 30} />
        <Lines
          x={272}
          y={Y0 + 36}
          lines={[
            { text: "Aegis coil", kind: "label" },
            { text: "its axis turns slowly to follow", kind: "note" },
            { text: "the wind's own field", kind: "note" },
          ]}
        />
        <Lines
          x={TAIL_END - 10}
          y={Y0 + 82}
          anchor="end"
          lines={[{ text: "sheltered region", kind: "note" }]}
        />

        {/* Venus, to the bubble's scale. */}
        <circle className="f-hot" cx={VX} cy={Y0} r={rv}>
          <title>{`Venus, radius ${t.venus}, to the bubble's scale`}</title>
        </circle>
        <Lines
          x={VX}
          y={Y0 + rv + 20}
          anchor="middle"
          halo
          lines={["Venus", `radius ${t.venus}`]}
        />
        <Question
          x={BREAK_X + 18}
          y={Y0 - 96}
          notes={["does the shelter still cover", "Venus this far downstream?"]}
        />

        {/* The true distance. */}
        <g className="f-soft-line" strokeWidth={1}>
          <line x1={CX} x2={BREAK_X - 8} y1={DIM} y2={DIM} />
          <line x1={BREAK_X + 8} x2={VX} y1={DIM} y2={DIM} />
          <line x1={CX} x2={CX} y1={DIM - 4} y2={DIM + 4} />
          <line x1={VX} x2={VX} y1={DIM - 4} y2={DIM + 4} />
        </g>
        <AxisBreak x={BREAK_X} y={DIM} />
      </Art>
      <Link href="/technologies/veil" label={`${station}, ${t.l1} past L1`} box={stationBox}>
        <text className="f-note f-num" x={CX + 10} y={DIM - 8}>
          {station}
        </text>
      </Link>
      <Art>
        {/* The coil, magnified. */}
        <rect className="f-axis" x={16} y={IN_TOP} width={360} height={H - 12 - IN_TOP} rx={8} />
        <text className="f-title" x={28} y={IN_TOP + 24}>
          The coil, magnified
        </text>
        <text className="f-note" x={28} y={IN_TOP + 39}>
          not to scale
        </text>
        <rect className="f-soft" x={30} y={KY - 34} width={5} height={68} rx={2} />
        <text className="f-note" x={28} y={KY + 50}>
          sunshield
        </text>
        <ellipse className="f-accent-line" cx={KX} cy={KY} rx={KR} ry={KRy} strokeWidth={5} />
        {/* The current's direction round the loop. */}
        <Arrow x1={KX - 8} y1={KY + KRy} x2={KX + 7} y2={KY + KRy} tone="ink" width={0} head={8} />
        <Arrow x1={KX + 8} y1={KY - KRy} x2={KX - 7} y2={KY - KRy} tone="ink" width={0} head={8} />
        <line className="f-soft-line" x1={KX} x2={KX + KR} y1={KY} y2={KY} />
        <line className="f-soft-line" x1={KX} x2={KX} y1={KY - 4} y2={KY + 4} />
        <Lines
          x={KX + KR / 2}
          y={KY - 6}
          anchor="middle"
          halo
          lines={[{ text: `radius ${t.coil}`, kind: "note" }]}
        />
        <Lines
          x={196}
          y={IN_TOP + 60}
          lines={[
            { text: `${t.turns} turns`, kind: "label" },
            { text: `of ${t.current} each,`, kind: "note" },
            { text: `${t.ampereTurns} in all.`, kind: "note" },
            { text: `Cable at ${t.temp}, kept`, kind: "label" },
            { text: "cold behind its sunshield;", kind: "note" },
            { text: "the current persists, so it", kind: "note" },
            { text: "needs almost no power.", kind: "note" },
          ]}
        />
        <text x={28} y={IN_TOP + 168}>
          Dipole {t.dipole}, {t.vsEarth} of Earth's
        </text>
        <Problem
          x={36}
          y={IN_TOP + 196}
          notes={[
            "its own field pushes its windings apart, and",
            "the structure to hold them would outweigh",
            "all the Foundry builds; a far wider loop",
            "would need much less",
          ]}
        />

        {/* Proved small first, then switched on. */}
        <text className="f-title" x={TX - 16} y={IN_TOP + 24}>
          Proved small, then switched on
        </text>
        <line
          className="f-axis"
          x1={TX}
          x2={TX}
          y1={(stepY[0] ?? 0) + 8}
          y2={(stepY[3] ?? 0) - 8}
        />
        {steps.map((s, k) => {
          const y = stepY[k] ?? 0;
          return s.kind === "gate" ? (
            <Diamond key={s.label} x={TX} y={y} r={7} tone="accent" hollow />
          ) : (
            <Diamond key={s.label} x={TX} y={y} r={6} tone={s.kind === "on" ? "accent" : "ink"} />
          );
        })}
      </Art>
      {steps.map((s, k) => {
        const y = (stepY[k] ?? 0) + 4;
        const lines = [
          { text: `${s.when}: ${s.label}`, kind: "label" as const },
          ...s.note.map((text) => ({ text, kind: "note" as const })),
        ];
        const body = <Lines x={TX + 16} y={y} lines={lines} />;
        if (!s.href) return <Art key={s.label}>{body}</Art>;
        const w = Math.max(...lines.map((l, i) => textWidth(l.text, i ? 11.5 : 13)));
        return (
          <Link
            key={s.label}
            href={s.href}
            label={[`${s.when}: ${s.label}`, ...s.note].join(" ")}
            box={{ x: TX + 10, y: y - 15, w: w + 12, h: 21 + 14.5 * s.note.length }}
          >
            {body}
          </Link>
        );
      })}
    </Frame>
  );
}

export const aegisShield: FigureDef<Props> = {
  id: "aegis-shield",
  title: "How the Aegis Shield turns the solar wind aside",
  file: "figures/src/aegis-shield.tsx",
  build: ({ r, content }) => {
    const v = (id: string) => r.get(id).value;
    const mini = content.experiments.experiments.find((e) => e.id === "mini-aegis");
    if (!mini) throw new Error("figures: no mini-aegis in experiments.yaml");
    const text = (s: string) => fill(s, (id) => r.get(id));
    const steps: Step[] = [
      {
        when: show(r, "experiments-end", { date: "month" }),
        label: `${mini.name} must pass`,
        note: [
          ...wrap(`At ${text(mini.where)}: ${midSentence(text(mini.pass))}.`, 46),
          `Kill signal: ${midSentence(text(mini.kill))}.`,
        ],
        href: "/research#mini-aegis",
        kind: "gate",
      },
      {
        when: show(r, "veil-close", { date: "month" }),
        label: "the Veil closes",
        note: ["the coil is built at its station"],
        href: "/technologies/veil",
        kind: "milestone",
      },
      {
        when: show(r, "aegis-online", { date: "day" }),
        label: "Aegis on",
        note: ["charged once, the bubble inflates"],
        kind: "on",
      },
      {
        when: show(r, "first-catch", { date: "month" }),
        label: "the first water",
        note: ["arrives already under the shield"],
        href: "/technologies/ice-train",
        kind: "milestone",
      },
    ];
    return {
      venusOverBubble: v("venus-radius") / v("aegis-bubble-radius"),
      steps,
      refs: [mini.where, mini.pass, mini.kill].flatMap(refsIn),
      text: {
        density: show(r, "solar-wind-density"),
        speed: show(r, "solar-wind-speed"),
        pressure: show(r, "solar-wind-pressure"),
        field: show(r, "aegis-field"),
        bubble: show(r, "aegis-bubble-radius"),
        dipole: show(r, "aegis-dipole"),
        vsEarth: show(r, "aegis-vs-earth"),
        coil: show(r, "aegis-coil-radius"),
        ampereTurns: show(r, "aegis-ampere-turns"),
        turns: show(r, "aegis-turns"),
        current: show(r, "aegis-current"),
        temp: show(r, "aegis-coil-temp"),
        distance: show(r, "veil-distance", { sig: 3, show: "km" }),
        l1: show(r, "veil-beyond-l1"),
        venus: show(r, "venus-radius", { show: "km", sig: 4 }),
        online: show(r, "aegis-online", { date: "day" }),
      },
    };
  },
  caption: (p) =>
    `A coil ${p.text.coil} in radius, carrying ${p.text.ampereTurns}, holds the solar wind off ${p.text.bubble} upstream, where its field of ${p.text.field} balances the wind's push, and Venus lies in the shelter behind. Whether that shelter reaches Venus, ${p.text.distance} away, is the main open question, and holding the coil together against its own field is an open problem.`,
  describe: (p) => ({
    summary: `Along the Sun-Venus line, with the bubble and Venus to scale and the distance between them not. The solar wind, ${p.text.density} at ${p.text.speed}, pushes with ${p.text.pressure}. The Aegis coil, beside the Veil just sunward of L1 and ${p.text.distance} from Venus, makes a dipole of ${p.text.dipole}, ${p.text.vsEarth} of Earth's. Its field falls to ${p.text.field} at ${p.text.bubble}, where it balances the wind, so the wind flows round a bubble whose nose is that far upstream, leaving a sheltered region behind it. The dipole's axis turns slowly to follow the wind's own field. Open question: whether the shelter still covers Venus that far downstream. Magnified: a loop ${p.text.coil} in radius of ${p.text.turns} turns carrying ${p.text.current} each, ${p.text.ampereTurns} in all, in cable at ${p.text.temp} behind its own sunshield; the persistent current needs almost no power. Open problem: the coil's field pushes its windings apart, and the structure to hold them would outweigh everything the Foundry builds; a far wider loop would need much less. Before it, ${p.steps.map((s) => `${s.when}: ${s.label} (${s.note.join(" ")})`).join("; ")}.`,
    head: ["Quantity", "Value"],
    rows: [
      ["Solar wind at Venus", `${p.text.density} at ${p.text.speed}`],
      ["Solar wind pressure", p.text.pressure],
      ["Field at the bubble's edge", p.text.field],
      ["Bubble radius, coil to nose", p.text.bubble],
      ["Dipole moment", `${p.text.dipole}, ${p.text.vsEarth} of Earth's`],
      ["Coil radius", p.text.coil],
      ["Current", `${p.text.turns} turns of ${p.text.current}, ${p.text.ampereTurns} in all`],
      ["Cable temperature", p.text.temp],
      ["Coil to Venus", p.text.distance],
      ["Switched on", p.text.online],
    ],
  }),
  numbers: (p) => [
    ...p.refs,
    "solar-wind-density",
    "solar-wind-speed",
    "solar-wind-pressure",
    "aegis-field",
    "aegis-bubble-radius",
    "aegis-dipole",
    "aegis-vs-earth",
    "aegis-coil-radius",
    "aegis-ampere-turns",
    "aegis-turns",
    "aegis-current",
    "aegis-coil-temp",
    "veil-distance",
    "veil-beyond-l1",
    "venus-radius",
    "experiments-end",
    "veil-close",
    "aegis-online",
    "first-catch",
  ],
  Component: AegisShield,
};
