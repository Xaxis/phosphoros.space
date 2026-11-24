/**
 * GLSL for everything in the journey but Venus's own surface and air (venus-glsl.ts). The Sun sits
 * at the origin, so a surface's light comes from -position. Every pow() and sqrt() takes a base
 * clamped to zero or above: a negative base is NaN on a real GPU, and one NaN pixel blacks out the
 * whole frame through the bloom pass (web/test/hero.test.ts holds every shader to it).
 */
import { OUT, SIMPLEX, UV } from "./venus-glsl.ts";

/** Object-space normal and world position, for any textured sphere. */
export const BODY_VERT = /* glsl */ `
varying vec3 vObj;
varying vec3 vPosW;
varying vec3 vNormW;
void main() {
  vObj = position;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPosW = w.xyz;
  vNormW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

/**
 * The Sun: limb-darkened, its granules boiling, far brighter than anything else so the bloom gives
 * it a corona. Seen from inside its own glow, it stays a disc.
 */
export const SUN_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uCamPos;
uniform vec3 cCore;
uniform vec3 cLimb;
varying vec3 vObj;
varying vec3 vPosW;
varying vec3 vNormW;
${SIMPLEX}
void main() {
  vec3 n = normalize(vObj);
  vec3 V = normalize(uCamPos - vPosW);
  float mu = clamp(dot(normalize(vNormW), V), 0.0, 1.0);
  float gran = fbm(n * 18.0 + vec3(0.0, uTime * 0.05, 0.0), 4);
  float spots = smoothstep(0.62, 0.78, fbm(n * 3.0 + vec3(uTime * 0.01), 3) + 0.5);
  float limb = 0.35 + 0.65 * pow(max(mu, 0.0), 0.55);
  vec3 col = mix(cLimb, cCore, pow(max(mu, 0.0), 0.4)) * limb * (0.92 + 0.16 * gran) * (1.0 - 0.45 * spots);
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}
`;

/** A soft glow on a camera-facing quad: the Sun's corona, a world's marker in a wide shot. */
export const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec2 scale = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
  mv.xy += position.xy * scale;
  gl_Position = projectionMatrix * mv;
}
`;

export const GLOW_FRAG = /* glsl */ `
uniform vec3 cGlow;
uniform float uOn;
uniform float uFall;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  if (r > 1.0) discard;
  float g = pow(max(1.0 - r, 0.0), uFall);
  gl_FragColor = vec4(cGlow * g * uOn, 1.0);
  ${OUT}
}
`;

/**
 * The sky: NASA's map of the Milky Way for the glow, and point stars drawn at the screen's own
 * resolution on top, so the sky stays sharp however far the camera zooms in. The map's own stars
 * blur when magnified, so it is dimmed below a floor and only its broad light remains.
 */
export const SKY_FRAG = /* glsl */ `
uniform sampler2D uStars;
uniform float uLoaded;
uniform float uGain;
varying vec3 vObj;
${UV}
float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
// One star per lucky cell of a 3D grid, a dot about a pixel and a half across wherever it lands.
vec3 stars(vec3 p, float density) {
  vec3 c = floor(p);
  float h = hash(c);
  if (h > density) return vec3(0.0);
  vec3 at = vec3(hash(c + 1.7), hash(c + 3.1), hash(c + 5.3)) * 0.8 + 0.1;
  vec3 d = p - c - at;
  float px = length(fwidth(p));
  float r2 = dot(d, d) / max(px * px * 0.6, 1e-10);
  // Kept under the bloom's threshold, so a bright star stays a point and never blooms to a blob.
  float mag = pow(max(hash(c + 7.7), 0.0), 6.0) * 0.62 + 0.08;
  float t = hash(c + 9.1);
  vec3 tint = t < 0.2 ? vec3(0.75, 0.85, 1.0) : t > 0.85 ? vec3(1.0, 0.82, 0.62) : vec3(1.0, 0.97, 0.92);
  return tint * mag * exp(-r2);
}
void main() {
  vec3 n = normalize(vObj);
  // A fixed coarse level of the map (128 x 64, about 3 degrees a texel): the Milky Way's diffuse
  // light without its stars. Any finer, and through a telephoto lens each bright star in the map
  // turns into a soft square ten pixels across. A fixed level also has no seam where atan wraps.
  vec3 map = textureLod(uStars, uvOf(n), 4.0).rgb;
  vec3 glow = max(map - vec3(0.01), vec3(0.0)) * 1.25 * uLoaded;
  vec3 col = glow + stars(n * 300.0, 0.05) + stars(n * 700.0, 0.03) * 0.6;
  gl_FragColor = vec4(col * uGain, 1.0);
  ${OUT}
}
`;

/**
 * An airless world in sunlight: Mercury, the Moon, Ceres. Lunar-Lambert shading, so the full disc
 * stays bright to the limb as real regolith does. A cap of machinery spreads from uSite: dark solar
 * film ruled with glinting rows, and the lights of the works on the night side.
 */
export const ROCKY_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uLoaded;
uniform vec3 cBase;
uniform mat3 uRot;
uniform vec3 uCenter;
uniform vec3 uCamPos;
uniform float uGain;
uniform vec3 uSite;
uniform float uCover;
uniform float uActive;
uniform float uBelt;
uniform float uTime;
uniform vec3 cFilm;
uniform vec3 cLights;
varying vec3 vObj;
varying vec3 vPosW;
${UV}
${SIMPLEX}
void main() {
  vec3 n = normalize(vObj);
  vec3 albedo = mix(cBase * (0.8 + 0.4 * (fbm(n * 6.0, 4) + 0.5)), texture2D(uMap, uvOf(n)).rgb, uLoaded);
  vec3 N = normalize(uRot * n);
  vec3 L = normalize(-uCenter);
  vec3 V = normalize(uCamPos - vPosW);
  float mu0 = max(dot(N, L), 0.0);
  float mu = max(dot(N, V), 0.0);
  float lunar = 2.0 * mu0 / max(mu0 + mu, 1e-3);
  float shade = mix(mu0, lunar, 0.6);

  // The works: a cap round the site, its edge ragged as the machines take ground unevenly.
  float edge = dot(n, uSite);
  float ragged = 0.04 * fbm(n * 14.0, 3);
  float cap = uActive * smoothstep(uCover - 0.004, uCover + 0.004, edge + ragged * (1.0 - uCover));
  // A seed is a glint before it is a cap: one small point of light, about a degree across.
  float seed = uActive * (1.0 - smoothstep(0.0, 0.00015, 1.0 - edge)) * (0.75 + 0.25 * sin(uTime * 3.0))
    * (1.0 - smoothstep(0.0, 0.02, max(1.0 - uCover, 0.0)));
  // Millions of panels: dark film in rows with bright seams, each panel tilted a little its own
  // way, so the sunlight glints off a scatter of them rather than off one smooth lid.
  vec2 cells = uvOf(n) * vec2(900.0, 450.0);
  vec2 g = fract(cells);
  float panel = fract(sin(dot(floor(cells), vec2(12.9898, 78.233))) * 43758.5453);
  float rows = smoothstep(0.4, 0.5, abs(g.y - 0.5));
  vec3 film = mix(cFilm * (0.8 + 0.4 * panel), vec3(0.3, 0.32, 0.35), rows * 0.55);
  albedo = mix(albedo, film, cap);
  // The construction front: where the machines are taking new ground, a ragged bright edge.
  float front = uActive * (1.0 - smoothstep(0.0, 0.012, abs(edge + ragged * (1.0 - uCover) - uCover)))
    * step(uCover, 0.995);
  // The Railheads: a belt of coilguns along the equator, each a bright thread.
  float belt = uBelt * (1.0 - smoothstep(0.035, 0.05, abs(n.y))) * step(0.55, fract(uvOf(n).x * 520.0));
  albedo = mix(albedo, vec3(0.75, 0.78, 0.82), belt * 0.85);

  vec3 col = albedo * shade * uGain;
  vec3 H = normalize(L + V);
  float nh = max(dot(N, H), 0.0);
  col += cap * pow(max(nh, 0.0), 40.0) * step(0.9, panel) * vec3(1.0, 0.95, 0.85) * mu0 * 1.6;
  col += cap * pow(max(nh, 0.0), 300.0) * vec3(0.9, 0.88, 0.82) * mu0 * 0.6;
  float dark = 1.0 - smoothstep(-0.05, 0.15, dot(N, L));
  float lights = cap * step(0.82, panel) * 0.35 * dark;
  col += cLights * (lights + front * (0.25 + 0.75 * dark) * 0.9 + belt * 0.5 * (0.3 + 0.7 * dark));
  col += vec3(1.0, 0.93, 0.8) * seed * 1.6;
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}
`;

/**
 * Earth: NASA's Blue Marble by day, the Black Marble's city lights by night, clouds drifting over
 * both, the oceans catching the Sun.
 */
export const EARTH_FRAG = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uClouds;
uniform float uLoaded;
uniform mat3 uRot;
uniform vec3 uCenter;
uniform vec3 uCamPos;
uniform float uTime;
varying vec3 vObj;
varying vec3 vPosW;
${UV}
${SIMPLEX}
void main() {
  vec3 n = normalize(vObj);
  vec2 uv = uvOf(n);
  float land = smoothstep(0.0, 0.2, fbm(n * 2.2, 5));
  vec3 fallbackDay = mix(vec3(0.02, 0.07, 0.2), vec3(0.18, 0.3, 0.12), land);
  vec3 day = mix(fallbackDay, texture2D(uDay, uv).rgb, uLoaded);
  vec3 lights = texture2D(uNight, uv).rgb * uLoaded;
  float cloud = mix(smoothstep(0.1, 0.5, fbm(n * 3.0 + 7.0, 5)), texture2D(uClouds, uv + vec2(uTime * 0.002, 0.0)).r, uLoaded);
  vec3 N = normalize(uRot * n);
  vec3 L = normalize(-uCenter);
  vec3 V = normalize(uCamPos - vPosW);
  float d = dot(N, L);
  float lit = smoothstep(-0.08, 0.25, d);
  float ocean = smoothstep(0.02, 0.09, day.b - max(day.r, day.g)) * (1.0 - cloud);
  vec3 H = normalize(L + V);
  vec3 col = mix(day, vec3(1.0), cloud * 0.92) * max(d, 0.0) * 1.15;
  col += ocean * pow(max(dot(N, H), 0.0), 90.0) * vec3(1.0, 0.92, 0.75) * 0.8 * lit;
  col += lights * vec3(1.0, 0.78, 0.45) * 1.6 * (1.0 - lit) * (1.0 - cloud * 0.7);
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}
`;

/**
 * Points that move along their own orbits on the GPU. Each Petal circles the Sun at its own
 * distance, tilt and phase; aBirth sets when it flies, as a share of the whole Lattice.
 */
export const PETAL_VERT = /* glsl */ `
uniform float uDay;
uniform float uShare;
uniform float uPixel;
uniform float uScale;
uniform float uPower;
uniform float uTime;
attribute vec4 aOrbit;
attribute float aBirth;
varying float vAlpha;
varying float vGlint;
void main() {
  // aOrbit: distance (AU), inclination, node, phase (radians).
  float a = aOrbit.x;
  float period = 365.25 * pow(max(a, 0.0), 1.5);
  float u = aOrbit.w + 6.2831853 * uDay / period;
  float r = uScale * pow(max(a, 0.0), uPower);
  vec3 p = vec3(cos(u), 0.0, -sin(u)) * r;
  float ci = cos(aOrbit.y); float si = sin(aOrbit.y);
  p = vec3(p.x, -p.z * si, p.z * ci);
  float cn = cos(aOrbit.z); float sn = sin(aOrbit.z);
  p = vec3(p.x * cn + p.z * sn, p.y, -p.x * sn + p.z * cn);
  vAlpha = step(aBirth, uShare);
  vGlint = 0.55 + 0.45 * sin(uTime * (1.3 + fract(aBirth * 91.0) * 2.0) + aBirth * 600.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPixel * clamp(28.0 / -mv.z, 1.2, 4.5);
  gl_Position = projectionMatrix * mv;
}
`;

export const SPARK_FRAG = /* glsl */ `
uniform vec3 cPoint;
uniform float uOn;
varying float vAlpha;
varying float vGlint;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q) * 2.0;
  if (r > 1.0) discard;
  float core = pow(max(1.0 - r, 0.0), 1.8);
  gl_FragColor = vec4(cPoint * core * vAlpha * vGlint * uOn, 1.0);
  ${OUT}
}
`;

/**
 * Craft coasting between worlds on the GPU: Bricks from Ceres, slats and hardware from Mercury.
 * Each flies a Hohmann-like half-ellipse from where its world was at launch to where the target is
 * on arrival, timed by Kepler's equation (the same arithmetic as orbits.ts's transfer()).
 */
export const TRANSIT_VERT = /* glsl */ `
uniform float uDay;
uniform float uPixel;
uniform float uScale;
uniform float uPower;
uniform float uSize;
attribute vec4 aPath;
attribute vec2 aTimes;
varying float vAlpha;
varying float vGlint;
void main() {
  // aPath: from longitude (deg), from distance (AU), to longitude (deg), to distance (AU).
  float t = (uDay - aTimes.x) / max(aTimes.y - aTimes.x, 1.0);
  // Each craft fades in leaving its world and out nearing the next: thousands converge on one
  // arrival point along nearly one path, and drawn to the end they would merge into a solid beam.
  vAlpha = step(0.0, t) * step(t, 1.0) * smoothstep(0.0, 0.02, t) * (1.0 - smoothstep(0.9, 0.985, t));
  float s = clamp(t, 0.0, 1.0);
  bool inward = aPath.w < aPath.y;
  float rp = min(aPath.y, aPath.w);
  float ra = max(aPath.y, aPath.w);
  float e = (ra - rp) / max(ra + rp, 1e-6);
  float M = (inward ? 3.14159265 : 0.0) + 3.14159265 * s;
  float E = M;
  for (int k = 0; k < 10; k++) E -= (E - e * sin(E) - M) / (1.0 - e * cos(E));
  float nu = 2.0 * atan(sqrt(max(1.0 + e, 0.0)) * sin(E * 0.5), sqrt(max(1.0 - e, 0.0)) * cos(E * 0.5));
  float swept = mod(nu - (inward ? 3.14159265 : 0.0), 6.2831853);
  float share = s >= 1.0 ? 1.0 : swept / 3.14159265;
  float rad = ((ra + rp) * 0.5) * (1.0 - e * e) / (1.0 + e * cos(nu));
  float sweep = mod(aPath.z - aPath.x, 360.0);
  if (sweep < 20.0) sweep += 360.0;
  float lon = radians(aPath.x + sweep * share);
  float d = uScale * pow(max(rad, 0.0), uPower);
  // Drawn, not measured: each craft a little off its neighbours' path, widest mid-crossing and
  // pinched to a point at both worlds, so thousands on one transfer read as a stream of separate
  // craft rather than one solid line.
  float id = float(gl_VertexID);
  vec2 off = vec2(fract(sin(id * 12.9898) * 43758.5453), fract(sin(id * 78.233) * 43758.5453)) - 0.5;
  float width = 0.025 * d * sin(3.14159265 * s);
  d += off.x * width;
  vec3 p = vec3(cos(lon) * d, off.y * width * 0.6, -sin(lon) * d);
  vGlint = 0.7 + 0.3 * sin(aTimes.x * 37.0 + uDay * 0.9);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPixel * clamp(uSize / -mv.z, 1.0, 2.5);
  gl_Position = projectionMatrix * mv;
}
`;

/**
 * The Photonic Exhaust's canopies: hexagonal aerostats over the cloud tops, in the band between
 * the polar drop zones. Each is a pale film in a thin frame; where the Lattice's light reaches them
 * they glow in false colour, since the real light is infrared. Drawn about twice their real size
 * so a single canopy can be seen from this far out.
 */
export const CANOPY_FRAG = /* glsl */ `
uniform mat3 uRot;
uniform vec3 uSunDir;
uniform vec3 uLitDir;
uniform float uOn;
uniform float uGlow;
uniform float uBand;
uniform float uCells;
uniform float uTime;
uniform vec3 uCamPos;
uniform vec3 cFrame;
uniform vec3 cHot;
varying vec3 vObj;
varying vec3 vPosW;
${UV}
// The offset from the centre of the nearest hexagon, and that hexagon's id.
vec4 hexCell(vec2 p) {
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(p, r) - h;
  vec2 b = mod(p - h, r) - h;
  vec2 o = dot(a, a) < dot(b, b) ? a : b;
  return vec4(o, p - o);
}
void main() {
  vec3 n = normalize(vObj);
  float edge = 1.0 - smoothstep(uBand - 0.05, uBand, abs(n.y));
  if (edge <= 0.0) discard;
  float lat = asin(clamp(n.y, -1.0, 1.0));
  vec2 uv = uvOf(n);
  vec2 p = vec2(uv.x * uCells * 2.0 * cos(lat), lat / 3.14159265 * uCells * 1.1547);
  vec4 c = hexCell(p);
  float hexR = max(abs(c.x) * 0.8660254 + abs(c.y) * 0.5, abs(c.y));
  float aa = max(fwidth(hexR), 1e-4);
  // A gap between neighbours, a thin bright frame, and the film inside.
  float tile = 1.0 - smoothstep(0.43 - aa, 0.43 + aa, hexR);
  float frame = tile * smoothstep(0.43 - 2.0 * aa, 0.43 - aa, hexR);
  // Frames only where a canopy is big enough on screen to show them: from a distance 10,000
  // hexagons 200 km across are a sheen on the clouds, and drawn line by line they shimmer (moire).
  float cellPx = 1.0 / max(length(fwidth(p)), 1e-5);
  float near = smoothstep(9.0, 22.0, cellPx);
  frame *= near;
  tile = mix(1.0, tile, near);
  float id = fract(sin(dot(c.zw, vec2(12.9898, 78.233))) * 43758.5453);
  vec3 N = normalize(uRot * n);
  float sunlit = smoothstep(-0.05, 0.3, dot(N, uSunDir));
  float lit = smoothstep(0.0, 0.35, dot(N, uLitDir));
  float pulse = 0.8 + 0.2 * sin(uTime * 1.4 + id * 40.0);
  // The tiles' 2.3 um light is infrared, drawn in false colour. Strongest toward the limb, where the
  // eye looks along the shell through many tiles, so the surface they cool still shows mid-disc.
  float mu = clamp(dot(N, normalize(uCamPos - vPosW)), 0.0, 1.0);
  float limb = 0.22 + 0.78 * (1.0 - mu) * (1.0 - mu);
  vec3 col = cFrame * (0.55 + 0.45 * id * near) * sunlit * (0.4 * tile + 1.6 * frame);
  col += cHot * lit * uGlow * limb * tile * mix(1.0, pulse * (0.6 + 0.4 * id), near);
  float a = uOn * edge * (0.03 * tile + 0.12 * frame + 0.13 * tile * lit * uGlow * limb);
  if (a <= 0.002) discard;
  gl_FragColor = vec4(col * uOn * edge, a);
  ${OUT}
}
`;

/** The Crown's radiator fins: a flat ring in Ceres's equatorial plane, glowing at 1,500 K. */
export const FIN_FRAG = /* glsl */ `
uniform float uOn;
uniform float uHot;
uniform float uInner;
uniform vec3 cCold;
uniform vec3 cHot;
varying vec2 vUv;
void main() {
  vec2 q = (vUv - 0.5) * 2.0;
  float r = length(q);
  if (r > 1.0 || r < uInner) discard;
  float a = atan(q.y, q.x);
  float fin = smoothstep(0.35, 0.5, abs(fract(a * 48.0 / 6.2831853) - 0.5));
  float fade = 1.0 - smoothstep(0.9, 1.0, r);
  // Hottest at the root, where the Crown's heat enters each fin, cooling toward the tips.
  float heat = uHot * (1.0 - smoothstep(uInner, 1.0, r));
  vec3 col = mix(cCold, cHot, heat) * (0.35 + 0.65 * fin) * fade;
  gl_FragColor = vec4(col * uOn, uOn * fade * (0.2 + 0.35 * fin));
  ${OUT}
}
`;

/** A line of light: beams and orbits. vV runs 0 to 1 along a beam so pulses can travel down it. */
export const LINE_VERT = /* glsl */ `
attribute float aV;
varying float vV;
varying vec3 vWorld;
void main() {
  vV = aV;
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const LINE_FRAG = /* glsl */ `
uniform vec3 cLine;
uniform float uOn;
uniform float uTime;
uniform float uPulse;
uniform float uFrom;
/** A gap round a world (centre, radius; radius 0 for none): its orbit passes through its centre. */
uniform vec4 uHole;
varying float vV;
varying vec3 vWorld;
void main() {
  float gap = uHole.w > 0.0 ? smoothstep(uHole.w, 2.0 * uHole.w, length(vWorld - uHole.xyz)) : 1.0;
  float pulse = pow(max(0.5 + 0.5 * sin((vV * 24.0 - uTime * 2.0) * 6.2831853), 0.0), 6.0);
  float fade = smoothstep(uFrom, mix(uFrom, 1.0, 0.6), vV) * smoothstep(1.0, 0.985, vV);
  gl_FragColor = vec4(cLine * uOn * gap * mix(1.0, 0.35 + 1.4 * pulse, uPulse) * mix(1.0, fade, uPulse), 1.0);
  ${OUT}
}
`;

/** Points in a world's own frame, moving on the CPU: rockets, slats, Bricks leaving the Railheads. */
export const DOT_VERT = /* glsl */ `
uniform float uPixel;
uniform float uAtten;
attribute float aSize;
attribute float aAlpha;
varying float vAlpha;
varying float vGlint;
void main() {
  vAlpha = aAlpha;
  vGlint = 1.0;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // Full size at a close-up's distance (the telephoto lens puts the camera about 18 units from a
  // world it frames), smaller in the wide shots, never under a third.
  gl_PointSize = uPixel * aSize * mix(1.0, clamp(18.0 / -mv.z, 0.3, 3.0), uAtten);
  gl_Position = projectionMatrix * mv;
}
`;
