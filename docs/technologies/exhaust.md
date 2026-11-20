# Photonic Exhaust

[10,000](../numbers.md#exhaust-canopies) floating canopies carry [5.5 × 10¹³ m²](../numbers.md#exhaust-area-installed)
of emitter tiles, [12%](../numbers.md#exhaust-area-share) of Venus's area, that pump the planet's heat into light and
fire it into space at [2.3 µm](../numbers.md#exhaust-wavelength). Each tile shines
[0.91 MW/m²](../numbers.md#exhaust-flux) while sitting at the temperature of the air it cools. At the peak the
Exhaust throws out [5.0 × 10¹⁹ W](../numbers.md#exhaust-peak); over the campaign it removes
[5.3 × 10²⁶ J](../numbers.md#atmosphere-heat) of Venus's heat and spends
[3.5 × 10²⁷ J](../numbers.md#traj-pump-energy) of beamed electricity doing it.

<!-- figure:heat-path -->
![Venus's heat path, in cross-section](../../figures/svg/heat-path.svg)
<!-- /figure -->

## Principle

**A radiator is not enough.** Anything radiates at most σT⁴ at its own temperature. Venus, shaded, radiates from
its cloud tops at about [230 K](../numbers.md#cloudtop-temp), [7.3 × 10¹⁶ W](../numbers.md#passive-power) in all, a
few hundred watts per square meter. At that rate cooling would take
[230 yr](../numbers.md#passive-years). To finish in a few years, heat has to leave far faster than any surface at
the air's temperature can shine. It has to be pumped.

**A light-emitting heat pump.** An LED makes about one photon per electron. The photon's energy is set by the
semiconductor's bandgap; the electron's energy is set by the voltage. Drive the diode just below its bandgap and
each photon leaves with more energy than its electron brought. The difference is taken from the vibrations of the
crystal, which is to say from heat: the LED cools while it shines. MIT showed it, an LED emitting
[6.9 × 10⁻¹¹ W](../numbers.md#led-2012-light-out) of light from [3.0 × 10⁻¹¹ W](../numbers.md#led-2012-power-in) of
electricity ([Santhanam 2012](../sources.md#santhanam-2012)). The Exhaust's tiles must do the same at a power density
that has never been approached, with a bandgap of [0.54 eV](../numbers.md#exhaust-bandgap),
which sets the [2.3 µm](../numbers.md#exhaust-wavelength) wavelength.

LED light is not heat radiation, so it is not limited by σT⁴. The voltage packs photons into the diode's band far
more densely than a thermal body at the tile's temperature would. That lets a tile at a few hundred kelvin shine
[0.91 MW/m²](../numbers.md#exhaust-flux), what a black body at [2,000 K](../numbers.md#exhaust-effective-temp)
radiates.

**The Carnot cost.** Nothing escapes the second law. A heat pump moving heat dQ from a cold side at T_c into a hot
reservoir at T_h needs at least `dW = dQ (T_h / T_c − 1)` of work. Here the cold side is the air, and the hot
reservoir is the light itself; the model takes its temperature as the emitters' effective
[2,000 K](../numbers.md#exhaust-effective-temp). Summed along the cooling path, from
[737 K](../numbers.md#venus-surface-temp) down to [195 K](../numbers.md?sig=3#freeze-target-temp):

- the sensible cooling costs [1.0 × 10²⁷ J](../numbers.md#exhaust-work-sensible) of work;
- the latent heat, released as the CO₂ condenses and freezes between
  [304 K](../numbers.md?sig=3#co2-critical-temp) and [216.6 K](../numbers.md#co2-triple-temp), costs
  [1.8 × 10²⁷ J](../numbers.md#exhaust-work-latent), more than the sensible part because it comes out when the air is
  cold and every joule is dearest;
- in all, [2.83 × 10²⁷ J](../numbers.md#exhaust-work) for [5.3 × 10²⁶ J](../numbers.md#atmosphere-heat) of heat:
  [5.4](../numbers.md#exhaust-work-ratio) joules of electricity per joule moved.

Heat and work both leave as light, [3.4 × 10²⁷ J](../numbers.md#exhaust-rejected) in all. The model checks that the
pumps never beat Carnot ([check](../numbers.md#check-second-law)). It charges exactly the Carnot work, the least the
second law allows; real tiles will need more.

> **Physics:** The second law prices light by its entropy, and light squeezed into a narrow band and a narrow cone
> carries little entropy for its energy: it counts as hotter than its brightness suggests. A hot side of
> [2,000 K](../numbers.md#exhaust-effective-temp) is right for light spread over colors and directions the way a
> surface that hot spreads it. A single line at [2.3 µm](../numbers.md#exhaust-wavelength) aimed into a
> [25°](../numbers.md#exhaust-cone) cone, at [0.91 MW/m²](../numbers.md#exhaust-flux), is far hotter than that, and
> pumping heat into it would cost several times the work the model charges even spread over the whole sky, and far
> more in the cone. Version 3 has not yet reconciled this. Either the tiles spread their light over a much wider band
> and wider angles than version 2 described (and the thin air above the canopies lets that light through), or the
> work and the emitter area grow. Read the model's pump work as a floor.

**The trade.** The effective temperature is a choice. Hotter light means brighter tiles and less area, but more work
per joule. Run the same campaign with the coolest emitters the model tries and the working emitters would cover
[58%](../numbers.md#exhaust-area-share-1000) of Venus; with the middle option,
[17%](../numbers.md#exhaust-area-share-1500); with the hottest, [3.7%](../numbers.md#exhaust-area-share-2500), for more
work. The ledger gives each option's temperature. The plan picks
[2,000 K](../numbers.md#exhaust-effective-temp).

Against a shaded Venus radiating alone, the Exhaust throws out [420](../numbers.md#exhaust-vs-passive-light) times as
much light on average, and removes [66](../numbers.md#exhaust-vs-passive-heat) times as much of the planet's own heat.
The difference between the two is the work.

## Design

**Canopies.** Each canopy is a hexagonal aerostat [80 km](../numbers.md#canopy-width) across,
[5.5 × 10⁹ m²](../numbers.md#canopy-area), floating at the top of its [Thermal Chimney](chimneys.md),
[65 km](../numbers.md#chimney-top) up. It floats on CO₂ warmed by the heat arriving from below, a hot-air balloon heated
by the heat it is pumping out. Exchangers in its floor take heat from the chimney's liquid loops; tiles on its top
throw it to space. As the CO₂ rains out and the air thins, the canopies float lower. On average each one takes in
[2.6 × 10¹⁵ W](../numbers.md#canopy-power-in) of electricity and throws out
[3.0 × 10¹⁵ W](../numbers.md#canopy-power-out) of light.

**Tiles.** Each tile is an InGaAsSb thermophotonic diode with a [0.54 eV](../numbers.md#exhaust-bandgap) bandgap.
A photon-recycling cavity sends light that would be reabsorbed back for another chance to escape. Every electron that
recombines without making a photon dumps its energy into the tile as heat, so the tiles must reach an external
quantum efficiency of [99.9%](../numbers.md#exhaust-eqe). A photonic-crystal face aims the light upward into a
[25°](../numbers.md#exhaust-cone) cone.

**Why [2.3 µm](../numbers.md#exhaust-wavelength).** The thin CO₂ above the canopies barely absorbs at that wavelength,
and the [Hesperus Veil](veil.md) is made transparent there, so the beams leave Venus and pass the Veil untouched.

**Sizing, and why version 3 made it bigger.** Version 2 sized the Exhaust from the campaign's average,
[3.0 × 10¹⁹ W](../numbers.md#exhaust-rejected-avg), which [3.4 × 10¹³ m²](../numbers.md#exhaust-area-working) of
working tiles can shine. The day-by-day [simulation](../plan.md#the-simulated-atmosphere) shows that the average hides
three different phases:

1. **January to June 2033.** The Lattice is still growing and all of it goes to cooling. Cooling is fast.
2. **June 2033 to August 2034.** The Ceres Railheads draw [5.6 × 10¹⁹ W](../numbers.md#railhead-power) of the
   Lattice's [7.0 × 10¹⁹ W](../numbers.md#helios-power). Cooling crawls; the Clear Rain begins on
   [19 January 2034](../numbers.md?date=day#traj-clear-rain).
3. **From August 2034.** The Ring recovers [7.2 × 10¹⁹ W](../numbers.md#ring-power) from the arriving ice and powers the
   Railheads. Power is now plentiful, and the emitters, not the supply, set the pace.

So the emitters must be sized for the peak of the third phase. With version 2's smaller Exhaust the simulated air
becomes Earth-like months after the deadline. With [5.0 × 10¹⁹ W](../numbers.md#exhaust-peak) of emitters,
[5.5 × 10¹³ m²](../numbers.md#exhaust-area-installed), the CO₂ is down by
[20 April 2036](../numbers.md?date=day#traj-cold) and the air is Earth-like on
[30 September 2036](../numbers.md?date=day#traj-earth-like), with [92 d](../numbers.md#traj-slack-days) to spare. A bigger
Exhaust buys nothing: the finish then waits on the Forges' oxygen, and the extra pumping overdraws the Lattice.

<!-- figure:trajectory -->
![The simulated atmosphere, 2033 to 2036](../../figures/svg/trajectory.svg)
<!-- /figure -->

**What the simulation pumps.** The simulation spends [3.5 × 10²⁷ J](../numbers.md#traj-pump-energy) of pump work, more
than the [2.83 × 10²⁷ J](../numbers.md#exhaust-work) the air alone needs. Heat keeps arriving from the crust, the
Forges' waste, the falling ice and the sunlight the closed Veil lets through,
[7.5 × 10²⁵ J](../numbers.md#traj-heat-added) in all, much of it late, when pumping is dearest. With everything else,
the plan's demand is [7.7 × 10²⁷ J](../numbers.md#budget-demand) against the Lattice's
[7.8 × 10²⁷ J](../numbers.md#helios-supply): [1.7%](../numbers.md#budget-spare) to spare from the Lattice alone,
[28%](../numbers.md#budget-spare-with-ring) once the Ring powers the Railheads.

**Frost Towers.** At [195 K](../numbers.md?sig=3#freeze-target-temp) the air still holds
[1 bar](../numbers.md#co2-pressure-at-freeze) of CO₂ vapor, [5.4 × 10¹⁸ kg](../numbers.md#frost-residual-co2). The same
tiles on surface towers held at [133 K](../numbers.md#frost-tower-temp) freeze it out down to
[74 Pa](../numbers.md#frost-co2-pressure), leaving [3.8 × 10¹⁵ kg](../numbers.md#frost-residual-target) airborne and
[310 ppm](../numbers.md#final-co2-ppm) in the finished air. That takes [4.3 × 10²⁵ J](../numbers.md#frost-work) of work
and is done by [9 May 2036](../numbers.md?date=day#traj-scavenged).

<!-- figure:co2-phase -->
![CO₂ phase diagram with Venus's simulated cooling path](../../figures/svg/co2-phase.svg)
<!-- /figure -->

## Specifications

<!-- table:specs exhaust -->
| Parameter | Value |
| --- | --- |
| Canopies | [10,000](../numbers.md#exhaust-canopies), each about [80 km](../numbers.md#canopy-width) across |
| Emitter area | [3.4 × 10¹³ m²](../numbers.md#exhaust-area-working) working at the average, [5.5 × 10¹³ m²](../numbers.md#exhaust-area-installed) installed for the peak |
| Emission | [2.3 µm](../numbers.md#exhaust-wavelength) at [0.91 MW/m²](../numbers.md#exhaust-flux), in a [25°](../numbers.md#exhaust-cone) cone |
| Effective emitter temperature | [2,000 K](../numbers.md#exhaust-effective-temp) |
| Heat removed from Venus's air | [5.3 × 10²⁶ J](../numbers.md#atmosphere-heat) (average [4.8 × 10¹⁸ W](../numbers.md#exhaust-heat-avg)) |
| Pump work for that heat | [2.83 × 10²⁷ J](../numbers.md#exhaust-work), [5.4](../numbers.md#exhaust-work-ratio) J per joule moved |
| Pump work in the simulation | [3.5 × 10²⁷ J](../numbers.md#traj-pump-energy), counting heat from the crust, the Forges and the ice |
| Peak power out | [5.0 × 10¹⁹ W](../numbers.md#exhaust-peak) |
| Per canopy | [2.6 × 10¹⁵ W](../numbers.md#canopy-power-in) in, [3.0 × 10¹⁵ W](../numbers.md#canopy-power-out) out |
| Frost Towers | Tiles at [133 K](../numbers.md#frost-tower-temp) trap the last CO₂ to [74 Pa](../numbers.md#frost-co2-pressure) |
<!-- /table -->

## What is invented

> **Invented:** Electroluminescent cooling at [0.91 MW/m²](../numbers.md#exhaust-flux). It has never been shown at useful
> power. The [Exhaust-1](../research.md#exhaust-1) experiment must show net cooling at a useful power density by 2028.

> **Invented:** InGaAsSb thermophotonic tiles with photon recycling and an external quantum efficiency of
> [99.9%](../numbers.md#exhaust-eqe), made by the square kilometer.

> **Invented:** Hot-gas aerostat canopies [80 km](../numbers.md#canopy-width) across, floating on the heat they pump.

> **Precedent:** An LED at MIT emitted [6.9 × 10⁻¹¹ W](../numbers.md#led-2012-light-out) of light from
> [3.0 × 10⁻¹¹ W](../numbers.md#led-2012-power-in) of electricity, drawing the rest from heat
> ([Santhanam 2012](../sources.md#santhanam-2012); [Phys.org](../sources.md#physorg-2012-led)).

> **Precedent:** Thermophotonic energy transfer has been measured in intracavity structures at Aalto
> ([Casado 2019](../sources.md#casado-2019)).

## Build sequence

- **[2027](../numbers.md?date=year#program-start):** [Exhaust-1](../research.md#exhaust-1) begins in the laboratory. Its
  kill signal, no net cooling at useful power, would send the plan back to the multi-century route.
- **[31 December 2028](../numbers.md?date=day#experiments-end):** Exhaust-1 must have passed.
- **[30 June 2032](../numbers.md?date=day#veil-close):** Under the closed Veil, the canopies float up and their chimneys
  are lowered.
- **[1 January 2033](../numbers.md?date=day#cooling-start):** Active cooling begins, on the growing Lattice's power.
- **[June 2033](../numbers.md?date=month#ice-launch-start):** The Railheads take most of the power; cooling slows.
- **[19 January 2034](../numbers.md?date=day#traj-clear-rain):** The Clear Rain: liquid CO₂ starts to fall.
- **[17 August 2034](../numbers.md?date=day#ring-pays-from):** The Ring pays for the Railheads. The Exhaust runs at its
  limit from here on.
- **[14 March 2036](../numbers.md?date=day#traj-freeze):** The CO₂ seas start to freeze.
- **[20 April 2036](../numbers.md?date=day#traj-cold):** All the CO₂ is down. The Frost Towers take over.
- **[9 May 2036](../numbers.md?date=day#traj-scavenged):** The CO₂ left in the air is at its target.
- **[30 June 2036](../numbers.md?date=day#cooling-end):** Active cooling ends; the caps are sealed and the Veil opens.
- **[30 September 2036](../numbers.md?date=day#traj-earth-like):** Venus is Earth-like.

## Failure modes and safeguards

- **Dead tiles.** A failed tile goes dark and its neighbors take its share. Installed area,
  [5.5 × 10¹³ m²](../numbers.md#exhaust-area-installed), is well above the
  [3.4 × 10¹³ m²](../numbers.md#exhaust-area-working) working on average.
- **The Ring overhead.** The [Braking Ring](ring.md) circles [400 km](../numbers.md#ring-altitude) up. Tiles whose
  cones would cross it stay dark.
- **Stray light.** Each canopy's light spreads through its cone. Long before it reaches the Veil it is far fainter
  than sunlight, and the Veil is transparent to it anyway.
- **A stalled Exhaust.** Under the closed Veil, Venus gains heat only slowly, from the crust and the little sunlight
  the Veil lets through, so a pause costs time, not ground.
- **The second law.** The model charges ideal pumping. Every real loss, and the entropy of narrow, beamed light, adds
  work, and from the Lattice alone the budget has only [1.7%](../numbers.md#budget-spare) to spare. The Ring's
  recovered energy is the real margin.

## Reproduce these numbers

The Exhaust's numbers come from [calc/src/model/exhaust.ts](../../calc/src/model/exhaust.ts); the day-by-day cooling
from [calc/src/model/trajectory.ts](../../calc/src/model/trajectory.ts).

```sh
pnpm calc --only exhaust-work-ratio      # Carnot work along the cooling path, per joule moved
pnpm calc --only exhaust-area-installed  # peak power / σT⁴
pnpm calc --only traj-earth-like         # the day-by-day simulation's finish
pnpm calc --only traj-pump-energy        # what the simulation actually spends
```

In the [Explorer](https://phosphoros.space/explore), lower `exhaust-peak` toward version 2's size and the simulated
finish slips past the deadline. Raise it and the finish does not move, because the oxygen sets it, while the pump work
and the energy demand rise until the Lattice alone no longer covers them. Lower `exhaust-effective-temp` and each joule
costs less work but the emitter area grows steeply; raise it and the area shrinks but the work grows.
