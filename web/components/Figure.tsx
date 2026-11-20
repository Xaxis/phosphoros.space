/** A figure from the figures package, drawn from the model, with its caption and text alternative. */
import { FIGURES } from "@phosphoros/figures";
import { model } from "../lib/model";
import { repoUrl } from "../lib/site";

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
  const { Component } = def;
  return (
    <figure className="figure" id={`figure-${id}`}>
      <div className="figure-art">
        <Component {...props} />
      </div>
      <figcaption>
        <span className="figure-title">{def.title}.</span> {def.caption(props)}
        <span className="figure-links">
          <a href={repoUrl(def.file)}>View source</a>
          <a href={`${repoUrl(`figures/svg/${id}.svg`)}`}>SVG</a>
        </span>
      </figcaption>
      <details className="figure-data">
        <summary>The data in words</summary>
        <p>{alt.summary}</p>
        {alt.rows && (
          <div className="table-wrap">
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
                    {row.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
    </figure>
  );
}
