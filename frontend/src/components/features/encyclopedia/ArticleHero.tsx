// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';

// 2. Icons
import { Clock, Layers } from 'lucide-react';

// 6. Utils & types
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { EditorialImage } from '@/lib/data/encyclopedia-editorial.data';

// ─── Constants ──────────────────────────────────────────────────────────────────

/**
 * Brand-night gradient used as the hero band background and as the image overlay
 * (kept in sync with `HeroSection` and the `--color-bg-hero` tokens).
 */
const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const IMAGE_OVERLAY =
  'linear-gradient(160deg, rgba(26, 10, 46, 0.78) 0%, rgba(45, 27, 105, 0.62) 45%, rgba(26, 10, 46, 0.88) 100%), radial-gradient(ellipse at bottom right, rgba(214, 158, 46, 0.18) 0%, transparent 55%)';
const CREAM = '#f9f7f2';
const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

// Decorative star positions — purely visual, no logic.
const DECORATIVE_STARS = [
  { top: '18%', left: '10%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '30%', left: '90%', size: 2, delay: '0.6s', duration: '3.2s' },
  { top: '70%', left: '6%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '24%', left: '60%', size: 2, delay: '1.3s', duration: '3.4s' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleHeroProps {
  /** Category label (e.g. "Guía del Tarot"). */
  category: string;
  /** Article title (rendered as the page <h1>). */
  title: string;
  /** Lead / subtitle (article snippet). */
  lead?: string;
  /** Optional header image; when absent, the gradient band is shown alone. */
  image?: EditorialImage;
  /** Estimated reading time in minutes. */
  readingTimeMinutes?: number;
  /** Number of sections in the article. */
  sectionCount?: number;
  /** Additional CSS classes. */
  className?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ArticleHero Component
 *
 * Immersive header band for encyclopedia guide articles: a brand-night gradient
 * (optionally fronted by a themed header image with a legibility overlay),
 * breadcrumb, gold category chip, Cormorant title, lead and reading meta
 * (estimated time · number of sections).
 *
 * Image is optional: when omitted, the gradient band renders on its own, so the
 * component degrades gracefully while assets are produced.
 *
 * @example
 * ```tsx
 * <ArticleHero
 *   category="Guía del Tarot"
 *   title="Guía del Tarot: El Espejo del Alma"
 *   lead={article.snippet}
 *   image={{ src: '/images/enciclopedia/guia-tarot-hero.webp', alt: '…' }}
 *   readingTimeMinutes={8}
 *   sectionCount={5}
 * />
 * ```
 */
export function ArticleHero({
  category,
  title,
  lead,
  image,
  readingTimeMinutes,
  sectionCount,
  className,
}: ArticleHeroProps) {
  const hasMeta = readingTimeMinutes !== undefined || sectionCount !== undefined;

  return (
    <header
      data-testid="article-hero"
      className={cn('relative overflow-hidden rounded-2xl', className)}
      style={{ background: HERO_GRADIENT }}
    >
      {/* Imagen de cabecera (opcional) con overlay para legibilidad */}
      {image && (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: IMAGE_OVERLAY }}
            aria-hidden="true"
          />
        </>
      )}

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
      <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Navegación" className="mb-6 flex items-center gap-2 text-sm">
          <Link
            data-testid="breadcrumb-enciclopedia"
            href={ROUTES.ENCICLOPEDIA}
            className="focus-visible:ring-secondary focus-visible:ring-offset-bg-hero rounded-sm transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            style={{ color: CREAM_MUTED }}
          >
            Enciclopedia
          </Link>
          <span style={{ color: CREAM_MUTED }} aria-hidden="true">
            /
          </span>
          <span data-testid="breadcrumb-current" style={{ color: CREAM }} aria-current="page">
            {title}
          </span>
        </nav>

        {/* Chip de categoría */}
        <span
          data-testid="article-category-badge"
          className="bg-secondary text-bg-hero mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-[0.08em] uppercase"
        >
          {category}
        </span>

        {/* Título */}
        <h1
          className="max-w-3xl font-serif text-4xl leading-tight font-bold sm:text-5xl"
          style={{ color: CREAM }}
        >
          {title}
        </h1>

        {/* Lead */}
        {lead && (
          <p
            data-testid="article-hero-lead"
            className="mt-4 max-w-2xl text-lg leading-relaxed"
            style={{ color: CREAM_MUTED }}
          >
            {lead}
          </p>
        )}

        {/* Meta: tiempo de lectura · nº de secciones */}
        {hasMeta && (
          <div
            data-testid="article-hero-meta"
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
            style={{ color: CREAM_MUTED }}
          >
            {readingTimeMinutes !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {readingTimeMinutes} min de lectura
              </span>
            )}
            {sectionCount !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4" aria-hidden="true" />
                {sectionCount} {sectionCount === 1 ? 'sección' : 'secciones'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filete dorado inferior */}
      <div
        className="absolute inset-x-0 bottom-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, transparent, #d69e2e, transparent)' }}
        aria-hidden="true"
      />
    </header>
  );
}
