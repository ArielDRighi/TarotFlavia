'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import type { CardDetail } from '@/types/encyclopedia.types';

import { CardImage } from './CardImage';
import { CardKeywords } from './CardKeywords';
import { CardMeaning } from './CardMeaning';
import { CardMetadata } from './CardMetadata';
import { CardNavigation } from './CardNavigation';
import { RelatedCards } from './RelatedCards';

export interface CardDetailViewProps {
  card: CardDetail;
}

export function CardDetailView({ card }: CardDetailViewProps) {
  const descriptionParagraphs = card.description
    ? card.description.split(/\r?\n\r?\n/).filter((p) => p.trim().length > 0)
    : [];

  return (
    <div data-testid="card-detail-view" className="mx-auto max-w-3xl space-y-8">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/enciclopedia">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Enciclopedia
          </Link>
        </Button>
      </div>

      {/* Imagen + identificación + metadata */}
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Imagen */}
        <div className="mx-auto flex-shrink-0 sm:mx-0">
          <CardImage src={card.imageUrl} alt={card.nameEs} />
        </div>

        {/* Nombre + metadata */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="mb-2 font-serif text-4xl">{card.nameEs}</h1>
            <p className="text-muted-foreground text-xl">{card.nameEn}</p>
          </div>
          <CardMetadata card={card} />
        </div>
      </div>

      {/* Descripción narrativa — párrafos separados */}
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

      {/* Cartas relacionadas */}
      <RelatedCards slug={card.slug} />

      {/* Navegación inferior */}
      <CardNavigation slug={card.slug} />
    </div>
  );
}
