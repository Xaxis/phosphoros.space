/**
 * A number from the model. The button shows it; selecting it opens a card (the HTML popover API,
 * no script) with its basis, formula, inputs, sources and the exact line that defines it. One card
 * per number per page: <NumberCards> renders them all at the end.
 */
import { formatQuantity } from "@phosphoros/calc/format";
import type { Basis, Quantity } from "@phosphoros/calc/registry";
import { formatRef, type RefOptions } from "@phosphoros/calc/template";
import { definedAt, model, quantity } from "../lib/model";
import { repoUrl } from "../lib/site";
import { BASIS_LABEL, BasisGlyph, BasisTag } from "./Basis";

export function basisOf(q: Quantity): Basis {
  return q.basis ?? "physics";
}

export function Num({ id, opts = {} }: { id: string; opts?: RefOptions }) {
  const q = quantity(id);
  const basis = basisOf(q);
  return (
    <button
      type="button"
      className={`num num-${basis}`}
      popoverTarget={`q-${id}`}
      aria-label={`${formatRef(q, opts)}: ${q.label} (${BASIS_LABEL[basis]}). Show how it is computed.`}
    >
      {formatRef(q, opts)}
    </button>
  );
}

function SI({ q }: { q: Quantity }) {
  if (q.unit === "date") return null;
  const shown = formatQuantity(q, { sig: 6, date: "day" });
  const si = formatQuantity({ value: q.value, unit: q.unit, sig: 6 });
  return shown === si ? null : <span className="card-si">{si}</span>;
}

function Card({ id }: { id: string }) {
  const { r, content } = model();
  const q = quantity(id);
  const at = definedAt(id);
  const sources = q.kind === "input" ? (q.source ?? []) : [];
  const title = (sid: string) => content.sources.find((s) => s.id === sid)?.title ?? sid;
  return (
    <div id={`q-${id}`} popover="auto" className="card" role="dialog" aria-label={q.label}>
      <div className="card-head">
        <BasisTag basis={basisOf(q)} />
        <span className="card-kind">{q.kind === "input" ? "Input" : "Derived"}</span>
      </div>
      <p className="card-label">{q.label}</p>
      <p className="card-value">
        {formatQuantity(q, { sig: q.sig ? Math.max(q.sig, 3) : 3, date: "day" })}
        <SI q={q} />
      </p>
      {q.kind === "derived" && (
        <>
          <p className="card-formula">
            <span className="card-eq">=</span> {q.formula}
          </p>
          {q.inputs.length > 0 && (
            <ul className="card-inputs">
              {q.inputs.slice(0, 8).map((i) => {
                const d = r.get(i);
                return (
                  <li key={i}>
                    <BasisGlyph basis={basisOf(d)} />
                    <a href={`/numbers#${i}`}>{d.label}</a>
                    <span className="card-input-value">{formatQuantity(d, { date: "day" })}</span>
                  </li>
                );
              })}
              {q.inputs.length > 8 && <li className="card-more">and {q.inputs.length - 8} more</li>}
            </ul>
          )}
        </>
      )}
      {q.note && <p className="card-note">{q.note}</p>}
      {sources.length > 0 && (
        <p className="card-sources">
          Source:{" "}
          {sources.map((s, i) => (
            <span key={s}>
              {i > 0 && "; "}
              <a href={`/sources#${s}`}>{title(s)}</a>
            </span>
          ))}
        </p>
      )}
      <div className="card-foot">
        <a href={repoUrl(at.file, at.line)}>
          View source{" "}
          <span className="card-file">
            {at.file.replace(/^calc\/src\//, "")}:{at.line}
          </span>
        </a>
        <a href={`/numbers#${id}`}>Ledger</a>
        {q.kind === "input" && q.range && <a href={`/explore#${id}`}>Explore</a>}
      </div>
      <code className="card-cmd">pnpm calc --only {id}</code>
    </div>
  );
}

export function NumberCards({ ids }: { ids: Iterable<string> }) {
  const { r } = model();
  const known = [...new Set(ids)].filter((id) => r.inputs.has(id) || r.derived.has(id));
  return (
    <div className="cards">
      {known.map((id) => (
        <Card key={id} id={id} />
      ))}
    </div>
  );
}
