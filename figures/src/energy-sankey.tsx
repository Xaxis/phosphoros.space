/**
 * Where the plan's energy comes from and where it goes, over the campaign to the deadline. Every
 * band's width is a model number, and at every node what flows in equals what flows out.
 */
import type { Registry } from "@phosphoros/calc/registry";
import { Halo, TechLink } from "./charts-kit.tsx";
import { Art, Frame, Key, show } from "./kit.tsx";
import type { FigureDef } from "./types.ts";

interface Flow {
  id: string;
  value: number;
  text: string;
}

type Name =
  | "sunlight"
  | "latticeLoss"
  | "supply"
  | "latticeLaunch"
  | "ringLaunch"
  | "launch"
  | "pump"
  | "warm"
  | "forge"
  | "hardware"
  | "latticeSpare"
  | "motion"
  | "railheadLoss"
  | "gain"
  | "caught"
  | "recovered"
  | "ringLoss"
  | "ringSurplus"
  | "heatLifted"
  | "light"
  | "spareShare"
  | "efficiency";

type Props = Record<Name, Flow>;

/** Pixels for the sunlight band; every other width follows on the same scale. */
const SUN = 208;
const NW = 8;
const X = { sun: 24, lattice: 118, rail: 300, source: 400, ring: 480, sink: 604 };

/** A band between two ports, horizontal at both ends. */
function link(x0: number, y0: number, x1: number, y1: number): string {
  const m = (x0 + x1) / 2;
  return `M${x0},${y0}C${m},${y0} ${m},${y1} ${x1},${y1}`;
}

/** A band that runs level to x, then bends to its port. */
function levelThen(x0: number, y0: number, x: number, x1: number, y1: number): string {
  return `M${x0},${y0}H${x}${link(x, y0, x1, y1).replace(/^M[^C]*/, "")}`;
}

/** A loss that leaves a node and turns down, ending flat. */
function drop(x0: number, y: number, w: number, end: number): string {
  const r = w / 2 + 6;
  return `M${x0},${y}H${x0 + 2}Q${x0 + 2 + r},${y} ${x0 + 2 + r},${y + r}V${end}`;
}

function Band({
  d,
  w,
  tone,
  title,
  opacity,
}: {
  d: string;
  w: number;
  tone: string;
  title: string;
  /** A band that carries its own label is lighter, so the label reads on it in both themes. */
  opacity?: number;
}) {
  return (
    <path
      className={`f-${tone}-line`}
      d={d}
      strokeWidth={w}
      strokeOpacity={opacity ?? (tone === "muted" ? 0.4 : 0.55)}
    >
      <title>{title}</title>
    </path>
  );
}

function Node({
  x,
  y,
  h,
  tech,
  name,
}: {
  x: number;
  y: number;
  h: number;
  tech?: string;
  name: string;
}) {
  return (
    <TechLink tech={tech} label={name} box={{ x: x - 4, y: y - 4, w: NW + 8, h: h + 8 }}>
      <rect className="f-ink" x={x} y={y} width={NW} height={h} rx={1.5}>
        <title>{name}</title>
      </rect>
    </TechLink>
  );
}

/** Lines of text with halos, one under the other. */
function Lines({
  x,
  y,
  lines,
  anchor,
  inside,
}: {
  x: number;
  y: number;
  lines: [string, string?][];
  anchor?: "start" | "middle" | "end";
  /** Text set inside a band needs no halo. */
  inside?: boolean;
}) {
  return (
    <g>
      {lines.map(([text, cls], i) =>
        inside ? (
          <text key={i} className={cls ?? "f-note"} x={x} y={y + i * 15} textAnchor={anchor}>
            {text}
          </text>
        ) : (
          <Halo key={i} className={cls ?? "f-note"} x={x} y={y + i * 15} anchor={anchor}>
            {text}
          </Halo>
        ),
      )}
    </g>
  );
}

function EnergySankey(p: Props) {
  const k = SUN / p.sunlight.value;
  const w = (f: Flow) => Math.max(1, f.value * k);
  const other = { ...p.warm, value: p.warm.value + p.forge.value + p.hardware.value };

  // The chain: Railheads and Ring side by side; the Ring pays for the Railheads over the top. It
  // does so by swapping customers (its power runs Venus, the Lattice's beams stay on Ceres).
  const CY = 104;
  const railIn = {
    loop: CY + w(p.ringLaunch) / 2,
    lattice: CY + w(p.ringLaunch) + w(p.latticeLaunch) / 2,
  };
  const railOut = { motion: CY + w(p.motion) / 2, loss: CY + w(p.motion) + w(p.railheadLoss) / 2 };
  const railH = Math.max(w(p.ringLaunch) + w(p.latticeLaunch), w(p.motion) + w(p.railheadLoss));
  const ringIn = { motion: CY + w(p.motion) / 2, gain: CY + w(p.motion) + w(p.gain) / 2 };
  const ringOut = {
    loop: CY + w(p.ringLaunch) / 2,
    surplus: CY + w(p.ringLaunch) + w(p.ringSurplus) / 2,
    loss: CY + w(p.ringLaunch) + w(p.ringSurplus) + w(p.ringLoss) / 2,
  };
  const ringH = Math.max(
    w(p.motion) + w(p.gain),
    w(p.ringLaunch) + w(p.ringSurplus) + w(p.ringLoss),
  );
  const loopY = CY - 48;
  const lw = w(p.ringLaunch);
  const r = lw / 2 + 10;
  const right = X.ring + NW + 6;
  const left = X.rail - 6;
  const loop = [
    `M${X.ring + NW},${ringOut.loop}H${right}`,
    `Q${right + r},${ringOut.loop} ${right + r},${ringOut.loop - r}V${loopY + r}`,
    `Q${right + r},${loopY} ${right},${loopY}H${left}`,
    `Q${left - r},${loopY} ${left - r},${loopY + r}V${railIn.loop - r}`,
    `Q${left - r},${railIn.loop} ${left},${railIn.loop}H${X.rail}`,
  ].join("");
  const railDrop = CY + railH + 40;
  const ringDrop = CY + ringH + 36;
  const gainY = railDrop + 22;

  // The Lattice, below: its uses leave from the top, its losses from the bottom.
  const LY = gainY + w(p.gain) + 54;
  let at = LY;
  const port = (f: Flow) => {
    const y = at + w(f) / 2;
    at += w(f);
    return y;
  };
  const out = {
    launch: port(p.latticeLaunch),
    spare: port(p.latticeSpare),
    pump: port(p.pump),
    loss: port(p.latticeLoss),
    other: port(other),
  };
  const latticeH = at - LY;
  const lossTop = out.loss - w(p.latticeLoss) / 2;
  const lossEnd = X.lattice + NW + 132;

  // The Exhaust: the pump work and Venus's heat in, light out.
  const EY = out.spare + 52;
  const exH = w(p.pump) + w(p.heatLifted);
  const exIn = { pump: EY + w(p.pump) / 2, heat: EY + w(p.pump) + w(p.heatLifted) / 2 };
  const heatY = EY + exH + 26;
  const H = LY + latticeH + 42;

  return (
    <Frame
      id="energy-sankey"
      title="Energy flows of the Phosphoros campaign, to the deadline"
      desc={`Sunlight ${p.sunlight.text} reaches the Lattice; it delivers ${p.supply.text}. The Ring recovers ${p.recovered.text} from the falling ice and pays for the Railheads. The Exhaust throws ${p.light.text} into space as light.`}
      height={H}
      links
    >
      <Art>
        <Key x={24} y={14} tone="accent" label="Sunlight and electricity" />
        <Key x={202} y={14} tone="s1" label="Motion of the ice" />
        <Key x={336} y={14} tone="hot" label="Venus's heat, and light to space" />
        <Key x={576} y={14} tone="muted" label="Waste heat" />

        {/* Sunlight into the Lattice, and the Lattice's own losses. */}
        <Band
          d={`M${X.sun},${LY + w(p.sunlight) / 2}H${X.lattice}`}
          w={w(p.sunlight)}
          tone="accent"
          opacity={0.4}
          title={`Sunlight on the Lattice's film: ${p.sunlight.text}`}
        />
        <Band
          d={`M${X.lattice + NW},${out.loss}H${lossEnd}`}
          w={w(p.latticeLoss)}
          tone="muted"
          title={`Waste heat from the film, lasers and receivers: ${p.latticeLoss.text}`}
        />
        <Band
          d={`M${X.lattice + NW},${out.other}H${lossEnd + 14}`}
          w={w(other)}
          tone="accent"
          title={`Warming ${p.warm.text}, oxygen ${p.forge.text}, hardware ${p.hardware.text}`}
        />

        {/* The Lattice's electricity. */}
        <Band
          d={link(X.lattice + NW, out.launch, X.rail, railIn.lattice)}
          w={w(p.latticeLaunch)}
          tone="accent"
          title={`Lattice to the Railheads, before the first catch: ${p.latticeLaunch.text}`}
        />
        <Band
          d={`M${X.lattice + NW},${out.spare}H${X.sink}`}
          w={w(p.latticeSpare)}
          tone="accent"
          title={`Lattice energy left over: ${p.latticeSpare.text}`}
        />
        <Band
          d={levelThen(X.lattice + NW, out.pump, lossEnd + 10, X.ring, exIn.pump)}
          w={w(p.pump)}
          tone="accent"
          title={`Heat-pump work: ${p.pump.text}`}
        />

        {/* Railheads, the ice's fall, the Ring and its loop back. */}
        <Band
          d={loop}
          w={lw}
          tone="accent"
          title={`The Ring pays for the launches: ${p.ringLaunch.text}`}
        />
        <Band
          d={link(X.rail + NW, railOut.motion, X.ring, ringIn.motion)}
          w={w(p.motion)}
          tone="s1"
          title={`Motion the Railheads give the ice: ${p.motion.text}`}
        />
        <Band
          d={drop(X.rail + NW, railOut.loss, w(p.railheadLoss), railDrop)}
          w={w(p.railheadLoss)}
          tone="muted"
          title={`Waste heat at the Railheads: ${p.railheadLoss.text}`}
        />
        <Band
          d={link(X.source + NW, gainY + w(p.gain) / 2, X.ring, ringIn.gain)}
          w={w(p.gain)}
          tone="s1"
          title={`Energy gravity adds to the falling ice: ${p.gain.text}`}
        />
        <Band
          d={`M${X.ring + NW},${ringOut.surplus}H${X.sink}`}
          w={w(p.ringSurplus)}
          tone="accent"
          title={`Ring energy left over: ${p.ringSurplus.text}`}
        />
        <Band
          d={drop(X.ring + NW, ringOut.loss, w(p.ringLoss), ringDrop)}
          w={w(p.ringLoss)}
          tone="muted"
          title={`Waste heat at the Ring: ${p.ringLoss.text}`}
        />

        {/* Venus's heat and the Exhaust. */}
        <Band
          d={link(X.source + NW, heatY + w(p.heatLifted) / 2, X.ring, exIn.heat)}
          w={w(p.heatLifted)}
          tone="hot"
          title={`Heat lifted from Venus's air: ${p.heatLifted.text}`}
        />
        <Band
          d={`M${X.ring + NW},${EY + exH / 2}H${X.sink}`}
          w={exH}
          tone="hot"
          title={`Light thrown into space: ${p.light.text}`}
        />
      </Art>

      {/* Nodes. */}
      <Node
        x={X.lattice}
        y={LY}
        h={latticeH}
        tech="helios"
        name={`Helios Lattice: ${p.supply.text} delivered`}
      />
      <Node
        x={X.rail}
        y={CY}
        h={railH}
        tech="ice-train"
        name={`Ceres Railheads: ${p.launch.text}`}
      />
      <Node
        x={X.ring}
        y={CY}
        h={ringH}
        tech="ring"
        name={`Braking Ring: ${p.caught.text} caught`}
      />
      <Node x={X.source} y={gainY} h={w(p.gain)} name={`Gravity: ${p.gain.text}`} />
      <Node x={X.ring} y={EY} h={exH} tech="exhaust" name={`Photonic Exhaust: ${p.light.text}`} />
      <Node
        x={X.source}
        y={heatY}
        h={w(p.heatLifted)}
        name={`Venus's heat: ${p.heatLifted.text}`}
      />
      <Node
        x={X.sink}
        y={ringOut.surplus - w(p.ringSurplus) / 2}
        h={w(p.ringSurplus)}
        name="Ring's surplus"
      />
      <Node
        x={X.sink}
        y={out.spare - w(p.latticeSpare) / 2}
        h={w(p.latticeSpare)}
        name="Lattice's spare"
      />
      <Node x={X.sink} y={EY} h={exH} name={`Light to space: ${p.light.text}`} />

      {/* Labels. */}
      <Art>
        <Lines
          x={(X.rail + X.ring + NW) / 2}
          y={loopY - 12}
          anchor="middle"
          lines={[[`The Ring powers the Railheads: ${p.ringLaunch.text}`, "f-num"]]}
        />
        <Lines x={X.rail} y={CY - 10} lines={[["Ceres Railheads", "f-label"]]} />
        <Lines x={X.ring + NW} y={CY - 10} anchor="end" lines={[["Braking Ring", "f-label"]]} />
        <Lines
          x={X.rail + NW + 30}
          y={railDrop - 14}
          lines={[["Waste heat"], [p.railheadLoss.text, "f-num"]]}
        />
        <Lines
          x={X.source - 8}
          y={gainY + 4}
          anchor="end"
          lines={[["Gravity of the Sun", "f-label"], ["and of Venus"], [p.gain.text, "f-num"]]}
        />
        <Lines
          x={X.ring + NW + 20}
          y={ringDrop - 4}
          lines={[["Waste heat"], [p.ringLoss.text, "f-num"]]}
        />
        <Lines
          x={X.sink + NW + 6}
          y={ringOut.surplus - 4}
          lines={[
            ["Ring's surplus", "f-label"],
            [p.ringSurplus.text, "f-num"],
          ]}
        />
        <Lines
          x={X.sink + NW + 6}
          y={out.spare - 4}
          lines={[
            ["Lattice's spare", "f-label"],
            [p.latticeSpare.text, "f-num"],
          ]}
        />
        <Lines
          x={X.ring + NW / 2}
          y={EY - 10}
          anchor="middle"
          lines={[["Photonic Exhaust", "f-label"]]}
        />
        <Lines
          x={X.sink + NW + 6}
          y={EY + 4}
          lines={[
            ["Light to space", "f-label"],
            [p.light.text, "f-num"],
          ]}
        />
        <Lines
          x={X.source - 8}
          y={heatY + 4}
          anchor="end"
          lines={[
            ["Venus's heat", "f-label"],
            [p.heatLifted.text, "f-num"],
          ]}
        />
        <Lines
          x={X.source}
          y={heatY + 26}
          lines={[
            ["The air's own heat, plus heat that leaks in"],
            ["from the crust, the Forges, the falling ice"],
            ["and the sunlight the Veil lets through"],
          ]}
        />
        <Lines
          x={X.sun}
          y={LY - 28}
          lines={[
            ["Helios Lattice", "f-label"],
            [`${p.supply.text} delivered`, "f-num"],
          ]}
        />
        <Lines
          inside
          x={X.sun + 8}
          y={LY + 70}
          lines={[
            ["Sunlight", "f-label"],
            [p.sunlight.text, "f-label f-num"],
          ]}
        />
        <Lines
          inside
          x={X.lattice + NW + 10}
          y={lossTop + 70}
          lines={[
            ["Waste heat", "f-label"],
            ["film, lasers, receivers", "f-label"],
            [p.latticeLoss.text, "f-label f-num"],
          ]}
        />
        <Lines
          x={lossEnd + 20}
          y={out.other + 4}
          lines={[["Warming, oxygen, hardware"], [show3(p), "f-num"]]}
        />
      </Art>
    </Frame>
  );
}

function show3(p: Props): string {
  return `${p.warm.text}, ${p.forge.text}, ${p.hardware.text}`;
}

const IDS: Record<Name, string> = {
  sunlight: "helios-sunlight-energy",
  latticeLoss: "helios-loss-energy",
  supply: "helios-supply",
  latticeLaunch: "budget-lattice-launch",
  ringLaunch: "budget-ring-launch",
  launch: "ice-launch-energy",
  pump: "traj-pump-energy",
  warm: "traj-warm-energy",
  forge: "forge-energy",
  hardware: "hardware-energy",
  latticeSpare: "budget-lattice-spare",
  motion: "ice-launch-motion",
  railheadLoss: "railhead-loss-energy",
  gain: "ice-solar-gain",
  caught: "ring-catch-energy",
  recovered: "ring-recovered-energy",
  ringLoss: "ring-loss-energy",
  ringSurplus: "budget-ring-surplus",
  heatLifted: "traj-heat-lifted",
  light: "traj-exhaust-light",
  spareShare: "budget-spare-total",
  efficiency: "helios-efficiency",
};

function build(r: Registry): Props {
  const flows = Object.fromEntries(
    Object.entries(IDS).map(([name, id]) => [
      name,
      { id, value: r.get(id).value, text: show(r, id) },
    ]),
  ) as Props;
  return flows;
}

export const energySankey: FigureDef<Props> = {
  id: "energy-sankey",
  title: "Where the energy goes",
  file: "figures/src/energy-sankey.tsx",
  build: ({ r }) => build(r),
  caption: (p) =>
    `Of ${p.sunlight.text} of sunlight on its film, the Lattice delivers ${p.supply.text}, ${p.efficiency.text}. The Braking Ring recovers ${p.recovered.text} from the falling ice, mostly energy gravity gave it, and pays the Railheads back. The Exhaust throws Venus's heat and its own work into space as light. The two spares come to ${p.spareShare.text} of all supply.`,
  describe: (p) => ({
    summary:
      "Energy over the campaign, to the deadline. At every node the flows in equal the flows out; a flow too small to see is drawn one pixel wide.",
    head: ["From", "To", "Energy"],
    rows: [
      ["The Sun", "Helios Lattice", p.sunlight.text],
      ["Helios Lattice", "Waste heat (film, lasers, receivers)", p.latticeLoss.text],
      ["Helios Lattice", "Ceres Railheads, until the first catch", p.latticeLaunch.text],
      ["Helios Lattice", "Photonic Exhaust (heat-pump work)", p.pump.text],
      ["Helios Lattice", "Warming the air and melting the last ice", p.warm.text],
      ["Helios Lattice", "Forging the oxygen", p.forge.text],
      ["Helios Lattice", "Building the hardware", p.hardware.text],
      ["Helios Lattice", "Spare", p.latticeSpare.text],
      ["Braking Ring", "Ceres Railheads, after the first catch", p.ringLaunch.text],
      ["Ceres Railheads", "Motion of the ice", p.motion.text],
      ["Ceres Railheads", "Waste heat", p.railheadLoss.text],
      ["Gravity of the Sun and Venus", "Motion of the ice", p.gain.text],
      ["Motion of the ice", "Braking Ring", p.caught.text],
      ["Braking Ring", "Waste heat", p.ringLoss.text],
      ["Braking Ring", "Spare", p.ringSurplus.text],
      ["Venus's air", "Photonic Exhaust (heat lifted)", p.heatLifted.text],
      ["Photonic Exhaust", "Light to space", p.light.text],
    ],
  }),
  numbers: () => Object.values(IDS),
  Component: EnergySankey,
};
