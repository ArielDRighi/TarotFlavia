// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';
// 2. Icons
import { BookOpen, Layers, Sparkles, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
// 5. Components
import { Button } from '@/components/ui/button';
// 6. Utils & types
import { LOGO } from '@/lib/constants/branding';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

/**
 * Hero de publicación de la portada (T-SEO-014 + T-SEO-022).
 *
 * Reemplaza al `HeroSection` de landing ("Descubre tu destino" + "Crear cuenta
 * gratis" + "Sin tarjeta de crédito"), que era lo primero que veía el revisor
 * de AdSense y lo que clasificaba al sitio como app comercial. Acá va el `h1`
 * único de la home —qué es el sitio— y una bajada de dos líneas. El CTA de
 * registro vive en el header, no acá.
 *
 * T-SEO-022 recupera la **puesta en escena** de aquel hero con el copy de
 * T-SEO-014: logo de Auguria, `hero-bg.webp` a opacidad plena bajo el overlay
 * original (violeta + radial lila arriba + radial dorado abajo a la derecha),
 * estrellas `animate-twinkle`, luna en CSS, píldora dorada para el eyebrow y
 * el `h1` a dos tonos (crema + dorado con shimmer). Todo es CSS puro, sin
 * `useEffect`: sigue siendo un Server Component.
 *
 * A media altura (`min-h-[70vh]` en desktop), no pantalla completa: el
 * horóscopo de hoy tiene que asomar sin scroll en 1080p. Un solo CTA, y es
 * editorial: baja al horóscopo, no vende nada.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Overlay del hero anterior: legibilidad + lila arriba + dorado abajo a la derecha. */
const HERO_OVERLAY =
  'linear-gradient(160deg, rgba(26, 10, 46, 0.55) 0%, rgba(45, 27, 105, 0.45) 45%, rgba(26, 10, 46, 0.55) 100%), radial-gradient(ellipse at center top, rgba(128, 90, 213, 0.3) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(214, 158, 46, 0.15) 0%, transparent 50%)';

/** Degradé dorado del botón principal del hero anterior. */
const GOLD_BUTTON = 'linear-gradient(135deg, #d69e2e 0%, #f6d860 50%, #b7791f 100%)';

// Posiciones de las estrellas: puramente visuales, sin lógica.
const DECORATIVE_STARS = [
  { top: '12%', left: '8%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '20%', left: '88%', size: 4, delay: '0.5s', duration: '3.2s' },
  { top: '35%', left: '5%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '65%', left: '92%', size: 3, delay: '0.3s', duration: '3.5s' },
  { top: '78%', left: '15%', size: 4, delay: '0.8s', duration: '2.9s' },
  { top: '45%', left: '95%', size: 2, delay: '1.5s', duration: '3.1s' },
  { top: '88%', left: '78%', size: 3, delay: '0.2s', duration: '2.7s' },
  { top: '10%', left: '55%', size: 2, delay: '1.2s', duration: '3.3s' },
];

/** Un icono por chip, en el orden de `HOME_EDITORIAL.hero.highlights`. */
const HIGHLIGHT_ICONS: [LucideIcon, LucideIcon, LucideIcon] = [Sun, Layers, BookOpen];

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorialHero() {
  const { eyebrow, title, titleAccent, lead, ctaLabel, highlights } = HOME_EDITORIAL.hero;
  const { anchorId } = HOME_EDITORIAL.horoscope;
  // El remate dorado es el final exacto del título (lo garantiza el test de datos).
  const titleLead = title.slice(0, title.length - titleAccent.length);

  return (
    <section
      data-testid="home-hero"
      className="relative flex flex-col overflow-hidden px-4 pt-6 pb-16 md:min-h-[70vh] md:pt-8 md:pb-20"
      style={{ background: 'var(--color-bg-hero)' }}
    >
      {/* Fondo a opacidad plena, como en la landing anterior */}
      <Image
        src="/images/hero-bg.webp"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
        aria-hidden="true"
      />

      {/* Overlay original: legibilidad + lila arriba + dorado abajo a la derecha */}
      <div
        data-testid="home-hero-overlay"
        className="absolute inset-0 z-0"
        style={{ background: HERO_OVERLAY }}
        aria-hidden="true"
      />

      {/* Estrellas decorativas */}
      {DECORATIVE_STARS.map((star, index) => (
        <span
          key={index}
          data-testid="home-hero-star"
          className="animate-twinkle absolute z-0 rounded-full bg-amber-200"
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

      {/* Luna creciente (solo CSS) */}
      <div
        data-testid="home-hero-moon"
        className="absolute top-[10%] right-[8%] z-0 h-20 w-20 opacity-30 md:h-[120px] md:w-[120px]"
        style={{
          borderRadius: '50%',
          boxShadow: 'inset -30px -10px 0 0 #d69e2e',
          filter: 'blur(1px)',
        }}
        aria-hidden="true"
      />

      {/* Logo en el flujo (no absoluto): en móvil nunca pisa el título */}
      <div className="relative z-10 container mx-auto max-w-6xl">
        <Image
          src={LOGO.path}
          alt="Auguria"
          width={LOGO.width}
          height={LOGO.height}
          className="h-16 w-auto drop-shadow-lg md:h-24"
          sizes="(max-width: 768px) 109px, 163px"
          priority
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center pt-8 text-center md:pt-4">
        <p
          data-testid="home-hero-eyebrow"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-amber-300 uppercase sm:px-4 sm:text-xs sm:tracking-[0.15em]"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {eyebrow}
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </p>

        <h1 className="text-text-on-dark font-serif leading-tight">
          <span className="block text-3xl font-light md:text-5xl lg:text-6xl">{titleLead}</span>
          <span className="animate-shimmer-gold mt-1 block text-3xl font-semibold md:text-5xl lg:text-6xl">
            {titleAccent}
          </span>
        </h1>

        <p className="text-text-on-dark/80 mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed md:text-lg">
          {lead}
        </p>

        <Button
          asChild
          size="lg"
          className="mt-8 min-w-[220px] border-0 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-amber-500/25"
          style={{ background: GOLD_BUTTON, color: '#1a0a2e' }}
        >
          <Link href={`#${anchorId}`}>{ctaLabel}</Link>
        </Button>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
          {highlights.map((label, index) => {
            const Icon = HIGHLIGHT_ICONS[index];
            return (
              <li
                key={label}
                data-testid="home-hero-chip"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                style={{ color: 'rgba(249, 247, 242, 0.75)' }}
              >
                <Icon className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                {label}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
