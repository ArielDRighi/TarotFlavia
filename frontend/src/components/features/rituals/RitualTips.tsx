'use client';

import { Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * RitualTips Component Props
 */
export interface RitualTipsProps {
  /** Array of helpful tips for performing the ritual */
  tips: string[];
}

/**
 * RitualTips Component
 *
 * Displays a list of helpful tips and recommendations
 * for performing a ritual successfully.
 *
 * Features:
 * - Lightbulb icon header for visual clarity
 * - Bulleted list of tips
 * - Responsive card layout
 * - Muted text styling for better hierarchy
 *
 * @example
 * ```tsx
 * <RitualTips tips={ritual.tips} />
 * ```
 */
export function RitualTips({ tips }: RitualTipsProps) {
  return (
    <Card className="p-6" data-testid="ritual-tips">
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        Consejos
      </h2>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={`${tip}-${index}`} className="text-muted-foreground text-sm">
            • {tip}
          </li>
        ))}
      </ul>
    </Card>
  );
}
