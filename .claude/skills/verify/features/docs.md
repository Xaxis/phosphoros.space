# Docs

Keeps every document in `docs/` in step with the model, and enforces the house style.

<!-- covers: cli:docs, cli:style -->

## Sub-features

- ledger: writes `docs/numbers.md` (every input and derived number, anchored by id), `docs/sources.md` and `data/outputs.json`.
- number links: rewrites the text of every `[...](numbers.md#id)` link from the model (options in the query: `?sig=3&show=km&date=day`).
- tables: regenerates every `<!-- table:KIND ARG -->` block from data; fills `<!-- figure:ID -->` blocks with the figure's SVG once it exists.
- links: reports unknown numbers, sources, documents, anchors and figures.
- style: `node tools/style.ts` rejects em dashes everywhere, hand-typed quantities in docs prose, and copies of model numbers typed into data prose.

## How to reach it

- `pnpm run docs`, `pnpm run docs --check`, `node tools/docs.ts docs/plan.md` (one file).
- `node tools/style.ts`, `node tools/style.ts docs/plan.md`.
- Both run inside `pnpm lint`.

## How to check it

Static: `pnpm lint`.

Runtime:

```sh
pnpm run docs && pnpm run docs --check; echo "exit $?"
node tools/style.ts; echo "exit $?"
printf '# T\n\nIt is 5 km away.\n' > docs/zz-style.md && node tools/style.ts docs/zz-style.md; echo "exit $?"; rm docs/zz-style.md
```

Proves it when: the second docs run says "are current" and exits 0; style prints "files clean"; the planted "5 km" is reported as a hand-typed quantity and exits 1.

## Gotchas

- Never type a quantity into docs prose; link it. Years, counts and section numbers are fine.
- Under pnpm 10 `pnpm docs` is npm's own `docs` command, not this script: it writes nothing, and `pnpm docs --check` hangs. Use `pnpm run docs` or `node tools/docs.ts`.
- From `docs/technologies/` the link starts `../numbers.md`.
- An empty block (opener, then the closer on the next line) is valid and is filled in place.
