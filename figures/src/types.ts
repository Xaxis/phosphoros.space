/** The contract every figure keeps: pure data in, an accessible SVG out. */
import type { Content } from "@phosphoros/calc/content";
import type { Registry } from "@phosphoros/calc/registry";
import type { ComponentType } from "react";

export interface FigureContext {
  r: Registry;
  content: Content;
}

export interface FigureDef<P = unknown> {
  id: string;
  title: string;
  /** One or two sentences: what the figure shows and the point it makes. */
  caption: (p: P) => string;
  /** The text alternative: the figure's data in words or a small table. */
  describe: (p: P) => { summary: string; rows?: string[][]; head?: string[] };
  /** The model numbers the figure is drawn from (for its cards and "View source"). */
  numbers: (p: P) => string[];
  /** The source file of the figure, for "View source". */
  file: string;
  build: (ctx: FigureContext) => P;
  Component: ComponentType<P>;
}
