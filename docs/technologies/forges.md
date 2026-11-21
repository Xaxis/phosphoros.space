# Graphite Forges

[500](../numbers.md#forge-count) floating molten-salt plants split [1.8 × 10¹⁸ kg](../numbers.md#forge-co2) of CO₂, only
[0.4%](../numbers.md#forge-co2-share) of Venus's, into [0.25 bar](../numbers.md#o2-target-pressure) of oxygen and
[4.9 × 10¹⁷ kg](../numbers.md#forge-graphite) of graphite. They use [2.7 × 10²⁵ J](../numbers.md#forge-energy) between
[January 2035](../numbers.md?date=month#forge-start) and [September 2036](../numbers.md?date=month#forge-end). The graphite
becomes the caps that seal the cryo-continents, and the day the Forges finish is the day Venus becomes Earth-like.

<!-- figure:lattice-budget -->
![Energy the Helios Lattice must deliver, against its supply](../../figures/svg/lattice-budget.svg)
<!-- /figure -->

## Principle

Splitting CO₂ is burning carbon backwards, and it costs at least what burning gave:
[394 kJ/mol](../numbers.md#co2-split-enthalpy). The Forges pay it with electricity, in a bath of molten carbonate salt.

**The chemistry.** CO₂ dissolves in the melt and pairs with oxide ions to make carbonate. At the cathode, carbonate takes
four electrons, gives up its carbon as solid graphite and releases oxide ions back into the melt. At the anode, oxide ions
give up their electrons and leave as oxygen gas:

```text
In the melt:  CO₂ + O²⁻     →  CO₃²⁻
Cathode:      CO₃²⁻ + 4e⁻   →  C + 3 O²⁻
Anode:        2 O²⁻         →  O₂ + 4e⁻
Overall:      CO₂           →  C + O₂
```

The melt is not used up; it shuttles oxygen from cathode to anode. One mole of CO₂ makes one mole of oxygen and one mole
of carbon.

**How much.** Oxygen at [0.25 bar](../numbers.md#o2-target-pressure) over all of Venus weighs `P A / g`:
[1.3 × 10¹⁸ kg](../numbers.md#o2-mass), [4.1 × 10¹⁹ mol](../numbers.md#o2-moles). That takes
[1.8 × 10¹⁸ kg](../numbers.md#forge-co2) of CO₂ and leaves [4.9 × 10¹⁷ kg](../numbers.md#forge-graphite) of carbon. All
the rest of the CO₂ stays frozen in the cryo-continents; the Forges only make the air breathable.

**What it costs.** At an efficiency of [60%](../numbers.md#forge-efficiency), each mole takes
[656 kJ/mol](../numbers.md#forge-energy-per-mol), [15 MJ/kg](../numbers.md#forge-energy-per-kg) of CO₂: in all
[2.7 × 10²⁵ J](../numbers.md#forge-energy). Over [21 months](../numbers.md#forge-seconds) that is
[4.8 × 10¹⁷ W](../numbers.md#forge-power), a small share of the plan's [8.5 × 10²⁷ J](../numbers.md#budget-demand)
([budget](../budget.md#forging-the-oxygen)). The energy the electrolysis
loses, [1.1 × 10²⁵ J](../numbers.md#forge-waste-heat) of heat, stays on Venus, and the Exhaust pumps it out with the rest.

**How much oxygen that is.** [0.25 bar](../numbers.md#o2-target-pressure) is [1.2](../numbers.md#o2-vs-earth) times the
[0.21 bar](../numbers.md#earth-o2-pressure) at Earth's sea level, a little more, not a match. Lungs respond to that partial
pressure. Because Venus keeps its nitrogen, oxygen is only [11%](../numbers.md#final-o2-share) of the finished
[2.4 bar](../numbers.md#final-pressure) air.

## Design

**The plants.** Each Forge is a raft [30 km](../numbers.md#forge-raft-width) across drawing about
[0.96 PW](../numbers.md?show=PW#forge-plant-power) of beamed power and splitting
[65,000 t/s](../numbers.md#forge-throughput) of CO₂. The melt is a sodium-potassium carbonate with no lithium, so nothing
scarce has to be found or shipped. The cathodes grow graphite as sheets, which are peeled off and foamed into aerogel for
the caps. The oxygen is vented to the air.

**On the seas.** The Forges start in [January 2035](../numbers.md?date=month#forge-start), floating on the liquid CO₂ seas
that have filled the basins since the [Clear Rain](cryo.md) of [July 2034](../numbers.md?date=month#traj-clear-rain).
They draw their feed straight from the cold, dense liquid under them. Sulfur is no obstacle: in the melt, sulfur gases are
reduced to sulfur and do not poison the electrolysis ([Licht 2015](../sources.md#licht-2015), citing
[Kaplan 2013](../sources.md#kaplan-2013)).

**After the freeze.** On [17 July 2035](../numbers.md?date=day#traj-freeze) the seas start to freeze. The crystals sink,
so the Forges keep drawing liquid from above the settling ice until the seas are frozen through on
[15 April 2036](../numbers.md?date=day#traj-frozen). Then no open liquid survives, so the Forges change feed: they quarry dry
ice and turn it back to gas with their own waste heat. Each kilogram split leaves several megajoules of heat, many times the
[571 kJ/kg](../numbers.md#co2-deposition-heat) it takes to turn a kilogram of dry ice into gas. The caps are complete by
[1 September 2036](../numbers.md?date=day#sealing-end); the Forges on the last compartments become part of them, drawing dry ice
up through shafts under gas-tight hoods, and those shafts close when forging ends.

**The graphite budget.** The caps need [2.5 × 10¹⁷ kg](../numbers.md#cryo-cap-mass) of carbon aerogel and
[3.3 × 10¹⁴ kg](../numbers.md#cryo-membrane-mass) of graphite membrane, and they need it before the Veil opens. By the end of
sealing the Forges have made [4.6 × 10¹⁷ kg](../numbers.md#graphite-by-sealing), so the caps are covered with room to
spare; the model checks it ([check](../numbers.md#check-graphite-for-caps)). In all the Forges make
[4.9 × 10¹⁷ kg](../numbers.md#forge-graphite), leaving [2.4 × 10¹⁷ kg](../numbers.md#graphite-stockpile) after the caps for
structures and for the black loam soil of [Genesis](genesis.md).

**The oxygen sets the finish.** In the day-by-day [simulation](../plan.md#the-simulated-atmosphere) the caps are
sealed and the Veil opens on [2 September 2036](../numbers.md?date=day#traj-warming), and the air is warm by
[5 September 2036](../numbers.md?date=day#traj-warm). The Forges finish on
[30 September 2036](../numbers.md?date=day#forge-end), and Venus is Earth-like the same day,
[30 September 2036](../numbers.md?date=day#traj-earth-like). Ultraviolet sunlight starts turning some of the oxygen into ozone as soon as it is in the air, the
beginning of a shield for the life that follows.

## Specifications

<!-- table:specs forges -->
| Parameter | Value |
| --- | --- |
| CO₂ split | [1.8 × 10¹⁸ kg](../numbers.md#forge-co2), [0.4%](../numbers.md#forge-co2-share) of Venus's CO₂ |
| Oxygen | [1.3 × 10¹⁸ kg](../numbers.md#o2-mass), [0.25 bar](../numbers.md#o2-target-pressure) |
| Graphite | [4.9 × 10¹⁷ kg](../numbers.md#forge-graphite) |
| Energy per mole | [394 kJ/mol](../numbers.md#co2-split-enthalpy) minimum, [656 kJ/mol](../numbers.md#forge-energy-per-mol) at [60%](../numbers.md#forge-efficiency) |
| Energy per kilogram of CO₂ | [15 MJ/kg](../numbers.md#forge-energy-per-kg) |
| Energy | [2.7 × 10²⁵ J](../numbers.md#forge-energy), [4.8 × 10¹⁷ W](../numbers.md#forge-power) for [21 months](../numbers.md#forge-seconds) |
| Plants | [500](../numbers.md#forge-count) at about [0.96 PW](../numbers.md#forge-plant-power) each |
| Throughput per Forge | [65,000 t/s](../numbers.md#forge-throughput) of CO₂ |
| Graphite use | [2.5 × 10¹⁷ kg](../numbers.md#cryo-cap-mass) for caps, [2.4 × 10¹⁷ kg](../numbers.md#graphite-stockpile) stockpiled |
| Running | [January 2035](../numbers.md?date=month#forge-start) to [September 2036](../numbers.md?date=month#forge-end) |
<!-- /table -->

## What is invented

> **Invented:** Thirty-kilometer floating electrolysis rafts, [500](../numbers.md#forge-count) of them, each drawing about
> [0.96 PW](../numbers.md?show=PW#forge-plant-power) and splitting [65,000 t/s](../numbers.md#forge-throughput) of CO₂.

> **Invented:** A lithium-free sodium-potassium carbonate melt at this scale, and graphite harvested as sheets fit to
> foam into cap aerogel.

> **Invented:** Forges that feed from dry ice through sealed shafts in the caps once the seas have frozen.

> **Precedent:** The C2CNT process splits CO₂ dissolved in molten carbonate into graphene nanocarbons and oxygen in one
> step, at the [60%](../numbers.md#forge-efficiency) efficiency the plan assumes
> ([Licht, Hofstetter and Licht 2025](../sources.md#licht-2025-c2cnt); [Ren 2015](../sources.md#ren-2015)).

> **Precedent:** Sulfur gases are reduced to sulfur in the melt and do not poison the electrolysis
> ([Licht 2015](../sources.md#licht-2015); [Kaplan 2013](../sources.md#kaplan-2013)).

## Build sequence

- **[23 July 2034](../numbers.md?date=day#traj-clear-rain):** The Clear Rain fills the basins with liquid CO₂. The
  Forge rafts are floated onto the new seas.
- **[1 January 2035](../numbers.md?date=day#forge-start):** Forging begins. Oxygen starts to build in the air; graphite
  starts to pile up for the caps.
- **[17 July 2035](../numbers.md?date=day#traj-freeze):** The seas start to freeze.
- **[15 April 2036](../numbers.md?date=day#traj-frozen):** The seas are frozen through. The Forges switch to quarrying
  dry ice.
- **[1 September 2036](../numbers.md?date=day#sealing-end):** The caps are complete, with
  [4.6 × 10¹⁷ kg](../numbers.md#graphite-by-sealing) of graphite made so far.
- **[30 September 2036](../numbers.md?date=day#forge-end):** Forging ends with [0.25 bar](../numbers.md#o2-target-pressure)
  of oxygen in the air, and Venus is Earth-like the same day,
  [30 September 2036](../numbers.md?date=day#traj-earth-like).

## Failure modes and safeguards

- **A slow Forge.** The Earth-like date moves one for one with the end of forging. With
  [500](../numbers.md#forge-count) independent plants, a lost raft spreads its share over the rest at a little more power
  each.
- **Too little graphite in time.** If forging starts late, less graphite exists when the caps are laid. The model checks
  that the caps are covered by the end of sealing.
- **Rafts caught by the freeze.** The rafts must stop floating before the seas freeze under them. They are moved onto
  their quarrying sites as the surface hardens.
- **Carbon and oxygen together.** Graphite is fuel in an oxygen-rich air. The cap aerogel lies under
  [2 m](../numbers.md#cryo-armour-thickness) of basalt armor, which also keeps the air off it, and the stockpile is stored the
  same way.
- **Sulfur.** SO₂ in the air before the [Acid Sweep](acid.md) does not poison the melt; it leaves as sulfur.

## Reproduce these numbers

The Forges' numbers come from [calc/src/model/forges.ts](../../calc/src/model/forges.ts); the finish date from
[calc/src/model/trajectory.ts](../../calc/src/model/trajectory.ts).

```sh
pnpm calc --only forge-energy          # moles of O₂ × ΔH / η
pnpm calc --only graphite-by-sealing   # graphite made by the end of sealing
pnpm calc --only forge-plant-power     # power of one Forge
pnpm calc --only traj-earth-like       # the finish
```

In the [Explorer](https://phosphoros.space/explore), lower `forge-efficiency` and the energy rises, though it stays a small
share of the budget. With `pnpm calc --set forge-end=2036-07-31` the Forges must run harder, and Venus becomes Earth-like
sooner. Move `forge-start` later and less graphite is ready when the caps are sealed; far enough, and the caps are short.
