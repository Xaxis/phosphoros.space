# Genesis Biota

Engineered Earth microbes, algae, lichens and mosses are seeded once the oxygen is in and the new oceans
have held their pH, from [1 December 2036](../numbers.md?date=day#genesis-start), so the sunlit water is
green by [12 December 2036](../numbers.md?date=day#genesis-end). They start a food web, draw nutrients from the nitrogen sky and begin turning bare basalt
and cap graphite into soil. Trees, crops and animals come later, after 2040.

<!-- figure:venus-compare -->
![Venus today, Venus in 2036, and Earth](../../figures/svg/venus-compare.svg)
<!-- /figure -->

## Principle

### The world they are seeded into

The day-by-day [simulation](../plan.md#the-simulated-atmosphere) reaches Earth-like air on
[30 September 2036](../numbers.md?date=day#traj-earth-like): [2.4 bar](../numbers.md#final-pressure) in
all, of which [2.1 bar](../numbers.md#n2-pressure) is nitrogen and
[0.25 bar](../numbers.md#o2-target-pressure) oxygen, with [310 ppm](../numbers.md#final-co2-ppm) of CO₂, at
Earth's mean [288 K](../numbers.md#earth-surface-temp). Oxygen is only
[11%](../numbers.md#final-o2-share) of that air, but its pressure is [1.2](../numbers.md#o2-vs-earth)
times Earth's sea-level oxygen, and pressure is what cells feel.

The oceans average [217 m](../numbers.md#ocean-depth) deep. They are melted ice, fresh to brackish, with
sulfate from the [Acid Sweep](acid.md) and little dissolved carbon. The Veil and its Lanterns give a
[24 h](../numbers.md#day-length) day, opening to [52%](../numbers.md#veil-day-transmission) for
Earth-strength light. Sunlight is turning the new oxygen into ozone, but the layer is young and thin. The
land is bare basalt and the graphite caps of the [cryo-continents](cryo.md).

### Why engineered

No Earth organism has lived in exactly this. Each group starts from Earth species adapted to something
close (cold water, fresh water, bare volcanic rock) and is engineered for the rest. Melted ice carries
little dissolved carbon, so the cyanobacteria get stronger carbon-concentrating pumps. The water is rich
in sulfate, so they tolerate it. The sky is nitrogen-rich, so the nitrogen fixers are tuned to use it.
The water runs over basalt, so the diatoms build their silica shells from what basalt releases.

### The cloud-life gate comes first

Genesis starts with a question: does anything already live on Venus? A survey of the clouds flies from
[June 2027](../numbers.md?date=month#survey-start) to
[December 2028](../numbers.md?date=month#survey-end). If it finds a credible sign of native life by the
gate on [15 December 2028](../numbers.md?date=day#life-gate), the program stops before the Veil goes up:
cooling the planet would destroy the clouds that life lives in. Seeding Earth life on another world cannot
be undone, and the Outer Space Treaty requires states to avoid harmful contamination of other worlds
([Outer Space Treaty](../sources.md#outer-space-treaty)). The gate and its science are on the
[Research Agenda](../research.md#the-cloud-life-gate) and in
[Risks and Governance](../risks.md#the-native-life-gate).

## Design

### The organisms

<!-- table:groups genesis -->
| Group | Starting point | Engineered traits | Job |
| --- | --- | --- | --- |
| Ocean cyanobacteria | Synechococcus-type | Stronger carbon-concentrating pumps; sulfate tolerance | First oxygen and food web |
| Nitrogen fixers | Anabaena and Trichodesmium-type | Faster fixation under a nitrogen-rich sky | Nutrients from the air |
| Diatoms | Marine diatoms | Silica from basalt-rich water | Productivity and carbon burial |
| Lichens and mosses | Arctic and volcanic-field species | UV and cold tolerance | Colonize rock and caps |
| Soil consortium | Rock-weathering bacteria and fungi | Fast basalt weathering | Release phosphorus and potassium, build soil |
<!-- /table -->

Ocean cyanobacteria and nitrogen fixers go first: they make oxygen and food from sunlight and pull
nitrogen from the air into forms other life can use. Diatoms follow once the water carries enough silica.
On land, lichens and mosses colonize rock and caps, where ultraviolet light is strongest while the ozone
is thin. The soil consortium weathers basalt to free phosphorus and potassium and builds soil.

### Black loam

Shores and caps get a starter soil, "black loam": crushed basalt, graphite from the
[Graphite Forges](forges.md) and a microbial starter, laid [10 cm](../numbers.md#genesis-soil-min) to
[30 cm](../numbers.md#genesis-soil-max) deep. The Forges leave
[2.4 × 10¹⁷ kg](../numbers.md#graphite-stockpile) of graphite beyond what the caps need.

### The release gate

No organism is released until three things are true:

1. The oceans have held a pH above [7.5](../numbers.md#genesis-ph-min) for
   [90 d](../numbers.md#genesis-ph-days), the [Acid Sweep](acid.md)'s job.
2. The oxygen is in: [0.25 bar](../numbers.md#o2-target-pressure), when the Forges finish.
3. Ozone is detectable.

The ice melts when the caps are sealed and the Veil opens, on
[2 September 2036](../numbers.md?date=day#traj-warming), so the pH hold ends on
[1 December 2036](../numbers.md?date=day#genesis-ph-clear). The Forges finish on
[30 September 2036](../numbers.md?date=day#forge-end). Seeding begins at the later of the two, on
[1 December 2036](../numbers.md?date=day#genesis-start). Version 2 seeded from mid-2036, before its own
oxygen condition could be met. Version 3 waits for the gate ([corrections](../about.md#corrections)).

### Seeding

Drones spray cyanobacteria and nitrogen fixers over sunlit water at
[100 per cm³](../numbers.md#genesis-seed-density). Doubling every [1 d](../numbers.md#genesis-doubling-days),
they reach [200,000 per cm³](../numbers.md#genesis-bloom-density), as rich as well-lit seawater on Earth, in
[11 d](../numbers.md#genesis-green-days): the sunlit water is green by
[12 December 2036](../numbers.md?date=day#genesis-end), before the deadline
([check](../numbers.md#check-genesis-by-deadline)). Crews of machines lay black loam
on shores and caps and sow lichens, mosses and the soil consortium. Orbiters watch chlorophyll and oxygen
across the planet, and the Choir's digital twin of Venus forecasts where each population will take hold
and where it is failing.

## Specifications

<!-- table:specs genesis -->
| Parameter | Value |
| --- | --- |
| Air | [2.4 bar](../numbers.md#final-pressure): [2.1 bar](../numbers.md#n2-pressure) nitrogen, [0.25 bar](../numbers.md#o2-target-pressure) oxygen, [310 ppm](../numbers.md#final-co2-ppm) CO₂ |
| Oceans | [217 m](../numbers.md#ocean-depth) deep on average, fresh to brackish and sulfate-rich |
| Light | [24 h](../numbers.md#day-length) days at Earth strength |
| Seeding | From [1 December 2036](../numbers.md?date=day#genesis-start), the later of the oxygen ([30 September 2036](../numbers.md?date=day#forge-end)) and the pH gate ([1 December 2036](../numbers.md?date=day#genesis-ph-clear)) |
| Living oceans | [100 per cm³](../numbers.md#genesis-seed-density) seeded, [200,000 per cm³](../numbers.md#genesis-bloom-density) by [12 December 2036](../numbers.md?date=day#genesis-end), doubling every [1 d](../numbers.md#genesis-doubling-days) |
| Temperature | [288 K](../numbers.md#genesis-air-temp) mean air temperature when seeding begins; Earth-like is at least [285 K](../numbers.md#earth-like-temp) |
| Ozone | Forms from the new oxygen. The model does not compute the layer, so the gate's ozone condition is a measurement, not a model number |
<!-- /table -->

## What is invented

> **Invented:** Organisms engineered for cold, fresh, sulfate-rich water under
> [2.4 bar](../numbers.md#final-pressure) of nitrogen-rich air. Their starting points are real Earth
> species; the engineered traits are not yet made.

> **Invented:** Cyanobacteria that keep doubling every [1 d](../numbers.md#genesis-doubling-days) in that
> water, as the fastest strains do in culture.

> **Precedent:** Sagan proposed seeding Venus's clouds with algae to turn its CO₂ into oxygen
> ([Sagan 1961](../sources.md#sagan-1961)). Algae alone cannot cool the planet or take the carbon out of
> the air, so Phosphoros seeds life last, into a world already cooled and given its oxygen.

## Build sequence

- **[June 2027](../numbers.md?date=month#survey-start):** The cloud-life survey begins.
- **[December 2028](../numbers.md?date=month#life-gate):** The gate. No native life found, or the program
  stops. From here the organisms are engineered and tested on Earth in simulated 2036 conditions.
- **[2 September 2036](../numbers.md?date=day#traj-warming):** The caps are sealed, the Veil opens and the
  ice melts into oceans. The pH clock starts.
- **[30 September 2036](../numbers.md?date=day#forge-end):** The Forges finish and the air becomes Earth-like.
- **[1 December 2036](../numbers.md?date=day#genesis-start):** The pH has held; the gate opens and seeding
  begins.
- **[12 December 2036](../numbers.md?date=day#genesis-end):** The sunlit water is green. Trees, crops and
  animals follow after 2040, once there is soil to grow in.

## Failure modes and safeguards

- **The survey finds life.** The program stops before the Veil goes up. This is the one gate that can end
  Phosphoros, and it is meant to.
- **A strain fails to take hold.** Each group is seeded from a library of alternative strains, and the
  orbital watch shows within weeks where a population is failing.
- **The oceans turn acid.** Seeding waits until the pH has held for the full
  [90 d](../numbers.md#genesis-ph-days).
- **The oxygen is late.** Seeding waits for the Forges. The simulated Earth-like date slips with them, and
  so does everything that depends on it.
- **Ultraviolet before the ozone thickens.** UV-tolerant lichens and mosses go onto land first; ocean life
  is shielded by the water above it.
- **Life on Venus cannot be recalled.** Once seeded, Earth life is there for good. That is why the gate
  comes years before the Veil, and why the plan needs an international framework agreed before the seed
  foundry launches.

## Reproduce these numbers

Genesis has no model module of its own. The world it is seeded into comes from
[calc/src/model/outcome.ts](../../calc/src/model/outcome.ts) (the finished air),
[calc/src/model/trajectory.ts](../../calc/src/model/trajectory.ts) (the dates) and
[calc/src/model/forges.ts](../../calc/src/model/forges.ts) (the oxygen).

```sh
pnpm calc --only final-pressure     # the finished air
pnpm calc --only o2-vs-earth        # oxygen pressure against Earth's
pnpm calc --only traj-earth-like    # the day the simulated air is Earth-like
```

In the [Explorer](https://phosphoros.space/explore), lower the Photonic Exhaust's peak (`exhaust-peak`):
the air cools later, the ice melts later and the Earth-like date moves into 2037 before the bottom of the
range, taking seeding with it. `pnpm calc --set forge-end=2037-02-01` shows the same from the oxygen
side: the Earth-like check fails, because the gate needs the Forges finished.
