"use client";
/**
 * The Explorer: the same model the site is built from, run in the browser. Move an assumption and
 * every consequence, including the day-by-day simulation and the physics checks, is recomputed.
 * The chosen values live in the URL (?set=id:value,...), so a variant can be shared.
 */
import { compute } from "@phosphoros/calc";
import type { Content } from "@phosphoros/calc/content";
import { formatQuantity } from "@phosphoros/calc/format";
import type { Input, Registry } from "@phosphoros/calc/registry";
import type { FigureDef } from "@phosphoros/figures";
import { gantt } from "@phosphoros/figures/gantt";
import { latticeBudget } from "@phosphoros/figures/lattice-budget";
import { trajectory } from "@phosphoros/figures/trajectory";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { journeyData } from "../lib/journey";
import { fromSlider, STEPS, toSlider } from "../lib/slider";
import { BasisTag, Legend } from "./Basis";
import { JourneyPanel } from "./journey/JourneyPanel";
import type { JourneyData } from "./journey/types";
import { Mono } from "./Mono";

export interface ExplorerGroup {
  title: string;
  ids: string[];
}

export interface Outcome {
  id: string;
  /** What a reader should compare it with. */
  against?: string;
  better: "earlier" | "later" | "higher" | "lower" | "none";
}

/**
 * Where the plan holds as one input moves alone (tools/margins.ts): the last passing value on each
 * side, or null where it holds to the end of the range.
 */
export interface SliderMargin {
  id: string;
  low: number | null;
  high: number | null;
}

/** The journey's data for a run, or undefined if the run lacks something the journey needs. */
function storyOf(r: Registry): JourneyData | undefined {
  try {
    return journeyData(r);
  } catch {
    return undefined;
  }
}

function run(inputs: Input[], overrides: Record<string, number>): { r?: Registry; error?: string } {
  try {
    const map = new Map(inputs.map((q) => [q.id, id(q, overrides)]));
    return { r: compute(map) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

function id(q: Input, overrides: Record<string, number>): Input {
  return q.id in overrides ? { ...q, value: overrides[q.id] as number } : q;
}

function readUrl(): Record<string, number> {
  const out: Record<string, number> = {};
  const set = new URLSearchParams(window.location.search).get("set");
  for (const pair of (set ?? "").split(",")) {
    const [k, v] = pair.split(":");
    if (k && v !== undefined && Number.isFinite(Number(v))) out[k] = Number(v);
  }
  return out;
}

/** The figures the Explorer redraws from the variant: the schedule, the air and the energy. */
// biome-ignore lint/suspicious/noExplicitAny: each figure has its own props
const VARIANT_FIGURES: FigureDef<any>[] = [gantt, trajectory, latticeBudget];

export function Explorer({
  inputs,
  groups,
  outcomes,
  timeline,
  margins,
}: {
  inputs: Input[];
  groups: ExplorerGroup[];
  outcomes: Outcome[];
  margins: SliderMargin[];
  /** The Gantt's rows; every date in them is a model id, so the variant moves them. */
  timeline: Content["timeline"];
}) {
  const byId = useMemo(() => new Map(inputs.map((q) => [q.id, q])), [inputs]);
  const marginOf = useMemo(() => new Map(margins.map((m) => [m.id, m])), [margins]);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const deferred = useDeferredValue(overrides);
  const base = useMemo(() => run(inputs, {}), [inputs]);
  const now = useMemo(() => run(inputs, deferred), [inputs, deferred]);
  const [copied, setCopied] = useState(false);
  const [said, setSaid] = useState("");
  // A screen reader hears only the verdict, once the slider settles, not the whole table each step.
  useEffect(() => {
    const t = setTimeout(
      () => setSaid(now.r ? verdict(now.r).sentence : `The model cannot run: ${now.error}`),
      500,
    );
    return () => clearTimeout(t);
  }, [now]);

  useEffect(() => {
    const fromUrl = readUrl();
    const valid = Object.fromEntries(Object.entries(fromUrl).filter(([k]) => byId.get(k)?.range));
    if (Object.keys(valid).length) setOverrides(valid);
    const focus = window.location.hash.slice(1);
    if (focus) document.getElementById(`x-${focus}`)?.focus();
  }, [byId]);

  useEffect(() => {
    const set = Object.entries(overrides)
      .map(([k, v]) => `${k}:${v}`)
      .join(",");
    const url = new URL(window.location.href);
    if (set) url.searchParams.set("set", set);
    else url.searchParams.delete("set");
    window.history.replaceState(null, "", url);
  }, [overrides]);

  const changed = Object.keys(overrides).length > 0;

  // The 3D journey of this variant. When the model cannot run the sliders, it keeps the last
  // variant it could, on the same canvas, rather than going blank.
  const plan = useMemo(() => (base.r ? storyOf(base.r) : undefined), [base]);
  const lastStory = useRef<JourneyData | undefined>(undefined);
  const story = useMemo(() => (now.r ? storyOf(now.r) : undefined), [now]);
  if (story) lastStory.current = story;
  const shown = story ?? lastStory.current;

  return (
    <div className="explorer">
      <section className="explorer-controls" aria-label="Assumptions">
        <Legend />
        {groups.map((g) => (
          <fieldset key={g.title} className="explorer-group">
            <legend>{g.title}</legend>
            {g.ids.map((qid) => {
              const q = byId.get(qid);
              if (!q?.range) return null;
              const value = overrides[qid] ?? q.value;
              const moved = qid in overrides;
              return (
                <div key={qid} className={`explorer-input${moved ? " moved" : ""}`}>
                  <div className="explorer-input-head">
                    <label htmlFor={`x-${qid}`}>
                      {q.label} <BasisTag basis={q.basis} />
                    </label>
                    <output htmlFor={`x-${qid}`} className="explorer-value">
                      <Mono text={formatQuantity({ ...q, value }, { sig: 3 })} />
                    </output>
                  </div>
                  <input
                    id={`x-${qid}`}
                    type="range"
                    min={0}
                    max={STEPS}
                    value={toSlider(q, value)}
                    onChange={(e) => {
                      const v = fromSlider(q, Number(e.currentTarget.value));
                      setOverrides((o) => ({ ...o, [qid]: v }));
                    }}
                    aria-valuetext={formatQuantity({ ...q, value }, { sig: 3 })}
                  />
                  <MarginBand q={q} m={marginOf.get(qid)} />
                  <div className="explorer-input-foot">
                    <span>{formatQuantity({ ...q, value: q.range[0] }, { sig: 2 })}</span>
                    <span>
                      {moved ? (
                        <button
                          type="button"
                          className="linkish"
                          onClick={() =>
                            setOverrides((o) => {
                              const { [qid]: _, ...rest } = o;
                              return rest;
                            })
                          }
                        >
                          Reset to {formatQuantity(q, { sig: 3 })}
                        </button>
                      ) : (
                        "plan value"
                      )}
                    </span>
                    <span>{formatQuantity({ ...q, value: q.range[1] }, { sig: 2 })}</span>
                  </div>
                  <MarginText q={q} m={marginOf.get(qid)} />
                </div>
              );
            })}
          </fieldset>
        ))}
        <div className="explorer-actions">
          <button
            type="button"
            className="button"
            disabled={!changed}
            onClick={() => setOverrides({})}
          >
            Reset everything
          </button>
          <button
            type="button"
            className="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              } catch {}
            }}
          >
            {copied ? "Link copied" : "Copy a link to this variant"}
          </button>
        </div>
      </section>
      <p className="visually-hidden" role="status">
        {said}
      </p>
      <section className="explorer-results" aria-label="Consequences">
        {now.error || !now.r || !base.r ? (
          <p className="explorer-error">The model cannot run with these assumptions: {now.error}</p>
        ) : (
          <Verdict now={now.r} />
        )}
        {shown && plan ? (
          <JourneyPanel data={shown} plan={plan} changed={changed} stale={!story} />
        ) : null}
        {now.r && base.r && !now.error ? (
          <>
            <Results base={base.r} now={now.r} outcomes={outcomes} changed={changed} />
            <VariantFigures r={now.r} timeline={timeline} changed={changed} />
          </>
        ) : null}
      </section>
    </div>
  );
}

/** Whether the variant still makes the deadline, in numbers and as one sentence. */
function verdict(now: Registry) {
  const checks = [...now.checks.values()];
  const passing = checks.filter((c) => c.pass).length;
  const earthLike = now.get("traj-earth-like").value;
  const deadline = now.get("deadline").value;
  const onTime = earthLike <= deadline;
  const when = formatQuantity(now.get("traj-earth-like"), { date: "day" });
  const sentence = `${onTime ? "Venus is Earth-like in time" : "Venus misses the deadline"}: Earth-like air on ${when}. ${passing} of ${checks.length} physics checks pass.`;
  return { onTime, earthLike, deadline, passing, total: checks.length, sentence };
}

/** Whether the variant still makes the deadline, as a heading and one sentence. */
function Verdict({ now }: { now: Registry }) {
  const { onTime, earthLike, deadline, passing, total } = verdict(now);
  return (
    <div className={`explorer-verdict ${onTime ? "ok" : "late"}`}>
      <p className="explorer-verdict-title">
        {onTime ? "Venus is Earth-like in time" : "Venus misses the deadline"}
      </p>
      <p>
        The day-by-day simulation reaches Earth-like air on{" "}
        <strong>{formatQuantity(now.get("traj-earth-like"), { date: "day" })}</strong>
        {onTime ? ", " : ", against a deadline of "}
        {onTime
          ? `${Math.round(deadline - earthLike)} days before the deadline.`
          : `${formatQuantity(now.get("deadline"), { date: "day" })}.`}{" "}
        {passing} of {total} physics checks pass.
      </p>
    </div>
  );
}

function Results({
  base,
  now,
  outcomes,
  changed,
}: {
  base: Registry;
  now: Registry;
  outcomes: Outcome[];
  changed: boolean;
}) {
  const checks = [...now.checks.values()];
  return (
    <>
      <section
        className="explorer-table"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must take focus to scroll by keys
        tabIndex={0}
        aria-label="Consequences: the plan and this variant"
      >
        <table>
          <thead>
            <tr>
              <th>Consequence</th>
              <th>Plan</th>
              <th>This variant</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => {
              const b = base.get(o.id);
              const n = now.get(o.id);
              const differs = Math.abs(n.value - b.value) > Math.abs(b.value) * 1e-6 + 1e-9;
              const up = n.value > b.value;
              const good =
                o.better === "none" ? null : (o.better === "higher" || o.better === "later") === up;
              return (
                <tr
                  key={o.id}
                  className={
                    differs ? (good === null ? "diff" : good ? "diff good" : "diff bad") : ""
                  }
                >
                  <td>
                    {n.label} {n.basis && <BasisTag basis={n.basis} />}
                    {o.against && <span className="explorer-against"> {o.against}</span>}
                  </td>
                  <td className="explorer-num">
                    <Mono text={formatQuantity(b, { date: "day" })} />
                  </td>
                  <td className="explorer-num">
                    <Mono text={formatQuantity(n, { date: "day" })} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <h2 className="explorer-h">Physics checks</h2>
      <ul className="check-list">
        {checks.map((c) => {
          const was = base.checks.get(c.id)?.pass;
          return (
            <li key={c.id} className={c.pass ? "check-pass" : "check-fail"}>
              <span className="check-mark">{c.pass ? "Pass" : c.issue ? "Open" : "Fail"}</span>
              <div>
                <p className="check-label">
                  {c.label}
                  {changed && was !== c.pass && (
                    <span className="check-changed">{c.pass ? " now passes" : " now fails"}</span>
                  )}
                </p>
                <p className="check-detail">{c.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The schedule, the simulated air and the energy budget, drawn from the variant. */
function VariantFigures({
  r,
  timeline,
  changed,
}: {
  r: Registry;
  timeline: Content["timeline"];
  changed: boolean;
}) {
  // The figures read only the timeline rows from the content; the rest of it stays on the server.
  const ctx = { r, content: { timeline } as Content };
  return (
    <>
      <h2 className="explorer-h">{changed ? "This variant, drawn" : "The plan, drawn"}</h2>
      {VARIANT_FIGURES.map((def) => {
        const props = def.build(ctx);
        const { Component } = def;
        return (
          <figure key={def.id} className="figure">
            {/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must take focus to scroll by keys */}
            <section className="figure-art" tabIndex={0} aria-label={`Figure: ${def.title}`}>
              <Component {...props} />
            </section>
            <figcaption>
              <span className="figure-title">{def.title}.</span> {def.caption(props)}
            </figcaption>
          </figure>
        );
      })}
    </>
  );
}

/** Where the plan holds on a slider's scale, with everything else as planned. */
function MarginBand({ q, m }: { q: Input; m?: SliderMargin }) {
  if (!m || !q.range) return null;
  const at = (v: number | null, end: number) => (v === null ? end : (toSlider(q, v) / STEPS) * 100);
  const a = at(m.low, 0);
  const b = at(m.high, 100);
  return (
    <div className="explorer-band" aria-hidden="true">
      <span style={{ left: `${a}%`, width: `${Math.max(0.5, b - a)}%` }} />
    </div>
  );
}

/** The same, in words. */
function MarginText({ q, m }: { q: Input; m?: SliderMargin }) {
  if (!m) return null;
  const show = (v: number) => formatQuantity({ ...q, value: v }, { sig: 3 });
  const text =
    m.low !== null && m.high !== null
      ? `between ${show(m.low)} and ${show(m.high)}`
      : m.low !== null
        ? `down to ${show(m.low)}`
        : m.high !== null
          ? `up to ${show(m.high)}`
          : "across the whole range";
  return (
    <p className="explorer-margin">
      Moved alone, the plan holds {text}.{" "}
      {(m.low !== null || m.high !== null) && (
        <a href="/budget#how-much-room-the-plan-has">What breaks</a>
      )}
    </p>
  );
}
