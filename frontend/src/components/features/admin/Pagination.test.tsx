/**
 * Tests for Pagination Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    limit: 10,
    onPageChange: mockOnPageChange,
  };

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it('should render pagination info correctly', () => {
    render(<Pagination {...defaultProps} />);

    // Text is split across multiple elements, use getByText matcher function
    const resultText = screen.getByText((_content, element) => {
      return element?.textContent === 'Mostrando 1 a 10 de 50 resultados';
    });
    expect(resultText).toBeInTheDocument();
  });

  it('should display correct item range for current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    // Page 3: items 21-30
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should display correct item range for last page with partial items', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalItems={47} />);

    // Page 5: items 41-47 (not 41-50)
    const resultText = screen.getByText((_content, element) => {
      return element?.textContent === 'Mostrando 41 a 47 de 47 resultados';
    });
    expect(resultText).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByRole('button', { name: /anterior/i });
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    expect(nextButton).toBeDisabled();
  });

  it('should enable previous button when not on first page', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);

    const prevButton = screen.getByRole('button', { name: /anterior/i });
    expect(prevButton).not.toBeDisabled();
  });

  it('should enable next button when not on last page', () => {
    render(<Pagination {...defaultProps} currentPage={4} />);

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('should call onPageChange when previous button clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} currentPage={3} />);

    const prevButton = screen.getByRole('button', { name: /anterior/i });
    await user.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when next button clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} currentPage={3} />);

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('should call onPageChange when page number clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} currentPage={1} />);

    const allButtons = screen.getAllByRole('button');
    const page3Button = allButtons.find((btn) => btn.textContent === '3');

    if (page3Button) {
      await user.click(page3Button);
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    }
  });

  it('should highlight current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const allButtons = screen.getAllByRole('button');
    const page3Button = allButtons.find((btn) => btn.textContent === '3');

    // Current page should have 'default' variant (not 'outline')
    expect(page3Button).toHaveClass('bg-primary');
  });

  it('should display all pages when total pages is small', () => {
    render(<Pagination {...defaultProps} totalPages={3} />);

    const allButtons = screen.getAllByRole('button');
    const pageButtons = allButtons.filter((btn) => /^\d+$/.test(btn.textContent || ''));

    // Should show all 3 page buttons
    expect(pageButtons).toHaveLength(3);
  });

  it('should show ellipsis for large page counts', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />);

    // Should have ellipsis (...)
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should show pages around current page', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />);

    const allButtons = screen.getAllByRole('button');

    // Should show page 1 (first), pages 4-6 (around current), and page 10 (last)
    expect(allButtons.some((btn) => btn.textContent === '1')).toBe(true);
    expect(allButtons.some((btn) => btn.textContent === '4')).toBe(true);
    expect(allButtons.some((btn) => btn.textContent === '5')).toBe(true);
    expect(allButtons.some((btn) => btn.textContent === '6')).toBe(true);
    expect(allButtons.some((btn) => btn.textContent === '10')).toBe(true);
  });

  it('should handle single page correctly', () => {
    render(<Pagination {...defaultProps} currentPage={1} totalPages={1} totalItems={5} />);

    const resultText = screen.getByText((_content, element) => {
      return element?.textContent === 'Mostrando 1 a 5 de 5 resultados';
    });
    expect(resultText).toBeInTheDocument();

    const prevButton = screen.getByRole('button', { name: /anterior/i });
    const nextButton = screen.getByRole('button', { name: /siguiente/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('should display correct range when currentPage is 1', () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText(/Mostrando/)).toHaveTextContent('Mostrando 1 a 10 de 50 resultados');
  });
});
