import { formatQuantity } from "@phosphoros/calc/format";
import type { Quantity } from "@phosphoros/calc/registry";
import type { Metadata } from "next";
import { BasisGlyph, BasisTag } from "../../components/Basis";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { LedgerFilter } from "../../components/LedgerFilter";
import { Mono } from "../../components/Mono";
import { basisOf } from "../../components/Num";
import { pageMeta } from "../../lib/meta";
import { definedAt, model } from "../../lib/model";
import { NUMBERS, REPO, repoUrl } from "../../lib/site";

export const metadata: Metadata = pageMeta(NUMBERS);

function Row({ q }: { q: Quantity }) {
  const { r } = model();
  const at = definedAt(q.id);
  const search = `${q.id} ${q.label} ${q.kind === "derived" ? q.formula : ""}`.toLowerCase();
  return (
    <tr id={q.id} data-q={search}>
      <td data-label="Quantity">
        <span className="ledger-label">{q.label}</span>
        <code className="ledger-id">{q.id}</code>
      </td>
      <td className="ledger-value" data-label="Value">
        <Mono text={formatQuantity(q, { date: "day" })} />
      </td>
      <td data-label="Basis">
        <BasisTag basis={basisOf(q)} />
      </td>
      <td className="ledger-how" data-label="How">
        {q.kind === "derived" ? (
          <>
            <span className="ledger-formula">{q.formula}</span>
            <span className="ledger-inputs">
              {q.inputs.map((i, k) => (
                <span key={i}>
                  {k > 0 && " "}
                  <a href={`#${i}`} title={r.get(i).label}>
                    <BasisGlyph basis={basisOf(r.get(i))} />
                    {i}
                  </a>
                </span>
              ))}
            </span>
          </>
        ) : (
          <span className="ledger-sources">
            {(q.source ?? []).map((s, k) => (
              <span key={s}>
                {k > 0 && ", "}
                <a href={`/sources#${s}`}>{s}</a>
              </span>
            ))}
            {q.range && (
              <>
                {" "}
                <a href={`/explore#${q.id}`}>Explore</a>
              </>
            )}
          </span>
        )}
        {q.note && <span className="ledger-note">{q.note}</span>}
      </td>
      <td className="cell-short" data-label="Defined at">
        <a className="ledger-src" href={repoUrl(at.file, at.line)}>
          {at.file.replace(/^calc\/src\//, "")}:{at.line}
        </a>
      </td>
    </tr>
  );
}

function Group({ title, file, list }: { title: string; file: string; list: Quantity[] }) {
  return (
    <section data-group>
      <h2 id={`group-${file.replace(/[^a-z0-9]+/gi, "-")}`}>
        {title}{" "}
        <a className="ledger-file" href={repoUrl(file)}>
          {file}
        </a>
      </h2>
      <div className="table-wrap table-stack">
        <table className="ledger">
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Value</th>
              <th>Basis</th>
              <th>How</th>
              <th>Defined at</th>
            </tr>
          </thead>
          <tbody>
            {list.map((q) => (
              <Row key={q.id} q={q} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function NumbersPage() {
  const { r, content } = model();
  const inputs = [...r.inputs.values()].map((q) => ({ ...q, kind: "input" as const }));
  const derived = [...r.derived.values()].map((q) => ({ ...q, kind: "derived" as const }));
  const modules = [...new Set(derived.map((d) => d.module))];
  const checks = [...r.checks.values()];
  return (
    <>
      <Header current="/numbers" />
      <main id="content" className="page page-wide">
        <div className="page-hero">
          <p className="eyebrow">The ledger</p>
          <h1>Every number</h1>
          <div className="lead">
            <p>
              All {inputs.length + derived.length} numbers Phosphoros publishes. {inputs.length} are
              inputs read from data files, each a measured fact with a source or a choice the plan
              makes. The other {derived.length} are computed from them; each lists the formula and
              the exact inputs it read. Reproduce any of them with{" "}
              <code>pnpm calc --only &lt;id&gt;</code>.
            </p>
          </div>
        </div>
        <LedgerFilter total={inputs.length + derived.length} />
        <section className="checks" aria-labelledby="checks">
          <h2 id="checks">Physics checks</h2>
          <ul className="check-list">
            {checks.map((c) => (
              <li key={c.id} id={`check-${c.id}`} className={c.pass ? "check-pass" : "check-fail"}>
                <span className="check-mark">{c.pass ? "Pass" : c.issue ? "Open" : "Fail"}</span>
                <div>
                  <p className="check-label">{c.label}</p>
                  <p className="check-detail">
                    {c.detail}
                    {(() => {
                      const n = content.corrections.find((x) => x.id === c.issue)?.issue;
                      return n ? (
                        <>
                          {" "}
                          <a href={`${REPO}/issues/${n}`}>Issue #{n}</a>
                        </>
                      ) : null;
                    })()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <Group
          title="Constants"
          file="data/constants.yaml"
          list={inputs.filter((q) => q.file === "data/constants.yaml")}
        />
        <Group
          title="Assumptions"
          file="data/assumptions.yaml"
          list={inputs.filter((q) => q.file === "data/assumptions.yaml")}
        />
        {modules.map((m) => (
          <Group
            key={m}
            title={m.replace(/^model\//, "").replace(/\.ts$/, "")}
            file={`calc/src/${m}`}
            list={derived.filter((d) => d.module === m)}
          />
        ))}
      </main>
      <Footer doc="docs/numbers.md" />
    </>
  );
}
