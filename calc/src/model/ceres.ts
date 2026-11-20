/**
 * The Ceres end of the Ice Train: what the Railheads weigh, where their heat goes, the Crown that
 * takes the Lattice's beams, the factories that build both, and Ceres's new orbit against Jupiter.
 * Runs after the Ice Train, whose power, campaign and recoil it reads.
 */
import { hohmann } from "../physics.ts";
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";
import { fmt } from "./text.ts";

export function ceres(r: Registry) {
  const { v } = r.in("model/ceres.ts");
  const ceresMu = () => v("grav-constant") * v("ceres-mass");
  // What a radiator at the fin temperature sheds from one face.
  const finFlux = () => v("stefan-boltzmann") * v("helios-fin-temp") ** 4;

  // --- The Railheads' barrels ----------------------------------------------------------------------
  r.q(
    "railhead-force",
    {
      label: "Force a Railhead's coils push a Brick with",
      unit: "N",
      sig: 2,
      formula: "M_brick a",
      basis: "physics",
    },
    () => v("brick-mass") * v("railhead-accel") * v("standard-gravity"),
  );
  r.q(
    "railhead-coil-pressure",
    {
      label: "Magnetic pressure on the sabot's four sides, over a Brick's length",
      unit: "Pa",
      show: "MPa",
      sig: 2,
      formula: "F / (4 s²)",
      basis: "physics",
      note: "The sabot carries the push along the Brick's whole length, so the field presses on its four long faces. The coils feel the same pressure, outward.",
    },
    () => v("railhead-force") / (4 * v("brick-side") ** 2),
  );
  r.q(
    "railhead-field",
    {
      label: "Field the coils must reach to press that hard",
      unit: "T",
      sig: 2,
      formula: "√(2 μ₀ p)",
      basis: "physics",
    },
    () => Math.sqrt(2 * v("vacuum-permeability") * v("railhead-coil-pressure")),
  );
  r.q(
    "railhead-wrap-per-metre",
    {
      label: "Carbon fibre per metre of barrel that holds the coils together, at full strength",
      unit: "kg/m",
      sig: 2,
      formula: "2πR × (p R / σ) × ρ, R = s / √2",
      basis: "physics",
      note: "A hoop of fibre around a bore that clears the Brick's corners. A floor: nothing for the coils themselves, the anchors or any margin.",
    },
    () => {
      const R = v("brick-side") / Math.SQRT2;
      const thickness = (v("railhead-coil-pressure") * R) / v("carbon-fibre-strength");
      return 2 * Math.PI * R * thickness * v("carbon-fibre-density");
    },
  );
  r.q(
    "railhead-mass",
    {
      label: "Mass of one Railhead's barrel, at least",
      unit: "kg",
      sig: 2,
      formula: "m′ L",
      basis: "invented",
    },
    () => v("railhead-wrap-per-metre") * v("railhead-length"),
  );
  r.q(
    "railheads-mass",
    {
      label: "Mass of all the Railheads' barrels, at least",
      unit: "kg",
      sig: 2,
      formula: "N m_Railhead",
      basis: "invented",
    },
    () => v("railhead-count") * v("railhead-mass"),
  );
  r.q(
    "railheads-firing",
    {
      label: "Railheads firing at any moment",
      unit: "count",
      sig: 2,
      formula: "N × shot time / interval",
      basis: "invented",
      note: "Enough fire at once that the total draw is steady: power is switched from one to the next, with no great store of energy between shots.",
    },
    () => (v("railhead-count") * v("railhead-shot-time")) / v("railhead-interval"),
  );

  // --- Heat at Ceres -----------------------------------------------------------------------------
  r.q(
    "ceres-area",
    {
      label: "Ceres's surface area",
      unit: "m2",
      sig: 3,
      formula: "4π R_C²",
      basis: "physics",
    },
    () => 4 * Math.PI * v("ceres-radius") ** 2,
  );
  r.q(
    "ceres-surface-heat-limit",
    {
      label: "Most heat Ceres's whole surface could radiate at the fin temperature",
      unit: "W",
      sig: 2,
      formula: "σ T_fin⁴ × 4π R_C²",
      basis: "physics",
    },
    () => finFlux() * v("ceres-area"),
  );
  r.q(
    "railhead-barrel-heat",
    {
      label: "Heat the Railheads' barrels leave on Ceres",
      unit: "W",
      sig: 2,
      formula: "P_Railheads × barrel loss",
      basis: "invented",
    },
    () => v("railhead-power") * v("railhead-barrel-loss"),
  );
  r.q(
    "railhead-ground-share",
    {
      label: "Share of Ceres's surface the barrels' radiators cover",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "Q_barrels / (σ T_fin⁴) / 4π R_C²",
      basis: "invented",
    },
    () => v("railhead-barrel-heat") / v("ceres-surface-heat-limit"),
  );

  // --- The Crown: Ceres's receivers ----------------------------------------------------------------
  r.q(
    "ceres-receiver-incident",
    {
      label: "Beam power arriving at Ceres's receivers",
      unit: "W",
      sig: 2,
      formula: "P_Railheads / η_receiver",
      basis: "invented",
    },
    () => v("railhead-power") / v("helios-receiver-efficiency"),
  );
  r.q(
    "ceres-receiver-surface-ratio",
    {
      label: "Receiver area at the Lattice's Venus intensity, against Ceres's surface",
      unit: "1",
      sig: 2,
      formula: "(P_in / I_Venus) / 4π R_C²",
      basis: "invented",
    },
    () => v("ceres-receiver-incident") / v("helios-receiver-intensity") / v("ceres-area"),
  );
  r.q(
    "ceres-receiver-area",
    {
      label: "Receiver area the beams need at Ceres's intensity",
      unit: "m2",
      sig: 2,
      formula: "P_in / I_Ceres",
      basis: "invented",
    },
    () => v("ceres-receiver-incident") / v("ceres-receiver-intensity"),
  );
  r.q(
    "ceres-receiver-loss",
    {
      label: "Heat Ceres's receivers shed",
      unit: "W",
      sig: 2,
      formula: "P_in − P_Railheads",
      basis: "physics",
    },
    () => v("ceres-receiver-incident") - v("railhead-power"),
  );
  r.q(
    "ceres-receiver-loss-flux",
    {
      label: "Heat each square metre of receiver must hand to its coolant",
      unit: "W/m2",
      show: "MW/m2",
      sig: 2,
      formula: "I_Ceres (1 − η_receiver)",
      basis: "invented",
    },
    () => v("ceres-receiver-intensity") * (1 - v("helios-receiver-efficiency")),
  );
  r.q(
    "ceres-receiver-bare-temp",
    {
      label: "Temperature a receiver would reach shedding its own heat from both faces",
      unit: "K",
      sig: 2,
      formula: "(q / 2σ)^¼",
      basis: "physics",
    },
    () => (v("ceres-receiver-loss-flux") / (2 * v("stefan-boltzmann"))) ** 0.25,
  );
  r.q(
    "railhead-plant-heat",
    {
      label: "The rest of the Railheads' loss, shed in the Crown",
      unit: "W",
      sig: 2,
      formula: "P_Railheads (1 − η) − Q_barrels",
      basis: "invented",
      note: "Where the receivers' steady output is shaped into the pulses each barrel fires.",
    },
    () => v("railhead-power") * (1 - v("railhead-efficiency")) - v("railhead-barrel-heat"),
  );
  r.q(
    "crown-heat",
    {
      label: "Heat the Crown radiates",
      unit: "W",
      sig: 2,
      formula: "receiver loss + the Railheads' loss in the Crown",
      basis: "physics",
    },
    () => v("ceres-receiver-loss") + v("railhead-plant-heat"),
  );
  r.q(
    "ceres-heat-vs-surface",
    {
      label: "All the heat made at Ceres, against what its whole surface could radiate",
      unit: "1",
      sig: 2,
      formula: "(Q_Crown + Q_barrels) / (σ T_fin⁴ 4π R_C²)",
      basis: "physics",
    },
    () => (v("crown-heat") + v("railhead-barrel-heat")) / v("ceres-surface-heat-limit"),
  );
  r.q(
    "crown-fin-area",
    {
      label: "Crown radiator fin area at the fin temperature (both faces)",
      unit: "m2",
      sig: 2,
      formula: "Q_Crown / (2 σ T_fin⁴)",
      basis: "physics",
    },
    () => v("crown-heat") / (2 * finFlux()),
  );
  r.q(
    "crown-radius",
    {
      label: "Crown radius: Ceres's synchronous orbit, from its centre",
      unit: "m",
      show: "km",
      sig: 3,
      formula: "(G M_C P² / 4π²)^⅓",
      basis: "physics",
    },
    () => ((ceresMu() * v("ceres-rotation-period") ** 2) / (4 * Math.PI ** 2)) ** (1 / 3),
  );
  r.q(
    "crown-altitude",
    {
      label: "Crown height above Ceres's surface",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "R_Crown − R_C",
      basis: "physics",
    },
    () => v("crown-radius") - v("ceres-radius"),
  );
  r.q(
    "crown-fin-radius",
    {
      label: "How far the Crown's fins reach from Ceres's centre, spread flat around it",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "√(A_fins / π + R_Crown²)",
      basis: "design",
      note: "A flat ring in Ceres's equatorial plane, edge-on to the beams, turning with the Crown and held out by the spin.",
    },
    () => Math.sqrt(v("crown-fin-area") / Math.PI + v("crown-radius") ** 2),
  );
  r.q(
    "crown-band-height",
    {
      label: "Height of the Crown's receiver band, north to south",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "A_receiver / 2R_Crown",
      basis: "design",
      note: "Seen from the Lattice the Crown is a band twice its radius wide; the receivers facing the beams must fill that much of it.",
    },
    () => v("ceres-receiver-area") / (2 * v("crown-radius")),
  );
  r.q(
    "crown-receiver-installed",
    {
      label: "Receivers on the Crown, counting those turned away from the beams",
      unit: "m2",
      sig: 2,
      formula: "π A_receiver",
      basis: "design",
      note: "The Crown turns with Ceres. At any moment the far half faces away, and the near half overlaps itself in the beams' view, so it carries π times the area the beams need.",
    },
    () => Math.PI * v("ceres-receiver-area"),
  );
  r.q(
    "crown-receiver-mass",
    {
      label: "Mass of the Crown's receivers",
      unit: "kg",
      sig: 2,
      formula: "A_installed σ_receiver",
      basis: "invented",
    },
    () => v("crown-receiver-installed") * v("ceres-receiver-areal-density"),
  );
  r.q(
    "crown-fin-mass",
    {
      label: "Mass of the Crown's radiator fins",
      unit: "kg",
      sig: 2,
      formula: "A_fins σ_fin",
      basis: "invented",
    },
    () => v("crown-fin-area") * v("ceres-fin-areal-density"),
  );
  r.q(
    "crown-cable-mass",
    {
      label: "Mass of the superconducting cables down the Crown's tethers",
      unit: "kg",
      sig: 2,
      formula: "2 ρ h P / (J V)",
      basis: "invented",
      note: "Out and back, carrying the Railheads' whole steady draw. The Railheads stand in a belt along the equator, under the tethers, so the cables on the ground are short and not counted.",
    },
    () =>
      (2 * v("cable-density") * v("crown-altitude") * v("railhead-power")) /
      (v("cable-current-density") * v("cable-voltage")),
  );
  r.q(
    "crown-push",
    {
      label: "Push of the beams on the Crown",
      unit: "N",
      sig: 2,
      formula: "P_in / c",
      basis: "physics",
    },
    () => v("ceres-receiver-incident") / v("speed-of-light"),
  );
  r.q(
    "crown-tether-load",
    {
      label: "Ceres's net pull on a kilogram of tether, summed from the surface to the Crown",
      unit: "J/kg",
      show: "kJ/kg",
      sig: 2,
      formula: "G M_C (1/R_C − 1/R_Crown) − ω² (R_Crown² − R_C²) / 2",
      basis: "physics",
      note: "Gravity less the outward swing of Ceres's spin. A uniform tether hanging from the Crown carries this much per kilogram at its top.",
    },
    () => {
      const R0 = v("ceres-radius");
      const R1 = v("crown-radius");
      const omega = (2 * Math.PI) / v("ceres-rotation-period");
      return ceresMu() * (1 / R0 - 1 / R1) - (omega ** 2 * (R1 ** 2 - R0 ** 2)) / 2;
    },
  );
  r.q(
    "carbon-fibre-specific-strength",
    {
      label: "What carbon fibre at full strength can hold, per kilogram",
      unit: "J/kg",
      show: "MJ/kg",
      sig: 2,
      formula: "σ / ρ",
      basis: "precedent",
    },
    () => v("carbon-fibre-strength") / v("carbon-fibre-density"),
  );
  r.q(
    "crown-tether-mass",
    {
      label:
        "Mass of the carbon-fibre tethers that hang the cables and hold the Crown against the beams",
      unit: "kg",
      sig: 2,
      formula: "(M_cable Φ + F_push h) / (σ/ρ − Φ)",
      basis: "invented",
    },
    () =>
      (v("crown-cable-mass") * v("crown-tether-load") + v("crown-push") * v("crown-altitude")) /
      (v("carbon-fibre-specific-strength") - v("crown-tether-load")),
  );
  r.q(
    "crown-mass",
    {
      label: "Mass of the Crown: receivers, fins, cables and tethers",
      unit: "kg",
      sig: 2,
      formula: "receivers + fins + cables + tethers",
      basis: "invented",
    },
    () =>
      v("crown-receiver-mass") +
      v("crown-fin-mass") +
      v("crown-cable-mass") +
      v("crown-tether-mass"),
  );
  r.q(
    "ceres-hill-radius",
    {
      label: "Ceres's Hill radius, where the Sun's pull starts to win",
      unit: "m",
      show: "km",
      sig: 2,
      formula: "a_C (G M_C / 3 μ_☉)^⅓",
      basis: "physics",
    },
    () => v("ceres-orbit") * (ceresMu() / (3 * v("sun-mu"))) ** (1 / 3),
  );
  r.q(
    "ceres-recoil-accel",
    {
      label: "Ceres's acceleration from the Railheads' recoil",
      unit: "m/s2",
      sig: 2,
      formula: "Δv / campaign",
      basis: "physics",
    },
    () => v("ceres-recoil") / v("ice-campaign"),
  );
  r.q(
    "crown-edge-gravity",
    {
      label: "Ceres's pull at the outer edge of the Crown's fins",
      unit: "m/s2",
      sig: 2,
      formula: "G M_C / R_fins²",
      basis: "physics",
    },
    () => ceresMu() / v("crown-fin-radius") ** 2,
  );

  // --- The Ceres factories ---------------------------------------------------------------------------
  r.q(
    "ceres-transfer-days",
    {
      label: "Coasting from Earth's orbit to Ceres's on the cheapest path",
      unit: "d",
      sig: 3,
      formula: "π √(a³ / μ☉), a = (1 AU + a_C) / 2",
      basis: "physics",
    },
    () => hohmann(v("sun-mu"), v("au"), v("ceres-orbit")).time / DAY_S,
  );
  r.q(
    "ceres-landing",
    {
      label: "Ceres seed factory lands",
      unit: "date",
      formula: "launch date + transfer time",
      basis: "design",
    },
    () => v("ceres-seed-launch") + v("ceres-transfer-days"),
  );
  r.q(
    "ceres-build-mass",
    {
      label: "What the Ceres factories build: the Railheads and the Crown",
      unit: "kg",
      sig: 2,
      formula: "M_Railheads + M_Crown",
      basis: "invented",
    },
    () => v("railheads-mass") + v("crown-mass"),
  );
  // Grow n doublings, then build at the full factories' rate: M ln 2 / T kilograms a day, as on
  // Mercury. Finishing time is convex in n, so the soonest whole number of doublings is the floor
  // or the ceiling of log₂(build / seed).
  const plan = (T: number) => {
    const seed = v("ceres-seed-mass");
    const M = v("ceres-build-mass");
    const build = (n: number) => (M * T) / (seed * 2 ** n * Math.LN2);
    const n0 = Math.max(0, Math.floor(Math.log2(M / seed)));
    const n = n0 * T + build(n0) <= (n0 + 1) * T + build(n0 + 1) ? n0 : n0 + 1;
    return { n, final: seed * 2 ** n, build: build(n), days: n * T + build(n) };
  };
  r.q(
    "ceres-doublings",
    {
      label: "Doublings from the Ceres seed to full scale",
      unit: "count",
      sig: 2,
      formula: "the whole number that finishes soonest, near log₂(M_build / seed)",
      basis: "design",
    },
    () => plan(v("ceres-doubling-days")).n,
  );
  r.q(
    "ceres-final-mass",
    {
      label: "Ceres factory machinery at full scale",
      unit: "kg",
      sig: 2,
      formula: "seed × 2ⁿ",
      basis: "invented",
    },
    () => v("ceres-seed-mass") * 2 ** v("ceres-doublings"),
  );
  r.q(
    "ceres-full-scale",
    {
      label: "Ceres factories reach full scale",
      unit: "date",
      formula: "landing + n × doubling time",
      basis: "invented",
    },
    () => v("ceres-landing") + v("ceres-doublings") * v("ceres-doubling-days"),
  );
  r.q(
    "ceres-build-days",
    {
      label: "Days the full Ceres factories take to build the Railheads and the Crown",
      unit: "d",
      sig: 2,
      formula: "M_build T / (M_final ln 2)",
      basis: "invented",
    },
    () => (v("ceres-build-mass") * v("ceres-doubling-days")) / (v("ceres-final-mass") * Math.LN2),
  );
  r.q(
    "ceres-ready",
    {
      label: "Railheads and Crown finished",
      unit: "date",
      formula: "full scale + build time",
      basis: "invented",
    },
    () => v("ceres-full-scale") + v("ceres-build-days"),
  );
  r.q(
    "ceres-slack",
    {
      label: "Days to spare between the Railheads' finish and the first launch",
      unit: "d",
      sig: 2,
      formula: "first launch − finished",
      basis: "invented",
    },
    () => v("ice-launch-start") - v("ceres-ready"),
  );
  r.q(
    "ceres-seed-latest",
    {
      label: "Latest the Ceres seed can leave Earth and finish in time",
      unit: "date",
      formula: "first launch − (finished − seed launch)",
      basis: "invented",
    },
    () => v("ice-launch-start") - (v("ceres-ready") - v("ceres-seed-launch")),
  );
  r.q(
    "ceres-ready-foundry-pace",
    {
      label: "Railheads and Crown finished if Ceres's factories doubled at the Foundry's pace",
      unit: "date",
      formula: "landing + the same schedule with the Foundry's doubling time",
      basis: "invented",
    },
    () => v("ceres-landing") + plan(v("foundry-doubling-days")).days,
  );
  r.q(
    "ceres-factory-power",
    {
      label: "Power the Ceres factories draw at full scale while they build",
      unit: "W",
      sig: 2,
      formula: "M_final × e ln 2 / T",
      basis: "invented",
    },
    () =>
      (v("ceres-final-mass") * v("foundry-energy-per-kg") * Math.LN2) /
      (v("ceres-doubling-days") * DAY_S),
  );
  r.q(
    "ceres-sunlight",
    {
      label: "Sunlight Ceres intercepts",
      unit: "W",
      sig: 2,
      formula: "π R_C² S_⊕ (AU / a_C)²",
      basis: "physics",
    },
    () =>
      Math.PI *
      v("ceres-radius") ** 2 *
      v("solar-constant-earth") *
      (v("au") / v("ceres-orbit")) ** 2,
  );
  r.q(
    "ceres-mirror-area",
    {
      label: "Mirrors that gather the sunlight the Ceres factories need at full scale",
      unit: "m2",
      sig: 2,
      formula: "P / (S_Ceres η_film)",
      basis: "invented",
      note: "Mirrors in orbit around Ceres light solar film on its surface; the factories' power would otherwise need more sunlight than falls on Ceres.",
    },
    () =>
      v("ceres-factory-power") /
      (v("solar-constant-earth") * (v("au") / v("ceres-orbit")) ** 2 * v("helios-film-efficiency")),
  );
  r.q(
    "ceres-mirror-mass",
    {
      label: "Mass of those mirrors, as light as the Lattice's film",
      unit: "kg",
      sig: 2,
      formula: "A σ_film",
      basis: "invented",
    },
    () => v("ceres-mirror-area") * v("helios-areal-density"),
  );
  r.q(
    "ceres-hardware-energy",
    {
      label: "Energy to build the Ceres factories, the Railheads and the Crown",
      unit: "J",
      sig: 1,
      formula: "(M_final + M_build) × e",
      basis: "invented",
      note: "Gathered from sunlight at Ceres, so the Lattice's budget does not carry it.",
    },
    () => (v("ceres-final-mass") + v("ceres-build-mass")) * v("foundry-energy-per-kg"),
  );

  // --- Ceres's new orbit and Jupiter -----------------------------------------------------------------
  r.q(
    "ceres-new-semi-major-axis",
    {
      label: "Ceres's new semi-major axis",
      unit: "m",
      show: "AU",
      sig: 3,
      formula: "(perihelion + aphelion) / 2",
      basis: "physics",
    },
    () => (v("ceres-orbit") + v("ceres-new-aphelion")) / 2,
  );
  r.q(
    "ceres-new-eccentricity",
    {
      label: "Ceres's new eccentricity",
      unit: "1",
      sig: 2,
      formula: "(Q − q) / (Q + q)",
      basis: "physics",
    },
    () =>
      (v("ceres-new-aphelion") - v("ceres-orbit")) / (v("ceres-new-aphelion") + v("ceres-orbit")),
  );
  r.q(
    "jupiter-hill-radius",
    {
      label: "Jupiter's Hill radius",
      unit: "m",
      show: "AU",
      sig: 2,
      formula: "a_J (G M_J / 3 μ_☉)^⅓",
      basis: "physics",
    },
    () =>
      v("jupiter-orbit") *
      ((v("grav-constant") * v("jupiter-mass")) / (3 * v("sun-mu"))) ** (1 / 3),
  );
  r.q(
    "ceres-jupiter-gap",
    {
      label: "Closest Ceres's new orbit comes to Jupiter's",
      unit: "m",
      show: "AU",
      sig: 3,
      formula: "Jupiter's perihelion − Ceres's new aphelion",
      basis: "physics",
    },
    () => v("jupiter-perihelion") - v("ceres-new-aphelion"),
  );
  r.q(
    "ceres-jupiter-gap-hill",
    {
      label: "That gap in Jupiter's Hill radii",
      unit: "1",
      sig: 2,
      formula: "gap / R_Hill,J",
      basis: "physics",
    },
    () => v("ceres-jupiter-gap") / v("jupiter-hill-radius"),
  );
  // Tisserand's parameter with respect to Jupiter: T = a_J/a + 2 cos i √((a/a_J)(1 − e²)).
  const tisserand = (a: number, e: number) =>
    v("jupiter-orbit") / a +
    2 *
      Math.cos((v("ceres-inclination") * Math.PI) / 180) *
      Math.sqrt((a / v("jupiter-orbit")) * (1 - e ** 2));
  r.q(
    "ceres-tisserand-now",
    {
      label: "Ceres's Tisserand parameter with respect to Jupiter, today",
      unit: "1",
      sig: 3,
      formula: "a_J/a + 2 cos i √((a/a_J)(1 − e²)), e = Q/a − 1",
      basis: "physics",
    },
    () => tisserand(v("ceres-orbit"), v("ceres-aphelion") / v("ceres-orbit") - 1),
  );
  r.q(
    "ceres-tisserand",
    {
      label: "Ceres's Tisserand parameter with respect to Jupiter, on its new orbit",
      unit: "1",
      sig: 3,
      formula: "a_J/a + 2 cos i √((a/a_J)(1 − e²))",
      basis: "physics",
      note: "Above 3, an orbit cannot cross Jupiter's; comets that Jupiter controls sit between 2 and 3.",
    },
    () => tisserand(v("ceres-new-semi-major-axis"), v("ceres-new-eccentricity")),
  );
  r.q(
    "ceres-jupiter-period-ratio",
    {
      label: "Ceres's new years in one of Jupiter's",
      unit: "1",
      sig: 3,
      formula: "(a_J / a)^1.5",
      basis: "physics",
    },
    () => (v("jupiter-orbit") / v("ceres-new-semi-major-axis")) ** 1.5,
  );

  // --- Checks ----------------------------------------------------------------------------------------
  r.c(
    "ceres-ground-heat",
    {
      label: "Ceres's surface can radiate the heat left on the ground",
      kind: "capacity",
    },
    () => ({
      pass: v("railhead-barrel-heat") <= v("ceres-surface-heat-limit"),
      detail: `All the heat made at Ceres is ${fmt(r, "ceres-heat-vs-surface")} times what its whole surface could radiate at ${fmt(r, "helios-fin-temp")} (${fmt(r, "ceres-surface-heat-limit")}), so the Crown sheds it in space; the barrels leave ${fmt(r, "railhead-barrel-heat")} on the ground, radiators over ${fmt(r, "railhead-ground-share")} of the surface.`,
    }),
  );
  r.c(
    "ceres-receiver-cooling",
    {
      label: "Ceres's receivers shed heat no faster than a cooled surface already does",
      kind: "capacity",
    },
    () => ({
      pass: v("ceres-receiver-loss-flux") <= v("divertor-steady-flux"),
      detail: `At ${fmt(r, "ceres-receiver-intensity")} each square metre of receiver hands ${fmt(r, "ceres-receiver-loss-flux")} to its coolant, against the ${fmt(r, "divertor-steady-flux")} ITER's divertor is built to carry; left to radiate it alone, a receiver would reach ${fmt(r, "ceres-receiver-bare-temp")}.`,
    }),
  );
  r.c(
    "crown-orbit",
    {
      label: "The Crown stays deep inside Ceres's Hill sphere, and the recoil cannot shake it off",
      kind: "force",
    },
    () => ({
      pass:
        v("crown-fin-radius") <= v("ceres-hill-radius") / 2 &&
        v("ceres-recoil-accel") < v("crown-edge-gravity"),
      detail: `The Crown circles at ${fmt(r, "crown-radius")} and its fins reach ${fmt(r, "crown-fin-radius")}, well inside half of Ceres's ${fmt(r, "ceres-hill-radius")} Hill radius, where orbits around a small body stay bound; Ceres's recoil, ${fmt(r, "ceres-recoil-accel")}, is small beside its ${fmt(r, "crown-edge-gravity")} pull even at the fins' edge.`,
    }),
  );
  r.c(
    "crown-tethers",
    {
      label: "Carbon-fibre tethers can hang from the Crown to Ceres's surface",
      kind: "force",
    },
    () => ({
      pass: v("crown-tether-load") < v("carbon-fibre-specific-strength"),
      detail: `Summed from the surface to the Crown, Ceres's net pull on a tether is ${fmt(r, "crown-tether-load")}, against the ${fmt(r, "carbon-fibre-specific-strength")} carbon fibre holds at full strength; hanging the ${fmt(r, "crown-cable-mass")} of cables and holding the beams' ${fmt(r, "crown-push")} push takes ${fmt(r, "crown-tether-mass")} of fibre.`,
    }),
  );
  r.c(
    "ceres-ready-in-time",
    {
      label: "Ceres's factories finish the Railheads and the Crown before the first launch",
      kind: "schedule",
    },
    () => ({
      pass:
        v("ceres-ready") <= v("ice-launch-start") &&
        v("ceres-seed-launch") >= v("foundry-seed-launch"),
      detail: `The seed leaves Earth on ${fmt(r, "ceres-seed-launch", { date: "day" })}, with the Foundry's once Ouroboros-0 has passed, and lands on ${fmt(r, "ceres-landing", { date: "day" })}; doubling every ${fmt(r, "ceres-doubling-days")}, the factories finish the ${fmt(r, "ceres-build-mass")} of Railheads and Crown on ${fmt(r, "ceres-ready", { date: "day" })}, against a first launch on ${fmt(r, "ice-launch-start", { date: "day" })}.`,
    }),
  );
  r.c(
    "ceres-clear-of-jupiter",
    {
      label: "Ceres's new orbit stays clear of Jupiter",
      kind: "geometry",
    },
    () => ({
      pass:
        v("ceres-jupiter-gap") >= 2 * Math.sqrt(3) * v("jupiter-hill-radius") &&
        v("ceres-tisserand") > 3,
      detail: `At its new aphelion Ceres stays ${fmt(r, "ceres-jupiter-gap")} inside Jupiter's closest approach to the Sun, ${fmt(r, "ceres-jupiter-gap-hill")} of Jupiter's Hill radii against the 2√3 that keeps two orbits from meeting; its Tisserand parameter falls from ${fmt(r, "ceres-tisserand-now")} to ${fmt(r, "ceres-tisserand")}, still above the 3 below which Jupiter takes control.`,
    }),
  );
}
