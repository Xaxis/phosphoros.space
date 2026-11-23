# Risks and Governance

A plan that rebuilds a planet in ten years with self-copying machines, planet-scale beams and mass
drivers carries risks to match. This page lists them, the safeguards the plan builds in, and the questions
no engineering can answer: whether Venus should be changed at all, who decides, and under what law.

<!-- table:risks -->
| Risk | What goes wrong | Safeguard |
| --- | --- | --- |
| Runaway replication | Copies grow past their mandate | A hard mass budget in the Choir Mass Ledger, signed build orders, and an international kill code |
| Beam misdirection | A beam carrying [2.2 × 10²⁰ W](numbers.md#helios-power) hits the wrong target | Every beam fires only with a live, signed handshake from its receiver and defocuses within [1 ms](numbers.md#beam-defocus-time) once the handshake stops arriving. At the longest range the handshake is [9.8 min](numbers.md#helios-handshake-delay) old when it arrives, so light already in flight, aimed where the receiver was, still lands |
| Veil failure after cooling | Sunlight boils the CO₂ back out | [3.8 × 10⁸](numbers.md#veil-slats) independent slats that fail opaque, so a dead slat still shades, and CO₂ sealed in cryo-continents |
| Cryo-continent breach | CO₂ escapes back into the air | [1.5 × 10⁶](numbers.md#cryo-cells) compartments of [100 km²](numbers.md#cryo-cell-area), each with its own seal and refrigeration |
| Ceres depletion | [0.39%](numbers.md#ice-ceres-water-share) of Ceres's water is used and its orbit is changed for good | Agreed internationally in advance; comets from the outer belt as the fallback |
| Native life on Venus | Cooling the planet would destroy it | The 2027 to 2028 cloud-life survey gates the Veil; a credible biosignature stops the program |
| Weaponization | Mass drivers and power beams are also weapons | Open telemetry, inspection, and treaty oversight beyond the Outer Space Treaty |
| The Bricks bring their heat faster than the pumps can lift it | Every kilogram of ice brings [147 MJ/kg](numbers.md#ice-entry-energy-per-kg) as it falls, [1.5 × 10²⁶ J](numbers.md#ice-entry-heat) in all, [28%](numbers.md#ice-entry-vs-atmosphere) of the atmosphere's own heat, and it arrives in ten weeks, several times faster than the lit canopies' chimneys carry heat out; the air warms back [88 K](numbers.md#traj-rewarm) and the first Clear Rain boils back until the pumps catch up. Twice the ice would leave the caps unfinished at the deadline | The model sizes the ice to what the pumps can lift, and the frost-before-sealing check fails before a heavier shipment could cost the deadline; Venus gets seas [2.17 m](numbers.md#ocean-depth) deep, not Earth's oceans |
| A Brick falls outside the drop zones | Each Brick bursts with [1.5 × 10¹⁷ J](numbers.md#brick-entry-energy), about the energy of a large hydrogen bomb; one that strayed onto the canopies would wreck them | The Lattice's lasers steer every Brick in flight, and the drop zones beyond [60°](numbers.md#ice-drop-latitude) of latitude hold no canopies; a Brick off its track is pushed wide of Venus while it is still far out |
| Light cannot cool the tiles at the flux they need | Laser light has cooled solids by tens of kelvin in the laboratory, at milliwatts; each tile must give off [1.3 MW/m²](numbers.md#exhaust-flux) with [99.9%](numbers.md#exhaust-eqe) of its absorbed photons coming back out, at [0.26](numbers.md#exhaust-pump-room-start) of each photon's energy spare for heat | Exhaust-1 measures a tile's real cooling against the pump light before any canopy is built; the plan stops there if it fails |
| The hardware at Venus delays cooling | The tiles, chimneys, receivers and Lanterns weigh [1.9 × 10¹⁴ kg](numbers.md#venus-hardware-mass); the Foundry builds them after the Lattice, in [61 d](numbers.md#venus-hardware-build-days), and cooling waits for them, so a slower build eats the [67 d](numbers.md#frost-sealing-slack) before the last caps | Lighter tiles and chimneys, or an industry at Venus that builds them from the air's own carbon |
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
another world is deliberate, permanent contamination, held back until the new seas have kept a pH of at
least [7.5](numbers.md#genesis-ph-min) for [90 d](numbers.md#genesis-ph-days) and the oxygen is in. Before it happens, the science of the original Venus,
from its deep atmosphere to its surface and interior, should be done and archived. That is one more reason
the [precursor missions](precursors.md) matter.

### Ceres

The water comes from Ceres, a dwarf planet. Shipping [1.0 × 10¹⁸ kg](numbers.md#ice-mass) takes
[0.39%](numbers.md#ice-ceres-water-share) of its water and [0.11%](numbers.md#ice-ceres-mass-share) of its
mass. The water share rests on Ceres being [27%](numbers.md#ceres-water-fraction) water by mass, the top of a
range estimated before the Dawn mission ([McCord and Sotin 2005](sources.md#ceres-water)). If Ceres is
drier, the plan takes a larger share of what is there, though still a small one.

Throwing that mass sunward pushes Ceres the other way, by [0.0071 km/s](numbers.md#ceres-recoil). The model
takes today's orbit as a circle at [2.77 AU](numbers.md#ceres-orbit); the push turns it into an ellipse of
eccentricity [7.9 × 10⁻⁴](numbers.md#ceres-new-eccentricity), out to
[2.77 AU](numbers.md#ceres-new-aphelion) from the Sun, far less than the eccentricity Ceres already has,
which takes it out to [2.98 AU](numbers.md#ceres-aphelion). The change is small, but it is permanent, and it
is still a change to a world that no one program, or one country, should make alone. The safeguard is
agreement in advance, with comets from the outer Solar System as the fallback source of water.

The new orbit stays clear of Jupiter: its farthest point is [2.18 AU](numbers.md#ceres-jupiter-gap) inside
Jupiter's nearest, [6.1](numbers.md#ceres-jupiter-gap-hill) of Jupiter's Hill radii, and its Tisserand
parameter stays above 3 ([3.31](numbers.md#ceres-tisserand)), so Jupiter cannot capture or scatter it in
one pass. The model does not follow resonances; a push this small leaves Ceres's period, and its place
among Jupiter's resonances, nearly where they are today ([Ice Train](technologies/ice-train.md)).

### Weaponization

Everything that makes Phosphoros work could be used to hurt people. The Helios Lattice beams
[2.2 × 10²⁰ W](numbers.md#helios-power) of light, which receivers at Venus take at
[10 MW/m²](numbers.md#helios-receiver-intensity). The Ice Train throws [1 Mt](numbers.md#brick-mass) Bricks
at [6.4 km/s](numbers.md#ice-launch-speed), and their transfer orbits from Ceres to Venus cross Earth's
orbit on the way in. Each one that falls into Venus's air bursts with
[1.5 × 10¹⁷ J](numbers.md#brick-entry-energy), about the energy of a large hydrogen bomb, and one aimed at
Earth would bring much the same.

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
[2.7 × 10¹⁴ kg](numbers.md#foundry-final-mass) in [4.6 yr](numbers.md#foundry-years-to-scale) would not stop
on its own at the mass the plan needs. At full scale the Foundry is only
[8 × 10⁻¹⁰](numbers.md#foundry-mercury-share) of Mercury, so the limit has to be imposed; Mercury will not
impose it.

[Choir](technologies/choir.md)'s safety core imposes it in several independent ways. The Mass Ledger, an
append-only, hash-chained record of every kilogram replicated across sites, sets a hard budget that machines
refuse to exceed. Build orders must carry threshold signatures and are rejected in hardware if unsigned.
Replicators stop on their own if they lose the Ledger's heartbeat for
[7 d](numbers.md#choir-deadman-days). Blueprints are checksummed
every generation, so copying errors cannot accumulate into a drifting design. A kill code held by an
international board halts replication everywhere within one light delay. The replication controller itself
is formally verified.

### What version 4 closed

Version 3 ended with five open problems, each a failing check: the Braking Ring could not lower the ice,
nothing held it against the catch's push, it could not carry its receivers, their loss heat fell on Venus,
and the Exhaust's beamed light carried more entropy than the pumps were charged for. Version 4 closes all
five by changing the design, never the physics. The Ring is gone, and the Bricks fall straight into the air.
The Lattice's light pumps the Exhaust's tiles directly, so only the receivers for the Railheads, the Forges and
the fans remain, and the simulation lifts their loss heat with the rest. The tiles spread their light over
their whole sky, and every pump is charged at the temperature that light counts as,
[3,500 K](numbers.md#exhaust-light-temp). The costs are real: the plan ships a hundredth of the water, the
Lattice grows to [2.2 × 10²⁰ W](numbers.md#helios-power), and the tiles cover
[72%](numbers.md#exhaust-area-share) of Venus. Each fix, and every number it changed, is on the
[About page](about.md#corrections). Today [1](numbers.md#checks-failing) check fails, the version 2 statite,
kept failing on purpose ([Budget](budget.md#physics-checks)).

### The Bricks bring their fall as heat

Nothing catches the Bricks, so every kilogram of ice brings its whole fall into the air,
[147 MJ/kg](numbers.md#ice-entry-energy-per-kg): [1.5 × 10²⁶ J](numbers.md#ice-entry-heat) in all,
[28%](numbers.md#ice-entry-vs-atmosphere) of the atmosphere's own heat. They arrive from
[13 November 2034](numbers.md?date=day#first-arrival) to [23 January 2035](numbers.md?date=day#last-arrival),
after the Clear Rain has begun, into air already below [304.1 K](numbers.md#co2-critical-temp), where every
joule costs the pumps more to lift than at the start. They bring it several times faster than the lit
canopies' chimneys can carry heat out, so the air warms back [88 K](numbers.md#traj-rewarm), warmest on
[11 December 2034](numbers.md?date=day#traj-rewarm-peak), and the first Clear Rain boils back into the air
until the pumps catch up on [30 January 2035](numbers.md?date=day#traj-rerain). Spreading the arrivals over
more months would soften that, but the later Bricks would fall into colder air still, and the frost margin
comes out no better ([Ice Train](technologies/ice-train.md)). The model's air shares one temperature, so it
cannot say how the polar air near the drop zones fares in those weeks. The water the plan ships is sized to
the pumps: twice as much would leave the Frost Towers unfinished when the last caps are due
([check](numbers.md#check-frost-before-sealing)). An ocean in Earth's proportion would bring
[350](numbers.md#ocean-entry-vs-atmosphere) times the atmosphere's heat, so Venus gets seas
[2.17 m](numbers.md#ocean-depth) deep if spread over the globe, gathered in its lowlands, and not Earth's
oceans. More water would need a way to stop the ice that does not turn its fall into heat in the air, and the
Ring showed how hard that is.

### A Brick could fall outside the drop zones

Each Brick bursts in the air with [1.5 × 10¹⁷ J](numbers.md#brick-entry-energy), so the Bricks fall beyond
[60°](numbers.md#ice-drop-latitude) of latitude, north and south, where no canopy floats. At the peak,
[3.86 × 10¹¹ kg/s](numbers.md#ice-arrival-peak-rate) of ice is arriving. One Brick that strayed onto the
canopies would wreck those it hit. The Lattice's lasers steer every Brick in flight by ablation, as the
[Ice Train](technologies/ice-train.md) already assumes, and a Brick that drifts off its track is pushed wide
of Venus while it is still far out, where a small push is enough. The steering is invented, and it has to work
for every Brick, every time.

### Light might not cool the tiles at the flux they need

The [Photonic Exhaust](technologies/exhaust.md)'s tiles are cooled by the light that pumps them: each photon
from the Lattice, at [2.5 µm](numbers.md#helios-wavelength), lies a little below the tiles'
[0.54 eV](numbers.md#exhaust-bandgap) bandgap and leaves as one of the tile's own, a little bluer, carrying
heat with it. Laser light has cooled solids in the laboratory since 1995
([Epstein et al. 1995](sources.md#epstein-1995-cooling)), and a semiconductor since 2013
([Zhang et al. 2013](sources.md#zhang-2013-semiconductor)), but only small samples. Each tile must give off
[1.3 MW/m²](numbers.md#exhaust-flux) with [99.9%](numbers.md#exhaust-eqe) of its absorbed photons coming
back out, and from the hottest air each joule of light has room for only
[0.26](numbers.md#exhaust-pump-room-start) J of heat ([check](numbers.md#check-exhaust-pump-photons)).
[Exhaust-1](research.md) measures a tile's real cooling against its pump light before any canopy is built: it
passes at [10 kW/m²](numbers.md#exhaust-1-cooling) of net cooling, and if it fails, the plan stops there.

### The hardware at Venus delays cooling

The Exhaust's tiles and canopies, the chimneys, the receivers and the Lanterns weigh
[1.9 × 10¹⁴ kg](numbers.md#venus-hardware-mass). The Foundry grows to build them as well as the Lattice,
builds them in [61 d](numbers.md#venus-hardware-build-days), and cooling waits until they reach Venus on
[23 February 2034](numbers.md?date=day#venus-hardware-ready). A slower build takes its days from the
[67 d](numbers.md#frost-sealing-slack) between the Frost Towers finishing and the last caps being sealed
([check](numbers.md#check-frost-before-sealing)). Lighter tiles and chimneys, or an industry at Venus that builds
them from the carbon in its air, would give that time back.

### The seas freeze slowly

At the triple point the CO₂ seas give up their heat of fusion, [210 kJ/kg](numbers.md#co2-fusion-heat), while the air
holds at [216.6 K](numbers.md#co2-triple-temp). With the lit tiles at their peak all the while, the seas start to
freeze on [7 November 2035](numbers.md?date=day#traj-freeze) and are frozen through only on
[30 April 2036](numbers.md?date=day#traj-frozen). The Frost Towers then finish on
[26 June 2036](numbers.md?date=day#traj-scavenged), [67 d](numbers.md#frost-sealing-slack) before the last caps are due
([check](numbers.md#check-frost-before-sealing)), and seeded life greens the seas on
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
[2.2 × 10²⁰ W](numbers.md#helios-power) of beams across the inner Solar System.

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
