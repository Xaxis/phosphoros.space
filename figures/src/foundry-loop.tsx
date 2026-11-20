/**
 * The Ouroboros Foundry's machine loop: its machine types in a closed ring, each handing what it
 * makes to the next, with the doubling time the loop achieves in the centre.
 */
import { Frame, midSentence, show, W } from "./kit.tsx";
import { Arrow } from "./structure-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Props {
  machines: { name: string; makes: string; feeds: string }[];
  doubling: string;
  doublings: string;
  seed: string;
  final: string;
}

const H = 470;
const C = { x: W / 2, y: 232 };
const R = { x: 214, y: 162 };
const DOT = 7;

/** A point on the ring, `deg` clockwise from the top. */
const on = (deg: number): [number, number] => {
  const t = (deg * Math.PI) / 180;
  return [C.x + R.x * Math.sin(t), C.y - R.y * Math.cos(t)];
};

function FoundryLoop({ machines, doubling, doublings, seed, final }: Props) {
  const n = machines.length;
  const step = 360 / n;
  const clear = DOT + 7;
  // Each arrow follows the ring from one machine to the next, stopping short of both dots.
  const arc = (i: number): [number, number][] => {
    const a = on(i * step);
    const b = on((i + 1) * step);
    const pts: [number, number][] = [];
    for (let d = i * step; d <= (i + 1) * step + 1e-9; d += 0.5) {
      const p = on(d);
      if (
        Math.hypot(p[0] - a[0], p[1] - a[1]) > clear &&
        Math.hypot(p[0] - b[0], p[1] - b[1]) > clear
      )
        pts.push(p);
    }
    return pts;
  };
  return (
    <Frame
      id="foundry-loop"
      title="The Ouroboros Foundry machine loop"
      desc={`${n} machine types in a closed ring, from the Diggers' sorted regolith round to the Assemblers, which build every type. Together they make all ${n} and double every ${doubling}.`}
      height={H}
    >
      {machines.map((_, i) => (
        <Arrow key={`a${i}`} points={arc(i)} flow="mass" />
      ))}
      {machines.map((m, i) => {
        const deg = i * step;
        const [x, y] = on(deg);
        const t = (deg * Math.PI) / 180;
        const ux = Math.sin(t);
        const uy = -Math.cos(t);
        // Labels sit outside the ring: beside the dot at the sides, above or below it at the ends.
        const side = ux > 0.2 ? "start" : ux < -0.2 ? "end" : "middle";
        const lx = x + ux * 14 + (side === "start" ? 2 : side === "end" ? -2 : 0);
        const top = side === "middle" ? (uy < 0 ? y - 30 : y + 24) : y + uy * 16 - 3;
        return (
          <g key={m.name}>
            <title>{`${m.name}: make ${midSentence(m.makes)} for ${midSentence(m.feeds)}.`}</title>
            <circle className="f-accent f-ring" cx={x} cy={y} r={DOT} />
            <text className="f-label" x={lx} y={top} textAnchor={side} fontWeight={600}>
              {m.name}
            </text>
            <text className="f-note" x={lx} y={top + 15} textAnchor={side}>
              {m.makes}
            </text>
          </g>
        );
      })}
      <text className="f-note" x={C.x} y={C.y - 46} textAnchor="middle">
        The loop doubles every
      </text>
      <text className="f-title f-num" x={C.x} y={C.y + 4} textAnchor="middle" fontSize={44}>
        {doubling}
      </text>
      <text className="f-label" x={C.x} y={C.y + 34} textAnchor="middle">
        {n} machine types make all {n}
      </text>
      <text className="f-note f-num" x={C.x} y={C.y + 52} textAnchor="middle">
        {doublings} doublings take the {seed} seed to {final}
      </text>
    </Frame>
  );
}

export const foundryLoop: FigureDef<Props> = {
  id: "foundry-loop",
  title: "The Foundry's machine loop",
  file: "figures/src/foundry-loop.tsx",
  build: ({ r, content }) => {
    const machines = content.technologies.find((t) => t.id === "ouroboros")?.machines;
    if (!machines?.length)
      throw new Error("figures: no machines for ouroboros in technologies.yaml");
    return {
      machines,
      doubling: show(r, "foundry-doubling-days"),
      doublings: show(r, "foundry-doublings"),
      seed: show(r, "foundry-seed-mass"),
      final: show(r, "foundry-final-mass"),
    };
  },
  caption: (p) =>
    `The seed is ${p.machines.length} machine types that together make all ${p.machines.length}, from rock and sunlight alone. Closing that loop is what lets the Foundry double every ${p.doubling}.`,
  describe: (p) => ({
    summary: `${p.machines.length} machine types form a closed loop. Each feeds the next, except that the mass drivers' parts leave for orbit; the Assemblers close the loop by building every type, so the loop copies itself. It doubles every ${p.doubling}, and ${p.doublings} doublings take the ${p.seed} seed to ${p.final}.`,
    head: ["Machine", "Makes", "Feeds"],
    rows: p.machines.map((m) => [m.name, m.makes, m.feeds]),
  }),
  numbers: () => [
    "foundry-doubling-days",
    "foundry-doublings",
    "foundry-seed-mass",
    "foundry-final-mass",
  ],
  Component: FoundryLoop,
};
