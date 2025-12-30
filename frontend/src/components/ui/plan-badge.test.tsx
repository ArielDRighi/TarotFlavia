import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanBadge } from './plan-badge';

describe('PlanBadge', () => {
  describe('rendering', () => {
    it('should render with anonymous plan', () => {
      render(<PlanBadge plan="anonymous" />);

      expect(screen.getByText('ANÓNIMO')).toBeInTheDocument();
    });

    it('should render with free plan', () => {
      render(<PlanBadge plan="free" />);

      expect(screen.getByText('GRATUITO')).toBeInTheDocument();
    });

    it('should render with premium plan', () => {
      render(<PlanBadge plan="premium" />);

      expect(screen.getByText('PREMIUM')).toBeInTheDocument();
    });
  });

  describe('styles by plan', () => {
    describe('anonymous plan', () => {
      it('should have gray background', () => {
        render(<PlanBadge plan="anonymous" />);

        const badge = screen.getByText('ANÓNIMO');
        expect(badge).toHaveStyle({ backgroundColor: '#F7FAFC' });
      });

      it('should have dark text', () => {
        render(<PlanBadge plan="anonymous" />);

        const badge = screen.getByText('ANÓNIMO');
        expect(badge).toHaveStyle({ color: '#1A202C' });
      });

      it('should not have border', () => {
        render(<PlanBadge plan="anonymous" />);

        const badge = screen.getByText('ANÓNIMO');
        expect(badge).toHaveClass('border-transparent');
      });
    });

    describe('free plan', () => {
      it('should have gray background', () => {
        render(<PlanBadge plan="free" />);

        const badge = screen.getByText('GRATUITO');
        expect(badge).toHaveStyle({ backgroundColor: '#F7FAFC' });
      });

      it('should have dark text', () => {
        render(<PlanBadge plan="free" />);

        const badge = screen.getByText('GRATUITO');
        expect(badge).toHaveStyle({ color: '#1A202C' });
      });

      it('should not have border', () => {
        render(<PlanBadge plan="free" />);

        const badge = screen.getByText('GRATUITO');
        expect(badge).toHaveClass('border-transparent');
      });
    });

    describe('premium plan', () => {
      it('should have pale yellow background', () => {
        render(<PlanBadge plan="premium" />);

        const badge = screen.getByText('PREMIUM');
        expect(badge).toHaveStyle({ backgroundColor: '#FEFCBF' });
      });

      it('should have dark golden text', () => {
        render(<PlanBadge plan="premium" />);

        const badge = screen.getByText('PREMIUM');
        expect(badge).toHaveStyle({ color: '#B7791F' });
      });

      it('should have golden border', () => {
        render(<PlanBadge plan="premium" />);

        const badge = screen.getByText('PREMIUM');
        expect(badge).toHaveStyle({ borderColor: '#D69E2E' });
      });
    });
  });

  describe('text formatting', () => {
    it('should display text in uppercase', () => {
      render(<PlanBadge plan="free" />);

      expect(screen.getByText('GRATUITO')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have data-slot attribute for badge', () => {
      render(<PlanBadge plan="premium" />);

      const badge = screen.getByText('PREMIUM');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });
  });

  describe('className prop', () => {
    it('should accept and apply custom className', () => {
      render(<PlanBadge plan="free" className="custom-class" />);

      const badge = screen.getByText('GRATUITO');
      expect(badge).toHaveClass('custom-class');
    });
  });
});
