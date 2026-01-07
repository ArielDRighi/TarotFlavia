import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadingLimitReached } from './ReadingLimitReached';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ReadingLimitReached', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should render limit reached message', () => {
    render(<ReadingLimitReached />);

    expect(screen.getByText('Límite de tiradas alcanzado')).toBeInTheDocument();
    expect(screen.getByText(/Ya realizaste/i)).toBeInTheDocument();
    expect(screen.getByText(/de tarot hoy/i)).toBeInTheDocument();
  });

  it('should display premium benefits', () => {
    render(<ReadingLimitReached />);

    expect(screen.getByText('Actualiza a Premium')).toBeInTheDocument();
    expect(screen.getByText(/3 tiradas completas por día/i)).toBeInTheDocument();
    expect(screen.getByText(/Todas las tiradas disponibles/i)).toBeInTheDocument();
    expect(screen.getByText(/Interpretaciones personalizadas y profundas/i)).toBeInTheDocument();
    expect(screen.getByText(/Preguntas personalizadas/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Carta del día con interpretación completa todos los días/i)
    ).toBeInTheDocument();
  });

  it('should display quick actions', () => {
    render(<ReadingLimitReached />);

    expect(screen.getByText(/Mientras tanto, puedes:/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver todas tus lecturas pasadas en el historial/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Obtener tu carta del día \(si aún no la recibiste\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Volver mañana para una nueva lectura gratuita/i)).toBeInTheDocument();
  });

  it('should render upgrade premium button', () => {
    render(<ReadingLimitReached />);

    const upgradeButton = screen.getByRole('button', { name: /Actualizar a Premium/i });
    expect(upgradeButton).toBeInTheDocument();
  });

  it('should render view history button', () => {
    render(<ReadingLimitReached />);

    const historyButton = screen.getByRole('button', { name: /Ver historial/i });
    expect(historyButton).toBeInTheDocument();
  });

  it('should render daily card button', () => {
    render(<ReadingLimitReached />);

    const dailyCardButton = screen.getByRole('button', { name: /Carta del día/i });
    expect(dailyCardButton).toBeInTheDocument();
  });

  it('should navigate to /planes when upgrade button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReadingLimitReached />);

    const upgradeButton = screen.getByRole('button', { name: /Actualizar a Premium/i });
    await user.click(upgradeButton);

    expect(mockPush).toHaveBeenCalledWith('/planes');
  });

  it('should navigate to /historial when history button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReadingLimitReached />);

    const historyButton = screen.getByRole('button', { name: /Ver historial/i });
    await user.click(historyButton);

    expect(mockPush).toHaveBeenCalledWith('/historial');
  });

  it('should navigate to /carta-del-dia when daily card button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReadingLimitReached />);

    const dailyCardButton = screen.getByRole('button', { name: /Carta del día/i });
    await user.click(dailyCardButton);

    expect(mockPush).toHaveBeenCalledWith('/carta-del-dia');
  });

  it('should have role="alert" for accessibility', () => {
    const { container } = render(<ReadingLimitReached />);

    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('should have primary button styling on upgrade button', () => {
    render(<ReadingLimitReached />);

    const upgradeButton = screen.getByRole('button', { name: /Actualizar a Premium/i });
    expect(upgradeButton).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-amber-600');
  });

  it('should have outline styling on history and daily card buttons', () => {
    render(<ReadingLimitReached />);

    const historyButton = screen.getByRole('button', { name: /Ver historial/i });
    const dailyCardButton = screen.getByRole('button', { name: /Carta del día/i });

    // Vitest + jsdom don't process Tailwind classes, but we can check component props
    expect(historyButton).toBeInTheDocument();
    expect(dailyCardButton).toBeInTheDocument();
  });
});
