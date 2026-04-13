'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionSelector } from '@/components/features/readings/QuestionSelector';

/**
 * Inner component that uses useSearchParams
 */
function QuestionsPageContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  return <QuestionSelector categoryId={categoryId} />;
}

/**
 * Loading fallback for Suspense
 */
function QuestionsPageLoading() {
  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto mb-8 h-10 w-64 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-card animate-pulse rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-5 flex-1 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Questions Page - Question Selector Route
 *
 * Protected page that renders the QuestionSelector component.
 * The actual logic is in the component following separation of concerns.
 * Wrapped in Suspense because it uses useSearchParams.
 */
export default function QuestionsPage() {
  return (
    <Suspense fallback={<QuestionsPageLoading />}>
      <QuestionsPageContent />
    </Suspense>
  );
}
