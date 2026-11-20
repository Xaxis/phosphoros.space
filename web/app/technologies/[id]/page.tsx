import type { Technology } from "@phosphoros/calc/content";
import { fill, refsIn } from "@phosphoros/calc/template";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BasisTag } from "../../../components/Basis";
import { DocPage } from "../../../components/DocPage";
import { Num } from "../../../components/Num";
import { hasDoc } from "../../../lib/docs";
import { model, quantity } from "../../../lib/model";
import { repoUrl } from "../../../lib/site";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const t = tech((await params).id);
  if (!t) return {};
  return {
    title: t.name,
    description: fill(t.summary, quantity).replace(/\s+/g, " ").trim(),
    alternates: { canonical: `/technologies/${t.id}` },
  };
}

function Glance({ t }: { t: Technology }) {
  const { content } = model();
  const experiments = content.experiments.experiments.filter((e) => t.experiments.includes(e.id));
  const correction = t.correction
    ? content.corrections.find((c) => c.id === t.correction)
    : undefined;
  const open = t.open ? content.corrections.find((c) => c.id === t.open) : undefined;
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
            <BasisTag basis="invented" /> {fill(t.breakthrough, quantity)}
          </dd>
        </div>
        {experiments.length > 0 && (
          <div>
            <dt>Proved by</dt>
            <dd>
              {experiments.map((e, i) => (
                <span key={e.id}>
                  {i > 0 && ", "}
                  <a href="/research">{e.name}</a>
                </span>
              ))}
            </dd>
          </div>
        )}
        {correction && (
          <div>
            <dt>Changed in version 3</dt>
            <dd>
              <a href="/about#corrections">{correction.title}</a>
            </dd>
          </div>
        )}
        {open && (
          <div>
            <dt>Open problem</dt>
            <dd>
              <a href="/about#corrections">{open.title.replace(/^Open problem: /, "")}</a>
            </dd>
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
  const extra = [t.online, ...refsIn(t.breakthrough)];
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
