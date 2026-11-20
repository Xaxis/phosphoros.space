/** A page rendered from a document in docs/: hero, body with figures, contents, number cards. */
import type { ReactNode } from "react";
import { type Doc, loadDoc } from "../lib/docs";
import { repoUrl } from "../lib/site";
import { Legend } from "./Basis";
import { Figure, figureNumbers } from "./Figure";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Markdown } from "./Markdown";
import { NumberCards } from "./Num";

export function DocBody({ doc }: { doc: Doc }) {
  return (
    <>
      {doc.parts.map((p, i) =>
        p.kind === "md" ? (
          <Markdown key={i} text={p.text} doc={doc.file} />
        ) : (
          <Figure key={i} id={p.id} />
        ),
      )}
    </>
  );
}

export function docNumbers(doc: Doc): string[] {
  return [
    ...doc.numbers,
    ...doc.parts.flatMap((p) => (p.kind === "figure" ? figureNumbers(p.id) : [])),
  ];
}

export function DocPage({
  file,
  current,
  eyebrow,
  aside,
  extraNumbers = [],
  before,
}: {
  file: string;
  current?: string;
  eyebrow?: ReactNode;
  aside?: ReactNode;
  extraNumbers?: string[];
  before?: ReactNode;
}) {
  const doc = loadDoc(file);
  return (
    <>
      <Header current={current} />
      <main id="content" className="page">
        <div className="page-hero">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{doc.title}</h1>
          {doc.lead && (
            <div className="lead">
              <Markdown text={doc.lead} doc={doc.file} />
            </div>
          )}
          <Legend />
        </div>
        {before}
        <div className="page-body">
          <article className="prose">
            <DocBody doc={doc} />
          </article>
          <aside className="page-aside">
            {aside}
            {doc.headings.length > 1 && (
              <nav className="toc" aria-label="On this page">
                <p className="aside-title">On this page</p>
                {doc.headings.map((h) => (
                  <a key={h.id} href={`#${h.id}`}>
                    {h.text}
                  </a>
                ))}
              </nav>
            )}
            <div className="aside-source">
              <p className="aside-title">Source</p>
              <a href={repoUrl(file)}>{file}</a>
              <a href="/numbers">Every number on the site</a>
            </div>
          </aside>
        </div>
      </main>
      <NumberCards ids={[...docNumbers(doc), ...extraNumbers]} />
      <Footer doc={file} />
    </>
  );
}
