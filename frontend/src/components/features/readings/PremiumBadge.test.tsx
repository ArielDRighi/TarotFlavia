import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PremiumBadge } from './PremiumBadge';

describe('PremiumBadge', () => {
  describe('Rendering', () => {
    it('should render with lock icon by default', () => {
      render(<PremiumBadge />);

      expect(screen.getByText(/premium/i)).toBeInTheDocument();
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(<PremiumBadge text="Pro" />);

      expect(screen.getByText(/pro/i)).toBeInTheDocument();
    });

    it('should render with lock variant', () => {
      render(<PremiumBadge variant="lock" />);

      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('should render with crown variant', () => {
      render(<PremiumBadge variant="crown" />);

      expect(screen.getByTestId('crown-icon')).toBeInTheDocument();
    });

    it('should render with sparkles variant', () => {
      render(<PremiumBadge variant="sparkles" />);

      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip as title attribute when provided', () => {
      const { container } = render(<PremiumBadge tooltip="Actualiza tu plan" />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toHaveAttribute('title', 'Actualiza tu plan');
    });

    it('should not have title attribute when tooltip not provided', () => {
      const { container } = render(<PremiumBadge />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).not.toHaveAttribute('title');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(<PremiumBadge size="sm" />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('text-xs');
    });

    it('should render default size', () => {
      const { container } = render(<PremiumBadge />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('text-xs'); // Default is sm
    });

    it('should render medium size', () => {
      const { container } = render(<PremiumBadge size="md" />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('text-sm');
    });

    it('should render large size', () => {
      const { container } = render(<PremiumBadge size="lg" />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('Styles', () => {
    it('should have premium color styling', () => {
      const { container } = render(<PremiumBadge />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('bg-gradient-to-r');
      expect(badge).toHaveClass('from-purple-600');
      expect(badge).toHaveClass('to-pink-600');
    });

    it('should apply custom className', () => {
      const { container } = render(<PremiumBadge className="custom-class" />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible text', () => {
      render(<PremiumBadge />);

      expect(screen.getByText(/premium/i)).toBeInTheDocument();
    });

    it('should have aria-label with tooltip text', () => {
      render(<PremiumBadge tooltip="Actualiza tu plan" />);

      const badge = screen.getByText(/premium/i).closest('[data-slot="badge"]');
      expect(badge).toHaveAttribute('aria-label', 'Actualiza tu plan');
    });

    it('should not have aria-label without tooltip', () => {
      render(<PremiumBadge />);

      const badge = screen.getByText(/premium/i).closest('[data-slot="badge"]');
      expect(badge).not.toHaveAttribute('aria-label');
    });
  });
});
