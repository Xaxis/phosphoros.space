/**
 * Every page's share card: what tools/assets.ts renders into web/public/og/, and what its --check
 * compares with web/public/og/cards.json so a card cannot go stale when a title or a number moves.
 * The text is the page's own metadata (web/lib/site.ts, the technology summaries), filled from the
 * model the same way the site fills it.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Content } from "@phosphoros/calc/content";
import type { Registry } from "@phosphoros/calc/registry";
import { fill } from "@phosphoros/calc/template";
import {
  cardFor,
  EXPLORE,
  NUMBERS,
  SECTIONS,
  SITE,
  SOURCES,
  TECH_INDEX,
} from "../../web/lib/site.ts";

export interface Card {
  href: string;
  /** Path under web/public. */
  file: string;
  where: string;
  title: string;
  line: string;
  foot: string;
}

const PLACE: Record<string, string> = {
  earth: "at Earth",
  mercury: "at Mercury",
  space: "near Venus",
  ceres: "at Ceres",
  venus: "on Venus",
  everywhere: "everywhere the plan works",
};

export function pageCards(root: string, r: Registry, content: Content): Card[] {
  const card = (href: string, title: string, line: string, foot: string): Card => ({
    href,
    file: cardFor(href),
    where: `${SITE.replace(/^https:\/\//, "")}${href}`,
    title,
    line: line.replace(/\s+/g, " ").trim(),
    foot,
  });
  const techs = content.technologies.filter((t) =>
    existsSync(join(root, `docs/technologies/${t.id}.md`)),
  );
  return [
    ...SECTIONS.filter((s) => existsSync(join(root, s.doc))).map((s) =>
      card(s.href, s.title, s.description, "An open engineering plan"),
    ),
    card(
      TECH_INDEX.href,
      TECH_INDEX.title,
      TECH_INDEX.description,
      `${techs.length} inventions, each labelled`,
    ),
    ...techs.map((t, i) =>
      card(
        `/technologies/${t.id}`,
        t.name,
        fill(t.summary, (id) => r.get(id)),
        `Technology ${i + 1} of ${techs.length}, ${PLACE[t.place] ?? t.place}`,
      ),
    ),
    card(EXPLORE.href, EXPLORE.title, EXPLORE.description, "Runs the model in your browser"),
    card(NUMBERS.href, NUMBERS.title, NUMBERS.description, "Every number shows its basis"),
    card(SOURCES.href, SOURCES.title, SOURCES.description, "Every claim cited"),
  ];
}

const ESCAPE: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

/** The card template with a card's text in its [[slots]]. */
export function cardHtml(template: string, c: Card): string {
  return template.replace(/\[\[(\w+)\]\]/g, (_, k: keyof Card) =>
    String(c[k]).replace(/[&<>"]/g, (ch) => ESCAPE[ch] as string),
  );
}
