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
  Frost Towers' [133 K](../numbers.md#frost-tower-temp) only [74 Pa](../numbers.md#frost-co2-pressure).

Left open to a warm sky, dry ice turns straight back into gas. Sealed under a gas-tight, insulated lid, it is cut off
from the air: the air above can sit at [288 K](../numbers.md#earth-surface-temp) while the ice stays at
[180 K](../numbers.md#cryo-ice-temp). The insulation, not the cold, is what keeps the CO₂ out of the sky.

## Design

### The sequence

The dates are from the day-by-day [simulation](../plan.md#the-simulated-atmosphere), which treats the whole atmosphere
as one temperature. Real basins will run ahead of or behind these dates by place.

1. **The Clear Rain, [7 September 2034](../numbers.md?date=day#traj-clear-rain).** The air falls below
   [304 K](../numbers.md?sig=3#co2-critical-temp) and liquid CO₂ rains out. It runs downhill into the lowland basins,
   such as Atalanta Planitia, which the [Thermal Chimneys](chimneys.md) have already filled with pooled cold air.
   The surface pressure starts to fall from [92 bar](../numbers.md#venus-surface-pressure).
2. **The seas cool, 2034 to 2036.** As the Exhaust keeps pumping, the air and the seas cool together along CO₂'s vapor
   curve. Every kelvin lower, more CO₂ leaves the air for the seas, and the pressure keeps falling. The
   [Graphite Forges](forges.md) float on these seas from [January 2035](../numbers.md?date=month#forge-start).
3. **The seas freeze, [17 July 2036](../numbers.md?date=day#traj-freeze).** Below
   [216.6 K](../numbers.md#co2-triple-temp) the seas freeze from the top down. By
   [23 August 2036](../numbers.md?date=day#traj-cold) the air is at [195 K](../numbers.md?sig=3#freeze-target-temp) and all
   the CO₂ that will come down by cooling alone is down.
4. **Scavenging, to [11 September 2036](../numbers.md?date=day#traj-scavenged).** The Frost Towers freeze the last
   [5.4 × 10¹⁸ kg](../numbers.md#frost-residual-co2) of vapor out of the air, down to
   [74 Pa](../numbers.md#frost-co2-pressure).
5. **Sealing, to [15 September 2036](../numbers.md?date=day#sealing-end).** Crawler-rafts, waiting on the seas since before
   the freeze, lay the caps as the ice hardens. Each cap is a [1 mm](../numbers.md#cryo-membrane-thickness) graphite
   membrane that stops the gas, [20 m](../numbers.md#cryo-aerogel-thickness) of carbon aerogel that stops the heat, and
   [2 m](../numbers.md#cryo-armour-thickness) of crushed basalt armor with soil on top. Version 2 sealed in 2035; the
   simulation freezes the seas only in March 2036, so sealing has the months between the freeze and the end of June.
6. **The thaw above, [15 September 2036](../numbers.md?date=day#traj-warming).** With the caps sealed, the Veil opens. The
   thin nitrogen and oxygen air warms to [285 K](../numbers.md#earth-like-temp) by
   [19 September 2036](../numbers.md?date=day#traj-warm), and cap surfaces warm with it. Venus is Earth-like on
   [30 September 2036](../numbers.md?date=day#traj-earth-like), when the oxygen is complete.

<!-- figure:trajectory -->
![The simulated atmosphere, 2033 to 2036](../../figures/svg/trajectory.svg)
<!-- /figure -->

### The plateaus

The CO₂ as dry ice, at [1,562 kg/m³](../numbers.md#dry-ice-density), fills [3.0 × 10¹⁷ m³](../numbers.md#cryo-volume). At
[2 km](../numbers.md#cryo-thickness) thick that covers [1.5 × 10¹⁴ m²](../numbers.md#cryo-footprint), a third of the
planet. The caps take [3.0 × 10¹⁷ kg](../numbers.md#cryo-cap-mass) of carbon aerogel, at
[100 kg/m³](../numbers.md#cryo-aerogel-density), [3.3 × 10¹⁴ kg](../numbers.md#cryo-membrane-mass) of graphite membrane
and [9.0 × 10¹⁷ kg](../numbers.md#cryo-armour-mass) of basalt. All the carbon comes from the Forges.

**Heat from above.** Aerogel conducts only [0.014 W/(m·K)](../numbers.md#cryo-aerogel-conductivity). Across
[20 m](../numbers.md#cryo-aerogel-thickness), between a [288 K](../numbers.md#earth-surface-temp) surface and
[180 K](../numbers.md#cryo-ice-temp) ice, the leak is `k ΔT / L`: [0.076 W/m²](../numbers.md#cryo-leak-flux),
[11 TW](../numbers.md#cryo-leak-total) over all the caps. That is the easy part.

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
[11 TW](../numbers.md#cryo-leak-total) leaking down through the caps.
Unrefrigerated, it is enough heat to sublimate [0.1%](../numbers.md#cryo-unrefrigerated-loss) of all the CO₂ every year.
Under [2 km](../numbers.md#cryo-thickness) of dry ice the base is far above the triple-point pressure, so in practice the
heat would melt the base of the sheet into liquid CO₂ that could lubricate it and work its way out.

The answer is to take the heat out before it reaches the ice. **Basal heat pipes** are drilled
[200 m](../numbers.md#heat-pipe-depth) into the basin floors before the Clear Rain: sodium for the hot early rock, ammonia
once it cools. Insulated risers carry the heat up through the ice to radiators on the cap surface, where Exhaust tiles
throw it to space. Pumping the first [12 PW](../numbers.md#cryo-floor-load) away, even in the worst case of lifting it
from the ice's temperature to the tiles' effective [2,000 K](../numbers.md#exhaust-effective-temp), takes
[0.2%](../numbers.md#cryo-refrigeration-share) of the Lattice's [7.0 × 10¹⁹ W](../numbers.md#helios-power), and less every
year as the rock cools. It never stops entirely: this is a permanent duty, like pumping a polder dry.

## Specifications

<!-- table:specs cryo -->
| Parameter | Value |
| --- | --- |
| CO₂ stored | [4.69 × 10²⁰ kg](../numbers.md#venus-co2-mass), [3.0 × 10¹⁷ m³](../numbers.md#cryo-volume) of dry ice |
| Footprint | [1.5 × 10¹⁴ m²](../numbers.md#cryo-footprint), [33%](../numbers.md#cryo-footprint-share) of Venus, [2 km](../numbers.md#cryo-thickness) thick |
| Cap | [1 mm](../numbers.md#cryo-membrane-thickness) graphite membrane, [20 m](../numbers.md#cryo-aerogel-thickness) carbon aerogel, [2 m](../numbers.md#cryo-armour-thickness) basalt |
| Cap mass | [3.0 × 10¹⁷ kg](../numbers.md#cryo-cap-mass) of Forge graphite |
| Heat leaking down through the cap | [0.076 W/m²](../numbers.md#cryo-leak-flux), [11 TW](../numbers.md#cryo-leak-total) in all |
| Heat up from the rock | [80 W/m²](../numbers.md#cryo-floor-flux-2) after 2 years, [36 W/m²](../numbers.md#cryo-floor-flux-10) after 10, [11 W/m²](../numbers.md#cryo-floor-flux-100) after 100, [3.6 W/m²](../numbers.md#cryo-floor-flux-1000) after 1,000 |
| Floor load | [12 PW](../numbers.md#cryo-floor-load) at first, [1.7 PW](../numbers.md#cryo-floor-load-century) within a century |
| Refrigeration | [0.2%](../numbers.md#cryo-refrigeration-share) of the Lattice at first |
| Compartments | [1.5 × 10⁶](../numbers.md#cryo-cells) cells of [100 km²](../numbers.md#cryo-cell-area), at most [3.1 × 10¹⁴ kg](../numbers.md#cryo-cell-co2) each |
<!-- /table -->

## What is invented

> **Invented:** Sodium and ammonia heat pipes drilled into basin floors before the CO₂ arrives, and kept running under
> [2 km](../numbers.md#cryo-thickness) of dry ice for centuries.

> **Invented:** Crawler-rafts that lay a gas-tight graphite membrane and [20 m](../numbers.md#cryo-aerogel-thickness) of
> aerogel over [1.5 × 10¹⁴ m²](../numbers.md#cryo-footprint) of frozen sea in a few months.

> **Invented:** A graphite membrane only [1 mm](../numbers.md#cryo-membrane-thickness) thick that stays gas-tight over a
> continent of ice, through thermal cycling and the ice's slow creep.

> **Precedent:** Carbon aerogels are real materials, and the cap's density and conductivity are taken from them; the data
> does not yet cite a source for those two figures. The [Cryo-seal](../research.md#cryo-seal) experiment must show the
> cap's leak on Earth before anything is built.

## Build sequence

- **[2027](../numbers.md?date=year#program-start):** [Cryo-seal](../research.md#cryo-seal) begins: dry ice stored under a
  cap at Earth temperature for a year, measuring the leak. Its kill signal is a cap that cracks under thermal cycling.
- **[1 January 2033](../numbers.md?date=day#cooling-start):** Active cooling begins. Basal heat pipes are drilled into the
  lowland basins while they are still dry.
- **[7 September 2034](../numbers.md?date=day#traj-clear-rain):** The Clear Rain. Liquid CO₂ fills the basins.
- **[January 2035](../numbers.md?date=month#forge-start):** The Forges start making graphite on the seas, the caps' raw
  material.
- **[17 July 2036](../numbers.md?date=day#traj-freeze):** The seas freeze from the top. Sealing begins as the ice hardens.
- **[23 August 2036](../numbers.md?date=day#traj-cold):** All the CO₂ is down at [195 K](../numbers.md?sig=3#freeze-target-temp).
- **[11 September 2036](../numbers.md?date=day#traj-scavenged):** The Frost Towers finish.
- **[15 September 2036](../numbers.md?date=day#sealing-end):** The last caps are sealed. By then the Forges have made
  [4.8 × 10¹⁷ kg](../numbers.md#graphite-by-sealing) of graphite, more than the
  [3.0 × 10¹⁷ kg](../numbers.md#cryo-cap-mass) the caps need ([check](../numbers.md#check-graphite-for-caps)). The Veil
  opens.
- **[19 September 2036](../numbers.md?date=day#traj-warm):** The air over the caps is warm.
- **[30 September 2036](../numbers.md?date=day#traj-earth-like):** Venus is Earth-like. The floor refrigeration carries
  on beyond the deadline, falling toward [1.7 PW](../numbers.md#cryo-floor-load-century) within a century.

## Failure modes and safeguards

- **A torn cell.** One cell holds at most [3.1 × 10¹⁴ kg](../numbers.md#cryo-cell-co2) of CO₂, which adds less to the air
  than the gap between the finished air's [310 ppm](../numbers.md#final-co2-ppm) and the Earth-like limit of
  [600 ppm](../numbers.md#earth-like-co2). Each cell has its own seal and its own refrigeration, and is resealed by the
  crawlers that laid it.
- **Refrigeration stops.** The floor heat works slowly: [0.1%](../numbers.md#cryo-unrefrigerated-loss) of the CO₂ a year at
  first, less as the rock cools. There is time to repair, but not forever.
- **The Veil fails open.** Sunlight warms the air and the cap surfaces, not the ice under
  [20 m](../numbers.md#cryo-aerogel-thickness) of aerogel. The caps are the backstop for the [Hesperus Veil](veil.md), not
  the other way round.
- **Volcanism.** Venus is volcanically active. An eruption under a cap is a local breach, contained by its cells.
- **Later choices.** The CO₂ can stay forever, be turned slowly into carbonate rock, or be exported over centuries by
  mass drivers on the [Braking Ring](ring.md). None of this is needed by 2036.

## Reproduce these numbers

The caps, leaks and floor heat come from [calc/src/model/cryo.ts](../../calc/src/model/cryo.ts); the dates from
[calc/src/model/trajectory.ts](../../calc/src/model/trajectory.ts).

```sh
pnpm calc --only cryo-floor-load           # k ΔT / √(π κ t) over the footprint, two years in
pnpm calc --only cryo-leak-flux            # k ΔT / L through the aerogel
pnpm calc --only cryo-refrigeration-share  # pumping the floor heat away, as a share of the Lattice
pnpm calc --only traj-freeze               # when the seas freeze, day by day
```

Try `pnpm calc --set cryo-thickness=3000`: thicker plateaus cover less of the planet and need less cap carbon, but each
cell holds more CO₂, so a breach is bigger. A thinner `cryo-aerogel-thickness` raises the leak in proportion and saves
carbon. A larger `cryo-floor-step`, floors less cooled before the CO₂ arrives, raises the floor load in proportion.
