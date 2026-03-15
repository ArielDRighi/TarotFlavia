import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockedDatesList } from './BlockedDatesList';
import { ExceptionType } from '@/types';
import type { TarotistException } from '@/types';

const mockExceptions: TarotistException[] = [
  {
    id: 1,
    tarotistaId: 10,
    exceptionDate: '2026-03-20',
    exceptionType: ExceptionType.BLOCKED,
    startTime: null,
    endTime: null,
    reason: 'Feriado nacional',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    tarotistaId: 10,
    exceptionDate: '2026-03-25',
    exceptionType: ExceptionType.CUSTOM_HOURS,
    startTime: '08:00',
    endTime: '12:00',
    reason: null,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

describe('BlockedDatesList', () => {
  const onRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a data-testid for the list', () => {
    render(<BlockedDatesList exceptions={[]} onRemove={onRemove} />);
    expect(screen.getByTestId('blocked-dates-list')).toBeInTheDocument();
  });

  it('renders an empty state when there are no exceptions', () => {
    render(<BlockedDatesList exceptions={[]} onRemove={onRemove} />);
    expect(screen.getByText(/sin fechas bloqueadas/i)).toBeInTheDocument();
  });

  it('renders a row for each exception', () => {
    render(<BlockedDatesList exceptions={mockExceptions} onRemove={onRemove} />);
    expect(screen.getAllByTestId(/exception-row-/)).toHaveLength(2);
  });

  it('renders the exception date', () => {
    render(<BlockedDatesList exceptions={mockExceptions} onRemove={onRemove} />);
    expect(screen.getByText('2026-03-20')).toBeInTheDocument();
    expect(screen.getByText('2026-03-25')).toBeInTheDocument();
  });

  it('renders the reason when present', () => {
    render(<BlockedDatesList exceptions={mockExceptions} onRemove={onRemove} />);
    expect(screen.getByText('Feriado nacional')).toBeInTheDocument();
  });

  it('renders custom hours time range for custom_hours type', () => {
    render(<BlockedDatesList exceptions={mockExceptions} onRemove={onRemove} />);
    expect(screen.getByText('08:00 - 12:00')).toBeInTheDocument();
  });

  it('renders a delete button per exception', () => {
    render(<BlockedDatesList exceptions={mockExceptions} onRemove={onRemove} />);
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onRemove with the exception id when delete is clicked', async () => {
    render(<BlockedDatesList exceptions={mockExceptions} onRemove={onRemove} />);
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    await userEvent.click(deleteButtons[0]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
