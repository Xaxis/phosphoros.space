/** Counts over the whole model, for prose that says how many checks pass, and the plan's slack. Runs last. */
import type { Registry } from "../registry.ts";

export function summary(r: Registry) {
  const { v } = r.in("model/summary.ts");
  const checks = [...r.checks.values()];
  r.q(
    "frost-sealing-slack",
    {
      label: "Days between the Frost Towers finishing and the last caps being sealed",
      unit: "d",
      sig: 2,
      formula: "last caps sealed − Frost Towers finish",
      basis: "physics",
      note: "The tightest margin in the schedule: see the margins table on the Budget page.",
    },
    () => v("sealing-end") - v("traj-scavenged"),
  );
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
