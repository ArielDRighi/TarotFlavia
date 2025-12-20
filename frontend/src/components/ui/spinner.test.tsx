import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('should render spinner with default props', () => {
      render(<Spinner />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Spinner className="custom-class" />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('custom-class');
    });

    it('should have animate-spin class', () => {
      render(<Spinner />);

      const icon = screen.getByTestId('spinner-icon');
      expect(icon).toHaveClass('animate-spin');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Spinner size="sm" />);

      const icon = screen.getByTestId('spinner-icon');
      expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('should render medium size (default)', () => {
      render(<Spinner size="md" />);

      const icon = screen.getByTestId('spinner-icon');
      expect(icon).toHaveClass('h-6', 'w-6');
    });

    it('should render large size', () => {
      render(<Spinner size="lg" />);

      const icon = screen.getByTestId('spinner-icon');
      expect(icon).toHaveClass('h-8', 'w-8');
    });

    it('should use medium size as default when size is not specified', () => {
      render(<Spinner />);

      const icon = screen.getByTestId('spinner-icon');
      expect(icon).toHaveClass('h-6', 'w-6');
    });
  });

  describe('Text Label', () => {
    it('should render with text label', () => {
      render(<Spinner text="Cargando..." />);

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should not render text when not provided', () => {
      render(<Spinner />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner.textContent).toBe('');
    });

    it('should render text with correct spacing', () => {
      render(<Spinner text="Loading" />);

      const text = screen.getByText('Loading');
      expect(text).toHaveClass('ml-2');
    });
  });

  describe('Centering', () => {
    it('should center spinner when centered prop is true', () => {
      render(<Spinner centered />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('flex', 'justify-center', 'items-center');
    });

    it('should not center spinner when centered prop is false', () => {
      render(<Spinner centered={false} />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).not.toHaveClass('justify-center');
    });

    it('should center by default when centered prop is not specified', () => {
      render(<Spinner />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('flex', 'justify-center', 'items-center');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for accessibility', () => {
      render(<Spinner />);

      const icon = screen.getByTestId('spinner-icon');
      expect(icon).toHaveAttribute('aria-label', 'Cargando');
    });

    it('should use custom aria-label when text is provided', () => {
      render(<Spinner text="Loading data" />);

      const icon = screen.getByTestId('spinner-icon');
      expect(icon).toHaveAttribute('aria-label', 'Loading data');
    });
  });
});
