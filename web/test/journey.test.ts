/**
 * The journey without a browser: the clock plays the decade once and keeps moving into every
 * event; every world sits where the model puts it and every craft leaves one world and arrives at
 * the next; the Bricks burst in the air between the first and last arrival; the new water rains
 * out, freezes and melts without the seas ever shrinking; and no shader can black out the frame.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { run } from "../../calc/src/load.ts";
import { director, script } from "../components/journey/director.ts";
import { formatReading } from "../components/journey/format.ts";
import { length3, out, placer, polar, RADIUS, transfer } from "../components/journey/orbits.ts";
import { holds, stageAt, venusAt } from "../components/journey/stage.ts";
import { makeTimeline } from "../components/journey/timeline.ts";
import type { Readout } from "../components/journey/types.ts";
import { journeyData } from "../lib/journey.ts";
import { DAY_IDS, EVENTS } from "../lib/journey-events.ts";

const events = [0, 400, 410, 1200, 3300, 3330, 3360];
const t = makeTimeline(events, 0, 3652);

test("the clock runs from the first day to the deadline, once", () => {
  assert.equal(t.dayAt(0), 0);
  assert.equal(t.dayAt(t.duration), 3652);
  assert.equal(t.dayAt(t.duration + 60), 3652, "after the deadline it stays there, no rewind");
});

test("the clock never stops between events", () => {
  let prev = t.dayAt(0);
  for (let s = 0.05; s < t.duration; s += 0.05) {
    const d = t.dayAt(s);
    assert.ok(d >= prev, `day goes backwards at ${s}s`);
    prev = d;
  }
  // Leaving each event, the date moves at no less than 40% of that stretch's average speed.
  const stops = [...events, 3652];
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, b] = [stops[i] as number, stops[i + 1] as number];
    const [sa, sb] = [t.secondsAt(a), t.secondsAt(b)];
    const leaving = (t.dayAt(sa + 0.02) - a) / 0.02;
    const average = (b - a) / (sb - sa);
    assert.ok(leaving >= 0.4 * average, `stalls at day ${a}: ${leaving} vs ${average}`);
  }
});

test("a hold stops the calendar on its day for its seconds, then the clock runs on", () => {
  const held = makeTimeline(events, 0, 3652, { 400: 3 });
  assert.equal(held.duration, t.duration + 3);
  const at = held.secondsAt(400);
  assert.equal(held.holdAt(at + 0.01)?.day, 400);
  assert.ok(Math.abs((held.holdAt(at + 1.5)?.progress ?? 0) - 0.5) < 0.01);
  assert.equal(held.dayAt(at + 2.9), 400);
  assert.ok(held.dayAt(at + 3.2) > 400, "the clock runs on after the hold");
  assert.equal(held.holdAt(at + 3.2), undefined);
});

test("the rockets climb from Earth through the launch's hold, and only then", () => {
  const launch = at("foundry-seed-launch");
  assert.equal(stageAt(launch - 1, data).launch, 0);
  assert.equal(stageAt(launch, data, 0.3).launch, 0.3);
  assert.equal(stageAt(launch + 0.5, data).launch, 1);
  const s = clock.secondsAt(launch);
  assert.equal(clock.holdAt(s + 1)?.day, launch);
});

test("secondsAt undoes dayAt", () => {
  for (const day of [0, 5, 405, 800, 3310, 3600, 3652]) {
    assert.ok(Math.abs(t.dayAt(t.secondsAt(day)) - day) < 0.01, `day ${day}`);
  }
});

const data = journeyData(run());
const at = (id: string) => data.days[id] as number;
const clock = makeTimeline(
  data.events.map((e) => e.day),
  data.start,
  data.end,
  holds(data),
);
const v = (day: number) => venusAt(day, data);

test("every caption is a date the model has, inside the decade, and the clock ends on the deadline", () => {
  const ids = new Set<string>(DAY_IDS);
  for (const e of EVENTS) assert.ok(ids.has(e.id), `${e.id} is captioned but not in DAY_IDS`);
  for (const e of data.events) {
    // A caption past the deadline would stretch the clock beyond it, and the planet would jump
    // back to the deadline when playback ends.
    assert.ok(e.day >= data.start && e.day <= data.end, `${e.text} on day ${e.day}`);
  }
  let prev = data.start;
  for (let s = 0; s <= clock.duration + 1; s += 0.1) {
    const d = clock.dayAt(s);
    assert.ok(d >= prev && d <= data.end, `day ${d} at ${s}s`);
    prev = d;
  }
  assert.equal(prev, data.end);
});

test("the plan's story ends on its deadline", () => {
  assert.equal(data.end, data.deadline);
});

test("a late variant's story runs past the deadline to its own finish, and holds together", () => {
  // Doubling every 90 days, the Foundry finishes years late: Venus is Earth-like after the deadline.
  const late = journeyData(run({ "foundry-doubling-days": 90 }));
  const earthLike = late.days["traj-earth-like"] as number;
  assert.ok(earthLike > late.deadline, "the variant finishes after the deadline");
  assert.ok(late.end >= earthLike, "the story reaches the finish");
  const lateClock = makeTimeline(
    late.events.map((e) => e.day),
    late.start,
    late.end,
    holds(late),
  );
  assert.equal(lateClock.dayAt(lateClock.duration), late.end);
  for (const e of late.events) assert.ok(e.day >= late.start && e.day <= late.end, e.text);
  const story = director(late, lateClock);
  for (let d = late.start; d <= late.end; d += 5) {
    const s = stageAt(d, late);
    const all = { ...s, ...s.venus, venus: 0 };
    for (const [k, x] of Object.entries(all)) {
      assert.ok(Number.isFinite(x) && x >= 0 && x <= 1 + 1e-9, `${k} is ${x} on day ${d}`);
    }
    const pose = story.pose(d);
    assert.ok(pose.frame > 0 && pose.dir.every(Number.isFinite), `camera on day ${d}`);
  }
  // Venus ends the late story finished, as the plan's does.
  const last = stageAt(late.end, late).venus;
  assert.ok(last.life > 0.99, `life ${last.life} at the end`);
});

test("every stage value on every day of the decade is a share from 0 to 1", () => {
  for (let d = data.start; d <= data.end; d += 3) {
    const s = stageAt(d, data);
    const all = { ...s, ...s.venus, venus: 0 };
    for (const [k, x] of Object.entries(all)) {
      assert.ok(Number.isFinite(x) && x >= 0 && x <= 1 + 1e-9, `${k} is ${x} on day ${d}`);
    }
  }
});

test("the story visits every world, in the order the plan reaches them", () => {
  const chapters = new Set(data.events.map((e) => e.chapter));
  for (const c of ["earth", "mercury", "ceres", "lattice", "venus"] as const) {
    assert.ok(chapters.has(c), `no caption in the ${c} chapter`);
  }
  const first = (c: string) => data.events.find((e) => e.chapter === c)?.day ?? Number.NaN;
  assert.ok(first("earth") < first("mercury") && first("mercury") <= first("ceres"));
  assert.ok(first("lattice") < at("ice-launch-start"));
  assert.equal(data.events.at(-1)?.chapter, "venus");
});

test("the worlds sit where the model's ledger has them, and Mercury runs its orbit fastest", () => {
  const r = run();
  const { place } = placer(data);
  for (const world of ["mercury", "venus", "earth", "ceres"] as const) {
    const lon = r.series.get(`orbit-${world}-longitude`)?.points ?? [];
    const dist = r.series.get(`orbit-${world}-distance`)?.points ?? [];
    assert.ok(lon.length > 100, `${world} has no orbit series`);
    for (let i = 0; i < lon.length; i += 25) {
      const p = lon[i] as { x: number; y: number };
      const q = place(world, p.x);
      const off = Math.abs(((q.longitude - p.y + 540) % 360) - 180);
      assert.ok(off < 1e-6, `${world} on day ${p.x}: ${q.longitude} vs ${p.y}`);
      assert.ok(Math.abs(q.distance - (dist[i] as { y: number }).y) < 1e-9);
    }
  }
  const sweep = (world: "mercury" | "ceres") =>
    (place(world, data.start + 30).longitude - place(world, data.start).longitude + 360) % 360;
  assert.ok(
    sweep("mercury") > 60 && sweep("ceres") < 10,
    "Mercury goes round in 88 days, Ceres in 4.6 years",
  );
});

test("each crossing leaves one world and arrives at the next", () => {
  for (const [from, to, launch, land] of [
    ["earth", "mercury", "foundry-seed-launch", "foundry-landing"],
    ["earth", "ceres", "ceres-seed-launch", "ceres-landing"],
    ["ceres", "venus", "ice-launch-start", "first-arrival"],
  ] as const) {
    const a = placer(data).place(from, at(launch));
    const b = placer(data).place(to, at(land));
    const p0 = transfer(a, b, 0);
    const p1 = transfer(a, b, 1);
    const want0 = polar(a.longitude, out(a.distance));
    const want1 = polar(b.longitude, out(b.distance));
    assert.ok(
      length3([p0[0] - want0[0], 0, p0[2] - want0[2]]) < 1e-6,
      `${from} to ${to} leaves ${from}`,
    );
    assert.ok(
      length3([p1[0] - want1[0], 0, p1[2] - want1[2]]) < 1e-6,
      `${from} to ${to} reaches ${to}`,
    );
    // Never through the Sun: the path stays outside the inner world's orbit, less a margin.
    for (let t = 0; t <= 1; t += 0.05) {
      const r = length3(transfer(a, b, t));
      assert.ok(r > out(Math.min(a.distance, b.distance)) * 0.97, `${from} to ${to} dips to ${r}`);
    }
  }
  const story = director(data, clock);
  const seed = story.seedPath("mercury", at("foundry-landing"));
  const mercury = placer(data).at("mercury", at("foundry-landing"));
  assert.ok(
    length3([seed[0] - mercury[0], 0, seed[2] - mercury[2]]) < 1e-6,
    "the seed lands on Mercury",
  );
});

test("the camera has a shot for every day, never inside a world, and ends on Venus", () => {
  const shots = script(data);
  for (let i = 1; i < shots.length; i++) {
    assert.ok(
      (shots[i] as { day: number }).day >= (shots[i - 1] as { day: number }).day,
      `shot ${i} out of order`,
    );
  }
  const story = director(data, clock);
  const { at: where } = placer(data);
  for (let d = data.start; d <= data.end; d += 2) {
    const pose = story.pose(d);
    for (const x of [...pose.target, ...pose.dir, pose.frame, pose.skyTurn]) {
      assert.ok(Number.isFinite(x), `pose not finite on day ${d}`);
    }
    assert.ok(Math.abs(length3(pose.dir) - 1) < 1e-6, `direction not unit on day ${d}`);
    // The frame's half-height never shrinks inside the world the camera is looking at.
    for (const world of ["mercury", "venus", "earth", "ceres"] as const) {
      const p = where(world, d);
      const near = length3([pose.target[0] - p[0], pose.target[1] - p[1], pose.target[2] - p[2]]);
      if (near < 1e-6)
        assert.ok(pose.frame > RADIUS[world] * 1.05, `${world} overfills on day ${d}`);
    }
  }
  assert.equal(story.pose(data.end).chapter, "venus");
});

test("no Braking Ring: the Bricks fall straight into the air between the first and last arrival", () => {
  for (const id of DAY_IDS) assert.ok(!/^ring-|^lowering-|first-catch/.test(id), id);
  const keys = Object.keys(stageAt(data.end, data));
  assert.ok(!keys.includes("ring") && !keys.includes("catching"));
  assert.ok(data.dropLatitude > 0 && data.dropLatitude < 90);
  assert.ok(v(at("first-arrival") - 2).iceFront < 1);
  assert.equal(v(at("first-arrival")).iceFront, 1);
  const mid = (at("first-arrival") + at("last-arrival")) / 2;
  assert.ok(v(mid).iceFront === 1 && v(mid).iceTail < 1);
  assert.ok(v(at("last-arrival") - 2).iceTail < 1);
  assert.equal(v(at("last-arrival")).iceTail, 1);
  assert.equal(v(at("ice-launch-start") - 1).iceFront, 0);
});

test("the Lattice lights the Crown while Ceres fires, and the canopies while the Exhaust pumps", () => {
  const s = (day: number) => stageAt(day, data);
  assert.equal(s(at("ice-launch-start") - 11).beamCeres, 0);
  const firing = (at("ice-launch-start") + at("ice-launch-end")) / 2;
  assert.ok(s(firing).beamCeres === 1 && s(firing).firing === 1 && s(firing).crown === 1);
  assert.equal(s(at("ice-launch-end") + 11).beamCeres, 0);
  assert.equal(s(at("cooling-start") - 11).beamVenus, 0);
  const pumping = (at("cooling-start") + at("cooling-end")) / 2;
  assert.ok(s(pumping).beamVenus === 1 && s(pumping).venus.exhaust > 0);
  assert.equal(s(data.end).beamVenus, 0);
  assert.equal(s(data.end).venus.exhaust, 0);
  // The Lattice flies before it is asked to power anything.
  assert.ok(s(at("ice-launch-start")).petals > 0.99);
  assert.ok(s(at("helios-first-petals") - 1).petals === 0);
});

test("the Foundry and the factories grow from a seed to their full size by doubling", () => {
  const s = (day: number) => stageAt(day, data);
  assert.equal(s(at("foundry-landing") - 1).foundry, 0);
  assert.ok(
    s(at("foundry-landing") + 1).foundry > 0 && s(at("foundry-landing") + 1).foundry < 0.01,
  );
  assert.equal(s(at("foundry-full-scale")).foundry, 1);
  const half = at("foundry-full-scale") - data.foundryDoubling;
  assert.ok(
    Math.abs(s(half).foundry - 0.5) < 1e-9,
    "half the final mass one doubling before full scale",
  );
  assert.equal(s(at("ceres-landing") - 1).factories, 0);
  assert.equal(s(at("ceres-full-scale")).factories, 1);
});

test("the new water rains out, freezes, and melts, and the seas only grow", () => {
  const water = (day: number) => v(day).ocean + v(day).waterIce;
  // Nothing before the first Brick arrives, nor before the air reaches its dew point.
  assert.equal(water(at("first-arrival") - 1), 0);
  assert.equal(water(Math.min(at("traj-water-rain"), at("first-arrival")) - 1), 0);
  const raining = (at("traj-water-rain") + at("traj-water-frozen")) / 2;
  assert.ok(v(raining).ocean > 0 && v(raining).waterIce === 0, "liquid seas while it rains");
  const frozen = (at("traj-water-frozen") + at("traj-warming")) / 2;
  assert.ok(v(frozen).waterIce > 0.99 && v(frozen).ocean < 1e-9, "frozen while the air is cold");
  assert.ok(v(at("traj-earth-like")).ocean > 0.99, "melted when Venus is Earth-like");
  assert.ok(v(at("traj-earth-like")).waterIce < 1e-9);
  let prev = 0;
  for (let d = at("first-arrival"); d <= data.end; d += 2) {
    const w = water(d);
    assert.ok(w >= prev - 1e-9, `water falls on day ${d}: ${prev} to ${w}`);
    prev = w;
  }
  assert.ok(prev > 0.99, "all the water is down at the deadline");
  assert.ok(v(at("traj-water-rain")).waterClouds > 0);
  assert.equal(v(frozen).waterClouds, 0);
  assert.ok(v(data.end).waterClouds > 0.99);
});

test("the CO₂ seas follow the simulated air: they fill, drain while the Bricks' heat boils them back, and refill", () => {
  const level = (day: number) => v(day).co2Level;
  assert.equal(level(at("cooling-start") - 30), 0);
  const peak = at("traj-rewarm-peak");
  assert.ok(peak > at("traj-clear-rain") && peak < at("traj-rerain"));
  assert.ok(level(peak - 60) > level(peak) + 0.05, "drains as the air warms back");
  assert.ok(level(at("traj-rerain") + 120) > level(peak), "refills once the pumps catch up");
  assert.ok(level(at("traj-cold") + 5) > 0.99, "all of it is down once the Frost Towers finish");
  assert.ok(data.capCover > 0.2 && data.capCover < 0.5);
  assert.ok(data.seaCover > 0 && data.seaCover < 0.05);
});

test("the readings the dialog shows are the model's own series", () => {
  const r = run();
  for (const reading of data.readouts) {
    const full = r.series.get(reading.id)?.points ?? [];
    assert.ok(full.length > 0, `${reading.id} is not a series`);
    assert.equal(reading.points[0]?.[1], full[0]?.y);
    assert.equal(reading.points.at(-1)?.[1], full.at(-1)?.y);
  }
});

test("the readings round as the site does, and say so when a series has not started", () => {
  const [temp, pressure, oxygen, pump] = data.readouts as [Readout, Readout, Readout, Readout];
  assert.equal(formatReading(temp, 734.4), "734\u00a0K (461\u00a0°C)");
  assert.equal(formatReading(pressure, 9.25e6), "92.5\u00a0bar");
  assert.equal(formatReading(oxygen, 25_310), "25.3\u00a0kPa");
  assert.equal(formatReading(pump, 2.10302e20), "2.1\u00a0×\u00a010²⁰\u00a0W");
  assert.equal(formatReading(pump, 0), "off");
  assert.equal(formatReading(oxygen, undefined), "not yet");
});

test("no shader takes pow() or sqrt() of a base that can go below zero", async () => {
  const calls: string[] = [];
  for (const file of ["glsl.ts", "venus-glsl.ts"]) {
    const shaders = await import(`../components/journey/${file}`);
    for (const [name, src] of Object.entries(shaders)) {
      if (typeof src !== "string") continue;
      for (const m of src.matchAll(/\b(pow|sqrt)\(/g)) {
        const rest = src.slice((m.index ?? 0) + m[0].length);
        calls.push(`${file} ${name}: ${m[1]}(${rest.slice(0, 40).split("\n")[0]}`);
        // A real GPU gives NaN for a negative base, and one NaN pixel blacks out the frame via bloom.
        assert.match(rest, /^(max|clamp)\(/, `${file} ${name} calls ${m[1]}( ${rest.slice(0, 50)}`);
      }
    }
  }
  assert.ok(
    calls.length >= 20,
    `found only ${calls.length} calls; is the scan reading the shaders?`,
  );
});

test("a fast Foundry's water lands frozen: the story has no rain, and the seas still fill", () => {
  // Doubling every 30 days, the pumps cool the air below freezing before the first Bricks arrive,
  // so their water never rains out. The model dates that rain at its horizon, as never.
  const r = run({ "foundry-doubling-days": 30 });
  const fast = journeyData(r);
  assert.ok(r.get("traj-freeze").value < r.get("first-arrival").value, "the air froze first");
  assert.ok(r.get("traj-water-rain").value > fast.simulated, "the rain never came");
  const rain = EVENTS.find((e) => e.id === "traj-water-rain")?.text ?? "?";
  assert.ok(!fast.events.some((e) => e.text.includes(rain)), "no rain in the story");
  assert.equal(fast.end, fast.deadline, "on time, so the story ends on the deadline");
  const cold = (fast.days["last-arrival"] as number) + 20;
  assert.ok(cold < (fast.days["traj-warming"] as number));
  assert.ok(venusAt(cold, fast).waterIce > 0.9, "the water lies frozen until the Veil opens");
  assert.equal(venusAt(cold, fast).ocean, 0);
  assert.ok(venusAt(fast.end, fast).ocean > 0.9, "and the finished planet has its seas");
  // The plan's own water rains, and every one of its events is in the story.
  const plan = journeyData(run());
  assert.ok(plan.events.some((e) => e.text.includes(rain)));
});
