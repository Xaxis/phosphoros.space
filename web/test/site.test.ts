/**
 * Links from the site into the repository: a line link must show the lines the site was built from,
 * so it pins to the build's commit; everything else follows main.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.PHOSPHOROS_BUILD = "abc1234";
const { repoUrl, routeFor } = await import("../lib/site.ts");

test("line links pin to the build's commit", () => {
  assert.equal(
    repoUrl("calc/src/model/ring.ts", 42),
    "https://github.com/Xaxis/phosphoros.space/blob/abc1234/calc/src/model/ring.ts#L42",
  );
  assert.equal(
    routeFor("../data/assumptions.yaml#L222", "docs/budget.md"),
    "https://github.com/Xaxis/phosphoros.space/blob/abc1234/data/assumptions.yaml#L222",
  );
});

test("other repository links follow main", () => {
  assert.equal(
    repoUrl("data/sources.yaml"),
    "https://github.com/Xaxis/phosphoros.space/blob/main/data/sources.yaml",
  );
  assert.equal(repoUrl("calc/"), "https://github.com/Xaxis/phosphoros.space/tree/main/calc");
  assert.equal(routeFor("../plan.md#the-veil", "docs/technologies/veil.md"), "/plan#the-veil");
});
