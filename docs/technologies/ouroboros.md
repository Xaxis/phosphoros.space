# Ouroboros Foundry

A [1,000 t](../numbers.md#foundry-seed-mass) seed factory lands on Mercury and rebuilds itself from local rock and
sunlight every [60 d](../numbers.md#foundry-doubling-days). After [27](../numbers.md#foundry-doublings) doublings,
on [22 June 2033](../numbers.md?date=day#foundry-full-scale), it is [1.3 × 10¹⁴ kg](../numbers.md#foundry-final-mass)
of machinery, still only [4 × 10⁻¹⁰](../numbers.md#foundry-mercury-share) of Mercury's mass. Every other
invention in the plan is built from its output, so its doubling time is the plan's critical path.

<!-- figure:foundry-growth -->
![Ouroboros Foundry machinery mass, 2028 to 2036](../../figures/svg/foundry-growth.svg)
<!-- /figure -->

## Principle

A factory doubles when it can make every one of its own parts, chips and robots included, from what is
around it. If each kilogram of machinery builds another kilogram in a fixed time T, the mass grows as
`M(t) = M₀ · 2^(t/T)`. Nothing else about the plan scales like that, and nothing else needs to.

**The doubling arithmetic.** From a [1,000 t](../numbers.md#foundry-seed-mass) seed to the
[1.0 × 10¹⁴ kg](../numbers.md#foundry-target-mass) the plan needs is log₂ of their ratio, rounded up to a
whole number: [27](../numbers.md#foundry-doublings) doublings, which give
[1.3 × 10¹⁴ kg](../numbers.md#foundry-final-mass). At [60 d](../numbers.md#foundry-doubling-days) each, that
takes [4.4 yr](../numbers.md#foundry-years-to-scale). Two consequences follow from the shape of the curve:

- **Most of the mass arrives at the end.** Each doubling makes as much as all the doublings before it. In
  [January 2030](../numbers.md?date=month#date-2030), a year after landing, the Foundry is only
  [5.8 × 10⁷ kg](../numbers.md#foundry-mass-2030); by [January 2032](../numbers.md?date=month#date-2032) it
  is [2.7 × 10¹¹ kg](../numbers.md#foundry-mass-2032); and in the eighteen months after that it grows to
  [1.3 × 10¹⁴ kg](../numbers.md#foundry-final-mass). Almost everything the plan builds, it builds in the last
  year.
- **Every day counts many times over.** Full scale comes [27](../numbers.md#foundry-doublings) doubling periods after
  landing, so each day added to the doubling time moves full scale, the Lattice's full power and the first
  ice launch by [27](../numbers.md#foundry-doublings) days.

**Power follows from the doubling time.** Making a kilogram of machinery from raw regolith takes about
[100 MJ/kg](../numbers.md#foundry-energy-per-kg). Growing continuously, the machinery adds mass at
`M · ln 2 / T`, so each kilogram draws `e · ln 2 / T`: [13 W/kg](../numbers.md#foundry-power-per-kg). At full
scale that is [1.8 × 10¹⁵ W](../numbers.md#foundry-peak-power), all of it from the Foundry's own solar film.

**Why Mercury.** Sunlight there is [9,080 W/m²](../numbers.md#mercury-sunlight) at its mean distance from the
Sun. Mercury's axis is almost upright ([NASA](../sources.md#nasa-mercury-factsheet)), so crater rims near its
poles see the Sun nearly all the time and escape the day side's heat. Its gravity is weak: escape speed is
[4.25 km/s](../numbers.md#mercury-escape), low enough that mass drivers, not rockets, throw parts to orbit.
And its silicate rock yields oxygen, silicon and metals by electrolysis.

## Design

The seed is twelve machine types that, together, make all twelve. The loop closes on materials (rock in,
every part out) and on energy (film made by the loop powers the loop).

<!-- figure:foundry-loop -->
![The Ouroboros Foundry machine loop](../../figures/svg/foundry-loop.svg)
<!-- /figure -->

<!-- table:machines ouroboros -->
| Machine | What it does | What it feeds |
| --- | --- | --- |
| Diggers | Mine and sort regolith | Smelters |
| Smelters | Solar furnaces and molten-regolith electrolysis, splitting rock into oxygen, iron, silicon, aluminum, titanium and magnesium | Every other line |
| Glass furnaces | Glass, fiber and optics | Film lines, Lithocells, laser emitters |
| Film lines | Thin solar film at [1 g/m²](../numbers.md#helios-areal-density), the Foundry's own power and the stuff of the Lattice and the Veil | Power for the loop; Petals and slats |
| Lithocells | Chip fabs that write circuits directly with electron beams | Every machine's controller |
| Choir nodes | Compute and communications for the Choir control system | Coordination, the Mass Ledger |
| Coil lines | Aluminum wire and iron cores for induction and reluctance motors, with no rare earths | Everything that moves |
| Rolling mills | Sheet, beam and rail | Assemblers, mass drivers, Petal and slat frames |
| Mass drivers | Throw finished parts to orbit | The Lattice, the Veil, the Ring |
| Haulers | Move ore, parts and products across the site | The whole loop |
| Printers | Electron-beam additive manufacturing in vacuum, for complex metal parts | Assemblers, bearings, housings |
| Assemblers | Robot arms that build every machine type, including Assemblers | The whole loop |
<!-- /table -->

**Simple mass, fast copies.** A loop doubles only as fast as its slowest line. Ouroboros keeps the slow lines
small: about [2%](../numbers.md#foundry-complex-share) of each copy's mass is complex parts (chips, bearings,
optics); the rest is film, beams, rail and wire, which are quick to make in bulk. The seed carries the few
trace elements it cannot yet refine, until refining closes that last gap in 2030 (the specifications below
give the closure).

**Products are diverted growth.** The Foundry can build a product in one doubling period once its own mass
equals the product's, because one doubling's output is the Foundry's mass. That sets when each piece of the
plan becomes affordable:

- The [Hesperus Veil](veil.md), [5.4 × 10¹¹ kg](../numbers.md#veil-mass), on
  [2 March 2032](../numbers.md?date=day#veil-affordable).
- The [Braking Ring](ring.md), [1.0 × 10¹³ kg](../numbers.md#ring-mass), on
  [9 November 2032](../numbers.md?date=day#ring-affordable).
- The [Helios Lattice](helios.md), [5.1 × 10¹³ kg](../numbers.md#helios-mass), on
  [31 March 2033](../numbers.md?date=day#helios-affordable).

Building the Veil at its close date, [30 June 2032](../numbers.md?date=day#veil-close), costs the Foundry
[19 d](../numbers.md#veil-diversion-days) of growth: by then the Veil is a quarter of one doubling's output.
Version 2's lighter Veil, built earlier, cost about a whole doubling. Matter is cheap once the loop runs: all
of the plan's hardware takes about [10²² J](../numbers.md#hardware-energy), less than a millionth of the
energy the plan spends on water and cooling.

## Specifications

<!-- table:specs ouroboros -->
| Parameter | Value |
| --- | --- |
| Seed mass | [1,000 t](../numbers.md#foundry-seed-mass), launched [1 October 2028](../numbers.md?date=day#foundry-seed-launch), landed [14 January 2029](../numbers.md?date=day#foundry-landing) |
| Doubling time | [60 d](../numbers.md#foundry-doubling-days) |
| Doublings to full scale | [27](../numbers.md#foundry-doublings), giving [1.3 × 10¹⁴ kg](../numbers.md#foundry-final-mass) |
| Full scale | [22 June 2033](../numbers.md?date=day#foundry-full-scale) |
| Energy per kilogram built | [100 MJ/kg](../numbers.md#foundry-energy-per-kg) |
| Power per kilogram of machinery | [13 W/kg](../numbers.md#foundry-power-per-kg) |
| Peak power | [1.8 × 10¹⁵ W](../numbers.md#foundry-peak-power), from its own film |
| Share of Mercury used | [4 × 10⁻¹⁰](../numbers.md#foundry-mercury-share) of its mass |
| Mercury's escape speed | [4.25 km/s](../numbers.md#mercury-escape), so parts reach orbit by mass driver |
| Machinery in January 2030 | [5.8 × 10⁷ kg](../numbers.md#foundry-mass-2030) |
| Machinery in January 2032 | [2.7 × 10¹¹ kg](../numbers.md#foundry-mass-2032) |
| Material closure | 99.99% at seed; 100% once trace-element refining runs in 2030 |
<!-- /table -->

## What is invented

> **Invented:** A [60 d](../numbers.md#foundry-doubling-days) doubling time for a factory that makes
> everything it is made of, chips included. This is the single most important assumption in the plan.

> **Invented:** Lithocell chip fabs. A million parallel electron beams write
> [90 nm](../numbers.md#lithocell-feature-size) circuits directly, with no masks, and etching uses chlorine and
> sulfur plasma chemistry from local rock. No mask shop, no clean-room supply chain from Earth.

> **Invented:** Making machinery from raw regolith for about [100 MJ/kg](../numbers.md#foundry-energy-per-kg),
> with full material closure once trace-element refining runs.

> **Precedent:** The 1980 NASA/ASEE summer study designed a self-replicating lunar factory from a
> [100 t](../numbers.md#lunar-factory-seed-mass) seed that would copy itself in about
> [1 yr](../numbers.md#lunar-factory-replication-time) ([NASA CP-2255](../sources.md#nasa-cp-2255); summarized
> in [Jensen 2024](../sources.md#jensen-2024)). It was a design study, never built. Ouroboros starts from a
> seed of [1,000 t](../numbers.md#foundry-seed-mass) and must double in [60 d](../numbers.md#foundry-doubling-days).

## Build sequence

- **[2027](../numbers.md?date=year#program-start):** [Ouroboros-0](../research.md#ouroboros-0) starts on
  Earth: a factory that builds itself from simulated Mercury regolith. It must show mass closure and a
  doubling time before the seed is committed. Under its kill signal, the plan falls back to the
  multi-century route.
- **[1 October 2028](../numbers.md?date=day#foundry-seed-launch):** The seed launches, one of the very few
  things in the plan that leaves Earth. The transfer to Mercury takes
  [105 d](../numbers.md?sig=3#foundry-transfer-days).
- **[14 January 2029](../numbers.md?date=day#foundry-landing):** The seed lands at a polar site. The
  [Choir](choir.md) goes live with it.
- **[January 2030](../numbers.md?date=month#date-2030):** [5.8 × 10⁷ kg](../numbers.md#foundry-mass-2030) of
  machinery. Trace-element refining closes the loop completely.
- **[June 2030](../numbers.md?date=month#helios-first-petals):** The first Helios Petals fly and Veil slat
  production begins, small diversions from a growing base.
- **[January 2032](../numbers.md?date=month#date-2032):** [2.7 × 10¹¹ kg](../numbers.md#foundry-mass-2032).
- **[March 2032](../numbers.md?date=month#veil-affordable):** The Foundry can build the whole Veil in one
  doubling. It closes over Venus on [30 June 2032](../numbers.md?date=day#veil-close).
- **[November 2032](../numbers.md?date=month#ring-affordable):** The Braking Ring becomes affordable; its
  construction runs to [December 2033](../numbers.md?date=month#ring-complete).
- **[March 2033](../numbers.md?date=month#helios-affordable):** The Helios Lattice becomes affordable.
- **[22 June 2033](../numbers.md?date=day#foundry-full-scale):** Full scale,
  [1.3 × 10¹⁴ kg](../numbers.md#foundry-final-mass). The Lattice reaches full power the same day and the first
  Ice Bricks leave Ceres ([June 2033](../numbers.md?date=month#ice-launch-start)).

## Failure modes and safeguards

- **Runaway replication.** A machine that copies itself must stop when told. Every build order is signed by
  the [Choir](choir.md), and machines refuse unsigned orders in hardware. The Choir's Mass Ledger caps the
  total mass, replicators stop if they lose the Ledger's heartbeat, and an international kill code halts
  replication within one light delay.
- **Copy errors that compound.** A flaw copied every generation ends up in every machine. Blueprints are checksummed every
  generation, and each new machine is tested against its blueprint before it may build.
- **A slow line.** The loop runs at the pace of its slowest machine type. Lithocells are the likeliest
  bottleneck, which is why complex parts are held to [2%](../numbers.md#foundry-complex-share) of the mass and
  the Choir rebalances lines generation by generation.
- **A slower doubling.** The plan has no slack here. A longer doubling time delays the Lattice, cuts the energy
  it delivers before the deadline, and pushes the ice launches against the date after which ice cannot arrive
  in time ([timeline](../timeline.md#what-slips-if-the-foundry-is-slow)).
- **The environment.** Mercury's day side is hot and its surface is bombarded. Polar crater rims avoid the
  worst of the heat, and the loop builds its own replacements.

## Reproduce these numbers

The Foundry's numbers come from [calc/src/model/foundry.ts](../../calc/src/model/foundry.ts), reading
[data/assumptions.yaml](../../data/assumptions.yaml).

```sh
pnpm calc --only foundry-full-scale     # landing + n doubling periods
pnpm calc --only foundry-power-per-kg   # e ln 2 / T
pnpm calc --only veil-affordable        # when one doubling's output equals the Veil
pnpm calc --only veil-diversion-days    # growth the Veil costs at its close date
```

The assumption to try is the doubling time, `foundry-doubling-days`, in the
[Explorer](https://phosphoros.space/explore) or with `pnpm calc --set foundry-doubling-days=70`. Lengthen it and
full scale, the Lattice and the first ice launch all slip; the energy budget goes negative, the Veil is no
longer affordable by its close date, and the simulated atmosphere misses the deadline. Shorten it and
everything moves earlier and the spare energy grows. The [critical path](../timeline.md#the-critical-path)
runs through this one number.
