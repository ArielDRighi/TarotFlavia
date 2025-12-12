/**
 * Página de Reservar Sesión con Tarotista
 *
 * Route wrapper que protege la página y delega la UI al componente BookingPage.
 */
'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { BookingPage } from '@/components/features/marketplace';
import { Skeleton } from '@/components/ui/skeleton';

interface ReservarPageProps {
  params: {
    id: string;
  };
}

export default function ReservarPage({ params }: ReservarPageProps) {
  const { isLoading } = useRequireAuth();
  const tarotistaId = Number(params.id);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-6 w-64" />
        <Skeleton className="mb-8 h-24 w-full" />
        <Skeleton className="h-96 w-full" />
        <p className="mt-4 text-center text-sm text-gray-500">Cargando...</p>
      </div>
    );
  }

  return <BookingPage tarotistaId={tarotistaId} />;
}
