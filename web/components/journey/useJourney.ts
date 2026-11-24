"use client";
/**
 * One journey player: the engine, its clock and the controls' state, for any page that shows the
 * journey. The home page's hero tells the published plan; the Explorer tells the reader's variant,
 * and a new variant only moves the story's dates on the same canvas (engine.setData), so the camera,
 * the day shown and the loaded maps stay put while a slider moves.
 *
 * Per-frame updates (the slider, the date) go straight to the DOM; React re-renders only when the
 * caption, the play state or the end state changes.
 */
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { JourneyController } from "./engine.ts";
import { eventAt, monthYear, stepDay } from "./format.ts";
import type { JourneyData } from "./types.ts";

function canRun(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/** still: waiting for the first frame. live: the journey runs. none: it never will here. */
export type JourneyMode = "still" | "live" | "none";

export interface JourneyElements {
  /** Holds the canvas, which fills it. */
  host: RefObject<HTMLElement | null>;
  /** The box inside the host that the story is framed in. */
  box: RefObject<HTMLElement | null>;
  labels: RefObject<HTMLDivElement | null>;
  slider: RefObject<HTMLInputElement | null>;
  when: RefObject<HTMLElement | null>;
}

/** A new variant waits this long for the sliders to settle before the world is rebuilt. */
const REBUILD_MS = 180;

export function useJourney(
  data: JourneyData,
  el: JourneyElements,
  /** Plays on its own (unless the reader prefers reduced motion: then still on the Earth-like day). */
  { autoplay }: { autoplay: boolean },
) {
  const engineRef = useRef<JourneyController | null>(null);
  const dataRef = useRef(data);
  /** The story the engine tells. It trails dataRef while the sliders settle. */
  const toldRef = useRef(data);
  /**
   * The day last shown or asked for. Steps start from here, not from the slider: the slider moves
   * only when the next frame draws, so a second key press before then would step from a stale day
   * and be lost.
   */
  const dayRef = useRef(data.start);
  const indexRef = useRef(0);
  const atEndRef = useRef(false);
  const dayListeners = useRef(new Set<(day: number) => void>());
  const inViewRef = useRef(true);
  const openRef = useRef(false);
  const [mode, setMode] = useState<JourneyMode>("still");
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  /** Showing the deadline: the play button replays the story from the start. */
  const [atEnd, setAtEnd] = useState(false);
  const [open, setOpen] = useState(false);
  openRef.current = open;
  const { host, box, labels, slider, when } = el;

  const show = useCallback(
    (day: number) => {
      const d = dataRef.current;
      dayRef.current = day;
      const i = eventAt(d, day);
      const label = monthYear(day);
      const s = slider.current;
      if (s) {
        s.value = String(Math.round(day));
        s.setAttribute("aria-valuetext", `${label}: ${d.events[i]?.text ?? ""}`);
      }
      if (when.current) when.current.textContent = label;
      if (i !== indexRef.current) {
        indexRef.current = i;
        setIndex(i);
      }
      const end = day >= d.end - 0.5;
      if (end !== atEndRef.current) {
        atEndRef.current = end;
        setAtEnd(end);
      }
      for (const f of dayListeners.current) f(day);
    },
    [slider, when],
  );

  /**
   * Hands the engine the story on screen. A new variant waits for the sliders to settle, but a
   * reader who plays or scrubs before then means the story they can see, not the one before it.
   */
  const sync = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || toldRef.current === dataRef.current) return;
    toldRef.current = dataRef.current;
    engine.setData(dataRef.current);
  }, []);

  // Create the engine once; it lives as long as the page does.
  useEffect(() => {
    const h = host.current;
    const b = box.current;
    const l = labels.current;
    if (!h || !b || !l) return;
    if (!canRun()) {
      setMode("none");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = dataRef.current;
    const plays = autoplay && !reduced;
    const startDay = autoplay && reduced ? (d.days["traj-earth-like"] ?? d.end) : d.start;
    let cancelled = false;
    let resize: ResizeObserver | undefined;
    let watch: IntersectionObserver | undefined;
    const onVisibility = () =>
      engineRef.current?.setVisible((inViewRef.current || openRef.current) && !document.hidden);

    import("./engine.ts").then(({ createJourney }) => {
      if (cancelled) return;
      let first = true;
      const engine = createJourney(d, {
        autoplay: plays,
        startDay,
        onDay: (day) => {
          show(day);
          if (first) {
            first = false;
            setMode("live");
          }
        },
        onLost: () => setMode("none"),
        onEnd: () => setPlaying(false),
      });
      engineRef.current = engine;
      toldRef.current = d;
      // A variant that arrived while the engine loaded.
      sync();
      engine.attach(h, b, l);
      setPlaying(plays);
      resize = new ResizeObserver(() => engine.layout());
      resize.observe(h);
      watch = new IntersectionObserver(([entry]) => {
        inViewRef.current = Boolean(entry?.isIntersecting);
        onVisibility();
      });
      watch.observe(h);
      document.addEventListener("visibilitychange", onVisibility);
    });
    return () => {
      cancelled = true;
      resize?.disconnect();
      watch?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [autoplay, host, box, labels, show, sync]);

  // A new variant: once the sliders settle, the same engine tells the new story.
  useEffect(() => {
    if (dataRef.current === data) return;
    dataRef.current = data;
    const t = setTimeout(sync, REBUILD_MS);
    return () => clearTimeout(t);
  }, [data, sync]);

  const play = useCallback(() => {
    sync();
    engineRef.current?.play();
    setPlaying(true);
  }, [sync]);
  const pause = useCallback(() => {
    engineRef.current?.pause();
    setPlaying(false);
  }, []);
  const toggle = () => (playing ? pause() : play());
  const scrub = useCallback(
    (day: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      sync();
      engine.pause();
      setPlaying(false);
      const d = dataRef.current;
      dayRef.current = Math.min(d.end, Math.max(d.start, day));
      engine.setDay(day);
    },
    [sync],
  );
  const step = useCallback(
    (direction: 1 | -1) => scrub(stepDay(dataRef.current, dayRef.current, direction)),
    [scrub],
  );

  /** Gives the canvas back to this page after the full-screen dialog closes. */
  const close = useCallback(() => {
    const engine = engineRef.current;
    const h = host.current;
    const b = box.current;
    const l = labels.current;
    setOpen(false);
    if (engine && h && b && l) {
      engine.setInteractive(false);
      engine.follow("story");
      engine.resetView();
      engine.attach(h, b, l);
      engine.setVisible(inViewRef.current && !document.hidden);
    }
  }, [host, box, labels]);

  const subscribe = useCallback((f: (day: number) => void) => {
    dayListeners.current.add(f);
    return () => {
      dayListeners.current.delete(f);
    };
  }, []);

  return {
    engine: engineRef,
    mode,
    playing,
    index,
    atEnd,
    open,
    setOpen,
    play,
    pause,
    toggle,
    scrub,
    step,
    close,
    subscribe,
  };
}
