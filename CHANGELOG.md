# Changelog

What changed in each version of Phosphoros. Every change to a published number is also in the
corrections log, [`data/corrections.yaml`](data/corrections.yaml), shown on the site at
[phosphoros.space/about](https://phosphoros.space/about#corrections) with the reason for each.

## Version 3: Phosphoros, every number reproducible (2026-11-20)

- Every number on the site and in the docs is computed by the model in [`calc/`](calc/) from
  [`data/`](data/). Each one links to its formula, its inputs and the line that defines it, in the
  [ledger](docs/numbers.md).
- A day-by-day simulation of Venus's air (cooling, the Clear Rain, freezing, warming, oxygen) now
  drives the energy budget and the finish date, instead of averages.
- Physics checks run with every change: energy conservation, the second law, forces on everything
  that hovers or hangs, machine capacities and the order of events. Failing checks are shown, not
  hidden.
- Every number in the version 2 brief is checked against the model in
  [`data/claims.yaml`](data/claims.yaml); each difference is explained or corrected.
- Corrections: the Veil returns to L1 as a light-bending film, because a version 2 statite cannot
  hover; the Exhaust is sized for the simulated peak; oxygen is a little above Earth's, not a match;
  seeding life waits for the oxygen and for the oceans' pH; launches fired between windows are
  charged, so cooling and sealing end later, and the Lattice grows so the energy budget still
  closes without the Ring ([#12](https://github.com/Xaxis/phosphoros.space/issues/12)); the
  precursor mission dates were checked again. The Lattice's orbits are set, so its longest beam and
  widest spot grow; the Exhaust's dark strip and far field are sized from its cone; the Veil blocks
  every colour and the Exhaust aims its cones around it; the Veil's spare slats are not claimed; the
  Choir's machine count is the model's; the cryo caps use measured aerogel; and Mercury's surface is
  poor in iron, as MESSENGER found. CO₂'s sublimation curve follows Span and Wagner and meets the
  vapour curve at the triple point; the seas give up their heat of fusion at the triple point
  instead of the latent heat being spread evenly above it; the simulation's heat books balance,
  with a check; the Exhaust's peak grows a tenth so the slower freeze still ends before the caps
  are sealed; and unrefrigerated floor heat melts the base of the cryo ice rather than turning it
  to gas ([#10](https://github.com/Xaxis/phosphoros.space/issues/10)). The ozone layer is computed
  from sunlight and its chemistry, and land life waits for it
  ([#13](https://github.com/Xaxis/phosphoros.space/issues/13)). Measured CO₂ + SO₂ equilibria put
  almost all of the SO₂ into the CO₂ seas, which freeze it into the cryo-continents, so the Acid
  Sweep takes up only the cloud acid and the SO₂ left in the air, a small fraction of the lime
  version 2 planned ([#8](https://github.com/Xaxis/phosphoros.space/issues/8)). The Budget shows how far each
  assumption can move before the plan breaks
  ([#9](https://github.com/Xaxis/phosphoros.space/issues/9)).
- The Ceres end of the Ice Train is sized
  ([#7](https://github.com/Xaxis/phosphoros.space/issues/7)). Ceres cannot radiate the Ice Train's
  heat from its surface, so the receivers fly in the Crown, a ring at Ceres's synchronous orbit whose
  fins shed the receivers' loss and most of the Railheads'; the barrels must be nearly lossless. The
  Railheads' mass, the Crown and the Ceres factories that build them are modelled; the factories are
  seeded with the Foundry and must double faster than it to finish before the first launch. The
  longest beam to Ceres is measured from the Lattice, not the Ring. Ceres's new orbit stays clear of
  Jupiter by the Hill-radius and Tisserand tests; resonances are not modelled.
- Open problems: the Braking Ring cannot lower the caught ice on tethers as version 2 describes
  ([#2](https://github.com/Xaxis/phosphoros.space/issues/2)), and catching half the ice eastbound
  and half westbound cancels the twist on the Ring, not its braking force
  ([#3](https://github.com/Xaxis/phosphoros.space/issues/3)). The Exhaust's narrow beams cost far
  more pump work than the model charges ([#4](https://github.com/Xaxis/phosphoros.space/issues/4)).
  Each is carried as a failing check until a design closes it. The other gaps found while rebuilding
  the numbers were filed as [issues](https://github.com/Xaxis/phosphoros.space/issues?q=is%3Aissue)
  and closed by the changes above.
- A full review of every page against the model: no page says the Ring's catch works while nothing holds
  the Ring against it; the finish is set by the oxygen, not by the warmth; build sequences follow the
  simulated dates; the Foundry's target is computed from the Lattice and the Ring it builds next, so a
  larger Lattice grows the Foundry; Exhaust-1 must measure light the air above the canopies lets through;
  and the risks table lists every open problem.
- A second review of the model against its own physics. The heat pumps are charged as real
  machines, at half the Carnot limit, not the reversible minimum, and the chimney fans' heat is
  counted ([#17](https://github.com/Xaxis/phosphoros.space/issues/17)); the emitters run cooler, so
  the Exhaust grows, and the Lattice grows to drive it. The hardware at Venus (the Exhaust's tiles,
  the chimneys, the receivers and the Lanterns) is weighed and built after the Ring, and cooling
  waits for it ([#18](https://github.com/Xaxis/phosphoros.space/issues/18)). Every Brick flies its
  own transfer, solved by Lambert's method out of Ceres's tilted orbit as the recoil pushes it out,
  so launches cost more and the Bricks reach the Ring faster
  ([#16](https://github.com/Xaxis/phosphoros.space/issues/16)); the simulation takes the Ring's
  power day by day as the Bricks arrive. Every computed number carries the weakest basis among its
  inputs ([#19](https://github.com/Xaxis/phosphoros.space/issues/19)). Every Explorer slider runs
  the model end to end or stops with a sentence that says why.
- Two more open problems: the fins that shed the receivers' and the Ring's loss heat shine part of
  it onto Venus ([#14](https://github.com/Xaxis/phosphoros.space/issues/14)), and the Ring cannot
  carry the receivers the plan hangs on it
  ([#15](https://github.com/Xaxis/phosphoros.space/issues/15)).
- The site, phosphoros.space, renders every page from the docs in this repository, and the
  Explorer runs the model in the browser so anyone can change an assumption and see what follows.

## Version 2: Project Hesperus Ten

A ten-year plan built on thirteen invented technologies, with the energy budget and the corrections
found while writing it: more Helios power, a Veil station moved off L1, a higher cost of pumping
heat, a larger Exhaust, crust heat under the cryo-continents and a self-powered Ice Train. Renamed
Phosphoros at the end of the version.

## Version 1: Project Hesperus

The first outline: a sunshade, freezing out the carbon dioxide, imported water and seeded life.
