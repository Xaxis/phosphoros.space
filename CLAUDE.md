# Phosphoros

A speculative engineering plan to make Venus Earth-like between 2027 and 2036, published at
phosphoros.space. The repository is the source of truth; the site renders it.

## Rules that are easy to break

- **Every number comes from the model.** Inputs live in `data/constants.yaml` (measured) and
  `data/assumptions.yaml` (chosen). Everything else is computed in `calc/src/model/`. Docs cite a
  number as a ledger link, `[any text](numbers.md#id)` (dates: `numbers.md?date=day#id`), and
  `pnpm docs` rewrites the link text to the model's value. Data prose uses `{id}` templates. Never
  type a model number by hand; `node tools/style.ts` catches most attempts.
- **No em dashes**, anywhere: docs, data, code comments, commit messages, issues.
- **Physics is never bent to make the plan work.** If the model shows a design fails, keep it as a
  failing check (`r.c(...)` with `issue:`), add an `open` entry to `data/corrections.yaml`, and open
  a GitHub issue. Four checks fail on purpose today: `veil-v2-hovers`, `ring-lowering-load`,
  `ring-net-force` and `exhaust-entropy`. Prose cites the count as `numbers.md#checks-failing`.
- **A changed published number is a correction.** Record it in `data/corrections.yaml` with its
  `before` values and the reason, so the About page and CHANGELOG show it.
- **Every number shows its basis**: physics, precedent, invented or design choice. Set `basis` on
  each quantity and keep it honest.

## Commands

```sh
pnpm calc                     # run the model; lists every check
pnpm calc --only <id>         # one number: value, formula, inputs
pnpm calc --set id=value      # a variant
pnpm docs                     # sync docs/ and data/outputs.json from the model
pnpm figures                  # render figures/svg/ from figures/src/
pnpm lint                     # biome, types, docs check, figures check, style
pnpm test
pnpm build                    # the site, static (36 pages)
node tools/look.ts DIR id...  # PNGs of figures in both themes, for review
tools/deploy.sh               # production deploy of HEAD, then proves it live
```

After changing data or the model, run `pnpm docs` and `pnpm figures` before `pnpm lint`; the
checks fail when docs or SVGs are stale.

## Layout

`data/` inputs and content, `calc/` the model (browser-safe index; `calc/src/load.ts` is Node only),
`docs/` the Markdown the site renders, `figures/` the 17 figures as React SVG (shared by the site and
`figures/svg/`), `web/` the Next.js site, `tools/` sync, style, figures, assets and deploy.

`.claude/skills/verify/` says how to launch, drive and prove each feature.

## Deploy

Vercel project `phosphoros` in the `xaxis-projects` team. `tools/deploy.sh` uploads a git archive of
HEAD (uncommitted work is not deployed), waits for it, checks headers, assets and every sitemap page,
and reports the DNS records still missing. `VERCEL_TOKEN` is in `.env`, never on a command line.
