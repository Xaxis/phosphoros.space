# Risks and Governance

A plan that rebuilds a planet in ten years with self-copying machines, planet-scale beams and mass
drivers carries risks to match. This page lists them, the safeguards the plan builds in, and the questions
no engineering can answer: whether Venus should be changed at all, who decides, and under what law.

<!-- table:risks -->
| Risk | What goes wrong | Safeguard |
| --- | --- | --- |
| Runaway replication | Copies grow past their mandate | A hard mass budget in the Choir Mass Ledger, signed build orders, and an international kill code |
| Beam misdirection | A beam carrying [8.5 × 10¹⁹ W](numbers.md#helios-power) hits the wrong target | Every beam fires only with a live, signed handshake from its receiver and defocuses within [1 ms](numbers.md#beam-defocus-time) once the handshake stops arriving. At the longest range the handshake is [9.8 min](numbers.md#helios-handshake-delay) old when it arrives, so light already in flight, aimed where the receiver was, still lands |
| Veil failure after cooling | Sunlight boils the CO₂ back out | [3.8 × 10⁸](numbers.md#veil-slats) independent slats that fail opaque, so a dead slat still shades, and CO₂ sealed in cryo-continents |
| Cryo-continent breach | CO₂ escapes back into the air | [1.5 × 10⁶](numbers.md#cryo-cells) compartments of [100 km²](numbers.md#cryo-cell-area), each with its own seal and refrigeration |
| Ceres depletion | [39%](numbers.md#ice-ceres-water-share) of Ceres's water is used and its orbit is changed for good | Agreed internationally in advance; comets from the outer belt as the fallback |
| Native life on Venus | Cooling the planet would destroy it | The 2027 to 2028 cloud-life survey gates the Veil; a credible biosignature stops the program |
| Weaponization | Mass drivers and power beams are also weapons | Open telemetry, inspection, and treaty oversight beyond the Outer Space Treaty |
| The Ring cannot lower the ice as designed (open) | Tether lowering needs [150](numbers.md#lowering-overload) times the lift the rotor has to spare (an open problem in version 3) | Drop the ice from rest at the Ring and pump out the extra heat; the energy budget never counted lowering's recovered energy |
| Nothing holds the Ring against the catch (open) | The catch leaves [8.4 × 10¹⁵ N](numbers.md#ring-net-braking-force) along Venus's orbit, [280](numbers.md#ring-net-overload) times the rotor's spare lift, and an orbital ring has no stiff way to hand it to the planet (an open problem in version 3) | None yet. Braking the ice in the air instead would turn its motion into heat, so the problem must be solved before the first catch |
| The Exhaust's light costs more than the model charges (open) | Light in the tiles' narrow band and cone needs [12](numbers.md#exhaust-work-multiple) times the pump work the budget charges (an open problem in version 3) | Tiles that spread their light over more colours and directions while it still escapes the air; Exhaust-1 measures the real cost before any canopy is built |
<!-- /table -->

## Ethics

### The native-life gate

If anything lives in Venus's clouds, cooling the planet kills it. That would be the first life found
beyond Earth, and possibly a second, independent origin of life. Its value to science, and in itself,
outweighs a second Earth. So Phosphoros treats a credible biosignature as an absolute stop, not a cost to
be weighed. The cloud-life survey runs from [June 2027](numbers.md?date=month#survey-start) to
[December 2028](numbers.md?date=month#survey-end), and the gate falls on
[15 December 2028](numbers.md?date=day#life-gate), before the seed foundry lands on Mercury and years before
the Veil closes. How the survey works and who should judge it are on the
[Research Agenda](research.md#the-cloud-life-gate).

The gate covers native life. It does not cover what the plan does to Venus as an object of study. Venus is
the clearest example of a runaway greenhouse in the Solar System, and once it is cooled, frozen and seeded
with [Genesis Biota](technologies/genesis.md), its original state is gone for good. Seeding Earth life on
another world is deliberate, permanent contamination, held back until the new oceans have kept a pH of at
least [7.5](numbers.md#genesis-ph-min) for [90 d](numbers.md#genesis-ph-days) and the oxygen is in. Before it happens, the science of the original Venus,
from its deep atmosphere to its surface and interior, should be done and archived. That is one more reason
the [precursor missions](precursors.md) matter.

### Ceres

The water comes from Ceres, a dwarf planet. Shipping [1.0 × 10²⁰ kg](numbers.md#ice-mass) takes
[39%](numbers.md#ice-ceres-water-share) of its water and [11%](numbers.md#ice-ceres-mass-share) of its
mass. The water share rests on Ceres being [27%](numbers.md#ceres-water-fraction) water by mass, the top of a
range estimated before the Dawn mission ([McCord and Sotin 2005](sources.md#ceres-water)). If Ceres is
drier, the plan takes a larger share of what is there.

Throwing that much mass sunward pushes Ceres the other way. Its speed changes by
[0.76 km/s](numbers.md#ceres-recoil), which stretches its orbit. The model takes today's orbit as a circle at
[2.77 AU](numbers.md#ceres-orbit); the push turns it into an ellipse from [2.77 AU](numbers.md#ceres-orbit) to
[3.29 AU](numbers.md#ceres-new-aphelion) from the Sun. (The real orbit is already a little eccentric, out to
[2.98 AU](numbers.md#ceres-aphelion).) Ceres stays in the asteroid belt, farther from
Earth than before, but the change is permanent: the plan moves a world. That is not a decision one program,
or one country, can make. The safeguard is agreement in advance, with comets
from the outer Solar System as the fallback source of water.

The new orbit stays clear of Jupiter: its farthest point is [1.66 AU](numbers.md#ceres-jupiter-gap) inside
Jupiter's nearest, [4.7](numbers.md#ceres-jupiter-gap-hill) of Jupiter's Hill radii, and its Tisserand
parameter stays above 3 ([3.21](numbers.md#ceres-tisserand)), so Jupiter cannot capture or scatter it in
one pass. The model does not follow resonances. The new orbit sits on Jupiter's weak 9:4 resonance, and
only a long numerical integration can show it stays stable for millions of years; that must be done before
the first shot ([Ice Train](technologies/ice-train.md#clear-of-jupiter)).

### Weaponization

Everything that makes Phosphoros work could be used to hurt people. The Helios Lattice delivers
[8.5 × 10¹⁹ W](numbers.md#helios-power), in beams that receivers take at
[10 MW/m²](numbers.md#helios-receiver-intensity). The Ice Train throws [1 Mt](numbers.md#brick-mass) Bricks
at [6.4 km/s](numbers.md#ice-launch-speed), and their transfer orbits from Ceres to Venus cross Earth's
orbit on the way in. The Ring's rotor stores the energy of [7.0 × 10¹² kg](numbers.md#ring-rotor-mass)
moving at [10 km/s](numbers.md#ring-rotor-speed).

The safeguards are physical as well as legal. A Lattice beam fires only while its receiver returns a live,
signed handshake, and defocuses within [1 ms](numbers.md#beam-defocus-time) if the handshake drops; no beam
path may come within [0.01 AU](numbers.md#beam-keep-out) of Earth or a crewed craft. Every Brick's trajectory must be shown to miss Earth with a wide margin before
launch, Bricks carry nothing but a laser retroreflector, and the Lattice can nudge them off course by laser
ablation. Telemetry is open, the hardware is open to inspection, and the kill codes are held
internationally. None of this removes the risk. It makes misuse visible and slow, and it only works if the
governance exists before the hardware does.

> **Invented:** The handshake-gated beams, Brick retargeting by ablation, and the Choir safety core below.
> None exists at this scale.

### Runaway replication

A factory that copies itself every [60 d](numbers.md#foundry-doubling-days) is the plan's engine and its
most obvious danger. The same exponential that grows a [1,000 t](numbers.md#foundry-seed-mass) seed into
[6.7 × 10¹³ kg](numbers.md#foundry-final-mass) in [4.3 yr](numbers.md#foundry-years-to-scale) would not stop
on its own at the mass the plan needs. At full scale the Foundry is only
[2 × 10⁻¹⁰](numbers.md#foundry-mercury-share) of Mercury, so the limit has to be imposed; Mercury will not
impose it.

[Choir](technologies/choir.md)'s safety core imposes it in several independent ways. The Mass Ledger, an
append-only, hash-chained record of every kilogram replicated across sites, sets a hard budget that machines
refuse to exceed. Build orders must carry threshold signatures and are rejected in hardware if unsigned.
Replicators stop on their own if they lose the Ledger's heartbeat for
[7 d](numbers.md#choir-deadman-days). Blueprints are checksummed
every generation, so copying errors cannot accumulate into a drifting design. A kill code held by an
international board halts replication everywhere within one light delay. The replication controller itself
is formally verified.

### The Ring cannot yet lower the ice

This is an open problem in version 3, tracked by a [failing check](budget.md#physics-checks). The
[Braking Ring](technologies/ring.md) recovers the ice's energy as it catches it, though nothing yet holds it
against the catch's push ([below](#nothing-yet-holds-the-ring-against-the-catch)). Lowering the ice does not
work as designed either: bringing
[2.2 × 10¹² kg/s](numbers.md#lowering-rate) to rest and down the tethers needs
[4.7 × 10¹⁵ N](numbers.md#lowering-support), [150](numbers.md#lowering-overload) times the
[3.0 × 10¹³ N](numbers.md#ring-lift) of lift the rotor has to spare. Each option has a cost.

- **Drop the Bricks from rest at the Ring.** Each kilogram then falls
  [3.3 MJ/kg](numbers.md#ring-drop-energy) instead of [0.87 MJ/kg](numbers.md#fall-energy), adding
  [2.5 × 10²⁶ J](numbers.md#ring-drop-extra-heat) of heat, a large fraction of the
  [5.3 × 10²⁶ J](numbers.md#atmosphere-heat) the whole cooling campaign removes. It arrives while the air is
  cold, where pumping it out costs several joules of work per joule, and the simulation does not include it
  yet.
- **Lower more slowly.** The force needed falls with the rate, but the oceans would then fill after the
  deadline.
- **Build a far heavier, faster rotor.** More mass from the Foundry, and more energy stored in orbit above
  a planet.

The energy budget never counted the energy that lowering would recover, so this problem does not change it. A tether
that fails drops its Brick, which is the first option for that Brick: safe for Venus, costly in heat. The
problem is open for [contributions](contribute.md#open-questions).

### Nothing yet holds the Ring against the catch

Also open, and also a [failing check](numbers.md#check-ring-net-force). Catching half the Bricks eastbound and half
westbound cancels the twist the catch puts on the Ring, not its push: every Brick arrives from the same direction, so
[8.4 × 10¹⁵ N](numbers.md#ring-net-braking-force) remains along Venus's orbital motion,
[280](numbers.md#ring-net-overload) times the rotor's spare lift. An orbital ring has no stiff way to hand that force
to the planet. The energy the catch recovers is real, and the budget counts it; what holds the Ring in place while it
does is unsolved ([issue 3](https://github.com/Xaxis/phosphoros.space/issues/3)). This matters more than the
[33%](numbers.md#budget-spare-with-ring) spare the Ring's energy adds to the budget. There is no other way to stop the
ice above the air: braked in the atmosphere instead, the Bricks would turn their motion into
[9.5 × 10²⁷ J](numbers.md#ring-free-fall-impact) of heat, more than the Lattice delivers in the whole campaign
([9.2 × 10²⁷ J](numbers.md#helios-supply)). Without an answer, the water cannot be delivered as planned.

### The Exhaust's light costs more than the model charges

The [Photonic Exhaust](technologies/exhaust.md#the-cost-of-beamed-light) beams its heat away as light so concentrated
in colour and direction that, by its entropy, it counts as at least
[16,000 K](numbers.md#exhaust-light-temp). Pumping heat into such light takes
[12](numbers.md#exhaust-work-multiple) times the work the budget charges, a [failing check](numbers.md#check-exhaust-entropy)
and the biggest unpriced cost in the plan ([issue 4](https://github.com/Xaxis/phosphoros.space/issues/4)). Either the
tiles spread their light far wider, which the thin air above the canopies must then let through, or the pumps and the
Lattice grow several times. [Exhaust-1](research.md) must settle which: its pass mark counts only light in a band and
cone that the air above the canopies lets through.

### The seas freeze slowly

At the triple point the CO₂ seas give up their heat of fusion, [210 kJ/kg](numbers.md#co2-fusion-heat), while the air
holds at [216.6 K](numbers.md#co2-triple-temp). With the emitters at their peak and the falling ice adding heat all the
while, they are frozen through only on [27 March 2036](numbers.md?date=day#traj-frozen). The Frost Towers then finish on
[28 June 2036](numbers.md?date=day#traj-scavenged), [65 d](numbers.md#frost-sealing-slack) before the last caps are due
([check](numbers.md#check-frost-before-sealing)), and seeded life greens the oceans on
[12 December 2036](numbers.md?date=day#genesis-end), before the deadline
([check](numbers.md#check-genesis-by-deadline)). Both margins rest on the Exhaust reaching its full peak: at a tenth
less, both checks fail. The [Budget](budget.md#how-much-room-the-plan-has) shows how far the peak, and every other
assumption, can fall before they do.

## The treaties

The 1967 Outer Space Treaty ([UNOOSA](sources.md#outer-space-treaty)) is the law that applies, and several
of its articles bear directly on Phosphoros.

- **Article I:** exploring and using space is for the benefit of all countries, the province of all
  humankind. A rebuilt Venus would have to be too.
- **Article II:** no nation may appropriate a celestial body, by claim, use, occupation or any other means.
  Not Venus, not its new land, not Ceres.
- **Article IV:** no weapons of mass destruction in orbit, and celestial bodies are for peaceful purposes
  only. Beams and mass drivers are not named, but their capacity is the point of the article.
- **Articles VI and VII:** states are responsible for their national activities in space, including those of
  companies, which need authorization and continuing supervision, and a launching state is liable for the
  damage its objects cause.
- **Article IX:** states must avoid the harmful contamination of celestial bodies, and consult others before
  any activity that could harmfully interfere with theirs.
- **Article XI:** states should inform the United Nations, the public and scientists of what they do and
  find.

The Environmental Modification Convention, ENMOD ([United Nations](sources.md#enmod)), is the other
treaty that names what Phosphoros does. It bans the hostile use of any technique that changes "the dynamics,
composition or structure of the earth" or "of outer space", and protects peaceful use. It was written
against weather warfare on Earth, but its words cover a Lattice, an Ice Train and a Veil turned on another
state, and so it is a starting point for the oversight the weaponization safeguards need.

Planetary protection is governed in practice by COSPAR's policy ([COSPAR](sources.md#cospar-pp)), which sets
requirements by target and mission type to keep spacecraft from contaminating the places scientists want to
study, and Earth from returned samples. It was written for probes. Nothing in the treaty or the policy
contemplates rebuilding a planet, moving a dwarf planet's orbit or aiming
[8.5 × 10¹⁹ W](numbers.md#helios-power) of beams across the inner Solar System.

### What a new framework needs

Phosphoros needs a new international agreement, built out from COSPAR's policy and the treaty, in place
before the seed launches on [1 October 2028](numbers.md?date=day#foundry-seed-launch). At least:

1. **A mandate.** A decision, taken by an international body and not by a program, that Venus may be
   changed at all.
2. **The life gate.** Criteria for a credible biosignature, an independent panel to judge it, and all survey
   data public, fixed before the survey flies.
3. **Ceres.** Consent to use its water and change its orbit, and a fallback if consent is refused.
4. **Beams and mass drivers.** Open telemetry, inspection, verified interlocks, keep-out zones around Earth
   and crewed craft, and multinational custody of the kill codes.
5. **Replication.** The Mass Ledger and the Foundry's kill code under the same international custody.
6. **Liability.** Who answers for a Veil failure, a breached cryo-continent or a stray Brick, under
   Articles VI and VII.
7. **The new world.** Who may live on Venus, and how its benefits are shared, consistent with Articles I and
   II.
