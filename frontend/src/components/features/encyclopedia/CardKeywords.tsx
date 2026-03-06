'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { CardKeywords as Keywords } from '@/types/encyclopedia.types';

export interface CardKeywordsProps {
  keywords: Keywords;
}

export function CardKeywords({ keywords }: CardKeywordsProps) {
  return (
    <Card data-testid="card-keywords" className="p-6">
      <h3 className="mb-4 font-serif text-lg">Palabras Clave</h3>

      <div className="space-y-4">
        <div>
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span>Derecha</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.upright.map((keyword, i) => (
              <Badge key={i} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <ArrowDown className="h-4 w-4 text-red-500" />
            <span>Invertida</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.reversed.map((keyword, i) => (
              <Badge key={i} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
