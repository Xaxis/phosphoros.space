/**
 * pnpm calc                 every derived number, then the physics checks
 * pnpm calc --only ID       one number: value, formula, inputs, where it is computed
 * pnpm calc --set ID=VALUE  rerun with an input changed (repeatable), e.g. --set foundry-doubling-days=70
 * pnpm calc --claims        compare every number in the version 2 brief with the model
 * pnpm calc --json          the whole model as JSON
 */
import { type Claim, checkClaims } from "./src/claims.ts";
import { formatQuantity } from "./src/format.ts";
import { readYaml, run, sourceLines } from "./src/load.ts";
import { dayOf } from "./src/time.ts";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const sets: Record<string, number> = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--set") {
    const [id, raw] = String(args[++i]).split("=");
    if (!id || raw === undefined) throw new Error("--set needs ID=VALUE");
    sets[id] = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? dayOf(raw) : Number(raw);
  }
}
const r = run(sets);
const lines = sourceLines(r);

if (flag("--json")) {
  process.stdout.write(
    `${JSON.stringify(
      {
        inputs: Object.fromEntries(r.inputs),
        derived: Object.fromEntries(r.derived),
        checks: Object.fromEntries(r.checks),
      },
      null,
      2,
    )}\n`,
  );
} else if (flag("--only")) {
  const id = args[args.indexOf("--only") + 1] ?? "";
  const q = r.get(id);
  const where =
    q.kind === "input" ? `${q.file}:${q.line}` : `${lines.get(id)?.file}:${lines.get(id)?.line}`;
  console.log(
    `${q.label}\n  ${formatQuantity(q, { sig: 4, date: "day" })}   (${q.value} ${q.unit})`,
  );
  if (q.kind === "derived") {
    console.log(`  = ${q.formula}`);
    for (const i of q.inputs) {
      const d = r.get(i);
      console.log(`    ${i.padEnd(34)} ${formatQuantity(d, { sig: 4, date: "day" })}`);
    }
  }
  console.log(`  defined at ${where}`);
} else if (flag("--claims")) {
  const claims = readYaml("data/claims.yaml").data as Claim[];
  const results = checkClaims(r, claims);
  const counts = { match: 0, differs: 0, corrected: 0, retired: 0 };
  for (const c of results) {
    counts[c.status]++;
    const mark = { match: "ok ", corrected: "fix", retired: "ret", differs: "!! " }[c.status];
    console.log(
      `${mark} ${c.model.padEnd(32)} brief ${c.shown.brief.padEnd(22)} model ${c.shown.model}`,
    );
    if (c.status === "differs" && !c.note)
      console.log("     ^ differs with no note in data/claims.yaml");
  }
  console.log(
    `\n${results.length} claims: ${counts.match} match, ${counts.corrected} corrected on purpose, ${counts.retired} retired with their machine, ${counts.differs} differ (each explained in data/claims.yaml)`,
  );
  const unexplained = results.filter((c) => c.status === "differs" && !c.note);
  if (unexplained.length) process.exit(1);
} else {
  for (const d of r.derived.values()) {
    console.log(`${d.id.padEnd(36)} ${formatQuantity(d, { date: "day" })}`);
  }
  console.log("");
  for (const c of r.checks.values()) {
    console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.label}\n      ${c.detail}`);
  }
}
