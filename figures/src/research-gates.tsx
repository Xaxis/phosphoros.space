/**
 * The research agenda: the proof experiments of 2027 and 2028, each with its pass mark and kill
 * signal, against the gates that end the proof years and the seed foundry's flight.
 */
import { fill, refsIn } from "@phosphoros/calc/template";
import { Frame, linear, show, W } from "./kit.tsx";
import { YearBands } from "./structure-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Exp {
  id: string;
  name: string;
  where: string;
  proves: string;
  pass: string;
  kill: string;
  href?: string;
  gate: boolean;
  fallback: boolean;
  start: number;
  end: number;
  when: string;
}

interface Marker {
  id: string;
  label: string;
  day: number;
  when: string;
  kind: "gate" | "end" | "event";
}

interface Props {
  exps: Exp[];
  markers: Marker[];
  from: number;
  to: number;
  fallback: string;
  /** Numbers the experiments' own text refers to. */
  refs: string[];
}

const M = { l: 196, r: 16 };
const ROW = 56;
const LABELS = 40;
const STACK = 17;

function ResearchGates({ exps, markers, from, to }: Props) {
  const x = linear([from, to], [M.l, W - M.r]);
  // Marker labels stack from the latest down, each ending at its own line, so no line crosses a
  // label above it.
  const stacked = [...markers].sort((a, b) => b.day - a.day);
  const axisY = LABELS + stacked.length * STACK + 8;
  const rowsTop = axisY + 10;
  const rowsBottom = rowsTop + exps.length * ROW;
  const H = rowsBottom + 64;
  const lineClass = (k: Marker["kind"]) =>
    k === "gate" ? "f-accent-line" : k === "end" ? "f-ink-line" : "f-muted-line";
  return (
    <Frame
      id="research-gates"
      title="The proof experiments and their gates, 2027 and 2028"
      desc={`${exps.length} experiments run in parallel from 2027, each with a pass mark and a kill signal, and must pass by ${markers.find((m) => m.kind === "end")?.when}. The cloud-life gate falls just before.`}
      height={H}
    >
      {/* Key */}
      <rect className="f-s1" x={16} y={12} width={22} height={10} rx={3} />
      <text x={44} y={17} dy="0.32em">
        Proof experiment
      </text>
      <rect className="f-accent" x={168} y={12} width={22} height={10} rx={3} />
      <text x={196} y={17} dy="0.32em">
        Cloud-life survey, the gate on the whole program
      </text>

      <YearBands
        x={x}
        top={axisY + 4}
        bottom={rowsBottom}
        labelY={[axisY, rowsBottom + 18]}
        from={from}
        to={to}
      />
      <line className="f-axis" x1={M.l} x2={W - M.r} y1={rowsBottom} y2={rowsBottom} />

      {exps.map((e, i) => {
        const top = rowsTop + i * ROW;
        const name = (
          <g>
            <title>{`${e.name} (${e.where}), ${e.when}: proves ${e.proves.toLowerCase()}.`}</title>
            <text className="f-label" x={16} y={top + 17} fontWeight={600}>
              {e.name}
            </text>
            <rect
              className={`${e.gate ? "f-accent" : "f-s1"} f-node`}
              x={x(e.start)}
              y={top + 8}
              width={x(e.end) - x(e.start)}
              height={10}
              rx={3}
            />
          </g>
        );
        return (
          <g key={e.id}>
            {i > 0 && <line className="f-grid" x1={16} x2={W - M.r} y1={top} y2={top} />}
            {e.href ? <a href={e.href}>{name}</a> : name}
            <text className="f-note" x={16} y={top + 33}>
              {e.where}
            </text>
            {(e.fallback || e.gate) && (
              <text className="f-note" x={16} y={top + 48} fontStyle="italic">
                {e.gate ? "Stops the whole program" : "No substitute"}
              </text>
            )}
            <text x={M.l} y={top + 34}>
              <tspan className="f-label" fontWeight={600}>
                Pass{" "}
              </tspan>
              {e.pass}
            </text>
            <text x={M.l} y={top + 49}>
              <tspan className="f-label" fontWeight={600}>
                Kill{" "}
              </tspan>
              {e.kill}
            </text>
          </g>
        );
      })}

      {stacked.map((m, i) => {
        const mx = x(m.day);
        const ly = LABELS + i * STACK;
        return (
          <g key={m.id}>
            <title>{`${m.label}: ${m.when}`}</title>
            <line
              className={lineClass(m.kind)}
              strokeWidth={m.kind === "event" ? 1 : 2}
              strokeDasharray={m.kind === "event" ? "3 3" : undefined}
              x1={mx}
              x2={mx}
              y1={ly + 5}
              y2={rowsBottom}
            />
            <text x={mx - 6} y={ly} textAnchor="end">
              <tspan className="f-label">{m.label}</tspan>
              <tspan className="f-note f-num">, {m.when}</tspan>
            </text>
          </g>
        );
      })}

      <text className="f-note" x={16} y={rowsBottom + 44}>
        No substitute: if this line fails, the plan falls back to the multi-century route.
      </text>
    </Frame>
  );
}

export const researchGates: FigureDef<Props> = {
  id: "research-gates",
  title: "The research gates",
  file: "figures/src/research-gates.tsx",
  build: ({ r, content }) => {
    const day = (id: string) => r.get(id).value;
    const date = (id: string) => show(r, id, { date: "day" });
    const text = (s: string) => fill(s, (id) => r.get(id));
    const exps: Exp[] = content.experiments.experiments.map((e) => {
      // The gate experiment is the cloud-life survey, which keeps its own dates; the rest run the
      // whole of the proof years.
      const [s, f] = e.gate ? ["survey-start", "survey-end"] : ["program-start", "experiments-end"];
      return {
        id: e.id,
        name: e.name,
        where: e.where,
        proves: text(e.proves),
        pass: text(e.pass),
        kill: text(e.kill),
        href: e.tech ? `/technologies/${e.tech}` : undefined,
        gate: !!e.gate,
        fallback: !!e.fallback,
        start: day(s),
        end: day(f),
        when: `${date(s)} to ${date(f)}`,
      };
    });
    const marker = (id: string, label: string, kind: Marker["kind"]): Marker => ({
      id,
      label,
      day: day(id),
      when: date(id),
      kind,
    });
    const markers = [
      marker("foundry-seed-launch", "Seed foundry launches", "event"),
      marker("life-gate", "Gate: no native life", "gate"),
      marker("experiments-end", "Every experiment must pass", "end"),
      marker("foundry-landing", "Seed lands on Mercury", "event"),
    ];
    return {
      exps,
      markers,
      from: day("program-start"),
      // A month past the last marker, so the landing has room.
      to: Math.max(...markers.map((m) => m.day)) + 31,
      fallback: content.experiments.fallback,
      refs: content.experiments.experiments.flatMap((e) =>
        [e.proves, e.pass, e.kill].flatMap(refsIn),
      ),
    };
  },
  caption: (p) =>
    `Every experiment has a pass mark and a kill signal, fixed in advance, and all must pass by ${p.markers.find((m) => m.kind === "end")?.when}. The cloud-life gate falls after the seed foundry launches but before it lands, so a sign of life stops the program before the Foundry touches Mercury.`,
  describe: (p) => ({
    summary: `${p.exps.length} experiments run in parallel; the cloud-life survey decides the gate on ${p.markers.find((m) => m.kind === "gate")?.when}. ${p.fallback} ${p.markers.map((m) => `${m.label}: ${m.when}.`).join(" ")}`,
    head: ["Experiment", "Where", "Runs", "Proves", "Pass", "Kill signal"],
    rows: p.exps.map((e) => [
      e.fallback ? `${e.name} (no substitute)` : e.gate ? `${e.name} (gate)` : e.name,
      e.where,
      e.when,
      e.proves,
      e.pass,
      e.kill,
    ]),
  }),
  numbers: (p) => [
    ...p.refs,
    "program-start",
    "experiments-end",
    "survey-start",
    "survey-end",
    "life-gate",
    "foundry-seed-launch",
    "foundry-landing",
  ],
  Component: ResearchGates,
};
