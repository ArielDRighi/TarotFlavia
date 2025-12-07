'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Layers, ChevronDown } from 'lucide-react';
import { startOfWeek, startOfMonth, isAfter } from 'date-fns';

import { useMyReadings, useDeleteReading } from '@/hooks/api/useReadings';
import { ReadingCard } from '@/components/features/readings/ReadingCard';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Reading } from '@/types';

// Constants
const READINGS_PER_PAGE = 10;

type DateFilterOption = 'recent' | 'oldest' | 'this-week' | 'this-month';

interface DateFilterConfig {
  label: string;
  value: DateFilterOption;
}

const DATE_FILTER_OPTIONS: DateFilterConfig[] = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Más antiguas', value: 'oldest' },
  { label: 'Esta semana', value: 'this-week' },
  { label: 'Este mes', value: 'this-month' },
];

/**
 * Filter and sort readings based on date filter and search query
 */
function filterReadings(
  readings: Reading[],
  dateFilter: DateFilterOption,
  searchQuery: string
): Reading[] {
  let filtered = [...readings];

  // Filter by search query (case insensitive)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((reading) => reading.question.toLowerCase().includes(query));
  }

  // Filter by date range
  const now = new Date();
  if (dateFilter === 'this-week') {
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    filtered = filtered.filter((reading) => isAfter(new Date(reading.createdAt), weekStart));
  } else if (dateFilter === 'this-month') {
    const monthStart = startOfMonth(now);
    filtered = filtered.filter((reading) => isAfter(new Date(reading.createdAt), monthStart));
  }

  // Sort by date
  filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateFilter === 'oldest' ? dateA - dateB : dateB - dateA;
  });

  return filtered;
}

/**
 * ReadingsHistory Component
 *
 * Displays a paginated list of user's tarot readings with filtering and search.
 * Contains all the business logic for the history page.
 */
export function ReadingsHistory() {
  const router = useRouter();

  // State
  const [page, setPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState<DateFilterOption>('recent');

  // Data fetching
  const {
    data: readingsData,
    isLoading: isReadingsLoading,
    isError,
    error,
    refetch,
  } = useMyReadings(page, READINGS_PER_PAGE);

  const { mutate: deleteReading } = useDeleteReading();

  // Handle view reading
  const handleViewReading = (id: number) => {
    router.push(`/historial/${id}`);
  };

  // Handle delete reading
  const handleDeleteReading = (id: number) => {
    deleteReading(id, {
      onSuccess: () => {
        // Refetch on success is handled by the hook
      },
      onError: () => {
        // Error is handled by the hook's toast
      },
    });
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (readingsData && page < readingsData.meta.totalPages) {
      setPage(page + 1);
    }
  };

  // Navigate to ritual page
  const handleMakeFirstReading = () => {
    router.push('/ritual');
  };

  // Get current filter label
  const currentFilterLabel =
    DATE_FILTER_OPTIONS.find((opt) => opt.value === dateFilter)?.label || 'Más recientes';

  // Filter readings based on search and date filter
  const filteredReadings = readingsData?.data
    ? filterReadings(readingsData.data, dateFilter, searchQuery)
    : [];

  // Check if we have readings
  const hasReadings = readingsData && readingsData.data.length > 0;
  const hasFilteredReadings = filteredReadings.length > 0;
  const isSearching = searchQuery.trim().length > 0;
  const showPagination = readingsData && readingsData.meta.totalPages > 1;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 md:text-4xl">
          Tu camino revelado
        </h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Date Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="date-filter"
              variant="outline"
              className="w-full justify-between sm:w-auto"
            >
              {currentFilterLabel}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {DATE_FILTER_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => setDateFilter(option.value)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar por pregunta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isReadingsLoading && (
        <div className="grid gap-4" data-testid="readings-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} variant="reading" data-testid="skeleton-card" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">{error?.message || 'Error al obtener lecturas'}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty State (no readings at all) */}
      {!isReadingsLoading && !isError && !hasReadings && (
        <EmptyState
          icon={<Layers />}
          title="Tu destino aún no ha sido revelado"
          message="Haz una lectura hoy."
          action={{
            label: 'Hacer mi primera lectura',
            onClick: handleMakeFirstReading,
          }}
        />
      )}

      {/* No search results */}
      {!isReadingsLoading && !isError && hasReadings && !hasFilteredReadings && isSearching && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No se encontraron lecturas para tu búsqueda.</p>
        </div>
      )}

      {/* Readings List */}
      {!isReadingsLoading && !isError && hasFilteredReadings && (
        <div data-testid="readings-list" className="grid gap-4">
          {filteredReadings.map((reading) => (
            <ReadingCard
              key={reading.id}
              reading={reading}
              onView={handleViewReading}
              onDelete={handleDeleteReading}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isReadingsLoading && !isError && showPagination && (
        <nav
          data-testid="pagination"
          className="mt-8 flex items-center justify-center gap-4"
          aria-label="Paginación"
        >
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={page <= 1}
            aria-label="Anterior"
          >
            Anterior
          </Button>
          <span className="text-muted-foreground text-sm">
            Página {page} de {readingsData?.meta.totalPages || 1}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={page >= (readingsData?.meta.totalPages || 1)}
            aria-label="Siguiente"
          >
            Siguiente
          </Button>
        </nav>
      )}
    </>
  );
}
