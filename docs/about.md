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
- **Correction (v3): Launches between windows cost more, and the budget now charges them.** Version 2 priced every Ice Train shot at the Hohmann minimum, but the Railheads fire all the time. A shot between launch windows needs a faster orbit to meet Venus: up to [46%](numbers.md#launch-offwindow-max) more energy at the worst moment, [16%](numbers.md#launch-offwindow-mean) more on average. Charging the average raises the launch energy to [4.8 × 10²⁷ J](numbers.md#ice-launch-energy) and the Railheads' power to [6.5 × 10¹⁹ W](numbers.md#railhead-power). Until the Ring takes over, cooling gets less of the Lattice, so the Clear Rain moves to [September 2034](numbers.md?date=month#traj-clear-rain) and all the CO₂ is down on [23 August 2036](numbers.md?date=day#traj-cold). The air is Earth-like on [30 September 2036](numbers.md?date=day#traj-earth-like).
- **Correction (v3): Cooling and sealing end once the Frost Towers finish.** The end of active cooling and the last cap were both planned for 30 June 2036. With launches between windows charged, the simulated Frost Towers finish only on [11 September 2036](numbers.md?date=day#traj-scavenged), so both move to [15 September 2036](numbers.md?date=day#sealing-end), and a new check keeps them after the Frost Towers. The Exhaust's campaign averages are taken over the longer campaign, so they fall a little.
- **Correction (v3): Seeding waits for the ocean pH gate as well as the oxygen.** Seeding began the day the oxygen was in, [30 September 2036](numbers.md?date=day#forge-end), which met the pH gate (oceans above pH [7.5](numbers.md#genesis-ph-min) for [90 d](numbers.md#genesis-ph-days)) with almost nothing to spare. With the later melt the pH gate opens on [14 December 2036](numbers.md?date=day#genesis-ph-clear), so seeding now begins at the later of the two gates, [14 December 2036](numbers.md?date=day#genesis-start). Seeded at [100 per cm³](numbers.md#genesis-seed-density) and doubling every [1 d](numbers.md#genesis-doubling-days), the cyanobacteria reach the density of rich Earth seawater on [25 December 2036](numbers.md?date=day#genesis-end), and a new check holds that to the deadline. That date used to mark the end of seeding; it now marks green water.
- **Open problem (v3): From the Lattice alone, the energy budget does not close.** Charging the launches fired between windows adds [6.7 × 10²⁶ J](numbers.md#ice-launch-offwindow-energy) to the demand. The Lattice delivers [7.8 × 10²⁷ J](numbers.md#helios-supply) against [8.3 × 10²⁷ J](numbers.md#budget-demand), so it falls short: [−6.3%](numbers.md#budget-spare) spare. The plan closes only with the Ring's recovered energy, which leaves [25%](numbers.md#budget-spare-with-ring) spare, so the Ring is no longer a margin but a necessity. Options under study: fire harder near each window (more Railheads, less energy), a larger Lattice, or less water. ([issue #12](https://github.com/Xaxis/phosphoros.space/issues/12))
- **Correction (v3): Choir's machine count comes from the model.** Version 2 said Choir runs a trillion machines, a number nothing in the plan sized. Version 3 counts the machines the model does size, [3.9 × 10⁸](numbers.md#choir-machines): the Lattice's Petals, the Veil's slats, the Exhaust canopies, the Thermal Chimneys, the Forges, the Railheads and the Ring's tether lifts. The Foundry's own robots are not sized, so this is a floor.
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
| Share of Mercury's mass the Foundry uses | 3 × 10⁻¹⁰ | [4 × 10⁻¹⁰](numbers.md#foundry-mercury-share) | The brief divides 10¹⁴ kg by Mercury's mass; at the full 1.34 × 10¹⁴ kg it is 4 × 10⁻¹⁰. |
| Foundry power at full scale | 1.3 × 10¹⁵ W | [1.8 × 10¹⁵ W](numbers.md#foundry-peak-power) | The brief multiplies 13 W/kg by 10¹⁴ kg. At the full 1.34 × 10¹⁴ kg the Foundry draws 1.8 × 10¹⁵ W. |
| Veil station, sunward of Venus | 137,000 km | [1.11 × 10⁶ km](numbers.md#veil-distance) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Veil area | 1.5 × 10¹⁴ m² | [5.4 × 10¹⁴ m²](numbers.md#veil-area) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Veil mass | 1.5 × 10¹¹ kg | [5.4 × 10¹¹ kg](numbers.md#veil-mass) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Number of slats | 1.0 × 10⁸ | [3.8 × 10⁸](numbers.md#veil-slats) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Veil closes over Venus | 31 December 2031 | [30 June 2032](numbers.md?date=day#veil-close) | Corrected in version 3: [The Veil goes back to L1, as a light-bending film](about.md#corrections) |
| Peak power the Exhaust can throw into space | 3.6 × 10¹⁹ W | [5.0 × 10¹⁹ W](numbers.md#exhaust-peak) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Emitter area installed (sized for the peak) | 4.0 × 10¹³ m² | [5.5 × 10¹³ m²](numbers.md#exhaust-area-installed) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Installed emitter area as a share of Venus | 9% | [12%](numbers.md#exhaust-area-share) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Working emitter area as a share of Venus at an effective 1,000 K | 58% | [55%](numbers.md#exhaust-area-share-1000) | Corrected in version 3: [Cooling and sealing end once the Frost Towers finish](about.md#corrections) |
| Working emitter area as a share of Venus at an effective 1,500 K | 17% | [16%](numbers.md#exhaust-area-share-1500) | Corrected in version 3: [Cooling and sealing end once the Frost Towers finish](about.md#corrections) |
| Working emitter area as a share of Venus at an effective 2,500 K | 3.7% | [3.5%](numbers.md#exhaust-area-share-2500) | Corrected in version 3: [Cooling and sealing end once the Frost Towers finish](about.md#corrections) |
| Lattice share to pump the floor heat away at first (worst case, from 200 K) | 1% | [0.2%](numbers.md#cryo-refrigeration-share) | The brief budgets about 1% of the Lattice to refrigerate the basin floors. Pumping the first 12 PW from 200 K to an effective 2,000 K takes 0.2%, and far less once the rock cools; 1% is a generous allowance. |
| Power of one Forge | 1 TW | [960 TW](numbers.md#forge-plant-power) | The brief lists 500 plants of about 1 TW, but 4.9 × 10¹⁷ W shared by 500 Forges is about 1 PW (10¹⁵ W) each, a thousand times more. The total is right; the per-plant figure was a unit slip. |
| Energy to launch all the ice | 4.1 × 10²⁷ J | [4.8 × 10²⁷ J](numbers.md#ice-launch-energy) | Corrected in version 3: [Launches between windows cost more, and the budget now charges them](about.md#corrections) |
| Power all Railheads draw | 5.6 × 10¹⁹ W | [6.5 × 10¹⁹ W](numbers.md#railhead-power) | Corrected in version 3: [Launches between windows cost more, and the budget now charges them](about.md#corrections) |
| Power one Railhead draws | 5.5 × 10¹⁵ W | [6.5 × 10¹⁵ W](numbers.md#railhead-power-each) | Corrected in version 3: [Launches between windows cost more, and the budget now charges them](about.md#corrections) |
| Energy delivered from outside Venus | 7.0 × 10²⁷ J | [8.3 × 10²⁷ J](numbers.md#budget-demand) | Corrected in version 3: [Launches between windows cost more, and the budget now charges them](about.md#corrections) |
| Heat-pump work to cool Venus, day by day, Frost Towers included | 2.8 × 10²⁷ J | [3.4 × 10²⁷ J](numbers.md#traj-pump-energy) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Spare supply, before counting the Ring's recovered energy | 9% | [−6.3%](numbers.md#budget-spare) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
| Share of the Lattice's output that water and cooling take | 90% | [110%](numbers.md#budget-launch-share) | Corrected in version 3: [The Exhaust is sized for the peak the simulation needs](about.md#corrections) |
<!-- /table -->

## License

The code is released under the MIT license. The text, data and figures are released under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): share and adapt them freely, with credit to
Phosphoros (phosphoros.space). The source is at
[github.com/Xaxis/phosphoros.space](https://github.com/Xaxis/phosphoros.space), and corrections are welcome
([Contribute](contribute.md)).
