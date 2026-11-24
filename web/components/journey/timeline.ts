/**
 * The animation's clock. Playback slows into every captioned event, so each caption stays on screen
 * long enough to read, and covers quiet years quickly. It never stops dead between events, and it
 * plays the decade once: at the deadline the story is over and the finished planet stays.
 * Pure: a time in seconds always maps to the same day.
 */

interface Segment {
  from: number;
  to: number;
  /** Seconds the segment takes. */
  seconds: number;
}

export interface Timeline {
  /** Seconds from the first day to the deadline. */
  duration: number;
  /**
   * Inside a hold, the day it holds and how far through the hold (0 to 1) playback is. A hold
   * stops the calendar on one day for a few seconds while something happens in it: the rockets
   * climbing away from Earth take an hour, not a share of a decade.
   */
  holdAt(seconds: number): { day: number; progress: number } | undefined;
  dayAt(seconds: number): number;
  /** The playback time that shows a day, for resuming after the reader scrubs. */
  secondsAt(day: number): number;
}

/**
 * Slow near both ends of a segment, but still moving: at an event the speed falls to 55% of the
 * segment's mean rather than to zero, so the planet never seems to stall.
 */
const ease = (t: number) => 0.55 * t + 0.45 * t * t * (3 - 2 * t);

/**
 * Each gap between captions takes 3 to 5.5 seconds, longer for longer gaps. `holds` stops the
 * calendar on some days for the given seconds.
 */
export function makeTimeline(
  eventDays: number[],
  start: number,
  end: number,
  holds: Record<number, number> = {},
): Timeline {
  const stops = [...new Set([start, ...eventDays, end])].sort((a, b) => a - b);
  const segments: Segment[] = [];
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1] as number;
    const to = stops[i] as number;
    const years = (to - from) / 365.25;
    segments.push({ from, to, seconds: Math.min(5.5, Math.max(3, 2.4 + years * 1.2)) });
    const hold = holds[to];
    if (hold && to < end) segments.push({ from: to, to, seconds: hold });
  }
  const duration = segments.reduce((s, x) => s + x.seconds, 0);

  function dayAt(seconds: number): number {
    if (seconds <= 0) return start;
    let t = seconds;
    for (const s of segments) {
      if (t <= s.seconds) return s.from + (s.to - s.from) * ease(t / s.seconds);
      t -= s.seconds;
    }
    return end;
  }

  function secondsAt(day: number): number {
    let t = 0;
    for (const s of segments) {
      if (day <= s.to) {
        // Invert the easing by bisection; it is monotonic.
        const target = (day - s.from) / Math.max(1e-9, s.to - s.from);
        let lo = 0;
        let hi = 1;
        for (let i = 0; i < 30; i++) {
          const mid = (lo + hi) / 2;
          if (ease(mid) < target) lo = mid;
          else hi = mid;
        }
        return t + s.seconds * Math.max(0, lo);
      }
      t += s.seconds;
    }
    return duration;
  }

  function holdAt(seconds: number) {
    let t = seconds;
    for (const s of segments) {
      if (t < s.seconds) {
        return s.from === s.to ? { day: s.from, progress: Math.max(0, t / s.seconds) } : undefined;
      }
      t -= s.seconds;
    }
    return undefined;
  }

  return { duration, dayAt, secondsAt, holdAt };
}
