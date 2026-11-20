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
  with a check; and unrefrigerated floor heat melts the base of the cryo ice rather than turning it
  to gas ([#10](https://github.com/Xaxis/phosphoros.space/issues/10)).
- Open problems: the Braking Ring cannot lower the caught ice on tethers as version 2 describes
  ([#2](https://github.com/Xaxis/phosphoros.space/issues/2)), and catching half the ice eastbound
  and half westbound cancels the twist on the Ring, not its braking force
  ([#3](https://github.com/Xaxis/phosphoros.space/issues/3)). The Exhaust's narrow beams cost far
  more pump work than the model charges ([#4](https://github.com/Xaxis/phosphoros.space/issues/4)).
  Freezing the seas at the triple point takes long enough that the Frost Towers finish after the
  last caps are due and seeded life greens the oceans after the deadline.
  Each is carried as a failing check until a design closes it. Other gaps found while rebuilding the numbers are open as
  [issues](https://github.com/Xaxis/phosphoros.space/issues).
- The site, phosphoros.space, renders every page from the docs in this repository, and the
  Explorer runs the model in the browser so anyone can change an assumption and see what follows.

## Version 2: Project Hesperus Ten

A ten-year plan built on thirteen invented technologies, with the energy budget and the corrections
found while writing it: more Helios power, a Veil station moved off L1, a higher cost of pumping
heat, a larger Exhaust, crust heat under the cryo-continents and a self-powered Ice Train. Renamed
Phosphoros at the end of the version.

## Version 1: Project Hesperus

The first outline: a sunshade, freezing out the carbon dioxide, imported water and seeded life.
