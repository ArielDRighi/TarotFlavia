'use client';

// 1. React & Next.js
import Image from 'next/image';
import type { ReactNode } from 'react';
// 2. Utils & types
import { cn } from '@/lib/utils';
import type { EditorialImage } from '@/lib/data/encyclopedia-editorial.data';

// ─── Constants ──────────────────────────────────────────────────────────────────

/**
 * Brand-night gradient used as the hero band background and as the image overlay
 * (kept in sync with `DashboardHero`/`ArticleHero` and the `--color-bg-hero` tokens).
 */
const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const IMAGE_OVERLAY =
  'linear-gradient(160deg, rgba(26, 10, 46, 0.78) 0%, rgba(45, 27, 105, 0.62) 45%, rgba(26, 10, 46, 0.88) 100%), radial-gradient(ellipse at bottom right, rgba(214, 158, 46, 0.18) 0%, transparent 55%)';
const CREAM = '#f9f7f2';
const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

// Decorative star positions — purely visual, no logic.
const DECORATIVE_STARS = [
  { top: '20%', left: '9%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '32%', left: '89%', size: 2, delay: '0.6s', duration: '3.2s' },
  { top: '66%', left: '12%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '26%', left: '55%', size: 2, delay: '1.3s', duration: '3.4s' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PremiumHeroProps {
  /** Title rendered as the page <h1> in Cormorant cream. */
  title: string;
  /** Optional gold chip label above the title (e.g. "Plan Premium"). */
  badge?: string;
  /** Optional subtitle below the title (may contain the gold price span). */
  subtitle?: ReactNode;
  /** Optional header image; when absent, the gradient band is shown alone. */
  image?: EditorialImage;
  /** CTA slot rendered below the subtitle (kept as a slot so the hero stays presentational). */
  children?: ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * PremiumHero Component
 *
 * Mystic welcome band for `/premium`, coherent with the Encyclopedia/Dashboard
 * canon (`ArticleHero`/`DashboardHero`): a brand-night gradient, optionally fronted
 * by a themed image with a legibility overlay, decorative twinkling stars, a CSS
 * crescent moon and a bottom gold filet.
 *
 * Presentational only: the CTA (which needs auth/router hooks) is passed as
 * `children` so this component owns no business logic. The image is optional —
 * when omitted the gradient band renders on its own, so the component degrades
 * gracefully if the asset ever fails to load.
 *
 * @example
 * ```tsx
 * <PremiumHero
 *   badge="Plan Premium"
 *   title="Desbloquea todo el potencial del Tarot"
 *   subtitle={<>Interpretaciones personalizadas por <span className="text-secondary">$7.000/mes</span></>}
 *   image={{ src: '/images/premium/premium-hero.webp', alt: '…' }}
 * >
 *   <PremiumCtaButton testId="cta-hero" />
 * </PremiumHero>
 * ```
 */
export function PremiumHero({
  title,
  badge,
  subtitle,
  image,
  children,
  className,
}: PremiumHeroProps) {
  return (
    <header
      data-testid="premium-hero"
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
            sizes="(max-width: 1280px) 100vw, 1280px"
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
      <div className="relative z-10 flex flex-col items-center px-6 py-14 text-center sm:px-10 sm:py-20">
        {/* Chip dorado */}
        {badge && (
          <span
            data-testid="premium-hero-badge"
            className="bg-secondary text-bg-hero mb-5 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-[0.08em] uppercase"
          >
            {badge}
          </span>
        )}

        {/* Título */}
        <h1
          className="max-w-3xl font-serif text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl"
          style={{ color: CREAM }}
        >
          {title}
        </h1>

        {/* Subtítulo (puede incluir el precio en dorado) */}
        {subtitle && (
          <p
            data-testid="premium-hero-subtitle"
            className="mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl"
            style={{ color: CREAM_MUTED }}
          >
            {subtitle}
          </p>
        )}

        {/* CTA */}
        {children && <div className="mt-8 w-full max-w-xs">{children}</div>}
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
