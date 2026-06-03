'use client';

// 1. React & Next.js
import { useEffect, useState } from 'react';

// 2. Icons
import { List } from 'lucide-react';

// 6. Utils & types
import { cn } from '@/lib/utils';
import type { ArticleHeading } from '@/lib/utils/text';

// ─── Constants ──────────────────────────────────────────────────────────────────

/**
 * Scroll-spy activation band: a heading becomes "active" once it crosses into
 * the top ~30% of the viewport (offset 80px for sticky chrome), so the TOC
 * highlights the section the reader is actually on, not the one barely entering.
 */
const SCROLL_SPY_ROOT_MARGIN = '-80px 0px -70% 0px';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleTocProps {
  /** Navigable headings derived from the article (see `extractArticleHeadings`). */
  headings: ArticleHeading[];
  /** Additional CSS classes for the wrapper `<nav>`. */
  className?: string;
}

interface TocLinkListProps {
  headings: ArticleHeading[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

/**
 * The ordered list of anchor links. Shared by the mobile (collapsible) and the
 * desktop (sticky sidebar) variants so they stay visually and behaviourally in
 * sync. The active link carries `aria-current="location"` for assistive tech.
 */
function TocLinkList({ headings, activeId, onSelect }: TocLinkListProps) {
  return (
    <ol className="space-y-1">
      {headings.map((heading) => {
        const isActive = heading.id === activeId;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={isActive ? 'location' : undefined}
              onClick={() => onSelect(heading.id)}
              className={cn(
                'focus-visible:ring-secondary flex items-baseline gap-2 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none',
                isActive
                  ? 'bg-secondary/10 text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'shrink-0 tabular-nums',
                  isActive ? 'text-secondary' : 'text-muted-foreground/60'
                )}
              >
                {heading.number}.
              </span>
              <span>{heading.label}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ArticleToc Component
 *
 * "En esta guía" table of contents with scroll-spy. Builds a navigable index
 * from an article's numbered `## N.` sections (see `extractArticleHeadings`) and
 * highlights the section currently in view via an `IntersectionObserver`.
 *
 * Responsive: a collapsible `<details>` on mobile (rendered above the content)
 * and a sticky sidebar list on desktop (`lg:`). Renders nothing when there are
 * no headings.
 *
 * @example
 * ```tsx
 * <ArticleToc headings={extractArticleHeadings(article.content)} />
 * ```
 */
export function ArticleToc({ headings, className }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  // Reset the active section to the first when the set of sections changes. The
  // App Router reuses this component instance when navigating between guides, so
  // without this the highlight would keep the previous article's section until
  // the observer's first callback. Adjusting state during render (the React
  // idiom) avoids an effect-driven extra commit and a stale frame.
  const headingsKey = headings.map((heading) => heading.id).join('|');
  const [prevHeadingsKey, setPrevHeadingsKey] = useState(headingsKey);
  if (prevHeadingsKey !== headingsKey) {
    setPrevHeadingsKey(headingsKey);
    setActiveId(headings[0]?.id ?? null);
  }

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) {
          // Keep the last active section so the TOC never goes blank between
          // sections (e.g. while scrolling through a long figure).
          return;
        }
        const topmost = visible.reduce((closest, entry) =>
          entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest
        );
        setActiveId(topmost.target.id);
      },
      { rootMargin: SCROLL_SPY_ROOT_MARGIN, threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const title = (
    <span className="text-foreground flex items-center gap-2 font-serif text-base font-semibold">
      <List className="text-secondary h-4 w-4" aria-hidden="true" />
      En esta guía
    </span>
  );

  return (
    <nav
      data-testid="article-toc"
      aria-label="En esta guía"
      className={cn('lg:sticky lg:top-24 lg:self-start', className)}
    >
      {/* Mobile: índice colapsable encima del contenido */}
      <details data-testid="article-toc-mobile" className="bg-card rounded-xl border p-4 lg:hidden">
        <summary className="focus-visible:ring-secondary flex cursor-pointer list-none items-center justify-between gap-2 rounded-md focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
          {title}
        </summary>
        <div className="mt-3">
          <TocLinkList headings={headings} activeId={activeId} onSelect={setActiveId} />
        </div>
      </details>

      {/* Desktop: barra lateral fija */}
      <div data-testid="article-toc-desktop" className="hidden lg:block">
        <div className="mb-3">{title}</div>
        <TocLinkList headings={headings} activeId={activeId} onSelect={setActiveId} />
      </div>
    </nav>
  );
}
