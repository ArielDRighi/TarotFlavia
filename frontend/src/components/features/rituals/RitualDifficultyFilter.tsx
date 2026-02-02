'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RitualDifficulty, DIFFICULTY_INFO } from '@/types/ritual.types';

/**
 * RitualDifficultyFilter Component Props
 */
export interface RitualDifficultyFilterProps {
  /** Currently selected difficulty */
  value?: RitualDifficulty;
  /** Callback when difficulty selection changes */
  onChange: (value: RitualDifficulty | undefined) => void;
}

/**
 * RitualDifficultyFilter Component
 *
 * Dropdown filter for selecting ritual difficulty level.
 *
 * Features:
 * - All difficulties option to clear filter
 * - Beginner, Intermediate, and Advanced options
 * - Controlled component with value prop
 * - Compact 180px width suitable for filter bars
 *
 * @example
 * ```tsx
 * <RitualDifficultyFilter
 *   value={selectedDifficulty}
 *   onChange={setSelectedDifficulty}
 * />
 * ```
 */
export function RitualDifficultyFilter({ value, onChange }: RitualDifficultyFilterProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(v) => onChange(v === 'all' ? undefined : (v as RitualDifficulty))}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Dificultad" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las dificultades</SelectItem>
        {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
          <SelectItem key={key} value={key}>
            {info.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
