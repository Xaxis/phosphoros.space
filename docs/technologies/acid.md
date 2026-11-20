# Acid Sweep

Venus's clouds are sulfuric acid, and its lower air holds
[150 ppm](../numbers.md?show=ppm#venus-so2-fraction) of sulfur dioxide:
[1.1 × 10¹⁷ kg](../numbers.md#venus-so2-mass) of it. Cooling makes the sulfur rain out. The Acid Sweep
meets it with [9 × 10¹⁷ kg](../numbers.md#acid-basalt) of crushed basalt, carrying
[9.3 × 10¹⁶ kg](../numbers.md#acid-cao) of lime, so the oceans fill with fresh water rather than acid. It
needs no breakthrough, only scale.

## Principle

### Where the sulfur is

The cloud deck runs from [48 km](../numbers.md?sig=2#venus-cloud-base) to
[70 km](../numbers.md?sig=2#venus-cloud-top) up. Its droplets are sulfuric acid, and they last because
of a cycle: droplets that fall below the cloud base meet air hot enough to evaporate them and break the
acid back into sulfur gases and water vapour, which rise and condense again. The clouds hold only a small
part of the sulfur. Most of it is SO₂ gas mixed through the lower air.

### What cooling does

Once the [Photonic Exhaust](exhaust.md) cools the lower air, falling droplets stop evaporating, and the
clouds rain out onto the surface. That begins before the CO₂ itself condenses in the Clear Rain of
[January 2034](../numbers.md?date=month#traj-clear-rain). SO₂ is far less volatile than CO₂, so when the
CO₂ liquefies, the SO₂ goes into the liquid preferentially and runs with it into the basins, where it
freezes into the [cryo-continents](cryo.md).

### The chemistry

Acid meets lime. Calcium oxide makes up [10%](../numbers.md#basalt-cao-fraction) of basalt, and each
molecule of it takes up one molecule of sulfur to make calcium sulfate: gypsum where there is water,
anhydrite where it is dry. SO₂ first makes calcium sulfite, which turns to sulfate once the
[Graphite Forges](forges.md) put oxygen into the air. Venus's traces of hydrogen chloride and hydrogen
fluoride end as salts in the same way.

Neutralizing all [1.7 × 10¹⁸ mol](../numbers.md#so2-moles) of SO₂ takes
[9.3 × 10¹⁶ kg](../numbers.md#acid-cao) of lime, carried in [9 × 10¹⁷ kg](../numbers.md#acid-basalt) of
basalt. The model sizes the basalt to take up every molecule: an upper bound. Sulfur frozen into the
cryo-continents is sealed under the same caps as the CO₂ instead.

> **Physics:** One molecule of lime per molecule of sulfur. Every mass in this document follows from that
> ratio, the molar masses and how much SO₂ Venus's air holds.

## Design

### Rock mills

Mills in the highlands grind [9 × 10¹⁷ kg](../numbers.md#acid-basalt) of basalt to dust. Spread over the
basins, that is a layer [2.1 m](../numbers.md#acid-basalt-layer) deep, and it uses
[0.07%](../numbers.md#acid-crust-share) of the top kilometre of Venus's crust. Grinding matters as much as
mass: a reaction between a gas or a liquid and a solid runs at the solid's surface, and dust has vastly
more surface than bedrock.

### Dusting the basins

Between the start of cooling and the Clear Rain, drones from the Exhaust canopies dust the basin floors, the
[33%](../numbers.md#cryo-footprint-share) of Venus where the CO₂ will pool. The acid rain and the
sulfur-laden liquid CO₂ then land on fresh lime rather than bare rock.

### The shore buffer

When the ice melts and the oceans form, after the caps are sealed and the Veil opens on
[30 June 2036](../numbers.md?date=day#traj-warming), crushed basalt on the shores and the sea floor keeps
the water slightly alkaline: above pH [7.5](../numbers.md#genesis-ph-min), which [Genesis](genesis.md)
needs to hold for [90 d](../numbers.md#genesis-ph-days) before any life is released.

### What is not yet known

How fast lime takes up sulfur in the cold and dry, on frozen basin floors or from liquid CO₂, has not been
measured, and no experiment on the [Research Agenda](../research.md) tests it. The plan does not depend on
it. Sulfur that does not react is sealed in with the CO₂, and what remains meets basalt in warm water when
the oceans melt, where the same reaction is fast.

## Specifications

<!-- table:specs acid -->
| Parameter | Value |
| --- | --- |
| SO₂ | [150 ppm](../numbers.md?show=ppm#venus-so2-fraction), [1.1 × 10¹⁷ kg](../numbers.md#venus-so2-mass) |
| Neutralizer | [9.3 × 10¹⁶ kg](../numbers.md#acid-cao) of CaO, in [9 × 10¹⁷ kg](../numbers.md#acid-basalt) of crushed basalt |
| Basalt layer | [2.1 m](../numbers.md#acid-basalt-layer) over the basins, [0.07%](../numbers.md#acid-crust-share) of the crust available |
| Product | Gypsum and anhydrite, with traces of chloride and fluoride salts |
<!-- /table -->

## What is invented

> **Invented:** Nothing new in kind. The invention is scale: grinding and spreading
> [9 × 10¹⁷ kg](../numbers.md#acid-basalt) of rock across a planet before the Clear Rain.

> **Precedent:** Calcium and magnesium minerals in Venus's crust already react with its acid gases;
> Bullock and Grinspoon modeled these surface reactions as part of Venus's climate
> ([Bullock and Grinspoon 1996](../sources.md#bullock-grinspoon-1996)).

## Build sequence

- **[January 2033](../numbers.md?date=month#cooling-start):** Active cooling begins. Rock mills start
  grinding, and canopy drones start dusting the basin floors.
- **[January 2034](../numbers.md?date=month#traj-clear-rain):** The Clear Rain. By now the acid clouds
  have rained out onto dusted ground, and the SO₂ runs into the basins with the liquid CO₂.
- **[January 2035](../numbers.md?date=month#forge-start):** The Forges start, and their oxygen turns
  sulfite to sulfate.
- **[June 2036](../numbers.md?date=month#traj-warming):** The caps are sealed, the Veil opens and the
  ice melts. Shore basalt buffers the new oceans and the pH clock starts.
- **[September 2036](../numbers.md?date=month#forge-end):** The oxygen is in and the oceans have held
  their pH. [Genesis](genesis.md) seeding begins.

## Failure modes and safeguards

- **The oceans turn acid.** The pH gate holds back every organism until the water has stayed above pH
  [7.5](../numbers.md#genesis-ph-min) for [90 d](../numbers.md#genesis-ph-days). The fix is more basalt;
  the crust has plenty.
- **A cryo-continent cell breaks open.** It releases at most
  [3.1 × 10¹⁴ kg](../numbers.md#cryo-cell-co2) of CO₂ and the sulfur frozen with it. Shore basalt and the
  oceans take up the sulfur while the cell is resealed.
- **The cold reaction is slow.** Covered above: unreacted sulfur is sealed with the CO₂ or reacts in warm
  water later.

## Reproduce these numbers

The Acid Sweep's numbers are in the `acid` function of
[calc/src/model/shield.ts](../../calc/src/model/shield.ts); the SO₂ itself comes from
[calc/src/model/venus.ts](../../calc/src/model/venus.ts).

```sh
pnpm calc --only venus-so2-mass       # how much SO₂ Venus's air holds
pnpm calc --only acid-cao             # lime to take it all up
pnpm calc --only acid-basalt-layer    # that basalt, spread over the basins
```

The [Explorer](https://phosphoros.space/explore) has no Acid Sweep slider; use `--set`. Poorer basalt
means proportionally more rock: `pnpm calc --set basalt-cao-fraction=0.05` doubles the basalt and the
layer while the lime stays the same. More SO₂ (`venus-so2-fraction`) raises the lime and the basalt in
proportion.
