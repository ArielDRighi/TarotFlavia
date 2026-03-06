'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArcanaType } from '@/types/encyclopedia.types';

/**
 * CategoryTabs Component Props
 */
export interface CategoryTabsProps {
  /** Currently selected arcana type */
  selected?: ArcanaType;
  /** Callback when a category tab is selected */
  onChange: (arcanaType: ArcanaType | undefined) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CategoryTabs Component
 *
 * Tab selector for filtering tarot cards by arcana type.
 *
 * Tabs:
 * - Todas: Show all cards (no filter)
 * - Arcanos Mayores: Major arcana only
 * - Arcanos Menores: Minor arcana only
 *
 * @example
 * ```tsx
 * <CategoryTabs
 *   selected={selectedCategory}
 *   onChange={setSelectedCategory}
 * />
 * ```
 */
export function CategoryTabs({ selected, onChange, className }: CategoryTabsProps) {
  return (
    <div data-testid="category-tabs" className={cn('flex gap-2', className)}>
      <Button
        variant={selected === undefined ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(undefined)}
      >
        Todas
      </Button>
      <Button
        variant={selected === ArcanaType.MAJOR ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(ArcanaType.MAJOR)}
      >
        Arcanos Mayores
      </Button>
      <Button
        variant={selected === ArcanaType.MINOR ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(ArcanaType.MINOR)}
      >
        Arcanos Menores
      </Button>
    </div>
  );
}
