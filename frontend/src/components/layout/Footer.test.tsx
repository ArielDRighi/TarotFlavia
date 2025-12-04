import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  describe('Rendering', () => {
    it('should render footer element', () => {
      render(<Footer />);

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should render copyright text', () => {
      render(<Footer />);

      expect(screen.getByText(/© 2025 TarotFlavia/i)).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should render "Términos" link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /términos/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/terminos');
    });

    it('should render "Privacidad" link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /privacidad/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/privacidad');
    });

    it('should render "Contacto" link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /contacto/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/contacto');
    });
  });

  describe('Styling', () => {
    it('should have muted text color', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('text-muted-foreground');
    });

    it('should have vertical padding', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('py-6');
    });

    it('should center content', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('text-center');
    });
  });

  describe('Accessibility', () => {
    it('should have proper footer landmark', () => {
      render(<Footer />);

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have navigation landmark for links', () => {
      render(<Footer />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
