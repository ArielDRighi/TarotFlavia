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

      expect(screen.getByText(/© 2025 Auguria/i)).toBeInTheDocument();
    });
  });

  describe('Service Links', () => {
    it('should render "Carta del Día" service link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /^carta del día$/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/carta-del-dia');
    });

    it('should render "Horóscopo" service link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /^horóscopo$/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/horoscopo');
    });

    it('should render "Horóscopo Chino" service link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /horóscopo chino/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/horoscopo-chino');
    });

    it('should render "Numerología" service link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /numerología/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/numerologia');
    });

    it('should render "Rituales" service link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /rituales/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/rituales');
    });

    it('should render "Péndulo" service link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /péndulo/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/pendulo');
    });

    it('should render "Carta Astral" service link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /carta astral/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/carta-astral');
    });
  });

  describe('Legal Links', () => {
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
