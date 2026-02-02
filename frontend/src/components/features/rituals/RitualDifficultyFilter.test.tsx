import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RitualDifficultyFilter } from './RitualDifficultyFilter';
import { RitualDifficulty } from '@/types/ritual.types';

describe('RitualDifficultyFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render select trigger', () => {
      render(<RitualDifficultyFilter onChange={mockOnChange} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('should show "Todas las dificultades" when no value is selected', () => {
      render(<RitualDifficultyFilter onChange={mockOnChange} />);

      expect(screen.getByText('Todas las dificultades')).toBeInTheDocument();
    });

    it('should display selected difficulty as BEGINNER', () => {
      render(<RitualDifficultyFilter value={RitualDifficulty.BEGINNER} onChange={mockOnChange} />);

      expect(screen.getByText('Principiante')).toBeInTheDocument();
    });

    it('should display selected difficulty as INTERMEDIATE', () => {
      render(
        <RitualDifficultyFilter value={RitualDifficulty.INTERMEDIATE} onChange={mockOnChange} />
      );

      expect(screen.getByText('Intermedio')).toBeInTheDocument();
    });

    it('should display selected difficulty as ADVANCED', () => {
      render(<RitualDifficultyFilter value={RitualDifficulty.ADVANCED} onChange={mockOnChange} />);

      expect(screen.getByText('Avanzado')).toBeInTheDocument();
    });

    it('should have correct width', () => {
      render(<RitualDifficultyFilter onChange={mockOnChange} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('w-[180px]');
    });
  });

  describe('Controlled component behavior', () => {
    it('should update display when value prop changes from BEGINNER to ADVANCED', () => {
      const { rerender } = render(
        <RitualDifficultyFilter value={RitualDifficulty.BEGINNER} onChange={mockOnChange} />
      );

      expect(screen.getByText('Principiante')).toBeInTheDocument();

      rerender(
        <RitualDifficultyFilter value={RitualDifficulty.ADVANCED} onChange={mockOnChange} />
      );

      expect(screen.getByText('Avanzado')).toBeInTheDocument();
      expect(screen.queryByText('Principiante')).not.toBeInTheDocument();
    });

    it('should update display when value prop changes from INTERMEDIATE to BEGINNER', () => {
      const { rerender } = render(
        <RitualDifficultyFilter value={RitualDifficulty.INTERMEDIATE} onChange={mockOnChange} />
      );

      expect(screen.getByText('Intermedio')).toBeInTheDocument();

      rerender(
        <RitualDifficultyFilter value={RitualDifficulty.BEGINNER} onChange={mockOnChange} />
      );

      expect(screen.getByText('Principiante')).toBeInTheDocument();
      expect(screen.queryByText('Intermedio')).not.toBeInTheDocument();
    });

    it('should show "Todas las dificultades" when value changes from defined to undefined', () => {
      const { rerender } = render(
        <RitualDifficultyFilter value={RitualDifficulty.BEGINNER} onChange={mockOnChange} />
      );

      expect(screen.getByText('Principiante')).toBeInTheDocument();

      rerender(<RitualDifficultyFilter value={undefined} onChange={mockOnChange} />);

      expect(screen.getByText('Todas las dificultades')).toBeInTheDocument();
      expect(screen.queryByText('Principiante')).not.toBeInTheDocument();
    });

    it('should show difficulty when value changes from undefined to defined', () => {
      const { rerender } = render(
        <RitualDifficultyFilter value={undefined} onChange={mockOnChange} />
      );

      expect(screen.getByText('Todas las dificultades')).toBeInTheDocument();

      rerender(
        <RitualDifficultyFilter value={RitualDifficulty.ADVANCED} onChange={mockOnChange} />
      );

      expect(screen.getByText('Avanzado')).toBeInTheDocument();
      expect(screen.queryByText('Todas las dificultades')).not.toBeInTheDocument();
    });
  });

  describe('Component props', () => {
    it('should pass value prop to Select component', () => {
      render(
        <RitualDifficultyFilter value={RitualDifficulty.INTERMEDIATE} onChange={mockOnChange} />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      // The value is reflected in the displayed text
      expect(screen.getByText('Intermedio')).toBeInTheDocument();
    });

    it('should handle undefined value correctly', () => {
      render(<RitualDifficultyFilter value={undefined} onChange={mockOnChange} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      // When undefined, it defaults to "all" which shows "Todas las dificultades"
      expect(screen.getByText('Todas las dificultades')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have combobox role', () => {
      render(<RitualDifficultyFilter onChange={mockOnChange} />);

      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<RitualDifficultyFilter onChange={mockOnChange} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('should be identifiable by role and have value displayed', () => {
      render(<RitualDifficultyFilter value={RitualDifficulty.BEGINNER} onChange={mockOnChange} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      // The value is shown in the trigger
      expect(screen.getByText('Principiante')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle all difficulty enum values', () => {
      const difficulties = [
        { value: RitualDifficulty.BEGINNER, text: 'Principiante' },
        { value: RitualDifficulty.INTERMEDIATE, text: 'Intermedio' },
        { value: RitualDifficulty.ADVANCED, text: 'Avanzado' },
      ];

      difficulties.forEach(({ value, text }) => {
        const { unmount } = render(
          <RitualDifficultyFilter value={value} onChange={mockOnChange} />
        );

        expect(screen.getByText(text)).toBeInTheDocument();

        unmount();
      });
    });

    it('should maintain consistent rendering across multiple rerenders', () => {
      const { rerender } = render(
        <RitualDifficultyFilter value={RitualDifficulty.BEGINNER} onChange={mockOnChange} />
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <RitualDifficultyFilter value={RitualDifficulty.BEGINNER} onChange={mockOnChange} />
        );
        expect(screen.getByText('Principiante')).toBeInTheDocument();
      }
    });

    it('should not call onChange on initial render', () => {
      render(<RitualDifficultyFilter value={RitualDifficulty.BEGINNER} onChange={mockOnChange} />);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
