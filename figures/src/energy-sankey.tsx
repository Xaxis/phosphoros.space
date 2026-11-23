/**
 * Where the plan's energy comes from and where it goes, from the Lattice's full power to the
 * deadline. Every band's width is a model number, and at every node what flows in equals what flows
 * out. The plan's energy is the Lattice's light: what runs on electricity is charged the light its
 * receivers take.
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
  | "demand"
  | "pump"
  | "launch"
  | "forge"
  | "fans"
  | "warm"
  | "hardware"
  | "spare"
  | "heatLifted"
  | "air"
  | "added"
  | "entry"
  | "light"
  | "efficiency";

type Props = Record<Name, Flow>;

/** Pixels for the sunlight band; every other width follows on the same scale. */
const SUN = 208;
const NW = 8;
const X = { sun: 24, lattice: 118, small: 236, heat: 344, exhaust: 440, sink: 604 };
const LY = 70;

/** A band between two ports, horizontal at both ends. */
function link(x0: number, y0: number, x1: number, y1: number): string {
  const m = (x0 + x1) / 2;
  return `M${x0},${y0}C${m},${y0} ${m},${y1} ${x1},${y1}`;
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

/** The small uses of the Lattice's light, which share one band. */
const SMALL = ["launch", "forge", "fans", "warm", "hardware"] as const;
const SMALL_LABEL: Record<(typeof SMALL)[number], string> = {
  launch: "launching the ice",
  forge: "forging the oxygen",
  fans: "the chimney fans",
  warm: "warming the air",
  hardware: "building the hardware",
};

function EnergySankey(p: Props) {
  const k = SUN / p.sunlight.value;
  const w = (value: number) => Math.max(1, value * k);
  const small = SMALL.reduce((sum, n) => sum + p[n].value, 0);
  const spare = p.supply.value - p.demand.value;

  // The Lattice's ports, from the top: the pumps, the small uses, the spare, the waste heat.
  let at = LY;
  const port = (value: number) => {
    const y = at + w(value) / 2;
    at += w(value);
    return y;
  };
  const out = {
    pump: port(p.pump.value),
    small: port(small),
    spare: port(spare),
    loss: port(p.latticeLoss.value),
  };
  const latticeH = at - LY;
  const lossTop = out.loss - w(p.latticeLoss.value) / 2;
  const lossEnd = X.small + NW;

  // The Exhaust, level with the pumps' band: the pump light and Venus's heat in, light out.
  const EY = LY;
  const exH = w(p.pump.value) + w(p.heatLifted.value);
  const heatIn = EY + w(p.pump.value) + w(p.heatLifted.value) / 2;
  const heatY = LY + 104;
  const spareY = out.spare - w(spare) / 2;
  const listY = LY + latticeH + 30;
  const H = listY + 3 * 15 + 18;
  const smallText = SMALL.map((n) => `${SMALL_LABEL[n]} ${p[n].text}`);

  return (
    <Frame
      id="energy-sankey"
      title="Energy flows of the Phosphoros campaign, from the Lattice's full power to the deadline"
      desc={`Sunlight ${p.sunlight.text} reaches the Lattice, which beams ${p.supply.text} of light. The pumps take ${p.pump.text} of it to lift ${p.heatLifted.text} of Venus's heat, and the Exhaust throws both into space as ${p.light.text} of light. ${p.spare.text} of the light is spare.`}
      height={H}
      links
    >
      <Art>
        <Key x={24} y={14} tone="accent" label="Sunlight and the Lattice's light" />
        <Key x={262} y={14} tone="hot" label="Venus's heat, and light to space" />
        <Key x={520} y={14} tone="muted" label="Waste heat" />

        {/* Sunlight into the Lattice, and the Lattice's own losses. */}
        <Band
          d={`M${X.sun},${LY + w(p.sunlight.value) / 2}H${X.lattice}`}
          w={w(p.sunlight.value)}
          tone="accent"
          opacity={0.4}
          title={`Sunlight on the Lattice's film: ${p.sunlight.text}`}
        />
        <Band
          d={`M${X.lattice + NW},${out.loss}H${lossEnd}`}
          w={w(p.latticeLoss.value)}
          tone="muted"
          title={`Waste heat from the film and the lasers: ${p.latticeLoss.text}`}
        />

        {/* The Lattice's light. */}
        <Band
          d={`M${X.lattice + NW},${out.pump}H${X.exhaust}`}
          w={w(p.pump.value)}
          tone="accent"
          opacity={0.4}
          title={`Light that pumps the Exhaust's tiles: ${p.pump.text}`}
        />
        <Band
          d={`M${X.lattice + NW},${out.small}H${X.small}`}
          w={w(small)}
          tone="accent"
          title={`Light for everything else: ${smallText.join(", ")}`}
        />
        <Band
          d={`M${X.lattice + NW},${out.spare}H${X.small}`}
          w={w(spare)}
          tone="accent"
          title={`Spare light: ${p.spare.text} of what the Lattice beams`}
        />

        {/* Venus's heat and the Exhaust. */}
        <Band
          d={link(X.heat + NW, heatY + w(p.heatLifted.value) / 2, X.exhaust, heatIn)}
          w={w(p.heatLifted.value)}
          tone="hot"
          title={`Heat lifted from Venus's air: ${p.heatLifted.text}`}
        />
        <Band
          d={`M${X.exhaust + NW},${EY + exH / 2}H${X.sink}`}
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
        name={`Helios Lattice: ${p.supply.text} of light beamed`}
      />
      <Node
        x={X.small}
        y={out.small - w(small) / 2}
        h={w(small)}
        name={`Everything else: ${smallText.join(", ")}`}
      />
      <Node
        x={X.small}
        y={spareY}
        h={w(spare)}
        name={`Spare light: ${p.spare.text} of what the Lattice beams`}
      />
      <Node
        x={X.heat}
        y={heatY}
        h={w(p.heatLifted.value)}
        name={`Venus's heat: ${p.heatLifted.text}`}
      />
      <Node
        x={X.exhaust}
        y={EY}
        h={exH}
        tech="exhaust"
        name={`Photonic Exhaust: ${p.light.text}`}
      />
      <Node x={X.sink} y={EY} h={exH} name={`Light to space: ${p.light.text}`} />

      {/* Labels. */}
      <Art>
        <Lines
          x={X.sun}
          y={LY - 26}
          lines={[
            ["Helios Lattice", "f-label"],
            [`${p.supply.text} of light beamed, ${p.efficiency.text} of the sunlight`, "f-num"],
          ]}
        />
        <Lines
          inside
          x={X.sun + 8}
          y={LY + 90}
          lines={[
            ["Sunlight", "f-label"],
            [p.sunlight.text, "f-label f-num"],
          ]}
        />
        <Lines
          inside
          x={X.lattice + NW + 10}
          y={lossTop + 60}
          lines={[
            ["Waste heat", "f-label"],
            ["film and lasers", "f-label"],
            [p.latticeLoss.text, "f-label f-num"],
          ]}
        />
        <Lines
          inside
          x={X.lattice + NW + 10}
          y={out.pump + 5}
          lines={[[`Light for the pumps: ${p.pump.text}`, "f-label f-num"]]}
        />
        <Lines
          x={X.small + NW + 6}
          y={spareY + w(spare) / 2 + 4}
          lines={[
            ["Spare", "f-label"],
            [p.spare.text, "f-num"],
          ]}
        />
        <Lines
          x={X.heat + NW + 6}
          y={heatY + 16}
          lines={[
            ["Venus's heat", "f-label"],
            [p.heatLifted.text, "f-num"],
            [`The air's own ${p.air.text}, plus ${p.added.text}`],
            ["that enters while the pumps run: the Bricks'"],
            [`fall (${p.entry.text}), the crust, the receivers,`],
            ["the fans, the Forges and the Veil's leak"],
          ]}
        />
        <Lines
          x={X.exhaust + NW / 2}
          y={EY - 8}
          anchor="middle"
          lines={[["Photonic Exhaust", "f-label"]]}
        />
        <Lines
          x={X.sink + NW + 6}
          y={EY + exH / 2 - 4}
          lines={[
            ["Light to space", "f-label"],
            [p.light.text, "f-num"],
          ]}
        />
        <Lines
          x={X.sun}
          y={listY}
          lines={[
            ["The thin band is everything else the light runs:", "f-label"],
            [`${smallText.slice(0, 3).join(", ")},`],
            [`${smallText.slice(3).join(", ")}`],
          ]}
        />
      </Art>
    </Frame>
  );
}

const IDS: Record<Name, string> = {
  sunlight: "helios-sunlight-energy",
  latticeLoss: "helios-loss-energy",
  supply: "helios-supply",
  demand: "budget-demand",
  pump: "traj-pump-energy",
  launch: "ice-launch-light",
  forge: "forge-light",
  fans: "traj-fan-energy",
  warm: "traj-warm-energy",
  hardware: "hardware-energy",
  spare: "budget-spare",
  heatLifted: "traj-heat-lifted",
  air: "atmosphere-heat",
  added: "traj-heat-added",
  entry: "ice-entry-heat",
  light: "traj-exhaust-light",
  efficiency: "helios-efficiency",
};

function build(r: Registry): Props {
  return Object.fromEntries(
    Object.entries(IDS).map(([name, id]) => [
      name,
      { id, value: r.get(id).value, text: show(r, id) },
    ]),
  ) as Props;
}

export const energySankey: FigureDef<Props> = {
  id: "energy-sankey",
  title: "Where the energy goes",
  file: "figures/src/energy-sankey.tsx",
  build: ({ r }) => build(r),
  caption: (p) =>
    `Of ${p.sunlight.text} of sunlight on its film, the Lattice beams ${p.supply.text} of light, ${p.efficiency.text}. Nearly all the light the plan uses pumps the Exhaust's tiles, which throw Venus's heat and that light into space; launching the ice, forging the oxygen and running the fans take a sliver. ${p.spare.text} of the light is spare.`,
  describe: (p) => ({
    summary:
      "Energy from the Lattice's full power to the deadline, counted as the light the Lattice beams. At every node the flows in equal the flows out; a flow too small to see is drawn one pixel wide.",
    head: ["From", "To", "Energy"],
    rows: [
      ["The Sun", "Helios Lattice", p.sunlight.text],
      ["Helios Lattice", "Waste heat (film and lasers)", p.latticeLoss.text],
      ["Helios Lattice", "Photonic Exhaust (pump light)", p.pump.text],
      ["Helios Lattice", "Ceres Railheads (launching the ice)", p.launch.text],
      ["Helios Lattice", "Forging the oxygen", p.forge.text],
      ["Helios Lattice", "The chimney fans", p.fans.text],
      ["Helios Lattice", "Warming the air and melting the ice", p.warm.text],
      ["Helios Lattice", "Building the hardware", p.hardware.text],
      ["Helios Lattice", "Spare", `${p.spare.text} of ${p.supply.text}`],
      ["Venus's air", "Photonic Exhaust (heat lifted)", p.heatLifted.text],
      ["Photonic Exhaust", "Light to space", p.light.text],
    ],
  }),
  numbers: () => Object.values(IDS),
  Component: EnergySankey,
};
