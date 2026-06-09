'use client';

// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';

// 6. Utils & types
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { ArcanaType, SUIT_INFO } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';

// ─── Constants ───────────────────────────────────────────────────────────────

const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const CARD_HALO =
  '0 0 40px rgba(214, 158, 46, 0.45), 0 0 80px rgba(214, 158, 46, 0.18), 0 8px 32px rgba(0,0,0,0.6)';
const CREAM = '#f9f7f2';
const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

const DECORATIVE_STARS = [
  { top: '15%', left: '8%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '28%', left: '88%', size: 2, delay: '0.6s', duration: '3.2s' },
  { top: '65%', left: '5%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '20%', left: '55%', size: 2, delay: '1.3s', duration: '3.4s' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildChipLabel(card: CardDetail): string {
  if (card.arcanaType === ArcanaType.MAJOR) {
    return 'Arcano Mayor';
  }
  const suitName = card.suit ? SUIT_INFO[card.suit].nameEs : '';
  return suitName ? `Arcano Menor · ${suitName}` : 'Arcano Menor';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardDetailHeroProps {
  card: CardDetail;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardDetailHero({ card, className }: CardDetailHeroProps) {
  const chipLabel = buildChipLabel(card);

  return (
    <header
      data-testid="card-detail-hero"
      className={cn('relative overflow-hidden rounded-2xl', className)}
      style={{ background: HERO_GRADIENT }}
    >
      {/* Estrellas decorativas */}
      {DECORATIVE_STARS.map((star, i) => (
        <span
          key={star.delay}
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

      {/* Luna creciente decorativa */}
      <div
        className="absolute top-6 right-8 z-0 opacity-25"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          boxShadow: 'inset -16px -5px 0 0 #d69e2e',
          filter: 'blur(1px)',
        }}
        aria-hidden="true"
      />

      {/* Layout: texto izquierda / carta derecha */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-10 sm:flex-row sm:items-start sm:px-10 sm:py-14">
        {/* ── Texto ───────────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col">
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
            <Link
              data-testid="breadcrumb-tarot"
              href={ROUTES.ENCICLOPEDIA_TAROT}
              className="focus-visible:ring-secondary focus-visible:ring-offset-bg-hero rounded-sm transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={{ color: CREAM_MUTED }}
            >
              Tarot
            </Link>
            <span style={{ color: CREAM_MUTED }} aria-hidden="true">
              /
            </span>
            <span data-testid="breadcrumb-current" style={{ color: CREAM }} aria-current="page">
              {card.nameEs}
            </span>
          </nav>

          {/* Chip de arcano/palo */}
          <span
            data-testid="card-arcana-chip"
            className="bg-secondary text-bg-hero mb-4 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold tracking-[0.08em] uppercase"
          >
            {chipLabel}
          </span>

          {/* Nombre de la carta */}
          <h1
            className="max-w-xs font-serif text-4xl leading-tight font-bold sm:text-5xl"
            style={{ color: CREAM }}
          >
            {card.nameEs}
          </h1>

          {/* Nombre en inglés como subtítulo */}
          <p className="mt-2 font-serif text-lg italic" style={{ color: CREAM_MUTED }}>
            {card.nameEn}
          </p>

          {/* Numeral (arcanos mayores) */}
          {card.romanNumeral && (
            <p className="mt-4 text-sm tracking-widest uppercase" style={{ color: CREAM_MUTED }}>
              {card.romanNumeral}
            </p>
          )}
        </div>

        {/* ── Imagen de la carta ──────────────────────────────────────────── */}
        <div className="flex-shrink-0">
          <div
            className="relative overflow-hidden rounded-lg border"
            style={{
              width: '160px',
              height: '280px',
              borderColor: 'rgba(214, 158, 46, 0.4)',
              boxShadow: CARD_HALO,
            }}
          >
            <Image
              src={card.imageUrl}
              alt={card.nameEs}
              fill
              className="object-cover"
              sizes="160px"
              priority
            />
          </div>
        </div>
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
