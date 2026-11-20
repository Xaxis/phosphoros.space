/** The site's map: every page, the document it renders and where its source lives. */

export const SITE = "https://phosphoros.space";
export const REPO = "https://github.com/Xaxis/phosphoros.space";
export const BRANCH = "main";
export const TAGLINE = "Venus, Earth-like, by 2036.";
export const DESCRIPTION =
  "A complete, open plan to make Venus Earth-like in ten years by inventing the technology it needs. Every number is computed from open data, every invention is labelled, and the physics always closes.";

/** A file in the repository, as a GitHub link (optionally to a line). */
export function repoUrl(file: string, line?: number): string {
  const kind = file.endsWith("/") || !/\.[a-z]+$/.test(file) ? "tree" : "blob";
  return `${REPO}/${kind}/${BRANCH}/${file.replace(/\/$/, "")}${line ? `#L${line}` : ""}`;
}

export function editUrl(file: string): string {
  return `${REPO}/edit/${BRANCH}/${file}`;
}

export interface Section {
  slug: string;
  /** Path the page is served at. */
  href: string;
  /** The document under docs/ the page renders. */
  doc: string;
  title: string;
  nav?: string;
  description: string;
}

export const SECTIONS: Section[] = [
  {
    slug: "problem",
    href: "/problem",
    doc: "docs/problem.md",
    title: "The Problem",
    nav: "Problem",
    description:
      "Venus today, why ten years is impossible by conventional means, and what earlier plans proposed.",
  },
  {
    slug: "plan",
    href: "/plan",
    doc: "docs/plan.md",
    title: "The Plan",
    nav: "Plan",
    description:
      "Five moves, thirteen inventions and a simulated atmosphere that is Earth-like before the end of 2036.",
  },
  {
    slug: "budget",
    href: "/budget",
    doc: "docs/budget.md",
    title: "Energy and Mass Budget",
    nav: "Budget",
    description:
      "Every joule the plan needs, where it comes from, and the physics checks that prove the budget closes.",
  },
  {
    slug: "timeline",
    href: "/timeline",
    doc: "docs/timeline.md",
    title: "Timeline",
    nav: "Timeline",
    description:
      "Every workstream and milestone from 2027 to 2036, with the dates the model derives.",
  },
  {
    slug: "research",
    href: "/research",
    doc: "docs/research.md",
    title: "Research Agenda",
    nav: "Research",
    description:
      "Nine proof experiments, each with a pass mark and a kill signal, starting in 2027.",
  },
  {
    slug: "risks",
    href: "/risks",
    doc: "docs/risks.md",
    title: "Risks and Governance",
    nav: "Risks",
    description: "What could go wrong, the safeguards, the ethics and the treaties.",
  },
  {
    slug: "precursors",
    href: "/precursors",
    doc: "docs/precursors.md",
    title: "Precursor Science",
    nav: "Missions",
    description: "The real missions to Venus and what each one tells the plan.",
  },
  {
    slug: "contribute",
    href: "/contribute",
    doc: "docs/contribute.md",
    title: "Contribute",
    description:
      "Challenge a number, propose an invention, add a source, or rerun the model yourself.",
  },
  {
    slug: "about",
    href: "/about",
    doc: "docs/about.md",
    title: "About and Changelog",
    nav: "About",
    description:
      "What Phosphoros is, where the name comes from, and every correction since version 1.",
  },
];

export const HOME = {
  href: "/",
  doc: "docs/README.md",
  title: "Phosphoros",
  description: "",
};

export const TECH_INDEX = {
  href: "/technologies",
  doc: "docs/technologies/README.md",
  title: "Technologies",
  description:
    "Thirteen inventions, each of which may assume engineering we do not have but none of which breaks a law of physics.",
};

/** Pages that render no document, with what their metadata and share cards say. */
export const EXPLORE = {
  href: "/explore",
  title: "Explorer",
  description:
    "Change any of the plan's key assumptions and watch every consequence, the simulated atmosphere and the physics checks recompute in your browser.",
};

export const NUMBERS = {
  href: "/numbers",
  title: "Every number",
  description:
    "Every number Phosphoros publishes: its value, basis, formula, inputs and the line of code or data that defines it.",
};

export const SOURCES = {
  href: "/sources",
  title: "Sources",
  description: "Every source Phosphoros cites, with the date its link was last checked.",
};

/** The share card of a page, rendered by tools/assets.ts into web/public/og/. */
export function cardFor(href: string): string {
  return `/og/${href.replace(/^\//, "").replaceAll("/", "-") || "home"}.jpg`;
}

/** The header's links, in order. */
export const NAV: { href: string; label: string }[] = [
  { href: "/plan", label: "Plan" },
  { href: "/technologies", label: "Technologies" },
  { href: "/budget", label: "Budget" },
  { href: "/timeline", label: "Timeline" },
  { href: "/explore", label: "Explore" },
];

/** Where a Markdown link from a document should go on the site, or null to leave it as written. */
export function routeFor(href: string, fromDoc: string): string | null {
  if (/^(https?:|mailto:|#)/.test(href)) return null;
  const [rawPath, hash] = href.split("#");
  const dir = fromDoc.split("/").slice(0, -1).join("/");
  const parts = `${dir}/${(rawPath ?? "").split("?")[0]}`.split("/");
  const stack: string[] = [];
  for (const p of parts) {
    if (p === "..") stack.pop();
    else if (p && p !== ".") stack.push(p);
  }
  const target = stack.join("/");
  const anchor = hash ? `#${hash}` : "";
  if (target === "docs/README.md") return `/${anchor}`;
  if (target === "docs/technologies/README.md") return `/technologies${anchor}`;
  const tech = /^docs\/technologies\/([a-z0-9-]+)\.md$/.exec(target);
  if (tech) return `/technologies/${tech[1]}${anchor}`;
  const doc = /^docs\/([a-z0-9-]+)\.md$/.exec(target);
  if (doc) return `/${doc[1]}${anchor}`;
  // Anything else in the repository: code, data, the licence.
  return `${repoUrl(target)}${anchor}`;
}
