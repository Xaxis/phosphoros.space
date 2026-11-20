/** Acid Sweep and Aegis Shield: clearing the sulfur and guarding the new water. */

import { formatNumber } from "../format.ts";
import type { Registry } from "../registry.ts";
import { fmt } from "./text.ts";

export function acid(r: Registry) {
  const { v } = r.in("model/shield.ts");
  r.q(
    "so2-moles",
    { label: "Moles of SO₂", unit: "mol", formula: "M_SO₂ / μ_SO₂", basis: "physics" },
    () => v("venus-so2-mass") / v("so2-molar-mass"),
  );
  // --- Where the SO₂ goes: into the CO₂ seas, which freeze and are sealed --------------------------
  r.q(
    "so2-margules",
    {
      label: "How much SO₂ and liquid CO₂ dislike mixing: the regular-solution parameter at 263 K",
      unit: "1",
      sig: 3,
      formula: "ln(y P / (x p_SO₂)) / (1 − x)²",
      basis: "physics",
      note: "From the measured CO₂ + SO₂ equilibrium nearest pure CO₂. Above zero, SO₂ in liquid CO₂ is more volatile than Raoult's law says; the vapour's departure from an ideal gas is folded in.",
    },
    () => {
      const x = v("co2-so2-vle-liquid");
      const ratio =
        (v("co2-so2-vle-vapour") * v("co2-so2-vle-pressure")) / (x * v("co2-so2-vle-pure-so2"));
      return Math.log(ratio) / (1 - x) ** 2;
    },
  );
  r.q(
    "so2-dilute-activity",
    {
      label: "Activity coefficient of a trace of SO₂ in liquid CO₂ at the triple point",
      unit: "1",
      sig: 2,
      formula: "exp(A T_measured / T_t)",
      basis: "physics",
      note: "A regular solution's parameter scales as one over temperature, which carries the 263 K measurement down to the triple point.",
    },
    () => Math.exp((v("so2-margules") * v("co2-so2-vle-temp")) / v("co2-triple-temp")),
  );
  r.q(
    "so2-vapour-pressure-triple",
    {
      label: "Pure SO₂'s vapour pressure at CO₂'s triple point",
      unit: "Pa",
      show: "bar",
      sig: 2,
      formula: "10^(A − B / (T_t + C)) bar",
      basis: "physics",
    },
    () =>
      1e5 *
      10 ** (v("so2-antoine-a") - v("so2-antoine-b") / (v("co2-triple-temp") + v("so2-antoine-c"))),
  );
  r.q(
    "so2-partition",
    {
      label: "SO₂'s share of the air over its share of the CO₂ seas, as they start to freeze",
      unit: "1",
      sig: 2,
      formula: "y / x = γ p_SO₂ / (p_t + p_N₂)",
      basis: "physics",
    },
    () =>
      (v("so2-dilute-activity") * v("so2-vapour-pressure-triple")) /
      (v("co2-triple-pressure") + v("n2-pressure")),
  );
  r.q(
    "so2-sealed-share",
    {
      label: "Share of the SO₂ dissolved in the CO₂ seas when they start to freeze",
      unit: "1",
      show: "%",
      sig: 3,
      formula: "L / (L + K G), in moles of liquid and of gas",
      basis: "physics",
      note: "At the triple point most of the CO₂ is liquid and the air is thin, so the seas hold almost all of the SO₂ and freeze with it into the cryo-continents.",
    },
    () => {
      const co2 = v("venus-co2-mass") / v("co2-molar-mass");
      const n2 = v("venus-n2-mass") / v("n2-molar-mass");
      const vapour = v("co2-triple-vapour-share");
      const liquid = (1 - vapour) * co2;
      const gas = vapour * co2 + n2;
      return liquid / (liquid + v("so2-partition") * gas);
    },
  );
  r.q(
    "so2-sealed",
    {
      label: "SO₂ frozen into the cryo-continents with the CO₂ seas",
      unit: "kg",
      sig: 2,
      formula: "M_SO₂ × sealed share",
      basis: "physics",
    },
    () => v("venus-so2-mass") * v("so2-sealed-share"),
  );
  r.q(
    "so2-airborne-at-freeze",
    {
      label: "SO₂ still in the air when the seas start to freeze",
      unit: "kg",
      sig: 2,
      formula: "M_SO₂ − sealed",
      basis: "physics",
      note: "Most of it freezes out with the last CO₂ frost and in the Frost Towers, both sealed too; the Sweep counts all of it anyway.",
    },
    () => v("venus-so2-mass") - v("so2-sealed"),
  );
  r.q(
    "venus-cloud-acid",
    {
      label: "Sulfuric acid in Venus's clouds",
      unit: "kg",
      sig: 2,
      formula: "column × A",
      basis: "physics",
      note: "It rains out onto the ground once cooling stops the droplets evaporating below the clouds, before the CO₂ condenses.",
    },
    () => v("venus-cloud-column") * v("venus-area"),
  );
  r.q(
    "acid-sulfur-swept",
    {
      label: "Sulfur the Acid Sweep must take up: the cloud acid and the SO₂ left in the air",
      unit: "mol",
      sig: 2,
      formula: "M_acid / μ_H₂SO₄ + M_airborne / μ_SO₂",
      basis: "physics",
    },
    () =>
      v("venus-cloud-acid") / v("h2so4-molar-mass") +
      v("so2-airborne-at-freeze") / v("so2-molar-mass"),
  );
  r.q(
    "acid-swept-share",
    {
      label: "That sulfur as a share of the SO₂ in Venus's air",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "n_swept / n_SO₂",
      basis: "physics",
    },
    () => v("acid-sulfur-swept") / v("so2-moles"),
  );
  r.q(
    "acid-cao",
    {
      label: "Lime (CaO equivalent) to neutralize the sulfur that is not sealed",
      unit: "kg",
      formula: "n_swept μ_CaO",
      basis: "physics",
    },
    () => v("acid-sulfur-swept") * v("cao-molar-mass"),
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
      label: "Basalt layer if spread over the land outside the basins",
      unit: "m",
      show: "mm",
      sig: 2,
      formula: "M_basalt / (ρ_rock (A − A_basins))",
      basis: "physics",
    },
    () => v("acid-basalt") / (v("rock-density") * (v("venus-area") - v("cryo-footprint"))),
  );
  r.q(
    "acid-crust-share",
    {
      label: "That basalt as a share of the top kilometre of crust",
      unit: "1",
      show: "ppm",
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
  // A thin current loop: self-inductance μ₀a(ln(8a/b) − 2), and an outward pull on its winding that
  // puts a hoop tension μ₀I²(ln(8a/b) − 1)/4π in it (Shafranov's thin-ring result).
  const log = () => Math.log((8 * v("aegis-coil-radius")) / v("aegis-winding-radius"));
  r.q(
    "aegis-stored-energy",
    {
      label: "Magnetic energy stored in the Aegis coil",
      unit: "J",
      sig: 2,
      formula: "½ μ₀ a (ln(8a/b) − 2) (NI)²",
      basis: "physics",
    },
    () =>
      0.5 *
      v("vacuum-permeability") *
      v("aegis-coil-radius") *
      (log() - 2) *
      v("aegis-ampere-turns") ** 2,
  );
  r.q(
    "aegis-hoop-tension",
    {
      label: "Tension the coil's own field puts in its winding",
      unit: "N",
      sig: 2,
      formula: "μ₀ (NI)² (ln(8a/b) − 1) / 4π",
      basis: "physics",
    },
    () => (v("vacuum-permeability") * v("aegis-ampere-turns") ** 2 * (log() - 1)) / (4 * Math.PI),
  );
  r.q(
    "aegis-structure-mass",
    {
      label: "Least carbon fibre that holds the coil together",
      unit: "kg",
      sig: 2,
      formula: "2π a × (T / σ) × ρ",
      basis: "physics",
      note: "At the fibre's full rated strength with no safety margin, so a floor. By the virial theorem no structure of any shape can hold the coil with less material than its stored energy times density over strength.",
    },
    () =>
      2 *
      Math.PI *
      v("aegis-coil-radius") *
      (v("aegis-hoop-tension") / v("carbon-fibre-strength")) *
      v("carbon-fibre-density"),
  );
  r.q(
    "aegis-wind-force",
    {
      label: "Solar wind push on the magnetic bubble",
      unit: "N",
      sig: 1,
      formula: "p π R²",
      basis: "physics",
    },
    () => v("solar-wind-pressure") * Math.PI * v("aegis-bubble-radius") ** 2,
  );
  r.q(
    "aegis-wind-beta",
    {
      label: "The wind's push on the coil over the Sun's pull on it",
      unit: "1",
      sig: 1,
      formula: "(F / M) / (μ☉ / r²)",
      basis: "physics",
      note: "The Veil balances a light push larger than the Sun's pull at its station; the coil's is far smaller, so it sits close to L1.",
    },
    () =>
      v("aegis-wind-force") /
      v("aegis-structure-mass") /
      (v("sun-mu") / (v("venus-orbit") - v("veil-distance")) ** 2),
  );
  r.c(
    "aegis-structure",
    {
      label: "The Foundry can build the structure that holds the Aegis coil together",
      kind: "capacity",
    },
    () => {
      const days =
        (v("aegis-structure-mass") * v("foundry-doubling-days")) /
        (v("foundry-final-mass") * Math.LN2);
      return {
        pass: days <= v("foundry-doubling-days"),
        detail: `The coil's field pulls on its winding with ${fmt(r, "aegis-hoop-tension")}; holding it takes at least ${fmt(r, "aegis-structure-mass")} of carbon fibre at full strength, ${formatNumber(days, 2)} days of the full Foundry's output against the ${fmt(r, "foundry-doubling-days")} of one doubling.`,
      };
    },
  );
  r.q(
    "acid-crust-share-all",
    {
      label: "Basalt to neutralize every molecule of SO₂, as a share of the top kilometre of crust",
      unit: "1",
      show: "%",
      sig: 1,
      formula: "n_SO₂ μ_CaO / (f_CaO ρ A × 1 km)",
      basis: "physics",
      note: "What the Sweep would grind if none of the SO₂ were sealed: the ceiling on how wrong the split can make it.",
    },
    () =>
      (v("so2-moles") * v("cao-molar-mass")) /
      v("basalt-cao-fraction") /
      (v("rock-density") * v("venus-area") * 1000),
  );
}
