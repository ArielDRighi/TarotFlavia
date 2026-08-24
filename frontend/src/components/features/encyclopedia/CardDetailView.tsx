'use client';

import { CARD_TEXT_SECTIONS } from '@/lib/constants/card-content-sections.data';
import type { CardDetail } from '@/types/encyclopedia.types';

import { CardCombinations } from './CardCombinations';
import { CardContentSection } from './CardContentSection';
import { CardDetailHero } from './CardDetailHero';
import { CardKeywords } from './CardKeywords';
import { CardMeaning } from './CardMeaning';
import { CardMetadata } from './CardMetadata';
import { CardNavigation } from './CardNavigation';
import { RelatedCards } from './RelatedCards';
import { AuthorByline } from '@/components/common/AuthorByline';

export interface CardDetailViewProps {
  card: CardDetail;
  /**
   * Nombres en español de las cartas que aparecen en `card.combinations`,
   * resueltos en el servidor por la ruta (T-SEO-010). Sin esto el texto de los
   * cross-links no viajaría en el HTML que ve el crawler.
   */
  combinationCardNames?: Record<string, string>;
}

export function CardDetailView({ card, combinationCardNames }: CardDetailViewProps) {
  const descriptionParagraphs = card.description
    ? card.description.split(/\r?\n\r?\n/).filter((p) => p.trim().length > 0)
    : [];

  return (
    <div data-testid="card-detail-view" className="mx-auto max-w-3xl space-y-8">
      {/* Hero con imagen de la carta, breadcrumb y chip */}
      <CardDetailHero card={card} />

      {/* Metadata (elemento, planeta, signo, etc.) */}
      <CardMetadata card={card} />

      {/* Descripción narrativa */}
      {descriptionParagraphs.length > 0 && (
        <div data-testid="card-detail-description" className="space-y-4">
          {descriptionParagraphs.map((paragraph, i) => (
            <p key={i} className="leading-relaxed text-gray-700">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      )}

      {/* Significados */}
      <CardMeaning meaningUpright={card.meaningUpright} meaningReversed={card.meaningReversed} />

      {/* Secciones temáticas (T-SEO-010). Cada una degrada sola si su campo no
          vino en la respuesta: la ficha se puede cargar de a tandas sin dejar
          encabezados vacíos. */}
      {CARD_TEXT_SECTIONS.map((section) => (
        <CardContentSection
          key={section.key}
          heading={section.heading}
          text={card[section.key]}
          testId={section.testId}
        />
      ))}

      {/* Palabras clave */}
      <CardKeywords keywords={card.keywords} />

      {/* Combinaciones: cross-links internos hacia otras fichas */}
      <CardCombinations combinations={card.combinations} cardNames={combinationCardNames} />

      {/* Firma de autoría (T-SEO-011). Las 78 fichas promedian 676 palabras de
          texto de autor desde T-SEO-009, así que son contenido editorial y no
          datos de referencia: van firmadas, igual que las guías. */}
      <AuthorByline />

      {/* Cartas relacionadas */}
      <RelatedCards slug={card.slug} />

      {/* Navegación inferior */}
      <CardNavigation slug={card.slug} />
    </div>
  );
}
