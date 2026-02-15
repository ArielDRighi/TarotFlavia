import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UsageLimitBanner } from './UsageLimitBanner';
import type { UsageStatus } from '@/types/birth-chart-api.types';

describe('UsageLimitBanner', () => {
  // Mock date determinista: 2026-02-15 12:00:00 UTC
  const MOCK_NOW = new Date('2026-02-15T12:00:00.000Z');
  // Reset date: 2 semanas en el futuro
  const MOCK_RESET_DATE = '2026-03-01T00:00:00.000Z';

  const mockUsage: UsageStatus = {
    plan: 'free',
    used: 2,
    limit: 10,
    remaining: 8,
    resetsAt: MOCK_RESET_DATE,
    canGenerate: true,
  };

  describe('Variant: inline', () => {
    it('should render inline variant with correct usage display', () => {
      render(<UsageLimitBanner usage={mockUsage} variant="inline" />);

      expect(screen.getByText('8/10')).toBeInTheDocument();
    });

    it('should show exhausted state in inline variant', () => {
      const exhaustedUsage: UsageStatus = {
        ...mockUsage,
        used: 10,
        remaining: 0,
        canGenerate: false,
      };

      const { container } = render(<UsageLimitBanner usage={exhaustedUsage} variant="inline" />);

      expect(screen.getByText('0/10')).toBeInTheDocument();
      expect(container.querySelector('.bg-destructive\\/10')).toBeInTheDocument();
    });

    it('should show low state in inline variant', () => {
      const lowUsage: UsageStatus = {
        ...mockUsage,
        used: 9,
        remaining: 1,
      };

      const { container } = render(<UsageLimitBanner usage={lowUsage} variant="inline" />);

      expect(screen.getByText('1/10')).toBeInTheDocument();
      expect(container.querySelector('.bg-amber-500\\/10')).toBeInTheDocument();
    });
  });

  describe('Variant: compact', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(MOCK_NOW);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should render compact variant with progress bar', () => {
      render(<UsageLimitBanner usage={mockUsage} variant="compact" />);

      expect(screen.getByText('Uso de cartas')).toBeInTheDocument();
      expect(screen.getByText('2/10')).toBeInTheDocument();
    });

    it('should show reset time in compact variant', () => {
      render(<UsageLimitBanner usage={mockUsage} variant="compact" />);

      expect(screen.getByText(/reinicio/i)).toBeInTheDocument();
    });

    it('should show exhausted badge in compact variant', () => {
      const exhaustedUsage: UsageStatus = {
        ...mockUsage,
        used: 10,
        remaining: 0,
        canGenerate: false,
      };

      render(<UsageLimitBanner usage={exhaustedUsage} variant="compact" />);

      expect(screen.getByText('10/10')).toBeInTheDocument();
    });
  });

  describe('Variant: full (default)', () => {
    it('should render full banner with all information', () => {
      render(<UsageLimitBanner usage={mockUsage} />);

      expect(screen.getByText(/uso de cartas astrales/i)).toBeInTheDocument();
      expect(screen.getByText('free')).toBeInTheDocument();
      expect(screen.getByText(/te quedan 8 cartas/i)).toBeInTheDocument();
      // Progress bar should show correct percentage
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20');
    });

    it('should show available status when usage is normal', () => {
      render(<UsageLimitBanner usage={mockUsage} />);

      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });

    it('should show exhausted state with correct message', () => {
      const exhaustedUsage: UsageStatus = {
        ...mockUsage,
        used: 10,
        remaining: 0,
        canGenerate: false,
      };

      render(<UsageLimitBanner usage={exhaustedUsage} />);

      expect(screen.getByText(/límite alcanzado/i)).toBeInTheDocument();
      expect(screen.getByText(/has utilizado todas tus cartas/i)).toBeInTheDocument();
    });

    it('should show low state with warning message', () => {
      const lowUsage: UsageStatus = {
        ...mockUsage,
        used: 9,
        remaining: 1,
      };

      render(<UsageLimitBanner usage={lowUsage} />);

      expect(screen.getByText(/última carta disponible/i)).toBeInTheDocument();
      expect(screen.getByText(/te queda solo 1 carta/i)).toBeInTheDocument();
    });

    it('should show upgrade CTA for exhausted free users', () => {
      const exhaustedUsage: UsageStatus = {
        ...mockUsage,
        plan: 'free',
        used: 10,
        remaining: 0,
        canGenerate: false,
      };

      render(<UsageLimitBanner usage={exhaustedUsage} />);

      const upgradeButton = screen.getByRole('link', { name: /obtener más/i });
      expect(upgradeButton).toBeInTheDocument();
      expect(upgradeButton).toHaveAttribute('href', '/premium');
    });

    it('should show upgrade CTA for low free users', () => {
      const lowUsage: UsageStatus = {
        ...mockUsage,
        plan: 'free',
        used: 9,
        remaining: 1,
      };

      render(<UsageLimitBanner usage={lowUsage} />);

      expect(screen.getByRole('link', { name: /obtener más/i })).toBeInTheDocument();
      expect(screen.getByText(/actualiza a premium para obtener más/i)).toBeInTheDocument();
    });

    it('should NOT show upgrade CTA for premium users', () => {
      const lowUsage: UsageStatus = {
        ...mockUsage,
        plan: 'premium',
        used: 9,
        remaining: 1,
      };

      render(<UsageLimitBanner usage={lowUsage} />);

      expect(screen.queryByRole('link', { name: /obtener más/i })).not.toBeInTheDocument();
    });

    it('should show plan badge', () => {
      render(<UsageLimitBanner usage={{ ...mockUsage, plan: 'premium' }} />);

      expect(screen.getByText('premium')).toBeInTheDocument();
    });

    it('should calculate percentage correctly', () => {
      const usageAt50: UsageStatus = {
        ...mockUsage,
        used: 5,
        limit: 10,
        remaining: 5,
      };

      render(<UsageLimitBanner usage={usageAt50} />);

      // Progress bar should be at 50%
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      // Label still shows the fraction 5/10
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });
  });

  describe('Dismiss functionality', () => {
    it('should render dismiss button when showDismiss is true', () => {
      render(<UsageLimitBanner usage={mockUsage} showDismiss={true} onDismiss={() => {}} />);

      // Button has aria-label="Cerrar banner"
      expect(screen.getByRole('button', { name: /cerrar banner/i })).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();

      render(<UsageLimitBanner usage={mockUsage} showDismiss={true} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /cerrar banner/i });
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should NOT render dismiss button when showDismiss is false', () => {
      render(<UsageLimitBanner usage={mockUsage} showDismiss={false} />);

      // No dismiss button
      expect(screen.queryByRole('button', { name: /cerrar banner/i })).not.toBeInTheDocument();
    });
  });

  describe('Reset time display', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(MOCK_NOW);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should show reset time when resetsAt is provided', () => {
      render(<UsageLimitBanner usage={mockUsage} />);

      expect(screen.getByText(/se reinicia/i)).toBeInTheDocument();
    });

    it('should NOT show reset time when resetsAt is null', () => {
      const usageWithoutReset: UsageStatus = {
        ...mockUsage,
        resetsAt: null,
      };

      render(<UsageLimitBanner usage={usageWithoutReset} />);

      const resetText = screen.queryByText(/se reinicia/i);
      expect(resetText).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(<UsageLimitBanner usage={mockUsage} className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Icons display', () => {
    it('should show Sparkles icon for normal usage', () => {
      const { container } = render(<UsageLimitBanner usage={mockUsage} />);

      // Sparkles icon rendered via lucide-react
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should show AlertTriangle icon for exhausted state', () => {
      const exhaustedUsage: UsageStatus = {
        ...mockUsage,
        used: 10,
        remaining: 0,
        canGenerate: false,
      };

      const { container } = render(<UsageLimitBanner usage={exhaustedUsage} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should show AlertTriangle icon for low state', () => {
      const lowUsage: UsageStatus = {
        ...mockUsage,
        used: 9,
        remaining: 1,
      };

      const { container } = render(<UsageLimitBanner usage={lowUsage} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Anonymous user', () => {
    it('should display anonymous plan correctly', () => {
      const anonymousUsage: UsageStatus = {
        plan: 'anonymous',
        used: 0,
        limit: 1,
        remaining: 1,
        resetsAt: null,
        canGenerate: true,
      };

      render(<UsageLimitBanner usage={anonymousUsage} />);

      expect(screen.getByText('anonymous')).toBeInTheDocument();
    });

    it('should show upgrade CTA for exhausted anonymous users', () => {
      const exhaustedAnonymous: UsageStatus = {
        plan: 'anonymous',
        used: 1,
        limit: 1,
        remaining: 0,
        resetsAt: null,
        canGenerate: false,
      };

      render(<UsageLimitBanner usage={exhaustedAnonymous} />);

      expect(screen.getByRole('link', { name: /obtener más/i })).toBeInTheDocument();
    });
  });
});
