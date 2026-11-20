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
