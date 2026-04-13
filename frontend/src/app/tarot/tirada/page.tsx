'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SpreadSelector } from '@/components/features/readings/SpreadSelector';

/**
 * Inner component that uses useSearchParams
 */
function SpreadSelectorPageContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const questionId = searchParams.get('questionId');
  const customQuestion = searchParams.get('customQuestion');

  return (
    <SpreadSelector
      categoryId={categoryId}
      questionId={questionId}
      customQuestion={customQuestion}
    />
  );
}

/**
 * Loading fallback for Suspense
 */
function SpreadSelectorPageLoading() {
  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto mb-8 h-10 w-64 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              data-testid="skeleton-spread-card"
              className="bg-card animate-pulse rounded-lg border p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-6 w-32 rounded bg-gray-200" />
                <div className="h-6 w-20 rounded bg-gray-200" />
              </div>
              <div className="mb-4 space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
              <div className="mb-4 flex items-center gap-4">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Spread Selector Page - Tirada Type Selection Route
 *
 * Protected page that renders the SpreadSelector component.
 * The actual logic is in the component following separation of concerns.
 * Wrapped in Suspense because it uses useSearchParams.
 */
export default function SpreadSelectorPage() {
  return (
    <Suspense fallback={<SpreadSelectorPageLoading />}>
      <SpreadSelectorPageContent />
    </Suspense>
  );
}
