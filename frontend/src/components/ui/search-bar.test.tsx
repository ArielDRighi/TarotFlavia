import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Search test" />);

    expect(screen.getByPlaceholderText('Search test')).toBeInTheDocument();
  });

  it('renders with default placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('calls onSearch with debounced value', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} placeholder="Search..." />);

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'test');

    // Wait for debounce to complete (debounce is 300ms in component)
    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith('test');
      },
      { timeout: 1000 }
    );
  });

  it('shows clear button when value exists', async () => {
    const user = userEvent.setup();

    render(<SearchBar onSearch={vi.fn()} />);

    const input = screen.getByRole('searchbox');

    // Clear button should not be visible initially
    expect(screen.queryByRole('button', { name: /limpiar/i })).not.toBeInTheDocument();

    // Type something
    await user.type(input, 'test');

    // Clear button should appear
    expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={onSearch} debounceMs={100} />);

    const input = screen.getByRole('searchbox');

    // Type something
    await user.type(input, 'test');

    // Click clear button
    const clearButton = await screen.findByRole('button', {
      name: /limpiar/i,
    });
    await user.click(clearButton);

    // Input should be empty
    expect(input).toHaveValue('');

    // Should call onSearch with empty string after debounce
    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith('');
      },
      { timeout: 200 }
    );
  });

  it('renders with default value', () => {
    render(<SearchBar onSearch={vi.fn()} defaultValue="initial value" />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('initial value');
  });

  it('applies custom className', () => {
    render(<SearchBar onSearch={vi.fn()} className="custom-class" />);

    const container = screen.getByTestId('search-bar');
    expect(container).toHaveClass('custom-class');
  });
});
