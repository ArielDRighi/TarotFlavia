'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DailyReadingHistoryPage as DailyReadingHistoryPageContent } from '@/components/features/daily-reading/DailyReadingHistoryList';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * DailyReadingHistoryPage - Historial de cartas del día
 *
 * Page route component that handles authentication and renders the history page.
 *
 * Features:
 * - Authentication required
 * - Delegates to DailyReadingHistoryPage component for business logic
 */
export default function DailyReadingHistoryPage() {
  const { isLoading: isAuthLoading } = useRequireAuth();

  // Auth loading state
  if (isAuthLoading) {
    return (
      <div data-testid="auth-loading" className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return <DailyReadingHistoryPageContent />;
}
