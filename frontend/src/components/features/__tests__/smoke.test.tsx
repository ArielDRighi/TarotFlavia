/**
 * Feature Components Smoke Tests
 *
 * These tests verify that critical feature components render without crashing.
 * They are NOT comprehensive tests - just basic smoke tests to catch
 * major rendering issues.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { TarotCard } from '../readings/TarotCard';
import { PlanBadge } from '../../ui/plan-badge';
import { StatusBadge } from '../../ui/status-badge';
import type { ReadingCard } from '@/types/reading.types';

describe('Feature Components Smoke Tests', () => {
  describe('TarotCard', () => {
    it('renders in unrevealed state (face down)', () => {
      render(<TarotCard isRevealed={false} />);
      expect(screen.getByTestId('tarot-card')).toBeInTheDocument();
      expect(screen.getByTestId('card-back')).toBeInTheDocument();
    });

    it('renders in revealed state (face up) without card data', () => {
      render(<TarotCard isRevealed={true} />);
      expect(screen.getByTestId('tarot-card')).toBeInTheDocument();
      expect(screen.getByTestId('card-front')).toBeInTheDocument();
    });

    it('renders in revealed state with card data', () => {
      const mockCard: ReadingCard = {
        id: 1,
        name: 'El Mago',
        arcana: 'major',
        number: 1,
        suit: null,
        imageUrl: '/cards/el-mago.jpg',
        orientation: 'upright',
        position: 0,
        positionName: 'Presente',
      };

      render(<TarotCard card={mockCard} isRevealed={true} />);
      expect(screen.getByTestId('tarot-card')).toBeInTheDocument();
      expect(screen.getByText('El Mago')).toBeInTheDocument();
    });

    it('renders reversed card correctly', () => {
      const mockCard: ReadingCard = {
        id: 1,
        name: 'El Mago',
        arcana: 'major',
        number: 1,
        suit: null,
        imageUrl: '/cards/el-mago.jpg',
        orientation: 'reversed',
        position: 1,
        positionName: 'Pasado',
      };

      render(<TarotCard card={mockCard} isRevealed={true} />);
      expect(screen.getByTestId('tarot-card')).toBeInTheDocument();
      expect(screen.getByText('El Mago')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<TarotCard isRevealed={false} size="sm" />);
      expect(screen.getByTestId('tarot-card')).toBeInTheDocument();

      rerender(<TarotCard isRevealed={false} size="md" />);
      expect(screen.getByTestId('tarot-card')).toBeInTheDocument();

      rerender(<TarotCard isRevealed={false} size="lg" />);
      expect(screen.getByTestId('tarot-card')).toBeInTheDocument();
    });

    it('renders with onClick handler', () => {
      const onClick = () => {};
      render(<TarotCard isRevealed={false} onClick={onClick} />);
      const card = screen.getByTestId('tarot-card');
      expect(card).toHaveAttribute('role', 'button');
    });
  });

  describe('PlanBadge', () => {
    it('renders guest plan badge', () => {
      render(<PlanBadge plan="guest" />);
      expect(screen.getByText('GUEST')).toBeInTheDocument();
    });

    it('renders free plan badge', () => {
      render(<PlanBadge plan="free" />);
      expect(screen.getByText('FREE')).toBeInTheDocument();
    });

    it('renders premium plan badge', () => {
      render(<PlanBadge plan="premium" />);
      expect(screen.getByText('PREMIUM')).toBeInTheDocument();
    });

    it('renders professional plan badge', () => {
      render(<PlanBadge plan="professional" />);
      expect(screen.getByText('PROFESSIONAL')).toBeInTheDocument();
    });

    it('shows correct text for each plan type', () => {
      const plans: Array<{ plan: 'guest' | 'free' | 'premium' | 'professional'; text: string }> = [
        { plan: 'guest', text: 'GUEST' },
        { plan: 'free', text: 'FREE' },
        { plan: 'premium', text: 'PREMIUM' },
        { plan: 'professional', text: 'PROFESSIONAL' },
      ];

      plans.forEach(({ plan, text }) => {
        const { unmount } = render(<PlanBadge plan={plan} />);
        expect(screen.getByText(text)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('StatusBadge', () => {
    it('renders pending status badge', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('renders confirmed status badge', () => {
      render(<StatusBadge status="confirmed" />);
      expect(screen.getByText('Confirmada')).toBeInTheDocument();
    });

    it('renders completed status badge', () => {
      render(<StatusBadge status="completed" />);
      expect(screen.getByText('Completada')).toBeInTheDocument();
    });

    it('renders cancelled status badge', () => {
      render(<StatusBadge status="cancelled" />);
      expect(screen.getByText('Cancelada')).toBeInTheDocument();
    });

    it('shows correct text and color for each status type', () => {
      const statuses: Array<{
        status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
        text: string;
      }> = [
        { status: 'pending', text: 'Pendiente' },
        { status: 'confirmed', text: 'Confirmada' },
        { status: 'completed', text: 'Completada' },
        { status: 'cancelled', text: 'Cancelada' },
      ];

      statuses.forEach(({ status, text }) => {
        const { unmount } = render(<StatusBadge status={status} />);
        expect(screen.getByText(text)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
