# About

## What Phosphoros is

Phosphoros is a speculative but honest engineering plan. It asks what it would take to make Venus
Earth-like in ten years, from 2027 to 2036, and answers with a complete, internally consistent design:
thirteen inventions, a decade of dates, and an energy budget that shows where it closes and where it
does not. It is a design review of an
impossible-sounding idea, carried out in public.

Three rules make it honest rather than merely bold:

- **Every number is reproducible.** Each one comes from [`data/`](../data/) through the model in
  [`calc/`](../calc/), and the [ledger](numbers.md) shows its formula, its inputs and the line that computes
  it. Change an assumption and every page follows.
- **Every real-world claim cites a source**, listed in [Sources](sources.md).
- **Every invention says it is one.** Where the plan assumes engineering that does not exist, the page says
  so, and the data marks the number as invented.

Physics is the one thing it never assumes away. Every invention obeys conservation of energy and the second
law of thermodynamics, and the model checks the plan against both on every run.

## What it is not

It is not a proposal to start tomorrow, and not a prediction that anyone will. Most of its thirteen
inventions are far beyond what exists, and several may prove impossible: the [Research Agenda](research.md)
says which experiments would show that. It is not an argument that Venus should be changed. If the clouds
hold life, the plan stops, and even if they do not, the decision belongs to everyone, not to a program
([Risks and Governance](risks.md)).

What it is useful for is the map. It shows which inventions a fast terraforming would need, how good each
would have to be, and which laws no amount of invention gets around. That is worth knowing whether or not
anyone ever builds it.

## The name

Phosphoros is Greek for "light-bringer", the ancient name for Venus as the morning star. Its evening name was
Hesperos, which survives here in the [Hesperus Veil](technologies/veil.md). The name has a second meaning
for this plan: Phosphoros cools Venus by beaming its heat away into space as light.

## History

The project began as **Project Hesperus**, a conventional analysis that concluded an Earth-like Venus in ten
years was impossible without imported energy, and proposed a decade of groundwork for a transformation
lasting centuries. Its second version, **Project Hesperus Ten**, asked what would have to be invented to
finish in ten years instead, and was renamed Phosphoros. The third version, published on 2026-11-20, rebuilt
every number from first principles in code. That reproduced almost all of version 2, and found the errors
listed below.

## Corrections

A published number is never quietly changed. Each correction says what changed and why, with the numbers
before and after; open problems stay on this list, and fail a check in the model, until they are solved.

<!-- table:corrections -->
### Version 1: Project Hesperus

A conventional analysis concluded that an Earth-like Venus in ten years is impossible without imported energy. It proposed a 2027 to 2036 ignition phase (science, seed factories, a pilot sunshade, an aerostat outpost) leading to a 200 to 500 year transformation.

### Version 2: Project Hesperus Ten

Invented the technologies needed to finish in ten years.

- **Correction (v2): Helios power raised from 4 to 7 × 10¹⁹ W.** So that the ice launches finish in time.
- **Correction (v2): Veil moved from L1 to a statite 137,000 km sunward.** Because the Sun's angular size makes an L1 shade about three times larger (area 1.3 to 1.5 × 10¹⁴ m²). Version 3 found this move breaks Newton's laws and returns the Veil to L1 (see "The Veil goes back to L1" below). ([issue #1](https://github.com/Xaxis/phosphoros.space/issues/1))
- **Correction (v2): Cooling work raised to about 5.4 joules per joule moved.** From "equal to the heat moved" to the Carnot cost of lifting heat to emitters at an effective 2,000 K. Total delivered energy rose from 4.7 to 7.0 × 10²⁷ J; spare fell from about 40% to about 9%, plus the Ring's recovered energy.
- **Correction (v2): Exhaust emitter area raised to about 4 × 10¹³ m² (9% of Venus).** To shine the cooling campaign's average power at 0.9 MW/m².
- **Finding (v2): Cryo-continent floors leak crust heat.** About 12 PW at first, so basal heat pipes and ongoing refrigeration are needed.
- **Finding (v2): The Ice Train powers itself from late 2034.** The energy the Ring recovers per kilogram caught exceeds the energy spent launching it.
- **Renamed (v2): Project Hesperus Ten becomes Phosphoros.** Phosphoros, the light-bringer, is the ancient Greek name for Venus as the morning star.
### Version 3: Phosphoros, every number reproducible

Every number in the plan now comes from data/ through the model in calc/. Rebuilding the numbers from first principles reproduced almost all of version 2 and found the corrections below.

- **Correction (v3): The Veil goes back to L1, as a light-bending film.** A statite hovers only where light pushes it away from what pulls it. Sunlight travels from the Sun toward Venus, so it pushes a sunward shade toward Venus, the same way Venus's gravity pulls it: the version 2 Veil would fall onto Venus in about a day. The only place a shade can hold station between the Sun and Venus is at or just sunward of the L1 point, 1.01 million km out, where the Sun's pull balances Venus's. Version 3 puts it there and makes it a clear film that bends sunlight a few degrees so it misses Venus, rather than a mirror, so light pressure barely moves it (as in Angel's 2006 design for an Earth sunshade). The cost is area: about 3.6 times version 2's, 5.4 × 10¹¹ kg instead of 1.5 × 10¹¹ kg. The Foundry can afford that by March 2032, so the Veil closes in June 2032 instead of December 2031, still six months before active cooling. The Aegis coil moves with it, to L1, where NASA's Mars shield study put its own. ([issue #1](https://github.com/Xaxis/phosphoros.space/issues/1))
- **Correction (v3): The Exhaust is sized for the peak the simulation needs.** Version 2 sized the Photonic Exhaust from the campaign's average power. The new day-by-day simulation shows the timing matters: until the Ring takes over the Railheads in August 2034 most of the Lattice's power goes to Ceres, and after that power is plentiful but the emitters cannot shine it. With 3.6 × 10¹⁹ W of emitters Venus reaches Earth-like conditions only in April 2037. With 5 × 10¹⁹ W (5.5 × 10¹³ m², 12% of Venus) the CO₂ is down by April 2036 and the air is Earth-like by 30 September 2036. The simulation also counts heat the averages left out (from the crust, the Forges and the falling ice), so the energy demand rises from 7.0 to 7.7 × 10²⁷ J: 2% spare from the Lattice alone, 28% once the Ring powers the Railheads.
- **Open problem (v3): The Ring cannot lower the ice on tethers.** Bringing 2.2 × 10¹² kg of ice a second to rest 300 km lower takes at least the momentum it would gain falling that far, every second: about 4.7 × 10¹⁵ N. The Ring's rotor has about 3 × 10¹³ N of lift to spare, 150 times too little. Catching the ice works; lowering it this way does not. Options under study: drop the Bricks from rest at the Ring and pump out the extra 2.5 × 10²⁶ J of heat; lower over a longer time; or a far heavier, faster rotor. The energy budget never counted the lowering's recovered energy, so it still closes. ([issue #2](https://github.com/Xaxis/phosphoros.space/issues/2))
- **Open problem (v3): Catching east and west cancels the Ring's twist, not its braking force.** Version 2 caught half the Bricks eastbound and half westbound so the braking forces would cancel. Every Brick arrives from the same direction, and the two streams graze the Ring at mirror-image points, each about 22° forward of the line across Venus. Their sideways pushes cancel and their forward pushes add: about 8 × 10¹⁵ N along Venus's orbital motion, some 270 times the rotor's spare lift. An orbital ring has no stiff way to hand that force to the planet. Catching still recovers the energy the budget counts; what holds the Ring in place while it does is unsolved. ([issue #3](https://github.com/Xaxis/phosphoros.space/issues/3))
- **Correction (v3): 0.25 bar of oxygen is a little more than Earth's, not a match.** Earth's sea-level oxygen is 0.21 bar. 0.25 bar is about 18% more.
- **Correction (v3): Seeding waits for the oxygen.** Version 2 seeded life from mid-2036 behind a gate that needs 0.25 bar of oxygen, but the Forges finish only at the end of September 2036. Seeding now starts when the gate opens; one-day doubling still greens the sunlit water by December.
- **Correction (v3): Precursor mission dates checked.** EnVision has slipped from November 2031 to 2032; Venus Life Finder waits on Neutron, now due in 2027. DAVINCI (December 2030) and VERITAS (November 2032) are confirmed, but NASA's 2027 budget request again proposes ending both.
- **Correction (v3): Launches between windows cost more, and the budget now charges them.** Version 2 priced every Ice Train shot at the Hohmann minimum, but the Railheads fire all the time. A shot between launch windows needs a faster orbit to meet Venus: up to [46%](numbers.md#launch-offwindow-max) more energy at the worst moment, [16%](numbers.md#launch-offwindow-mean) more on average. Charging the average raises the launch energy to [4.8 × 10²⁷ J](numbers.md#ice-launch-energy) and the Railheads' power to [6.7 × 10¹⁹ W](numbers.md#railhead-power). Until the Ring takes over, cooling gets less of the Lattice, so the Clear Rain moves to [July 2034](numbers.md?date=month#traj-clear-rain) and all the CO₂ is down on [3 August 2036](numbers.md?date=day#traj-cold). The air is Earth-like on [30 September 2036](numbers.md?date=day#traj-earth-like).
- **Correction (v3): Cooling and sealing end once the Frost Towers finish.** The end of active cooling and the last cap were both planned for 30 June 2036. With launches between windows charged, the simulated Frost Towers finish only on [22 August 2036](numbers.md?date=day#traj-scavenged), so both move to [1 September 2036](numbers.md?date=day#sealing-end), and a new check keeps them after the Frost Towers. The Exhaust's campaign averages are taken over the longer campaign, so they fall a little.
- **Correction (v3): Seeding waits for the ocean pH gate as well as the oxygen.** Seeding began the day the oxygen was in, [30 September 2036](numbers.md?date=day#forge-end), which met the pH gate (oceans above pH [7.5](numbers.md#genesis-ph-min) for [90 d](numbers.md#genesis-ph-days)) with almost nothing to spare. With the later melt the pH gate opens on [1 December 2036](numbers.md?date=day#genesis-ph-clear), so seeding now begins at the later of the two gates, [1 December 2036](numbers.md?date=day#genesis-start). Seeded at [100 per cm³](numbers.md#genesis-seed-density) and doubling every [1 d](numbers.md#genesis-doubling-days), the cyanobacteria reach the density of rich Earth seawater on [12 December 2036](numbers.md?date=day#genesis-end), and a new check holds that to the deadline. That date used to mark the end of seeding; it now marks green water.
- **Correction (v3): The Foundry pays for what it builds.** Version 2 grew the Foundry as if the Veil and the Lattice cost it nothing, and let the Lattice's power climb with the Foundry from 2030. Mass is conserved: every kilogram of product is a kilogram the Foundry did not add to itself. Now it stops growing for [9.8 d](numbers.md#veil-diversion-days) to build the Veil, whose parts take [76 d](numbers.md#mercury-venus-transfer-days) to coast from Mercury to L1, so the Veil closes on [1 December 2032](numbers.md?date=day#veil-close), late enough that the Foundry is large. It then grows to full scale and builds the Lattice and the Ring after. Growing to about the mass of what it must build next finishes soonest, so it stops at [26](numbers.md#foundry-doublings) doublings, [6.7 × 10¹³ kg](numbers.md#foundry-final-mass), instead of 27. Active cooling starts with the Lattice's first power, [3 May 2033](numbers.md?date=day#cooling-start), instead of January 2033, and the ice launches with full power on [22 July 2033](numbers.md?date=day#ice-launch-start).
- **Correction (v3): Cooling waits for the chimneys, and the chimneys cool the air less.** The simulation now caps the heat it removes at what the chimneys carry; the cap binds on [56 d](numbers.md#traj-chimney-days). It also charges what the chimneys cost the pumps. The exchangers cooled the air by 300 K, and the pumps see that heat over the whole range, as if the air were at the range's log-mean temperature: about 22% colder, which raised the work for each joule of the gas's heat by a third or more. Version 3's chimneys are wider, [3.5 km](numbers.md#chimney-diameter), and cool the air by [100 K](numbers.md#chimney-gas-cooling), so the pumps see [0.931](numbers.md#chimney-cold-factor) of its temperature. The bigger flow costs fan power, [1.0 × 10¹⁷ W](numbers.md#chimney-fan-power), which the budget now charges. ([issue #5](https://github.com/Xaxis/phosphoros.space/issues/5))
- **Correction (v3): The Aegis coil grows to 1,000 km so it can hold itself together.** A magnet's field pulls its own winding outward. Version 2's 10 km coil would have needed about 10¹⁷ kg of the strongest carbon fibre to hold together, far more than the Foundry ever builds. The same dipole from a wider loop needs far less current, and the pull falls with the cube of the radius. At [1,000 km](numbers.md#aegis-coil-radius) the coil carries [3 × 10⁸ A](numbers.md#aegis-ampere-turns) in all, [300 A](numbers.md#aegis-current) per turn, and its structure needs at least [2.0 × 10¹¹ kg](numbers.md#aegis-structure-mass). ([issue #6](https://github.com/Xaxis/phosphoros.space/issues/6))
- **Open problem (v3): The Exhaust's narrow beams cost far more pump work than the model charges.** The model charges the heat pumps the Carnot work for emitters at [2,000 K](numbers.md#exhaust-effective-temp), right for light spread over colours and directions the way a surface that hot spreads it. The tiles instead put [0.91 MW/m²](numbers.md#exhaust-flux) into a [0.4 µm](numbers.md#exhaust-band) band and a [25°](numbers.md#exhaust-cone) cone, light that counts as at least [16,000 K](numbers.md#exhaust-light-temp) by its entropy. Lifting a joule from the starting air into it takes [12](numbers.md#exhaust-work-multiple) times the work charged. Either the tiles spread their light over far more colours and directions, or the pumps need many times the power. The budget's pump work is a floor until this is solved. ([issue #4](https://github.com/Xaxis/phosphoros.space/issues/4))
- **Correction (v3): The Lattice grows to 8.5 × 10¹⁹ W so the budget closes without the Ring.** Charging the launches fired between windows added [6.7 × 10²⁶ J](numbers.md#ice-launch-offwindow-energy) to the demand, and the Lattice's power now arrives only once the Foundry stops growing. At 7 × 10¹⁹ W the Lattice alone fell 7% short, and the air was Earth-like only in February 2037. Version 2 raised the Lattice from 4 to 7 × 10¹⁹ W for the same reason: the launches. At [8.5 × 10¹⁹ W](numbers.md#helios-power) the Lattice delivers [9.2 × 10²⁷ J](numbers.md#helios-supply) against [8.4 × 10²⁷ J](numbers.md#budget-demand), [9.3%](numbers.md#budget-spare) spare before the Ring's recovered energy and [34%](numbers.md#budget-spare-with-ring) after, and the plan finishes on time. It takes [6.2 × 10¹³ kg](numbers.md#helios-mass) of petals, which the full Foundry builds in [80 d](numbers.md#lattice-build-days). ([issue #12](https://github.com/Xaxis/phosphoros.space/issues/12))
- **Correction (v3): Choir's machine count comes from the model.** Version 2 said Choir runs a trillion machines, a number nothing in the plan sized. Version 3 counts the machines the model does size, [3.9 × 10⁸](numbers.md#choir-machines): the Lattice's Petals, the Veil's slats, the Exhaust canopies, the Thermal Chimneys, the Forges, the Railheads and the Ring's tether lifts. The Foundry's own robots are not sized, so this is a floor.
- **Correction (v3): The Veil's spare slats are not claimed until the model carries them.** Version 2 listed 20% spare slats as a safeguard against the Veil failing after cooling. The model sizes the Veil, its mass and the date the Foundry can afford it with no spares, so version 3 no longer claims them. The safeguards it does carry are [3.8 × 10⁸](numbers.md#veil-slats) independent slats that fail opaque and the CO₂ sealed under the cryo-continents.
- **Correction (v3): The longest beam starts from the Lattice's outermost orbit.** Version 2 put the Petals on orbits from [0.3 AU](numbers.md#helios-orbit-inner) to [0.45 AU](numbers.md#helios-orbit-outer) but measured the longest beam from Mercury's orbit. Measured from the outermost Petals, the longest beam to Venus is [1.2 AU](numbers.md#helios-range), and a [10 km](numbers.md#helios-aperture) aperture spreads it to [46 m](numbers.md#helios-spot).
- **Correction (v3): The Exhaust's dark strip and far-field distance come from its cone.** Version 2 kept tiles dark in a strip 50 km wide under the Ring's path and said each cone falls below [10 W/m²](numbers.md#exhaust-far-limit) beyond about 50,000 km. Both follow from the [25°](numbers.md#exhaust-cone) cone. A cone from the chimney tops at [65 km](numbers.md#chimney-top) is [150 km](numbers.md#exhaust-dark-strip) wide by the time it reaches the Ring at [400 km](numbers.md#ring-altitude), so the strip must be that wide, [1.2%](numbers.md#exhaust-dark-strip-share) of the surface. At peak power one canopy's cone is still brighter than [10 W/m²](numbers.md#exhaust-far-limit) out to [58,000 km](numbers.md#exhaust-cone-safe-distance); where cones overlap, their light adds.
- **Correction (v3): The Veil blocks every colour, and the Exhaust aims around it.** Version 2's slat was a metal mirror from 0.3 to 2.0 µm with a dielectric stack clear at the Exhaust's [2.3 µm](numbers.md#exhaust-wavelength), so the outgoing beams could pass through the Veil. The Exhaust's band holds [1.9%](numbers.md#exhaust-band-sunlight) of sunlight, and a Veil clear there would let it reach Venus: [19](numbers.md#exhaust-band-vs-veil-leak) times the [0.1%](numbers.md#veil-leak-budget) the whole closed Veil may let through. Version 3's slats block every colour, and the Exhaust aims around the Veil instead. Seen from Venus it is only [0.68°](numbers.md#veil-angular-radius) in radius, so tiles that face it tilt their cones [13°](numbers.md#exhaust-veil-tilt) off the Sun line. Gaps between slats are held to [0.05%](numbers.md#veil-gap-max), under version 2's 0.1%, so that gaps and closed slats together fit inside the budget.
- **Correction (v3): The cap's aerogel takes measured values.** Version 2 gave the cap's carbon aerogel a density of 100 kg/m³ and a conductivity of 0.014 W/(m·K), with no source. Lu and colleagues measured [0.029 W/(m·K)](numbers.md#cryo-aerogel-conductivity) in air at [82 kg/m³](numbers.md#cryo-aerogel-density) (1993). With the measured aerogel the caps leak [0.16 W/m²](numbers.md#cryo-leak-flux), [24 TW](numbers.md#cryo-leak-total) in all, still small beside the floor heat, and take [2.5 × 10¹⁷ kg](numbers.md#cryo-cap-mass) of graphite. The Cryo-seal experiment now passes at the leak the plan's own cap gives, instead of version 2's 0.1 W/m², which a cap of real aerogel this thick would fail.
- **Correction (v3): Mercury's surface is poor in iron.** Version 2 described Mercury's surface as rich in iron, silicon, aluminium, magnesium and sulfur. MESSENGER found it rich in sulfur, carbon and magnesium but poor in aluminium, calcium and iron: under [4%](numbers.md#mercury-surface-fe-max) iron by mass, held mostly in sulfides and metal grains. The Foundry's iron cores and rails need more rock dug per kilogram than version 2 implied; the model does not yet size the Foundry's diggers by element.
<!-- /table -->

## Version 2's numbers, checked

Every number in the version 2 brief is recorded in [`data/claims.yaml`](../data/claims.yaml) and recomputed
by the model on every run (`pnpm calc --claims`). Almost all reproduce within rounding. These are the ones
that do not: some version 3 changed on purpose, and the rest differ for reasons the table gives.

<!-- table:claims -->
| Number | Version 2 | Model | Why |
| --- | --- | --- | --- |
| Heat in the top kilometre of crust, cooled by 400 K | 5.5 × 10²⁶ J | [4.6 × 10²⁶ J](numbers.md#crust-heat-per-km) | The brief's figure uses a rock heat capacity of 1,000 J/(kg·K). Its own rock constants (k 2.5, κ 10⁻⁶, ρ 3,000) imply 833, which gives 4.6 × 10²⁶ J. The model keeps the constants and derives the heat capacity. |
| Heat conduction can pull from the crust in a 4-year campaign | 7.0 × 10²⁴ J | [5.8 × 10²⁴ J](numbers.md#crust-skin-heat) | Same cause: with the brief's own rock constants conduction pulls 5.8 × 10²⁴ J, not 7 × 10²⁴ J. Either way it is about 1% of the atmosphere's heat. |
| Doublings from seed to full scale | 27 | [26](numbers.md#foundry-doublings) | Corrected in version 3: [The Foundry pays for what it builds](about.md#corrections) |
| Foundry machinery at full scale | 1.3 × 10¹⁴ kg | [6.7 × 10¹³ kg](numbers.md#foundry-final-mass) | Corrected in version 3: [The Foundry pays for what it builds](about.md#corrections) |
| Foundry power at full scale | 1.3 × 10¹⁵ W | [9.0 × 10¹⁴ W](numbers.md#foundry-peak-power) | The brief multiplies 13 W/kg by 10¹⁴ kg. At the full 1.34 × 10¹⁴ kg the Foundry draws 1.8 × 10¹⁵ W. |
| Foundry reaches full scale | 30 June 2033 | [3 May 2033](numbers.md?date=day#foundry-full-scale) | Corrected in version 3: [The Foundry pays for what it builds](about.md#corrections) |
| Energy to build the Foundry and everything it makes | 10²² J | [10²² J](numbers.md#hardware-energy) | Corrected in version 3: [The Foundry pays for what it builds](about.md#corrections) |
| Helios Lattice film area | 5.1 × 10¹⁶ m² | [6.2 × 10¹⁶ m²](numbers.md#helios-area) | Corrected in version 3: [The Lattice grows to 8.5 × 10¹⁹ W so the budget closes without the Ring](about.md#corrections) |
| Helios Lattice mass | 5.1 × 10¹³ kg | [6.2 × 10¹³ kg](numbers.md#helios-mass) | Corrected in version 3: [The Lattice grows to 8.5 × 10¹⁹ W so the budget closes without the Ring](about.md#corrections) |
| Number of Petals | 1.0 × 10⁷ | [1.3 × 10⁷](numbers.md#helios-petals) | Corrected in version 3: [The Lattice grows to 8.5 × 10¹⁹ W so the budget closes without the Ring](about.md#corrections) |
| Share of the Sun's output the Lattice delivers | 2.0 × 10⁻⁵% | [2.2 × 10⁻⁵%](numbers.md#helios-sun-share) | Corrected in version 3: [The Lattice grows to 8.5 × 10¹⁹ W so the budget closes without the Ring](about.md#corrections) |
| Beam spot at the longest Lattice-to-Venus range | 43 m | [46 m](numbers.md#helios-spot) | Corrected in version 3: [The longest beam starts from the Lattice's outermost orbit](about.md#corrections) |
| Energy the Lattice delivers from full power to the deadline | 7.7 × 10²⁷ J | [9.2 × 10²⁷ J](numbers.md#helios-supply) | Corrected in version 3: [The Lattice grows to 8.5 × 10¹⁹ W so the budget closes without the Ring](about.md#corrections) |
| Veil station, sunward of Venus | 137,000 km | [1.11 × 10⁶ km](numbers.md#veil-distance) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Veil area | 1.5 × 10¹⁴ m² | [5.4 × 10¹⁴ m²](numbers.md#veil-area) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Veil mass | 1.5 × 10¹¹ kg | [5.4 × 10¹¹ kg](numbers.md#veil-mass) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Number of slats | 1.0 × 10⁸ | [3.8 × 10⁸](numbers.md#veil-slats) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Largest share of the Veil's area left as gaps between slats | 0.1% | [0.05%](numbers.md#veil-gap-max) | Corrected in version 3: [The Veil blocks every colour, and the Exhaust aims around it](about.md#corrections) |
| Veil closes over Venus | 31 December 2031 | [1 December 2032](numbers.md?date=day#veil-close) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Hot air drawn through one chimney's exchangers | 4.1 × 10⁹ kg/s | [1.3 × 10¹⁰ kg/s](numbers.md#chimney-mass-flow) | Corrected in version 3: [Cooling waits for the chimneys, and the chimneys cool the air less](about.md#corrections) |
| Heat-pump work to cool Venus | 2.84 × 10²⁷ J | [2.92 × 10²⁷ J](numbers.md#exhaust-work) | Corrected in version 3: [Cooling waits for the chimneys, and the chimneys cool the air less](about.md#corrections) |
| Work per joule of heat moved | 5.4 | [5.5](numbers.md#exhaust-work-ratio) | Corrected in version 3: [Cooling waits for the chimneys, and the chimneys cool the air less](about.md#corrections) |
| Width of the strip under the Ring's path where tiles stay dark | 50 km | [150 km](numbers.md#exhaust-dark-strip) | Corrected in version 3: [The Exhaust's dark strip and far-field distance come from its cone](about.md#corrections) |
| Distance beyond which one canopy's cone, at peak power, is dimmer than the far-field limit | 50,000 km | [58,000 km](numbers.md#exhaust-cone-safe-distance) | Corrected in version 3: [The Exhaust's dark strip and far-field distance come from its cone](about.md#corrections) |
| Peak power the Exhaust can throw into space | 3.6 × 10¹⁹ W | [5.0 × 10¹⁹ W](numbers.md#exhaust-peak) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Emitter area installed (sized for the peak) | 4.0 × 10¹³ m² | [5.5 × 10¹³ m²](numbers.md#exhaust-area-installed) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Installed emitter area as a share of Venus | 9% | [12%](numbers.md#exhaust-area-share) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Exhaust light output compared with a shaded Venus radiating alone | 400 | [450](numbers.md#exhaust-vs-passive-light) | The Exhaust throws out light 420 times faster than a shaded Venus radiates, but removes Venus's own heat 66 times faster: most of the light is the pump's own work. |
| Working emitter area as a share of Venus at an effective 1,000 K | 58% | [63%](numbers.md#exhaust-area-share-1000) | Corrected in version 3: [Cooling and sealing end once the Frost Towers finish](about.md#corrections) |
| Working emitter area as a share of Venus at an effective 1,500 K | 17% | [19%](numbers.md#exhaust-area-share-1500) | Corrected in version 3: [Cooling and sealing end once the Frost Towers finish](about.md#corrections) |
| Working emitter area as a share of Venus at an effective 2,500 K | 3.7% | [4%](numbers.md#exhaust-area-share-2500) | Corrected in version 3: [Cooling and sealing end once the Frost Towers finish](about.md#corrections) |
| Carbon aerogel in the caps | 3.0 × 10¹⁷ kg | [2.5 × 10¹⁷ kg](numbers.md#cryo-cap-mass) | Corrected in version 3: [The cap's aerogel takes measured values](about.md#corrections) |
| Heat leaking down through a cap | 0.075 W/m² | [0.16 W/m²](numbers.md#cryo-leak-flux) | Corrected in version 3: [The cap's aerogel takes measured values](about.md#corrections) |
| Heat leaking down through all caps | 11 TW | [24 TW](numbers.md#cryo-leak-total) | Corrected in version 3: [The cap's aerogel takes measured values](about.md#corrections) |
| Lattice share to pump the floor heat away at first (worst case, from 200 K) | 1% | [0.1%](numbers.md#cryo-refrigeration-share) | The brief budgets about 1% of the Lattice to refrigerate the basin floors. Pumping the first 12 PW from 200 K to an effective 2,000 K takes 0.2%, and far less once the rock cools; 1% is a generous allowance. |
| Power of one Forge | 0.001 PW | [0.96 PW](numbers.md#forge-plant-power) | The brief lists 500 plants of about 1 TW, but 4.9 × 10¹⁷ W shared by 500 Forges is about 1 PW (10¹⁵ W) each, a thousand times more. The total is right; the per-plant figure was a unit slip. |
| Graphite left after the caps | 1.9 × 10¹⁷ kg | [2.4 × 10¹⁷ kg](numbers.md#graphite-stockpile) | Corrected in version 3: [The cap's aerogel takes measured values](about.md#corrections) |
| Ice thrown per second | 1.36 × 10¹² kg/s | [1.41 × 10¹² kg/s](numbers.md#ice-throughput) | Corrected in version 3: [The Foundry pays for what it builds](about.md#corrections) |
| Ice Bricks per second | 1,360 | [1,410](numbers.md#ice-bricks-per-second) | Corrected in version 3: [The Foundry pays for what it builds](about.md#corrections) |
| Seconds between shots at each Railhead | 7.4 s | [7.1 s](numbers.md#railhead-interval) | Corrected in version 3: [The Foundry pays for what it builds](about.md#corrections) |
| Energy to launch all the ice | 4.1 × 10²⁷ J | [4.8 × 10²⁷ J](numbers.md#ice-launch-energy) | Corrected in version 3: [Launches between windows cost more, and the budget now charges them](about.md#corrections) |
| Power all Railheads draw | 5.6 × 10¹⁹ W | [6.7 × 10¹⁹ W](numbers.md#railhead-power) | Corrected in version 3: [Launches between windows cost more, and the budget now charges them](about.md#corrections) |
| Power one Railhead draws | 5.5 × 10¹⁵ W | [6.7 × 10¹⁵ W](numbers.md#railhead-power-each) | Corrected in version 3: [Launches between windows cost more, and the budget now charges them](about.md#corrections) |
| First Bricks reach Venus | 15 August 2034 | [16 September 2034](numbers.md?date=day#first-catch) | Corrected in version 3: [The Foundry pays for what it builds](about.md#corrections) |
| Ampere-turns in the coil | 3 × 10¹² A | [3 × 10⁸ A](numbers.md#aegis-ampere-turns) | Corrected in version 3: [The Aegis coil grows to 1,000 km so it can hold itself together](about.md#corrections) |
| Energy delivered from outside Venus | 7.0 × 10²⁷ J | [8.4 × 10²⁷ J](numbers.md#budget-demand) | Corrected in version 3: [Launches between windows cost more, and the budget now charges them](about.md#corrections) |
| Heat-pump work to cool Venus, day by day, Frost Towers included | 2.8 × 10²⁷ J | [3.5 × 10²⁷ J](numbers.md#traj-pump-energy) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Spare supply, before counting the Ring's recovered energy | 9% | [9.3%](numbers.md#budget-spare) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Share of the Lattice's output that water and cooling take | 90% | [90%](numbers.md#budget-launch-share) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
<!-- /table -->

## License

The code is released under the MIT license. The text, data and figures are released under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): share and adapt them freely, with credit to
Phosphoros (phosphoros.space). The source is at
[github.com/Xaxis/phosphoros.space](https://github.com/Xaxis/phosphoros.space), and corrections are welcome
([Contribute](contribute.md)).
