/**
 * docs/ as the site's pages. A document is Markdown with two kinds of generated block:
 *   <!-- table:kind arg --> ... <!-- /table -->   a table built from data/ (rendered as its Markdown)
 *   <!-- figure:id --> ... <!-- /figure -->        a figure (rendered live on the site)
 * Server only.
 */
import "server-only";
import { NUMBER_LINK } from "@phosphoros/calc/template";
import { readRepoFile } from "./model";

export type Part = { kind: "md"; text: string } | { kind: "figure"; id: string };

export interface Doc {
  file: string;
  title: string;
  /** The first paragraph after the title, as Markdown. */
  lead: string;
  /** Everything after the lead. */
  parts: Part[];
  /** Second-level headings, for the page's contents. */
  headings: { id: string; text: string }[];
  /** Every number the document links to. */
  numbers: string[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function loadDoc(file: string): Doc {
  let text = readRepoFile(file).replace(/\r\n/g, "\n");
  // Generated tables render as the Markdown they contain; the markers are only for the sync.
  text = text.replace(/<!-- table:[^>]*-->\n?/g, "").replace(/\n?<!-- \/table -->/g, "");
  text = text.replace(/<!--(?! figure:| \/figure)[\s\S]*?-->\n?/g, "");
  const titleMatch = /^# (.+)$/m.exec(text);
  const title = titleMatch?.[1]?.trim() ?? file;
  let body = titleMatch ? text.slice((titleMatch.index ?? 0) + titleMatch[0].length) : text;
  body = body.replace(/^\s+/, "");
  // The lead is the first paragraph, if the document starts with one.
  let lead = "";
  if (!/^(#|<!--|\||>|-|\d+\.|!\[)/.test(body)) {
    const end = body.indexOf("\n\n");
    lead = end < 0 ? body : body.slice(0, end);
    body = end < 0 ? "" : body.slice(end + 2);
  }
  const parts: Part[] = [];
  const FIG = /<!-- figure:([a-z0-9-]+) -->[\s\S]*?<!-- \/figure -->/g;
  let last = 0;
  for (const m of body.matchAll(FIG)) {
    if ((m.index ?? 0) > last) parts.push({ kind: "md", text: body.slice(last, m.index) });
    parts.push({ kind: "figure", id: m[1] as string });
    last = (m.index ?? 0) + m[0].length;
  }
  if (last < body.length) parts.push({ kind: "md", text: body.slice(last) });
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => ({
    id: slugify(m[1] as string),
    text: (m[1] as string).replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"),
  }));
  const numbers = [...new Set([...text.matchAll(NUMBER_LINK)].map((m) => m[4] as string))];
  return { file, title, lead, parts, headings, numbers };
}

export function hasDoc(file: string): boolean {
  try {
    readRepoFile(file);
    return true;
  } catch {
    return false;
  }
}
