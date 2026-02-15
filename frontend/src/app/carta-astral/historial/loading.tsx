import { SavedChartCardSkeleton } from '@/components/features/birth-chart/SavedChartCard/SavedChartCard';

/**
 * Loading state para página de historial
 * Muestra skeletons en grid mientras carga
 */
export default function HistorialLoading() {
  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="bg-muted h-10 w-32 animate-pulse rounded" />
      </div>

      <div className="mb-6 flex gap-4">
        <div className="bg-muted h-10 w-full max-w-sm animate-pulse rounded" />
        <div className="bg-muted h-10 w-40 animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SavedChartCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
