/**
 * A document's Markdown as the site shows it. Ledger links become numbers with cards, source links
 * become citations, links between documents become site routes, and labelled quotes become the
 * real-or-invented callouts.
 */
import { parseOptions } from "@phosphoros/calc/template";
import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "../lib/docs";
import { model } from "../lib/model";
import { routeFor } from "../lib/site";
import { BasisGlyph } from "./Basis";
import { Num } from "./Num";

const LEDGER = /^(?:\.\.\/)*numbers\.md(?:\?([^#]*))?#([a-z0-9-]+)$/;
const SOURCE = /^(?:\.\.\/)*sources\.md#([a-z0-9-]+)$/;
const CALLOUT: Record<string, "invented" | "precedent" | "physics" | "design"> = {
  "Invented:": "invented",
  "Precedent:": "precedent",
  "Physics:": "physics",
  "Design choice:": "design",
};

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
}

function textOf(n: HastNode | undefined): string {
  if (!n) return "";
  if (n.type === "text") return n.value ?? "";
  return (n.children ?? []).map(textOf).join("");
}

function plain(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(plain).join("");
  if (children && typeof children === "object" && "props" in children)
    return plain((children as { props: { children?: ReactNode } }).props.children);
  return "";
}

function Cite({ id, children }: { id: string; children: ReactNode }) {
  const s = model().content.sources.find((x) => x.id === id);
  const title = s ? `${s.authors ?? ""}${s.year ? ` (${s.year})` : ""}. ${s.title}.` : id;
  return (
    <a className="cite" href={`/sources#${id}`} title={title}>
      {children}
    </a>
  );
}

function Heading({ level, children }: { level: 2 | 3 | 4; children: ReactNode }) {
  const id = slugify(plain(children));
  const Tag = `h${level}` as const;
  return (
    <Tag id={id}>
      {/* biome-ignore lint/a11y/useAnchorContent: a pointer-only shortcut to the heading's own link; the heading is the content */}
      <a className="anchor" href={`#${id}`} aria-hidden="true" tabIndex={-1}>
        #
      </a>
      {children}
    </Tag>
  );
}

export function Markdown({ text, doc }: { text: string; doc: string }) {
  const components: Components = {
    a({ href = "", children }) {
      const ledger = LEDGER.exec(href);
      if (ledger?.[2]?.startsWith("check-"))
        return <a href={`/numbers#${ledger[2]}`}>{children}</a>;
      if (ledger)
        return (
          <Num
            id={ledger[2] as string}
            opts={parseOptions(ledger[1] && decodeURIComponent(ledger[1]))}
          />
        );
      const source = SOURCE.exec(href);
      if (source) return <Cite id={source[1] as string}>{children}</Cite>;
      const to = routeFor(href, doc) ?? href;
      const external = /^https?:/.test(to) && !to.startsWith("https://phosphoros.space");
      return (
        <a href={to} {...(external ? { rel: "noopener" } : {})}>
          {children}
        </a>
      );
    },
    blockquote({ node, children }) {
      const first = (node as HastNode | undefined)?.children?.find((c) => c.type === "element");
      const strong = first?.children?.find((c) => c.type === "element");
      const label = strong?.tagName === "strong" ? textOf(strong).trim() : "";
      const kind = CALLOUT[label];
      if (!kind) return <blockquote>{children}</blockquote>;
      return (
        <aside className={`callout callout-${kind}`}>
          <span className="callout-glyph">
            <BasisGlyph basis={kind} />
          </span>
          <div className="callout-body">{children}</div>
        </aside>
      );
    },
    h2: ({ children }) => <Heading level={2}>{children}</Heading>,
    h3: ({ children }) => <Heading level={3}>{children}</Heading>,
    h4: ({ children }) => <Heading level={4}>{children}</Heading>,
    pre: ({ children }) => (
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling block must take focus to scroll by keys
      <pre tabIndex={0}>{children}</pre>
    ),
    table: ({ children }) => (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    ),
    img: ({ src, alt }) =>
      typeof src === "string" && /figures\/svg\//.test(src) ? null : (
        // biome-ignore lint/performance/noImgElement: documents may embed plain images
        <img src={src as string} alt={alt ?? ""} loading="lazy" />
      ),
  };
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {text}
    </ReactMarkdown>
  );
}
