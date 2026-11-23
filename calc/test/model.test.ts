import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { type Claim, checkClaims } from "../src/claims.ts";
import { CONTENT_FILES, checkContent, loadContent } from "../src/content.ts";
import { formatNumber, formatQuantity } from "../src/format.ts";
import { loadInputs, ROOT, readYaml, run, sourceLines } from "../src/load.ts";
import { lightTemp } from "../src/model/exhaust.ts";
import { arrivedShare, iceArrivals, placesOn } from "../src/model/ice.ts";
import { compute } from "../src/model/index.ts";
import { simulate } from "../src/model/trajectory.ts";
import {
  blackBodyShare,
  CAMPAIGN_SLOTS,
  campaignSchedule,
  co2LiquidPressure,
  co2SublimationPressure,
  crossingAngles,
  hohmann,
  inclinedTransfer,
  lambert,
  period,
  SCHEDULE_WINDOW,
  trueAnomaly,
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
  for (const c of results) {
    if (c.correction) assert.ok(corrections.has(c.correction), c.correction);
    if (c.retired) assert.ok(corrections.has(c.retired), c.retired);
    // A retired claim names a number the model no longer has; one it still has is not retired.
    if (c.retired) assert.ok(!r.derived.has(c.model) && !r.inputs.has(c.model), c.model);
  }
});

test("input notes are plain text: only content prose fills {id} templates", () => {
  for (const input of loadInputs().values())
    assert.ok(!/\{[a-z0-9-]+\}/.test(input.note ?? ""), `${input.id} has a template in its note`);
});

test("every failing check names its problem, and every open problem has a failing check", () => {
  // A design that fails stays a failing check, tied to a corrections entry and a GitHub issue; an
  // open entry whose check passes would claim a problem the model no longer shows.
  const entries = readYaml("data/corrections.yaml").data as {
    id: string;
    kind: string;
    issue?: number;
  }[];
  const named = new Set<string>();
  for (const c of r.checks.values()) {
    if (c.pass) continue;
    const entry = entries.find((e) => e.id === c.issue);
    assert.ok(entry, `${c.id} fails without a corrections entry`);
    assert.ok(entry?.issue, `${c.issue} has no GitHub issue`);
    named.add(entry?.id ?? "");
  }
  for (const e of entries.filter((e) => e.kind === "open"))
    assert.ok(named.has(e.id), `open problem ${e.id} has no failing check`);
});

test("the energy budget closes in light, and the pumps pay for the light's entropy", () => {
  assert.equal(r.checks.get("energy-closes")?.pass, true, r.checks.get("energy-closes")?.detail);
  assert.ok(v("budget-spare") > 0);
  // What runs on electricity pays a receiver's loss; the pumps take the light itself.
  assert.ok(
    Math.abs(v("ice-launch-light") * v("helios-receiver-efficiency") - v("ice-launch-energy")) <
      1e-9 * v("ice-launch-energy"),
  );
  assert.equal(v("helios-efficiency"), v("helios-film-efficiency") * v("helios-laser-efficiency"));
  // The tiles shine as a black body at their effective temperature, spread over their whole sky.
  assert.ok(
    Math.abs(v("exhaust-flux") / (5.670374419e-8 * v("exhaust-effective-temp") ** 4) - 1) < 1e-9,
  );
  assert.ok(Math.abs(v("exhaust-radiance") * Math.PI - v("exhaust-flux")) < 1e-6);
  // Light in one narrow band counts as hotter than a black body as bright, and brighter light as
  // hotter still. The pumps are charged at the light's temperature, so never better than Carnot
  // from the hottest point on the path to it.
  assert.ok(v("exhaust-light-temp") > v("exhaust-effective-temp"));
  assert.equal(v("exhaust-light-temp"), lightTemp(v, v("exhaust-flux")));
  assert.ok(lightTemp(v, 2 * v("exhaust-flux")) > v("exhaust-light-temp"));
  assert.ok(
    v("exhaust-work") / v("atmosphere-heat") >
      v("exhaust-light-temp") / v("venus-surface-temp") - 1,
  );
  // A dimmer tile's light counts as cooler, so it would cost less work but need far more area.
  const dim = run({ "exhaust-effective-temp": 1600 });
  assert.ok(dim.get("exhaust-work").value < v("exhaust-work"));
  assert.equal(dim.checks.get("exhaust-fits-venus")?.pass, false);
});

test("each pump photon has room for the heat the model has it carry", () => {
  assert.equal(r.checks.get("exhaust-pump-photons")?.pass, true);
  assert.ok(v("exhaust-pump-room-start") > v("exhaust-cop-start"));
  // Pumping above the tiles' bandgap leaves a photon no room to carry heat out at all.
  const blue = run({ "helios-wavelength": 2.2e-6 });
  assert.equal(blue.checks.get("exhaust-pump-photons")?.pass, false);
});

test("only the lit side is pumped, and the tiles fit between the drop zones", () => {
  assert.equal(r.checks.get("exhaust-fits-venus")?.pass, true);
  assert.ok(
    Math.abs(
      v("exhaust-area-installed") * v("exhaust-flux") * v("exhaust-lit-share") - v("exhaust-peak"),
    ) <
      1e-9 * v("exhaust-peak"),
  );
  assert.equal(v("chimney-capacity-lit"), v("chimney-capacity") * v("exhaust-lit-share"));
  assert.ok(v("canopy-band-cover") < 1 && v("canopy-band-cover") > v("exhaust-area-share"));
  // Pumped day and night, the same tiles would need half the area.
  const both = run({ "exhaust-lit-share": 1 });
  assert.ok(Math.abs(both.get("exhaust-area-share").value * 2 - v("exhaust-area-share")) < 1e-9);
});

test("a Lattice finished after the deadline is an error, not negative energy", () => {
  // A 120-day doubling finishes the Foundry after 2036; the Lattice then delivers nothing in time.
  assert.throws(() => run({ "foundry-doubling-days": 120 }), /full power after the deadline/);
  assert.ok(run({ "foundry-doubling-days": 70 }).get("helios-supply").value > 0);
});

test("every Explorer slider runs end to end, or stops on a designed message", () => {
  // A reader can set any ranged input anywhere in its range. The model must then either run, or
  // stop with a sentence that says why the plan cannot work, never with an internal error.
  const designed = [/full power after the deadline/, /the ice campaign has no days/];
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
  for (const power of [4e19, 1.2e20, 2.2e20, 6e20]) {
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
  assert.equal(v("foundry-target-mass"), v("helios-mass") + v("venus-hardware-mass"));
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

test("Lambert's problem reproduces the Hohmann transfer, and off-window shots cost more", () => {
  const mu = v("sun-mu");
  const [r1, r2] = [v("ceres-orbit"), v("venus-orbit")];
  // Almost half a turn in the Hohmann time is almost the Hohmann orbit.
  const sol = lambert(mu, r1, r2, Math.PI * 0.999, v("ice-transfer-days") * 86_400);
  assert.ok(sol);
  const dv = Math.hypot(sol.v1[0], sol.v1[1] - Math.sqrt(mu / r1));
  assert.ok(Math.abs(dv / v("ice-departure-dv") - 1) < 0.01, `Lambert Δv ${dv}`);
  // The same orbit whatever the search starts from.
  const far = lambert(mu, r1, r2, Math.PI * 0.999, v("ice-transfer-days") * 86_400, -50);
  assert.ok(
    far && Math.abs(far.v1[0] - sol.v1[0]) < 1e-6 && Math.abs(far.v1[1] - sol.v1[1]) < 1e-6,
  );
  assert.equal(lambert(mu, r1, r2, Math.PI / 2, 1), null, "no orbit crosses a quarter turn in 1 s");
  assert.ok(v("launch-offwindow-mean") > 0.01);
  assert.ok(v("launch-offwindow-max") > v("launch-offwindow-mean"));
  assert.ok(v("ice-launch-energy") > v("ice-launch-energy-window"));
});

test("the Hohmann transfer from Ceres matches the textbook numbers", () => {
  assert.ok(Math.abs(v("ice-transfer-days") / 365.25 - 1.15) < 0.01);
  // Ceres to Venus: about 9.1 km/s far out, 13.8 km/s at the top of Venus's air.
  assert.ok(Math.abs(v("ice-vinf") - 9080) < 50);
  const hohmannEntry = Math.sqrt(v("ice-vinf") ** 2 + v("venus-escape") ** 2);
  assert.ok(Math.abs(hohmannEntry - 13780) < 50);
  // The schedule's Bricks arrive faster than the Hohmann transfer's: off-window and out of plane.
  assert.ok(v("ice-vinf-rms") > 1.3 * v("ice-vinf"));
  assert.ok(v("ice-entry-speed") > hohmannEntry);
});

test("every Brick brings the heat of its whole fall, so oceans cannot come this way", () => {
  const e = v("ice-entry-energy-per-kg");
  assert.ok(Math.abs(e - 0.5 * (v("ice-vinf-rms") ** 2 + v("venus-escape") ** 2)) < 1e-6 * e);
  // Even a Brick at rest far out falls in at escape speed: over 50 MJ/kg, fifty times the heat to
  // melt it and warm it to 288 K.
  assert.ok(0.5 * v("venus-escape") ** 2 > 50 * v("melt-energy"));
  assert.equal(v("ice-entry-heat"), v("ice-mass") * e);
  // An ocean in Earth's proportion would bring hundreds of times the heat of Venus's whole air.
  assert.ok(v("ocean-entry-vs-atmosphere") > 100);
  // Twice the ice is more heat than the pumps can lift in time.
  const wet = run({ "ice-mass": 2 * v("ice-mass") });
  assert.equal(wet.checks.get("frost-before-sealing")?.pass, false);
});

test("tilted transfers: no tilt is Hohmann's, and a plane change costs what geometry says", () => {
  const mu = v("sun-mu");
  const [r1, r2] = [v("ceres-orbit"), v("venus-orbit")];
  const t = v("ice-transfer-days") * 86_400;
  const tilt = (v("ice-mutual-inclination") * Math.PI) / 180;
  const near = (a: number, b: number, tol: number, what: string) =>
    assert.ok(Math.abs(a / b - 1) < tol, `${what}: ${a} against ${b}`);
  // No tilt, almost half a turn: the Hohmann kick and arrival, wherever it starts.
  for (const u of [0.3, 2.1]) {
    const x = inclinedTransfer(mu, r1, r2, 0, u, u + Math.PI * 0.999, t);
    assert.ok(x);
    near(Math.sqrt(x.dv2), v("ice-departure-dv"), 0.01, "kick");
    near(Math.sqrt(x.vinf2), v("ice-vinf"), 0.01, "arrival");
  }
  // Leave from where the planes cross and arrive almost opposite, short of the other crossing:
  // the transfer lies in Venus's plane, so the whole plane change is in the kick and none at Venus.
  const v1 = Math.sqrt(mu / r1);
  const v2 = Math.sqrt(mu / r2);
  const aphelion = v1 - v("ice-departure-dv");
  const perihelion = v2 + v("ice-vinf");
  const atDeparture = inclinedTransfer(mu, r1, r2, tilt, 0, Math.PI * 0.999, t);
  assert.ok(atDeparture);
  const kick = Math.sqrt(v1 ** 2 + aphelion ** 2 - 2 * v1 * aphelion * Math.cos(tilt));
  near(Math.sqrt(atDeparture.dv2), kick, 0.01, "kick with the plane change");
  near(Math.sqrt(atDeparture.vinf2), v("ice-vinf"), 0.01, "arrival in plane");
  near(Math.abs(atDeparture.kickTilt), aphelion * Math.sin(tilt), 0.01, "kick out of plane");
  assert.ok(Math.abs(atDeparture.vinfTilt) < 1e-6 * v("ice-vinf"), "no tilt at arrival");
  // Leave just past the crossing and arrive at the other: the transfer lies in Ceres's plane, so
  // the kick is Hohmann's and the whole plane change arrives at Venus.
  const atArrival = inclinedTransfer(mu, r1, r2, tilt, Math.PI * 0.001, Math.PI, t);
  assert.ok(atArrival);
  const arrival = Math.sqrt(perihelion ** 2 + v2 ** 2 - 2 * perihelion * v2 * Math.cos(tilt));
  near(Math.sqrt(atArrival.dv2), v("ice-departure-dv"), 0.01, "kick in plane");
  near(Math.sqrt(atArrival.vinf2), arrival, 0.01, "arrival with the plane change");
  assert.ok(Math.abs(atArrival.kickTilt) < 1e-6 * v("ice-departure-dv"), "no tilt in the kick");
  near(Math.abs(atArrival.vinfTilt), perihelion * Math.sin(tilt), 0.01, "arrival out of plane");
  // In the schedule, most of the plane change still arrives at Venus.
  assert.ok(v("ice-vinf-tilt") > 2 * v("ice-kick-tilt"));
  // Point inversion through the Sun: half a turn on, the same transfer, mirrored.
  const a = inclinedTransfer(mu, r1, r2, tilt, 0.7, 3.4, 0.9 * t);
  const b = inclinedTransfer(mu, r1, r2, tilt, 0.7 + Math.PI, 3.4 + Math.PI, 0.9 * t);
  assert.ok(a && b);
  near(a.dv2, b.dv2, 1e-9, "inverted kick");
  near(a.vinf2, b.vinf2, 1e-9, "inverted arrival");
});

/** The off-window table the schedule replaced: each launch phase's cheapest transfer, by angle. */
function offWindowReference(mu: number, r1: number, r2: number, vEscape: number) {
  const v1 = Math.sqrt(mu / r1);
  const n2 = Math.sqrt(mu / r2 ** 3);
  const P2 = (2 * Math.PI) / n2;
  const h = hohmann(mu, r1, r2);
  const best = h.departDv ** 2 + vEscape ** 2;
  const cost = (phase: number, angle: number) => {
    const theta = (angle * Math.PI) / 180;
    const lead =
      (((theta - (phase * Math.PI) / 180) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let least = Number.POSITIVE_INFINITY;
    for (let t = lead / n2; t <= 2 * h.time; t += P2) {
      const sol = t > 0 ? lambert(mu, r1, r2, theta, t) : null;
      if (sol) least = Math.min(least, sol.v1[0] ** 2 + (sol.v1[1] - v1) ** 2 + vEscape ** 2);
    }
    return least;
  };
  const costs: number[] = [];
  for (let phase = 0; phase < 360; phase += 5) {
    let at = 180;
    let least = Number.POSITIVE_INFINITY;
    for (let angle = 20; angle <= 340; angle += 4) {
      const c = cost(phase, angle);
      if (c < least) [least, at] = [c, angle];
    }
    for (let angle = at - 4; angle <= at + 4; angle += 0.5)
      least = Math.min(least, cost(phase, angle));
    costs.push(least / best - 1);
  }
  return { max: Math.max(...costs), mean: costs.reduce((x, y) => x + y, 0) / costs.length };
}

test("the campaign schedule: free timing is the old off-window table, and arrivals can be even", () => {
  const mu = v("sun-mu");
  const [r1, r2] = [v("ceres-orbit"), v("venus-orbit")];
  const cycle = 1 / (1 / period(mu, r2) - 1 / period(mu, r1));
  const base = { mu, r1, r2, vEscape: v("ceres-escape"), inclination: 0, u0: 0.4, w0: 2.9 };
  // Over two whole synodic cycles, with room for every launch in any slot, each launch takes its
  // cheapest transfer: the same average and worst case as sweeping transfer angles phase by phase.
  const free = campaignSchedule({ ...base, duration: 2 * cycle, peak: CAMPAIGN_SLOTS });
  const reference = offWindowReference(mu, r1, r2, base.vEscape);
  const extra = (s: { energy: number; hohmann: number }, e = s.energy) => e / s.hohmann - 1;
  assert.ok(Math.abs(extra(free) - reference.mean) < 0.006, `${extra(free)} vs ${reference.mean}`);
  assert.ok(Math.abs(extra(free, free.energyMax) - reference.max) < 0.02);
  // Left free, the cheapest transfers bunch: many launches land in one slot.
  assert.ok(free.peak >= 8, `free peak ${free.peak}`);
  // Peak 1: every arrival slot gets at most one launch slot, at a price.
  const even = campaignSchedule({ ...base, duration: 2 * cycle, peak: 1 });
  assert.equal(even.peak, 1);
  assert.equal(even.flights.length, CAMPAIGN_SLOTS);
  assert.ok(extra(even) > 2 * extra(free), "even arrivals cost far more launch energy");
  for (const t of even.flights) {
    assert.ok(t >= SCHEDULE_WINDOW[0] * hohmann(mu, r1, r2).time - 1);
    assert.ok(t <= SCHEDULE_WINDOW[1] * hohmann(mu, r1, r2).time + 1);
  }
  // A short campaign costs what its dates give: from the Hohmann window, close to Hohmann's price;
  // from half a cycle off it, far more.
  const h = hohmann(mu, r1, r2);
  const lead = Math.PI - Math.sqrt(mu / r2 ** 3) * h.time;
  const short = { ...base, duration: 20 * 86_400, peak: 3, u0: 0 };
  const onWindow = campaignSchedule({ ...short, w0: lead });
  const offWindow = campaignSchedule({ ...short, w0: lead + Math.PI });
  assert.ok(extra(onWindow) < 0.02, `on the window ${extra(onWindow)}`);
  assert.ok(extra(offWindow) > 10 * extra(onWindow) + 0.1, `off the window ${extra(offWindow)}`);
  // The model's campaign: never more than the chosen peak in a slot.
  const at = placesOn(v, v("ice-launch-start"));
  const tilted = {
    ...base,
    inclination: (v("ice-mutual-inclination") * Math.PI) / 180,
    u0: at.u,
    w0: at.w,
    duration: v("ice-campaign"),
    peak: v("ice-arrival-peak"),
    r1End: v("ceres-drift-orbit"),
  };
  const model = campaignSchedule({ ...tilted, arrivalWeight: v("ice-arrival-weight") });
  assert.ok(model.peak <= v("ice-arrival-peak"));
  assert.ok(Math.abs(v("ice-arrival-peak-rate") / v("ice-throughput") - model.peak) < 1e-9);
  assert.ok(Math.abs(v("ice-vinf-rms") / model.vinfRms - 1) < 1e-12);
  // Weighing arrival speed books slower arrivals for dearer launches.
  const cheapest = campaignSchedule({ ...tilted, arrivalWeight: 0 });
  const weighed = campaignSchedule({ ...tilted, arrivalWeight: 1.5 });
  assert.ok(weighed.vinfRms < cheapest.vinfRms);
  assert.ok(weighed.energy > cheapest.energy);
  // The tilt costs launch energy.
  assert.ok(v("launch-offwindow-mean") > v("launch-coplanar-mean"));
  assert.throws(() => campaignSchedule({ ...tilted, peak: 2.5 }), /whole number/);
});

test("the campaign starts where Ceres and Venus really are", () => {
  // The measured mean motions agree with the circular orbits the transfers use.
  const day = (rate: number, r1: number) => (rate * period(v("sun-mu"), r1)) / 86_400 / 360 - 1;
  assert.ok(Math.abs(day(v("venus-mean-motion"), v("venus-orbit"))) < 2e-4);
  assert.ok(Math.abs(day(v("ceres-mean-motion"), v("ceres-orbit"))) < 2e-3);
  // Kepler's equation: a circle keeps its mean anomaly; an ellipse runs ahead after perihelion.
  assert.equal(trueAnomaly(1.2, 0), 1.2);
  assert.ok(Math.abs(trueAnomaly(Math.PI, 0.3) - Math.PI) < 1e-12);
  const e = v("ceres-eccentricity");
  assert.ok(Math.abs(trueAnomaly(1, e) - (1 + 2 * e * Math.sin(1))) < 2 * e * e);
  // The planes cross at the model's mutual tilt, and an angle measured from the crossing comes back.
  const RAD = Math.PI / 180;
  const ceres = { i: v("ceres-inclination") * RAD, node: v("ceres-node") * RAD };
  const venus = { i: v("venus-inclination") * RAD, node: v("venus-node") * RAD };
  const x = crossingAngles({ ...ceres, u: 0.3 }, { ...venus, u: 1.1 });
  assert.ok(Math.abs(x.inclination / RAD - v("ice-mutual-inclination")) < 1e-9);
  const y = crossingAngles({ ...ceres, u: 0.3 + 0.5 }, { ...venus, u: 1.1 + 0.2 });
  assert.ok(Math.abs(y.u - x.u - 0.5) < 1e-9 && Math.abs(y.w - x.w - 0.2) < 1e-9);
  // A day later Venus has gained on Ceres by the difference of their mean motions, near enough.
  const [d0, d1] = [placesOn(v, v("ice-launch-start")), placesOn(v, v("ice-launch-start") + 1)];
  const gained = (d1.w - d1.u - (d0.w - d0.u)) / RAD;
  assert.ok(Math.abs(gained - (v("venus-mean-motion") - v("ceres-mean-motion"))) < 0.05);
  // The next Hohmann window is within one synodic cycle of the first launch.
  assert.ok(v("ice-window-wait") >= 0);
  assert.ok(v("ice-window-wait") < v("launch-window-period") / 86_400);
  // The first launch is within days of a window, so the campaign's first shots cost Hohmann's price.
  assert.ok(v("ice-window-wait") < (0.1 * v("launch-window-period")) / 86_400);
});

test("the campaign sets the last launch, and the booked flights the arrivals", () => {
  assert.equal(v("ice-launch-end"), v("ice-launch-start") + v("ice-campaign-days"));
  // Every flight is inside the window tried, and the arrivals fall between the first and last.
  const tH = v("ice-transfer-days");
  assert.ok(v("ice-flight-min") >= SCHEDULE_WINDOW[0] * tH - 1);
  assert.ok(v("ice-flight-max") <= SCHEDULE_WINDOW[1] * tH + 1);
  assert.ok(v("first-arrival") >= v("ice-launch-start") + v("ice-flight-min") - 1);
  assert.ok(v("last-arrival") <= v("ice-launch-end") + v("ice-flight-max") + 1);
  assert.ok(v("ceres-drift-orbit") > v("ceres-orbit"));
  // Twice the ice: twice the recoil, a wider orbit.
  const heavy = run({ "ice-mass": 2 * v("ice-mass") });
  assert.ok(heavy.get("ceres-drift-orbit").value > v("ceres-drift-orbit"));
  assert.ok(Math.abs(heavy.get("ceres-recoil").value / v("ceres-recoil") - 2) < 0.01);
});

test("the Bricks reach Venus while the pumps run, ramping up and down", () => {
  assert.equal(r.checks.get("ice-arrives")?.pass, true);
  // A campaign that runs too long brings its last Bricks after the pumps stop.
  const long = run({ "ice-campaign-days": 900 });
  assert.equal(long.checks.get("ice-arrives")?.pass, false);
  // The arrivals as they ramp: nothing before the first Brick, all of it by the last.
  const arrived = iceArrivals(v);
  assert.equal(arrived.share(v("first-arrival") - 1e-6), 0);
  assert.equal(arrived.share(v("last-arrival")), 1);
  assert.equal(Math.min(...arrived.turns), v("first-arrival"));
  assert.equal(Math.max(...arrived.turns), v("last-arrival"));
  // Each launch slot's share arrives evenly through its arrival slot.
  const a = v("ice-launch-start");
  assert.equal(arrivedShare(a + 299, a, 1, [300, 400]), 0);
  assert.equal(arrivedShare(a + 300.5, a, 1, [300, 400]), 0.25);
  assert.equal(arrivedShare(a + 350, a, 1, [300, 400]), 0.5);
  assert.equal(arrivedShare(a + 401, a, 1, [300, 400]), 1);
});

test("the simulated atmosphere cools, rains out, freezes and warms in order", () => {
  const sim = simulate(v);
  const e = sim.events as Record<string, number>;
  const order = [
    "clear-rain",
    "water-frozen",
    "freeze",
    "frozen",
    "cold",
    "scavenged",
    "warming",
    "earth-like",
  ];
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
  // The water rains out once the air holds no more, and freezes as the air cools through 273 K.
  const rain = sim.days.find((d) => d.day === e["water-rain"]);
  const frozen = sim.days.find((d) => d.day === e["water-frozen"]);
  assert.ok(rain && rain.temp > 273.15);
  assert.ok(frozen && frozen.temp < 273.15);
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
  // The CO₂ pressure never jumps from one day to the next while the pumps cool the air. On the
  // frost curve near 200 K, a day's half a kelvin of cooling lowers it about 4% (Clausius-Clapeyron);
  // a step between stages would show as far more. It rises only on a day more heat enters the air
  // than the pumps lift, and then the CO₂ that had rained out boils back.
  for (let i = 1; i < sim.days.length; i++) {
    const [a, b] = [sim.days[i - 1], sim.days[i]];
    if (!a || !b || b.phase !== "cooling") continue;
    assert.ok(Math.abs(a.co2 - b.co2) / a.co2 < 0.1, `day ${b.day}`);
    if (b.co2 > a.co2) assert.ok(b.heatIn > b.heatOut, `day ${b.day}`);
  }
  // The re-warming is measured from the simulation itself: the warmest day after the coldest so far,
  // and the Clear Rain for good is the last day the air crosses back below the critical point.
  const Tc = v("co2-critical-temp");
  const cooling = sim.days.filter((d) => d.phase === "cooling");
  let coldest = Number.POSITIVE_INFINITY;
  let most = 0;
  for (const d of cooling) {
    if (d.temp - coldest > most) most = d.temp - coldest;
    coldest = Math.min(coldest, d.temp);
  }
  assert.ok(Math.abs(most - v("traj-rewarm")) < 1, `${most} K against ${v("traj-rewarm")} K`);
  assert.ok(v("traj-rerain") >= v("traj-clear-rain"));
  const warm = cooling.filter((d) => d.day >= v("traj-clear-rain") && d.temp > Tc);
  assert.ok(warm.every((d) => d.day < v("traj-rerain")));
  if (v("traj-rerain") > v("traj-clear-rain")) assert.ok(warm.length > 0);
  // The Forges float on the seas, so a start before they are back for good fails its check.
  assert.equal(r.checks.get("forges-on-seas")?.pass, true);
  const early = compute(loadInputs({ "forge-start": dayOf("2035-01-01") }));
  assert.equal(early.checks.get("forges-on-seas")?.pass, false);
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
      "exhaust-peak": 1.6e20,
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
  // Slower factories push the launches back to the day they finish. The campaign keeps its length,
  // so the throughput is the same, but the planets are elsewhere: the launches start farther from a
  // window and cost more, and the Railheads' power follows the launch cost exactly.
  const slow = compute(loadInputs({ "ceres-doubling-days": 55 }));
  const start = slow.get("ice-launch-start").value;
  assert.ok(start > v("helios-full-power") + 100);
  assert.ok(Math.abs(start - slow.get("ceres-ready").value) < 1e-3);
  assert.equal(slow.get("ice-throughput").value, v("ice-throughput"));
  assert.ok(slow.get("ice-window-wait").value > v("ice-window-wait"));
  assert.ok(slow.get("launch-energy-per-kg-avg").value > v("launch-energy-per-kg-avg"));
  const powerRatio = slow.get("railhead-power").value / v("railhead-power");
  const costRatio = slow.get("launch-energy-per-kg-avg").value / v("launch-energy-per-kg-avg");
  assert.ok(Math.abs(powerRatio / costRatio - 1) < 1e-9);
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
