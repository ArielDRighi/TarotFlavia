// 2. Icons
import { KeyRound, Sparkles } from 'lucide-react';

// 6. Utils & types
import { cn } from '@/lib/utils';
import type { CalloutVariant } from '@/lib/data/encyclopedia-editorial.data';

// ─── Constants ──────────────────────────────────────────────────────────────────

interface CalloutConfig {
  label: string;
  Icon: typeof KeyRound;
}

const CALLOUT_CONFIG: Record<CalloutVariant, CalloutConfig> = {
  clave: { label: 'Clave', Icon: KeyRound },
  sabias: { label: 'Sabías que…', Icon: Sparkles },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleCalloutProps {
  /** Visual flavor of the callout. */
  variant: CalloutVariant;
  /** Callout body content. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ArticleCallout Component
 *
 * Editorial aside that breaks the reading rhythm with a brand-gold highlight.
 * Two flavors: "Clave" (key takeaway) and "Sabías que…" (did-you-know). Used by
 * the encyclopedia editorial template to surface insights per section.
 *
 * @example
 * ```tsx
 * <ArticleCallout variant="clave">El Tarot no predice un futuro fijo…</ArticleCallout>
 * ```
 */
export function ArticleCallout({ variant, children, className }: ArticleCalloutProps) {
  const { label, Icon } = CALLOUT_CONFIG[variant];

  return (
    <aside
      data-testid="article-callout"
      role="note"
      aria-label={label}
      className={cn(
        'border-secondary bg-secondary/5 my-8 rounded-r-lg border-l-4 py-4 pr-5 pl-5',
        className
      )}
    >
      <div className="text-secondary mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-[0.12em] uppercase">{label}</span>
      </div>
      <div className="text-foreground/90 text-lg leading-relaxed">{children}</div>
    </aside>
  );
}
