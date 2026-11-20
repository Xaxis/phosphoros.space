import type { MetadataRoute } from "next";
import { hasDoc } from "../lib/docs";
import { model } from "../lib/model";
import { SECTIONS, SITE } from "../lib/site";

/** Every page on the site. tools/deploy.sh fetches each one from the live domain. */
export default function sitemap(): MetadataRoute.Sitemap {
  const techs = model()
    .content.technologies.filter((t) => hasDoc(`docs/technologies/${t.id}.md`))
    .map((t) => `/technologies/${t.id}`);
  const paths = [
    "",
    ...SECTIONS.filter((s) => hasDoc(s.doc)).map((s) => s.href),
    "/technologies",
    ...techs,
    "/explore",
    "/numbers",
    "/sources",
  ];
  return paths.map((p) => ({ url: `${SITE}${p}` }));
}
