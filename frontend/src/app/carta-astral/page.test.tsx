/**
 * Tests for Birth Chart Main Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BirthChartPage from './page';
import { useAuthStore } from '@/stores/authStore';
import {
  useGenerateChart,
  useGenerateChartAnonymous,
  useCanGenerateChart,
} from '@/hooks/api/useBirthChart';
import type { UseMutationResult } from '@tanstack/react-query';
import type { AuthStore } from '@/types';
import type { ChartResponse, GenerateChartRequest } from '@/types/birth-chart-api.types';

// Mock modules
vi.mock('@/stores/authStore');
vi.mock('@/hooks/api/useBirthChart');
vi.mock('@/stores/birthChartStore', () => ({
  useBirthChartStore: () => ({
    setFormData: vi.fn(),
    setChartResult: vi.fn(),
    reset: vi.fn(),
  }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => {
    const authStore = useAuthStore();
    return {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
    };
  },
}));

// Mock BirthDataForm component (simplificado para tests)
vi.mock('@/components/features/birth-chart/BirthDataForm/BirthDataForm', () => ({
  BirthDataForm: ({
    onSubmit,
    isLoading,
    disabled,
  }: {
    onSubmit: () => void;
    isLoading: boolean;
    disabled: boolean;
  }) => (
    <div data-testid="birth-data-form">
      <button onClick={onSubmit} disabled={isLoading || disabled} data-testid="submit-button">
        {isLoading ? 'Generando...' : 'Generar Carta'}
      </button>
    </div>
  ),
}));

describe('BirthChartPage', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks for anonymous user
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
    } as AuthStore);

    vi.mocked(useCanGenerateChart).mockReturnValue({
      canGenerate: true,
      remaining: 1,
      limit: 1,
      isLoading: false,
      message: undefined,
    });

    vi.mocked(useGenerateChart).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as UseMutationResult<ChartResponse, Error, GenerateChartRequest, unknown>);

    vi.mocked(useGenerateChartAnonymous).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as UseMutationResult<ChartResponse, Error, GenerateChartRequest, unknown>);
  });

  describe('Rendering', () => {
    it('should render the page title and description', () => {
      render(<BirthChartPage />);

      expect(screen.getByText('Carta Astral')).toBeInTheDocument();
      expect(
        screen.getByText('Descubre el mapa del cielo en el momento de tu nacimiento')
      ).toBeInTheDocument();
    });

    it('should render the birth data form when user can generate', () => {
      render(<BirthChartPage />);

      expect(screen.getByTestId('birth-data-form')).toBeInTheDocument();
    });

    it('should render card with form title and description', () => {
      render(<BirthChartPage />);

      expect(screen.getByText('Datos de nacimiento')).toBeInTheDocument();
      expect(
        screen.getByText('Ingresa tu información para calcular tu carta astral natal')
      ).toBeInTheDocument();
    });

    it('should render informational cards', () => {
      render(<BirthChartPage />);

      expect(screen.getByText('¿Qué incluye?')).toBeInTheDocument();
      expect(screen.getByText('Importante')).toBeInTheDocument();
    });
  });

  describe('Plan Badges - Anonymous User', () => {
    it('should show "1 carta gratis" badge for anonymous users', () => {
      render(<BirthChartPage />);

      expect(screen.getByText(/1 carta gratis/i)).toBeInTheDocument();
    });

    it('should not show Premium or Free badges for anonymous users', () => {
      render(<BirthChartPage />);

      expect(screen.queryByText(/premium/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/quedan.*cartas este mes/i)).not.toBeInTheDocument();
    });
  });

  describe('Plan Badges - Free User', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'free' },
        isAuthenticated: true,
      } as AuthStore);

      vi.mocked(useCanGenerateChart).mockReturnValue({
        canGenerate: true,
        remaining: 3,
        limit: 5,
        isLoading: false,
        message: undefined,
      });
    });

    it('should show remaining charts badge for free users', () => {
      render(<BirthChartPage />);

      expect(screen.getByText('Quedan 3 cartas este mes')).toBeInTheDocument();
    });

    it('should not show anonymous or Premium badges for free users', () => {
      render(<BirthChartPage />);

      expect(screen.queryByText(/1 carta gratis/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/premium.*restantes/i)).not.toBeInTheDocument();
    });
  });

  describe('Plan Badges - Premium User', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'premium' },
        isAuthenticated: true,
      } as AuthStore);

      vi.mocked(useCanGenerateChart).mockReturnValue({
        canGenerate: true,
        remaining: 5,
        limit: 5,
        isLoading: false,
        message: undefined,
      });
    });

    it('should show Premium badge with remaining charts', () => {
      render(<BirthChartPage />);

      expect(screen.getByText(/premium.*5 cartas restantes/i)).toBeInTheDocument();
    });

    it('should not show anonymous or free badges for Premium users', () => {
      render(<BirthChartPage />);

      expect(screen.queryByText(/1 carta gratis/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/quedan.*cartas este mes/i)).not.toBeInTheDocument();
    });
  });

  describe('Usage Limits - Cannot Generate', () => {
    beforeEach(() => {
      vi.mocked(useCanGenerateChart).mockReturnValue({
        canGenerate: false,
        remaining: 0,
        limit: 1,
        isLoading: false,
        message: 'Ya utilizaste tu carta gratuita. Regístrate para obtener más.',
      });
    });

    it('should not render form when cannot generate', () => {
      render(<BirthChartPage />);

      expect(screen.queryByTestId('birth-data-form')).not.toBeInTheDocument();
    });

    it('should show usage limit message', () => {
      render(<BirthChartPage />);

      expect(
        screen.getByText('Ya utilizaste tu carta gratuita. Regístrate para obtener más.')
      ).toBeInTheDocument();
    });

    it('should show registration CTA for anonymous users who reached limit', () => {
      render(<BirthChartPage />);

      expect(
        screen.getByText('Crea una cuenta gratuita para generar más cartas.')
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /crear cuenta gratis/i })).toBeInTheDocument();
    });

    it('should show upgrade CTA for free users who reached limit', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'free' },
        isAuthenticated: true,
      } as AuthStore);

      vi.mocked(useCanGenerateChart).mockReturnValue({
        canGenerate: false,
        remaining: 0,
        limit: 5,
        isLoading: false,
        message: 'Has alcanzado el límite de 5 cartas este mes.',
      });

      render(<BirthChartPage />);

      expect(
        screen.getByText(/actualiza a premium para obtener 5 cartas mensuales/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /ver planes premium/i })).toBeInTheDocument();
    });
  });

  describe('What Includes Card - Content by Plan', () => {
    it('should show basic features for anonymous users', () => {
      render(<BirthChartPage />);

      expect(screen.getByText(/gráfico de tu carta natal/i)).toBeInTheDocument();
      expect(screen.getByText(/posiciones planetarias/i)).toBeInTheDocument();
      expect(screen.getByText(/big three/i)).toBeInTheDocument();
      expect(screen.queryByText(/interpretaciones completas/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/síntesis personalizada con ia/i)).not.toBeInTheDocument();
    });

    it('should show additional features for authenticated free users', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'free' },
        isAuthenticated: true,
      } as AuthStore);

      render(<BirthChartPage />);

      expect(screen.getByText(/interpretaciones completas/i)).toBeInTheDocument();
      expect(screen.getByText(/descarga en pdf/i)).toBeInTheDocument();
      expect(screen.queryByText(/síntesis personalizada con ia/i)).not.toBeInTheDocument();
    });

    it('should show all features for Premium users', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'premium' },
        isAuthenticated: true,
      } as AuthStore);

      render(<BirthChartPage />);

      expect(screen.getByText(/interpretaciones completas/i)).toBeInTheDocument();
      expect(screen.getByText(/descarga en pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/síntesis personalizada con ia/i)).toBeInTheDocument();
      expect(screen.getByText(/historial de cartas/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show form while usage is loading', () => {
      vi.mocked(useCanGenerateChart).mockReturnValue({
        canGenerate: false,
        remaining: 0,
        limit: 0,
        isLoading: true,
        message: undefined,
      });

      render(<BirthChartPage />);

      expect(screen.getByTestId('birth-data-form')).toBeInTheDocument();
    });

    it('should disable form when chart generation is pending', () => {
      vi.mocked(useGenerateChart).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      } as unknown as UseMutationResult<ChartResponse, Error, GenerateChartRequest, unknown>);

      render(<BirthChartPage />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });
  });
});
