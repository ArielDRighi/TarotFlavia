import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumerologiaPage from './page';
import { useAuthStore } from '@/stores/authStore';
import {
  useCalculateNumerology,
  useMyNumerologyProfile,
  useMyNumerologyInterpretation,
  useGenerateInterpretation,
} from '@/hooks/api/useNumerology';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { AuthStore } from '@/types';
import type {
  CalculateNumerologyRequest,
  NumerologyResponseDto,
  NumerologyInterpretationResponseDto,
} from '@/types/numerology.types';

// Mock modules
vi.mock('@/stores/authStore');
vi.mock('@/hooks/api/useNumerology');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('NumerologiaPage', () => {
  const mockMutate = vi.fn();
  const mockGenerateInterpretation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
    } as AuthStore);

    vi.mocked(useCalculateNumerology).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as UseMutationResult<
      NumerologyResponseDto,
      Error,
      CalculateNumerologyRequest,
      unknown
    >);

    vi.mocked(useMyNumerologyProfile).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<NumerologyResponseDto, Error>);

    vi.mocked(useMyNumerologyInterpretation).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<NumerologyInterpretationResponseDto | null, Error>);

    vi.mocked(useGenerateInterpretation).mockReturnValue({
      mutate: mockGenerateInterpretation,
      isPending: false,
    } as unknown as UseMutationResult<NumerologyInterpretationResponseDto, Error, void, unknown>);
  });

  describe('Rendering', () => {
    it('should render the page title and description', () => {
      render(<NumerologiaPage />);

      expect(screen.getByText('Numerología')).toBeInTheDocument();
      expect(screen.getByText('Descubre los números que rigen tu vida')).toBeInTheDocument();
    });

    it('should render NumerologyIntro component', () => {
      render(<NumerologiaPage />);

      expect(screen.getByText('¿Qué es la Numerología?')).toBeInTheDocument();
    });

    it('should render the calculator form', () => {
      render(<NumerologiaPage />);

      expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /calcular números/i })).toBeInTheDocument();
    });

    it('should show registration CTA for anonymous users', () => {
      render(<NumerologiaPage />);

      expect(screen.getByText(/regístrate/i)).toBeInTheDocument();
      expect(screen.getByText(/para guardar tus resultados/i)).toBeInTheDocument();
    });

    it('should not show registration CTA for authenticated users', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: 1, name: 'Test User', birthDate: '1990-01-01' },
        isAuthenticated: true,
      } as AuthStore);

      render(<NumerologiaPage />);

      expect(screen.queryByText(/regístrate/i)).not.toBeInTheDocument();
    });
  });

  describe('Form pre-fill for authenticated users', () => {
    it('should NOT pre-fill birth date (calculator is for third parties)', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: 1, name: 'Test User', birthDate: '1990-01-01T00:00:00.000Z' },
        isAuthenticated: true,
      } as AuthStore);

      render(<NumerologiaPage />);

      const dateInput = screen.getByLabelText(/fecha de nacimiento/i) as HTMLInputElement;
      expect(dateInput.value).toBe('');
    });

    it('should NOT pre-fill full name (calculator is for third parties)', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: 1, name: 'Juan Pérez', birthDate: '1990-01-01' },
        isAuthenticated: true,
      } as AuthStore);

      render(<NumerologiaPage />);

      const nameInput = screen.getByLabelText(/nombre completo/i) as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });
  });

  describe('Form validation', () => {
    it('should disable button when birth date is empty', () => {
      render(<NumerologiaPage />);

      const button = screen.getByRole('button', { name: /calcular números/i });
      expect(button).toBeDisabled();
    });

    it('should enable button when birth date is provided', async () => {
      const user = userEvent.setup();
      render(<NumerologiaPage />);

      const dateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(dateInput, '1990-01-15');

      const button = screen.getByRole('button', { name: /calcular números/i });
      expect(button).not.toBeDisabled();
    });

    it('should disable button while calculation is pending', () => {
      vi.mocked(useCalculateNumerology).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      } as unknown as UseMutationResult<
        NumerologyResponseDto,
        Error,
        CalculateNumerologyRequest,
        unknown
      >);

      render(<NumerologiaPage />);

      const button = screen.getByRole('button', { name: /calculando/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Form submission', () => {
    it('should call mutate with birth date only when name is empty', async () => {
      const user = userEvent.setup();
      render(<NumerologiaPage />);

      const dateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(dateInput, '1990-01-15');

      const button = screen.getByRole('button', { name: /calcular números/i });
      await user.click(button);

      expect(mockMutate).toHaveBeenCalledWith(
        { birthDate: '1990-01-15', fullName: undefined },
        expect.any(Object)
      );
    });

    it('should call mutate with birth date and full name when both provided', async () => {
      const user = userEvent.setup();
      render(<NumerologiaPage />);

      const dateInput = screen.getByLabelText(/fecha de nacimiento/i);
      const nameInput = screen.getByLabelText(/nombre completo/i);

      await user.type(dateInput, '1990-01-15');
      await user.type(nameInput, 'Juan Pérez');

      const button = screen.getByRole('button', { name: /calcular números/i });
      await user.click(button);

      expect(mockMutate).toHaveBeenCalledWith(
        { birthDate: '1990-01-15', fullName: 'Juan Pérez' },
        expect.any(Object)
      );
    });

    it('should navigate to result page on success', async () => {
      const mockRouterPush = vi.fn();
      const mockResult = {
        lifePath: { value: 7, name: 'El Buscador', keywords: [], description: '', isMaster: false },
        birthday: {
          value: 6,
          name: 'El Protector',
          keywords: [],
          description: '',
          isMaster: false,
        },
        expression: null,
        soulUrge: null,
        personality: null,
        personalYear: 5,
        personalMonth: 8,
        birthDate: '1990-01-15',
        fullName: null,
      };

      vi.mocked(useCalculateNumerology).mockReturnValue({
        mutate: (
          data: CalculateNumerologyRequest,
          options: { onSuccess: (result: NumerologyResponseDto) => void }
        ) => {
          options.onSuccess(mockResult);
        },
        isPending: false,
      } as unknown as UseMutationResult<
        NumerologyResponseDto,
        Error,
        CalculateNumerologyRequest,
        unknown
      >);

      vi.doMock('next/navigation', () => ({
        useRouter: () => ({
          push: mockRouterPush,
        }),
      }));

      const user = userEvent.setup();
      render(<NumerologiaPage />);

      const dateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(dateInput, '1990-01-15');

      const button = screen.getByRole('button', { name: /calcular números/i });
      await user.click(button);

      await waitFor(() => {
        expect(sessionStorage.getItem('numerologyResult')).toBe(JSON.stringify(mockResult));
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<NumerologiaPage />);

      expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    });

    it('should have required indicator on birth date field', () => {
      render(<NumerologiaPage />);

      const label = screen.getByText(/fecha de nacimiento \*/i);
      expect(label).toBeInTheDocument();
    });
  });
});
