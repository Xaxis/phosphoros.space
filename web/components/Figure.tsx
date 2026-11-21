/** A figure from the figures package, drawn from the model, with its caption and text alternative. */
import { FIGURES } from "@phosphoros/figures";
import type { GanttProps } from "@phosphoros/figures/gantt";
import { model } from "../lib/model";
import { repoUrl } from "../lib/site";
import { GanttExplorer } from "./GanttExplorer";
import { shortColumns, TableWrap } from "./TableWrap";

export function figureNumbers(id: string): string[] {
  const def = FIGURES[id];
  if (!def) return [];
  const { r, content } = model();
  return def.numbers(def.build({ r, content }));
}

export function Figure({ id }: { id: string }) {
  const def = FIGURES[id];
  if (!def) return null;
  const { r, content } = model();
  const props = def.build({ r, content });
  const alt = def.describe(props);
  const short = shortColumns(alt.rows ?? []);
  const { Component } = def;
  return (
    <figure className="figure" id={`figure-${id}`}>
      {id === "gantt" ? (
        // The site's Gantt is interactive; the same rows are exported as figures/svg/gantt.svg.
        <GanttExplorer p={props as GanttProps} />
      ) : (
        <>
          {/* Focusable so a keyboard can scroll it sideways where it is wider than the screen. */}
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must take focus to scroll by keys */}
          <section className="figure-art" tabIndex={0} aria-label={`Figure: ${def.title}`}>
            <Component {...props} />
          </section>
          <p className="figure-hint" aria-hidden="true">
            Swipe sideways to see the whole figure.
          </p>
        </>
      )}
      <figcaption>
        <span className="figure-title">{def.title}.</span> {def.caption(props)}
        <span className="figure-links">
          {/* Pinned to the build: on main, the code and the SVG may already draw something else. */}
          <a href={repoUrl(def.file, undefined, true)}>View source</a>
          <a href={repoUrl(`figures/svg/${id}.svg`, undefined, true)}>SVG</a>
        </span>
      </figcaption>
      <details className="figure-data">
        <summary>The data in words</summary>
        <p>{alt.summary}</p>
        {alt.rows && (
          <TableWrap head={alt.head} name={`${def.title}: the data in words`}>
            <table>
              {alt.head && (
                <thead>
                  <tr>
                    {alt.head.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {alt.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((c, j) =>
                      short[j] && c ? (
                        <td key={j} className="cell-short" data-label={alt.head?.[j]}>
                          <span>{c}</span>
                        </td>
                      ) : (
                        <td key={j} data-label={alt.head?.[j]}>
                          {c}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </details>
    </figure>
  );
}
