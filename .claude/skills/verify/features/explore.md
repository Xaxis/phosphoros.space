# Explorer

Change the plan's key assumptions in the browser and watch every consequence and physics check recompute.

<!-- covers: page:/explore -->

## Sub-features

- sliders: one per ranged input (`range:` in `data/assumptions.yaml` or `data/constants.yaml`), log-scaled when the range spans more than a factor of four. Each carries its basis as a text badge (`BasisTag`), under the site's basis legend.
- margins: under each slider, a band and a sentence ("Moved alone, the plan holds between ... and ...") from `data/margins.json`, which `tools/margins.ts` computes and `pnpm docs` refreshes when the model changes. The Budget page's "How much room the plan has" tables come from the same file.
- verdict: whether the simulated Earth-like date beats the deadline, and how many checks pass.
- consequences: a table of plan value against this variant, good and bad changes marked.
- checks: every physics check, with "now passes" or "now fails" against the plan.
- figures: the Gantt, the trajectory and the energy budget, drawn from the variant (`VariantFigures` in `web/components/Explorer.tsx`). A late variant extends the Gantt past the deadline and the captions say "after" and "short".
- share: the variant lives in the URL (`?set=id:value,...`); "Copy a link" copies it; `#<id>` focuses a slider.

## How to reach it

- `/explore`, the header's Explore link, the home page's "Change an assumption" button, and "Explore" on the card of any ranged number.

## How to check it

Static: `cd web && pnpm typecheck`.

Runtime (Chromium via playwright-core, SwiftShader):

```sh
node -e '
const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ args: ["--use-angle=swiftshader"] });
  const p = await b.newPage();
  await p.goto(`http://localhost:${process.env.PORT}/explore?set=foundry-doubling-days:63`);
  await p.waitForSelector(".explorer-verdict");
  console.log(await p.textContent(".explorer-verdict-title"));
  await b.close();
})();'
```

Proves it when: with a 63-day doubling the verdict reads "Venus misses the deadline"; without `?set` it reads "Venus is Earth-like in time". `node tools/layout-check.ts http://localhost:$PORT` prints `ok explorer marks basis in words, shows each slider's margin and redraws the Gantt for a variant`: three figures, a badge and a margin band per slider, the doubling time's margin sentence ("holds up to ..."), and the Gantt showing the variant's own Earth-like date.

## Gotchas

- The model runs in the browser, so `@phosphoros/calc` (index) must stay free of Node imports; file access lives in `@phosphoros/calc/load`.
- A run takes 30 to 160 ms; slider changes are deferred with `useDeferredValue`. The ozone model is most of it.
- The margin bands are for one input moved alone from the plan; they do not move with the other sliders.
- A variant the model cannot compute shows "The model cannot run with these assumptions" and the model's reason, e.g. `?set=foundry-doubling-days:120` (the Lattice finishes after the deadline). The model throws rather than report a meaningless budget share.
- Screen readers hear only the verdict sentence, half a second after the last slider move (`role="status"`); the results panel is not a live region, or every step would read the whole table.
