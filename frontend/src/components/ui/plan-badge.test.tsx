import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanBadge } from './plan-badge';

describe('PlanBadge', () => {
  describe('rendering', () => {
    it('should render with guest plan', () => {
      render(<PlanBadge plan="guest" />);

      expect(screen.getByText('GUEST')).toBeInTheDocument();
    });

    it('should render with free plan', () => {
      render(<PlanBadge plan="free" />);

      expect(screen.getByText('FREE')).toBeInTheDocument();
    });

    it('should render with premium plan', () => {
      render(<PlanBadge plan="premium" />);

      expect(screen.getByText('PREMIUM')).toBeInTheDocument();
    });

    it('should render with professional plan', () => {
      render(<PlanBadge plan="professional" />);

      expect(screen.getByText('PROFESSIONAL')).toBeInTheDocument();
    });
  });

  describe('styles by plan', () => {
    describe('guest plan', () => {
      it('should have gray background', () => {
        render(<PlanBadge plan="guest" />);

        const badge = screen.getByText('GUEST');
        expect(badge).toHaveStyle({ backgroundColor: '#F7FAFC' });
      });

      it('should have dark text', () => {
        render(<PlanBadge plan="guest" />);

        const badge = screen.getByText('GUEST');
        expect(badge).toHaveStyle({ color: '#1A202C' });
      });

      it('should not have border', () => {
        render(<PlanBadge plan="guest" />);

        const badge = screen.getByText('GUEST');
        expect(badge).toHaveClass('border-transparent');
      });
    });

    describe('free plan', () => {
      it('should have gray background', () => {
        render(<PlanBadge plan="free" />);

        const badge = screen.getByText('FREE');
        expect(badge).toHaveStyle({ backgroundColor: '#F7FAFC' });
      });

      it('should have dark text', () => {
        render(<PlanBadge plan="free" />);

        const badge = screen.getByText('FREE');
        expect(badge).toHaveStyle({ color: '#1A202C' });
      });

      it('should not have border', () => {
        render(<PlanBadge plan="free" />);

        const badge = screen.getByText('FREE');
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

    describe('professional plan', () => {
      it('should have black background', () => {
        render(<PlanBadge plan="professional" />);

        const badge = screen.getByText('PROFESSIONAL');
        expect(badge).toHaveStyle({ backgroundColor: '#1A202C' });
      });

      it('should have white text', () => {
        render(<PlanBadge plan="professional" />);

        const badge = screen.getByText('PROFESSIONAL');
        expect(badge).toHaveStyle({ color: '#FFFFFF' });
      });
    });
  });

  describe('text formatting', () => {
    it('should display text in uppercase', () => {
      render(<PlanBadge plan="free" />);

      expect(screen.getByText('FREE')).toBeInTheDocument();
      expect(screen.queryByText('free')).not.toBeInTheDocument();
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

      const badge = screen.getByText('FREE');
      expect(badge).toHaveClass('custom-class');
    });
  });
});
