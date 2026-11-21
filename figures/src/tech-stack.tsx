/**
 * The technology stack: every invention in the place it works, the flows between them (the seed,
 * parts, laser power, ice, shade and heat), and the Choir running all of it. Each box links to its
 * technology page.
 */
import type { Place, Technology } from "@phosphoros/calc/content";
import { Art, Frame, show, W } from "./kit.tsx";
import { Arrow, Card, type Flow, FlowKey } from "./structure-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Node {
  id: string;
  name: string;
  job: string;
  place: Place;
  online: string;
  onlineId: string;
  day: number;
}

interface Props {
  nodes: Node[];
  seedLaunch: string;
}

const H = 510;
const NODE_H = 44;
const STEP = 56;
const TOP = 40;

/**
 * Where each place's column sits. Ceres shares the third column with the near-Venus systems. Each
 * column is wide enough for its longest "Online <month> <year>" line.
 */
const COL: Record<Exclude<Place, "everywhere">, { x: number; w: number; label: string }> = {
  earth: { x: 16, w: 104, label: "Earth" },
  mercury: { x: 152, w: 148, label: "Mercury" },
  space: { x: 352, w: 150, label: "Near Venus" },
  ceres: { x: 352, w: 150, label: "Ceres" },
  venus: { x: 554, w: 144, label: "Venus" },
};

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const mid = (b: Box): number => b.y + b.h / 2;

/** Lay the boxes out: by place in columns, by online date down each column. */
function layout(nodes: Node[]): Map<string, Box> {
  const at = new Map<string, Box>();
  const col = (p: Place) => nodes.filter((n) => n.place === p).sort((a, b) => a.day - b.day);
  const put = (id: string, p: Exclude<Place, "everywhere">, y: number) =>
    at.set(id, { x: COL[p].x, y, w: COL[p].w, h: NODE_H });

  // Near Venus first; Ceres sits below it with room for the ice to climb to the Ring.
  const space = col("space");
  space.forEach((n, i) => {
    put(n.id, "space", TOP + i * STEP);
  });
  const ceresTop = TOP + space.length * STEP + 44;
  col("ceres").forEach((n, i) => {
    put(n.id, "ceres", ceresTop + i * STEP);
  });

  // Mercury: the Foundry level with the middle of the near-Venus column, the Lattice level with
  // Ceres, which its beams power.
  const merc = col("mercury");
  const spaceMid = TOP + ((space.length - 1) * STEP) / 2;
  merc.forEach((n, i) => {
    put(n.id, "mercury", i === 0 ? spaceMid : ceresTop + (i - 1) * STEP);
  });

  // Venus: an extra gap after the first box makes room for the heat it hands to the second.
  col("venus").forEach((n, i) => {
    put(n.id, "venus", TOP + i * STEP + (i > 0 ? 12 : 0));
  });
  return at;
}

function TechStack({ nodes, seedLaunch }: Props) {
  const at = layout(nodes);
  const box = (id: string) => at.get(id);
  const choir = nodes.find((n) => n.place === "everywhere");
  const foundry = box("ouroboros");
  const helios = box("helios");
  const ring = box("ring");
  const ice = box("ice-train");
  const veil = box("veil");
  const aegis = box("aegis");
  const chimneys = box("chimneys");
  const exhaust = box("exhaust");
  const venusBoxes = nodes.filter((n) => n.place === "venus").map((n) => box(n.id));
  const venusTop = Math.min(...venusBoxes.map((b) => b?.y ?? TOP)) - 10;
  const venusBottom = Math.max(...venusBoxes.map((b) => (b ? b.y + b.h : TOP))) + 10;
  const wash = { x: COL.venus.x - 10, y: venusTop, w: COL.venus.w + 20, h: venusBottom - venusTop };
  const seed: Box = { x: COL.earth.x, y: foundry?.y ?? TOP, w: COL.earth.w, h: NODE_H };
  const factories: Box = { x: COL.earth.x, y: (ice?.y ?? 0) + 70, w: COL.earth.w, h: NODE_H };
  const bus = (ice ? ice.y + ice.h : 0) + 24;
  const split = COL.mercury.x + COL.mercury.w + 34;
  // The ice climbs to the Ring at the right of the column, clear of the Ceres heading; the Ceres
  // factories come up into the Ice Train at its left.
  const iceX = COL.space.x + COL.space.w - 30;
  const factoriesX = COL.space.x + 40;
  const choirY = Math.max(venusBottom, factories.y + factories.h) + 20;
  const keyY = choirY + 70;

  const arrows: {
    points: [number, number][];
    flow: Flow;
    label?: string;
    lx?: number;
    ly?: number;
    anchor?: "start" | "middle" | "end";
  }[] = [];
  if (foundry) {
    arrows.push({
      points: [
        [seed.x + seed.w, mid(seed)],
        [foundry.x, mid(foundry)],
      ],
      flow: "mass",
      label: "seed",
      lx: (seed.x + seed.w + foundry.x) / 2,
      ly: mid(seed) - 7,
    });
  }
  if (foundry && helios) {
    const x = foundry.x + 30;
    arrows.push({
      points: [
        [x, foundry.y + foundry.h],
        [x, helios.y],
      ],
      flow: "mass",
      label: "builds",
      lx: x + 8,
      ly: (foundry.y + foundry.h + helios.y) / 2 + 4,
      anchor: "start",
    });
  }
  // The Foundry's parts go up its mass drivers to everything built near Venus.
  const builtNear = [veil, aegis, ring].filter((b): b is Box => !!b);
  if (foundry && builtNear.length) {
    const bx = foundry.x + foundry.w + 26;
    const ys = builtNear.map(mid);
    arrows.push({
      points: [
        [foundry.x + foundry.w, mid(foundry)],
        [bx, mid(foundry)],
      ],
      flow: "mass",
    });
    for (const y of ys)
      arrows.push({
        points: [
          [bx, mid(foundry)],
          [bx, y],
          [COL.space.x, y],
        ],
        flow: "mass",
      });
    arrows.push({
      points: [],
      flow: "mass",
      label: "parts",
      lx: bx - 5,
      ly: Math.min(...ys) + 4,
      anchor: "end",
    });
  }
  if (helios && ice) {
    arrows.push({
      points: [
        [helios.x + helios.w, mid(helios)],
        [ice.x, mid(ice)],
      ],
      flow: "power",
    });
    arrows.push({
      points: [
        [split, mid(helios)],
        [split, bus],
        [wash.x, bus],
      ],
      flow: "power",
      label: "laser power",
      lx: (factoriesX + wash.x) / 2,
      ly: bus + 16,
    });
  }
  if (ice && ring)
    arrows.push({
      points: [
        [iceX, ice.y],
        [iceX, ring.y + ring.h],
      ],
      flow: "mass",
      label: "ice",
      lx: iceX + 7,
      ly: (ice.y + ring.y + ring.h) / 2 + 4,
      anchor: "start",
    });
  if (ice)
    arrows.push({
      points: [
        [factories.x + factories.w, mid(factories)],
        [factoriesX, mid(factories)],
        [factoriesX, ice.y + ice.h],
      ],
      flow: "mass",
      label: "first factories",
      lx: COL.mercury.x + COL.mercury.w / 2,
      ly: mid(factories) - 7,
    });
  const toVenus = (b: Box | undefined, label: string, flow: Flow, dy = 0) => {
    if (!b) return;
    arrows.push({
      points: [
        [b.x + b.w, mid(b) + dy],
        [wash.x, mid(b) + dy],
      ],
      flow,
      label,
      lx: (b.x + b.w + wash.x) / 2,
      ly: dy > 0 ? mid(b) + dy + 15 : mid(b) + dy - 7,
    });
  };
  toVenus(veil, "shade", "effect");
  toVenus(aegis, "shield", "effect");
  toVenus(ring, "ice", "mass", -7);
  toVenus(ring, "power", "power", 7);
  if (chimneys && exhaust) {
    const x = chimneys.x + 24;
    arrows.push({
      points: [
        [x, chimneys.y + chimneys.h],
        [x, exhaust.y],
      ],
      flow: "effect",
      label: "heat",
      lx: x + 8,
      ly: (chimneys.y + chimneys.h + exhaust.y) / 2 + 4,
      anchor: "start",
    });
    arrows.push({
      points: [
        [exhaust.x + exhaust.w, mid(exhaust)],
        [W - 6, mid(exhaust)],
      ],
      flow: "effect",
      label: "to space",
      lx: W - 6,
      ly: mid(exhaust) - 7,
      anchor: "end",
    });
  }
  // Where the Ceres factories cross the beam to Venus, the beam breaks so the crossing reads.
  const gap = factoriesX;

  return (
    <Frame
      id="tech-stack"
      title="The Phosphoros technology stack"
      desc="Thirteen inventions in the place each works, from Earth to Mercury, Ceres, near Venus and Venus, with the flows between them. Each box links to its technology page."
      height={H}
      links
    >
      <Art>
        <rect className="f-sunk" x={wash.x} y={wash.y} width={wash.w} height={wash.h} rx={10} />
        {(["earth", "mercury", "space", "venus"] as const).map((p) => (
          <text key={p} className="f-title" x={COL[p].x} y={22}>
            {COL[p].label}
          </text>
        ))}
        {ice && (
          <text className="f-title" x={COL.ceres.x} y={ice.y - 10}>
            {COL.ceres.label}
          </text>
        )}
        {arrows.map((a, i) => (
          <g key={i}>
            {a.points.length > 1 && <Arrow points={a.points} flow={a.flow} />}
            {a.label && (
              <text className="f-note" x={a.lx} y={a.ly} textAnchor={a.anchor ?? "middle"}>
                {a.label}
              </text>
            )}
          </g>
        ))}
        <rect className="f-surface" x={gap - 4} y={bus - 3} width={8} height={6} />
        <line
          className="f-soft-line"
          strokeWidth={1.5}
          x1={gap}
          x2={gap}
          y1={bus - 4}
          y2={bus + 4}
        />
        <Card
          {...seed}
          title={`Seed foundry: launches from Earth in ${seedLaunch}`}
          name="Seed foundry"
          sub={seedLaunch}
        />
        <Card
          {...factories}
          title="The first Ceres factories: the only other hardware that leaves Earth"
          name="First factories"
          sub="for Ceres"
        />
      </Art>
      {nodes
        .filter((n) => n.place !== "everywhere")
        .map((n) => {
          const b = box(n.id);
          if (!b) return null;
          return (
            <Card
              key={n.id}
              {...b}
              href={`/technologies/${n.id}`}
              title={`${n.name}: ${n.job}. Online ${n.online}.`}
              name={n.name}
              sub={`Online ${n.online}`}
            />
          );
        })}
      {choir && (
        <Card
          x={COL.earth.x}
          y={choirY}
          w={W - 2 * COL.earth.x}
          h={NODE_H}
          href={`/technologies/${choir.id}`}
          title={`${choir.name}: ${choir.job}. Online ${choir.online}.`}
          name={choir.name}
          sub={`${choir.job}, on every world. Online ${choir.online}.`}
          fill="sunk"
        />
      )}
      <Art>
        <FlowKey x={COL.earth.x} y={keyY} flow="mass" label="Material" />
        <FlowKey x={COL.earth.x + 120} y={keyY} flow="power" label="Power" />
        <FlowKey x={COL.earth.x + 220} y={keyY} flow="effect" label="Shade, shield and heat" />
        <text className="f-note" x={COL.earth.x} y={keyY + 24} dy="0.32em">
          Dates: when each leaves Earth or comes online. Click a box for its page.
        </text>
      </Art>
    </Frame>
  );
}

export const techStack: FigureDef<Props> = {
  id: "tech-stack",
  title: "The technology stack",
  file: "figures/src/tech-stack.tsx",
  build: ({ r, content }) => {
    const nodes = content.technologies.map((t: Technology) => ({
      id: t.id,
      name: t.name,
      job: t.job,
      place: t.place,
      online: show(r, t.online, { date: "month" }),
      onlineId: t.online,
      day: r.get(t.online).value,
    }));
    return { nodes, seedLaunch: show(r, "foundry-seed-launch", { date: "month" }) };
  },
  caption: () =>
    "The seed foundry and the first Ceres factories leave Earth; the Foundry builds everything else on Mercury, the Lattice's beams power it, and the Choir runs every machine as one system. Each box opens its technology page.",
  describe: (p) => ({
    summary: `Only the seed foundry (launching ${p.seedLaunch}) and the first Ceres factories leave Earth. On Mercury the Ouroboros Foundry builds the Helios Lattice and sends parts to the Veil, the Aegis Shield and the Braking Ring near Venus. The Lattice beams power to the Ceres Ice Train and to Venus. Ice goes from Ceres to the Ring and down to Venus, with the Ring's power. The Veil shades Venus, the Aegis shields it, and the Chimneys lift heat to the Exhaust, which sends it to space. The Choir runs every machine.`,
    head: ["Invention", "Where", "Job", "Online"],
    rows: p.nodes.map((n) => [
      n.name,
      n.place === "space" ? "Near Venus" : n.place[0]?.toUpperCase() + n.place.slice(1),
      n.job,
      n.online,
    ]),
  }),
  numbers: (p) => [...new Set(["foundry-seed-launch", ...p.nodes.map((n) => n.onlineId)])],
  Component: TechStack,
};
