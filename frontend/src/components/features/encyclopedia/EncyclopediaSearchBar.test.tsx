import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EncyclopediaSearchBar } from './EncyclopediaSearchBar';

describe('EncyclopediaSearchBar', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('should render placeholder text', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    });

    it('should have data-testid on container', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      expect(screen.getByTestId('encyclopedia-search-bar')).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} value="El Loco" />);

      expect(screen.getByDisplayValue('El Loco')).toBeInTheDocument();
    });

    it('should not show clear button when input is empty', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      expect(screen.queryByRole('button', { name: /limpiar/i })).not.toBeInTheDocument();
    });

    it('should show clear button when input has value', async () => {
      const user = userEvent.setup();
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      await user.type(screen.getByRole('searchbox'), 'El Loco');

      expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument();
    });
  });

  describe('Clear button', () => {
    it('should clear input and call onSearch with empty string when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      await user.type(screen.getByRole('searchbox'), 'El Loco');
      mockOnSearch.mockClear();

      await user.click(screen.getByRole('button', { name: /limpiar/i }));

      expect(screen.getByRole('searchbox')).toHaveValue('');
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });

    it('should hide clear button after clearing', async () => {
      const user = userEvent.setup();
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      await user.type(screen.getByRole('searchbox'), 'El Loco');
      await user.click(screen.getByRole('button', { name: /limpiar/i }));

      expect(screen.queryByRole('button', { name: /limpiar/i })).not.toBeInTheDocument();
    });

    it('should call onChange with empty string when clear button clicked (controlled)', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(
        <EncyclopediaSearchBar onSearch={mockOnSearch} value="El Loco" onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('button', { name: /limpiar/i }));

      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(mockOnSearch).toHaveBeenCalledWith('');
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
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'El Loco' } });

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should call onSearch after 300ms debounce', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'El Loco' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockOnSearch).toHaveBeenCalledWith('El Loco');
    });

    it('should debounce rapid typing', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

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

    it('should call onSearch with initial value on mount when value is non-empty', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} value="El Loco" />);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockOnSearch).toHaveBeenCalledWith('El Loco');
    });

    it('should not call onSearch on mount when initial value is empty', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} />);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('Controlled input', () => {
    it('should display controlled value', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} value="test query" />);

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} onChange={mockOnChange} />);

      await user.type(screen.getByRole('searchbox'), 'a');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should apply custom className to container', () => {
      render(<EncyclopediaSearchBar onSearch={mockOnSearch} className="custom-class" />);

      const container = screen.getByTestId('encyclopedia-search-bar');
      expect(container).toHaveClass('custom-class');
    });
  });
});
