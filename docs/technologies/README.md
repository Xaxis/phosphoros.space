# Technologies

Phosphoros cannot be done with the technology we have, so it invents thirteen machines. Each obeys one
rule: it may assume engineering we do not have yet, but never a violation of conservation of energy or
the second law of thermodynamics. Every page below says, in labelled quotes, which parts are
**invented**, which have real **precedent** (with a source) and which are plain **physics**, and every
number on it links to the model that computes it.

One invention carries the rest: the [Ouroboros Foundry](ouroboros.md), a factory that copies itself
every [60 d](../numbers.md#foundry-doubling-days). Only its [1,000 t](../numbers.md#foundry-seed-mass)
seed and the first factories for Ceres leave Earth; every other kilogram is made in space or on other
worlds. The Foundry builds the [Helios Lattice](helios.md), the Lattice's beamed sunlight powers almost
everything else, and the [Choir](choir.md) keeps the whole system inside hard limits.

<!-- figure:tech-stack -->
![The Phosphoros technology stack](../../figures/svg/tech-stack.svg)
<!-- /figure -->

<!-- table:techs -->
| Invention | Job | Scale | Breakthrough assumed | Online |
| --- | --- | --- | --- | --- |
| [Ouroboros Foundry](../technologies/ouroboros.md) | Self-copying industry on Mercury | [1,000 t](../numbers.md#foundry-seed-mass) seed to [6.7 × 10¹³ kg](../numbers.md#foundry-final-mass) | A fully closed loop (chips, motors, optics, robots) from regolith, doubling every [60 d](../numbers.md#foundry-doubling-days) | [2029](../numbers.md?date=year#foundry-landing) |
| [Helios Lattice](../technologies/helios.md) | Harvest sunlight near Mercury and beam it | [6.2 × 10¹⁶ m²](../numbers.md#helios-area) of film; [8.5 × 10¹⁹ W](../numbers.md#helios-power) delivered | [15%](../numbers.md#helios-efficiency) sunlight-to-target efficiency through kilometre-scale coherent laser arrays | [2033](../numbers.md?date=year#helios-full-power) |
| [Hesperus Veil](../technologies/veil.md) | Sunshade, thermostat and day clock | [5.4 × 10¹⁴ m²](../numbers.md#veil-area), [5.4 × 10¹¹ kg](../numbers.md#veil-mass), [1.11 × 10⁶ km](../numbers.md#veil-distance) sunward | [3.8 × 10⁸](../numbers.md#veil-slats) electrochromic, light-bending slats holding station, dimming from open to [99.9%](../numbers.md#veil-block-fraction) blocked | [2032](../numbers.md?date=year#veil-close) |
| [Thermal Chimneys](../technologies/chimneys.md) | Lift deep heat to the cloud tops | Forced-convection columns [64 km](../numbers.md#chimney-height) tall | Structures that survive [737 K](../numbers.md#venus-surface-temp) and [92 bar](../numbers.md#venus-surface-pressure) through the [3.3 yr](../numbers.md#cooling-seconds) of active cooling | [2033](../numbers.md?date=year#cooling-start) |
| [Photonic Exhaust](../technologies/exhaust.md) | Throw heat into space as light | [5.5 × 10¹³ m²](../numbers.md#exhaust-area-installed) of emitters; [5.0 × 10¹⁹ W](../numbers.md#exhaust-peak) peak | Electroluminescent cooling at [0.91 MW/m²](../numbers.md#exhaust-flux) | [2033](../numbers.md?date=year#cooling-start) |
| [Cryo-continents](../technologies/cryo.md) | Store all the CO₂ | [3.0 × 10¹⁷ m³](../numbers.md#cryo-volume) of sealed dry ice in [2 km](../numbers.md#cryo-thickness) plateaus | A graphite membrane and [20 m](../numbers.md#cryo-aerogel-thickness) foam cap; basal heat pipes and refrigeration of [12 PW](../numbers.md#cryo-floor-load) at first | [2034](../numbers.md?date=year#traj-clear-rain) |
| [Graphite Forges](../technologies/forges.md) | Split CO₂ into oxygen and carbon | [1.8 × 10¹⁸ kg](../numbers.md#forge-co2) of CO₂ to [1.3 × 10¹⁸ kg](../numbers.md#o2-mass) of oxygen | Molten-carbonate splitting at [60%](../numbers.md#forge-efficiency) efficiency, at planetary scale | [2035](../numbers.md?date=year#forge-start) |
| [Ceres Ice Train](../technologies/ice-train.md) | Ship the water | [1.0 × 10²⁰ kg](../numbers.md#ice-mass) of ice at [6.4 km/s](../numbers.md#ice-launch-speed), [1.15 yr](../numbers.md#ice-transfer-years) in transit | Mass drivers throwing [1.41 × 10¹² kg/s](../numbers.md#ice-throughput) in all | [2033](../numbers.md?date=year#ice-launch-start) |
| [Braking Ring](../technologies/ring.md) | Catch the ice without heating Venus | Orbital ring of [1.0 × 10¹³ kg](../numbers.md#ring-mass) | Regenerative magnetic braking recovering [5.3 × 10²⁷ J](../numbers.md#ring-recovered-energy) | [2034](../numbers.md?date=year#first-catch) |
| [Acid Sweep](../technologies/acid.md) | Remove the sulfuric-acid clouds | Rain-out plus basalt neutralization | None but scale | [2034](../numbers.md?date=year#traj-clear-rain) |
| [Aegis Shield](../technologies/aegis.md) | Stop the solar wind stripping the new water | Superconducting dipole beside the Veil | Large deep-space superconducting coils | [2034](../numbers.md?date=year#aegis-online) |
| [Genesis Biota](../technologies/genesis.md) | Start an ecosystem | Engineered cyanobacteria, lichens and plankton | Organisms tuned to cold, fresh, nitrogen-rich water | [2036](../numbers.md?date=year#genesis-start) |
| [Choir](../technologies/choir.md) | Run every machine on three worlds as one system | Autonomy across three worlds | Self-correcting swarm control with a verified safety core | [2029](../numbers.md?date=year#foundry-landing) |
<!-- /table -->

Not everything is solved, and the model's failing checks say where
([all checks](../budget.md#physics-checks)). Three problems are open:

- The [Braking Ring](ring.md) recovers the ice's energy, but nothing yet holds it against the catch's net push
  ([issue 3](https://github.com/Xaxis/phosphoros.space/issues/3)), and it cannot lower the ice to the surface on
  tethers as designed ([issue 2](https://github.com/Xaxis/phosphoros.space/issues/2)).
- The [Photonic Exhaust](exhaust.md) beams its light so narrowly that pumping heat into it costs many times the
  work the model charges ([issue 4](https://github.com/Xaxis/phosphoros.space/issues/4)).

Each page also names what the model does not yet check. What the inventions cost in energy is in the
[Energy and Mass Budget](../budget.md); when each is built is in the [Timeline](../timeline.md); the
experiments that must prove them by the end of 2028 are on the [Research Agenda](../research.md).

## On Mercury

- [Ouroboros Foundry](ouroboros.md): a [1,000 t](../numbers.md#foundry-seed-mass) seed that rebuilds
  itself from Mercury rock until it is [6.7 × 10¹³ kg](../numbers.md#foundry-final-mass) of machinery.
- [Helios Lattice](helios.md): [1.3 × 10⁷](../numbers.md#helios-petals) film Petals near Mercury that
  turn sunlight into laser beams and deliver [8.5 × 10¹⁹ W](../numbers.md#helios-power).

## Near Venus

- [Hesperus Veil](veil.md): a light-bending shade just sunward of the Sun-Venus L1 point that turns away
  [99.9%](../numbers.md#veil-block-fraction) of the sunlight, then sets the day and the climate.
- [Braking Ring](ring.md): an orbital ring [400 km](../numbers.md#ring-altitude) up that catches every
  Brick of ice and turns its speed into [5.3 × 10²⁷ J](../numbers.md#ring-recovered-energy) of
  electricity.
- [Aegis Shield](aegis.md): a superconducting coil beside the Veil whose
  [10,000 km](../numbers.md#aegis-bubble-radius) magnetic bubble shelters Venus from the solar wind.

## On Ceres

- [Ceres Ice Train](ice-train.md): [10,000](../numbers.md#railhead-count) coilguns that throw
  [1.0 × 10²⁰ kg](../numbers.md#ice-mass) of ice to Venus, a [217 m](../numbers.md#ocean-depth) ocean.

## On Venus

- [Thermal Chimneys](chimneys.md): [10,000](../numbers.md#chimney-count) fan-driven columns
  [64 km](../numbers.md#chimney-height) tall that lift deep heat to the cloud tops.
- [Photonic Exhaust](exhaust.md): floating canopies that fire the planet's heat into space as
  [2.3 µm](../numbers.md#exhaust-wavelength) infrared, up to [5.0 × 10¹⁹ W](../numbers.md#exhaust-peak).
- [Cryo-continents](cryo.md): all [4.69 × 10²⁰ kg](../numbers.md#venus-co2-mass) of the CO₂, frozen and
  sealed as new land over [33%](../numbers.md#cryo-footprint-share) of Venus.
- [Graphite Forges](forges.md): [500](../numbers.md#forge-count) molten-salt plants that split CO₂ into
  [0.25 bar](../numbers.md#o2-target-pressure) of oxygen and the graphite for the caps.
- [Acid Sweep](acid.md): [9 × 10¹⁷ kg](../numbers.md#acid-basalt) of crushed basalt that takes up the
  sulfur before the oceans arrive.
- [Genesis Biota](genesis.md): engineered microbes, algae, lichens and mosses, seeded from
  [1 December 2036](../numbers.md?date=day#genesis-start) once the oxygen is in and the oceans hold their pH.

## Everywhere

- [Choir](choir.md): the four-tier control system that runs every machine across three worlds,
  with a safety core no machine can override.
