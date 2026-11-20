# Ceres Ice Train

[10,000](../numbers.md#railhead-count) coilguns on Ceres throw [1,360](../numbers.md#ice-bricks-per-second)
blocks of ice a second toward Venus, each [1 Mt](../numbers.md#brick-mass), until
[1.0 × 10²⁰ kg](../numbers.md#ice-mass) of water is on its way: enough for a
[217 m](../numbers.md#ocean-depth) global ocean. Each Brick leaves at
[6.4 km/s](../numbers.md#ice-launch-speed), falls toward the Sun for
[1.15 yr](../numbers.md#ice-transfer-years) and is caught by the [Braking Ring](ring.md). Launches run
from [June 2033](../numbers.md?date=month#ice-launch-start) to
[October 2035](../numbers.md?date=month#ice-launch-end).

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

On the way in, the Sun's gravity speeds the ice up. It reaches Venus's orbit moving faster than Venus
itself, by [9.08 km/s](../numbers.md#ice-vinf), and overtakes the planet from behind. Venus's gravity then
pulls it in: at the Ring's height it is moving at [13.5 km/s](../numbers.md#ring-arrival-speed).

### Launch windows

A Brick arrives at Venus's orbit [1.15 yr](../numbers.md#ice-transfer-years) after it leaves, and Venus
must be there to meet it. That needs the two planets at the right angle at launch, an alignment that comes
round once every synodic period, [8.5 months](../numbers.md#launch-window-period): about
[3.3](../numbers.md#launch-windows) windows in the campaign.

The Railheads fire all the time anyway, because the Lattice's power is steady and the deadline is fixed.
Shots between windows need faster orbits, timed to meet Venus, and they cost more energy. The model finds
the cheapest such orbit for every moment of the cycle, trying every transfer angle (Lambert's problem, on
the same circular, flat orbits as the Hohmann transfer). At the worst moment a shot costs
[46%](../numbers.md#launch-offwindow-max) more than one in a window; fired steadily through the whole cycle,
[16%](../numbers.md#launch-offwindow-mean) more on average. The budget charges that average:
[6.7 × 10²⁶ J](../numbers.md#ice-launch-offwindow-energy) more than every shot in a window would cost, enough
on its own to tip the Lattice-only budget into deficit ([open problem](../budget.md#physics-checks)). Faster
arrivals also bring more energy for the Ring to recover; the model does not count that, so its recovered
energy is a floor.

### Energy per kilogram

A Railhead turns electricity into motion at [50%](../numbers.md#railhead-efficiency), so each kilogram
launched in a window draws [41 MJ/kg](../numbers.md#launch-energy-per-kg), half of which leaves with the ice
as motion. One Brick fired in a window carries [2.05 × 10¹⁶ J](../numbers.md#shot-energy) and draws
[4.1 × 10¹⁶ J](../numbers.md#shot-energy-drawn). Averaged over shots between windows, each kilogram draws
[47.7 MJ/kg](../numbers.md#launch-energy-per-kg-avg). Launching all the water takes
[4.8 × 10²⁷ J](../numbers.md#ice-launch-energy), the largest single item in the
[energy budget](../budget.md), and the Railheads together draw [6.5 × 10¹⁹ W](../numbers.md#railhead-power).

### Why the Ring gets back more than the Railheads spend

The [Braking Ring](ring.md) recovers [53 MJ/kg](../numbers.md#ring-recovered-per-kg) of electricity from
each kilogram it catches: [1.3](../numbers.md#ring-vs-launch) times the
[41 MJ/kg](../numbers.md#launch-energy-per-kg) a Railhead draws to launch it in a window, and more than the
[47.7 MJ/kg](../numbers.md#launch-energy-per-kg-avg) it draws on average. Nothing is free here. The
ice falls from Ceres's orbit down the Sun's gravity well to Venus's, then into Venus's own well. Between
launch and catch, gravity adds [4.3 × 10²⁷ J](../numbers.md#ice-solar-gain) to its motion, more than the
Railheads put in. Neither well alone would be enough: the Sun's gives the arrival speed, Venus's pull to
the Ring's height adds the rest.

> **Physics:** Energy is conserved. The ice ends far deeper in the Sun's gravity well than it began, and
> the Ring collects only a small part of what that fall releases. The rest goes into Ceres's orbit, pushed
> outward by the recoil, and into Venus's, nudged forward as the Ring stops ice that overtakes it.

That surplus is why the Ice Train runs on its own catch from
[August 2034](../numbers.md?date=month#ring-pays-from). How the energy gets back to Ceres is in
[the Ring's energy loop](ring.md#the-energy-loop).

### Ceres pays in orbit

Throwing [11%](../numbers.md#ice-ceres-mass-share) of Ceres's mass backward pushes Ceres forward, the way
a gun recoils. Summed over the campaign its speed rises by [0.76 km/s](../numbers.md#ceres-recoil). The
model treats Ceres's slightly oval orbit (it already swings out to [2.98 AU](../numbers.md#ceres-aphelion))
as a circle at its average distance, and the push as a single kick. On those terms the circle becomes an
ellipse, still [2.77 AU](../numbers.md#ceres-orbit) from the Sun at its nearest and
[3.29 AU](../numbers.md#ceres-new-aphelion) at its farthest. Spread over the campaign, about half of
Ceres's year, the same push raises Ceres's average distance by about as much but leaves the orbit rounder.
Either way Ceres moves away from Earth, never toward it, and the change is permanent.

## Design

### Railheads

Each Railhead is a coilgun [10.4 km](../numbers.md#railhead-length) long that accelerates a Brick at
[200 g](../numbers.md#railhead-accel) to [6.4 km/s](../numbers.md#ice-launch-speed) in
[3.3 s](../numbers.md#railhead-shot-time), then fires again [7.4 s](../numbers.md#railhead-interval) later
on average. It draws [6.5 × 10¹⁵ W](../numbers.md#railhead-power-each) and stores energy between shots,
so the power in the barrel during a shot is higher still.

Every shot kicks the Railhead back as hard as it pushes the Brick forward. The coilguns are anchored in
Ceres's rock, which takes the recoil; summed over a hundred billion Bricks, that recoil is what moves
Ceres's orbit. Ceres also spins, so a Railhead fixed in its rock points the right way only part of the
time. The Railheads are spread around Ceres and steered so that some always face backward along its
orbit; the model's firing interval is an average over all of them.

### Ice Bricks

A Brick is [1 Mt](../numbers.md#brick-mass) of ice, a cube [103 m](../numbers.md#brick-side) on a side,
wrapped in a reflective graphite-fibre sock that keeps sunlight off it as it falls toward the Sun, so it
arrives near [150 K](../numbers.md#brick-temp). Under [200 g](../numbers.md#railhead-accel) a bare Brick
would carry [190 MPa](../numbers.md#brick-launch-stress) at its back face, many times what cold ice can
bear. It rides in a sabot that supports it along its whole length; the sabot stays at the muzzle and is
reused. The Brick itself carries nothing but a laser retroreflector.

### Steering

Across the inner Solar System and more than a year of flight, the smallest aiming error at the muzzle
grows into a miss of many kilometres. Lattice lasers track each Brick by its retroreflector and steer it
by ablation: a pulse boils a little ice off one face and the vapour pushes the Brick the other way. Each
Brick must meet its catcher track at the Ring's height, on time, on the side of Venus it was assigned (see
[catching](ring.md#catching)).

### Power

Until the first catch the [Helios Lattice](helios.md) beams the Railheads their
[6.5 × 10¹⁹ W](../numbers.md#railhead-power). Even at the plan's longest beam range,
[3.5 AU](../numbers.md#ring-to-ceres-range), a beam focuses to [140 m](../numbers.md#ceres-beam-spot).
Receiving that much power is a design problem of its own. At the Lattice's receiver intensity of
[10 MW/m²](../numbers.md#helios-receiver-intensity), the receivers would need more area than Ceres's
whole surface, so they must fly in space around Ceres and send power down by cable, or run at higher
intensity. The model sizes the Lattice's receivers in total, not Ceres's share.

From [August 2034](../numbers.md?date=month#first-catch) the Ring's recovered electricity powers Venus's
systems, so the Lattice's beams can stay on Ceres. In energy terms the Ice Train then pays for itself.

### How much water

[1.0 × 10²⁰ kg](../numbers.md#ice-mass) is [7.1%](../numbers.md#ice-vs-earth-water) of Earth's water and
[39%](../numbers.md#ice-ceres-water-share) of Ceres's, if Ceres is [27%](../numbers.md#ceres-water-fraction)
water. That is the top of the published range. At the low end the same ocean would take most of Ceres's
water, and comets from the outer belt become the fallback.

## Specifications

<!-- table:specs ice-train -->
| Parameter | Value |
| --- | --- |
| Water shipped | [1.0 × 10²⁰ kg](../numbers.md#ice-mass), [39%](../numbers.md#ice-ceres-water-share) of Ceres's water |
| Campaign | [June 2033](../numbers.md#ice-launch-start) to [October 2035](../numbers.md#ice-launch-end) ([2.3 yr](../numbers.md#ice-campaign)) |
| Throughput | [1.36 × 10¹² kg/s](../numbers.md#ice-throughput), [1,360](../numbers.md#ice-bricks-per-second) Bricks a second |
| Railheads | [10,000](../numbers.md#railhead-count), each firing every [7.4 s](../numbers.md#railhead-interval) |
| Railhead | [10.4 km](../numbers.md#railhead-length) long, [200 g](../numbers.md#railhead-accel), [6.4 km/s](../numbers.md#ice-launch-speed) in [3.3 s](../numbers.md#railhead-shot-time) |
| Brick | [1 Mt](../numbers.md#brick-mass), a cube [103 m](../numbers.md#brick-side) on a side |
| Energy per shot | [2.05 × 10¹⁶ J](../numbers.md#shot-energy) ([4.1 × 10¹⁶ J](../numbers.md#shot-energy-drawn) drawn at [50%](../numbers.md#railhead-efficiency)) |
| Power | [6.5 × 10¹⁹ W](../numbers.md#railhead-power) in all, [6.5 × 10¹⁵ W](../numbers.md#railhead-power-each) each |
| Transfer | [1.15 yr](../numbers.md#ice-transfer-years); arrives at [9.08 km/s](../numbers.md#ice-vinf) relative to Venus |
| Launch windows | Every [8.5 months](../numbers.md#launch-window-period), about [3.3](../numbers.md#launch-windows) in the campaign |
| Ceres's recoil | [0.76 km/s](../numbers.md#ceres-recoil); its aphelion moves to [3.29 AU](../numbers.md#ceres-new-aphelion) |
<!-- /table -->

## What is invented

> **Invented:** Coilguns [10.4 km](../numbers.md#railhead-length) long that throw
> [1 Mt](../numbers.md#brick-mass) blocks of ice at [200 g](../numbers.md#railhead-accel), every few
> seconds, for [2.3 yr](../numbers.md#ice-campaign) without stopping.

> **Invented:** Turning electricity into motion at [50%](../numbers.md#railhead-efficiency) at a total
> throughput of [1.36 × 10¹² kg/s](../numbers.md#ice-throughput).

> **Invented:** Steering unpowered Bricks by laser ablation so that each meets a moving track at the far
> end of a fall of more than a year.

> **Precedent:** Ceres's density implies it is up to [27%](../numbers.md#ceres-water-fraction) water by
> mass ([McCord and Sotin 2005](../sources.md#ceres-water)); the Dawn spacecraft measured that density from
> orbit ([Park et al. 2016](../sources.md#park-2016-ceres)).

> **Precedent:** Importing water to Venus is an old idea: Birch's 1991 plan brought it from an icy moon
> ([Birch 1991](../sources.md#birch-1991)).

> **Physics:** The transfer, the windows and the recoil are textbook orbital mechanics. They follow from
> the masses and orbits of the Sun, Ceres and Venus and nothing else.

## Build sequence

- **[2028](../numbers.md?date=year#experiments-end):** The Railhead experiment must throw ice from a
  coilgun on Earth by the end of the year. Its pass and kill marks are on the
  [Research Agenda](../research.md); a kill signal stops this line of work.
- **[June 2033](../numbers.md?date=month#ice-launch-start):** The Lattice reaches full power and the first
  Bricks leave Ceres. The Railheads, their receivers and the Brick works must be finished by now. The model
  does not yet schedule their construction on Ceres or count their mass: an open gap.
- **[August 2034](../numbers.md?date=month#first-catch):** The first Bricks reach Venus and the Ring starts
  catching. From now the Ring's electricity powers Venus and the Lattice's beams stay on Ceres.
- **[October 2035](../numbers.md?date=month#ice-launch-end):** The last Bricks leave. Ice launched later
  could not arrive and be lowered before the deadline.
- **[December 2036](../numbers.md?date=month#last-arrival):** The last Bricks reach the Ring,
  [16 d](../numbers.md#ice-lowering-margin) before the deadline.

## Failure modes and safeguards

- **A Brick misses its track.** Every approach skims the Ring's height, above the air, so a missed Brick
  swings past Venus instead of hitting it. It goes back into solar orbit, where Lattice lasers can steer it
  for a later return.
- **A Brick breaks up at launch.** The pieces follow the same transfer orbit to the same catch, so the
  Ring must handle rubble as well as whole Bricks.
- **The Foundry runs slow.** The first launch waits for the Lattice's full power, so every day the Foundry
  loses comes straight out of the campaign. The Railheads must then fire harder, or less water arrives.
- **Railheads fail.** [10,000](../numbers.md#railhead-count) independent coilguns degrade gracefully: losing
  some lowers the rate, not the whole campaign.
- **Ceres has less water than assumed.** The ocean then takes a larger share of Ceres's water; comets from
  the outer belt are the fallback.
- **Ceres's orbit.** The change is permanent and needs international agreement before the first shot. The
  model does not yet check the new orbit's long-term stability against Jupiter's pull.
- **Weapons.** A coilgun that can hit a track at Venus can hit anything. The safeguards are open
  telemetry, inspection and treaty oversight ([Risks and Governance](../risks.md)).

## Reproduce these numbers

The Ice Train's numbers come from [calc/src/model/ice.ts](../../calc/src/model/ice.ts); the energy gravity
adds is in [calc/src/model/budget.ts](../../calc/src/model/budget.ts) and the catch in
[calc/src/model/ring.ts](../../calc/src/model/ring.ts).

```sh
pnpm calc --only ice-departure-dv       # the Hohmann kick from Ceres
pnpm calc --only launch-energy-per-kg   # electricity drawn per kilogram launched
pnpm calc --only ice-solar-gain         # what gravity adds between launch and catch
pnpm calc --only ceres-new-aphelion     # Ceres's new orbit
```

In the [Explorer](https://phosphoros.space/explore), lower the water shipped (`ice-mass`): the ocean
gets shallower, Ceres's recoil and the Railheads' power fall with it, and so does the Ring's catch. Move
Ceres's water share (`ceres-water-fraction`) to the low end of its range and the same ocean takes most of
Ceres's water. Slow the Foundry (`foundry-doubling-days`): launches start later and the campaign shortens.
A few days more per doubling is enough to push the simulated Earth-like date past the deadline.
