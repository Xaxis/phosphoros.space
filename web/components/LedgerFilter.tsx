"use client";
import { useState } from "react";

/** Filters the ledger's rows as you type. Without script, every row stays visible. */
export function LedgerFilter({ total }: { total: number }) {
  const [shown, setShown] = useState(total);
  return (
    <div className="ledger-filter">
      <label htmlFor="ledger-q" className="visually-hidden">
        Filter numbers
      </label>
      <input
        id="ledger-q"
        type="search"
        placeholder="Filter by name, id or formula"
        autoComplete="off"
        onInput={(e) => {
          const q = e.currentTarget.value.trim().toLowerCase();
          let n = 0;
          for (const row of document.querySelectorAll<HTMLElement>("[data-q]")) {
            const hit = !q || (row.dataset.q ?? "").includes(q);
            row.hidden = !hit;
            if (hit) n++;
          }
          for (const sec of document.querySelectorAll<HTMLElement>("[data-group]")) {
            sec.hidden = !sec.querySelector("[data-q]:not([hidden])");
          }
          setShown(n);
        }}
      />
      <span className="ledger-count" aria-live="polite">
        {shown} of {total}
      </span>
    </div>
  );
}
