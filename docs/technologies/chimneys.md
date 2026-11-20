# Thermal Chimneys

[10,000](../numbers.md#chimney-count) towers, [3.5 km](../numbers.md#chimney-diameter) wide and
[64 km](../numbers.md#chimney-height) tall, carry the heat of Venus's deep air up to the Exhaust canopies at
[1.3 × 10¹⁵ W](../numbers.md#chimney-heat) each, [1.3 × 10¹⁹ W](../numbers.md#chimney-capacity) in all. Fans draw
the hot air through heat exchangers; sealed liquid loops lift the heat; the cooled air sinks and stays down.
They work from [May 2033](../numbers.md?date=month#cooling-start) until the CO₂ is down.

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
temperature only a little. The heat reaches the canopy at about the temperature it left the air, but that is not
quite the air's own temperature, as the next section shows.

## Design

**Intakes.** Each chimney's intake stages carry maglev fans that pull the surrounding air through heat
exchangers at [20 m/s](../numbers.md#chimney-flow-speed), across the tower's full section,
[9.6 × 10⁶ m²](../numbers.md#chimney-flow-area). At the base, [1 km](../numbers.md#chimney-base) above the ground,
that is [1.3 × 10¹⁰ kg/s](../numbers.md#chimney-mass-flow) of gas at [92 bar](../numbers.md#venus-surface-pressure).
The exchangers cool it by [100 K](../numbers.md#chimney-gas-cooling). With CO₂'s heat capacity of
[1,000 J/(kg·K)](../numbers.md#co2-cp), `Q = ṁ c_p ΔT` gives [1.3 × 10¹⁵ W](../numbers.md#chimney-heat) per chimney.
The fans pay to push that much air through the exchangers: [1.0 × 10¹⁷ W](../numbers.md#chimney-fan-power) for all
the chimneys, [0.8%](../numbers.md#chimney-fan-share) of the heat they carry, charged to the energy budget.

**How much to cool the air.** The exchangers take heat from air that cools as it passes them, so the pumps see that
heat over a range of temperatures, and they pay for it as if it all came at the range's log-mean temperature. The
more the air cools, the colder that is, and the more work each joule costs. Version 3's first chimneys cooled the
air three times as much: the pumps saw it more than a fifth colder than it was, which raised the work for each
joule of the gas's heat by a third or more. Cooling it
by [100 K](../numbers.md#chimney-gas-cooling) instead, and drawing three times the air through towers
[3.5 km](../numbers.md#chimney-diameter) wide, carries the same heat while the pumps see
[0.931](../numbers.md#chimney-cold-factor) of the air's temperature. The extra fan power is far cheaper than the pump
work it saves. Once CO₂ condenses on the exchangers it gives up its heat at a single temperature, so the penalty
applies only while the air cools as a gas.

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
[1.3 × 10¹⁹ W](../numbers.md#chimney-capacity), [2.1](../numbers.md#chimney-vs-peak) times the
[6.0 × 10¹⁸ W](../numbers.md#deep-heat-peak) design peak of deep heat flow. The day-by-day
[simulation](../plan.md#the-simulated-atmosphere) never removes heat faster than the chimneys can lift it: in its
fastest weeks it hits that limit, [1.3 × 10¹⁹ W](../numbers.md#traj-heat-peak), and the chimneys rather than the
power set the pace on [56 d](../numbers.md#traj-chimney-days).

**Life cycle.** The chimneys are built from the canopies down from late 2032, as the Veil closes, and run hardest from
[May 2033](../numbers.md?date=month#cooling-start) through the [Clear Rain](cryo.md) of
[July 2034](../numbers.md?date=month#traj-clear-rain). After that their exchangers double as condensers: liquid
CO₂ forms on them and drains to the basins. As the CO₂ rains out the air thins, the canopies float lower and the
towers are shortened. They retire once the CO₂ is down, in [June 2036](../numbers.md?date=month#traj-cold), and
their carbon goes into the cryo-continent caps.

## Specifications

<!-- table:specs chimneys -->
| Parameter | Value |
| --- | --- |
| Number | [10,000](../numbers.md#chimney-count), one per canopy, about [215 km](../numbers.md#chimney-spacing) apart |
| Diameter | [3.5 km](../numbers.md#chimney-diameter) |
| Height | [1 km](../numbers.md#chimney-base) above the surface to [65 km](../numbers.md#chimney-top) |
| Gas at the base | [737 K](../numbers.md#venus-surface-temp), [65 kg/m³](../numbers.md#venus-surface-density), [92 bar](../numbers.md#venus-surface-pressure) |
| Flow speed | [20 m/s](../numbers.md#chimney-flow-speed) |
| Mass flow | [1.3 × 10¹⁰ kg/s](../numbers.md#chimney-mass-flow) each |
| Heat delivered | [1.3 × 10¹⁵ W](../numbers.md#chimney-heat) each, cooling the gas by [100 K](../numbers.md#chimney-gas-cooling) |
| Fans | [1.0 × 10¹⁷ W](../numbers.md#chimney-fan-power) in all, [0.8%](../numbers.md#chimney-fan-share) of the heat carried |
| Total capacity | [1.3 × 10¹⁹ W](../numbers.md#chimney-capacity), [2.1](../numbers.md#chimney-vs-peak) times the [6.0 × 10¹⁸ W](../numbers.md#deep-heat-peak) peak deep heat flow |
<!-- /table -->

## What is invented

> **Invented:** Silicon-carbide and graphene composite walls that survive Venus's surface conditions,
> [737 K](../numbers.md#venus-surface-temp) and [92 bar](../numbers.md#venus-surface-pressure) of CO₂ laced with SO₂,
> and the acid clouds above, for four years.

> **Invented:** Ground anchors that grip basalt at [737 K](../numbers.md#venus-surface-temp), set by melting rock
> around graphite roots and letting it freeze.

> **Invented:** A cascade of liquid loops that lifts [1.3 × 10¹⁵ W](../numbers.md#chimney-heat)
> [64 km](../numbers.md#chimney-height) while losing little temperature, and fans that move
> [1.3 × 10¹⁰ kg/s](../numbers.md#chimney-mass-flow) of hot, dense CO₂ through its exchangers.

> **Precedent:** None is cited. Forced-convection heat exchange is ordinary engineering; nothing remotely this tall
> or this hot has been built.

Version 3 changes how the chimney works, from rising gas to rising liquid; the model's numbers are unchanged,
because they describe the air drawn through the intake and the heat taken from it.

## Build sequence

- **[1 December 2032](../numbers.md?date=day#veil-close):** The Veil closes. Canopies float at the cloud tops and the
  chimneys are lowered from them to their ground anchors.
- **[3 May 2033](../numbers.md?date=day#cooling-start):** Active cooling begins. The chimneys feed the Exhaust as
  fast as the growing Lattice can pay for pumping.
- **[July 2033](../numbers.md?date=month#ice-launch-start):** The Railheads on Ceres take most of the Lattice's
  power; cooling slows until the Ring pays for them.
- **[13 July 2034](../numbers.md?date=day#traj-clear-rain):** The Clear Rain. The deep air falls below CO₂'s
  critical temperature and the exchangers start condensing liquid CO₂.
- **[16 September 2034](../numbers.md?date=day#ring-pays-from):** The Ring powers the Railheads and the Exhaust runs at
  its limit, with the chimneys lifting heat well above the design peak.
- **[12 June 2036](../numbers.md?date=day#traj-cold):** All the CO₂ is down. The chimneys retire and are taken
  apart.
- **[1 September 2036](../numbers.md?date=day#cooling-end):** Active cooling ends.

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
pnpm calc --only chimney-cold-factor  # what the pumps see, as a share of the air's temperature
```

Try `pnpm calc --set chimney-gas-cooling=300`, version 3's first design: capacity triples, but the pumps see the air
colder, the pump work rises, and the Frost Towers finish too late for the caps. A lower `chimney-flow-speed` cuts capacity
and fan power together, and the chimneys hold the cooling back for longer. Raising `chimney-count` adds capacity and
narrows the grid.
