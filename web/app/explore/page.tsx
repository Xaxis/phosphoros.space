import type { Metadata } from "next";
import {
  Explorer,
  type ExplorerGroup,
  type Outcome,
  type SliderMargin,
} from "../../components/Explorer";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { pageMeta } from "../../lib/meta";
import { model, readRepoFile } from "../../lib/model";
import { EXPLORE, REPO } from "../../lib/site";

export const metadata: Metadata = pageMeta(EXPLORE);

const GROUPS: ExplorerGroup[] = [
  {
    title: "Ouroboros Foundry",
    ids: ["foundry-doubling-days", "foundry-seed-mass", "foundry-energy-per-kg"],
  },
  {
    title: "Helios Lattice",
    ids: ["helios-power", "helios-film-efficiency", "helios-laser-efficiency"],
  },
  { title: "Hesperus Veil", ids: ["veil-momentum-fraction"] },
  { title: "Photonic Exhaust", ids: ["exhaust-peak", "exhaust-effective-temp"] },
  { title: "Water", ids: ["ice-mass", "ceres-water-fraction"] },
];

const OUTCOMES: Outcome[] = [
  { id: "traj-earth-like", better: "earlier" },
  { id: "budget-demand", better: "lower" },
  { id: "helios-supply", better: "higher" },
  { id: "budget-spare", better: "higher" },
  { id: "budget-spare-with-ring", better: "higher" },
  { id: "foundry-full-scale", better: "earlier" },
  { id: "veil-affordable", better: "earlier" },
  { id: "traj-clear-rain", better: "earlier" },
  { id: "traj-scavenged", better: "earlier" },
  { id: "helios-area", better: "none" },
  { id: "exhaust-area-installed", better: "none" },
  { id: "traj-pump-energy", better: "lower" },
  { id: "veil-mass", better: "none" },
  { id: "ocean-depth", better: "none" },
  { id: "ice-ceres-water-share", better: "lower" },
];

export default function ExplorePage() {
  const { r, content } = model();
  const inputs = [...r.inputs.values()];
  // How far each input can move alone, from tools/margins.ts (cached by pnpm docs).
  const margins: SliderMargin[] = (
    JSON.parse(readRepoFile("data/margins.json")) as {
      inputs: { id: string; below: { holds: number } | null; above: { holds: number } | null }[];
    }
  ).inputs.map((m) => ({ id: m.id, low: m.below?.holds ?? null, high: m.above?.holds ?? null }));
  return (
    <>
      <Header current="/explore" />
      <main id="content" className="page page-wide">
        <div className="page-hero">
          <p className="eyebrow">Fork the plan</p>
          <h1>Explorer</h1>
          <div className="lead">
            <p>
              This page runs the same model the site is built from, in your browser. Move an
              assumption and every consequence is recomputed, including the day-by-day simulation of
              Venus's air, every physics check, the schedule and the energy budget. The link in your
              address bar keeps your variant. To change anything else, edit{" "}
              <a href={`${REPO}/blob/main/data/assumptions.yaml`}>data/assumptions.yaml</a> and run{" "}
              <code>pnpm calc</code>.
            </p>
          </div>
        </div>
        <Explorer
          inputs={inputs}
          groups={GROUPS}
          outcomes={OUTCOMES}
          timeline={content.timeline}
          margins={margins}
        />
      </main>
      <Footer doc="calc/src/model/index.ts" />
    </>
  );
}
