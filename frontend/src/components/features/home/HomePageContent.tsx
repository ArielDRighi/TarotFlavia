'use client';

import { UserDashboard } from '@/components/features/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { LandingPage } from './LandingPage';

/**
 * Loading Skeleton for auth validation
 * Prevents FOUC (Flash Of Unauthed Content)
 */
function LoadingSkeleton() {
  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center">
      <div className="w-full max-w-4xl space-y-8 px-4">
        <Skeleton className="mx-auto h-24 w-3/4" />
        <Skeleton className="mx-auto h-16 w-full" />
        <Skeleton className="mx-auto h-64 w-full" />
      </div>
    </div>
  );
}

/**
 * Home Page with Dual Logic
 * TASK-017: Implement dual HomePage (LandingPage + UserDashboard)
 *
 * Vive fuera de `app/` desde T-PROD-020: la ruta `/` pasó a ser un server
 * component para poder exportar `homeMetadata`. Mientras fue client, la home
 * servía el `<title>` genérico "Auguria" — el mismo que el resto del sitio.
 *
 * Behavior:
 * - Shows loading skeleton while checking auth (prevents FOUC)
 * - Shows LandingPage for unauthenticated users
 * - Shows UserDashboard for authenticated users (all plans)
 */
export function HomePageContent() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading skeleton while validating auth (prevent FOUC)
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Show LandingPage for unauthenticated users
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  // Show UserDashboard for authenticated users (all plans)
  return <UserDashboard />;
}
