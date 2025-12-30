import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { QuestionSelector } from './QuestionSelector';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { usePredefinedQuestions, useCategories } from '@/hooks/api/useReadings';
import { useAuthStore } from '@/stores/authStore';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';

// Mocks
vi.mock('next/navigation');
vi.mock('@/hooks/useRequireAuth');
vi.mock('@/hooks/api/useReadings');
vi.mock('@/stores/authStore');
vi.mock('@/hooks/utils/useUserPlanFeatures');

const mockPush = vi.fn();
const mockRefetch = vi.fn();

const mockQuestions = [
  { id: 1, questionText: '¿Cómo mejorar mi relación?', categoryId: 1 },
  { id: 2, questionText: '¿Qué me depara el futuro?', categoryId: 1 },
  { id: 3, questionText: '¿Debo confiar en esta persona?', categoryId: 1 },
];

const mockCategories = [{ id: 1, name: 'Amor', slug: 'amor', description: 'Preguntas de amor' }];

describe('QuestionSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });

    (useRequireAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
    });

    (usePredefinedQuestions as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    (useCategories as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
    });

    // Mock default: PREMIUM user (can use all features)
    (useUserPlanFeatures as ReturnType<typeof vi.fn>).mockReturnValue({
      canUseAI: true,
      canUseCategories: true,
      canUseCustomQuestions: true,
      canShare: true,
      isPremium: true,
      isFree: false,
      isAnonymous: false,
      dailyReadingsLimit: 3,
      plan: 'premium',
      planLabel: 'PREMIUM',
    });
  });

  describe('Premium Upsell Flow', () => {
    it('should show UpgradeModal when FREE user clicks on custom question textarea', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'free', email: 'test@test.com' },
      });

      (useUserPlanFeatures as ReturnType<typeof vi.fn>).mockReturnValue({
        canUseAI: false,
        canUseCategories: false,
        canUseCustomQuestions: false,
        canShare: true,
        isPremium: false,
        isFree: true,
        isAnonymous: false,
        dailyReadingsLimit: 2,
        plan: 'free',
        planLabel: 'GRATUITO',
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/pregunta personalizada \(solo premium\)/i);

      // Textarea should be disabled for FREE users
      expect(textarea).toBeDisabled();

      // Should show Premium badge with lock icon
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should show UpgradeModal when ANONYMOUS user clicks on custom question textarea', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'anonymous', email: 'test@test.com' },
      });

      (useUserPlanFeatures as ReturnType<typeof vi.fn>).mockReturnValue({
        canUseAI: false,
        canUseCategories: false,
        canUseCustomQuestions: false,
        canShare: false,
        isPremium: false,
        isFree: false,
        isAnonymous: true,
        dailyReadingsLimit: 1,
        plan: 'anonymous',
        planLabel: 'ANÓNIMO',
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/pregunta personalizada \(solo premium\)/i);

      // Textarea should be disabled for ANONYMOUS users
      expect(textarea).toBeDisabled();
    });

    it('should NOT disable textarea for PREMIUM users', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'premium', email: 'test@test.com' },
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/escribe tu pregunta/i);

      // Textarea should be enabled for PREMIUM users
      expect(textarea).not.toBeDisabled();
    });

    it('should show premium badge next to custom question section', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'free', email: 'test@test.com' },
      });

      (useUserPlanFeatures as ReturnType<typeof vi.fn>).mockReturnValue({
        canUseAI: false,
        canUseCategories: false,
        canUseCustomQuestions: false,
        canShare: true,
        isPremium: false,
        isFree: true,
        isAnonymous: false,
        dailyReadingsLimit: 2,
        plan: 'free',
        planLabel: 'GRATUITO',
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      // Should show PremiumBadge component with lock icon
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should open UpgradeModal when clicking disabled textarea wrapper', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'free', email: 'test@test.com' },
      });

      (useUserPlanFeatures as ReturnType<typeof vi.fn>).mockReturnValue({
        canUseAI: false,
        canUseCategories: false,
        canUseCustomQuestions: false,
        canShare: true,
        isPremium: false,
        isFree: true,
        isAnonymous: false,
        dailyReadingsLimit: 2,
        plan: 'free',
        planLabel: 'GRATUITO',
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      // Find the wrapper div and click it
      const wrapper = screen.getByTestId('custom-question-wrapper');
      fireEvent.click(wrapper);

      // Should show UpgradeModal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/desbloquea todo el potencial/i)).toBeInTheDocument();
      });
    });
  });

  describe('Existing Functionality (not broken)', () => {
    it('should render predefined questions', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'free', email: 'test@test.com' },
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      expect(screen.getByText('¿Cómo mejorar mi relación?')).toBeInTheDocument();
      expect(screen.getByText('¿Qué me depara el futuro?')).toBeInTheDocument();
      expect(screen.getByText('¿Debo confiar en esta persona?')).toBeInTheDocument();
    });

    it('should select a predefined question', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'free', email: 'test@test.com' },
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      const questionCard = screen
        .getByText('¿Cómo mejorar mi relación?')
        .closest('[role="button"]');
      fireEvent.click(questionCard!);

      // Check icon should appear
      await waitFor(() => {
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      });

      // Continue button should be enabled
      const continueButton = screen.getByText(/continuar con esta pregunta/i);
      expect(continueButton).not.toBeDisabled();
    });

    it('should navigate with predefined question', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'free', email: 'test@test.com' },
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      // Select question
      const questionCard = screen
        .getByText('¿Cómo mejorar mi relación?')
        .closest('[role="button"]');
      fireEvent.click(questionCard!);

      await waitFor(() => {
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      });

      // Click continue
      const continueButton = screen.getByText(/continuar con esta pregunta/i);
      fireEvent.click(continueButton);

      // Should navigate to tirada with questionId
      expect(mockPush).toHaveBeenCalledWith('/ritual/tirada?categoryId=1&questionId=1');
    });

    it('should allow PREMIUM users to type custom question', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'premium', email: 'test@test.com' },
      });

      render(<QuestionSelector categoryId="1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/escribe tu pregunta/i);
      fireEvent.change(textarea, { target: { value: 'Mi pregunta personalizada' } });

      expect(textarea).toHaveValue('Mi pregunta personalizada');

      // Use custom question button should be enabled
      const useButton = screen.getByText(/usar mi pregunta/i);
      expect(useButton).not.toBeDisabled();
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading skeletons', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'free', email: 'test@test.com' },
      });

      (usePredefinedQuestions as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<QuestionSelector categoryId="1" />);

      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
    });

    it('should show error state with retry', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 1, plan: 'free', email: 'test@test.com' },
      });

      (usePredefinedQuestions as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      });

      render(<QuestionSelector categoryId="1" />);

      expect(screen.getByText(/error al cargar las preguntas/i)).toBeInTheDocument();
    });
  });
});
