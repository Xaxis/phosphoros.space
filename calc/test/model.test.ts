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
import {
  blackBodyShare,
  co2LiquidPressure,
  co2SublimationPressure,
  lambert,
} from "../src/physics.ts";
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

test("the energy budget closes with the Ring, and the heat pump obeys the second law", () => {
  assert.ok(v("helios-supply") >= v("budget-demand-with-ring"));
  assert.ok(v("ring-recovered-energy") >= v("budget-ring-launch"));
  // A Lattice-only shortfall is never hidden: its check fails and names the open problem.
  const lattice = r.checks.get("energy-closes");
  assert.equal(lattice?.pass, v("helios-supply") >= v("budget-demand"));
  if (!lattice?.pass) assert.ok(lattice?.issue, "a failing energy check carries its open problem");
  // Never better than Carnot from the hottest point on the path.
  assert.ok(
    v("exhaust-work") / v("atmosphere-heat") >
      v("exhaust-effective-temp") / v("venus-surface-temp") - 1,
  );
  // Emitting 0.9 MW/m² is what a 2,000 K body does.
  assert.ok(Math.abs(v("exhaust-flux") - 5.670374419e-8 * 2000 ** 4) < 1);
});

test("a Lattice finished after the deadline is an error, not negative energy", () => {
  // A 120-day doubling finishes the Foundry after 2036; the Lattice then delivers nothing in time.
  assert.throws(() => run({ "foundry-doubling-days": 120 }), /full power after the deadline/);
  assert.ok(run({ "foundry-doubling-days": 70 }).get("helios-supply").value > 0);
});

test("every Explorer slider runs end to end, or stops on a designed message", () => {
  // A reader can set any ranged input anywhere in its range. The model must then either run, or
  // stop with a sentence that says why the plan cannot work, never with an internal error.
  const designed = [
    /full power after the deadline/,
    /first ice launch comes after the last launch that reaches Venus/,
  ];
  const failures: string[] = [];
  for (const input of loadInputs().values()) {
    if (!input.range) continue;
    const [lo, hi] = input.range;
    for (let i = 0; i <= 6; i++) {
      const value = lo + ((hi - lo) * i) / 6;
      try {
        run({ [input.id]: value });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (!designed.some((d) => d.test(message)))
          failures.push(`${input.id}=${value}: ${message}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test("the Foundry stops at the soonest finish, and grows with what it must build", () => {
  // The closed form must agree with trying every doubling count, for Lattices small and large.
  const counts: number[] = [];
  for (const power of [4e19, 8.5e19, 1.2e20, 2e20]) {
    const x = run({ "helios-power": power });
    const T = x.get("foundry-doubling-days").value;
    const target = x.get("foundry-target-mass").value;
    const seed = x.get("foundry-seed-mass").value;
    const finish = (n: number) => n * T + (target * T) / (seed * 2 ** n * Math.LN2);
    let best = 1;
    for (let n = 2; n < 40; n++) if (finish(n) < finish(best)) best = n;
    assert.equal(x.get("foundry-doublings").value, best, `helios-power ${power}`);
    assert.equal(x.checks.get("foundry-size")?.pass, true);
    counts.push(best);
  }
  assert.ok((counts.at(-1) ?? 0) > (counts[0] ?? 0), "a far bigger Lattice needs a bigger Foundry");
  assert.equal(v("foundry-target-mass"), v("helios-mass") + v("ring-mass"));
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

test("Lambert's problem reproduces the Hohmann transfer, and off-window shots cost more", () => {
  const mu = v("sun-mu");
  const [r1, r2] = [v("ceres-orbit"), v("venus-orbit")];
  // Almost half a turn in the Hohmann time is almost the Hohmann orbit.
  const sol = lambert(mu, r1, r2, Math.PI * 0.999, v("ice-transfer-days") * 86_400);
  assert.ok(sol);
  const dv = Math.hypot(sol.v1[0], sol.v1[1] - Math.sqrt(mu / r1));
  assert.ok(Math.abs(dv / v("ice-departure-dv") - 1) < 0.01, `Lambert Δv ${dv}`);
  assert.ok(v("launch-offwindow-mean") > 0.01);
  assert.ok(v("launch-offwindow-max") > v("launch-offwindow-mean"));
  assert.ok(v("ice-launch-energy") > v("ice-launch-energy-window"));
});

test("a black body's bands add up to its whole output", () => {
  const share = (from: number, to: number) =>
    blackBodyShare(
      v("sun-temp"),
      from,
      to,
      v("planck-constant"),
      v("speed-of-light"),
      v("boltzmann-constant"),
      v("stefan-boltzmann"),
      20_000,
    );
  assert.ok(Math.abs(share(5e-8, 1e-3) - 1) < 1e-3, "all wavelengths");
  // Wien's law puts the Sun's peak near 0.5 µm: the band around it outshines one as wide at 2 µm.
  assert.ok(share(0.4e-6, 0.6e-6) > 4 * share(1.9e-6, 2.1e-6));
  assert.ok(v("exhaust-band-sunlight") > v("veil-leak-budget"), "a Veil clear in the band leaks");
});

test("the Hohmann transfer from Ceres matches the textbook numbers", () => {
  assert.ok(Math.abs(v("ice-transfer-days") / 365.25 - 1.15) < 0.01);
  assert.ok(Math.abs(v("ring-arrival-speed") - 13540) < 50);
});

test("the simulated atmosphere cools, rains out, freezes and warms in order", () => {
  const sim = simulate(v);
  const e = sim.events as Record<string, number>;
  const order = ["clear-rain", "freeze", "frozen", "cold", "scavenged", "warming", "earth-like"];
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

test("CO₂'s sublimation and vapour curves meet at the triple point and match measured points", () => {
  const triple = { T: v("co2-triple-temp"), P: v("co2-triple-pressure") };
  const critical = { T: v("co2-critical-temp"), P: v("co2-critical-pressure") };
  const a = [v("co2-sublimation-a1"), v("co2-sublimation-a2"), v("co2-sublimation-a3")] as const;
  assert.ok(Math.abs(co2SublimationPressure(triple.T, triple, a) / triple.P - 1) < 1e-12);
  assert.ok(Math.abs(co2LiquidPressure(triple.T, triple, critical) / triple.P - 1) < 1e-12);
  // Dry ice sublimes at one atmosphere at 194.69 K (NIST).
  assert.ok(Math.abs(co2SublimationPressure(194.69, triple, a) / 101_325 - 1) < 0.01);
  assert.throws(() => co2SublimationPressure(triple.T + 1, triple, a));
  // Heat of fusion at the triple point, measured: 196 to 205 kJ/kg.
  assert.ok(
    v("co2-fusion-heat") > 1.9e5 && v("co2-fusion-heat") < 2.15e5,
    `${v("co2-fusion-heat")}`,
  );
});

test("the seas freeze at the triple point, and the simulation's heat books balance", () => {
  const sim = simulate(v);
  const e = sim.events as Record<string, number>;
  const Tt = v("co2-triple-temp");
  const Pt = v("co2-triple-pressure");
  const [from, to] = [e.freeze as number, e.frozen as number];
  const held = sim.days.filter((d) => d.day > from && d.day < to);
  assert.ok(held.length > 30, `${held.length} days between freezing and frozen through`);
  for (const d of held) {
    assert.equal(d.temp, Tt);
    assert.ok(Math.abs(d.co2 / Pt - 1) < 1e-9);
  }
  // The CO₂ pressure never jumps from one day to the next while the pumps cool the air.
  for (let i = 1; i < sim.days.length; i++) {
    const [a, b] = [sim.days[i - 1], sim.days[i]];
    if (a && b && b.phase === "cooling")
      assert.ok(b.co2 <= a.co2 && (a.co2 - b.co2) / a.co2 < 0.04);
  }
  assert.equal(
    r.checks.get("traj-heat-books")?.pass,
    true,
    r.checks.get("traj-heat-books")?.detail,
  );
  const books = v("atmosphere-heat") - v("traj-heat-left-airborne") + v("traj-heat-added");
  assert.ok(Math.abs(v("traj-heat-lifted") / books - 1) < 1e-9);
  assert.ok(v("sealing-window") > 0 && v("cap-laying-rate") > 0);
  // The books balance in a variant that runs past the deadline too: no day the pumps run is dropped.
  const late = compute(
    loadInputs({
      "foundry-seed-launch": v("experiments-end"),
      "ceres-seed-launch": v("experiments-end"),
    }),
  );
  assert.ok(late.get("traj-scavenged").value > v("deadline"));
  assert.equal(
    late.checks.get("traj-heat-books")?.pass,
    true,
    late.checks.get("traj-heat-books")?.detail,
  );
});

test("the SO₂ goes into the CO₂ seas, and the Sweep is sized for what is left", () => {
  // The regular-solution parameter, fitted to one measured equilibrium at 263.15 K, reproduces the
  // others Coquelet and Arpentinier (2014) measured there: [x SO₂, P in Pa, y SO₂].
  const A = v("so2-margules");
  const pure = v("co2-so2-vle-pure-so2");
  for (const [x, P, y] of [
    [0.212, 2.082e6, 0.0262],
    [0.313, 1.8632e6, 0.0365],
  ] as const) {
    const predicted = (Math.exp(A * (1 - x) ** 2) * x * pure) / P;
    assert.ok(Math.abs(predicted / y - 1) < 0.1, `x ${x}: ${predicted} against ${y}`);
  }
  assert.ok(v("so2-sealed-share") > 0.99 && v("so2-sealed-share") < 1);
  assert.ok(Math.abs(v("so2-sealed") + v("so2-airborne-at-freeze") - v("venus-so2-mass")) < 1);
  assert.ok(Math.abs(v("acid-cao") / (v("acid-sulfur-swept") * v("cao-molar-mass")) - 1) < 1e-12);
  // A more volatile SO₂ leaves more in the air, and the Sweep grows with it.
  const volatile = compute(loadInputs({ "co2-so2-vle-vapour": 0.03 }));
  assert.ok(volatile.get("so2-sealed-share").value < v("so2-sealed-share"));
  assert.ok(volatile.get("acid-cao").value > v("acid-cao"));
});

test("the first launch waits for the Ceres factories, solved with the Railheads they build", () => {
  // In the plan the factories finish first, and launches start at the Lattice's full power.
  assert.ok(v("ceres-ready") < v("helios-full-power"));
  assert.equal(v("ice-launch-start"), v("helios-full-power"));
  // A faster Foundry does not launch before the Railheads exist: it waits, and the plan holds.
  const fast = compute(loadInputs({ "foundry-doubling-days": 55 }));
  assert.ok(fast.get("helios-full-power").value < fast.get("ceres-ready").value);
  assert.ok(Math.abs(fast.get("ice-launch-start").value - fast.get("ceres-ready").value) < 1e-3);
  assert.equal(fast.checks.get("ceres-ready-in-time")?.pass, true);
  assert.equal(fast.checks.get("frost-before-sealing")?.pass, true);
  // Slower factories push the launches back, and waiting shortens the campaign, so the Railheads
  // grow: the solved start is later than the finish of the Railheads the plan would have built.
  const slow = compute(loadInputs({ "ceres-doubling-days": 55 }));
  const start = slow.get("ice-launch-start").value;
  assert.ok(start > v("helios-full-power") + 100);
  assert.ok(Math.abs(start - slow.get("ceres-ready").value) < 1e-3);
  assert.ok(slow.get("railhead-power").value > v("railhead-power"));
  assert.ok(slow.get("crown-mass").value > v("crown-mass"));
  assert.equal(slow.checks.get("ceres-ready-in-time")?.pass, true);
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
  // A number never breaks across lines: no-break spaces inside it and before its unit.
  assert.equal(formatNumber(5.28e26, 2), "5.3\u00a0×\u00a010²⁶");
  assert.equal(formatNumber(1e22, 1), "10²²");
  assert.equal(formatNumber(137_000, 3), "137,000");
  assert.equal(formatNumber(0.0173, 3), "0.0173");
  assert.equal(formatNumber(9.96e25, 2), "1.0\u00a0×\u00a010²⁶");
  assert.equal(formatQuantity({ value: 9.2e6, unit: "Pa", show: "bar" }), "92\u00a0bar");
  assert.equal(formatQuantity({ value: 5.3e27, unit: "J" }), "5.3\u00a0×\u00a010²⁷\u00a0J");
  assert.equal(
    formatQuantity({ value: 5.67e-8, unit: "W m-2 K-4" }),
    "5.7\u00a0×\u00a010⁻⁸\u00a0W\u00a0m⁻²\u00a0K⁻⁴",
  );
  assert.equal(formatQuantity({ value: 0.999, unit: "1", show: "%", sig: 3 }), "99.9%");
  assert.equal(formatQuantity({ value: dayOf("2033-06-22"), unit: "date" }), "June 2033");
});
