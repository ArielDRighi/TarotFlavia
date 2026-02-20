/**
 * PlaceAutocomplete Component
 *
 * Componente de autocompletado para seleccionar lugares de nacimiento con geocoding.
 * Implementa el patrón ARIA Combobox (WAI-ARIA 1.2) para accesibilidad completa.
 * Navegación por teclado: ↑↓ navegan opciones, Enter selecciona, Escape cierra.
 *
 * Nota técnica: usa <button> nativo en lugar de cmdk/Command porque cmdk utiliza
 * event delegation que es incompatible con el Portal de Radix Popover (el Portal
 * renderiza fuera del árbol DOM donde cmdk escucha eventos). Los React Synthetic
 * Events de <button onClick> funcionan correctamente en cualquier contexto de Portal.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import { useGeocodeSearch } from '@/hooks/api/useGeocodeSearch';
import type { GeocodedPlace } from '@/types/birth-chart-geocode.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const LISTBOX_ID = 'place-autocomplete-listbox';

interface PlaceAutocompleteProps {
  value: GeocodedPlace | null;
  onChange: (place: GeocodedPlace | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  label?: string;
  id?: string;
}

export function PlaceAutocomplete({
  value,
  onChange,
  placeholder = 'Ej: Buenos Aires, Argentina',
  disabled = false,
  error,
  required = false,
  label = 'Lugar de nacimiento',
  id = 'birth-place',
}: PlaceAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Índice del ítem activo para navegación por teclado (-1 = ninguno)
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = `${id}-${LISTBOX_ID}`;

  // El valor mostrado en el input se deriva del estado actual:
  // - Si hay searchQuery (usuario escribiendo) → mostrar searchQuery
  // - Si hay value seleccionado → mostrar value.displayName
  // - Si no hay nada → mostrar vacío
  const inputDisplayValue = searchQuery || value?.displayName || '';

  const { data, isLoading, isFetching } = useGeocodeSearch(searchQuery);
  const results = data?.results ?? [];

  // Manejar selección de lugar
  const handleSelect = useCallback(
    (place: GeocodedPlace) => {
      onChange(place);
      setSearchQuery('');
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange]
  );

  // Limpiar selección
  const handleClear = useCallback(() => {
    onChange(null);
    setSearchQuery('');
    setActiveIndex(-1);
  }, [onChange]);

  // Manejar cambio en input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    // Resetear índice activo al escribir: los resultados cambiarán y el índice
    // previo no corresponde a la nueva lista
    setActiveIndex(-1);

    if (value && newValue !== value.displayName) {
      onChange(null);
    }

    if (newValue.length >= 3) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  // Navegación por teclado: ↑↓ navegan, Enter selecciona, Escape cierra
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll del ítem activo a la vista cuando se navega con teclado
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (activeIndex >= 0 && optionRefs.current[activeIndex]) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Renderizar contenido del popover
  const renderResults = () => {
    if (isLoading || isFetching) {
      return (
        <div className="text-muted-foreground flex items-center justify-center py-6 text-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Buscando lugares...
        </div>
      );
    }

    if (!results.length) {
      return (
        <div className="text-muted-foreground px-4 py-8 text-center text-sm">
          <p>No se encontraron lugares.</p>
          <p className="mt-1 text-xs">Intenta con otro nombre o agrega el país.</p>
        </div>
      );
    }

    return (
      <div
        id={listboxId}
        role="listbox"
        aria-label="Lugares encontrados"
        className="max-h-64 overflow-y-auto"
      >
        <div className="px-2 py-1">
          <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium" aria-hidden="true">
            Lugares encontrados
          </p>
          {results.map((place, index) => (
            <button
              key={place.placeId}
              id={`${id}-option-${index}`}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => handleSelect(place)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left transition-colors',
                index === activeIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">
                  {place.city || place.displayName.split(',')[0]?.trim() || place.displayName}
                </span>
                <span className="text-muted-foreground text-xs">
                  {place.country}
                  {place.timezone && ` • ${place.timezone}`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id={id}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={open ? listboxId : undefined}
              aria-activedescendant={
                open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
              }
              aria-autocomplete="list"
              value={inputDisplayValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.length >= 3 && setOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'pr-10 pl-10',
                error && 'border-destructive focus-visible:ring-destructive',
                value && 'pr-10'
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                aria-label="Limpiar selección"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {renderResults()}
        </PopoverContent>
      </Popover>

      {/* Mostrar lugar seleccionado */}
      {value && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          <span>
            Coordenadas: {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
          </span>
          <span aria-hidden="true">•</span>
          <span>Zona: {value.timezone}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
