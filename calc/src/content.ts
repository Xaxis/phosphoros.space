/**
 * The site's structured content: every data file except the model's inputs. Node only. The shapes
 * here are the contract between data/, docs/ and the site.
 */
import { readYaml } from "./load.ts";
import type { Registry } from "./registry.ts";
import { refsIn, stringsIn } from "./template.ts";

export type Place = "earth" | "mercury" | "space" | "ceres" | "venus" | "everywhere";

export interface Technology {
  id: string;
  name: string;
  place: Place;
  online: string;
  summary: string;
  job: string;
  scale: string;
  breakthrough: string;
  specs: { label: string; value: string }[];
  invented: string[];
  precedent: { text: string; source: string }[];
  experiments: string[];
  figures: string[];
  modules: string[];
  correction?: string;
  /** Open problems in the corrections log, by id. */
  open?: string[];
  groups?: { group: string; from: string; traits: string; job: string }[];
  tiers?: { tier: string; scope: string; decides: string; reacts: string }[];
  /** The machine types of a self-copying factory, in the order the loop is drawn. */
  machines?: { name: string; makes: string; does: string; feeds: string }[];
}

export interface TimelineRow {
  id: string;
  label: string;
  lane: string;
  kind?: "milestone" | "gate";
  start: string;
  end?: string;
  tech?: string;
  link?: string;
  accent?: boolean;
  /** On the critical path: a slip here moves the end of the plan. */
  critical?: boolean;
}

export interface Timeline {
  lanes: { id: string; label: string }[];
  rows: TimelineRow[];
  critical_path: string;
}

export interface Experiment {
  id: string;
  name: string;
  where: string;
  tech?: string;
  gate?: boolean;
  /** A line with no substitute: if it fails, the plan falls back to the multi-century route. */
  fallback?: boolean;
  proves: string;
  pass: string;
  kill: string;
}

export interface Risk {
  id: string;
  risk: string;
  what: string;
  safeguard: string;
  tech: string[];
  open?: boolean;
}

export interface Mission {
  id: string;
  name: string;
  lead: string;
  launch: string;
  brief: string;
  changed?: boolean;
  arrives: string;
  contributes: string;
  informs: string[];
  gate?: boolean;
  status: string;
  sources: string[];
}

export interface Proposal {
  id: string;
  who: string;
  year: number;
  title?: string;
  mechanism: string;
  verdict: string;
  takes?: string;
  sources: string[];
}

export interface Source {
  id: string;
  kind: "data" | "paper" | "book" | "report" | "news" | "law" | "web";
  title: string;
  authors?: string;
  year?: number;
  date?: string;
  venue?: string;
  doi?: string;
  url?: string;
  also?: string;
  checked?: string;
  note?: string;
}

export interface Correction {
  id: string;
  kind: "version" | "correction" | "finding" | "rename" | "open";
  version: string;
  date?: string;
  title: string;
  text: string;
  before?: Record<string, number | string>;
  issue?: number;
}

export interface VenusTables {
  baseline: { property: string; venus: string; earth: string }[];
  facts: string[];
  finish: { measure: string; today: string; target: string; by: string[]; note?: string }[];
  breathing: string;
}

export interface Content {
  technologies: Technology[];
  timeline: Timeline;
  experiments: { experiments: Experiment[]; fallback: string };
  risks: { risks: Risk[]; governance: string };
  missions: { checked: string; missions: Mission[]; note: string };
  literature: Proposal[];
  sources: Source[];
  corrections: Correction[];
  venus: VenusTables;
}

export const CONTENT_FILES = [
  "data/technologies.yaml",
  "data/timeline.yaml",
  "data/experiments.yaml",
  "data/risks.yaml",
  "data/missions.yaml",
  "data/literature.yaml",
  "data/sources.yaml",
  "data/corrections.yaml",
  "data/venus.yaml",
  "data/claims.yaml",
];

export function loadContent(): Content {
  const read = (f: string) => readYaml(f).data as never;
  return {
    technologies: read("data/technologies.yaml"),
    timeline: read("data/timeline.yaml"),
    experiments: read("data/experiments.yaml"),
    risks: read("data/risks.yaml"),
    missions: read("data/missions.yaml"),
    literature: read("data/literature.yaml"),
    sources: read("data/sources.yaml"),
    corrections: read("data/corrections.yaml"),
    venus: read("data/venus.yaml"),
  };
}

/** Problems with content: unknown number ids, unknown technologies, sources or dates. */
export function checkContent(r: Registry, c: Content): string[] {
  const problems: string[] = [];
  const known = (id: string) => r.inputs.has(id) || r.derived.has(id);
  for (const file of CONTENT_FILES) {
    const { data } = readYaml(file);
    for (const s of stringsIn(data))
      for (const id of refsIn(s)) if (!known(id)) problems.push(`${file}: unknown number {${id}}`);
    // In a flow mapping, { a: x, y z } makes "y z" a key with no value: an unquoted comma cut the
    // text short. Nothing in content is ever legitimately empty, so an empty value is that bug.
    const walk = (x: unknown, at: string): void => {
      if (Array.isArray(x)) {
        for (const [i, y] of x.entries()) walk(y, `${at}[${i}]`);
      } else if (x && typeof x === "object")
        for (const [k, y] of Object.entries(x)) {
          if (y === null)
            problems.push(`${file}: ${at}: "${k}" has no value (quote text with commas)`);
          else walk(y, `${at}.${k}`);
        }
    };
    walk(data, "");
  }
  const techs = new Set(c.technologies.map((t) => t.id));
  const sources = new Set(c.sources.map((s) => s.id));
  const corrections = new Set(c.corrections.map((x) => x.id));
  const experiments = new Set(c.experiments.experiments.map((e) => e.id));
  for (const t of c.technologies) {
    if (!known(t.online))
      problems.push(`technologies.yaml: ${t.id}: online "${t.online}" is not a model date`);
    for (const p of t.precedent)
      if (!sources.has(p.source))
        problems.push(`technologies.yaml: ${t.id}: unknown source ${p.source}`);
    for (const e of t.experiments)
      if (!experiments.has(e)) problems.push(`technologies.yaml: ${t.id}: unknown experiment ${e}`);
    if (t.correction && !corrections.has(t.correction))
      problems.push(`technologies.yaml: ${t.id}: unknown correction ${t.correction}`);
    for (const o of t.open ?? [])
      if (!corrections.has(o))
        problems.push(`technologies.yaml: ${t.id}: unknown open problem ${o}`);
  }
  for (const row of c.timeline.rows) {
    for (const d of [row.start, row.end])
      if (d !== undefined && r.get(d).unit !== "date")
        problems.push(`timeline.yaml: ${row.id}: ${d} is not a date`);
    if (row.tech && !techs.has(row.tech))
      problems.push(`timeline.yaml: ${row.id}: unknown tech ${row.tech}`);
  }
  for (const e of c.experiments.experiments)
    if (e.tech && !techs.has(e.tech))
      problems.push(`experiments.yaml: ${e.id}: unknown tech ${e.tech}`);
  for (const x of c.risks.risks)
    for (const t of x.tech)
      if (!techs.has(t)) problems.push(`risks.yaml: ${x.id}: unknown tech ${t}`);
  for (const m of c.missions.missions) {
    for (const s of m.sources)
      if (!sources.has(s)) problems.push(`missions.yaml: ${m.id}: unknown source ${s}`);
    for (const t of m.informs)
      if (!techs.has(t)) problems.push(`missions.yaml: ${m.id}: unknown tech ${t}`);
  }
  for (const p of c.literature)
    for (const s of p.sources)
      if (!sources.has(s)) problems.push(`literature.yaml: ${p.id}: unknown source ${s}`);
  for (const f of c.venus.finish)
    for (const t of f.by)
      if (!techs.has(t)) problems.push(`venus.yaml: ${f.measure}: unknown tech ${t}`);
  return problems;
}
