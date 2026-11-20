import type { Metadata } from "next";
import { DocPage } from "../../components/DocPage";
import { TECH_INDEX } from "../../lib/site";

export const metadata: Metadata = {
  title: TECH_INDEX.title,
  description: TECH_INDEX.description,
  alternates: { canonical: TECH_INDEX.href },
};

export default function TechnologiesPage() {
  return <DocPage file={TECH_INDEX.doc} current="/technologies" eyebrow="Thirteen inventions" />;
}
