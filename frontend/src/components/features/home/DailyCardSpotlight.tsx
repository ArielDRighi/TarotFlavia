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
 */
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
          <article className="grid items-start gap-8 md:grid-cols-[minmax(0,260px)_1fr] md:gap-12">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[260px] overflow-hidden rounded-xl shadow-lg">
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
                  className="border-secondary/60 bg-bg-main rounded-lg border-l-4 p-4"
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
          </article>
        ) : (
          <p
            data-testid="home-daily-card-empty"
            className="text-text-muted border-border rounded-xl border border-dashed p-6 font-sans leading-relaxed"
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
