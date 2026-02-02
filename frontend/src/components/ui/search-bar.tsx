'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchBar({
  onSearch,
  placeholder = 'Buscar...',
  defaultValue = '',
  className,
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className={cn('relative', className)} data-testid="search-bar">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pr-9 pl-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
          onClick={handleClear}
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpiar</span>
        </Button>
      )}
    </div>
  );
}
