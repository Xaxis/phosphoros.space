/**
 * GLSL for Venus and the hardware round it. Colours arrive as uniforms in linear space; every
 * fragment shader ends with three's tone mapping and colour space chunks so the bloom pass and the
 * screen agree. Venus is drawn in its own frame: uRot turns its surface, uSunDir points at the Sun.
 */

/**
 * 3D simplex noise. From webgl-noise by Ian McEwan and Stefan Gustavson (Ashima Arts),
 * MIT licence: https://github.com/ashima/webgl-noise
 */
export const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float fbm(vec3 p, int octaves) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    s += a * snoise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
}
`;

/** Latitude and longitude texture coordinates for a point on the unit sphere. */
export const UV = /* glsl */ `
const float PI = 3.14159265359;
vec2 uvOf(vec3 n) {
  return vec2(atan(n.x, n.z) / (2.0 * PI) + 0.5, asin(clamp(n.y, -1.0, 1.0)) / PI + 0.5);
}
`;

/*
 * Every pow() and sqrt() here takes a base clamped to zero or above. On a real GPU a negative base
 * gives NaN, and normalize() is approximate, so 1.0 - dot(N, V) can dip below zero at the centre of
 * a sphere. One NaN pixel in the half-float frame spreads through the bloom pass and blacks out the
 * whole scene: the Aegis bubble did exactly that from June 2034. SwiftShader returns a number for a
 * negative base, so only the hero check's hostile mode, which makes them NaN, can catch it in CI.
 * web/test/hero.test.ts holds every call to the rule.
 */
export const OUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

export const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Bakes the planet's fields into an equirectangular texture once, at load. Layer 0: terrain height,
 * which lowlands hold CO₂ rather than water, and moisture. Layer 1: the sulfuric deck's banded
 * pattern and the pattern of water clouds.
 */
export const BAKE_FRAG = /* glsl */ `
uniform int uLayer;
// Magellan's altimetry, equalised so each grey level covers the same share of the planet; uReal
// is 0 until it loads, and the procedural terrain stands in.
uniform sampler2D uHeight;
uniform float uReal;
varying vec2 vUv;
${SIMPLEX}
void main() {
  float lon = (vUv.x - 0.5) * 6.28318530718;
  float lat = (vUv.y - 0.5) * 3.14159265359;
  vec3 p = vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
  vec3 w = p + 0.16 * vec3(snoise(p * 1.2 + 1.7), snoise(p * 1.2 + 9.2), snoise(p * 1.2 + 4.4));
  if (uLayer == 0) {
    float cont = fbm(w * 1.0 + 3.0, 7);
    float ridge = 1.0 - abs(snoise(w * 3.4 + 2.0));
    float h = 0.5 + 0.62 * cont + 0.09 * (ridge * ridge - 0.45) + 0.04 * fbm(p * 11.0, 3);
    // Real heights, with fine procedural detail below the map's 37 km pixels so shorelines wander.
    float real = 0.16 + 0.68 * texture2D(uHeight, vUv).r + 0.018 * fbm(p * 24.0, 3) + 0.01 * snoise(p * 60.0);
    h = mix(h, real, uReal);
    float basin = 0.5 + 0.7 * fbm(p * 0.85 + 21.0, 3);
    float moist = 0.5 + 0.75 * fbm(w * 2.4 + 31.0, 4);
    gl_FragColor = vec4(h, basin, moist, 1.0);
  } else {
    vec3 q = vec3(p.x, p.y * 3.6, p.z);
    vec3 wq = q + 0.5 * vec3(snoise(q * 1.1 + 5.0), snoise(q * 1.1 + 8.0), snoise(q * 1.1 + 2.0));
    float deck = 0.5 + 0.65 * fbm(wq * 1.7 + 41.0, 6);
    vec3 r = p + 0.3 * vec3(snoise(p * 1.5 + 11.0), snoise(p * 1.5 + 13.0), snoise(p * 1.5 + 19.0));
    float water = 0.5 + 0.75 * fbm(r * 1.8 + 51.0, 7);
    gl_FragColor = vec4(deck, water, 0.0, 1.0);
  }
}
`;

/** Vertex shader for the planet and its cloud shell: object-space normal for the texture. */
export const SPHERE_VERT = /* glsl */ `
varying vec3 vObj;
varying vec3 vPosW;
void main() {
  vObj = position;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPosW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const PLANET_FRAG = /* glsl */ `
uniform sampler2D uTerrain;
uniform mat3 uRot;
uniform vec3 uSunDir;
uniform vec3 uCamPos;
uniform float uSun;
uniform float uHeat;
uniform float uCO2Level;
uniform float uCO2Line;
uniform float uWaterLine;
uniform float uDryIce;
uniform float uSealed;
uniform float uWaterIce;
uniform float uOcean;
uniform float uLife;
uniform float uForges;
uniform float uLanterns;
uniform float uTime;
uniform vec3 cForge;
uniform vec3 cRockLow;
uniform vec3 cRockHigh;
uniform vec3 cCO2;
uniform vec3 cDryIce;
uniform vec3 cSealed;
uniform vec3 cDeep;
uniform vec3 cShallow;
uniform vec3 cWaterIce;
uniform vec3 cLife;
uniform vec3 cLifeDry;
uniform vec3 cBloom;
uniform vec3 cGlowLow;
uniform vec3 cGlowHigh;
varying vec3 vObj;
varying vec3 vPosW;
${UV}
// Distance to the nearest seam between cells of a 3D cell pattern: the sealed lids' joints.
vec3 cellHash(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453);
}
float seam(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int x = -1; x <= 1; x++)
    for (int y = -1; y <= 1; y++)
      for (int z = -1; z <= 1; z++) {
        vec3 g = vec3(float(x), float(y), float(z));
        vec3 r = g + cellHash(i + g) - f;
        float d = dot(r, r);
        if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
      }
  return sqrt(max(f2, 0.0)) - sqrt(max(f1, 0.0));
}
void main() {
  vec3 n = normalize(vObj);
  vec2 uv = uvOf(n);
  vec4 t = texture2D(uTerrain, uv);
  float h = t.r;
  float e = 1.0 / 1024.0;
  float hx = texture2D(uTerrain, uv + vec2(e, 0.0)).r - texture2D(uTerrain, uv - vec2(e, 0.0)).r;
  float hy = texture2D(uTerrain, uv + vec2(0.0, e * 2.0)).r - texture2D(uTerrain, uv - vec2(0.0, e * 2.0)).r;
  vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-5));
  vec3 north = cross(n, east);
  vec3 bumped = normalize(n - (hx / max(0.15, length(n.xz)) * east + hy * north) * 5.0);

  float lat = abs(n.y);
  // The CO2 basins: wide mid- and high-latitude lowlands, since the frozen air far outweighs the seas.
  float co2Basin = smoothstep(0.46, 0.56, t.g) * smoothstep(0.28, 0.52, lat);
  float waterBasin = 1.0 - co2Basin;

  vec3 col = mix(cRockLow, cRockHigh, smoothstep(0.4, 0.78, h)) * (0.8 + 0.4 * t.b);
  // One screen pixel, in units of the planet's radius. Taken here, outside the branches below:
  // derivatives inside a branch that differs from pixel to pixel are undefined.
  float px = max(length(fwidth(n)), 1e-6);

  // The shorelines are heights read from this terrain, so the seas cover the share the model gives.
  float co2Sea = co2Basin * smoothstep(0.012, -0.012, h - uCO2Line) * step(0.001, uCO2Level);
  // Liquid CO2, then dry ice, then the sealed lids: pale plates with dark joints between cells.
  vec3 co2Col = mix(cCO2, cDryIce, uDryIce);
  if (uSealed > 0.0 && co2Sea > 0.0) {
    // Joints only where a lid spans enough pixels to show them; finer, they alias into grain.
    float joint = (1.0 - smoothstep(0.01, 0.06, seam(n * 22.0))) * smoothstep(6.0, 14.0, 1.0 / (22.0 * px));
    co2Col = mix(co2Col, cSealed * (1.0 - 0.3 * joint), uSealed);
  }

  // Ice and liquid water are the same water: the seas only ever rise as the ice melts.
  float wet = uOcean + uWaterIce;
  float waterLine = uWaterLine;
  float water = waterBasin * smoothstep(0.012, -0.012, h - waterLine) * step(0.001, wet);
  float depth = clamp((waterLine - h) / 0.14, 0.0, 1.0);
  float frozen = uWaterIce / max(wet, 1e-3);
  vec3 waterCol = mix(mix(cShallow, cDeep, depth), cWaterIce, frozen);
  // Genesis: blooms tint the sunlit shallows first.
  waterCol = mix(waterCol, cBloom, uLife * 0.45 * (1.0 - depth) * (1.0 - frozen));

  // Genesis greens the shores, the moist lowlands and the black loam spread on the lids.
  float shore = smoothstep(waterLine + 0.07, waterLine + 0.005, h) * step(0.001, wet);
  float lush = smoothstep(0.36, 0.62, t.b) * smoothstep(0.82, 0.52, h);
  float land = max(lush, shore) * (1.0 - water) * (1.0 - co2Sea);
  float green = uLife * clamp(land + co2Sea * uSealed * 0.85, 0.0, 1.0);
  col = mix(col, co2Col, co2Sea);
  col = mix(col, mix(cLifeDry, cLife, smoothstep(0.45, 0.75, max(t.b, shore))), green * 0.92);
  col = mix(col, waterCol, water);

  float liquid = water * (1.0 - frozen) + co2Sea * (1.0 - uDryIce);
  vec3 N = normalize(uRot * mix(bumped, n, max(liquid, max(co2Sea, water) * 0.7)));
  vec3 G = normalize(uRot * n);
  vec3 V = normalize(uCamPos - vPosW);
  vec3 L = uSunDir;
  float wrap = smoothstep(-0.12, 0.3, dot(G, L));
  float diff = max(dot(N, L), 0.0);
  vec3 lit = col * (0.008 + diff * wrap * uSun * 1.6);
  vec3 H = normalize(L + V);
  lit += pow(max(dot(G, H), 0.0), 120.0) * liquid * uSun * vec3(0.5, 0.47, 0.4);

  // The Lanterns' mirrors behind Venus light its night side in matching pulses.
  float night = 1.0 - smoothstep(-0.15, 0.1, dot(G, L));
  lit += col * night * uLanterns * 0.05 * (0.75 + 0.25 * sin(uTime * 0.9));
  // The Graphite Forges: rafts of molten-salt glow on the CO2 seas or the dry ice (drawn, not
  // counted). Each spot is at least a pixel and a half across, its light spread to match, so from far
  // away they are a warm haze of points rather than flickering specks; they show most at night.
  if (uForges > 0.0 && co2Sea > 0.0) {
    vec3 cell = floor(n * 34.0);
    vec3 jit = cellHash(cell);
    float raft = step(0.86, jit.x);
    vec3 c = (cell + 0.2 + 0.6 * jit) / 34.0;
    float r = max(0.0045, 1.5 * px);
    float spot = 1.0 - smoothstep(0.0, r, length(normalize(c) - n));
    float spread = (0.0045 * 0.0045) / (r * r);
    lit += cForge * spot * spot * spread * raft * uForges * co2Sea * (0.3 + 0.7 * night);
  }
  float glow = pow(max(uHeat, 0.0), 1.7) * (0.45 + 0.55 * smoothstep(0.62, 0.3, h));
  lit += mix(cGlowLow, cGlowHigh, uHeat) * glow * 0.55;
  gl_FragColor = vec4(lit, 1.0);
  ${OUT}
}
`;

export const CLOUD_FRAG = /* glsl */ `
uniform sampler2D uClouds;
uniform mat3 uRot;
uniform vec3 uSunDir;
uniform vec3 uCamPos;
uniform float uTime;
uniform float uSun;
uniform float uHeat;
uniform float uDeck;
uniform float uWater;
uniform float uAir;
uniform float uSky;
uniform vec3 cDeckA;
uniform vec3 cDeckB;
uniform vec3 cDeckBand;
uniform vec3 cCloud;
uniform vec3 cRimVenus;
uniform vec3 cRimEarth;
uniform vec3 cNight;
varying vec3 vObj;
varying vec3 vPosW;
${UV}
void main() {
  vec3 n = normalize(vObj);
  float lat = asin(clamp(n.y, -1.0, 1.0));
  vec2 uv = uvOf(n);
  // Venus's clouds race round the planet, fastest at the equator.
  float flow = uTime * (0.004 + 0.009 * cos(lat));
  vec4 a = texture2D(uClouds, uv + vec2(flow, 0.0));
  vec4 b = texture2D(uClouds, uv + vec2(flow * 1.6 + 0.37, 0.0));
  float deckN = a.r * 0.6 + b.r * 0.4;
  float bands = 0.5 + 0.5 * sin(lat * 10.0 + deckN * 6.0);
  vec3 deck = mix(cDeckA, cDeckB, smoothstep(0.25, 0.75, deckN));
  deck = mix(deck, cDeckBand, bands * 0.35 * smoothstep(0.05, 0.6, abs(n.y)));
  float deckA = uDeck * (0.9 + 0.1 * deckN);
  // Water clouds the way Earth's lie: a belt along the equator where the trade winds meet, storm
  // tracks in the middle latitudes, and clear subtropics between. A finer layer, stretched east to
  // west by the winds, frays their edges into streaks.
  float fine = texture2D(uClouds, vec2(uv.x * 3.0 + flow * 2.2 + 0.61, uv.y)).g;
  float wn = a.g * 0.5 + b.g * 0.3 + fine * 0.2;
  float alat = abs(lat);
  float belts = 0.62 + 0.3 * exp(-lat * lat / 0.02) + 0.22 * exp(-(alat - 0.95) * (alat - 0.95) / 0.06)
    - 0.3 * exp(-(alat - 0.47) * (alat - 0.47) / 0.025);
  float cover = wn * belts;
  float waterA = uWater * smoothstep(0.36, 0.62, cover) * (0.55 + 0.4 * smoothstep(0.5, 0.75, cover));
  // Water clouds lie over the deck: while the new water rains out they swirl white through it.
  float alpha = clamp(deckA + waterA * (1.0 - deckA), 0.0, 1.0);
  vec3 c = (cCloud * waterA + deck * deckA * (1.0 - waterA)) / max(alpha, 1e-3);

  vec3 N = normalize(uRot * n);
  vec3 V = normalize(uCamPos - vPosW);
  float d = dot(N, uSunDir);
  float light = smoothstep(-0.2, 0.55, d) * uSun;
  vec3 col = c * (0.006 + light * 1.0);
  // The hot surface glows dull red through the deck where sunlight does not drown it.
  float dark = 1.0 - smoothstep(-0.25, 0.3, d) * clamp(uSun * 2.5, 0.0, 1.0);
  col += cNight * pow(max(uHeat, 0.0), 1.4) * uDeck * dark * (0.55 + 0.45 * deckN);

  float fres = pow(clamp(1.0 - dot(N, V), 0.0, 1.0), 2.6);
  vec3 rim = mix(cRimVenus, cRimEarth, uSky);
  float haze = fres * (0.2 + 0.6 * uAir);
  col += rim * (0.02 + light * 1.1) * haze;
  alpha = max(alpha, haze * smoothstep(-0.35, 0.25, d));
  gl_FragColor = vec4(col, alpha);
  ${OUT}
}
`;

/** The air's glow beyond the limb: a back-faced shell, added to what is behind it. */
export const ATMO_VERT = /* glsl */ `
varying vec3 vPosW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPosW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

/**
 * Brightest just above the limb, fading to nothing at the shell's edge: the glow depends on how
 * close the line of sight passes to the planet's centre. Works for any planet: uCenter and
 * uRadius place it, uShell is the shell's radius.
 */
export const ATMO_FRAG = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uCamPos;
uniform vec3 uCenter;
uniform float uRadius;
uniform float uShell;
uniform float uSun;
uniform float uAir;
uniform float uSky;
uniform float uExhaust;
uniform vec3 cRimVenus;
uniform vec3 cRimEarth;
uniform vec3 cExhaust;
varying vec3 vPosW;
void main() {
  vec3 dir = normalize(vPosW - uCamPos);
  float b = length(cross(dir, uCenter - uCamPos));
  float x = clamp((uShell - b) / max(uShell - uRadius, 1e-4), 0.0, 1.0);
  float i = x * x * x;
  float day = smoothstep(-0.45, 0.5, dot(normalize(vPosW - uCenter), uSunDir));
  vec3 col = mix(cRimVenus, cRimEarth, uSky) * i * (0.04 + day * 1.3 * max(uSun, 0.2)) * (0.35 + 0.85 * uAir);
  col += cExhaust * uExhaust * x * x;
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}
`;

/** A flat shape's texture coordinates, for the Veil's disc. */
export const FLAT_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** Beams and cones made of tubes: aV runs 0 to 1 along each one, aSeed varies them. */
export const TUBE_VERT = /* glsl */ `
attribute float aV;
attribute float aSeed;
varying float vV;
varying float vSeed;
void main() {
  vV = aV;
  vSeed = aSeed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Photonic Exhaust: each canopy is a point of infrared light on the cloud tops, gently flickering.
 * The tiles shine only while the Lattice's light reaches them, so only the side of Venus facing the
 * Lattice (uLitDir) glows; the canopies turn into it and out of it as the planet spins.
 */
export const CANOPY_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixel;
uniform float uOn;
uniform vec3 uLitDir;
attribute float aSeed;
varying float vAlpha;
void main() {
  vec3 up = normalize(mat3(modelMatrix) * position);
  float lit = smoothstep(-0.02, 0.25, dot(up, uLitDir));
  vAlpha = uOn * lit * (0.65 + 0.35 * sin(uTime * (1.1 + aSeed * 1.9) + aSeed * 40.0));
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uPixel * (3.2 + 2.6 * aSeed) * (8.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

/** Helios beams: pulses travel from the Lattice down to the Exhaust's tiles on the lit side. */
export const BEAM_FRAG = /* glsl */ `
uniform float uTime;
uniform float uOn;
uniform vec3 cBeam;
varying float vV;
varying float vSeed;
void main() {
  float pulse = pow(max(0.5 + 0.5 * sin((vV * 9.0 - uTime * 1.6 + vSeed * 6.0) * 6.28318), 0.0), 6.0);
  // Fades in far from Venus and lands at full strength on the cloud tops.
  float fade = smoothstep(0.0, 0.35, vV);
  vec3 col = cBeam * (0.25 + 1.6 * pulse) * fade * uOn;
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}
`;

/**
 * Ice Bricks on their way in: each follows a curve from deep space, steered down onto its own spot
 * in a polar drop zone (aEnd, on the cloud tops), where it bursts in a brief flash of heat. Bricks
 * show only between the stream's tail and its front, and flash only once the front has arrived and
 * until the tail has.
 */
export const BRICK_VERT = /* glsl */ `
uniform float uTime;
uniform float uFront;
uniform float uTail;
uniform float uPixel;
uniform vec3 uP0[2];
uniform vec3 uP1[2];
attribute float aOffset;
attribute float aSide;
attribute vec3 aJitter;
attribute vec3 aEnd;
varying float vAlpha;
varying float vFlash;
vec3 bezier(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
  float s = 1.0 - t;
  return s * s * s * a + 3.0 * s * s * t * b + 3.0 * s * t * t * c + t * t * t * d;
}
void main() {
  int k = aSide > 0.5 ? 1 : 0;
  float u = fract(aOffset + uTime * 0.045);
  vec3 pos;
  float size;
  float along = u / 0.9;
  if (u < 0.9) {
    // The last leg comes down from above the drop point, along the local vertical. Each Brick
    // has its own approach, spread across a cone that narrows onto the poles, so they read as a
    // rain of separate bodies, not one beam.
    vec3 spread = aJitter * vec3(7.0, 9.0, 4.0);
    pos = bezier(uP0[k] + spread, uP1[k] + spread * 0.35, aEnd * 2.1, aEnd, along);
    vAlpha = 0.55 * smoothstep(0.0, 0.3, along) * step(along, uFront) * step(uTail, along);
    vFlash = 0.0;
    size = 1.1 + 2.2 * aJitter.x * aJitter.x;
  } else {
    float s = (u - 0.9) / 0.1;
    float burst = (1.0 - s) * (1.0 - s);
    pos = aEnd;
    vAlpha = burst * step(1.0, uFront) * step(uTail, 0.999);
    vFlash = 1.0;
    size = 4.0 + 24.0 * sqrt(max(s, 0.0)) * (1.0 - s);
  }
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uPixel * size * clamp(16.0 / -mv.z, 0.3, 3.0);
  gl_Position = projectionMatrix * mv;
}
`;

/** A Brick in flight is icy blue; bursting in the air, a flash of heat. */
export const BRICK_FRAG = /* glsl */ `
uniform vec3 cPoint;
uniform vec3 cFlash;
uniform float uOn;
varying float vAlpha;
varying float vFlash;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q) * 2.0;
  if (r > 1.0) discard;
  float core = pow(max(1.0 - r, 0.0), 2.2);
  gl_FragColor = vec4(mix(cPoint, cFlash, vFlash) * core * vAlpha * uOn, 1.0);
  ${OUT}
}
`;

export const POINT_FRAG = /* glsl */ `
uniform vec3 cPoint;
uniform float uOn;
varying float vAlpha;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q) * 2.0;
  if (r > 1.0) discard;
  float core = pow(max(1.0 - r, 0.0), 2.2);
  gl_FragColor = vec4(cPoint * core * vAlpha * uOn, 1.0);
  ${OUT}
}
`;

export const STAR_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixel;
attribute float aSize;
attribute float aSeed;
varying float vAlpha;
void main() {
  vAlpha = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 50.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPixel;
  gl_Position = projectionMatrix * mv;
}
`;

export const STAR_FRAG = /* glsl */ `
uniform vec3 cPoint;
uniform float uOn;
varying float vAlpha;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q) * 2.0;
  if (r > 1.0) discard;
  gl_FragColor = vec4(cPoint * pow(max(1.0 - r, 0.0), 1.6) * vAlpha * uOn, 1.0);
  ${OUT}
}
`;

/**
 * The Hesperus Veil: a disc of slats facing the Sun. Rows appear from the centre out as it is
 * built; closed it is a dark film with sunlight blazing round its rim; open, the slats turn and
 * shimmer.
 */
export const VEIL_FRAG = /* glsl */ `
uniform float uBuilt;
uniform float uOpen;
uniform float uTime;
uniform vec3 cRim;
uniform vec3 cFilm;
uniform vec3 cSlat;
varying vec2 vUv;
void main() {
  vec2 q = vUv - 0.5;
  float r = length(q) * 2.0;
  if (r > 1.0) discard;
  float row = abs(q.y) * 2.0;
  if (row > uBuilt) discard;
  float slats = 0.5 + 0.5 * cos(vUv.y * 140.0);
  float edge = smoothstep(0.86, 1.0, r);
  float shimmer = 0.5 + 0.5 * sin(vUv.y * 70.0 + uTime * 1.5);
  vec3 col = cFilm + cSlat * slats * (0.08 + uOpen * (0.5 + 0.8 * shimmer));
  col += cRim * edge * (1.2 - 0.6 * uOpen);
  float a = mix(0.93, 0.42, uOpen);
  a = max(a, edge);
  gl_FragColor = vec4(col * a, a);
  ${OUT}
}
`;

/** The Aegis Shield's field: a faint bubble with slow ripples of solar wind turned aside. */
export const AEGIS_VERT = /* glsl */ `
varying vec3 vNormalV;
varying vec3 vLocal;
void main() {
  vNormalV = normalize(normalMatrix * normal);
  vLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const AEGIS_FRAG = /* glsl */ `
uniform float uOn;
uniform float uTime;
uniform vec3 cField;
varying vec3 vNormalV;
varying vec3 vLocal;
void main() {
  float fres = pow(clamp(1.0 - abs(normalize(vNormalV).z), 0.0, 1.0), 2.4);
  float ripple = 0.55 + 0.45 * sin(vLocal.z * 14.0 - uTime * 2.2);
  vec3 col = cField * fres * ripple * uOn * 0.55;
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}
`;
