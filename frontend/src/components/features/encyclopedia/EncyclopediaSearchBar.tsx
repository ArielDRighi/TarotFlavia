'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/utils/useDebounce';

/**
 * EncyclopediaSearchBar Component Props
 */
export interface EncyclopediaSearchBarProps {
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
 * EncyclopediaSearchBar Component
 *
 * Search input with 300ms debounce for tarot card encyclopedia.
 *
 * Features:
 * - 300ms debounce on search callback
 * - Search icon inside input
 * - Clear (X) button when input has value
 * - Supports both controlled and uncontrolled modes
 * - Accessible with role="searchbox"
 * - If mounted with an initial value, parent receives it on first render
 *
 * @example
 * ```tsx
 * <EncyclopediaSearchBar
 *   onSearch={handleSearch}
 *   placeholder="Buscar cartas..."
 * />
 * ```
 */
export function EncyclopediaSearchBar({
  onSearch,
  value,
  onChange,
  placeholder = 'Buscar cartas...',
  className,
}: EncyclopediaSearchBarProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');
  const currentValue = value !== undefined ? value : internalValue;
  const debouncedValue = useDebounce(currentValue, 300);
  // Only skip the first render if the initial value is empty (no meaningful query)
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // If there is an initial value, fire onSearch so the parent is in sync
      if (debouncedValue !== '') {
        onSearch(debouncedValue);
      }
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

  const handleClear = useCallback(() => {
    if (value === undefined) {
      setInternalValue('');
    }
    onChange?.('');
    onSearch('');
  }, [value, onChange, onSearch]);

  return (
    <div data-testid="encyclopedia-search-bar" className={cn('relative', className)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        role="searchbox"
        type="search"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        className={cn('pl-9', currentValue && 'pr-9')}
      />
      {currentValue && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={handleClear}
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
