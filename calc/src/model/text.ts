/** Model numbers inside check details, formatted the way the docs and the site format them. */
import type { Registry } from "../registry.ts";
import { formatRef, type RefOptions } from "../template.ts";

export function fmt(r: Registry, id: string, opts: RefOptions = {}): string {
  r.v(id); // records the read, so the check lists the number among its inputs
  return formatRef(r.get(id), opts);
}
