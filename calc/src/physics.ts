/** Small, pure physics functions the model modules share. SI units throughout. */

/** Circular orbital speed. */
export function circularSpeed(mu: number, r: number): number {
  return Math.sqrt(mu / r);
}

/** Vis-viva: speed on an orbit of semi-major axis a at radius r. */
export function visViva(mu: number, r: number, a: number): number {
  return Math.sqrt(mu * (2 / r - 1 / a));
}

/** Orbital period of semi-major axis a. */
export function period(mu: number, a: number): number {
  return 2 * Math.PI * Math.sqrt(a ** 3 / mu);
}

/** A Hohmann transfer between circular orbits r1 (departure) and r2 (arrival). */
export function hohmann(mu: number, r1: number, r2: number) {
  const a = (r1 + r2) / 2;
  const v1 = circularSpeed(mu, r1);
  const v2 = circularSpeed(mu, r2);
  const vDepart = visViva(mu, r1, a);
  const vArrive = visViva(mu, r2, a);
  return {
    a,
    departDv: Math.abs(v1 - vDepart),
    arriveVinf: Math.abs(vArrive - v2),
    time: Math.PI * Math.sqrt(a ** 3 / mu),
  };
}

/** Find x in [lo, hi] where f changes sign, by bisection. */
export function bisect(f: (x: number) => number, lo: number, hi: number, iterations = 200): number {
  let flo = f(lo);
  const fhi = f(hi);
  if (flo * fhi > 0) throw new Error("bisect: no sign change in the bracket");
  let a = lo;
  let b = hi;
  for (let i = 0; i < iterations; i++) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (fm === 0) return m;
    if (flo * fm < 0) b = m;
    else {
      a = m;
      flo = fm;
    }
  }
  return (a + b) / 2;
}

/**
 * Net acceleration, pointing away from the Sun, on a body x metres sunward of a planet on the
 * Sun-planet line, in the frame that turns with the planet's orbit. beta is the ratio of light
 * pressure to solar gravity on the body (0 for a body that ignores light).
 */
export function sunwardBalance(
  x: number,
  p: { muSun: number; muPlanet: number; a: number; beta: number },
): number {
  const n2 = (p.muSun + p.muPlanet) / p.a ** 3;
  const mu = p.muPlanet / (p.muSun + p.muPlanet);
  const fromBarycentre = (1 - mu) * p.a - x;
  const fromSun = p.a - x;
  return (
    -(p.muSun * (1 - p.beta)) / fromSun ** 2 + // the Sun pulls back, light pushes out
    p.muPlanet / x ** 2 + // the planet pulls outward (it is farther from the Sun)
    n2 * fromBarycentre // centrifugal
  );
}

/** Saturation pressure of liquid CO₂, interpolated in ln P against 1/T between triple and critical points. */
export function co2LiquidPressure(
  T: number,
  triple: { T: number; P: number },
  critical: { T: number; P: number },
) {
  const B = Math.log(critical.P / triple.P) / (1 / triple.T - 1 / critical.T);
  return critical.P * Math.exp(-B * (1 / T - 1 / critical.T));
}

/** Sublimation pressure of solid CO₂ by Clausius-Clapeyron from a reference point. */
export function co2SolidPressure(
  T: number,
  ref: { T: number; P: number },
  enthalpy: number,
  R: number,
) {
  return ref.P * Math.exp(-(enthalpy / R) * (1 / T - 1 / ref.T));
}

/** Melting pressure of CO₂, Span and Wagner's correlation: p/p_t = 1 + a₁ (T/T_t − 1) + a₂ (T/T_t − 1)². */
export function co2MeltingPressure(
  T: number,
  triple: { T: number; P: number },
  a1: number,
  a2: number,
) {
  const u = T / triple.T - 1;
  return triple.P * (1 + a1 * u + a2 * u * u);
}

/** The temperature at which CO₂ melts under pressure P: the root of co2MeltingPressure. */
export function co2MeltingTemp(
  P: number,
  triple: { T: number; P: number },
  a1: number,
  a2: number,
) {
  const u = (-a1 + Math.sqrt(a1 * a1 + 4 * a2 * (P / triple.P - 1))) / (2 * a2);
  return triple.T * (1 + u);
}

/**
 * Work a heat pump needs to lift heat out of matter cooling from T1 to T2 (T1 > T2) at constant
 * heat capacity C (J/K), rejecting at Th: ∫ C (Th/T − 1) dT.
 */
export function sensiblePumpWork(C: number, T1: number, T2: number, Th: number): number {
  return C * (Th * Math.log(T1 / T2) - (T1 - T2));
}

/** Pump work for heat Q released evenly in temperature between T1 and T2 (T1 > T2), rejecting at Th. */
export function bandPumpWork(Q: number, T1: number, T2: number, Th: number): number {
  return Q * ((Th / (T1 - T2)) * Math.log(T1 / T2) - 1);
}

/** Heat conducted out of a half-space after a temperature step dT, per square metre, by time t. */
export function conductedHeat(k: number, dT: number, kappa: number, t: number): number {
  return 2 * k * dT * Math.sqrt(t / (Math.PI * kappa));
}

/** Heat flux out of a half-space a time t after a temperature step dT. */
export function conductedFlux(k: number, dT: number, kappa: number, t: number): number {
  return (k * dT) / Math.sqrt(Math.PI * kappa * t);
}

/** Stumpff functions C(z) and S(z) of the universal-variable Kepler problem. */
function stumpff(z: number): { c: number; s: number } {
  if (z > 1e-8) {
    const q = Math.sqrt(z);
    return { c: (1 - Math.cos(q)) / z, s: (q - Math.sin(q)) / q ** 3 };
  }
  if (z < -1e-8) {
    const q = Math.sqrt(-z);
    return { c: (Math.cosh(q) - 1) / -z, s: (Math.sinh(q) - q) / q ** 3 };
  }
  return { c: 1 / 2, s: 1 / 6 };
}

/**
 * Lambert's problem in a plane: the prograde, single-revolution orbit from radius r1 (on the x axis)
 * to radius r2 at angle theta (0 to 2π) in time t. Returns the velocity at both ends, or null when
 * no such orbit exists. Universal variables, solved for z by bisection (Curtis, algorithm 5.2).
 */
export function lambert(
  mu: number,
  r1: number,
  r2: number,
  theta: number,
  t: number,
): { v1: [number, number]; v2: [number, number] } | null {
  const A = Math.sin(theta) * Math.sqrt((r1 * r2) / (1 - Math.cos(theta)));
  const y = (z: number, c: number, s: number) => r1 + r2 + (A * (z * s - 1)) / Math.sqrt(c);
  const f = (z: number) => {
    const { c, s } = stumpff(z);
    const yz = y(z, c, s);
    if (yz < 0) return Number.NEGATIVE_INFINITY;
    return (yz / c) ** 1.5 * s + A * Math.sqrt(yz) - Math.sqrt(mu) * t;
  };
  let lo = -100;
  let hi = 4 * Math.PI ** 2 * 0.9999;
  if (!(f(lo) < 0 && f(hi) > 0)) return null;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (f(m) < 0) lo = m;
    else hi = m;
  }
  const z = (lo + hi) / 2;
  const { c, s } = stumpff(z);
  const yz = y(z, c, s);
  const F = 1 - yz / r1;
  const G = A * Math.sqrt(yz / mu);
  const Gdot = 1 - yz / r2;
  const x2 = r2 * Math.cos(theta);
  const y2 = r2 * Math.sin(theta);
  return {
    v1: [(x2 - F * r1) / G, y2 / G],
    v2: [(Gdot * x2 - r1) / G, (Gdot * y2) / G],
  };
}

const offWindowCache = new Map<string, { max: number; mean: number }>();

/**
 * How much more a launch costs away from the Hohmann window. Circular, coplanar orbits r1 to r2,
 * as the Hohmann transfer assumes. For each launch phase (where the target planet is at launch) the
 * cheapest single-revolution transfer that meets the planet is found by trying every transfer angle;
 * the cost is the launch energy per kilogram, ½ (Δv² + v_esc²), against the Hohmann minimum. Returns
 * the worst phase and the average over all phases (a launcher that fires all the time). Pure; cached,
 * because it is the slowest sum in the model and its inputs are constants.
 */
export function offWindowPenalty(
  mu: number,
  r1: number,
  r2: number,
  vEscape: number,
): { max: number; mean: number } {
  const key = `${mu}|${r1}|${r2}|${vEscape}`;
  const hit = offWindowCache.get(key);
  if (hit) return hit;
  const v1 = circularSpeed(mu, r1);
  const n2 = Math.sqrt(mu / r2 ** 3);
  const P2 = (2 * Math.PI) / n2;
  const best = hohmann(mu, r1, r2).departDv ** 2 + vEscape ** 2;
  const longest = 2 * hohmann(mu, r1, r2).time;
  // The cheapest launch energy per kilogram over every transfer that leaves at this phase and
  // crosses the arrival angle when the target does.
  const cost = (phase: number, angle: number) => {
    const theta = (angle * Math.PI) / 180;
    const lead =
      (((theta - (phase * Math.PI) / 180) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let least = Number.POSITIVE_INFINITY;
    for (let t = lead / n2; t <= longest; t += P2) {
      const sol = t > 0 ? lambert(mu, r1, r2, theta, t) : null;
      if (sol) least = Math.min(least, sol.v1[0] ** 2 + (sol.v1[1] - v1) ** 2 + vEscape ** 2);
    }
    return least;
  };
  const costs: number[] = [];
  for (let phase = 0; phase < 360; phase += 5) {
    // A coarse sweep of transfer angles, then a fine one around the best.
    let at = 180;
    let least = Number.POSITIVE_INFINITY;
    for (let angle = 20; angle <= 340; angle += 4) {
      const c = cost(phase, angle);
      if (c < least) [least, at] = [c, angle];
    }
    for (let angle = at - 4; angle <= at + 4; angle += 0.5)
      least = Math.min(least, cost(phase, angle));
    costs.push(least / best - 1);
  }
  const out = {
    max: Math.max(...costs),
    mean: costs.reduce((a, b) => a + b, 0) / costs.length,
  };
  offWindowCache.set(key, out);
  return out;
}

/**
 * Share of a black body's output between two wavelengths: π ∫ B_λ dλ / σT⁴, by Simpson's rule.
 * h, c, k and σ are passed in so the constants stay in data/.
 */
export function blackBodyShare(
  T: number,
  from: number,
  to: number,
  h: number,
  c: number,
  k: number,
  sigma: number,
  steps = 2000,
): number {
  const B = (l: number) => (2 * h * c * c) / l ** 5 / Math.expm1((h * c) / (l * k * T));
  const dl = (to - from) / steps;
  let sum = B(from) + B(to);
  for (let i = 1; i < steps; i++) sum += (i % 2 ? 4 : 2) * B(from + i * dl);
  return (Math.PI * ((sum * dl) / 3)) / (sigma * T ** 4);
}
