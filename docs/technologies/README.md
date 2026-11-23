# Technologies

Phosphoros cannot be done with the technology we have, so it invents twelve machines. Each obeys one
rule: it may assume engineering we do not have yet, but never a violation of conservation of energy or
the second law of thermodynamics. Every page below says, in labelled quotes, which parts are
**invented**, which have real **precedent** (with a source) and which are plain **physics**, and every
number on it links to the model that computes it.

One invention carries the rest: the [Ouroboros Foundry](ouroboros.md), a factory that copies itself
every [60 d](../numbers.md#foundry-doubling-days). Only its [1,000 t](../numbers.md#foundry-seed-mass)
seed and the seed of the [Ceres factories](ice-train.md#ceres-factories), which copy themselves every
[45 d](../numbers.md#ceres-doubling-days) and build the Railheads, leave Earth; every other kilogram is made
in space or on other worlds. The Foundry builds the [Helios Lattice](helios.md), the Lattice's beamed
light pumps the [Photonic Exhaust](exhaust.md) and powers almost everything else, and the [Choir](choir.md) keeps
the whole system inside hard limits.

<!-- figure:tech-stack -->
![The Phosphoros technology stack](../../figures/svg/tech-stack.svg)
<!-- /figure -->

<!-- table:techs -->
| Invention | Job | Scale | Breakthrough assumed | Online |
| --- | --- | --- | --- | --- |
| [Ouroboros Foundry](../technologies/ouroboros.md) | Self-copying industry on Mercury | [1,000 t](../numbers.md#foundry-seed-mass) seed to [2.7 × 10¹⁴ kg](../numbers.md#foundry-final-mass) | A fully closed loop (chips, motors, optics, robots) from regolith, doubling every [60 d](../numbers.md#foundry-doubling-days) | [2029](../numbers.md?date=year#foundry-landing) |
| [Helios Lattice](../technologies/helios.md) | Harvest sunlight near Mercury and beam it | [1.2 × 10¹⁷ m²](../numbers.md#helios-area) of film; [2.2 × 10²⁰ W](../numbers.md#helios-power) of light beamed | [20%](../numbers.md#helios-efficiency) sunlight-to-beam efficiency through kilometre-scale coherent laser arrays | [2033](../numbers.md?date=year#helios-full-power) |
| [Hesperus Veil](../technologies/veil.md) | Sunshade, thermostat and day clock | [5.4 × 10¹⁴ m²](../numbers.md#veil-area), [5.4 × 10¹¹ kg](../numbers.md#veil-mass), [1.11 × 10⁶ km](../numbers.md#veil-distance) sunward | [3.8 × 10⁸](../numbers.md#veil-slats) electrochromic, light-bending slats holding station, dimming from open to [99.9%](../numbers.md#veil-block-fraction) blocked | [2032](../numbers.md?date=year#veil-close) |
| [Thermal Chimneys](../technologies/chimneys.md) | Lift deep heat to the cloud tops | Towers [64 km](../numbers.md#chimney-height) tall, with fan-driven intakes and sealed liquid loops | Structures that survive [737 K](../numbers.md#venus-surface-temp) and [92 bar](../numbers.md#venus-surface-pressure) through the [2.5 yr](../numbers.md#cooling-seconds) of active cooling | [2034](../numbers.md?date=year#cooling-start) |
| [Photonic Exhaust](../technologies/exhaust.md) | Throw heat into space as light | [3.3 × 10¹⁴ m²](../numbers.md#exhaust-area-installed) of tiles; [2.2 × 10²⁰ W](../numbers.md#exhaust-peak) peak | Laser cooling of a semiconductor at [1.3 MW/m²](../numbers.md#exhaust-flux) | [2034](../numbers.md?date=year#cooling-start) |
| [Cryo-continents](../technologies/cryo.md) | Store all the CO₂ | [3.0 × 10¹⁷ m³](../numbers.md#cryo-volume) of sealed dry ice in [2 km](../numbers.md#cryo-thickness) plateaus | A graphite membrane and [20 m](../numbers.md#cryo-aerogel-thickness) foam cap; basal heat pipes and refrigeration of [12 PW](../numbers.md#cryo-floor-load) at first | [2034](../numbers.md?date=year#traj-clear-rain) |
| [Graphite Forges](../technologies/forges.md) | Split CO₂ into oxygen and carbon | [1.8 × 10¹⁸ kg](../numbers.md#forge-co2) of CO₂ to [1.3 × 10¹⁸ kg](../numbers.md#o2-mass) of oxygen | Molten-carbonate splitting at [60%](../numbers.md#forge-efficiency) efficiency, at planetary scale | [2035](../numbers.md?date=year#forge-start) |
| [Ceres Ice Train](../technologies/ice-train.md) | Ship the water | [1.0 × 10¹⁸ kg](../numbers.md#ice-mass) of ice at [6.4 km/s](../numbers.md#ice-launch-speed), [341 d](../numbers.md#ice-flight-min) to [410 d](../numbers.md#ice-flight-max) in transit | Mass drivers throwing [1.29 × 10¹¹ kg/s](../numbers.md#ice-throughput) in all | [2033](../numbers.md?date=year#ice-launch-start) |
| [Acid Sweep](../technologies/acid.md) | Remove the sulfuric-acid clouds | Rain-out plus basalt neutralization | None but scale | [2034](../numbers.md?date=year#traj-clear-rain) |
| [Aegis Shield](../technologies/aegis.md) | Stop the solar wind stripping the new water | Superconducting dipole beside the Veil | Large deep-space superconducting coils | [2034](../numbers.md?date=year#aegis-online) |
| [Genesis Biota](../technologies/genesis.md) | Start an ecosystem | Engineered cyanobacteria, lichens and plankton | Organisms tuned to cold, sulfate-rich water under nitrogen-rich air | [2036](../numbers.md?date=year#genesis-start) |
| [Choir](../technologies/choir.md) | Run every machine on three worlds as one system | Autonomy across three worlds | Self-correcting swarm control with a verified safety core | [2029](../numbers.md?date=year#foundry-landing) |
<!-- /table -->

The model's checks say where the plan stands ([all checks](../budget.md#physics-checks)). Today
[1](../numbers.md#checks-failing) check fails, on purpose: version 2's statite Veil, kept to show why it could not
hover ([issue 1](https://github.com/Xaxis/phosphoros.space/issues/1)). Version 4 closed the two problems version 3
left open. Version 3's Braking Ring could be neither held against the catch nor made to lower the ice, so it is
retired and the Bricks fall straight into the air, bringing the heat of their fall for the pumps to lift. And the
Exhaust's tiles are now pumped by the Lattice's light itself and charged at the temperature that light counts as
([corrections](../about.md#corrections)).

Each page also names what the model does not yet check. What the inventions cost in energy is in the
[Energy and Mass Budget](../budget.md); when each is built is in the [Timeline](../timeline.md); the
experiments that must prove them by the end of 2028 are on the [Research Agenda](../research.md).

## On Mercury

- [Ouroboros Foundry](ouroboros.md): a [1,000 t](../numbers.md#foundry-seed-mass) seed that rebuilds
  itself from Mercury rock until it is [2.7 × 10¹⁴ kg](../numbers.md#foundry-final-mass) of machinery.
- [Helios Lattice](helios.md): [2.5 × 10⁷](../numbers.md#helios-petals) film Petals near Mercury that
  turn sunlight into [2.2 × 10²⁰ W](../numbers.md#helios-power) of laser light.

## Near Venus

- [Hesperus Veil](veil.md): a light-bending shade just sunward of the Sun-Venus L1 point that turns away
  [99.9%](../numbers.md#veil-block-fraction) of the sunlight, then sets the day and the climate.
- [Aegis Shield](aegis.md): a superconducting coil beside the Veil whose
  [10,000 km](../numbers.md#aegis-bubble-radius) magnetic bubble shelters Venus from the solar wind.

## On Ceres

- [Ceres Ice Train](ice-train.md): [10,000](../numbers.md#railhead-count) coilguns that throw
  [1.0 × 10¹⁸ kg](../numbers.md#ice-mass) of ice straight into Venus's polar air, seas
  [2.17 m](../numbers.md#ocean-depth) deep if spread over the planet.

## On Venus

- [Thermal Chimneys](chimneys.md): [10,000](../numbers.md#chimney-count) towers
  [64 km](../numbers.md#chimney-height) tall that draw deep air through fan-driven exchangers and lift its heat to
  the cloud tops in sealed liquid loops.
- [Photonic Exhaust](exhaust.md): floating canopies whose tiles, pumped by the Lattice's light, shine the
  planet's heat into space as [2.3 µm](../numbers.md#exhaust-wavelength) infrared, up to
  [2.2 × 10²⁰ W](../numbers.md#exhaust-peak).
- [Cryo-continents](cryo.md): nearly all [4.69 × 10²⁰ kg](../numbers.md#venus-co2-mass) of the CO₂, frozen and
  sealed as new land over [33%](../numbers.md#cryo-footprint-share) of Venus.
- [Graphite Forges](forges.md): [500](../numbers.md#forge-count) molten-salt plants that split CO₂ into
  [0.25 bar](../numbers.md#o2-target-pressure) of oxygen and the graphite for the caps.
- [Acid Sweep](acid.md): [6 × 10¹⁵ kg](../numbers.md#acid-basalt) of crushed basalt that takes up the
  sulfur the cryo-continents do not seal away before the seas melt.
- [Genesis Biota](genesis.md): engineered microbes, algae, lichens and mosses, seeded from
  [1 December 2036](../numbers.md?date=day#genesis-start) once the oxygen is in and the seas hold their pH.

## Everywhere

- [Choir](choir.md): the four-tier control system that runs every machine across three worlds,
  with a safety core no machine can override.
