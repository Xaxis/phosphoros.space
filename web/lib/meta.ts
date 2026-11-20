/**
 * A page's metadata, share card included. Next replaces the whole openGraph object when a page sets
 * one, so every page sets all of it here rather than inheriting the home page's title and card.
 */
import type { Metadata } from "next";
import { cardFor } from "./site";

export function pageMeta(p: { href: string; title: string; description: string }): Metadata {
  const title = `${p.title} · Phosphoros`;
  const image = {
    url: cardFor(p.href),
    width: 1200,
    height: 630,
    alt: `${title}. ${p.description}`,
  };
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.href },
    openGraph: {
      type: "article",
      siteName: "Phosphoros",
      title,
      description: p.description,
      url: p.href,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: p.description, images: [image] },
  };
}
