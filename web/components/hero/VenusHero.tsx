"use client";
/**
 * The home page's hero: Venus from 2027 to the deadline, as the plan's technologies arrive. The
 * text beside it renders on the server; the 3D scene loads afterwards and only where WebGL 2 works.
 * Everywhere else, and until the first frame, the page shows a still planet instead.
 *
 * Motion: it plays on its own unless the reader prefers reduced motion, in which case it starts
 * still on the Earth-like day. A pause button and a date slider always work; the arrow keys on the
 * slider step from one event to the next.
 */
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { SceneController } from "./scene";
import type { HeroData } from "./types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const EPOCH_MS = Date.UTC(2027, 0, 1);

function monthYear(day: number): string {
  const d = new Date(EPOCH_MS + Math.round(day) * 86_400_000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function eventAt(data: HeroData, day: number): number {
  let index = 0;
  data.events.forEach((e, i) => {
    if (e.day <= day + 0.5) index = i;
  });
  return index;
}

function canRun(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/** still: waiting for the first frame. live: the scene runs. none: it never will here. */
type Mode = "still" | "live" | "none";

export function VenusHero({
  data,
  children,
  footer,
}: {
  data: HeroData;
  /** The hero's text: eyebrow, title, lead and actions. */
  children: ReactNode;
  /** Shown across the bottom of the hero. */
  footer?: ReactNode;
}) {
  const frameRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planetRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const whenRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<SceneController | null>(null);
  const indexRef = useRef(0);
  const [mode, setMode] = useState<Mode>("still");
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);

  const show = useCallback(
    (day: number) => {
      const slider = sliderRef.current;
      const i = eventAt(data, day);
      const label = monthYear(day);
      if (slider) {
        slider.value = String(Math.round(day));
        slider.setAttribute("aria-valuetext", `${label}: ${data.events[i]?.text ?? ""}`);
      }
      if (whenRef.current) whenRef.current.textContent = label;
      if (i !== indexRef.current) {
        indexRef.current = i;
        setIndex(i);
      }
    },
    [data],
  );

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const planet = planetRef.current;
    if (!frame || !canvas || !planet) return;
    if (!canRun()) {
      setMode("none");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const earthLike = data.days["traj-earth-like"] ?? data.end;
    let cancelled = false;
    let inView = true;
    let resize: ResizeObserver | undefined;
    let watch: IntersectionObserver | undefined;
    const onVisibility = () => sceneRef.current?.setVisible(inView && !document.hidden);

    import("./scene").then(({ createScene }) => {
      if (cancelled) return;
      let first = true;
      const scene = createScene(canvas, frame, planet, data, {
        autoplay: !reduced,
        startDay: reduced ? earthLike : data.start,
        onDay: (day) => {
          show(day);
          if (first) {
            first = false;
            setMode("live");
          }
        },
        onLost: () => setMode("none"),
      });
      sceneRef.current = scene;
      setPlaying(!reduced);
      resize = new ResizeObserver(() => scene.layout());
      resize.observe(frame);
      watch = new IntersectionObserver(([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        onVisibility();
      });
      watch.observe(frame);
      document.addEventListener("visibilitychange", onVisibility);
    });
    return () => {
      cancelled = true;
      resize?.disconnect();
      watch?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [data, show]);

  const toggle = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (playing) scene.pause();
    else scene.play();
    setPlaying(!playing);
  };

  const scrub = (day: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.pause();
    setPlaying(false);
    scene.setDay(day);
  };

  const step = (direction: 1 | -1) => {
    const current = Number(sliderRef.current?.value ?? data.start);
    const days = [data.start, ...data.events.map((e) => e.day), data.end];
    const next =
      direction > 0
        ? days.find((d) => d > current + 0.5)
        : [...days].reverse().find((d) => d < current - 0.5);
    if (next !== undefined) scrub(next);
  };

  const event = data.events[index];
  const span = data.end - data.start;
  const firstYear = new Date(EPOCH_MS + data.start * 86_400_000).getUTCFullYear();
  const lastYear = new Date(EPOCH_MS + data.end * 86_400_000).getUTCFullYear();
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  return (
    <section className="hero hero-space" ref={frameRef} data-scene={mode}>
      <canvas className="hero-canvas" ref={canvasRef} />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-text">{children}</div>
        <figure className="vision" aria-label="Venus from 2027 to 2036, as the plan unfolds">
          <div className="vision-planet" ref={planetRef} aria-hidden="true">
            <span className="vision-still" />
          </div>
          <figcaption className="vision-caption">
            <span className="vision-when" ref={whenRef}>
              {monthYear(data.start)}
            </span>
            <span className="vision-text">
              {event?.tech ? <a href={`/technologies/${event.tech}`}>{event.text}</a> : event?.text}
            </span>
          </figcaption>
          <div className="vision-controls">
            <button
              type="button"
              className="vision-play"
              onClick={toggle}
              aria-label={playing ? "Pause the animation" : "Play the animation"}
            >
              {playing ? (
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
                  <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4.5 2.8v10.4a.8.8 0 0 0 1.2.7l8.4-5.2a.8.8 0 0 0 0-1.4L5.7 2.1a.8.8 0 0 0-1.2.7Z" />
                </svg>
              )}
            </button>
            <div className="vision-track">
              <input
                ref={sliderRef}
                type="range"
                min={data.start}
                max={data.end}
                step={1}
                defaultValue={data.start}
                aria-label="Date shown"
                onInput={(e) => scrub(Number(e.currentTarget.value))}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                    e.preventDefault();
                    step(1);
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                    e.preventDefault();
                    step(-1);
                  }
                }}
              />
              <span className="vision-marks" aria-hidden="true">
                {data.events.map((e) => (
                  <span
                    key={e.day}
                    className={
                      e.day <= (data.events[index]?.day ?? 0)
                        ? "vision-mark is-past"
                        : "vision-mark"
                    }
                    style={{ left: `${((e.day - data.start) / span) * 100}%` }}
                  />
                ))}
              </span>
              <span className="vision-years" aria-hidden="true">
                {years.map((y) => (
                  <span key={y}>{y}</span>
                ))}
              </span>
            </div>
          </div>
          <p className="vision-note">
            Every date and the air&rsquo;s cooling, clearing and greening follow the model&rsquo;s
            day-by-day simulation. Sizes and distances are not to scale.
          </p>
        </figure>
        {footer}
      </div>
    </section>
  );
}
