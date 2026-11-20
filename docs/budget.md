# Energy and Mass Budget

Phosphoros is an energy plan before it is anything else. This page shows where every joule comes from and
where it goes, and checks that supply covers demand. It does, narrowly. The numbers come from
[calc/src/model/budget.ts](../calc/src/model/budget.ts) and the modules it reads; the [ledger](numbers.md)
gives each one's formula and inputs.

## The energy budget

<!-- table:budget -->
| Task | Energy the Lattice delivers |
| --- | --- |
| Launch 10²⁰ kg of ice from Ceres | [4.1 × 10²⁷ J](numbers.md#ice-launch-energy) |
| Heat-pump work to cool Venus | [3.5 × 10²⁷ J](numbers.md#traj-pump-energy) |
| Warm the air and melt the last ice | [3.8 × 10²⁵ J](numbers.md#traj-warm-energy) |
| Forge 0.25 bar of oxygen | [2.7 × 10²⁵ J](numbers.md#forge-energy) |
| Build all hardware | [10²² J](numbers.md#hardware-energy) |
| **Total demand** | **[7.7 × 10²⁷ J](numbers.md#budget-demand)** |
| Supply: the Lattice from full power to the deadline | [7.8 × 10²⁷ J](numbers.md#helios-supply) |
| Spare | [1.7%](numbers.md#budget-spare) |
| Spare once the Ring powers the Railheads | [28%](numbers.md#budget-spare-with-ring) |
<!-- /table -->

<!-- figure:lattice-budget -->
![Energy the Helios Lattice must deliver, against its supply](../figures/svg/lattice-budget.svg)
<!-- /figure -->

The plan must deliver [7.7 × 10²⁷ J](numbers.md#budget-demand) to Venus and Ceres from outside. The Helios
Lattice supplies [7.8 × 10²⁷ J](numbers.md#helios-supply): [7.0 × 10¹⁹ W](numbers.md#helios-power) for the
[3.5 yr](numbers.md#helios-supply-years) from full power in [June 2033](numbers.md?date=month#helios-full-power)
to the deadline. That leaves [1.7%](numbers.md#budget-spare) spare on the Lattice alone, and
[28%](numbers.md#budget-spare-with-ring) once the Braking Ring's recovered energy powers the Railheads.
Launching the water and pumping out the heat take [98%](numbers.md#budget-launch-share) of the Lattice's
output; oxygen and hardware are small change.

The supply side is conservative. It counts only the full-power years, while the simulation also uses the
Lattice's growing output from [January 2033](numbers.md?date=month#cooling-start). The budget charges the
work done with that early power but does not credit the power itself.

<!-- figure:energy-sankey -->
![Energy flows of the Phosphoros campaign, to the deadline](../figures/svg/energy-sankey.svg)
<!-- /figure -->

## Calculation walkthrough

### The atmosphere's heat

The heat to remove is Q = M c_p ΔT + M_CO₂ L. The whole atmosphere,
[4.8 × 10²⁰ kg](numbers.md#venus-atmosphere-mass) with a heat capacity of
[1,000 J/(kg·K)](numbers.md#co2-cp), cools from [737 K](numbers.md#venus-surface-temp) to
[195 K](numbers.md?sig=3#freeze-target-temp): [2.6 × 10²⁶ J](numbers.md#atmosphere-sensible-heat). Its
[4.69 × 10²⁰ kg](numbers.md#venus-co2-mass) of CO₂ gives up [571 kJ/kg](numbers.md#co2-deposition-heat)
as it condenses and freezes: [2.7 × 10²⁶ J](numbers.md#atmosphere-latent-heat). Together,
[5.3 × 10²⁶ J](numbers.md#atmosphere-heat).

This heat is Venus's own. It leaves the planet as light, [5.3 × 10²⁶ J](numbers.md#venus-heat-out) of it,
and the Lattice does not supply it. The Lattice pays for moving it.

### Pump work and the Carnot factor

> **Physics:** A heat pump that moves heat dQ from a cold side at T_c to a hot side at T_h needs at least
> dW = dQ (T_h / T_c − 1) of work. No machine does better.

The hot side is the emitter's effective temperature, [2,000 K](numbers.md#exhaust-effective-temp). That is
what it takes for a tile to shine [0.91 MW/m²](numbers.md#exhaust-flux), so that a manageable area of
emitters can carry the load. The cold side is the air itself, which starts at
[737 K](numbers.md#venus-surface-temp) and ends at [195 K](numbers.md?sig=3#freeze-target-temp). Summing
dW along the cooling path gives [1.0 × 10²⁷ J](numbers.md#exhaust-work-sensible) for the sensible cooling
and [1.8 × 10²⁷ J](numbers.md#exhaust-work-latent) for the latent heat, which comes out when the air is
cold and each joule is dearest: [2.83 × 10²⁷ J](numbers.md#exhaust-work) in all, or
[5.4](numbers.md#exhaust-work-ratio) joules of work per joule of heat moved.

The effective temperature is a trade. Cooler emitters need less work per joule but far more area: at the
coolest option the model tries, emitters would cover [58%](numbers.md#exhaust-area-share-1000) of Venus; at
the hottest, [3.7%](numbers.md#exhaust-area-share-2500), for more work. The ledger lists each option's
temperature. The Exhaust throws the heat and the work into space together,
[3.4 × 10²⁷ J](numbers.md#exhaust-rejected), an average of [3.0 × 10¹⁹ W](numbers.md#exhaust-rejected-avg)
over the [3.5 yr](numbers.md#cooling-seconds) campaign.

### Why the simulation pumps more

The budget does not charge [2.83 × 10²⁷ J](numbers.md#exhaust-work). It charges what the day-by-day
[simulation](plan.md#the-simulated-atmosphere) actually spends, [3.5 × 10²⁷ J](numbers.md#traj-pump-energy).
The difference has three causes.

- **Heat keeps arriving.** During the campaign [7.5 × 10²⁵ J](numbers.md#traj-heat-added) enters the air
  from the crust, from the Forges' waste heat, from ice falling the last
  [100 km](numbers.md#lowering-release-altitude), and from the sunlight the closed Veil lets through.
- **It arrives when pumping is dearest.** Much of that heat comes late, when the air is near
  [195 K](numbers.md?sig=3#freeze-target-temp) and every joule costs more work than the campaign's average
  of [5.4](numbers.md#exhaust-work-ratio). The air is also held cold for weeks while the caps are sealed.
- **The Frost Towers.** Trapping the last [5.4 × 10¹⁸ kg](numbers.md#frost-residual-co2) of CO₂ at
  [133 K](numbers.md#frost-tower-temp) takes about [4.3 × 10²⁵ J](numbers.md#frost-work) more.

After the caps are sealed, the beamed power also warms the air and melts the ice that was lowered while the
air was below freezing: [3.8 × 10²⁵ J](numbers.md#traj-warm-energy). Version 2 charged only the simple
estimate; counting the simulation is most of why the demand rose
([correction](about.md#corrections)).

### Launching the ice

Each Brick leaves Ceres at [6.4 km/s](numbers.md#ice-launch-speed). Its motion energy is ½v² per kilogram,
and the Railheads turn electricity into motion at [50%](numbers.md#railhead-efficiency), so each kilogram
draws [41 MJ/kg](numbers.md#launch-energy-per-kg). For [1.0 × 10²⁰ kg](numbers.md#ice-mass) of ice that is
[4.1 × 10²⁷ J](numbers.md#ice-launch-energy), drawn at [5.6 × 10¹⁹ W](numbers.md#railhead-power) while the
campaign runs.

### Ring recovery and gravity

The ice reaches Venus at [9.08 km/s](numbers.md#ice-vinf) relative to the planet and speeds up to
[13.5 km/s](numbers.md#ring-arrival-speed) by the Ring's height. Braking it to orbital speed,
[7.1 km/s](numbers.md#ring-orbital-speed), frees [66.4 MJ/kg](numbers.md#ring-catch-energy-per-kg), of which
[80%](numbers.md#ring-recovery-efficiency) becomes electricity: [53 MJ/kg](numbers.md#ring-recovered-per-kg),
or [5.3 × 10²⁷ J](numbers.md#ring-recovered-energy) for all the ice. That is
[1.3](numbers.md#ring-vs-launch) times what the launches drew.

> **Physics:** This is not free energy. The ice falls from Ceres's orbit at
> [2.77 AU](numbers.md#ceres-orbit) to Venus's at [0.723 AU](numbers.md#venus-orbit), deep into the Sun's
> gravity well, then into Venus's own well down to the Ring. Gravity adds
> [4.6 × 10²⁷ J](numbers.md#ice-solar-gain) to its motion between launch and catch. The Ring harvests
> energy gravity gave the ice.

The budget counts it like this. Until the first Brick is caught on
[17 August 2034](numbers.md?date=day#ring-pays-from), the Lattice powers the Railheads, which costs it
[2.0 × 10²⁷ J](numbers.md#budget-lattice-launch). After that the Ring powers them, so the Lattice delivers
only [5.6 × 10²⁷ J](numbers.md#budget-demand-with-ring), leaving [28%](numbers.md#budget-spare-with-ring)
spare. Counted instead as extra supply, the Ring brings the total to
[1.3 × 10²⁸ J](numbers.md#budget-supply-total) and the spare to [42%](numbers.md#budget-spare-total). The
budget never counts the further [2.0 × 10²⁷ J](numbers.md#ring-lowering-recovery) that slowing the parked
ice to rest would recover, because lowering the ice is an [open problem](#physics-checks).

### Forging the oxygen

Splitting a mole of CO₂ into carbon and oxygen takes at least [394 kJ/mol](numbers.md#co2-split-enthalpy).
At [60%](numbers.md#forge-efficiency) efficiency the Forges spend [656 kJ/mol](numbers.md#forge-energy-per-mol).
Making [4.1 × 10¹⁹ mol](numbers.md#o2-moles) of oxygen therefore takes
[2.7 × 10²⁵ J](numbers.md#forge-energy), [4.8 × 10¹⁷ W](numbers.md#forge-power) for
[21 months](numbers.md#forge-seconds). The [1.1 × 10²⁵ J](numbers.md#forge-waste-heat) lost as heat goes
into the air, and the simulation pumps it out.

### Building the hardware

The plan's hardware, about [1.0 × 10¹⁴ kg](numbers.md#foundry-target-mass), costs
[100 MJ/kg](numbers.md#foundry-energy-per-kg) to make from regolith: [10²² J](numbers.md#hardware-energy),
a rounding error. Once the Foundry runs, matter is cheap. Energy is the cost.

## The mass budget

<!-- table:mass -->
| Mass item | Amount | From |
| --- | --- | --- |
| Ouroboros machinery at peak | [1.3 × 10¹⁴ kg](numbers.md#foundry-final-mass) | Mercury regolith |
| Helios Lattice | [5.1 × 10¹³ kg](numbers.md#helios-mass) | Mercury |
| Hesperus Veil | [5.4 × 10¹¹ kg](numbers.md#veil-mass) | Mercury |
| Braking Ring | [1.0 × 10¹³ kg](numbers.md#ring-mass) | Mercury |
| Water delivered | [1.0 × 10²⁰ kg](numbers.md#ice-mass) | Ceres ([39%](numbers.md#ice-ceres-water-share) of its water) |
| CO₂ sealed in cryo-continents | [4.69 × 10²⁰ kg](numbers.md#venus-co2-mass), [3.0 × 10¹⁷ m³](numbers.md#cryo-volume) | Venus's air |
| Oxygen made | [1.3 × 10¹⁸ kg](numbers.md#o2-mass) | Split from Venus's CO₂ |
| Graphite made | [4.9 × 10¹⁷ kg](numbers.md#forge-graphite) | Forge by-product |
<!-- /table -->

The Foundry makes every piece of hardware from Mercury rock; only the seed and the first Ceres factories
leave Earth. The largest mass the plan moves is Venus's own CO₂, which never leaves the planet: it is frozen
in place. The largest mass it imports is the water.

## Physics checks

Every run of the model tests these. A check is a law of physics or a requirement of the plan.

<!-- table:checks -->
| Check | Result | Detail |
| --- | --- | --- |
| [Version 2: a statite Veil 137,000 km sunward of Venus can hover](numbers.md#check-veil-v2-hovers) | **Fails (open issue)** | Light pressure (0.0174 m/s²) and Venus's gravity both point toward Venus; the shade falls with 0.0347 m/s² and reaches Venus in about 1 day. |
| [The Veil's station balances gravity, light pressure and orbital motion](numbers.md#check-veil-hovers) | Pass | At 1.110 million km sunward the residual is 0.0e+0 m/s², nil; slats trim the small, slow drift of this unstable point by tilting. |
| [The heat pump never beats Carnot](numbers.md#check-second-law) | Pass | Pump work 2.83e+27 J for 5.28e+26 J of heat, at least the 9.05e+26 J Carnot demands even if every joule left from 737 K. |
| [The Forges make the cap graphite before sealing ends](numbers.md#check-graphite-for-caps) | Pass | 4.17e+17 kg of graphite by the end of sealing; the caps need 3.00e+17 kg. |
| [The last Brick arrives before the deadline](numbers.md#check-ice-arrives) | Pass | Last launch 2035.80, transfer 1.15 yr, last arrival 2036.95. |
| [The Ring recovers more power than the Railheads draw](numbers.md#check-ring-energy-loop) | Pass | Ring 7.22e+19 W recovered against 5.57e+19 W drawn by the Railheads. |
| [The Ring can pass the catch's net braking force to Venus](numbers.md#check-ring-net-force) | **Fails (open issue)** | Catching half the Bricks eastbound and half westbound cancels the twist, not the force: 8.1e+15 N remains along Venus's orbital motion. An orbital ring has no stiff way to hand an in-plane force to the planet; its spare lift is 3.0e+13 N, 266 times too little. |
| [The Ring can carry the force of lowering the ice on tethers](numbers.md#check-ring-lowering-load) | **Fails (open issue)** | Lowering 2.17e+12 kg/s needs at least 4.7e+15 N; the rotor's spare lift is 3.0e+13 N, 154 times too little. |
| [The Foundry can afford the Veil by the date it must close](numbers.md#check-foundry-affords-veil) | Pass | Foundry machinery at the Veil's close date: 2.17e+12 kg; Veil: 5.41e+11 kg. |
| [The Foundry can afford the Helios Lattice by the date it reaches full power](numbers.md#check-foundry-affords-lattice) | Pass | Foundry at full power date: 1.34e+14 kg; Lattice: 5.14e+13 kg. |
| [The simulated atmosphere is Earth-like by the deadline](numbers.md#check-earth-like-by-deadline) | Pass | The day-by-day simulation reaches Earth-like conditions on 2036-09-30; the deadline is 2036-12-31. |
| [The energy budget closes: supply covers demand](numbers.md#check-energy-closes) | Pass | Lattice supply 7.79e+27 J against demand 7.66e+27 J: 2% spare before the Ring's recovered energy, 28% once the Ring powers the Railheads. |
<!-- /table -->

Two checks fail, and both are shown on purpose.

**The version 2 statite.** This check tests version 2's Veil, not the current one, and it is kept failing
so the error stays visible. Version 2 put the Veil [137,000 km](numbers.md?sig=3#veil-v2-distance) sunward of
Venus, hovering on light pressure. But sunlight pushes away from the Sun, toward Venus, with
[0.0174 m/s²](numbers.md#veil-v2-light-accel), and Venus's gravity pulls the same way. The net
[0.0347 m/s²](numbers.md#veil-v2-net-accel) would drop the shade onto Venus in about
[1 d](numbers.md#veil-v2-fall-days). The version 3 Veil near L1 passes its own check.

**Lowering the ice.** This one is a real open problem. Bringing
[2.2 × 10¹² kg/s](numbers.md#lowering-rate) of parked ice to rest and down the tethers needs at least
[4.7 × 10¹⁵ N](numbers.md#lowering-support), but the Ring's rotor has only
[3.0 × 10¹³ N](numbers.md#ring-lift) of lift to spare, [150](numbers.md#lowering-overload) times too little.
Catching works; lowering this way does not. The energy budget still closes, because it never counted the
lowering's recovered energy. But the likeliest fix, dropping the Bricks from rest at the Ring, adds
[2.5 × 10²⁶ J](numbers.md#ring-drop-extra-heat) of heat that the simulation does not yet pump out. The
options are on [Risks and Governance](risks.md#the-ring-cannot-yet-lower-the-ice).

## Every assumption

These are the plan's choices and the breakthroughs it assumes. Each links to the line that defines it, and
its basis says whether it is a design choice, an invention or a demonstrated precedent. Dates are on the
[Timeline](timeline.md).

<!-- table:assumptions -->
| Assumption | Value | Basis | Explore | Defined in |
| --- | --- | --- | --- | --- |
| Temperature the air is cooled to, freezing out its CO₂ | [195 K](numbers.md#freeze-target-temp) | Design choice |  | [data/assumptions.yaml:55](../data/assumptions.yaml#L55) |
| How much the crust's surface cools | [400 K](numbers.md#crust-cooling-step) | Design choice |  | [data/assumptions.yaml:62](../data/assumptions.yaml#L62) |
| Length of a fast cooling campaign, for the crust estimate (years) | [4](numbers.md#skin-campaign-years) | Design choice |  | [data/assumptions.yaml:67](../data/assumptions.yaml#L67) |
| The decade target (years) | [10](numbers.md#conventional-campaign-years) | Design choice |  | [data/assumptions.yaml:72](../data/assumptions.yaml#L72) |
| Payload of one heavy-lift launch from Earth | [100 t](numbers.md#heavy-launch-payload) | Precedent |  | [data/assumptions.yaml:77](../data/assumptions.yaml#L77) |
| Seed foundry mass | [1,000 t](numbers.md#foundry-seed-mass) | Design choice | 100 t to 10,000 t | [data/assumptions.yaml:87](../data/assumptions.yaml#L87) |
| Earth-to-Mercury transfer | [105 d](numbers.md#foundry-transfer-days) | Design choice |  | [data/assumptions.yaml:99](../data/assumptions.yaml#L99) |
| Foundry doubling time | [60 d](numbers.md#foundry-doubling-days) | Invented | 30 d to 120 d | [data/assumptions.yaml:105](../data/assumptions.yaml#L105) |
| Foundry machinery at full scale | [1.0 × 10¹⁴ kg](numbers.md#foundry-target-mass) | Design choice |  | [data/assumptions.yaml:112](../data/assumptions.yaml#L112) |
| Energy to make a kilogram of machinery from regolith | [100 MJ/kg](numbers.md#foundry-energy-per-kg) | Invented | 30 MJ/kg to 300 MJ/kg | [data/assumptions.yaml:117](../data/assumptions.yaml#L117) |
| Share of each copy's mass in complex parts (chips, bearings, optics) | [2%](numbers.md#foundry-complex-share) | Invented |  | [data/assumptions.yaml:124](../data/assumptions.yaml#L124) |
| Smallest feature a Lithocell chip fab writes | [90 nm](numbers.md#lithocell-feature-size) | Invented |  | [data/assumptions.yaml:131](../data/assumptions.yaml#L131) |
| Power the Helios Lattice delivers | [7.0 × 10¹⁹ W](numbers.md#helios-power) | Design choice | 4.0 × 10¹⁹ W to 1.0 × 10²⁰ W | [data/assumptions.yaml:140](../data/assumptions.yaml#L140) |
| Hot-film solar cell efficiency at about 460 K | [40%](numbers.md#helios-film-efficiency) | Invented | 25% to 50% | [data/assumptions.yaml:146](../data/assumptions.yaml#L146) |
| Electricity-to-laser efficiency | [50%](numbers.md#helios-laser-efficiency) | Invented | 30% to 70% | [data/assumptions.yaml:153](../data/assumptions.yaml#L153) |
| Receiver efficiency, laser light to electricity | [75%](numbers.md#helios-receiver-efficiency) | Invented |  | [data/assumptions.yaml:160](../data/assumptions.yaml#L160) |
| Petal film areal density | [1 g/m²](numbers.md#helios-areal-density) | Invented |  | [data/assumptions.yaml:166](../data/assumptions.yaml#L166) |
| Petal edge | [70 km](numbers.md#helios-petal-side) | Design choice |  | [data/assumptions.yaml:172](../data/assumptions.yaml#L172) |
| Beam wavelength | [1.1 µm](numbers.md#helios-wavelength) | Precedent |  | [data/assumptions.yaml:178](../data/assumptions.yaml#L178) |
| Phase-locked virtual aperture width | [10 km](numbers.md#helios-aperture) | Invented |  | [data/assumptions.yaml:185](../data/assumptions.yaml#L185) |
| Beam intensity at the receivers | [10 MW/m²](numbers.md#helios-receiver-intensity) | Invented |  | [data/assumptions.yaml:191](../data/assumptions.yaml#L191) |
| Receiver radiator temperature | [1,500 K](numbers.md#helios-fin-temp) | Design choice |  | [data/assumptions.yaml:197](../data/assumptions.yaml#L197) |
| Temperature the Petal film runs at near Mercury | [460 K](numbers.md#helios-film-temp) | Design choice |  | [data/assumptions.yaml:207](../data/assumptions.yaml#L207) |
| Closest any beam path comes to Earth or a crewed craft | [0.01 AU](numbers.md#beam-keep-out) | Design choice |  | [data/assumptions.yaml:213](../data/assumptions.yaml#L213) |
| Time for a beam to defocus once its receiver's handshake drops | [1 ms](numbers.md#beam-defocus-time) | Design choice |  | [data/assumptions.yaml:220](../data/assumptions.yaml#L220) |
| Veil film areal density | [1 g/m²](numbers.md#veil-areal-density) | Invented |  | [data/assumptions.yaml:229](../data/assumptions.yaml#L229) |
| Share of sunlight's momentum the light-bending film takes up | [0.01](numbers.md#veil-momentum-fraction) | Invented | 0.002 to 0.1 | [data/assumptions.yaml:235](../data/assumptions.yaml#L235) |
| Share of sunlight the closed Veil keeps from Venus | [99.9%](numbers.md#veil-block-fraction) | Design choice |  | [data/assumptions.yaml:242](../data/assumptions.yaml#L242) |
| Most light a slat lets through when open | [60%](numbers.md#veil-open-transmission) | Invented |  | [data/assumptions.yaml:249](../data/assumptions.yaml#L249) |
| Slat edge | [1.2 km](numbers.md#veil-slat-side) | Design choice |  | [data/assumptions.yaml:255](../data/assumptions.yaml#L255) |
| Number of chimneys (one per canopy) | [10,000](numbers.md#chimney-count) | Design choice |  | [data/assumptions.yaml:274](../data/assumptions.yaml#L274) |
| Chimney diameter | [2 km](numbers.md#chimney-diameter) | Design choice |  | [data/assumptions.yaml:279](../data/assumptions.yaml#L279) |
| Air speed through a chimney's intake exchangers | [20 m/s](numbers.md#chimney-flow-speed) | Design choice |  | [data/assumptions.yaml:285](../data/assumptions.yaml#L285) |
| How much the air cools passing a chimney's intake exchangers | [300 K](numbers.md#chimney-gas-cooling) | Design choice |  | [data/assumptions.yaml:290](../data/assumptions.yaml#L290) |
| Chimney base height | [1 km](numbers.md#chimney-base) | Design choice |  | [data/assumptions.yaml:295](../data/assumptions.yaml#L295) |
| Chimney top height | [65 km](numbers.md#chimney-top) | Design choice |  | [data/assumptions.yaml:301](../data/assumptions.yaml#L301) |
| Peak heat flow from the deep atmosphere | [6.0 × 10¹⁸ W](numbers.md#deep-heat-peak) | Design choice |  | [data/assumptions.yaml:307](../data/assumptions.yaml#L307) |
| Effective temperature the emitters shine at | [2,000 K](numbers.md#exhaust-effective-temp) | Invented | 1,000 K to 3,000 K | [data/assumptions.yaml:314](../data/assumptions.yaml#L314) |
| Emitter tile bandgap (InGaAsSb) | [0.54 eV](numbers.md#exhaust-bandgap) | Invented |  | [data/assumptions.yaml:320](../data/assumptions.yaml#L320) |
| Peak power the Exhaust can throw into space | [5.0 × 10¹⁹ W](numbers.md#exhaust-peak) | Design choice | 3.0 × 10¹⁹ W to 7.0 × 10¹⁹ W | [data/assumptions.yaml:325](../data/assumptions.yaml#L325) |
| Number of floating canopies | [10,000](numbers.md#exhaust-canopies) | Design choice |  | [data/assumptions.yaml:332](../data/assumptions.yaml#L332) |
| Beam cone each tile fires into | [25°](numbers.md#exhaust-cone) | Invented |  | [data/assumptions.yaml:337](../data/assumptions.yaml#L337) |
| Frost Tower cold-trap temperature | [133 K](numbers.md#frost-tower-temp) | Invented |  | [data/assumptions.yaml:352](../data/assumptions.yaml#L352) |
| External quantum efficiency of the emitter tiles (photons out per electron in) | [99.9%](numbers.md#exhaust-eqe) | Invented |  | [data/assumptions.yaml:358](../data/assumptions.yaml#L358) |
| Cryo-continent thickness | [2 km](numbers.md#cryo-thickness) | Design choice |  | [data/assumptions.yaml:368](../data/assumptions.yaml#L368) |
| Carbon aerogel layer in each cap | [20 m](numbers.md#cryo-aerogel-thickness) | Invented |  | [data/assumptions.yaml:374](../data/assumptions.yaml#L374) |
| Carbon aerogel density | [100 kg/m³](numbers.md#cryo-aerogel-density) | Precedent |  | [data/assumptions.yaml:379](../data/assumptions.yaml#L379) |
| Carbon aerogel thermal conductivity | [0.014 W/(m·K)](numbers.md#cryo-aerogel-conductivity) | Precedent |  | [data/assumptions.yaml:384](../data/assumptions.yaml#L384) |
| Graphite membrane thickness | [1 mm](numbers.md#cryo-membrane-thickness) | Invented |  | [data/assumptions.yaml:389](../data/assumptions.yaml#L389) |
| Crushed-basalt armour on each cap | [2 m](numbers.md#cryo-armour-thickness) | Design choice |  | [data/assumptions.yaml:395](../data/assumptions.yaml#L395) |
| Temperature the sealed dry ice is held at | [180 K](numbers.md#cryo-ice-temp) | Design choice |  | [data/assumptions.yaml:400](../data/assumptions.yaml#L400) |
| Effective temperature step between hot rock and basin floor | [450 K](numbers.md#cryo-floor-step) | Design choice |  | [data/assumptions.yaml:405](../data/assumptions.yaml#L405) |
| Area of one sealed compartment | [100 km²](numbers.md#cryo-cell-area) | Design choice |  | [data/assumptions.yaml:411](../data/assumptions.yaml#L411) |
| Depth basal heat pipes reach into the basin floors | [200 m](numbers.md#heat-pipe-depth) | Design choice |  | [data/assumptions.yaml:422](../data/assumptions.yaml#L422) |
| Oxygen pressure to make | [0.25 bar](numbers.md#o2-target-pressure) | Design choice |  | [data/assumptions.yaml:429](../data/assumptions.yaml#L429) |
| Molten-carbonate splitting efficiency | [60%](numbers.md#forge-efficiency) | Precedent |  | [data/assumptions.yaml:435](../data/assumptions.yaml#L435) |
| Number of Forges | [500](numbers.md#forge-count) | Design choice |  | [data/assumptions.yaml:442](../data/assumptions.yaml#L442) |
| Width of one Forge raft | [30 km](numbers.md#forge-raft-width) | Design choice |  | [data/assumptions.yaml:457](../data/assumptions.yaml#L457) |
| Water shipped to Venus | [1.0 × 10²⁰ kg](numbers.md#ice-mass) | Design choice | 3.0 × 10¹⁹ kg to 2.0 × 10²⁰ kg | [data/assumptions.yaml:465](../data/assumptions.yaml#L465) |
| Ice Brick mass | [1 Mt](numbers.md#brick-mass) | Design choice |  | [data/assumptions.yaml:471](../data/assumptions.yaml#L471) |
| Number of Railheads on Ceres | [10,000](numbers.md#railhead-count) | Design choice |  | [data/assumptions.yaml:477](../data/assumptions.yaml#L477) |
| Railhead acceleration | [200 g](numbers.md#railhead-accel) | Invented |  | [data/assumptions.yaml:482](../data/assumptions.yaml#L482) |
| Railhead efficiency, electricity to motion | [50%](numbers.md#railhead-efficiency) | Invented |  | [data/assumptions.yaml:487](../data/assumptions.yaml#L487) |
| Days kept between the last arrival and the deadline | [16 d](numbers.md#ice-lowering-margin) | Design choice |  | [data/assumptions.yaml:493](../data/assumptions.yaml#L493) |
| Ring altitude | [400 km](numbers.md#ring-altitude) | Design choice |  | [data/assumptions.yaml:510](../data/assumptions.yaml#L510) |
| Rotor speed | [10 km/s](numbers.md#ring-rotor-speed) | Invented |  | [data/assumptions.yaml:516](../data/assumptions.yaml#L516) |
| Rotor mass | [7.0 × 10¹² kg](numbers.md#ring-rotor-mass) | Invented |  | [data/assumptions.yaml:522](../data/assumptions.yaml#L522) |
| Stator mass (tracks, tethers, receivers) | [3.0 × 10¹² kg](numbers.md#ring-stator-mass) | Invented |  | [data/assumptions.yaml:527](../data/assumptions.yaml#L527) |
| Catcher braking | [50 g](numbers.md#ring-catch-accel) | Invented |  | [data/assumptions.yaml:532](../data/assumptions.yaml#L532) |
| Regenerative braking efficiency | [80%](numbers.md#ring-recovery-efficiency) | Invented |  | [data/assumptions.yaml:537](../data/assumptions.yaml#L537) |
| Number of tether lifts | [3,000](numbers.md#ring-tether-lifts) | Design choice |  | [data/assumptions.yaml:543](../data/assumptions.yaml#L543) |
| Height Bricks are released from | [100 km](numbers.md#lowering-release-altitude) | Design choice |  | [data/assumptions.yaml:548](../data/assumptions.yaml#L548) |
| Temperature of a Brick when it is lowered | [150 K](numbers.md#brick-temp) | Design choice |  | [data/assumptions.yaml:564](../data/assumptions.yaml#L564) |
| Magnetic bubble radius | [10,000 km](numbers.md#aegis-bubble-radius) | Design choice |  | [data/assumptions.yaml:577](../data/assumptions.yaml#L577) |
| Coil radius | [10 km](numbers.md#aegis-coil-radius) | Design choice |  | [data/assumptions.yaml:583](../data/assumptions.yaml#L583) |
| Turns in the coil | [1,000,000](numbers.md#aegis-turns) | Design choice |  | [data/assumptions.yaml:589](../data/assumptions.yaml#L589) |
| Temperature the Aegis cable runs at | [40 K](numbers.md#aegis-coil-temp) | Invented |  | [data/assumptions.yaml:594](../data/assumptions.yaml#L594) |
| Ocean pH that must hold before any life is released | [7.5](numbers.md#genesis-ph-min) | Design choice |  | [data/assumptions.yaml:607](../data/assumptions.yaml#L607) |
| Days the ocean pH must hold before any life is released | [90 d](numbers.md#genesis-ph-days) | Design choice |  | [data/assumptions.yaml:613](../data/assumptions.yaml#L613) |
| Top of the ocean pH the shore basalt is laid to hold | [8](numbers.md#acid-ocean-ph-max) | Design choice |  | [data/assumptions.yaml:618](../data/assumptions.yaml#L618) |
| Doubling time of the seeded ocean cyanobacteria in sunlit water | [1 d](numbers.md#genesis-doubling-days) | Invented |  | [data/assumptions.yaml:625](../data/assumptions.yaml#L625) |
| Thinnest black-loam soil laid on caps and shores | [10 cm](numbers.md#genesis-soil-min) | Design choice |  | [data/assumptions.yaml:631](../data/assumptions.yaml#L631) |
| Thickest black-loam soil laid on caps and shores | [30 cm](numbers.md#genesis-soil-max) | Design choice |  | [data/assumptions.yaml:637](../data/assumptions.yaml#L637) |
| Length of the day the Veil and Lanterns set | [24 h](numbers.md#day-length) | Design choice |  | [data/assumptions.yaml:643](../data/assumptions.yaml#L643) |
| Relative humidity over the new oceans | [75%](numbers.md#final-humidity) | Design choice |  | [data/assumptions.yaml:650](../data/assumptions.yaml#L650) |
| Albedo of the finished, Earth-like Venus | [30%](numbers.md#final-albedo) | Design choice |  | [data/assumptions.yaml:656](../data/assumptions.yaml#L656) |
| Coldest mean temperature that counts as Earth-like | [285 K](numbers.md#earth-like-temp) | Design choice |  | [data/assumptions.yaml:662](../data/assumptions.yaml#L662) |
| Most CO₂ that counts as Earth-like | [600 ppm](numbers.md#earth-like-co2) | Design choice |  | [data/assumptions.yaml:668](../data/assumptions.yaml#L668) |
| Days a replicator keeps building without a Mass Ledger heartbeat | [7 d](numbers.md#choir-deadman-days) | Design choice |  | [data/assumptions.yaml:676](../data/assumptions.yaml#L676) |
<!-- /table -->

Every assumption with a range is a slider in the [Explorer](https://phosphoros.space/explore), which runs
the same model in your browser: move one and every number, chart and check on the site follows. From a
clone, `pnpm calc --set <id>=<value>` does the same.
