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

1. **Holding the Ring against the catch.** Catching half the Bricks eastbound and half westbound cancels the
   twist on the [Braking Ring](technologies/ring.md), not the push: every Brick arrives from the same
   direction, so [6.0 × 10¹⁶ N](numbers.md#ring-net-braking-force) remains along Venus's orbit,
   [2,000](numbers.md#ring-net-overload) times the rotor's spare lift. A solution must hand that force to Venus,
   or catch the ice some other way that keeps its heat out of the air
   ([issue 3](https://github.com/Xaxis/phosphoros.space/issues/3), [Risks](risks.md#nothing-yet-holds-the-ring-against-the-catch)).
2. **Lowering the ice.** Lowering the caught ice on tethers needs [150](numbers.md#lowering-overload) times the
   lift the Ring's rotor has to spare. A solution must bring [1.0 × 10²⁰ kg](numbers.md#ice-mass) to the
   surface by the deadline without exceeding the Ring's lift, or show how the cooling absorbs the
   [2.5 × 10²⁶ J](numbers.md#ring-drop-extra-heat) of extra heat if the Bricks are simply dropped. The options
   so far are on [Risks](risks.md#the-ring-cannot-yet-lower-the-ice)
   ([issue 2](https://github.com/Xaxis/phosphoros.space/issues/2)).
3. **How much water Ceres has.** The model takes Ceres to be [27%](numbers.md#ceres-water-fraction) water by
   mass, the top of a range estimated before the Dawn mission
   ([McCord and Sotin 2005](sources.md#ceres-water)). Post-Dawn interior models are the next source to
   check. The answer sets how much of Ceres's water the plan uses, now
   [39%](numbers.md#ice-ceres-water-share).
4. **Basalt's thermal conductivity.** The model uses [2.5 W/(m·K)](numbers.md#rock-conductivity), the upper
   of two published values for dense basalt ([Robertson 1988](sources.md#basalt-thermal)). It sets the heat
   the crust feeds into the air during cooling and the [12 PW](numbers.md#cryo-floor-load) the
   cryo-continent floors must shed at first. A better value, and how it changes at Venus's surface
   temperature, would tighten both.
5. **Electroluminescent cooling at high power.** An LED has emitted more light than the electricity it drew
   ([Santhanam et al. 2012](sources.md#santhanam-2012)), and thermophotonic transfer has been measured in
   laboratory structures ([Casado et al. 2019](sources.md#casado-2019)), but only at tiny powers. The plan needs
   [0.37 MW/m²](numbers.md#exhaust-flux), and the model charges the pump work at
   [50%](numbers.md#exhaust-carnot-share) of the Carnot limit for emitters at an effective
   [1,600 K](numbers.md#exhaust-effective-temp). Light squeezed into the tiles'
   narrow band and cone carries so little entropy that the true minimum is
   [9.6](numbers.md#exhaust-work-multiple) times that ([issue 4](https://github.com/Xaxis/phosphoros.space/issues/4)).
   A tile that spreads its light over more colours and directions while it still escapes the air, what
   limits a real tile, and how close to its minimum it can get, are the most important open numbers in the
   plan. A physics argument that it cannot work would be just as valuable.
6. **How sensitive the cloud-life survey can be.** The gate falls on
   [15 December 2028](numbers.md?date=day#life-gate). What can balloons and droplet sample return flown from
   [June 2027](numbers.md?date=month#survey-start) actually detect, and what would a negative result rule
   out? The gate is only as honest as that answer ([Research Agenda](research.md#the-cloud-life-gate)).
7. **Radiators that do not shine on Venus.** Fins near the planet send about
   [28%](numbers.md#ring-fin-venus-share) of their light onto it, [2.7 × 10¹⁹ W](numbers.md#loss-heat-into-venus)
   at full power. A radiator design, with its mass, that sheds the receivers' and the catch's loss heat while
   sending under about a percent into Venus would close it
   ([issue 14](https://github.com/Xaxis/phosphoros.space/issues/14),
   [Risks](risks.md#the-receivers-and-the-rings-loss-heat-falls-on-venus)).
8. **Where the receivers go.** The receivers, fins and catch radiators weigh
   [12](numbers.md#ring-equipment-overload) times what the Ring's rotor can hold up. A lighter receiver, a
   different home for them, or a Ring that carries them, sized with its mass and its effect on the schedule
   ([issue 15](https://github.com/Xaxis/phosphoros.space/issues/15)).

## Pull requests

Run `pnpm lint && pnpm test` first; both must pass. In anything you write: no em dashes anywhere, no number
typed by hand into a document (link it to the ledger instead), and every invention marked as one. The full
conventions, including how to place numbers, figures and generated tables in a document, are in
[CONTRIBUTING.md](../CONTRIBUTING.md).

Code is MIT; text, data and figures are CC BY 4.0. By contributing you agree to license your work the same
way.
