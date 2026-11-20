# Figures

Charts and diagrams drawn from the model, rendered live on the site and exported as static SVGs.

<!-- covers: cli:figures, cli:look, export:@phosphoros/figures, export:@phosphoros/figures/*, export:@phosphoros/figures/theme -->

## Sub-features

- registry: `FIGURES` in `figures/src/index.ts`, filled from `set-charts.ts`, `set-space.ts`, `set-structure.ts` plus `foundry-growth.tsx`, `acid-sweep.tsx` and `aegis-shield.tsx` (17 figures).
- acid-sweep: the Acid Sweep page's figure. Three cross-sections (grind and dust, the Clear Rain, the oceans with the pH gate) over the SO₂, lime and basalt masses to scale. Links to Exhaust, Genesis and Cryo.
- aegis-shield: the Aegis page's figure. The bubble in the solar wind along the Sun-Venus line (bubble and Venus to scale), the coil magnified with its open problem (issue #6, a danger "!" like the Ring's), and the Mini-Aegis to switch-on steps. Links to the Veil, the Research Agenda and the Ice Train.
- export: `pnpm figures` writes `figures/svg/<id>.svg` with the theme stylesheet and a surface, so each SVG follows light or dark on GitHub.
- check: `pnpm figures --check` (`pnpm figures:check`) fails on a missing or stale SVG.
- look: `node tools/look.ts DIR ID...` renders each SVG in both themes to PNGs.
- theme: `figureCss()` is the one stylesheet the site (in `web/app/layout.tsx`) and the SVGs share.

## How to reach it

- `pnpm figures`, `pnpm figures:check`, `node tools/look.ts /tmp/look foundry-growth`.
- On the site, every page whose doc has `<!-- figure:ID -->` draws the component, with "The data in words" below it.

## How to check it

Static: `cd figures && pnpm typecheck`; `pnpm lint` runs the figures check.

Runtime:

```sh
pnpm figures && pnpm figures:check; echo "exit $?"
mkdir -p /tmp/look && node tools/look.ts /tmp/look foundry-growth acid-sweep aegis-shield && ls /tmp/look
curl -s localhost:$PORT/plan | grep -c 'data-figure='
curl -s localhost:$PORT/technologies/acid | grep -c 'data-figure="acid-sweep"'
curl -s localhost:$PORT/technologies/aegis | grep -c 'data-figure="aegis-shield"'
```

Proves it when: the check says "is current (17 figures)" and exits 0; each `-dark.png` and `-light.png` exists and, read as images, shows the drawing with legible, unclipped labels that cross no line; each page carries its `data-figure=` SVG.

## Gotchas

- Node cannot run `.tsx` alone: `tools/lib/register.ts` compiles it with sucrase (`node --import ./tools/lib/register.ts ...`; the scripts do this).
- Colour only through theme classes (`f-<token>`); a hex in a figure breaks the dark or light theme.
- Every number in a figure comes from the model through `show()`; never type one.
- A figure with links passes `links` to `Frame` (it becomes a group named by its title), draws each link with `Link` and everything else inside `Art`, which hides it from assistive technology. Each link must light a visible box on focus in both themes; a link whose only shape is a thin bar needs a box round its whole row.
- Numbers come out of `calc/src/format.ts` joined with no-break spaces (U+00A0), so "7.8 × 10²⁷ J" never splits. Type a plain space next to a unit in a figure and it can split again.
