import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorDisplay } from './error-display';

describe('ErrorDisplay', () => {
  describe('rendering', () => {
    it('should render the error message', () => {
      render(<ErrorDisplay message="Something went wrong" />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render the AlertCircle icon', () => {
      render(<ErrorDisplay message="Error" />);

      const icon = screen.getByTestId('error-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should center the content', () => {
      const { container } = render(<ErrorDisplay message="Error" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('text-center');
    });

    it('should apply soft red color to the icon', () => {
      render(<ErrorDisplay message="Error" />);

      const icon = screen.getByTestId('error-icon');
      expect(icon).toHaveClass('text-destructive/80');
    });
  });

  describe('retry button', () => {
    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorDisplay message="Error" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render retry button when onRetry is provided', () => {
      render(<ErrorDisplay message="Error" onRetry={() => {}} />);

      expect(screen.getByRole('button', { name: /intentar de nuevo/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const handleRetry = vi.fn();
      render(<ErrorDisplay message="Error" onRetry={handleRetry} />);

      const button = screen.getByRole('button', { name: /intentar de nuevo/i });
      fireEvent.click(button);

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have role="alert" on the container', () => {
      render(<ErrorDisplay message="Error" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live="polite" for screen readers', () => {
      render(<ErrorDisplay message="Error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('custom props', () => {
    it('should accept custom className', () => {
      const { container } = render(<ErrorDisplay message="Error" className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should spread additional props to the container', () => {
      render(<ErrorDisplay message="Error" data-testid="custom-error" />);

      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    });
  });
});
