import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  describe('rendering', () => {
    it('should render with pending status', () => {
      render(<StatusBadge status="pending" />);

      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('should render with confirmed status', () => {
      render(<StatusBadge status="confirmed" />);

      expect(screen.getByText('Confirmada')).toBeInTheDocument();
    });

    it('should render with completed status', () => {
      render(<StatusBadge status="completed" />);

      expect(screen.getByText('Completada')).toBeInTheDocument();
    });

    it('should render with cancelled status', () => {
      render(<StatusBadge status="cancelled" />);

      expect(screen.getByText('Cancelada')).toBeInTheDocument();
    });
  });

  describe('styles by status', () => {
    describe('pending status', () => {
      it('should have yellow background', () => {
        render(<StatusBadge status="pending" />);

        const badge = screen.getByText('Pendiente');
        expect(badge).toHaveStyle({ backgroundColor: '#ECC94B' });
      });
    });

    describe('confirmed status', () => {
      it('should have green background', () => {
        render(<StatusBadge status="confirmed" />);

        const badge = screen.getByText('Confirmada');
        expect(badge).toHaveStyle({ backgroundColor: '#48BB78' });
      });
    });

    describe('completed status', () => {
      it('should have blue background', () => {
        render(<StatusBadge status="completed" />);

        const badge = screen.getByText('Completada');
        expect(badge).toHaveStyle({ backgroundColor: '#4299E1' });
      });
    });

    describe('cancelled status', () => {
      it('should have red background', () => {
        render(<StatusBadge status="cancelled" />);

        const badge = screen.getByText('Cancelada');
        expect(badge).toHaveStyle({ backgroundColor: '#F56565' });
      });
    });
  });

  describe('text translations', () => {
    it('should display "Pendiente" for pending status', () => {
      render(<StatusBadge status="pending" />);

      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('should display "Confirmada" for confirmed status', () => {
      render(<StatusBadge status="confirmed" />);

      expect(screen.getByText('Confirmada')).toBeInTheDocument();
    });

    it('should display "Completada" for completed status', () => {
      render(<StatusBadge status="completed" />);

      expect(screen.getByText('Completada')).toBeInTheDocument();
    });

    it('should display "Cancelada" for cancelled status', () => {
      render(<StatusBadge status="cancelled" />);

      expect(screen.getByText('Cancelada')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have data-slot attribute for badge', () => {
      render(<StatusBadge status="pending" />);

      const badge = screen.getByText('Pendiente');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });
  });

  describe('className prop', () => {
    it('should accept and apply custom className', () => {
      render(<StatusBadge status="completed" className="custom-class" />);

      const badge = screen.getByText('Completada');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('text color contrast', () => {
    it('should have white text for all statuses for readability', () => {
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
      const labels = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];

      statuses.forEach((status, index) => {
        const { unmount } = render(<StatusBadge status={status} />);
        const badge = screen.getByText(labels[index]);
        expect(badge).toHaveStyle({ color: '#FFFFFF' });
        unmount();
      });
    });
  });
});
