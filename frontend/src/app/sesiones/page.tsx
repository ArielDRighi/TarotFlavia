'use client';

import { Loader2 } from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { SessionsList } from '@/components/features/marketplace/SessionsList';

/**
 * Sesiones Page - My Sessions
 *
 * Protected page that displays user's session reservations with filters.
 * All business logic is delegated to SessionsList component.
 */
export default function SesionesPage() {
  const { isLoading: isAuthLoading } = useRequireAuth();

  // Show auth loading state
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
    <div className="bg-bg-main min-h-screen px-4 py-8 md:px-8">
      <h1 className="mb-8 font-serif text-3xl">Mis Sesiones</h1>
      <SessionsList />
    </div>
  );
}
