import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RitualCategorySelector } from './RitualCategorySelector';
import { RitualCategory } from '@/types/ritual.types';

describe('RitualCategorySelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('Rendering', () => {
    it('should render "Todos" button', () => {
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const todosButton = screen.getByRole('button', { name: /todos/i });
      expect(todosButton).toBeInTheDocument();
    });

    it('should render all category buttons', () => {
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      expect(screen.getByRole('button', { name: /lunar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tarot/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /limpieza/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /protección/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /abundancia/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /amor/i })).toBeInTheDocument();
    });

    it('should display category icons', () => {
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      // Icons are rendered as text content, verify buttons have both icon and name
      const lunarButton = screen.getByRole('button', { name: /🌙lunar/i });
      expect(lunarButton).toBeInTheDocument();
    });

    it('should render in a horizontal scrollable container', () => {
      const { container } = render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('flex', 'gap-2');
    });
  });

  describe('Selection state', () => {
    it('should highlight "Todos" button when no category is selected', () => {
      render(<RitualCategorySelector selected={undefined} onSelect={mockOnSelect} />);

      const todosButton = screen.getByRole('button', { name: /todos/i });
      // Default variant has different styling than outline
      expect(todosButton).toHaveAttribute('data-variant', 'default');
    });

    it('should highlight selected category button', () => {
      render(<RitualCategorySelector selected={RitualCategory.LUNAR} onSelect={mockOnSelect} />);

      const lunarButton = screen.getByRole('button', { name: /🌙lunar/i });
      expect(lunarButton).toHaveAttribute('data-variant', 'default');
    });

    it('should show outline variant for unselected categories', () => {
      render(<RitualCategorySelector selected={RitualCategory.LUNAR} onSelect={mockOnSelect} />);

      const tarotButton = screen.getByRole('button', { name: /🎴tarot/i });
      expect(tarotButton).toHaveAttribute('data-variant', 'outline');
    });

    it('should show outline variant for "Todos" when a category is selected', () => {
      render(<RitualCategorySelector selected={RitualCategory.LUNAR} onSelect={mockOnSelect} />);

      const todosButton = screen.getByRole('button', { name: /todos/i });
      expect(todosButton).toHaveAttribute('data-variant', 'outline');
    });
  });

  describe('Interaction', () => {
    it('should call onSelect with undefined when "Todos" is clicked', async () => {
      const user = userEvent.setup();
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const todosButton = screen.getByRole('button', { name: /todos/i });
      await user.click(todosButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(undefined);
    });

    it('should call onSelect with category when category button is clicked', async () => {
      const user = userEvent.setup();
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const lunarButton = screen.getByRole('button', { name: /🌙lunar/i });
      await user.click(lunarButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(RitualCategory.LUNAR);
    });

    it('should handle clicking different categories', async () => {
      const user = userEvent.setup();
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const lunarButton = screen.getByRole('button', { name: /🌙lunar/i });
      await user.click(lunarButton);

      expect(mockOnSelect).toHaveBeenLastCalledWith(RitualCategory.LUNAR);

      const tarotButton = screen.getByRole('button', { name: /🎴tarot/i });
      await user.click(tarotButton);

      expect(mockOnSelect).toHaveBeenLastCalledWith(RitualCategory.TAROT);
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });

    it('should allow clicking the same category multiple times', async () => {
      const user = userEvent.setup();
      render(<RitualCategorySelector selected={RitualCategory.LUNAR} onSelect={mockOnSelect} />);

      const lunarButton = screen.getByRole('button', { name: /🌙lunar/i });
      await user.click(lunarButton);

      expect(mockOnSelect).toHaveBeenCalledWith(RitualCategory.LUNAR);
    });
  });

  describe('Category counts', () => {
    it('should display count for categories when provided', () => {
      const categories = [
        { category: RitualCategory.LUNAR, count: 5 },
        { category: RitualCategory.TAROT, count: 3 },
      ];

      render(<RitualCategorySelector onSelect={mockOnSelect} categories={categories} />);

      expect(screen.getByRole('button', { name: /🌙lunar.*5/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🎴tarot.*3/i })).toBeInTheDocument();
    });

    it('should not display count when count is 0', () => {
      const categories = [{ category: RitualCategory.LUNAR, count: 0 }];

      render(<RitualCategorySelector onSelect={mockOnSelect} categories={categories} />);

      // Should show just "Lunar" without count
      const lunarButton = screen.getByRole('button', { name: /🌙lunar/i });
      expect(lunarButton.textContent).not.toContain('(0)');
    });

    it('should not display count for categories not in the counts array', () => {
      const categories = [{ category: RitualCategory.LUNAR, count: 5 }];

      render(<RitualCategorySelector onSelect={mockOnSelect} categories={categories} />);

      const tarotButton = screen.getByRole('button', { name: /🎴tarot/i });
      expect(tarotButton.textContent).not.toContain('(');
    });

    it('should handle empty categories array', () => {
      render(<RitualCategorySelector onSelect={mockOnSelect} categories={[]} />);

      // All buttons should render without counts
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <RitualCategorySelector onSelect={mockOnSelect} className="custom-class" />
      );

      const scrollContainer = container.querySelector('.custom-class');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('flex', 'gap-2', 'overflow-x-auto');
    });

    it('should apply small size to buttons', () => {
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const todosButton = screen.getByRole('button', { name: /todos/i });
      expect(todosButton).toHaveAttribute('data-size', 'sm');
    });

    it('should have gap between buttons', () => {
      const { container } = render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const buttonContainer = container.firstChild;
      expect(buttonContainer).toHaveClass('flex', 'gap-2', 'overflow-x-auto');
    });
  });

  describe('All categories', () => {
    it('should render button for each RitualCategory enum value', () => {
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const allCategories = Object.values(RitualCategory);
      const categoryButtons = screen.getAllByRole('button').slice(1); // Skip "Todos" button

      expect(categoryButtons).toHaveLength(allCategories.length);
    });

    it('should handle all category types correctly', async () => {
      const user = userEvent.setup();
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const categories = [
        { name: /🎴tarot/i, value: RitualCategory.TAROT },
        { name: /🌙lunar/i, value: RitualCategory.LUNAR },
        { name: /✨limpieza/i, value: RitualCategory.CLEANSING },
        { name: /🧘meditación/i, value: RitualCategory.MEDITATION },
        { name: /🛡️protección/i, value: RitualCategory.PROTECTION },
        { name: /💰abundancia/i, value: RitualCategory.ABUNDANCE },
        { name: /💕amor/i, value: RitualCategory.LOVE },
        { name: /💚sanación/i, value: RitualCategory.HEALING },
      ];

      for (const { name, value } of categories) {
        const button = screen.getByRole('button', { name });
        await user.click(button);
        expect(mockOnSelect).toHaveBeenLastCalledWith(value);
      }

      expect(mockOnSelect).toHaveBeenCalledTimes(categories.length);
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<RitualCategorySelector onSelect={mockOnSelect} />);

      const todosButton = screen.getByRole('button', { name: /todos/i });
      todosButton.focus();

      await user.keyboard('{Enter}');
      expect(mockOnSelect).toHaveBeenCalledWith(undefined);
    });
  });
});
