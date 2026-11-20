# Risks and Governance

A plan that rebuilds a planet in ten years with self-copying machines, planet-scale beams and mass
drivers carries risks to match. This page lists them, the safeguards the plan builds in, and the questions
no engineering can answer: whether Venus should be changed at all, who decides, and under what law.

<!-- table:risks -->
| Risk | What goes wrong | Safeguard |
| --- | --- | --- |
| Runaway replication | Copies grow past their mandate | A hard mass budget in the Choir Mass Ledger, signed build orders, and an international kill code |
| Beam misdirection | A beam carrying [7.0 × 10¹⁹ W](numbers.md#helios-power) hits the wrong target | Every beam fires only with a live, signed handshake from its receiver and defocuses within a millisecond if it drops |
| Veil failure after cooling | Sunlight boils the CO₂ back out | [3.8 × 10⁸](numbers.md#veil-slats) independent slats with 20% spare, slats that fail opaque, and CO₂ sealed in cryo-continents |
| Cryo-continent breach | CO₂ escapes back into the air | [1.5 × 10⁶](numbers.md#cryo-cells) compartments of [100 km²](numbers.md#cryo-cell-area), each with its own seal and refrigeration |
| Ceres depletion | [39%](numbers.md#ice-ceres-water-share) of Ceres's water is used and its orbit is changed for good | Agreed internationally in advance; comets from the outer belt as the fallback |
| Native life on Venus | Cooling the planet would destroy it | The 2027 to 2028 cloud-life survey gates the Veil; a credible biosignature stops the program |
| Weaponization | Mass drivers and power beams are also weapons | Open telemetry, inspection, and treaty oversight beyond the Outer Space Treaty |
| The Ring cannot lower the ice as designed (open) | Tether lowering needs [150](numbers.md#lowering-overload) times the lift the rotor has to spare (an open problem in version 3) | Drop the ice from rest at the Ring and pump out the extra heat; the energy budget never counted lowering's recovered energy |
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
[0.76 km/s](numbers.md#ceres-recoil), and its farthest point from the Sun moves from
[2.98 AU](numbers.md#ceres-aphelion) to [3.29 AU](numbers.md#ceres-new-aphelion). Ceres stays in the
asteroid belt, farther from Earth than before, but the change is permanent: the plan moves a world. That
is not a decision one program, or one country, can make. The safeguard is agreement in advance, with comets
from the outer Solar System as the fallback source of water.

### Weaponization

Everything that makes Phosphoros work could be used to hurt people. The Helios Lattice delivers
[7.0 × 10¹⁹ W](numbers.md#helios-power), in beams that receivers take at
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
[1.3 × 10¹⁴ kg](numbers.md#foundry-final-mass) in [4.4 yr](numbers.md#foundry-years-to-scale) would not stop
on its own at the mass the plan needs. At full scale the Foundry is only
[4 × 10⁻¹⁰](numbers.md#foundry-mercury-share) of Mercury, so the limit has to be imposed; Mercury will not
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
[Braking Ring](technologies/ring.md) catches the ice well. Lowering it does not work as designed: bringing
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

Planetary protection is governed in practice by COSPAR's policy ([COSPAR](sources.md#cospar-pp)), which sets
requirements by target and mission type to keep spacecraft from contaminating the places scientists want to
study, and Earth from returned samples. It was written for probes. Nothing in the treaty or the policy
contemplates rebuilding a planet, moving a dwarf planet's orbit or aiming
[7.0 × 10¹⁹ W](numbers.md#helios-power) of beams across the inner Solar System.

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
