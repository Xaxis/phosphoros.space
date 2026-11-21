import type { Basis as B } from "@phosphoros/calc/registry";
import type { ReactNode } from "react";

export const BASIS_LABEL: Record<B, string> = {
  physics: "Physics",
  precedent: "Precedent",
  invented: "Invented",
  design: "Design choice",
};

export const BASIS_MEANING: Record<B, string> = {
  physics: "Measured, or established physics",
  precedent: "Demonstrated, or from a published study, and cited",
  invented: "A breakthrough the plan assumes",
  design: "A size, count or date the plan chooses",
};

/** The marker for where a number or idea stands between proven and imagined. */
export function BasisTag({ basis, long = false }: { basis: B; long?: boolean }) {
  return (
    <span className={`basis basis-${basis}`}>
      <BasisGlyph basis={basis} />
      {BASIS_LABEL[basis]}
      {long && <span className="basis-meaning">: {BASIS_MEANING[basis]}</span>}
    </span>
  );
}

/** A small shape per basis, so the marker does not rely on colour alone. */
const SHAPES: Record<B, ReactNode> = {
  physics: <circle cx="5" cy="5" r="4" fill="currentColor" />,
  precedent: <rect x="1" y="1" width="8" height="8" rx="1" fill="currentColor" />,
  invented: (
    <path
      d="M5 0.5 L6.3 3.7 L9.5 5 L6.3 6.3 L5 9.5 L3.7 6.3 L0.5 5 L3.7 3.7 Z"
      fill="currentColor"
    />
  ),
  design: <circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />,
};

export function BasisGlyph({ basis }: { basis: B }) {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      className="glyph"
    >
      {SHAPES[basis]}
    </svg>
  );
}

export function Legend() {
  return (
    <p className="legend">
      <span className="legend-title">Every number is marked:</span>
      {(["physics", "precedent", "invented", "design"] as B[]).map((b) => (
        <BasisTag key={b} basis={b} long />
      ))}
      <span className="legend-hint">Select any number to see how it is computed.</span>
    </p>
  );
}
