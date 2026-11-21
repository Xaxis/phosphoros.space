# Photonic Exhaust

[10,000](../numbers.md#exhaust-canopies) floating canopies carry [3.2 × 10¹⁴ m²](../numbers.md#exhaust-area-installed)
of emitter tiles, [70%](../numbers.md#exhaust-area-share) of Venus's area, that pump the planet's heat into light and
fire it into space at [2.3 µm](../numbers.md#exhaust-wavelength). Each tile shines
[0.37 MW/m²](../numbers.md#exhaust-flux) while sitting at the temperature of the air it cools. At the peak the
Exhaust throws out [1.2 × 10²⁰ W](../numbers.md#exhaust-peak); over the campaign it removes
[5.3 × 10²⁶ J](../numbers.md#atmosphere-heat) of Venus's heat and spends
[5.6 × 10²⁷ J](../numbers.md#traj-pump-energy) of beamed electricity doing it.

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
electricity ([Santhanam et al. 2012](../sources.md#santhanam-2012)). The Exhaust's tiles must do the same at a power density
that has never been approached, with a bandgap of [0.54 eV](../numbers.md#exhaust-bandgap),
which sets the [2.3 µm](../numbers.md#exhaust-wavelength) wavelength.

LED light is not heat radiation, so it is not limited by σT⁴. The voltage packs photons into the diode's band far
more densely than a thermal body at the tile's temperature would. That lets a tile at a few hundred kelvin shine
[0.37 MW/m²](../numbers.md#exhaust-flux), what a black body at [1,600 K](../numbers.md#exhaust-effective-temp)
radiates.

**The Carnot cost.** Nothing escapes the second law. A heat pump moving heat dQ from a cold side at T_c into a hot
reservoir at T_h needs at least `dW = dQ (T_h / T_c − 1)` of work. Here the cold side is the air, and the hot
reservoir is the light itself; the model takes its temperature as the emitters' effective
[1,600 K](../numbers.md#exhaust-effective-temp). A hotter emitter would need less area, since it shines as T⁴, but
more work for every joule; at this temperature the pumps and the tiles both fit the plan's power and schedule. Summed along the cooling path, from
[737 K](../numbers.md#venus-surface-temp) down to [195 K](../numbers.md?sig=3#freeze-target-temp),
for pumps at [50%](../numbers.md#exhaust-carnot-share) of the Carnot limit, about what good industrial heat pumps
reach:

- the sensible cooling costs [1.7 × 10²⁷ J](../numbers.md#exhaust-work-sensible) of work;
- the latent heat, released as the CO₂ condenses and freezes between
  [304 K](../numbers.md?sig=3#co2-critical-temp) and [216.6 K](../numbers.md#co2-triple-temp), costs
  [2.8 × 10²⁷ J](../numbers.md#exhaust-work-latent), more than the sensible part because it comes out when the air is
  cold and every joule is dearest;
- in all, [4.46 × 10²⁷ J](../numbers.md#exhaust-work) for [5.3 × 10²⁶ J](../numbers.md#atmosphere-heat) of heat:
  [8.5](../numbers.md#exhaust-work-ratio) joules of electricity per joule moved.

Heat and work both leave as light, [5.0 × 10²⁷ J](../numbers.md#exhaust-rejected) in all. The model checks that the
pumps are charged more than the Carnot work ([check](../numbers.md#check-second-law)). No electroluminescent tile has
yet pumped heat at any useful share of the limit, so the share is invented, and
[Exhaust-1](../research.md#exhaust-1) must show it.

### The cost of beamed light

The second law prices light by its entropy, and light squeezed into a narrow band and a narrow cone carries little
entropy for its energy: it counts as hotter than its brightness suggests. A hot side of
[1,600 K](../numbers.md#exhaust-effective-temp) is right for light spread over colours and directions the way a
surface that hot spreads it. The tiles put [0.37 MW/m²](../numbers.md#exhaust-flux) into a
[0.4 µm](../numbers.md#exhaust-band) band around [2.3 µm](../numbers.md#exhaust-wavelength) and a
[25°](../numbers.md#exhaust-cone) cone. That light fills each of its modes with [3.4](../numbers.md#exhaust-photons-per-mode)
photons, and by its entropy it counts as at least [9,000 K](../numbers.md#exhaust-light-temp),
[5.6](../numbers.md#exhaust-light-vs-effective) times hotter than the model assumes. Lifting a joule from the
starting air into it takes [9.6](../numbers.md#exhaust-work-multiple) times the work the model charges, and the gap
widens as the air cools.

> **Physics:** Spread evenly over a band and a cone, light of radiance L fills each mode with n = Lλ⁵/(2hc²Δλ)
> photons. Each mode carries energy nhν and entropy k[(1 + n) ln(1 + n) − n ln n]; their ratio is the temperature
> the light counts as. Even spreading gives the most entropy for the energy, so this is the most favourable case.

The model's check fails ([check](../numbers.md#check-exhaust-entropy), [issue 4](https://github.com/Xaxis/phosphoros.space/issues/4)).
Two ways out, both open: the tiles spread their light over far more colours and directions than the design has
(which needs the thin air above the canopies to pass it), or the pumps and the Lattice grow several times. Until one
is shown, read the model's pump work as a floor.

**The trade.** The effective temperature is a choice. Hotter light means brighter tiles and less area, but more work
per joule. Run the same campaign with the coolest emitters the model tries and the working emitters would cover
[150%](../numbers.md#exhaust-area-share-1000) of Venus; with the middle option,
[46%](../numbers.md#exhaust-area-share-1500); with the hottest, [10%](../numbers.md#exhaust-area-share-2500), for more
work. The ledger gives each option's temperature. The plan picks
[1,600 K](../numbers.md#exhaust-effective-temp).

Against a shaded Venus radiating alone, the Exhaust throws out [900](../numbers.md#exhaust-vs-passive-light) times as
much light on average, and removes [95](../numbers.md#exhaust-vs-passive-heat) times as much of the planet's own heat.
The difference between the two is the work.

## Design

**Canopies.** Each canopy is a hexagonal aerostat [190 km](../numbers.md#canopy-width) across,
[3.2 × 10¹⁰ m²](../numbers.md#canopy-area), floating at the top of its [Thermal Chimney](chimneys.md),
[65 km](../numbers.md#chimney-top) up. It floats on CO₂ warmed by the heat arriving from below, a hot-air balloon heated
by the heat it is pumping out. Exchangers in its floor take heat from the chimney's liquid loops; tiles on its top
throw it to space. As the CO₂ rains out and the air thins, the canopies float lower. On average each one takes in
[5.9 × 10¹⁵ W](../numbers.md#canopy-power-in) of electricity and throws out
[6.6 × 10¹⁵ W](../numbers.md#canopy-power-out) of light.

**Tiles.** Each tile is an InGaAsSb thermophotonic diode with a [0.54 eV](../numbers.md#exhaust-bandgap) bandgap.
A photon-recycling cavity sends light that would be reabsorbed back for another chance to escape. Every electron that
recombines without making a photon dumps its energy into the tile as heat, so the tiles must reach an external
quantum efficiency of [99.9%](../numbers.md#exhaust-eqe). A photonic-crystal face aims the light upward into a
[25°](../numbers.md#exhaust-cone) cone.

**Why [2.3 µm](../numbers.md#exhaust-wavelength).** The thin CO₂ above the canopies barely absorbs at that wavelength,
so the beams leave Venus. The [Hesperus Veil](veil.md) blocks it like every other colour, since a Veil clear in
this band would let [1.9%](../numbers.md#exhaust-band-sunlight) of the sunlight through. Tiles that face the
Veil tilt their cones [13°](../numbers.md#exhaust-veil-tilt) off the Sun line and miss it.

**Sizing, and why version 3 made it bigger.** Version 2 sized the Exhaust from the campaign's average,
[6.6 × 10¹⁹ W](../numbers.md#exhaust-rejected-avg), which [1.8 × 10¹⁴ m²](../numbers.md#exhaust-area-working) of
working tiles can shine. The day-by-day [simulation](../plan.md#the-simulated-atmosphere) shows that the average hides
two different phases. Cooling starts only on [5 April 2034](../numbers.md?date=day#cooling-start), when the tiles,
chimneys and receivers reach Venus; the Foundry builds them after the Lattice and the Ring.

1. **From [April 2034](../numbers.md?date=month#cooling-start) to [July 2034](../numbers.md?date=month#ring-pays-from).**
   The Ceres Railheads, firing since [August 2033](../numbers.md?date=month#ice-launch-start), draw
   [1.1 × 10²⁰ W](../numbers.md#railhead-power) of the Lattice's [1.2 × 10²⁰ W](../numbers.md#helios-power), more
   than a launch in a window would need, because they fire between windows too. Cooling crawls.
2. **From [July 2034](../numbers.md?date=month#ring-pays-from).** The Ring recovers
   [2.2 × 10²⁰ W](../numbers.md#ring-power) on average from the arriving ice and runs Venus, so the Lattice's beams
   can stay on the Railheads. Power is now plentiful, and the emitters, not the supply, set the pace. The Clear Rain
   begins on [22 January 2035](../numbers.md?date=day#traj-clear-rain).

So the emitters must be sized for the peak of the second phase. With version 2's smaller Exhaust the simulated air
becomes Earth-like months after the deadline. With [1.2 × 10²⁰ W](../numbers.md#exhaust-peak) of emitters,
[3.2 × 10¹⁴ m²](../numbers.md#exhaust-area-installed), the CO₂ is down by
[30 March 2036](../numbers.md?date=day#traj-cold) and the air is Earth-like on
[30 September 2036](../numbers.md?date=day#traj-earth-like), with [92 d](../numbers.md#traj-slack-days) to spare. The
emitters are at their peak all through the freezing of the seas, from
[September 2035](../numbers.md?date=month#traj-freeze) to [February 2036](../numbers.md?date=month#traj-frozen), and that
sets the peak. At this peak the Frost Towers finish
[150 d](../numbers.md#frost-sealing-slack) before the last caps ([correction](../about.md#corrections)), and the
finish waits on the Forges' oxygen. The [Explorer](https://phosphoros.space/explore) shows how far the peak can fall
before the Frost Towers finish late.

<!-- figure:trajectory -->
![The simulated atmosphere, day by day](../../figures/svg/trajectory.svg)
<!-- /figure -->

**What the simulation pumps.** The simulation spends [5.6 × 10²⁷ J](../numbers.md#traj-pump-energy) of pump work, more
than the [4.46 × 10²⁷ J](../numbers.md#exhaust-work) the air alone needs. Heat keeps arriving from the crust, the
Forges' waste, the falling ice and the sunlight the closed Veil lets through,
[8.1 × 10²⁵ J](../numbers.md#traj-heat-added) in all, much of it late, when pumping is dearest. With everything else,
the plan's demand is [1.1 × 10²⁸ J](../numbers.md#budget-demand) against the Lattice's
[1.3 × 10²⁸ J](../numbers.md#helios-supply): [11%](../numbers.md#budget-spare) spare from the Lattice alone, and
[32%](../numbers.md#budget-spare-with-ring) once the Ring powers the Railheads.

**Frost Towers.** At [195 K](../numbers.md?sig=3#freeze-target-temp) the air still holds
[1 bar](../numbers.md#co2-pressure-at-freeze) of CO₂ vapor, [5.4 × 10¹⁸ kg](../numbers.md#frost-residual-co2). The same
tiles on surface towers held at [133 K](../numbers.md#frost-tower-temp) freeze it out down to
[54 Pa](../numbers.md#frost-co2-pressure), leaving [2.8 × 10¹⁵ kg](../numbers.md#frost-residual-target) airborne and
[230 ppm](../numbers.md#final-co2-ppm) in the finished air. That takes [6.8 × 10²⁵ J](../numbers.md#frost-work) of work
and is done by [9 April 2036](../numbers.md?date=day#traj-scavenged).

<!-- figure:co2-phase -->
![CO₂ phase diagram with Venus's simulated cooling path](../../figures/svg/co2-phase.svg)
<!-- /figure -->

## Specifications

<!-- table:specs exhaust -->
| Parameter | Value |
| --- | --- |
| Canopies | [10,000](../numbers.md#exhaust-canopies), each about [190 km](../numbers.md#canopy-width) across |
| Emitter area | [1.8 × 10¹⁴ m²](../numbers.md#exhaust-area-working) working at the average, [3.2 × 10¹⁴ m²](../numbers.md#exhaust-area-installed) installed for the peak |
| Emission | [2.3 µm](../numbers.md#exhaust-wavelength) at [0.37 MW/m²](../numbers.md#exhaust-flux), in a [25°](../numbers.md#exhaust-cone) cone |
| Effective emitter temperature | [1,600 K](../numbers.md#exhaust-effective-temp) |
| Heat removed from Venus's air | [5.3 × 10²⁶ J](../numbers.md#atmosphere-heat) (average [6.9 × 10¹⁸ W](../numbers.md#exhaust-heat-avg)) |
| Pump work for that heat | [4.46 × 10²⁷ J](../numbers.md#exhaust-work), [8.5](../numbers.md#exhaust-work-ratio) J per joule moved |
| Pump work in the simulation | [5.6 × 10²⁷ J](../numbers.md#traj-pump-energy), counting heat from the crust, the Forges and the ice |
| Peak power out | [1.2 × 10²⁰ W](../numbers.md#exhaust-peak) |
| Fastest heat removal in the simulation | [1.3 × 10¹⁹ W](../numbers.md#traj-heat-peak), all the chimneys can carry, while the air is still hot |
| Per canopy | [5.9 × 10¹⁵ W](../numbers.md#canopy-power-in) in, [6.6 × 10¹⁵ W](../numbers.md#canopy-power-out) out |
| Average electrical input | [5.9 × 10¹⁹ W](../numbers.md#exhaust-work-avg), [5.6 × 10²⁷ J](../numbers.md#traj-pump-energy) in all |
| Dark strip under the Ring | [150 km](../numbers.md#exhaust-dark-strip) wide, [1.2%](../numbers.md#exhaust-dark-strip-share) of the surface, where a cone would reach the Ring at [400 km](../numbers.md#ring-altitude) |
| Far field | Each canopy's cone is dimmer than [10 W/m²](../numbers.md#exhaust-far-limit) beyond [90,000 km](../numbers.md#exhaust-cone-safe-distance) at peak power; where cones overlap, their light adds |
| Frost Towers | Tiles at [133 K](../numbers.md#frost-tower-temp) trap the last CO₂ to [54 Pa](../numbers.md#frost-co2-pressure) |
<!-- /table -->

## What is invented

> **Invented:** Electroluminescent cooling at [0.37 MW/m²](../numbers.md#exhaust-flux). It has never been shown at useful
> power. The [Exhaust-1](../research.md#exhaust-1) experiment must show net cooling at a useful power density by 2028.

> **Invented:** InGaAsSb thermophotonic tiles with photon recycling and an external quantum efficiency of
> [99.9%](../numbers.md#exhaust-eqe), made by the square kilometer.

> **Invented:** Hot-gas aerostat canopies [190 km](../numbers.md#canopy-width) across, floating on the heat they pump.

> **Precedent:** An LED at MIT emitted [6.9 × 10⁻¹¹ W](../numbers.md#led-2012-light-out) of light from
> [3.0 × 10⁻¹¹ W](../numbers.md#led-2012-power-in) of electricity, drawing the rest from heat
> ([Santhanam et al. 2012](../sources.md#santhanam-2012); [Phys.org](../sources.md#physorg-2012-led)).

> **Precedent:** Thermophotonic energy transfer has been measured in intracavity structures at Aalto
> ([Casado et al. 2019](../sources.md#casado-2019)).

## Build sequence

- **[2027](../numbers.md?date=year#program-start):** [Exhaust-1](../research.md#exhaust-1) begins in the laboratory. Its
  kill signal, no net cooling at useful power, would send the plan back to the multi-century route.
- **[31 December 2028](../numbers.md?date=day#experiments-end):** Exhaust-1 must have passed.
- **[1 December 2032](../numbers.md?date=day#veil-close):** Under the closed Veil, the canopies float up and their chimneys
  are lowered.
- **[August 2033](../numbers.md?date=month#ice-launch-start):** The Railheads take most of the Lattice's power.
- **[5 April 2034](../numbers.md?date=day#cooling-start):** The tiles, chimneys and receivers are at Venus, and active
  cooling begins on what the Railheads leave.
- **[22 January 2035](../numbers.md?date=day#traj-clear-rain):** The Clear Rain: liquid CO₂ starts to fall.
- **[3 July 2034](../numbers.md?date=day#ring-pays-from):** The Ring pays for the Railheads. The Exhaust runs at its
  limit from here on.
- **[4 September 2035](../numbers.md?date=day#traj-freeze):** The CO₂ seas start to freeze, and the air holds at the
  triple point while they do.
- **[13 February 2036](../numbers.md?date=day#traj-frozen):** The seas are frozen through.
- **[30 March 2036](../numbers.md?date=day#traj-cold):** All the CO₂ is down. The Frost Towers take over.
- **[9 April 2036](../numbers.md?date=day#traj-scavenged):** The CO₂ left in the air is at its target. The pumps hold
  the air at [195 K](../numbers.md?sig=3#freeze-target-temp) while the last caps are sealed.
- **[1 September 2036](../numbers.md?date=day#cooling-end):** The last caps are sealed and active cooling ends. The
  Veil opens the next day.
- **[30 September 2036](../numbers.md?date=day#traj-earth-like):** Venus is Earth-like.

## Failure modes and safeguards

- **Dead tiles.** A failed tile goes dark and its neighbors take its share. Installed area,
  [3.2 × 10¹⁴ m²](../numbers.md#exhaust-area-installed), is well above the
  [1.8 × 10¹⁴ m²](../numbers.md#exhaust-area-working) working on average.
- **The Ring overhead.** The [Braking Ring](ring.md) circles [400 km](../numbers.md#ring-altitude) up. Tiles whose
  cones would cross it stay dark: a cone from the chimney tops is [150 km](../numbers.md#exhaust-dark-strip) wide by
  the Ring's height, so a strip that wide under its path, [1.2%](../numbers.md#exhaust-dark-strip-share) of the
  surface, stays dark.
- **Stray light.** Each canopy's light spreads through its cone. At peak power one canopy's cone is dimmer than
  [10 W/m²](../numbers.md#exhaust-far-limit) beyond [90,000 km](../numbers.md#exhaust-cone-safe-distance); where the
  cones of neighbouring canopies overlap, their light adds. Long before it reaches the Veil it is far fainter
  than sunlight, and the cones are aimed around the Veil anyway.
- **A stalled Exhaust.** Under the closed Veil, Venus gains heat only slowly, from the crust, the little sunlight
  the Veil lets through and, while the ice arrives, its fall. A short pause costs time; a long one in the years of the
  catch also loses ground.
- **The second law.** The model charges ideal pumping. Every real loss adds work, and the entropy of narrow,
  beamed light adds far more ([below](#the-cost-of-beamed-light)). The Lattice alone leaves
  [11%](../numbers.md#budget-spare) spare and the Ring's recovered energy [32%](../numbers.md#budget-spare-with-ring),
  which absorbs a tile somewhat short of ideal but not the beamed light's full price.

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
and the energy demand rise a little and the spare barely moves. Lower `exhaust-effective-temp` and each joule
costs less work but the emitter area grows steeply; raise it and the area shrinks but the work grows.
