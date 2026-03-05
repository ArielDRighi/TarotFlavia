import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('should render placeholder text', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    });

    it('should have data-testid on container', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      render(<SearchBar onSearch={mockOnSearch} value="El Loco" />);

      expect(screen.getByDisplayValue('El Loco')).toBeInTheDocument();
    });
  });

  describe('Debounce behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it('should not call onSearch immediately on input', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'El Loco' } });

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should call onSearch after 300ms debounce', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'El Loco' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockOnSearch).toHaveBeenCalledWith('El Loco');
    });

    it('should debounce rapid typing', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'E' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'El' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'El Loco' } });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('El Loco');
    });
  });

  describe('Controlled input', () => {
    it('should display controlled value', () => {
      render(<SearchBar onSearch={mockOnSearch} value="test query" />);

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} onChange={mockOnChange} />);

      await user.type(screen.getByRole('searchbox'), 'a');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should apply custom className to container', () => {
      render(<SearchBar onSearch={mockOnSearch} className="custom-class" />);

      const container = screen.getByTestId('search-bar');
      expect(container).toHaveClass('custom-class');
    });
  });
});
