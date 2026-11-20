# The Plan

Venus becomes Earth-like by the end of 2036 if we invent one thing above all: a factory that copies itself
every [60 d](numbers.md#foundry-doubling-days). Everything else follows from the energy it unlocks.

One rule binds every invention: it may assume engineering we do not have yet, but it must obey
conservation of energy and the second law of thermodynamics. The binding constraint is energy. Venus
cannot shed its heat fast enough on its own ([The Problem](problem.md)), so the plan brings in
[8.4 × 10²⁷ J](numbers.md#budget-demand) from outside the planet, almost all of it sunlight harvested near
Mercury and beamed across the inner Solar System.

## The five moves

### 1. Grow an industry

A [1,000 t](numbers.md#foundry-seed-mass) seed of twelve machine types launches from Earth on
[1 October 2028](numbers.md?date=day#foundry-seed-launch) and lands on Mercury on
[14 January 2029](numbers.md?date=day#foundry-landing). There it digs, smelts, rolls, prints and assembles
copies of itself from local rock, powered by its own solar film. Mercury suits it: sunlight close to the
Sun is strong ([9,080 W/m²](numbers.md#mercury-sunlight) at its mean distance), the crust is rich in iron,
silicon, aluminum and magnesium, and parts reach orbit by mass driver because escape speed is only
[4.25 km/s](numbers.md#mercury-escape).

The [Ouroboros Foundry](technologies/ouroboros.md) doubles every [60 d](numbers.md#foundry-doubling-days):
[5.8 × 10⁷ kg](numbers.md#foundry-mass-2030) of machinery by January 2030,
[2.7 × 10¹¹ kg](numbers.md#foundry-mass-2032) by January 2032, and after [26](numbers.md#foundry-doublings)
doublings [6.7 × 10¹³ kg](numbers.md#foundry-final-mass) in [May 2033](numbers.md?date=month#foundry-full-scale).
Exponential growth makes everything after it cheap, but nothing is free: every kilogram of product is a
kilogram the Foundry does not add to itself. So it stops growing for only [9.8 d](numbers.md#veil-diversion-days)
to build the Veil, late in 2032 when it is large, and builds the Helios Lattice and the Braking Ring once it is
full grown, the Lattice in [80 d](numbers.md#lattice-build-days) and the Ring in
[13 d](numbers.md#ring-build-days). [Choir](technologies/choir.md) runs it all, with a mass budget no machine can
exceed.

<!-- figure:foundry-growth -->
![Ouroboros Foundry machinery mass, 2028 to 2036](../figures/svg/foundry-growth.svg)
<!-- /figure -->

> **Invented:** A factory that makes every one of its own parts, chips and robots included, from Mercury
> rock, and doubles every [60 d](numbers.md#foundry-doubling-days).

> **Precedent:** The 1980 NASA/ASEE summer study designed a self-replicating lunar factory that grows from a
> [100 t](numbers.md#lunar-factory-seed-mass) seed and copies itself in about
> [1 yr](numbers.md#lunar-factory-replication-time) ([NASA CP-2255](sources.md#nasa-cp-2255)). It was a
> design study; nothing like it has been built.

### 2. Switch off the Sun

The [Hesperus Veil](technologies/veil.md) is a shade between the Sun and Venus. It sits just sunward of the
Sun-Venus L1 point, [1.11 × 10⁶ km](numbers.md#veil-distance) from Venus, where the Sun's pull, Venus's pull
and the shade's orbital motion balance. It is not a mirror but a clear film that bends sunlight a few
degrees, so the light misses the planet. A film that bends light takes up little of its momentum, so light
pressure barely moves it: its ratio of light pressure to solar gravity is only [0.0077](numbers.md#veil-beta).

> **Physics:** A shade cannot simply hover close to Venus on sunlight. Light pushes it away from the Sun,
> toward Venus, the same way Venus's gravity pulls it. Version 2's statite would have fallen onto Venus in
> about [1 d](numbers.md#veil-v2-fall-days) ([correction](about.md#corrections)).

Because the Sun is a disk, not a point, a shade this far out must be much wider than Venus to put the
whole planet in full shadow:
[13,100 km](numbers.md#veil-radius) in radius, [5.4 × 10¹⁴ m²](numbers.md#veil-area), or
[3.6](numbers.md#veil-area-vs-v2) times the version 2 statite's area. At
[1 g/m²](numbers.md#veil-areal-density) that is [5.4 × 10¹¹ kg](numbers.md#veil-mass), cut into
[3.8 × 10⁸](numbers.md#veil-slats) slats. The Veil closes in [December 2032](numbers.md?date=month#veil-close),
before active cooling begins in [May 2033](numbers.md?date=month#cooling-start), and turns away
[99.9%](numbers.md#veil-block-fraction) of the sunlight, [3.0 × 10¹⁷ W](numbers.md#veil-blocked-power). Slats fail opaque, and stay transparent at the Exhaust's
[2.3 µm](numbers.md#exhaust-wavelength) so the planet's outgoing beams pass through. The
[Aegis Shield](technologies/aegis.md)'s coil sits beside it.

<!-- figure:veil-geometry -->
![Hesperus Veil geometry](../figures/svg/veil-geometry.svg)
<!-- /figure -->

> **Precedent:** Angel's design for cooling Earth used thin refracting flyers near L1 that light pressure
> barely moves ([Angel 2006](sources.md#angel-2006)).

> **Invented:** Slats that bend sunlight past Venus and switch their transmission in seconds, from fully
> closed to [60%](numbers.md#veil-open-transmission) open.

### 3. Pump the heat out

The [Helios Lattice](technologies/helios.md) is [1.3 × 10⁷](numbers.md#helios-petals) film Petals orbiting
near Mercury, [6.2 × 10¹⁶ m²](numbers.md#helios-area) in all. Each turns sunlight into laser light:
[40%](numbers.md#helios-film-efficiency) film, [50%](numbers.md#helios-laser-efficiency) laser and
[75%](numbers.md#helios-receiver-efficiency) receiver make [15%](numbers.md#helios-efficiency) end to end.
From [July 2033](numbers.md?date=month#helios-full-power) it delivers [8.5 × 10¹⁹ W](numbers.md#helios-power),
[2.2 × 10⁻⁵%](numbers.md#helios-sun-share) of the Sun's output, in beams that stay
[43 m](numbers.md#helios-spot) wide across [1.1 AU](numbers.md#helios-range). The receivers ride above the
air and radiate their own loss heat, [2.8 × 10¹⁹ W](numbers.md#helios-receiver-loss), to space from
[1,500 K](numbers.md#helios-fin-temp) fins, never into Venus.

On Venus, [10,000](numbers.md#chimney-count) [Thermal Chimneys](technologies/chimneys.md), fan-driven columns
[3.5 km](numbers.md#chimney-diameter) wide and [64 km](numbers.md#chimney-height) tall, carry the deep heat up
to floating canopies above the clouds at [1.3 × 10¹⁵ W](numbers.md#chimney-heat) each. There the
[Photonic Exhaust](technologies/exhaust.md) throws it into space as light.

> **Physics:** A plain radiator cannot shine brighter than σT⁴ at its own temperature, which at the cloud
> tops is thousands of times less than the Exhaust needs. To go faster, heat must be pumped.

The Exhaust is a light-emitting heat pump. Electricity gives each photon extra energy, so a tile sitting at
a few hundred kelvin glows as brightly as a [2,000 K](numbers.md#exhaust-effective-temp) body,
[0.91 MW/m²](numbers.md#exhaust-flux), at [2.3 µm](numbers.md#exhaust-wavelength), where the thin CO₂ above
the canopies barely absorbs. The second law sets the price: about [5.5](numbers.md#exhaust-work-ratio)
joules of electricity per joule of heat moved ([budget](budget.md#pump-work-and-the-carnot-factor)). The
[10,000](numbers.md#exhaust-canopies) canopies carry [5.5 × 10¹³ m²](numbers.md#exhaust-area-installed) of
emitters, [12%](numbers.md#exhaust-area-share) of Venus's area, enough to throw out
[5.0 × 10¹⁹ W](numbers.md#exhaust-peak) at the peak the simulation needs.

> **Precedent:** An LED at MIT emitted [6.9 × 10⁻¹¹ W](numbers.md#led-2012-light-out) of light while drawing
> [3.0 × 10⁻¹¹ W](numbers.md#led-2012-power-in) of electricity, taking the difference from heat
> ([Santhanam 2012](sources.md#santhanam-2012)).

> **Invented:** Electroluminescent cooling at [0.91 MW/m²](numbers.md#exhaust-flux). It has never been shown
> at useful power; the [Exhaust-1](research.md#exhaust-1) experiment must show it by 2028.

As the air cools, its CO₂ comes down. The Clear Rain begins on
[13 July 2034](numbers.md?date=day#traj-clear-rain), when the air drops below
[304 K](numbers.md?sig=3#co2-critical-temp) and liquid CO₂ runs into the lowland basins. The seas start to
freeze from the top on [23 June 2036](numbers.md?date=day#traj-freeze), below
[216.6 K](numbers.md#co2-triple-temp). Frost Towers, the same emitter tiles on towers at
[133 K](numbers.md#frost-tower-temp), trap the last vapor down to [74 Pa](numbers.md#frost-co2-pressure).
Crawler-rafts seal the frozen seas under a [1 mm](numbers.md#cryo-membrane-thickness) graphite membrane,
[20 m](numbers.md#cryo-aerogel-thickness) of carbon aerogel and [2 m](numbers.md#cryo-armour-thickness) of
basalt. The [Cryo-continents](technologies/cryo.md) are [2 km](numbers.md#cryo-thickness) plateaus over
[33%](numbers.md#cryo-footprint-share) of the planet: new land. The hot rock beneath them leaks
[12 PW](numbers.md#cryo-floor-load) at first, carried away by heat pipes drilled into the basin floors.

<!-- figure:heat-path -->
![Venus's heat path, in cross-section](../figures/svg/heat-path.svg)
<!-- /figure -->

<!-- figure:co2-phase -->
![CO₂ phase diagram with Venus's simulated cooling path](../figures/svg/co2-phase.svg)
<!-- /figure -->

### 4. Bring the water

The [Ceres Ice Train](technologies/ice-train.md) is [10,000](numbers.md#railhead-count) coilguns on Ceres,
where gravity is [0.28 m/s²](numbers.md#ceres-gravity). They fire [1,410](numbers.md#ice-bricks-per-second)
Bricks of [1 Mt](numbers.md#brick-mass) of ice a second at [6.4 km/s](numbers.md#ice-launch-speed), from
[July 2033](numbers.md?date=month#ice-launch-start) to [October 2035](numbers.md?date=month#ice-launch-end).
Each falls sunward for [1.15 yr](numbers.md#ice-transfer-years). In all they carry
[1.0 × 10²⁰ kg](numbers.md#ice-mass), a [217 m](numbers.md#ocean-depth) global ocean and
[7.1%](numbers.md#ice-vs-earth-water) of Earth's water. That is [39%](numbers.md#ice-ceres-water-share) of
Ceres's water, and the recoil changes Ceres's orbit for good ([Risks](risks.md#ceres)).

<!-- figure:ice-orbits -->
![Ceres Ice Train orbits, to scale](../figures/svg/ice-orbits.svg)
<!-- /figure -->

Ice falling freely onto Venus would hit at [13.8 km/s](numbers.md#ring-free-fall-speed) and dump
[9.5 × 10²⁷ J](numbers.md#ring-free-fall-impact) of heat, [18](numbers.md#ring-free-fall-vs-atmosphere)
times what the whole cooling campaign removes from the air. So the [Braking Ring](technologies/ring.md)
catches it: a [40,540 km](numbers.md#ring-circumference) orbital ring at
[400 km](numbers.md#ring-altitude), whose rotor spins faster than orbital speed and holds a stationary
stator aloft. Magnetic sleds brake each Brick from [13.5 km/s](numbers.md#ring-arrival-speed) to orbital
speed and turn [53 MJ/kg](numbers.md#ring-recovered-per-kg) of its motion into electricity:
[5.3 × 10²⁷ J](numbers.md#ring-recovered-energy) in all, [7.5 × 10¹⁹ W](numbers.md#ring-power) at full rate.
That is more than the coilguns draw, so from [16 September 2034](numbers.md?date=day#ring-pays-from) the Ring
powers the Railheads and the Lattice is free to cool Venus. The surplus is not free energy: gravity
adds it as the ice falls from Ceres's orbit into the Sun's well and then into Venus's
([budget](budget.md#ring-recovery-and-gravity)).

<!-- figure:braking-ring -->
![Braking Ring: catching the Ice Train](../figures/svg/braking-ring.svg)
<!-- /figure -->

**Open problem.** Catching works. Lowering does not, yet. Bringing the parked ice down on tethers needs
[150](numbers.md#lowering-overload) times more lift than the rotor has to spare. The options are to drop the
Bricks from rest and pump out the extra [2.5 × 10²⁶ J](numbers.md#ring-drop-extra-heat) of heat, to lower
more slowly, or to build a far heavier rotor ([Risks](risks.md#the-ring-cannot-yet-lower-the-ice)).

> **Invented:** A rotor carrying [7.0 × 10¹² kg](numbers.md#ring-rotor-mass) at
> [10 km/s](numbers.md#ring-rotor-speed), and sleds that brake megatonne blocks at
> [50 g](numbers.md#ring-catch-accel).

### 5. Make it breathe

[500](numbers.md#forge-count) floating [Graphite Forges](technologies/forges.md) run from
[January 2035](numbers.md?date=month#forge-start) to [September 2036](numbers.md?date=month#forge-end). They
split [1.8 × 10¹⁸ kg](numbers.md#forge-co2) of CO₂, [0.4%](numbers.md#forge-co2-share) of Venus's, into
[1.3 × 10¹⁸ kg](numbers.md#o2-mass) of oxygen and [4.9 × 10¹⁷ kg](numbers.md#forge-graphite) of graphite, for
[2.7 × 10²⁵ J](numbers.md#forge-energy). The graphite is the caps' membrane and foam.

> **Precedent:** Molten-carbonate electrolysis splits CO₂ into graphene nanocarbons and oxygen in one step
> ([Licht 2025](sources.md#licht-2025-c2cnt)), and sulfur gases do not poison it
> ([Licht 2015](sources.md#licht-2015)).

The [Acid Sweep](technologies/acid.md) handles the sulfur: as the air cools,
[1.1 × 10¹⁷ kg](numbers.md#venus-so2-mass) of SO₂ rains out and is neutralized by
[9 × 10¹⁷ kg](numbers.md#acid-basalt) of crushed basalt spread over the basins. The
[Aegis Shield](technologies/aegis.md), a superconducting coil switched on in
[June 2034](numbers.md?date=month#aegis-online), inflates a [10,000 km](numbers.md#aegis-bubble-radius)
magnetic bubble so the solar wind cannot strip the new water. The Veil opens to
[52%](numbers.md#veil-day-transmission) for daylight and closes for night, and mirror swarms light the far
side, giving a [24 h](numbers.md#day-length) day. [Genesis Biota](technologies/genesis.md), engineered
microbes, algae, lichens and mosses, are seeded once the oxygen is in and the new oceans have held their
pH, from [1 December 2036](numbers.md?date=day#genesis-start).

The air at the end is [2.4 bar](numbers.md#final-pressure): [2.1 bar](numbers.md#n2-pressure) of nitrogen,
[0.25 bar](numbers.md#o2-target-pressure) of oxygen ([1.2](numbers.md#o2-vs-earth) times Earth's sea-level
oxygen) and [310 ppm](numbers.md#final-co2-ppm) of CO₂. Breathing it feels like breathing
[13 m](numbers.md#dive-depth) under the sea.

## The finish line

<!-- table:finish -->
| Measure | Venus today | End of 2036 | Delivered by |
| --- | --- | --- | --- |
| Mean surface temperature | [737 K](numbers.md#venus-surface-temp) | [288 K](numbers.md#earth-surface-temp), Earth's mean (Earth-like from [285 K](numbers.md#earth-like-temp)) | [Hesperus Veil](technologies/veil.md), [Photonic Exhaust](technologies/exhaust.md) |
| Surface pressure | [92 bar](numbers.md#venus-surface-pressure) | [2.4 bar](numbers.md#final-pressure) | [Cryo-continents](technologies/cryo.md) |
| Nitrogen | [3.5%](numbers.md#venus-n2-fraction) of the air | [2.1 bar](numbers.md#n2-pressure) (kept) | Already there. |
| Oxygen | Trace | [0.25 bar](numbers.md#o2-target-pressure) | [Graphite Forges](technologies/forges.md) |
| CO₂ | [96.5%](numbers.md#venus-co2-fraction) | [310 ppm](numbers.md#final-co2-ppm) | [Cryo-continents](technologies/cryo.md), [Graphite Forges](technologies/forges.md), [Photonic Exhaust](technologies/exhaust.md) |
| Water | Nearly none | [1.0 × 10²⁰ kg](numbers.md#ice-mass), a [217 m](numbers.md#ocean-depth) global ocean | [Ceres Ice Train](technologies/ice-train.md), [Braking Ring](technologies/ring.md) |
| Light cycle | A [117 d](numbers.md#venus-solar-day) solar day | A [24 h](numbers.md#day-length) day | [Hesperus Veil](technologies/veil.md) |
| Clouds | Sulfuric acid | Water | [Acid Sweep](technologies/acid.md) |
<!-- /table -->

Not delivered by 2036: trees, crops and animals. Those are the work of the following decades.

## The technology stack

Thirteen inventions, on four worlds and the space between them. Only the seed foundry and the first Ceres
factories leave Earth; every other kilogram is made where it is needed.

<!-- figure:tech-stack -->
![The Phosphoros technology stack](../figures/svg/tech-stack.svg)
<!-- /figure -->

<!-- table:techs -->
| Invention | Job | Scale | Breakthrough assumed | Online |
| --- | --- | --- | --- | --- |
| [Ouroboros Foundry](technologies/ouroboros.md) | Self-copying industry on Mercury | [1,000 t](numbers.md#foundry-seed-mass) seed to [6.7 × 10¹³ kg](numbers.md#foundry-final-mass) | A fully closed loop (chips, motors, optics, robots) from regolith, doubling every [60 d](numbers.md#foundry-doubling-days) | [2029](numbers.md?date=year#foundry-landing) |
| [Helios Lattice](technologies/helios.md) | Harvest sunlight near Mercury and beam it | [6.2 × 10¹⁶ m²](numbers.md#helios-area) of film; [8.5 × 10¹⁹ W](numbers.md#helios-power) delivered | [15%](numbers.md#helios-efficiency) sunlight-to-target efficiency through kilometre-scale coherent laser arrays | [2033](numbers.md?date=year#helios-full-power) |
| [Hesperus Veil](technologies/veil.md) | Sunshade, thermostat and day clock | [5.4 × 10¹⁴ m²](numbers.md#veil-area), [5.4 × 10¹¹ kg](numbers.md#veil-mass), [1.11 × 10⁶ km](numbers.md#veil-distance) sunward | [3.8 × 10⁸](numbers.md#veil-slats) electrochromic, light-bending slats holding station, dimming from open to [99.9%](numbers.md#veil-block-fraction) blocked | [2032](numbers.md?date=year#veil-close) |
| [Thermal Chimneys](technologies/chimneys.md) | Lift deep heat to the cloud tops | Forced-convection columns [64 km](numbers.md#chimney-height) tall | Structures that survive [737 K](numbers.md#venus-surface-temp) and [92 bar](numbers.md#venus-surface-pressure) through the [3.3 yr](numbers.md#cooling-seconds) of active cooling | [2033](numbers.md?date=year#cooling-start) |
| [Photonic Exhaust](technologies/exhaust.md) | Throw heat into space as light | [5.5 × 10¹³ m²](numbers.md#exhaust-area-installed) of emitters; [5.0 × 10¹⁹ W](numbers.md#exhaust-peak) peak | Electroluminescent cooling at [0.91 MW/m²](numbers.md#exhaust-flux) | [2033](numbers.md?date=year#cooling-start) |
| [Cryo-continents](technologies/cryo.md) | Store all the CO₂ | [3.0 × 10¹⁷ m³](numbers.md#cryo-volume) of sealed dry ice in [2 km](numbers.md#cryo-thickness) plateaus | A graphite membrane and [20 m](numbers.md#cryo-aerogel-thickness) foam cap; basal heat pipes and refrigeration of [12 PW](numbers.md#cryo-floor-load) at first | [2034](numbers.md?date=year#traj-clear-rain) |
| [Graphite Forges](technologies/forges.md) | Split CO₂ into oxygen and carbon | [1.8 × 10¹⁸ kg](numbers.md#forge-co2) of CO₂ to [1.3 × 10¹⁸ kg](numbers.md#o2-mass) of oxygen | Molten-carbonate splitting at [60%](numbers.md#forge-efficiency) efficiency, at planetary scale | [2035](numbers.md?date=year#forge-start) |
| [Ceres Ice Train](technologies/ice-train.md) | Ship the water | [1.0 × 10²⁰ kg](numbers.md#ice-mass) of ice at [6.4 km/s](numbers.md#ice-launch-speed), [1.15 yr](numbers.md#ice-transfer-years) in transit | Mass drivers throwing [1.41 × 10¹² kg/s](numbers.md#ice-throughput) in all | [2033](numbers.md?date=year#ice-launch-start) |
| [Braking Ring](technologies/ring.md) | Catch the ice without heating Venus | Orbital ring of [1.0 × 10¹³ kg](numbers.md#ring-mass) | Regenerative magnetic braking recovering [5.3 × 10²⁷ J](numbers.md#ring-recovered-energy) | [2034](numbers.md?date=year#first-catch) |
| [Acid Sweep](technologies/acid.md) | Remove the sulfuric-acid clouds | Rain-out plus basalt neutralization | None but scale | [2034](numbers.md?date=year#traj-clear-rain) |
| [Aegis Shield](technologies/aegis.md) | Stop the solar wind stripping the new water | Superconducting dipole beside the Veil | Large deep-space superconducting coils | [2034](numbers.md?date=year#aegis-online) |
| [Genesis Biota](technologies/genesis.md) | Start an ecosystem | Engineered cyanobacteria, lichens and plankton | Organisms tuned to cold, fresh, nitrogen-rich water | [2036](numbers.md?date=year#genesis-start) |
| [Choir](technologies/choir.md) | Run every machine on three worlds as one system | Autonomy across three worlds | Self-correcting swarm control with a verified safety core | [2029](numbers.md?date=year#foundry-landing) |
<!-- /table -->

## The decade in brief

<!-- figure:gantt -->
![The Phosphoros decade, 2027 to 2036](../figures/svg/gantt.svg)
<!-- /figure -->

The years [2027](numbers.md?date=year#program-start) and [2028](numbers.md?date=year#experiments-end) are for
proof: nine experiments and the cloud-life survey, with the gate on [15 December 2028](numbers.md?date=day#life-gate). From 2029 to 2033 the
Foundry grows on Mercury while the Veil, the Lattice and the Ring are built from its output. From 2033 to
2036 the work moves to Venus: cooling, the Clear Rain, the ice, the Forges and the first life. The
[Timeline](timeline.md) has every workstream, the critical path and what slips if the Foundry is slow.

## The simulated atmosphere

<!-- figure:trajectory -->
![The simulated atmosphere, 2033 to 2036](../figures/svg/trajectory.svg)
<!-- /figure -->

The dates on which Venus's air changes are not chosen. They come from a day-by-day simulation of the
atmosphere,
[calc/src/model/trajectory.ts](../calc/src/model/trajectory.ts), which runs from the start of active
cooling on [3 May 2033](numbers.md?date=day#cooling-start) using only the power the plan has. Each day:

1. The Lattice supplies electricity, climbing from nothing to full power as the Petals are built. Before the Ring catches its
   first Brick, the Railheads take their share first; after, the Ring pays for them and adds its surplus.
   The Forges take theirs.
2. Heat enters the air: from the crust, from the Forges' waste heat, from the falling ice, and from the
   sunlight the closed Veil lets through.
3. The rest of the power, less the chimney fans, drives the Exhaust, which lifts heat out of the air and
   rejects it at an effective [2,000 K](numbers.md#exhaust-effective-temp), never more than
   [5.0 × 10¹⁹ W](numbers.md#exhaust-peak) and never faster than the chimneys carry it,
   [1.3 × 10¹⁹ W](numbers.md#chimney-capacity). While the air cools as a gas the pumps see it a little colder
   than it is, [0.931](numbers.md#chimney-cold-factor) of its temperature, because the chimneys' exchangers take
   its heat over a range.
4. The heat removed moves the air down its cooling path, and the CO₂ left in the air follows its vapor
   curve. Then Frost Towers trap the last CO₂, the Forges add oxygen, and once the caps are sealed the
   beamed power and the opened Veil warm the air and melt the ice.

Its simplifications are named in the code: the whole atmosphere shares one temperature, the latent heat
is released evenly between the critical and triple points, receiver loss heat goes straight to space, and the
pumps are charged the work for light as hot as [2,000 K](numbers.md#exhaust-effective-temp), a floor until the
Exhaust's beamed light is reconciled ([open problem](budget.md#physics-checks)).

What it finds:

| Event | Simulated date |
| --- | --- |
| The Clear Rain: air below [304 K](numbers.md?sig=3#co2-critical-temp) | [13 July 2034](numbers.md?date=day#traj-clear-rain) |
| CO₂ seas start to freeze | [23 June 2036](numbers.md?date=day#traj-freeze) |
| All the CO₂ is down | [3 August 2036](numbers.md?date=day#traj-cold) |
| Frost Towers reach the CO₂ target | [22 August 2036](numbers.md?date=day#traj-scavenged) |
| Caps sealed; the Veil opens | [2 September 2036](numbers.md?date=day#traj-warming) |
| Air reaches [285 K](numbers.md#earth-like-temp) | [6 September 2036](numbers.md?date=day#traj-warm) |
| **Earth-like** | **[30 September 2036](numbers.md?date=day#traj-earth-like)** |
| Deadline | [31 December 2036](numbers.md?date=day#deadline) |

Venus is Earth-like [92 d](numbers.md#traj-slack-days) before the deadline. Three things stand out.
Until the Ring takes over the Railheads in [September 2034](numbers.md?date=month#ring-pays-from), cooling is
starved of power; after that, power is plentiful and the emitters are the limit, which is why the Exhaust
is sized for the peak and not the average ([correction](about.md#corrections)). The long stretch between
the Clear Rain and the freeze is the CO₂ condensing: its latent heat,
[2.7 × 10²⁶ J](numbers.md#atmosphere-latent-heat), is about as much as the sensible cooling of the whole
air, [2.6 × 10²⁶ J](numbers.md#atmosphere-sensible-heat).
And the last condition to fall is the oxygen: the air is warm by [September 2036](numbers.md?date=month#traj-warm), but it is Earth-like only on
the day the Forges finish.

The simulation's pump work, [3.5 × 10²⁷ J](numbers.md#traj-pump-energy), is what the energy budget charges,
and it is more than the simple estimate for the air alone ([why](budget.md#why-the-simulation-pumps-more)).
To see how the dates move, change an assumption in the [Explorer](https://phosphoros.space/explore) or run
`pnpm calc --set exhaust-peak=3.6e19` to try version 2's smaller Exhaust.
