'use client';

import type { CardDetail } from '@/types/encyclopedia.types';

import { CardDetailHero } from './CardDetailHero';
import { CardKeywords } from './CardKeywords';
import { CardMeaning } from './CardMeaning';
import { CardMetadata } from './CardMetadata';
import { CardNavigation } from './CardNavigation';
import { RelatedCards } from './RelatedCards';
import { AuthorByline } from '@/components/common/AuthorByline';

export interface CardDetailViewProps {
  card: CardDetail;
}

export function CardDetailView({ card }: CardDetailViewProps) {
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

      {/* Palabras clave */}
      <CardKeywords keywords={card.keywords} />

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
