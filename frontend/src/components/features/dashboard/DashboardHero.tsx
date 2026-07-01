'use client';

// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';
// 2. Custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
// 3. Components (ui → features)
import { PlanBadge } from '@/components/ui/plan-badge';
// 4. Utils & types
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { EditorialImage } from '@/lib/data/encyclopedia-editorial.data';

// ─── Constants ──────────────────────────────────────────────────────────────────

/**
 * Brand-night gradient used as the hero band background and as the image overlay
 * (kept in sync with `ArticleHero` and the `--color-bg-hero` tokens).
 */
const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const IMAGE_OVERLAY =
  'linear-gradient(160deg, rgba(26, 10, 46, 0.78) 0%, rgba(45, 27, 105, 0.62) 45%, rgba(26, 10, 46, 0.88) 100%), radial-gradient(ellipse at bottom right, rgba(214, 158, 46, 0.18) 0%, transparent 55%)';
const CREAM = '#f9f7f2';
const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

const DEFAULT_NAME = 'Usuario';

// Decorative star positions — purely visual, no logic.
const DECORATIVE_STARS = [
  { top: '22%', left: '8%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '34%', left: '88%', size: 2, delay: '0.6s', duration: '3.2s' },
  { top: '68%', left: '14%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '30%', left: '52%', size: 2, delay: '1.3s', duration: '3.4s' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardHeroProps {
  /** Optional contextual subtitle below the greeting (e.g. a daily message). */
  subtitle?: string;
  /** Optional header image; when absent, the gradient band is shown alone. */
  image?: EditorialImage;
  /** Additional CSS classes. */
  className?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * DashboardHero Component
 *
 * Mystic welcome band for the authenticated home, coherent with the Encyclopedia
 * canon (`ArticleHero`): a brand-night gradient, optionally fronted by a themed
 * image with a legibility overlay, decorative twinkling stars, a CSS crescent
 * moon and a bottom gold filet.
 *
 * Renders the personalized greeting (`¡Hola, {nombre}!`) in Cormorant cream, the
 * user `PlanBadge` and an accessible link to the profile. The image is optional:
 * when omitted, the gradient band renders on its own so the component degrades
 * gracefully while the dashboard assets (T-DASH-004) are produced.
 *
 * @example
 * ```tsx
 * <DashboardHero subtitle="Las estrellas te acompañan hoy" />
 * ```
 */
export function DashboardHero({ subtitle, image, className }: DashboardHeroProps) {
  const { user } = useAuth();
  const { plan } = useUserPlanFeatures();

  const displayName = user?.name || DEFAULT_NAME;

  return (
    <header
      data-testid="dashboard-hero"
      aria-label="Panel de bienvenida"
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
        className="absolute top-5 right-7 z-0 opacity-30"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          boxShadow: 'inset -16px -5px 0 0 #d69e2e',
          filter: 'blur(1px)',
        }}
        aria-hidden="true"
      />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className="font-serif text-3xl leading-tight font-bold sm:text-4xl"
              style={{ color: CREAM }}
            >
              ¡Hola, {displayName}!
            </h1>
            <PlanBadge plan={plan} />
          </div>

          {subtitle && (
            <p
              data-testid="dashboard-hero-subtitle"
              className="mt-2 max-w-2xl text-base leading-relaxed"
              style={{ color: CREAM_MUTED }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={ROUTES.PERFIL}
          className="focus-visible:ring-secondary focus-visible:ring-offset-bg-hero shrink-0 rounded-sm text-sm transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          style={{ color: CREAM_MUTED }}
        >
          Ver perfil
        </Link>
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
