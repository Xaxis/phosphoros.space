"use client";
/**
 * The journey full screen, over the page: the same canvas as the hero, moved into a modal dialog
 * where the reader can drag to turn the camera, scroll or pinch to zoom, follow any world, jump to
 * any step, change the speed, and read Venus's air as the model has it on the day shown.
 *
 * A native <dialog> opened with showModal(): it sits in the top layer above everything, makes the
 * page behind it inert, and closes on Escape. Per-frame updates (the slider, the date, the readings)
 * go straight to the DOM; React re-renders only when the caption changes.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Follow, JourneyController } from "./engine.ts";
import { formatReading, monthYear, readingAt, yearOf } from "./format.ts";
import { PlayButton } from "./JourneyHero";
import type { Chapter, JourneyData, Readout } from "./types.ts";

const CHAPTERS: Record<Chapter, string> = {
  earth: "Earth",
  mercury: "Mercury",
  ceres: "Ceres",
  lattice: "The Lattice",
  venus: "Venus",
};

const FOLLOW: { id: Follow; label: string }[] = [
  { id: "story", label: "The story" },
  { id: "sun", label: "Sun" },
  { id: "mercury", label: "Mercury" },
  { id: "venus", label: "Venus" },
  { id: "earth", label: "Earth" },
  { id: "ceres", label: "Ceres" },
];

const SPEEDS = [0.5, 1, 2, 4];

/** A reading's curve across the whole plan, as an SVG path in a 100 × 28 box. */
function sparkline(r: Readout, start: number, end: number) {
  const log = r.kind === "pressure";
  const ys = r.points.map(([, y]) => (log ? Math.log10(Math.max(y, 1)) : y));
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const x = (day: number) => ((day - start) / (end - start)) * 100;
  const y = (v: number) => 26 - ((v - lo) / Math.max(hi - lo, 1e-9)) * 24;
  const path = r.points
    .map(([d], i) => `${i ? "L" : "M"}${x(d).toFixed(2)} ${y(ys[i] as number).toFixed(2)}`)
    .join("");
  return { path, x, y: (v: number) => y(log ? Math.log10(Math.max(v, 1)) : v) };
}

export function JourneyDialog({
  data,
  engine,
  title = "The plan",
  playing,
  atEnd,
  index,
  onPlay,
  onPause,
  onScrub,
  onStep,
  onClose,
  subscribe,
}: {
  data: JourneyData;
  engine: JourneyController;
  /** What the story is: the plan, or the Explorer's variant. */
  title?: string;
  playing: boolean;
  atEnd: boolean;
  index: number;
  onPlay: () => void;
  onPause: () => void;
  onScrub: (day: number) => void;
  /** To the next (1) or previous (-1) captioned day. */
  onStep: (direction: 1 | -1) => void;
  onClose: () => void;
  subscribe: (f: (day: number) => void) => () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const whenRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const readingRefs = useRef<(HTMLElement | null)[]>([]);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [follow, setFollow] = useState<Follow>("story");
  const [speed, setSpeed] = useState(1);
  const [stepsOpen, setStepsOpen] = useState(false);
  const curves = useMemo(
    () => data.readouts.map((r) => sparkline(r, data.start, data.end)),
    [data],
  );

  // Open as a modal, hand the canvas over, and give it back on close.
  useEffect(() => {
    const dialog = dialogRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    const labels = labelsRef.current;
    if (!dialog || !stage || !frame || !labels) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    engine.attach(stage, frame, labels);
    engine.setInteractive(true);
    engine.setVisible(true);
    const resize = new ResizeObserver(() => engine.layout());
    resize.observe(stage);
    resize.observe(frame);
    return () => {
      resize.disconnect();
      root.style.overflow = overflow;
      engine.setSpeed(1);
    };
  }, [engine]);

  // Every frame: the slider, the date and the readings.
  useEffect(
    () =>
      subscribe((day) => {
        const slider = sliderRef.current;
        if (slider && document.activeElement !== slider) slider.value = String(Math.round(day));
        const label = monthYear(day);
        if (whenRef.current) whenRef.current.textContent = label;
        slider?.setAttribute("aria-valuetext", `${label}: ${data.events[index]?.text ?? ""}`);
        data.readouts.forEach((r, i) => {
          const value = readingAt(r, day);
          const el = readingRefs.current[i];
          if (el) el.textContent = formatReading(r, value);
          const marker = markerRefs.current[i];
          const curve = curves[i];
          if (marker && curve) {
            marker.style.left = `${Math.min(100, Math.max(0, curve.x(day))).toFixed(2)}%`;
            marker.style.top = `${(((value === undefined ? 26 : curve.y(value)) / 28) * 100).toFixed(2)}%`;
            marker.style.opacity = value === undefined ? "0.35" : "1";
          }
        });
      }),
    [subscribe, data, index, curves],
  );

  // Keep the current step in view in the list.
  useEffect(() => {
    const item = listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    item?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [index]);

  const toggle = () => (playing ? onPause() : onPlay());
  /**
   * Closes the modal first: while it is open the page behind it is inert, and the page could not
   * take the focus back.
   */
  const dismiss = () => {
    dialogRef.current?.close();
    onClose();
  };
  const step = onStep;
  const choose = (who: Follow) => {
    setFollow(who);
    engine.follow(who);
  };
  const event = data.events[index];
  const span = data.end - data.start;
  const years = Array.from(
    { length: yearOf(data.end) - yearOf(data.start) + 1 },
    (_, i) => yearOf(data.start) + i,
  );

  return (
    <dialog
      ref={dialogRef}
      className="journey-dialog"
      // Focusable, so a click on the scene leaves the keys with the dialog: Space plays and pauses.
      tabIndex={-1}
      aria-labelledby="journey-title"
      onCancel={(e) => {
        e.preventDefault();
        dismiss();
      }}
      onKeyDown={(e) => {
        const target = e.target as HTMLElement;
        const typing =
          target.tagName === "INPUT" || target.tagName === "BUTTON" || target.tagName === "A";
        if (e.key === " " && !typing) {
          e.preventDefault();
          toggle();
        } else if (
          (e.key === "ArrowRight" || e.key === "ArrowLeft") &&
          target.tagName !== "INPUT"
        ) {
          if (typing && target.closest(".journey-speed, .journey-follow")) return;
          e.preventDefault();
          step(e.key === "ArrowRight" ? 1 : -1);
        } else if ((e.key === "+" || e.key === "=") && !typing) {
          engine.zoom(0.8);
        } else if (e.key === "-" && !typing) {
          engine.zoom(1.25);
        }
      }}
    >
      <div className="journey-stage" ref={stageRef}>
        <div className="journey-labels" ref={labelsRef} aria-hidden="true" />
      </div>
      <div className="journey-layout" data-steps={stepsOpen ? "open" : "closed"}>
        <header className="journey-top">
          <h2 id="journey-title" className="journey-title">
            {title}, 2027 to {yearOf(data.end)}
          </h2>
          <fieldset className="journey-follow">
            <legend className="journey-follow-label">Camera</legend>
            {FOLLOW.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={follow === f.id}
                onClick={() => choose(f.id)}
              >
                {f.label}
              </button>
            ))}
          </fieldset>
          <div className="journey-view">
            <button type="button" onClick={() => engine.zoom(0.8)} aria-label="Zoom in">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 3v10M3 8h10" />
              </svg>
            </button>
            <button type="button" onClick={() => engine.zoom(1.25)} aria-label="Zoom out">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h10" />
              </svg>
            </button>
            <button type="button" onClick={() => engine.resetView()} className="journey-reset">
              Reset view
            </button>
            <button
              type="button"
              className="journey-close"
              onClick={dismiss}
              aria-label="Close the journey"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
              </svg>
            </button>
          </div>
        </header>

        <div className="journey-frame" ref={frameRef} aria-hidden="true" />

        <aside className="journey-side" aria-label="Every step of the plan">
          <button
            type="button"
            className="journey-steps-toggle"
            aria-expanded={stepsOpen}
            onClick={() => setStepsOpen((o) => !o)}
          >
            {stepsOpen ? "Hide the steps" : `All ${data.events.length} steps`}
          </button>
          <ol className="journey-steps" ref={listRef}>
            {data.events.map((e, i) => (
              <li key={e.day} data-index={i} data-chapter={e.chapter}>
                <button
                  type="button"
                  aria-current={i === index ? "step" : undefined}
                  className={i < index ? "is-past" : undefined}
                  onClick={() => onScrub(e.day)}
                >
                  <span className="journey-step-when">
                    {e.when}
                    <span className="journey-step-chapter">{CHAPTERS[e.chapter]}</span>
                  </span>
                  <span className="journey-step-text">{e.text}</span>
                </button>
              </li>
            ))}
          </ol>
          <dl className="journey-readings" aria-label="Venus on the day shown, from the model">
            {data.readouts.map((r, i) => {
              const curve = curves[i];
              return (
                <div key={r.id} className="journey-reading">
                  <dt>{r.label}</dt>
                  <dd
                    ref={(el) => {
                      readingRefs.current[i] = el;
                    }}
                  >
                    {formatReading(r, readingAt(r, data.start))}
                  </dd>
                  {curve ? (
                    <span className="journey-spark" aria-hidden="true">
                      <svg viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
                        <path d={curve.path} vectorEffect="non-scaling-stroke" />
                      </svg>
                      <span
                        className="journey-spark-dot"
                        ref={(el) => {
                          markerRefs.current[i] = el;
                        }}
                      />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </dl>
        </aside>

        <footer className="journey-bottom">
          <p className="journey-caption" aria-live="polite">
            <span className="journey-when" ref={whenRef}>
              {monthYear(event?.day ?? data.start)}
            </span>
            <span className="journey-text">
              {event?.tech ? (
                <a href={`/technologies/${event.tech}`} onClick={dismiss}>
                  {event.text}
                </a>
              ) : (
                event?.text
              )}
            </span>
          </p>
          <div className="journey-controls">
            <PlayButton playing={playing} atEnd={atEnd} onClick={toggle} className="vision-play" />
            <fieldset className="journey-speed">
              <legend className="visually-hidden">Speed</legend>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={speed === s}
                  onClick={() => {
                    setSpeed(s);
                    engine.setSpeed(s);
                  }}
                >
                  {s === 0.5 ? "½" : s}×
                </button>
              ))}
            </fieldset>
            <div className="vision-track journey-track">
              <input
                ref={sliderRef}
                type="range"
                min={data.start}
                max={data.end}
                step="any"
                defaultValue={event?.day ?? data.start}
                aria-label="Date shown"
                onInput={(e) => onScrub(Number(e.currentTarget.value))}
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
                {data.events.map((e, i) => (
                  <span
                    key={e.day}
                    className={i <= index ? "vision-mark is-past" : "vision-mark"}
                    data-chapter={e.chapter}
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
          <p className="journey-hint">
            Drag to turn the view, scroll or pinch to zoom. Space plays and pauses; the arrow keys
            step between events. Sizes and distances are not to scale; dates, places and the air
            follow the model.
          </p>
        </footer>
      </div>
    </dialog>
  );
}
