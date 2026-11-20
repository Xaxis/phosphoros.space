import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { type Claim, checkClaims } from "../src/claims.ts";
import { CONTENT_FILES, checkContent, loadContent } from "../src/content.ts";
import { formatNumber, formatQuantity } from "../src/format.ts";
import { loadInputs, ROOT, readYaml, run, sourceLines } from "../src/load.ts";
import { compute } from "../src/model/index.ts";
import { simulate } from "../src/model/trajectory.ts";
import { NUMBER_LINK, refsIn, stringsIn } from "../src/template.ts";
import { dayOf, isoOf } from "../src/time.ts";

const r = run();
const docFiles = (dir = path.join(ROOT, "docs")): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? docFiles(path.join(dir, e.name))
      : e.name.endsWith(".md")
        ? [path.join(dir, e.name)]
        : [],
  );
const v = (id: string) => r.get(id).value;

test("every input in data/ is read by the model or shown in the content", () => {
  const read = new Set<string>();
  for (const d of r.derived.values()) for (const i of d.inputs) read.add(i);
  for (const s of r.series.values()) for (const i of s.inputs) read.add(i);
  for (const c of r.checks.values()) for (const i of c.inputs) read.add(i);
  for (const f of CONTENT_FILES)
    for (const s of stringsIn(readYaml(f).data)) for (const id of refsIn(s)) read.add(id);
  for (const t of loadContent().timeline.rows) for (const d of [t.start, t.end]) if (d) read.add(d);
  for (const t of loadContent().technologies) read.add(t.online);
  for (const f of docFiles())
    for (const m of readFileSync(f, "utf8").matchAll(NUMBER_LINK)) read.add(m[4] as string);
  const unused = [...r.inputs.keys()].filter((id) => !read.has(id));
  assert.deepEqual(unused, [], `inputs nobody reads or shows: ${unused.join(", ")}`);
});

test("every number the content refers to exists, and every cross-reference resolves", () => {
  assert.deepEqual(checkContent(r, loadContent()), []);
});

test("every number in the brief is reproduced, corrected on purpose, or explained", () => {
  const claims = readYaml("data/claims.yaml").data as Claim[];
  const results = checkClaims(r, claims);
  assert.ok(results.length > 150);
  const unexplained = results.filter((c) => c.status === "differs" && !c.note);
  assert.deepEqual(
    unexplained.map((c) => c.model),
    [],
  );
  const corrections = new Set(
    (readYaml("data/corrections.yaml").data as { id: string }[]).map((c) => c.id),
  );
  for (const c of results) if (c.correction) assert.ok(corrections.has(c.correction), c.correction);
});

test("the energy budget closes and the heat pump obeys the second law", () => {
  assert.ok(v("helios-supply") >= v("budget-demand"));
  // Never better than Carnot from the hottest point on the path.
  assert.ok(
    v("exhaust-work") / v("atmosphere-heat") >
      v("exhaust-effective-temp") / v("venus-surface-temp") - 1,
  );
  // Emitting 0.9 MW/m² is what a 2,000 K body does.
  assert.ok(Math.abs(v("exhaust-flux") - 5.670374419e-8 * 2000 ** 4) < 1);
});

test("the version 2 statite cannot hover; the version 3 Veil can", () => {
  assert.equal(r.checks.get("veil-v2-hovers")?.pass, false);
  assert.ok(v("veil-v2-net-accel") > 0.03, "both forces point at Venus");
  assert.equal(r.checks.get("veil-hovers")?.pass, true);
  assert.ok(
    v("veil-distance") > v("venus-l1-distance"),
    "light pressure pushes the station sunward of L1",
  );
});

test("the classic L1 distance comes out of the force balance", () => {
  const mu = v("venus-gm") / (v("sun-mu") + v("venus-gm"));
  const approx = v("venus-orbit") * Math.cbrt(mu / 3);
  assert.ok(Math.abs(v("venus-l1-distance") / approx - 1) < 0.01);
});

test("the Hohmann transfer from Ceres matches the textbook numbers", () => {
  assert.ok(Math.abs(v("ice-transfer-days") / 365.25 - 1.15) < 0.01);
  assert.ok(Math.abs(v("ring-arrival-speed") - 13540) < 50);
});

test("the simulated atmosphere cools, rains out, freezes and warms in order", () => {
  const sim = simulate(v);
  const e = sim.events as Record<string, number>;
  const order = ["clear-rain", "freeze", "cold", "scavenged", "warming", "earth-like"];
  for (let i = 1; i < order.length; i++)
    assert.ok((e[order[i - 1] as string] as number) <= (e[order[i] as string] as number), order[i]);
  const first = sim.days[0];
  assert.ok(first && first.pressure > 9e6 && first.temp > 730);
  const end = sim.days.find((d) => d.day >= v("deadline"));
  assert.ok(end && end.temp >= 285 && end.pressure < 2.6e5 && end.pressure > 2.2e5);
  assert.ok(
    (e["earth-like"] as number) <= v("deadline"),
    `Earth-like on ${isoOf(e["earth-like"] as number)}`,
  );
});

test("changing an assumption changes the consequences", () => {
  const slow = compute(loadInputs({ "foundry-doubling-days": 70 }));
  assert.ok(slow.get("foundry-full-scale").value > v("foundry-full-scale") + 100);
  assert.equal(slow.checks.get("earth-like-by-deadline")?.pass, false);
  assert.equal(slow.checks.get("energy-closes")?.pass, false);
});

test("provenance is recorded automatically", () => {
  const d = r.derived.get("veil-distance");
  assert.ok(d?.inputs.includes("veil-beta"));
  assert.ok(r.derived.get("atmosphere-heat")?.inputs.includes("atmosphere-latent-heat"));
  const where = sourceLines(r).get("veil-distance");
  assert.ok(where);
  const line = readFileSync(path.join(ROOT, where.file), "utf8").split("\n")[where.line - 1];
  assert.match(line ?? "", /"veil-distance"/);
  const input = r.inputs.get("foundry-doubling-days");
  const text = readFileSync(path.join(ROOT, input?.file ?? ""), "utf8").split("\n")[
    (input?.line ?? 0) - 1
  ];
  assert.match(text ?? "", /^foundry-doubling-days:/);
});

test("numbers are written the way people read them", () => {
  assert.equal(formatNumber(5.28e26, 2), "5.3 × 10²⁶");
  assert.equal(formatNumber(1e22, 1), "10²²");
  assert.equal(formatNumber(137_000, 3), "137,000");
  assert.equal(formatNumber(0.0173, 3), "0.0173");
  assert.equal(formatNumber(9.96e25, 2), "1.0 × 10²⁶");
  assert.equal(formatQuantity({ value: 9.2e6, unit: "Pa", show: "bar" }), "92 bar");
  assert.equal(formatQuantity({ value: 0.999, unit: "1", show: "%", sig: 3 }), "99.9%");
  assert.equal(formatQuantity({ value: dayOf("2033-06-22"), unit: "date" }), "June 2033");
});
