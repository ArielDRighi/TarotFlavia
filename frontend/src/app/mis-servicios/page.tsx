'use client';

import { Loader2 } from 'lucide-react';

import { MyServicesList } from '@/components/features/holistic-services';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Mis Servicios - User Purchases Page
 *
 * Protected page listing the user's holistic service purchases.
 * Business logic delegated to MyServicesList component.
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

  return <MyServicesList />;
}
