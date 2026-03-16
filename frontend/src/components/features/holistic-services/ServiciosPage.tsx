/**
 * ServiciosPage Component
 *
 * Catalog page listing all active holistic services.
 * Handles loading skeleton, empty state, and error state with retry.
 * Shows a contextual banner to access "Mis Servicios" for authenticated users.
 */
'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHolisticServices } from '@/hooks/api/useHolisticServices';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants/routes';
import { ServiceCard } from './ServiceCard';

const SKELETON_COUNT = 6;

export function ServiciosPage() {
  const { data: services, isLoading, isError, refetch } = useHolisticServices();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="bg-bg-main min-h-screen px-4 py-8 md:px-8" data-testid="servicios-page">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl">Servicios Holísticos</h1>

        {isAuthenticated && (
          <Link
            href={ROUTES.MIS_SERVICIOS}
            data-testid="mis-servicios-link"
            className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-100"
          >
            <ShoppingBag className="h-4 w-4" />
            Mis Servicios
          </Link>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div
          data-testid="servicios-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} data-testid="service-card-skeleton" className="rounded-lg border p-6">
              <Skeleton className="mb-3 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-4 h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-4 h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div
          data-testid="servicios-error-state"
          className="flex flex-col items-center gap-4 py-12 text-center"
        >
          <p className="text-text-secondary">
            Ocurrió un error al cargar los servicios. Por favor intentá de nuevo.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && services && services.length === 0 && (
        <div
          data-testid="servicios-empty-state"
          className="flex flex-col items-center gap-4 py-12 text-center"
        >
          <p className="text-text-secondary">No hay servicios disponibles en este momento.</p>
        </div>
      )}

      {/* Services grid */}
      {!isLoading && !isError && services && services.length > 0 && (
        <div
          data-testid="servicios-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
