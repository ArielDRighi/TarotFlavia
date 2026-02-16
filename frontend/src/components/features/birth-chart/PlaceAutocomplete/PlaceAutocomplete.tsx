/**
 * PlaceAutocomplete Component
 *
 * Componente de autocompletado para seleccionar lugares de nacimiento con geocoding
 */

'use client';

import { useState, useCallback } from 'react';
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
  const [selectedPlaceId, setSelectedPlaceId] = useState('');

  // Estado SOLO para cuando el usuario está escribiendo (búsqueda)
  const [searchQuery, setSearchQuery] = useState('');

  // El valor mostrado en el input se deriva del estado actual:
  // - Si hay searchQuery (usuario escribiendo) → mostrar searchQuery
  // - Si hay value seleccionado → mostrar value.displayName
  // - Si no hay nada → mostrar vacío
  const inputDisplayValue = searchQuery || value?.displayName || '';

  // Búsqueda con debounce - usa searchQuery, no el valor mostrado
  const { data, isLoading, isFetching } = useGeocodeSearch(searchQuery);

  // Manejar selección de lugar
  const handleSelect = useCallback(
    (place: GeocodedPlace) => {
      onChange(place);
      setSearchQuery(''); // Limpiar búsqueda, el input mostrará value.displayName
      setOpen(false);
      setSelectedPlaceId('');
    },
    [onChange]
  );

  // Manejar cambio de valor en cmdk
  const handleValueChange = useCallback(
    (placeId: string) => {
      setSelectedPlaceId(placeId);
      const place = data?.results.find(p => p.placeId === placeId);
      if (place) {
        handleSelect(place);
      }
    },
    [data?.results, handleSelect]
  );

  // Limpiar selección
  const handleClear = useCallback(() => {
    onChange(null);
    setSearchQuery('');
  }, [onChange]);

  // Manejar cambio en input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);

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
            className="cursor-pointer"
          >
            <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
            <div className="flex flex-col flex-1">
              <span className="font-medium">
                {place.city || place.displayName.split(',')[0]?.trim() || place.displayName}
              </span>
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
              id={id}
              type="text"
              value={inputDisplayValue}
              onChange={handleInputChange}
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
          <Command
            shouldFilter={false}
            value={selectedPlaceId}
            onValueChange={handleValueChange}
          >
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
