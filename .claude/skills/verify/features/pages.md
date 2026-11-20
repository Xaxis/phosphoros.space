# Pages

The site's pages, each rendered at build time from a document in `docs/` and the model.

<!-- covers: page:/, page:/[slug], page:/technologies, page:/technologies/[id], page:/numbers, page:/sources -->

## Sub-features

- home: `/` from `docs/README.md`, with headline numbers.
- home hero: a 3D Venus (three.js, `web/components/hero/`) that plays the plan from 2027 to the deadline: Veil, Helios beams, Exhaust canopies, Ice Bricks, Ring, Aegis, the air clearing, freezing and greening. Every date comes from the model and the air follows the day-by-day simulation (`web/lib/hero.ts`); `stage.ts` maps a day to what is drawn. A play/pause button and a date slider (arrow keys step between events) drive it; reduced motion starts it still on the Earth-like day; without WebGL 2 a still planet shows and the controls go.
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

Layout and keyboard (Chromium, under `heavy`):

```sh
~/.claude/claude-core/bin/heavy node tools/layout-check.ts http://localhost:$PORT /tmp/layout
```

Proves it when: it ends `layout checks pass`: no sitemap page is wider than 320 or 390 px, the Explorer table fits a phone, the "All pages" menu closes on Escape, a tap outside and tabbing past its last link, the late-Lattice variant explains itself, ids are unique, the 404 has its own title.

Home hero (Chromium on SwiftShader, so run it under `heavy`):

```sh
~/.claude/claude-core/bin/heavy node tools/hero-check.ts http://localhost:$PORT /tmp/hero
```

Proves it when: it ends `hero checks pass` (autoplay, pause, arrow keys, End, replay from the end, reduced motion, no WebGL 2, no console errors). Then look at the PNGs in `/tmp/hero`: 2027 a banded cream Venus; 2033 the Veil, beams and Exhaust; 2034 the Ring catching Bricks; 2036-04 dry-ice continents on a dark planet; 2036-12-31 blue seas, green land and white clouds.

## Gotchas

- Pages are static: after changing `data/` or `docs/`, restart `next dev` or rebuild if a page looks stale.
- The Markdown parser percent-encodes link URLs; ledger link queries are decoded in `web/components/Markdown.tsx`.
- Popovers need a browser that supports the popover API; check cards in Chromium, not with curl.
- The hero only draws after hydration, and SwiftShader manages a few frames a second: wait for `[data-scene="live"]` plus the 1.2 s fade before judging a screenshot, or the CSS still planet shows through.
- Anything brighter than about 0.82 (linear) blooms. A white blob on the planet is usually a cloud or ice colour set too bright, not a stray object: hide layers one at a time to find it.
- The hero is dark in both themes on purpose (`.hero-space` carries the dark tokens).
- Nothing clips the page sideways (`body` has no `overflow-x`), so anything too wide shows up as a wider page; `tools/layout-check.ts` names the page. Wide content belongs in its own scroller (`.table-wrap`, `.figure-art`, `pre`), each focusable so a keyboard can scroll it.
- `--faint` is the lightest text allowed: it measures at least 4.5:1 on every surface in both themes. Do not go lighter. The hero block redefines it too.
