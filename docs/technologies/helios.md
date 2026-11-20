# Helios Lattice

[1.0 × 10⁷](../numbers.md#helios-petals) film Petals orbiting near Mercury turn sunlight into laser beams and
deliver [7.0 × 10¹⁹ W](../numbers.md#helios-power) from [June 2033](../numbers.md?date=month#helios-full-power),
[1.8 × 10⁻⁵%](../numbers.md#helios-sun-share) of the Sun's output. By the deadline that is
[7.8 × 10²⁷ J](../numbers.md#helios-supply), the energy the whole plan runs on. Water and cooling take
[98%](../numbers.md#budget-launch-share) of it.

<!-- figure:energy-sankey -->
![Energy flows of the Phosphoros campaign, to the deadline](../../figures/svg/energy-sankey.svg)
<!-- /figure -->

## Principle

Venus cannot cool itself fast enough, and nothing on Venus can pay for the pumping. The energy has to come
from outside, and the cheapest outside energy in the inner Solar System is sunlight close to the Sun, where
the Foundry already is. Near Mercury, sunlight carries [9,080 W/m²](../numbers.md#mercury-sunlight), against
[2,601 W/m²](../numbers.md#venus-sunlight) at Venus.

The Lattice converts that sunlight three times, and each step costs:

- **Film:** sunlight to electricity at [40%](../numbers.md#helios-film-efficiency).
- **Laser:** electricity to a coherent beam at [50%](../numbers.md#helios-laser-efficiency).
- **Receiver:** beam back to electricity at [75%](../numbers.md#helios-receiver-efficiency).

End to end, [15%](../numbers.md#helios-efficiency) of the sunlight a Petal catches arrives as electricity at
Venus. Delivering [7.0 × 10¹⁹ W](../numbers.md#helios-power) therefore takes `A = P / (S η)`:
[5.1 × 10¹⁶ m²](../numbers.md#helios-area) of film, [5.1 × 10¹³ kg](../numbers.md#helios-mass) at
[1 g/m²](../numbers.md#helios-areal-density).

**Why lasers.** A beam spreads by diffraction at an angle of about its wavelength over its aperture. From a
phase-locked aperture [10 km](../numbers.md#helios-aperture) wide at
[1.06 µm](../numbers.md?sig=3#helios-wavelength), the spot is `2.44 λ L / D`: only
[43 m](../numbers.md#helios-spot) wide at the longest Mercury-to-Venus range,
[1.1 AU](../numbers.md#helios-range). A receiver of modest size catches all of it. The same technology on the
[Braking Ring](ring.md) beams power out to Ceres, where the spot is [140 m](../numbers.md#ceres-beam-spot) at
[3.5 AU](../numbers.md#ring-to-ceres-range).

## Design

**The Petal.** A square of film [70 km](../numbers.md#helios-petal-side) on a side,
[4,900 km²](../numbers.md#helios-petal-area) and [4,900 t](../numbers.md#helios-petal-mass), held flat by spin
and edge tension. Solar cells cover one face and a grid of laser emitters covers the other. The film runs hot,
about [460 K](../numbers.md#helios-film-temp), because it sheds the sunlight it does not convert from both
faces; it has to keep its efficiency at that temperature. Petals fly in circular orbits around Mercury's
distance from the Sun, at many inclinations, so that none shades another.

**The beam.** Millions of emitters across a Petal lock their phase so that a patch
[10 km](../numbers.md#helios-aperture) wide acts as one aperture. Steering is electronic: shift the phases and
the beam moves. A Petal can serve any customer it can see.

**The receivers.** At Venus the beams land on receivers above the air, on the Braking Ring, at
[10 MW/m²](../numbers.md#helios-receiver-intensity). They take in
[9.3 × 10¹⁹ W](../numbers.md#helios-receiver-incident) across [9.3 × 10¹² m²](../numbers.md#helios-receiver-area)
and lose a quarter of it, [2.3 × 10¹⁹ W](../numbers.md#helios-receiver-loss), as heat. That heat is radiated to
space from fins at [1,500 K](../numbers.md#helios-fin-temp), [4.1 × 10¹³ m²](../numbers.md#helios-fin-area) of
them counting both faces, and never enters Venus. Until the Ring is complete in
[December 2033](../numbers.md?date=month#ring-complete), receivers ride on the Exhaust canopies with their fins
facing space above the thin upper air. (The day-by-day simulation treats all receiver loss as radiated
straight to space.)

**Growing with the Foundry.** The Lattice is the product of the Foundry's last doublings, so it reaches full
power when the [Ouroboros Foundry](ouroboros.md) reaches full scale. The first Petals fly in
[June 2030](../numbers.md?date=month#helios-first-petals); the simulation lets the Lattice's output grow in
proportion to the Foundry's mass until then.

**The customers.** Three users share the output, and the order matters:

1. **The Ceres Railheads** draw [5.6 × 10¹⁹ W](../numbers.md#railhead-power) from the first launch in
   [June 2033](../numbers.md?date=month#ice-launch-start) until the Ring starts recovering energy from the
   arriving ice in [August 2034](../numbers.md?date=month#ring-pays-from) and takes them over.
2. **The Photonic Exhaust** gets the rest, and after August 2034 nearly all of it.
3. **The Graphite Forges** take [4.8 × 10¹⁷ W](../numbers.md#forge-power) from
   [January 2035](../numbers.md?date=month#forge-start).

<!-- table:budget -->
| Task | Energy the Lattice delivers |
| --- | --- |
| Launch 10²⁰ kg of ice from Ceres | [4.1 × 10²⁷ J](../numbers.md#ice-launch-energy) |
| Heat-pump work to cool Venus | [3.5 × 10²⁷ J](../numbers.md#traj-pump-energy) |
| Warm the air and melt the last ice | [3.8 × 10²⁵ J](../numbers.md#traj-warm-energy) |
| Forge 0.25 bar of oxygen | [2.7 × 10²⁵ J](../numbers.md#forge-energy) |
| Build all hardware | [10²² J](../numbers.md#hardware-energy) |
| **Total demand** | **[7.7 × 10²⁷ J](../numbers.md#budget-demand)** |
| Supply: the Lattice from full power to the deadline | [7.8 × 10²⁷ J](../numbers.md#helios-supply) |
| Spare | [1.7%](../numbers.md#budget-spare) |
| Spare once the Ring powers the Railheads | [28%](../numbers.md#budget-spare-with-ring) |
<!-- /table -->

The Lattice alone covers the demand with [1.7%](../numbers.md#budget-spare) to spare. Counting the Ring's
recovered energy, which pays for most of the launches, the spare is
[28%](../numbers.md#budget-spare-with-ring). The [budget](../budget.md#the-energy-budget) walks through each
line.

<!-- figure:lattice-budget -->
![Energy the Helios Lattice must deliver, against its supply](../../figures/svg/lattice-budget.svg)
<!-- /figure -->

## Specifications

<!-- table:specs helios -->
| Parameter | Value |
| --- | --- |
| Sunlight near Mercury | [9,080 W/m²](../numbers.md#mercury-sunlight) |
| End-to-end efficiency | [40%](../numbers.md#helios-film-efficiency) film × [50%](../numbers.md#helios-laser-efficiency) laser × [75%](../numbers.md#helios-receiver-efficiency) receiver = [15%](../numbers.md#helios-efficiency) |
| Petals | [1.0 × 10⁷](../numbers.md#helios-petals), each [70 km](../numbers.md#helios-petal-side) square and [4,900 t](../numbers.md#helios-petal-mass) |
| Film area | [5.1 × 10¹⁶ m²](../numbers.md#helios-area) |
| Mass | [5.1 × 10¹³ kg](../numbers.md#helios-mass) |
| Delivered power | [7.0 × 10¹⁹ W](../numbers.md#helios-power), from [June 2033](../numbers.md#helios-full-power) |
| Energy delivered by the deadline | [7.8 × 10²⁷ J](../numbers.md#helios-supply) |
| Beam spot at Venus | [43 m](../numbers.md#helios-spot) wide from a [10 km](../numbers.md#helios-aperture) aperture at [1.1 AU](../numbers.md#helios-range) |
| Receiver intensity | [10 MW/m²](../numbers.md#helios-receiver-intensity), actively cooled |
| Receiver loss | [2.3 × 10¹⁹ W](../numbers.md#helios-receiver-loss), radiated from [1,500 K](../numbers.md#helios-fin-temp) fins to space |
<!-- /table -->

## What is invented

> **Invented:** Hot-carrier tandem film that keeps [40%](../numbers.md#helios-film-efficiency) efficiency at
> about [460 K](../numbers.md#helios-film-temp), made in bulk at [1 g/m²](../numbers.md#helios-areal-density).

> **Invented:** Phase-locked emitter grids that act as [10 km](../numbers.md#helios-aperture) virtual
> apertures, converting electricity to light at [50%](../numbers.md#helios-laser-efficiency).

> **Invented:** Receivers that turn [10 MW/m²](../numbers.md#helios-receiver-intensity) of laser light into
> electricity at [75%](../numbers.md#helios-receiver-efficiency), cooled by fins at
> [1,500 K](../numbers.md#helios-fin-temp).

> **Precedent:** The beam's wavelength, [1.06 µm](../numbers.md?sig=3#helios-wavelength), is the neodymium
> laser line, in industrial use for decades. Nothing else about the Lattice has been done at any scale close to
> this; no precedent is cited. The [Lightpipe](../research.md#lightpipe) experiment is the first step.

## Build sequence

- **[2027](../numbers.md?date=year#program-start):** [Lightpipe](../research.md#lightpipe) begins: power beamed
  between two satellites with phase lock across many emitters. It gates the design.
- **[June 2030](../numbers.md?date=month#helios-first-petals):** The first Petals fly, built from the Foundry's
  film lines.
- **[January 2033](../numbers.md?date=month#cooling-start):** Active cooling begins. The Lattice is still
  growing, and everything it delivers goes to the Exhaust.
- **[March 2033](../numbers.md?date=month#helios-affordable):** The Foundry can build the whole Lattice in one
  doubling.
- **[22 June 2033](../numbers.md?date=day#helios-full-power):** Full power,
  [7.0 × 10¹⁹ W](../numbers.md#helios-power). The Ceres Railheads start firing and take most of it.
- **[17 August 2034](../numbers.md?date=day#ring-pays-from):** The first Bricks reach Venus and the Ring powers
  the Railheads from then on. The Lattice turns almost entirely to cooling.
- **[January 2035](../numbers.md?date=month#forge-start):** The Forges start drawing power.
- **[31 December 2036](../numbers.md?date=day#deadline):** The deadline. From full power to here the Lattice has
  delivered [7.8 × 10²⁷ J](../numbers.md#helios-supply) over [3.5 yr](../numbers.md#helios-supply-years). It stays
  on afterwards: cooling the cryo-continent floors is a permanent job.

## Failure modes and safeguards

- **A beam on the wrong target.** Each beam carries a share of [7.0 × 10¹⁹ W](../numbers.md#helios-power). A
  Petal fires only while its receiver returns a live, signed handshake, and defocuses within
  [1 ms](../numbers.md#beam-defocus-time) if the handshake drops. No beam path passes within
  [0.01 AU](../numbers.md#beam-keep-out) of Earth or of any crewed craft.
- **Light already in flight.** A beam takes [2.8 min](../numbers.md#delay-mercury-venus-min) to
  [9.2 min](../numbers.md#delay-mercury-venus-max) to cross from Mercury to Venus. Cutting it at the Petal does
  not recall what is on its way. Aim is therefore planned from predicted positions, and the keep-out zone is set
  wide enough that the light in transit is harmless if the receiver moves.
- **Lost phase lock.** An array that loses phase lock cannot focus. Its emitters spread their light over a wide
  cone, so the failure is safe by physics, not by software.
- **Lost Petals.** There are [1.0 × 10⁷](../numbers.md#helios-petals) of them, each independent. Losing one costs
  a ten-millionth of the output.
- **Geometry.** A Petal whose line to Venus crosses the [Hesperus Veil](veil.md) hands its customers to another
  Petal. Only Petals that sit almost in front of the Sun, as seen from Venus, are affected.
- **A thin margin.** From the Lattice alone the budget closes with only [1.7%](../numbers.md#budget-spare) to
  spare, and the model charges the heat pumps the least work the second law allows. The real margin is the
  Ring's recovered energy. If the Ring is late, the Railheads keep the Lattice's power longer and cooling slips.

## Reproduce these numbers

The Lattice's numbers come from [calc/src/model/helios.ts](../../calc/src/model/helios.ts); the energy budget
from [calc/src/model/budget.ts](../../calc/src/model/budget.ts).

```sh
pnpm calc --only helios-area     # P / (S η)
pnpm calc --only helios-spot     # 2.44 λ L / D
pnpm calc --only helios-supply   # P × (deadline − full-power date)
pnpm calc --only budget-spare    # 1 − demand / supply
```

In the [Explorer](https://phosphoros.space/explore), lower `helios-film-efficiency` and the film area, the mass
and the date the Foundry can afford the Lattice all grow, though full power still comes when the Foundry
reaches full scale. Lower `helios-power` and the supply falls: the budget goes negative before the schedule
breaks, and the simulated atmosphere becomes Earth-like later. Raise it and the spare grows, but only if the
Foundry can build the extra film.
