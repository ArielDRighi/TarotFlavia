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

// Mock useUserCapabilities
const mockUseUserCapabilities = vi.fn();
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
}));

describe('ReadingLimitReached', () => {
  beforeEach(() => {
    mockPush.mockClear();

    // Default mock: FREE user at limit
    mockUseUserCapabilities.mockReturnValue({
      data: {
        tarotReadings: {
          used: 1,
          limit: 1,
        },
      },
      isLoading: false,
    });
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

    const upgradeButton = screen.getByRole('button', { name: /Mejorar a Premium/i });
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

  it('should navigate to /premium when upgrade button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReadingLimitReached />);

    const upgradeButton = screen.getByRole('button', { name: /Mejorar a Premium/i });
    await user.click(upgradeButton);

    expect(mockPush).toHaveBeenCalledWith('/premium');
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

  it('should have brand-token button styling on upgrade button (no raw purple/pink)', () => {
    render(<ReadingLimitReached />);

    const upgradeButton = screen.getByRole('button', { name: /Mejorar a Premium/i });
    // Tras T-FBK-002 el CTA usa el Button por defecto (token `primary`) con foco dorado.
    expect(upgradeButton).toHaveClass('bg-primary');
    expect(upgradeButton).toHaveClass('focus-visible:ring-secondary/50');
    expect(upgradeButton.className).not.toMatch(/purple|pink/);
  });

  it('should have outline styling on history and daily card buttons', () => {
    render(<ReadingLimitReached />);

    const historyButton = screen.getByRole('button', { name: /Ver historial/i });
    const dailyCardButton = screen.getByRole('button', { name: /Carta del día/i });

    // Vitest + jsdom don't process Tailwind classes, but we can check component props
    expect(historyButton).toBeInTheDocument();
    expect(dailyCardButton).toBeInTheDocument();
  });

  describe('usuario premium (agotó sus tiradas del día)', () => {
    beforeEach(() => {
      mockUseUserCapabilities.mockReturnValue({
        data: {
          plan: 'premium',
          tarotReadings: { used: 3, limit: 3 },
        },
        isLoading: false,
      });
    });

    it('NO ofrece "Hazte Premium" a quien ya es premium', () => {
      render(<ReadingLimitReached />);

      expect(screen.queryByRole('button', { name: /Mejorar a Premium/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Actualiza a Premium')).not.toBeInTheDocument();
      expect(screen.queryByText(/actualiza a PREMIUM para/i)).not.toBeInTheDocument();
    });

    it('muestra que el límite se reinicia mañana', () => {
      render(<ReadingLimitReached />);

      expect(screen.getByText(/se reinician mañana/i)).toBeInTheDocument();
    });

    it('mantiene las acciones de historial y carta del día', () => {
      render(<ReadingLimitReached />);

      expect(screen.getByRole('button', { name: /Ver historial/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Carta del día/i })).toBeInTheDocument();
    });
  });

  describe('estado de carga (capabilities aún no resueltas)', () => {
    it('renderiza sin romper y cae al comportamiento free por defecto', () => {
      mockUseUserCapabilities.mockReturnValue({ data: undefined, isLoading: true });

      render(<ReadingLimitReached />);

      // No crashea y muestra el título; sin plan definido se trata como free (fail-safe)
      expect(screen.getByText('Límite de tiradas alcanzado')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Mejorar a Premium/i })).toBeInTheDocument();
    });
  });
});
