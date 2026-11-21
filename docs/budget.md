# Energy and Mass Budget

Phosphoros is an energy plan before it is anything else. This page shows where every joule comes from and
where it goes, and checks that supply covers demand. It does, narrowly. The numbers come from
[calc/src/model/budget.ts](../calc/src/model/budget.ts) and the modules it reads; the [ledger](numbers.md)
gives each one's formula and inputs.

## The energy budget

<!-- table:budget -->
| Task | Energy the Lattice delivers |
| --- | --- |
| Launch [1.0 × 10²⁰ kg](numbers.md#ice-mass) of ice from Ceres | [5.6 × 10²⁷ J](numbers.md#ice-launch-energy) |
| Heat-pump work to cool Venus | [5.6 × 10²⁷ J](numbers.md#traj-pump-energy) |
| Run the chimney fans | [6.3 × 10²⁴ J](numbers.md#traj-fan-energy) |
| Warm the air and melt the last ice | [4.4 × 10²⁵ J](numbers.md#traj-warm-energy) |
| Forge [0.25 bar](numbers.md#o2-target-pressure) of oxygen | [2.7 × 10²⁵ J](numbers.md#forge-energy) |
| Build the Foundry, the Veil, the Lattice and the Ring | [5 × 10²² J](numbers.md#hardware-energy) |
| **Total demand** | **[1.1 × 10²⁸ J](numbers.md#budget-demand)** |
| Supply: the Lattice from full power to the deadline | [1.3 × 10²⁸ J](numbers.md#helios-supply) |
| Spare | [11%](numbers.md#budget-spare) |
| Spare once the Ring powers the Railheads | [32%](numbers.md#budget-spare-with-ring) |
<!-- /table -->

<!-- figure:lattice-budget -->
![Energy the Helios Lattice must deliver, against its supply](../figures/svg/lattice-budget.svg)
<!-- /figure -->

The plan must deliver [1.1 × 10²⁸ J](numbers.md#budget-demand) to Venus and Ceres from outside. The Helios
Lattice supplies [1.3 × 10²⁸ J](numbers.md#helios-supply): [1.2 × 10²⁰ W](numbers.md#helios-power) for the
[3.3 yr](numbers.md#helios-supply-years) from full power in [August 2033](numbers.md?date=month#helios-full-power)
to the deadline. That leaves [11%](numbers.md#budget-spare) spare on the Lattice alone, and
[32%](numbers.md#budget-spare-with-ring) once the Braking Ring's recovered energy pays for the Railheads.
Launching the water and pumping out the heat take [88%](numbers.md#budget-launch-share) of the Lattice's
output; oxygen and hardware are small change.

The supply side is conservative. It counts only the full-power years, while the simulation also uses the
Lattice's growing output from [April 2034](numbers.md?date=month#cooling-start). The budget charges the
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

The hot side is the emitter's effective temperature, [1,600 K](numbers.md#exhaust-effective-temp). That is
what it takes for a tile to shine [0.37 MW/m²](numbers.md#exhaust-flux), so that a manageable area of
emitters can carry the load. The cold side is the air itself, which starts at
[737 K](numbers.md#venus-surface-temp) and ends at [195 K](numbers.md?sig=3#freeze-target-temp). Summing
dW along the cooling path gives [1.7 × 10²⁷ J](numbers.md#exhaust-work-sensible) for the sensible cooling
and [2.8 × 10²⁷ J](numbers.md#exhaust-work-latent) for the latent heat, which comes out when the air is
cold and each joule is dearest: [4.46 × 10²⁷ J](numbers.md#exhaust-work) in all, or
[8.5](numbers.md#exhaust-work-ratio) joules of work per joule of heat moved.

The effective temperature is a trade. Cooler emitters need less work per joule but far more area: at the
coolest option the model tries, emitters would cover [150%](numbers.md#exhaust-area-share-1000) of Venus; at
the hottest, [10%](numbers.md#exhaust-area-share-2500), for more work. The ledger lists each option's
temperature. The Exhaust throws the heat and the work into space together,
[5.0 × 10²⁷ J](numbers.md#exhaust-rejected), an average of [6.6 × 10¹⁹ W](numbers.md#exhaust-rejected-avg)
over the [2.4 yr](numbers.md#cooling-seconds) campaign.

### Why the simulation pumps more

The budget does not charge [4.46 × 10²⁷ J](numbers.md#exhaust-work). It charges what the day-by-day
[simulation](plan.md#the-simulated-atmosphere) actually spends, [5.6 × 10²⁷ J](numbers.md#traj-pump-energy).
The difference has three causes.

- **Heat keeps arriving.** While the pumps run, [8.1 × 10²⁵ J](numbers.md#traj-heat-added) enters the air
  from the crust, from the Forges' waste heat, from ice falling the last
  [100 km](numbers.md#lowering-release-altitude), and from the sunlight the closed Veil lets through.
- **It arrives when pumping is dearest.** Much of that heat comes late, while the seas freeze at
  [216.6 K](numbers.md#co2-triple-temp) and after, when every joule costs more work than the campaign's
  average of [8.5](numbers.md#exhaust-work-ratio). The simple estimate also spreads all the latent heat
  between the critical and triple points, where the simulation lifts the seas' heat of fusion,
  [210 kJ/kg](numbers.md#co2-fusion-heat), at the triple point itself.
- **The Frost Towers.** Trapping the last [5.4 × 10¹⁸ kg](numbers.md#frost-residual-co2) of CO₂ at
  [133 K](numbers.md#frost-tower-temp) takes about [6.8 × 10²⁵ J](numbers.md#frost-work) more.

After the caps are sealed, the beamed power also warms the air and melts the ice that was lowered while the
air was below freezing: [4.4 × 10²⁵ J](numbers.md#traj-warm-energy). Version 2 charged only the simple
estimate; counting the simulation is most of why the demand rose
([correction](about.md#corrections)).

### Launching the ice

Each Brick leaves Ceres at [6.4 km/s](numbers.md#ice-launch-speed). Its motion energy is ½v² per kilogram,
and the Railheads turn electricity into motion at [50%](numbers.md#railhead-efficiency), so each kilogram
draws [41 MJ/kg](numbers.md#launch-energy-per-kg) in a launch window. The Railheads fire all the time, though,
and a shot between windows needs a faster orbit to meet Venus: up to
[75%](numbers.md#launch-offwindow-max) more energy at the worst time, [37%](numbers.md#launch-offwindow-mean)
more on average. So each kilogram draws [55.6 MJ/kg](numbers.md#launch-energy-per-kg-avg) on average, and
[1.0 × 10²⁰ kg](numbers.md#ice-mass) of ice takes [5.6 × 10²⁷ J](numbers.md#ice-launch-energy), drawn at
[1.1 × 10²⁰ W](numbers.md#railhead-power) while the campaign runs. Of that,
[1.5 × 10²⁷ J](numbers.md#ice-launch-offwindow-energy) is the price of firing between windows.

### Ring recovery and gravity

The ice reaches Venus at [9.08 km/s](numbers.md#ice-vinf) relative to the planet and speeds up to
[18.2 km/s](numbers.md#ring-arrival-speed) by the Ring's height. Braking it to orbital speed,
[7.1 km/s](numbers.md#ring-orbital-speed), frees [140 MJ/kg](numbers.md#ring-catch-energy-per-kg), of which
[80%](numbers.md#ring-recovery-efficiency) becomes electricity: [110 MJ/kg](numbers.md#ring-recovered-per-kg),
or [1.1 × 10²⁸ J](numbers.md#ring-recovered-energy) for all the ice. That is
[2.7](numbers.md#ring-vs-launch) times what a launch in a window draws, and still more than the average launch.

> **Physics:** This is not free energy. The ice falls from Ceres's orbit at
> [2.77 AU](numbers.md#ceres-orbit) to Venus's at [0.723 AU](numbers.md#venus-orbit), deep into the Sun's
> gravity well, then into Venus's own well down to the Ring. Gravity adds
> [1.1 × 10²⁸ J](numbers.md#ice-solar-gain) to its motion between launch and catch. The Ring harvests
> energy gravity gave the ice.

The budget counts it like this. Until the first Brick is caught on
[3 July 2034](numbers.md?date=day#ring-pays-from), the Lattice powers the Railheads, which costs it
[2.9 × 10²⁷ J](numbers.md#budget-lattice-launch). After that the Ring pays for them: its electricity runs Venus
while the Lattice keeps beaming Ceres, so the Lattice delivers
only [8.6 × 10²⁷ J](numbers.md#budget-demand-with-ring), leaving [32%](numbers.md#budget-spare-with-ring)
spare. Counted instead as extra supply, the Ring brings the total to
[2.4 × 10²⁸ J](numbers.md#budget-supply-total) and the spare to [53%](numbers.md#budget-spare-total). The
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

Everything the Foundry builds, itself included, about [4.6 × 10¹⁴ kg](numbers.md#foundry-built-mass), costs
[100 MJ/kg](numbers.md#foundry-energy-per-kg) to make from regolith: [5 × 10²² J](numbers.md#hardware-energy),
a rounding error. Once the Foundry runs, matter is cheap. Energy is the cost.

## The mass budget

<!-- table:mass -->
| Mass item | Amount | From |
| --- | --- | --- |
| Ouroboros machinery at peak | [1.3 × 10¹⁴ kg](numbers.md#foundry-final-mass) | Mercury regolith |
| Helios Lattice | [8.8 × 10¹³ kg](numbers.md#helios-mass) | Mercury |
| Hesperus Veil | [5.4 × 10¹¹ kg](numbers.md#veil-mass) | Mercury |
| Braking Ring | [1.0 × 10¹³ kg](numbers.md#ring-mass) | Mercury |
| Ceres factories at peak | [1.3 × 10¹⁴ kg](numbers.md#ceres-final-mass) | Ceres rock |
| Railheads and Crown | [1.2 × 10¹⁴ kg](numbers.md#ceres-build-mass) | Ceres |
| Water delivered | [1.0 × 10²⁰ kg](numbers.md#ice-mass) | Ceres ([39%](numbers.md#ice-ceres-water-share) of its water) |
| CO₂ sealed in cryo-continents | [4.69 × 10²⁰ kg](numbers.md#venus-co2-mass), [3.0 × 10¹⁷ m³](numbers.md#cryo-volume) | Venus's air |
| Oxygen made | [1.3 × 10¹⁸ kg](numbers.md#o2-mass) | Split from Venus's CO₂ |
| Graphite made | [4.9 × 10¹⁷ kg](numbers.md#forge-graphite) | Forge by-product |
<!-- /table -->

The Foundry makes every piece of hardware from Mercury rock, and the Ceres factories make the Railheads and
the Crown from Ceres's; only their two seeds leave Earth. The largest mass the plan moves is Venus's own CO₂, which never leaves the planet: it is frozen
in place. The largest mass it imports is the water.

## Physics checks

Every run of the model tests these. A check is a law of physics or a requirement of the plan.

<!-- table:checks -->
| Check | Result | Detail |
| --- | --- | --- |
| [Version 2: a statite Veil 137,000 km sunward of Venus can hover](numbers.md#check-veil-v2-hovers) | **Fails (open issue)** | Light pressure (0.0174 m/s²) and Venus's gravity both point toward Venus; the shade falls with 0.0347 m/s² and reaches Venus in about 1 d. |
| [A station exists where gravity, light pressure and orbital motion balance on the Veil](numbers.md#check-veil-hovers) | Pass | At 1.11 × 10⁶ km sunward of Venus the forces on a Veil with a lightness of 0.0077 balance. The point is unstable along the Sun line, so holding it takes constant trimming, by tilting slats, which the model does not size. |
| [Gaps and closed slats together leak no more than the Veil may](numbers.md#check-veil-leak-fits) | Pass | Gaps of 0.05% plus 0.03% through the closed slats, against the 0.1% the closed Veil may let through. |
| [The heat pumps are charged more than the reversible work](numbers.md#check-second-law) | Pass | The pumps reach 50% of the Carnot limit, so the model charges 4.46 × 10²⁷ J of work for 5.3 × 10²⁶ J of heat, more than the 6.2 × 10²⁶ J even a reversible pump would need if every joule left from 737 K. |
| [The Exhaust's beamed light can carry away the entropy its pumps lift](numbers.md#check-exhaust-entropy) | **Fails (open issue)** | The model charges pump work as if the hot side were at 1,600 K. Light at 0.37 MW/m² squeezed into a 0.4 µm band around 2.3 µm and a 25° cone counts as at least 9,000 K, 5.6 times hotter. Lifting a joule from the 737 K air into that light takes 9.6 times the work the budget charges. |
| [An opaque Veil leaves the Exhaust's cones a clear sky](numbers.md#check-exhaust-clears-veil) | Pass | Seen from Venus the Veil is 0.68° in radius. Tiles that face it tilt their 25° cones 13° off the Sun line, which keeps every cone 64° clear of the horizon. |
| [The Forges make the cap graphite before sealing ends](numbers.md#check-graphite-for-caps) | Pass | 4.6 × 10¹⁷ kg of graphite by the end of sealing; the caps need 2.5 × 10¹⁷ kg. |
| [The Ring catches the ice before it must lower it](numbers.md#check-ice-arrives) | Pass | Lowering 1.0 × 10²⁰ kg runs from 30 June 2035 to 15 December 2036, and the Ring can only lower what it has caught. When lowering begins it holds 36% of the ice. The last launch, on 14 April 2035, leaves room for the slowest transfer from Ceres's drifted orbit, 611 d; the last Brick arrives on 15 December 2036, 0 d before lowering ends. |
| [The Ring is complete before the first Brick arrives](numbers.md#check-ring-ready-for-ice) | Pass | The fastest transfer the schedule uses takes 310 d, so Bricks from the first launch on 28 August 2033 can reach Venus on 3 July 2034; the Ring is complete on 31 December 2033. |
| [Ceres's surface can radiate the heat left on the ground](numbers.md#check-ceres-ground-heat) | Pass | All the heat made at Ceres is 110 times what its whole surface could radiate at 1,500 K (8.0 × 10¹⁷ W), so the Crown sheds it in space; the barrels leave 1.1 × 10¹⁷ W on the ground, radiators over 14% of the surface. |
| [Ceres's receivers shed heat no faster than a cooled surface already does](numbers.md#check-ceres-receiver-cooling) | Pass | At 40 MW/m² each square metre of receiver hands 10 MW/m² to its coolant, against the 10 MW/m² ITER's divertor is built to carry; left to radiate it alone, a receiver would reach 3,100 K. |
| [The Crown stays deep inside Ceres's Hill sphere, and the recoil cannot shake it off](numbers.md#check-crown-orbit) | Pass | The Crown circles at 1,190 km and its fins reach 7,200 km, well inside half of Ceres's 220,000 km Hill radius, where orbits around a small body stay bound; Ceres's recoil, 1.5 × 10⁻⁵ m/s², is small beside its 0.0012 m/s² pull even at the fins' edge. |
| [Carbon-fibre tethers can hang from the Crown to Ceres's surface](numbers.md#check-crown-tethers) | Pass | Summed from the surface to the Crown, Ceres's net pull on a tether is 59 kJ/kg, against the 3.9 MJ/kg carbon fibre holds at full strength; hanging the 1.4 × 10¹³ kg of cables and holding the beams' 4.8 × 10¹¹ N push takes 3.0 × 10¹¹ kg of fibre. |
| [The first launch waits for Ceres's factories, whose seed leaves with the Foundry's](numbers.md#check-ceres-ready-in-time) | Pass | The seed leaves Earth on 1 October 2028, with the Foundry's once Ouroboros-0 has passed, and lands on 16 January 2030; doubling every 45 d, the factories finish the 1.2 × 10¹⁴ kg of Railheads and Crown on 14 July 2033, against a first launch on 28 August 2033. |
| [The Lattice can power the Railheads until the Ring pays for them](numbers.md#check-railheads-within-lattice) | Pass | Throwing 1.0 × 10²⁰ kg in 1.6 yr takes 1.1 × 10²⁰ W, and until the first Brick is caught on 3 July 2034 only the Lattice's 1.2 × 10²⁰ W can supply it. |
| [Ceres's new orbit stays clear of Jupiter](numbers.md#check-ceres-clear-of-jupiter) | Pass | At its new aphelion Ceres stays 1.64 AU inside Jupiter's closest approach to the Sun, 4.6 of Jupiter's Hill radii against the 2√3 that keeps two orbits from meeting; its Tisserand parameter falls from 3.31 to 3.21, still above the 3 below which Jupiter takes control. |
| [The Ring recovers more power than the Railheads draw](numbers.md#check-ring-energy-loop) | Pass | The Ring recovers 2.2 × 10²⁰ W against the 1.1 × 10²⁰ W the Railheads draw. |
| [The rotor holds the stator up](numbers.md#check-ring-holds-stator) | Pass | The 7.0 × 10¹² kg rotor, faster than orbital speed, presses outward enough to carry the 3.0 × 10¹² kg stator with 3.0 × 10¹³ N to spare. |
| [The rotor can also carry the receivers, fins and radiators the plan hangs on the stator](numbers.md#check-ring-carries-equipment) | **Fails (open issue)** | The receivers, their fins and the catch's radiators weigh 4.8 × 10¹³ kg at the densities the plan uses on Ceres; the rotor's spare lift carries 3.9 × 10¹² kg, 12 times too little. |
| [The Ring can pass the catch's net braking force to Venus](numbers.md#check-ring-net-force) | **Fails (open issue)** | Catching half the Bricks eastbound and half westbound cancels the twist, not the force: 6.0 × 10¹⁶ N remains along Venus's orbital motion. An orbital ring has no stiff way to hand an in-plane force to the planet; its spare lift is 3.0 × 10¹³ N, 2,000 times too little. |
| [The Ring can carry the force of lowering the ice on tethers](numbers.md#check-ring-lowering-load) | **Fails (open issue)** | Lowering 2.2 × 10¹² kg/s needs at least 4.7 × 10¹⁵ N; the rotor's spare lift is 3.0 × 10¹³ N, 150 times too little. |
| [Building the Veil costs the Foundry no more than one doubling](numbers.md#check-foundry-affords-veil) | Pass | The Foundry stands still for 9.8 d to build the 5.4 × 10¹¹ kg Veil, whose last parts leave Mercury on 16 September 2032; one doubling is 60 d. |
| [The Foundry stops growing at the size that finishes the Lattice and the Ring soonest](numbers.md#check-foundry-size) | Pass | After 27 doublings the 1.3 × 10¹⁴ kg Foundry builds the 8.8 × 10¹³ kg Lattice in 57 d and the Ring in 6.4 d: both done 1683 days after landing, against 1687 with one doubling fewer and 1712 with one more. |
| [The Ring's mass reaches Venus before the Ring must be complete](numbers.md#check-foundry-builds-ring) | Pass | After the Lattice, the Foundry builds the 1.0 × 10¹³ kg Ring in 6.4 d; its last parts reach Venus on 18 November 2033, and the Ring must be complete on 31 December 2033. |
| [The Foundry can build the structure that holds the Aegis coil together](numbers.md#check-aegis-structure) | Pass | The coil's field pulls on its winding with 1.2 × 10¹¹ N; holding it takes at least 2.0 × 10¹¹ kg of carbon fibre at full strength, 0.13 days of the full Foundry's output against the 60 d of one doubling. |
| [The simulation's heat books balance: it lifts every joule it counts in](numbers.md#check-traj-heat-books) | Pass | The Exhaust lifts 6.1 × 10²⁶ J: Venus's 5.3 × 10²⁶ J, less the 1.6 × 10²¹ J still held by the CO₂ the Frost Towers leave in the air, plus 8.1 × 10²⁵ J that enters while the pumps run. The two sides agree to rounding. This confirms the simulation's own bookkeeping; a heat source the simulation leaves out cannot show here (see the loss-heat check). |
| [The seas are frozen through before the last caps are sealed](numbers.md#check-frozen-before-sealing) | Pass | The simulated seas are frozen through on 13 February 2036, leaving 200 d to the last cap on 1 September 2036: the crawler-rafts must lay 750,000 km²/d. |
| [The Frost Towers finish before the last caps are sealed](numbers.md#check-frost-before-sealing) | Pass | The simulated Frost Towers finish on 9 April 2036; the last caps are sealed on 1 September 2036. |
| [The plan still cools in time with the loss heat its receivers and Ring send into Venus](numbers.md#check-loss-heat-fits) | **Fails (open issue)** | The receivers shed 4.0 × 10¹⁹ W at full power and the catcher tracks 5.4 × 10¹⁹ W, from fins that radiate from both faces: 28% of their light falls on Venus from the Ring, 41% from the canopies. That is 2.7 × 10¹⁹ W with the Lattice at full power and the Ring catching, which the published simulation leaves out. Counting it, the Frost Towers never finish in the simulated years, against the last caps sealed on 1 September 2036. |
| [Seeded life greens the oceans by the deadline](numbers.md#check-genesis-by-deadline) | Pass | Seeding waits for the oxygen (30 September 2036) and for the oceans to hold their pH (1 December 2036), so it begins on 1 December 2036; doubling every 1 d, the cells reach bloom density on 12 December 2036, against a deadline of 31 December 2036. |
| [The simulated atmosphere is Earth-like by the deadline](numbers.md#check-earth-like-by-deadline) | Pass | The day-by-day simulation reaches Earth-like conditions on 30 September 2036, 92 d before the 31 December 2036 deadline. The chimneys, not the power, set the pace on 160 d of it. |
| [The ozone model, run on Earth's air, gives Earth's ozone column](numbers.md#check-ozone-model-earth) | Pass | 280 DU against 279 DU from a three-dimensional model of the pre-industrial Earth, within a quarter either way, with nothing fitted. |
| [The ozone shields the land before the deadline](numbers.md#check-ozone-shield-in-time) | Pass | One day of sunlight makes 49.9 DU, easily measured. The column reaches 185 DU on 2 December 2036, 91 d after the Veil opens, so lichens and mosses go onto land from 2 December 2036, against a deadline of 31 December 2036. |
| [The energy budget closes: supply covers demand](numbers.md#check-energy-closes) | Pass | Lattice supply 1.3 × 10²⁸ J against demand 1.1 × 10²⁸ J: 11% spare before the Ring's recovered energy, 32% once the Ring pays for the Railheads. |
| [With the Ring's recovered energy, supply covers demand](numbers.md#check-energy-closes-with-ring) | Pass | The Lattice delivers 1.3 × 10²⁸ J against 8.6 × 10²⁷ J once the Ring pays for the Railheads, and the Ring recovers 1.1 × 10²⁸ J against the 2.7 × 10²⁷ J of launches it pays for. |
<!-- /table -->

[6](numbers.md#checks-failing) of the [35](numbers.md#checks-total) checks fail, and each is shown on purpose.

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
[1,600 K](numbers.md#exhaust-effective-temp), right for light spread over colours and directions the way a
surface that hot spreads it. The tiles put their light into a [0.4 µm](numbers.md#exhaust-band) band and a
[25°](numbers.md#exhaust-cone) cone instead, and light that concentrated carries little entropy: it counts as
at least [9,000 K](numbers.md#exhaust-light-temp). Lifting a joule from the starting air into it takes
[9.6](numbers.md#exhaust-work-multiple) times the work the budget charges. Read the pump work here as a floor
until the tiles spread their light far wider or the pumps grow; the options are on the
[Photonic Exhaust](technologies/exhaust.md#the-cost-of-beamed-light) page.

**The Ring's net force.** Catching half the Bricks eastbound and half westbound cancels the twist the catch
puts on the Ring, not the push: [6.0 × 10¹⁶ N](numbers.md#ring-net-braking-force) remains along Venus's
orbital motion, [2,000](numbers.md#ring-net-overload) times the rotor's spare lift. The energy the catch
recovers is real; what holds the Ring in place while it catches is unsolved
([Braking Ring](technologies/ring.md)).

**Freezing the seas.** The tightest stretch of the schedule. At the triple point,
[216.6 K](numbers.md#co2-triple-temp), the seas give up their heat of fusion while the air holds there. The
emitters are at their peak all through it and the falling ice keeps adding heat, so the seas start to freeze on
[4 September 2035](numbers.md?date=day#traj-freeze) and are frozen through on
[13 February 2036](numbers.md?date=day#traj-frozen). All the CO₂ is down on
[30 March 2036](numbers.md?date=day#traj-cold) and the Frost Towers finish on
[9 April 2036](numbers.md?date=day#traj-scavenged), [150 d](numbers.md#frost-sealing-slack) before the last caps
are due on [1 September 2036](numbers.md?date=day#sealing-end). The ice melts and the oceans start their pH hold
when the Veil opens, on [2 September 2036](numbers.md?date=day#traj-warming), so seeded life greens them on
[12 December 2036](numbers.md?date=day#genesis-end), before the deadline. When the model first released the
heat of fusion, at the Exhaust's earlier peak, the freeze ran into June 2036 and both checks failed; the peak
grew a tenth, to [1.2 × 10²⁰ W](numbers.md#exhaust-peak), to fix it ([correction](about.md#corrections)).

**Launches between windows.** The Railheads fire through every part of the
[8.5 months](numbers.md#launch-window-period) between launch windows, and those shots cost
[1.5 × 10²⁷ J](numbers.md#ice-launch-offwindow-energy) more than the Hohmann minimum. The budget charges them,
and the Lattice is sized for it: [1.2 × 10²⁰ W](numbers.md#helios-power), enough to close the budget on its own
with [11%](numbers.md#budget-spare) to spare and [32%](numbers.md#budget-spare-with-ring) once the Ring powers
the Railheads ([check](numbers.md#check-energy-closes-with-ring)).

## How much room the plan has

Each row moves one assumption alone, across the range the [Explorer](https://phosphoros.space/explore) lets a reader try, with
everything else as planned, and finds where a check that passes today first fails. Most of the plan's
schedule hangs on one date: the Frost Towers must have the CO₂ down before the last caps are sealed on
[1 September 2036](numbers.md?date=day#sealing-end), and they finish only
[150 d](numbers.md#frost-sealing-slack) before it.

<!-- table:margins -->
| Assumption | Plan | The plan holds from | to | What breaks first |
| --- | --- | --- | --- | --- |
| Water share of Ceres's mass | [27%](numbers.md?sig=3#ceres-water-fraction) | 17% or less | 35% or more | Nothing, across the whole range |
| Seed foundry mass | [1,000 t](numbers.md?sig=3#foundry-seed-mass) | 634 t | 9,640 t | Lower: [The Ring's mass reaches Venus before the Ring must be complete](numbers.md#check-foundry-builds-ring). Higher: [Building the Veil costs the Foundry no more than one doubling](numbers.md#check-foundry-affords-veil) |
| Foundry doubling time | [60 d](numbers.md?sig=3#foundry-doubling-days) | 30 d or less | 61.4 d | Higher: [The Ring's mass reaches Venus before the Ring must be complete](numbers.md#check-foundry-builds-ring) |
| Energy to make a kilogram of machinery from regolith | [100 MJ/kg](numbers.md?sig=3#foundry-energy-per-kg) | 30 MJ/kg or less | 300 MJ/kg or more | Nothing, across the whole range |
| Power the Helios Lattice delivers | [1.20 × 10²⁰ W](numbers.md?sig=3#helios-power) | 1.05 × 10²⁰ W | 1.60 × 10²⁰ W or more | Lower: [The Lattice can power the Railheads until the Ring pays for them](numbers.md#check-railheads-within-lattice) |
| Hot-film solar cell efficiency at about 460 K | [40%](numbers.md?sig=3#helios-film-efficiency) | 25% or less | 50% or more | Nothing, across the whole range |
| Electricity-to-laser efficiency | [50%](numbers.md?sig=3#helios-laser-efficiency) | 30% or less | 70% or more | Nothing, across the whole range |
| Share of sunlight's momentum the light-bending film takes up | [0.01](numbers.md?sig=3#veil-momentum-fraction) | 0.002 or less | 0.0939 | Higher: [The Ring's mass reaches Venus before the Ring must be complete](numbers.md#check-foundry-builds-ring) |
| Effective temperature the emitters shine at | [1,600 K](numbers.md?sig=3#exhaust-effective-temp) | 1,120 K | 1,930 K | Lower: [The Frost Towers finish before the last caps are sealed](numbers.md#check-frost-before-sealing). Higher: [The Frost Towers finish before the last caps are sealed](numbers.md#check-frost-before-sealing) |
| Share of the Carnot limit the heat pumps reach | [50%](numbers.md?sig=3#exhaust-carnot-share) | 40.5% | 90% or more | Lower: [The Frost Towers finish before the last caps are sealed](numbers.md#check-frost-before-sealing) |
| Peak power the Exhaust can throw into space | [1.20 × 10²⁰ W](numbers.md?sig=3#exhaust-peak) | 9.65 × 10¹⁹ W | 1.60 × 10²⁰ W or more | Lower: [The Frost Towers finish before the last caps are sealed](numbers.md#check-frost-before-sealing) |
| Water shipped to Venus | [1.00 × 10²⁰ kg](numbers.md?sig=3#ice-mass) | 3.00 × 10¹⁹ kg or less | 1.11 × 10²⁰ kg | Higher: [The Lattice can power the Railheads until the Ring pays for them](numbers.md#check-railheads-within-lattice) |
| Ceres seed factory mass | [1,000 t](numbers.md?sig=3#ceres-seed-mass) | 217 t | 10,000 t or more | Lower: [The Lattice can power the Railheads until the Ring pays for them](numbers.md#check-railheads-within-lattice) |
| Ceres factory doubling time | [45 d](numbers.md?sig=3#ceres-doubling-days) | 30 d or less | 48.5 d | Higher: [The Lattice can power the Railheads until the Ring pays for them](numbers.md#check-railheads-within-lattice) |
<!-- /table -->

Some changes are not on a slider. The seeds launch once their own proof experiment, Ouroboros-0, has shown
mass closure, but before it and the other experiments must pass ([Research](research.md)): they are in
flight when the results come. Waiting for every result costs more than the slack:

<!-- table:scenarios -->
| What if | Simulated Earth-like | Against the deadline | Newly failing checks |
| --- | --- | --- | --- |
| The plan | 30 September 2036 | 92 d early | None |
| The seeds wait for every proof experiment to pass before they launch | 29 September 2036 | 93 d early | [The Lattice can power the Railheads until the Ring pays for them](numbers.md#check-railheads-within-lattice); [The Ring's mass reaches Venus before the Ring must be complete](numbers.md#check-foundry-builds-ring); [The Frost Towers finish before the last caps are sealed](numbers.md#check-frost-before-sealing); [Seeded life greens the oceans by the deadline](numbers.md#check-genesis-by-deadline) |
<!-- /table -->

`tools/margins.ts` computes both tables by running the whole model a few hundred times.

## Every assumption

These are the plan's choices and the breakthroughs it assumes. Each links to the line that defines it, and
its basis says whether it is a design choice, an invention or a demonstrated precedent. Dates are on the
[Timeline](timeline.md).

<!-- table:assumptions -->
| Assumption | Value | Basis | Explore | Defined in | Used by |
| --- | --- | --- | --- | --- | --- |
| Temperature the air is cooled to, freezing out its CO₂ | [195 K](numbers.md#freeze-target-temp) | Design choice |  | [data/assumptions.yaml:55](../data/assumptions.yaml#L55) | [conventional.ts](../calc/src/model/conventional.ts), [exhaust.ts](../calc/src/model/exhaust.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| How much the crust's surface cools | [400 K](numbers.md#crust-cooling-step) | Design choice |  | [data/assumptions.yaml:62](../data/assumptions.yaml#L62) | [conventional.ts](../calc/src/model/conventional.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Length of a fast cooling campaign, for the crust estimate (years) | [4](numbers.md#skin-campaign-years) | Design choice |  | [data/assumptions.yaml:67](../data/assumptions.yaml#L67) | [conventional.ts](../calc/src/model/conventional.ts) |
| The decade target (years) | [10](numbers.md#conventional-campaign-years) | Design choice |  | [data/assumptions.yaml:72](../data/assumptions.yaml#L72) | [conventional.ts](../calc/src/model/conventional.ts) |
| Payload of one heavy-lift launch from Earth | [100 t](numbers.md#heavy-launch-payload) | Design choice |  | [data/assumptions.yaml:77](../data/assumptions.yaml#L77) | [conventional.ts](../calc/src/model/conventional.ts) |
| Seed foundry mass | [1,000 t](numbers.md#foundry-seed-mass) | Design choice | 100 t to 10,000 t | [data/assumptions.yaml:89](../data/assumptions.yaml#L89) | [foundry.ts](../calc/src/model/foundry.ts) |
| Earth-to-Mercury transfer | [105 d](numbers.md#foundry-transfer-days) | Design choice |  | [data/assumptions.yaml:101](../data/assumptions.yaml#L101) | [foundry.ts](../calc/src/model/foundry.ts) |
| Foundry doubling time | [60 d](numbers.md#foundry-doubling-days) | Invented | 30 d to 120 d | [data/assumptions.yaml:107](../data/assumptions.yaml#L107) | [ceres.ts](../calc/src/model/ceres.ts), [foundry.ts](../calc/src/model/foundry.ts), [helios.ts](../calc/src/model/helios.ts) |
| Energy to make a kilogram of machinery from regolith | [100 MJ/kg](numbers.md#foundry-energy-per-kg) | Invented | 30 MJ/kg to 300 MJ/kg | [data/assumptions.yaml:114](../data/assumptions.yaml#L114) | [ceres.ts](../calc/src/model/ceres.ts), [foundry.ts](../calc/src/model/foundry.ts) |
| Share of each copy's mass in complex parts (chips, bearings, optics) | [2%](numbers.md#foundry-complex-share) | Invented |  | [data/assumptions.yaml:121](../data/assumptions.yaml#L121) |  |
| Smallest feature a Lithocell chip fab writes | [90 nm](numbers.md#lithocell-feature-size) | Invented |  | [data/assumptions.yaml:128](../data/assumptions.yaml#L128) |  |
| Power the Helios Lattice delivers | [1.2 × 10²⁰ W](numbers.md#helios-power) | Design choice | 6.0 × 10¹⁹ W to 1.6 × 10²⁰ W | [data/assumptions.yaml:137](../data/assumptions.yaml#L137) | [cryo.ts](../calc/src/model/cryo.ts), [helios.ts](../calc/src/model/helios.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Hot-film solar cell efficiency at about 460 K | [40%](numbers.md#helios-film-efficiency) | Invented | 25% to 50% | [data/assumptions.yaml:144](../data/assumptions.yaml#L144) | [ceres.ts](../calc/src/model/ceres.ts), [helios.ts](../calc/src/model/helios.ts) |
| Electricity-to-laser efficiency | [50%](numbers.md#helios-laser-efficiency) | Invented | 30% to 70% | [data/assumptions.yaml:151](../data/assumptions.yaml#L151) | [helios.ts](../calc/src/model/helios.ts) |
| Receiver efficiency, laser light to electricity | [75%](numbers.md#helios-receiver-efficiency) | Invented |  | [data/assumptions.yaml:158](../data/assumptions.yaml#L158) | [ceres.ts](../calc/src/model/ceres.ts), [helios.ts](../calc/src/model/helios.ts) |
| Petal film areal density | [1 g/m²](numbers.md#helios-areal-density) | Invented |  | [data/assumptions.yaml:164](../data/assumptions.yaml#L164) | [ceres.ts](../calc/src/model/ceres.ts), [helios.ts](../calc/src/model/helios.ts) |
| Petal edge | [70 km](numbers.md#helios-petal-side) | Design choice |  | [data/assumptions.yaml:170](../data/assumptions.yaml#L170) | [helios.ts](../calc/src/model/helios.ts) |
| Beam wavelength | [1.1 µm](numbers.md#helios-wavelength) | Precedent |  | [data/assumptions.yaml:176](../data/assumptions.yaml#L176) | [helios.ts](../calc/src/model/helios.ts) |
| Phase-locked virtual aperture width | [10 km](numbers.md#helios-aperture) | Invented |  | [data/assumptions.yaml:184](../data/assumptions.yaml#L184) | [helios.ts](../calc/src/model/helios.ts) |
| Beam intensity at the receivers | [10 MW/m²](numbers.md#helios-receiver-intensity) | Invented |  | [data/assumptions.yaml:190](../data/assumptions.yaml#L190) | [ceres.ts](../calc/src/model/ceres.ts), [helios.ts](../calc/src/model/helios.ts) |
| Receiver radiator temperature | [1,500 K](numbers.md#helios-fin-temp) | Design choice |  | [data/assumptions.yaml:196](../data/assumptions.yaml#L196) | [ceres.ts](../calc/src/model/ceres.ts), [helios.ts](../calc/src/model/helios.ts), [ring.ts](../calc/src/model/ring.ts) |
| Temperature the Petal film runs at near Mercury | [460 K](numbers.md#helios-film-temp) | Design choice |  | [data/assumptions.yaml:206](../data/assumptions.yaml#L206) | [helios.ts](../calc/src/model/helios.ts) |
| Closest any beam path comes to Earth or a crewed craft | [0.01 AU](numbers.md#beam-keep-out) | Design choice |  | [data/assumptions.yaml:212](../data/assumptions.yaml#L212) |  |
| Innermost Petal orbit | [0.3 AU](numbers.md#helios-orbit-inner) | Design choice |  | [data/assumptions.yaml:219](../data/assumptions.yaml#L219) | [helios.ts](../calc/src/model/helios.ts) |
| Outermost Petal orbit | [0.45 AU](numbers.md#helios-orbit-outer) | Design choice |  | [data/assumptions.yaml:227](../data/assumptions.yaml#L227) | [helios.ts](../calc/src/model/helios.ts) |
| Brightest one Exhaust cone may be far from Venus | [10 W/m²](numbers.md#exhaust-far-limit) | Design choice |  | [data/assumptions.yaml:234](../data/assumptions.yaml#L234) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| Time for a beam to defocus once its receiver's handshake drops | [1 ms](numbers.md#beam-defocus-time) | Design choice |  | [data/assumptions.yaml:240](../data/assumptions.yaml#L240) |  |
| Veil film areal density | [1 g/m²](numbers.md#veil-areal-density) | Invented |  | [data/assumptions.yaml:249](../data/assumptions.yaml#L249) | [conventional.ts](../calc/src/model/conventional.ts), [veil.ts](../calc/src/model/veil.ts) |
| Lantern mirror areal density | [1 g/m²](numbers.md#lantern-areal-density) | Invented |  | [data/assumptions.yaml:255](../data/assumptions.yaml#L255) | [foundry.ts](../calc/src/model/foundry.ts), [veil.ts](../calc/src/model/veil.ts) |
| Share of sunlight's momentum the light-bending film takes up | [0.01](numbers.md#veil-momentum-fraction) | Invented | 0.002 to 0.1 | [data/assumptions.yaml:262](../data/assumptions.yaml#L262) | [veil.ts](../calc/src/model/veil.ts) |
| Share of sunlight the closed Veil keeps from Venus | [99.9%](numbers.md#veil-block-fraction) | Design choice |  | [data/assumptions.yaml:269](../data/assumptions.yaml#L269) | [trajectory.ts](../calc/src/model/trajectory.ts), [veil.ts](../calc/src/model/veil.ts) |
| Most light a slat lets through when open | [60%](numbers.md#veil-open-transmission) | Invented |  | [data/assumptions.yaml:276](../data/assumptions.yaml#L276) |  |
| Slat edge | [1.2 km](numbers.md#veil-slat-side) | Design choice |  | [data/assumptions.yaml:282](../data/assumptions.yaml#L282) | [veil.ts](../calc/src/model/veil.ts) |
| How often each slat corrects its tilt to keep station | [1 Hz](numbers.md#veil-trim-rate) | Design choice |  | [data/assumptions.yaml:288](../data/assumptions.yaml#L288) |  |
| How far a slat may drift from its station | [1 km](numbers.md#veil-station-tolerance) | Design choice |  | [data/assumptions.yaml:293](../data/assumptions.yaml#L293) |  |
| Largest share of the Veil's area left as gaps between slats | [0.05%](numbers.md#veil-gap-max) | Design choice |  | [data/assumptions.yaml:299](../data/assumptions.yaml#L299) |  |
| Share of sunlight a closed slat lets through toward Venus, in every colour | [0.03%](numbers.md#veil-slat-leak) | Invented |  | [data/assumptions.yaml:306](../data/assumptions.yaml#L306) |  |
| Number of chimneys (one per canopy) | [10,000](numbers.md#chimney-count) | Design choice |  | [data/assumptions.yaml:327](../data/assumptions.yaml#L327) | [exhaust.ts](../calc/src/model/exhaust.ts), [foundry.ts](../calc/src/model/foundry.ts), [outcome.ts](../calc/src/model/outcome.ts) |
| Chimney diameter | [3.5 km](numbers.md#chimney-diameter) | Design choice |  | [data/assumptions.yaml:332](../data/assumptions.yaml#L332) | [exhaust.ts](../calc/src/model/exhaust.ts), [foundry.ts](../calc/src/model/foundry.ts) |
| Air speed through a chimney's intake exchangers | [20 m/s](numbers.md#chimney-flow-speed) | Design choice |  | [data/assumptions.yaml:339](../data/assumptions.yaml#L339) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| How much the air cools passing a chimney's intake exchangers, at the starting 737 K | [100 K](numbers.md#chimney-gas-cooling) | Design choice |  | [data/assumptions.yaml:344](../data/assumptions.yaml#L344) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| Pressure lost across a chimney's exchangers, in units of the flow's dynamic pressure | [4](numbers.md#chimney-loss-coefficient) | Invented |  | [data/assumptions.yaml:350](../data/assumptions.yaml#L350) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| Chimney base height | [1 km](numbers.md#chimney-base) | Design choice |  | [data/assumptions.yaml:356](../data/assumptions.yaml#L356) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| Chimney top height | [65 km](numbers.md#chimney-top) | Design choice |  | [data/assumptions.yaml:362](../data/assumptions.yaml#L362) | [exhaust.ts](../calc/src/model/exhaust.ts), [ring.ts](../calc/src/model/ring.ts) |
| Peak heat flow from the deep atmosphere | [6.0 × 10¹⁸ W](numbers.md#deep-heat-peak) | Design choice |  | [data/assumptions.yaml:368](../data/assumptions.yaml#L368) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| Effective temperature the emitters shine at | [1,600 K](numbers.md#exhaust-effective-temp) | Design choice | 1,000 K to 3,000 K | [data/assumptions.yaml:375](../data/assumptions.yaml#L375) | [cryo.ts](../calc/src/model/cryo.ts), [exhaust.ts](../calc/src/model/exhaust.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Mass of the Exhaust's emitter tiles and canopy per square metre | [0.5 kg/m²](numbers.md#exhaust-tile-areal-density) | Invented |  | [data/assumptions.yaml:386](../data/assumptions.yaml#L386) | [foundry.ts](../calc/src/model/foundry.ts) |
| Mass of a chimney per square metre of its wall, liquid loops and exchangers included | [2 kg/m²](numbers.md#chimney-wall-areal-density) | Invented |  | [data/assumptions.yaml:394](../data/assumptions.yaml#L394) | [foundry.ts](../calc/src/model/foundry.ts) |
| Share of the Carnot limit the heat pumps reach | [50%](numbers.md#exhaust-carnot-share) | Invented | 30% to 90% | [data/assumptions.yaml:400](../data/assumptions.yaml#L400) | [cryo.ts](../calc/src/model/cryo.ts), [exhaust.ts](../calc/src/model/exhaust.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Emitter tile bandgap (InGaAsSb) | [0.54 eV](numbers.md#exhaust-bandgap) | Invented |  | [data/assumptions.yaml:413](../data/assumptions.yaml#L413) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| Peak power the Exhaust can throw into space | [1.2 × 10²⁰ W](numbers.md#exhaust-peak) | Design choice | 6.0 × 10¹⁹ W to 1.6 × 10²⁰ W | [data/assumptions.yaml:418](../data/assumptions.yaml#L418) | [exhaust.ts](../calc/src/model/exhaust.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Number of floating canopies | [10,000](numbers.md#exhaust-canopies) | Design choice |  | [data/assumptions.yaml:425](../data/assumptions.yaml#L425) | [exhaust.ts](../calc/src/model/exhaust.ts), [outcome.ts](../calc/src/model/outcome.ts) |
| Beam cone each tile fires into (full apex angle) | [25°](numbers.md#exhaust-cone) | Invented |  | [data/assumptions.yaml:430](../data/assumptions.yaml#L430) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| Width of the band each tile emits in | [0.4 µm](numbers.md#exhaust-band) | Invented |  | [data/assumptions.yaml:435](../data/assumptions.yaml#L435) | [exhaust.ts](../calc/src/model/exhaust.ts) |
| Frost Tower cold-trap temperature | [133 K](numbers.md#frost-tower-temp) | Invented |  | [data/assumptions.yaml:448](../data/assumptions.yaml#L448) | [exhaust.ts](../calc/src/model/exhaust.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| External quantum efficiency of the emitter tiles (photons out per electron in) | [99.9%](numbers.md#exhaust-eqe) | Invented |  | [data/assumptions.yaml:454](../data/assumptions.yaml#L454) |  |
| Cryo-continent thickness | [2 km](numbers.md#cryo-thickness) | Design choice |  | [data/assumptions.yaml:464](../data/assumptions.yaml#L464) | [cryo.ts](../calc/src/model/cryo.ts) |
| Carbon aerogel layer in each cap | [20 m](numbers.md#cryo-aerogel-thickness) | Invented |  | [data/assumptions.yaml:470](../data/assumptions.yaml#L470) | [cryo.ts](../calc/src/model/cryo.ts) |
| Carbon aerogel density | [82 kg/m³](numbers.md#cryo-aerogel-density) | Precedent |  | [data/assumptions.yaml:475](../data/assumptions.yaml#L475) | [cryo.ts](../calc/src/model/cryo.ts) |
| Carbon aerogel thermal conductivity | [0.029 W/(m·K)](numbers.md#cryo-aerogel-conductivity) | Precedent |  | [data/assumptions.yaml:481](../data/assumptions.yaml#L481) | [cryo.ts](../calc/src/model/cryo.ts) |
| Time for the crawlers that laid a cell to reseal a tear in it | [7 d](numbers.md#cryo-reseal-time) | Design choice |  | [data/assumptions.yaml:490](../data/assumptions.yaml#L490) |  |
| Graphite membrane thickness | [1 mm](numbers.md#cryo-membrane-thickness) | Invented |  | [data/assumptions.yaml:495](../data/assumptions.yaml#L495) | [cryo.ts](../calc/src/model/cryo.ts) |
| Crushed-basalt armour on each cap | [2 m](numbers.md#cryo-armour-thickness) | Design choice |  | [data/assumptions.yaml:501](../data/assumptions.yaml#L501) | [cryo.ts](../calc/src/model/cryo.ts) |
| Temperature the sealed dry ice is held at | [180 K](numbers.md#cryo-ice-temp) | Design choice |  | [data/assumptions.yaml:506](../data/assumptions.yaml#L506) | [cryo.ts](../calc/src/model/cryo.ts) |
| Effective temperature step between hot rock and basin floor | [450 K](numbers.md#cryo-floor-step) | Design choice |  | [data/assumptions.yaml:511](../data/assumptions.yaml#L511) | [cryo.ts](../calc/src/model/cryo.ts) |
| Area of one sealed compartment | [100 km²](numbers.md#cryo-cell-area) | Design choice |  | [data/assumptions.yaml:517](../data/assumptions.yaml#L517) | [cryo.ts](../calc/src/model/cryo.ts) |
| Depth basal heat pipes reach into the basin floors | [200 m](numbers.md#heat-pipe-depth) | Design choice |  | [data/assumptions.yaml:529](../data/assumptions.yaml#L529) |  |
| Oxygen pressure to make | [0.25 bar](numbers.md#o2-target-pressure) | Design choice |  | [data/assumptions.yaml:536](../data/assumptions.yaml#L536) | [forges.ts](../calc/src/model/forges.ts), [outcome.ts](../calc/src/model/outcome.ts), [ozone.ts](../calc/src/model/ozone.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Molten-carbonate splitting efficiency | [60%](numbers.md#forge-efficiency) | Precedent |  | [data/assumptions.yaml:542](../data/assumptions.yaml#L542) | [forges.ts](../calc/src/model/forges.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Number of Forges | [500](numbers.md#forge-count) | Design choice |  | [data/assumptions.yaml:549](../data/assumptions.yaml#L549) | [forges.ts](../calc/src/model/forges.ts), [outcome.ts](../calc/src/model/outcome.ts) |
| Width of one Forge raft | [30 km](numbers.md#forge-raft-width) | Design choice |  | [data/assumptions.yaml:564](../data/assumptions.yaml#L564) |  |
| Water shipped to Venus | [1.0 × 10²⁰ kg](numbers.md#ice-mass) | Design choice | 3.0 × 10¹⁹ kg to 2.0 × 10²⁰ kg | [data/assumptions.yaml:572](../data/assumptions.yaml#L572) | [ice.ts](../calc/src/model/ice.ts), [ring.ts](../calc/src/model/ring.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Ice Brick mass | [1 Mt](numbers.md#brick-mass) | Design choice |  | [data/assumptions.yaml:578](../data/assumptions.yaml#L578) | [ceres.ts](../calc/src/model/ceres.ts), [ice.ts](../calc/src/model/ice.ts), [ring.ts](../calc/src/model/ring.ts) |
| Number of Railheads on Ceres | [10,000](numbers.md#railhead-count) | Design choice |  | [data/assumptions.yaml:584](../data/assumptions.yaml#L584) | [ceres.ts](../calc/src/model/ceres.ts), [ice.ts](../calc/src/model/ice.ts), [outcome.ts](../calc/src/model/outcome.ts) |
| Railhead acceleration | [200 g](numbers.md#railhead-accel) | Invented |  | [data/assumptions.yaml:589](../data/assumptions.yaml#L589) | [ceres.ts](../calc/src/model/ceres.ts), [ice.ts](../calc/src/model/ice.ts) |
| Railhead efficiency, electricity to motion | [50%](numbers.md#railhead-efficiency) | Invented |  | [data/assumptions.yaml:594](../data/assumptions.yaml#L594) | [budget.ts](../calc/src/model/budget.ts), [ceres.ts](../calc/src/model/ceres.ts), [ice.ts](../calc/src/model/ice.ts) |
| Days kept between the last arrival and the deadline | [16 d](numbers.md#ice-lowering-margin) | Design choice |  | [data/assumptions.yaml:600](../data/assumptions.yaml#L600) | [ice.ts](../calc/src/model/ice.ts) |
| Peak rate the Ring is built to catch, as a multiple of the mean | [3](numbers.md#ice-arrival-peak) | Design choice |  | [data/assumptions.yaml:605](../data/assumptions.yaml#L605) | [ice.ts](../calc/src/model/ice.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Share of the power a Railhead draws that its barrel turns into heat on Ceres | [0.1%](numbers.md#railhead-barrel-loss) | Invented |  | [data/assumptions.yaml:617](../data/assumptions.yaml#L617) | [ceres.ts](../calc/src/model/ceres.ts) |
| Beam intensity at Ceres's receivers | [40 MW/m²](numbers.md#ceres-receiver-intensity) | Invented |  | [data/assumptions.yaml:627](../data/assumptions.yaml#L627) | [ceres.ts](../calc/src/model/ceres.ts) |
| Mass of Ceres's receivers per square metre, with their coolant channels | [2 kg/m²](numbers.md#ceres-receiver-areal-density) | Invented |  | [data/assumptions.yaml:634](../data/assumptions.yaml#L634) | [ceres.ts](../calc/src/model/ceres.ts), [ring.ts](../calc/src/model/ring.ts) |
| Mass of the Crown's radiator fins per square metre | [0.1 kg/m²](numbers.md#ceres-fin-areal-density) | Invented |  | [data/assumptions.yaml:639](../data/assumptions.yaml#L639) | [ceres.ts](../calc/src/model/ceres.ts), [ring.ts](../calc/src/model/ring.ts) |
| Current density in the superconducting cables | [1.0 × 10⁹ A/m²](numbers.md#cable-current-density) | Invented |  | [data/assumptions.yaml:645](../data/assumptions.yaml#L645) | [ceres.ts](../calc/src/model/ceres.ts) |
| Voltage the cables down the Crown's tethers carry | [100 MV](numbers.md#cable-voltage) | Invented |  | [data/assumptions.yaml:650](../data/assumptions.yaml#L650) | [ceres.ts](../calc/src/model/ceres.ts) |
| Density of the cables' conductor and its copper stabilizer | [8,900 kg/m³](numbers.md#cable-density) | Design choice |  | [data/assumptions.yaml:657](../data/assumptions.yaml#L657) | [ceres.ts](../calc/src/model/ceres.ts) |
| Ceres seed factory mass | [1,000 t](numbers.md#ceres-seed-mass) | Design choice | 100 t to 10,000 t | [data/assumptions.yaml:662](../data/assumptions.yaml#L662) | [ceres.ts](../calc/src/model/ceres.ts) |
| Ceres factory doubling time | [45 d](numbers.md#ceres-doubling-days) | Invented | 30 d to 120 d | [data/assumptions.yaml:675](../data/assumptions.yaml#L675) | [ceres.ts](../calc/src/model/ceres.ts) |
| Ring altitude | [400 km](numbers.md#ring-altitude) | Design choice |  | [data/assumptions.yaml:692](../data/assumptions.yaml#L692) | [exhaust.ts](../calc/src/model/exhaust.ts), [ring.ts](../calc/src/model/ring.ts) |
| Rotor speed | [10 km/s](numbers.md#ring-rotor-speed) | Invented |  | [data/assumptions.yaml:698](../data/assumptions.yaml#L698) | [ring.ts](../calc/src/model/ring.ts) |
| Rotor mass | [7.0 × 10¹² kg](numbers.md#ring-rotor-mass) | Invented |  | [data/assumptions.yaml:704](../data/assumptions.yaml#L704) | [foundry.ts](../calc/src/model/foundry.ts), [ring.ts](../calc/src/model/ring.ts) |
| Stator mass (catcher tracks, tether heads and cables) | [3.0 × 10¹² kg](numbers.md#ring-stator-mass) | Invented |  | [data/assumptions.yaml:709](../data/assumptions.yaml#L709) | [foundry.ts](../calc/src/model/foundry.ts), [ring.ts](../calc/src/model/ring.ts) |
| Catcher braking | [50 g](numbers.md#ring-catch-accel) | Invented |  | [data/assumptions.yaml:717](../data/assumptions.yaml#L717) | [ring.ts](../calc/src/model/ring.ts) |
| Regenerative braking efficiency | [80%](numbers.md#ring-recovery-efficiency) | Invented |  | [data/assumptions.yaml:722](../data/assumptions.yaml#L722) | [ring.ts](../calc/src/model/ring.ts) |
| Number of tether lifts | [3,000](numbers.md#ring-tether-lifts) | Design choice |  | [data/assumptions.yaml:728](../data/assumptions.yaml#L728) | [outcome.ts](../calc/src/model/outcome.ts), [ring.ts](../calc/src/model/ring.ts) |
| Height Bricks are released from | [100 km](numbers.md#lowering-release-altitude) | Design choice |  | [data/assumptions.yaml:733](../data/assumptions.yaml#L733) | [ring.ts](../calc/src/model/ring.ts) |
| Temperature of a Brick when it is lowered | [150 K](numbers.md#brick-temp) | Design choice |  | [data/assumptions.yaml:749](../data/assumptions.yaml#L749) | [ring.ts](../calc/src/model/ring.ts), [trajectory.ts](../calc/src/model/trajectory.ts) |
| Magnetic bubble radius | [10,000 km](numbers.md#aegis-bubble-radius) | Design choice |  | [data/assumptions.yaml:762](../data/assumptions.yaml#L762) | [shield.ts](../calc/src/model/shield.ts) |
| Coil radius | [1,000 km](numbers.md#aegis-coil-radius) | Design choice |  | [data/assumptions.yaml:768](../data/assumptions.yaml#L768) | [shield.ts](../calc/src/model/shield.ts) |
| Turns in the coil | [1,000,000](numbers.md#aegis-turns) | Design choice |  | [data/assumptions.yaml:775](../data/assumptions.yaml#L775) | [shield.ts](../calc/src/model/shield.ts) |
| Radius of the coil's winding pack | [5 m](numbers.md#aegis-winding-radius) | Design choice |  | [data/assumptions.yaml:780](../data/assumptions.yaml#L780) | [shield.ts](../calc/src/model/shield.ts) |
| Temperature the Aegis cable runs at | [40 K](numbers.md#aegis-coil-temp) | Invented |  | [data/assumptions.yaml:785](../data/assumptions.yaml#L785) |  |
| Ocean pH that must hold before any life is released | [7.5](numbers.md#genesis-ph-min) | Design choice |  | [data/assumptions.yaml:793](../data/assumptions.yaml#L793) |  |
| Days the ocean pH must hold before any life is released | [90 d](numbers.md#genesis-ph-days) | Design choice |  | [data/assumptions.yaml:799](../data/assumptions.yaml#L799) | [trajectory.ts](../calc/src/model/trajectory.ts) |
| Ozone column that must stand before land life is released | [185 DU](numbers.md#ozone-shield-column) | Design choice |  | [data/assumptions.yaml:804](../data/assumptions.yaml#L804) | [ozone.ts](../calc/src/model/ozone.ts) |
| Top of the ocean pH the shore basalt is laid to hold | [8](numbers.md#acid-ocean-ph-max) | Design choice |  | [data/assumptions.yaml:813](../data/assumptions.yaml#L813) |  |
| Density the drones seed cyanobacteria at in sunlit water | [100 per cm³](numbers.md#genesis-seed-density) | Design choice |  | [data/assumptions.yaml:820](../data/assumptions.yaml#L820) | [trajectory.ts](../calc/src/model/trajectory.ts) |
| Cyanobacteria density in rich, well-lit Earth seawater, the mark of a living ocean | [200,000 per cm³](numbers.md#genesis-bloom-density) | Precedent |  | [data/assumptions.yaml:827](../data/assumptions.yaml#L827) | [trajectory.ts](../calc/src/model/trajectory.ts) |
| Doubling time of the seeded ocean cyanobacteria in sunlit water | [1 d](numbers.md#genesis-doubling-days) | Invented |  | [data/assumptions.yaml:835](../data/assumptions.yaml#L835) | [trajectory.ts](../calc/src/model/trajectory.ts) |
| Thinnest black-loam soil laid on caps and shores | [10 cm](numbers.md#genesis-soil-min) | Design choice |  | [data/assumptions.yaml:841](../data/assumptions.yaml#L841) |  |
| Thickest black-loam soil laid on caps and shores | [30 cm](numbers.md#genesis-soil-max) | Design choice |  | [data/assumptions.yaml:847](../data/assumptions.yaml#L847) |  |
| Length of the day the Veil and Lanterns set | [24 h](numbers.md#day-length) | Design choice |  | [data/assumptions.yaml:853](../data/assumptions.yaml#L853) |  |
| Relative humidity over the new oceans | [75%](numbers.md#final-humidity) | Design choice |  | [data/assumptions.yaml:860](../data/assumptions.yaml#L860) | [outcome.ts](../calc/src/model/outcome.ts) |
| Albedo of the finished, Earth-like Venus | [30%](numbers.md#final-albedo) | Design choice |  | [data/assumptions.yaml:866](../data/assumptions.yaml#L866) | [trajectory.ts](../calc/src/model/trajectory.ts) |
| Coldest mean temperature that counts as Earth-like | [285 K](numbers.md#earth-like-temp) | Design choice |  | [data/assumptions.yaml:872](../data/assumptions.yaml#L872) | [trajectory.ts](../calc/src/model/trajectory.ts) |
| Most CO₂ that counts as Earth-like | [600 ppm](numbers.md#earth-like-co2) | Design choice |  | [data/assumptions.yaml:878](../data/assumptions.yaml#L878) | [trajectory.ts](../calc/src/model/trajectory.ts) |
| Days a replicator keeps building without a Mass Ledger heartbeat | [7 d](numbers.md#choir-deadman-days) | Design choice |  | [data/assumptions.yaml:886](../data/assumptions.yaml#L886) |  |
| Ouroboros-0 passes at this share of its own mass made from simulated regolith | [95%](numbers.md#ouroboros-0-closure) | Design choice |  | [data/assumptions.yaml:894](../data/assumptions.yaml#L894) |  |
| Ouroboros-0 passes if it doubles in less than this | [120 d](numbers.md#ouroboros-0-doubling) | Design choice |  | [data/assumptions.yaml:900](../data/assumptions.yaml#L900) |  |
| Ouroboros-0 is killed below this mass closure | [70%](numbers.md#ouroboros-0-kill-closure) | Design choice |  | [data/assumptions.yaml:905](../data/assumptions.yaml#L905) |  |
| Exhaust-1 passes at this much net cooling | [10 kW/m²](numbers.md#exhaust-1-cooling) | Design choice |  | [data/assumptions.yaml:911](../data/assumptions.yaml#L911) |  |
| Exhaust-1 is killed if it shows no net cooling above this | [100 W/m²](numbers.md#exhaust-1-kill-cooling) | Design choice |  | [data/assumptions.yaml:917](../data/assumptions.yaml#L917) |  |
| Power the Lightpipe test beams between satellites | [1 MW](numbers.md#lightpipe-power) | Design choice |  | [data/assumptions.yaml:927](../data/assumptions.yaml#L927) |  |
| Distance the Lightpipe test beams over | [1,000 km](numbers.md#lightpipe-range) | Design choice |  | [data/assumptions.yaml:933](../data/assumptions.yaml#L933) |  |
| Lightpipe passes at this end-to-end efficiency | [30%](numbers.md#lightpipe-efficiency) | Design choice |  | [data/assumptions.yaml:939](../data/assumptions.yaml#L939) |  |
| Lightpipe is killed if phase lock fails beyond this many emitters | [100](numbers.md#lightpipe-kill-emitters) | Design choice |  | [data/assumptions.yaml:945](../data/assumptions.yaml#L945) |  |
| Area of the Veil-1 test slat | [1 km²](numbers.md#veil-1-area) | Design choice |  | [data/assumptions.yaml:950](../data/assumptions.yaml#L950) |  |
| Veil-1 must dim to block this share of sunlight | [99%](numbers.md#veil-1-dim) | Design choice |  | [data/assumptions.yaml:956](../data/assumptions.yaml#L956) |  |
| Veil-1 is killed if its film degrades within this | [6 months](numbers.md#veil-1-kill-life) | Design choice |  | [data/assumptions.yaml:962](../data/assumptions.yaml#L962) |  |
| Ice block the Railhead test throws | [1 t](numbers.md#railhead-test-mass) | Design choice |  | [data/assumptions.yaml:968](../data/assumptions.yaml#L968) |  |
| Railhead test passes at this muzzle speed | [3 km/s](numbers.md#railhead-test-speed) | Design choice |  | [data/assumptions.yaml:974](../data/assumptions.yaml#L974) |  |
| Railhead test passes at this many shots an hour | [10](numbers.md#railhead-test-rate) | Design choice |  | [data/assumptions.yaml:980](../data/assumptions.yaml#L980) |  |
| Railhead test is killed below this muzzle speed | [1 km/s](numbers.md#railhead-kill-speed) | Design choice |  | [data/assumptions.yaml:985](../data/assumptions.yaml#L985) |  |
| Railhead test is killed below this many shots an hour | [1](numbers.md#railhead-kill-rate) | Design choice |  | [data/assumptions.yaml:991](../data/assumptions.yaml#L991) |  |
| How long Cryo-seal must hold its leak | [12 months](numbers.md#cryo-seal-months) | Design choice |  | [data/assumptions.yaml:996](../data/assumptions.yaml#L996) |  |
| Size of the Mini-Aegis test coil | [10 m](numbers.md#mini-aegis-coil) | Design choice |  | [data/assumptions.yaml:1002](../data/assumptions.yaml#L1002) |  |
| Robots in the Choir-sim test factory | [10,000](numbers.md#choir-sim-robots) | Design choice |  | [data/assumptions.yaml:1007](../data/assumptions.yaml#L1007) |  |
| How long Choir-sim must run unattended | [90 d](numbers.md#choir-sim-days) | Design choice |  | [data/assumptions.yaml:1012](../data/assumptions.yaml#L1012) |  |
| Choir-sim is killed above this many human interventions a day | [1](numbers.md#choir-sim-kill-interventions) | Design choice |  | [data/assumptions.yaml:1017](../data/assumptions.yaml#L1017) |  |
| Share of each copy's mass the seed Foundry makes from Mercury rock | [99.99%](numbers.md#foundry-closure-seed) | Invented |  | [data/assumptions.yaml:1023](../data/assumptions.yaml#L1023) |  |
<!-- /table -->

Every assumption with a range is a slider in the [Explorer](https://phosphoros.space/explore), which runs
the same model in your browser: move one and every consequence and check is recomputed, and the schedule,
the simulated air and this budget are redrawn. From a clone, `pnpm calc --set <id>=<value>` reruns any
number.
