"use client";
/**
 * The home page's hero: the plan from 2027 to the deadline, across the inner solar system. Earth
 * launches the seeds, Mercury's Foundry builds the Lattice and the Veil, Ceres throws the ice, and
 * Venus clears, freezes and greens. The text beside it renders on the server; the 3D journey loads
 * afterwards and only where WebGL 2 works. Everywhere else, and until the first frame, the page
 * shows a still planet instead.
 *
 * Motion: it plays on its own unless the reader prefers reduced motion, in which case it starts
 * still on the Earth-like day. A pause button and a date slider always work; the arrow keys on the
 * slider step from one event to the next. The planet is a button: it opens the journey full screen,
 * where the reader can turn the camera, follow any world and read the air's numbers as they change.
 */
import { type ReactNode, useRef } from "react";
import { monthYear } from "./format.ts";
import { JourneyDialog } from "./JourneyDialog";
import type { JourneyData } from "./types.ts";
import { useJourney } from "./useJourney.ts";

const EPOCH_MS = Date.UTC(2027, 0, 1);

export function JourneyHero({
  data,
  children,
  footer,
}: {
  data: JourneyData;
  /** The hero's text: eyebrow, title, lead and actions. */
  children: ReactNode;
  /** Shown across the bottom of the hero. */
  footer?: ReactNode;
}) {
  const frameRef = useRef<HTMLElement>(null);
  const planetRef = useRef<HTMLButtonElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const whenRef = useRef<HTMLSpanElement>(null);
  const j = useJourney(
    data,
    { host: frameRef, box: planetRef, labels: labelsRef, slider: sliderRef, when: whenRef },
    { autoplay: true },
  );
  const { mode, playing, index, atEnd, open, scrub, step } = j;
  const close = () => {
    j.close();
    planetRef.current?.focus();
  };

  const event = data.events[index];
  const span = data.end - data.start;
  const firstYear = new Date(EPOCH_MS + data.start * 86_400_000).getUTCFullYear();
  const lastYear = new Date(EPOCH_MS + data.end * 86_400_000).getUTCFullYear();
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  return (
    <section className="hero hero-space" ref={frameRef} data-scene={mode}>
      <div className="hero-scrim" aria-hidden="true" />
      <div className="journey-labels" ref={labelsRef} aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-text">{children}</div>
        <figure
          className="vision"
          aria-label="The plan from 2027 to 2036, across the inner solar system"
        >
          <button
            type="button"
            className="vision-planet"
            ref={planetRef}
            onClick={() => j.setOpen(true)}
            disabled={mode !== "live"}
            aria-label="Open the journey full screen, to explore every step"
          >
            <span className="vision-still" aria-hidden="true" />
            <span className="vision-open" aria-hidden="true">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />
              </svg>
              Explore
            </span>
          </button>
          <figcaption className="vision-caption">
            <span className="vision-when" ref={whenRef}>
              {monthYear(data.start)}
            </span>
            <span className="vision-text">
              {event?.tech ? <a href={`/technologies/${event.tech}`}>{event.text}</a> : event?.text}
            </span>
          </figcaption>
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
                    className={e.day <= (event?.day ?? 0) ? "vision-mark is-past" : "vision-mark"}
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
            Every date, every world&rsquo;s place and the air&rsquo;s cooling, clearing and greening
            follow the model. Sizes and distances are not to scale.
          </p>
        </figure>
        {footer}
      </div>
      {open && j.engine.current ? (
        <JourneyDialog
          data={data}
          engine={j.engine.current}
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

export function PlayButton({
  playing,
  atEnd,
  onClick,
  className = "vision-play",
}: {
  playing: boolean;
  atEnd: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={
        playing
          ? "Pause the animation"
          : atEnd
            ? "Replay the animation from 2027"
            : "Play the animation"
      }
    >
      {playing ? (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
          <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
        </svg>
      ) : atEnd ? (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2.2a5.8 5.8 0 1 1-5.6 4.3.9.9 0 1 1 1.7.5A4 4 0 1 0 8 4h-.6l1.1 1.1a.9.9 0 0 1-1.3 1.3L4.6 3.8a.9.9 0 0 1 0-1.3l2.6-2.6a.9.9 0 0 1 1.3 1.3L7.4 2.2Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4.5 2.8v10.4a.8.8 0 0 0 1.2.7l8.4-5.2a.8.8 0 0 0 0-1.4L5.7 2.1a.8.8 0 0 0-1.2.7Z" />
        </svg>
      )}
    </button>
  );
}
