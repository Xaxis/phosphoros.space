---
name: verify
description: Verify Phosphoros (the model in calc/, the docs sync, the figures and the Next.js static site at phosphoros.space). Has the feature map of where every page, metadata route, CLI tool and package export lives, how to launch and health-check the site, and a proven recipe for checking each feature. Use to prove a change in this repo works, to find where a feature lives, or to see what a change could break.
---

# Verify Phosphoros

`FM=~/.claude/claude-core/bin/featuremap`

- **Where does a feature live?** Look it up in `features.json` (`id`, `entry`, `reach`,
  `tests`), then read `features/<area>.md` for its recipe.
- **What did my change touch?** `$FM affected` (add `--since <base>` on a branch).
  Every feature it lists is in scope. A change to `data/` or `calc/src/model/` reaches
  every page: the whole site is rendered from the model.
- **Keeping it current:** when you add, rename, move or remove a feature, run
  `$FM generate --write`, update the matching `features/<area>.md`, and confirm
  `$FM check` exits 0. Commit this with the feature change.

## Static checks

| Check | Command | Proves | Baseline |
|---|---|---|---|
| lint | `pnpm lint` | Biome, every package's types, docs in sync with the model, figures/svg current, the ozone model's spectrum table current, no em dashes or hand-typed quantities | passes, about 40 s |
| test | `pnpm test` | the model's invariants (calc/test/model.test.ts: every input used, content refs resolve, claims explained, energy closes, variants break the deadline) | passes, about 2 s |
| build | `pnpm build` (run as `~/.claude/claude-core/bin/heavy pnpm build`) | every page prerenders from docs/ and the model | passes, 33 static pages, 1 to 3 min plus queue |
| typecheck:calc | `cd calc && pnpm typecheck` | model types | passes |
| typecheck:figures | `cd figures && pnpm typecheck` | figure types | passes |
| typecheck:web | `cd web && pnpm typecheck` | site types and route types | passes |

Known pre-existing failures: none in the checks. Some physics checks fail on purpose and are
reported, not hidden: `veil-v2-hovers` (version 2's statite cannot hover), and the open problems
`ring-lowering-load`, `ring-net-force`, `ring-carries-equipment`, `loss-heat-fits` and
`exhaust-entropy`. Each names its `issue`, and the test "every failing check names its problem"
fails if one does not, or if an `open` corrections entry has no failing check. The schedule checks
(`frost-before-sealing`, `genesis-by-deadline`, `earth-like-by-deadline`) pass with the design point
in `data/assumptions.yaml`; `data/margins.json` says how far any input can move before they fail.
`checks-failing` in the ledger counts the failures, and the docs cite that count. `pnpm calc` lists
them; they do not fail a command.

## Launch

```sh
PORT=$(python3 -c "import json;print(json.load(open('.wt.json'))['port'])" 2>/dev/null || echo 3417)
pnpm --filter @phosphoros/web exec next dev --port $PORT > /tmp/phosphoros-$PORT.log 2>&1 & echo $! > /tmp/phosphoros-$PORT.pid
```

Ready when: `curl -sf localhost:$PORT/ >/dev/null` succeeds (first compile takes a few seconds).
Needs: Node 24 and `pnpm install`. No secrets: the site is static and reads `data/` and `docs/`.

For the production build exactly as deployed:

```sh
PHOSPHOROS_BUILD=$(git rev-parse --short=7 HEAD) ~/.claude/claude-core/bin/heavy pnpm build
pnpm --filter @phosphoros/web exec next start --port $PORT > /tmp/phosphoros-$PORT.log 2>&1 & echo $! > /tmp/phosphoros-$PORT.pid
```

## Doctor

```sh
curl -s localhost:$PORT/ | grep -o 'name="phosphoros-build" content="[^"]*"'
```

Prints `content="dev"` under `next dev`, or the short SHA you built. Anything else, or nothing,
means the port is not this run's server. Run it before the first drive, and again after any failure.

## Drive

- **Pages:** fetch the route and read the rendered text (`curl -s localhost:$PORT/plan`), or load
  it in Chromium with `playwright-core` (launch with `--use-angle=swiftshader`, see
  `tools/lib/chromium.ts`). Numbers are `<button class="num ...">` elements; clicking one opens
  its card (a popover `#q-<id>`).
- **CLI:** run the command and read stdout, stderr and the exit code.
- **Figures:** `pnpm figures`, then `node tools/look.ts <dir> <id>...` and look at both PNGs.
- **Live site:** `tools/deploy.sh --check` proves the production domain serves HEAD.

## Evidence

- Record the command and its decisive output: status plus body, the rendered text, the
  exit code, or the image you looked at.
- Capture both the action and the resulting state; check side effects through a
  second, read-only view (after `pnpm run docs`, `pnpm run docs --check` is current).
- If a path is unreachable, name the missing precondition and prove the nearest
  real path. Never report it as verified.

## Cleanup

`kill $(cat /tmp/phosphoros-$PORT.pid)`. Kill only what this run started: other sessions'
servers run on this machine. Keep evidence files outside anything you delete.
