import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ExplorarPage from './page';
import type { Tarotista } from '@/types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock useTarotistas hook
vi.mock('@/hooks/api/useTarotistas', () => ({
  useTarotistas: vi.fn(),
}));

const mockTarotistas: Tarotista[] = [
  {
    id: 1,
    nombrePublico: 'Luna Mística',
    bio: 'Experta en lecturas de amor con más de 10 años de experiencia',
    especialidades: ['Amor', 'Espiritual'],
    fotoPerfil: 'https://example.com/photo1.jpg',
    ratingPromedio: 4.8,
    totalLecturas: 150,
    totalReviews: 80,
    añosExperiencia: 10,
    idiomas: ['Español', 'Inglés'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    nombrePublico: 'Sol Radiante',
    bio: 'Especialista en temas de dinero y carrera profesional',
    especialidades: ['Dinero', 'Carrera'],
    fotoPerfil: 'https://example.com/photo2.jpg',
    ratingPromedio: 4.5,
    totalLecturas: 120,
    totalReviews: 60,
    añosExperiencia: 8,
    idiomas: ['Español'],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 3,
    nombrePublico: 'Estrella Guía',
    bio: 'Guía espiritual con amplia experiencia en salud y bienestar',
    especialidades: ['Salud', 'Espiritual'],
    fotoPerfil: 'https://example.com/photo3.jpg',
    ratingPromedio: 4.9,
    totalLecturas: 200,
    totalReviews: 100,
    añosExperiencia: 15,
    idiomas: ['Español', 'Portugués'],
    createdAt: '2023-12-01T00:00:00Z',
  },
];

// Helper to create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

// Wrapper component with providers
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('ExplorarPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Header Section', () => {
    it('should display main title "Nuestros Guías Espirituales"', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      expect(screen.getByText('Nuestros Guías Espirituales')).toBeInTheDocument();
    });

    it('should display subtitle "Encuentra al mentor ideal para tu camino"', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      expect(screen.getByText('Encuentra al mentor ideal para tu camino')).toBeInTheDocument();
    });

    it('should use font-serif for main title', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      const title = screen.getByText('Nuestros Guías Espirituales');
      expect(title.className).toContain('font-serif');
    });
  });

  describe('Filters Section', () => {
    it('should display search input with placeholder', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should display all specialty filter chips', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      const filterButtons = screen.getAllByRole('button');
      const filterTexts = filterButtons.map((btn) => btn.textContent);

      expect(filterTexts).toContain('Todos');
      expect(filterTexts).toContain('Amor');
      expect(filterTexts).toContain('Dinero');
      expect(filterTexts).toContain('Carrera');
      expect(filterTexts).toContain('Salud');
      expect(filterTexts).toContain('Espiritual');
    });

    it('should highlight "Todos" chip as selected by default', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      const todosChip = screen.getByText('Todos');
      expect(todosChip.className).toContain('bg-primary');
    });

    it('should change selected chip when clicking on specialty', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      const filterButtons = screen.getAllByRole('button');
      const amorChip = filterButtons.find((btn) => btn.textContent === 'Amor');

      if (!amorChip) throw new Error('Amor chip not found');

      fireEvent.click(amorChip);

      await waitFor(() => {
        expect(amorChip.className).toContain('bg-primary');
      });
    });
  });

  describe('Tarotistas Grid', () => {
    it('should display loading skeletons while fetching data', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      const skeletons = screen.getAllByTestId('skeleton-tarotist-photo');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display tarotista cards after loading', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      await waitFor(() => {
        expect(screen.getByText('Luna Mística')).toBeInTheDocument();
        expect(screen.getByText('Sol Radiante')).toBeInTheDocument();
        expect(screen.getByText('Estrella Guía')).toBeInTheDocument();
      });
    });

    it('should use responsive grid layout', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      const { container } = renderWithProviders(<ExplorarPage />);

      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-1');
      expect(grid?.className).toContain('md:grid-cols-2');
      expect(grid?.className).toContain('lg:grid-cols-3');
    });

    it('should navigate to tarotista detail page when clicking on card', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      await waitFor(() => {
        const verPerfilButtons = screen.getAllByText('Ver Perfil');
        fireEvent.click(verPerfilButtons[0]);

        expect(mockPush).toHaveBeenCalledWith('/tarotistas/1');
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no tarotistas match filters', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      await waitFor(() => {
        expect(screen.getByText('No encontramos guías con ese criterio')).toBeInTheDocument();
      });
    });

    it('should display "Limpiar filtros" button in empty state', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      await waitFor(() => {
        expect(screen.getByText('Limpiar filtros')).toBeInTheDocument();
      });
    });

    it('should clear filters when clicking "Limpiar filtros" button', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      (useTarotistas as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExplorarPage />);

      await waitFor(() => {
        const clearButton = screen.getByText('Limpiar filtros');
        fireEvent.click(clearButton);

        // Should reset to "Todos" specialty
        const todosChip = screen.getByText('Todos');
        expect(todosChip.className).toContain('bg-primary');
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter tarotistas by search term (debounced)', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      const mockUseTarotistas = vi.fn().mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      (useTarotistas as ReturnType<typeof vi.fn>).mockImplementation(mockUseTarotistas);

      renderWithProviders(<ExplorarPage />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      fireEvent.change(searchInput, { target: { value: 'Luna' } });

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(mockUseTarotistas).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'Luna' })
          );
        },
        { timeout: 500 }
      );
    });
  });

  describe('Specialty Filter Functionality', () => {
    it('should filter tarotistas by selected specialty', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      const mockUseTarotistas = vi.fn().mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      (useTarotistas as ReturnType<typeof vi.fn>).mockImplementation(mockUseTarotistas);

      renderWithProviders(<ExplorarPage />);

      const filterButtons = screen.getAllByRole('button');
      const amorChip = filterButtons.find((btn) => btn.textContent === 'Amor');

      if (!amorChip) throw new Error('Amor chip not found');

      fireEvent.click(amorChip);

      await waitFor(() => {
        expect(mockUseTarotistas).toHaveBeenCalledWith(
          expect.objectContaining({ especialidad: 'Amor' })
        );
      });
    });

    it('should show all tarotistas when "Todos" is selected', async () => {
      const { useTarotistas } = await import('@/hooks/api/useTarotistas');
      const mockUseTarotistas = vi.fn().mockReturnValue({
        data: { data: mockTarotistas, total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      (useTarotistas as ReturnType<typeof vi.fn>).mockImplementation(mockUseTarotistas);

      renderWithProviders(<ExplorarPage />);

      // Select a specialty first
      const filterButtons = screen.getAllByRole('button');
      const amorChip = filterButtons.find((btn) => btn.textContent === 'Amor');

      if (!amorChip) throw new Error('Amor chip not found');

      fireEvent.click(amorChip);

      await waitFor(() => {
        expect(mockUseTarotistas).toHaveBeenCalledWith(
          expect.objectContaining({ especialidad: 'Amor' })
        );
      });

      // Then click "Todos"
      const todosChip = filterButtons.find((btn) => btn.textContent === 'Todos');

      if (!todosChip) throw new Error('Todos chip not found');

      fireEvent.click(todosChip);

      await waitFor(() => {
        expect(mockUseTarotistas).toHaveBeenCalledWith(expect.objectContaining({}));
      });
    });
  });
});
