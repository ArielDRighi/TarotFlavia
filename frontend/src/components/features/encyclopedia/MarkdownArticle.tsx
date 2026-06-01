'use client';

// 3. Third-party
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 6. Utils & types
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarkdownArticleProps {
  /** Raw Markdown content to render */
  content: string;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

// ─── Editorial component map ────────────────────────────────────────────────────

/**
 * Maps every Markdown node to a brand-aligned Tailwind element.
 *
 * This replaces the inert `prose`/`prose-neutral` classes: Tailwind v4 ships
 * without `@tailwindcss/typography`, so those utilities never existed and the
 * content rendered as a flat wall of text. Mapping the nodes by hand keeps us
 * dependency-free and lets us inject editorial details (gold accents, serif
 * headings, decorative separators) coherent with the Auguria canon.
 *
 * Design tokens:
 * - Headings → Cormorant Garamond (`font-serif`), graphite (`text-foreground`).
 * - Body → Lato (`font-sans` from the wrapper), `text-lg leading-relaxed`.
 * - Links → mystic lila (`text-primary`).
 * - Accents (separators, list markers, quote border, table head) → gold (`secondary`).
 */
const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="text-foreground mt-12 mb-6 font-serif text-4xl leading-tight font-bold first:mt-0 sm:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-foreground border-secondary/30 mt-12 mb-5 border-b pb-2 font-serif text-3xl leading-snug font-bold first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-foreground mt-8 mb-3 font-serif text-2xl leading-snug font-semibold">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="text-foreground mb-6 text-lg leading-relaxed">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary decoration-primary/40 hover:decoration-primary font-medium underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="marker:text-secondary mb-6 ml-6 list-disc space-y-2 text-lg leading-relaxed">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="marker:text-secondary mb-6 ml-6 list-decimal space-y-2 text-lg leading-relaxed marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-foreground pl-1">{children}</li>,
  strong: ({ children }) => <strong className="text-foreground font-bold">{children}</strong>,
  em: ({ children }) => <em className="text-foreground italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-secondary bg-secondary/5 text-foreground/90 my-8 border-l-4 py-3 pr-4 pl-6 font-serif text-xl italic">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr aria-hidden="false" className="border-secondary/40 mx-auto my-10 w-24 border-t-2" />
  ),
  code: ({ children }) => (
    <code className="bg-muted text-primary rounded px-1.5 py-0.5 font-mono text-base">
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-left text-base">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-secondary/10">{children}</thead>,
  th: ({ children }) => (
    <th className="text-foreground border-secondary/40 border-b-2 px-4 py-2 font-serif font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-foreground border-border border-b px-4 py-2">{children}</td>
  ),
};

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * MarkdownArticle Component
 *
 * Renders an article's Markdown content with real editorial hierarchy and the
 * Auguria brand tokens (Cormorant headings, Lato body, lila links, gold accents).
 * Reusable across every article type (guides, signs, planets, elements).
 *
 * @example
 * ```tsx
 * <MarkdownArticle content={article.content} />
 * ```
 */
export function MarkdownArticle({ content, className }: MarkdownArticleProps) {
  return (
    <div data-testid="markdown-article" className={cn('max-w-[68ch] font-sans', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
