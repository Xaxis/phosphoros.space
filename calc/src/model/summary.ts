/** Counts over the whole model, for prose that says how many checks pass. Runs last. */
import type { Registry } from "../registry.ts";

export function summary(r: Registry) {
  r.in("model/summary.ts");
  const checks = [...r.checks.values()];
  r.q(
    "checks-total",
    { label: "Physics checks the model runs", unit: "count", formula: "count", basis: "physics" },
    () => checks.length,
  );
  r.q(
    "checks-failing",
    {
      label: "Physics checks that fail, each shown with its open problem",
      unit: "count",
      formula: "count of failing checks",
      basis: "physics",
    },
    () => checks.filter((c) => !c.pass).length,
  );
  r.q(
    "checks-passing",
    { label: "Physics checks that pass", unit: "count", formula: "count", basis: "physics" },
    () => checks.filter((c) => c.pass).length,
  );
}
