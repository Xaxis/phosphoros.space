/**
 * Braking Ring: Venus and the Ring seen from the north, with the Bricks' approach paths computed from
 * their arrival speed and Venus's gravity (to scale), and a side view along the Ring of a catch, the
 * parking belt and a tether lift (heights to scale, lengths not).
 */
import { Art, Frame, Key, Link, path, show, textWidth, W } from "./kit.tsx";
import { Arrow, Dot, Lines, Tag } from "./space-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Props {
  /** Kilometres. */
  venusR: number;
  ringR: number;
  /** The approach hyperbola: eccentricity and semi-latus rectum (km). */
  e: number;
  p: number;
  /** Heights in km for the side view. */
  ringAlt: number;
  release: number;
  cloudTop: number;
  text: {
    alt: string;
    radius: string;
    vinf: string;
    arrive: string;
    orbital: string;
    rotor: string;
    track: string;
    g: string;
    lifts: string;
    interval: string;
    release: string;
    overload: string;
    net: string;
    netOverload: string;
    fall: string;
    cloudTop: string;
  };
}

const H = 560;
const deg = Math.PI / 180;
// Top view: Venus to scale.
const CX = 240;
const CY = 262;
const RPX = 96;
// Side view.
const SX = 498;
const SR = W - 16;
const ALT_TOP = 450; // km at the top of the side view
const Y_TOP = 70;
const Y_GROUND = 492;

/** An open problem, marked as such: a danger dot with a "!" beside a label and its notes. */
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

function BrakingRing(p: Props) {
  const t = p.text;
  const k = RPX / p.venusR;
  const ringPx = p.ringR * k;
  // Periapsis of the eastbound stream, measured anticlockwise from the +x axis; the westbound stream
  // is its mirror image. Bricks come from below (behind Venus) moving up.
  const nuInf = Math.acos(-1 / p.e);
  const omega = nuInf - Math.PI / 2;
  const stream = (side: 1 | -1) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const nu = -nuInf * 0.985 + (nuInf * 0.985 * i) / 160;
      const r = (p.p / (1 + p.e * Math.cos(nu))) * k;
      const th = omega + nu;
      const x = CX + side * r * Math.cos(th);
      const y = CY - r * Math.sin(th);
      if (y < H + 40) pts.push([x, y]);
    }
    return pts;
  };
  const east = stream(1);
  const west = stream(-1);
  const catchAt = (side: 1 | -1): [number, number] => [
    CX + side * ringPx * Math.cos(omega),
    CY - ringPx * Math.sin(omega),
  ];
  const [ex, ey] = catchAt(1);
  const [wx, wy] = catchAt(-1);
  // Catcher tracks, drawn longer than scale so they can be seen.
  const track = (side: 1 | -1) => {
    const a0 = omega;
    const a1 = omega + 9 * deg;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const a = a0 + ((a1 - a0) * i) / 12;
      pts.push([CX + side * (ringPx + 0) * Math.cos(a), CY - ringPx * Math.sin(a)]);
    }
    return path(pts);
  };
  // Braking pushes each track the way its Brick was going.
  const push = (side: 1 | -1) => {
    const [x, y] = catchAt(side);
    const dx = -Math.sin(omega) * side;
    const dy = -Math.cos(omega);
    // Drawn just outside the Ring, so the arrow does not sit on the track.
    const ox = side * Math.cos(omega) * 14;
    const oy = -Math.sin(omega) * 14;
    return { x: x + ox, y: y + oy, x2: x + ox + dx * 40, y2: y + oy + dy * 40 };
  };
  const pe = push(1);
  const pw = push(-1);
  const belt = ringPx + 7;

  // Side view.
  const alt = (km: number) => Y_GROUND - (km / ALT_TOP) * (Y_GROUND - Y_TOP);
  const yRing = alt(p.ringAlt);
  const yRelease = alt(p.release);
  const yBelt = yRing - 16;
  const trackX0 = SX + 44;
  const trackX1 = SX + 128;
  const liftX = SX + 186;
  const brick = (x: number, y: number, key: string) => (
    <rect key={key} className="f-s1 f-ring" x={x - 5} y={y - 5} width={10} height={10} rx={2} />
  );
  const ringName = `Braking Ring: ${t.alt} up, ${t.radius} from Venus's centre`;
  const nameLines = ["Braking Ring", `${t.alt} up; dotted: parking belt`];
  const nameY = CY + ringPx + 26;
  const nameW = Math.max(textWidth(nameLines[0] ?? ""), textWidth(nameLines[1] ?? "", 11.5));
  const nameBox = { x: CX - nameW / 2 - 6, y: nameY - 15, w: nameW + 12, h: 14.5 + 21 };
  const sideName = `The Ring at ${t.alt}: a rotor at ${t.rotor} inside a stator that stands still`;
  const rotor = `rotor ${t.rotor} inside a still stator`;
  const rotorBox = { x: SX - 16, y: yRing + 7, w: textWidth(rotor, 11.5) + 12, h: 19 };
  return (
    <Frame
      id="braking-ring"
      title="Braking Ring: catching the Ice Train"
      desc={`Left, to scale, seen from the north: Venus and the Ring ${t.alt} up. Bricks come from behind Venus at ${t.vinf}, half aimed past each side, and Venus's gravity bends them onto the Ring's height at ${t.arrive}, eastbound on one side, westbound on the other. Right, a side view along the Ring: a catch, the parking belt and a tether lift.`}
      height={H}
      links
    >
      <Art>
        {/* Top view. */}
        <text className="f-title" x={16} y={28}>
          Seen from the north
        </text>
        <Tag x={16} y={50} text="To scale; tracks and belt enlarged" />
        <circle className="f-hot-wash" cx={CX} cy={CY} r={RPX} />
        <circle className="f-hot-line" cx={CX} cy={CY} r={RPX} strokeWidth={1.5} />
        <text className="f-label" x={CX} y={CY - 4} textAnchor="middle">
          Venus
        </text>
        <text className="f-note" x={CX} y={CY + 12} textAnchor="middle">
          turns slowly westward
        </text>
        <circle
          className="f-soft-line"
          cx={CX}
          cy={CY}
          r={belt}
          strokeWidth={1}
          strokeDasharray="1 3"
        />
      </Art>
      {/* The streams pass wide of the Ring's name, so it is drawn here, in the link. */}
      <Link href="/technologies/ring" label={ringName} box={nameBox}>
        <circle className="f-accent-line f-node" cx={CX} cy={CY} r={ringPx} strokeWidth={2.5}>
          <title>{ringName}</title>
        </circle>
        <Lines x={CX} y={nameY} anchor="middle" halo lines={nameLines} />
      </Link>
      <Art>
        <path className="f-s1-line f-mark-line" d={path(east)}>
          <title>{`Eastbound Bricks: ${t.vinf} far out, ${t.arrive} at the Ring`}</title>
        </path>
        <path className="f-s1-line f-mark-line" d={path(west)}>
          <title>{`Westbound Bricks: ${t.vinf} far out, ${t.arrive} at the Ring`}</title>
        </path>
        <path className="f-ink-line" d={track(1)} strokeWidth={6} strokeLinecap="round" />
        <path className="f-ink-line" d={track(-1)} strokeWidth={6} strokeLinecap="round" />
        <Arrow x1={pe.x} y1={pe.y} x2={pe.x2} y2={pe.y2} tone="ink" width={1.5} />
        <Arrow x1={pw.x} y1={pw.y} x2={pw.x2} y2={pw.y2} tone="ink" width={1.5} />
        <Dot x={ex} y={ey} tone="s1" title={`Eastbound catch at ${t.arrive}`} />
        <Dot x={wx} y={wy} tone="s1" title={`Westbound catch at ${t.arrive}`} />
        <Lines
          x={pe.x2 + 8}
          y={pe.y2 - 6}
          halo
          lines={["Eastbound catch", `braked to ${t.orbital}`]}
        />
        <Lines
          x={pw.x2 - 8}
          y={pw.y2 - 6}
          anchor="end"
          halo
          lines={["Westbound catch", "the mirror image"]}
        />
        <Lines
          x={CX}
          y={CY - ringPx - 88}
          anchor="middle"
          halo
          lines={[
            { text: "Arrows: each catch pushes its track the way its", kind: "note" },
            { text: "Brick was going. The twists cancel; the pushes add.", kind: "note" },
          ]}
        />
        <Problem
          x={CX - 86}
          y={CY - ringPx - 47}
          notes={["the forward pushes add up to", `${t.netOverload} times the Ring's lift`]}
        />
        {/* The resultant: the twists cancel, so it acts through the centre. */}
        <Arrow
          x1={CX}
          y1={CY - 26}
          x2={CX}
          y2={CY - 82}
          tone="danger"
          width={2}
          head={8}
          title={`Net push on the Ring: ${t.net}, along Venus's orbital motion`}
        />
        <Lines
          x={CX + 8}
          y={CY - 62}
          lines={[
            { text: "net push", kind: "note" },
            { text: t.net, kind: "note" },
          ]}
        />
        <Lines
          x={CX}
          y={CY + ringPx + 68}
          anchor="middle"
          halo
          lines={[
            { text: "Bricks arrive from behind Venus,", kind: "note" },
            { text: `${t.vinf} faster than the planet;`, kind: "note" },
            { text: "its gravity bends them onto", kind: "note" },
            { text: `the Ring's height at ${t.arrive}`, kind: "note" },
          ]}
        />
        <Arrow x1={30} y1={H - 22} x2={30} y2={H - 62} tone="muted" />
        <Lines
          x={40}
          y={H - 52}
          lines={[
            { text: "Venus's", kind: "note" },
            { text: "orbital", kind: "note" },
            { text: "motion", kind: "note" },
          ]}
        />
        <Arrow x1={64} y1={H - 92} x2={22} y2={H - 92} tone="muted" />
        <text className="f-note" x={22} y={H - 102}>
          to the Sun
        </text>
        {[east, west].map((s, n) => {
          // An arrowhead part way up each stream, pointing the way the Bricks go.
          const i = s.findIndex(([, y]) => y < H - 70);
          const a = s[i];
          const b = s[i + 4];
          if (!a || !b) return null;
          return (
            <Arrow key={n} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} tone="s1" head={8} width={0} />
          );
        })}

        {/* Side view along the Ring. */}
        <line className="f-axis" x1={SX - 18} x2={SX - 18} y1={Y_TOP - 6} y2={Y_GROUND} />
        {[0, 100, 200, 300, 400].map((km) => (
          <g key={km}>
            <line className="f-grid" x1={SX - 18} x2={SR} y1={alt(km)} y2={alt(km)} />
            <text className="f-tick" x={SX - 24} y={alt(km)} dy="0.32em" textAnchor="end">
              {km} km
            </text>
          </g>
        ))}
        <text className="f-title" x={SX - 52} y={28}>
          Side view along the Ring
        </text>
        <Tag x={SX - 52} y={50} text="Heights to scale, lengths not" />
        {/* The air and clouds, then the ground. */}
        <rect
          className="f-hot-wash"
          x={SX - 18}
          y={alt(p.cloudTop)}
          width={SR - SX + 18}
          height={Y_GROUND - alt(p.cloudTop)}
        />
        <line
          className="f-ink-line"
          x1={SX - 18}
          x2={SR}
          y1={Y_GROUND}
          y2={Y_GROUND}
          strokeWidth={1.5}
        />
        <text className="f-note" x={SX - 10} y={Y_GROUND - 8}>
          air; clouds up to {t.cloudTop}
        </text>
      </Art>
      {/* The Ring: stator and rotor. */}
      <Link href="/technologies/ring" label={sideName} box={rotorBox}>
        <rect
          className="f-accent f-node"
          x={SX - 18}
          y={yRing - 4}
          width={SR - SX + 18}
          height={8}
          rx={4}
        >
          <title>{sideName}</title>
        </rect>
        <text className="f-note" x={SX - 10} y={yRing + 20}>
          {rotor}
        </text>
      </Link>
      <Art>
        {/* A catch on a track. */}
        <line
          className="f-ink-line"
          x1={trackX0}
          x2={trackX1}
          y1={yRing - 7}
          y2={yRing - 7}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {brick(trackX0 - 22, yRing - 13, "in")}
        <Arrow
          x1={trackX0 - 52}
          y1={yRing - 13}
          x2={trackX0 - 30}
          y2={yRing - 13}
          tone="s1"
          head={6}
        />
        <Lines
          x={trackX0 - 30}
          y={yRing - 46}
          lines={[`in at ${t.arrive}`, `track ${t.track}, ${t.g}`]}
        />
        {/* Off to the parking belt. */}
        <path
          className="f-s1-line"
          d={`M${trackX1},${yRing - 9}C${trackX1 + 14},${yRing - 9} ${trackX1 + 14},${yBelt} ${trackX1 + 30},${yBelt}`}
          strokeWidth={1.5}
        />
        <line
          className="f-soft-line"
          x1={trackX1 + 30}
          x2={SR}
          y1={yBelt}
          y2={yBelt}
          strokeDasharray="1 3"
        />
        {[liftX - 26, liftX + 14, liftX + 46].map((x) => brick(x, yBelt, `belt-${x}`))}
        <text className="f-note" x={SR - 4} y={yBelt - 12} textAnchor="end">
          parking belt
        </text>

        {/* A tether lift lowers a Brick, as designed; the release and the fall. */}
        <line
          className="f-ink-line"
          x1={liftX}
          x2={liftX}
          y1={yRing + 4}
          y2={yRelease}
          strokeWidth={1.5}
        />
        {brick(liftX, alt(240), "lift")}
        <Arrow x1={liftX + 14} y1={alt(300)} x2={liftX + 14} y2={alt(200)} tone="muted" head={6} />
        <line
          className="f-axis"
          x1={liftX - 34}
          x2={liftX + 34}
          y1={yRelease}
          y2={yRelease}
          strokeDasharray="2 3"
        />
        {brick(liftX, yRelease + 8, "release")}
        <Arrow
          x1={liftX}
          y1={yRelease + 18}
          x2={liftX}
          y2={Y_GROUND - 4}
          tone="muted"
          head={6}
          dash="3 3"
        />
        <Lines
          x={liftX - 12}
          y={alt(330)}
          anchor="end"
          lines={[`${t.lifts} tether lifts`, `a Brick every ${t.interval}`, `down to ${t.release}`]}
        />
        <Lines
          x={liftX - 12}
          y={yRelease + 26}
          anchor="end"
          lines={[
            { text: "released, falls", kind: "label" },
            { text: `gaining ${t.fall}`, kind: "note" },
          ]}
        />
        <Problem
          x={liftX - 120}
          y={alt(200)}
          notes={["lowering needs", `${t.overload} times the Ring's lift`]}
        />

        <Key x={SX - 52} y={H - 22} tone="s1" label="Ice Brick" />
        <Key x={SX + 46} y={H - 22} tone="accent" label="Ring" />
        <Key x={SX + 112} y={H - 22} tone="ink" label="Tracks, tethers" />
      </Art>
    </Frame>
  );
}

export const brakingRing: FigureDef<Props> = {
  id: "braking-ring",
  title: "How the Braking Ring catches the ice",
  file: "figures/src/braking-ring.tsx",
  build: ({ r }) => {
    const v = (id: string) => r.get(id).value;
    const rp = v("ring-radius");
    const e = v("ring-approach-eccentricity");
    const km = 1000;
    return {
      venusR: v("venus-radius") / km,
      ringR: rp / km,
      e,
      p: (rp * (1 + e)) / km,
      ringAlt: v("ring-altitude") / km,
      release: v("lowering-release-altitude") / km,
      cloudTop: v("venus-cloud-top") / km,
      text: {
        alt: show(r, "ring-altitude"),
        radius: show(r, "ring-radius"),
        vinf: show(r, "ice-vinf", { sig: 3 }),
        arrive: show(r, "ring-arrival-speed", { sig: 3 }),
        orbital: show(r, "ring-orbital-speed", { sig: 2 }),
        rotor: show(r, "ring-rotor-speed"),
        track: show(r, "ring-track-length", { sig: 2 }),
        g: show(r, "ring-catch-accel"),
        lifts: show(r, "ring-tether-lifts"),
        interval: show(r, "tether-interval", { sig: 2 }),
        release: show(r, "lowering-release-altitude"),
        overload: show(r, "lowering-overload", { sig: 2 }),
        net: show(r, "ring-net-braking-force", { sig: 2 }),
        netOverload: show(r, "ring-net-overload", { sig: 2 }),
        fall: show(r, "fall-energy", { sig: 2 }),
        cloudTop: show(r, "venus-cloud-top"),
      },
    };
  },
  caption: (p) =>
    `Every Brick comes from behind Venus and is bent onto the Ring's height, caught eastbound or westbound at ${p.text.arrive}. The two catches' twists cancel but their forward pushes add to ${p.text.net}, ${p.text.netOverload} times the Ring's lift, and lowering the ice on tethers needs ${p.text.overload} times: both are open problems.`,
  describe: (p) => ({
    summary: `Seen from the north and to scale, the Ring circles Venus ${p.text.alt} up. Bricks arrive from behind Venus ${p.text.vinf} faster than the planet; Venus's gravity bends each stream onto the Ring's height, where catcher tracks ${p.text.track} long brake them at ${p.text.g} from ${p.text.arrive} to ${p.text.orbital} and release them into a parking belt. Each catch pushes its track the way its Brick was going: the twists cancel, but the pushes add to ${p.text.net} forward, ${p.text.netOverload} times the Ring's lift, an open problem. In a side view, ${p.text.lifts} tether lifts were to lower a Brick every ${p.text.interval} to ${p.text.release}, an open problem: it needs ${p.text.overload} times the Ring's lift.`,
    head: ["Quantity", "Value"],
    rows: [
      ["Ring altitude", p.text.alt],
      ["Ring radius from Venus's centre", p.text.radius],
      ["Arrival speed far out", p.text.vinf],
      ["Speed at the Ring", p.text.arrive],
      ["Orbital speed at the Ring", p.text.orbital],
      ["Rotor speed", p.text.rotor],
      ["Catcher track", `${p.text.track} at ${p.text.g}`],
      ["Tether lifts", `${p.text.lifts}, a Brick every ${p.text.interval}`],
      ["Release height", p.text.release],
      ["Energy gained in the fall", p.text.fall],
      ["Net braking push on the Ring", p.text.net],
      ["Net push over the Ring's lift", p.text.netOverload],
      ["Lowering force over the Ring's lift", p.text.overload],
    ],
  }),
  numbers: () => [
    "venus-radius",
    "ring-radius",
    "ring-altitude",
    "ring-approach-eccentricity",
    "ice-vinf",
    "ring-arrival-speed",
    "ring-orbital-speed",
    "ring-rotor-speed",
    "ring-track-length",
    "ring-catch-accel",
    "ring-tether-lifts",
    "tether-interval",
    "lowering-release-altitude",
    "lowering-overload",
    "ring-net-braking-force",
    "ring-net-overload",
    "fall-energy",
    "venus-cloud-top",
  ],
  Component: BrakingRing,
};
