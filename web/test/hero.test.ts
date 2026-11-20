/**
 * The hero's clock and stages, without a browser: the clock plays the decade once and keeps moving
 * into every event, and the planet's seas only ever grow while the ice melts.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { run } from "../../calc/src/load.ts";
import { stageAt } from "../components/hero/stage.ts";
import { makeTimeline } from "../components/hero/timeline.ts";
import type { HeroData } from "../components/hero/types.ts";

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

test("the seas only grow while the ice melts", () => {
  const r = run();
  const days = Object.fromEntries(
    [
      "veil-build-start",
      "veil-close",
      "aegis-online",
      "ring-build-start",
      "ring-complete",
      "cooling-start",
      "ice-launch-start",
      "ice-launch-end",
      "first-catch",
      "last-arrival",
      "traj-clear-rain",
      "traj-freeze",
      "traj-cold",
      "traj-warming",
      "lowering-start",
      "lowering-end",
      "forge-end",
      "genesis-end",
      "traj-earth-like",
      "deadline",
    ].map((id) => [id, r.get(id).value]),
  );
  const pts = (id: string) =>
    (r.series.get(id)?.points ?? []).map((p) => [p.x, p.y] as [number, number]);
  const data = {
    start: r.get("program-start").value,
    end: r.get("deadline").value,
    days,
    events: [],
    temperature: pts("traj-temperature"),
    pressure: pts("traj-pressure"),
    oxygen: pts("traj-o2"),
    pump: pts("traj-pump-power"),
    dayTransmission: r.get("veil-day-transmission").value,
    earthLikeTemp: r.get("earth-surface-temp").value,
    surfaceTemp: r.get("venus-surface-temp").value,
  } as HeroData;
  let prev = 0;
  for (let d = days["lowering-start"] as number; d <= data.end; d += 2) {
    const s = stageAt(d, data);
    const water = s.ocean + s.waterIce;
    assert.ok(water >= prev - 1e-9, `water falls on day ${d}: ${prev} to ${water}`);
    prev = water;
  }
  assert.ok(prev > 0.99, "the basins are full at the deadline");
});
