# The Problem

Venus is the planet most like Earth in size and mass, and the least like it at the surface. Making it
Earth-like is not mainly a chemistry problem or a materials problem. It is an energy problem: the planet
holds far more heat than it can shed on its own, and the heat has nowhere quick to go.

## Venus today

<!-- table:baseline -->
| Property | Venus | Earth |
| --- | --- | --- |
| Mass | [4.87 × 10²⁴ kg](numbers.md#venus-mass) ([0.815](numbers.md#venus-mass-vs-earth) of Earth's) | [5.97 × 10²⁴ kg](numbers.md#earth-mass) |
| Radius | [6,051.8 km](numbers.md#venus-radius) | [6,378.1 km](numbers.md#earth-radius) |
| Surface gravity | [0.904 g](numbers.md?show=g#venus-gravity) ([8.87 m/s²](numbers.md#venus-gravity)) | [1 g](numbers.md?show=g#standard-gravity) |
| Atmosphere mass | [4.8 × 10²⁰ kg](numbers.md#venus-atmosphere-mass) | [5.2 × 10¹⁸ kg](numbers.md#earth-atmosphere-mass) |
| Surface pressure | [92 bar](numbers.md#venus-surface-pressure) | [1.01 bar](numbers.md#earth-sea-level-pressure) |
| Composition | [96.5%](numbers.md#venus-co2-fraction) CO₂, [3.5%](numbers.md#venus-n2-fraction) N₂, [150 ppm](numbers.md?show=ppm#venus-so2-fraction) SO₂, traces | [78%](numbers.md#earth-n2-fraction) N₂, [21%](numbers.md#earth-o2-fraction) O₂ |
| Mean surface temperature | [737 K](numbers.md#venus-surface-temp) ([464 °C](numbers.md?show=°C#venus-surface-temp)) | [288 K](numbers.md#earth-surface-temp) |
| Rotation | [243 d](numbers.md#venus-sidereal-day), retrograde; a solar day lasts [117 d](numbers.md#venus-solar-day) | [23.9 h](numbers.md#earth-day); a solar day lasts [24 h](numbers.md#earth-solar-day) |
| Sunlight at the top of the atmosphere | [2,601 W/m²](numbers.md#venus-sunlight) | [1,361 W/m²](numbers.md#solar-constant-earth) |
| Water | Nearly none, with an extreme deuterium to hydrogen ratio | [1.4 × 10²¹ kg](numbers.md#earth-water-mass) |
| Magnetic field | None of its own | Dipole of [8 × 10²² A·m²](numbers.md#earth-dipole) |
| Clouds | Sulfuric acid, [48 km](numbers.md?sig=2#venus-cloud-base) to [70 km](numbers.md?sig=2#venus-cloud-top) up | Water |
<!-- /table -->

Two facts make the problem smaller than it looks.

- Between [50 km](numbers.md?sig=2#venus-temperate-low) and [65 km](numbers.md?sig=2#venus-temperate-high)
  up, Venus's air already has Earth-like pressure and temperature. That is where the plan's floating
  machinery works.
- Venus's nitrogen alone, [1.08 × 10¹⁹ kg](numbers.md#venus-n2-mass), would press down with
  [2.1 bar](numbers.md#n2-pressure) once the CO₂ is gone: [2.8](numbers.md#n2-vs-earth) times as much
  nitrogen as Earth has. The air Phosphoros wants is mostly there already. The job is to take the carbon
  dioxide out of it and the heat out of the planet.

## Why ten years is impossible by conventional means

Every conventional route to an Earth-like Venus fails the same test: it needs more power than Venus
receives from the Sun, or more mass than Earth can launch, or more time than a decade.

<!-- figure:power-scale -->
![Power needs against supply, 10-year tasks, log scale](../figures/svg/power-scale.svg)
<!-- /figure -->

### The atmosphere's heat

To freeze the CO₂ out of the air, the whole atmosphere must be cooled to about
[195 K](numbers.md?sig=3#freeze-target-temp). That means removing
[2.6 × 10²⁶ J](numbers.md#atmosphere-sensible-heat) of sensible heat, plus
[2.7 × 10²⁶ J](numbers.md#atmosphere-latent-heat) of latent heat released as the CO₂ condenses and
freezes: [5.3 × 10²⁶ J](numbers.md#atmosphere-heat) in all. Every route below has to get rid of this heat
somehow.

### The crust's heat

The rock holds even more. Cooling the top kilometer of crust by [400 K](numbers.md#crust-cooling-step)
would mean removing [4.6 × 10²⁶ J](numbers.md#crust-heat-per-km), nearly as much as the air. But rock
conducts heat slowly. In a [4](numbers.md#skin-campaign-years)-year campaign the cold reaches only
[13 m](numbers.md#crust-skin-depth) down, and conduction delivers just
[5.8 × 10²⁴ J](numbers.md#crust-skin-heat) to the surface. So the crust does not set the pace of a fast
campaign. It does keep leaking heat into whatever sits on it for centuries, which is why the basins that
hold the frozen CO₂ need [refrigerated floors](technologies/cryo.md).

### Passive cooling

Suppose a perfect sunshade cut off all sunlight. Venus would still cool only by radiating from its cloud
tops at about [230 K](numbers.md#cloudtop-temp): [7.3 × 10¹⁶ W](numbers.md#passive-power). At that rate the
atmosphere's heat takes [230 yr](numbers.md#passive-years) to leave. As the air cools toward the frost
point it radiates less ([3.8 × 10¹⁶ W](numbers.md#passive-cold-power)), and the estimate stretches to
[440 yr](numbers.md#passive-cold-years). A shade alone gives a terraformed Venus in centuries, not a
decade.

### The ten-year power

Removing that heat in [10](numbers.md#conventional-campaign-years) years takes
[1.7 × 10¹⁸ W](numbers.md#ten-year-cooling-power) of continuous heat rejection. That is
[5.6](numbers.md#ten-year-cooling-vs-sunlight) times all the sunlight Venus intercepts
([3.0 × 10¹⁷ W](numbers.md#venus-intercepted)), and [88,000](numbers.md#ten-year-cooling-vs-humanity) times
humanity's entire primary power use ([19 TW](numbers.md#humanity-power)). Venus cannot supply this from
its own sunlight even in principle. The power has to be brought in.

### Launching the CO₂ to escape

Throwing the CO₂ off the planet at Venus's escape speed of [10.36 km/s](numbers.md#venus-escape) takes
[2.5 × 10²⁸ J](numbers.md#co2-escape-energy), far more than the cooling task. Over ten years that is
[8.0 × 10¹⁹ W](numbers.md#co2-escape-power), [267](numbers.md#co2-escape-vs-sunlight) times the sunlight
Venus intercepts. Freezing the CO₂ in place is far cheaper than removing it.

### Spinning Venus up

Venus turns once in [243 d](numbers.md#venus-sidereal-day). Spinning it up to an Earth-length day would
take [1.6 × 10²⁹ J](numbers.md#spin-up-energy), [290](numbers.md#spin-up-vs-cooling) times the cooling task,
or [4.9 × 10²⁰ W](numbers.md#spin-up-power) for a decade. So Phosphoros makes the day with light, not
rotation: the Veil opens and closes over the sunward side, and mirrors light the night side.

### The Bosch route

Reacting all of Venus's [1.1 × 10²² mol](numbers.md#co2-moles) of CO₂ with hydrogen (CO₂ + 2H₂ → C + 2H₂O)
would make [3.8 × 10²⁰ kg](numbers.md#bosch-water) of water, an [830 m](numbers.md#bosch-ocean-depth) global
ocean, and [1.3 × 10²⁰ kg](numbers.md#bosch-graphite) of graphite. It needs
[4.3 × 10¹⁹ kg](numbers.md#bosch-hydrogen) of hydrogen that Venus does not have, and the reaction releases
[9.6 × 10²⁶ J](numbers.md#bosch-heat) of heat, more than the atmosphere holds today. Cooling in ten years
would then take [4.7 × 10¹⁸ W](numbers.md#ten-year-cooling-plus-bosch-power).

### Carbonates

Locking the CO₂ into rock as carbonate needs [6.0 × 10²⁰ kg](numbers.md#carbonate-cao) of lime. Basalt is
about [10%](numbers.md#basalt-cao-fraction) lime, so that means overturning
[4.3 km](numbers.md#carbonate-crust-depth) of crust across the whole planet. Left to nature, the reaction
takes tens of millions of years ([Bullock and Grinspoon 1996](sources.md#bullock-grinspoon-1996)).

### A sunshade launched from Earth

Even the simplest piece, a shade the size of Venus's disk made of
[1 g/m²](numbers.md#veil-areal-density) film, has a mass of
[1.2 × 10¹¹ kg](numbers.md#earth-launched-shade-mass). At [100 t](numbers.md#heavy-launch-payload) per
heavy-lift launch ([NewSpace Economy 2026](sources.md#newspace-starship-2026)) that is
[1.2 × 10⁶](numbers.md#earth-launched-shade-launches) launches. Anything this large must be made in space,
from material already there.

## What follows

A decade is impossible without two things: energy imported from outside Venus, and an industry that
builds in space from local material. The Sun supplies the first, if it is harvested close in, near Mercury,
where sunlight is [9,080 W/m²](numbers.md#mercury-sunlight). The second needs a factory that grows itself.
Phosphoros invents both, and then spends the energy where the conventional routes spend it badly: it pumps
the heat out as light, freezes the CO₂ in place, and catches the imported water without letting it fall in
as heat. [The Plan](plan.md) shows how.

## The literature

People have proposed terraforming Venus since 1961. Phosphoros borrows from the best of them.

<!-- table:literature -->
| Proposal | Mechanism | Verdict |
| --- | --- | --- |
| Sagan (1961) [source](sources.md#sagan-1961) | Seed the clouds with algae to turn CO₂ into oxygen and organic matter | Leaves tens of bars of oxygen and the carbon still in the air; not viable alone |
| Adelman (1982) [source](sources.md#adelman-1982) | Strip the atmosphere with asteroid impacts | Needs more impactor mass than the atmosphere it removes; rejected |
| Birch (1991) [source](sources.md#birch-1991) | A sunshade near L1, freeze out the CO₂, bury or export it, import water from an icy moon, mirrors (solettas) for daylight, heat pipes, and a 24 h day made by the shade's orbit | About 200 years. The backbone of every later plan, including this one |
| Bullock and Grinspoon (1996) [source](sources.md#bullock-grinspoon-1996) | React CO₂ with calcium and magnesium minerals in the crust | Takes 10 to 100 million years naturally |
| Landis; NASA HAVOC (2011) [source](sources.md#landis-2003) | Aerostat cities floating at about 50 km, where pressure and temperature are Earth-like | Feasible habitats, not a planet |
| Howe, Cloud Continents (2022) [source](sources.md#howe-2022) | A floating artificial surface at 50 km of about 7 × 10¹⁰ tiles 100 m across, with imported water | About 200 years, limited by energy |
| Green and colleagues (NASA) (2017) [source](sources.md#nasa-mars-magnetic-2017) | A magnetic dipole at Mars's L1 point deflects the solar wind so an atmosphere can build up | Adapted here as the Aegis Shield |
| Angel (2006) [source](sources.md#angel-2006) | A cloud of thin flyers near Earth's L1 that bend sunlight a few degrees to shade the planet | A serious design for cooling Earth; light pressure barely moves a refracting shade |
<!-- /table -->

**What Phosphoros takes from Birch 1991.** Paul Birch's "Terraforming Venus Quickly"
([Birch 1991](sources.md#birch-1991)) is the backbone of every serious plan since, including this one. He
put a sunshade between the Sun and Venus, let the planet cool, froze out the CO₂ and buried it, brought
water from an icy moon, and used the shade's own motion to give the surface a day. Phosphoros keeps that
architecture almost whole: freeze and bury the CO₂, import the water, use the shade as thermostat and day
clock. What it changes is the pace. Birch's planet cools by radiating on its own, which takes centuries.
Phosphoros pumps the heat out with imported power, and pays for that with an industry Birch did not
assume.

**What Phosphoros takes from Angel 2006.** Roger Angel's design for shading Earth
([Angel 2006](sources.md#angel-2006)) is a cloud of thin flyers near the Sun-Earth L1 point that bend
sunlight a few degrees, so it misses the planet, instead of reflecting it. A refracting film absorbs
little of the light's momentum, so light pressure barely pushes it off station. Version 2 of Phosphoros
moved its Veil to a hovering "statite" far closer to Venus to save area; version 3 found that a shade there
cannot hover, because sunlight and Venus's gravity push it the same way, and returned to Angel's
approach near L1 ([correction](about.md#corrections)). The [Hesperus Veil](technologies/veil.md) is
Angel's shade, scaled to Venus.

The rest of the table feeds in too. Bullock and Grinspoon's mineral chemistry becomes the
[Acid Sweep](technologies/acid.md); the aerostat habitats of Landis and NASA's HAVOC study become the
[Photonic Exhaust](technologies/exhaust.md)'s floating canopies; and NASA's magnetic shield for Mars
becomes the [Aegis Shield](technologies/aegis.md).
