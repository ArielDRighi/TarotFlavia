'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { usePredefinedQuestions, useCategories } from '@/hooks/api/useReadings';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { PremiumBadge } from '@/components/features/readings/PremiumBadge';
import UpgradeModal from '@/components/features/readings/UpgradeModal';
import { cn } from '@/lib/utils';
import type { PredefinedQuestion } from '@/types';

const MAX_CUSTOM_QUESTION_LENGTH = 500;

/**
 * Skeleton card for loading state
 */
function SkeletonQuestionCard() {
  return (
    <div data-testid="skeleton-card" className="bg-card animate-pulse rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-5 flex-1 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/**
 * Question card component
 */
interface QuestionCardProps {
  question: PredefinedQuestion;
  isSelected: boolean;
  onClick: () => void;
}

function QuestionCard({ question, isSelected, onClick }: QuestionCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      data-testid="question-card"
      className={cn(
        'cursor-pointer transition-all duration-300',
        'hover:border-primary/50 hover:shadow-md',
        isSelected && 'border-primary border-2 shadow-md'
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Seleccionar pregunta: ${question.questionText}`}
      aria-pressed={isSelected}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
            isSelected ? 'border-primary bg-primary' : 'border-gray-300'
          )}
        >
          {isSelected && (
            <Check data-testid="check-icon" className="h-4 w-4 text-white" aria-hidden="true" />
          )}
        </div>
        <span className="text-text-primary flex-1">{question.questionText}</span>
      </CardContent>
    </Card>
  );
}

/**
 * Props for QuestionSelector component
 */
export interface QuestionSelectorProps {
  /** Category ID from URL params */
  categoryId: string | null;
}

/**
 * QuestionSelector Component
 *
 * Protected component where users select a predefined question or write a custom one.
 * Premium users can write custom questions, free users can only select predefined ones.
 */
export function QuestionSelector({ categoryId }: QuestionSelectorProps) {
  const router = useRouter();
  const categoryIdNumber = categoryId ? Number(categoryId) : undefined;

  const { isLoading: isAuthLoading } = useRequireAuth();
  const { canUseCustomQuestions } = useUserPlanFeatures();
  const {
    data: questions,
    isLoading: isQuestionsLoading,
    error: questionsError,
    refetch,
  } = usePredefinedQuestions(categoryIdNumber);
  const { data: categories } = useCategories();

  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showPremiumMessage, setShowPremiumMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isLoading = isAuthLoading || isQuestionsLoading;
  const category = categories?.find((c) => c.id === categoryIdNumber);
  const hasCustomQuestion = customQuestion.trim().length > 0;

  const handleQuestionSelect = useCallback((questionId: number) => {
    setSelectedQuestionId(questionId);
    setCustomQuestion(''); // Clear custom question when selecting predefined
    setShowPremiumMessage(false);
  }, []);

  const handleCustomQuestionChange = useCallback((value: string) => {
    const trimmedValue = value.slice(0, MAX_CUSTOM_QUESTION_LENGTH);
    setCustomQuestion(trimmedValue);
    setSelectedQuestionId(null); // Clear selection when typing custom
    setShowPremiumMessage(false);
  }, []);

  const handleContinueWithPredefined = useCallback(() => {
    if (selectedQuestionId && categoryId) {
      router.push(`/ritual/tirada?categoryId=${categoryId}&questionId=${selectedQuestionId}`);
    }
  }, [selectedQuestionId, categoryId, router]);

  const handleUseCustomQuestion = useCallback(() => {
    if (!canUseCustomQuestions) {
      setShowUpgradeModal(true);
      return;
    }

    if (hasCustomQuestion && categoryId) {
      const encodedQuestion = encodeURIComponent(customQuestion.trim());
      router.push(`/ritual/tirada?categoryId=${categoryId}&customQuestion=${encodedQuestion}`);
    }
  }, [canUseCustomQuestions, hasCustomQuestion, categoryId, customQuestion, router]);

  const handleCustomQuestionClick = useCallback(() => {
    if (!canUseCustomQuestions) {
      setShowUpgradeModal(true);
    }
  }, [canUseCustomQuestions]);

  const handleBackToCategories = useCallback(() => {
    router.push('/ritual');
  }, [router]);

  // Handle missing categoryId
  if (!categoryId) {
    return (
      <div className="bg-bg-main min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <ErrorDisplay
            message="Selecciona una categoría primero."
            onRetry={handleBackToCategories}
          />
          <div className="mt-4 text-center">
            <Button onClick={handleBackToCategories}>Volver a categorías</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        {/* Breadcrumb */}
        <nav className="text-text-muted mb-6 flex items-center gap-2 text-sm">
          <Link href="/ritual" className="hover:text-primary transition-colors">
            Ritual
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-text-primary">{category?.name || 'Amor'}</span>
        </nav>

        {/* Title */}
        <h1 className="mb-8 text-center font-serif text-3xl md:text-4xl">Selecciona tu consulta</h1>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonQuestionCard key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && questionsError && (
          <ErrorDisplay
            message="Error al cargar las preguntas. Por favor, intenta de nuevo."
            onRetry={refetch}
          />
        )}

        {/* Empty State */}
        {!isLoading && !questionsError && questions?.length === 0 && (
          <EmptyState
            icon={<MessageCircle />}
            title="Sin preguntas"
            message="No hay preguntas disponibles para esta categoría."
            action={{
              label: 'Volver a categorías',
              onClick: handleBackToCategories,
            }}
          />
        )}

        {/* Questions List */}
        {!isLoading && !questionsError && questions && questions.length > 0 && (
          <>
            {/* Predefined Questions Section */}
            <section aria-labelledby="predefined-questions-title">
              <h2 id="predefined-questions-title" className="sr-only">
                Preguntas predefinidas
              </h2>
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isSelected={selectedQuestionId === question.id}
                    onClick={() => handleQuestionSelect(question.id)}
                  />
                ))}
              </div>

              {/* Continue Button */}
              <div className="mt-6">
                <Button
                  className="w-full"
                  disabled={!selectedQuestionId}
                  onClick={handleContinueWithPredefined}
                >
                  Continuar con esta pregunta
                </Button>
              </div>
            </section>

            {/* Separator */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-text-muted text-sm">O escribe tu propia pregunta</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            {/* Custom Question Section */}
            <section aria-labelledby="custom-question-title">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="custom-question-title" className="font-serif text-lg">
                  Pregunta personalizada
                </h2>
                {!canUseCustomQuestions ? (
                  <PremiumBadge variant="lock" />
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Premium
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div
                  data-testid="custom-question-wrapper"
                  className={cn(!canUseCustomQuestions && 'cursor-pointer')}
                  onClick={handleCustomQuestionClick}
                  role={!canUseCustomQuestions ? 'button' : undefined}
                  tabIndex={!canUseCustomQuestions ? 0 : undefined}
                >
                  <label htmlFor="custom-question" className="sr-only">
                    Escribe tu pregunta
                  </label>
                  <Textarea
                    id="custom-question"
                    placeholder={
                      canUseCustomQuestions
                        ? 'Escribe tu pregunta personalizada...'
                        : 'Pregunta personalizada (Solo Premium)'
                    }
                    value={customQuestion}
                    onChange={(e) => handleCustomQuestionChange(e.target.value)}
                    className="min-h-[120px] resize-none"
                    maxLength={MAX_CUSTOM_QUESTION_LENGTH}
                    aria-describedby="char-count"
                    disabled={!canUseCustomQuestions}
                  />
                  <div id="char-count" className="text-text-muted mt-2 text-right text-sm">
                    {customQuestion.length} / {MAX_CUSTOM_QUESTION_LENGTH}
                  </div>
                </div>

                {/* Premium Upgrade Message */}
                {showPremiumMessage && (
                  <div
                    className="border-secondary/50 bg-secondary/10 rounded-lg border p-4 text-center"
                    role="alert"
                  >
                    <p className="text-text-primary mb-2 font-medium">Actualiza a Premium</p>
                    <p className="text-text-muted text-sm">
                      Las preguntas personalizadas son exclusivas para usuarios Premium.
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={!hasCustomQuestion || !canUseCustomQuestions}
                  onClick={handleUseCustomQuestion}
                >
                  Usar mi pregunta
                </Button>
              </div>
            </section>
          </>
        )}

        {/* Upgrade Modal */}
        <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </div>
    </div>
  );
}
