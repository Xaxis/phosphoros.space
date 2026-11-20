import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "../../components/DocPage";
import { hasDoc } from "../../lib/docs";
import { pageMeta } from "../../lib/meta";
import { SECTIONS } from "../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTIONS.filter((s) => hasDoc(s.doc)).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = SECTIONS.find((x) => x.slug === slug);
  return s ? pageMeta(s) : {};
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SECTIONS.find((x) => x.slug === slug);
  if (!s) notFound();
  return <DocPage file={s.doc} current={s.href} eyebrow={s.nav ?? s.title} />;
}
