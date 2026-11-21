# Pages

The site's pages, each rendered at build time from a document in `docs/` and the model.

<!-- covers: page:/, page:/[slug], page:/technologies, page:/technologies/[id], page:/numbers, page:/sources -->

## Sub-features

- home: `/` from `docs/README.md`, with headline numbers.
- home hero: a 3D Venus (three.js, `web/components/hero/`) that plays the plan from 2027 to the deadline: Veil, Helios beams, Exhaust canopies, Ice Bricks, Ring, Aegis, the air clearing, freezing and greening. Every date comes from the model and the air follows the day-by-day simulation (`web/lib/hero.ts`); `stage.ts` maps a day to what is drawn. It plays the decade once, easing into each event without stopping, then rests on the finished planet (still turning) and the button offers "Replay the animation from 2027". A play/pause button and a date slider (arrow keys step between events) drive it; reduced motion starts it still on the Earth-like day; without WebGL 2 a still planet shows and the controls go. On a wide screen the Veil and Aegis sit between the headline and the planet (`VEIL_POS`, raised above the Sun line, at 3/4 size) and the beams arrive steeply (`BEAM_DIR`), so nothing bright is drawn behind the headline's letters.
- sections: `/problem /plan /budget /timeline /research /risks /precursors /contribute /about` from `docs/<slug>.md` (`SECTIONS` in `web/lib/site.ts`).
- timeline: on `/timeline` and `/plan` the gantt figure slot renders `web/components/GanttExplorer.tsx`, an interactive Gantt of the same rows (`data/timeline.yaml`, every date from the model): lane chips and "Critical path only" filter rows, a date slider (or a click or mouse move over a track) moves a cursor and lists what is under way with progress, and selecting a row shows its kind, lane, dates (ledger links), span and technology page. A bar of a few days (Genesis seeding, on the deadline) still draws at least `--tl-bar-min` wide and ends inside its track. `figures/svg/gantt.svg` stays the static export. Proven by the last check in `tools/layout-check.ts`.
- technologies: `/technologies` from `docs/technologies/README.md`; `/technologies/<id>` for the 13 technologies, with an "at a glance" aside.
- numbers: every number is a button opening a card (`popover`) with basis, formula, inputs, sources, "View source" and the `pnpm calc --only` command. On a wide screen the card opens on the side of the number with more room (`position-try-order: most-block-size`) and shrinks to that space, scrolling inside, so its foot (View source, Ledger) is always on screen; on a phone it is a bottom sheet. Punctuation that touches a number (a comma after it, a bracket before it) is joined to it in a `.num-join` span that does not wrap (`OPENING`/`CLOSING` in `web/components/Num.tsx`, used by `Markdown.tsx` and the technology pages' data text). Numbers in IBM Plex Mono (buttons, cards, ledger, Explorer) go through `Mono` (`web/components/Mono.tsx`), which sets a run of superscripts tighter (`.sup-run`) so "10²⁷" shows no gap between its exponent digits.
- tables: every table sits in a `TableWrap` (`web/components/TableWrap.tsx`): a scroller that takes focus (so a keyboard can scroll it), is named by the table's headings (or "FIGURE: the data in words"), and shows a shadow on each edge the table runs on past. On a phone (640 px and under) a table of three or more columns stacks into one block per row, each cell under its column's name (`data-label`); the ledger stacks the same way with value and basis on one line.
- ledger: `/numbers` lists every number by file and module with a filter box, and every physics check (`#checks`, `#check-<id>`).
- sources: `/sources` lists every source with the numbers it supports.
- markers: callouts for Invented, Precedent, Physics and Design choice; basis glyphs on every number. The legend (`web/components/Basis.tsx`) defines Precedent as demonstrated, or from a published study, and cited.
- page footer: "This page is <file>", "Edit it on GitHub" (the file on main) and "Challenge a number". A generated page passes `edit` to `Footer`: `/numbers` sends editors to `data/`, not to the generated `docs/numbers.md`.
- repo links: `repoUrl` (`web/lib/site.ts`) pins a link to the build's commit when it has a line, or when the caller pins it (figure "View source" and "SVG"); other links follow main. `web/test/site.test.ts` checks both.
- about: `/about` ("About and Changelog") has a Changelog section linking `CHANGELOG.md`, then every correction.
- precursors: `/precursors` cites each mission's sources by publisher, "(Ars Technica; Planetary Society, January 2026; ...)", from `citeList` in `tools/docs.ts`.
- share cards: every page's metadata comes from `pageMeta` (`web/lib/meta.ts`), so it shares its own title, description, URL and card. Cards are `web/public/og/<page>.jpg` (home: `web/app/opengraph-image.png`), rendered by `heavy node tools/assets.ts` from `tools/og-page.html` and the page's own text (`tools/lib/cards.ts`); `node tools/assets.ts --check` (in `pnpm lint`) fails when a title, description or number on a card has changed since it was rendered. `tools/layout-check.ts` proves each page names its own URL and a card that loads.
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

Links and citations on a production build (`PHOSPHOROS_BUILD` set):

```sh
curl -s localhost:$PORT/numbers | grep -o 'href="[^"]*">Edit it in data/ on GitHub'
curl -s localhost:$PORT/plan | grep -o 'href="[^"]*tech-stack[^"]*"' | sort -u
curl -s localhost:$PORT/precursors | grep -o 'class="cite"[^>]*>[^<]*' | sed 's/.*>//' | sort | uniq -c
curl -s localhost:$PORT/about | grep -o 'id="changelog"\|CHANGELOG.md' | sort -u
```

Proves it when: the ledger's edit link goes to `tree/main/data`; the figure links carry the build's SHA, not `main`; the precursor citations are publisher names, never source ids; the About page has `id="changelog"` and a `CHANGELOG.md` link.

Layout and keyboard (Chromium, under `heavy`):

```sh
~/.claude/claude-core/bin/heavy node tools/layout-check.ts http://localhost:$PORT /tmp/layout
```

Proves it when: it ends `layout checks pass`: no sitemap page is wider than 320 or 390 px, the Explorer table fits a phone, the "All pages" menu closes on Escape, a tap outside and tabbing past its last link, the late-Lattice variant explains itself, ids are unique, the 404 has its own title.

Home hero (Chromium on SwiftShader, so run it under `heavy`):

```sh
~/.claude/claude-core/bin/heavy node tools/hero-check.ts http://localhost:$PORT /tmp/hero
```

Proves it when: it ends `hero checks pass` (autoplay, pause, arrow keys, End, replay from the end, reduced motion, no WebGL 2, no console errors). Then look at the PNGs in `/tmp/hero`: 2027 a banded cream Venus; 2033 the Veil, beams and Exhaust; 2034 the Ring catching Bricks; 2036-04 dry-ice continents on a dark planet; 2036-12-31 blue seas, green land and white clouds. From 2033 on, the Veil, its rim and the Aegis bubble sit right of "Earth-like," and no beam crosses the headline.

Header, cards, tables and punctuation (after a production build):

```sh
grep -oh '[-a-z]*backdrop-filter:[^;}]*' web/.next/static/chunks/*.css | sort -u
```

Proves the header blur when: both `-webkit-backdrop-filter:blur(14px)saturate(1.4)` and the unprefixed `backdrop-filter:blur(14px)saturate(1.4)` are there (write only the unprefixed one in `globals.css`; the build adds the prefix). In Chromium (playwright-core on SwiftShader, under `heavy`), check at 1440x900 that `getComputedStyle(document.querySelector(".site-header")).backdropFilter` is not `none`; that every number button, scrolled to the middle of the screen and clicked, opens a card whose box lies inside the viewport; that a card with more than 8 inputs shows "and N more" on one line; with every `<details>` open, axe reports no `scrollable-region-focusable` at 390 or 1440 in either theme; at 390 the `/budget` physics checks and the `/numbers` ledger show one labelled block per row and no `.table-stack` scrolls sideways; and no `.`, `,`, `;`, `:` or `)` right after a number button starts a line (nor a `(` right before one ends a line), at 390 and 1440.

## Gotchas

- Pages are static: after changing `data/` or `docs/`, restart `next dev` or rebuild if a page looks stale.
- The Markdown parser percent-encodes link URLs; ledger link queries are decoded in `web/components/Markdown.tsx`.
- Popovers need a browser that supports the popover API; check cards in Chromium, not with curl.
- The hero only draws after hydration, and SwiftShader manages a few frames a second: wait for `[data-scene="live"]` plus the 1.2 s fade before judging a screenshot, or the CSS still planet shows through.
- Anything brighter than about 0.82 (linear) blooms. A white blob on the planet is usually a cloud or ice colour set too bright, not a stray object: hide layers one at a time to find it.
- The hero is dark in both themes on purpose (`.hero-space` carries the dark tokens).
- Nothing clips the page sideways (`body` has no `overflow-x`), so anything too wide shows up as a wider page; `tools/layout-check.ts` names the page. Wide content belongs in its own scroller (`TableWrap`, `.figure-art`, `pre`), each focusable so a keyboard can scroll it.
- Write a property and its `-webkit-` twin only once, unprefixed: the build (Lightning CSS) adds the prefixes the browser targets need. With both written, the minifier keeps whichever comes last, and a trailing `-webkit-backdrop-filter` once left Chrome, Edge and Firefox with no header blur.
- A card's `max-height` uses `100%`, which under `position-area` is the space on the chosen side of the number, not the viewport. Keep the phone rule (`max-width: 640px`) on `100vh`: there the card is a fixed bottom sheet with no position area.
- A stacked table row is `display: block` (the ledger's is `grid`), which beats the `hidden` attribute; `.table-stack tr[hidden]` restores it so the ledger filter still hides rows on a phone.
- `--faint` is the lightest text allowed: it measures at least 4.5:1 on every surface in both themes. Do not go lighter. The hero block redefines it too.
- A React-controlled range input ignores `el.value = ...` plus a dispatched `input` event (React's value tracker sees no change). Drive it with Playwright's `locator.fill("1200")`.
- The hero's water is ocean plus ice (`wet = uOcean + uWaterIce` in `PLANET_FRAG`); a `max()` there made the seas shrink mid-melt. `web/test/hero.test.ts` (in `pnpm test`) checks that the stage's water only grows, that the clock never stalls leaving an event, and that it ends on the deadline without rewinding.
- To see the late stages, shoot frames at many dates (fill the hero slider, screenshot `.vision-planet` with padding); a stage that changes no pixels between two captions is a bug. To find where a terrain feature sits on screen, temporarily paint it a vivid colour in the shader, build, and shoot.
- The hero lowers its pixel ratio in 0.25 steps (to 0.5 at worst) while frames run under 30 a second; `canvas[data-dpr]` shows the current value. On SwiftShader it reaches 0.5 after a few seconds of play, so hero shots taken after playing are soft. That is expected, not a regression.
