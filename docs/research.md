# Research Agenda

Phosphoros rests on breakthroughs nobody has shown. Before anything flies to Mercury, nine experiments test
the riskiest of them. All start in [2027](numbers.md?date=year#program-start), run in parallel and must pass
by [31 December 2028](numbers.md?date=day#experiments-end). Each has a pass criterion and a kill signal, set
in advance. A kill signal stops the line it tests; one of them stops everything.

<!-- figure:research-gates -->
![The proof experiments and their gates, 2027 and 2028](../figures/svg/research-gates.svg)
<!-- /figure -->

<!-- table:experiments -->
| Experiment | Proves | Pass by [31 December 2028](numbers.md?date=day#experiments-end) | Kill signal |
| --- | --- | --- | --- |
| [Ouroboros-0](technologies/ouroboros.md) | A factory that builds itself from simulated Mercury regolith | [95%](numbers.md#ouroboros-0-closure) mass closure, doubling in under [120 d](numbers.md#ouroboros-0-doubling) | Under [70%](numbers.md#ouroboros-0-kill-closure) closure |
| [Exhaust-1](technologies/exhaust.md) | Electroluminescent cooling at useful power | [10 kW/m²](numbers.md#exhaust-1-cooling) of net cooling, within [50%](numbers.md#exhaust-1-carnot) of the Carnot limit. Then: The production tile must reach [0.91 MW/m²](numbers.md#exhaust-flux) by [2031](numbers.md?date=year#exhaust-production-tile) | No net cooling above [100 W/m²](numbers.md#exhaust-1-kill-cooling) |
| [Lightpipe](technologies/helios.md) | Coherent power beaming | [1 MW](numbers.md#lightpipe-power) over [1,000 km](numbers.md#lightpipe-range) between satellites at [30%](numbers.md#lightpipe-efficiency) end to end | Phase lock fails beyond [100](numbers.md#lightpipe-kill-emitters) emitters |
| [Veil-1](technologies/veil.md) | An electrochromic slat | A [1 km²](numbers.md#veil-1-area) slat in orbit dims from clear to [99%](numbers.md#veil-1-dim) blocked and holds its attitude | The film degrades within [6 months](numbers.md#veil-1-kill-life) |
| [Railhead](technologies/ice-train.md) | An ice mass driver | [1 t](numbers.md#railhead-test-mass) of ice at [3 km/s](numbers.md#railhead-test-speed), [10](numbers.md#railhead-test-rate) shots an hour | Under [1 km/s](numbers.md#railhead-kill-speed), or under [1](numbers.md#railhead-kill-rate) shot an hour |
| [Cryo-seal](technologies/cryo.md) | Dry-ice storage under a [288 K](numbers.md#earth-surface-temp) sky | Under [0.16 W/m²](numbers.md#cryo-leak-flux) of heat leak, what the plan's cap gives, for [12 months](numbers.md#cryo-seal-months) | The cap cracks under thermal cycling |
| [Mini-Aegis](technologies/aegis.md) | A magnetic shield | A [10 m](numbers.md#mini-aegis-coil) coil's bubble deflects the solar wind | Repeated quenches |
| **Cloud-life survey** | No native life will be harmed | Balloon and droplet sample return show no biology | A credible biosignature: the whole program stops |
| [Choir-sim](technologies/choir.md) | Fleet autonomy | [10,000](numbers.md#choir-sim-robots) robots run a factory for [90 d](numbers.md#choir-sim-days) unattended | More than [1](numbers.md#choir-sim-kill-interventions) human intervention a day |
<!-- /table -->

The pass criteria are not the production targets. They are the smallest result that shows the idea works
and that scaling it up is engineering, not a new discovery. The kill signals mark the opposite: a result so
far short that no amount of scaling will close the gap in time.

## What each experiment proves

### Ouroboros-0

A factory on Earth that builds itself from simulated Mercury regolith. It tests the one invention the
whole plan depends on: a machine that makes every one of its own parts, chips included, from rock
([Ouroboros Foundry](technologies/ouroboros.md)). The pass bar is looser than the plan's
[60 d](numbers.md#foundry-doubling-days) doubling, because a first loop only has to show it can close; speed
is engineering. The kill signal is about closure, not speed. On Mercury there is nothing to import, and a
factory that needs a large share of its own mass sent from Earth does not grow exponentially at all. Closure
cannot be engineered in later. Speed can.

### Exhaust-1

Electroluminescent cooling at useful power, in the laboratory. This is the plan's heart: nothing else
removes heat from Venus faster than a plain radiator at the cloud tops can shed it
([Photonic Exhaust](technologies/exhaust.md)). The effect is real but has only been seen at tiny powers:
[6.9 × 10⁻¹¹ W](numbers.md#led-2012-light-out) of light from [3.0 × 10⁻¹¹ W](numbers.md#led-2012-power-in) of
electricity ([Santhanam 2012](sources.md#santhanam-2012)). The kill signal sits at the level a plain radiator already
reaches: a tile that cannot beat passive radiation is not a heat pump worth building. The pass bar is well
above that, and names a distance from the Carnot limit, because the model charges the pump work at the
Carnot minimum, [5.5](numbers.md#exhaust-work-ratio) joules per joule. A real tile will do worse. The Lattice
alone leaves [9.3%](numbers.md#budget-spare) spare, and once the Ring powers the Railheads the spare is
[34%](numbers.md#budget-spare-with-ring), so the plan can absorb a tile somewhat short of ideal, not one far
short, and not yet the full cost of its narrow beam ([open problem](budget.md#physics-checks)). The
production tile must reach [0.91 MW/m²](numbers.md#exhaust-flux) by [2031](numbers.md?date=year#exhaust-production-tile).

### Lightpipe

Coherent power beaming between satellites. The [Helios Lattice](technologies/helios.md) needs emitters
phase-locked into virtual apertures [10 km](numbers.md#helios-aperture) wide, so a beam stays
[46 m](numbers.md#helios-spot) across over [1.2 AU](numbers.md#helios-range). Each aperture is millions of
emitters acting as one. If phase lock fails with only [100](numbers.md#lightpipe-kill-emitters) or so, it will not hold with millions: beams
spread, receivers balloon, and the beam-safety rules, which rely on precise pointing and instant defocus,
cannot be met.

### Veil-1

One electrochromic, light-bending slat in orbit ([Hesperus Veil](technologies/veil.md)). The Veil must
keep [99.9%](numbers.md#veil-block-fraction) of the sunlight off Venus from
[December 2032](numbers.md?date=month#veil-close) to the end of the cooling, and then serve forever as the
planet's thermostat. A film that degrades within months cannot do that, and a Veil that fails after cooling
lets sunlight boil the CO₂ back out. So the kill signal is about lifetime, not performance.

### Railhead

An ice mass driver on Earth. The Ice Train fires Bricks at [6.4 km/s](numbers.md#ice-launch-speed) every
[7.1 s](numbers.md#railhead-interval) from each of its [10,000](numbers.md#railhead-count) coilguns
([Ceres Ice Train](technologies/ice-train.md)). The test asks for a fraction of that speed at a modest
rate; the kill signal marks a speed and a rate so low that the scale-up would be a new invention. The test
must also show that ice survives being thrown: a Brick feels [190 MPa](numbers.md#brick-launch-stress) at
[200 g](numbers.md#railhead-accel), carried by its sock.

### Cryo-seal

Dry ice kept frozen under an Earth-warm sky. The [Cryo-continents](technologies/cryo.md) hold all of
Venus's CO₂ under caps that must leak no more than about [0.16 W/m²](numbers.md#cryo-leak-flux) and last
for decades. The kill signal is cracking under thermal cycling, because a cracked cap is how a sealed sea
gets back into the air.

### Mini-Aegis

A small superconducting coil at the Sun-Earth L1 point that inflates a magnetic bubble against the solar
wind ([Aegis Shield](technologies/aegis.md)). The full coil is [1,000 km](numbers.md#aegis-coil-radius) in
radius and carries [300 A](numbers.md#aegis-current) per strand. If a small coil cannot stay
superconducting in deep space without repeated quenches, a large one will not either.

### Choir-sim

A fleet of robots runs a factory unattended ([Choir](technologies/choir.md)). The plan runs at least
[3.9 × 10⁸](numbers.md#choir-machines) machines across three worlds, with up to [33 min](numbers.md#delay-earth-ceres-max) of light
delay between Earth and Ceres. Humans cannot be in that loop. Any need for intervention that grows with the
number of machines is fatal, so the kill signal is set at a rate a small fleet should never need.

## The cloud-life gate

The cloud-life survey is not a technology test. It answers whether Phosphoros should exist. Venus's clouds,
between [48 km](numbers.md?sig=2#venus-cloud-base) and [70 km](numbers.md?sig=2#venus-cloud-top) up, are
the only part of Venus temperate enough for life as we know it to be imagined there
([Atmosphere of Venus](sources.md#wikipedia-venus-atmosphere)), and cooling the planet would destroy
that habitat completely. There is no partial version of the plan that spares it: the Exhaust canopies
float in the same layer.

The survey flies balloons through the cloud deck and returns droplet samples to look for biology, from
[June 2027](numbers.md?date=month#survey-start) to [December 2028](numbers.md?date=month#survey-end). The
gate falls on [15 December 2028](numbers.md?date=day#life-gate), after the seed foundry has launched but
before it lands on Mercury. A credible biosignature stops the whole program. The real missions flying in
that window cannot settle the question in time ([Precursor Science](precursors.md)), which is why the plan
flies its own.

> **Invented:** The survey as described, with balloons through the cloud deck and droplet samples returned
> to Earth by the end of 2028. None of the real missions on the [Precursor Science](precursors.md) page
> plans either.

A negative result is only as strong as the survey is sensitive. What "no biology" means, what counts as
credible, and who judges it must be fixed and published before the survey flies, not after. Phosphoros
proposes that an independent international panel holds that decision, so that the people who want the
program cannot also be the ones who clear it. How sensitive such a survey can be in two years is an
[open question](contribute.md#open-questions).

## If a gate fails

A kill signal stops the line it tests. Most lines have a substitute that costs a margin, a date or a
redesign, and the model can price each one: change the assumption in the
[Explorer](https://phosphoros.space/explore) and see what follows.

Two lines have no substitute within a decade. If Ouroboros or the Photonic Exhaust fails, the plan falls
back to the multi-century route: a sunshade, a planet that cools by radiating on its own over
[230 yr](numbers.md#passive-years) to [440 yr](numbers.md#passive-cold-years), and a slow build-up of
industry in space, close to Birch's plan ([Birch 1991](sources.md#birch-1991)) and to Phosphoros's own first
version ([About](about.md)). Most of the other proof experiments still pay off on that route, because its
machines are needed sooner or later.

If the cloud-life survey finds life, there is no fallback. Venus is left as it is.
