# Pages

The site's pages, each rendered at build time from a document in `docs/` and the model.

<!-- covers: page:/, page:/[slug], page:/technologies, page:/technologies/[id], page:/numbers, page:/sources -->

## Sub-features

- home: `/` from `docs/README.md`, with headline numbers.
- sections: `/problem /plan /budget /timeline /research /risks /precursors /contribute /about` from `docs/<slug>.md` (`SECTIONS` in `web/lib/site.ts`).
- technologies: `/technologies` from `docs/technologies/README.md`; `/technologies/<id>` for the 13 technologies, with an "at a glance" aside.
- numbers: every number is a button opening a card (`popover`) with basis, formula, inputs, sources, "View source" and the `pnpm calc --only` command.
- ledger: `/numbers` lists every number by file and module with a filter box, and every physics check (`#checks`, `#check-<id>`).
- sources: `/sources` lists every source with the numbers it supports.
- markers: callouts for Invented, Precedent, Physics and Design choice; basis glyphs on every number.
- themes: dark by default, light by system setting or the toggle (kept in `localStorage.theme`).

## How to reach it

- Header nav: Plan, Technologies, Budget, Timeline, Explore; the menu lists every page; the footer links every page and each page's source on GitHub.

## How to check it

Static: `pnpm build` prerenders every page; `cd web && pnpm typecheck`.

Runtime:

```sh
for p in / /problem /plan /budget /timeline /research /risks /precursors /contribute /about /technologies /technologies/veil /numbers /sources; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' localhost:$PORT$p)" "$p"; done
curl -s localhost:$PORT/technologies/veil | grep -o 'popovertarget="q-veil-distance"' | head -1
curl -s localhost:$PORT/numbers | grep -o 'id="veil-distance"'
pnpm calc --only veil-distance | sed -n 2p
```

Proves it when: every path answers 200; the Veil page has a number button for `veil-distance`; the ledger has its row; the value on the page matches `pnpm calc --only`.

## Gotchas

- Pages are static: after changing `data/` or `docs/`, restart `next dev` or rebuild if a page looks stale.
- The Markdown parser percent-encodes link URLs; ledger link queries are decoded in `web/components/Markdown.tsx`.
- Popovers need a browser that supports the popover API; check cards in Chromium, not with curl.
