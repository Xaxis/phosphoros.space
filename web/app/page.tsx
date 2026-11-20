import { Legend } from "../components/Basis";
import { DocBody, docNumbers } from "../components/DocPage";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Markdown } from "../components/Markdown";
import { Num, NumberCards } from "../components/Num";
import { hasDoc, loadDoc } from "../lib/docs";
import { model } from "../lib/model";
import { HOME, REPO, TAGLINE } from "../lib/site";

const HERO_NUMBERS = [
  "budget-demand",
  "helios-supply",
  "traj-earth-like",
  "deadline",
  "foundry-doubling-days",
];

export default function Home() {
  const { r } = model();
  const doc = hasDoc(HOME.doc) ? loadDoc(HOME.doc) : null;
  const checks = [...r.checks.values()];
  const passing = checks.filter((c) => c.pass).length;
  return (
    <>
      <Header current="/" />
      <main id="content">
        <section className="hero">
          <div className="hero-sky" aria-hidden="true">
            <span className="orb orb-today" />
            <span className="orb orb-future" />
          </div>
          <div className="hero-inner">
            <p className="eyebrow">Phosphoros · the light-bringer plan</p>
            <h1 className="hero-title">{TAGLINE}</h1>
            {doc?.lead && (
              <div className="hero-lead">
                <Markdown text={doc.lead} doc={HOME.doc} />
              </div>
            )}
            <div className="hero-actions">
              <a className="button button-primary" href="/plan">
                Read the plan
              </a>
              <a className="button" href="/explore">
                Change an assumption
              </a>
              <a className="button" href={REPO}>
                Every number on GitHub
              </a>
            </div>
            <dl className="hero-stats">
              <div>
                <dt>Energy the plan needs</dt>
                <dd>
                  <Num id="budget-demand" />
                </dd>
                <dd className="stat-sub">
                  against <Num id="helios-supply" /> supplied
                </dd>
              </div>
              <div>
                <dt>Earth-like, in the day-by-day simulation</dt>
                <dd>
                  <Num id="traj-earth-like" opts={{ date: "day" }} />
                </dd>
                <dd className="stat-sub">
                  deadline <Num id="deadline" opts={{ date: "day" }} />
                </dd>
              </div>
              <div>
                <dt>The one invention everything rests on</dt>
                <dd>
                  A factory that doubles every <Num id="foundry-doubling-days" />
                </dd>
                <dd className="stat-sub">
                  <a href="/technologies/ouroboros">Ouroboros Foundry</a>
                </dd>
              </div>
              <div>
                <dt>Physics checks</dt>
                <dd>
                  {passing} of {checks.length} pass
                </dd>
                <dd className="stat-sub">
                  <a href="/numbers#checks">
                    the {checks.length - passing} that fail are shown, not hidden
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>
        <div className="page">
          <div className="home-legend">
            <Legend />
          </div>
          {doc && (
            <article className="prose home-prose">
              <DocBody doc={doc} />
            </article>
          )}
        </div>
      </main>
      <NumberCards ids={[...HERO_NUMBERS, ...(doc ? docNumbers(doc) : [])]} />
      <Footer doc={HOME.doc} />
    </>
  );
}
