/**
 * The home page's animated Venus, in three.js. It draws what stage.ts says the plan has done by a
 * given day, and keeps no state of its own about the plan. Loaded on demand, so the page's text
 * renders and reads before any of this arrives.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  AEGIS_FRAG,
  AEGIS_VERT,
  ATMO_FRAG,
  ATMO_VERT,
  BAKE_FRAG,
  BEAM_FRAG,
  BRICK_FRAG,
  BRICK_VERT,
  CANOPY_VERT,
  CLOUD_FRAG,
  FLAT_VERT,
  PLANET_FRAG,
  POINT_FRAG,
  QUAD_VERT,
  SPHERE_VERT,
  STAR_FRAG,
  STAR_VERT,
  TUBE_VERT,
  VEIL_FRAG,
} from "./shaders";
import { type Stage, stageAt } from "./stage";
import { makeTimeline } from "./timeline";
import type { HeroData } from "./types";

export interface SceneOptions {
  /** Called with the day shown, every frame drawn. */
  onDay: (day: number) => void;
  /** Called when the browser takes the GPU away; the page falls back to its still picture. */
  onLost: () => void;
  /** Called when playback reaches the deadline. The finished planet keeps turning. */
  onEnd: () => void;
  autoplay: boolean;
  startDay: number;
}

export interface SceneController {
  play(): void;
  pause(): void;
  setDay(day: number): void;
  setVisible(visible: boolean): void;
  layout(): void;
  dispose(): void;
}

/** Sunlight comes from the upper left and in front, so most of the near side is lit. */
const SUN_DIR = new THREE.Vector3(-0.7, 0.45, 0.55).normalize();
/**
 * The Helios Lattice orbits near Mercury, so its beams reach Venus from wherever the Lattice is,
 * not from the Sun's direction, and only the side of Venus facing it can be pumped. Drawn arriving
 * steeply from the upper left, behind Venus, so on a wide screen they pass right of the headline
 * rather than through it.
 */
const BEAM_DIR = new THREE.Vector3(-0.5, 0.8, -0.3).normalize();
/** Radius of the cloud tops, where the canopies float, the beams land and the Bricks burst. */
const CLOUD_TOPS = 1.018;
/**
 * Where the Veil and Aegis sit: sunward and in front of Venus, raised 17 degrees above the Sun line
 * and drawn at 3/4 size so that on a wide screen they fit between the headline and the planet,
 * not behind the headline's letters. Not to scale: the real Veil is 1.1 million km out.
 */
const VEIL_POS = new THREE.Vector3(-0.93, 1.11, 0.68);
const VEIL_SCALE = 0.75;
const CAMERA_ELEVATION = 0.23;
const FOV = 24;
const BACKGROUND = "#090a12";

const linear = (hex: string, gain = 1) => new THREE.Color(hex).multiplyScalar(gain);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The height a sea must reach to cover a given share of Venus, for the CO₂ basins and for the
 * water's, read once from the baked terrain with the planet shader's own basin masks. So the drawn
 * seas cover what the model says: the cryo-continents a third of the planet, the new water under
 * a hundredth of it. Undefined if the terrain cannot be read back.
 */
type Shoreline = (share: number) => number;
function shorelines(
  renderer: THREE.WebGLRenderer,
  target: THREE.WebGLRenderTarget,
): { co2: Shoreline; water: Shoreline } | undefined {
  const { width, height } = target;
  const buf = new Uint16Array(width * height * 4);
  renderer.readRenderTargetPixels(target, 0, 0, width, height, buf);
  const half = THREE.DataUtils.fromHalfFloat;
  const co2: [number, number][] = [];
  const water: [number, number][] = [];
  let total = 0;
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  for (let y = 0; y < height; y += 2) {
    const lat = ((y + 0.5) / height - 0.5) * Math.PI;
    const area = Math.cos(lat);
    const polar = smooth(0.28, 0.52, Math.abs(Math.sin(lat)));
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const h = half(buf[i] as number);
      const m = smooth(0.46, 0.56, half(buf[i + 1] as number)) * polar;
      co2.push([h, area * m]);
      water.push([h, area * (1 - m)]);
      total += area;
      lo = Math.min(lo, h);
      hi = Math.max(hi, h);
    }
  }
  if (!(hi > lo)) return undefined;
  const curve = (pts: [number, number][]): Shoreline => {
    pts.sort((a, b) => a[0] - b[0]);
    const hs = new Float64Array(pts.length);
    const cum = new Float64Array(pts.length);
    let c = 0;
    pts.forEach(([h, w], k) => {
      c += w / total;
      hs[k] = h;
      cum[k] = c;
    });
    return (share) => {
      if (share <= 0) return lo - 1;
      if (share >= c) return hi + 1;
      let a = 0;
      let b = pts.length - 1;
      while (b - a > 1) {
        const mid = (a + b) >> 1;
        if ((cum[mid] as number) < share) a = mid;
        else b = mid;
      }
      return hs[b] as number;
    };
  };
  return { co2: curve(co2), water: curve(water) };
}
const u = <T>(value: T) => ({ value });

export function createScene(
  canvas: HTMLCanvasElement,
  frame: HTMLElement,
  planetBox: HTMLElement,
  data: HeroData,
  opts: SceneOptions,
): SceneController {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(BACKGROUND);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  // --- The planet's fields, baked once ---------------------------------------------------------
  const bake = (layer: number, read?: (t: THREE.WebGLRenderTarget) => void) => {
    const target = keep(
      new THREE.WebGLRenderTarget(1024, 512, {
        type: THREE.HalfFloatType,
        depthBuffer: false,
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
      }),
    );
    const material = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: BAKE_FRAG,
      uniforms: { uLayer: u(layer) },
      depthTest: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    const bakeScene = new THREE.Scene();
    bakeScene.add(quad);
    renderer.setRenderTarget(target);
    renderer.render(bakeScene, new THREE.Camera());
    renderer.setRenderTarget(null);
    read?.(target);
    material.dispose();
    quad.geometry.dispose();
    return target.texture;
  };
  let shores: ReturnType<typeof shorelines>;
  const terrain = bake(0, (t) => {
    shores = shorelines(renderer, t);
  });
  // If the terrain cannot be read back, the seas fill the lowest basins on a fixed scale instead.
  const co2Line = (level: number) =>
    shores ? shores.co2(level * data.capCover) : 0.28 + 0.24 * level;
  const waterLine = (level: number) =>
    shores ? shores.water(level * data.seaCover) : -0.2 + 0.2 * level;
  const cloudMap = bake(1);

  // --- Scene graph -----------------------------------------------------------------------------
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 400);
  const system = new THREE.Group();
  system.rotation.z = -0.16;
  scene.add(system);
  const spin = new THREE.Group();
  system.add(spin);
  system.updateMatrixWorld(true);

  const shared = {
    uSunDir: u(SUN_DIR),
    uCamPos: u(camera.position),
    uRot: u(new THREE.Matrix3()),
    uSun: u(1),
    uTime: u(0),
    uPixel: u(1),
  };

  const planet = new THREE.Mesh(
    keep(new THREE.SphereGeometry(1, 192, 96)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: PLANET_FRAG,
        uniforms: {
          uTerrain: u(terrain),
          uRot: shared.uRot,
          uSunDir: shared.uSunDir,
          uCamPos: shared.uCamPos,
          uSun: shared.uSun,
          uHeat: u(1),
          uCO2Level: u(0),
          uCO2Line: u(-2),
          uWaterLine: u(-2),
          uDryIce: u(0),
          uSealed: u(0),
          uWaterIce: u(0),
          uOcean: u(0),
          uLife: u(0),
          cRockLow: u(linear("#2b211a")),
          cRockHigh: u(linear("#74614c")),
          cCO2: u(linear("#24465e")),
          cDryIce: u(linear("#f7f9fd", 1.05)),
          cSealed: u(linear("#cfc8b8", 0.95)),
          cDeep: u(linear("#0a3768")),
          cShallow: u(linear("#1f84a3")),
          cWaterIce: u(linear("#b9d3ea", 0.62)),
          cLife: u(linear("#3b8a34")),
          cLifeDry: u(linear("#8f9147")),
          cBloom: u(linear("#2a9f86")),
          cGlowLow: u(linear("#6a1203")),
          cGlowHigh: u(linear("#ff5c18")),
        },
      }),
    ),
  );
  spin.add(planet);

  const clouds = new THREE.Mesh(
    keep(new THREE.SphereGeometry(1.014, 160, 80)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: CLOUD_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uClouds: u(cloudMap),
          uRot: shared.uRot,
          uSunDir: shared.uSunDir,
          uCamPos: shared.uCamPos,
          uTime: shared.uTime,
          uSun: shared.uSun,
          uHeat: u(1),
          uDeck: u(1),
          uWater: u(0),
          uAir: u(1),
          uSky: u(0),
          cDeckA: u(linear("#d4b479")),
          cDeckB: u(linear("#f2dfb0")),
          cDeckBand: u(linear("#b88f4c")),
          cCloud: u(linear("#f4f7fb", 0.92)),
          cRimVenus: u(linear("#ffc272")),
          cRimEarth: u(linear("#5fa9ff")),
          cNight: u(linear("#7a1a06", 0.1)),
        },
      }),
    ),
  );
  spin.add(clouds);

  const atmosphere = new THREE.Mesh(
    keep(new THREE.SphereGeometry(1.075, 96, 48)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSunDir: shared.uSunDir,
          uSun: shared.uSun,
          uCamPos: shared.uCamPos,
          uExhaust: u(0),
          cExhaust: u(linear("#ff2a3a", 0.4)),
          uAir: u(1),
          uSky: u(0),
          cRimVenus: u(linear("#ffb85c")),
          cRimEarth: u(linear("#4f9dff")),
        },
      }),
    ),
  );
  system.add(atmosphere);

  // --- Photonic Exhaust: a lattice of canopies glowing in the infrared ------------------------------
  // The canopies fill the band between the polar drop zones, and glow where the Lattice's light
  // reaches them.
  const band = Math.sin((data.dropLatitude * Math.PI) / 180);
  const exhaustUniforms = {
    uTime: shared.uTime,
    uPixel: shared.uPixel,
    uOn: u(0),
    uLitDir: u(BEAM_DIR),
    cPoint: u(linear("#ff4a4a", 1.6)),
  };
  {
    const n = 900;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pos: number[] = [];
    const seeds: number[] = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - ((i + 0.5) / n) * 2;
      if (Math.abs(y) > band) continue;
      const r = Math.sqrt(1 - y * y) * CLOUD_TOPS;
      pos.push(Math.cos(golden * i) * r, y * CLOUD_TOPS, Math.sin(golden * i) * r);
      seeds.push((i * 0.6180339) % 1);
    }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
    spin.add(
      new THREE.Points(
        g,
        keep(
          new THREE.ShaderMaterial({
            vertexShader: CANOPY_VERT,
            fragmentShader: POINT_FRAG,
            uniforms: exhaustUniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        ),
      ),
    );
  }

  // --- Helios beams, from the Lattice near the Sun to the Exhaust's tiles on the lit side ------------
  const beamUniforms = { uTime: shared.uTime, uOn: u(0), cBeam: u(linear("#ffcf73", 2.2)) };
  {
    const side = new THREE.Vector3().crossVectors(BEAM_DIR, new THREE.Vector3(0, 1, 0)).normalize();
    const lift = new THREE.Vector3().crossVectors(side, BEAM_DIR).normalize();
    // Each beam lands on canopies that face the Lattice and the camera, well inside the band
    // between the drop zones: tilted from the Lattice's direction toward the camera and the equator.
    const toCamera = new THREE.Vector3(0, Math.sin(CAMERA_ELEVATION), Math.cos(CAMERA_ELEVATION));
    const axis = new THREE.Vector3(0, 1, 0).applyQuaternion(system.quaternion);
    const beams: THREE.BufferGeometry[] = [];
    const offsets = [-0.7, -0.4, -0.1, 0.2, 0.45];
    offsets.forEach((o, i) => {
      const end = BEAM_DIR.clone()
        .addScaledVector(toCamera, 0.9)
        .addScaledVector(side, o)
        .addScaledVector(axis, -0.3)
        .normalize()
        .multiplyScalar(CLOUD_TOPS);
      const start = BEAM_DIR.clone()
        .multiplyScalar(18)
        .addScaledVector(side, (i - 2) * 0.9)
        .addScaledVector(lift, 3.5 + (i % 2) * 0.8);
      const dir = end.clone().sub(start);
      const length = dir.length();
      const g = new THREE.CylinderGeometry(0.0055, 0.0055, length, 6, 1, true);
      const pos = g.getAttribute("position");
      const v = new Float32Array(pos.count);
      for (let j = 0; j < pos.count; j++) v[j] = (pos.getY(j) + length / 2) / length;
      g.setAttribute("aV", new THREE.BufferAttribute(v, 1));
      g.setAttribute(
        "aSeed",
        new THREE.BufferAttribute(new Float32Array(pos.count).fill(i / 5), 1),
      );
      g.applyQuaternion(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
      );
      g.translate((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);
      beams.push(g);
    });
    const merged = keep(mergeGeometries(beams) as THREE.BufferGeometry);
    for (const g of beams) g.dispose();
    scene.add(
      new THREE.Mesh(
        merged,
        keep(
          new THREE.ShaderMaterial({
            vertexShader: TUBE_VERT,
            fragmentShader: BEAM_FRAG,
            uniforms: beamUniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        ),
      ),
    );
  }

  // --- The Ice Train: Bricks falling in from Ceres into the polar drop zones -------------------------
  // Two streams, one steered to each pole. Each Brick ends on its own spot beyond the drop latitude,
  // on the side facing the camera, and bursts there.
  const source = new THREE.Vector3(6.5, 2.6, -10);
  const brickUniforms = {
    uTime: shared.uTime,
    uPixel: shared.uPixel,
    uFront: u(0),
    uTail: u(0),
    uOn: u(1),
    uP0: u([source, source.clone().add(new THREE.Vector3(-0.6, -0.4, 0))]),
    uP1: u([new THREE.Vector3(3.4, 2.8, -4.6), new THREE.Vector3(3.2, -1.8, -5.4)]),
    cPoint: u(linear("#c4ecff", 2.6)),
    cFlash: u(linear("#ffd9a0", 3.4)),
  };
  {
    const n = 1100;
    const g = keep(new THREE.BufferGeometry());
    const offset = new Float32Array(n);
    const sideAttr = new Float32Array(n);
    const jitter = new Float32Array(n * 3);
    const ends = new Float32Array(n * 3);
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    // The camera's direction in the planet's frame, so the drop spots face it.
    const view = new THREE.Vector3(
      0,
      Math.sin(CAMERA_ELEVATION),
      Math.cos(CAMERA_ELEVATION),
    ).applyQuaternion(system.quaternion.clone().invert());
    const facing = Math.atan2(view.x, view.z);
    const edge = data.dropLatitude;
    for (let i = 0; i < n; i++) {
      offset[i] = rand();
      sideAttr[i] = i % 2;
      jitter[i * 3] = (rand() - 0.5) * 0.5;
      jitter[i * 3 + 1] = (rand() - 0.5) * 0.3;
      jitter[i * 3 + 2] = (rand() - 0.5) * 0.5;
      // North: anywhere in the cap beyond the edge. South: near its edge, where it can be seen.
      const north = i % 2 === 0;
      const deg = north
        ? edge + 3 + rand() * (90 - edge - 5)
        : -(edge + 2 + rand() * Math.min(12, 90 - edge - 4));
      const lat = (deg * Math.PI) / 180;
      const lon = facing + (rand() - 0.5) * (north ? 3.2 : 2.0);
      ends.set(
        [
          Math.cos(lat) * Math.sin(lon) * CLOUD_TOPS,
          Math.sin(lat) * CLOUD_TOPS,
          Math.cos(lat) * Math.cos(lon) * CLOUD_TOPS,
        ],
        i * 3,
      );
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aOffset", new THREE.BufferAttribute(offset, 1));
    g.setAttribute("aSide", new THREE.BufferAttribute(sideAttr, 1));
    g.setAttribute("aJitter", new THREE.BufferAttribute(jitter, 3));
    g.setAttribute("aEnd", new THREE.BufferAttribute(ends, 3));
    const points = new THREE.Points(
      g,
      keep(
        new THREE.ShaderMaterial({
          vertexShader: BRICK_VERT,
          fragmentShader: BRICK_FRAG,
          uniforms: brickUniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    points.frustumCulled = false;
    system.add(points);
  }

  // --- The Hesperus Veil and the Aegis Shield, toward the Sun ----------------------------------------
  const veilUniforms = {
    uBuilt: u(0),
    uOpen: u(0),
    uTime: shared.uTime,
    cRim: u(linear("#ffcf7a", 2.6)),
    cFilm: u(linear("#07080e")),
    cSlat: u(linear("#ffd892", 1.2)),
  };
  const veil = new THREE.Mesh(
    keep(new THREE.CircleGeometry(0.4, 128)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: FLAT_VERT,
        fragmentShader: VEIL_FRAG,
        uniforms: veilUniforms,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    ),
  );
  veil.position.copy(VEIL_POS);
  veil.scale.setScalar(VEIL_SCALE);
  veil.lookAt(SUN_DIR.clone().multiplyScalar(100));
  scene.add(veil);

  const aegisUniforms = { uOn: u(0), uTime: shared.uTime, cField: u(linear("#6fd3ff", 0.3)) };
  const aegis = new THREE.Mesh(
    keep(new THREE.SphereGeometry(0.52, 64, 32)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: AEGIS_VERT,
        fragmentShader: AEGIS_FRAG,
        uniforms: aegisUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  aegis.position.copy(VEIL_POS);
  aegis.scale.setScalar(VEIL_SCALE);
  aegis.lookAt(SUN_DIR.clone().multiplyScalar(100));
  scene.add(aegis);

  // --- Stars ------------------------------------------------------------------------------------------
  const starUniforms = {
    uTime: shared.uTime,
    uPixel: shared.uPixel,
    uOn: u(1),
    cPoint: u(linear("#fff4e2", 1.1)),
  };
  {
    const n = 2200;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const seedAttr = new Float32Array(n);
    let seed = 11;
    const rand = () => {
      seed = (seed * 48271) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < n; i++) {
      const z = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - z * z);
      pos.set([Math.cos(t) * r * 120, z * 120, Math.sin(t) * r * 120], i * 3);
      size[i] = 0.7 + rand() ** 3 * 2.4;
      seedAttr[i] = rand();
    }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seedAttr, 1));
    scene.add(
      new THREE.Points(
        g,
        keep(
          new THREE.ShaderMaterial({
            vertexShader: STAR_VERT,
            fragmentShader: STAR_FRAG,
            uniforms: starUniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        ),
      ),
    );
  }

  // --- Post-processing: bloom makes the beams, the tiles and the bursting Bricks glow ----------------
  const target = keep(new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  disposables.push(composer, bloom);

  // --- Layout: put the planet where the page's planet box is -----------------------------------------
  let width = 0;
  let height = 0;
  /** Lowered while frames run slow, so a weak GPU drops resolution rather than smoothness. */
  let dprCap = 2;
  function resize() {
    const rect = frame.getBoundingClientRect();
    const box = planetBox.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, width < 800 ? 1.5 : 1.75, dprCap);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(dpr);
    composer.setSize(width, height);
    shared.uPixel.value = dpr;
    canvas.dataset.dpr = String(dpr);
    const cx = box.left + box.width / 2 - rect.left;
    const cy = box.top + box.height / 2 - rect.top;
    // Leave room round the planet for the glow of the air and the Bricks' last leg.
    const radius = Math.max(40, Math.min(box.width, box.height) / 2 / 1.22);
    const tanHalf = Math.tan(((FOV / 2) * Math.PI) / 180);
    const distance = Math.sqrt(1 + (height / 2 / (radius * tanHalf)) ** 2);
    camera.aspect = width / height;
    camera.position.set(
      0,
      Math.sin(CAMERA_ELEVATION) * distance,
      Math.cos(CAMERA_ELEVATION) * distance,
    );
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(width, height, width / 2 - cx, height / 2 - cy, width, height);
    camera.updateProjectionMatrix();
  }
  function layout() {
    resize();
    request();
  }

  // --- Drawing a day -----------------------------------------------------------------------------------
  const set = (m: THREE.ShaderMaterial, values: Record<string, number>) => {
    for (const [name, v] of Object.entries(values)) {
      const uniform = m.uniforms[name];
      if (uniform) uniform.value = v;
    }
  };
  function apply(s: Stage, seconds: number) {
    shared.uTime.value = seconds;
    shared.uSun.value = s.sun;
    spin.rotation.y = -seconds * 0.03;
    spin.updateMatrixWorld(true);
    shared.uRot.value.setFromMatrix4(spin.matrixWorld);
    set(planet.material, {
      uHeat: s.heat,
      uCO2Level: s.co2Level,
      uCO2Line: co2Line(s.co2Level),
      uWaterLine: waterLine(Math.min(1, s.ocean + s.waterIce)),
      uDryIce: s.dryIce,
      uSealed: s.sealed,
      uWaterIce: s.waterIce,
      uOcean: s.ocean,
      uLife: s.life,
    });
    set(clouds.material, {
      uHeat: s.heat,
      uDeck: s.deck,
      uWater: s.waterClouds,
      uAir: s.air,
      uSky: s.sky,
    });
    set(atmosphere.material, { uAir: s.air, uSky: s.sky, uExhaust: s.exhaust });
    exhaustUniforms.uOn.value = s.exhaust;
    beamUniforms.uOn.value = s.beams;
    brickUniforms.uFront.value = s.iceFront;
    brickUniforms.uTail.value = s.iceTail;
    veilUniforms.uBuilt.value = s.veil;
    veilUniforms.uOpen.value = s.veilOpen;
    veil.visible = s.veil > 0;
    aegisUniforms.uOn.value = s.aegis;
    aegis.visible = s.aegis > 0;
    // Stars come out while the Veil keeps Venus dark.
    starUniforms.uOn.value = 0.75 + 0.35 * (1 - s.sun);
  }

  // --- The clock -------------------------------------------------------------------------------------
  const timeline = makeTimeline(
    data.events.map((e) => e.day),
    data.start,
    data.end,
  );
  let playing = opts.autoplay;
  /** The story reached the deadline by playing: the finished planet keeps turning. */
  let resting = false;
  let visible = true;
  let day = opts.startDay;
  let clock = timeline.secondsAt(day);
  let motion = 0;
  let raf = 0;
  let last = 0;
  let frameTime = 1 / 60;
  let sinceResize = 0;

  /** Below about 30 frames a second, step the resolution down (to half density at worst). */
  function adapt(dt: number) {
    if (!dt) return;
    frameTime += (dt - frameTime) * 0.08;
    sinceResize++;
    const dpr = renderer.getPixelRatio();
    if (frameTime > 1 / 30 && sinceResize > 45 && dpr > 0.5) {
      dprCap = Math.max(0.5, dpr - 0.25);
      sinceResize = 0;
      frameTime = 1 / 40;
      // Inside a frame: resize only, the loop already asks for the next one.
      resize();
    }
  }

  function draw(now: number) {
    raf = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    if (playing) {
      clock += dt;
      day = timeline.dayAt(clock);
      if (clock >= timeline.duration) {
        day = data.end;
        playing = false;
        resting = true;
        opts.onEnd();
      }
    }
    if (playing || resting) {
      motion += dt;
      adapt(dt);
    }
    apply(stageAt(day, data), motion);
    composer.render();
    opts.onDay(day);
    if ((playing || resting) && visible) raf = requestAnimationFrame(draw);
  }
  function request() {
    if (!raf && visible) {
      last = 0;
      raf = requestAnimationFrame(draw);
    }
  }

  const onLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    opts.onLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  layout();

  return {
    play() {
      // Play from the last day tells the story again from the start.
      if (day >= data.end - 0.5) day = data.start;
      clock = timeline.secondsAt(day);
      playing = true;
      resting = false;
      request();
    },
    pause() {
      playing = false;
      resting = false;
    },
    setDay(d: number) {
      resting = false;
      day = Math.min(data.end, Math.max(data.start, d));
      clock = timeline.secondsAt(day);
      request();
    },
    setVisible(v: boolean) {
      visible = v;
      if (v) request();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    layout,
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      canvas.removeEventListener("webglcontextlost", onLost);
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}
