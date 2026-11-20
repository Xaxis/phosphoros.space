/**
 * The heat path, as a vertical cross-section with a true altitude scale up to 80 km: hot air drawn
 * through a Thermal Chimney's exchangers, sealed liquid loops lifting the heat, the Exhaust canopy
 * throwing it to space as infrared light, and the Braking Ring 400 km up feeding power down its
 * tethers. A magnified inset shows the basin floor after 2036: sealed dry ice and basal heat pipes.
 */
import { Art, Frame, Link, show, textWidth, W } from "./kit.tsx";
import { Arrow, AxisBreak, Lines, Tag } from "./space-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Props {
  /** Kilometres. */
  canopy: number;
  base: number;
  cloudBase: number;
  cloudTop: number;
  text: {
    canopy: string;
    base: string;
    cloudBase: string;
    cloudTop: string;
    surface: string;
    flow: string;
    cooling: string;
    chimney: string;
    width: string;
    cone: string;
    wavelength: string;
    out: string;
    ring: string;
    beam: string;
    fins: string;
    floor: string;
    armour: string;
    aerogel: string;
    membrane: string;
    pipes: string;
    ice: string;
    iceT: string;
    cooling2: string;
  };
}

const H = 650;
const AX = 58; // altitude axis
const Y0 = 604; // ground, 0 km
const KM = 5.3; // pixels per km below the break: the altitudes are to scale
const TOP_KM = 80;
const Y_RING = 78;
const alt = (km: number) => Y0 - km * KM;
const BREAK = alt(TOP_KM) - 26;

// Horizontal layout (not to scale).
const CH = 300; // chimney centre
const CW = 22; // chimney drawn width
const CAN0 = 186;
const CAN1 = 440;
const BASIN = "cold air pools, then CO₂ seas, then sealed dry ice";

function HeatPath(p: Props) {
  const t = p.text;
  const yCan = alt(p.canopy);
  const yBase = alt(p.base);
  const loops = 8;
  const loopH = (yBase - yCan - 8) / loops;
  const basin0 = 470;
  const basinFloor = Y0 + 11;
  // Inset: the basin floor after 2036, magnified.
  const IX = 486;
  const IY = 290;
  const IW = W - 16 - IX;
  const IH = 262;
  const iCap = IY + 98;
  const iIce = iCap + 16;
  const iRock = IY + IH - 74;
  const RX = IX + IW - 50; // the riser and radiator
  const beam = `${t.beam} at the receivers`;
  const fins = `receiver loss heat shed at ${t.fins}`;
  const canopy = `Photonic Exhaust canopy at ${t.canopy}, ${t.width} across`;
  const chimney = `Thermal Chimney, ${t.base} to ${t.canopy}: ${t.chimney} each`;
  const basinW = Math.max(textWidth("Lowland basin"), textWidth(BASIN, 11.5));
  const basinBox = { x: W - 26 - basinW, y: H - 35, w: basinW + 12, h: 32 };
  return (
    <Frame
      id="heat-path"
      title="Venus's heat path, in cross-section"
      desc={`Altitude to scale up to ${TOP_KM} km. Fans pull ${t.surface} air through a chimney's exchangers; sealed liquid loops lift the heat to the Exhaust canopy at ${t.canopy}, which throws it to space as infrared light. The Braking Ring, ${t.ring} up, takes the Lattice's beam and sends power down tethers. After 2036, heat pipes carry the floor heat up through the sealed dry ice.`}
      height={H}
      links
    >
      <Art>
        {/* The altitude axis, broken between 80 km and the Ring. */}
        <line className="f-axis" x1={AX} x2={AX} y1={Y0} y2={alt(TOP_KM)} />
        <line className="f-axis" x1={AX} x2={AX} y1={Y_RING - 18} y2={BREAK - 10} />
        <AxisBreak x={AX} y={BREAK + 4} />
        {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((km) => (
          <g key={km}>
            <line className="f-axis" x1={AX - 4} x2={AX} y1={alt(km)} y2={alt(km)} />
            <text className="f-tick" x={AX - 8} y={alt(km)} dy="0.32em" textAnchor="end">
              {km} km
            </text>
          </g>
        ))}
        <line className="f-axis" x1={AX - 4} x2={AX} y1={Y_RING} y2={Y_RING} />
        <text className="f-tick" x={AX - 8} y={Y_RING} dy="0.32em" textAnchor="end">
          {t.ring}
        </text>
        <Tag x={W - 16} y={22} anchor="end" text="Altitudes to scale up to 80 km; widths not" />

        {/* Clouds. */}
        <rect
          className="f-muted-wash"
          x={AX + 1}
          y={alt(p.cloudTop)}
          width={W - 16 - AX - 1}
          height={alt(p.cloudBase) - alt(p.cloudTop)}
        />
        <text className="f-note" x={AX + 8} y={alt(p.cloudBase) - 8}>
          Sulfuric-acid clouds, {t.cloudBase} to {t.cloudTop}
        </text>

        {/* Ground and hot rock; the lowland basin to the right. */}
        <path
          className="f-hot-wash"
          d={`M${AX + 1},${Y0}H${basin0}L${basin0 + 30},${basinFloor}H${W - 16}V${H - 8}H${AX + 1}Z`}
        />
        <path
          className="f-ink-line"
          d={`M${AX + 1},${Y0}H${basin0}L${basin0 + 30},${basinFloor}H${W - 16}`}
          strokeWidth={1.5}
        />
        <rect
          className="f-cool"
          x={basin0 + 22}
          y={Y0}
          width={W - 16 - basin0 - 22}
          height={basinFloor - Y0}
        />
        <text className="f-note" x={AX + 8} y={H - 16}>
          Hot rock under {t.surface} air
        </text>
      </Art>
      <Link href="/technologies/cryo" label={`Lowland basin: ${BASIN}`} box={basinBox}>
        <text className="f-label" x={W - 20} y={H - 24} textAnchor="end">
          Lowland basin
        </text>
        <text className="f-note" x={W - 20} y={H - 10} textAnchor="end">
          {BASIN}
        </text>
      </Link>
      <Art>
        {/* The Ring, the Lattice's beam and the power coming down. */}
        <path
          className="f-s4-wash"
          d={`M${AX + 12},${18}L${AX + 52},${18}L${AX + 132},${Y_RING - 7}L${AX + 92},${Y_RING - 7}Z`}
        />
        <g className="f-s4-line" strokeWidth={1}>
          <line x1={AX + 12} y1={18} x2={AX + 92} y2={Y_RING - 7} />
          <line x1={AX + 52} y1={18} x2={AX + 132} y2={Y_RING - 7} />
        </g>
      </Art>
      <Link
        href="/technologies/helios"
        label={`Helios Lattice beam in: ${beam}`}
        box={{
          x: AX + 52,
          y: 24 - 15,
          w: Math.max(textWidth("Helios Lattice beam in"), textWidth(beam, 11.5)) + 12,
          h: 14.5 + 21,
        }}
      >
        <Lines x={AX + 58} y={24} halo lines={["Helios Lattice beam in", beam]} />
      </Link>
      {/* The Ring and its name are one link: lit, an accent bar barely changes, so the name is boxed. */}
      <Link
        href="/technologies/ring"
        label={`Braking Ring, ${t.ring} up: ${fins}`}
        box={{
          x: AX + 230,
          y: Y_RING - 45,
          w: Math.max(textWidth("Braking Ring"), textWidth(fins, 11.5)) + 12,
          h: 14.5 + 21,
        }}
      >
        <rect
          className="f-accent f-node"
          x={AX + 4}
          y={Y_RING - 5}
          width={CAN1 - AX - 30}
          height={10}
          rx={5}
        >
          <title>{`Braking Ring, ${t.ring} up`}</title>
        </rect>
        <Lines x={AX + 236} y={Y_RING - 30} lines={["Braking Ring", fins]} />
      </Link>
      <Art>
        <rect className="f-ink" x={AX + 88} y={Y_RING - 9} width={48} height={4} rx={1} />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            className="f-s2-line"
            d={`M${AX + 176 + i * 16},${Y_RING - 10}q4,-5 0,-10q-4,-5 0,-10`}
            strokeWidth={1.5}
            fill="none"
          />
        ))}
        {[CAN0 + 30, CAN0 + 70].map((x) => (
          <line
            key={x}
            className="f-ink-line"
            x1={x}
            x2={x}
            y1={Y_RING + 5}
            y2={yCan - 6}
            strokeWidth={1.5}
          />
        ))}
        <Lines
          x={CAN0 + 78}
          y={Y_RING + 40}
          lines={[
            { text: "Power down the tethers", kind: "label" },
            { text: "superconducting cables to the canopies", kind: "note" },
          ]}
        />

        {/* Infrared beams to space, in cones. */}
        {[CAN1 - 130, CAN1 - 80, CAN1 - 30].map((x) => (
          <g key={x}>
            <path
              className="f-s2-wash"
              d={`M${x},${yCan - 8}L${x - 18},${alt(TOP_KM) + 4}L${x + 18},${alt(TOP_KM) + 4}Z`}
            />
            <Arrow
              x1={x}
              y1={yCan - 9}
              x2={x}
              y2={alt(TOP_KM) + 2}
              tone="s2"
              head={7}
              width={1.5}
            />
          </g>
        ))}
        <Lines
          x={CAN1 + 14}
          y={alt(76)}
          lines={[
            "Infrared to space",
            `${t.wavelength}, in ${t.cone} cones`,
            `${t.out} per canopy`,
            "passes the Veil untouched",
          ]}
        />
      </Art>
      {/* The canopy. */}
      <Link href="/technologies/exhaust" label={canopy}>
        <path
          className="f-soft f-node"
          d={`M${CAN0},${yCan}L${CAN0 + 12},${yCan - 7}H${CAN1 - 12}L${CAN1},${yCan}L${CAN1 - 12},${yCan + 7}H${CAN0 + 12}Z`}
        >
          <title>{canopy}</title>
        </path>
      </Link>
      <Art>
        <line
          className="f-s2-line"
          x1={CAN0 + 14}
          x2={CAN1 - 14}
          y1={yCan - 8}
          y2={yCan - 8}
          strokeWidth={2}
        />
        <Lines
          x={CAN0 - 10}
          y={yCan - 18}
          anchor="end"
          halo
          lines={[
            "Exhaust canopy",
            `${t.canopy} up, ${t.width} across`,
            "tiles pump heat into light",
          ]}
        />
      </Art>
      {/* The chimney, its liquid loops and the intake. */}
      <Link href="/technologies/chimneys" label={chimney}>
        <rect
          className="f-muted-wash f-node"
          x={CH - CW / 2}
          y={yCan + 7}
          width={CW}
          height={yBase - yCan - 7}
        >
          <title>{chimney}</title>
        </rect>
        <rect
          className="f-muted-line"
          x={CH - CW / 2}
          y={yCan + 7}
          width={CW}
          height={yBase - yCan - 7}
          strokeWidth={1}
        />
      </Link>
      <Art>
        {Array.from({ length: loops }, (_, i) => {
          const y1 = yBase - 4 - i * loopH;
          const y0 = y1 - loopH + 6;
          return (
            <g key={i}>
              <line
                className="f-hot-line"
                x1={CH - 5}
                x2={CH - 5}
                y1={y1}
                y2={y0}
                strokeWidth={2}
              />
              <line
                className="f-cool-line"
                x1={CH + 5}
                x2={CH + 5}
                y1={y0}
                y2={y1}
                strokeWidth={2}
              />
              <path className="f-hot" d={`M${CH - 5},${y0 + 8}l-3,5h6z`} />
            </g>
          );
        })}
        <Lines
          x={CH - CW / 2 - 12}
          y={alt(40)}
          anchor="end"
          halo
          lines={[
            "Thermal Chimney",
            "sealed liquid loops",
            "lift the heat, stage",
            "by stage: hot legs up, cool down",
            `${t.chimney} per chimney`,
          ]}
        />
        {/* Hot air drawn in by fans at the base; cooled air drains to the basin. */}
        <Arrow x1={CH - 78} y1={yBase - 14} x2={CH - CW / 2 - 3} y2={yBase - 14} tone="hot" />
        <Arrow x1={CH + 72} y1={yBase - 28} x2={CH + CW / 2 + 3} y2={yBase - 28} tone="hot" />
        <Arrow x1={CH + CW / 2} y1={Y0 - 3} x2={basin0 + 40} y2={Y0 - 3} tone="cool" width={2} />
        <Lines
          x={CH - 84}
          y={yBase - 72}
          anchor="end"
          halo
          lines={[
            "Fans pull hot air",
            `through exchangers at ${t.flow}`,
            `it leaves ${t.cooling2} cooler`,
          ]}
        />
        <Lines
          x={CH + 36}
          y={Y0 - 10}
          halo
          lines={[{ text: "cooled air drains to the basin", kind: "note" }]}
        />

        {/* Inset: the basin floor after 2036. */}
        <line className="f-axis" x1={IX + 70} x2={IX + 70} y1={IY + IH} y2={Y0 + 4} />
        <rect className="f-surface" x={IX} y={IY} width={IW} height={IH} rx={8} />
      </Art>
      <Link
        href="/technologies/cryo"
        label="Basin floor, from 2036"
        box={{ x: IX + 6, y: IY + 5, w: textWidth("Basin floor, from 2036") + 12, h: 21 }}
      >
        <text className="f-title" x={IX + 12} y={IY + 20}>
          Basin floor, from 2036
        </text>
      </Link>
      <Art>
        <text className="f-note" x={IX + 12} y={IY + 35}>
          magnified, not to scale
        </text>
        {/* Radiator and tiles on the cap, beaming the floor heat away. */}
        <Arrow x1={RX} y1={iCap - 16} x2={RX} y2={IY + 46} tone="s2" />
        <text className="f-note" x={RX - 8} y={IY + 54} textAnchor="end">
          to space
        </text>
        <rect className="f-soft" x={RX - 28} y={iCap - 12} width={56} height={6} rx={2} />
        <line
          className="f-s2-line"
          x1={RX - 26}
          x2={RX + 26}
          y1={iCap - 14}
          y2={iCap - 14}
          strokeWidth={2}
        />
        <Lines
          x={IX + 12}
          y={iCap - 34}
          lines={[
            { text: `Cap: ${t.armour} basalt, ${t.aerogel}`, kind: "note" },
            { text: `aerogel, ${t.membrane} membrane`, kind: "note" },
          ]}
        />
        {/* Cap layers: armour, aerogel, membrane. */}
        <rect className="f-muted" x={IX + 1} y={iCap - 4} width={IW - 2} height={4} />
        <rect className="f-cool-wash" x={IX + 1} y={iCap} width={IW - 2} height={iIce - iCap - 2} />
        <line
          className="f-ink-line"
          x1={IX + 1}
          x2={IX + IW - 1}
          y1={iIce - 1}
          y2={iIce - 1}
          strokeWidth={1.5}
        />
        {/* Dry ice. */}
        <rect className="f-cool" x={IX + 1} y={iIce} width={IW - 2} height={iRock - iIce} />
        <rect className="f-surface" x={IX + 12} y={iIce + 20} width={112} height={36} rx={4} />
        <Lines x={IX + 20} y={iIce + 35} lines={["Dry ice", `${t.ice} thick, ${t.iceT}`]} />
        {/* Riser up through the ice; heat pipes down into the rock. */}
        <path
          className="f-hot-wash"
          d={`M${IX + 1},${iRock}H${IX + IW - 1}V${IY + IH - 8}a7,7 0 0 1 -7,7H${IX + 8}a7,7 0 0 1 -7,-7Z`}
        />
        <line className="f-hot-line" x1={RX} x2={RX} y1={iCap - 6} y2={iRock + 2} strokeWidth={3} />
        {[RX - 36, RX, RX + 36].map((x) => (
          <line
            key={x}
            className="f-hot-line"
            x1={x}
            x2={x}
            y1={iRock + 2}
            y2={IY + IH - 10}
            strokeWidth={2}
          />
        ))}
        <line
          className="f-hot-line"
          x1={RX - 36}
          x2={RX + 36}
          y1={iRock + 2}
          y2={iRock + 2}
          strokeWidth={2}
        />
        <Lines
          x={IX + 12}
          y={iRock + 22}
          lines={[
            { text: `Heat pipes, ${t.pipes} deep`, kind: "label" },
            { text: `lift ${t.floor} at first,`, kind: "note" },
            { text: "up a riser to the cap", kind: "note" },
          ]}
        />
        <rect className="f-axis" x={IX} y={IY} width={IW} height={IH} rx={8} />
      </Art>
    </Frame>
  );
}

export const heatPath: FigureDef<Props> = {
  id: "heat-path",
  title: "How Venus's heat gets out",
  file: "figures/src/heat-path.tsx",
  build: ({ r }) => {
    const v = (id: string) => r.get(id).value;
    const km = 1000;
    return {
      canopy: v("chimney-top") / km,
      base: v("chimney-base") / km,
      cloudBase: v("venus-cloud-base") / km,
      cloudTop: v("venus-cloud-top") / km,
      text: {
        canopy: show(r, "chimney-top"),
        base: show(r, "chimney-base"),
        cloudBase: show(r, "venus-cloud-base"),
        cloudTop: show(r, "venus-cloud-top"),
        surface: show(r, "venus-surface-temp"),
        flow: show(r, "chimney-flow-speed"),
        cooling: show(r, "chimney-gas-cooling"),
        cooling2: show(r, "chimney-gas-cooling"),
        chimney: show(r, "chimney-heat", { sig: 2 }),
        width: show(r, "canopy-width", { sig: 2 }),
        cone: show(r, "exhaust-cone"),
        wavelength: show(r, "exhaust-wavelength", { sig: 2 }),
        out: show(r, "canopy-power-out", { sig: 2 }),
        ring: show(r, "ring-altitude"),
        beam: show(r, "helios-receiver-intensity"),
        fins: show(r, "helios-fin-temp"),
        floor: show(r, "cryo-floor-load"),
        armour: show(r, "cryo-armour-thickness"),
        aerogel: show(r, "cryo-aerogel-thickness"),
        membrane: show(r, "cryo-membrane-thickness"),
        pipes: show(r, "heat-pipe-depth"),
        ice: show(r, "cryo-thickness"),
        iceT: show(r, "cryo-ice-temp"),
      },
    };
  },
  caption: (p) =>
    `Heat leaves the deep air through a chimney's exchangers and climbs in sealed liquid loops, because rising gas would cool by expanding; the canopy at ${p.text.canopy} pumps it into infrared light and throws it to space, on power the Ring sends down from ${p.text.ring}. After 2036, heat pipes keep the floor heat out of the sealed dry ice.`,
  describe: (p) => ({
    summary: `A vertical cross-section, altitudes to scale up to 80 km. A Thermal Chimney rises from ${p.text.base} to ${p.text.canopy}. Fans at its base pull ${p.text.surface} air through heat exchangers at ${p.text.flow}, cooling it by ${p.text.cooling}; the cooled air drains into a lowland basin. Sealed liquid loops, stage by stage, lift ${p.text.chimney} per chimney to the Exhaust canopy, ${p.text.width} across, whose tiles fire ${p.text.wavelength} light into ${p.text.cone} cones, ${p.text.out} per canopy. The clouds lie between ${p.text.cloudBase} and ${p.text.cloudTop}. The Braking Ring at ${p.text.ring} takes the Lattice's beam at ${p.text.beam}, sheds its receiver loss heat at ${p.text.fins}, and sends power down tethers to the canopies. In the basin, after 2036, dry ice ${p.text.ice} thick at ${p.text.iceT} lies under a cap of ${p.text.armour} of basalt, ${p.text.aerogel} of aerogel and a ${p.text.membrane} membrane; heat pipes ${p.text.pipes} into the floor carry ${p.text.floor} at first up a riser to radiators on the cap.`,
    head: ["Element", "Where", "What it does"],
    rows: [
      [
        "Thermal Chimney",
        `${p.text.base} to ${p.text.canopy}`,
        `lifts ${p.text.chimney} in sealed liquid loops`,
      ],
      [
        "Intake fans and exchangers",
        `from ${p.text.base}`,
        `cool ${p.text.surface} air by ${p.text.cooling}`,
      ],
      ["Exhaust canopy", p.text.canopy, `throws ${p.text.out} to space at ${p.text.wavelength}`],
      ["Clouds", `${p.text.cloudBase} to ${p.text.cloudTop}`, "sulfuric acid"],
      ["Braking Ring", p.text.ring, `takes the Lattice beam at ${p.text.beam}; power down tethers`],
      [
        "Basal heat pipes",
        `${p.text.pipes} into the basin floor`,
        `carry ${p.text.floor} at first`,
      ],
    ],
  }),
  numbers: () => [
    "chimney-top",
    "chimney-base",
    "venus-cloud-base",
    "venus-cloud-top",
    "venus-surface-temp",
    "chimney-flow-speed",
    "chimney-gas-cooling",
    "chimney-heat",
    "canopy-width",
    "exhaust-cone",
    "exhaust-wavelength",
    "canopy-power-out",
    "ring-altitude",
    "helios-receiver-intensity",
    "helios-fin-temp",
    "cryo-floor-load",
    "cryo-armour-thickness",
    "cryo-aerogel-thickness",
    "cryo-membrane-thickness",
    "heat-pipe-depth",
    "cryo-thickness",
    "cryo-ice-temp",
  ],
  Component: HeatPath,
};
