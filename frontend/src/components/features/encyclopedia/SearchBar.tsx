'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/utils/useDebounce';

/**
 * SearchBar Component Props
 */
export interface SearchBarProps {
  /** Callback called with debounced search value */
  onSearch: (query: string) => void;
  /** Controlled input value */
  value?: string;
  /** Callback for controlled input changes */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SearchBar Component
 *
 * Search input with 300ms debounce for tarot card encyclopedia.
 *
 * Features:
 * - 300ms debounce on search callback
 * - Search icon inside input
 * - Supports both controlled and uncontrolled modes
 * - Accessible with role="searchbox"
 *
 * @example
 * ```tsx
 * <SearchBar
 *   onSearch={handleSearch}
 *   placeholder="Buscar cartas..."
 * />
 * ```
 */
export function SearchBar({
  onSearch,
  value,
  onChange,
  placeholder = 'Buscar cartas...',
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');
  const currentValue = value !== undefined ? value : internalValue;
  const debouncedValue = useDebounce(currentValue, 300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [value, onChange]
  );

  return (
    <div data-testid="search-bar" className={cn('relative', className)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        role="searchbox"
        type="search"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  );
}
