'use client';

// 1. React & Next.js
import { useMemo } from 'react';
import Image from 'next/image';

// 3. Third-party
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 5. Components
import { ArticleCallout } from './ArticleCallout';

// 6. Utils & types
import { cn } from '@/lib/utils';
import { getSectionAnchorId } from '@/lib/utils/text';
import type { EditorialSection } from '@/lib/data/encyclopedia-editorial.data';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarkdownArticleProps {
  /** Raw Markdown content to render */
  content: string;
  /** Additional CSS classes for the wrapper */
  className?: string;
  /**
   * Enable editorial mode: drop-cap on the first paragraph, numbered gold badges
   * on `## N. …` headings, decorative `✦` separators, and per-section assets.
   * Off by default so other article types render with plain typography.
   */
  editorial?: boolean;
  /**
   * Enable astro mode: adds sequential anchor IDs (`seccion-N`) to H2 headings
   * so `ArticleToc`'s scroll-spy can track them. Does not activate drop-cap or
   * numbered badges. Ignored when `editorial` is true.
   */
  astro?: boolean;
  /**
   * Per-section editorial resources (image and/or callout), keyed by the H2
   * section number. Only used when `editorial` is enabled; the matching section's
   * assets are injected right after its heading.
   */
  sections?: Record<number, EditorialSection>;
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

// ─── Editorial mode ──────────────────────────────────────────────────────────

/**
 * Drop-cap on the article's first paragraph, applied via CSS scoped to the
 * wrapper's first `<p>`. Stateless by design — survives re-renders (unlike a
 * render-time flag) and adds no work to the node mapping.
 */
const DROP_CAP_CLASSES = [
  '[&>p:first-of-type]:first-letter:float-left',
  '[&>p:first-of-type]:first-letter:mt-1',
  '[&>p:first-of-type]:first-letter:mr-3',
  '[&>p:first-of-type]:first-letter:font-serif',
  '[&>p:first-of-type]:first-letter:text-6xl',
  '[&>p:first-of-type]:first-letter:leading-[0.8]',
  '[&>p:first-of-type]:first-letter:font-bold',
  '[&>p:first-of-type]:first-letter:text-secondary',
].join(' ');

const HEADING_NUMBER_RE = /^(\d+)\.\s+(.*)$/;

/**
 * Splits a `## N. Título` heading into its section number and label. Returns a
 * null number for headings without a leading `N.` (rendered without a badge).
 *
 * Handles both a plain string and an array of nodes (a heading with inline
 * markdown such as `## 2. Los **78** Arcanos`): the leading `N.` is stripped
 * from the first text node and the remaining inline nodes are preserved.
 */
function splitHeadingNumber(children: React.ReactNode): {
  number: number | null;
  label: React.ReactNode;
} {
  if (typeof children === 'string') {
    const match = children.match(HEADING_NUMBER_RE);
    if (match) {
      return { number: Number(match[1]), label: match[2] };
    }
  } else if (Array.isArray(children) && typeof children[0] === 'string') {
    const match = children[0].match(HEADING_NUMBER_RE);
    if (match) {
      return { number: Number(match[1]), label: [match[2], ...children.slice(1)] };
    }
  }
  return { number: null, label: children };
}

/**
 * Builds the astro component map: extends the base typography by adding
 * sequential anchor IDs (`seccion-N`) to each H2 so `ArticleToc`'s
 * IntersectionObserver can track them. No drop-cap, no badges, no separators.
 * A closure counter resets on every `useMemo` rebuild (content change), keeping
 * IDs in sync with `extractAstroHeadings`.
 */
function buildAstroComponents(): Components {
  let headingIndex = 0;
  return {
    ...MARKDOWN_COMPONENTS,
    h2: ({ children }) => {
      headingIndex += 1;
      return (
        <h2
          id={getSectionAnchorId(headingIndex)}
          className="text-foreground border-secondary/30 mt-12 mb-5 scroll-mt-24 border-b pb-2 font-serif text-3xl leading-snug font-bold first:mt-0"
        >
          {children}
        </h2>
      );
    },
  };
}

/**
 * Builds the editorial component map: extends the base typography with numbered
 * gold H2 badges, `✦` thematic separators, and the injection of per-section
 * images/callouts right after their heading.
 *
 * The drop-cap on the first paragraph is applied via CSS on the wrapper (see
 * `DROP_CAP_CLASSES`), not here — keeping these overrides stateless so they
 * survive re-renders without losing the drop-cap.
 */
function buildEditorialComponents(sections?: Record<number, EditorialSection>): Components {
  return {
    ...MARKDOWN_COMPONENTS,
    h2: ({ children }) => {
      const { number, label } = splitHeadingNumber(children);
      const section = number !== null ? sections?.[number] : undefined;

      return (
        <>
          <h2
            id={number !== null ? getSectionAnchorId(number) : undefined}
            className="text-foreground border-secondary/30 mt-12 mb-5 flex scroll-mt-24 items-center gap-3 border-b pb-2 font-serif text-3xl leading-snug font-bold first:mt-0"
          >
            {number !== null && (
              <span
                data-testid="section-number"
                aria-hidden="true"
                className="bg-secondary text-secondary-foreground inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold"
              >
                {number}
              </span>
            )}
            <span>{label}</span>
          </h2>
          {section?.image && (
            <figure data-testid="section-image" className="my-8">
              <Image
                src={section.image.src}
                alt={section.image.alt}
                width={section.image.width ?? 1000}
                height={section.image.height ?? 563}
                sizes="(max-width: 768px) 100vw, 720px"
                className="h-auto w-full rounded-xl shadow-lg"
              />
            </figure>
          )}
          {section?.callout && (
            <ArticleCallout variant={section.callout.variant}>
              {section.callout.text}
            </ArticleCallout>
          )}
        </>
      );
    },
    hr: () => (
      <div
        role="separator"
        data-testid="editorial-separator"
        className="my-10 flex items-center justify-center"
      >
        <span aria-hidden="true" className="text-secondary text-xl tracking-[0.5em]">
          ✦
        </span>
      </div>
    ),
  };
}

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
export function MarkdownArticle({
  content,
  className,
  editorial,
  astro,
  sections,
}: MarkdownArticleProps) {
  const components = useMemo(
    () =>
      editorial
        ? buildEditorialComponents(sections)
        : astro
          ? buildAstroComponents()
          : MARKDOWN_COMPONENTS,
    [editorial, astro, sections]
  );

  return (
    <div
      data-testid="markdown-article"
      className={cn('max-w-[68ch] font-sans', editorial && DROP_CAP_CLASSES, className)}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
