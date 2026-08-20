/**
 * Página de Reservar Sesión con Tarotista
 *
 * Route wrapper que protege la página y delega la UI al componente BookingPage.
 */
'use client';

import { notFound, useParams } from 'next/navigation';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { BookingPage } from '@/components/features/marketplace';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { parseNumericRouteId } from '@/lib/utils/route-params';

export default function ReservarPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoading } = useRequireAuth();

  // El segmento se leía como `params.id` de un objeto plano, pero en Next 16
  // `params` es una Promise: `Number(params.id)` daba `NaN` y `BookingPage`
  // arrancaba con un id inválido. Se lee con `useParams` —igual que las otras
  // rutas cliente del proyecto— y un id que no es un id corta con 404
  // (T-SEO-006).
  const tarotistaId = parseNumericRouteId(id);

  if (tarotistaId === null) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-6 w-64" />
        <Skeleton className="mb-8 h-24 w-full" />
        <Skeleton className="h-96 w-full" />
        <Spinner size="md" text="Cargando..." className="mt-4" />
      </div>
    );
  }

  return <BookingPage tarotistaId={tarotistaId} />;
}
