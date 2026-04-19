'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ReadingExperience } from '@/components/features/readings/ReadingExperience';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Inner component that uses useSearchParams
 */
function LecturaPageContent() {
  const searchParams = useSearchParams();
  const spreadId = searchParams.get('spreadId');
  const questionId = searchParams.get('questionId');
  const customQuestion = searchParams.get('customQuestion');
  const decodedCustomQuestion = customQuestion ? decodeURIComponent(customQuestion) : null;
  const categoryId = searchParams.get('categoryId');

  // Validate spreadId is present
  if (!spreadId) {
    return (
      <div className="bg-bg-main flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Selecciona una tirada primero.</p>
          <Link href={ROUTES.TAROT_TIRADA} className="text-primary hover:underline">
            Volver a selección de tirada
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ReadingExperience
      spreadId={Number(spreadId)}
      questionId={questionId ? Number(questionId) : null}
      customQuestion={decodedCustomQuestion}
      categoryId={categoryId ? Number(categoryId) : null}
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
          <div className="mx-auto mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto h-8 w-64 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-60 w-40 animate-pulse rounded-xl bg-gray-200" />
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
