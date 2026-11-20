"use client";
/**
 * The decade as an interactive Gantt chart. Same rows and dates as the gantt figure (every date from
 * the model); here a reader can filter lanes, keep only the critical path, move a date cursor to see
 * what is under way, and select a workstream for its dates and its technology page.
 *
 * It renders on the server too, so without JavaScript it is still the whole chart.
 */
import type { GanttProps, GanttRow } from "@phosphoros/figures/gantt";
import { useMemo, useState } from "react";

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
const dateOf = (day: number) => new Date(EPOCH_MS + Math.round(day) * 86_400_000);
const monthYear = (day: number) => {
  const d = dateOf(day);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/** A span of days in words: months under two years, years with one decimal after. */
function span(days: number): string {
  const months = days / 30.44;
  if (months < 1.5) return `${Math.max(1, Math.round(days))} days`;
  if (months < 24) return `${Math.round(months)} months`;
  return `${(months / 12).toFixed(1)} years`;
}

function kindOf(row: GanttRow): string {
  return row.kind === "gate"
    ? "Go or no-go gate"
    : row.kind === "milestone"
      ? "Milestone"
      : "Workstream";
}

export function GanttExplorer({ p }: { p: GanttProps }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [day, setDay] = useState(p.from);
  const [selected, setSelected] = useState<string | null>(null);

  const width = p.to - p.from;
  const pct = (d: number) => `${(((d - p.from) / width) * 100).toFixed(3)}%`;
  const firstYear = dateOf(p.from).getUTCFullYear();
  const lastYear = dateOf(p.to).getUTCFullYear();
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  const yearDay = (y: number) => (Date.UTC(y, 0, 1) - EPOCH_MS) / 86_400_000;

  const shown = (r: GanttRow) => !hidden.has(r.lane) && (!criticalOnly || r.critical || r.accent);
  const lanes = p.lanes
    .map((l) => ({ ...l, rows: p.rows.filter((r) => r.lane === l.id && shown(r)) }))
    .filter((l) => l.rows.length > 0);

  const now = useMemo(() => {
    const under = p.rows.filter((r) => r.end !== undefined && r.start <= day && day <= r.end);
    const points = p.rows.filter((r) => r.end === undefined).sort((a, b) => a.start - b.start);
    const last = [...points].reverse().find((r) => r.start <= day + 0.5);
    const next = points.find((r) => r.start > day + 0.5);
    return { under, last, next };
  }, [p.rows, day]);

  const pick = p.rows.find((r) => r.id === selected);
  const toggleLane = (id: string) =>
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  /** Pointer position over a track, as a day. */
  const dayAt = (e: React.PointerEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    return p.from + t * width;
  };

  return (
    <div className="tl">
      <div className="tl-controls">
        <fieldset className="tl-lanes">
          <legend>Lanes</legend>
          {p.lanes.map((l) => (
            <button
              key={l.id}
              type="button"
              className="tl-chip"
              aria-pressed={!hidden.has(l.id)}
              onClick={() => toggleLane(l.id)}
            >
              {l.label}
            </button>
          ))}
        </fieldset>
        <button
          type="button"
          className="tl-chip tl-critical"
          aria-pressed={criticalOnly}
          onClick={() => setCriticalOnly((c) => !c)}
        >
          Critical path only
        </button>
      </div>

      <div className="tl-date">
        <label htmlFor="tl-day">Date</label>
        <input
          id="tl-day"
          type="range"
          min={p.from}
          max={p.to}
          step={1}
          value={Math.round(day)}
          aria-valuetext={`${monthYear(day)}: ${now.under.length} workstreams under way`}
          onChange={(e) => setDay(Number(e.currentTarget.value))}
        />
        <output htmlFor="tl-day" className="tl-date-value">
          {monthYear(day)}
        </output>
      </div>

      <div className="tl-chart">
        <div className="tl-axis" aria-hidden="true">
          <span className="tl-axis-label" />
          <span className="tl-axis-track">
            {years.map((y) => (
              <span key={y} className="tl-year" style={{ left: pct(Math.max(p.from, yearDay(y))) }}>
                {y}
              </span>
            ))}
          </span>
        </div>
        <ul className="tl-rows">
          {lanes.map((l) => (
            <li key={l.id} className="tl-lane">
              <span className="tl-lane-name">{l.label}</span>
              <ul>
                {l.rows.map((r) => {
                  const isSel = r.id === selected;
                  const active =
                    r.end !== undefined
                      ? r.start <= day && day <= r.end
                      : Math.abs(r.start - day) < 20;
                  const when = r.endText ? `${r.startText} to ${r.endText}` : r.startText;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        className={`tl-row${r.critical ? " is-critical" : ""}${r.accent ? " is-accent" : ""}${active ? " is-active" : ""}`}
                        aria-pressed={isSel}
                        aria-label={`${r.label}: ${when}${r.critical ? ", on the critical path" : ""}`}
                        onClick={() => setSelected(isSel ? null : r.id)}
                      >
                        <span className="tl-label">{r.label}</span>
                        <span
                          className="tl-track"
                          onPointerMove={(e) => {
                            if (e.pointerType === "mouse") setDay(dayAt(e));
                          }}
                          onPointerDown={(e) => setDay(dayAt(e))}
                        >
                          {years.map((y) => (
                            <span key={y} className="tl-grid" style={{ left: pct(yearDay(y)) }} />
                          ))}
                          {r.end !== undefined ? (
                            <span
                              className="tl-bar"
                              style={{ left: pct(r.start), width: pct(p.from + (r.end - r.start)) }}
                            />
                          ) : (
                            <span
                              className={r.kind === "gate" ? "tl-gate" : "tl-milestone"}
                              style={{ left: pct(r.start) }}
                            />
                          )}
                          <span className="tl-cursor" style={{ left: pct(day) }} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        <ul className="tl-keys" aria-label="Key">
          <li>
            <span className="tl-key tl-key-critical" /> On the critical path
          </li>
          <li>
            <span className="tl-key tl-key-bar" /> Workstream
          </li>
          <li>
            <span className="tl-key tl-key-milestone" /> Milestone
          </li>
          <li>
            <span className="tl-key tl-key-gate" /> Go or no-go gate
          </li>
        </ul>
        <p className="tl-ends">
          The simulated air is Earth-like on {p.earthLikeText}, {p.slack}{" "}
          {p.late ? "after" : "before"} the deadline of {p.deadlineText}.
        </p>
      </div>

      <div className="tl-panels">
        <section className="tl-panel" aria-label={`Under way in ${monthYear(day)}`}>
          <p className="tl-panel-title">In {monthYear(day)}</p>
          {now.under.length ? (
            <ul className="tl-under">
              {now.under.map((r) => {
                const done = (day - r.start) / Math.max(1, (r.end as number) - r.start);
                return (
                  <li key={r.id}>
                    <button type="button" className="tl-link" onClick={() => setSelected(r.id)}>
                      {r.label}
                    </button>
                    <span className="tl-progress" aria-hidden="true">
                      <span style={{ width: `${Math.round(done * 100)}%` }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="tl-quiet">No workstream is under way on this date.</p>
          )}
          <p className="tl-around">
            {now.last && (
              <>
                Last: {now.last.label} ({now.last.startText}).{" "}
              </>
            )}
            {now.next && (
              <>
                Next: {now.next.label} ({now.next.startText}).
              </>
            )}
          </p>
        </section>

        <section className="tl-panel" aria-live="polite" aria-label="Selected workstream">
          {pick ? (
            <>
              <p className="tl-panel-title">{pick.label}</p>
              <dl className="tl-facts">
                <dt>Kind</dt>
                <dd>
                  {kindOf(pick)}
                  {pick.critical
                    ? ", on the critical path: a slip here moves the end of the plan"
                    : ""}
                </dd>
                <dt>Lane</dt>
                <dd>{p.lanes.find((l) => l.id === pick.lane)?.label}</dd>
                <dt>{pick.endText ? "Runs" : "Date"}</dt>
                <dd>
                  <a href={`/numbers#${pick.startId}`}>{pick.startText}</a>
                  {pick.endText && pick.endId && (
                    <>
                      {" to "}
                      <a href={`/numbers#${pick.endId}`}>{pick.endText}</a>
                      {`, ${span((pick.end as number) - pick.start)}`}
                    </>
                  )}
                </dd>
              </dl>
              {pick.href && (
                <p>
                  <a href={pick.href}>
                    {pick.href.startsWith("/technologies/") ? "Read the technology" : "Read more"}
                  </a>
                </p>
              )}
            </>
          ) : (
            <p className="tl-quiet">
              Select a row for its dates, where they come from in the model, and its technology.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
