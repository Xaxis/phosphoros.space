/** Every figure, by id. Docs place them with <!-- figure:id -->; the site draws them live. */
import { acidSweep } from "./acid-sweep.tsx";
import { aegisShield } from "./aegis-shield.tsx";
import { foundryGrowth } from "./foundry-growth.tsx";
import { SET as charts } from "./set-charts.ts";
import { SET as space } from "./set-space.ts";
import { SET as structure } from "./set-structure.ts";
import type { FigureDef } from "./types.ts";

export type { FigureContext, FigureDef } from "./types.ts";

// biome-ignore lint/suspicious/noExplicitAny: each figure has its own props
export const FIGURES: Record<string, FigureDef<any>> = Object.fromEntries(
  [foundryGrowth, ...charts, ...space, ...structure, acidSweep, aegisShield].map((f) => [f.id, f]),
);
