import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultadoPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ResultadoPage', () => {
  const mockResult = {
    lifePath: {
      value: 7,
      name: 'El Buscador',
      keywords: ['Análisis', 'Introspección', 'Espiritualidad'],
      description: 'El número 7 representa la búsqueda de la verdad...',
      isMaster: false,
    },
    birthday: {
      value: 25,
      name: 'El Innovador',
      keywords: ['Creatividad', 'Independencia'],
      description: 'El número del día 25 indica...',
      isMaster: false,
    },
    expression: {
      value: 3,
      name: 'El Creativo',
      keywords: ['Arte', 'Comunicación'],
      description: 'El número de expresión 3...',
      isMaster: false,
    },
    soulUrge: {
      value: 5,
      name: 'El Aventurero',
      keywords: ['Libertad', 'Cambio'],
      description: 'El número del alma 5...',
      isMaster: false,
    },
    personality: {
      value: 1,
      name: 'El Líder',
      keywords: ['Liderazgo', 'Iniciativa'],
      description: 'La personalidad 1...',
      isMaster: false,
    },
    personalYear: 5,
    personalMonth: 8,
    birthDate: '1990-03-25',
    fullName: 'Juan Pérez',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('Rendering with data', () => {
    beforeEach(() => {
      sessionStorage.setItem('numerologyResult', JSON.stringify(mockResult));
    });

    it('should render the page title and user info', () => {
      render(<ResultadoPage />);

      expect(screen.getByText('Tu Perfil Numerológico')).toBeInTheDocument();
      expect(screen.getByText(/1990-03-25/)).toBeInTheDocument();
      expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
    });

    it('should render life path number card', () => {
      render(<ResultadoPage />);

      expect(screen.getByText('El Buscador')).toBeInTheDocument();
    });

    it('should render all number cards when fullName is provided', () => {
      render(<ResultadoPage />);

      expect(screen.getByText('El Buscador')).toBeInTheDocument(); // Life Path
      expect(screen.getByText('El Creativo')).toBeInTheDocument(); // Expression
      expect(screen.getByText('El Aventurero')).toBeInTheDocument(); // Soul Urge
      expect(screen.getByText('El Líder')).toBeInTheDocument(); // Personality
    });

    it('should not render expression, soul urge, and personality when null', () => {
      const resultWithoutName = {
        ...mockResult,
        expression: null,
        soulUrge: null,
        personality: null,
        fullName: null,
      };
      sessionStorage.setItem('numerologyResult', JSON.stringify(resultWithoutName));

      render(<ResultadoPage />);

      expect(screen.getByText('El Buscador')).toBeInTheDocument(); // Life Path still shows
      expect(screen.queryByText('El Creativo')).not.toBeInTheDocument();
      expect(screen.queryByText('El Aventurero')).not.toBeInTheDocument();
      expect(screen.queryByText('El Líder')).not.toBeInTheDocument();
    });

    it('should render personal year and month', () => {
      render(<ResultadoPage />);

      expect(
        screen.getByText(new RegExp(`Año Personal ${new Date().getFullYear()}`))
      ).toBeInTheDocument();
      // Use getAllByText since the number might appear in multiple cards
      const personalYearCards = screen.getAllByText('5');
      expect(personalYearCards.length).toBeGreaterThan(0);
      expect(screen.getByText('8')).toBeInTheDocument(); // Personal Month value
    });

    it('should render navigation buttons', () => {
      render(<ResultadoPage />);

      expect(screen.getByRole('button', { name: /nueva consulta/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /recalcular/i })).toBeInTheDocument();
    });

    it('should render CTA to tarot reading', () => {
      render(<ResultadoPage />);

      expect(screen.getByText('¿Quieres profundizar más?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /consulta el tarot/i })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      sessionStorage.setItem('numerologyResult', JSON.stringify(mockResult));
    });

    it('should redirect to numerologia page when no data in sessionStorage', () => {
      sessionStorage.clear();

      render(<ResultadoPage />);

      expect(mockPush).toHaveBeenCalledWith('/numerologia');
    });

    it('should navigate to numerologia on "Nueva consulta" click', async () => {
      const user = userEvent.setup();
      render(<ResultadoPage />);

      const button = screen.getByRole('button', { name: /nueva consulta/i });
      await user.click(button);

      expect(mockPush).toHaveBeenCalledWith('/numerologia');
    });

    it('should navigate to numerologia on "Recalcular" click', async () => {
      const user = userEvent.setup();
      render(<ResultadoPage />);

      const button = screen.getByRole('button', { name: /recalcular/i });
      await user.click(button);

      expect(mockPush).toHaveBeenCalledWith('/numerologia');
    });
  });

  describe('Loading state', () => {
    it('should show loading message when no data yet', () => {
      render(<ResultadoPage />);

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      sessionStorage.setItem('numerologyResult', JSON.stringify(mockResult));
    });

    it('should have proper heading structure', () => {
      render(<ResultadoPage />);

      const mainHeading = screen.getByRole('heading', {
        level: 1,
        name: /tu perfil numerológico/i,
      });
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });

      expect(mainHeading).toBeInTheDocument();
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    it('should have accessible link to tarot', () => {
      render(<ResultadoPage />);

      const link = screen.getByRole('link', { name: /consulta el tarot/i });
      expect(link).toHaveAttribute('href', '/lecturas/nueva');
    });
  });

  describe('Date formatting', () => {
    beforeEach(() => {
      sessionStorage.setItem('numerologyResult', JSON.stringify(mockResult));
    });

    it('should display birthdate in correct format', () => {
      render(<ResultadoPage />);

      expect(screen.getByText(/1990-03-25/)).toBeInTheDocument();
    });

    it('should show current month name in personal month card', () => {
      render(<ResultadoPage />);

      const currentMonth = new Date().toLocaleDateString('es', { month: 'long' });
      expect(screen.getByText(new RegExp(currentMonth, 'i'))).toBeInTheDocument();
    });
  });
});
