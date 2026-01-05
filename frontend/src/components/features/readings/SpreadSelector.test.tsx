import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import { SpreadSelector } from './SpreadSelector';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useMyAvailableSpreads } from '@/hooks/api/useReadings';
import { useAuthStore } from '@/stores/authStore';

// Mock modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useReadings', () => ({
  useMyAvailableSpreads: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock data
const mockSpreads = [
  {
    id: 1,
    name: 'Respuesta Rápida',
    description: 'Una carta para una respuesta directa',
    cardCount: 1,
    positions: [{ position: 1, name: 'Respuesta', description: 'Tu respuesta' }],
    difficulty: 'beginner',
  },
  {
    id: 2,
    name: 'Pasado-Presente-Futuro',
    description: 'Tres cartas que revelan la evolución de tu situación',
    cardCount: 3,
    positions: [
      { position: 1, name: 'Pasado', description: 'Lo que fue' },
      { position: 2, name: 'Presente', description: 'Lo que es' },
      { position: 3, name: 'Futuro', description: 'Lo que será' },
    ],
    difficulty: 'beginner',
  },
  {
    id: 3,
    name: 'Análisis Profundo',
    description: 'Cinco cartas para un análisis detallado',
    cardCount: 5,
    positions: [
      { position: 1, name: 'Situación', description: 'Estado actual' },
      { position: 2, name: 'Desafío', description: 'Obstáculos' },
      { position: 3, name: 'Base', description: 'Fundamentos' },
      { position: 4, name: 'Pasado', description: 'Influencias' },
      { position: 5, name: 'Futuro', description: 'Resultado' },
    ],
    difficulty: 'intermediate',
  },
  {
    id: 4,
    name: 'Cruz Céltica',
    description: 'Diez cartas para la lectura más completa',
    cardCount: 10,
    positions: Array.from({ length: 10 }, (_, i) => ({
      position: i + 1,
      name: `Posición ${i + 1}`,
      description: `Descripción ${i + 1}`,
    })),
    difficulty: 'advanced',
  },
];

const mockUserFree = {
  id: 1,
  email: 'test@test.com',
  name: 'Test User',
  roles: ['USER'],
  plan: 'FREE',
  dailyReadingsCount: 0,
  dailyReadingsLimit: 3,
};

const mockUserAtLimit = {
  id: 1,
  email: 'test@test.com',
  name: 'Test User',
  roles: ['USER'],
  plan: 'FREE',
  dailyReadingsCount: 3,
  dailyReadingsLimit: 3,
};

const mockUserPremium = {
  id: 2,
  email: 'premium@test.com',
  name: 'Premium User',
  roles: ['USER'],
  plan: 'PREMIUM',
  dailyReadingsCount: 0,
  dailyReadingsLimit: 999,
};

describe('SpreadSelector', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (useRequireAuth as Mock).mockReturnValue({ isLoading: false });
    (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserFree });
  });

  describe('Authentication Protection', () => {
    it('should call useRequireAuth to protect the route', () => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: mockSpreads,
        isLoading: false,
        error: null,
      });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(useRequireAuth).toHaveBeenCalled();
    });

    it('should show loading state when auth is loading', () => {
      (useRequireAuth as Mock).mockReturnValue({ isLoading: true });
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getAllByTestId('skeleton-spread-card')).toHaveLength(4);
    });
  });

  describe('Page Layout', () => {
    beforeEach(() => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: mockSpreads,
        isLoading: false,
        error: null,
      });
    });

    it('should render the breadcrumb with question link for PREMIUM users', () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserPremium });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getByText(/ritual/i)).toBeInTheDocument();
      expect(screen.getByText(/pregunta/i)).toBeInTheDocument();
      expect(screen.getByText(/tipo de tirada/i)).toBeInTheDocument();
    });

    it('should render the breadcrumb WITHOUT question link for FREE users', () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserFree });

      render(<SpreadSelector categoryId={null} questionId={null} customQuestion={null} />);

      expect(screen.getByText(/ritual/i)).toBeInTheDocument();
      expect(screen.queryByText(/pregunta/i)).not.toBeInTheDocument();
      expect(screen.getByText(/tipo de tirada/i)).toBeInTheDocument();
    });

    it('should render the main title', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(
        screen.getByRole('heading', { level: 1, name: /elige tu tipo de consulta/i })
      ).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeletons when spreads are loading', () => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getAllByTestId('skeleton-spread-card')).toHaveLength(4);
    });
  });

  describe('Error State', () => {
    it('should show error message when spreads fail to load', () => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
        refetch: vi.fn(),
      });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getByText(/error al cargar/i)).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      const mockRefetch = vi.fn();
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
        refetch: mockRefetch,
      });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
      fireEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Spread Cards Display', () => {
    beforeEach(() => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: mockSpreads,
        isLoading: false,
        error: null,
      });
    });

    it('should render all spread cards', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getByText('Respuesta Rápida')).toBeInTheDocument();
      expect(screen.getByText('Pasado-Presente-Futuro')).toBeInTheDocument();
      expect(screen.getByText('Análisis Profundo')).toBeInTheDocument();
      expect(screen.getByText('Cruz Céltica')).toBeInTheDocument();
    });

    it('should display card count for each spread', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getByText(/1 carta/i)).toBeInTheDocument();
      expect(screen.getByText(/3 cartas/i)).toBeInTheDocument();
      expect(screen.getByText(/5 cartas/i)).toBeInTheDocument();
      expect(screen.getByText(/10 cartas/i)).toBeInTheDocument();
    });

    it('should display difficulty badges', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getAllByText(/principiante/i)).toHaveLength(2);
      expect(screen.getByText(/intermedio/i)).toBeInTheDocument();
      expect(screen.getByText(/avanzado/i)).toBeInTheDocument();
    });

    it('should display spread descriptions', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getByText(/una carta para una respuesta directa/i)).toBeInTheDocument();
      expect(screen.getByText(/tres cartas que revelan/i)).toBeInTheDocument();
    });

    it('should display estimated reading time', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      expect(screen.getByText(/~2 min/i)).toBeInTheDocument();
      expect(screen.getByText(/~5 min/i)).toBeInTheDocument();
      expect(screen.getByText(/~10 min/i)).toBeInTheDocument();
      expect(screen.getByText(/~20 min/i)).toBeInTheDocument();
    });
  });

  describe('Spread Selection', () => {
    beforeEach(() => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: mockSpreads,
        isLoading: false,
        error: null,
      });
    });

    it('should have a select button for each spread', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      expect(selectButtons).toHaveLength(4);
    });

    it('should navigate to reading page when PREMIUM user selects spread with questionId', async () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserPremium });

      render(<SpreadSelector categoryId="1" questionId="5" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      fireEvent.click(selectButtons[0]); // Select first spread (id: 1)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          '/ritual/lectura?spreadId=1&categoryId=1&questionId=5'
        );
      });
    });

    it('should navigate with customQuestion when PREMIUM user provides it', async () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserPremium });

      render(
        <SpreadSelector
          categoryId="1"
          questionId={null}
          customQuestion="Mi pregunta personalizada"
        />
      );

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      fireEvent.click(selectButtons[1]); // Select second spread (id: 2)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          '/ritual/lectura?spreadId=2&categoryId=1&customQuestion=Mi%20pregunta%20personalizada'
        );
      });
    });

    it('should navigate with categoryId, questionId AND spreadId for PREMIUM users', async () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserPremium });

      render(<SpreadSelector categoryId="3" questionId="7" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      fireEvent.click(selectButtons[0]); // Select first spread (id: 1)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          '/ritual/lectura?spreadId=1&categoryId=3&questionId=7'
        );
      });
    });

    it('should navigate WITHOUT categoryId or questionId for FREE users even if they exist in props', async () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserFree });

      // Edge case: FREE user downgraded from PREMIUM, props still have old values
      render(<SpreadSelector categoryId="1" questionId="5" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      fireEvent.click(selectButtons[0]); // Select first spread (id: 1)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/ritual/lectura?spreadId=1');
      });

      // Should NOT include categoryId or questionId
      expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('categoryId'));
      expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('questionId'));
    });
  });

  describe('Daily Limit Validation', () => {
    beforeEach(() => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: mockSpreads,
        isLoading: false,
        error: null,
      });
    });

    it('should show limit modal when user has reached daily limit', async () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserAtLimit });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      fireEvent.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/has alcanzado tu límite/i)).toBeInTheDocument();
      });
    });

    it('should show upgrade to premium message in limit modal', async () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserAtLimit });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      fireEvent.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actualiza a premium/i })).toBeInTheDocument();
      });
    });

    it('should allow navigation for premium users regardless of count', async () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserPremium });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      fireEvent.click(selectButtons[0]);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(screen.queryByText(/has alcanzado tu límite/i)).not.toBeInTheDocument();
    });

    it('should close limit modal when clicking close button', async () => {
      (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserAtLimit });

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
      fireEvent.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/has alcanzado tu límite/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /cerrar|entendido/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/has alcanzado tu límite/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Missing Parameters', () => {
    beforeEach(() => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: mockSpreads,
        isLoading: false,
        error: null,
      });
    });

    describe('PREMIUM User Flow', () => {
      beforeEach(() => {
        (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserPremium });
      });

      it('should show error when PREMIUM user has no question', () => {
        render(<SpreadSelector categoryId="1" questionId={null} customQuestion={null} />);

        expect(screen.getByText(/selecciona una pregunta primero/i)).toBeInTheDocument();
      });

      it('should show back button to questions page', () => {
        render(<SpreadSelector categoryId="1" questionId={null} customQuestion={null} />);

        expect(screen.getByRole('button', { name: /volver a preguntas/i })).toBeInTheDocument();
      });

      it('should navigate back to questions page when back button is clicked', () => {
        render(<SpreadSelector categoryId="1" questionId={null} customQuestion={null} />);

        const backButton = screen.getByRole('button', { name: /volver a preguntas/i });
        fireEvent.click(backButton);

        expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=1');
      });

      it('should navigate to questions without categoryId when categoryId is null', () => {
        render(<SpreadSelector categoryId={null} questionId={null} customQuestion={null} />);

        const backButton = screen.getByRole('button', { name: /volver a preguntas/i });
        fireEvent.click(backButton);

        expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas');
      });
    });

    describe('FREE User Flow', () => {
      beforeEach(() => {
        (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUserFree });
      });

      it('should NOT show error when FREE user has no question', () => {
        render(<SpreadSelector categoryId={null} questionId={null} customQuestion={null} />);

        // FREE users should see spreads, not error message
        expect(screen.queryByText(/selecciona una pregunta primero/i)).not.toBeInTheDocument();
        expect(screen.getByText('Respuesta Rápida')).toBeInTheDocument();
      });

      it('should show spreads when FREE user has no question or category', () => {
        render(<SpreadSelector categoryId={null} questionId={null} customQuestion={null} />);

        expect(screen.getByTestId('spreads-grid')).toBeInTheDocument();
        const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
        expect(selectButtons.length).toBeGreaterThan(0);
      });

      it('should navigate to reading WITHOUT categoryId or questionId for FREE users', async () => {
        render(<SpreadSelector categoryId={null} questionId={null} customQuestion={null} />);

        const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });
        fireEvent.click(selectButtons[0]); // Select first spread (id: 1)

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/ritual/lectura?spreadId=1');
        });

        // Should NOT include categoryId or questionId
        expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('categoryId'));
        expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('questionId'));
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: mockSpreads,
        isLoading: false,
        error: null,
      });
    });

    it('should have accessible spread cards with proper labels', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const cards = screen.getAllByTestId('spread-card');
      expect(cards).toHaveLength(4);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const selectButtons = screen.getAllByRole('button', { name: /seleccionar/i });

      // Tab to first button and press Enter
      await user.tab();
      await user.tab();
      await user.tab(); // Navigate through breadcrumb links first

      // The buttons should be focusable
      expect(selectButtons[0]).toBeEnabled();
    });
  });

  describe('Responsive Grid', () => {
    beforeEach(() => {
      (useMyAvailableSpreads as Mock).mockReturnValue({
        data: mockSpreads,
        isLoading: false,
        error: null,
      });
    });

    it('should render spreads in a grid container', () => {
      render(<SpreadSelector categoryId="1" questionId="1" customQuestion={null} />);

      const grid = screen.getByTestId('spreads-grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid');
    });
  });
});
