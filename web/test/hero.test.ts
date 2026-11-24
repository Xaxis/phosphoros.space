/**
 * The hero's clock and stages, without a browser: the clock plays the decade once and keeps moving
 * into every event, the Bricks burst in the air between the first and last arrival, and the new
 * water rains out, freezes and melts without the seas ever shrinking.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { run } from "../../calc/src/load.ts";
import { stageAt } from "../components/hero/stage.ts";
import { makeTimeline } from "../components/hero/timeline.ts";
import type { HeroData } from "../components/hero/types.ts";
import { DAY_IDS, EVENTS } from "../lib/hero-events.ts";

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

test("secondsAt undoes dayAt", () => {
  for (const day of [0, 5, 405, 800, 3310, 3600, 3652]) {
    assert.ok(Math.abs(t.dayAt(t.secondsAt(day)) - day) < 0.01, `day ${day}`);
  }
});

/** The hero's data, built from the model the way lib/hero.ts builds it (which is server-only). */
function heroFromModel(): HeroData {
  const r = run();
  const days = Object.fromEntries(DAY_IDS.map((id) => [id, r.get(id).value]));
  const pts = (id: string) =>
    (r.series.get(id)?.points ?? []).map((p) => [p.x, p.y] as [number, number]);
  return {
    start: r.get("program-start").value,
    end: r.get("deadline").value,
    days,
    events: EVENTS.map((e) => ({ day: r.get(e.id).value, when: "", text: e.text, tech: e.tech })),
    temperature: pts("traj-temperature"),
    pressure: pts("traj-pressure"),
    oxygen: pts("traj-o2"),
    co2: pts("traj-co2"),
    pump: pts("traj-pump-power"),
    dayTransmission: r.get("veil-day-transmission").value,
    earthLikeTemp: r.get("earth-surface-temp").value,
    surfaceTemp: r.get("venus-surface-temp").value,
    dropLatitude: r.get("ice-drop-latitude").value,
    capCover: r.get("cryo-footprint-share").value,
    seaCover: r.get("sea-cover-share").value,
  };
}
const data = heroFromModel();
const at = (id: string) => data.days[id] as number;

test("every caption is a date the model has, inside the decade, and the clock ends on the deadline", () => {
  const ids = new Set<string>(DAY_IDS);
  for (const e of EVENTS) assert.ok(ids.has(e.id), `${e.id} is captioned but not in DAY_IDS`);
  for (const e of data.events) {
    // A caption past the deadline would stretch the clock beyond it, and the planet would jump
    // back to the deadline when playback ends.
    assert.ok(e.day >= data.start && e.day <= data.end, `${e.text} on day ${e.day}`);
  }
  const clock = makeTimeline(
    data.events.map((e) => e.day),
    data.start,
    data.end,
  );
  let prev = data.start;
  for (let s = 0; s <= clock.duration + 1; s += 0.1) {
    const d = clock.dayAt(s);
    assert.ok(d >= prev && d <= data.end, `day ${d} at ${s}s`);
    prev = d;
  }
  assert.equal(prev, data.end);
  // Every day of the decade draws without a missing date.
  for (let d = data.start; d <= data.end; d += 5) stageAt(d, data);
});

test("no Braking Ring: the Bricks fall straight into the air between the first and last arrival", () => {
  for (const id of DAY_IDS) assert.ok(!/^ring-|^lowering-|first-catch/.test(id), id);
  const keys = Object.keys(stageAt(data.end, data));
  assert.ok(!keys.includes("ring") && !keys.includes("catching"));
  assert.ok(data.dropLatitude > 0 && data.dropLatitude < 90);
  // The stream's front reaches the air on the first arrival and its tail on the last, so the
  // Bricks burst in the air between those dates and at no other time.
  const s = (day: number) => stageAt(day, data);
  assert.ok(s(at("first-arrival") - 2).iceFront < 1);
  assert.equal(s(at("first-arrival")).iceFront, 1);
  const mid = (at("first-arrival") + at("last-arrival")) / 2;
  assert.ok(s(mid).iceFront === 1 && s(mid).iceTail < 1);
  assert.ok(s(at("last-arrival") - 2).iceTail < 1);
  assert.equal(s(at("last-arrival")).iceTail, 1);
  assert.equal(s(at("ice-launch-start") - 1).iceFront, 0);
});

test("the Lattice's beams reach the tiles only while the Exhaust pumps", () => {
  const s = (day: number) => stageAt(day, data);
  assert.equal(s(at("cooling-start") - 41).beams, 0);
  const pumping = (at("cooling-start") + at("cooling-end")) / 2;
  assert.ok(s(pumping).beams === 1 && s(pumping).exhaust > 0);
  assert.equal(s(at("cooling-end") + 30).beams, 0);
  assert.equal(s(data.end).beams, 0);
  assert.equal(s(data.end).exhaust, 0);
});

test("the new water rains out, freezes, and melts, and the seas only grow", () => {
  const s = (day: number) => stageAt(day, data);
  const water = (day: number) => s(day).ocean + s(day).waterIce;
  // Nothing before the first Brick arrives, nor before the air reaches its dew point.
  assert.equal(water(at("first-arrival") - 1), 0);
  assert.equal(water(Math.min(at("traj-water-rain"), at("first-arrival")) - 1), 0);
  // Liquid once it rains out, ice once the air is below freezing, liquid again once it melts.
  const raining = (at("traj-water-rain") + at("traj-water-frozen")) / 2;
  assert.ok(s(raining).ocean > 0 && s(raining).waterIce === 0, "liquid seas while it rains");
  const frozen = (at("traj-water-frozen") + at("traj-warming")) / 2;
  assert.ok(s(frozen).waterIce > 0.99 && s(frozen).ocean < 1e-9, "frozen while the air is cold");
  assert.ok(s(at("traj-earth-like")).ocean > 0.99, "melted when Venus is Earth-like");
  assert.ok(s(at("traj-earth-like")).waterIce < 1e-9);
  let prev = 0;
  for (let d = at("first-arrival"); d <= data.end; d += 2) {
    const w = water(d);
    assert.ok(w >= prev - 1e-9, `water falls on day ${d}: ${prev} to ${w}`);
    prev = w;
  }
  assert.ok(prev > 0.99, "all the water is down at the deadline");
  // Clouds of the new water while it rains out, none once it freezes, and over the warm planet.
  assert.ok(s(at("traj-water-rain")).waterClouds > 0);
  assert.equal(s(frozen).waterClouds, 0);
  assert.ok(s(data.end).waterClouds > 0.99);
});

test("the CO₂ seas follow the simulated air: they fill, drain while the Bricks' heat boils them back, and refill", () => {
  const level = (day: number) => stageAt(day, data).co2Level;
  assert.equal(level(at("cooling-start") - 30), 0);
  const peak = at("traj-rewarm-peak");
  assert.ok(peak > at("traj-clear-rain") && peak < at("traj-rerain"));
  assert.ok(level(peak - 60) > level(peak) + 0.05, "drains as the air warms back");
  assert.ok(level(at("traj-rerain") + 120) > level(peak), "refills once the pumps catch up");
  assert.ok(level(at("traj-cold") + 5) > 0.99, "all of it is down once the Frost Towers finish");
  // The model's shares, not the scene's, set how much of the planet each sea covers.
  assert.ok(data.capCover > 0.2 && data.capCover < 0.5);
  assert.ok(data.seaCover > 0 && data.seaCover < 0.05);
});

test("no shader takes pow() or sqrt() of a base that can go below zero", async () => {
  const shaders = await import("../components/hero/shaders.ts");
  const calls: string[] = [];
  for (const [name, src] of Object.entries(shaders)) {
    if (typeof src !== "string") continue;
    for (const m of src.matchAll(/\b(pow|sqrt)\(/g)) {
      const rest = src.slice((m.index ?? 0) + m[0].length);
      calls.push(`${name}: ${m[1]}(${rest.slice(0, 40).split("\n")[0]}`);
      // A real GPU gives NaN for a negative base, and one NaN pixel blacks out the frame via bloom.
      assert.match(rest, /^(max|clamp)\(/, `${name} calls ${m[1]}( ${rest.slice(0, 50)}`);
    }
  }
  assert.ok(
    calls.length >= 10,
    `found only ${calls.length} calls; is the scan reading the shaders?`,
  );
});
