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
  seeding life waits for the oxygen; the precursor mission dates were checked again.
- Open problem: the Braking Ring cannot lower the caught ice on tethers as version 2 describes. It is
  carried as a failing check until a design closes it.
- The site, phosphoros.space, renders every page from the docs in this repository, and the
  Explorer runs the model in the browser so anyone can change an assumption and see what follows.

## Version 2: Project Hesperus Ten

A ten-year plan built on thirteen invented technologies, with the energy budget and the corrections
found while writing it: more Helios power, a Veil station moved off L1, a higher cost of pumping
heat, a larger Exhaust, crust heat under the cryo-continents and a self-powered Ice Train. Renamed
Phosphoros at the end of the version.

## Version 1: Project Hesperus

The first outline: a sunshade, freezing out the carbon dioxide, imported water and seeded life.
