/** Every Explorer slider shows its input's value and moves it over the whole range, finite. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadInputs } from "../../calc/src/load.ts";
import { fromSlider, STEPS, toSlider } from "../lib/slider.ts";

const ranged = [...loadInputs().values()].filter((q) => q.range);

test("every slider shows its input's value on its track", () => {
  assert.ok(ranged.length > 10);
  for (const q of ranged) {
    const step = toSlider(q, q.value);
    assert.ok(Number.isInteger(step) && step >= 0 && step <= STEPS, `${q.id}: step ${step}`);
  }
});

test("every slider's steps are finite values inside its range, in order, end to end", () => {
  for (const q of ranged) {
    const [lo, hi] = q.range as [number, number];
    let prev = Number.NEGATIVE_INFINITY;
    for (let step = 0; step <= STEPS; step += 8) {
      const v = fromSlider(q, step);
      assert.ok(Number.isFinite(v), `${q.id}: step ${step} gives ${v}`);
      assert.ok(v >= lo * 0.999 && v <= hi * 1.001, `${q.id}: ${v} outside ${lo} to ${hi}`);
      assert.ok(v >= prev, `${q.id}: not in order at step ${step}`);
      prev = v;
    }
    assert.equal(fromSlider(q, 0), Number(lo.toPrecision(3)), `${q.id} starts at its low end`);
    assert.equal(fromSlider(q, STEPS), Number(hi.toPrecision(3)), `${q.id} ends at its high end`);
  }
});

test("a range that starts at zero is linear: its slider is not stuck", () => {
  const q = ranged.find((x) => (x.range as [number, number])[0] === 0);
  assert.ok(q, "an input whose range starts at zero");
  assert.equal(toSlider(q, (q.range as [number, number])[1] / 2), STEPS / 2);
});
