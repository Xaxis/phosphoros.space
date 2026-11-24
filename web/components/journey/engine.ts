/**
 * Runs the journey: one WebGL canvas, one clock, and a camera the director places. The canvas can
 * move between the home page's hero and the full-screen dialog without reloading anything: attach()
 * hands it a new host and a new box to frame the story in. Loaded on demand, so the page's text
 * renders and reads before any of this arrives.
 */
import type { World } from "@phosphoros/calc";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { blend, director, type Pose } from "./director.ts";
import { placer, RAD, RADIUS, type Vec3 } from "./orbits.ts";
import { holds, stageAt } from "./stage.ts";
import { makeTimeline } from "./timeline.ts";
import type { JourneyData } from "./types.ts";
import { buildWorld, mapCache } from "./world.ts";

export interface JourneyOptions {
  /** Called with the day shown, every frame drawn. */
  onDay: (day: number) => void;
  /** Called when the browser takes the GPU away; the page falls back to its still picture. */
  onLost: () => void;
  /** Called when playback reaches the deadline. The finished planet keeps turning. */
  onEnd: () => void;
  autoplay: boolean;
  startDay: number;
}

/** Who the camera follows: the director's script, or one world the reader picked. */
export type Follow = "story" | World | "sun";

export interface JourneyController {
  play(): void;
  pause(): void;
  setDay(day: number): void;
  setSpeed(speed: number): void;
  /**
   * Tells another version of the story (the Explorer's variant): rebuilds the world on the same
   * canvas, keeps the maps, the camera and the day shown, and moves every event to its new date.
   */
  setData(data: JourneyData): void;
  setVisible(visible: boolean): void;
  /** Move the canvas into a host element, framing the story inside `box`. */
  attach(host: HTMLElement, box: HTMLElement, labels?: HTMLElement): void;
  /** Lets the reader turn and zoom the camera (the dialog), or not (the hero). */
  setInteractive(on: boolean): void;
  follow(who: Follow): void;
  /** Multiplies the distance to the target: below 1 moves in. */
  zoom(k: number): void;
  resetView(): void;
  layout(): void;
  dispose(): void;
  canvas: HTMLCanvasElement;
}

const FOV = 24;
const BACKGROUND = "#05060b";

export function createJourney(first: JourneyData, opts: JourneyOptions): JourneyController {
  let data = first;
  const canvas = document.createElement("canvas");
  canvas.className = "journey-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(BACKGROUND);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const maps = mapCache();
  let world = buildWorld(renderer, data, maps, () => request());
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 4000);
  const timelineOf = (d: JourneyData) =>
    makeTimeline(
      d.events.map((e) => e.day),
      d.start,
      d.end,
      holds(d),
    );
  let timeline = timelineOf(data);
  let story = director(data, timeline);
  let at = placer(data).at;

  // --- Post-processing: bloom makes the Sun, the beams and the bursting Bricks glow -------------------
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  const scenePass = new RenderPass(world.scene, camera);
  composer.addPass(scenePass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.65, 0.5, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // --- Where it draws ----------------------------------------------------------------------------
  let host: HTMLElement | undefined;
  let box: HTMLElement | undefined;
  let labelHost: HTMLElement | undefined;
  const labelEls = new Map<string, HTMLSpanElement>();
  let width = 0;
  let height = 0;
  let boxCenter = { x: 0, y: 0 };
  let boxRadius = 100;
  /** Lowered while frames run slow, so a weak GPU drops resolution rather than smoothness. */
  let dprCap = 2;

  function resize() {
    if (!host || !box) return;
    const rect = host.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, width < 800 ? 1.5 : 1.75, dprCap);
    // Resizing clears the drawing buffer, so only when the size really changed: a ResizeObserver
    // that fires for nothing must not blank a paused frame.
    const size = renderer.getSize(new THREE.Vector2());
    if (size.x !== width || size.y !== height || renderer.getPixelRatio() !== dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      composer.setPixelRatio(dpr);
      composer.setSize(width, height);
      canvas.dataset.dpr = String(dpr);
    }
    boxCenter = { x: b.left + b.width / 2 - rect.left, y: b.top + b.height / 2 - rect.top };
    boxRadius = Math.max(40, Math.min(b.width, b.height) / 2);
    camera.aspect = width / height;
    camera.setViewOffset(
      width,
      height,
      width / 2 - boxCenter.x,
      height / 2 - boxCenter.y,
      width,
      height,
    );
    camera.updateProjectionMatrix();
  }

  // --- The reader's camera, in the dialog ------------------------------------------------------------
  let interactive = false;
  let following: Follow = "story";
  /** Turned and zoomed by the reader, easing back to the director's view on reset. */
  const user = { azim: 0, elev: 0, zoom: 1 };
  const userTarget = { azim: 0, elev: 0, zoom: 1 };
  let followSince = 0;
  let followFrom: Pose | undefined;
  const followShot = (who: Follow, day: number): Pose => {
    if (who === "sun")
      return { target: [0, 0, 0], dir: dirFrom(20, 35), frame: 22, skyTurn: 0, chapter: "lattice" };
    if (who === "story") return story.pose(day);
    const p = at(who, day);
    const sunward = Math.atan2(p[2], -p[0]);
    const a = sunward + 60 * RAD;
    const e = 20 * RAD;
    const extra =
      who === "ceres" ? data.crownFins * 1.15 : who === "venus" ? 3.2 : who === "earth" ? 3.6 : 2.2;
    return {
      target: p,
      dir: [Math.cos(a) * Math.cos(e), Math.sin(e), -Math.sin(a) * Math.cos(e)],
      frame: RADIUS[who] * extra,
      skyTurn: (Math.atan2(-p[2], p[0]) + 2 * Math.PI) % (2 * Math.PI),
      chapter: who,
    };
  };
  function dirFrom(azimDeg: number, elevDeg: number): Vec3 {
    const a = azimDeg * RAD;
    const e = elevDeg * RAD;
    return [Math.cos(a) * Math.cos(e), Math.sin(e), -Math.sin(a) * Math.cos(e)];
  }

  let drag: { x: number; y: number; id: number } | undefined;
  const pinch = new Map<number, { x: number; y: number }>();
  let pinchStart = 0;
  const onDown = (e: PointerEvent) => {
    if (!interactive) return;
    canvas.setPointerCapture(e.pointerId);
    pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.size === 2) {
      const [a, b] = [...pinch.values()] as [{ x: number; y: number }, { x: number; y: number }];
      pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      drag = undefined;
    } else drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onMove = (e: PointerEvent) => {
    if (!interactive) return;
    if (pinch.has(e.pointerId)) pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.size === 2) {
      const [a, b] = [...pinch.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart > 0) zoomBy(pinchStart / dist);
      pinchStart = dist;
      return;
    }
    if (!drag || drag.id !== e.pointerId) return;
    userTarget.azim -= (e.clientX - drag.x) * 0.3;
    userTarget.elev = Math.max(-70, Math.min(70, userTarget.elev + (e.clientY - drag.y) * 0.25));
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
    request();
  };
  const onUp = (e: PointerEvent) => {
    pinch.delete(e.pointerId);
    if (drag?.id === e.pointerId) drag = undefined;
    pinchStart = 0;
  };
  const zoomBy = (k: number) => {
    userTarget.zoom = Math.max(0.25, Math.min(40, userTarget.zoom * k));
    request();
  };
  const onWheel = (e: WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    zoomBy(Math.exp(e.deltaY * 0.0012));
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  // --- Labels in wide shots ---------------------------------------------------------------------------
  const projected = new THREE.Vector3();
  function placeLabels() {
    if (!labelHost) return;
    const perPixel = (2 * Math.tan((FOV / 2) * RAD)) / height;
    for (const a of world.anchors) {
      let el = labelEls.get(a.id);
      if (!el) {
        el = document.createElement("span");
        el.className = "journey-label";
        el.textContent = a.name;
        labelHost.appendChild(el);
        labelEls.set(a.id, el);
      }
      projected.copy(a.position).project(camera);
      const dist = camera.position.distanceTo(a.position);
      const px = a.radius / (dist * perPixel);
      const onScreen =
        projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1;
      // A label only while the world is small on screen; up close the world speaks for itself.
      const show = onScreen && px < 18 ? Math.min(1, (18 - px) / 8) : 0;
      el.style.opacity = String(show);
      if (show > 0) {
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        el.style.transform = `translate(${x.toFixed(1)}px, ${(y + Math.max(6, px) + 4).toFixed(1)}px) translateX(-50%)`;
      }
    }
  }

  // --- The clock ---------------------------------------------------------------------------------------
  let playing = opts.autoplay;
  /** The story reached the deadline by playing: the finished planet keeps turning. */
  let resting = false;
  let visible = true;
  let speed = 1;
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
      resize();
    }
  }

  const tmpTarget = new THREE.Vector3();
  function placeCamera(pose: Pose) {
    // The reader's turn and tilt, about the target, on top of the director's direction.
    const dir = new THREE.Vector3(...pose.dir);
    if (user.azim || user.elev) {
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), user.azim * RAD);
      const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
      const tilted = dir.clone().applyAxisAngle(side, -user.elev * RAD);
      if (Math.abs(tilted.y) < 0.985) dir.copy(tilted);
    }
    // Fit the frame inside the box: its radius in pixels against the canvas's height.
    const half = Math.atan(Math.tan((FOV / 2) * RAD) * (boxRadius / (height / 2)));
    const distance = (pose.frame * user.zoom) / Math.tan(half);
    tmpTarget.set(...pose.target);
    camera.position.copy(tmpTarget).addScaledVector(dir.normalize(), distance);
    camera.near = Math.max(0.005, distance * 0.01);
    camera.far = 4000;
    camera.up.set(0, 1, 0);
    camera.lookAt(tmpTarget);
    camera.updateProjectionMatrix();
  }

  function draw(now: number) {
    raf = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    if (playing) {
      clock += dt * speed;
      day = timeline.dayAt(clock);
      if (clock >= timeline.duration) {
        day = data.end;
        playing = false;
        resting = true;
        opts.onEnd();
      }
    }
    motion += dt;
    if (playing || resting || interactive) adapt(dt);
    // Ease the reader's camera toward where they put it.
    const k = 1 - Math.exp(-dt * 10);
    user.azim += (userTarget.azim - user.azim) * k;
    user.elev += (userTarget.elev - user.elev) * k;
    user.zoom *= (userTarget.zoom / user.zoom) ** k;
    const settling =
      Math.abs(userTarget.azim - user.azim) > 0.05 ||
      Math.abs(userTarget.elev - user.elev) > 0.05 ||
      Math.abs(Math.log(userTarget.zoom / user.zoom)) > 0.002;

    let pose = story.pose(day);
    if (following !== "story" || followFrom) {
      const want = followShot(following, day);
      const t = Math.min(1, (motion - followSince) / 1.4);
      const kk = t * t * (3 - 2 * t);
      pose = followFrom ? blend(followFrom, want, kk) : want;
      if (t >= 1) followFrom = undefined;
    }
    placeCamera(pose);
    const hold = playing ? timeline.holdAt(clock) : undefined;
    const beat = hold && Math.abs(hold.day - day) < 1e-6 ? hold.progress : undefined;
    world.apply(day, motion, stageAt(day, data, beat), pose, camera, renderer.getPixelRatio());
    composer.render();
    placeLabels();
    opts.onDay(day);
    // Keep drawing while the story plays or rests on the finished planet, while the camera moves
    // or settles, and while the reader drags it. Paused, it holds still and spends nothing.
    const moving =
      playing ||
      resting ||
      settling ||
      followFrom !== undefined ||
      drag !== undefined ||
      pinch.size > 0;
    if (visible && moving) raf = requestAnimationFrame(draw);
    // For checks and the reader's tools: "1" once the frame asked for is drawn and nothing moves.
    canvas.dataset.idle = raf ? "0" : "1";
  }
  function request() {
    if (!raf && visible) {
      canvas.dataset.idle = "0";
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

  const controller: JourneyController = {
    canvas,
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
    setSpeed(s: number) {
      speed = Math.max(0.25, Math.min(8, s));
    },
    setData(next: JourneyData) {
      if (next === data) return;
      // Build the new world before freeing the old, so their shared shader programs stay compiled.
      const old = world;
      data = next;
      world = buildWorld(renderer, data, maps, () => request());
      scenePass.scene = world.scene;
      old.dispose();
      timeline = timelineOf(data);
      story = director(data, timeline);
      at = placer(data).at;
      day = Math.min(data.end, Math.max(data.start, day));
      clock = timeline.secondsAt(day);
      if (followFrom) followFrom = followShot(following, day);
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
    attach(h: HTMLElement, b: HTMLElement, labels?: HTMLElement) {
      host = h;
      box = b;
      if (canvas.parentElement !== h) h.prepend(canvas);
      for (const el of labelEls.values()) el.remove();
      labelEls.clear();
      labelHost = labels;
      resize();
      request();
    },
    setInteractive(on: boolean) {
      interactive = on;
      canvas.style.touchAction = on ? "none" : "";
      canvas.style.cursor = on ? "grab" : "";
    },
    follow(who: Follow) {
      followFrom = followShot(following, day);
      following = who;
      followSince = motion;
      request();
    },
    zoom(k: number) {
      zoomBy(k);
    },
    resetView() {
      userTarget.azim = 0;
      userTarget.elev = 0;
      userTarget.zoom = 1;
      request();
    },
    layout() {
      resize();
      request();
    },
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      for (const el of labelEls.values()) el.remove();
      world.dispose();
      maps.dispose();
      composer.dispose();
      bloom.dispose();
      target.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
  return controller;
}
