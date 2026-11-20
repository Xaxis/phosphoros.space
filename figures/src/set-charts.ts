/** Figures in the "charts" set. Each set has its own list so its figures can be added independently. */
import { energySankey } from "./energy-sankey.tsx";
import { latticeBudget } from "./lattice-budget.tsx";
import { powerScale } from "./power-scale.tsx";
import { trajectory } from "./trajectory.tsx";
import type { FigureDef } from "./types.ts";
import { venusCompare } from "./venus-compare.tsx";

// biome-ignore lint/suspicious/noExplicitAny: each figure has its own props
export const SET: FigureDef<any>[] = [
  venusCompare,
  powerScale,
  latticeBudget,
  energySankey,
  trajectory,
];
