import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { NumberGallery } from './NumberGallery';
import type { NumerologyMeaning } from '@/types/numerology.types';

// Mock the hook
const mockUseNumerologyMeanings = vi.fn();
vi.mock('@/hooks/api/useNumerology', () => ({
  useNumerologyMeanings: () => mockUseNumerologyMeanings(),
}));

// Factory for mock meanings
const createMockMeaning = (number: number): NumerologyMeaning => ({
  number,
  name: `Nombre ${number}`,
  keywords: ['Keyword'],
  description: 'Description',
  strengths: [],
  challenges: [],
  careers: [],
  isMaster: [11, 22, 33].includes(number),
});

describe('NumberGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should render skeletons when loading', () => {
      mockUseNumerologyMeanings.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<NumberGallery />);

      // Should render 12 skeleton items
      const skeletons = document.querySelectorAll('.h-24');
      expect(skeletons.length).toBe(12);
    });
  });

  describe('Success State', () => {
    it('should render all 12 numbers (1-9, 11, 22, 33)', () => {
      const meanings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map(createMockMeaning);

      mockUseNumerologyMeanings.mockReturnValue({
        data: meanings,
        isLoading: false,
      });

      render(<NumberGallery />);

      expect(screen.getByTestId('gallery-number-1')).toBeInTheDocument();
      expect(screen.getByTestId('gallery-number-9')).toBeInTheDocument();
      expect(screen.getByTestId('gallery-number-11')).toBeInTheDocument();
      expect(screen.getByTestId('gallery-number-22')).toBeInTheDocument();
      expect(screen.getByTestId('gallery-number-33')).toBeInTheDocument();
    });

    it('should display number values', () => {
      const meanings = [1, 7, 11].map(createMockMeaning);

      mockUseNumerologyMeanings.mockReturnValue({
        data: meanings,
        isLoading: false,
      });

      render(<NumberGallery />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();
    });

    it('should show "Maestro" label for master numbers', () => {
      const meanings = [11, 22, 33].map(createMockMeaning);

      mockUseNumerologyMeanings.mockReturnValue({
        data: meanings,
        isLoading: false,
      });

      render(<NumberGallery />);

      const maestroLabels = screen.getAllByText('Maestro');
      expect(maestroLabels.length).toBe(3);
    });

    it('should not show "Maestro" label for regular numbers', () => {
      const meanings = [1, 2, 3].map(createMockMeaning);

      mockUseNumerologyMeanings.mockReturnValue({
        data: meanings,
        isLoading: false,
      });

      render(<NumberGallery />);

      // Numbers 1, 2, 3 should not have master badge
      const num1Card = screen.getByTestId('gallery-number-1');
      const num2Card = screen.getByTestId('gallery-number-2');
      const num3Card = screen.getByTestId('gallery-number-3');

      expect(num1Card).not.toHaveTextContent('Maestro');
      expect(num2Card).not.toHaveTextContent('Maestro');
      expect(num3Card).not.toHaveTextContent('Maestro');
    });
  });

  describe('Interactivity', () => {
    it('should call onNumberClick when a number is clicked', () => {
      const onNumberClick = vi.fn();
      const meanings = [1, 7].map(createMockMeaning);

      mockUseNumerologyMeanings.mockReturnValue({
        data: meanings,
        isLoading: false,
      });

      render(<NumberGallery onNumberClick={onNumberClick} />);

      const number7 = screen.getByTestId('gallery-number-7');
      fireEvent.click(number7);

      expect(onNumberClick).toHaveBeenCalledWith(7);
    });

    it('should have hover styles for clickable items', () => {
      const onNumberClick = vi.fn();
      const meanings = [1].map(createMockMeaning);

      mockUseNumerologyMeanings.mockReturnValue({
        data: meanings,
        isLoading: false,
      });

      render(<NumberGallery onNumberClick={onNumberClick} />);

      const number1 = screen.getByTestId('gallery-number-1');
      expect(number1).toHaveClass('cursor-pointer');
      expect(number1).toHaveClass('hover:shadow-lg');
    });
  });

  describe('Layout', () => {
    it('should render in a grid layout', () => {
      const meanings = [1].map(createMockMeaning);

      mockUseNumerologyMeanings.mockReturnValue({
        data: meanings,
        isLoading: false,
      });

      const { container } = render(<NumberGallery />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive grid columns', () => {
      const meanings = [1].map(createMockMeaning);

      mockUseNumerologyMeanings.mockReturnValue({
        data: meanings,
        isLoading: false,
      });

      const { container } = render(<NumberGallery />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-3'); // mobile
      expect(grid).toHaveClass('md:grid-cols-4'); // tablet
      expect(grid).toHaveClass('lg:grid-cols-6'); // desktop
    });
  });
});
