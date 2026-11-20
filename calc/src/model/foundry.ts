/** Ouroboros Foundry: the self-copying industry on Mercury, and the clock everything else runs on. */
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";

/** Foundry machinery mass on a given day: seed × 2^(t / T), capped at full scale. */
export function foundryMassAt(
  day: number,
  p: { seed: number; landing: number; doubling: number; final: number },
) {
  if (day < p.landing) return 0;
  return Math.min(p.final, p.seed * 2 ** ((day - p.landing) / p.doubling));
}

export function foundry(r: Registry) {
  const { v } = r.in("model/foundry.ts");

  r.q(
    "foundry-landing",
    {
      label: "Seed foundry lands on Mercury",
      unit: "date",
      formula: "launch date + transfer time",
      basis: "design",
    },
    () => v("foundry-seed-launch") + v("foundry-transfer-days"),
  );
  r.q(
    "foundry-doublings",
    {
      label: "Doublings from seed to full scale",
      unit: "count",
      sig: 2,
      formula: "⌈log₂(target / seed)⌉",
      basis: "design",
    },
    () => Math.ceil(Math.log2(v("foundry-target-mass") / v("foundry-seed-mass"))),
  );
  r.q(
    "foundry-final-mass",
    {
      label: "Foundry machinery at full scale",
      unit: "kg",
      formula: "seed × 2ⁿ",
      basis: "invented",
    },
    () => v("foundry-seed-mass") * 2 ** v("foundry-doublings"),
  );
  r.q(
    "foundry-full-scale",
    {
      label: "Foundry reaches full scale",
      unit: "date",
      formula: "landing + n × doubling time",
      basis: "invented",
    },
    () => v("foundry-landing") + v("foundry-doublings") * v("foundry-doubling-days"),
  );
  r.q(
    "foundry-years-to-scale",
    {
      label: "Time from landing to full scale",
      unit: "d",
      show: "yr",
      sig: 2,
      formula: "n × doubling time",
      basis: "invented",
    },
    () => v("foundry-doublings") * v("foundry-doubling-days"),
  );
  r.q(
    "foundry-power-per-kg",
    {
      label: "Power each kilogram of machinery draws while doubling",
      unit: "W/kg",
      sig: 2,
      formula: "e × ln 2 / T",
      basis: "invented",
    },
    () => (v("foundry-energy-per-kg") * Math.LN2) / (v("foundry-doubling-days") * DAY_S),
  );
  r.q(
    "foundry-peak-power",
    {
      label: "Foundry power at full scale",
      unit: "W",
      formula: "M_final × p",
      basis: "invented",
    },
    () => v("foundry-final-mass") * v("foundry-power-per-kg"),
  );
  r.q(
    "foundry-mercury-share",
    {
      label: "Share of Mercury's mass the Foundry uses",
      unit: "1",
      sig: 1,
      formula: "M_final / M_Mercury",
      basis: "physics",
    },
    () => v("foundry-final-mass") / v("mercury-mass"),
  );
  r.q(
    "hardware-energy",
    {
      label: "Energy to build all the plan's hardware (about 10¹⁴ kg)",
      unit: "J",
      sig: 1,
      formula: "M_target × e",
      basis: "invented",
    },
    () => v("foundry-target-mass") * v("foundry-energy-per-kg"),
  );
}

/** The Foundry's products: when each becomes affordable, and the growth curve. Runs after them. */
export function foundryProducts(r: Registry) {
  const { v } = r.in("model/foundry.ts");
  const at = (day: number) =>
    foundryMassAt(day, {
      seed: v("foundry-seed-mass"),
      landing: v("foundry-landing"),
      doubling: v("foundry-doubling-days"),
      final: v("foundry-final-mass"),
    });

  for (const [id, date, label] of [
    ["foundry-mass-2030", "date-2030", "January 2030"],
    ["foundry-mass-2032", "date-2032", "January 2032"],
  ] as const) {
    r.q(
      id,
      {
        label: `Foundry machinery in ${label}`,
        unit: "kg",
        formula: "seed × 2^((t − landing) / T)",
        basis: "invented",
      },
      () => at(v(date)),
    );
  }

  // When a product becomes affordable: one doubling period's output equals its mass, which happens
  // when the Foundry itself weighs as much as the product.
  const affordable = (mass: number) =>
    v("foundry-landing") + v("foundry-doubling-days") * Math.log2(mass / v("foundry-seed-mass"));
  for (const [id, product, label] of [
    ["veil-affordable", "veil-mass", "the Hesperus Veil"],
    ["helios-affordable", "helios-mass", "the Helios Lattice"],
    ["ring-affordable", "ring-mass", "the Braking Ring"],
  ] as const) {
    r.q(
      id,
      {
        label: `Foundry can build ${label} in one doubling period`,
        unit: "date",
        formula: "landing + T log₂(M_product / seed)",
        basis: "invented",
      },
      () => affordable(v(product)),
    );
  }

  r.q(
    "veil-diversion-days",
    {
      label: "Foundry growth the Veil costs, built at its close date",
      unit: "d",
      sig: 2,
      formula: "T log₂(1 + M_Veil / M_Foundry(close))",
      basis: "invented",
    },
    () => v("foundry-doubling-days") * Math.log2(1 + v("veil-mass") / at(v("veil-close"))),
  );

  r.s(
    "foundry-growth",
    {
      label: "Ouroboros Foundry machinery mass",
      x: "date",
      y: "kg",
    },
    () => {
      const pts = [];
      const start = v("foundry-landing");
      const end = v("deadline");
      for (let d = start; d <= end; d += 15) pts.push({ x: d, y: at(d) });
      pts.push({ x: end, y: at(end) });
      return pts;
    },
  );

  r.c(
    "foundry-affords-veil",
    { label: "The Foundry can afford the Veil by the date it must close", kind: "schedule" },
    () => {
      const m = at(v("veil-close"));
      return {
        pass: m >= v("veil-mass"),
        detail: `Foundry machinery at the Veil's close date: ${m.toExponential(2)} kg; Veil: ${v("veil-mass").toExponential(2)} kg.`,
      };
    },
  );
  r.c(
    "foundry-affords-lattice",
    {
      label: "The Foundry can afford the Helios Lattice by the date it reaches full power",
      kind: "schedule",
    },
    () => {
      const m = at(v("helios-full-power"));
      return {
        pass: m >= v("helios-mass"),
        detail: `Foundry at full power date: ${m.toExponential(2)} kg; Lattice: ${v("helios-mass").toExponential(2)} kg.`,
      };
    },
  );
}
