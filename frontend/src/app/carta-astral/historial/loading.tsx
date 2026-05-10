import { SavedChartCardSkeleton } from '@/components/features/birth-chart/SavedChartCard/SavedChartCard';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading state para página de historial
 * Muestra skeletons en grid mientras carga
 */
export default function HistorialLoading() {
  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="mb-6 flex gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SavedChartCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
