/**
 * Keeps docs/ and data/outputs.json in step with the model.
 *
 *   node tools/docs.ts           rewrite generated files and every number link's text
 *   node tools/docs.ts --check   change nothing; fail if anything is stale or a link is broken
 *   node tools/docs.ts FILE...   sync only these documents (and the generated files)
 *
 * Docs write numbers as links to the ledger: [5.3 × 10²⁶ J](numbers.md#atmosphere-heat). This
 * script rewrites the link text from the model, so a changed assumption updates every document.
 * A query picks the display: numbers.md?sig=3&show=km#veil-distance.
 *
 * Generated tables sit between markers and are rebuilt from data/:
 *   <!-- table:specs veil -->  ...  <!-- /table -->
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { type Claim, checkClaims } from "../calc/src/claims.ts";
import { type Content, checkContent, loadContent } from "../calc/src/content.ts";
import { formatQuantity } from "../calc/src/format.ts";
import { ROOT, readYaml, run, sourceLines } from "../calc/src/load.ts";
import { DEMANDS } from "../calc/src/model/budget.ts";
import type { Quantity } from "../calc/src/registry.ts";
import {
  formatRef,
  NUMBER_LINK,
  parseOptions,
  parseTemplate,
  type RefOptions,
} from "../calc/src/template.ts";
import { isoOf } from "../calc/src/time.ts";
import {
  computeMargins,
  type Edge,
  MARGINS_FILE,
  type Margins,
  marginsHash,
  readMargins,
  writeMargins,
} from "./margins.ts";

const CHECK = process.argv.includes("--check");
/** Documents named on the command line; with none, every document. Lets writers sync only their own. */
const ONLY = process.argv
  .slice(2)
  .filter((a) => !a.startsWith("--"))
  .map((a) => path.resolve(a));
const REPO = "https://github.com/Xaxis/phosphoros.space";
const DOCS = path.join(ROOT, "docs");

const r = run();
const content = loadContent();
const where = sourceLines(r);
const problems: string[] = checkContent(r, content);
const stale: string[] = [];

// How far each assumption can move: a few hundred model runs, so cached under a hash of the model.
let margins: Margins | undefined = readMargins();
if (margins?.hash !== marginsHash()) {
  if (CHECK) stale.push(MARGINS_FILE);
  else {
    margins = computeMargins();
    writeMargins(margins);
  }
}

function write(rel: string, text: string) {
  const file = path.join(ROOT, rel);
  const old = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (old === text) return;
  if (CHECK) stale.push(rel);
  else writeFileSync(file, text);
}

// --- Helpers ----------------------------------------------------------------------------------------
const known = (id: string) => r.inputs.has(id) || r.derived.has(id);
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

function query(opts: RefOptions): string {
  const parts = Object.entries(opts).map(([k, v]) => `${k}=${v}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

/** A data template as Markdown, numbers linked to the ledger. */
function md(text: string, prefix: string): string {
  return parseTemplate(text)
    .map((s) =>
      "text" in s
        ? s.text
        : `[${formatRef(r.get(s.ref), s.opts)}](${prefix}numbers.md${query(s.opts)}#${s.ref})`,
    )
    .join("");
}

function table(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

const BASIS_TEXT: Record<string, string> = {
  physics: "Physics",
  precedent: "Precedent",
  invented: "Invented",
  design: "Design choice",
};

function sourceOf(q: Quantity): { file: string; line: number } {
  return q.kind === "input"
    ? { file: q.file, line: q.line }
    : (where.get(q.id) ?? { file: "", line: 1 });
}

const techName = (id: string) => content.technologies.find((t) => t.id === id)?.name ?? id;

/** "Bullock and Grinspoon 1996", "Green et al. 2017": a source as a reader cites it. */
function shortCite(id: string): string {
  const s = content.sources.find((x) => x.id === id);
  if (!s) return id;
  const surname = (name: string) => name.split(",")[0]?.trim() ?? name;
  // A suffix is not a name: "Freitas, R. A., Jr., and Gilbreath, W. P." is two people.
  const [first = "", second] = s.authors.replace(/,? Jr\./g, "").split(/,? and /);
  // "Surname, I., Surname, I., and Surname, I.": more than one name before the "and" is three or more.
  const who =
    /et al/.test(s.authors) || first.split(",").length > 2
      ? `${surname(first)} et al.`
      : second
        ? `${surname(first)} and ${surname(second)}`
        : surname(first);
  return s.year ? `${who} ${s.year}` : who;
}

/**
 * "(Ars Technica; Planetary Society, January 2026; Planetary Society, April 2026)": sources cited
 * after a sentence, as the prose cites them. News and the web are named by who published them, a
 * paper by its authors and year; two from one publisher are told apart by their dates or titles.
 */
function citeList(ids: string[], p: string): string {
  return `(${citeLinks(ids, p).join("; ")})`;
}

/** The links of a citation list, without the parentheses: for a table cell. */
function citeLinks(ids: string[], p: string): string[] {
  const name = (id: string): string => {
    const s = content.sources.find((x) => x.id === id);
    if (!s) return id;
    // People are cited by surname and year; organisations by name.
    const person = /, [A-Z]\./.test(s.authors ?? "");
    if (s.kind === "paper" || s.kind === "book" || (s.kind === "report" && person))
      return shortCite(id);
    const by = s.authors ?? s.title;
    const outlet = /\(([^()]+)\)$/.exec(by)?.[1];
    if (outlet) return outlet;
    return (by.split(",")[0] ?? by).trim().replace(/^The /, "");
  };
  const when = (id: string): string => {
    const s = content.sources.find((x) => x.id === id);
    return s?.date
      ? new Date(`${s.date}T00:00:00Z`).toLocaleString("en-GB", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })
      : (s?.title ?? id);
  };
  const names = ids.map(name);
  const cites = ids.map((id, i) => {
    const n = names[i] as string;
    const label = names.filter((x) => x === n).length > 1 ? `${n}, ${when(id)}` : n;
    return `[${label}](${p}sources.md#${id})`;
  });
  return cites;
}

// --- Generated tables --------------------------------------------------------------------------------
type Block = (arg: string, prefix: string) => string;

const BLOCKS: Record<string, Block> = {
  specs(arg, p) {
    const t = content.technologies.find((x) => x.id === arg);
    if (!t) throw new Error(`table:specs ${arg}: no such technology`);
    return table(
      ["Parameter", "Value"],
      t.specs.map((s) => [s.label, md(s.value, p)]),
    );
  },
  techs(_arg, p) {
    return table(
      ["Invention", "Job", "Scale", "Breakthrough assumed", "Online"],
      content.technologies.map((t) => [
        `[${t.name}](${p}technologies/${t.id}.md)`,
        t.job,
        md(t.scale, p),
        md(t.breakthrough, p),
        md(`{${t.online}|date=year}`, p),
      ]),
    );
  },
  groups(arg, _p) {
    const t = content.technologies.find((x) => x.id === arg);
    return table(
      ["Group", "Starting point", "Engineered traits", "Job"],
      (t?.groups ?? []).map((g) => [g.group, g.from, g.traits, g.job]),
    );
  },
  machines(arg, p) {
    const t = content.technologies.find((x) => x.id === arg);
    if (!t?.machines) throw new Error(`table:machines ${arg}: no machines`);
    return table(
      ["Machine", "What it does", "What it feeds"],
      t.machines.map((m) => [m.name, md(m.does, p), m.feeds]),
    );
  },
  tiers(arg, _p) {
    const t = content.technologies.find((x) => x.id === arg);
    return table(
      ["Tier", "Scope", "Decides", "Reacts in"],
      (t?.tiers ?? []).map((g) => [g.tier, g.scope, g.decides, g.reacts]),
    );
  },
  baseline(_arg, p) {
    return table(
      ["Property", "Venus", "Earth"],
      content.venus.baseline.map((b) => [b.property, md(b.venus, p), md(b.earth, p)]),
    );
  },
  finish(_arg, p) {
    return table(
      ["Measure", "Venus today", "End of 2036", "Delivered by"],
      content.venus.finish.map((f) => [
        f.measure,
        md(f.today, p),
        md(f.target, p),
        f.by.length
          ? f.by.map((t) => `[${techName(t)}](${p}technologies/${t}.md)`).join(", ")
          : (f.note ?? ""),
      ]),
    );
  },
  timeline(_arg, p) {
    return table(
      ["Workstream or milestone", "Start", "End"],
      content.timeline.rows.map((row) => [
        row.kind === "gate"
          ? `**${row.label}** (gate)`
          : row.kind === "milestone"
            ? `**${row.label}**`
            : row.label,
        md(`{${row.start}|date=day}`, p),
        row.end ? md(`{${row.end}|date=day}`, p) : "",
      ]),
    );
  },
  experiments(_arg, p) {
    return table(
      ["Experiment", "Proves", `Pass by ${md("{experiments-end|date=day}", p)}`, "Kill signal"],
      content.experiments.experiments.map((e) => [
        e.tech ? `[${e.name}](${p}technologies/${e.tech}.md)` : `**${e.name}**`,
        md(e.proves, p),
        e.then ? `${md(e.pass, p)}. Then: ${md(e.then, p)}` : md(e.pass, p),
        md(e.kill, p),
      ]),
    );
  },
  risks(_arg, p) {
    return table(
      ["Risk", "What goes wrong", "Safeguard"],
      content.risks.risks.map((x) => [
        x.open ? `${x.risk} (open)` : x.risk,
        md(x.what, p),
        md(x.safeguard, p),
      ]),
    );
  },
  missions(_arg, p) {
    return table(
      ["Mission", "Lead", "Launch", "Contributes", "Status"],
      content.missions.missions.map((m) => [
        `**${m.name}**`,
        m.lead,
        m.changed ? `${m.launch} (version 2 said ${m.brief})` : m.launch,
        m.contributes,
        `${m.status} ${citeList(m.sources, p)}`,
      ]),
    );
  },
  literature(_arg, p) {
    return table(
      ["Proposal", "Mechanism", "Verdict"],
      content.literature.map((x) => [
        // One source: the name is its link. Several: each is cited after the name.
        x.sources.length === 1
          ? `[${x.cite ?? `${x.who} (${x.year})`}](${p}sources.md#${x.sources[0]})`
          : `${x.cite ?? `${x.who} (${x.year})`}: ${x.sources.map((id) => `[${shortCite(id)}](${p}sources.md#${id})`).join(", ")}`,
        md(x.mechanism, p),
        md(x.verdict, p),
      ]),
    );
  },
  budget(_arg, p) {
    const rows = DEMANDS.map(([id, label]) => [md(label, p), md(`{${id}}`, p)]);
    rows.push(["**Total demand**", `**${md("{budget-demand}", p)}**`]);
    rows.push([`Supply: the Lattice from full power to the deadline`, md("{helios-supply}", p)]);
    rows.push(["Spare", md("{budget-spare}", p)]);
    rows.push(["Spare once the Ring powers the Railheads", md("{budget-spare-with-ring}", p)]);
    return table(["Task", "Energy the Lattice delivers"], rows);
  },
  mass(_arg, p) {
    return table(
      ["Mass item", "Amount", "From"],
      [
        ["Ouroboros machinery at peak", md("{foundry-final-mass}", p), "Mercury regolith"],
        ["Helios Lattice", md("{helios-mass}", p), "Mercury"],
        ["Hesperus Veil", md("{veil-mass}", p), "Mercury"],
        ["Braking Ring", md("{ring-mass}", p), "Mercury"],
        ["Ceres factories at peak", md("{ceres-final-mass}", p), "Ceres rock"],
        ["Railheads and Crown", md("{ceres-build-mass}", p), "Ceres"],
        [
          "Water delivered",
          md("{ice-mass}", p),
          md("Ceres ({ice-ceres-water-share} of its water)", p),
        ],
        ["CO₂ sealed in cryo-continents", md("{venus-co2-mass}, {cryo-volume}", p), "Venus's air"],
        ["Oxygen made", md("{o2-mass}", p), "Split from Venus's CO₂"],
        ["Graphite made", md("{forge-graphite}", p), "Forge by-product"],
      ],
    );
  },
  checks(_arg, p) {
    return table(
      ["Check", "Result", "Detail"],
      [...r.checks.values()].map((c) => [
        `[${c.label}](${p}numbers.md#check-${c.id})`,
        c.pass ? "Pass" : c.issue ? "**Fails (open issue)**" : "**Fails**",
        c.detail,
      ]),
    );
  },
  margins(_arg, p) {
    const value = (id: string, v: number) => formatQuantity({ ...r.get(id), value: v }, { sig: 3 });
    const check = (id: string) => {
      const c = r.checks.get(id);
      return c ? `[${c.label}](${p}numbers.md#check-${id})` : id;
    };
    const end = (id: string, e: Edge | null, side: 0 | 1) => {
      const range = r.get(id).range as [number, number];
      return e ? value(id, e.holds) : `${value(id, range[side])} or ${side ? "more" : "less"}`;
    };
    const fails = (e: Edge | null, side: string) =>
      e ? `${side}: ${e.error ? "the model cannot run" : e.fails.map(check).join("; ")}` : "";
    return table(
      ["Assumption", "Plan", "The plan holds from", "to", "What breaks first"],
      (margins?.inputs ?? []).map((m) => [
        r.get(m.id).label,
        `[${value(m.id, m.plan)}](${p}numbers.md?sig=3#${m.id})`,
        end(m.id, m.below, 0),
        end(m.id, m.above, 1),
        [fails(m.below, "Lower"), fails(m.above, "Higher")].filter(Boolean).join(". ") ||
          "Nothing, across the whole range",
      ]),
    );
  },
  scenarios(_arg, p) {
    const deadline = r.get("deadline").value;
    return table(
      ["What if", "Simulated Earth-like", "Against the deadline", "Newly failing checks"],
      (margins?.scenarios ?? []).map((s) => {
        const date =
          s.earthLike === undefined
            ? "The model cannot run"
            : formatQuantity({ ...r.get("traj-earth-like"), value: s.earthLike }, { date: "day" });
        const days = s.earthLike === undefined ? 0 : Math.round(deadline - s.earthLike);
        const slack =
          s.earthLike === undefined ? "" : `${Math.abs(days)} d ${days >= 0 ? "early" : "late"}`;
        return [
          s.label,
          date,
          slack,
          s.fails
            .map((id) => {
              const c = r.checks.get(id);
              return c ? `[${c.label}](${p}numbers.md#check-${id})` : id;
            })
            .join("; ") || "None",
        ];
      }),
    );
  },
  corrections(_arg, p) {
    return content.corrections
      .map((c) => {
        const tag = {
          version: "Version",
          correction: "Correction",
          finding: "Finding",
          rename: "Renamed",
          open: "Open problem",
        }[c.kind];
        const issue = c.issue ? ` ([issue #${c.issue}](${REPO}/issues/${c.issue}))` : "";
        const head =
          c.kind === "version"
            ? `### Version ${c.version}: ${c.title}`
            : `- **${tag} (v${c.version}): ${c.title}.** ${md(c.text.trim(), p)}${issue}`;
        return c.kind === "version" ? `${head}\n\n${md(c.text.trim(), p)}\n` : head;
      })
      .join("\n");
  },
  claims(_arg, p) {
    const results = checkClaims(r, readYaml("data/claims.yaml").data as Claim[]).filter(
      (c) => c.status !== "match",
    );
    return table(
      ["Number", "Version 2", "Model", "Why"],
      results.map((c) => [
        // The label stays plain text: a ledger link's text is always rewritten to the value, so
        // the link to the ledger goes on the model's value instead.
        c.label,
        c.shown.brief,
        `[${c.shown.model}](${p}numbers.md${r.get(c.model).unit === "date" ? "?date=day" : ""}#${c.model})`,
        c.correction
          ? `Corrected in version 3: [${content.corrections.find((x) => x.id === c.correction)?.title ?? c.correction}](${p}about.md#corrections)`
          : md(c.note ?? "", p),
      ]),
    );
  },
  assumptions(_arg, p) {
    // The calc scripts that read each assumption directly, from the inputs the registry recorded.
    const usedBy = new Map<string, Set<string>>();
    for (const q of r.derived.values()) {
      const file = sourceOf(q).file;
      for (const id of q.inputs) {
        const files = usedBy.get(id) ?? new Set<string>();
        files.add(file);
        usedBy.set(id, files);
      }
    }
    const scripts = (id: string) =>
      [...(usedBy.get(id) ?? [])]
        .sort()
        .map((f) => `[${f.replace(/^calc\/src\/model\//, "")}](${p}../${f})`)
        .join(", ");
    return table(
      ["Assumption", "Value", "Basis", "Explore", "Defined in", "Used by"],
      [...r.inputs.values()]
        .filter((q) => q.file === "data/assumptions.yaml" && q.unit !== "date")
        .map((q) => [
          q.label,
          md(`{${q.id}}`, p),
          BASIS_TEXT[q.basis] ?? q.basis,
          q.range
            ? `${formatQuantity({ ...q, value: q.range[0] })} to ${formatQuantity({ ...q, value: q.range[1] })}`
            : "",
          `[${q.file}:${q.line}](${p}../${q.file}#L${q.line})`,
          scripts(q.id),
        ]),
    );
  },
};

// --- The ledger: docs/numbers.md ---------------------------------------------------------------------
function ledger(): string {
  const out: string[] = [
    "# Every number",
    "",
    "<!-- Generated by tools/docs.ts from data/ and calc/. Do not edit: change the data and run `pnpm docs`. -->",
    "",
    "Every number Phosphoros publishes, where it comes from and how it is computed. Inputs are read from",
    "[`data/`](../data/); everything else is derived by [`calc/`](../calc/) from them. Run",
    "`pnpm calc --only <id>` to reproduce any one of them, or `pnpm calc --set <id>=<value>` to change an",
    "assumption and see what follows.",
    "",
    "Basis: **Physics** is measurement or established physics. **Precedent** is shown in the real world,",
    "or taken from a published study, and cited. **Invented** is a breakthrough the plan assumes.",
    "**Design choice** is a size, count or date the plan picks. A computed number carries the weakest basis",
    "among what it is computed from: computed by physics from an invented input, it is marked Invented.",
    "",
  ];
  const quantityRow = (q: Quantity) => {
    const src = sourceOf(q);
    const link = `[${src.file.replace(/^calc\/src\//, "")}:${src.line}](../${src.file}#L${src.line})`;
    const how =
      q.kind === "derived"
        ? `${q.formula}<br>from ${q.inputs.map((i) => `[${i}](#${i})`).join(", ")}`
        : citeLinks(q.source ?? [], "").join("; ");
    const basis = BASIS_TEXT[q.basis ?? "physics"] ?? "";
    return [
      `<a id="${q.id}"></a>**${q.label}**<br>\`${q.id}\``,
      formatQuantity(q, { date: "day" }),
      how,
      basis,
      link,
    ];
  };
  const head = ["Quantity", "Value", "How", "Basis", "Source"];
  out.push("## Inputs", "");
  for (const file of ["data/constants.yaml", "data/assumptions.yaml"]) {
    out.push(`### [${file}](../${file})`, "");
    out.push(
      table(
        head,
        [...r.inputs.values()]
          .filter((q) => q.file === file)
          .map((q) => quantityRow({ ...q, kind: "input" })),
      ),
      "",
    );
  }
  out.push("## Derived", "");
  const modules = [...new Set([...r.derived.values()].map((d) => d.module))];
  for (const m of modules) {
    out.push(`### [${m}](../calc/src/${m})`, "");
    out.push(
      table(
        head,
        [...r.derived.values()]
          .filter((d) => d.module === m)
          .map((d) => quantityRow({ ...d, kind: "derived" })),
      ),
      "",
    );
  }
  out.push(
    "## Checks",
    "",
    "Each check is a law of physics or a requirement of the plan, tested on every run.",
    "",
  );
  out.push(
    table(
      ["Check", "Result", "Detail", "Source"],
      [...r.checks.values()].map((c) => {
        const src = where.get(c.id);
        return [
          `<a id="check-${c.id}"></a>**${c.label}**`,
          c.pass ? "Pass" : c.issue ? `Fails: open problem \`${c.issue}\`` : "**Fails**",
          c.detail,
          src
            ? `[${src.file.replace(/^calc\/src\//, "")}:${src.line}](../${src.file}#L${src.line})`
            : "",
        ];
      }),
    ),
    "",
  );
  return `${out.join("\n")}`;
}

// --- The bibliography: docs/sources.md --------------------------------------------------------------
function bibliography(c: Content): string {
  const groups: [string, string[]][] = [
    ["Data", ["data"]],
    ["Papers and books", ["paper", "book", "report"]],
    ["News", ["news"]],
    ["Law and policy", ["law"]],
    ["Web", ["web"]],
  ];
  const out = [
    "# Sources",
    "",
    "<!-- Generated by tools/docs.ts from data/sources.yaml. Do not edit: change the data and run `pnpm docs`. -->",
    "",
    "Every source Phosphoros cites, with the date someone last checked that the link works and says what we",
    'cite it for. To add one, open an ["add a source" issue](https://github.com/Xaxis/phosphoros.space/issues/new?template=add-a-source.yml).',
    "",
  ];
  for (const [title, kinds] of groups) {
    const list = c.sources.filter((s) => kinds.includes(s.kind));
    if (!list.length) continue;
    out.push(`## ${title}`, "");
    for (const s of list) {
      const link = s.doi ? `https://doi.org/${s.doi}` : s.url;
      const venue = s.venue ? ` ${s.venue}.` : "";
      const year = s.year ? ` (${s.year})` : "";
      const t = link ? `[${s.title}](${link})` : s.title;
      out.push(
        `- <a id="${s.id}"></a>${s.authors ?? ""}${year}. ${t}.${venue}${s.doi && s.url ? ` [Free copy](${s.url}).` : ""}${s.checked ? ` Checked ${s.checked}.` : ""}${s.note ? `<br>${s.note.trim()}` : ""}`,
      );
    }
    out.push("");
  }
  return out.join("\n");
}

// --- Machine-readable outputs: data/outputs.json -----------------------------------------------------
function outputs(): string {
  const round = (x: number) => Number(x.toPrecision(6));
  const quantities: Record<string, unknown> = {};
  for (const q of [...r.inputs.values()]
    .map((x) => ({ ...x, kind: "input" as const }))
    .concat([...r.derived.values()].map((x) => ({ ...x, kind: "derived" as const })) as never)) {
    const src = sourceOf(q as Quantity);
    quantities[q.id] = {
      value: q.unit === "date" ? isoOf(q.value) : round(q.value),
      unit: q.unit,
      shown: formatQuantity(q, { date: "day" }),
      label: q.label,
      basis: q.basis ?? "physics",
      source: `${src.file}#L${src.line}`,
      ...(q.kind === "derived"
        ? {
            formula: (q as { formula: string }).formula,
            inputs: (q as { inputs: string[] }).inputs,
          }
        : {}),
    };
  }
  const checks = Object.fromEntries(
    [...r.checks.values()].map((c) => [c.id, { pass: c.pass, detail: c.detail }]),
  );
  return `${JSON.stringify({ about: "Generated by tools/docs.ts. Every number Phosphoros publishes.", quantities, checks }, null, 2)}\n`;
}

// --- Sync every document ----------------------------------------------------------------------------
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walk(path.join(dir, e.name))
      : e.name.endsWith(".md")
        ? [path.join(dir, e.name)]
        : [],
  );
}

// A block's body never crosses another block's opener, so an empty block ("opener" then "closer" on
// the next line) can never swallow the text up to a later block's closer.
const FIGURE_BLOCK =
  /(<!-- figure:([a-z0-9-]+) -->)\n?((?:(?!<!-- figure:)[\s\S])*?)(<!-- \/figure -->)/g;
const BLOCK =
  /(<!-- table:([a-z]+)(?: ([a-z0-9-]+))? -->)\n?((?:(?!<!-- table:)[\s\S])*?)\n?(<!-- \/table -->)/g;
const SOURCE_LINK = /\]\(((?:\.\.\/)*)sources\.md#([a-z0-9-]+)\)/g;
const DOC_LINK = /\]\((?!https?:|#|mailto:)([^)#?\s]+\.md)(?:[?#][^)]*)?\)/g;
const FIGURE = /!\[[^\]]*\]\(((?:\.\.\/)*)figures\/svg\/([a-z0-9-]+)\.svg\)/g;
const sourceIds = new Set(content.sources.map((s) => s.id));

const ENTITY: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#x27": "'",
  "#39": "'",
};
function unescapeHtml(s: string): string {
  return s.replace(/&(amp|lt|gt|quot|#x27|#39);/g, (_m, e: string) => ENTITY[e] ?? _m);
}

function sync(file: string): void {
  const rel = path.relative(ROOT, file);
  const depth = path.relative(DOCS, path.dirname(file)).split(path.sep).filter(Boolean).length;
  const prefix = "../".repeat(depth);
  let text = readFileSync(file, "utf8");
  text = text.replace(
    BLOCK,
    (_m, open: string, kind: string, arg: string | undefined, _old, close: string) => {
      const block = BLOCKS[kind];
      if (!block) {
        problems.push(`${rel}: unknown table "${kind}"`);
        return _m;
      }
      return `${open}\n${block(arg ?? "", prefix)}\n${close}`;
    },
  );
  text = text.replace(FIGURE_BLOCK, (_m, open: string, id: string, _old, close: string) => {
    const svg = path.join(ROOT, "figures", "svg", `${id}.svg`);
    if (!existsSync(svg)) return `${open}\n${close}`;
    // The SVG's title is HTML-escaped; alt text in Markdown is plain.
    const title = unescapeHtml(
      /<title[^>]*>([^<]*)<\/title>/.exec(readFileSync(svg, "utf8"))?.[1] ?? id,
    );
    return `${open}\n![${title}](${prefix}../figures/svg/${id}.svg)\n${close}`;
  });
  text = text.replace(
    NUMBER_LINK,
    (m, _text: string, up: string, q: string | undefined, id: string) => {
      // Links to a physics check's row in the ledger are not numbers.
      if (id.startsWith("check-") && r.checks.has(id.slice(6))) return m;
      if (!known(id)) {
        problems.push(`${rel}: link to unknown number #${id}`);
        return m;
      }
      if (up !== prefix)
        problems.push(`${rel}: number link to #${id} should start ${prefix || "numbers.md"}`);
      let opts: RefOptions = {};
      try {
        opts = parseOptions(q);
      } catch (e) {
        problems.push(`${rel}: #${id}: ${(e as Error).message}`);
      }
      return `[${formatRef(r.get(id), opts)}](${up}numbers.md${q ? `?${q}` : ""}#${id})`;
    },
  );
  // A template that reached the output unfilled: the page would show "{id}" to readers.
  for (const m of text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "")
    .matchAll(/\{([a-z][a-z0-9-]*)(\|[^}\n]*)?\}/g))
    if (known(m[1] as string)) problems.push(`${rel}: unfilled template ${m[0]}`);
  for (const m of text.matchAll(SOURCE_LINK))
    if (!sourceIds.has(m[2] as string)) problems.push(`${rel}: link to unknown source #${m[2]}`);
  for (const m of text.matchAll(DOC_LINK)) {
    const target = path.resolve(path.dirname(file), m[1] as string);
    if (!existsSync(target)) problems.push(`${rel}: broken link to ${m[1]}`);
  }
  for (const m of text.matchAll(FIGURE)) {
    if (!existsSync(path.join(ROOT, "figures", "svg", `${m[2]}.svg`)))
      problems.push(`${rel}: figure ${m[2]} has no figures/svg/${m[2]}.svg (run pnpm figures)`);
  }
  write(rel, text);
}

write("docs/numbers.md", ledger());
write("docs/sources.md", bibliography(content));
write("data/outputs.json", outputs());
for (const file of ONLY.length ? ONLY : walk(DOCS)) {
  const rel = path.relative(ROOT, file);
  if (rel === "docs/numbers.md" || rel === "docs/sources.md") continue;
  sync(file);
}

if (problems.length) {
  console.error(problems.map((p) => `  ${p}`).join("\n"));
  console.error(
    `\n${problems.length} problem${problems.length > 1 ? "s" : ""} in docs/ and data/.`,
  );
  process.exit(1);
}
if (stale.length) {
  console.error(`Out of date (run pnpm docs): ${stale.join(", ")}`);
  process.exit(1);
}
console.log(
  CHECK
    ? `docs/ and data/outputs.json are current. ${REPO}`
    : "docs/ and data/outputs.json written.",
);
