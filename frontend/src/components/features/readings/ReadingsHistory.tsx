'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Layers, ChevronDown, Grid3x3, List, Sun } from 'lucide-react';
import { startOfWeek, startOfMonth, isAfter, isSameDay } from 'date-fns';

import { useMyReadings } from '@/hooks/api/useReadings';
import { getShareText } from '@/lib/api/readings-api';
import { shouldUseNativeShare } from '@/lib/utils/device';
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
import { toast } from '@/hooks/utils/useToast';
import type { Reading } from '@/types';

// Constants
const READINGS_PER_PAGE = 10;

type DateFilterOption = 'recent' | 'oldest' | 'this-week' | 'this-month';
type SpreadFilterOption = 'all' | string; // 'all' or specific spread name
type ViewMode = 'list' | 'grid';

interface DateFilterConfig {
  label: string;
  value: DateFilterOption;
}

interface SpreadFilterConfig {
  label: string;
  value: SpreadFilterOption;
}

const DATE_FILTER_OPTIONS: DateFilterConfig[] = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Más antiguas', value: 'oldest' },
  { label: 'Esta semana', value: 'this-week' },
  { label: 'Este mes', value: 'this-month' },
];

const SPREAD_FILTER_OPTIONS: SpreadFilterConfig[] = [
  { label: 'Todas las tiradas', value: 'all' },
  { label: 'Tirada de 1 Carta', value: 'Tirada de 1 Carta' },
  { label: 'Tirada de 3 Cartas', value: 'Tirada de 3 Cartas' },
  { label: 'Tirada de 5 Cartas', value: 'Tirada de 5 Cartas' },
  { label: 'Cruz Céltica', value: 'Cruz Céltica' },
];

/**
 * Filter and sort readings based on filters and search query
 *
 * NOTE: This filtering is client-side and operates on the current page's data only.
 * For 'this-week' and 'this-month' filters, this means readings outside the current
 * page are not considered. This is a known limitation that provides quick filtering
 * without requiring server-side changes. The sorting (recent/oldest) works correctly
 * for the current page's data.
 */
function filterReadings(
  readings: Reading[],
  dateFilter: DateFilterOption,
  spreadFilter: SpreadFilterOption,
  searchQuery: string
): Reading[] {
  let filtered = [...readings];

  // Filter by search query (case insensitive) - now includes spreadName
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (reading) =>
        reading.question.toLowerCase().includes(query) ||
        reading.spreadName.toLowerCase().includes(query)
    );
  }

  // Filter by spread type
  if (spreadFilter !== 'all') {
    filtered = filtered.filter((reading) => reading.spreadName === spreadFilter);
  }

  // Filter by date range (inclusive - include readings on the start date)
  const now = new Date();
  if (dateFilter === 'this-week') {
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    filtered = filtered.filter((reading) => {
      const readingDate = new Date(reading.createdAt);
      return isAfter(readingDate, weekStart) || isSameDay(readingDate, weekStart);
    });
  } else if (dateFilter === 'this-month') {
    const monthStart = startOfMonth(now);
    filtered = filtered.filter((reading) => {
      const readingDate = new Date(reading.createdAt);
      return isAfter(readingDate, monthStart) || isSameDay(readingDate, monthStart);
    });
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
  const [spreadFilter, setSpreadFilter] = React.useState<SpreadFilterOption>('all');
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');

  // Data fetching
  const {
    data: readingsData,
    isLoading: isReadingsLoading,
    isError,
    error,
    refetch,
  } = useMyReadings(page, READINGS_PER_PAGE);

  // Handle view reading
  const handleViewReading = (id: number) => {
    router.push(`/historial/${id}`);
  };

  // Handle share reading (TASK-SHARE-009)
  const handleShareReading = React.useCallback(async (readingId: number) => {
    try {
      // Fetch share text from backend using API function
      const data = await getShareText(readingId);
      const shareText = data.text;

      // Solo usar Web Share API en móvil, en PC copiar al portapapeles
      if (shouldUseNativeShare()) {
        await navigator.share({
          text: shareText,
          title: 'Mi Lectura de Tarot en Auguria',
        });
        toast.success('¡Compartido!');
      } else {
        // PC/Desktop: Copiar al portapapeles directamente
        await navigator.clipboard.writeText(shareText);
        toast.success('Texto copiado al portapapeles');
      }
    } catch (error) {
      // Don't show error if user cancelled share
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error('Error sharing reading:', error);
      toast.error('Error al compartir');
    }
  }, []);

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

  // Get current filter labels
  const currentDateFilterLabel =
    DATE_FILTER_OPTIONS.find((opt) => opt.value === dateFilter)?.label || 'Más recientes';
  const currentSpreadFilterLabel =
    SPREAD_FILTER_OPTIONS.find((opt) => opt.value === spreadFilter)?.label || 'Todas las tiradas';

  // Filter readings based on all filters
  const filteredReadings = readingsData?.data
    ? filterReadings(readingsData.data, dateFilter, spreadFilter, searchQuery)
    : [];

  // Check if we have readings
  const hasReadings = readingsData && readingsData.data.length > 0;
  const hasFilteredReadings = filteredReadings.length > 0;
  const isSearching = searchQuery.trim().length > 0;
  const isSpreadFiltering = spreadFilter !== 'all';
  const showPagination = readingsData && readingsData.meta.totalPages > 1;

  // Get list/grid classes
  // List view: centered with max-width for better readability
  // Grid view: full width with responsive columns
  const listClasses =
    viewMode === 'grid'
      ? 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'mx-auto max-w-2xl space-y-3';

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-bold text-gray-900 md:text-4xl">
          Tu camino revelado
        </h1>
        <Link
          href="/carta-del-dia/historial"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Sun className="h-4 w-4" />
          Ver historial de cartas del día
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Date Filter and Spread Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {/* Date Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-testid="date-filter"
                  variant="outline"
                  className="w-full justify-between sm:w-auto"
                >
                  {currentDateFilterLabel}
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

            {/* Spread Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-testid="spread-filter"
                  variant="outline"
                  className="w-full justify-between sm:w-auto"
                >
                  {currentSpreadFilterLabel}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {SPREAD_FILTER_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSpreadFilter(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Input and View Toggle */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Buscar por pregunta o tirada..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* View Toggle Button */}
            <Button
              data-testid="view-toggle"
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              aria-label={viewMode === 'list' ? 'Vista en cuadrícula' : 'Vista en lista'}
            >
              {viewMode === 'list' ? <Grid3x3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
          </div>
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

      {/* No search/filter results */}
      {!isReadingsLoading &&
        !isError &&
        hasReadings &&
        !hasFilteredReadings &&
        (isSearching ||
          isSpreadFiltering ||
          dateFilter === 'this-week' ||
          dateFilter === 'this-month') && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              {isSearching || isSpreadFiltering
                ? 'No se encontraron lecturas para tu búsqueda.'
                : 'No se encontraron lecturas en este período.'}
            </p>
          </div>
        )}

      {/* Readings List */}
      {!isReadingsLoading && !isError && hasFilteredReadings && (
        <div data-testid="readings-list" className={listClasses}>
          {filteredReadings.map((reading) => (
            <ReadingCard
              key={reading.id}
              reading={reading}
              onView={handleViewReading}
              onShare={handleShareReading}
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
