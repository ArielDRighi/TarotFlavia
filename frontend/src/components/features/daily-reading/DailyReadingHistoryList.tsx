'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Sun, Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DailyReadingCard } from '@/components/features/daily-reading';
import { useDailyReadingHistory } from '@/hooks/api/useDailyReading';
import type { DailyReadingHistoryItem } from '@/types';

const ITEMS_PER_PAGE = 10;

/**
 * DailyReadingHistoryList Component Props
 */
export interface DailyReadingHistoryListProps {
  /** Callback when user clicks "Ver carta de hoy" in empty state */
  onGoToToday: () => void;
}

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div data-testid="history-loading" className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState() {
  return (
    <div className="bg-surface shadow-soft flex flex-col items-center justify-center rounded-xl p-8 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4">
        <Calendar className="h-8 w-8 text-red-500" aria-hidden="true" />
      </div>
      <p className="text-text-muted mb-4">Error al cargar el historial</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Intentar de nuevo
      </Button>
    </div>
  );
}

/**
 * Empty State Component
 */
interface EmptyStateProps {
  onGoToToday: () => void;
}

function EmptyState({ onGoToToday }: EmptyStateProps) {
  return (
    <div className="bg-surface shadow-soft flex flex-col items-center justify-center rounded-xl p-12 text-center">
      <div className="bg-primary/10 mb-6 rounded-full p-6">
        <Sun className="text-primary h-12 w-12" aria-hidden="true" />
      </div>
      <h2 className="text-text-primary mb-2 font-serif text-xl font-semibold">
        Aún no has consultado tu carta diaria
      </h2>
      <p className="text-text-muted mb-6">Descubre qué mensaje tiene el universo para ti hoy</p>
      <Button onClick={onGoToToday} className="bg-primary hover:bg-primary/90">
        Ver carta de hoy
      </Button>
    </div>
  );
}

/**
 * Pagination Component
 */
interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

function Pagination({ page, totalPages, onPrevious, onNext }: PaginationProps) {
  return (
    <div data-testid="pagination" className="mt-8 flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" onClick={onPrevious} disabled={page === 1}>
        Anterior
      </Button>
      <span className="text-text-muted text-sm">
        Página {page} de {totalPages}
      </span>
      <Button variant="outline" size="sm" onClick={onNext} disabled={page === totalPages}>
        Siguiente
      </Button>
    </div>
  );
}

/**
 * Readings List Component
 */
interface ReadingsListProps {
  items: DailyReadingHistoryItem[];
}

function ReadingsList({ items }: ReadingsListProps) {
  return (
    <div className="space-y-3">
      {items.map((reading) => (
        <DailyReadingCard key={reading.id} reading={reading} />
      ))}
    </div>
  );
}

/**
 * DailyReadingHistoryList Component
 *
 * Displays paginated list of daily reading history with compact cards.
 * Cards are self-contained and show all info without navigation.
 *
 * Features:
 * - Paginated list (10 per page)
 * - Compact card design with thumbnail
 * - Empty state with CTA to today's reading
 * - Loading and error states
 */
export function DailyReadingHistoryList({
  onGoToToday,
}: DailyReadingHistoryListProps) {
  const [page, setPage] = useState(1);

  const { data: historyData, isLoading, error } = useDailyReadingHistory(page, ITEMS_PER_PAGE);

  const handlePreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    if (historyData && page < historyData.totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [historyData, page]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState />;
  }

  // Empty state
  if (!historyData?.items || historyData.items.length === 0) {
    return <EmptyState onGoToToday={onGoToToday} />;
  }

  const { items, totalPages } = historyData;
  const showPagination = totalPages > 1;

  return (
    <>
      <ReadingsList items={items} />
      {showPagination && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      )}
    </>
  );
}

/**
 * DailyReadingHistoryPage - Historial de cartas del día
 *
 * Page component that wraps the DailyReadingHistoryList.
 * Handles authentication and routing.
 */
export function DailyReadingHistoryPage() {
  const router = useRouter();

  const handleGoToToday = useCallback(() => {
    router.push('/carta-del-dia');
  }, [router]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-text-primary font-serif text-3xl font-bold md:text-4xl">
          Tu viaje diario
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/historial"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Layers className="h-4 w-4" />
            Ver lecturas de tarot
          </Link>
          <Button variant="outline" size="sm" onClick={handleGoToToday}>
            <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
            Ver hoy
          </Button>
        </div>
      </div>

      {/* Content */}
      <DailyReadingHistoryList onGoToToday={handleGoToToday} />
    </div>
  );
}
