# Cryo-continents

All [4.69 × 10²⁰ kg](../numbers.md#venus-co2-mass) of Venus's CO₂ rains out as liquid, freezes, and is sealed under
insulated caps: [3.0 × 10¹⁷ m³](../numbers.md#cryo-volume) of dry ice in plateaus [2 km](../numbers.md#cryo-thickness)
thick over [33%](../numbers.md#cryo-footprint-share) of the planet. The caps let the sky warm to Earth-like
temperatures while the ice below stays at [180 K](../numbers.md#cryo-ice-temp). The plateaus become new land, and their
floors need refrigerating for centuries.

<!-- figure:co2-phase -->
![CO₂ phase diagram with Venus's simulated cooling path](../../figures/svg/co2-phase.svg)
<!-- /figure -->

## Principle

CO₂ has three regimes that matter here:

- Above its critical point, [304 K](../numbers.md?sig=3#co2-critical-temp) and
  [73.8 bar](../numbers.md#co2-critical-pressure), there is no liquid at all, only gas. That is Venus today.
- Between the critical point and the triple point, [216.6 K](../numbers.md#co2-triple-temp) and
  [5.2 bar](../numbers.md#co2-triple-pressure), CO₂ can be liquid under its own vapor. Venus's air, at
  [92 bar](../numbers.md#venus-surface-pressure), is far above the triple-point pressure, so as it cools below
  [304 K](../numbers.md?sig=3#co2-critical-temp) its CO₂ condenses and rains.
- Below the triple point it is solid. The vapor over dry ice keeps falling with temperature: at
  [195 K](../numbers.md?sig=3#freeze-target-temp) it is still [1 bar](../numbers.md#co2-pressure-at-freeze), and at the
  Frost Towers' [133 K](../numbers.md#frost-tower-temp) only [54 Pa](../numbers.md#frost-co2-pressure).

Left open to a warm sky, dry ice turns straight back into gas. Sealed under a gas-tight, insulated lid, it is cut off
from the air: the air above can sit at [288 K](../numbers.md#earth-surface-temp) while the ice stays at
[180 K](../numbers.md#cryo-ice-temp). The insulation, not the cold, is what keeps the CO₂ out of the sky.

## Design

### The sequence

The dates are from the day-by-day [simulation](../plan.md#the-simulated-atmosphere), which treats the whole atmosphere
as one temperature. Real basins will run ahead of or behind these dates by place.

1. **The Clear Rain, [8 August 2034](../numbers.md?date=day#traj-clear-rain).** The air falls below
   [304 K](../numbers.md?sig=3#co2-critical-temp) and liquid CO₂ rains out. It runs downhill into the lowland basins,
   such as Atalanta Planitia, which the [Thermal Chimneys](chimneys.md) have already filled with pooled cold air.
   The surface pressure starts to fall from [92 bar](../numbers.md#venus-surface-pressure).
2. **The seas cool, 2034 and 2035.** As the Exhaust keeps pumping, the air and the seas cool together along CO₂'s
   vapor curve. Every kelvin lower, more CO₂ leaves the air for the seas, each kilogram giving up its heat of
   condensation, and the pressure keeps falling. Then the [Ice Train](ice-train.md)'s Bricks fall into the polar air,
   from [November 2034](../numbers.md?date=month#first-arrival) to [January 2035](../numbers.md?date=month#last-arrival),
   faster than the chimneys can carry their heat out. The air warms back by [88 K](../numbers.md#traj-rewarm), above the
   critical point, and the new liquid boils back into it, until the Clear Rain begins for good on
   [30 January 2035](../numbers.md?date=day#traj-rerain) ([Ice Train](ice-train.md#the-campaigns-dates)). The [Graphite Forges](forges.md) float on these seas from
   [April 2035](../numbers.md?date=month#forge-start).
3. **The seas freeze, [7 November 2035](../numbers.md?date=day#traj-freeze) to
   [30 April 2036](../numbers.md?date=day#traj-frozen).** At the triple point, [216.6 K](../numbers.md#co2-triple-temp)
   and [5.2 bar](../numbers.md#co2-triple-pressure), liquid, solid and vapor coexist, and the air holds there while
   the seas give up their heat of fusion, [210 kJ/kg](../numbers.md#co2-fusion-heat). It is slow even with the
   tiles at their peak, because this heat comes out when the air is cold and every joule costs the most light. Dry ice is denser than liquid CO₂, so
   crystals that form at the surface sink and each sea fills with ice from the bottom up: it has no firm surface
   until it is frozen through.
4. **The last frost, to [17 June 2036](../numbers.md?date=day#traj-cold).** Below the triple point the
   [5.7%](../numbers.md#co2-triple-vapour-share) of the CO₂ still in the air freezes out as frost while the air cools,
   until at [195 K](../numbers.md?sig=3#freeze-target-temp) all the CO₂ that will come down by cooling alone is down.
5. **Sealing, [30 April 2036](../numbers.md?date=day#traj-frozen) to
   [1 September 2036](../numbers.md?date=day#sealing-end).** Crawler-rafts, waiting on the seas since before the
   freeze, lay the caps once the seas are frozen through: [120 d](../numbers.md#sealing-window) for all
   [1.5 × 10¹⁴ m²](../numbers.md#cryo-footprint), [1.2 × 10⁶ km²/d](../numbers.md#cap-laying-rate) of cap
   ([check](../numbers.md#check-frozen-before-sealing)). Each cap
   is a [1 mm](../numbers.md#cryo-membrane-thickness) graphite membrane that stops the gas,
   [20 m](../numbers.md#cryo-aerogel-thickness) of carbon aerogel that stops the heat, and
   [2 m](../numbers.md#cryo-armour-thickness) of crushed basalt armor with soil on top. Version 2 sealed in 2035.
6. **Scavenging, to [26 June 2036](../numbers.md?date=day#traj-scavenged).** The Frost Towers freeze the last
   [5.4 × 10¹⁸ kg](../numbers.md#frost-residual-co2) of vapor out of the air, down to
   [54 Pa](../numbers.md#frost-co2-pressure). They finish [67 d](../numbers.md#frost-sealing-slack) before the
   last caps are due ([check](../numbers.md#check-frost-before-sealing)).
7. **The thaw above, [2 September 2036](../numbers.md?date=day#traj-warming).** With the last caps sealed, the
   Veil opens. The thin nitrogen and oxygen air warms to [285 K](../numbers.md#earth-like-temp) the same day,
   [2 September 2036](../numbers.md?date=day#traj-warm), and cap surfaces warm with it. Venus is Earth-like on
   [30 September 2036](../numbers.md?date=day#traj-earth-like), when the Forges complete the oxygen
   ([30 September 2036](../numbers.md?date=day#forge-end)).

<!-- figure:trajectory -->
![The simulated atmosphere, day by day](../../figures/svg/trajectory.svg)
<!-- /figure -->

### The plateaus

The CO₂ as dry ice, at [1,562 kg/m³](../numbers.md#dry-ice-density), fills [3.0 × 10¹⁷ m³](../numbers.md#cryo-volume). At
[2 km](../numbers.md#cryo-thickness) thick that covers [1.5 × 10¹⁴ m²](../numbers.md#cryo-footprint), a third of the
planet. The caps take [2.5 × 10¹⁷ kg](../numbers.md#cryo-cap-mass) of carbon aerogel, at
[82 kg/m³](../numbers.md#cryo-aerogel-density), [3.3 × 10¹⁴ kg](../numbers.md#cryo-membrane-mass) of graphite membrane
and [9.0 × 10¹⁷ kg](../numbers.md#cryo-armour-mass) of basalt. All the carbon comes from the Forges.

**Heat from above.** Carbon aerogel conducts only [0.029 W/(m·K)](../numbers.md#cryo-aerogel-conductivity), as
measured in air ([Lu et al. 1993](../sources.md#lu-1993-aerogel)). Across
[20 m](../numbers.md#cryo-aerogel-thickness), between a [288 K](../numbers.md#earth-surface-temp) surface and
[180 K](../numbers.md#cryo-ice-temp) ice, the leak is `k ΔT / L`: [0.16 W/m²](../numbers.md#cryo-leak-flux),
[24 TW](../numbers.md#cryo-leak-total) over all the caps. That is the easy part.

**Compartments.** The caps are divided into [1.5 × 10⁶](../numbers.md#cryo-cells) sealed cells of
[100 km²](../numbers.md#cryo-cell-area), each holding at most [3.1 × 10¹⁴ kg](../numbers.md#cryo-cell-co2). A breach is one
cell's problem.

### The floor is the hard part

The rock under the basins sat at [737 K](../numbers.md#venus-surface-temp) for ages, and its heat does not leave when
the air cools. Heat conducted up from hot rock into a cold floor falls off as the square root of time,
`q = k ΔT / √(π κ t)`, with basalt's conductivity [2.5 W/(m·K)](../numbers.md#rock-conductivity) and diffusivity
[1.0 × 10⁻⁶ m²/s](../numbers.md#rock-diffusivity). Taking an effective step of [450 K](../numbers.md#cryo-floor-step),
smaller than the full difference because the floors are cooled before the CO₂ arrives:

| Years after sealing | Heat rising through the floor |
| --- | --- |
| 2 | [80 W/m²](../numbers.md#cryo-floor-flux-2) |
| 10 | [36 W/m²](../numbers.md#cryo-floor-flux-10) |
| 100 | [11 W/m²](../numbers.md#cryo-floor-flux-100) |
| 1,000 | [3.6 W/m²](../numbers.md#cryo-floor-flux-1000) |

Over the whole footprint that is [12 PW](../numbers.md#cryo-floor-load) at first and still
[1.7 PW](../numbers.md#cryo-floor-load-century) after a century, far more than the
[24 TW](../numbers.md#cryo-leak-total) leaking down through the caps.
Unrefrigerated, that heat would not turn the ice to gas. Under [2 km](../numbers.md#cryo-thickness) of dry ice the base
is at [280 bar](../numbers.md#cryo-base-pressure), far above the triple-point pressure, and melts at
[222 K](../numbers.md#cryo-base-melt-temp). Dry ice conducts far too little to carry that heat up through the sheet, so it
melts the base, which takes only the heat of fusion, [210 kJ/kg](../numbers.md#co2-fusion-heat):
[7.6 m](../numbers.md#cryo-base-melt-rate) off the base a year at first, [0.4%](../numbers.md#cryo-unrefrigerated-loss)
of all the CO₂. The liquid is lighter than the ice above it and carries its weight, so it lubricates the sheet and
presses out toward the cell walls and any crack.

The answer is to take the heat out before it reaches the ice. **Basal heat pipes** are drilled
[200 m](../numbers.md#heat-pipe-depth) into the basin floors before the Clear Rain: sodium for the hot early rock, ammonia
once it cools. Insulated risers carry the heat up through the ice to radiators on the cap surface, where Exhaust tiles
throw it to space. Pumping the first [12 PW](../numbers.md#cryo-floor-load) away, from the ice's temperature to the
[3,500 K](../numbers.md#exhaust-light-temp) the tiles' light counts as, with pumps at
[50%](../numbers.md#exhaust-carnot-share) of the Carnot limit, takes [0.2%](../numbers.md#cryo-refrigeration-share) of the
Lattice's [2.2 × 10²⁰ W](../numbers.md#helios-power) of light, and less every year as the rock cools. It never stops
entirely: this is a permanent duty, like pumping a polder dry.

## Specifications

<!-- table:specs cryo -->
| Parameter | Value |
| --- | --- |
| CO₂ stored | [4.69 × 10²⁰ kg](../numbers.md#venus-co2-mass), [3.0 × 10¹⁷ m³](../numbers.md#cryo-volume) of dry ice |
| Footprint | [1.5 × 10¹⁴ m²](../numbers.md#cryo-footprint), [33%](../numbers.md#cryo-footprint-share) of Venus, [2 km](../numbers.md#cryo-thickness) thick |
| Cap | [1 mm](../numbers.md#cryo-membrane-thickness) graphite membrane, [20 m](../numbers.md#cryo-aerogel-thickness) carbon aerogel, [2 m](../numbers.md#cryo-armour-thickness) basalt |
| Cap mass | [2.5 × 10¹⁷ kg](../numbers.md#cryo-cap-mass) of Forge graphite |
| Heat leaking down through the cap | [0.16 W/m²](../numbers.md#cryo-leak-flux), [24 TW](../numbers.md#cryo-leak-total) in all |
| Heat up from the rock | [80 W/m²](../numbers.md#cryo-floor-flux-2) after 2 years, [36 W/m²](../numbers.md#cryo-floor-flux-10) after 10, [11 W/m²](../numbers.md#cryo-floor-flux-100) after 100, [3.6 W/m²](../numbers.md#cryo-floor-flux-1000) after 1,000 |
| Floor load | [12 PW](../numbers.md#cryo-floor-load) at first, [1.7 PW](../numbers.md#cryo-floor-load-century) within a century |
| Refrigeration | [0.2%](../numbers.md#cryo-refrigeration-share) of the Lattice at first |
| Compartments | [1.5 × 10⁶](../numbers.md#cryo-cells) cells of [100 km²](../numbers.md#cryo-cell-area), at most [3.1 × 10¹⁴ kg](../numbers.md#cryo-cell-co2) each |
| A torn cell | Releases at most [3.1 × 10¹⁴ kg](../numbers.md#cryo-cell-co2), [26 ppm](../numbers.md#cryo-cell-release-ppm) of the air; resealed within [7 d](../numbers.md#cryo-reseal-time) |
| Sealing | [120 d](../numbers.md#sealing-window) from the seas frozen through ([30 April 2036](../numbers.md?date=day#traj-frozen)) to the last cap ([1 September 2036](../numbers.md?date=day#sealing-end)): [1.2 × 10⁶ km²/d](../numbers.md#cap-laying-rate) of cap |
| If refrigeration stops | The floor heat melts the base into a liquid layer under the cap, [7.6 m](../numbers.md#cryo-base-melt-rate) of ice a year at first: [0.4%](../numbers.md#cryo-unrefrigerated-loss) of the CO₂ |
<!-- /table -->

## What is invented

> **Invented:** Sodium and ammonia heat pipes drilled into basin floors before the CO₂ arrives, and kept running under
> [2 km](../numbers.md#cryo-thickness) of dry ice for centuries.

> **Invented:** Crawler-rafts that lay a gas-tight graphite membrane and [20 m](../numbers.md#cryo-aerogel-thickness) of
> aerogel over [1.5 × 10¹⁴ m²](../numbers.md#cryo-footprint) of frozen sea in [120 d](../numbers.md#sealing-window),
> [1.2 × 10⁶ km²/d](../numbers.md#cap-laying-rate).

> **Invented:** A graphite membrane only [1 mm](../numbers.md#cryo-membrane-thickness) thick that stays gas-tight over a
> continent of ice, through thermal cycling and the ice's slow creep.

> **Precedent:** Carbon aerogels are real materials. The cap's density and conductivity are the values Lu and colleagues
> measured in air ([Lu et al. 1993](../sources.md#lu-1993-aerogel)), and the [Cryo-seal](../research.md#cryo-seal) experiment
> must show the cap's leak on Earth before anything is built.

## Build sequence

- **[2027](../numbers.md?date=year#program-start):** [Cryo-seal](../research.md#cryo-seal) begins: dry ice stored under a
  cap at Earth temperature for a year, measuring the leak. Its kill signal is a cap that cracks under thermal cycling.
- **[23 February 2034](../numbers.md?date=day#cooling-start):** Active cooling begins. Basal heat pipes are drilled into the
  lowland basins while they are still dry.
- **[8 August 2034](../numbers.md?date=day#traj-clear-rain):** The Clear Rain. Liquid CO₂ fills the basins.
- **[13 November 2034](../numbers.md?date=day#first-arrival):** The first Bricks fall into the polar air. Their heat
  warms the air back above the critical point, and the liquid boils back.
- **[30 January 2035](../numbers.md?date=day#traj-rerain):** The Clear Rain begins for good.
- **[April 2035](../numbers.md?date=month#forge-start):** The Forges start making graphite on the seas, the caps' raw
  material.
- **[7 November 2035](../numbers.md?date=day#traj-freeze):** The air reaches the triple point and the seas start to freeze.
- **[30 April 2036](../numbers.md?date=day#traj-frozen):** The seas are frozen through. Sealing begins.
- **[17 June 2036](../numbers.md?date=day#traj-cold):** All the CO₂ is down at [195 K](../numbers.md?sig=3#freeze-target-temp).
- **[26 June 2036](../numbers.md?date=day#traj-scavenged):** The Frost Towers finish, [67 d](../numbers.md#frost-sealing-slack)
  before the last caps are due ([check](../numbers.md#check-frost-before-sealing)).
- **[1 September 2036](../numbers.md?date=day#sealing-end):** The last caps are sealed. By then the Forges have made
  [4.6 × 10¹⁷ kg](../numbers.md#graphite-by-sealing) of graphite, more than the
  [2.5 × 10¹⁷ kg](../numbers.md#cryo-cap-mass) the caps need ([check](../numbers.md#check-graphite-for-caps)).
- **[2 September 2036](../numbers.md?date=day#traj-warming):** The Veil opens, and the air over the caps warms
  within the day.
- **[30 September 2036](../numbers.md?date=day#traj-earth-like):** Venus is Earth-like. The floor refrigeration carries
  on beyond the deadline, falling toward [1.7 PW](../numbers.md#cryo-floor-load-century) within a century.

## Failure modes and safeguards

- **A torn cell.** One cell holds at most [3.1 × 10¹⁴ kg](../numbers.md#cryo-cell-co2) of CO₂. Released whole, it
  would add [26 ppm](../numbers.md?show=ppm#cryo-cell-release-ppm) to the air, far less than the gap between the
  finished air's [230 ppm](../numbers.md#final-co2-ppm) and the Earth-like limit of
  [600 ppm](../numbers.md#earth-like-co2). Each cell has its own seal and its own refrigeration, and the crawlers
  that laid it reseal it within [7 d](../numbers.md#cryo-reseal-time).
- **Refrigeration stops.** Under a sealed cap, [2 km](../numbers.md#cryo-thickness) of ice press the base to
  [280 bar](../numbers.md#cryo-base-pressure), far above the triple point, so the floor heat melts the base into a
  liquid layer rather than sending gas into the air: [7.6 m](../numbers.md#cryo-base-melt-rate) of ice a year at first,
  [0.4%](../numbers.md#cryo-unrefrigerated-loss) of the CO₂, less as the rock cools. The liquid is lighter than the
  ice and carries its weight, so it lubricates the sheet and presses toward the cell walls: a breach from below,
  slow but not stopped by the cap. How long a cell holds its CO₂ then is not modelled, so the plan does not claim
  decades.
- **The Veil fails open.** Sunlight warms the air and the cap surfaces, not the ice under
  [20 m](../numbers.md#cryo-aerogel-thickness) of aerogel. The caps are the backstop for the [Hesperus Veil](veil.md), not
  the other way round.
- **Volcanism.** Venus is volcanically active. An eruption under a cap is a local breach, contained by its cells.
- **Later choices.** The CO₂ can stay forever, be turned slowly into carbonate rock, or be thrown off the planet over
  centuries. None of this is needed by 2036.

## Reproduce these numbers

The caps, leaks and floor heat come from [calc/src/model/cryo.ts](../../calc/src/model/cryo.ts); the dates from
[calc/src/model/trajectory.ts](../../calc/src/model/trajectory.ts).

```sh
pnpm calc --only cryo-floor-load           # k ΔT / √(π κ t) over the footprint, two years in
pnpm calc --only cryo-leak-flux            # k ΔT / L through the aerogel
pnpm calc --only cryo-refrigeration-share  # pumping the floor heat away, as a share of the Lattice
pnpm calc --only traj-frozen               # when the seas are frozen through, day by day
pnpm calc --only cap-laying-rate           # the cap to lay each day of the sealing window
pnpm calc --only cryo-base-melt-rate       # the base melted each year if refrigeration stops
```

Try `pnpm calc --set cryo-thickness=3000`: thicker plateaus cover less of the planet and need less cap carbon, but each
cell holds more CO₂, so a breach is bigger. A thinner `cryo-aerogel-thickness` raises the leak in proportion and saves
carbon. A larger `cryo-floor-step`, floors less cooled before the CO₂ arrives, raises the floor load in proportion.
