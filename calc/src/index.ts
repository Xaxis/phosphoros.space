/** Public surface of the model, safe to import in the browser (no file access here). */

export * from "./format.ts";
export { DEMANDS } from "./model/budget.ts";
export { compute, MODULES } from "./model/index.ts";
export { simulate } from "./model/trajectory.ts";
export * from "./registry.ts";
export * from "./time.ts";
