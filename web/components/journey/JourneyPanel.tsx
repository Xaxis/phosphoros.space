"use client";
import { formatNumber } from "@phosphoros/calc";
/**
 * The Explorer's journey: the reader's variant told in 3D, by the same engine as the home page. Move a
 * slider and every event moves to its new date on the same canvas: the Foundry grows at the new
 * doubling time, the Lattice and the Crown take their new sizes, the seas fill to the new shares and
 * the air follows the variant's simulation. The plan's own dates stay on the slider as hollow ticks,
 * so the reader sees what moved. A late variant runs past the deadline to its own finish.
 *
 * The scene is a button: it opens the variant full screen, with every step, the camera and the
 * readings, as the home page's journey does.
 */
import { useMemo, useRef } from "react";
import { monthYear, yearOf } from "./format.ts";
import { JourneyDialog } from "./JourneyDialog";
import { PlayButton } from "./JourneyHero";
import type { JourneyData } from "./types.ts";
import { useJourney } from "./useJourney.ts";

export function JourneyPanel({
  data,
  plan,
  changed,
  stale,
}: {
  /** The variant's story. */
  data: JourneyData;
  /** The published plan's, for the hollow ticks. */
  plan: JourneyData;
  changed: boolean;
  /** The model cannot run the current sliders; this is the last variant it could. */
  stale: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLButtonElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const whenRef = useRef<HTMLSpanElement>(null);
  const j = useJourney(
    data,
    { host: hostRef, box: boxRef, labels: labelsRef, slider: sliderRef, when: whenRef },
    { autoplay: false },
  );
  const { mode, playing, index, atEnd, open, scrub, step } = j;
  const close = () => {
    j.close();
    boxRef.current?.focus();
  };

  const event = data.events[Math.min(index, data.events.length - 1)];
  const span = data.end - data.start;
  const at = (day: number) => `${(((day - data.start) / span) * 100).toFixed(3)}%`;
  const years = Array.from(
    { length: yearOf(data.end) - yearOf(data.start) + 1 },
    (_, i) => yearOf(data.start) + i,
  );
  const late = data.end > data.deadline + 0.5;
  const earthLike = data.days["traj-earth-like"];
  const planEarthLike = plan.days["traj-earth-like"];
  const shift = useMemo(() => {
    if (!changed || earthLike === undefined || planEarthLike === undefined) return "";
    const days = Math.round(earthLike - planEarthLike);
    if (days === 0) return "Earth-like on the plan's own day.";
    return `Earth-like ${formatNumber(Math.abs(days), 3)} days ${days > 0 ? "later" : "sooner"} than the plan.`;
  }, [changed, earthLike, planEarthLike]);

  return (
    <section className="journey-panel" aria-labelledby="journey-panel-title" data-scene={mode}>
      <h2 className="explorer-h" id="journey-panel-title">
        {changed ? "This variant, flown" : "The plan, flown"}
      </h2>
      <div className="journey-panel-card">
        <div className="journey-panel-stage" ref={hostRef}>
          <div className="journey-labels" ref={labelsRef} aria-hidden="true" />
          <button
            type="button"
            className="journey-panel-box"
            ref={boxRef}
            onClick={() => j.setOpen(true)}
            disabled={mode !== "live"}
            aria-label={
              changed
                ? "Open this variant's journey full screen, to explore every step"
                : "Open the journey full screen, to explore every step"
            }
          >
            <span className="vision-open" aria-hidden="true">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />
              </svg>
              Full screen
            </span>
          </button>
          {mode === "none" ? (
            <p className="journey-panel-none">
              The 3D journey needs WebGL 2, which this browser does not offer. The figures below
              draw the same variant.
            </p>
          ) : null}
          {stale ? (
            <p className="journey-panel-stale">Showing the last variant the model could run.</p>
          ) : null}
        </div>
        <div className="journey-panel-bar">
          <p className="vision-caption journey-panel-caption">
            <span className="vision-when" ref={whenRef}>
              {monthYear(data.start)}
            </span>
            <span className="vision-text">
              {event?.tech ? <a href={`/technologies/${event.tech}`}>{event.text}</a> : event?.text}
            </span>
          </p>
          <div className="vision-controls">
            <PlayButton playing={playing} atEnd={atEnd} onClick={j.toggle} />
            <div className="vision-track">
              <input
                ref={sliderRef}
                type="range"
                min={data.start}
                max={data.end}
                step="any"
                defaultValue={data.start}
                aria-label="Date shown in the variant"
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
                {changed
                  ? plan.events
                      .filter((e) => e.day <= data.end)
                      .map((e) => (
                        <span
                          key={`p${e.day}`}
                          className="vision-mark is-plan"
                          style={{ left: at(e.day) }}
                        />
                      ))
                  : null}
                {data.events.map((e) => (
                  <span
                    key={e.day}
                    className={e.day <= (event?.day ?? 0) ? "vision-mark is-past" : "vision-mark"}
                    style={{ left: at(e.day) }}
                  />
                ))}
                {late ? (
                  <span className="vision-mark is-deadline" style={{ left: at(data.deadline) }} />
                ) : null}
              </span>
              <span className="vision-years" aria-hidden="true">
                {years.map((y) => (
                  <span key={y}>{y}</span>
                ))}
              </span>
            </div>
          </div>
          <p className="journey-panel-note">
            {changed
              ? "Every date, size and share follows this variant. Filled ticks are its events; hollow ticks are the plan's."
              : "Every date, size and share follows the model. Move a slider and the story moves with it."}{" "}
            {shift}
            {late ? " The red tick is the deadline: this variant finishes after it." : ""}
          </p>
        </div>
      </div>
      {open && j.engine.current ? (
        <JourneyDialog
          data={data}
          engine={j.engine.current}
          title={changed ? "This variant" : "The plan"}
          playing={playing}
          atEnd={atEnd}
          index={index}
          onPlay={j.play}
          onPause={j.pause}
          onScrub={scrub}
          onStep={step}
          onClose={close}
          subscribe={j.subscribe}
        />
      ) : null}
    </section>
  );
}
