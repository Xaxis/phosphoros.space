# Contributing to Phosphoros

Phosphoros is a plan anyone can check. Every number comes from [`data/`](data/) through the model in
[`calc/`](calc/), every claim about the real world cites a source, and every invention says it is one.
Contributions that make the plan more honest are the most welcome kind: a number that is wrong, a source
that says something else, a physics check that should fail and does not.

## Rerun the numbers

You need Node 24 and pnpm 10.

```sh
pnpm install
pnpm calc                                   # every derived number, then the physics checks
pnpm calc --only veil-distance              # one number: value, formula, inputs, where it is defined
pnpm calc --set foundry-doubling-days=70    # change an assumption and see what follows
pnpm calc --claims                          # every number in the version 2 brief against the model
pnpm test                                   # the model's invariants
```

The site's [Explorer](https://phosphoros.space/explore) runs the same model in your browser.

## Ways to help

- **Challenge a number.** Open a ["challenge a number" issue](https://github.com/Xaxis/phosphoros.space/issues/new?template=challenge-a-number.yml).
  Name the number's id (it is in the ledger, [`docs/numbers.md`](docs/numbers.md)), say what you think it
  should be, and why.
- **Propose an invention.** Open a ["propose an invention" issue](https://github.com/Xaxis/phosphoros.space/issues/new?template=propose-an-invention.yml).
  Inventions may assume engineering we do not have, but never a violation of conservation of energy or
  the second law of thermodynamics.
- **Add a source.** Open an ["add a source" issue](https://github.com/Xaxis/phosphoros.space/issues/new?template=add-a-source.yml),
  or edit [`data/sources.yaml`](data/sources.yaml) directly.
- **Send a pull request.** Run `pnpm lint && pnpm test` first; both must pass.

## How the repository fits together

| Path | What it holds |
| --- | --- |
| `data/constants.yaml` | Measured facts and established physics, each with a source |
| `data/assumptions.yaml` | The plan's choices: sizes, counts, efficiencies and dates |
| `data/*.yaml` | Tables: technologies, timeline, experiments, risks, missions, literature, sources, corrections |
| `data/claims.yaml` | Every number in the version 2 brief, checked against the model |
| `data/outputs.json` | Every published number, generated |
| `calc/src/model/` | One module per system; each derived number records the inputs it read |
| `docs/` | One document per page of the site, kept current by `pnpm docs` |
| `docs/numbers.md` | The ledger: every number, its formula, inputs and the line that defines it, generated |
| `figures/` | Charts and diagrams, drawn from the model; `figures/svg/` holds static copies for GitHub |
| `web/` | The site |
| `tools/` | Docs sync, style checks, figure export and deploy |

A number never appears twice. If a page needs it, the page refers to it by id.

## Writing

**No em dashes**, anywhere: copy, code, comments, docs, data. Use commas, colons, parentheses or separate
sentences. `pnpm lint` rejects them.

The voice is confident, precise and honest. Short sentences. Engineering first. Say what is invented and
what is real.

### Numbers in documents

Never type a quantity into a document. Link to the ledger instead, and `pnpm docs` fills in the text:

```md
Cooling the air takes [5.3 × 10²⁶ J](numbers.md#atmosphere-heat) of heat.
From docs/technologies/: [5.3 × 10²⁶ J](../numbers.md#atmosphere-heat)
Pick the display with a query: [1.11 × 10⁶ km](numbers.md?sig=3&show=km#veil-distance)
Dates: [June 2033](numbers.md?date=month#foundry-full-scale), ?date=day, ?date=year
```

Any number with a unit, a power of ten or a percentage counts as a quantity; `pnpm lint` finds the ones
typed by hand. Years in dates, counts of things ("twelve machine types") and section numbers are fine. If
a number you need is not in the model, add it: a measured fact to `data/constants.yaml` (with a source),
a plan choice to `data/assumptions.yaml`, or a computed one to the right module in `calc/src/model/`.

In data files, write `{id}` instead: `summary: "reaches {foundry-final-mass} by {foundry-full-scale}"`.
Options go after a bar: `{veil-distance|sig=3,show=km}`, `{foundry-landing|date=day}`.

### Sources, links and figures

- Cite with `[Angel 2006](sources.md#angel-2006)`, using an id from `data/sources.yaml`.
- Link between documents with relative paths: `[Hesperus Veil](technologies/veil.md)`.
- Place a figure with an empty block; `pnpm docs` fills in the image once the figure exists:
  `<!-- figure:foundry-growth -->` then `<!-- /figure -->` on the next line.
- Tables that live in data are generated in place: `<!-- table:specs veil -->` then `<!-- /table -->`.
  Kinds: `specs <tech>`, `techs`, `groups genesis`, `tiers choir`, `baseline`, `finish`, `timeline`,
  `experiments`, `risks`, `missions`, `literature`, `budget`, `mass`, `checks`, `corrections`, `claims`,
  `assumptions`.

### Real or invented

Readers must never mistake an invention for something that exists. In prose, mark it with a labelled
quote:

```md
> **Invented:** Lithocell chip fabs write circuits with a million parallel electron beams, no masks.

> **Precedent:** An LED at MIT emitted more light than the electricity it drew ([Santhanam 2012](sources.md#santhanam-2012)).

> **Physics:** A plain radiator cannot shine brighter than σT⁴ at its own temperature.
```

Every input in the data carries a `basis` (physics, precedent, invented or design) and the site marks
every number with it.

### Corrections

Never quietly change a number that was published. Change the data, add an entry to
[`data/corrections.yaml`](data/corrections.yaml) saying what changed and why, and if the brief's number
was wrong, note it in `data/claims.yaml`. Open problems get an issue and a failing check in the model.

## Licence

Code is MIT; text, data and figures are CC BY 4.0. See [LICENSE](LICENSE).
