'use client';

import { Loader2 } from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Mis Servicios - User Purchases Page
 *
 * Protected page listing the user's holistic service purchases.
 * Business logic will be delegated to MyServicesList component (future task).
 */
export default function MisServiciosPage() {
  const { isLoading: isAuthLoading } = useRequireAuth();

  if (isAuthLoading) {
    return (
      <div
        data-testid="auth-loading"
        className="bg-bg-main flex min-h-screen items-center justify-center"
      >
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-bg-main min-h-screen px-4 py-8 md:px-8" data-testid="mis-servicios-page">
      <h1 className="mb-8 font-serif text-3xl">Mis Servicios</h1>
      {/* TODO T-SF-F03: Implementar MyServicesList */}
    </div>
  );
}
