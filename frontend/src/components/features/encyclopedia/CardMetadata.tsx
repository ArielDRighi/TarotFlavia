'use client';

import { Card } from '@/components/ui/card';
import { ArcanaType, CourtRank, ELEMENT_INFO, SUIT_INFO } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';

export interface CardMetadataProps {
  card: CardDetail;
}

const COURT_NAMES: Record<CourtRank, string> = {
  [CourtRank.PAGE]: 'Paje',
  [CourtRank.KNIGHT]: 'Caballero',
  [CourtRank.QUEEN]: 'Reina',
  [CourtRank.KING]: 'Rey',
};

export function CardMetadata({ card }: CardMetadataProps) {
  const suitInfo = card.suit ? SUIT_INFO[card.suit] : null;
  const elementInfo = card.element ? ELEMENT_INFO[card.element] : null;

  return (
    <Card data-testid="card-metadata" className="p-6">
      <h3 className="mb-4 font-serif text-lg">Información</h3>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Arcano</dt>
          <dd className="font-medium">
            {card.arcanaType === ArcanaType.MAJOR ? 'Mayor' : 'Menor'}
          </dd>
        </div>

        {card.romanNumeral && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Número</dt>
            <dd className="font-medium">{card.romanNumeral}</dd>
          </div>
        )}

        {suitInfo && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Palo</dt>
            <dd className="font-medium">
              {suitInfo.symbol} {suitInfo.nameEs}
            </dd>
          </div>
        )}

        {card.courtRank && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Rango</dt>
            <dd className="font-medium">{COURT_NAMES[card.courtRank]}</dd>
          </div>
        )}

        {elementInfo && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Elemento</dt>
            <dd className="font-medium" style={{ color: elementInfo.color }}>
              {elementInfo.nameEs}
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
