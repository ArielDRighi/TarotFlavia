'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RitualCategory, CATEGORY_INFO } from '@/types/ritual.types';

/**
 * RitualCategorySelector Component Props
 */
export interface RitualCategorySelectorProps {
  /** Currently selected category */
  selected?: RitualCategory;
  /** Callback when a category is selected */
  onSelect: (category: RitualCategory | undefined) => void;
  /** Optional category counts to display */
  categories?: { category: RitualCategory; count: number }[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * RitualCategorySelector Component
 *
 * Horizontal scrollable selector for ritual categories.
 *
 * Features:
 * - All categories button to clear filter
 * - Category buttons with icons and names
 * - Optional category counts display
 * - Horizontal scrolling on mobile
 * - Active state highlighting
 *
 * @example
 * ```tsx
 * <RitualCategorySelector
 *   selected={selectedCategory}
 *   onSelect={setSelectedCategory}
 *   categories={[
 *     { category: RitualCategory.LUNAR, count: 5 },
 *     { category: RitualCategory.TAROT, count: 3 }
 *   ]}
 * />
 * ```
 */
export function RitualCategorySelector({
  selected,
  onSelect,
  categories,
  className,
}: RitualCategorySelectorProps) {
  const allCategories = Object.values(RitualCategory);

  const getCount = (cat: RitualCategory) => {
    const found = categories?.find((c) => c.category === cat);
    return found?.count || 0;
  };

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2', className)}>
      <Button
        variant={selected === undefined ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(undefined)}
      >
        Todos
      </Button>
      {allCategories.map((category) => {
        const info = CATEGORY_INFO[category];
        const count = getCount(category);

        return (
          <Button
            key={category}
            variant={selected === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(category)}
            className="gap-1 whitespace-nowrap"
          >
            <span>{info.icon}</span>
            <span>{info.name}</span>
            {count > 0 && <span className="text-xs opacity-60">({count})</span>}
          </Button>
        );
      })}
    </div>
  );
}
