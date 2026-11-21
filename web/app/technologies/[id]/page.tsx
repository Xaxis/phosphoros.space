import type { Experiment, Technology } from "@phosphoros/calc/content";
import { fill, parseTemplate, refsIn } from "@phosphoros/calc/template";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BasisTag } from "../../../components/Basis";
import { DocPage } from "../../../components/DocPage";
import { CLOSING, Num, OPENING } from "../../../components/Num";
import { hasDoc } from "../../../lib/docs";
import { pageMeta } from "../../../lib/meta";
import { model, quantity } from "../../../lib/model";
import { REPO, repoUrl } from "../../../lib/site";

export const dynamicParams = false;

const PLACE: Record<Technology["place"], string> = {
  earth: "Earth",
  mercury: "Mercury",
  space: "Near Venus",
  ceres: "Ceres",
  venus: "Venus",
  everywhere: "Everywhere",
};

export function generateStaticParams() {
  return model()
    .content.technologies.filter((t) => hasDoc(`docs/technologies/${t.id}.md`))
    .map((t) => ({ id: t.id }));
}

function tech(id: string) {
  return model().content.technologies.find((t) => t.id === id);
}

function experimentsOf(t: Technology): Experiment[] {
  return model().content.experiments.experiments.filter((e) => t.experiments.includes(e.id));
}

/** Data text with its numbers as model buttons, each opening its card, holding the punctuation it touches. */
function Template({ text }: { text: string }) {
  const parts = parseTemplate(text);
  const texts = parts.map((s) => ("text" in s ? s.text : ""));
  const joins = parts.map((s, i) => {
    if ("text" in s) return { lead: "", tail: "" };
    const before = texts[i - 1] ?? "";
    const after = texts[i + 1] ?? "";
    const lead = OPENING.exec(before)?.[0] ?? "";
    const tail = CLOSING.exec(after)?.[0] ?? "";
    if (i > 0) texts[i - 1] = before.slice(0, before.length - lead.length);
    if (i + 1 < texts.length) texts[i + 1] = after.slice(tail.length);
    return { lead, tail };
  });
  let at = 0;
  return (
    <>
      {parts.map((s, i) => {
        const key = at;
        at += ("text" in s ? s.text : s.raw).length;
        if ("text" in s) return texts[i];
        const { lead, tail } = joins[i] ?? { lead: "", tail: "" };
        return lead || tail ? (
          <span key={key} className="num-join">
            {lead}
            <Num id={s.ref} opts={s.opts} />
            {tail}
          </span>
        ) : (
          <Num key={key} id={s.ref} opts={s.opts} />
        );
      })}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const t = tech((await params).id);
  if (!t) return {};
  return pageMeta({
    href: `/technologies/${t.id}`,
    title: t.name,
    description: fill(t.summary, quantity).replace(/\s+/g, " ").trim(),
  });
}

function Glance({ t }: { t: Technology }) {
  const { content } = model();
  const experiments = experimentsOf(t);
  const corrections = content.corrections.filter((c) => t.corrections?.includes(c.id));
  const open = content.corrections.filter((c) => t.open?.includes(c.id));
  return (
    <div className="glance">
      <dl>
        <div>
          <dt>Works at</dt>
          <dd>{PLACE[t.place]}</dd>
        </div>
        <div>
          <dt>Online</dt>
          <dd>
            <Num id={t.online} opts={{ date: "month" }} />
          </dd>
        </div>
        <div>
          <dt>Job</dt>
          <dd>{t.job}</dd>
        </div>
        <div>
          <dt>Breakthrough assumed</dt>
          <dd>
            <BasisTag basis="invented" /> <Template text={t.breakthrough} />
          </dd>
        </div>
        {experiments.length > 0 && (
          <div>
            <dt>Proved by</dt>
            {experiments.map((e) => (
              <dd key={e.id} className="glance-experiment">
                <a href={`/research#${e.gate ? "the-cloud-life-gate" : e.id}`}>{e.name}</a>
                <span className="glance-mark">
                  <span className="glance-mark-label">Pass:</span> <Template text={e.pass} />
                </span>
                {e.then && (
                  <span className="glance-mark">
                    <span className="glance-mark-label">Then:</span> <Template text={e.then} />
                  </span>
                )}
                <span className="glance-mark">
                  <span className="glance-mark-label">Kill:</span> <Template text={e.kill} />
                </span>
              </dd>
            ))}
          </div>
        )}
        {corrections.length > 0 && (
          <div>
            <dt>Changed in version 3</dt>
            {corrections.map((c) => (
              <dd key={c.id}>
                <a href="/about#corrections">{c.title}</a>
              </dd>
            ))}
          </div>
        )}
        {open.length > 0 && (
          <div>
            <dt>{open.length > 1 ? "Open problems" : "Open problem"}</dt>
            {open.map((o) => (
              <dd key={o.id}>
                {o.issue ? (
                  <a href={`${REPO}/issues/${o.issue}`}>{o.title}</a>
                ) : (
                  <a href="/about#corrections">{o.title}</a>
                )}
              </dd>
            ))}
          </div>
        )}
        <div>
          <dt>Computed in</dt>
          <dd>
            {t.modules.map((m, i) => (
              <span key={m}>
                {i > 0 && ", "}
                <a href={repoUrl(`calc/src/model/${m}`)}>
                  <code>{m}</code>
                </a>
              </span>
            ))}
            {t.modules.length === 0 && "No model numbers of its own"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default async function TechnologyPage({ params }: { params: Promise<{ id: string }> }) {
  const t = tech((await params).id);
  if (!t) notFound();
  const extra = [
    t.online,
    ...refsIn(t.breakthrough),
    ...experimentsOf(t).flatMap((e) => [e.pass, e.kill, e.then ?? ""].flatMap(refsIn)),
  ];
  return (
    <DocPage
      file={`docs/technologies/${t.id}.md`}
      current="/technologies"
      eyebrow={
        <>
          <a href="/technologies">Technologies</a> · {PLACE[t.place]}
        </>
      }
      aside={<Glance t={t} />}
      extraNumbers={extra}
    />
  );
}
