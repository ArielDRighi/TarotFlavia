import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import RitualPage from './page';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCategories } from '@/hooks/api/useReadings';

// Mock modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useReadings', () => ({
  useCategories: vi.fn(),
}));

// Mock categories data
const mockCategories = [
  {
    id: 1,
    name: 'Amor',
    slug: 'amor',
    description: 'Preguntas sobre el amor',
    color: '#FFB6C1',
    icon: 'heart',
    isActive: true,
  },
  {
    id: 2,
    name: 'Carrera',
    slug: 'carrera',
    description: 'Preguntas sobre carrera',
    color: '#ADD8E6',
    icon: 'briefcase',
    isActive: true,
  },
  {
    id: 3,
    name: 'Dinero',
    slug: 'dinero',
    description: 'Preguntas sobre dinero',
    color: '#90EE90',
    icon: 'dollar-sign',
    isActive: true,
  },
  {
    id: 4,
    name: 'Salud',
    slug: 'salud',
    description: 'Preguntas sobre salud',
    color: '#FFD700',
    icon: 'activity',
    isActive: true,
  },
  {
    id: 5,
    name: 'Espiritual',
    slug: 'espiritual',
    description: 'Preguntas espirituales',
    color: '#DDA0DD',
    icon: 'sparkles',
    isActive: true,
  },
  {
    id: 6,
    name: 'General',
    slug: 'general',
    description: 'Preguntas generales',
    color: '#FFFFE0',
    icon: 'star',
    isActive: true,
  },
];

describe('RitualPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (useRequireAuth as Mock).mockReturnValue({ isLoading: false });
  });

  describe('Authentication Protection', () => {
    it('should call useRequireAuth to protect the route', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(useRequireAuth).toHaveBeenCalled();
    });

    it('should show loading state when auth is loading', () => {
      (useRequireAuth as Mock).mockReturnValue({ isLoading: true });
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(6);
    });
  });

  describe('Page Layout', () => {
    it('should render the main title with correct text', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(
        screen.getByRole('heading', { level: 1, name: /¿qué inquieta tu alma hoy\?/i })
      ).toBeInTheDocument();
    });

    it('should have font-serif class on heading', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('font-serif');
    });

    it('should have min-h-screen class on container', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      const { container } = render(<RitualPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen');
    });

    it('should have bg-bg-main class on container', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      const { container } = render(<RitualPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-bg-main');
    });
  });

  describe('Loading State', () => {
    it('should show skeleton cards while loading categories', () => {
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<RitualPage />);

      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(6);
    });
  });

  describe('Error State', () => {
    it('should show error display when categories fail to load', () => {
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: vi.fn(),
      });

      render(<RitualPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/error al cargar las categorías/i)).toBeInTheDocument();
    });

    it('should show retry button in error state', () => {
      const mockRefetch = vi.fn();
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
      });

      render(<RitualPage />);

      const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no categories exist', () => {
      (useCategories as Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument();
    });
  });

  describe('Categories Display', () => {
    it('should render all category cards', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(screen.getByText('Amor')).toBeInTheDocument();
      expect(screen.getByText('Carrera')).toBeInTheDocument();
      expect(screen.getByText('Dinero')).toBeInTheDocument();
      expect(screen.getByText('Salud')).toBeInTheDocument();
      expect(screen.getByText('Espiritual')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('should display category icons', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      // Check that icon containers exist for each category
      const categoryCards = screen.getAllByTestId('category-card');
      expect(categoryCards).toHaveLength(6);
    });

    it('should have responsive grid layout classes', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const grid = screen.getByTestId('categories-grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Navigation', () => {
    it('should navigate to questions page when category is clicked', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const amorCard = screen.getByText('Amor').closest('[data-testid="category-card"]');
      expect(amorCard).toBeInTheDocument();

      fireEvent.click(amorCard!);

      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=1');
    });

    it('should navigate with correct categoryId for each category', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const carreraCard = screen.getByText('Carrera').closest('[data-testid="category-card"]');
      fireEvent.click(carreraCard!);

      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=2');
    });
  });

  describe('Hover Effects', () => {
    it('should have hover scale effect class on category cards', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const categoryCards = screen.getAllByTestId('category-card');
      categoryCards.forEach((card) => {
        expect(card).toHaveClass('hover:scale-105');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible card buttons', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const categoryCards = screen.getAllByTestId('category-card');
      categoryCards.forEach((card) => {
        expect(card).toHaveAttribute('role', 'button');
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should be keyboard navigable', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const amorCard = screen.getByText('Amor').closest('[data-testid="category-card"]');

      fireEvent.keyDown(amorCard!, { key: 'Enter' });

      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=1');
    });
  });
});
