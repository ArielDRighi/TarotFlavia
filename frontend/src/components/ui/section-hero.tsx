import type { ReactNode } from 'react';

import { BrandIcon } from '@/components/ui/brand-icon';
import { cn } from '@/lib/utils';
import type { BrandIconName } from '@/lib/constants/brand-icons';
import {
  CREAM,
  CREAM_MUTED,
  DECORATIVE_STARS,
  GOLD_RULE,
  HERO_GRADIENT,
} from '@/lib/constants/section-hero';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Icono del medallón, con el slug acotado a su familia. Las secciones del menú
 * usan `hubs/`; Servicios, que no tiene hub propio, usa `rituals/tarot`.
 */
export type SectionHeroIcon =
  | { family: 'hubs'; name: BrandIconName<'hubs'> }
  | { family: 'rituals'; name: BrandIconName<'rituals'> };

export type SectionHeroSize = 'md' | 'lg';

export interface SectionHeroProps {
  /** Texto del `h1`. Es el único `h1` de la página: ninguna sección debe dejar otro. */
  title: ReactNode;
  /** Bajada bajo el título (copy SEO: conservar el texto exacto de cada sección). */
  lead?: ReactNode;
  /** Medallón centrado sobre el título (familia `hubs/` en las secciones del menú). */
  icon?: SectionHeroIcon;
  /** Píldora dorada sobre el título (p. ej. "1 carta gratis"). */
  badge?: ReactNode;
  /** Fila centrada bajo la bajada (botones como "Mi Historial"). */
  actions?: ReactNode;
  /** `lg`: banda alta de la enciclopedia; `md` (default): el resto de las secciones. */
  size?: SectionHeroSize;
  className?: string;
  'data-testid'?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTENT_PADDING: Record<SectionHeroSize, string> = {
  md: 'px-5 py-7 sm:px-10 sm:py-10',
  lg: 'px-6 py-12 sm:px-10 sm:py-16',
};

/**
 * En `md` la bajada baja a `text-base` en móvil: con el copy largo de Horóscopo
 * la banda superaba el 40 % del viewport a 390 px. `lg` conserva el `text-lg`
 * fijo de la enciclopedia (es la referencia y no cambia).
 */
const LEAD_TEXT: Record<SectionHeroSize, string> = {
  md: 'text-base sm:text-lg',
  lg: 'text-lg',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const HERO_ICON_PROPS = {
  size: 'lg',
  frame: 'medallion',
  decorative: true,
  priority: true,
  'data-testid': 'section-hero-icon',
} as const;

/** Un `<BrandIcon>` por familia: el genérico no acepta la unión discriminada de golpe. */
function HeroIcon({ icon }: { icon: SectionHeroIcon }) {
  return icon.family === 'hubs' ? (
    <BrandIcon family="hubs" name={icon.name} {...HERO_ICON_PROPS} />
  ) : (
    <BrandIcon family="rituals" name={icon.name} {...HERO_ICON_PROPS} />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SectionHero (T-UI-13)
 *
 * Banda de marca que encabeza las nueve secciones del menú: gradiente noche,
 * estrellas `animate-twinkle`, luna CSS, `h1` Cormorant crema centrado, bajada
 * y filete dorado. Extraída tal cual del `<header>` de `EnciclopediaHubContent`
 * para que la navegación entre secciones no cambie de "sitio" en cada clic.
 *
 * Server Component compatible: sin hooks; la animación es CSS y respeta
 * `prefers-reduced-motion` (ver `.animate-twinkle` en `globals.css`).
 *
 * @example
 * ```tsx
 * <SectionHero
 *   title="Horóscopo Chino 2026"
 *   lead="Descubrí las predicciones anuales según tu animal"
 *   icon={{ family: 'hubs', name: 'chinese' }}
 * />
 * ```
 */
export function SectionHero({
  title,
  lead,
  icon,
  badge,
  actions,
  size = 'md',
  className,
  'data-testid': testId = 'section-hero',
}: SectionHeroProps) {
  return (
    <header
      data-testid={testId}
      className={cn('relative overflow-hidden rounded-2xl', className)}
      style={{ background: HERO_GRADIENT }}
    >
      {/* Estrellas decorativas */}
      {DECORATIVE_STARS.map((star, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-amber-200/80"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Luna creciente decorativa (solo CSS) */}
      <div
        className="absolute top-6 right-8 z-0 opacity-30"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          boxShadow: 'inset -18px -6px 0 0 #d69e2e',
          filter: 'blur(1px)',
        }}
        aria-hidden="true"
      />

      {/* Contenido */}
      <div
        data-testid="section-hero-content"
        className={cn('relative z-10 text-center', CONTENT_PADDING[size])}
      >
        {icon && (
          <div className="mb-4 flex justify-center">
            <HeroIcon icon={icon} />
          </div>
        )}

        {badge && (
          <div className="mb-3 flex justify-center">
            <span
              data-testid="section-hero-badge"
              className="inline-flex items-center gap-1 rounded-full border border-amber-300/50 bg-amber-200/10 px-3 py-1 text-xs font-medium tracking-wide text-amber-200"
            >
              {badge}
            </span>
          </div>
        )}

        <h1
          className="font-serif text-4xl leading-tight font-bold sm:text-5xl"
          style={{ color: CREAM }}
        >
          {title}
        </h1>

        {lead && (
          <p
            data-testid="section-hero-lead"
            className={cn('mx-auto mt-4 max-w-xl leading-relaxed', LEAD_TEXT[size])}
            style={{ color: CREAM_MUTED }}
          >
            {lead}
          </p>
        )}

        {actions && (
          <div
            data-testid="section-hero-actions"
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            {actions}
          </div>
        )}
      </div>

      {/* Filete dorado inferior */}
      <div
        className="absolute inset-x-0 bottom-0 h-0.5"
        style={{ background: GOLD_RULE }}
        aria-hidden="true"
      />
    </header>
  );
}
