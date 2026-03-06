import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CategoryTabs } from './CategoryTabs';
import { ArcanaType } from '@/types/encyclopedia.types';

describe('CategoryTabs', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render "Todas" tab', () => {
      render(<CategoryTabs selected={undefined} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /todas/i })).toBeInTheDocument();
    });

    it('should render "Arcanos Mayores" tab', () => {
      render(<CategoryTabs selected={undefined} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /arcanos mayores/i })).toBeInTheDocument();
    });

    it('should render "Arcanos Menores" tab', () => {
      render(<CategoryTabs selected={undefined} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /arcanos menores/i })).toBeInTheDocument();
    });

    it('should have data-testid on container', () => {
      render(<CategoryTabs selected={undefined} onChange={mockOnChange} />);

      expect(screen.getByTestId('category-tabs')).toBeInTheDocument();
    });
  });

  describe('Selection state', () => {
    it('should highlight "Todas" tab when no category selected', () => {
      render(<CategoryTabs selected={undefined} onChange={mockOnChange} />);

      const todasButton = screen.getByRole('button', { name: /todas/i });
      expect(todasButton).toHaveAttribute('data-variant', 'default');
    });

    it('should highlight "Arcanos Mayores" when MAJOR is selected', () => {
      render(<CategoryTabs selected={ArcanaType.MAJOR} onChange={mockOnChange} />);

      const majorButton = screen.getByRole('button', { name: /arcanos mayores/i });
      expect(majorButton).toHaveAttribute('data-variant', 'default');
    });

    it('should highlight "Arcanos Menores" when MINOR is selected', () => {
      render(<CategoryTabs selected={ArcanaType.MINOR} onChange={mockOnChange} />);

      const minorButton = screen.getByRole('button', { name: /arcanos menores/i });
      expect(minorButton).toHaveAttribute('data-variant', 'default');
    });

    it('should show outline for non-selected tabs', () => {
      render(<CategoryTabs selected={ArcanaType.MAJOR} onChange={mockOnChange} />);

      const todasButton = screen.getByRole('button', { name: /todas/i });
      expect(todasButton).toHaveAttribute('data-variant', 'outline');
    });
  });

  describe('Interaction', () => {
    it('should call onChange with undefined when "Todas" is clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryTabs selected={ArcanaType.MAJOR} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /todas/i }));

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onChange with MAJOR when "Arcanos Mayores" is clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryTabs selected={undefined} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /arcanos mayores/i }));

      expect(mockOnChange).toHaveBeenCalledWith(ArcanaType.MAJOR);
    });

    it('should call onChange with MINOR when "Arcanos Menores" is clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryTabs selected={undefined} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /arcanos menores/i }));

      expect(mockOnChange).toHaveBeenCalledWith(ArcanaType.MINOR);
    });
  });

  describe('Styling', () => {
    it('should apply custom className to container', () => {
      render(
        <CategoryTabs selected={undefined} onChange={mockOnChange} className="custom-class" />
      );

      const container = screen.getByTestId('category-tabs');
      expect(container).toHaveClass('custom-class');
    });
  });
});
