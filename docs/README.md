# Phosphoros

**Venus becomes Earth-like by the end of 2036 if we invent one thing above all: a factory that copies
itself every [60 d](numbers.md#foundry-doubling-days). Everything else follows from the energy it unlocks.**

Phosphoros is a complete, internally consistent plan to do that, from 2027 to 2036. It may assume
engineering we do not have yet. It may never break conservation of energy or the second law of
thermodynamics. Every number on these pages comes from [`data/`](../data/) through the model in
[`calc/`](../calc/), every real-world claim cites a [source](sources.md), and every invention says it is
one.

## Venus today, and Venus in 2036

<!-- figure:venus-compare -->
![Venus today, Venus in 2036, and Earth](../figures/svg/venus-compare.svg)
<!-- /figure -->

Today the surface sits at [737 K](numbers.md#venus-surface-temp) under [92 bar](numbers.md#venus-surface-pressure)
of carbon dioxide, beneath clouds of sulfuric acid, with almost no water. At the end of 2036 the plan's
Venus has [2.4 bar](numbers.md#final-pressure) of nitrogen-oxygen air, a [217 m](numbers.md#ocean-depth)
global ocean, water clouds and a [24 h](numbers.md#day-length) day. The full comparison is on
[The Problem](problem.md) and [The Plan](plan.md).

## The five moves

**1. Grow an industry ([2028](numbers.md?date=year#foundry-seed-launch) to [2033](numbers.md?date=year#foundry-full-scale)).** A [1,000 t](numbers.md#foundry-seed-mass) seed foundry launches on
[1 October 2028](numbers.md?date=day#foundry-seed-launch), lands on Mercury on
[14 January 2029](numbers.md?date=day#foundry-landing) and rebuilds itself from rock every
[60 d](numbers.md#foundry-doubling-days). [26](numbers.md#foundry-doublings) doublings later, in
[May 2033](numbers.md?date=month#foundry-full-scale), it is [6.7 × 10¹³ kg](numbers.md#foundry-final-mass)
of machinery, [2 × 10⁻¹⁰](numbers.md#foundry-mercury-share) of Mercury's mass.
([Ouroboros Foundry](technologies/ouroboros.md), [Choir](technologies/choir.md))

**2. Switch off the Sun ([2032](numbers.md?date=year#veil-close)).** The Hesperus Veil, [5.4 × 10¹⁴ m²](numbers.md#veil-area) of light-bending
film held just sunward of the Sun-Venus L1 point, [1.11 × 10⁶ km](numbers.md#veil-distance) out, turns
[99.9%](numbers.md#veil-block-fraction) of the sunlight away from Venus from
[December 2032](numbers.md?date=month#veil-close). Later it becomes the planet's dimmer switch and day clock.
([Hesperus Veil](technologies/veil.md), [Aegis Shield](technologies/aegis.md))

**3. Pump the heat out ([2033](numbers.md?date=year#cooling-start) to [2036](numbers.md?date=year#cooling-end)).** The Helios Lattice near Mercury beams
[8.5 × 10¹⁹ W](numbers.md#helios-power) to Venus. Thermal Chimneys lift the deep heat to floating canopies
above the clouds, where the Photonic Exhaust fires it into space as [2.3 µm](numbers.md#exhaust-wavelength)
infrared, up to [5.0 × 10¹⁹ W](numbers.md#exhaust-peak). The CO₂ rains out as liquid from
[July 2034](numbers.md?date=month#traj-clear-rain), freezes, and is sealed under insulated caps as new
land. ([Helios Lattice](technologies/helios.md), [Thermal Chimneys](technologies/chimneys.md),
[Photonic Exhaust](technologies/exhaust.md), [Cryo-continents](technologies/cryo.md))

**4. Bring the water ([2033](numbers.md?date=year#ice-launch-start) to [2036](numbers.md?date=year#lowering-end)).** Coilguns on Ceres launch [1.0 × 10²⁰ kg](numbers.md#ice-mass) of ice,
enough for a [217 m](numbers.md#ocean-depth) ocean. A Braking Ring around Venus catches it and turns its
speed into [5.3 × 10²⁷ J](numbers.md#ring-recovered-energy) of electricity instead of heat, enough to power
the coilguns from [September 2034](numbers.md?date=month#ring-pays-from). Lowering the caught ice to the
surface is an [open problem](risks.md#the-ring-cannot-yet-lower-the-ice).
([Ceres Ice Train](technologies/ice-train.md), [Braking Ring](technologies/ring.md))

**5. Make it breathe ([2035](numbers.md?date=year#forge-start) to [2037](numbers.md?date=year#genesis-end)).** Graphite Forges split CO₂ into
[0.25 bar](numbers.md#o2-target-pressure) of oxygen and the graphite the caps are made of. The Acid Sweep
clears the sulfur, a magnetic shield guards the new water, the Veil sets a
[24 h](numbers.md#day-length) day, and engineered life is seeded once the oxygen is in and the new oceans hold
their pH, from [3 January 2037](numbers.md?date=day#genesis-start), after the deadline
([open problem](budget.md#physics-checks)). ([Graphite Forges](technologies/forges.md),
[Acid Sweep](technologies/acid.md), [Genesis Biota](technologies/genesis.md))

## The one gate that can stop it

A cloud-life survey flies from [June 2027](numbers.md?date=month#survey-start). If it finds a credible sign
of native life in Venus's clouds by the gate on [15 December 2028](numbers.md?date=day#life-gate), the
program stops: cooling the planet would destroy it. See the [Research Agenda](research.md#the-cloud-life-gate)
and [Risks and Governance](risks.md#the-native-life-gate).

## The finish line

<!-- table:finish -->
| Measure | Venus today | End of 2036 | Delivered by |
| --- | --- | --- | --- |
| Mean surface temperature | [737 K](numbers.md#venus-surface-temp) | [288 K](numbers.md#earth-surface-temp), Earth's mean (Earth-like from [285 K](numbers.md#earth-like-temp)) | [Hesperus Veil](technologies/veil.md), [Photonic Exhaust](technologies/exhaust.md) |
| Surface pressure | [92 bar](numbers.md#venus-surface-pressure) | [2.4 bar](numbers.md#final-pressure) | [Cryo-continents](technologies/cryo.md) |
| Nitrogen | [3.5%](numbers.md#venus-n2-fraction) of the air | [2.1 bar](numbers.md#n2-pressure) (kept) | Already there. |
| Oxygen | Trace | [0.25 bar](numbers.md#o2-target-pressure) | [Graphite Forges](technologies/forges.md) |
| CO₂ | [96.5%](numbers.md#venus-co2-fraction) | [230 ppm](numbers.md#final-co2-ppm) | [Cryo-continents](technologies/cryo.md), [Graphite Forges](technologies/forges.md), [Photonic Exhaust](technologies/exhaust.md) |
| Water | Nearly none | [1.0 × 10²⁰ kg](numbers.md#ice-mass), a [217 m](numbers.md#ocean-depth) global ocean | [Ceres Ice Train](technologies/ice-train.md), [Braking Ring](technologies/ring.md) |
| Light cycle | A [117 d](numbers.md#venus-solar-day) solar day | A [24 h](numbers.md#day-length) day | [Hesperus Veil](technologies/veil.md) |
| Clouds | Sulfuric acid | Water | [Acid Sweep](technologies/acid.md) |
<!-- /table -->

The day-by-day [simulation](plan.md#the-simulated-atmosphere) reaches all of it on
[8 October 2036](numbers.md?date=day#traj-earth-like), [84 d](numbers.md#traj-slack-days) before the
deadline.

## The energy budget

<!-- figure:lattice-budget -->
![Energy the Helios Lattice must deliver, against its supply](../figures/svg/lattice-budget.svg)
<!-- /figure -->

The plan must bring [8.5 × 10²⁷ J](numbers.md#budget-demand) to Venus from outside. The Lattice supplies
[9.2 × 10²⁷ J](numbers.md#helios-supply) between full power and the deadline, which leaves
[7.8%](numbers.md#budget-spare) spare on its own, even though the coilguns fire between launch windows too and
pay [16%](numbers.md#launch-offwindow-mean) more for it. Once the Ring's recovered energy powers the coilguns
the spare is [33%](numbers.md#budget-spare-with-ring). Launching the water and pumping out the heat take
[91%](numbers.md#budget-launch-share) of the Lattice's output. The walkthrough, and the
[6](numbers.md#checks-failing) physics checks that still fail, are in [Energy and Mass Budget](budget.md).

## Read on

- [The Problem](problem.md): Venus today, and why ten years is impossible by conventional means.
- [The Plan](plan.md): the five moves in depth, the technology stack and the simulated atmosphere.
- Technologies, one page per invention: [Ouroboros Foundry](technologies/ouroboros.md),
  [Helios Lattice](technologies/helios.md), [Hesperus Veil](technologies/veil.md),
  [Thermal Chimneys](technologies/chimneys.md), [Photonic Exhaust](technologies/exhaust.md),
  [Cryo-continents](technologies/cryo.md), [Graphite Forges](technologies/forges.md),
  [Ceres Ice Train](technologies/ice-train.md), [Braking Ring](technologies/ring.md),
  [Acid Sweep](technologies/acid.md), [Aegis Shield](technologies/aegis.md),
  [Genesis Biota](technologies/genesis.md), [Choir](technologies/choir.md).
- [Energy and Mass Budget](budget.md): where every joule and kilogram comes from, and the physics checks.
- [Timeline](timeline.md): the decade, the critical path, and what slips if the Foundry is slow.
- [Research Agenda](research.md): the nine experiments that must pass by the end of 2028.
- [Risks and Governance](risks.md): what can go wrong, the ethics, and the treaties.
- [Precursor Science](precursors.md): the real missions to Venus and what they tell the plan.
- [Every number](numbers.md): the ledger, with each number's formula, inputs and source line.
- [Sources](sources.md): the bibliography.
- [Contribute](contribute.md): challenge a number, propose an invention, rerun the model.
- [About](about.md): what Phosphoros is and is not, its history and every correction.
