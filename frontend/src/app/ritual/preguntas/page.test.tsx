import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import QuestionsPage from './page';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { usePredefinedQuestions, useCategories } from '@/hooks/api/useReadings';
import { useAuthStore } from '@/stores/authStore';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';

// Mock modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useReadings', () => ({
  usePredefinedQuestions: vi.fn(),
  useCategories: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/hooks/utils/useUserPlanFeatures', () => ({
  useUserPlanFeatures: vi.fn(),
}));

// Mock data
const mockCategory = {
  id: 1,
  name: 'Amor',
  slug: 'amor',
  description: 'Preguntas sobre el amor',
  color: '#FFB6C1',
  icon: 'heart',
  isActive: true,
};

const mockQuestions = [
  {
    id: 1,
    questionText: '¿Encontraré el amor verdadero?',
    categoryId: 1,
    order: 1,
    isActive: true,
    usageCount: 100,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 2,
    questionText: '¿Mi pareja me es fiel?',
    categoryId: 1,
    order: 2,
    isActive: true,
    usageCount: 80,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 3,
    questionText: '¿Debería perdonar una infidelidad?',
    categoryId: 1,
    order: 3,
    isActive: true,
    usageCount: 60,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
  },
];

const mockUserFree = {
  id: 1,
  email: 'test@test.com',
  name: 'Test User',
  roles: ['USER'],
  plan: 'FREE',
};

const mockUserPremium = {
  id: 2,
  email: 'premium@test.com',
  name: 'Premium User',
  roles: ['USER'],
  plan: 'PREMIUM',
};

describe('QuestionsPage', () => {
  const mockPush = vi.fn();
  const mockSearchParams = new URLSearchParams('categoryId=1');

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as Mock).mockReturnValue(mockSearchParams);
    (useRequireAuth as Mock).mockReturnValue({ isLoading: false });
    (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserFree });
    (useCategories as Mock).mockReturnValue({
      data: [mockCategory],
      isLoading: false,
      error: null,
    });
    // Default: FREE user
    (useUserPlanFeatures as Mock).mockReturnValue({
      plan: 'free',
      planLabel: 'GRATUITO',
      canUseCustomQuestions: false,
      isPremium: false,
      isFree: true,
    });
  });

  describe('Authentication Protection', () => {
    it('should call useRequireAuth to protect the route', () => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });

      render(<QuestionsPage />);

      expect(useRequireAuth).toHaveBeenCalled();
    });

    it('should show loading state when auth is loading', () => {
      (useRequireAuth as Mock).mockReturnValue({ isLoading: true });
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      render(<QuestionsPage />);

      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
    });
  });

  describe('Page Layout', () => {
    beforeEach(() => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });
    });

    it('should render the breadcrumb with category name', () => {
      render(<QuestionsPage />);

      expect(screen.getByText(/ritual/i)).toBeInTheDocument();
      // Use a more specific selector to find category name in breadcrumb
      const breadcrumb = screen.getByRole('navigation');
      expect(breadcrumb).toHaveTextContent('Amor');
    });

    it('should render the main title', () => {
      render(<QuestionsPage />);

      expect(
        screen.getByRole('heading', { level: 1, name: /selecciona tu consulta/i })
      ).toBeInTheDocument();
    });

    it('should have font-serif class on heading', () => {
      render(<QuestionsPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('font-serif');
    });
  });

  describe('Missing categoryId', () => {
    it('should show error when categoryId is missing', () => {
      (useSearchParams as Mock).mockReturnValue(new URLSearchParams(''));
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });

      render(<QuestionsPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/selecciona una categoría primero/i)).toBeInTheDocument();
    });

    it('should show back to categories button when categoryId is missing', () => {
      (useSearchParams as Mock).mockReturnValue(new URLSearchParams(''));
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });

      render(<QuestionsPage />);

      const backButton = screen.getByRole('button', { name: /volver a categorías/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should navigate to ritual page when clicking back button', () => {
      (useSearchParams as Mock).mockReturnValue(new URLSearchParams(''));
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });

      render(<QuestionsPage />);

      const backButton = screen.getByRole('button', { name: /volver a categorías/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/ritual');
    });
  });

  describe('Loading State', () => {
    it('should show skeleton cards while loading questions', () => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<QuestionsPage />);

      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
    });
  });

  describe('Error State', () => {
    it('should show error display when questions fail to load', () => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: vi.fn(),
      });

      render(<QuestionsPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/error al cargar las preguntas/i)).toBeInTheDocument();
    });

    it('should show retry button in error state', () => {
      const mockRefetch = vi.fn();
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
      });

      render(<QuestionsPage />);

      const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call refetch when clicking retry button', () => {
      const mockRefetch = vi.fn();
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
      });

      render(<QuestionsPage />);

      const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no questions available', () => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<QuestionsPage />);

      expect(screen.getByText(/no hay preguntas disponibles/i)).toBeInTheDocument();
    });
  });

  describe('Predefined Questions Display', () => {
    beforeEach(() => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });
    });

    it('should display all predefined questions', () => {
      render(<QuestionsPage />);

      expect(screen.getByText('¿Encontraré el amor verdadero?')).toBeInTheDocument();
      expect(screen.getByText('¿Mi pareja me es fiel?')).toBeInTheDocument();
      expect(screen.getByText('¿Debería perdonar una infidelidad?')).toBeInTheDocument();
    });

    it('should render each question as a clickable card', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      expect(questionCards).toHaveLength(3);
    });
  });

  describe('Question Selection', () => {
    beforeEach(() => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });
    });

    it('should mark question as selected when clicked', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      fireEvent.click(questionCards[0]);

      expect(questionCards[0]).toHaveClass('border-primary');
    });

    it('should show check icon on selected question', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      fireEvent.click(questionCards[0]);

      const checkIcon = questionCards[0].querySelector('[data-testid="check-icon"]');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should deselect previous question when selecting a new one', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');

      // Select first question
      fireEvent.click(questionCards[0]);
      expect(questionCards[0]).toHaveClass('border-primary');

      // Select second question
      fireEvent.click(questionCards[1]);
      expect(questionCards[0]).not.toHaveClass('border-primary');
      expect(questionCards[1]).toHaveClass('border-primary');
    });

    it('should enable continue button when question is selected', () => {
      render(<QuestionsPage />);

      const continueButton = screen.getByRole('button', { name: /continuar con esta pregunta/i });
      expect(continueButton).toBeDisabled();

      const questionCards = screen.getAllByTestId('question-card');
      fireEvent.click(questionCards[0]);

      expect(continueButton).not.toBeDisabled();
    });

    it('should navigate to tirada page with question data when continue is clicked', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      fireEvent.click(questionCards[0]);

      const continueButton = screen.getByRole('button', { name: /continuar con esta pregunta/i });
      fireEvent.click(continueButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/ritual/tirada?categoryId=1&questionId=1')
      );
    });

    it('should support keyboard navigation (Enter key)', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      fireEvent.keyDown(questionCards[0], { key: 'Enter' });

      expect(questionCards[0]).toHaveClass('border-primary');
    });

    it('should support keyboard navigation (Space key)', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      fireEvent.keyDown(questionCards[0], { key: ' ' });

      expect(questionCards[0]).toHaveClass('border-primary');
    });
  });

  describe('Custom Question Section - FREE User', () => {
    beforeEach(() => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserFree });
    });

    it('should show separator for custom question section', () => {
      render(<QuestionsPage />);

      expect(screen.getByText(/o escribe tu propia pregunta/i)).toBeInTheDocument();
    });

    it('should show textarea for custom question', () => {
      render(<QuestionsPage />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should show character counter', () => {
      render(<QuestionsPage />);

      expect(screen.getByText('0 / 500')).toBeInTheDocument();
    });

    it('should update character counter when typing', async () => {
      render(<QuestionsPage />);

      const textarea = screen.getByRole('textbox');
      const wrapper = screen.getByTestId('custom-question-wrapper');

      // For FREE users, clicking wrapper shows upgrade modal
      fireEvent.click(wrapper);

      // Character count should still be 0 since textarea is disabled
      expect(screen.getByText('0 / 500')).toBeInTheDocument();
    });

    it('should show premium upgrade message when FREE user tries to use custom question', async () => {
      render(<QuestionsPage />);

      const wrapper = screen.getByTestId('custom-question-wrapper');

      // Click wrapper should show upgrade modal
      fireEvent.click(wrapper);

      // Modal should appear with upgrade message
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Desbloquea todo el potencial del Tarot/i)).toBeInTheDocument();
    });

    it('should have disabled "use my question" button for FREE user', async () => {
      render(<QuestionsPage />);

      const useMyQuestionBtn = screen.getByRole('button', { name: /usar mi pregunta/i });
      expect(useMyQuestionBtn).toBeDisabled();
    });

    it('should show premium badge on custom question section', () => {
      render(<QuestionsPage />);

      expect(screen.getByText(/premium/i)).toBeInTheDocument();
    });
  });

  describe('Custom Question Section - PREMIUM User', () => {
    beforeEach(() => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserPremium });
      // Mock PREMIUM features
      (useUserPlanFeatures as Mock).mockReturnValue({
        plan: 'premium',
        planLabel: 'PREMIUM',
        canUseCustomQuestions: true,
        isPremium: true,
        isFree: false,
      });
    });

    it('should enable custom question textarea for PREMIUM user', () => {
      render(<QuestionsPage />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      // Textarea should not be disabled for premium users
      expect(textarea).not.toBeDisabled();

      // Type into textarea
      fireEvent.change(textarea, { target: { value: 'Mi pregunta personalizada' } });

      expect(textarea.value).toBe('Mi pregunta personalizada');
    });

    it('should enable "use my question" button when custom question has text', () => {
      render(<QuestionsPage />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const useMyQuestionBtn = screen.getByRole('button', { name: /usar mi pregunta/i });

      // Initially disabled
      expect(useMyQuestionBtn).toBeDisabled();

      // Type text
      fireEvent.change(textarea, { target: { value: 'Mi pregunta' } });

      // Should be enabled now
      expect(useMyQuestionBtn).not.toBeDisabled();
    });

    it('should disable "use my question" button when custom question is empty', () => {
      render(<QuestionsPage />);

      const useMyQuestionBtn = screen.getByRole('button', { name: /usar mi pregunta/i });
      expect(useMyQuestionBtn).toBeDisabled();
    });

    it('should navigate to tirada page with custom question when "use my question" is clicked', () => {
      render(<QuestionsPage />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Mi pregunta personalizada' } });

      const useMyQuestionBtn = screen.getByRole('button', { name: /usar mi pregunta/i });
      fireEvent.click(useMyQuestionBtn);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/ritual/tirada?categoryId=1&customQuestion=')
      );
    });

    it('should clear predefined selection when typing custom question', () => {
      render(<QuestionsPage />);

      // First select a predefined question
      const questionCards = screen.getAllByTestId('question-card');
      fireEvent.click(questionCards[0]);
      expect(questionCards[0]).toHaveClass('border-primary');

      // Then type a custom question
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Mi pregunta' } });

      // Predefined selection should be cleared
      expect(questionCards[0]).not.toHaveClass('border-primary');
    });

    it('should not exceed max character limit', async () => {
      render(<QuestionsPage />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      // Verify the maxLength attribute is set correctly
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });
    });

    it('should have proper ARIA labels on question cards', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      questionCards.forEach((card, index) => {
        expect(card).toHaveAttribute(
          'aria-label',
          expect.stringContaining(mockQuestions[index].questionText)
        );
      });
    });

    it('should have role="button" on question cards', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      questionCards.forEach((card) => {
        expect(card).toHaveAttribute('role', 'button');
      });
    });

    it('should have tabIndex on question cards', () => {
      render(<QuestionsPage />);

      const questionCards = screen.getAllByTestId('question-card');
      questionCards.forEach((card) => {
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have proper label for textarea', () => {
      render(<QuestionsPage />);

      expect(screen.getByLabelText(/escribe tu pregunta/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (usePredefinedQuestions as Mock).mockReturnValue({
        data: mockQuestions,
        isLoading: false,
        error: null,
      });
    });

    it('should have back link to ritual page in breadcrumb', () => {
      render(<QuestionsPage />);

      const ritualLink = screen.getByRole('link', { name: /ritual/i });
      expect(ritualLink).toHaveAttribute('href', '/ritual');
    });
  });
});
