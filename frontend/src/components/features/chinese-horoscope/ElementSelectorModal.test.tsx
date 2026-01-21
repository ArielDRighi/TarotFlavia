/**
 * ElementSelectorModal Component Tests
 *
 * Tests for the modal that displays the 5 Wu Xing elements for selection
 * when a user clicks on an animal to explore horoscopes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ElementSelectorModal } from './ElementSelectorModal';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

describe('ElementSelectorModal', () => {
  const mockOnSelectElement = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    animal: ChineseZodiacAnimal.MONKEY,
    animalNameEs: 'Mono',
    animalEmoji: '🐒',
    onSelectElement: mockOnSelectElement,
    onOpenChange: mockOnOpenChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when open', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      expect(screen.getByText(/Mono/i)).toBeInTheDocument();
      expect(screen.getByText(/Selecciona tu elemento Wu Xing/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<ElementSelectorModal {...defaultProps} open={false} />);

      expect(screen.queryByText(/Selecciona tu elemento Wu Xing/i)).not.toBeInTheDocument();
    });

    it('should have data-testid for accessibility', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      expect(screen.getByTestId('element-selector-modal')).toBeInTheDocument();
    });

    it('should show animal emoji in title', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      expect(screen.getByText('🐒')).toBeInTheDocument();
    });

    it('should show animal name in title', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      expect(screen.getByText(/Mono/i)).toBeInTheDocument();
    });
  });

  describe('Element Options', () => {
    it('should render 5 element options (Metal, Water, Wood, Fire, Earth)', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      expect(screen.getByRole('radio', { name: /Metal/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Agua/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Madera/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Fuego/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Tierra/i })).toBeInTheDocument();
    });

    it('should show element icons', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      expect(screen.getByText('⚪')).toBeInTheDocument(); // Metal
      expect(screen.getByText('🔵')).toBeInTheDocument(); // Water
      expect(screen.getByText('🟢')).toBeInTheDocument(); // Wood
      expect(screen.getByText('🔴')).toBeInTheDocument(); // Fire
      expect(screen.getByText('🟤')).toBeInTheDocument(); // Earth
    });

    it('should display example years for each element', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      // For Monkey: base year 1920 (Metal)
      // Metal: 1920, 1980, 2040
      expect(screen.getByText(/1920/)).toBeInTheDocument();
      expect(screen.getByText(/1980/)).toBeInTheDocument();
      expect(screen.getByText(/2040/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onSelectElement with correct element when Metal is clicked', async () => {
      const user = userEvent.setup();
      render(<ElementSelectorModal {...defaultProps} />);

      const metalRadio = screen.getByRole('radio', { name: /Metal/i });
      await user.click(metalRadio);

      // Should auto-confirm after selection
      expect(mockOnSelectElement).toHaveBeenCalledWith('metal');
    });

    it('should call onSelectElement with correct element when Fire is clicked', async () => {
      const user = userEvent.setup();
      render(<ElementSelectorModal {...defaultProps} />);

      const fireRadio = screen.getByRole('radio', { name: /Fuego/i });
      await user.click(fireRadio);

      expect(mockOnSelectElement).toHaveBeenCalledWith('fire');
    });

    it('should call onOpenChange with false when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ElementSelectorModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should close modal after selecting an element', async () => {
      const user = userEvent.setup();
      render(<ElementSelectorModal {...defaultProps} />);

      const waterRadio = screen.getByRole('radio', { name: /Agua/i });
      await user.click(waterRadio);

      // Modal should close after selection
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Helper Text', () => {
    it('should show help text about using calculator for exact birth element', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      expect(screen.getByText(/¿No sabes tu elemento\?/i)).toBeInTheDocument();
      expect(screen.getByText(/calculador/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for radio group', () => {
      render(<ElementSelectorModal {...defaultProps} />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
      expect(radioGroup).toHaveAccessibleName(/elemento wu xing/i);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ElementSelectorModal {...defaultProps} />);

      const firstRadio = screen.getByRole('radio', { name: /Metal/i });
      firstRadio.focus();

      expect(firstRadio).toHaveFocus();

      // Use arrow keys to navigate between radio buttons within RadioGroup
      await user.keyboard('{ArrowDown}');
      const nextRadio = screen.getByRole('radio', { name: /Agua/i });
      expect(nextRadio).toHaveFocus();
    });
  });

  describe('Different Animals', () => {
    it('should calculate correct years for Dragon (base year 1940)', () => {
      render(
        <ElementSelectorModal
          {...defaultProps}
          animal={ChineseZodiacAnimal.DRAGON}
          animalNameEs="Dragón"
          animalEmoji="🐉"
        />
      );

      // Dragon Metal years from this base: 1940 (Metal) → 2000 (Metal)
      expect(screen.getByText(/1940/)).toBeInTheDocument();
      expect(screen.getByText(/2000/)).toBeInTheDocument();
    });

    it('should calculate correct years for Rat (base year 1924)', () => {
      render(
        <ElementSelectorModal
          {...defaultProps}
          animal={ChineseZodiacAnimal.RAT}
          animalNameEs="Rata"
          animalEmoji="🐀"
        />
      );

      // Rat = 1924 (Metal) → 1984 (Metal) → 2044 (Metal)
      expect(screen.getByText(/1924/)).toBeInTheDocument();
      expect(screen.getByText(/1984/)).toBeInTheDocument();
      expect(screen.getByText(/2044/)).toBeInTheDocument();
    });
  });
});
