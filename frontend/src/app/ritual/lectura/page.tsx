'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReadingExperience } from '@/components/features/readings/ReadingExperience';
import { CARD_ASPECT_CLASS } from '@/components/features/readings/TarotCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Inner component that uses useSearchParams
 */
function LecturaPageContent() {
  const searchParams = useSearchParams();
  const spreadId = searchParams.get('spreadId');
  const questionId = searchParams.get('questionId');
  const customQuestion = searchParams.get('customQuestion');

  // Validate spreadId is present
  if (!spreadId) {
    return (
      <div className="bg-bg-main flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Selecciona una tirada primero.</p>
          <a href="/ritual/tirada" className="text-primary hover:underline">
            Volver a selección de tirada
          </a>
        </div>
      </div>
    );
  }

  return (
    <ReadingExperience
      spreadId={Number(spreadId)}
      questionId={questionId ? Number(questionId) : null}
      customQuestion={customQuestion ? decodeURIComponent(customQuestion) : null}
    />
  );
}

/**
 * Loading fallback for Suspense
 */
function LecturaPageLoading() {
  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-4 h-6 w-48" />
          <Skeleton className="mx-auto h-8 w-64" />
        </div>
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className={cn('w-40 rounded-xl', CARD_ASPECT_CLASS)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Lectura Page - Reading Experience Route
 *
 * Protected page that renders the ReadingExperience component.
 * The actual logic is in the component following separation of concerns.
 * Wrapped in Suspense because it uses useSearchParams.
 */
export default function LecturaPage() {
  return (
    <Suspense fallback={<LecturaPageLoading />}>
      <LecturaPageContent />
    </Suspense>
  );
}
