/**
 * Everything the journey draws, built once, and how each piece answers the stage on a day. The
 * scene's units and frame are orbits.ts's: the Sun at the origin, the ecliptic in the x–z plane.
 * Each world carries its own group, placed where the model puts it on the day shown; hardware that
 * belongs to a world (the Veil and Venus's canopies, the Crown round Ceres, the works on Mercury)
 * rides in that world's sun-facing frame, so "sunward" stays sunward as it orbits.
 */
import type { World } from "@phosphoros/calc";
import * as THREE from "three";
import type { Pose } from "./director.ts";
import {
  BODY_VERT,
  CANOPY_FRAG,
  DOT_VERT,
  EARTH_FRAG,
  FIN_FRAG,
  GLOW_FRAG,
  GLOW_VERT,
  LINE_FRAG,
  LINE_VERT,
  PETAL_VERT,
  ROCKY_FRAG,
  SKY_FRAG,
  SPARK_FRAG,
  SUN_FRAG,
  TRANSIT_VERT,
} from "./glsl.ts";
import {
  transfer as crossing,
  out,
  POWER,
  placer,
  RAD,
  RADIUS,
  SCALE,
  type Vec3,
} from "./orbits.ts";
import { dayOf, type Stage } from "./stage.ts";
import type { JourneyData } from "./types.ts";
import {
  AEGIS_FRAG,
  AEGIS_VERT,
  ATMO_FRAG,
  ATMO_VERT,
  BAKE_FRAG,
  BRICK_FRAG,
  BRICK_VERT,
  CLOUD_FRAG,
  FLAT_VERT,
  PLANET_FRAG,
  QUAD_VERT,
  SPHERE_VERT,
  VEIL_FRAG,
} from "./venus-glsl.ts";

const u = <T>(value: T) => ({ value });
const linear = (hex: string, gain = 1) => new THREE.Color(hex).multiplyScalar(gain);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Where the maps live; each is optional, and the world is drawn procedurally until it loads. */
const MAPS = {
  stars: "/journey/stars.jpg",
  earthDay: "/journey/earth-day.jpg",
  earthNight: "/journey/earth-night.jpg",
  earthClouds: "/journey/earth-clouds.jpg",
  moon: "/journey/moon.jpg",
  mercury: "/journey/mercury.jpg",
  ceres: "/journey/ceres.jpg",
  venusHeight: "/journey/venus-height.png",
} as const;

/** A world label's anchor, for the engine to place on screen in wide shots. */
export interface Anchor {
  id: World | "sun";
  name: string;
  position: THREE.Vector3;
  radius: number;
}

export interface WorldScene {
  scene: THREE.Scene;
  anchors: Anchor[];
  /** Draws a day: stage values, places, and the camera's pose (for what fades with distance). */
  apply(
    day: number,
    seconds: number,
    stage: Stage,
    pose: Pose,
    camera: THREE.Camera,
    pixel: number,
  ): void;
  dispose(): void;
}

/** A seeded random number generator, so the scene is the same on every load. */
function random(seed: number) {
  let s = seed;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

/**
 * The maps, loaded once and shared by every world built on one renderer: the Explorer rebuilds the
 * world for each variant and must not fetch, decode and upload eight images each time. A world's
 * dispose() leaves them; the cache's own dispose() frees them.
 */
export interface MapCache {
  /** Calls `ready` with the map once it has loaded: at once if it already has. */
  load(url: string, ready: (t: THREE.Texture) => void): void;
  dispose(): void;
}

export function mapCache(): MapCache {
  const loader = new THREE.TextureLoader();
  const loaded = new Map<string, THREE.Texture>();
  const waiting = new Map<string, ((t: THREE.Texture) => void)[]>();
  let gone = false;
  return {
    load(url, ready) {
      const t = loaded.get(url);
      if (t) return ready(t);
      const queue = waiting.get(url);
      if (queue) return void queue.push(ready);
      waiting.set(url, [ready]);
      loader.load(url, (tex) => {
        if (gone) return tex.dispose();
        loaded.set(url, tex);
        for (const f of waiting.get(url) ?? []) f(tex);
        waiting.delete(url);
      });
    },
    dispose() {
      gone = true;
      for (const t of loaded.values()) t.dispose();
      loaded.clear();
      waiting.clear();
    },
  };
}

export function buildWorld(
  renderer: THREE.WebGLRenderer,
  data: JourneyData,
  maps: MapCache,
  /** Asks for a frame: a map that arrives while the story is paused must still be seen. */
  redraw: () => void,
): WorldScene {
  /** Ignores maps that arrive after this world was disposed (the Explorer built another). */
  let alive = true;
  const d = dayOf(data);
  const { at, place } = placer(data);
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };
  const scene = new THREE.Scene();
  const camPos = new THREE.Vector3();
  const time = u(0);
  const pixel = u(1);

  // --- Maps --------------------------------------------------------------------------------------
  const blank = keep(new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1));
  blank.needsUpdate = true;
  const map = (url: string, loaded: { value: number }, color = true) => {
    const holder = u<THREE.Texture>(blank);
    maps.load(url, (t) => {
      if (!alive) return;
      t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      t.wrapS = THREE.RepeatWrapping;
      holder.value = t;
      loaded.value = 1;
      redraw();
    });
    return holder;
  };

  // --- The sky -----------------------------------------------------------------------------------
  const skyLoaded = u(0);
  const skyGain = u(0.55);
  const sky = new THREE.Group();
  // NASA's star map is in equatorial coordinates: through uvOf, the vernal equinox lies along the
  // mesh's +z, right ascension 6h along +x, the celestial pole along +y. The scene is ecliptic: the
  // equinox along +x (longitude 0), longitude 90 along -z, the ecliptic pole along +y. Tilting by
  // the obliquity between them puts every star in its true direction behind the true planets.
  const skyMesh = new THREE.Mesh(
    keep(new THREE.SphereGeometry(1500, 64, 32)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: BODY_VERT,
        fragmentShader: SKY_FRAG,
        uniforms: { uStars: map(MAPS.stars, skyLoaded), uLoaded: skyLoaded, uGain: skyGain },
        side: THREE.BackSide,
        depthWrite: false,
      }),
    ),
  );
  {
    const e = 23.44 * RAD;
    const m = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(0, -Math.sin(e), -Math.cos(e)),
      new THREE.Vector3(0, Math.cos(e), -Math.sin(e)),
      new THREE.Vector3(1, 0, 0),
    );
    skyMesh.quaternion.setFromRotationMatrix(m);
  }
  sky.add(skyMesh);
  scene.add(sky);

  // --- The Sun -----------------------------------------------------------------------------------
  const sun = new THREE.Mesh(
    keep(new THREE.SphereGeometry(RADIUS.sun, 96, 48)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: BODY_VERT,
        fragmentShader: SUN_FRAG,
        uniforms: {
          uTime: time,
          uCamPos: u(camPos),
          cCore: u(linear("#fff3dc", 2.3)),
          cLimb: u(linear("#ff8a2a", 1.15)),
        },
      }),
    ),
  );
  scene.add(sun);
  const glowGeometry = keep(new THREE.PlaneGeometry(1, 1));
  const glow = (hex: string, gain: number, size: number, fall: number) => {
    const m = new THREE.Mesh(
      glowGeometry,
      keep(
        new THREE.ShaderMaterial({
          vertexShader: GLOW_VERT,
          fragmentShader: GLOW_FRAG,
          uniforms: { cGlow: u(linear(hex, gain)), uOn: u(1), uFall: u(fall) },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    m.scale.setScalar(size);
    m.frustumCulled = false;
    return m;
  };
  // The corona close in, and a wide glare that keeps the same size on screen however far the
  // camera is, as a lens's would, so the Sun never floods a close-up of Mercury nor a wide shot.
  const corona = glow("#ffb45c", 0.42, RADIUS.sun * 4.5, 2.6);
  const glare = glow("#ff9a48", 0.05, 1, 5);
  scene.add(corona, glare);

  // --- Orbits ------------------------------------------------------------------------------------
  const orbitOn = u(0);
  const orbitDays: Record<World, number> = { mercury: 88, venus: 225, earth: 366, ceres: 1682 };
  /** Each ring parts round its world: drawn through the centre, up close it would cross the face. */
  const holes = {} as Record<World, { value: THREE.Vector4 }>;
  for (const world of Object.keys(orbitDays) as World[]) {
    holes[world] = { value: new THREE.Vector4(0, 0, 0, 2.2 * RADIUS[world]) };
    const pts: number[] = [];
    const vs: number[] = [];
    const n = 256;
    for (let i = 0; i <= n; i++) {
      const p = at(world, data.start + (orbitDays[world] * i) / n);
      pts.push(...p);
      vs.push(i / n);
    }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.setAttribute("aV", new THREE.Float32BufferAttribute(vs, 1));
    scene.add(
      new THREE.Line(
        g,
        keep(
          new THREE.ShaderMaterial({
            vertexShader: LINE_VERT,
            fragmentShader: LINE_FRAG,
            uniforms: {
              cLine: u(linear("#8fa3c8", 0.22)),
              uOn: orbitOn,
              uTime: time,
              uPulse: u(0),
              uFrom: u(0),
              uHole: holes[world],
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        ),
      ),
    );
  }

  // --- Airless worlds: Mercury, the Moon, Ceres ----------------------------------------------------
  const rocky = (radius: number, url: string, base: string, gain: number, film: string) => {
    const loaded = u(0);
    const uniforms = {
      uMap: map(url, loaded),
      uLoaded: loaded,
      cBase: u(linear(base)),
      uRot: u(new THREE.Matrix3()),
      uCenter: u(new THREE.Vector3()),
      uCamPos: u(camPos),
      uGain: u(gain),
      uSite: u(new THREE.Vector3(0, 1, 0)),
      uCover: u(2),
      uActive: u(0),
      uBelt: u(0),
      uTime: time,
      cFilm: u(linear(film)),
      cLights: u(linear("#ffb35a", 1.3)),
    };
    const mesh = new THREE.Mesh(
      keep(new THREE.SphereGeometry(radius, 128, 64)),
      keep(
        new THREE.ShaderMaterial({ vertexShader: BODY_VERT, fragmentShader: ROCKY_FRAG, uniforms }),
      ),
    );
    return { mesh, uniforms };
  };

  const worldGroup = () => {
    const group = new THREE.Group();
    /** Turns with the world's orbit: +x points at the Sun. */
    const frame = new THREE.Group();
    group.add(frame);
    scene.add(group);
    return { group, frame };
  };

  // Mercury, and the Foundry spreading from its north pole.
  const mercury = worldGroup();
  const mercuryBody = rocky(RADIUS.mercury, MAPS.mercury, "#8a8580", 1.15, "#1a2233");
  mercury.group.add(mercuryBody.mesh);
  mercuryBody.uniforms.uSite.value.set(0.12, 0.99, 0.05).normalize();
  // A mass driver near the pole, throwing parts to orbit: a track and the parts leaving it.
  const driverCount = 160;
  const driverGeometry = keep(new THREE.BufferGeometry());
  driverGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(driverCount * 3), 3),
  );
  driverGeometry.setAttribute(
    "aSize",
    new THREE.BufferAttribute(new Float32Array(driverCount).fill(2.2), 1),
  );
  driverGeometry.setAttribute(
    "aAlpha",
    new THREE.BufferAttribute(new Float32Array(driverCount), 1),
  );
  const driverDots = new THREE.Points(
    driverGeometry,
    keep(
      new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: SPARK_FRAG,
        uniforms: { uPixel: pixel, uAtten: u(1), cPoint: u(linear("#ffe2a8", 1.1)), uOn: u(1) },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  driverDots.frustumCulled = false;
  mercury.group.add(driverDots);

  // The Moon and Earth.
  const earth = worldGroup();
  const earthLoaded = u(0);
  const earthUniforms = {
    uDay: map(MAPS.earthDay, earthLoaded),
    uNight: map(MAPS.earthNight, u(0)),
    uClouds: map(MAPS.earthClouds, u(0), false),
    uLoaded: earthLoaded,
    uRot: u(new THREE.Matrix3()),
    uCenter: u(new THREE.Vector3()),
    uCamPos: u(camPos),
    uTime: time,
  };
  const earthBody = new THREE.Mesh(
    keep(new THREE.SphereGeometry(RADIUS.earth, 128, 64)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: BODY_VERT,
        fragmentShader: EARTH_FRAG,
        uniforms: earthUniforms,
      }),
    ),
  );
  earth.group.add(earthBody);
  const moon = rocky(RADIUS.moon, MAPS.moon, "#9b9892", 1.05, "#222");
  earth.group.add(moon.mesh);

  // Ceres, its factories, mirrors, Railheads and the Crown.
  const ceres = worldGroup();
  const ceresBody = rocky(RADIUS.ceres, MAPS.ceres, "#6d6a66", 1.35, "#1b2130");
  ceres.group.add(ceresBody.mesh);
  ceresBody.uniforms.uSite.value.set(0.55, 0.35, 0.76).normalize();
  const crown = new THREE.Group();
  ceres.frame.add(crown);
  const crownR = data.crownRadius * RADIUS.ceres;
  const finR = data.crownFins * RADIUS.ceres;
  const crownOn = u(0);
  const crownHot = u(0);
  const ringMaterial = keep(
    new THREE.MeshBasicMaterial({ color: linear("#c9d2df", 0.9), transparent: true, opacity: 0 }),
  );
  crown.add(
    new THREE.Mesh(
      keep(new THREE.TorusGeometry(crownR, RADIUS.ceres * 0.018, 8, 160)).rotateX(Math.PI / 2),
      ringMaterial,
    ),
  );
  const bandMaterial = keep(
    new THREE.MeshBasicMaterial({
      color: linear("#ffcf8a", 0.9),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  crown.add(
    new THREE.Mesh(
      keep(new THREE.CylinderGeometry(crownR, crownR, RADIUS.ceres * 0.19, 160, 1, true)),
      bandMaterial,
    ),
  );
  const fins = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(finR * 2, finR * 2)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader: FLAT_VERT,
        fragmentShader: FIN_FRAG,
        uniforms: {
          uOn: crownOn,
          uHot: crownHot,
          uInner: u(crownR / finR),
          cCold: u(linear("#3a4150", 0.6)),
          cHot: u(linear("#ff5418", 1.25)),
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    ),
  );
  fins.rotation.x = -Math.PI / 2;
  crown.add(fins);
  {
    // Tethers hang from the ring straight down to the Railheads on the equator.
    const pts: number[] = [];
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      pts.push(
        Math.cos(a) * crownR,
        0,
        Math.sin(a) * crownR,
        Math.cos(a) * RADIUS.ceres,
        0,
        Math.sin(a) * RADIUS.ceres,
      );
    }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    crown.add(new THREE.LineSegments(g, ringMaterial));
  }
  // Mirrors in orbit, lighting the factories' solar film.
  const mirrorCount = 900;
  const mirrorGeometry = keep(new THREE.BufferGeometry());
  {
    const rand = random(3);
    const pos = new Float32Array(mirrorCount * 3);
    const size = new Float32Array(mirrorCount);
    for (let i = 0; i < mirrorCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = RADIUS.ceres * (1.45 + rand() * 0.5);
      const tilt = (rand() - 0.5) * 0.5;
      pos.set([Math.cos(a) * r, Math.sin(a) * r * tilt, Math.sin(a) * r], i * 3);
      size[i] = 1.2 + rand() * 1.4;
    }
    mirrorGeometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    mirrorGeometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    mirrorGeometry.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(new Float32Array(mirrorCount), 1),
    );
  }
  const mirrors = new THREE.Points(
    mirrorGeometry,
    keep(
      new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: SPARK_FRAG,
        uniforms: { uPixel: pixel, uAtten: u(1), cPoint: u(linear("#fff2d0", 1.6)), uOn: u(1) },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  ceres.frame.add(mirrors);
  // Bricks leaving the Railheads, backward along Ceres's orbit.
  const shotCount = 420;
  const shotGeometry = keep(new THREE.BufferGeometry());
  shotGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(shotCount * 3), 3),
  );
  shotGeometry.setAttribute(
    "aSize",
    new THREE.BufferAttribute(new Float32Array(shotCount).fill(2.4), 1),
  );
  shotGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(shotCount), 1));
  const shots = new THREE.Points(
    shotGeometry,
    keep(
      new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: SPARK_FRAG,
        uniforms: { uPixel: pixel, uAtten: u(1), cPoint: u(linear("#cdefff", 2.4)), uOn: u(1) },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  shots.frustumCulled = false;
  ceres.frame.add(shots);

  // --- Venus ---------------------------------------------------------------------------------------
  const venus = worldGroup();
  const venusSpin = new THREE.Group();
  venus.group.add(venusSpin);
  const venusSun = u(new THREE.Vector3(1, 0, 0));
  const venusRot = u(new THREE.Matrix3());
  const bakeTarget = () =>
    keep(
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
  const heightMap = u<THREE.Texture>(blank);
  const heightReal = u(0);
  const bake = (target: THREE.WebGLRenderTarget, layer: number) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: BAKE_FRAG,
      uniforms: { uLayer: u(layer), uHeight: heightMap, uReal: heightReal },
      depthTest: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    const bakeScene = new THREE.Scene();
    bakeScene.add(quad);
    renderer.setRenderTarget(target);
    renderer.render(bakeScene, new THREE.Camera());
    renderer.setRenderTarget(null);
    material.dispose();
    quad.geometry.dispose();
    return target;
  };
  const terrainTarget = bake(bakeTarget(), 0);
  let shores = shorelines(renderer, terrainTarget);
  // Venus's real heights: once they load, bake the terrain again and find the shorelines anew, so
  // the seas fill Venus's own lowlands to the shares the model gives.
  maps.load(MAPS.venusHeight, (t) => {
    if (!alive) return;
    t.colorSpace = THREE.NoColorSpace;
    t.generateMipmaps = false;
    t.minFilter = THREE.LinearFilter;
    t.wrapS = THREE.RepeatWrapping;
    heightMap.value = t;
    heightReal.value = 1;
    bake(terrainTarget, 0);
    shores = shorelines(renderer, terrainTarget) ?? shores;
    redraw();
  });
  const co2Line = (level: number) =>
    shores ? shores.co2(level * data.capCover) : 0.28 + 0.24 * level;
  const waterLine = (level: number) =>
    shores ? shores.water(level * data.seaCover) : -0.2 + 0.2 * level;
  const cloudMap = bake(bakeTarget(), 1).texture;

  const planetUniforms = {
    uTerrain: u(terrainTarget.texture),
    uRot: venusRot,
    uSunDir: venusSun,
    uCamPos: u(camPos),
    uSun: u(1),
    uHeat: u(1),
    uCO2Level: u(0),
    uCO2Line: u(-2),
    uWaterLine: u(-2),
    uDryIce: u(0),
    uSealed: u(0),
    uWaterIce: u(0),
    uOcean: u(0),
    uLife: u(0),
    uForges: u(0),
    uLanterns: u(0),
    uTime: time,
    cForge: u(linear("#ff9a4a", 3.2)),
    cRockLow: u(linear("#2b211a")),
    cRockHigh: u(linear("#74614c")),
    cCO2: u(linear("#24465e")),
    cDryIce: u(linear("#f7f9fd", 1.05)),
    cSealed: u(linear("#cfc8b8", 0.95)),
    cDeep: u(linear("#0a3768")),
    cShallow: u(linear("#1f84a3")),
    cWaterIce: u(linear("#b9d3ea", 0.62)),
    cLife: u(linear("#3f6a2c")),
    cLifeDry: u(linear("#87844f")),
    cBloom: u(linear("#2b8577")),
    cGlowLow: u(linear("#6a1203")),
    cGlowHigh: u(linear("#ff5c18")),
  };
  venusSpin.add(
    new THREE.Mesh(
      keep(new THREE.SphereGeometry(RADIUS.venus, 192, 96)),
      keep(
        new THREE.ShaderMaterial({
          vertexShader: SPHERE_VERT,
          fragmentShader: PLANET_FRAG,
          uniforms: planetUniforms,
        }),
      ),
    ),
  );
  const cloudUniforms = {
    uClouds: u(cloudMap),
    uRot: venusRot,
    uSunDir: venusSun,
    uCamPos: u(camPos),
    uTime: time,
    uSun: planetUniforms.uSun,
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
  };
  venusSpin.add(
    new THREE.Mesh(
      keep(new THREE.SphereGeometry(RADIUS.venus * 1.014, 160, 80)),
      keep(
        new THREE.ShaderMaterial({
          vertexShader: SPHERE_VERT,
          fragmentShader: CLOUD_FRAG,
          uniforms: cloudUniforms,
          transparent: true,
          depthWrite: false,
        }),
      ),
    ),
  );
  const canopyUniforms = {
    uRot: venusRot,
    uSunDir: venusSun,
    uLitDir: venusSun,
    uOn: u(0),
    uGlow: u(0),
    uBand: u(Math.sin(data.dropLatitude * RAD)),
    // Rows of canopies from pole to pole, were the band to reach the poles: each drawn about
    // twice its real width (the model's canopy-width, with gaps) so one can be told apart.
    uCells: u(Math.PI / (data.canopyWidth * 1.08 * 2)),
    uTime: time,
    uCamPos: u(camPos),
    cFrame: u(linear("#e9e4d6", 0.55)),
    cHot: u(linear("#ff5a2a", 0.9)),
  };
  venusSpin.add(
    new THREE.Mesh(
      keep(new THREE.SphereGeometry(RADIUS.venus * 1.019, 160, 80)),
      keep(
        new THREE.ShaderMaterial({
          vertexShader: SPHERE_VERT,
          fragmentShader: CANOPY_FRAG,
          uniforms: canopyUniforms,
          transparent: true,
          depthWrite: false,
        }),
      ),
    ),
  );
  const airUniforms = (center: THREE.Vector3, radius: number, sky: number) => ({
    uSunDir: u(new THREE.Vector3(1, 0, 0)),
    uSun: u(1),
    uCamPos: u(camPos),
    uCenter: u(center),
    uRadius: u(radius),
    uShell: u(radius * 1.075),
    uExhaust: u(0),
    cExhaust: u(linear("#ff5236", 0.22)),
    uAir: u(1),
    uSky: u(sky),
    cRimVenus: u(linear("#ffb85c")),
    cRimEarth: u(linear("#4f9dff")),
  });
  const shell = (uniforms: ReturnType<typeof airUniforms>, radius: number) =>
    new THREE.Mesh(
      keep(new THREE.SphereGeometry(radius * 1.075, 96, 48)),
      keep(
        new THREE.ShaderMaterial({
          vertexShader: ATMO_VERT,
          fragmentShader: ATMO_FRAG,
          uniforms,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
  const venusAir = airUniforms(new THREE.Vector3(), RADIUS.venus, 0);
  venus.group.add(shell(venusAir, RADIUS.venus));
  const earthAir = airUniforms(new THREE.Vector3(), RADIUS.earth, 1);
  earthAir.uAir.value = 0.6;
  earth.group.add(shell(earthAir, RADIUS.earth));

  // The Veil, sunward, and the Aegis coil beside it. Not to scale: the real Veil is 1.1 million km
  // out, twice Venus's radius across; drawn near and smaller so both fit one picture.
  const veilUniforms = {
    uBuilt: u(0),
    uOpen: u(0),
    uTime: time,
    cRim: u(linear("#ffcf7a", 2.6)),
    cFilm: u(linear("#07080e")),
    cSlat: u(linear("#ffd892", 1.2)),
  };
  const veil = new THREE.Mesh(
    keep(new THREE.CircleGeometry(Math.min(1.25, data.veilRadius * 0.55), 128)),
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
  veil.position.set(4.6, 0.5, -0.4);
  veil.rotation.y = Math.PI / 2;
  venus.frame.add(veil);
  const aegisUniforms = { uOn: u(0), uTime: time, cField: u(linear("#6fd3ff", 0.3)) };
  const aegis = new THREE.Mesh(
    keep(new THREE.SphereGeometry(1.1, 64, 32)),
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
  aegis.position.set(4.3, -0.9, 1.4);
  venus.frame.add(aegis);
  const coilMaterial = keep(
    new THREE.MeshBasicMaterial({
      color: linear("#9fe3ff", 1.4),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const coil = new THREE.Mesh(keep(new THREE.TorusGeometry(0.32, 0.012, 8, 96)), coilMaterial);
  coil.position.copy(aegis.position);
  coil.rotation.y = Math.PI / 2;
  venus.frame.add(coil);

  // The Lanterns: mirror swarms behind Venus, a little off the Sun line, lighting its night side.
  const lanternCount = 260;
  const lanternGeometry = keep(new THREE.BufferGeometry());
  {
    const rand = random(19);
    const pos = new Float32Array(lanternCount * 3);
    const size = new Float32Array(lanternCount);
    for (let i = 0; i < lanternCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.6;
      pos.set([-3.1, Math.sin(a) * r, 0.48 + Math.cos(a) * r], i * 3);
      size[i] = 1 + rand() * 1.4;
    }
    lanternGeometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    lanternGeometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    lanternGeometry.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(new Float32Array(lanternCount), 1),
    );
  }
  const lanterns = new THREE.Points(
    lanternGeometry,
    keep(
      new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: SPARK_FRAG,
        uniforms: { uPixel: pixel, uAtten: u(1), cPoint: u(linear("#fff0cc", 1.4)), uOn: u(1) },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  venus.frame.add(lanterns);

  // The Bricks' last leg: down onto the polar drop zones, where each bursts. They come from behind
  // Venus (-z in its frame, against its motion) and a little from outside its orbit.
  const brickUniforms = {
    uTime: time,
    uPixel: pixel,
    uFront: u(0),
    uTail: u(0),
    uOn: u(1),
    uP0: u([new THREE.Vector3(-3.5, 3.2, -11), new THREE.Vector3(-3.9, -2.8, -10.5)]),
    uP1: u([new THREE.Vector3(-1.6, 3, -4.6), new THREE.Vector3(-1.8, -2.6, -4.8)]),
    cPoint: u(linear("#c4ecff", 0.85)),
    cFlash: u(linear("#ffd9a0", 2.6)),
  };
  {
    const n = 640;
    const g = keep(new THREE.BufferGeometry());
    const offset = new Float32Array(n);
    const side = new Float32Array(n);
    const jitter = new Float32Array(n * 3);
    const ends = new Float32Array(n * 3);
    const rand = random(7);
    const edge = data.dropLatitude;
    for (let i = 0; i < n; i++) {
      offset[i] = rand();
      side[i] = i % 2;
      jitter.set([(rand() - 0.5) * 0.5, (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.5], i * 3);
      const north = i % 2 === 0;
      const deg = (north ? 1 : -1) * (edge + 3 + rand() * (90 - edge - 5));
      const lat = deg * RAD;
      const lon = rand() * Math.PI * 2;
      const r = RADIUS.venus * 1.018;
      ends.set(
        [Math.cos(lat) * Math.sin(lon) * r, Math.sin(lat) * r, Math.cos(lat) * Math.cos(lon) * r],
        i * 3,
      );
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aOffset", new THREE.BufferAttribute(offset, 1));
    g.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
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
    venus.frame.add(points);
  }

  // --- The Helios Lattice ------------------------------------------------------------------------------
  const petalCount = 26000;
  const petalUniforms = {
    uDay: u(0),
    uShare: u(0),
    uPixel: pixel,
    uScale: u(SCALE),
    uPower: u(POWER),
    uTime: time,
    cPoint: u(linear("#ffe7b0", 1.5)),
    uOn: u(1),
  };
  const petalOrbits = new Float32Array(petalCount * 4);
  {
    const rand = random(29);
    const g = keep(new THREE.BufferGeometry());
    const birth = new Float32Array(petalCount);
    for (let i = 0; i < petalCount; i++) {
      const a = data.latticeInner + (data.latticeOuter - data.latticeInner) * Math.sqrt(rand());
      // Many inclinations, so no Petal shades another.
      petalOrbits.set([a, (rand() - 0.5) * 0.9, rand() * Math.PI * 2, rand() * Math.PI * 2], i * 4);
      birth[i] = (i + 0.5) / petalCount;
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(petalCount * 3), 3));
    g.setAttribute("aOrbit", new THREE.BufferAttribute(petalOrbits, 4));
    g.setAttribute("aBirth", new THREE.BufferAttribute(birth, 1));
    const points = new THREE.Points(
      g,
      keep(
        new THREE.ShaderMaterial({
          vertexShader: PETAL_VERT,
          fragmentShader: SPARK_FRAG,
          uniforms: petalUniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    points.frustumCulled = false;
    scene.add(points);
  }
  /** A Petal's place on a day, as PETAL_VERT computes it, for the beams to start from. */
  const petalAt = (i: number, day: number): Vec3 => {
    const [a, inc, node, phase] = [
      petalOrbits[i * 4],
      petalOrbits[i * 4 + 1],
      petalOrbits[i * 4 + 2],
      petalOrbits[i * 4 + 3],
    ] as number[] as [number, number, number, number];
    const uAng = phase + (2 * Math.PI * day) / (365.25 * a ** 1.5);
    const r = out(a);
    const p: Vec3 = [Math.cos(uAng) * r, 0, -Math.sin(uAng) * r];
    const q: Vec3 = [p[0], -p[2] * Math.sin(inc), p[2] * Math.cos(inc)];
    return [
      q[0] * Math.cos(node) + q[2] * Math.sin(node),
      q[1],
      -q[0] * Math.sin(node) + q[2] * Math.cos(node),
    ];
  };

  // Beams: from Petals to the Crown round Ceres, then to Venus's canopies. The light is 2.5 µm
  // infrared, invisible to the eye; drawn in false colour.
  const beamCount = 9;
  const beamGeometry = keep(new THREE.BufferGeometry());
  beamGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(beamCount * 2 * 3), 3),
  );
  {
    const v = new Float32Array(beamCount * 2);
    for (let i = 0; i < beamCount; i++) v.set([0, 1], i * 2);
    beamGeometry.setAttribute("aV", new THREE.BufferAttribute(v, 1));
  }
  const beamOn = u(0);
  /** Where along a beam it starts to show: further out in the wide shots, so they read whole. */
  const beamFrom = u(0.5);
  const beams = new THREE.LineSegments(
    beamGeometry,
    keep(
      new THREE.ShaderMaterial({
        vertexShader: LINE_VERT,
        fragmentShader: LINE_FRAG,
        uniforms: {
          cLine: u(linear("#ff9d5c", 1.1)),
          uOn: beamOn,
          uTime: time,
          uPulse: u(1),
          uFrom: beamFrom,
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  beams.frustumCulled = false;
  scene.add(beams);

  // --- Craft between worlds ------------------------------------------------------------------------------
  const transit = (
    count: number,
    hex: string,
    size: number,
    /** Light per craft: the many Bricks each give less, or overlapping they would burn white. */
    gain: number,
    seed: number,
    plan: (
      k: number,
      rand: () => number,
    ) => { from: World; to: World; launch: number; arrive: number },
  ) => {
    const rand = random(seed);
    const g = keep(new THREE.BufferGeometry());
    const path = new Float32Array(count * 4);
    const times = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const p = plan((i + 0.5) / count, rand);
      const a = place(p.from, p.launch);
      const b = place(p.to, p.arrive);
      path.set([a.longitude, a.distance, b.longitude, b.distance], i * 4);
      times.set([p.launch, p.arrive], i * 2);
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aPath", new THREE.BufferAttribute(path, 4));
    g.setAttribute("aTimes", new THREE.BufferAttribute(times, 2));
    const uniforms = {
      uDay: u(0),
      uPixel: pixel,
      uScale: u(SCALE),
      uPower: u(POWER),
      uSize: u(size),
      cPoint: u(linear(hex, gain)),
      uOn: u(1),
    };
    const points = new THREE.Points(
      g,
      keep(
        new THREE.ShaderMaterial({
          vertexShader: TRANSIT_VERT,
          fragmentShader: SPARK_FRAG,
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    points.frustumCulled = false;
    scene.add(points);
    return uniforms;
  };
  const coast = d("veil-close") - d("veil-build-end");
  const between = (a: number, b: number, k: number) => a + (b - a) * k;
  const transits = [
    // The Bricks: each launch slot's place on Ceres, each arrival's place at Venus, in order.
    transit(6000, "#d4f1ff", 70, 0.7, 41, (k, rand) => ({
      from: "ceres",
      to: "venus",
      launch: between(d("ice-launch-start"), d("ice-launch-end"), k) + rand() * 0.5,
      arrive: between(d("first-arrival"), d("last-arrival"), k),
    })),
    // The Veil's slats, thrown from Mercury and coasting to the Veil's station.
    transit(1600, "#ffd892", 60, 1.3, 43, (k) => ({
      from: "mercury",
      to: "venus",
      launch: between(d("veil-build-begin"), d("veil-build-end"), k),
      arrive: between(d("veil-build-begin"), d("veil-build-end"), k) + coast,
    })),
    // The tiles, canopies, chimneys, receivers and Lanterns for Venus.
    transit(1600, "#ffb27a", 60, 1.3, 47, (k) => {
      const launch = between(d("helios-full-power"), d("venus-hardware-ready") - coast, k);
      return { from: "mercury", to: "venus", launch, arrive: launch + coast };
    }),
  ];

  // The two seeds from Earth, each a bright point with a short trail behind it.
  const seedTrail = 48;
  const seedGeometry = keep(new THREE.BufferGeometry());
  seedGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(2 * seedTrail * 3), 3),
  );
  seedGeometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(2 * seedTrail), 1));
  seedGeometry.setAttribute(
    "aAlpha",
    new THREE.BufferAttribute(new Float32Array(2 * seedTrail), 1),
  );
  const seeds = new THREE.Points(
    seedGeometry,
    keep(
      new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: SPARK_FRAG,
        uniforms: { uPixel: pixel, uAtten: u(0), cPoint: u(linear("#ffffff", 3)), uOn: u(1) },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  seeds.frustumCulled = false;
  scene.add(seeds);

  // The proof experiments in orbit round Earth, and the seeds' climb.
  const satCount = 9;
  /** Points in each seed's exhaust plume as it climbs. */
  const plume = 28;
  const satGeometry = keep(new THREE.BufferGeometry());
  satGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array((satCount + 2 * plume) * 3), 3),
  );
  satGeometry.setAttribute(
    "aSize",
    new THREE.BufferAttribute(new Float32Array(satCount + 2 * plume).fill(2.2), 1),
  );
  satGeometry.setAttribute(
    "aAlpha",
    new THREE.BufferAttribute(new Float32Array(satCount + 2 * plume), 1),
  );
  const sats = new THREE.Points(
    satGeometry,
    keep(
      new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: SPARK_FRAG,
        uniforms: { uPixel: pixel, uAtten: u(1), cPoint: u(linear("#fff6e0", 2.2)), uOn: u(1) },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  sats.frustumCulled = false;
  earth.frame.add(sats);

  // --- Anchors for the labels ------------------------------------------------------------------------------
  const anchors: Anchor[] = [
    { id: "sun", name: "Sun", position: new THREE.Vector3(), radius: RADIUS.sun },
    { id: "mercury", name: "Mercury", position: mercury.group.position, radius: RADIUS.mercury },
    { id: "venus", name: "Venus", position: venus.group.position, radius: RADIUS.venus },
    { id: "earth", name: "Earth", position: earth.group.position, radius: RADIUS.earth },
    { id: "ceres", name: "Ceres", position: ceres.group.position, radius: RADIUS.ceres },
  ];

  // --- Drawing a day ---------------------------------------------------------------------------------------
  const v3 = new THREE.Vector3();
  const rotOf = (o: THREE.Object3D, into: THREE.Matrix3) => {
    o.updateMatrixWorld(true);
    into.setFromMatrix4(o.matrixWorld);
  };
  const placeWorld = (w: { group: THREE.Group; frame: THREE.Group }, p: Vec3) => {
    w.group.position.set(p[0], p[1], p[2]);
    // The frame's +x points at the Sun.
    w.frame.rotation.y = Math.atan2(p[2], -p[0]);
  };
  const setDots = (
    g: THREE.BufferGeometry,
    fill: (pos: Float32Array, alpha: Float32Array) => void,
  ) => {
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const alpha = g.getAttribute("aAlpha") as THREE.BufferAttribute;
    fill(pos.array as Float32Array, alpha.array as Float32Array);
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
  };

  function apply(
    day: number,
    seconds: number,
    s: Stage,
    pose: Pose,
    camera: THREE.Camera,
    px: number,
  ) {
    time.value = seconds;
    pixel.value = px;
    camPos.copy(camera.position);
    sky.position.copy(camera.position);
    sky.rotation.y = pose.skyTurn;
    // Orbits and the faint stars come forward in the wide shots.
    const wide = smooth(4, 14, pose.frame);
    orbitOn.value = wide;
    skyGain.value = 0.45 + 0.2 * wide;
    beamFrom.value = 0.62 - 0.55 * wide;
    const sunDistance = camera.position.length();
    glare.scale.setScalar(sunDistance * 0.42);
    corona.scale.setScalar(Math.min(RADIUS.sun * 4.5, sunDistance * 0.2));

    const pMercury = at("mercury", day);
    const pVenus = at("venus", day);
    const pEarth = at("earth", day);
    const pCeres = at("ceres", day);
    holes.mercury.value.set(...pMercury, holes.mercury.value.w);
    holes.venus.value.set(...pVenus, holes.venus.value.w);
    holes.earth.value.set(...pEarth, holes.earth.value.w);
    holes.ceres.value.set(...pCeres, holes.ceres.value.w);
    placeWorld(mercury, pMercury);
    placeWorld(venus, pVenus);
    placeWorld(earth, pEarth);
    placeWorld(ceres, pCeres);

    // Mercury: the Foundry's cap covers its final footprint's share by mass.
    const capFull = Math.cos(24 * RAD);
    mercuryBody.mesh.rotation.y = seconds * 0.01;
    rotOf(mercuryBody.mesh, mercuryBody.uniforms.uRot.value);
    mercuryBody.uniforms.uCenter.value.set(...pMercury);
    mercuryBody.uniforms.uActive.value = s.foundryActive;
    mercuryBody.uniforms.uCover.value = s.foundry > 0 ? 1 - s.foundry * (1 - capFull) : 2;
    setDots(driverGeometry, (pos, alpha) => {
      // Parts leave a track near the pole, climbing and curving away round the world.
      const site = mercuryBody.uniforms.uSite.value.clone().applyMatrix4(mercuryBody.mesh.matrix);
      const east = new THREE.Vector3(0, 1, 0).cross(site).normalize();
      for (let i = 0; i < driverCount; i++) {
        const t = (seconds * 0.35 + i / driverCount) % 1;
        const live = s.massDriver > (i % 10) / 10 ? 1 : 0;
        const h = RADIUS.mercury * (1.01 + 2.6 * t * t);
        v3.copy(site)
          .multiplyScalar(h)
          .addScaledVector(east, RADIUS.mercury * 3.2 * t);
        pos.set([v3.x, v3.y, v3.z], i * 3);
        alpha[i] = live * Math.sin(Math.PI * t) * 0.9;
      }
    });

    // Earth and the Moon, and the experiments in orbit.
    earthBody.rotation.y = seconds * 0.06;
    rotOf(earthBody, earthUniforms.uRot.value);
    earthUniforms.uCenter.value.set(...pEarth);
    earthAir.uCenter.value.set(...pEarth);
    earthAir.uSunDir.value.set(-pEarth[0], -pEarth[1], -pEarth[2]).normalize();
    const moonAngle = seconds * 0.12;
    moon.mesh.position.set(
      Math.cos(moonAngle) * 3.4,
      Math.sin(moonAngle) * 0.25,
      -Math.sin(moonAngle) * 3.4,
    );
    rotOf(moon.mesh, moon.uniforms.uRot.value);
    moon.uniforms.uCenter.value.set(
      pEarth[0] + moon.mesh.position.x,
      pEarth[1] + moon.mesh.position.y,
      pEarth[2] + moon.mesh.position.z,
    );
    setDots(satGeometry, (pos, alpha) => {
      for (let i = 0; i < satCount; i++) {
        const a = seconds * (0.5 + (i % 3) * 0.15) + i * 0.7;
        const r = RADIUS.earth * (1.25 + (i % 4) * 0.12);
        const tilt = ((i % 5) - 2) * 0.25;
        pos.set([Math.cos(a) * r, Math.sin(a) * r * tilt, Math.sin(a) * r], i * 3);
        alpha[i] = s.experiments * 0.8;
      }
      // The two seeds' rockets: each rises from its pad, pitches over eastward and climbs away,
      // a bright head and a fading plume behind it.
      const size = satGeometry.getAttribute("aSize") as THREE.BufferAttribute;
      for (let k = 0; k < 2; k++) {
        // On the side the camera sees from (-z in Earth's frame), in daylight.
        const pad = new THREE.Vector3(
          k === 0 ? 0.55 : 0.3,
          k === 0 ? 0.42 : -0.25,
          -0.72,
        ).normalize();
        const east = new THREE.Vector3(0, 1, 0).cross(pad).normalize();
        for (let j = 0; j < plume; j++) {
          const t = s.launch - j * 0.011;
          const i = satCount + k * plume + j;
          const up = RADIUS.earth * (1.005 + 2.6 * t * t);
          v3.copy(pad)
            .multiplyScalar(up)
            .addScaledVector(east, RADIUS.earth * 1.7 * t * t * t);
          pos.set([v3.x, v3.y, v3.z], i * 3);
          const live = s.launch > 0 && s.launch < 1 && t > 0 ? 1 : 0;
          alpha[i] = live * (j === 0 ? 1 : 0.75 * (1 - j / plume) ** 1.5);
          (size.array as Float32Array)[i] = j === 0 ? 4.5 : 3.2 * (1 - j / plume) + 1;
        }
      }
      size.needsUpdate = true;
    });

    // The seeds' crossings, with trails.
    setDots(seedGeometry, (pos, alpha) => {
      const size = seedGeometry.getAttribute("aSize") as THREE.BufferAttribute;
      (["mercury", "ceres"] as const).forEach((to, k) => {
        const launch = d(to === "mercury" ? "foundry-seed-launch" : "ceres-seed-launch");
        const land = d(to === "mercury" ? "foundry-landing" : "ceres-landing");
        for (let j = 0; j < seedTrail; j++) {
          const when = day - j * 1.2;
          const t = (when - launch) / Math.max(1, land - launch);
          const live = t > 0.02 && t < 1 && day < land ? 1 : 0;
          const p = live ? transferAt(to, when, launch, land) : [0, 0, 0];
          pos.set(p, (k * seedTrail + j) * 3);
          alpha[k * seedTrail + j] = live * (1 - j / seedTrail) ** 2;
          (size.array as Float32Array)[k * seedTrail + j] = j === 0 ? 6 : 2.5;
        }
      });
      size.needsUpdate = true;
    });

    // Ceres: factories, mirrors, Railheads, the Crown and the launches.
    ceresBody.mesh.rotation.y = seconds * 0.05;
    rotOf(ceresBody.mesh, ceresBody.uniforms.uRot.value);
    ceresBody.uniforms.uCenter.value.set(...pCeres);
    ceresBody.uniforms.uActive.value = s.factories > 0 ? 1 : 0;
    ceresBody.uniforms.uCover.value =
      s.factories > 0 ? 1 - s.factories * (1 - Math.cos(38 * RAD)) : 2;
    ceresBody.uniforms.uBelt.value = s.railheads;
    crown.visible = s.crown > 0;
    crown.scale.setScalar(0.6 + 0.4 * s.crown);
    ringMaterial.opacity = s.crown * 0.9;
    bandMaterial.opacity = s.crown * (0.12 + 0.5 * s.beamCeres);
    crownOn.value = s.crown;
    crownHot.value = s.firing;
    setDots(mirrorGeometry, (_pos, alpha) => alpha.fill(s.ceresMirrors * 0.7));
    mirrors.rotation.y = seconds * 0.04;
    setDots(shotGeometry, (pos, alpha) => {
      // Fired backward along Ceres's orbit (-z in its frame) from the equator, at 6.4 km/s: they
      // leave Ceres's grip at once.
      for (let i = 0; i < shotCount; i++) {
        const t = (seconds * 0.25 + i / shotCount) % 1;
        const a = (i * 2.399) % (Math.PI * 2);
        const base = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).multiplyScalar(RADIUS.ceres);
        v3.copy(base).add(
          new THREE.Vector3(0, (i % 7) * 0.002, -1).multiplyScalar(t * RADIUS.ceres * 9),
        );
        pos.set([v3.x, v3.y, v3.z], i * 3);
        alpha[i] = s.firing * (1 - t) * (base.z > -0.2 * RADIUS.ceres ? 1 : 0.4);
      }
    });

    // Venus.
    const vs = s.venus;
    venusSpin.rotation.y = -seconds * 0.03;
    rotOf(venusSpin, venusRot.value);
    venusSun.value.set(-pVenus[0], -pVenus[1], -pVenus[2]).normalize();
    venusAir.uCenter.value.set(...pVenus);
    venusAir.uSunDir.value.copy(venusSun.value);
    planetUniforms.uSun.value = vs.sun;
    planetUniforms.uHeat.value = vs.heat;
    planetUniforms.uCO2Level.value = vs.co2Level;
    planetUniforms.uCO2Line.value = co2Line(vs.co2Level);
    planetUniforms.uWaterLine.value = waterLine(Math.min(1, vs.ocean + vs.waterIce));
    planetUniforms.uDryIce.value = vs.dryIce;
    planetUniforms.uSealed.value = vs.sealed;
    planetUniforms.uWaterIce.value = vs.waterIce;
    planetUniforms.uOcean.value = vs.ocean;
    planetUniforms.uLife.value = vs.life;
    planetUniforms.uForges.value = vs.forges;
    planetUniforms.uLanterns.value = vs.lanterns;
    cloudUniforms.uHeat.value = vs.heat;
    cloudUniforms.uDeck.value = vs.deck;
    cloudUniforms.uWater.value = vs.waterClouds;
    cloudUniforms.uAir.value = vs.air;
    cloudUniforms.uSky.value = vs.sky;
    venusAir.uAir.value = vs.air;
    venusAir.uSky.value = vs.sky;
    venusAir.uSun.value = vs.sun;
    venusAir.uExhaust.value = vs.exhaust;
    canopyUniforms.uOn.value = vs.canopies;
    canopyUniforms.uGlow.value = vs.exhaust;
    veilUniforms.uBuilt.value = vs.veil;
    veilUniforms.uOpen.value = vs.veilOpen;
    veil.visible = vs.veil > 0;
    aegisUniforms.uOn.value = vs.aegis;
    aegis.visible = vs.aegis > 0;
    coilMaterial.opacity = vs.aegisCoil * (0.35 + 0.65 * vs.aegis);
    coil.visible = vs.aegisCoil > 0;
    setDots(lanternGeometry, (_p, alpha) => alpha.fill(vs.lanterns * 0.8));
    brickUniforms.uFront.value = vs.iceFront;
    brickUniforms.uTail.value = vs.iceTail;

    // The Lattice and its beams.
    petalUniforms.uDay.value = day;
    petalUniforms.uShare.value = s.petals;
    for (const t of transits) t.uDay.value = day;
    const pos = beamGeometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const toVenus = s.beamVenus >= s.beamCeres;
    const target = toVenus ? pVenus : pCeres;
    const reach = toVenus ? RADIUS.venus * 1.02 : crownR;
    beamOn.value = Math.max(s.beamVenus, s.beamCeres) * (0.35 + 0.65 * smooth(0.02, 0.4, s.petals));
    for (let i = 0; i < beamCount; i++) {
      const from = petalAt(
        Math.floor((i + 0.5) * (petalCount / beamCount) * Math.max(0.02, s.petals)) % petalCount,
        day,
      );
      const dir = new THREE.Vector3(
        from[0] - target[0],
        from[1] - target[1],
        from[2] - target[2],
      ).normalize();
      // Each beam lands on its own canopy on the side facing the Lattice.
      const spread = new THREE.Vector3(
        Math.sin(i * 2.1),
        Math.cos(i * 1.3) * 0.7,
        Math.sin(i * 0.7 + 1),
      ).multiplyScalar(0.55);
      const end = dir.clone().add(spread).normalize().multiplyScalar(reach);
      arr.set([...from, target[0] + end.x, target[1] + end.y, target[2] + end.z], i * 6);
    }
    pos.needsUpdate = true;
  }

  /** A seed's place, for its trail: the same crossing the director follows. */
  function transferAt(to: "mercury" | "ceres", when: number, launch: number, land: number): Vec3 {
    const t = (when - launch) / Math.max(1, land - launch);
    return crossing(place("earth", launch), place(to, land), t);
  }

  return {
    scene,
    anchors,
    apply,
    dispose() {
      alive = false;
      for (const x of disposables) x.dispose();
    },
  };
}

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
  try {
    renderer.readRenderTargetPixels(target, 0, 0, width, height, buf);
  } catch {
    return undefined;
  }
  const half = THREE.DataUtils.fromHalfFloat;
  const co2: [number, number][] = [];
  const water: [number, number][] = [];
  let total = 0;
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  for (let y = 0; y < height; y += 2) {
    const lat = ((y + 0.5) / height - 0.5) * Math.PI;
    const area = Math.cos(lat);
    const polarBand = smooth(0.28, 0.52, Math.abs(Math.sin(lat)));
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const h = half(buf[i] as number);
      const m = smooth(0.46, 0.56, half(buf[i + 1] as number)) * polarBand;
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
