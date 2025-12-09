'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ReadingDetail } from '@/components/features/readings/ReadingDetail';

/**
 * Reading Detail Page - /historial/[id]
 *
 * Protected page that displays a specific reading.
 * All business logic is delegated to ReadingDetail component.
 */
export default function ReadingDetailPage() {
  const params = useParams();
  const readingId = Number(params.id);
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
      <div className="mx-auto max-w-4xl">
        <ReadingDetail readingId={readingId} />
      </div>
    </div>
  );
}
