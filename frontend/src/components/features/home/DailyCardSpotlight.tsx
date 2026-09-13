// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';
// 5. Components
import { HomeSectionHeader, HomeSectionLink } from './HomeSectionHeader';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import { ROUTES } from '@/lib/constants/routes';
import { formatDateFullWithYear } from '@/lib/utils/date';
import { ArcanaType, SUIT_INFO } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';
import type { CanonicalDailyCard } from '@/types/home.types';

/**
 * La carta del día de la portada (T-SEO-014).
 *
 * Imagen + nombre + interpretación (~150 palabras: significado al derecho y
 * consejo) + enlace a la ficha completa. Es la carta canónica del sitio
 * (`getCanonicalDailyCard`), no la personal que sortea `/carta-del-dia`: el
 * texto lo aclara y el enlace "Sacar mi propia carta" lleva a la herramienta.
 *
 * Sin `CardImage` de la enciclopedia a propósito: ese componente abre un modal
 * (client) y acá la imagen es ilustrativa, con la ficha a un clic.
 *
 * T-SEO-022: la lámina y la interpretación van sobre un panel con el incienso
 * desvanecido detrás (`incense-bg.webp`, recuperado del historial: era la
 * única ilustración que T-SEO-014 borró del repo), como estaba en "Prueba sin
 * compromiso" de la landing anterior. El panel reserva su alto con el grid,
 * así la imagen diferida no mueve nada al cargar.
 */

/** Degradé lila → crema del panel de la landing anterior. */
const PANEL_GRADIENT = 'linear-gradient(135deg, #f2eef9 0%, #fdf6e7 100%)';
export interface DailyCardSpotlightProps {
  dailyCard: CanonicalDailyCard | undefined;
}

/** "Arcano mayor · 0" o "Arcano menor · Copas", según la carta. */
function arcanaLabel(card: CardDetail): string {
  if (card.arcanaType === ArcanaType.MAJOR) {
    return `Arcano mayor${card.romanNumeral ? ` · ${card.romanNumeral}` : ''}`;
  }
  return `Arcano menor${card.suit ? ` · ${SUIT_INFO[card.suit].nameEs}` : ''}`;
}

export function DailyCardSpotlight({ dailyCard }: DailyCardSpotlightProps) {
  const copy = HOME_EDITORIAL.dailyCard;

  return (
    <section data-testid="home-daily-card" className="bg-card px-4 py-14 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <HomeSectionHeader copy={copy} />

        {dailyCard ? (
          <article
            className="relative overflow-hidden rounded-2xl border border-white/60 shadow-lg"
            style={{ background: PANEL_GRADIENT }}
          >
            {/* Incienso desvanecido detrás, decorativo */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <Image
                data-testid="home-daily-card-incense"
                src="/images/incense-bg.webp"
                alt=""
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover object-bottom"
                style={{ mixBlendMode: 'multiply', opacity: 0.3 }}
                aria-hidden="true"
              />
            </div>

            <div className="relative grid items-start gap-8 p-6 md:grid-cols-[minmax(0,260px)_1fr] md:gap-12 md:p-10">
              <div className="relative mx-auto aspect-[2/3] w-full max-w-[260px] overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5">
                <Image
                  src={dailyCard.card.imageUrl}
                  alt={`Carta ${dailyCard.card.nameEs} del tarot Rider-Waite`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 60vw, 260px"
                />
              </div>

              <div className="space-y-4">
                <p className="text-text-muted font-sans text-sm">
                  <time data-testid="home-daily-card-date" dateTime={dailyCard.canonicalDate}>
                    {formatDateFullWithYear(dailyCard.canonicalDate)}
                  </time>
                  <span className="mx-2" aria-hidden="true">
                    ·
                  </span>
                  <span data-testid="home-daily-card-arcana">{arcanaLabel(dailyCard.card)}</span>
                </p>
                <h3 className="text-text-primary font-serif text-3xl font-semibold">
                  {dailyCard.card.nameEs}
                </h3>
                <p className="text-text-primary font-sans leading-relaxed">
                  {dailyCard.card.meaningUpright}
                </p>
                {dailyCard.card.advice && (
                  <div
                    data-testid="home-daily-card-advice"
                    className="border-secondary/60 rounded-lg border-l-4 bg-white/60 p-4"
                  >
                    <p className="text-text-muted mb-1 font-sans text-xs font-semibold tracking-wide uppercase">
                      Consejo del día
                    </p>
                    <p className="text-text-primary font-sans leading-relaxed">
                      {dailyCard.card.advice}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                  <HomeSectionLink
                    href={ROUTES.ENCICLOPEDIA_TAROT_CARD(dailyCard.card.slug)}
                    label={copy.encyclopediaLinkLabel}
                  />
                </div>
              </div>
            </div>
          </article>
        ) : (
          <p
            data-testid="home-daily-card-empty"
            className="text-text-muted bg-bg-main border-border rounded-xl border p-6 font-sans leading-relaxed"
          >
            {copy.emptyState}{' '}
            <Link
              href={ROUTES.ENCICLOPEDIA_TAROT}
              className="text-primary underline-offset-4 hover:underline"
            >
              Ver las 78 cartas
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
