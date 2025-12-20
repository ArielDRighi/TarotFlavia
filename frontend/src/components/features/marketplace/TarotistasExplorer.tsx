'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useTarotistas } from '@/hooks/api/useTarotistas';
import { TarotistaCard } from './TarotistaCard';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SPECIALTIES = ['Todos', 'Amor', 'Dinero', 'Carrera', 'Salud', 'Espiritual'] as const;

/**
 * TarotistasExplorer Component Props
 */
export interface TarotistasExplorerProps {
  /** Callback when a tarotista profile is clicked */
  onViewProfile: (id: number) => void;
}

/**
 * TarotistasExplorer Component
 *
 * Marketplace explorer with filters, search, and grid of tarotistas.
 *
 * Features:
 * - Search input with debounce (300ms)
 * - Specialty filter chips
 * - Responsive grid (1/2/3 columns)
 * - Loading skeleton states
 * - Empty state with clear filters action
 */
export function TarotistasExplorer({ onViewProfile }: TarotistasExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Todos');

  // Debounce search term (300ms)
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  // Build filters for API
  const filters = {
    search: debouncedSearch || undefined,
    especialidad: selectedSpecialty !== 'Todos' ? selectedSpecialty : undefined,
  };

  // Fetch tarotistas with filters
  const { data, isLoading } = useTarotistas(filters);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('Todos');
  };

  const tarotistas = data?.data || [];
  const isEmpty = !isLoading && tarotistas.length === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="mb-2 font-serif text-4xl font-bold text-gray-800">
          Nuestros Guías Espirituales
        </h1>
        <p className="text-lg text-gray-600">Encuentra al mentor ideal para tu camino</p>
      </header>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative mx-auto max-w-md">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar guía espiritual..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Specialty Chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {SPECIALTIES.map((specialty) => {
            const isSelected = selectedSpecialty === specialty;
            return (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isSelected
                    ? 'bg-primary text-white'
                    : 'hover:border-primary hover:text-primary border border-gray-300 text-gray-700'
                )}
              >
                {specialty}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} variant="tarotist" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <Search className="mb-4 h-16 w-16 text-gray-300" />
          <p className="mb-4 text-lg text-gray-600">No encontramos guías con ese criterio</p>
          <Button onClick={handleClearFilters} variant="outline">
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Tarotistas Grid */}
      {!isLoading && !isEmpty && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tarotistas.map((tarotista) => (
            <TarotistaCard key={tarotista.id} tarotista={tarotista} onViewProfile={onViewProfile} />
          ))}
        </div>
      )}
    </div>
  );
}
