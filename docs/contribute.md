# Contribute

Phosphoros is a plan anyone can check, and it gets better each time someone shows part of it is wrong. The
most useful contributions make it more honest: a number that is off, a source that says something else, a
physics check that should fail and does not, or an invention that does a job better within the laws of
physics.

## How to propose a change

Every number lives in [`data/`](../data/) and flows through the model in [`calc/`](../calc/) to every page,
chart and table. So a change to a number is a change to the data or the model, never to a page. Open an
issue to discuss it, or send a pull request that makes it.

A number that was published is never quietly changed. A pull request that changes one also adds an entry
to [`data/corrections.yaml`](../data/corrections.yaml) saying what changed and why, and it shows up in the
[corrections log](about.md#corrections). An open problem gets an issue and a failing check in the model, so
it stays visible until someone solves it.

## Three kinds of issue

**Challenge a number.** Open a
["challenge a number" issue](https://github.com/Xaxis/phosphoros.space/issues/new?template=challenge-a-number.yml).
Name the number's id from the [ledger](numbers.md), say what you think it should be, and show why: a source,
a calculation, or a flaw in the formula. Every row of the ledger links to the line of code that computes it.

**Propose an invention.** Open a
["propose an invention" issue](https://github.com/Xaxis/phosphoros.space/issues/new?template=propose-an-invention.yml).
Say what job it does, what it replaces, what is invented and what already exists, and which numbers it
changes. An invention may assume engineering we do not have. It may never break conservation of energy or
the second law of thermodynamics, and the proposal should show it does not.

**Add a source.** Open an
["add a source" issue](https://github.com/Xaxis/phosphoros.space/issues/new?template=add-a-source.yml), or edit
[`data/sources.yaml`](../data/sources.yaml) directly. Say which claim it supports or contradicts. Primary
sources beat reports of them: version 3 replaced one news item that had a launch date backwards.

## Rerun the numbers

You need Node 24 and pnpm 10.

```sh
pnpm install
pnpm calc                                   # every derived number, then the physics checks
pnpm calc --only veil-distance              # one number: value, formula, inputs, where it is defined
pnpm calc --set foundry-doubling-days=70    # change an assumption and see what follows
pnpm calc --claims                          # every number in the version 2 brief against the model
pnpm test                                   # the model's invariants
pnpm docs                                   # rewrite every number in docs/ from the model
pnpm lint                                   # formatting, types, stale docs, em dashes, hand-typed numbers
```

The model reads measured facts from [`data/constants.yaml`](../data/constants.yaml) and the plan's choices
from [`data/assumptions.yaml`](../data/assumptions.yaml). Each module in
[`calc/src/model/`](../calc/src/model/) computes one system and records the inputs every number read, which
is how the [ledger](numbers.md) can show each formula. The [Explorer](https://phosphoros.space/explore) runs
the same model in your browser, with a slider for every assumption that has a range.

## Open questions

These are the places where the plan is weakest, or least sure of itself. Each is a good first contribution.

1. **Laser cooling at high power.** Laser light has cooled a glass
   ([Epstein et al. 1995](sources.md#epstein-1995-cooling)) and a semiconductor
   ([Zhang et al. 2013](sources.md#zhang-2013-semiconductor)), and an LED has emitted more light than the
   electricity it drew ([Santhanam et al. 2012](sources.md#santhanam-2012)), but only at tiny powers. The
   [Photonic Exhaust](technologies/exhaust.md) needs [1.3 MW/m²](numbers.md#exhaust-flux) from each tile,
   with [99.9%](numbers.md#exhaust-eqe) of its absorbed photons coming back out, and each joule of
   pump light has room to carry only [0.26](numbers.md#exhaust-pump-room-start) J of heat. What limits a real tile, and
   how close it can come to the [50%](numbers.md#exhaust-carnot-share) of the Carnot limit the model charges
   at [3,500 K](numbers.md#exhaust-light-temp), are the most important open numbers in the plan. A physics
   argument that it cannot work would be just as valuable.
2. **How much of a Brick's heat stays in the air.** The model puts all of a Brick's
   [147 MJ/kg](numbers.md#ice-entry-energy-per-kg) into Venus's air, the pumps' to lift. A body that bursts
   high in the air sheds part of its energy as light from its fireball, and some of that light leaves the
   planet. How much, for a megatonne of ice at [17.1 km/s](numbers.md#ice-entry-speed), would set how much
   water Venus can be given: the heat is why it gets seas [2.17 m](numbers.md#ocean-depth) deep, not oceans
   ([Ice Train](technologies/ice-train.md)).
3. **What the drop zones do to the air.** The model's atmosphere shares one temperature, so the Bricks'
   heat spreads over the planet at once. In fact each one bursts with
   [1.5 × 10¹⁷ J](numbers.md#brick-entry-energy) beyond [60°](numbers.md#ice-drop-latitude) of latitude.
   How the polar air carries that heat to the chimneys, and whether the canopies nearest the drop zones are
   safe, needs a regional model of the air.
4. **Working the night side.** The Lattice sees only the sunward half of Venus, so only
   [50%](numbers.md#exhaust-lit-share) of the tiles work at once. A mirror hovering behind Venus cannot relay
   the beams: to hold still its push must point straight away from Venus, and then the beam it sends on misses
   the planet by as much as the beam it takes in. A design that reaches the night side, or a Lattice orbit
   that sees more of it, would halve the tile area.
5. **How much water Ceres has.** The model takes Ceres to be [27%](numbers.md#ceres-water-fraction) water by
   mass, the top of a range estimated before the Dawn mission
   ([McCord and Sotin 2005](sources.md#ceres-water)). Post-Dawn interior models are the next source to
   check. The answer sets how much of Ceres's water the plan uses, now
   [0.39%](numbers.md#ice-ceres-water-share).
6. **Basalt's thermal conductivity.** The model uses [2.5 W/(m·K)](numbers.md#rock-conductivity), the upper
   of two published values for dense basalt ([Robertson 1988](sources.md#basalt-thermal)). It sets the heat
   the crust feeds into the air during cooling and the [12 PW](numbers.md#cryo-floor-load) the
   cryo-continent floors must shed at first. A better value, and how it changes at Venus's surface
   temperature, would tighten both.
7. **How sensitive the cloud-life survey can be.** The gate falls on
   [15 December 2028](numbers.md?date=day#life-gate). What can balloons and droplet sample return flown from
   [June 2027](numbers.md?date=month#survey-start) actually detect, and what would a negative result rule
   out? The gate is only as honest as that answer ([Research Agenda](research.md#the-cloud-life-gate)).

## Pull requests

Run `pnpm lint && pnpm test` first; both must pass. In anything you write: no em dashes anywhere, no number
typed by hand into a document (link it to the ledger instead), and every invention marked as one. The full
conventions, including how to place numbers, figures and generated tables in a document, are in
[CONTRIBUTING.md](../CONTRIBUTING.md).

Code is MIT; text, data and figures are CC BY 4.0. By contributing you agree to license your work the same
way.
