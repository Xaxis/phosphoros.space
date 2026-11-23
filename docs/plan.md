# The Plan

Venus becomes Earth-like by the end of 2036 if we invent one thing above all: a factory that copies itself
every [60 d](numbers.md#foundry-doubling-days). Everything else follows from the energy it unlocks.

One rule binds every invention: it may assume engineering we do not have yet, but it must obey
conservation of energy and the second law of thermodynamics. The binding constraint is energy. Venus
cannot shed its heat fast enough on its own ([The Problem](problem.md)), so the plan brings in
[1.6 × 10²⁸ J](numbers.md#budget-demand) from outside the planet, almost all of it sunlight harvested near
Mercury and beamed across the inner Solar System.

## The five moves

### 1. Grow an industry

A [1,000 t](numbers.md#foundry-seed-mass) seed of twelve machine types launches from Earth on
[1 October 2028](numbers.md?date=day#foundry-seed-launch) and lands on Mercury on
[14 January 2029](numbers.md?date=day#foundry-landing). There it digs, smelts, rolls, prints and assembles
copies of itself from local rock, powered by its own solar film. Mercury suits it: sunlight close to the
Sun is strong ([9,080 W/m²](numbers.md#mercury-sunlight) at its mean distance), the silicate rock is
rich in magnesium, sulfur and carbon (though poor in iron, under [4%](numbers.md#mercury-surface-fe-max) by mass),
and parts reach orbit by mass driver because escape speed is only
[4.25 km/s](numbers.md#mercury-escape).

The [Ouroboros Foundry](technologies/ouroboros.md) doubles every [60 d](numbers.md#foundry-doubling-days):
[5.8 × 10⁷ kg](numbers.md#foundry-mass-2030) of machinery by January 2030,
[2.7 × 10¹¹ kg](numbers.md#foundry-mass-2032) by January 2032, and after [28](numbers.md#foundry-doublings)
doublings [2.7 × 10¹⁴ kg](numbers.md#foundry-final-mass) in [August 2033](numbers.md?date=month#foundry-full-scale).
Exponential growth makes everything after it cheap, but nothing is free: every kilogram of product is a
kilogram the Foundry does not add to itself. So it stops growing for only [9.8 d](numbers.md#veil-diversion-days)
to build the Veil, late in 2032 when it is large, and builds the rest once it is full grown: the Helios
Lattice in [39 d](numbers.md#lattice-build-days), then the
[1.9 × 10¹⁴ kg](numbers.md#venus-hardware-mass) of tiles, chimneys and receivers Venus needs in
[61 d](numbers.md#venus-hardware-build-days). It grows to the size that finishes both soonest.
[Choir](technologies/choir.md) runs it all, with a mass budget no machine can exceed.

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
before active cooling begins in [February 2034](numbers.md?date=month#cooling-start), and turns away
[99.9%](numbers.md#veil-block-fraction) of the sunlight, [3.0 × 10¹⁷ W](numbers.md#veil-blocked-power). Slats fail opaque and block every colour.
Seen from Venus the Veil is only [0.68°](numbers.md#veil-angular-radius) in radius, so the Exhaust's light
that reaches it is only [5.1%](numbers.md#exhaust-veil-load-share) of the sunlight it turns away. The
[Aegis Shield](technologies/aegis.md)'s coil sits beside it.

<!-- figure:veil-geometry -->
![Hesperus Veil geometry](../figures/svg/veil-geometry.svg)
<!-- /figure -->

> **Precedent:** Angel's design for cooling Earth used thin refracting flyers near L1 that light pressure
> barely moves ([Angel 2006](sources.md#angel-2006)).

> **Invented:** Slats that bend sunlight past Venus and switch their transmission in seconds, from fully
> closed to [60%](numbers.md#veil-open-transmission) open.

### 3. Pump the heat out

The [Helios Lattice](technologies/helios.md) is [2.5 × 10⁷](numbers.md#helios-petals) film Petals orbiting
near Mercury, [1.2 × 10¹⁷ m²](numbers.md#helios-area) in all. Each turns sunlight into laser light:
[40%](numbers.md#helios-film-efficiency) film and [50%](numbers.md#helios-laser-efficiency) laser make
[20%](numbers.md#helios-efficiency) from sunlight to beam. From
[October 2033](numbers.md?date=month#helios-full-power) it beams [2.2 × 10²⁰ W](numbers.md#helios-power),
[5.7 × 10⁻⁵%](numbers.md#helios-sun-share) of the Sun's output, in beams that stay
[110 m](numbers.md#helios-spot) wide across [1.2 AU](numbers.md#helios-range). Most of that light is never
turned into electricity: it pumps the Exhaust directly. Only the Railheads on Ceres and the Forges and fans
on Venus run on receivers, and the receivers at Venus shed their loss,
[2.9 × 10¹⁷ W](numbers.md#venus-receiver-loss) at full output, into the air with the rest of the heat.

On Venus, [10,000](numbers.md#chimney-count) [Thermal Chimneys](technologies/chimneys.md), towers
[6 km](numbers.md#chimney-diameter) wide and [64 km](numbers.md#chimney-height) tall, draw the deep air through
fan-driven exchangers and lift its heat in sealed liquid loops to floating canopies above the clouds at
[3.7 × 10¹⁵ W](numbers.md#chimney-heat) each. There the
[Photonic Exhaust](technologies/exhaust.md) throws it into space as light.

> **Physics:** A plain radiator cannot shine brighter than σT⁴ at its own temperature, which at the cloud
> tops is thousands of times less than the Exhaust needs. To go faster, heat must be pumped.

The Exhaust is a heat pump made of light. Each tile is a semiconductor that absorbs the Lattice's
[2.5 µm](numbers.md#helios-wavelength) beam, just below its bandgap, and gives off its own light, a little
bluer, at [2.3 µm](numbers.md#exhaust-wavelength), where the thin CO₂ above the canopies barely absorbs. The
difference is taken from heat: at the start, each joule of pump light has room to carry
[0.26](numbers.md#exhaust-pump-room-start) J of heat away with it. A tile sitting at a few hundred
kelvin glows as brightly as a [2,200 K](numbers.md#exhaust-effective-temp) body,
[1.3 MW/m²](numbers.md#exhaust-flux), spread evenly over the sky above it.

The second law sets the price. Light that bright, in one narrow band, carries as much entropy as a body at
[3,500 K](numbers.md#exhaust-light-temp), so every pump in the model is charged as if it rejected its heat
there, and at [50%](numbers.md#exhaust-carnot-share) of the Carnot limit: about
[21](numbers.md#exhaust-work-ratio) joules of light per joule of heat moved
([budget](budget.md#pump-work-at-the-lights-temperature)). Pumped by light, a tile works only while the Lattice
can reach it, and the Lattice sees only the sunward half of Venus. So the
[10,000](numbers.md#exhaust-canopies) canopies carry [3.3 × 10¹⁴ m²](numbers.md#exhaust-area-installed) of
tiles, [72%](numbers.md#exhaust-area-share) of Venus's area, enough for the lit half to throw out
[2.2 × 10²⁰ W](numbers.md#exhaust-peak) at the peak the simulation needs. They fill
[83%](numbers.md#canopy-band-cover) of the band within [60°](numbers.md#ice-drop-latitude) of the equator,
leaving the poles for the falling ice.

> **Precedent:** Laser light first cooled a solid in 1995, a glass doped with ytterbium
> ([Epstein et al. 1995](sources.md#epstein-1995-cooling)), and cooled a semiconductor, cadmium sulphide,
> by [40 K](numbers.md#laser-cooling-2013-drop) in 2013 ([Zhang et al. 2013](sources.md#zhang-2013-semiconductor)). An LED at MIT emitted
> [6.9 × 10⁻¹¹ W](numbers.md#led-2012-light-out) of light while drawing
> [3.0 × 10⁻¹¹ W](numbers.md#led-2012-power-in) of electricity, taking the difference from heat
> ([Santhanam et al. 2012](sources.md#santhanam-2012)).

> **Invented:** Laser cooling of a semiconductor at [1.3 MW/m²](numbers.md#exhaust-flux). It has never been
> shown at useful power; the [Exhaust-1](research.md#exhaust-1) experiment must show it by 2028.

As the air cools, its CO₂ comes down. The Clear Rain begins on
[8 August 2034](numbers.md?date=day#traj-clear-rain), when the air drops below
[304 K](numbers.md?sig=3#co2-critical-temp) and liquid CO₂ runs into the lowland basins. The seas start to
freeze on [7 November 2035](numbers.md?date=day#traj-freeze), when the air reaches the triple point,
[216.6 K](numbers.md#co2-triple-temp), and the air holds there until they are frozen through on
[30 April 2036](numbers.md?date=day#traj-frozen). Dry ice is denser than liquid CO₂, so the crystals sink and
the seas fill with ice from the bottom up. Frost Towers, the same emitter tiles on towers at
[133 K](numbers.md#frost-tower-temp), trap the last vapor down to [54 Pa](numbers.md#frost-co2-pressure).
Crawler-rafts seal the frozen seas, [1.2 × 10⁶ km²/d](numbers.md#cap-laying-rate) of cap a day, under a
[1 mm](numbers.md#cryo-membrane-thickness) graphite membrane,
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
where gravity is [0.28 m/s²](numbers.md#ceres-gravity). They fire [129](numbers.md#ice-bricks-per-second)
Bricks of [1 Mt](numbers.md#brick-mass) of ice a second at [6.4 km/s](numbers.md#ice-launch-speed) for
[90 d](numbers.md#ice-campaign-days), from [9 October 2033](numbers.md?date=day#ice-launch-start), when the
Lattice can power them. By luck of the dates, that is [7.9 d](numbers.md#ice-window-wait) before a Hohmann
window to Venus opens, so the first shots cost about the least a launch can and the later ones more,
[19%](numbers.md#launch-offwindow-mean) more on average. Each falls sunward for
[341 d](numbers.md#ice-flight-min) to [410 d](numbers.md#ice-flight-max).

<!-- figure:ice-orbits -->
![Ceres Ice Train orbits, to scale](../figures/svg/ice-orbits.svg)
<!-- /figure -->

Nothing catches them. Each Brick plunges into Venus's air at about
[17.1 km/s](numbers.md#ice-entry-speed) and bursts there with [1.5 × 10¹⁷ J](numbers.md#brick-entry-energy),
the energy of a large hydrogen bomb, so they fall beyond [60°](numbers.md#ice-drop-latitude) of latitude,
clear of the canopies. All of a Brick's speed, and its fall into Venus's gravity, ends as heat in the air:
[147 MJ/kg](numbers.md#ice-entry-energy-per-kg), against well under
[0.61 MJ/kg](numbers.md#melt-energy) to melt the ice and warm it. That heat sets how much water Venus can be
given. An ocean in Earth's proportion would bring [350](numbers.md#ocean-entry-vs-atmosphere) times the heat
of Venus's whole atmosphere, so the plan ships [1.0 × 10¹⁸ kg](numbers.md#ice-mass), enough to cover Venus
[2.17 m](numbers.md#ocean-depth) deep, which gathers as seas in the deepest lowland
basins: about [300 m](numbers.md#sea-mean-depth) deep where they lie, covering
[0.72%](numbers.md#sea-cover-share) of the planet. Its heat,
[1.5 × 10²⁶ J](numbers.md#ice-entry-heat), is [28%](numbers.md#ice-entry-vs-atmosphere) of the atmosphere's
own, and the pumps lift it with the rest. Twice the ice would leave the last caps unfinished at the
deadline.

The Bricks arrive from [13 November 2034](numbers.md?date=day#first-arrival) to
[23 January 2035](numbers.md?date=day#last-arrival), bringing their heat several times faster than the lit
canopies' chimneys can carry it out. So the air, already below the critical point, warms back by
[88 K](numbers.md#traj-rewarm), warmest on [11 December 2034](numbers.md?date=day#traj-rewarm-peak), and the
first Clear Rain boils back into the air until the pumps catch up; it begins for good on
[30 January 2035](numbers.md?date=day#traj-rerain). Spreading the arrivals over more months would warm the
air back less, but the later Bricks would fall into colder air, where their heat costs more to lift, and
the Frost Towers would finish later. The new water rains out on
[26 November 2034](numbers.md?date=day#traj-water-rain), freezes on
[30 June 2035](numbers.md?date=day#traj-water-frozen), and melts again once the Veil opens.

> **Physics:** Earth's oceans could not arrive this way in a decade. Every kilogram of water that falls
> from Ceres brings [147 MJ/kg](numbers.md#ice-entry-energy-per-kg) of heat, and a slow descent does not
> help: whatever lowers the ice must take that energy somewhere, and near Venus that somewhere is Venus.
> Version 3's Braking Ring tried to turn it into electricity and could not be built
> ([corrections](about.md#corrections)).

> **Invented:** Ten-kilometre coilguns firing megatonne ice blocks every few seconds, and Bricks steered in
> flight by Lattice laser ablation onto drop zones a few hundred kilometres across.

### 5. Make it breathe

[500](numbers.md#forge-count) floating [Graphite Forges](technologies/forges.md) run from
[April 2035](numbers.md?date=month#forge-start) to [September 2036](numbers.md?date=month#forge-end). They
split [1.8 × 10¹⁸ kg](numbers.md#forge-co2) of CO₂, [0.4%](numbers.md#forge-co2-share) of Venus's, into
[1.3 × 10¹⁸ kg](numbers.md#o2-mass) of oxygen and [4.9 × 10¹⁷ kg](numbers.md#forge-graphite) of graphite, for
[2.7 × 10²⁵ J](numbers.md#forge-energy). The graphite is the caps' membrane and foam.

> **Precedent:** Molten-carbonate electrolysis splits CO₂ into graphene nanocarbons and oxygen in one step
> ([Licht et al. 2025](sources.md#licht-2025-c2cnt)), and sulfur gases do not poison it
> ([Licht 2015](sources.md#licht-2015)).

The [Acid Sweep](technologies/acid.md) handles the sulfur. As the air cools, the
[1.1 × 10¹⁷ kg](numbers.md#venus-so2-mass) of SO₂ dissolves in the liquid CO₂, and
[99.4%](numbers.md#so2-sealed-share) of it freezes with the seas into the cryo-continents. The cloud acid and
the SO₂ left in the air are neutralized by [6 × 10¹⁵ kg](numbers.md#acid-basalt) of crushed basalt spread on the
land outside the basins. The
[Aegis Shield](technologies/aegis.md), a superconducting coil switched on in
[June 2034](numbers.md?date=month#aegis-online), inflates a [10,000 km](numbers.md#aegis-bubble-radius)
magnetic bubble so the solar wind cannot strip the new water. The Veil opens to
[52%](numbers.md#veil-day-transmission) for daylight and closes for night, and mirror swarms light the far
side, giving a [24 h](numbers.md#day-length) day. [Genesis Biota](technologies/genesis.md), engineered
microbes, algae, lichens and mosses, are seeded once the oxygen is in and the new seas have held their
pH, from [1 December 2036](numbers.md?date=day#genesis-start), and the sunlit seas are green by
[12 December 2036](numbers.md?date=day#genesis-end).

The air at the end is [2.4 bar](numbers.md#final-pressure): [2.1 bar](numbers.md#n2-pressure) of nitrogen,
[0.25 bar](numbers.md#o2-target-pressure) of oxygen ([1.2](numbers.md#o2-vs-earth) times Earth's sea-level
oxygen) and [230 ppm](numbers.md#final-co2-ppm) of CO₂. Breathing it feels like breathing
[13 m](numbers.md#dive-depth) under the sea.

## The finish line

<!-- table:finish -->
| Measure | Venus today | End of 2036 | Delivered by |
| --- | --- | --- | --- |
| Mean surface temperature | [737 K](numbers.md#venus-surface-temp) | [288 K](numbers.md#earth-surface-temp), Earth's mean (Earth-like from [285 K](numbers.md#earth-like-temp)) | [Hesperus Veil](technologies/veil.md), [Photonic Exhaust](technologies/exhaust.md) |
| Surface pressure | [92 bar](numbers.md#venus-surface-pressure) | [2.4 bar](numbers.md#final-pressure) | [Cryo-continents](technologies/cryo.md) |
| Nitrogen | [3.5%](numbers.md#venus-n2-fraction) of the air | [2.1 bar](numbers.md#n2-pressure) (kept) | Already there. |
| Oxygen | Trace | [0.25 bar](numbers.md#o2-target-pressure) | [Graphite Forges](technologies/forges.md) |
| CO₂ | [96.5%](numbers.md#venus-co2-fraction) | [230 ppm](numbers.md#final-co2-ppm) | [Cryo-continents](technologies/cryo.md), [Graphite Forges](technologies/forges.md), [Photonic Exhaust](technologies/exhaust.md) |
| Water | Nearly none | [1.0 × 10¹⁸ kg](numbers.md#ice-mass), seas [2.17 m](numbers.md#ocean-depth) deep if spread over the globe | [Ceres Ice Train](technologies/ice-train.md) |
| Light cycle | A [117 d](numbers.md#venus-solar-day) solar day | A [24 h](numbers.md#day-length) day | [Hesperus Veil](technologies/veil.md) |
| Clouds | Sulfuric acid | Water | [Acid Sweep](technologies/acid.md) |
<!-- /table -->

Not delivered by 2036: trees, crops and animals. Those are the work of the following decades.

## The technology stack

Twelve inventions, on four worlds and the space between them. Only the seed foundry and the seed of the
Ceres factories leave Earth, [1,000 t](numbers.md#ceres-seed-mass) each; every other kilogram is made where it is
needed.

<!-- figure:tech-stack -->
![The Phosphoros technology stack](../figures/svg/tech-stack.svg)
<!-- /figure -->

<!-- table:techs -->
| Invention | Job | Scale | Breakthrough assumed | Online |
| --- | --- | --- | --- | --- |
| [Ouroboros Foundry](technologies/ouroboros.md) | Self-copying industry on Mercury | [1,000 t](numbers.md#foundry-seed-mass) seed to [2.7 × 10¹⁴ kg](numbers.md#foundry-final-mass) | A fully closed loop (chips, motors, optics, robots) from regolith, doubling every [60 d](numbers.md#foundry-doubling-days) | [2029](numbers.md?date=year#foundry-landing) |
| [Helios Lattice](technologies/helios.md) | Harvest sunlight near Mercury and beam it | [1.2 × 10¹⁷ m²](numbers.md#helios-area) of film; [2.2 × 10²⁰ W](numbers.md#helios-power) of light beamed | [20%](numbers.md#helios-efficiency) sunlight-to-beam efficiency through kilometre-scale coherent laser arrays | [2033](numbers.md?date=year#helios-full-power) |
| [Hesperus Veil](technologies/veil.md) | Sunshade, thermostat and day clock | [5.4 × 10¹⁴ m²](numbers.md#veil-area), [5.4 × 10¹¹ kg](numbers.md#veil-mass), [1.11 × 10⁶ km](numbers.md#veil-distance) sunward | [3.8 × 10⁸](numbers.md#veil-slats) electrochromic, light-bending slats holding station, dimming from open to [99.9%](numbers.md#veil-block-fraction) blocked | [2032](numbers.md?date=year#veil-close) |
| [Thermal Chimneys](technologies/chimneys.md) | Lift deep heat to the cloud tops | Towers [64 km](numbers.md#chimney-height) tall, with fan-driven intakes and sealed liquid loops | Structures that survive [737 K](numbers.md#venus-surface-temp) and [92 bar](numbers.md#venus-surface-pressure) through the [2.5 yr](numbers.md#cooling-seconds) of active cooling | [2034](numbers.md?date=year#cooling-start) |
| [Photonic Exhaust](technologies/exhaust.md) | Throw heat into space as light | [3.3 × 10¹⁴ m²](numbers.md#exhaust-area-installed) of tiles; [2.2 × 10²⁰ W](numbers.md#exhaust-peak) peak | Laser cooling of a semiconductor at [1.3 MW/m²](numbers.md#exhaust-flux) | [2034](numbers.md?date=year#cooling-start) |
| [Cryo-continents](technologies/cryo.md) | Store all the CO₂ | [3.0 × 10¹⁷ m³](numbers.md#cryo-volume) of sealed dry ice in [2 km](numbers.md#cryo-thickness) plateaus | A graphite membrane and [20 m](numbers.md#cryo-aerogel-thickness) foam cap; basal heat pipes and refrigeration of [12 PW](numbers.md#cryo-floor-load) at first | [2034](numbers.md?date=year#traj-clear-rain) |
| [Graphite Forges](technologies/forges.md) | Split CO₂ into oxygen and carbon | [1.8 × 10¹⁸ kg](numbers.md#forge-co2) of CO₂ to [1.3 × 10¹⁸ kg](numbers.md#o2-mass) of oxygen | Molten-carbonate splitting at [60%](numbers.md#forge-efficiency) efficiency, at planetary scale | [2035](numbers.md?date=year#forge-start) |
| [Ceres Ice Train](technologies/ice-train.md) | Ship the water | [1.0 × 10¹⁸ kg](numbers.md#ice-mass) of ice at [6.4 km/s](numbers.md#ice-launch-speed), [341 d](numbers.md#ice-flight-min) to [410 d](numbers.md#ice-flight-max) in transit | Mass drivers throwing [1.29 × 10¹¹ kg/s](numbers.md#ice-throughput) in all | [2033](numbers.md?date=year#ice-launch-start) |
| [Acid Sweep](technologies/acid.md) | Remove the sulfuric-acid clouds | Rain-out plus basalt neutralization | None but scale | [2034](numbers.md?date=year#traj-clear-rain) |
| [Aegis Shield](technologies/aegis.md) | Stop the solar wind stripping the new water | Superconducting dipole beside the Veil | Large deep-space superconducting coils | [2034](numbers.md?date=year#aegis-online) |
| [Genesis Biota](technologies/genesis.md) | Start an ecosystem | Engineered cyanobacteria, lichens and plankton | Organisms tuned to cold, sulfate-rich water under nitrogen-rich air | [2036](numbers.md?date=year#genesis-start) |
| [Choir](technologies/choir.md) | Run every machine on three worlds as one system | Autonomy across three worlds | Self-correcting swarm control with a verified safety core | [2029](numbers.md?date=year#foundry-landing) |
<!-- /table -->

## The decade in brief

<!-- figure:gantt -->
![The Phosphoros decade, 2027 to 2036](../figures/svg/gantt.svg)
<!-- /figure -->

The years [2027](numbers.md?date=year#program-start) and [2028](numbers.md?date=year#experiments-end) are for
proof: nine experiments, the cloud-life survey among them, with the gate on [15 December 2028](numbers.md?date=day#life-gate). From 2029 to 2033 the
Foundry grows on Mercury while the Veil and the Lattice are built from its output, then the hardware for
Venus. From 2033 to 2036 the work moves to Venus: cooling, the Clear Rain, the ice, the Forges and the first
life. The
[Timeline](timeline.md) has every workstream, the critical path and what slips if the Foundry is slow.

## The simulated atmosphere

<!-- figure:trajectory -->
![The simulated atmosphere, day by day](../figures/svg/trajectory.svg)
<!-- /figure -->

The dates on which Venus's air changes are not chosen. They come from a day-by-day simulation of the
atmosphere,
[calc/src/model/trajectory.ts](../calc/src/model/trajectory.ts), which runs from the start of active
cooling on [23 February 2034](numbers.md?date=day#cooling-start) using only the power the plan has. Each day:

1. The Lattice beams its light. While the launches run, the Railheads on Ceres take their share first;
   the Forges' receivers take theirs, then the chimney fans'.
2. Heat enters the air: from the crust, from the Forges' waste heat, the fans' work and the receivers' loss,
   from the Bricks falling in and their water cooling and freezing, and from the sunlight the closed Veil
   lets through.
3. The rest of the light pumps the Exhaust's tiles on the lit side, which lift heat out of the air and
   reject it as light that counts as [3,500 K](numbers.md#exhaust-light-temp), never more than
   [2.2 × 10²⁰ W](numbers.md#exhaust-peak) and never faster than the lit canopies' chimneys carry it,
   [1.8 × 10¹⁹ W](numbers.md#chimney-capacity-lit). While the air cools as a gas the pumps see it a little
   colder than it is, [0.931](numbers.md#chimney-cold-factor) of its temperature, because the chimneys'
   exchangers take its heat over a range.
4. The heat removed moves the air down its cooling path, and the CO₂ left in the air follows its vapor
   curve; heat that enters faster than the pumps lift it moves the air back up. The new water follows the
   air: it holds as vapor what the air's temperature allows, rains out the rest, and freezes when the air
   cools below freezing. Then Frost Towers trap the last CO₂, the Forges add oxygen, and once the caps are
   sealed the beamed light and the opened Veil warm the air and melt the ice.

The CO₂ gives up its heat where the physics puts it: its heat of condensation as it rains out along the vapor
curve, its heat of fusion, [210 kJ/kg](numbers.md#co2-fusion-heat), while the seas freeze at the triple point,
and the whole deposition heat for the [5.7%](numbers.md#co2-triple-vapour-share) still in the air there, as it
freezes out below. Its simplifications are named in the code: the whole atmosphere shares one temperature,
so the Bricks' heat spreads over the planet the day it arrives, and its heat capacity and the CO₂'s
deposition heat are averages over the path.

What it finds:

| Event | Simulated date |
| --- | --- |
| The Clear Rain: air below [304 K](numbers.md?sig=3#co2-critical-temp) | [8 August 2034](numbers.md?date=day#traj-clear-rain) |
| The new water rains out | [26 November 2034](numbers.md?date=day#traj-water-rain) |
| The Bricks' heat has warmed the air back [88 K](numbers.md#traj-rewarm) | [11 December 2034](numbers.md?date=day#traj-rewarm-peak) |
| The Clear Rain begins for good | [30 January 2035](numbers.md?date=day#traj-rerain) |
| The new water freezes | [30 June 2035](numbers.md?date=day#traj-water-frozen) |
| CO₂ seas start to freeze | [7 November 2035](numbers.md?date=day#traj-freeze) |
| The seas are frozen through | [30 April 2036](numbers.md?date=day#traj-frozen) |
| All the CO₂ is down | [17 June 2036](numbers.md?date=day#traj-cold) |
| Frost Towers reach the CO₂ target | [26 June 2036](numbers.md?date=day#traj-scavenged) |
| Caps sealed; the Veil opens | [2 September 2036](numbers.md?date=day#traj-warming) |
| Air reaches [285 K](numbers.md#earth-like-temp) | [2 September 2036](numbers.md?date=day#traj-warm) |
| **Earth-like** | **[30 September 2036](numbers.md?date=day#traj-earth-like)** |
| Deadline | [31 December 2036](numbers.md?date=day#deadline) |

Venus is Earth-like [92 d](numbers.md#traj-slack-days) before the deadline. Three things stand out.
Cooling starts with light to spare, and for [51 d](numbers.md#traj-chimney-days) the lit canopies'
chimneys, not the light, are the limit. The Bricks undo two months of it: their heat arrives faster than the
pumps can lift it, and the air must be cooled through the critical point twice. And the long stretch between
the Clear Rain and the seas frozen through is the CO₂'s latent heat,
[2.7 × 10²⁶ J](numbers.md#atmosphere-latent-heat), about as much as the sensible cooling of the whole
air, [2.6 × 10²⁶ J](numbers.md#atmosphere-sensible-heat). Freezing the seas alone holds the air at the
triple point from [November 2035](numbers.md?date=month#traj-freeze) to
[April 2036](numbers.md?date=month#traj-frozen). The last condition to fall is the oxygen: the caps are
sealed and the Veil opens on [2 September 2036](numbers.md?date=day#traj-warming), the air is warm by
[2 September 2036](numbers.md?date=day#traj-warm), and the Forges complete the oxygen on
[30 September 2036](numbers.md?date=day#forge-end), the day Venus is Earth-like. The Frost Towers
finish [67 d](numbers.md#frost-sealing-slack) before the last caps are due, and seeded life greens the
seas before the deadline.

The simulation's pump work, [1.5 × 10²⁸ J](numbers.md#traj-pump-energy), is what the energy budget charges,
and it is more than the simple estimate for the air alone ([why](budget.md#why-the-simulation-pumps-more)).
To see how the dates move, change an assumption in the [Explorer](https://phosphoros.space/explore) or run
`pnpm calc --set exhaust-peak=1.6e20` to try a smaller Exhaust.
