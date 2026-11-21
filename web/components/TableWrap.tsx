import type { ReactNode } from "react";

/** Longest cell, in characters, of a column whose cells sit beside their label when stacked. */
const SHORT = 60;

/**
 * Which columns of a stacked table are short enough to sit beside their label (one line each)
 * rather than under it. The first column is the row's heading and never takes a label.
 */
export function shortColumns(rows: string[][]): boolean[] {
  const width = Math.max(0, ...rows.map((r) => r.length));
  return Array.from(
    { length: width },
    (_, j) => j > 0 && rows.every((r) => (r[j] ?? "").trim().length <= SHORT),
  );
}

/**
 * A table's scroller. It takes focus, so a keyboard can scroll it sideways, and is named by the
 * table's headings. A table of three or more columns stacks into labelled rows on a phone instead
 * of squeezing every column (each body cell carries its heading as `data-label`).
 */
export function TableWrap({
  head,
  name,
  children,
}: {
  head?: string[];
  name?: string;
  children: ReactNode;
}) {
  const stack = (head?.length ?? 0) >= 3;
  return (
    <section
      className={stack ? "table-wrap table-stack" : "table-wrap"}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must take focus to scroll by keys
      tabIndex={0}
      aria-label={name ?? `Table: ${head?.join(", ") || "data"}`}
    >
      {children}
    </section>
  );
}
