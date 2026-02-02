'use client';

import { Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface RitualTipsProps {
  tips: string[];
}

export function RitualTips({ tips }: RitualTipsProps) {
  return (
    <Card className="p-6" data-testid="ritual-tips">
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        Consejos
      </h2>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="text-muted-foreground text-sm">
            • {tip}
          </li>
        ))}
      </ul>
    </Card>
  );
}
