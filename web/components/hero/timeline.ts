/**
 * The animation's clock. Playback slows into every captioned event, so each caption stays on screen
 * long enough to read, and covers quiet years quickly. After the deadline it holds, then rewinds.
 * Pure: a time in seconds always maps to the same day.
 */

interface Segment {
  from: number;
  to: number;
  /** Seconds the segment takes. */
  seconds: number;
}

export interface Timeline {
  /** Seconds in one loop: play, hold, rewind. */
  period: number;
  dayAt(seconds: number): number;
  /** The playback time that shows a day, for resuming after the reader scrubs. */
  secondsAt(day: number): number;
}

const HOLD_SECONDS = 7;
const REWIND_SECONDS = 2.6;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Each gap between captions takes 2.8 to 5 seconds, longer for longer gaps. */
export function makeTimeline(eventDays: number[], start: number, end: number): Timeline {
  const stops = [...new Set([start, ...eventDays, end])].sort((a, b) => a - b);
  const segments: Segment[] = [];
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1] as number;
    const to = stops[i] as number;
    const years = (to - from) / 365.25;
    segments.push({ from, to, seconds: Math.min(5, Math.max(2.8, 2.2 + years * 1.1)) });
  }
  const play = segments.reduce((s, x) => s + x.seconds, 0);
  const period = play + HOLD_SECONDS + REWIND_SECONDS;

  function dayAt(seconds: number): number {
    let t = ((seconds % period) + period) % period;
    if (t >= play + HOLD_SECONDS) {
      const back = (t - play - HOLD_SECONDS) / REWIND_SECONDS;
      return end - (end - start) * smooth(back);
    }
    if (t >= play) return end;
    for (const s of segments) {
      if (t <= s.seconds) return s.from + (s.to - s.from) * smooth(t / s.seconds);
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
          if (smooth(mid) < target) lo = mid;
          else hi = mid;
        }
        return t + s.seconds * Math.max(0, lo);
      }
      t += s.seconds;
    }
    return play;
  }

  return { period, dayAt, secondsAt };
}
