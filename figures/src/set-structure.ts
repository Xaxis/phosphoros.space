/** Figures in the "structure" set. Each set has its own list so its figures can be added independently. */
import { foundryLoop } from "./foundry-loop.tsx";
import { gantt } from "./gantt.tsx";
import { researchGates } from "./research-gates.tsx";
import { techStack } from "./tech-stack.tsx";
import type { FigureDef } from "./types.ts";

// biome-ignore lint/suspicious/noExplicitAny: each figure has its own props
export const SET: FigureDef<any>[] = [techStack, gantt, researchGates, foundryLoop];
