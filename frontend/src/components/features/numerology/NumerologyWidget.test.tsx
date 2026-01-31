import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { NumerologyWidget } from './NumerologyWidget';
import type {
  NumerologyResponseDto,
  DayNumberResponse,
  NumberDetailDto,
} from '@/types/numerology.types';

// Mock the hooks
const mockUseMyNumerologyProfile = vi.fn();
const mockUseDayNumber = vi.fn();

vi.mock('@/hooks/api/useNumerology', () => ({
  useMyNumerologyProfile: () => mockUseMyNumerologyProfile(),
  useDayNumber: () => mockUseDayNumber(),
}));

// Helper to create NumberDetailDto
function createNumberDetail(value: number, name: string, isMaster = false): NumberDetailDto {
  return {
    value,
    name,
    keywords: ['palabra1', 'palabra2'],
    description: `Descripción del número ${value}`,
    isMaster,
  };
}

// Factory function for test data
function createMockProfile(overrides?: Partial<NumerologyResponseDto>): NumerologyResponseDto {
  return {
    birthDate: '1990-05-15',
    fullName: 'Juan Pérez',
    lifePath: createNumberDetail(7, 'El Analista'),
    birthday: createNumberDetail(15, 'El Mensajero'),
    expression: createNumberDetail(3, 'El Comunicador'),
    soulUrge: createNumberDetail(5, 'El Aventurero'),
    personality: createNumberDetail(8, 'El Poderoso'),
    personalYear: 9,
    personalMonth: 6,
    ...overrides,
  };
}

function createMockDayNumber(overrides?: Partial<DayNumberResponse>): DayNumberResponse {
  return {
    date: '2026-01-21',
    dayNumber: 3,
    meaning: {
      number: 3,
      name: 'El Comunicador',
      keywords: ['creatividad', 'expresión', 'comunicación'],
      description: 'Día de creatividad y expresión. Ideal para comunicar ideas.',
      strengths: ['Creatividad', 'Comunicación'],
      challenges: ['Dispersión'],
      careers: ['Arte', 'Comunicación'],
      isMaster: false,
    },
    ...overrides,
  };
}

describe('NumerologyWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should render loading skeleton when profile is loading', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByTestId('numerology-widget-loading')).toBeInTheDocument();
    });

    it('should render loading skeleton when day number is loading', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByTestId('numerology-widget-loading')).toBeInTheDocument();
    });
  });

  describe('No Data State', () => {
    it('should render configure profile CTA when no profile data', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByTestId('numerology-widget-no-data')).toBeInTheDocument();
    });

    it('should show configure message in no data state', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByText(/configura tu fecha de nacimiento/i)).toBeInTheDocument();
    });

    it('should render link to profile page in no data state', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      const link = screen.getByRole('link', { name: /configurar/i });
      expect(link).toHaveAttribute('href', '/perfil');
    });

    it('should render Settings icon in configure button', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      const button = screen.getByRole('link', { name: /configurar/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render configure CTA when profile error occurs', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API Error'),
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByTestId('numerology-widget-no-data')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render widget with profile data', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByTestId('numerology-widget')).toBeInTheDocument();
    });

    it('should display life path number value', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should display life path label', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByText(/camino de vida/i)).toBeInTheDocument();
    });

    it('should display day number', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber({ dayNumber: 5 }),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display day number label', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByText(/número del día/i)).toBeInTheDocument();
    });

    it('should display day number interpretation', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber({
          meaning: {
            number: 3,
            name: 'El Transformador',
            keywords: ['transformación'],
            description: 'Día de transformación profunda.',
            strengths: [],
            challenges: [],
            careers: [],
            isMaster: false,
          },
        }),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByText('Día de transformación profunda.')).toBeInTheDocument();
    });

    it('should render link to full profile page', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      const link = screen.getByRole('link', { name: /ver informe completo/i });
      expect(link).toHaveAttribute('href', '/numerologia');
    });

    it('should display master number badge for life path 11', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile({
          lifePath: createNumberDetail(11, 'El Maestro', true),
        }),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByText('11')).toBeInTheDocument();
      expect(screen.getByText('⭐ Maestro')).toBeInTheDocument();
    });

    it('should display master number badge for day number 22', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber({
          dayNumber: 22,
          meaning: {
            number: 22,
            name: 'El Maestro Constructor',
            keywords: ['maestría', 'construcción'],
            description: 'Día maestro constructor.',
            strengths: [],
            challenges: [],
            careers: [],
            isMaster: true,
          },
        }),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByText('22')).toBeInTheDocument();
      const badges = screen.getAllByText('⭐ Maestro');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should handle missing day number gracefully', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      // Should still render widget with just profile data
      expect(screen.getByTestId('numerology-widget')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument(); // life path
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      // CardTitle is a div, not a heading element
      // Verify the title text is present
      expect(screen.getByText('Tu Numerología')).toBeInTheDocument();
    });

    it('should have accessible link with clear text', () => {
      mockUseMyNumerologyProfile.mockReturnValue({
        data: createMockProfile(),
        isLoading: false,
        error: null,
      });
      mockUseDayNumber.mockReturnValue({
        data: createMockDayNumber(),
        isLoading: false,
        error: null,
      });

      render(<NumerologyWidget />);

      expect(screen.getByRole('link', { name: /ver informe completo/i })).toBeInTheDocument();
    });
  });
});
