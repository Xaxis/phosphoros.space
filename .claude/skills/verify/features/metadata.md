# Metadata

What browsers, crawlers and share cards fetch: manifest, robots, sitemap, icons and the share image.

<!-- covers: api:GET /manifest.webmanifest, api:GET /robots.txt, api:GET /sitemap.xml, cli:assets -->

## Sub-features

- manifest: `/manifest.webmanifest` (`web/app/manifest.ts`).
- robots: `/robots.txt` pointing to the sitemap.
- sitemap: `/sitemap.xml` listing every page; `tools/deploy.sh` fetches each one live.
- icons: `/icon.svg` (`web/app/icon.svg`), `/favicon.ico` and `/apple-icon.png`.
- share card: `/opengraph-image.png`, rendered from `tools/og.html` with its numbers filled from the model.
- assets: `tools/assets.ts` re-renders the share card, touch icon and favicon in Chromium.

## How to reach it

- `curl localhost:$PORT/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`, `/icon.svg`, `/favicon.ico`.
- `~/.claude/claude-core/bin/heavy node tools/assets.ts` after changing `tools/og.html`, `web/app/icon.svg` or a number on the card.

## How to check it

Static: `pnpm build` lists the metadata routes.

Runtime:

```sh
curl -s localhost:$PORT/sitemap.xml | grep -c '<loc>'
curl -s localhost:$PORT/robots.txt
curl -sI localhost:$PORT/icon.svg | grep -i content-type
~/.claude/claude-core/bin/heavy node tools/assets.ts
```

Proves it when: the sitemap has one `<loc>` per page (33 with 13 technologies and 9 sections, minus not-found and metadata routes: count the pages in the build output); robots names the sitemap; the icon is `image/svg+xml`; assets prints `{"ok":true,...}` and the PNG, read as an image, shows the headline and four numbers without overlap.

## Gotchas

- The share card loads its fonts from Google Fonts while rendering; offline it falls back to system fonts.
- After re-rendering the card, commit the PNGs: the site serves the committed files.
