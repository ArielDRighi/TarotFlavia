import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  describe('variant: page (default)', () => {
    it('should render default title', () => {
      render(<ErrorState />);

      expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    });

    it('should render default error message', () => {
      render(<ErrorState />);

      expect(
        screen.getByText('Ha ocurrido un error inesperado. Por favor intenta de nuevo.')
      ).toBeInTheDocument();
    });

    it('should render AlertCircle icon', () => {
      render(<ErrorState />);

      const icon = screen.getByTestId('error-state-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-destructive');
    });

    it('should have full page layout', () => {
      render(<ErrorState />);

      const container = screen.getByTestId('error-state-container');
      expect(container).toHaveClass('py-16');
      expect(container).toHaveClass('min-h-[50vh]');
    });

    it('should render large icon in page variant', () => {
      render(<ErrorState />);

      const iconContainer = screen.getByTestId('error-state-icon-container');
      expect(iconContainer).toHaveClass('w-20');
      expect(iconContainer).toHaveClass('h-20');
    });
  });

  describe('variant: card', () => {
    it('should have card styling', () => {
      render(<ErrorState variant="card" message="Error" />);

      const container = screen.getByTestId('error-state-container');
      expect(container).toHaveClass('rounded-lg');
      expect(container).toHaveClass('border');
      expect(container).toHaveClass('border-destructive/50');
      expect(container).toHaveClass('bg-destructive/5');
      expect(container).toHaveClass('p-6');
    });

    it('should render medium-sized icon', () => {
      render(<ErrorState variant="card" message="Error" />);

      const icon = screen.getByTestId('error-state-icon');
      expect(icon).toHaveClass('h-8');
      expect(icon).toHaveClass('w-8');
    });

    it('should render title as h3', () => {
      render(<ErrorState variant="card" title="Error Title" message="Error" />);

      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Error Title');
    });
  });

  describe('variant: inline', () => {
    it('should use Alert component', () => {
      render(<ErrorState variant="inline" message="Error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should render small icon', () => {
      render(<ErrorState variant="inline" message="Error" />);

      const icon = screen.getByTestId('error-state-icon');
      expect(icon).toHaveClass('h-4');
      expect(icon).toHaveClass('w-4');
    });

    it('should render AlertTitle with title prop', () => {
      render(<ErrorState variant="inline" title="Custom Title" message="Error" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  describe('custom messages', () => {
    it('should render custom title', () => {
      render(<ErrorState title="Custom Error" message="Test" />);

      expect(screen.getByText('Custom Error')).toBeInTheDocument();
      expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();
    });

    it('should render custom message string', () => {
      render(<ErrorState message="Custom error message" />);

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should extract message from Error object', () => {
      const error = new Error('Error object message');
      render(<ErrorState error={error} />);

      expect(screen.getByText('Error object message')).toBeInTheDocument();
    });

    it('should render error as string directly', () => {
      render(<ErrorState error="String error" />);

      expect(screen.getByText('String error')).toBeInTheDocument();
    });

    it('should prioritize message prop over error prop', () => {
      const error = new Error('Error message');
      render(<ErrorState message="Priority message" error={error} />);

      expect(screen.getByText('Priority message')).toBeInTheDocument();
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorState message="Error" />);

      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
    });

    it('should render retry button when onRetry is provided', () => {
      render(<ErrorState message="Error" onRetry={() => {}} />);

      expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();
    });

    it('should call onRetry when button is clicked', async () => {
      const user = userEvent.setup();
      const handleRetry = vi.fn();

      render(<ErrorState message="Error" onRetry={handleRetry} />);

      await user.click(screen.getByRole('button', { name: /Intentar de nuevo/i }));

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should disable retry button when isRetrying is true', () => {
      render(<ErrorState message="Error" onRetry={() => {}} isRetrying={true} />);

      const button = screen.getByRole('button', { name: /Intentar de nuevo/i });
      expect(button).toBeDisabled();
    });

    it('should show spinner when retrying', () => {
      render(<ErrorState message="Error" onRetry={() => {}} isRetrying={true} />);

      const spinner = screen.getByTestId('error-state-retry-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should show correct retry button text in inline variant', () => {
      render(<ErrorState variant="inline" message="Error" onRetry={() => {}} />);

      expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should not render home link by default', () => {
      render(<ErrorState message="Error" />);

      expect(screen.queryByRole('link', { name: /inicio/i })).not.toBeInTheDocument();
    });

    it('should render home link when showHomeLink is true', () => {
      render(<ErrorState message="Error" showHomeLink={true} />);

      const homeLink = screen.getByRole('link', { name: /Ir al inicio/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should render Home icon in home link', () => {
      render(<ErrorState message="Error" showHomeLink={true} />);

      const homeIcon = screen.getByTestId('error-state-home-icon');
      expect(homeIcon).toBeInTheDocument();
    });

    it('should not render back button by default', () => {
      render(<ErrorState message="Error" />);

      expect(screen.queryByRole('button', { name: /volver/i })).not.toBeInTheDocument();
    });

    it('should render back button when showBackLink is true', () => {
      render(<ErrorState message="Error" showBackLink={true} />);

      expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
    });

    it('should render ArrowLeft icon in back button', () => {
      render(<ErrorState message="Error" showBackLink={true} />);

      const backIcon = screen.getByTestId('error-state-back-icon');
      expect(backIcon).toBeInTheDocument();
    });

    it('should call window.history.back when back button is clicked', async () => {
      const user = userEvent.setup();
      const mockBack = vi.fn();
      window.history.back = mockBack;

      render(<ErrorState message="Error" showBackLink={true} />);

      await user.click(screen.getByRole('button', { name: /Volver/i }));

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('actions layout', () => {
    it('should render actions in responsive flex layout', () => {
      render(<ErrorState message="Error" onRetry={() => {}} showHomeLink showBackLink />);

      const actionsContainer = screen.getByTestId('error-state-actions');
      expect(actionsContainer).toHaveClass('flex');
      expect(actionsContainer).toHaveClass('flex-col');
      expect(actionsContainer).toHaveClass('sm:flex-row');
    });
  });

  describe('custom props', () => {
    it('should accept custom className', () => {
      render(<ErrorState message="Error" className="custom-class" />);

      const container = screen.getByTestId('error-state-container');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy in page variant', () => {
      render(<ErrorState title="Error" message="Test" />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Error');
    });

    it('should have proper heading hierarchy in card variant', () => {
      render(<ErrorState variant="card" title="Error" message="Test" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Error');
    });
  });
});
