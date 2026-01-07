import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SubscriptionTab } from './SubscriptionTab';
import type { UserProfile } from '@/types';

const createMockProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  roles: ['consumer'],
  plan: 'free',
  // Legacy fields (deprecated)
  dailyReadingsCount: 2,
  dailyReadingsLimit: 5,
  // New separate fields
  dailyCardCount: 1,
  dailyCardLimit: 1,
  tarotReadingsCount: 1,
  tarotReadingsLimit: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  profilePicture: undefined,
  lastLogin: null,
  ...overrides,
});

describe('SubscriptionTab', () => {
  describe('Plan Display', () => {
    it('should render free plan correctly', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />);

      // Buscar por el párrafo con clase text-lg (el título del plan)
      expect(
        screen.getByText((content, element) => {
          return !!(element?.classList.contains('text-lg') && /Plan GRATUITO/i.test(content));
        })
      ).toBeInTheDocument();
      expect(screen.getByText(/plan gratuito con funcionalidades básicas/i)).toBeInTheDocument();
    });

    it('should render premium plan correctly', () => {
      const profile = createMockProfile({ plan: 'premium' });
      render(<SubscriptionTab profile={profile} />);

      // Buscar texto específico del componente, no solo "PREMIUM"
      expect(screen.getByText(/plan premium con funcionalidades avanzadas/i)).toBeInTheDocument();
    });

    it('should render anonymous plan correctly', () => {
      const profile = createMockProfile({ plan: 'anonymous' });
      render(<SubscriptionTab profile={profile} />);

      // Buscar por el párrafo con clase text-lg (el título del plan)
      expect(
        screen.getByText((content, element) => {
          return !!(element?.classList.contains('text-lg') && /Plan ANÓNIMO/i.test(content));
        })
      ).toBeInTheDocument();
      expect(screen.getByText(/plan anónimo con funcionalidades limitadas/i)).toBeInTheDocument();
    });
  });

  describe('Usage Statistics', () => {
    it('should display daily readings count and limit', () => {
      const profile = createMockProfile({
        dailyReadingsCount: 3,
        dailyReadingsLimit: 10,
      });
      render(<SubscriptionTab profile={profile} />);

      expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('should display remaining readings', () => {
      const profile = createMockProfile({
        dailyReadingsCount: 3,
        dailyReadingsLimit: 10,
      });
      render(<SubscriptionTab profile={profile} />);

      expect(screen.getByText(/lecturas restantes hoy:/i)).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      const profile = createMockProfile({
        dailyReadingsCount: 5,
        dailyReadingsLimit: 10,
      });
      const { container } = render(<SubscriptionTab profile={profile} />);

      // Buscar el contenedor del progress bar
      const progressContainer = container.querySelector('.bg-secondary.h-2.w-full');
      expect(progressContainer).toBeTruthy();

      // Verificar que tiene un hijo con bg-primary
      const progressBar = progressContainer?.querySelector('.bg-primary');
      expect(progressBar).toBeTruthy();
    });

    it('should handle zero limit gracefully (defensive guard)', () => {
      const profile = createMockProfile({
        dailyReadingsCount: 0,
        dailyReadingsLimit: 0,
      });

      // Simplemente verificamos que renderiza sin error
      expect(() => render(<SubscriptionTab profile={profile} />)).not.toThrow();
      expect(screen.getByText('0 / 0')).toBeInTheDocument();
    });

    it('should show correct readings when at limit', () => {
      const profile = createMockProfile({
        dailyReadingsCount: 10,
        dailyReadingsLimit: 10,
      });
      render(<SubscriptionTab profile={profile} />);

      expect(screen.getByText('10 / 10')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // remaining
    });

    it('should handle undefined dailyReadingsCount gracefully', () => {
      const profile = createMockProfile({
        dailyReadingsCount: undefined as unknown as number,
        dailyReadingsLimit: 10,
      });
      render(<SubscriptionTab profile={profile} />);

      // Should show 0 instead of NaN
      expect(screen.getByText('0 / 10')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // remaining = 10 - 0
    });

    it('should handle undefined dailyReadingsLimit gracefully', () => {
      const profile = createMockProfile({
        dailyReadingsCount: 5,
        dailyReadingsLimit: undefined as unknown as number,
      });
      render(<SubscriptionTab profile={profile} />);

      // Should show 0 as fallback for limit
      expect(screen.getByText('5 / 0')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // remaining = 0 - 5 = 0 (clamped)
    });

    it('should handle both undefined values gracefully', () => {
      const profile = createMockProfile({
        dailyReadingsCount: undefined as unknown as number,
        dailyReadingsLimit: undefined as unknown as number,
      });
      render(<SubscriptionTab profile={profile} />);

      // Should show 0 / 0 instead of NaN / NaN
      expect(screen.getByText('0 / 0')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // remaining
    });

    it('should never display NaN in UI', () => {
      const profile = createMockProfile({
        dailyReadingsCount: NaN,
        dailyReadingsLimit: NaN,
      });
      const { container } = render(<SubscriptionTab profile={profile} />);

      // Verificar que "NaN" no aparece en el DOM
      expect(container.textContent).not.toContain('NaN');
      expect(screen.getByText('0 / 0')).toBeInTheDocument();
    });
  });

  describe('Plan Upgrade Section', () => {
    it('should show upgrade section for free users', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />);

      expect(screen.getByText('Mejora tu Plan')).toBeInTheDocument();
      expect(screen.getByText(/actualiza a premium/i)).toBeInTheDocument();
    });

    it('should list upgrade benefits for free users', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />);

      expect(screen.getByText(/lecturas ilimitadas/i)).toBeInTheDocument();
      expect(screen.getByText(/acceso a todos los tipos de tiradas/i)).toBeInTheDocument();
      expect(screen.getByText(/historial completo de lecturas/i)).toBeInTheDocument();
      expect(screen.getByText(/soporte prioritario/i)).toBeInTheDocument();
    });

    it('should show "coming soon" message for upgrade', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />);

      expect(screen.getByText(/próximamente: mejora de planes disponible/i)).toBeInTheDocument();
    });

    it('should NOT show upgrade section for premium users', () => {
      const profile = createMockProfile({ plan: 'premium' });
      render(<SubscriptionTab profile={profile} />);

      expect(screen.queryByText('Mejora tu Plan')).not.toBeInTheDocument();
    });

    it('should NOT show upgrade section for anonymous users', () => {
      const profile = createMockProfile({ plan: 'anonymous' });
      render(<SubscriptionTab profile={profile} />);

      expect(screen.queryByText('Mejora tu Plan')).not.toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render plan section', () => {
      const profile = createMockProfile();
      render(<SubscriptionTab profile={profile} />);

      expect(screen.getByText('Plan Actual')).toBeInTheDocument();
    });

    it('should render usage statistics section', () => {
      const profile = createMockProfile();
      render(<SubscriptionTab profile={profile} />);

      expect(screen.getByText('Estadísticas de Uso')).toBeInTheDocument();
    });

    it('should render all sections in correct order', () => {
      const profile = createMockProfile({ plan: 'free' });
      const { container } = render(<SubscriptionTab profile={profile} />);

      const sections = container.querySelectorAll('.space-y-6 > *');
      expect(sections).toHaveLength(3); // Current Plan + Usage Statistics + Upgrade
    });
  });
});
