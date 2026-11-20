import type { Source } from "@phosphoros/calc/content";
import type { Metadata } from "next";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { pageMeta } from "../../lib/meta";
import { model } from "../../lib/model";
import { REPO, SOURCES } from "../../lib/site";

export const metadata: Metadata = pageMeta(SOURCES);

const GROUPS: [string, Source["kind"][]][] = [
  ["Data", ["data"]],
  ["Papers, books and reports", ["paper", "book", "report"]],
  ["News", ["news"]],
  ["Law and policy", ["law"]],
  ["Web", ["web"]],
];

export default function SourcesPage() {
  const { content, r } = model();
  const citedBy = (id: string) =>
    [...r.inputs.values()].filter((q) => q.source?.includes(id)).map((q) => q.id);
  return (
    <>
      <Header />
      <main id="content" className="page">
        <div className="page-hero">
          <p className="eyebrow">Bibliography</p>
          <h1>Sources</h1>
          <div className="lead">
            <p>
              Every source Phosphoros cites, with the date someone last opened the link and checked
              it says what we cite it for. A link that died or was wrong stays here with a note.
            </p>
          </div>
        </div>
        <div className="page-body">
          <article className="prose sources">
            {GROUPS.map(([title, kinds]) => {
              const list = content.sources.filter((s) => kinds.includes(s.kind));
              if (!list.length) return null;
              return (
                <section key={title}>
                  <h2>{title}</h2>
                  <ol className="source-list">
                    {list.map((s) => {
                      const link = s.doi ? `https://doi.org/${s.doi}` : s.url;
                      const numbers = citedBy(s.id);
                      return (
                        <li key={s.id} id={s.id}>
                          <p className="source-cite">
                            {s.authors}
                            {s.year ? ` (${s.year})` : ""}.{" "}
                            {link ? (
                              <a href={link} rel="noopener">
                                {s.title}
                              </a>
                            ) : (
                              s.title
                            )}
                            .{s.venue ? ` ${s.venue}.` : ""}
                            {s.doi && s.url && (
                              <>
                                {" "}
                                <a href={s.url} rel="noopener">
                                  Free copy
                                </a>
                                .
                              </>
                            )}
                          </p>
                          {s.note && <p className="source-note">{linked(s.note)}</p>}
                          <p className="source-meta">
                            {s.checked && <span>Checked {s.checked}</span>}
                            {numbers.length > 0 && (
                              <span>
                                Used for:{" "}
                                {numbers.map((n, i) => (
                                  <span key={n}>
                                    {i > 0 && "; "}
                                    <a href={`/numbers#${n}`}>{r.get(n).label}</a>
                                  </span>
                                ))}
                              </span>
                            )}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </article>
          <aside className="page-aside">
            <div className="aside-source">
              <p className="aside-title">Source</p>
              <a href={`${REPO}/blob/main/data/sources.yaml`}>data/sources.yaml</a>
              <a href={`${REPO}/issues/new?template=add-a-source.yml`}>Add a source</a>
            </div>
          </aside>
        </div>
      </main>
      <Footer doc="data/sources.yaml" />
    </>
  );
}

/** A note's text with any web address in it made a link. */
function linked(note: string) {
  return note.split(/(https?:\/\/\S+)/).map((part, i) =>
    i % 2 ? (
      <a key={part} href={part} rel="noopener">
        {part}
      </a>
    ) : (
      part
    ),
  );
}
