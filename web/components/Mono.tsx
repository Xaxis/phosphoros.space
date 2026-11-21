/**
 * A number set in IBM Plex Mono. The font gives every superscript digit a full cell, so "10²⁷"
 * shows a gap between its two exponent digits; a run of superscripts is set tighter (`.sup-run`).
 */
const RUN = /([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]{2,})/;

export function Mono({ text }: { text: string }) {
  const parts = text.split(RUN);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="sup-run">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}
