import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SuitSelector } from './SuitSelector';
import { Suit } from '@/types/encyclopedia.types';

describe('SuitSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('Rendering', () => {
    it('should render all suit buttons', () => {
      render(<SuitSelector onSelect={mockOnSelect} />);

      expect(screen.getByRole('button', { name: /bastos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copas/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /espadas/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /oros/i })).toBeInTheDocument();
    });

    it('should render "Todos" button', () => {
      render(<SuitSelector onSelect={mockOnSelect} />);

      expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument();
    });

    it('should have data-testid on container', () => {
      render(<SuitSelector onSelect={mockOnSelect} />);

      expect(screen.getByTestId('suit-selector')).toBeInTheDocument();
    });
  });

  describe('Selection state', () => {
    it('should highlight "Todos" when no suit is selected', () => {
      render(<SuitSelector selected={undefined} onSelect={mockOnSelect} />);

      const todosButton = screen.getByRole('button', { name: /todos/i });
      expect(todosButton).toHaveAttribute('data-variant', 'default');
    });

    it('should highlight selected suit button', () => {
      render(<SuitSelector selected={Suit.WANDS} onSelect={mockOnSelect} />);

      const bastosButton = screen.getByRole('button', { name: /bastos/i });
      expect(bastosButton).toHaveAttribute('data-variant', 'default');
    });

    it('should show outline for unselected suits', () => {
      render(<SuitSelector selected={Suit.WANDS} onSelect={mockOnSelect} />);

      const copasButton = screen.getByRole('button', { name: /copas/i });
      expect(copasButton).toHaveAttribute('data-variant', 'outline');
    });

    it('should show outline for "Todos" when a suit is selected', () => {
      render(<SuitSelector selected={Suit.CUPS} onSelect={mockOnSelect} />);

      const todosButton = screen.getByRole('button', { name: /todos/i });
      expect(todosButton).toHaveAttribute('data-variant', 'outline');
    });
  });

  describe('Interaction', () => {
    it('should call onSelect with undefined when "Todos" is clicked', async () => {
      const user = userEvent.setup();
      render(<SuitSelector onSelect={mockOnSelect} />);

      await user.click(screen.getByRole('button', { name: /todos/i }));

      expect(mockOnSelect).toHaveBeenCalledWith(undefined);
    });

    it('should call onSelect with Suit.WANDS when Bastos is clicked', async () => {
      const user = userEvent.setup();
      render(<SuitSelector onSelect={mockOnSelect} />);

      await user.click(screen.getByRole('button', { name: /bastos/i }));

      expect(mockOnSelect).toHaveBeenCalledWith(Suit.WANDS);
    });

    it('should call onSelect with Suit.CUPS when Copas is clicked', async () => {
      const user = userEvent.setup();
      render(<SuitSelector onSelect={mockOnSelect} />);

      await user.click(screen.getByRole('button', { name: /copas/i }));

      expect(mockOnSelect).toHaveBeenCalledWith(Suit.CUPS);
    });

    it('should call onSelect with Suit.SWORDS when Espadas is clicked', async () => {
      const user = userEvent.setup();
      render(<SuitSelector onSelect={mockOnSelect} />);

      await user.click(screen.getByRole('button', { name: /espadas/i }));

      expect(mockOnSelect).toHaveBeenCalledWith(Suit.SWORDS);
    });

    it('should call onSelect with Suit.PENTACLES when Oros is clicked', async () => {
      const user = userEvent.setup();
      render(<SuitSelector onSelect={mockOnSelect} />);

      await user.click(screen.getByRole('button', { name: /oros/i }));

      expect(mockOnSelect).toHaveBeenCalledWith(Suit.PENTACLES);
    });
  });

  describe('Styling', () => {
    it('should apply custom className to container', () => {
      render(<SuitSelector onSelect={mockOnSelect} className="custom-class" />);

      const container = screen.getByTestId('suit-selector');
      expect(container).toHaveClass('custom-class');
    });
  });
});
