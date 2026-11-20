# Model

Every number Phosphoros publishes, computed from `data/` by `calc/`, with its formula, inputs and the physics checks.

<!-- covers: cli:calc, export:@phosphoros/calc, export:@phosphoros/calc/*, export:@phosphoros/calc/load -->

## Sub-features

- all: `pnpm calc` prints every derived number, then every physics check.
- only: `--only ID` prints one number with value, SI value, formula, inputs and where it is defined.
- set: `--set ID=VALUE` (repeatable, dates as YYYY-MM-DD) reruns the model with an input changed.
- json: `--json` prints inputs, derived numbers and checks as JSON.
- claims: `--claims` compares every number in the version 2 brief (`data/claims.yaml`) with the model; exits 1 only on an unexplained difference.
- package: `@phosphoros/calc` (browser-safe: `compute`, formatting, registry, time), `@phosphoros/calc/load` (Node only: reads `data/`), `@phosphoros/calc/content` and `@phosphoros/calc/template`.

## How to reach it

- `pnpm calc`, `pnpm calc --only veil-distance`, `pnpm calc --set foundry-doubling-days=70`, `pnpm calc --json`, `pnpm check:claims`.
- Imported by `web/lib/model.ts`, `web/components/Explorer.tsx` (in the browser), `tools/*.ts` and `figures/src/*`.

## How to check it

Static: `pnpm test` (calc/test/model.test.ts), `cd calc && pnpm typecheck`.

Runtime:

```sh
pnpm calc --only veil-distance; echo "exit $?"
pnpm calc --set foundry-doubling-days=70 | grep -E "Earth-like|earth-like-by-deadline"
pnpm calc --claims | tail -3; echo "exit $?"
```

Proves it when: `--only` prints "Veil station, sunward of Venus" with a value in km and its inputs, exit 0; the 70-day variant shows the `earth-like-by-deadline` check failing and a 2037 date; `--claims` ends with a summary of match, corrected and explained counts and exits 0.

## Gotchas

- `load.ts` finds the repository by walking up to `pnpm-workspace.yaml`; run from inside the checkout.
- An input that nothing reads fails the test "every input is read". Link it from a doc or a spec row, or remove it.
- Changing a published number needs a `data/corrections.yaml` entry, not a silent edit.
