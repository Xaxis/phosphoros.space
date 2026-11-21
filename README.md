# Phosphoros

**Venus, Earth-like, by 2036.** A complete, open engineering plan to make Venus Earth-like in ten
years by inventing the technology it needs, with every number computed from open data and the
physics checked on every change.

Read it at **[phosphoros.space](https://phosphoros.space)**, or here on GitHub, starting with
[the plan in one page](docs/README.md).

## What makes it different

- **Every number is reproducible.** Nothing is typed by hand. Inputs live in [`data/`](data/), the
  model in [`calc/`](calc/) derives everything else, and the [ledger](docs/numbers.md) lists every
  number with its formula, its inputs and the line that defines it.
- **The physics is checked, not assumed.** Energy must be conserved, the second law must hold,
  everything that hovers must be held by something, and no machine may be asked for more than it can
  give. The model checks all of it on every change. Where a design fails a check, the failure is
  published with an open issue, not hidden.
- **Real and invented are never mixed up.** Every input is marked as physics, precedent, invented
  or a design choice, and the site shows the mark on every number.
- **Anyone can fork it.** Change an assumption in the [Explorer](https://phosphoros.space/explore)
  or in [`data/assumptions.yaml`](data/assumptions.yaml) and watch every consequence move.

## Rerun the numbers

You need Node 24 and pnpm 10.

```sh
pnpm install
pnpm calc                                   # every derived number, then the physics checks
pnpm calc --only veil-distance              # one number: value, formula, inputs, where it is defined
pnpm calc --set foundry-doubling-days=70    # change an assumption and see what follows
pnpm calc --claims                          # the version 2 brief's numbers against the model
pnpm test                                   # the model's invariants
pnpm dev                                    # the site, at http://localhost:3417
```

## The repository

| Path | What it holds |
| --- | --- |
| [`docs/`](docs/) | One document per page of the site: the plan, the budget, the timeline, the risks, and one per technology |
| [`data/`](data/) | Constants with sources, the plan's assumptions, and every table |
| [`calc/`](calc/) | The model: one module per system, a day-by-day simulation, and the physics checks |
| [`figures/`](figures/) | Charts and diagrams drawn from the model; [`figures/svg/`](figures/svg/) holds static copies |
| [`web/`](web/) | The site |
| [`tools/`](tools/) | Docs sync, style checks, figure export and deploy |

## Contribute

Challenge a number, propose an invention or add a source: see [CONTRIBUTING.md](CONTRIBUTING.md).
Every accepted change to a published number goes in the corrections log, with credit. What changed
in each version is in [CHANGELOG.md](CHANGELOG.md).

## Licence

Code is MIT; text, data and figures are CC BY 4.0. See [LICENSE](LICENSE).
