/**
 * Ceres Ice Train orbits, to scale: Venus's orbit, Ceres's before and after the campaign, the
 * Hohmann transfer, the cheapest path between them, and the transfers of the next cheap windows.
 */
import { period } from "@phosphoros/calc/physics";
import { Art, Frame, Key, Link, path, show, textWidth, W } from "./kit.tsx";
import { conic, Dot, Lines, Tag } from "./space-kit.tsx";
import type { FigureDef } from "./types.ts";

interface Props {
  /** Orbits in AU. */
  venus: number;
  ceres: number;
  ceresAphelion: number;
  /** Degrees Venus is behind the arrival point at launch, and Ceres moves between windows. */
  venusLead: number;
  windowStep: number;
  windows: number;
  text: {
    venus: string;
    ceres: string;
    ceresNew: string;
    transfer: string;
    flights: string;
    launch: string;
    vinf: string;
    vinfMean: string;
    windowPeriod: string;
    windows: string;
    start: string;
    end: string;
    recoil: string;
    realAphelion: string;
  };
}

const H = 560;
const AU = 78; // pixels per AU: the orbits are to scale
const CX = 296;
const CY = 282;
const deg = Math.PI / 180;
const pt = (r: number, a: number): [number, number] => [
  CX + r * AU * Math.cos(a * deg),
  CY - r * AU * Math.sin(a * deg),
];

function IceOrbits(p: Props) {
  const t = p.text;
  const transferA = (p.ceres + p.venus) / 2;
  const transferE = (p.ceres - p.venus) / (p.ceres + p.venus);
  const newA = (p.ceres + p.ceresAphelion) / 2;
  const newE = (p.ceresAphelion - p.ceres) / (p.ceresAphelion + p.ceres);
  // The transfer: perihelion at Venus (180°), so aphelion at Ceres (0°); the Brick goes from
  // aphelion round the upper half, anticlockwise, to perihelion.
  const arc = (w: number) =>
    conic(CX, CY, transferA * AU, transferE, (180 + w) * deg, Math.PI, 2 * Math.PI, 120);
  const transfer = (w: number) => path(arc(w));
  const later = Array.from(
    { length: Math.max(0, Math.ceil(p.windows) - 2) },
    (_, i) => (i + 1) * p.windowStep,
  );
  const [lx, ly] = pt(p.ceres, 0);
  const [ax, ay] = pt(p.venus, 180);
  const [vx, vy] = pt(p.venus, 180 - p.venusLead);
  const [nx, ny] = pt(p.ceresAphelion, 180);
  const px = W - 220;
  const fall = `Hohmann transfer: ${t.transfer} from Ceres to Venus`;
  const fallLines = ["Bricks fall", `for ${t.transfer}`];
  const [fx, fy] = pt(2.1, 62);
  const fallW = Math.max(textWidth(fallLines[0] ?? ""), textWidth(fallLines[1] ?? "", 11.5));
  const fallBox = { x: fx - 6, y: fy - 15, w: fallW + 12, h: 14.5 + 21 };
  // Short arrowheads showing which way everything goes round: anticlockwise, seen from the north.
  const head = (from: [number, number], to: [number, number], tone: string) => {
    const [x0, y0] = from;
    const [x1, y1] = to;
    const ang = Math.atan2(y1 - y0, x1 - x0);
    const h = 6;
    return (
      <path
        className={`f-${tone}`}
        d={`M${x1},${y1}L${x1 - h * Math.cos(ang - 0.45)},${y1 - h * Math.sin(ang - 0.45)}L${x1 - h * Math.cos(ang + 0.45)},${y1 - h * Math.sin(ang + 0.45)}Z`}
      />
    );
  };
  return (
    <Frame
      id="ice-orbits"
      title="Ceres Ice Train orbits, to scale"
      desc={`To scale. Bricks fall from Ceres's orbit at ${t.ceres} to Venus's at ${t.venus} along half an ellipse, in ${t.transfer}. Throwing the ice stretches Ceres's orbit to an aphelion of ${t.ceresNew}.`}
      height={H}
      links
    >
      <Art>
        {/* Ceres after the campaign, modelled as one kick at the launch point. */}
        <path
          className="f-s1-line"
          d={path(conic(CX, CY, newA * AU, newE, 0))}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        >
          <title>{`Ceres's orbit after the campaign: ${t.ceres} at its nearest, ${t.ceresNew} at its farthest`}</title>
        </path>
        <circle className="f-s1-line" cx={CX} cy={CY} r={p.ceres * AU} strokeWidth={2}>
          <title>{`Ceres's orbit, ${t.ceres} (treated as a circle)`}</title>
        </circle>
        <circle className="f-hot-line" cx={CX} cy={CY} r={p.venus * AU} strokeWidth={2}>
          <title>{`Venus's orbit, ${t.venus}`}</title>
        </circle>
        {head(pt(p.ceres, 128), pt(p.ceres, 135), "s1")}
        {head(pt(p.venus, 300), pt(p.venus, 310), "hot")}

        {/* Later windows: the same transfer, turned by the angle Ceres moves in a synodic period. */}
        {later.map((w) => (
          <path
            key={w}
            className="f-accent-line"
            d={transfer(w)}
            strokeWidth={1}
            strokeDasharray="2 4"
          >
            <title>{`A later window, ${t.windowPeriod} after the one before`}</title>
          </path>
        ))}
        {(() => {
          const a = arc(0);
          const i = Math.round(a.length * 0.42);
          return head(a[i - 3] ?? [0, 0], a[i] ?? [0, 0], "accent");
        })()}
      </Art>
      <Link href="/technologies/ice-train" label={fall} box={fallBox}>
        <path className="f-accent-line f-mark-line f-node" d={transfer(0)}>
          <title>{fall}</title>
        </path>
        <Lines x={fx} y={fy} halo lines={fallLines} />
      </Link>
      <Art>
        <circle className="f-s4" cx={CX} cy={CY} r={7}>
          <title>The Sun</title>
        </circle>
        <text className="f-label" x={CX + 12} y={CY + 4}>
          Sun
        </text>

        <Dot x={lx} y={ly} tone="s1" r={5} title={`Ceres at launch, ${t.ceres} from the Sun`} />
        <Lines x={lx - 10} y={ly + 20} anchor="end" lines={["Ceres", "at launch"]} />
        <Dot x={vx} y={vy} tone="hot" title="Venus when the Brick leaves" />
        <Lines x={vx} y={vy + 22} anchor="middle" halo lines={["Venus", "at launch"]} />
        <Dot x={ax} y={ay} tone="hot" title={`Venus when the Brick arrives, ${t.transfer} later`} />
        <Lines x={ax - 10} y={ay - 22} anchor="end" lines={["Venus", "at arrival"]} />
        <Dot x={nx} y={ny} tone="s1" r={4} title={`Ceres's new aphelion, ${t.ceresNew}`} />
        <Lines x={nx + 9} y={ny + 18} lines={["New aphelion", t.ceresNew]} />

        <text className="f-note f-num" x={CX} y={CY - p.venus * AU - 8} textAnchor="middle">
          Venus {t.venus}
        </text>
        <text className="f-note f-num" x={CX} y={CY + p.ceres * AU - 10} textAnchor="middle">
          Ceres {t.ceres}
        </text>

        {/* The story, beside the drawing. */}
        <Key x={px} y={44} tone="hot" label="Venus's orbit" line />
        <Key x={px} y={66} tone="s1" label="Ceres's orbit, before" line />
        <g>
          <line
            className="f-s1-line"
            x1={px}
            x2={px + 16}
            y1={88}
            y2={88}
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          <text x={px + 22} y={88} dy="0.32em">
            Ceres's orbit, after
          </text>
        </g>
        <Key x={px} y={110} tone="accent" label="Brick transfer" line />
        <g>
          <line
            className="f-accent-line"
            x1={px}
            x2={px + 16}
            y1={132}
            y2={132}
            strokeWidth={1}
            strokeDasharray="2 4"
          />
          <text x={px + 22} y={132} dy="0.32em">
            Later windows
          </text>
        </g>

        <Lines
          x={px}
          y={178}
          lines={[
            "The fall",
            `${t.transfer}, half the ellipse`,
            `launched at ${t.launch}`,
            `arrives ${t.vinf} faster than Venus`,
          ]}
        />
        <Lines
          x={px}
          y={256}
          lines={[
            "Launch windows",
            `cheapest every ${t.windowPeriod}`,
            `about ${t.windows} in the campaign,`,
            `${t.start} to ${t.end}`,
          ]}
        />
        <Lines
          x={px}
          y={334}
          lines={[
            "Ceres pays in orbit",
            `recoil adds ${t.recoil} to its speed`,
            `aphelion moves out to ${t.ceresNew}`,
            `(today's real aphelion: ${t.realAphelion})`,
          ]}
        />
        <Tag x={px} y={H - 76} text="Orbits to scale; dots enlarged" />
        <text className="f-note" x={px} y={H - 48}>
          Seen from the north: everything
        </text>
        <text className="f-note" x={px} y={H - 33}>
          goes round anticlockwise.
        </text>
      </Art>
    </Frame>
  );
}

export const iceOrbits: FigureDef<Props> = {
  id: "ice-orbits",
  title: "The Ice Train's orbits",
  file: "figures/src/ice-orbits.tsx",
  build: ({ r }) => {
    const v = (id: string) => r.get(id).value;
    const au = v("au");
    const mu = v("sun-mu");
    const pv = period(mu, v("venus-orbit"));
    const pc = period(mu, v("ceres-orbit"));
    const transfer = v("ice-transfer-years");
    const month = { date: "month" as const };
    return {
      venus: v("venus-orbit") / au,
      ceres: v("ceres-orbit") / au,
      ceresAphelion: v("ceres-new-aphelion") / au,
      // Venus must be this far short of the arrival point when the Brick leaves.
      venusLead: ((360 * transfer) / pv) % 360,
      windowStep: (360 * v("launch-window-period")) / pc,
      windows: v("launch-windows"),
      text: {
        venus: show(r, "venus-orbit", { sig: 3 }),
        ceres: show(r, "ceres-orbit", { sig: 3 }),
        ceresNew: show(r, "ceres-new-aphelion", { sig: 3 }),
        transfer: show(r, "ice-transfer-years"),
        flights: `${show(r, "ice-flight-min")} to ${show(r, "ice-flight-max")}`,
        launch: show(r, "ice-launch-speed", { sig: 2 }),
        vinf: show(r, "ice-vinf", { sig: 3 }),
        vinfMean: show(r, "ice-vinf-rms", { sig: 3 }),
        windowPeriod: show(r, "launch-window-period"),
        windows: show(r, "launch-windows"),
        start: show(r, "ice-launch-start", month),
        end: show(r, "ice-launch-end", month),
        recoil: show(r, "ceres-recoil", { sig: 2 }),
        realAphelion: show(r, "ceres-aphelion"),
      },
    };
  },
  caption: (p) =>
    `The cheapest fall from Ceres to Venus is half an ellipse, ${p.text.transfer}, and its windows come every ${p.text.windowPeriod}; launched all the time, Bricks take ${p.text.flights}. Throwing the ice backward pushes Ceres forward, stretching its orbit out to ${p.text.ceresNew}.`,
  describe: (p) => ({
    summary: `To scale, seen from the north. Venus orbits at ${p.text.venus}, Ceres at ${p.text.ceres}. A Brick thrown backward from Ceres in a launch window falls along a Hohmann transfer ellipse that touches both orbits, arriving ${p.text.transfer} later, ${p.text.vinf} faster than Venus. The Railheads fire between windows too, so Bricks fly other transfers, taking ${p.text.flights} and arriving ${p.text.vinfMean} faster on average. Each later window turns the whole picture by the angle Ceres moves in ${p.text.windowPeriod}. The recoil leaves Ceres on an ellipse from ${p.text.ceres} to ${p.text.ceresNew}.`,
    head: ["Quantity", "Value"],
    rows: [
      ["Venus's orbit", p.text.venus],
      ["Ceres's orbit (as a circle)", p.text.ceres],
      ["Transfer time, Hohmann", p.text.transfer],
      ["Transfer times flown", p.text.flights],
      ["Muzzle speed, in a window", p.text.launch],
      ["Arrival speed relative to Venus, far out, Hohmann", p.text.vinf],
      ["Arrival speed relative to Venus, far out, on average", p.text.vinfMean],
      ["Time between cheap windows", p.text.windowPeriod],
      ["Windows in the campaign", p.text.windows],
      ["Launch campaign", `${p.text.start} to ${p.text.end}`],
      ["Speed Ceres gains", p.text.recoil],
      ["Ceres's new aphelion", p.text.ceresNew],
      ["Ceres's real aphelion today", p.text.realAphelion],
    ],
  }),
  numbers: () => [
    "venus-orbit",
    "ceres-orbit",
    "ceres-new-aphelion",
    "ceres-aphelion",
    "ice-transfer-years",
    "ice-flight-min",
    "ice-flight-max",
    "ice-launch-speed",
    "ice-vinf",
    "ice-vinf-rms",
    "launch-window-period",
    "launch-windows",
    "ice-launch-start",
    "ice-launch-end",
    "ceres-recoil",
    "sun-mu",
    "au",
  ],
  Component: IceOrbits,
};
