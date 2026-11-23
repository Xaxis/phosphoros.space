# Ceres Ice Train

[10,000](../numbers.md#railhead-count) coilguns on Ceres throw [129](../numbers.md#ice-bricks-per-second)
blocks of ice a second toward Venus, each [1 Mt](../numbers.md#brick-mass), for
[90 d](../numbers.md#ice-campaign-days): from [9 October 2033](../numbers.md?date=day#ice-launch-start)
to [7 January 2034](../numbers.md?date=day#ice-launch-end). Each Brick leaves at
[6.4 km/s](../numbers.md#ice-launch-speed), falls toward the Sun for [341 d](../numbers.md#ice-flight-min)
to [410 d](../numbers.md#ice-flight-max) and plunges straight into Venus's air near one of its poles.
Nothing catches it. [1.0 × 10¹⁸ kg](../numbers.md#ice-mass) of water arrives, enough to cover Venus
[2.17 m](../numbers.md#ocean-depth) deep, which gathers as seas in the deepest lowland
basins: about [300 m](../numbers.md#sea-mean-depth) deep where they lie, covering
[0.72%](../numbers.md#sea-cover-share) of the planet. That is far less than
Earth's oceans, because every kilogram brings the heat of its whole fall, and the pumps must lift it.

<!-- figure:ice-orbits -->
![Ceres Ice Train orbits, to scale](../../figures/svg/ice-orbits.svg)
<!-- /figure -->

## Principle

Ceres is the easiest large store of water to leave in the inner Solar System. Its density suggests it is
up to [27%](../numbers.md#ceres-water-fraction) water by mass, and its gravity is feeble:
[0.28 m/s²](../numbers.md#ceres-gravity) at the surface, an escape speed of
[516 m/s](../numbers.md#ceres-escape).

### Falling to Venus

Ceres circles the Sun at [2.77 AU](../numbers.md#ceres-orbit), Venus at
[0.723 AU](../numbers.md#venus-orbit). Ice thrown backward along Ceres's orbit, against Ceres's motion, is
left moving too slowly to stay at Ceres's distance. It falls inward along half an ellipse whose far end
touches Ceres's orbit and whose near end touches Venus's. This is a Hohmann transfer, the cheapest path
between two circular orbits. The kick is [6.38 km/s](../numbers.md#ice-departure-dv) relative to Ceres;
with the climb out of Ceres's own gravity, the muzzle speed is [6.4 km/s](../numbers.md#ice-launch-speed).
The fall takes half the ellipse's period: [1.15 yr](../numbers.md#ice-transfer-years).

> **Physics:** Speeds add as energies, not as plain numbers. The muzzle speed is the square root of the
> kick squared plus Ceres's escape speed squared, so escaping Ceres costs almost nothing.

On the way in, the Sun's gravity speeds the ice up. On a Hohmann transfer it reaches Venus's orbit moving
faster than Venus itself, by [9.08 km/s](../numbers.md#ice-vinf), and overtakes the planet from behind. The
campaign's Bricks fly faster paths than that (see below) and arrive at
[13.7 km/s](../numbers.md#ice-vinf-rms) on average. Venus's gravity then pulls them in, and they reach the
top of its air at [17.1 km/s](../numbers.md#ice-entry-speed).

### Every Brick's fall is heat

A Brick that meets the air at that speed stops high up within seconds and bursts, and its water falls the
rest of the way. All of its motion far out, and all of its fall into Venus's gravity, ends as heat in the
air: [147 MJ/kg](../numbers.md#ice-entry-energy-per-kg), against the
[0.61 MJ/kg](../numbers.md#melt-energy) it takes to melt the ice and warm the water to [288 K](../numbers.md#earth-surface-temp). Even ice at
rest far out would fall in at Venus's escape speed, [10.36 km/s](../numbers.md#venus-escape), so no
choice of orbit avoids most of that heat.

> **Physics:** Energy is conserved. The ice ends at the bottom of Venus's gravity well, and the energy of
> the fall has to go somewhere. Version 3 had the [Braking Ring](../about.md#corrections) catch the Bricks
> and turn their speed into electricity, but no ring could be held against the catch or carry the ice
> down, so version 4 lets the air stop them and pays to pump the heat out.

The heat sets how much water Venus can have. All the Bricks together bring
[1.5 × 10²⁶ J](../numbers.md#ice-entry-heat), [28%](../numbers.md#ice-entry-vs-atmosphere) of the heat
the pumps take out of Venus's own air. An ocean in Earth's proportion, scaled to Venus's area, would
bring [1.9 × 10²⁹ J](../numbers.md#ocean-entry-heat), [350](../numbers.md#ocean-entry-vs-atmosphere)
times the air's heat: far more than the [Photonic Exhaust](exhaust.md) could lift before the deadline.
The plan ships what the pumps can lift with the rest and still finish the Frost Towers
[67 d](../numbers.md#frost-sealing-slack) before the last caps; twice as much would leave the caps
unfinished at the deadline ([check](../numbers.md#check-frost-before-sealing)).

### The drop zones

Each Brick bursts with [1.5 × 10¹⁷ J](../numbers.md#brick-entry-energy), about the energy of a large
hydrogen bomb. So they fall only beyond [60°](../numbers.md#ice-drop-latitude) of latitude, north and
south, where nothing is built. The Exhaust's canopies fill the band between, and cover
[83%](../numbers.md#canopy-band-cover) of it; the Lattice's beams reach the poles only at a slant, so
tiles there would be dim in any case. The heat each burst leaves in the polar air spreads with the
winds, and the chimneys draw it down with the rest.

### The campaign's dates

On the Hohmann transfer a Brick arrives at Venus's orbit [1.15 yr](../numbers.md#ice-transfer-years) after
it leaves, and Venus must be there to meet it. That needs the two planets at the right angle at launch:
Venus must lead Ceres along their orbits by [225°](../numbers.md#ice-window-lead). The alignment comes
round once every synodic period, [8.5 months](../numbers.md#launch-window-period), and the campaign lasts
[0.35](../numbers.md#launch-windows) of one.

The Railheads need the Lattice's beams, so the first launch is the day the Lattice reaches full power,
[9 October 2033](../numbers.md?date=day#ice-launch-start). The model places Ceres and Venus where their
measured orbits put them that day ([JPL](../sources.md#jpl-sbdb-ceres),
[Standish and Williams](../sources.md#standish-1992-approx)): Venus leads Ceres by
[214°](../numbers.md#ice-launch-lead), so a window opens [7.9 d](../numbers.md#ice-window-wait) after the
first shot. The first weeks' Bricks fly close to the Hohmann transfer; as the planets turn past the
window, later Bricks need other orbits, timed to meet Venus, and cost more. The model books every day's
launches onto an arrival day, solving each pairing as Lambert's problem in three dimensions, and picks the
assignment that costs the least launch energy while no more than [3](../numbers.md#ice-arrival-peak)
times the launch rate reaches Venus on any one day. Left free, the cheapest transfers would crowd into a
few arrival days, and their heat with them.

The orbits are circles, but not flat: Ceres's is tilted [7.2°](../numbers.md#ice-mutual-inclination) to
Venus's. A coasting Brick can change plane only at its ends. The cheapest launches leave most of the tilt
to the arrival: [7.4 km/s](../numbers.md#ice-vinf-tilt) of the arrival speed on average, against
[0.95 km/s](../numbers.md#ice-kick-tilt) in the kick. The costliest shot of the campaign takes
[50%](../numbers.md#launch-offwindow-max) more energy than one in a window, and the average
[19%](../numbers.md#launch-offwindow-mean) more; with the orbits in one plane it would be
[8.9%](../numbers.md#launch-coplanar-mean).

Paying launch energy for slower arrivals would cut the heat each Brick brings, and the model can weigh
the two (`ice-arrival-weight`). The schedule books the cheapest launches. The first Bricks reach Venus on
[13 November 2034](../numbers.md?date=day#first-arrival) and the last on
[23 January 2035](../numbers.md?date=day#last-arrival), while the pumps still run
([check](../numbers.md#check-ice-arrives)) and long before the air reaches the cold where lifting heat
costs most.

Arriving that close together, they bring heat faster than the lit canopies' chimneys can carry it out.
The air, which had cooled through the Clear Rain, warms back by [88 K](../numbers.md#traj-rewarm), most
on [11 December 2034](../numbers.md?date=day#traj-rewarm-peak). That lifts it above CO₂'s critical point
again, the liquid that had rained out boils back into the air, and the Clear Rain begins for good only on
[30 January 2035](../numbers.md?date=day#traj-rerain). The pumps lift all of that heat in the end, so the
finish does not move. Weighing arrival speed spreads the arrivals over months and keeps the air from
warming back that far, but the slower transfers are also the longer ones: they bring their heat later,
into colder air, where each joule costs the pumps more, and the Frost Towers finish a little later.

### Energy per kilogram

A Railhead turns electricity into motion at [50%](../numbers.md#railhead-efficiency), so each kilogram
launched in a window draws [41 MJ/kg](../numbers.md#launch-energy-per-kg), half of which leaves with the ice
as motion. One Brick fired in a window carries [2.05 × 10¹⁶ J](../numbers.md#shot-energy) and draws
[4.1 × 10¹⁶ J](../numbers.md#shot-energy-drawn). Averaged over the campaign, each kilogram draws
[48.9 MJ/kg](../numbers.md#launch-energy-per-kg-avg). Launching all the water takes
[4.9 × 10²⁵ J](../numbers.md#ice-launch-energy), and the Railheads together draw
[6.3 × 10¹⁸ W](../numbers.md#railhead-power). Through the receivers that make that electricity, the
launches cost [6.5 × 10²⁵ J](../numbers.md#ice-launch-light) of the Lattice's light, a small part of the
[energy budget](../budget.md): the pumps take most of the rest.

### Ceres pays in orbit

Throwing [0.11%](../numbers.md#ice-ceres-mass-share) of Ceres's mass backward pushes Ceres forward, the way
a gun recoils. Summed over the campaign its speed rises by [0.0071 km/s](../numbers.md#ceres-recoil). The
model treats Ceres's slightly oval orbit (it already swings out to [2.98 AU](../numbers.md#ceres-aphelion))
as a circle at its average distance, and the push as a single kick. On those terms the circle becomes an
ellipse with an eccentricity of only [7.9 × 10⁻⁴](../numbers.md#ceres-new-eccentricity), reaching
[2.77 AU](../numbers.md#ceres-new-aphelion) at its farthest. The launch schedule takes Ceres's orbit as
widening evenly to [2.77 AU](../numbers.md#ceres-drift-orbit) by the last launch. Either way Ceres moves
away from Earth, never toward it, and the change is permanent, though small.

### Clear of Jupiter

Moving outward brings Ceres closer to Jupiter, which shapes the whole asteroid belt. The new orbit stays
well clear. At its farthest Ceres is still [2.18 AU](../numbers.md#ceres-jupiter-gap) inside Jupiter's
nearest approach to the Sun, [6.1](../numbers.md#ceres-jupiter-gap-hill) times Jupiter's Hill radius of
[0.36 AU](../numbers.md#jupiter-hill-radius), the distance within which Jupiter's pull outweighs the Sun's.
Two bodies on near-circular orbits never meet while their orbits stay more than 2√3 Hill radii apart
([Gladman 1993](../sources.md#gladman-1993)). Ceres's Tisserand parameter with respect to Jupiter, a
quantity Jupiter's tugs leave almost unchanged, stays at [3.31](../numbers.md#ceres-tisserand), where it
is now, [3.31](../numbers.md#ceres-tisserand-now). Above 3 an orbit cannot cross Jupiter's; the comets
Jupiter controls lie between 2 and 3. The model checks both on every run (`ceres-clear-of-jupiter`).

What the model does not follow is resonance, where Ceres's year and Jupiter's make a ratio of small
whole numbers and Jupiter's tugs add up orbit after orbit. On its new orbit, centred on
[2.77 AU](../numbers.md#ceres-new-semi-major-axis), Ceres goes round
[2.58](../numbers.md#ceres-jupiter-period-ratio) times in each of Jupiter's years, almost exactly as it
does now. The push is far too small to carry it to the 5:2 resonance or the 8:3. A numerical integration
of the planets should still confirm that before the first shot.

## Design

### Railheads

Each Railhead is a coilgun [15.6 km](../numbers.md#railhead-length) long that accelerates a Brick at
[200 g](../numbers.md#railhead-accel), up to [7.8 km/s](../numbers.md#ice-launch-speed-max) for the
campaign's costliest shot, in at most [4 s](../numbers.md#railhead-shot-time), then fires again
[78 s](../numbers.md#railhead-interval) later on average. It draws
[6.3 × 10¹⁴ W](../numbers.md#railhead-power-each) on average, and more while a Brick is in the barrel. At
any moment about [510](../numbers.md#railheads-firing) Railheads are mid-shot, so their total draw is
steady: power is switched from one to the next, and no great store of energy is needed between shots.

Every shot kicks the Railhead back as hard as it pushes the Brick forward. The coilguns are anchored in
Ceres's rock, which takes the recoil; summed over a billion Bricks, that recoil is what moves Ceres's
orbit. Ceres also spins, so a Railhead fixed in its rock points the right way only part of the time. The
Railheads stand in a belt around Ceres's equator, under the tethers of [the Crown](#the-crown), and are
steered so that some always face backward along its orbit; the model's firing interval is an average over
all of them.

The coils push each Brick with [2.0 × 10¹² N](../numbers.md#railhead-force). The sabot spreads that push
over the Brick's four long faces, a magnetic pressure of [46 MPa](../numbers.md#railhead-coil-pressure),
which takes a field of [11 T](../numbers.md#railhead-field) in superconducting coils. The field presses the
coils outward just as hard, and a hoop of carbon fibre must hold them together. At full strength that is at
least [390,000 kg/m](../numbers.md#railhead-wrap-per-metre) of barrel,
[6.1 × 10⁹ kg](../numbers.md#railhead-mass) per Railhead and [6.1 × 10¹³ kg](../numbers.md#railheads-mass)
for all of them. That is a floor: it counts nothing for the coils themselves, the anchors or any margin.

> **Physics:** The barrel's mass does not depend on its length. A longer, gentler barrel pushes with less
> force over more metres, and the fibre comes to the same total: it grows with the Brick's motion energy,
> not with the acceleration.

### Ice Bricks

A Brick is [1 Mt](../numbers.md#brick-mass) of ice, a cube [103 m](../numbers.md#brick-side) on a side,
wrapped in a reflective graphite-fibre sock that keeps sunlight off it as it falls toward the Sun, so it
arrives near [150 K](../numbers.md#brick-temp). Under [200 g](../numbers.md#railhead-accel) a bare Brick
would carry [190 MPa](../numbers.md#brick-launch-stress) at its back face, many times what cold ice can
bear. It rides in a sabot that supports it along its whole length; the sabot stays at the muzzle and is
reused. The Brick itself carries nothing but a laser retroreflector.

### Steering

Across the inner Solar System and a year of flight, the smallest aiming error at the muzzle grows into a
miss of many kilometres. Lattice lasers track each Brick by its retroreflector and steer it by ablation: a
pulse boils a little ice off one face and the vapour pushes the Brick the other way. Each Brick must enter
the air inside its drop zone, beyond [60°](../numbers.md#ice-drop-latitude) of latitude, on the day it was
booked. A Brick that drifts off its track is pushed wide of Venus while it is still far out.

### Power

The [Helios Lattice](helios.md) beams the Railheads their [6.3 × 10¹⁸ W](../numbers.md#railhead-power)
through the whole campaign. Even at the longest range, from the Lattice's outermost orbit to Ceres on the
far side of the Sun, [3.2 AU](../numbers.md#lattice-to-ceres-range), a beam focuses to
[290 m](../numbers.md#ceres-beam-spot).

Catching that power is not the hard part; getting rid of its heat is. The receivers turn
[75%](../numbers.md#helios-receiver-efficiency) of the [8.4 × 10¹⁸ W](../numbers.md#ceres-receiver-incident)
that reaches them into electricity and lose the rest, [2.1 × 10¹⁸ W](../numbers.md#ceres-receiver-loss), as
heat, and the Railheads lose half of what they draw. All told the Ice Train makes
[6.6](../numbers.md#ceres-heat-vs-surface) times more heat at Ceres than Ceres's whole surface could radiate
glowing at [1,500 K](../numbers.md#helios-fin-temp), [8.0 × 10¹⁷ W](../numbers.md#ceres-surface-heat-limit).
Almost none of it can be made on the ground.

> **Physics:** Heat leaves a world in space only as light, and a radiator sheds σT⁴ per square metre and
> no more. Shedding heat takes area, and Ceres is small. The receivers' area is not the binding problem:
> at the Lattice's intensity they would cover only [0.3](../numbers.md#ceres-receiver-surface-ratio) of
> Ceres's surface, but the radiators for their heat need far more than that.

### The Crown

The receivers fly in the Crown, a ring around Ceres's equator at its synchronous orbit,
[1,190 km](../numbers.md#crown-radius) from its centre and only [720 km](../numbers.md#crown-altitude) up,
where an orbit keeps pace with Ceres's [9.074 h](../numbers.md#ceres-rotation-period) day. Ceres spins fast
and pulls weakly, so this orbit is unusually low, and tethers hang from it straight down to the Railheads'
belt, carrying the power in superconducting cables. As Ceres loses mass its synchronous orbit sinks a
little, and the Crown is lowered with it.

The beams arrive at [40 MW/m²](../numbers.md#ceres-receiver-intensity), more intense than at Venus, so the
receivers facing them need only [2.1 × 10¹¹ m²](../numbers.md#ceres-receiver-area). Seen from the Lattice
the Crown is a band twice its radius wide, so the receivers stand in a belt
[88 km](../numbers.md#crown-band-height) tall, north to south. The Crown turns with Ceres: at any moment its
far half faces away and its near half overlaps itself in the beams' view, so it carries
[6.6 × 10¹¹ m²](../numbers.md#crown-receiver-installed) of receivers in all.

Each square metre of receiver hands [10 MW/m²](../numbers.md#ceres-receiver-loss-flux) of heat to its
coolant, no more than the divertor of the ITER fusion reactor is built to carry without pause
([ITER](../sources.md#iter-divertor)). Left to radiate that alone, a receiver would reach
[3,100 K](../numbers.md#ceres-receiver-bare-temp). The coolant carries it instead to fins at
[1,500 K](../numbers.md#helios-fin-temp).

The Crown sheds the Railheads' loss too. Each barrel is superconducting and turns all but
[0.1%](../numbers.md#railhead-barrel-loss) of the power that reaches it into motion, counting the work to
keep its coils cold. The rest of the loss the plan charges, [3.1 × 10¹⁸ W](../numbers.md#railhead-plant-heat),
arises in the Crown, where the receivers' steady output is shaped into the pulses each barrel fires. The
Crown radiates [5.2 × 10¹⁸ W](../numbers.md#crown-heat) from [9.1 × 10¹² m²](../numbers.md#crown-fin-area)
of fins, counting both faces. They spread flat around it in Ceres's equatorial plane, edge-on to the beams,
out to [2,100 km](../numbers.md#crown-fin-radius) from Ceres's centre, held out by its spin. The barrels' own
[6.3 × 10¹⁵ W](../numbers.md#railhead-barrel-heat) is radiated on the ground, from radiators over
[0.79%](../numbers.md#railhead-ground-share) of Ceres's surface. The plan still charges the whole chain at
[50%](../numbers.md#railhead-efficiency); if the rest of it proves as efficient as the barrels must be,
the launches cost less, but the plan does not count on that.

The Crown sits deep in Ceres's grip. Its fins reach [2,100 km](../numbers.md#crown-fin-radius), a small
fraction of Ceres's Hill radius, [220,000 km](../numbers.md#ceres-hill-radius), the distance at which the
Sun's pull starts to win; orbits around a small body stay bound out to about half that
([Hamilton and Burns 1991](../sources.md#hamilton-burns-1991)). Ceres's recoil,
[9.1 × 10⁻⁷ m/s²](../numbers.md#ceres-recoil-accel), is tiny beside its pull even at the fins' edge,
[0.014 m/s²](../numbers.md#crown-edge-gravity). The beams push the Crown away from the Sun with
[2.8 × 10¹⁰ N](../numbers.md#crown-push), and the tethers hold it. Summed from the surface to the Crown,
Ceres's net pull on a tether is only [59 kJ/kg](../numbers.md#crown-tether-load), against the
[3.9 MJ/kg](../numbers.md#carbon-fibre-specific-strength) carbon fibre holds at full strength. Hanging the
[8.1 × 10¹¹ kg](../numbers.md#crown-cable-mass) of cables, which carry the whole draw at
[100 MV](../numbers.md#cable-voltage), and holding the beams' push take
[1.8 × 10¹⁰ kg](../numbers.md#crown-tether-mass) of fibre.

The Crown weighs [3.1 × 10¹² kg](../numbers.md#crown-mass): [1.3 × 10¹² kg](../numbers.md#crown-receiver-mass)
of receivers at [2 kg/m²](../numbers.md#ceres-receiver-areal-density),
[9.1 × 10¹¹ kg](../numbers.md#crown-fin-mass) of fins at [0.1 kg/m²](../numbers.md#ceres-fin-areal-density),
and the cables and tethers. Like the Railheads it is a floor, with nothing counted for the structure that
holds the fins out. Both must be finished by the first launch.

### Ceres factories

The Railheads and the Crown are built on Ceres, from Ceres, by factories that copy themselves the way the
[Ouroboros Foundry](ouroboros.md) does on Mercury. Their seed, [1,000 t](../numbers.md#ceres-seed-mass),
leaves Earth on [1 October 2028](../numbers.md?date=day#ceres-seed-launch), the same day as the Foundry's
and behind the same gate: [Ouroboros-0](../research.md#ouroboros-0) must first have shown its closure on
simulated Ceres rock as well as Mercury's. The cheapest path to Ceres takes
[472 d](../numbers.md#ceres-transfer-days), so the seed lands on
[16 January 2030](../numbers.md?date=day#ceres-landing).

The factories grow to about the mass of what they must build, [6.5 × 10¹³ kg](../numbers.md#ceres-build-mass)
of Railheads and Crown, most of it the Railheads' carbon fibre. That takes
[26](../numbers.md#ceres-doublings) doublings to [6.7 × 10¹³ kg](../numbers.md#ceres-final-mass), on
[31 March 2033](../numbers.md?date=day#ceres-full-scale). The full factories then build everything in
[62 d](../numbers.md#ceres-build-days) and finish on [2 June 2033](../numbers.md?date=day#ceres-ready),
[130 d](../numbers.md#ceres-slack) before the first launch. The seed could leave Earth as late as
[7 February 2029](../numbers.md?date=day#ceres-seed-latest).

That needs Ceres's factories to double every [45 d](../numbers.md#ceres-doubling-days), faster than the
Foundry's [60 d](../numbers.md#foundry-doubling-days). Ceres has what Mercury lacks for a carbon-fibre
industry (carbon, hydrogen and nitrogen) but far less sunlight. At the Foundry's pace the factories would
finish only in [July 2034](../numbers.md?date=month#ceres-ready-foundry-pace), long after the launches must
start. Of everything at Ceres, this is the hardest requirement.

At full scale the factories draw [1.2 × 10¹⁵ W](../numbers.md#ceres-factory-power), more than all the
sunlight Ceres intercepts, [1.2 × 10¹⁴ W](../numbers.md#ceres-sunlight). Mirrors in orbit gather it and
light solar film on the ground: [1.7 × 10¹³ m²](../numbers.md#ceres-mirror-area) of them, as light as the
Lattice's film, weigh only [1.7 × 10¹⁰ kg](../numbers.md#ceres-mirror-mass). Building the factories, the
Railheads and the Crown takes [10²² J](../numbers.md#ceres-hardware-energy), all of it Ceres's own
sunlight, so the [energy budget](../budget.md) does not carry it.

### How much water

[1.0 × 10¹⁸ kg](../numbers.md#ice-mass) is [0.071%](../numbers.md#ice-vs-earth-water) of Earth's water and
[0.39%](../numbers.md#ice-ceres-water-share) of Ceres's, if Ceres is [27%](../numbers.md#ceres-water-fraction)
water. Water is not what limits the seas: Ceres holds far more than the plan takes, even at the low end of
the published range. The heat of the fall is. The new water rains out once the air cools to its dew point, on
[26 November 2034](../numbers.md?date=day#traj-water-rain), freezes when the air cools through freezing, on
[30 June 2035](../numbers.md?date=day#traj-water-frozen), and melts again once the Veil opens, from
[2 September 2036](../numbers.md?date=day#traj-warming).

## Specifications

<!-- table:specs ice-train -->
| Parameter | Value |
| --- | --- |
| Water shipped | [1.0 × 10¹⁸ kg](../numbers.md#ice-mass), [0.39%](../numbers.md#ice-ceres-water-share) of Ceres's water |
| Campaign | [October 2033](../numbers.md#ice-launch-start) to [January 2034](../numbers.md#ice-launch-end) ([0.25 yr](../numbers.md#ice-campaign)) |
| Throughput | [1.29 × 10¹¹ kg/s](../numbers.md#ice-throughput), [129](../numbers.md#ice-bricks-per-second) Bricks a second |
| Railheads | [10,000](../numbers.md#railhead-count), each firing every [78 s](../numbers.md#railhead-interval) |
| Railhead | [15.6 km](../numbers.md#railhead-length) long, [200 g](../numbers.md#railhead-accel), [6.4 km/s](../numbers.md#ice-launch-speed) in [4 s](../numbers.md#railhead-shot-time) |
| Brick | [1 Mt](../numbers.md#brick-mass), a cube [103 m](../numbers.md#brick-side) on a side |
| Energy per shot | [2.05 × 10¹⁶ J](../numbers.md#shot-energy) ([4.1 × 10¹⁶ J](../numbers.md#shot-energy-drawn) drawn at [50%](../numbers.md#railhead-efficiency)) |
| Power | [6.3 × 10¹⁸ W](../numbers.md#railhead-power) in all, [6.3 × 10¹⁴ W](../numbers.md#railhead-power-each) each |
| Transfer | [341 d](../numbers.md#ice-flight-min) to [410 d](../numbers.md#ice-flight-max) ([1.15 yr](../numbers.md#ice-transfer-years) on the Hohmann transfer); arrives at [13.7 km/s](../numbers.md#ice-vinf-rms) relative to Venus on average |
| Arrival | [13 November 2034](../numbers.md?date=day#first-arrival) to [23 January 2035](../numbers.md?date=day#last-arrival), falling at [17.1 km/s](../numbers.md#ice-entry-speed) into the air beyond [60°](../numbers.md#ice-drop-latitude) of latitude |
| Entry heat | [147 MJ/kg](../numbers.md#ice-entry-energy-per-kg), [1.5 × 10²⁶ J](../numbers.md#ice-entry-heat) in all, [28%](../numbers.md#ice-entry-vs-atmosphere) of the atmosphere's heat; the pumps lift it with the rest |
| Launch windows | Every [8.5 months](../numbers.md#launch-window-period), about [0.35](../numbers.md#launch-windows) in the campaign |
| Launches between windows | Up to [50%](../numbers.md#launch-offwindow-max) more energy than in a window, [19%](../numbers.md#launch-offwindow-mean) more on average |
| Railhead mass | At least [6.1 × 10⁹ kg](../numbers.md#railhead-mass) each, [6.1 × 10¹³ kg](../numbers.md#railheads-mass) in all: carbon fibre holding [11 T](../numbers.md#railhead-field) coils |
| The Crown | Receivers at [40 MW/m²](../numbers.md#ceres-receiver-intensity) on a ring [720 km](../numbers.md#crown-altitude) up, at Ceres's synchronous orbit; [9.1 × 10¹² m²](../numbers.md#crown-fin-area) of fins shed [5.2 × 10¹⁸ W](../numbers.md#crown-heat); [3.1 × 10¹² kg](../numbers.md#crown-mass) |
| Heat left on Ceres | [6.3 × 10¹⁵ W](../numbers.md#railhead-barrel-heat) from the barrels, radiators over [0.79%](../numbers.md#railhead-ground-share) of the surface |
| Ceres factories | A [1,000 t](../numbers.md#ceres-seed-mass) seed leaves Earth [1 October 2028](../numbers.md?date=day#ceres-seed-launch) and doubles every [45 d](../numbers.md#ceres-doubling-days) to [6.7 × 10¹³ kg](../numbers.md#ceres-final-mass); Railheads and Crown finished [2 June 2033](../numbers.md?date=day#ceres-ready), [130 d](../numbers.md#ceres-slack) before the first launch |
| Ceres's recoil | [0.0071 km/s](../numbers.md#ceres-recoil); its aphelion moves to [2.77 AU](../numbers.md#ceres-new-aphelion), [6.1](../numbers.md#ceres-jupiter-gap-hill) of Jupiter's Hill radii inside Jupiter's perihelion |
<!-- /table -->

## What is invented

> **Invented:** Coilguns [15.6 km](../numbers.md#railhead-length) long that throw
> [1 Mt](../numbers.md#brick-mass) blocks of ice at [200 g](../numbers.md#railhead-accel), every minute or
> so each, for [90 d](../numbers.md#ice-campaign-days) without stopping.

> **Invented:** Turning electricity into motion at [50%](../numbers.md#railhead-efficiency) at a total
> throughput of [1.29 × 10¹¹ kg/s](../numbers.md#ice-throughput).

> **Invented:** Steering unpowered Bricks by laser ablation so that each enters the air inside its drop
> zone at the far end of a fall of about a year.

> **Invented:** Superconducting barrels that lose only [0.1%](../numbers.md#railhead-barrel-loss) of their
> power as heat, and receivers that take [40 MW/m²](../numbers.md#ceres-receiver-intensity) and pass their
> heat to fins at [1,500 K](../numbers.md#helios-fin-temp) weighing [0.1 kg/m²](../numbers.md#ceres-fin-areal-density).

> **Invented:** Factories on Ceres that copy themselves every [45 d](../numbers.md#ceres-doubling-days),
> faster than the Foundry on Mercury.

> **Precedent:** The heat each square metre of Ceres's receivers hands to its coolant,
> [10 MW/m²](../numbers.md#ceres-receiver-loss-flux), is what ITER's divertor is built to carry
> ([ITER](../sources.md#iter-divertor)).

> **Precedent:** Ceres's density implies it is up to [27%](../numbers.md#ceres-water-fraction) water by
> mass ([McCord and Sotin 2005](../sources.md#ceres-water)); the Dawn spacecraft measured that density from
> orbit ([Park et al. 2016](../sources.md#park-2016-ceres)).

> **Precedent:** Importing water to Venus is an old idea: Birch's 1991 plan brought it from an icy moon
> ([Birch 1991](../sources.md#birch-1991)).

> **Physics:** The transfer, the windows, the heat of the fall, the recoil and the clearance from Jupiter
> are textbook orbital mechanics. They follow from the masses and orbits of the Sun, Ceres, Venus and
> Jupiter and nothing else; the planets' places on the campaign's dates come from their measured orbits.

## Build sequence

- **[2028](../numbers.md?date=year#experiments-end):** The Railhead experiment must throw ice from a
  coilgun on Earth by the end of the year. Its pass and kill marks are on the
  [Research Agenda](../research.md); a kill signal stops this line of work.
- **[1 October 2028](../numbers.md?date=day#ceres-seed-launch):** The Ceres seed leaves Earth with the
  Foundry's, once Ouroboros-0 has shown its closure.
- **[January 2030](../numbers.md?date=month#ceres-landing):** The seed lands on Ceres and starts copying
  itself, doubling every [45 d](../numbers.md#ceres-doubling-days).
- **[March 2033](../numbers.md?date=month#ceres-full-scale):** The factories reach full scale and turn to the
  Railheads and the Crown.
- **[June 2033](../numbers.md?date=month#ceres-ready):** The Railheads and the Crown are finished,
  [130 d](../numbers.md#ceres-slack) before the first launch.
- **[9 October 2033](../numbers.md?date=day#ice-launch-start):** The Lattice reaches full power and the
  first Bricks leave Ceres, [7.9 d](../numbers.md#ice-window-wait) before a Hohmann window. The Brick
  works, which quarry, cut and wrap the ice, are not counted in the factories' work.
- **[7 January 2034](../numbers.md?date=day#ice-launch-end):** The last Bricks leave. The Lattice's beams
  turn to Venus, where cooling begins on [23 February 2034](../numbers.md?date=day#cooling-start).
- **[13 November 2034](../numbers.md?date=day#first-arrival):** The first Bricks fall into the polar air.
- **[26 November 2034](../numbers.md?date=day#traj-water-rain):** The air reaches its dew point and the
  new water rains out.
- **[23 January 2035](../numbers.md?date=day#last-arrival):** The last Bricks arrive.
- **[June 2035](../numbers.md?date=month#traj-water-frozen):** The air cools through freezing and the seas
  freeze, to melt again once the Veil opens.

## Failure modes and safeguards

- **A Brick strays from its drop zone.** Each one bursts with
  [1.5 × 10¹⁷ J](../numbers.md#brick-entry-energy), so one that fell on the canopies would wreck them.
  Lattice lasers steer every Brick in flight; one off its track is pushed wide of Venus while it is still
  far out, and goes back into solar orbit.
- **A Brick breaks up at launch.** The pieces follow the same transfer to the same drop zone, and smaller
  pieces stop higher in the air. Their heat is the same.
- **More water, more heat.** The pumps lift the Bricks' heat with the rest of Venus's. Twice the ice
  would leave the caps unfinished at the deadline ([check](../numbers.md#check-frost-before-sealing)).
- **The Foundry runs slow.** The first launch waits for the Lattice's full power, so a slower Foundry moves
  the whole campaign later, and with it where Ceres and Venus are on its dates. A start far from a window
  costs more launch energy and brings faster, hotter Bricks.
- **Ceres's factories run slow.** They finish with [130 d](../numbers.md#ceres-slack) to spare. At the
  Foundry's doubling time they would finish in [July 2034](../numbers.md?date=month#ceres-ready-foundry-pace),
  long after the launches must start.
- **Railheads fail.** [10,000](../numbers.md#railhead-count) independent coilguns degrade gracefully: losing
  some lowers the rate, not the whole campaign.
- **Ceres has less water than assumed.** The plan takes [0.39%](../numbers.md#ice-ceres-water-share) of
  Ceres's water at the top of the estimates, so even the low end leaves plenty.
- **Ceres's orbit.** The change is small but permanent and needs international agreement before the first
  shot. The model checks that the new orbit stays clear of Jupiter but does not follow resonances.
- **Weapons.** A coilgun that can hit a drop zone at Venus can hit anything. The safeguards are open
  telemetry, inspection and treaty oversight ([Risks and Governance](../risks.md)).

## Reproduce these numbers

The Ice Train's numbers come from [calc/src/model/ice.ts](../../calc/src/model/ice.ts), with the dated
launch schedule in [calc/src/physics.ts](../../calc/src/physics.ts) (`campaignSchedule`); the Railheads'
mass, the Crown, the Ceres factories and the check against Jupiter come from
[calc/src/model/ceres.ts](../../calc/src/model/ceres.ts), and the Bricks' heat in the air from the
day-by-day simulation in [calc/src/model/trajectory.ts](../../calc/src/model/trajectory.ts).

```sh
pnpm calc --only ice-departure-dv        # the Hohmann kick from Ceres
pnpm calc --only ice-launch-lead         # where Venus is against Ceres on the first launch day
pnpm calc --only launch-offwindow-mean   # what the campaign's dates add to the launch energy
pnpm calc --only ice-entry-energy-per-kg # the heat each kilogram brings into the air
pnpm calc --only ocean-entry-vs-atmosphere  # why Venus cannot have Earth's oceans this way
pnpm calc --only crown-heat              # the heat the Crown radiates
pnpm calc --only ceres-ready             # when the Railheads and the Crown are finished
```

In the [Explorer](https://phosphoros.space/explore), raise the water shipped (`ice-mass`): the seas
deepen, the Bricks' heat grows with them, and the Frost Towers finish later until they miss the caps.
Lengthen the campaign (`ice-campaign-days`) and the later launches drift further from the window, cost
more and arrive faster, into colder air; far enough and their heat lands while the seas freeze, and the
Frost Towers miss the caps. Weigh arrival speed (`ice-arrival-weight`) and the Bricks arrive slower and
spread out, the air warms back less, and the Frost Towers' margin shrinks a little. Slow Ceres's
factories (`ceres-doubling-days`) and the launches wait for them, far from the window: at `55` the
launches start in March 2034, cost about a fifth more, and the Frost Towers miss the caps and the
seeded life misses the deadline. Shorten the
campaign far enough and the Railheads need more than the Lattice delivers
([check](../numbers.md#check-railheads-within-lattice)). Slow the [Ouroboros Foundry](ouroboros.md) by even
a few days a doubling (`foundry-doubling-days`) and the Lattice, and with it the first launch, comes
months later, after the window has passed: every Brick costs more and arrives faster, and the Frost
Towers miss the caps. If the factories and the first launch never meet,
the check `ceres-ready-in-time` fails.
