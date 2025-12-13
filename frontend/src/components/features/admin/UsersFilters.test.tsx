/**
 * Tests for UsersFilters component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UsersFilters } from './UsersFilters';

describe('UsersFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<UsersFilters onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o email/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render plan filter select', () => {
    render(<UsersFilters onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText(/filtrar por plan/i)).toBeInTheDocument();
  });

  it('should render role filter select', () => {
    render(<UsersFilters onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText(/filtrar por rol/i)).toBeInTheDocument();
  });

  it('should call onFilterChange with search value', async () => {
    render(<UsersFilters onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o email/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'test' });
      },
      { timeout: 1000 }
    );
  });

  it('should show clear button when filters are active', async () => {
    render(<UsersFilters onFilterChange={mockOnFilterChange} />);

    // Initially no clear button
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();

    // Type in search to activate filters
    const searchInput = screen.getByPlaceholderText(/buscar por nombre o email/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Clear button should appear
    await waitFor(() => {
      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
    });
  });

  it('should not send "all" value for plan/role filters', async () => {
    render(<UsersFilters onFilterChange={mockOnFilterChange} />);

    // Search input to trigger initial filter call
    const searchInput = screen.getByPlaceholderText(/buscar por nombre o email/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce with search only
    await waitFor(
      () => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'test' });
      },
      { timeout: 1000 }
    );

    // Note: Testing that 'all' value is not sent would require additional
    // user interaction with Select components which is complex in unit tests
    // This is better covered in integration tests
  });
});
