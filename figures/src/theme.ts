/**
 * The figures' colours, for both themes, in one place. The site and the static SVGs in figures/svg/
 * use the same stylesheet, so a chart looks the same on phosphoros.space and on GitHub.
 *
 * Colour carries one job per figure. Series slots are the validated categorical order (checked
 * against these surfaces with the dataviz validator: adjacent CVD ΔE ≥ 8.4, normal-vision ΔE ≥ 19.3
 * in both themes; in the light theme three slots sit under 3:1, so every figure labels its marks
 * directly and has a table view). Hot and cool are Venus today and Venus in 2036. The four basis
 * colours mark physics, precedent, invented and design choice, always beside their glyph.
 */
export const TOKENS = {
  dark: {
    surface: "#10121d",
    sunk: "#0c0d17",
    ink: "#ece6da",
    soft: "#c9c3b8",
    muted: "#9b98a8",
    grid: "#232741",
    axis: "#3a3f5e",
    accent: "#f3c463",
    hot: "#ff8a50",
    cool: "#63cdb9",
    danger: "#ff7a7a",
    s1: "#3987e5",
    s2: "#d95926",
    s3: "#199e70",
    s4: "#c98500",
    s5: "#d55181",
    s6: "#0ca30c",
    physics: "#86aef0",
    precedent: "#5fcf9f",
    invented: "#cfa2ff",
    design: "#aeabbc",
  },
  light: {
    surface: "#ffffff",
    sunk: "#f6f1e7",
    ink: "#1b1a23",
    soft: "#3a3844",
    muted: "#6a6775",
    grid: "#ebe4d6",
    axis: "#cdbfa6",
    accent: "#9a5b06",
    hot: "#c2470f",
    cool: "#13806f",
    danger: "#b3261e",
    s1: "#2a78d6",
    s2: "#eb6834",
    s3: "#1baf7a",
    s4: "#eda100",
    s5: "#e87ba4",
    s6: "#008300",
    physics: "#2c5cb0",
    precedent: "#19764f",
    invented: "#7a3fc4",
    design: "#67636f",
  },
} as const;

export type Token = keyof (typeof TOKENS)["dark"];
const NAMES = Object.keys(TOKENS.dark) as Token[];

const vars = (theme: "dark" | "light") =>
  NAMES.map((n) => `--f-${n}:${TOKENS[theme][n]}`).join(";");

/** Classes the figures draw with: f-<token> fills, f-<token>-line strokes, f-<token>-wash tints. */
const RULES = [
  ...NAMES.flatMap((n) => [
    `.fig .f-${n}{fill:var(--f-${n})}`,
    `.fig .f-${n}-line{stroke:var(--f-${n});fill:none}`,
    `.fig .f-${n}-wash{fill:var(--f-${n});fill-opacity:.1}`,
  ]),
  // No var() here: an undefined variable would void the whole stack. The site sets its own face.
  ".fig{font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:13px}",
  ".fig text{fill:var(--f-soft)}",
  ".fig .f-title{fill:var(--f-ink);font-weight:600}",
  ".fig .f-label{fill:var(--f-ink)}",
  ".fig .f-note{fill:var(--f-muted);font-size:11.5px}",
  ".fig .f-num{font-variant-numeric:tabular-nums}",
  ".fig .f-tick{fill:var(--f-muted);font-size:11px;font-variant-numeric:tabular-nums}",
  ".fig .f-grid{stroke:var(--f-grid);stroke-width:1;fill:none}",
  ".fig .f-axis{stroke:var(--f-axis);stroke-width:1;fill:none}",
  ".fig .f-ring{stroke:var(--f-surface);stroke-width:2}",
  ".fig .f-mark-line{stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}",
  ".fig a:hover .f-node, .fig a:focus .f-node{stroke:var(--f-accent);stroke-width:2}",
  ".fig a:focus{outline:none}",
  ".fig a:focus-visible .f-node{stroke-width:3}",
];

/**
 * The stylesheet. On the site the theme follows the page (data-theme, else the system setting); in a
 * standalone SVG the svg element is the root, so the same selectors follow the system setting.
 */
export function figureCss(): string {
  return [
    `.fig{${vars("dark")}}`,
    `@media (prefers-color-scheme: light){:root:not([data-theme="dark"]) .fig,.fig:root:not([data-theme="dark"]){${vars("light")}}}`,
    `:root[data-theme="light"] .fig{${vars("light")}}`,
    ...RULES,
  ].join("\n");
}
