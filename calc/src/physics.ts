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

/**
 * Sublimation pressure of solid CO₂, Span and Wagner's Eq. 3.12, for T at or below the triple point:
 * ln(p/p_t) = (T_t/T) [a₁ θ + a₂ θ^1.9 + a₃ θ^2.9], θ = 1 − T/T_t. It meets the vapour curve at the
 * triple point by construction.
 */
export function co2SublimationPressure(
  T: number,
  triple: { T: number; P: number },
  a: readonly [number, number, number],
) {
  if (T > triple.T * (1 + 1e-9))
    throw new Error(`co2SublimationPressure: ${T} K is above the triple point`);
  const th = Math.max(0, 1 - T / triple.T);
  return triple.P * Math.exp((triple.T / T) * (a[0] * th + a[1] * th ** 1.9 + a[2] * th ** 2.9));
}

/**
 * Share of CO₂'s deposition heat given up on freezing, at the triple point. By Clapeyron's equation
 * each curve's slope is its latent heat over T Δv, and the vapour's volume dwarfs the liquid's and
 * the solid's, so condensing and depositing differ only in their slopes there:
 * L_fusion / L_deposition = 1 − (d ln p_vapour/dT) / (d ln p_sublimation/dT). The vapour curve is
 * co2LiquidPressure's, the sublimation curve Span and Wagner's (slope −a₁/T_t at the triple point).
 */
export function co2FusionShare(
  triple: { T: number; P: number },
  critical: { T: number; P: number },
  a1: number,
) {
  const B = Math.log(critical.P / triple.P) / (1 / triple.T - 1 / critical.T);
  return 1 - B / triple.T ** 2 / (-a1 / triple.T);
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

/**
 * Lambert's problem in a plane: the prograde, single-revolution orbit from radius r1 (on the x axis)
 * to radius r2 at angle theta (0 to 2π) in time t. Returns the velocity at both ends and the
 * universal variable z of the solution, or null when no such orbit exists. Universal variables
 * (Curtis, algorithm 5.2). The time of flight rises with z, so z is found by Newton's method from
 * `guess` (a neighbouring solution's z, when there is one) inside a bracket that shrinks with every
 * step; a step that would leave the bracket is replaced by bisection.
 */
export function lambert(
  mu: number,
  r1: number,
  r2: number,
  theta: number,
  t: number,
  guess = Math.PI ** 2 / 2,
): { v1: [number, number]; v2: [number, number]; z: number } | null {
  const A = Math.sin(theta) * Math.sqrt((r1 * r2) / (1 - Math.cos(theta)));
  const target = Math.sqrt(mu) * t;
  // Stumpff's C(z) and S(z) and the auxiliary y(z), left behind by f for the slope and the result.
  let c = 1 / 2;
  let s = 1 / 6;
  let y = 0;
  const f = (z: number) => {
    if (z > 1e-8) {
      const q = Math.sqrt(z);
      c = (1 - Math.cos(q)) / z;
      s = (q - Math.sin(q)) / (q * z);
    } else if (z < -1e-8) {
      const q = Math.sqrt(-z);
      c = (Math.cosh(q) - 1) / -z;
      s = (Math.sinh(q) - q) / (q * -z);
    } else {
      c = 1 / 2;
      s = 1 / 6;
    }
    y = r1 + r2 + (A * (z * s - 1)) / Math.sqrt(c);
    if (y < 0) return Number.NEGATIVE_INFINITY;
    const k = y / c;
    return k * Math.sqrt(k) * s + A * Math.sqrt(y) - target;
  };
  // Below lo the orbit is far faster than any transfer; at hi it is an ellipse of endless period.
  let lo = -100;
  let hi = 4 * Math.PI ** 2 * 0.9999;
  let z = Math.min(hi, Math.max(lo, guess));
  for (let i = 0; i < 100; i++) {
    const fz = f(z);
    if (fz < 0) lo = z;
    else hi = z;
    let next = (lo + hi) / 2;
    if (Number.isFinite(fz)) {
      // dF/dz, Curtis eq. 5.43, with its limit at z = 0.
      const k = y / c;
      const slope =
        Math.abs(z) > 1e-6
          ? k * Math.sqrt(k) * ((c - (1.5 * s) / c) / (2 * z) + (0.75 * s * s) / c) +
            (A / 8) * ((3 * s * Math.sqrt(y)) / c + A * Math.sqrt(c / y))
          : (Math.SQRT2 / 40) * y * Math.sqrt(y) + (A / 8) * (Math.sqrt(y) + A / Math.sqrt(2 * y));
      const step = z - fz / slope;
      if (step > lo && step < hi) next = step;
    }
    const settled = Math.abs(next - z) <= 1e-12 * Math.max(1, Math.abs(z));
    z = next;
    if (settled) break;
  }
  // No root in the bracket: the search ran to one end and the time of flight does not match.
  if (!(Math.abs(f(z)) <= 1e-9 * target)) return null;
  const F = 1 - y / r1;
  const G = A * Math.sqrt(y / mu);
  const Gdot = 1 - y / r2;
  const x2 = r2 * Math.cos(theta);
  const y2 = r2 * Math.sin(theta);
  return {
    v1: [(x2 - F * r1) / G, y2 / G],
    v2: [(Gdot * x2 - r1) / G, (Gdot * y2) / G],
    z,
  };
}

/**
 * The cheapest way to give every row its own column (rows ≤ cols): the Hungarian algorithm of Kuhn
 * and Munkres, with row and column potentials, O(rows² × cols). cost is row-major, rows × cols, and
 * finite. Returns the column given to each row.
 */
export function assign(cost: ArrayLike<number>, rows: number, cols: number): Int32Array {
  if (rows > cols) throw new Error("assign: more rows than columns");
  const u = new Float64Array(rows + 1);
  const v = new Float64Array(cols + 1);
  // The row (counted from 1) holding each column, 0 for none; column 0 is the row being placed.
  const owner = new Int32Array(cols + 1);
  const way = new Int32Array(cols + 1);
  const least = new Float64Array(cols + 1);
  const used = new Uint8Array(cols + 1);
  for (let i = 1; i <= rows; i++) {
    owner[0] = i;
    let j0 = 0;
    least.fill(Number.POSITIVE_INFINITY);
    used.fill(0);
    do {
      used[j0] = 1;
      const i0 = owner[j0] as number;
      const ui = u[i0] as number;
      const base = (i0 - 1) * cols - 1;
      let delta = Number.POSITIVE_INFINITY;
      let j1 = 0;
      for (let j = 1; j <= cols; j++) {
        if (used[j]) continue;
        const reduced = (cost[base + j] as number) - ui - (v[j] as number);
        if (reduced < (least[j] as number)) {
          least[j] = reduced;
          way[j] = j0;
        }
        if ((least[j] as number) < delta) {
          delta = least[j] as number;
          j1 = j;
        }
      }
      if (j1 === 0) throw new Error("assign: costs must be finite");
      for (let j = 0; j <= cols; j++) {
        if (used[j]) {
          const k = owner[j] as number;
          u[k] = (u[k] as number) + delta;
          v[j] = (v[j] as number) - delta;
        } else least[j] = (least[j] as number) - delta;
      }
      j0 = j1;
    } while (owner[j0] !== 0);
    do {
      const j1 = way[j0] as number;
      owner[j0] = owner[j1] as number;
      j0 = j1;
    } while (j0);
  }
  const out = new Int32Array(rows);
  for (let j = 1; j <= cols; j++) if (owner[j]) out[(owner[j] as number) - 1] = j - 1;
  return out;
}

/**
 * A transfer between two circular orbits about the Sun whose planes cross at the angle inclination.
 * Angles are measured in each orbit's own plane from the line where the planes cross: the departure
 * body (radius r1, in the tilted plane) is at u, the target (radius r2, in the reference plane) is at
 * w when the transfer reaches it, t after departure. The transfer orbit lies in the plane through the
 * Sun and both points and runs prograde. Returns the squared launch kick (the transfer's velocity
 * less the departure body's), the kick's component against the departure body's motion (the recoil
 * per kilogram thrown) and out of its orbit's plane, the squared arrival speed relative to the
 * target (v∞) and its component out of the target's plane, and Lambert's z (a starting guess for a
 * neighbouring transfer); or null when no single-revolution orbit fits, or the two points and the
 * Sun are in line. The out-of-plane parts are the plane change each end pays: the transfer's plane
 * is fixed by the Sun and the two points, so it is tilted to both orbits, and neither end can hand
 * its share of the tilt to the other.
 */
export function inclinedTransfer(
  mu: number,
  r1: number,
  r2: number,
  inclination: number,
  u: number,
  w: number,
  t: number,
  guess?: number,
): {
  dv2: number;
  back: number;
  kickTilt: number;
  vinf2: number;
  vinfTilt: number;
  z: number;
} | null {
  const cu = Math.cos(u);
  const su = Math.sin(u);
  const ci = Math.cos(inclination);
  const si = Math.sin(inclination);
  // Unit vectors to both points; the target's plane is the x-y plane, the crossing line the x axis.
  const ax = cu;
  const ay = su * ci;
  const az = su * si;
  const bx = Math.cos(w);
  const by = Math.sin(w);
  // The transfer plane's normal, a × b, turned to point the way both orbits do (+z).
  let nx = -az * by;
  let ny = az * bx;
  let nz = ax * by - ay * bx;
  const size = Math.hypot(nx, ny, nz);
  if (size < 1e-12) return null;
  let theta = Math.acos(Math.max(-1, Math.min(1, ax * bx + ay * by)));
  if (nz < 0) {
    theta = 2 * Math.PI - theta;
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }
  nx /= size;
  ny /= size;
  nz /= size;
  const sol = lambert(mu, r1, r2, theta, t, guess);
  if (!sol) return null;
  // In the transfer plane: radial along a, transverse along n × a.
  const tx = ny * az - nz * ay;
  const ty = nz * ax - nx * az;
  const tz = nx * ay - ny * ax;
  const [p1, q1] = sol.v1;
  const [p2, q2] = sol.v2;
  const v1 = circularSpeed(mu, r1);
  const v2 = circularSpeed(mu, r2);
  // The departure body moves along (−sin u, cos u cos i, cos u sin i), the target along (−sin w, cos w, 0).
  const ex = -su;
  const ey = cu * ci;
  const ez = cu * si;
  const dx = p1 * ax + q1 * tx - v1 * ex;
  const dy = p1 * ay + q1 * ty - v1 * ey;
  const dz = p1 * az + q1 * tz - v1 * ez;
  const wx = p2 * ax + q2 * tx + v2 * by;
  const wy = p2 * ay + q2 * ty - v2 * bx;
  const wz = p2 * az + q2 * tz;
  return {
    dv2: dx * dx + dy * dy + dz * dz,
    back: -(dx * ex + dy * ey + dz * ez),
    // The departure orbit's normal is (0, −sin i, cos i); the target's is +z.
    kickTilt: dz * ci - dy * si,
    vinf2: wx * wx + wy * wy + wz * wz,
    vinfTilt: wz,
    z: sol.z,
  };
}

/**
 * Launch phases, and arrival slots, in one synodic cycle. A third more leaves the Ice Train's
 * average launch energy where it is.
 */
export const SCHEDULE_SLOTS = 72;
/**
 * Places along the departure orbit the schedule is solved at, spread over half a turn from the line
 * where the planes cross. Point inversion through the Sun maps each half of the orbit onto the
 * other, prograde orbits onto prograde orbits, so half a turn stands for the whole. For the Ice
 * Train, four times as many places leave the average launch energy, the recoil, the fastest
 * transfer from Ceres's starting orbit and the slowest from its drifted one where they are, and
 * raise the single worst launch's energy by two points.
 */
export const SCHEDULE_SAMPLES = 6;
/**
 * The flight times tried, as multiples of the Hohmann time. The Ice Train's schedule uses none
 * within a tenth of either end; a schedule pressed against one keeps to it, as a limit the
 * launchers would hold.
 */
export const SCHEDULE_WINDOW: readonly [number, number] = [0.6, 1.5];

export interface LaunchSchedule {
  /** Launch energy per kilogram, as Δv² + v_esc², averaged over every launch (m²/s²). */
  energy: number;
  /** The same for the costliest launch. */
  energyMax: number;
  /** The same for a Hohmann launch from this orbit. */
  hohmann: number;
  /** Root mean square arrival speed relative to the target, far out (m/s). */
  vinfRms: number;
  /** Root mean square of the launch kick's component out of the departure orbit's plane (m/s). */
  kickTiltRms: number;
  /** Root mean square of the arrival speed's component out of the target's plane (m/s). */
  vinfTiltRms: number;
  /** Mean component of the launch kick against the departure body's motion (m/s). */
  back: number;
  /** Every launch's flight time, shortest first (s). */
  flights: number[];
  /** Most launch phases any one arrival slot receives in a cycle (the mean is one). */
  peak: number;
  /** Synodic period (s). */
  cycle: number;
  /** Width of one launch phase or arrival slot (s). */
  slot: number;
}

const scheduleCache = new Map<string, LaunchSchedule>();

/**
 * A steady launch schedule between circular orbits r1 (departure) and r2 (target), inclined to each
 * other, that a catcher at the target can keep up with. Launchers fire at a steady rate through the
 * synodic cycle, so the cycle is cut into SCHEDULE_SLOTS launch phases, each carrying an equal share
 * of the mass, and as many arrival slots. Each pair is costed by the cheapest transfer that leaves
 * at that phase and arrives in that slot any whole number of cycles later, with the flight time
 * inside SCHEDULE_WINDOW. The minimum-cost assignment, with up to `peak` phases sharing one arrival
 * slot, is the schedule: peak 1 spreads the arrivals evenly, a larger peak lets them bunch. The cost
 * is the launch energy alone, so the plane change falls wherever the cheapest launch puts it.
 *
 * The schedule is solved at SCHEDULE_SAMPLES places along the departure orbit and averaged. Within
 * each sampled cycle the departure body moves on as it really does; each cycle's assignment is
 * solved on its own, as if repeated.
 *
 * Pure; cached on its inputs (the most recent 32), as it is the slowest sum in the model.
 */
export function launchSchedule(p: {
  mu: number;
  r1: number;
  r2: number;
  vEscape: number;
  inclination: number;
  peak: number;
}): LaunchSchedule {
  const { mu, r1, r2, vEscape, inclination, peak } = p;
  if (!Number.isInteger(peak) || peak < 1)
    throw new Error(`launchSchedule: the arrival peak must be a whole number, not ${peak}`);
  const key = `${mu}|${r1}|${r2}|${vEscape}|${inclination}|${peak}`;
  const hit = scheduleCache.get(key);
  if (hit) return hit;
  const n = SCHEDULE_SLOTS;
  const n1 = Math.sqrt(mu / r1 ** 3);
  const n2 = Math.sqrt(mu / r2 ** 3);
  const cycle = (2 * Math.PI) / Math.abs(n2 - n1);
  const slot = cycle / n;
  const h = hohmann(mu, r1, r2);
  const fastest = SCHEDULE_WINDOW[0] * h.time;
  const slowest = SCHEDULE_WINDOW[1] * h.time;
  // With no tilt every place along the orbit is alike.
  const samples = inclination === 0 ? 1 : SCHEDULE_SAMPLES;
  const cols = n * peak;
  const none = 1e30;
  const best = new Float64Array(n * n);
  const flight = new Float64Array(n * n);
  const vinf2 = new Float64Array(n * n);
  const back = new Float64Array(n * n);
  const kickTilt2 = new Float64Array(n * n);
  const vinfTilt2 = new Float64Array(n * n);
  const wide = new Float64Array(n * cols);
  const flights: number[] = [];
  let energy = 0;
  let energyMax = 0;
  let vinf = 0;
  let recoil = 0;
  let kickTilt = 0;
  let vinfTilt = 0;
  let most = 0;
  for (let k = 0; k < samples; k++) {
    // The cycle's sweep along the orbit is centred on the sample.
    const start = ((k + 0.5) * Math.PI) / samples - (n1 * cycle) / 2;
    best.fill(none);
    for (let i = 0; i < n; i++) {
      const u = start + n1 * i * slot;
      // The target leads the departure body by the launch phase, 2π i / n.
      const lead = u + (2 * Math.PI * i) / n;
      // Arrival m slots after launch lands in slot (i + m) mod n. Stepping m one slot at a time
      // moves the arrival point only a little, so each solution starts the next one's search.
      let guess: number | undefined;
      for (let m = Math.ceil(fastest / slot); m * slot <= slowest; m++) {
        const t = m * slot;
        const x = inclinedTransfer(mu, r1, r2, inclination, u, lead + n2 * t, t, guess);
        guess = x?.z;
        if (!x) continue;
        const e = x.dv2 + vEscape ** 2;
        const at = i * n + ((i + m) % n);
        if (e < (best[at] as number)) {
          best[at] = e;
          flight[at] = t;
          vinf2[at] = x.vinf2;
          back[at] = x.back;
          kickTilt2[at] = x.kickTilt ** 2;
          vinfTilt2[at] = x.vinfTilt ** 2;
        }
      }
    }
    for (let i = 0; i < n; i++)
      for (let q = 0; q < peak; q++) wide.set(best.subarray(i * n, (i + 1) * n), i * cols + q * n);
    const col = assign(wide, n, cols);
    const load = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      const j = (col[i] as number) % n;
      const at = i * n + j;
      const e = best[at] as number;
      if (e >= none)
        throw new Error("launchSchedule: a launch phase has no transfer in the window");
      load[j] = (load[j] as number) + 1;
      energy += e;
      energyMax = Math.max(energyMax, e);
      vinf += vinf2[at] as number;
      recoil += back[at] as number;
      kickTilt += kickTilt2[at] as number;
      vinfTilt += vinfTilt2[at] as number;
      flights.push(flight[at] as number);
    }
    most = Math.max(most, ...load);
  }
  const count = n * samples;
  const out: LaunchSchedule = {
    energy: energy / count,
    energyMax,
    hohmann: h.departDv ** 2 + vEscape ** 2,
    vinfRms: Math.sqrt(vinf / count),
    kickTiltRms: Math.sqrt(kickTilt / count),
    vinfTiltRms: Math.sqrt(vinfTilt / count),
    back: recoil / count,
    flights: flights.sort((a, b) => a - b),
    peak: most,
    cycle,
    slot,
  };
  if (scheduleCache.size >= 32) {
    const oldest = scheduleCache.keys().next().value;
    if (oldest !== undefined) scheduleCache.delete(oldest);
  }
  scheduleCache.set(key, out);
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
