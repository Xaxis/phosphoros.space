import type { Metadata } from "next";
import { DocPage } from "../../components/DocPage";
import { pageMeta } from "../../lib/meta";
import { TECH_INDEX } from "../../lib/site";

export const metadata: Metadata = pageMeta(TECH_INDEX);

export default function TechnologiesPage() {
  return <DocPage file={TECH_INDEX.doc} current="/technologies" eyebrow="Thirteen inventions" />;
}
