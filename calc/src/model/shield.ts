/** Acid Sweep and Aegis Shield: clearing the sulfur and guarding the new water. */
import type { Registry } from "../registry.ts";

export function acid(r: Registry) {
  const { v } = r.in("model/shield.ts");
  r.q(
    "so2-moles",
    { label: "Moles of SO₂", unit: "mol", formula: "M_SO₂ / μ_SO₂", basis: "physics" },
    () => v("venus-so2-mass") / v("so2-molar-mass"),
  );
  r.q(
    "acid-cao",
    {
      label: "Lime (CaO equivalent) to neutralize the sulfur",
      unit: "kg",
      formula: "n_SO₂ μ_CaO",
      basis: "physics",
    },
    () => v("so2-moles") * v("cao-molar-mass"),
  );
  r.q(
    "acid-basalt",
    {
      label: "Crushed basalt carrying that lime",
      unit: "kg",
      sig: 1,
      formula: "M_CaO / f_CaO",
      basis: "physics",
    },
    () => v("acid-cao") / v("basalt-cao-fraction"),
  );
  r.q(
    "acid-basalt-layer",
    {
      label: "Basalt layer if spread over the basins",
      unit: "m",
      sig: 2,
      formula: "M_basalt / (ρ_rock A_basins)",
      basis: "physics",
    },
    () => v("acid-basalt") / (v("rock-density") * v("cryo-footprint")),
  );
  r.q(
    "acid-crust-share",
    {
      label: "That basalt as a share of the top kilometre of crust",
      unit: "1",
      show: "%",
      sig: 1,
      formula: "M_basalt / (ρ A × 1 km)",
      basis: "physics",
    },
    () => v("acid-basalt") / (v("rock-density") * v("venus-area") * 1000),
  );
}

export function aegis(r: Registry) {
  const { v } = r.in("model/shield.ts");
  r.q(
    "solar-wind-pressure",
    {
      label: "Solar wind pressure at Venus",
      unit: "Pa",
      sig: 2,
      formula: "n m_p v²",
      basis: "physics",
    },
    () => v("solar-wind-density") * v("proton-mass") * v("solar-wind-speed") ** 2,
  );
  r.q(
    "aegis-field",
    {
      label: "Field that balances the solar wind at the bubble's edge",
      unit: "T",
      show: "nT",
      sig: 2,
      formula: "√(2 μ₀ p)",
      basis: "physics",
    },
    () => Math.sqrt(2 * v("vacuum-permeability") * v("solar-wind-pressure")),
  );
  r.q(
    "aegis-dipole",
    {
      label: "Aegis dipole moment",
      unit: "A m2",
      sig: 2,
      formula: "B r³ / (μ₀ / 4π)",
      basis: "physics",
    },
    () =>
      (v("aegis-field") * v("aegis-bubble-radius") ** 3) /
      (v("vacuum-permeability") / (4 * Math.PI)),
  );
  r.q(
    "aegis-vs-earth",
    {
      label: "Aegis dipole compared with Earth's",
      unit: "1",
      show: "%",
      sig: 1,
      formula: "m / m_⊕",
      basis: "physics",
    },
    () => v("aegis-dipole") / v("earth-dipole"),
  );
  r.q(
    "aegis-ampere-turns",
    {
      label: "Ampere-turns in the coil",
      unit: "A",
      sig: 1,
      formula: "m / (π r_coil²)",
      basis: "invented",
    },
    () => v("aegis-dipole") / (Math.PI * v("aegis-coil-radius") ** 2),
  );
  r.q(
    "aegis-current",
    { label: "Current per turn", unit: "A", sig: 1, formula: "NI / N", basis: "invented" },
    () => v("aegis-ampere-turns") / v("aegis-turns"),
  );
}
