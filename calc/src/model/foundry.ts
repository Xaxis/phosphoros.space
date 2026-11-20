/** Ouroboros Foundry: the self-copying industry on Mercury, and the clock everything else runs on. */
import type { Registry } from "../registry.ts";
import { DAY_S } from "../time.ts";
import { fmt } from "./text.ts";

export interface FoundryParams {
  seed: number;
  landing: number;
  doubling: number;
  final: number;
  /** Days from `holdStart` when the Foundry builds the Veil instead of itself. */
  holdStart: number;
  holdDays: number;
}

/**
 * Foundry machinery mass on a given day: seed × 2^(t / T), capped at full scale. While it builds the
 * Veil its whole output goes into the Veil, so it stops growing, and every later day comes that many
 * days late.
 */
export function foundryMassAt(day: number, p: FoundryParams) {
  if (day < p.landing) return 0;
  const grown = (d: number) => Math.min(p.final, p.seed * 2 ** ((d - p.landing) / p.doubling));
  if (day < p.holdStart) return grown(day);
  if (day < p.holdStart + p.holdDays) return grown(p.holdStart);
  return grown(day - p.holdDays);
}

export function foundryParams(v: (id: string) => number): FoundryParams {
  return {
    seed: v("foundry-seed-mass"),
    landing: v("foundry-landing"),
    doubling: v("foundry-doubling-days"),
    final: v("foundry-final-mass"),
    holdStart: v("veil-build-end") - v("veil-diversion-days"),
    holdDays: v("veil-diversion-days"),
  };
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
    "mercury-venus-transfer-days",
    {
      label: "Coasting from Mercury's orbit to Venus's on the cheapest path",
      unit: "d",
      sig: 2,
      formula: "π √(a³ / μ☉), a = (r☿ + r♀) / 2",
      basis: "physics",
    },
    () => {
      const a = (v("mercury-orbit") + v("venus-orbit")) / 2;
      return (Math.PI * Math.sqrt(a ** 3 / v("sun-mu"))) / DAY_S;
    },
  );
  r.q(
    "veil-build-end",
    {
      label: "The Veil's last parts leave Mercury",
      unit: "date",
      formula: "Veil close date − Mercury-to-Venus transfer",
      basis: "design",
    },
    () => v("veil-close") - v("mercury-venus-transfer-days"),
  );
  r.q(
    "veil-diversion-days",
    {
      label: "Days the Foundry stops growing to build the Veil",
      unit: "d",
      sig: 2,
      formula: "D = M_Veil T / (M_Foundry ln 2), ending when the last parts leave",
      basis: "invented",
      note: "A Foundry of mass M turns out M ln 2 / T kilograms a day. Building the Veil instead of itself, it stands still for as long as that output takes to add up to the Veil.",
    },
    () => {
      const T = v("foundry-doubling-days");
      const end = v("veil-build-end");
      const mass = (d: number) =>
        Math.min(
          v("foundry-final-mass"),
          v("foundry-seed-mass") * 2 ** ((d - v("foundry-landing")) / T),
        );
      // A hold of D days ending when the parts leave builds M(end − D) D ln 2 / T. That grows with
      // D up to T / ln 2, then falls as the hold starts on a smaller Foundry: take the shortest hold
      // that builds the whole Veil. If even the best hold falls short, return it; the check fails.
      const built = (d: number) => (mass(end - d) * d * Math.LN2) / T;
      let lo = 0;
      let hi = T / Math.LN2;
      if (built(hi) < v("veil-mass")) return hi;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (built(mid) < v("veil-mass")) lo = mid;
        else hi = mid;
      }
      return hi;
    },
  );
  r.q(
    "foundry-full-scale",
    {
      label: "Foundry reaches full scale",
      unit: "date",
      formula: "landing + n × doubling time + the Veil's hold",
      basis: "invented",
    },
    () =>
      v("foundry-landing") +
      v("foundry-doublings") * v("foundry-doubling-days") +
      v("veil-diversion-days"),
  );
  r.q(
    "foundry-years-to-scale",
    {
      label: "Time from landing to full scale",
      unit: "d",
      show: "yr",
      sig: 2,
      formula: "n × doubling time + the Veil's hold",
      basis: "invented",
    },
    () => v("foundry-full-scale") - v("foundry-landing"),
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
}

/** The Foundry's products: when each becomes affordable, and the growth curve. Runs after them. */
export function foundryProducts(r: Registry) {
  const { v } = r.in("model/foundry.ts");
  const at = (day: number) => foundryMassAt(day, foundryParams(v));

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
    "foundry-built-mass",
    {
      label: "Everything the Foundry builds: itself, the Veil, the Lattice and the Ring",
      unit: "kg",
      formula: "M_Foundry + M_Veil + M_Lattice + M_Ring",
      basis: "invented",
    },
    () => v("foundry-final-mass") + v("veil-mass") + v("helios-mass") + v("ring-mass"),
  );
  r.q(
    "hardware-energy",
    {
      label: "Energy to build the Foundry and everything it makes",
      unit: "J",
      sig: 1,
      formula: "M_built × e",
      basis: "invented",
    },
    () => v("foundry-built-mass") * v("foundry-energy-per-kg"),
  );
  r.q(
    "ring-build-days",
    {
      label: "Days the full Foundry takes to build the Braking Ring",
      unit: "d",
      sig: 2,
      formula: "M_Ring T / (M_Foundry ln 2)",
      basis: "invented",
    },
    () => (v("ring-mass") * v("foundry-doubling-days")) / (v("foundry-final-mass") * Math.LN2),
  );
  r.q(
    "ring-delivered",
    {
      label: "The Ring's last parts reach Venus",
      unit: "date",
      formula: "Lattice finished + Ring build + Mercury-to-Venus transfer",
      basis: "invented",
      note: "The Foundry builds the Lattice first, then the Ring.",
    },
    () => v("helios-full-power") + v("ring-build-days") + v("mercury-venus-transfer-days"),
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
    {
      label: "Building the Veil costs the Foundry no more than one doubling",
      kind: "schedule",
    },
    () => ({
      pass:
        v("veil-diversion-days") <= v("foundry-doubling-days") &&
        foundryMassAt(v("veil-build-end") - 1, foundryParams(v)) *
          v("veil-diversion-days") *
          Math.LN2 >=
          0.999 * v("veil-mass") * v("foundry-doubling-days"),
      detail: `The Foundry stands still for ${fmt(r, "veil-diversion-days")} to build the ${fmt(r, "veil-mass")} Veil, whose last parts leave Mercury on ${fmt(r, "veil-build-end", { date: "day" })}; one doubling is ${fmt(r, "foundry-doubling-days")}.`,
    }),
  );
  r.c(
    "foundry-size",
    {
      label: "The Foundry stops growing at the size that finishes the Lattice and the Ring soonest",
      kind: "schedule",
    },
    () => {
      // n doublings, then build the products at the full Foundry's rate.
      const T = v("foundry-doubling-days");
      const products = v("helios-mass") + v("ring-mass");
      const finish = (n: number) =>
        n * T + (products * T) / (v("foundry-seed-mass") * 2 ** n * Math.LN2);
      const n = v("foundry-doublings");
      return {
        pass: finish(n) <= finish(n - 1) && finish(n) <= finish(n + 1),
        detail: `After ${fmt(r, "foundry-doublings")} doublings the ${fmt(r, "foundry-final-mass")} Foundry builds the ${fmt(r, "helios-mass")} Lattice in ${fmt(r, "lattice-build-days")} and the Ring in ${fmt(r, "ring-build-days")}: both done ${Math.round(finish(n))} days after landing, against ${Math.round(finish(n - 1))} with one doubling fewer and ${Math.round(finish(n + 1))} with one more.`,
      };
    },
  );
  r.c(
    "foundry-builds-ring",
    {
      label: "The Ring's mass reaches Venus before the Ring must be complete",
      kind: "schedule",
    },
    () => ({
      pass: v("ring-delivered") <= v("ring-complete"),
      detail: `After the Lattice, the Foundry builds the ${fmt(r, "ring-mass")} Ring in ${fmt(r, "ring-build-days")}; its last parts reach Venus on ${fmt(r, "ring-delivered", { date: "day" })}, and the Ring must be complete on ${fmt(r, "ring-complete", { date: "day" })}.`,
    }),
  );
}
