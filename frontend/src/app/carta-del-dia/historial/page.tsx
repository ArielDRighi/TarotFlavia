'use client';

import { Loader2 } from 'lucide-react';
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
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <DailyReadingHistoryPageContent />;
}
