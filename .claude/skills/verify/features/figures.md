# Figures

Charts and diagrams drawn from the model, rendered live on the site and exported as static SVGs.

<!-- covers: cli:figures, cli:look, export:@phosphoros/figures, export:@phosphoros/figures/*, export:@phosphoros/figures/theme -->

## Sub-features

- registry: `FIGURES` in `figures/src/index.ts`, filled from `set-charts.ts`, `set-space.ts`, `set-structure.ts` plus `foundry-growth.tsx`.
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
mkdir -p /tmp/look && node tools/look.ts /tmp/look foundry-growth && ls /tmp/look
curl -s localhost:$PORT/plan | grep -c 'data-figure='
```

Proves it when: the check says "is current" and exits 0; `foundry-growth-dark.png` and `-light.png` exist and, read as images, show the curve with legible, unclipped labels; the page carries at least one `data-figure=` SVG.

## Gotchas

- Node cannot run `.tsx` alone: `tools/lib/register.ts` compiles it with sucrase (`node --import ./tools/lib/register.ts ...`; the scripts do this).
- Colour only through theme classes (`f-<token>`); a hex in a figure breaks the dark or light theme.
- Every number in a figure comes from the model through `show()`; never type one.
