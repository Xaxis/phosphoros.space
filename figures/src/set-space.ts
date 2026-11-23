/** Figures in the "space" set. Each set has its own list so its figures can be added independently. */
import { co2Phase } from "./co2-phase.tsx";
import { heatPath } from "./heat-path.tsx";
import { iceOrbits } from "./ice-orbits.tsx";
import type { FigureDef } from "./types.ts";
import { veilGeometry } from "./veil-geometry.tsx";

// biome-ignore lint/suspicious/noExplicitAny: each figure has its own props
export const SET: FigureDef<any>[] = [co2Phase, veilGeometry, iceOrbits, heatPath];
