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
- journey: "This variant, flown" (`web/components/journey/JourneyPanel.tsx`), right under the verdict: the home page's 3D journey told from the variant (`journeyData(now.r)`), on one engine that lives as long as the page. A slider move rebuilds the world on the same canvas after the sliders settle (`engine.setData`, 180 ms), keeping the loaded maps (`mapCache` in `world.ts`), the camera and the day shown. Its own play button, slider (the variant's events as filled ticks, the plan's as hollow blue ticks) and caption; the card opens the same full-screen dialog as the hero, titled "This variant". A late variant's story runs past the deadline to its own finish (`end` in `journeyData`), with the deadline as a red tick. When the model cannot run the sliders, it keeps the last variant it could and says so.
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

The journey card: `~/.claude/claude-core/bin/heavy node tools/hero-check.ts http://localhost:$PORT` includes `ok the Explorer flies a late variant past the deadline to its finish` and `ok a slider move retells the story on the same canvas, and the card opens full screen`.

Proves it when: with a 63-day doubling the verdict reads "Venus misses the deadline"; without `?set` it reads "Venus is Earth-like in time". `node tools/layout-check.ts http://localhost:$PORT` prints `ok explorer marks basis in words, shows each slider's margin and redraws the Gantt for a variant`: three figures, a badge and a margin band per slider, the doubling time's margin sentence ("holds up to ..."), and the Gantt showing the variant's own Earth-like date.

## Gotchas

- The model runs in the browser, so `@phosphoros/calc` (index) must stay free of Node imports; file access lives in `@phosphoros/calc/load`.
- A run takes 30 to 160 ms; slider changes are deferred with `useDeferredValue`. The ozone model is most of it.
- The margin bands are for one input moved alone from the plan; they do not move with the other sliders.
- A variant the model cannot compute shows "The model cannot run with these assumptions" and the model's reason, e.g. `?set=foundry-doubling-days:120` (the Lattice finishes after the deadline). The model throws rather than report a meaningless budget share.
- Screen readers hear only the verdict sentence, half a second after the last slider move (`role="status"`); the results panel is not a live region, or every step would read the whole table.
- The journey card's slider steps between the variant's events, not the plan's; with `?set=foundry-doubling-days:90` it runs to 2039 and shows the red deadline tick. Its engine starts paused on 2027 (the hero's autoplays): press play or drag.
- A slider move waits 180 ms before the world is rebuilt, but play, a drag or a step hands the engine the variant on screen first (`sync` in `useJourney.ts`), so a reader never scrubs the story before.
- An event the simulation never reached did not happen in that variant: the model dates it at its horizon (deadline plus three years), and `journeyData` leaves it out of the story (`simulated`). At a 50-day doubling or faster the air is below freezing before the first Bricks arrive, so their water never rains: `?set=foundry-doubling-days:30` has no rain step, ends on the deadline, and its water lies as ice until the Veil opens (`rains` in `stage.ts`; test "a fast Foundry's water lands frozen").
- On a 390px phone, `node tools/layout-check.ts` prints `ok a late variant's journey panel fits a 390px phone, years and all`: below 520px the year labels show every other year, the hidden ones taking no width.
