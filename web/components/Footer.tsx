import { editUrl, REPO, repoUrl, TAGLINE } from "../lib/site";
import { ALL_PAGES } from "./Header";
import { Mark } from "./Mark";

const build =
  process.env.PHOSPHOROS_BUILD ?? process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev";

/** Every page ends with where it came from. */
export function Footer({ doc }: { doc?: string }) {
  return (
    <footer className="site-footer">
      {doc && (
        <div className="page-source">
          <span>This page is</span>
          <a href={repoUrl(doc)}>{doc}</a>
          <span aria-hidden="true">·</span>
          <a href={editUrl(doc)}>Edit it on GitHub</a>
          <span aria-hidden="true">·</span>
          <a href={`${REPO}/issues/new?template=challenge-a-number.yml`}>Challenge a number</a>
        </div>
      )}
      <div className="footer-inner">
        <div className="footer-brand">
          <Mark size={22} />
          <div>
            <p className="footer-name">Phosphoros</p>
            <p className="footer-tag">{TAGLINE}</p>
          </div>
        </div>
        <nav aria-label="Footer" className="footer-links">
          {ALL_PAGES.map((p) => (
            <a key={p.href} href={p.href}>
              {p.label}
            </a>
          ))}
        </nav>
        <div className="footer-fine">
          <p>
            A speculative engineering plan. Every invention is labelled; every number is computed
            from <a href={repoUrl("data/")}>open data</a> by{" "}
            <a href={repoUrl("calc/")}>open code</a>. Rerun it with <code>pnpm calc</code>.
          </p>
          <p>
            Code MIT; text, data and figures CC BY 4.0. <a href={REPO}>Source on GitHub</a>. Build{" "}
            <a href={`${REPO}/commit/${build}`}>{build}</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
