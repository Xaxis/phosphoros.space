/** Helios Lattice: sunlight harvested near Mercury and beamed out as laser light. */
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";

export function helios(r: Registry) {
  const { v } = r.in("model/helios.ts");

  r.q(
    "mercury-sunlight",
    {
      label: "Sunlight at Mercury's distance from the Sun",
      unit: "W/m2",
      sig: 3,
      formula: "S_⊕ (AU / a_Mercury)²",
      basis: "physics",
    },
    () => v("solar-constant-earth") * (v("au") / v("mercury-orbit")) ** 2,
  );
  r.q(
    "helios-efficiency",
    {
      label: "Helios end-to-end efficiency, sunlight to delivered power",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "η_film × η_laser × η_receiver",
      basis: "invented",
    },
    () =>
      v("helios-film-efficiency") * v("helios-laser-efficiency") * v("helios-receiver-efficiency"),
  );
  r.q(
    "helios-area",
    {
      label: "Helios Lattice film area",
      unit: "m2",
      formula: "P / (S_Mercury η)",
      basis: "invented",
    },
    () => v("helios-power") / (v("mercury-sunlight") * v("helios-efficiency")),
  );
  r.q(
    "helios-mass",
    { label: "Helios Lattice mass", unit: "kg", formula: "A σ", basis: "invented" },
    () => v("helios-area") * v("helios-areal-density"),
  );
  r.q(
    "helios-petal-area",
    {
      label: "Area of one Petal",
      unit: "m2",
      show: "km2",
      sig: 2,
      formula: "side²",
      basis: "design",
    },
    () => v("helios-petal-side") ** 2,
  );
  r.q(
    "helios-petals",
    { label: "Number of Petals", unit: "count", formula: "A / A_petal", basis: "design" },
    () => v("helios-area") / v("helios-petal-area"),
  );
  r.q(
    "helios-petal-mass",
    {
      label: "Mass of one Petal",
      unit: "kg",
      show: "t",
      sig: 2,
      formula: "A_petal σ",
      basis: "design",
    },
    () => v("helios-petal-area") * v("helios-areal-density"),
  );
  r.q(
    "helios-sun-share",
    {
      label: "Share of the Sun's output the Lattice delivers",
      unit: "1",
      show: "%",
      sig: 2,
      formula: "P / L_☉",
      basis: "physics",
    },
    () => v("helios-power") / v("sun-luminosity"),
  );
  r.q(
    "helios-range",
    {
      label: "Longest Lattice-to-Venus beam range, from the outermost Petal orbit",
      unit: "m",
      show: "AU",
      sig: 2,
      formula: "a_outer + a_V",
      basis: "physics",
    },
    () => v("helios-orbit-outer") + v("venus-orbit"),
  );
  r.q(
    "helios-spot",
    {
      label: "Beam spot at the longest Lattice-to-Venus range",
      unit: "m",
      sig: 2,
      formula: "2.44 λ L / D",
      basis: "physics",
    },
    () => (2.44 * v("helios-wavelength") * v("helios-range")) / v("helios-aperture"),
  );
  r.q(
    "helios-film-temp-inner",
    {
      label: "Petal film temperature on the innermost orbit",
      unit: "K",
      sig: 2,
      formula: "T_film (a_Mercury / a_inner)^½",
      basis: "physics",
      note: "A film that sheds its heat by radiation runs at the fourth root of the sunlight it takes in, and sunlight falls as the square of distance.",
    },
    () => v("helios-film-temp") * Math.sqrt(v("mercury-orbit") / v("helios-orbit-inner")),
  );
  r.q(
    "lattice-to-ceres-range",
    {
      label: "Longest Lattice-to-Ceres beam range, from the outermost Petal orbit",
      unit: "m",
      show: "AU",
      sig: 2,
      formula: "a_outer + a_Ceres",
      basis: "physics",
      note: "The Lattice beams the Railheads' power to Ceres itself; the Ring sends none back.",
    },
    () => v("helios-orbit-outer") + v("ceres-orbit"),
  );
  r.q(
    "ceres-beam-spot",
    {
      label: "Beam spot at the longest Lattice-to-Ceres range",
      unit: "m",
      sig: 2,
      formula: "2.44 λ L / D",
      basis: "physics",
    },
    () => (2.44 * v("helios-wavelength") * v("lattice-to-ceres-range")) / v("helios-aperture"),
  );
}

/** When the Lattice is built and what it delivers: it waits for the Foundry to reach full scale. */
export function heliosSchedule(r: Registry) {
  const { v } = r.in("model/helios.ts");
  r.q(
    "lattice-build-days",
    {
      label: "Days the full Foundry takes to build the Helios Lattice",
      unit: "d",
      sig: 2,
      formula: "M_Lattice T / (M_Foundry ln 2)",
      basis: "invented",
      note: "Growing to full scale first and building after is the fastest order: every kilogram spent on products earlier costs the growth it would have compounded into.",
    },
    () => (v("helios-mass") * v("foundry-doubling-days")) / (v("foundry-final-mass") * Math.LN2),
  );
  r.q(
    "helios-full-power",
    {
      label: "Helios Lattice reaches full power",
      unit: "date",
      formula: "Foundry full scale + Lattice build time",
      basis: "invented",
      note: "The Lattice's petals stay at Mercury, so they shine as soon as they are built; power climbs from nothing at the Foundry's full scale to full here.",
    },
    () => v("foundry-full-scale") + v("lattice-build-days"),
  );
  r.q(
    "helios-supply-years",
    {
      label: "Years of full Lattice power before the deadline",
      unit: "d",
      show: "yr",
      sig: 2,
      formula: "deadline − full-power date",
      basis: "design",
    },
    () => {
      const years = v("deadline") - v("helios-full-power");
      // An unfinished Lattice delivers nothing in time, and every share of its output is undefined.
      if (years <= 0)
        throw new Error(
          "the Helios Lattice reaches full power after the deadline, so it delivers no energy in time",
        );
      return years;
    },
  );
  r.q(
    "helios-supply",
    {
      label: "Energy the Lattice delivers from full power to the deadline",
      unit: "J",
      formula: "P × (deadline − full-power date)",
      basis: "invented",
    },
    () => v("helios-power") * v("helios-supply-years") * DAY_S,
  );
  r.q(
    "helios-sunlight-energy",
    {
      label: "Sunlight the Lattice's film collects from full power to the deadline",
      unit: "J",
      formula: "E_Lattice / η",
      basis: "invented",
    },
    () => v("helios-supply") / v("helios-efficiency"),
  );
  r.q(
    "helios-loss-energy",
    {
      label: "Heat the film, lasers and receivers shed in that time",
      unit: "J",
      formula: "E_sunlight − E_Lattice",
      basis: "physics",
    },
    () => v("helios-sunlight-energy") - v("helios-supply"),
  );
  r.q(
    "helios-receiver-incident",
    {
      label: "Beam power arriving at the receivers",
      unit: "W",
      formula: "P / η_receiver",
      basis: "invented",
    },
    () => v("helios-power") / v("helios-receiver-efficiency"),
  );
  r.q(
    "helios-receiver-area",
    {
      label: "Receiver area at 10 MW/m²",
      unit: "m2",
      formula: "P_in / I",
      basis: "invented",
    },
    () => v("helios-receiver-incident") / v("helios-receiver-intensity"),
  );
  r.q(
    "helios-receiver-loss",
    {
      label: "Heat the receivers shed",
      unit: "W",
      formula: "P_in − P",
      basis: "physics",
    },
    () => v("helios-receiver-incident") - v("helios-power"),
  );
  r.q(
    "helios-fin-area",
    {
      label: "Radiator fin area to shed that heat at 1,500 K (both faces)",
      unit: "m2",
      formula: "P_loss / (2 σ T⁴)",
      basis: "physics",
    },
    () => v("helios-receiver-loss") / (2 * v("stefan-boltzmann") * v("helios-fin-temp") ** 4),
  );
}
