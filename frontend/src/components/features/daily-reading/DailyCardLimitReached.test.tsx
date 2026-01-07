import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import { DailyCardLimitReached } from './DailyCardLimitReached';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('DailyCardLimitReached', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Rendering', () => {
    test('should render component with correct title', () => {
      render(<DailyCardLimitReached />);

      expect(screen.getByText('Ya recibiste tu carta del día')).toBeInTheDocument();
    });

    test('should render description message', () => {
      render(<DailyCardLimitReached />);

      expect(screen.getByText(/Puedes obtener una nueva carta mañana/i)).toBeInTheDocument();
    });

    test('should render benefits list', () => {
      render(<DailyCardLimitReached />);

      expect(screen.getByText(/Ver todas tus cartas pasadas en el historial/i)).toBeInTheDocument();
      expect(screen.getByText(/Crear una nueva lectura de tarot ahora/i)).toBeInTheDocument();
      expect(screen.getByText(/Volver mañana para tu nueva carta del día/i)).toBeInTheDocument();
    });

    test('should render "Ver historial" button', () => {
      render(<DailyCardLimitReached />);

      expect(screen.getByRole('button', { name: /Ver historial/i })).toBeInTheDocument();
    });

    test('should render "Nueva lectura" button', () => {
      render(<DailyCardLimitReached />);

      expect(screen.getByRole('button', { name: /Nueva lectura/i })).toBeInTheDocument();
    });

    test('should render "Actualizar a Premium" button', () => {
      render(<DailyCardLimitReached />);

      expect(screen.getByRole('button', { name: /Actualizar a Premium/i })).toBeInTheDocument();
    });

    test('should render Premium benefits list', () => {
      render(<DailyCardLimitReached />);

      expect(
        screen.getByText(/Carta del día con interpretación completa TODOS los días/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/3 tiradas completas por día/i)).toBeInTheDocument();
      expect(screen.getByText(/Todas las tiradas disponibles/i)).toBeInTheDocument();
      expect(screen.getByText(/Interpretaciones personalizadas y profundas/i)).toBeInTheDocument();
      expect(screen.getByText(/Preguntas personalizadas/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have role="alert" for screen readers', () => {
      const { container } = render(<DailyCardLimitReached />);

      const alertElement = container.querySelector('[role="alert"]');
      expect(alertElement).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('should navigate to /historial when "Ver historial" button is clicked', async () => {
      const user = userEvent.setup();
      render(<DailyCardLimitReached />);

      const historyButton = screen.getByRole('button', { name: /Ver historial/i });
      await user.click(historyButton);

      expect(mockPush).toHaveBeenCalledWith('/historial');
    });

    test('should navigate to /ritual when "Nueva lectura" button is clicked', async () => {
      const user = userEvent.setup();
      render(<DailyCardLimitReached />);

      const newReadingButton = screen.getByRole('button', { name: /Nueva lectura/i });
      await user.click(newReadingButton);

      expect(mockPush).toHaveBeenCalledWith('/ritual');
    });

    test('should navigate to /planes when "Actualizar a Premium" button is clicked', async () => {
      const user = userEvent.setup();
      render(<DailyCardLimitReached />);

      const upgradeButton = screen.getByRole('button', { name: /Actualizar a Premium/i });
      await user.click(upgradeButton);

      expect(mockPush).toHaveBeenCalledWith('/planes');
    });
  });
});
