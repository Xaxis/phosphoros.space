/** Why ten years is impossible with conventional approaches: the physics budget. */
import type { Registry } from "../registry.ts";
import { YEAR_S } from "../time.ts";

export function conventional(r: Registry) {
  const { v } = r.in("model/conventional.ts");

  // Heat held in the atmosphere: cool all of it to the CO₂ frost point, and freeze the CO₂.
  r.q(
    "atmosphere-sensible-heat",
    {
      label: "Sensible heat to cool the whole atmosphere to 195 K",
      unit: "J",
      formula: "M_atm c_p (T_surface − T_frost)",
      basis: "physics",
    },
    () =>
      v("venus-atmosphere-mass") *
      v("co2-cp") *
      (v("venus-surface-temp") - v("freeze-target-temp")),
  );
  r.q(
    "atmosphere-latent-heat",
    {
      label: "Latent heat to freeze all of Venus's CO₂",
      unit: "J",
      formula: "M_CO₂ L_deposition",
      basis: "physics",
    },
    () => v("venus-co2-mass") * v("co2-deposition-heat"),
  );
  r.q(
    "atmosphere-heat",
    {
      label: "Heat to remove to cool the atmosphere to 195 K and freeze its CO₂",
      unit: "J",
      formula: "M_atm c_p ΔT + M_CO₂ L",
      basis: "physics",
    },
    () => v("atmosphere-sensible-heat") + v("atmosphere-latent-heat"),
  );

  // The crust. Rock's heat capacity follows from its conductivity, density and diffusivity.
  r.q(
    "rock-cp",
    {
      label: "Heat capacity of Venus's rock",
      unit: "J/kg/K",
      sig: 3,
      formula: "k / (ρ κ)",
      basis: "physics",
    },
    () => v("rock-conductivity") / (v("rock-density") * v("rock-diffusivity")),
  );
  r.q(
    "crust-heat-per-km",
    {
      label: "Heat in the top kilometre of crust, cooled by 400 K",
      unit: "J",
      formula: "A × 1 km × ρ c_p × 400 K",
      basis: "physics",
    },
    () => v("venus-area") * 1000 * v("rock-density") * v("rock-cp") * v("crust-cooling-step"),
  );
  r.q(
    "crust-skin-heat",
    {
      label: "Heat conduction can pull from the crust in a 4-year campaign",
      unit: "J",
      formula: "2 k ΔT √(t / (π κ)) × A",
      basis: "physics",
    },
    () =>
      2 *
      v("rock-conductivity") *
      v("crust-cooling-step") *
      Math.sqrt((v("skin-campaign-years") * YEAR_S) / (Math.PI * v("rock-diffusivity"))) *
      v("venus-area"),
  );
  r.q(
    "crust-skin-depth",
    {
      label: "Depth of rock that cooling reaches in 4 years",
      unit: "m",
      sig: 2,
      formula: "2 √(κ t / π)",
      basis: "physics",
      note: "The depth that, cooled through fully, holds the heat conduction removes.",
    },
    () => 2 * Math.sqrt((v("rock-diffusivity") * v("skin-campaign-years") * YEAR_S) / Math.PI),
  );

  // Passive cooling: a perfect sunshade and nothing else.
  for (const [id, temp, label] of [
    ["passive", "cloudtop-temp", "230 K"],
    ["passive-cold", "freeze-target-temp", "195 K"],
  ] as const) {
    r.q(
      `${id}-power`,
      {
        label: `Heat a shaded Venus radiates to space at ${label}`,
        unit: "W",
        formula: "σ T⁴ × A",
        basis: "physics",
      },
      () => v("stefan-boltzmann") * v(temp) ** 4 * v("venus-area"),
    );
    r.q(
      `${id}-years`,
      {
        label: `Years to cool a perfectly shaded Venus, radiating at ${label}`,
        unit: "s",
        show: "yr",
        sig: 2,
        formula: "E_atm / (σ T⁴ A)",
        basis: "physics",
      },
      () => v("atmosphere-heat") / v(`${id}-power`),
    );
  }

  r.q(
    "ten-year-cooling-power",
    {
      label: "Continuous heat rejection to cool the atmosphere in 10 years",
      unit: "W",
      formula: "E_atm / 10 yr",
      basis: "physics",
    },
    () => v("atmosphere-heat") / (v("conventional-campaign-years") * YEAR_S),
  );
  r.q(
    "ten-year-cooling-vs-sunlight",
    {
      label: "Ten-year cooling power as a multiple of all the sunlight Venus intercepts",
      unit: "1",
      formula: "P_10yr / (S_V π R_V²)",
      basis: "physics",
    },
    () => v("ten-year-cooling-power") / v("venus-intercepted"),
  );
  r.q(
    "ten-year-cooling-vs-humanity",
    {
      label: "Ten-year cooling power as a multiple of humanity's primary power",
      unit: "1",
      formula: "P_10yr / P_humanity",
      basis: "physics",
    },
    () => v("ten-year-cooling-power") / v("humanity-power"),
  );
  // Throwing the CO₂ away.
  r.q(
    "co2-escape-energy",
    {
      label: "Energy to launch all of Venus's CO₂ to escape speed",
      unit: "J",
      formula: "½ M_CO₂ v_esc²",
      basis: "physics",
    },
    () => 0.5 * v("venus-co2-mass") * v("venus-escape") ** 2,
  );
  r.q(
    "co2-escape-power",
    {
      label: "Power to launch the CO₂ to escape in 10 years",
      unit: "W",
      formula: "½ M_CO₂ v_esc² / 10 yr",
      basis: "physics",
    },
    () => v("co2-escape-energy") / (v("conventional-campaign-years") * YEAR_S),
  );
  r.q(
    "co2-escape-vs-sunlight",
    {
      label: "Escape-launch power as a multiple of the sunlight Venus intercepts",
      unit: "1",
      sig: 3,
      formula: "P_escape / (S_V π R_V²)",
      basis: "physics",
    },
    () => v("co2-escape-power") / v("venus-intercepted"),
  );

  // Making the day by spinning the planet.
  r.q(
    "spin-up-energy",
    {
      label: "Energy to spin Venus up to a 24-hour day",
      unit: "J",
      formula: "½ k M_V R_V² ω², ω = 2π / 24 h",
      basis: "physics",
    },
    () =>
      0.5 *
      v("venus-moment-factor") *
      v("venus-mass") *
      v("venus-radius") ** 2 *
      ((2 * Math.PI) / 86_400) ** 2,
  );
  r.q(
    "spin-up-vs-cooling",
    {
      label: "Spin-up energy as a multiple of the cooling task",
      unit: "1",
      formula: "E_spin / E_atm",
      basis: "physics",
    },
    () => v("spin-up-energy") / v("atmosphere-heat"),
  );

  // Bosch reaction: CO₂ + 2 H₂ → C + 2 H₂O.
  r.q(
    "co2-moles",
    {
      label: "Moles of CO₂ in Venus's air",
      unit: "mol",
      formula: "M_CO₂ / μ_CO₂",
      basis: "physics",
    },
    () => v("venus-co2-mass") / v("co2-molar-mass"),
  );
  r.q(
    "bosch-hydrogen",
    {
      label: "Hydrogen to turn all of Venus's CO₂ into water and graphite",
      unit: "kg",
      formula: "2 n_CO₂ μ_H₂",
      basis: "physics",
    },
    () => 2 * v("co2-moles") * v("h2-molar-mass"),
  );
  r.q(
    "bosch-water",
    {
      label: "Water the Bosch route would make",
      unit: "kg",
      formula: "2 n_CO₂ μ_H₂O",
      basis: "physics",
    },
    () => 2 * v("co2-moles") * v("h2o-molar-mass"),
  );
  r.q(
    "bosch-ocean-depth",
    {
      label: "Global ocean depth from the Bosch route's water",
      unit: "m",
      sig: 2,
      formula: "M_H₂O / (ρ_water A)",
      basis: "physics",
    },
    () => v("bosch-water") / (v("water-density") * v("venus-area")),
  );
  r.q(
    "bosch-graphite",
    {
      label: "Graphite the Bosch route would make",
      unit: "kg",
      formula: "n_CO₂ μ_C",
      basis: "physics",
    },
    () => v("co2-moles") * v("c-molar-mass"),
  );
  r.q(
    "bosch-heat",
    {
      label: "Heat the Bosch reaction would release",
      unit: "J",
      formula: "n_CO₂ × 90.1 kJ/mol",
      basis: "physics",
    },
    () => v("co2-moles") * v("bosch-reaction-heat"),
  );

  r.q(
    "ten-year-cooling-plus-bosch-power",
    {
      label: "Ten-year cooling power if the Bosch reaction's heat must go too",
      unit: "W",
      formula: "(E_atm + E_Bosch) / 10 yr",
      basis: "physics",
    },
    () => (v("atmosphere-heat") + v("bosch-heat")) / (v("conventional-campaign-years") * YEAR_S),
  );

  r.q(
    "spin-up-power",
    {
      label: "Power to spin Venus up to a 24-hour day in 10 years",
      unit: "W",
      formula: "E_spin / 10 yr",
      basis: "physics",
    },
    () => v("spin-up-energy") / (v("conventional-campaign-years") * YEAR_S),
  );

  // Locking CO₂ into rock: CaO + CO₂ → CaCO₃.
  r.q(
    "carbonate-cao",
    {
      label: "Lime (CaO) to lock all of Venus's CO₂ into carbonate",
      unit: "kg",
      formula: "n_CO₂ μ_CaO",
      basis: "physics",
    },
    () => v("co2-moles") * v("cao-molar-mass"),
  );
  r.q(
    "carbonate-crust-depth",
    {
      label: "Depth of crust to overturn for that lime",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "M_CaO / (f_CaO ρ_rock A)",
      basis: "physics",
    },
    () => v("carbonate-cao") / (v("basalt-cao-fraction") * v("rock-density") * v("venus-area")),
  );

  // A sunshade launched from Earth.
  r.q(
    "earth-launched-shade-mass",
    {
      label: "Mass of a 1 g/m² sunshade the size of Venus's disk",
      unit: "kg",
      formula: "σ π R_V²",
      basis: "physics",
    },
    () => v("veil-areal-density") * v("venus-disk"),
  );
  r.q(
    "earth-launched-shade-launches",
    {
      label: "Heavy-lift launches (100 t each) to lift that shade from Earth",
      unit: "count",
      formula: "M_shade / 100 t",
      basis: "physics",
    },
    () => v("earth-launched-shade-mass") / v("heavy-launch-payload"),
  );
}
