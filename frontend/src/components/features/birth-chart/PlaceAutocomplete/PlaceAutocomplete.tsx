/**
 * PlaceAutocomplete Component
 *
 * Componente de autocompletado para seleccionar lugares de nacimiento con geocoding
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import { useGeocodeSearch } from '@/hooks/api/useGeocodeSearch';
import type { GeocodedPlace } from '@/types/birth-chart-geocode.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mantener una referencia del último value.placeId para detectar cambios reales
  const lastPlaceIdRef = useRef<string | null>(value?.placeId ?? null);
  
  // Estado local del input - se inicializa con value.displayName si existe
  const [inputValue, setInputValue] = useState(value?.displayName || '');

  // Sincronizar inputValue solo cuando value.placeId cambia (nuevo lugar seleccionado)
  // Esto evita el setState sincrónico en effect que causa el warning
  if (value?.placeId !== lastPlaceIdRef.current) {
    lastPlaceIdRef.current = value?.placeId ?? null;
    const newDisplayName = value?.displayName || '';
    if (inputValue !== newDisplayName) {
      setInputValue(newDisplayName);
    }
  }

  // Búsqueda con debounce
  const { data, isLoading, isFetching } = useGeocodeSearch(inputValue);

  // Manejar selección de lugar
  const handleSelect = useCallback(
    (place: GeocodedPlace) => {
      onChange(place);
      setInputValue(place.displayName);
      setOpen(false);
    },
    [onChange]
  );

  // Limpiar selección
  const handleClear = useCallback(() => {
    onChange(null);
    setInputValue('');
    inputRef.current?.focus();
  }, [onChange]);

  // Manejar cambio en input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Si borramos todo o cambiamos el texto, limpiar selección
    if (value && newValue !== value.displayName) {
      onChange(null);
    }

    // Abrir popover si hay suficientes caracteres
    if (newValue.length >= 3) {
      setOpen(true);
    }
  };

  // Renderizar contenido del popover
  const renderResults = () => {
    if (isLoading || isFetching) {
      return (
        <div className="text-muted-foreground flex items-center justify-center py-6 text-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Buscando lugares...
        </div>
      );
    }

    if (!data?.results.length) {
      return (
        <CommandEmpty>
          No se encontraron lugares.
          <br />
          <span className="text-muted-foreground text-xs">
            Intenta con otro nombre o agrega el país.
          </span>
        </CommandEmpty>
      );
    }

    return (
      <CommandGroup heading="Lugares encontrados">
        {data.results.map((place) => (
          <CommandItem
            key={place.placeId}
            value={place.placeId}
            onSelect={() => handleSelect(place)}
            className="cursor-pointer"
          >
            <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">{place.city || place.displayName.split(',')[0]}</span>
              <span className="text-muted-foreground text-xs">
                {place.country}
                {place.timezone && ` • ${place.timezone}`}
              </span>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
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
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              ref={inputRef}
              id={id}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => inputValue.length >= 3 && setOpen(true)}
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
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>{renderResults()}</CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Mostrar lugar seleccionado */}
      {value && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3" />
          <span>
            Coordenadas: {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
          </span>
          <span>•</span>
          <span>Zona: {value.timezone}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
