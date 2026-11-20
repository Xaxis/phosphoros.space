# Energy and Mass Budget

Phosphoros is an energy plan before it is anything else. This page shows where every joule comes from and
where it goes, and checks that supply covers demand. It does, narrowly. The numbers come from
[calc/src/model/budget.ts](../calc/src/model/budget.ts) and the modules it reads; the [ledger](numbers.md)
gives each one's formula and inputs.

## The energy budget

<!-- table:budget -->
| Task | Energy the Lattice delivers |
| --- | --- |
| Launch 10²⁰ kg of ice from Ceres | [4.8 × 10²⁷ J](numbers.md#ice-launch-energy) |
| Heat-pump work to cool Venus | [3.5 × 10²⁷ J](numbers.md#traj-pump-energy) |
| Run the chimney fans | [1.0 × 10²⁵ J](numbers.md#traj-fan-energy) |
| Warm the air and melt the last ice | [4.4 × 10²⁵ J](numbers.md#traj-warm-energy) |
| Forge 0.25 bar of oxygen | [2.7 × 10²⁵ J](numbers.md#forge-energy) |
| Build the Foundry, the Veil, the Lattice and the Ring | [10²² J](numbers.md#hardware-energy) |
| **Total demand** | **[8.4 × 10²⁷ J](numbers.md#budget-demand)** |
| Supply: the Lattice from full power to the deadline | [9.2 × 10²⁷ J](numbers.md#helios-supply) |
| Spare | [9.3%](numbers.md#budget-spare) |
| Spare once the Ring powers the Railheads | [34%](numbers.md#budget-spare-with-ring) |
<!-- /table -->

<!-- figure:lattice-budget -->
![Energy the Helios Lattice must deliver, against its supply](../figures/svg/lattice-budget.svg)
<!-- /figure -->

The plan must deliver [8.4 × 10²⁷ J](numbers.md#budget-demand) to Venus and Ceres from outside. The Helios
Lattice supplies [9.2 × 10²⁷ J](numbers.md#helios-supply): [8.5 × 10¹⁹ W](numbers.md#helios-power) for the
[3.4 yr](numbers.md#helios-supply-years) from full power in [July 2033](numbers.md?date=month#helios-full-power)
to the deadline. That leaves [9.3%](numbers.md#budget-spare) spare on the Lattice alone, and
[34%](numbers.md#budget-spare-with-ring) once the Braking Ring's recovered energy powers the Railheads.
Launching the water and pumping out the heat take [90%](numbers.md#budget-launch-share) of the Lattice's
output; oxygen and hardware are small change.

The supply side is conservative. It counts only the full-power years, while the simulation also uses the
Lattice's growing output from [May 2033](numbers.md?date=month#cooling-start). The budget charges the
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
dW along the cooling path gives [1.1 × 10²⁷ J](numbers.md#exhaust-work-sensible) for the sensible cooling
and [1.8 × 10²⁷ J](numbers.md#exhaust-work-latent) for the latent heat, which comes out when the air is
cold and each joule is dearest: [2.92 × 10²⁷ J](numbers.md#exhaust-work) in all, or
[5.5](numbers.md#exhaust-work-ratio) joules of work per joule of heat moved.

The effective temperature is a trade. Cooler emitters need less work per joule but far more area: at the
coolest option the model tries, emitters would cover [63%](numbers.md#exhaust-area-share-1000) of Venus; at
the hottest, [4%](numbers.md#exhaust-area-share-2500), for more work. The ledger lists each option's
temperature. The Exhaust throws the heat and the work into space together,
[3.4 × 10²⁷ J](numbers.md#exhaust-rejected), an average of [3.3 × 10¹⁹ W](numbers.md#exhaust-rejected-avg)
over the [3.3 yr](numbers.md#cooling-seconds) campaign.

### Why the simulation pumps more

The budget does not charge [2.92 × 10²⁷ J](numbers.md#exhaust-work). It charges what the day-by-day
[simulation](plan.md#the-simulated-atmosphere) actually spends, [3.5 × 10²⁷ J](numbers.md#traj-pump-energy).
The difference has three causes.

- **Heat keeps arriving.** During the campaign [7.9 × 10²⁵ J](numbers.md#traj-heat-added) enters the air
  from the crust, from the Forges' waste heat, from ice falling the last
  [100 km](numbers.md#lowering-release-altitude), and from the sunlight the closed Veil lets through.
- **It arrives when pumping is dearest.** Much of that heat comes late, when the air is near
  [195 K](numbers.md?sig=3#freeze-target-temp) and every joule costs more work than the campaign's average
  of [5.5](numbers.md#exhaust-work-ratio). The air is also held cold for weeks while the caps are sealed.
- **The Frost Towers.** Trapping the last [5.4 × 10¹⁸ kg](numbers.md#frost-residual-co2) of CO₂ at
  [133 K](numbers.md#frost-tower-temp) takes about [4.3 × 10²⁵ J](numbers.md#frost-work) more.

After the caps are sealed, the beamed power also warms the air and melts the ice that was lowered while the
air was below freezing: [4.4 × 10²⁵ J](numbers.md#traj-warm-energy). Version 2 charged only the simple
estimate; counting the simulation is most of why the demand rose
([correction](about.md#corrections)).

### Launching the ice

Each Brick leaves Ceres at [6.4 km/s](numbers.md#ice-launch-speed). Its motion energy is ½v² per kilogram,
and the Railheads turn electricity into motion at [50%](numbers.md#railhead-efficiency), so each kilogram
draws [41 MJ/kg](numbers.md#launch-energy-per-kg) in a launch window. The Railheads fire all the time, though,
and a shot between windows needs a faster orbit to meet Venus: up to
[46%](numbers.md#launch-offwindow-max) more energy at the worst time, [16%](numbers.md#launch-offwindow-mean)
more on average. So each kilogram draws [47.7 MJ/kg](numbers.md#launch-energy-per-kg-avg) on average, and
[1.0 × 10²⁰ kg](numbers.md#ice-mass) of ice takes [4.8 × 10²⁷ J](numbers.md#ice-launch-energy), drawn at
[6.7 × 10¹⁹ W](numbers.md#railhead-power) while the campaign runs. Of that,
[6.7 × 10²⁶ J](numbers.md#ice-launch-offwindow-energy) is the price of firing between windows.

### Ring recovery and gravity

The ice reaches Venus at [9.08 km/s](numbers.md#ice-vinf) relative to the planet and speeds up to
[13.5 km/s](numbers.md#ring-arrival-speed) by the Ring's height. Braking it to orbital speed,
[7.1 km/s](numbers.md#ring-orbital-speed), frees [66.4 MJ/kg](numbers.md#ring-catch-energy-per-kg), of which
[80%](numbers.md#ring-recovery-efficiency) becomes electricity: [53 MJ/kg](numbers.md#ring-recovered-per-kg),
or [5.3 × 10²⁷ J](numbers.md#ring-recovered-energy) for all the ice. That is
[1.3](numbers.md#ring-vs-launch) times what a launch in a window draws, and still more than the average launch.

> **Physics:** This is not free energy. The ice falls from Ceres's orbit at
> [2.77 AU](numbers.md#ceres-orbit) to Venus's at [0.723 AU](numbers.md#venus-orbit), deep into the Sun's
> gravity well, then into Venus's own well down to the Ring. Gravity adds
> [4.3 × 10²⁷ J](numbers.md#ice-solar-gain) to its motion between launch and catch. The Ring harvests
> energy gravity gave the ice.

The budget counts it like this. Until the first Brick is caught on
[16 September 2034](numbers.md?date=day#ring-pays-from), the Lattice powers the Railheads, which costs it
[2.4 × 10²⁷ J](numbers.md#budget-lattice-launch). After that the Ring powers them, so the Lattice delivers
only [6.1 × 10²⁷ J](numbers.md#budget-demand-with-ring), leaving [34%](numbers.md#budget-spare-with-ring)
spare. Counted instead as extra supply, the Ring brings the total to
[1.5 × 10²⁸ J](numbers.md#budget-supply-total) and the spare to [42%](numbers.md#budget-spare-total). The
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

The plan's hardware, about [6.0 × 10¹³ kg](numbers.md#foundry-target-mass), costs
[100 MJ/kg](numbers.md#foundry-energy-per-kg) to make from regolith: [10²² J](numbers.md#hardware-energy),
a rounding error. Once the Foundry runs, matter is cheap. Energy is the cost.

## The mass budget

<!-- table:mass -->
| Mass item | Amount | From |
| --- | --- | --- |
| Ouroboros machinery at peak | [6.7 × 10¹³ kg](numbers.md#foundry-final-mass) | Mercury regolith |
| Helios Lattice | [6.2 × 10¹³ kg](numbers.md#helios-mass) | Mercury |
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
| [Version 2: a statite Veil 137,000 km sunward of Venus can hover](numbers.md#check-veil-v2-hovers) | **Fails (open issue)** | Light pressure (0.0174 m/s²) and Venus's gravity both point toward Venus; the shade falls with 0.0347 m/s² and reaches Venus in about 1 d. |
| [The Veil's station balances gravity, light pressure and orbital motion](numbers.md#check-veil-hovers) | Pass | At 1.11 × 10⁶ km sunward of Venus the residual is 0 m/s²; slats trim the small, slow drift of this unstable point by tilting. |
| [Gaps and closed slats together leak no more than the Veil may](numbers.md#check-veil-leak-fits) | Pass | Gaps of 0.05% plus 0.03% through the closed slats, against the 0.1% the closed Veil may let through. |
| [The heat pump never beats Carnot](numbers.md#check-second-law) | Pass | Pump work 2.92 × 10²⁷ J for 5.3 × 10²⁶ J of heat, at least the 9.0 × 10²⁶ J Carnot demands even if every joule left from 737 K, with the emitters as hot as 2,000 K. |
| [The Exhaust's beamed light can carry away the entropy its pumps lift](numbers.md#check-exhaust-entropy) | **Fails (open issue)** | The model charges pump work as if the hot side were at 2,000 K. Light at 0.91 MW/m² squeezed into a 0.4 µm band around 2.3 µm and a 25° cone counts as at least 16,000 K, 8.2 times hotter. Lifting a joule from the 737 K air into that light takes 12 times the work the budget charges. |
| [An opaque Veil leaves the Exhaust's cones a clear sky](numbers.md#check-exhaust-clears-veil) | Pass | Seen from Venus the Veil is 0.68° in radius. Tiles that face it tilt their 25° cones 13° off the Sun line, which keeps every cone 64° clear of the horizon. |
| [The Forges make the cap graphite before sealing ends](numbers.md#check-graphite-for-caps) | Pass | 4.6 × 10¹⁷ kg of graphite by the end of sealing; the caps need 2.5 × 10¹⁷ kg. |
| [The last Brick arrives before the deadline](numbers.md#check-ice-arrives) | Pass | Last launch 21 October 2035, a 1.15 yr transfer, last arrival 15 December 2036. |
| [The Ring recovers more power than the Railheads draw](numbers.md#check-ring-energy-loop) | Pass | The Ring recovers 7.5 × 10¹⁹ W against the 6.7 × 10¹⁹ W the Railheads draw. |
| [The Ring can pass the catch's net braking force to Venus](numbers.md#check-ring-net-force) | **Fails (open issue)** | Catching half the Bricks eastbound and half westbound cancels the twist, not the force: 8.4 × 10¹⁵ N remains along Venus's orbital motion. An orbital ring has no stiff way to hand an in-plane force to the planet; its spare lift is 3.0 × 10¹³ N, 280 times too little. |
| [The Ring can carry the force of lowering the ice on tethers](numbers.md#check-ring-lowering-load) | **Fails (open issue)** | Lowering 2.2 × 10¹² kg/s needs at least 4.7 × 10¹⁵ N; the rotor's spare lift is 3.0 × 10¹³ N, 150 times too little. |
| [Building the Veil costs the Foundry no more than one doubling](numbers.md#check-foundry-affords-veil) | Pass | The Foundry stands still for 9.8 d to build the 5.4 × 10¹¹ kg Veil, whose last parts leave Mercury on 16 September 2032; one doubling is 60 d. |
| [The Foundry stops growing at the size that finishes the Lattice and the Ring soonest](numbers.md#check-foundry-size) | Pass | After 26 doublings the 6.7 × 10¹³ kg Foundry builds the 6.2 × 10¹³ kg Lattice in 80 d and the Ring in 13 d: both done 1653 days after landing, against 1687 with one doubling fewer and 1667 with one more. |
| [The Ring's mass reaches Venus before the Ring must be complete](numbers.md#check-foundry-builds-ring) | Pass | After the Lattice, the Foundry builds the 1.0 × 10¹³ kg Ring in 13 d; its last parts reach Venus on 19 October 2033, and the Ring must be complete on 31 December 2033. |
| [The Foundry can build the structure that holds the Aegis coil together](numbers.md#check-aegis-structure) | Pass | The coil's field pulls on its winding with 1.2 × 10¹¹ N; holding it takes at least 2.0 × 10¹¹ kg of carbon fibre at full strength, 0.25 days of the full Foundry's output against the 60 d of one doubling. |
| [The Frost Towers finish before the last caps are sealed](numbers.md#check-frost-before-sealing) | Pass | The simulated Frost Towers finish on 22 August 2036; the last caps are sealed on 1 September 2036. |
| [Seeded life greens the oceans by the deadline](numbers.md#check-genesis-by-deadline) | Pass | Seeding waits for the oxygen (30 September 2036) and for the oceans to hold their pH (1 December 2036), so it begins on 1 December 2036; doubling every 1 d, the cells reach bloom density on 12 December 2036, against a deadline of 31 December 2036. |
| [The simulated atmosphere is Earth-like by the deadline](numbers.md#check-earth-like-by-deadline) | Pass | The day-by-day simulation reaches Earth-like conditions on 30 September 2036, 92 d before the 31 December 2036 deadline. The chimneys, not the power, set the pace on 56 d. |
| [The energy budget closes: supply covers demand](numbers.md#check-energy-closes) | Pass | Lattice supply 9.2 × 10²⁷ J against demand 8.4 × 10²⁷ J: 9.3% spare before the Ring's recovered energy, 34% once the Ring powers the Railheads. |
| [With the Ring's recovered energy, supply covers demand](numbers.md#check-energy-closes-with-ring) | Pass | The Lattice delivers 9.2 × 10²⁷ J against 6.1 × 10²⁷ J once the Ring powers the Railheads, and the Ring recovers 5.3 × 10²⁷ J against the 2.3 × 10²⁷ J of launches it pays for. |
<!-- /table -->

[4](numbers.md#checks-failing) of the [20](numbers.md#checks-total) checks fail, and each is shown on purpose.

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
The catch recovers its energy; lowering this way does not work. The energy budget never counted the lowering's recovered energy,
so this problem does not change it. But the likeliest fix, dropping the Bricks from rest at the Ring, adds
[2.5 × 10²⁶ J](numbers.md#ring-drop-extra-heat) of heat that the simulation does not yet pump out. The
options are on [Risks and Governance](risks.md#the-ring-cannot-yet-lower-the-ice).

**The Exhaust's light.** The model charges the heat pumps the Carnot work for emitters at
[2,000 K](numbers.md#exhaust-effective-temp), right for light spread over colours and directions the way a
surface that hot spreads it. The tiles put their light into a [0.4 µm](numbers.md#exhaust-band) band and a
[25°](numbers.md#exhaust-cone) cone instead, and light that concentrated carries little entropy: it counts as
at least [16,000 K](numbers.md#exhaust-light-temp). Lifting a joule from the starting air into it takes
[12](numbers.md#exhaust-work-multiple) times the work the budget charges. Read the pump work here as a floor
until the tiles spread their light far wider or the pumps grow; the options are on the
[Photonic Exhaust](technologies/exhaust.md#the-cost-of-beamed-light) page.

**The Ring's net force.** Catching half the Bricks eastbound and half westbound cancels the twist the catch
puts on the Ring, not the push: [8.4 × 10¹⁵ N](numbers.md#ring-net-braking-force) remains along Venus's
orbital motion, [280](numbers.md#ring-net-overload) times the rotor's spare lift. The energy the catch
recovers is real; what holds the Ring in place while it catches is unsolved
([Braking Ring](technologies/ring.md)).

**Launches between windows.** The Railheads fire through every part of the
[8.5 months](numbers.md#launch-window-period) between launch windows, and those shots cost
[6.7 × 10²⁶ J](numbers.md#ice-launch-offwindow-energy) more than the Hohmann minimum. The budget charges them,
and the Lattice is sized for it: [8.5 × 10¹⁹ W](numbers.md#helios-power), enough to close the budget on its own
with [9.3%](numbers.md#budget-spare) to spare and [34%](numbers.md#budget-spare-with-ring) once the Ring powers
the Railheads ([check](numbers.md#check-energy-closes-with-ring)).

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
| Machinery the Foundry grows to before it builds the Lattice and the Ring | [6.0 × 10¹³ kg](numbers.md#foundry-target-mass) | Design choice |  | [data/assumptions.yaml:112](../data/assumptions.yaml#L112) |
| Energy to make a kilogram of machinery from regolith | [100 MJ/kg](numbers.md#foundry-energy-per-kg) | Invented | 30 MJ/kg to 300 MJ/kg | [data/assumptions.yaml:118](../data/assumptions.yaml#L118) |
| Share of each copy's mass in complex parts (chips, bearings, optics) | [2%](numbers.md#foundry-complex-share) | Invented |  | [data/assumptions.yaml:125](../data/assumptions.yaml#L125) |
| Smallest feature a Lithocell chip fab writes | [90 nm](numbers.md#lithocell-feature-size) | Invented |  | [data/assumptions.yaml:132](../data/assumptions.yaml#L132) |
| Power the Helios Lattice delivers | [8.5 × 10¹⁹ W](numbers.md#helios-power) | Design choice | 4.0 × 10¹⁹ W to 1.0 × 10²⁰ W | [data/assumptions.yaml:141](../data/assumptions.yaml#L141) |
| Hot-film solar cell efficiency at about 460 K | [40%](numbers.md#helios-film-efficiency) | Invented | 25% to 50% | [data/assumptions.yaml:148](../data/assumptions.yaml#L148) |
| Electricity-to-laser efficiency | [50%](numbers.md#helios-laser-efficiency) | Invented | 30% to 70% | [data/assumptions.yaml:155](../data/assumptions.yaml#L155) |
| Receiver efficiency, laser light to electricity | [75%](numbers.md#helios-receiver-efficiency) | Invented |  | [data/assumptions.yaml:162](../data/assumptions.yaml#L162) |
| Petal film areal density | [1 g/m²](numbers.md#helios-areal-density) | Invented |  | [data/assumptions.yaml:168](../data/assumptions.yaml#L168) |
| Petal edge | [70 km](numbers.md#helios-petal-side) | Design choice |  | [data/assumptions.yaml:174](../data/assumptions.yaml#L174) |
| Beam wavelength | [1.1 µm](numbers.md#helios-wavelength) | Precedent |  | [data/assumptions.yaml:180](../data/assumptions.yaml#L180) |
| Phase-locked virtual aperture width | [10 km](numbers.md#helios-aperture) | Invented |  | [data/assumptions.yaml:187](../data/assumptions.yaml#L187) |
| Beam intensity at the receivers | [10 MW/m²](numbers.md#helios-receiver-intensity) | Invented |  | [data/assumptions.yaml:193](../data/assumptions.yaml#L193) |
| Receiver radiator temperature | [1,500 K](numbers.md#helios-fin-temp) | Design choice |  | [data/assumptions.yaml:199](../data/assumptions.yaml#L199) |
| Temperature the Petal film runs at near Mercury | [460 K](numbers.md#helios-film-temp) | Design choice |  | [data/assumptions.yaml:209](../data/assumptions.yaml#L209) |
| Closest any beam path comes to Earth or a crewed craft | [0.01 AU](numbers.md#beam-keep-out) | Design choice |  | [data/assumptions.yaml:215](../data/assumptions.yaml#L215) |
| Innermost Petal orbit | [0.3 AU](numbers.md#helios-orbit-inner) | Design choice |  | [data/assumptions.yaml:222](../data/assumptions.yaml#L222) |
| Outermost Petal orbit | [0.45 AU](numbers.md#helios-orbit-outer) | Design choice |  | [data/assumptions.yaml:230](../data/assumptions.yaml#L230) |
| Brightest one Exhaust cone may be far from Venus | [10 W/m²](numbers.md#exhaust-far-limit) | Design choice |  | [data/assumptions.yaml:237](../data/assumptions.yaml#L237) |
| Time for a beam to defocus once its receiver's handshake drops | [1 ms](numbers.md#beam-defocus-time) | Design choice |  | [data/assumptions.yaml:243](../data/assumptions.yaml#L243) |
| Veil film areal density | [1 g/m²](numbers.md#veil-areal-density) | Invented |  | [data/assumptions.yaml:252](../data/assumptions.yaml#L252) |
| Share of sunlight's momentum the light-bending film takes up | [0.01](numbers.md#veil-momentum-fraction) | Invented | 0.002 to 0.1 | [data/assumptions.yaml:258](../data/assumptions.yaml#L258) |
| Share of sunlight the closed Veil keeps from Venus | [99.9%](numbers.md#veil-block-fraction) | Design choice |  | [data/assumptions.yaml:265](../data/assumptions.yaml#L265) |
| Most light a slat lets through when open | [60%](numbers.md#veil-open-transmission) | Invented |  | [data/assumptions.yaml:272](../data/assumptions.yaml#L272) |
| Slat edge | [1.2 km](numbers.md#veil-slat-side) | Design choice |  | [data/assumptions.yaml:278](../data/assumptions.yaml#L278) |
| How often each slat corrects its tilt to keep station | [1 Hz](numbers.md#veil-trim-rate) | Design choice |  | [data/assumptions.yaml:284](../data/assumptions.yaml#L284) |
| How far a slat may drift from its station | [1 km](numbers.md#veil-station-tolerance) | Design choice |  | [data/assumptions.yaml:289](../data/assumptions.yaml#L289) |
| Largest share of the Veil's area left as gaps between slats | [0.05%](numbers.md#veil-gap-max) | Design choice |  | [data/assumptions.yaml:295](../data/assumptions.yaml#L295) |
| Share of sunlight a closed slat lets through toward Venus, in every colour | [0.03%](numbers.md#veil-slat-leak) | Invented |  | [data/assumptions.yaml:302](../data/assumptions.yaml#L302) |
| Number of chimneys (one per canopy) | [10,000](numbers.md#chimney-count) | Design choice |  | [data/assumptions.yaml:322](../data/assumptions.yaml#L322) |
| Chimney diameter | [3.5 km](numbers.md#chimney-diameter) | Design choice |  | [data/assumptions.yaml:327](../data/assumptions.yaml#L327) |
| Air speed through a chimney's intake exchangers | [20 m/s](numbers.md#chimney-flow-speed) | Design choice |  | [data/assumptions.yaml:334](../data/assumptions.yaml#L334) |
| How much the air cools passing a chimney's intake exchangers, at the starting 737 K | [100 K](numbers.md#chimney-gas-cooling) | Design choice |  | [data/assumptions.yaml:339](../data/assumptions.yaml#L339) |
| Pressure lost across a chimney's exchangers, in units of the flow's dynamic pressure | [4](numbers.md#chimney-loss-coefficient) | Invented |  | [data/assumptions.yaml:345](../data/assumptions.yaml#L345) |
| Chimney base height | [1 km](numbers.md#chimney-base) | Design choice |  | [data/assumptions.yaml:351](../data/assumptions.yaml#L351) |
| Chimney top height | [65 km](numbers.md#chimney-top) | Design choice |  | [data/assumptions.yaml:357](../data/assumptions.yaml#L357) |
| Peak heat flow from the deep atmosphere | [6.0 × 10¹⁸ W](numbers.md#deep-heat-peak) | Design choice |  | [data/assumptions.yaml:363](../data/assumptions.yaml#L363) |
| Effective temperature the emitters shine at | [2,000 K](numbers.md#exhaust-effective-temp) | Invented | 1,000 K to 3,000 K | [data/assumptions.yaml:370](../data/assumptions.yaml#L370) |
| Emitter tile bandgap (InGaAsSb) | [0.54 eV](numbers.md#exhaust-bandgap) | Invented |  | [data/assumptions.yaml:376](../data/assumptions.yaml#L376) |
| Peak power the Exhaust can throw into space | [5.0 × 10¹⁹ W](numbers.md#exhaust-peak) | Design choice | 3.0 × 10¹⁹ W to 7.0 × 10¹⁹ W | [data/assumptions.yaml:381](../data/assumptions.yaml#L381) |
| Number of floating canopies | [10,000](numbers.md#exhaust-canopies) | Design choice |  | [data/assumptions.yaml:388](../data/assumptions.yaml#L388) |
| Beam cone each tile fires into (full apex angle) | [25°](numbers.md#exhaust-cone) | Invented |  | [data/assumptions.yaml:393](../data/assumptions.yaml#L393) |
| Width of the band each tile emits in | [0.4 µm](numbers.md#exhaust-band) | Invented |  | [data/assumptions.yaml:398](../data/assumptions.yaml#L398) |
| Frost Tower cold-trap temperature | [133 K](numbers.md#frost-tower-temp) | Invented |  | [data/assumptions.yaml:411](../data/assumptions.yaml#L411) |
| External quantum efficiency of the emitter tiles (photons out per electron in) | [99.9%](numbers.md#exhaust-eqe) | Invented |  | [data/assumptions.yaml:417](../data/assumptions.yaml#L417) |
| Cryo-continent thickness | [2 km](numbers.md#cryo-thickness) | Design choice |  | [data/assumptions.yaml:427](../data/assumptions.yaml#L427) |
| Carbon aerogel layer in each cap | [20 m](numbers.md#cryo-aerogel-thickness) | Invented |  | [data/assumptions.yaml:433](../data/assumptions.yaml#L433) |
| Carbon aerogel density | [82 kg/m³](numbers.md#cryo-aerogel-density) | Precedent |  | [data/assumptions.yaml:438](../data/assumptions.yaml#L438) |
| Carbon aerogel thermal conductivity | [0.029 W/(m·K)](numbers.md#cryo-aerogel-conductivity) | Precedent |  | [data/assumptions.yaml:444](../data/assumptions.yaml#L444) |
| Time for the crawlers that laid a cell to reseal a tear in it | [7 d](numbers.md#cryo-reseal-time) | Design choice |  | [data/assumptions.yaml:453](../data/assumptions.yaml#L453) |
| Graphite membrane thickness | [1 mm](numbers.md#cryo-membrane-thickness) | Invented |  | [data/assumptions.yaml:458](../data/assumptions.yaml#L458) |
| Crushed-basalt armour on each cap | [2 m](numbers.md#cryo-armour-thickness) | Design choice |  | [data/assumptions.yaml:464](../data/assumptions.yaml#L464) |
| Temperature the sealed dry ice is held at | [180 K](numbers.md#cryo-ice-temp) | Design choice |  | [data/assumptions.yaml:469](../data/assumptions.yaml#L469) |
| Effective temperature step between hot rock and basin floor | [450 K](numbers.md#cryo-floor-step) | Design choice |  | [data/assumptions.yaml:474](../data/assumptions.yaml#L474) |
| Area of one sealed compartment | [100 km²](numbers.md#cryo-cell-area) | Design choice |  | [data/assumptions.yaml:480](../data/assumptions.yaml#L480) |
| Depth basal heat pipes reach into the basin floors | [200 m](numbers.md#heat-pipe-depth) | Design choice |  | [data/assumptions.yaml:492](../data/assumptions.yaml#L492) |
| Oxygen pressure to make | [0.25 bar](numbers.md#o2-target-pressure) | Design choice |  | [data/assumptions.yaml:499](../data/assumptions.yaml#L499) |
| Molten-carbonate splitting efficiency | [60%](numbers.md#forge-efficiency) | Precedent |  | [data/assumptions.yaml:505](../data/assumptions.yaml#L505) |
| Number of Forges | [500](numbers.md#forge-count) | Design choice |  | [data/assumptions.yaml:512](../data/assumptions.yaml#L512) |
| Width of one Forge raft | [30 km](numbers.md#forge-raft-width) | Design choice |  | [data/assumptions.yaml:527](../data/assumptions.yaml#L527) |
| Water shipped to Venus | [1.0 × 10²⁰ kg](numbers.md#ice-mass) | Design choice | 3.0 × 10¹⁹ kg to 2.0 × 10²⁰ kg | [data/assumptions.yaml:535](../data/assumptions.yaml#L535) |
| Ice Brick mass | [1 Mt](numbers.md#brick-mass) | Design choice |  | [data/assumptions.yaml:541](../data/assumptions.yaml#L541) |
| Number of Railheads on Ceres | [10,000](numbers.md#railhead-count) | Design choice |  | [data/assumptions.yaml:547](../data/assumptions.yaml#L547) |
| Railhead acceleration | [200 g](numbers.md#railhead-accel) | Invented |  | [data/assumptions.yaml:552](../data/assumptions.yaml#L552) |
| Railhead efficiency, electricity to motion | [50%](numbers.md#railhead-efficiency) | Invented |  | [data/assumptions.yaml:557](../data/assumptions.yaml#L557) |
| Days kept between the last arrival and the deadline | [16 d](numbers.md#ice-lowering-margin) | Design choice |  | [data/assumptions.yaml:563](../data/assumptions.yaml#L563) |
| Ring altitude | [400 km](numbers.md#ring-altitude) | Design choice |  | [data/assumptions.yaml:580](../data/assumptions.yaml#L580) |
| Rotor speed | [10 km/s](numbers.md#ring-rotor-speed) | Invented |  | [data/assumptions.yaml:586](../data/assumptions.yaml#L586) |
| Rotor mass | [7.0 × 10¹² kg](numbers.md#ring-rotor-mass) | Invented |  | [data/assumptions.yaml:592](../data/assumptions.yaml#L592) |
| Stator mass (tracks, tethers, receivers) | [3.0 × 10¹² kg](numbers.md#ring-stator-mass) | Invented |  | [data/assumptions.yaml:597](../data/assumptions.yaml#L597) |
| Catcher braking | [50 g](numbers.md#ring-catch-accel) | Invented |  | [data/assumptions.yaml:602](../data/assumptions.yaml#L602) |
| Regenerative braking efficiency | [80%](numbers.md#ring-recovery-efficiency) | Invented |  | [data/assumptions.yaml:607](../data/assumptions.yaml#L607) |
| Number of tether lifts | [3,000](numbers.md#ring-tether-lifts) | Design choice |  | [data/assumptions.yaml:613](../data/assumptions.yaml#L613) |
| Height Bricks are released from | [100 km](numbers.md#lowering-release-altitude) | Design choice |  | [data/assumptions.yaml:618](../data/assumptions.yaml#L618) |
| Temperature of a Brick when it is lowered | [150 K](numbers.md#brick-temp) | Design choice |  | [data/assumptions.yaml:634](../data/assumptions.yaml#L634) |
| Magnetic bubble radius | [10,000 km](numbers.md#aegis-bubble-radius) | Design choice |  | [data/assumptions.yaml:647](../data/assumptions.yaml#L647) |
| Coil radius | [1,000 km](numbers.md#aegis-coil-radius) | Design choice |  | [data/assumptions.yaml:653](../data/assumptions.yaml#L653) |
| Turns in the coil | [1,000,000](numbers.md#aegis-turns) | Design choice |  | [data/assumptions.yaml:660](../data/assumptions.yaml#L660) |
| Radius of the coil's winding pack | [5 m](numbers.md#aegis-winding-radius) | Design choice |  | [data/assumptions.yaml:665](../data/assumptions.yaml#L665) |
| Temperature the Aegis cable runs at | [40 K](numbers.md#aegis-coil-temp) | Invented |  | [data/assumptions.yaml:670](../data/assumptions.yaml#L670) |
| Ocean pH that must hold before any life is released | [7.5](numbers.md#genesis-ph-min) | Design choice |  | [data/assumptions.yaml:678](../data/assumptions.yaml#L678) |
| Days the ocean pH must hold before any life is released | [90 d](numbers.md#genesis-ph-days) | Design choice |  | [data/assumptions.yaml:684](../data/assumptions.yaml#L684) |
| Density the drones seed cyanobacteria at in sunlit water | [100 per cm³](numbers.md#genesis-seed-density) | Design choice |  | [data/assumptions.yaml:689](../data/assumptions.yaml#L689) |
| Cyanobacteria density in rich, well-lit Earth seawater, the mark of a living ocean | [200,000 per cm³](numbers.md#genesis-bloom-density) | Precedent |  | [data/assumptions.yaml:696](../data/assumptions.yaml#L696) |
| Doubling time of the seeded ocean cyanobacteria in sunlit water | [1 d](numbers.md#genesis-doubling-days) | Invented |  | [data/assumptions.yaml:704](../data/assumptions.yaml#L704) |
| Thinnest black-loam soil laid on caps and shores | [10 cm](numbers.md#genesis-soil-min) | Design choice |  | [data/assumptions.yaml:710](../data/assumptions.yaml#L710) |
| Thickest black-loam soil laid on caps and shores | [30 cm](numbers.md#genesis-soil-max) | Design choice |  | [data/assumptions.yaml:716](../data/assumptions.yaml#L716) |
| Length of the day the Veil and Lanterns set | [24 h](numbers.md#day-length) | Design choice |  | [data/assumptions.yaml:722](../data/assumptions.yaml#L722) |
| Relative humidity over the new oceans | [75%](numbers.md#final-humidity) | Design choice |  | [data/assumptions.yaml:729](../data/assumptions.yaml#L729) |
| Albedo of the finished, Earth-like Venus | [30%](numbers.md#final-albedo) | Design choice |  | [data/assumptions.yaml:735](../data/assumptions.yaml#L735) |
| Coldest mean temperature that counts as Earth-like | [285 K](numbers.md#earth-like-temp) | Design choice |  | [data/assumptions.yaml:741](../data/assumptions.yaml#L741) |
| Most CO₂ that counts as Earth-like | [600 ppm](numbers.md#earth-like-co2) | Design choice |  | [data/assumptions.yaml:747](../data/assumptions.yaml#L747) |
| Days a replicator keeps building without a Mass Ledger heartbeat | [7 d](numbers.md#choir-deadman-days) | Design choice |  | [data/assumptions.yaml:755](../data/assumptions.yaml#L755) |
| Ouroboros-0 passes at this share of its own mass made from simulated regolith | [95%](numbers.md#ouroboros-0-closure) | Design choice |  | [data/assumptions.yaml:763](../data/assumptions.yaml#L763) |
| Ouroboros-0 passes if it doubles in less than this | [120 d](numbers.md#ouroboros-0-doubling) | Design choice |  | [data/assumptions.yaml:769](../data/assumptions.yaml#L769) |
| Ouroboros-0 is killed below this mass closure | [70%](numbers.md#ouroboros-0-kill-closure) | Design choice |  | [data/assumptions.yaml:774](../data/assumptions.yaml#L774) |
| Exhaust-1 passes at this much net cooling | [10 kW/m²](numbers.md#exhaust-1-cooling) | Design choice |  | [data/assumptions.yaml:780](../data/assumptions.yaml#L780) |
| Exhaust-1 must come within this share of the Carnot limit | [50%](numbers.md#exhaust-1-carnot) | Design choice |  | [data/assumptions.yaml:786](../data/assumptions.yaml#L786) |
| Exhaust-1 is killed if it shows no net cooling above this | [100 W/m²](numbers.md#exhaust-1-kill-cooling) | Design choice |  | [data/assumptions.yaml:792](../data/assumptions.yaml#L792) |
| Power the Lightpipe test beams between satellites | [1 MW](numbers.md#lightpipe-power) | Design choice |  | [data/assumptions.yaml:802](../data/assumptions.yaml#L802) |
| Distance the Lightpipe test beams over | [1,000 km](numbers.md#lightpipe-range) | Design choice |  | [data/assumptions.yaml:808](../data/assumptions.yaml#L808) |
| Lightpipe passes at this end-to-end efficiency | [30%](numbers.md#lightpipe-efficiency) | Design choice |  | [data/assumptions.yaml:814](../data/assumptions.yaml#L814) |
| Lightpipe is killed if phase lock fails beyond this many emitters | [100](numbers.md#lightpipe-kill-emitters) | Design choice |  | [data/assumptions.yaml:820](../data/assumptions.yaml#L820) |
| Area of the Veil-1 test slat | [1 km²](numbers.md#veil-1-area) | Design choice |  | [data/assumptions.yaml:825](../data/assumptions.yaml#L825) |
| Veil-1 must dim to block this share of sunlight | [99%](numbers.md#veil-1-dim) | Design choice |  | [data/assumptions.yaml:831](../data/assumptions.yaml#L831) |
| Veil-1 is killed if its film degrades within this | [6 months](numbers.md#veil-1-kill-life) | Design choice |  | [data/assumptions.yaml:837](../data/assumptions.yaml#L837) |
| Ice block the Railhead test throws | [1 t](numbers.md#railhead-test-mass) | Design choice |  | [data/assumptions.yaml:843](../data/assumptions.yaml#L843) |
| Railhead test passes at this muzzle speed | [3 km/s](numbers.md#railhead-test-speed) | Design choice |  | [data/assumptions.yaml:849](../data/assumptions.yaml#L849) |
| Railhead test passes at this many shots an hour | [10](numbers.md#railhead-test-rate) | Design choice |  | [data/assumptions.yaml:855](../data/assumptions.yaml#L855) |
| Railhead test is killed below this muzzle speed | [1 km/s](numbers.md#railhead-kill-speed) | Design choice |  | [data/assumptions.yaml:860](../data/assumptions.yaml#L860) |
| Railhead test is killed below this many shots an hour | [1](numbers.md#railhead-kill-rate) | Design choice |  | [data/assumptions.yaml:866](../data/assumptions.yaml#L866) |
| How long Cryo-seal must hold its leak | [12 months](numbers.md#cryo-seal-months) | Design choice |  | [data/assumptions.yaml:871](../data/assumptions.yaml#L871) |
| Size of the Mini-Aegis test coil | [10 m](numbers.md#mini-aegis-coil) | Design choice |  | [data/assumptions.yaml:877](../data/assumptions.yaml#L877) |
| Robots in the Choir-sim test factory | [10,000](numbers.md#choir-sim-robots) | Design choice |  | [data/assumptions.yaml:882](../data/assumptions.yaml#L882) |
| How long Choir-sim must run unattended | [90 d](numbers.md#choir-sim-days) | Design choice |  | [data/assumptions.yaml:887](../data/assumptions.yaml#L887) |
| Choir-sim is killed above this many human interventions a day | [1](numbers.md#choir-sim-kill-interventions) | Design choice |  | [data/assumptions.yaml:892](../data/assumptions.yaml#L892) |
<!-- /table -->

Every assumption with a range is a slider in the [Explorer](https://phosphoros.space/explore), which runs
the same model in your browser: move one and every number, chart and check on the site follows. From a
clone, `pnpm calc --set <id>=<value>` does the same.
