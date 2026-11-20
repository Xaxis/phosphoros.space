# Thermal Chimneys

[10,000](../numbers.md#chimney-count) towers, [2 km](../numbers.md#chimney-diameter) wide and
[64 km](../numbers.md#chimney-height) tall, carry the heat of Venus's deep air up to the Exhaust canopies at
[1.2 × 10¹⁵ W](../numbers.md#chimney-heat) each, [1.2 × 10¹⁹ W](../numbers.md#chimney-capacity) in all. Fans draw
the hot air through heat exchangers; sealed liquid loops lift the heat; the cooled air sinks and stays down.
They work from [January 2033](../numbers.md?date=month#cooling-start) until the CO₂ is down.

<!-- figure:heat-path -->
![Venus's heat path, in cross-section](../../figures/svg/heat-path.svg)
<!-- /figure -->

## Principle

Venus's heat is in its deep air. The atmosphere's scale height is [16 km](../numbers.md#venus-scale-height), so
most of its mass, and most of its heat, sits in the lowest few tens of kilometers, at up to
[737 K](../numbers.md#venus-surface-temp) and [65 kg/m³](../numbers.md#venus-surface-density). The
[Photonic Exhaust](exhaust.md) can only shine its heat to space from high up, above most of the CO₂, at the
canopies [65 km](../numbers.md#chimney-top) up. Something has to carry the heat between the two, at a rate the
air will never manage by itself: near the ground Venus's air barely moves.

The obvious design, and version 2's, is a duct: let the hot deep air rise inside a column to the canopy, give up
its heat there, and sink outside. It does not work, and the reason is the most important fact about Venus's
atmosphere.

> **Physics:** A gas that rises expands and cools. Venus's lower atmosphere already has the temperature profile
> of air that rose without gaining or losing heat, so deep air lifted to the cloud tops arrives about as cold as
> the cloud tops, which radiate to space at [230 K](../numbers.md#cloudtop-temp). Its heat has turned into height.
> Cooled there and sent back down, it is squeezed and warmed again on the way. This is why Venus's surface is so
> hot under a cool cloud deck, and it means moving air up and down cannot carry deep heat to the canopies as heat.

So version 3's chimneys lift heat, not air. The heat leaves the air where the air is, at depth, and climbs in a
liquid. A liquid is nearly incompressible: the huge change in pressure over the tower's height changes its
temperature only a little. The heat reaches the canopy close to the temperature of the air it came from, which
is why the model can treat the Exhaust's cold side as the air's own temperature.

## Design

**Intakes.** Each chimney's intake stages carry maglev fans that pull the surrounding air through heat
exchangers at [20 m/s](../numbers.md#chimney-flow-speed), across the tower's full section,
[3.1 × 10⁶ m²](../numbers.md#chimney-flow-area). At the base, [1 km](../numbers.md#chimney-base) above the ground,
that is [4.1 × 10⁹ kg/s](../numbers.md#chimney-mass-flow) of gas at [92 bar](../numbers.md#venus-surface-pressure).
The exchangers cool it by [300 K](../numbers.md#chimney-gas-cooling). With CO₂'s heat capacity of
[1,000 J/(kg·K)](../numbers.md#co2-cp), `Q = ṁ c_p ΔT` gives [1.2 × 10¹⁵ W](../numbers.md#chimney-heat) per chimney.

**Liquid loops.** The heat passes into a cascade of sealed liquid loops that climb the tower, each a few
kilometers tall, each handing its heat to the next through an exchanger. A loop's rising leg is hot and light, its
falling leg cool and dense, so the loops largely drive themselves. Splitting the climb into stages keeps the
pressure in any one loop manageable. The top loop delivers the heat to the exchangers under the canopy floor,
where the Exhaust's tiles take it.

**The cooled air.** Air leaving an exchanger is far denser than the air around it. It flows out of the bottom of
the intake and drains downhill into the lowland basins, where it pools: cold air under hot, the stable layering
that keeps the two from mixing back. The intake sits above the ground so that it draws from the hot air above the
pool; as the cold layer deepens, higher intake stages take over. The basins that fill with cold air are the same
basins that later fill with liquid CO₂.

**Structure.** The air inside and outside the tower is at the same pressure, so the walls carry no pressure load.
Each chimney hangs in tension from its floating canopy and is tethered to a ground anchor. On the way up it passes
through the sulfuric-acid clouds between [48 km](../numbers.md#venus-cloud-base) and
[70 km](../numbers.md#venus-cloud-top).

**Grid and capacity.** There is one chimney under each of the [10,000](../numbers.md#exhaust-canopies) canopies,
on a grid about [215 km](../numbers.md#chimney-spacing) apart. Together they can lift
[1.2 × 10¹⁹ W](../numbers.md#chimney-capacity), [2](../numbers.md#chimney-vs-peak) times the
[6.0 × 10¹⁸ W](../numbers.md#deep-heat-peak) design peak of deep heat flow. The day-by-day
[simulation](../plan.md#the-simulated-atmosphere) does not yet cap cooling at the chimneys' capacity. In its fastest
weeks, in the first half of 2033, it removes heat slightly faster than the chimneys can lift it; after the Ring
takes over the Railheads in [August 2034](../numbers.md?date=month#ring-pays-from), it stays above the design peak
but within capacity.

**Life cycle.** The chimneys are built from the canopies down in 2032, under the closed Veil, and run hardest from
[January 2033](../numbers.md?date=month#cooling-start) through the [Clear Rain](cryo.md) of
[September 2034](../numbers.md?date=month#traj-clear-rain). After that their exchangers double as condensers: liquid
CO₂ forms on them and drains to the basins. As the CO₂ rains out the air thins, the canopies float lower and the
towers are shortened. They retire once the CO₂ is down, in [August 2036](../numbers.md?date=month#traj-cold), and
their carbon goes into the cryo-continent caps.

## Specifications

<!-- table:specs chimneys -->
| Parameter | Value |
| --- | --- |
| Number | [10,000](../numbers.md#chimney-count), one per canopy, about [215 km](../numbers.md#chimney-spacing) apart |
| Diameter | [2 km](../numbers.md#chimney-diameter) |
| Height | [1 km](../numbers.md#chimney-base) above the surface to [65 km](../numbers.md#chimney-top) |
| Gas at the base | [737 K](../numbers.md#venus-surface-temp), [65 kg/m³](../numbers.md#venus-surface-density), [92 bar](../numbers.md#venus-surface-pressure) |
| Flow speed | [20 m/s](../numbers.md#chimney-flow-speed) |
| Mass flow | [4.1 × 10⁹ kg/s](../numbers.md#chimney-mass-flow) each |
| Heat delivered | [1.2 × 10¹⁵ W](../numbers.md#chimney-heat) each, cooling the gas by [300 K](../numbers.md#chimney-gas-cooling) |
| Total capacity | [1.2 × 10¹⁹ W](../numbers.md#chimney-capacity), [2](../numbers.md#chimney-vs-peak) times the [6.0 × 10¹⁸ W](../numbers.md#deep-heat-peak) peak deep heat flow |
<!-- /table -->

## What is invented

> **Invented:** Silicon-carbide and graphene composite walls that survive Venus's surface conditions,
> [737 K](../numbers.md#venus-surface-temp) and [92 bar](../numbers.md#venus-surface-pressure) of CO₂ laced with SO₂,
> and the acid clouds above, for four years.

> **Invented:** Ground anchors that grip basalt at [737 K](../numbers.md#venus-surface-temp), set by melting rock
> around graphite roots and letting it freeze.

> **Invented:** A cascade of liquid loops that lifts [1.2 × 10¹⁵ W](../numbers.md#chimney-heat)
> [64 km](../numbers.md#chimney-height) while losing little temperature, and fans that move
> [4.1 × 10⁹ kg/s](../numbers.md#chimney-mass-flow) of hot, dense CO₂ through its exchangers.

> **Precedent:** None is cited. Forced-convection heat exchange is ordinary engineering; nothing remotely this tall
> or this hot has been built.

Version 3 changes how the chimney works, from rising gas to rising liquid; the model's numbers are unchanged,
because they describe the air drawn through the intake and the heat taken from it.

## Build sequence

- **[30 June 2032](../numbers.md?date=day#veil-close):** The Veil closes. Canopies float at the cloud tops and the
  chimneys are lowered from them to their ground anchors.
- **[1 January 2033](../numbers.md?date=day#cooling-start):** Active cooling begins. The chimneys feed the Exhaust as
  fast as the growing Lattice can pay for pumping.
- **[June 2033](../numbers.md?date=month#ice-launch-start):** The Railheads on Ceres take most of the Lattice's
  power; cooling slows until the Ring pays for them.
- **[7 September 2034](../numbers.md?date=day#traj-clear-rain):** The Clear Rain. The deep air falls below CO₂'s
  critical temperature and the exchangers start condensing liquid CO₂.
- **[17 August 2034](../numbers.md?date=day#ring-pays-from):** The Ring powers the Railheads and the Exhaust runs at
  its limit, with the chimneys lifting heat well above the design peak.
- **[23 August 2036](../numbers.md?date=day#traj-cold):** All the CO₂ is down. The chimneys retire and are taken
  apart.
- **[15 September 2036](../numbers.md?date=day#cooling-end):** Active cooling ends.

## Failure modes and safeguards

- **A collapse.** A fallen chimney slows cooling only in its own cell. The rest have twice the design peak's
  capacity between them and take up the load.
- **Acid.** The towers pass through the sulfuric-acid clouds. Crawler robots inspect and patch the walls
  continuously, and the clouds rain out as the air cools ([Acid Sweep](acid.md)).
- **A leaking loop.** Each loop is a sealed stage. A leaking stage is isolated and its neighbors carry the heat
  around it.
- **A lost anchor.** The tower hangs from its canopy, so losing the anchor lets it swing, not fall.
- **Fans and exchangers.** There are many intake stages on every tower; losing some lowers that chimney's share of
  the load, not the plan's.
- **The physics.** The design depends on keeping the heat in a liquid all the way up. If a stage lets its fluid
  boil or its pressure fall too far, that stage cools like the air does and delivers less useful heat. Loop design
  is part of the invention.

## Reproduce these numbers

The chimneys' numbers come from [calc/src/model/exhaust.ts](../../calc/src/model/exhaust.ts), which models them
with the Exhaust they feed.

```sh
pnpm calc --only chimney-heat       # ṁ c_p ΔT for one chimney
pnpm calc --only chimney-mass-flow  # ρ v A at the base
pnpm calc --only chimney-capacity   # all chimneys together
```

Try `pnpm calc --set chimney-gas-cooling=150` or a lower `chimney-flow-speed`: capacity falls in proportion, and the
margin over the [6.0 × 10¹⁸ W](../numbers.md#deep-heat-peak) design peak disappears. Raising `chimney-count` adds
capacity and narrows the grid.
