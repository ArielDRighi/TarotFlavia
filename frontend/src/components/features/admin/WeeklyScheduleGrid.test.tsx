import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeeklyScheduleGrid } from './WeeklyScheduleGrid';
import { DayOfWeek } from '@/types';
import type { TarotistAvailability } from '@/types';

const mockAvailability: TarotistAvailability[] = [
  {
    id: 1,
    tarotistaId: 10,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    tarotistaId: 10,
    dayOfWeek: DayOfWeek.WEDNESDAY,
    startTime: '10:00',
    endTime: '14:00',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('WeeklyScheduleGrid', () => {
  const onRemove = vi.fn();
  const onAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 7 day labels', () => {
    render(<WeeklyScheduleGrid availability={[]} onRemove={onRemove} onAdd={onAdd} />);
    expect(screen.getByText('Domingo')).toBeInTheDocument();
    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Martes')).toBeInTheDocument();
    expect(screen.getByText('Miércoles')).toBeInTheDocument();
    expect(screen.getByText('Jueves')).toBeInTheDocument();
    expect(screen.getByText('Viernes')).toBeInTheDocument();
    expect(screen.getByText('Sábado')).toBeInTheDocument();
  });

  it('renders existing time ranges for configured days', () => {
    render(
      <WeeklyScheduleGrid availability={mockAvailability} onRemove={onRemove} onAdd={onAdd} />
    );
    expect(screen.getByText('09:00 - 17:00')).toBeInTheDocument();
    expect(screen.getByText('10:00 - 14:00')).toBeInTheDocument();
  });

  it('renders an "Agregar" button for days without availability', () => {
    render(
      <WeeklyScheduleGrid availability={mockAvailability} onRemove={onRemove} onAdd={onAdd} />
    );
    // 7 days total, 2 configured → 5 with "Agregar"
    const addButtons = screen.getAllByRole('button', { name: /agregar/i });
    expect(addButtons).toHaveLength(5);
  });

  it('calls onAdd with correct DayOfWeek when Agregar is clicked', async () => {
    render(<WeeklyScheduleGrid availability={[]} onRemove={onRemove} onAdd={onAdd} />);
    // Click the button for Monday (first with no availability since all are empty)
    const lunesRow = screen.getByTestId('day-row-1'); // DayOfWeek.MONDAY = 1
    const addBtn = within(lunesRow).getByRole('button', { name: /agregar/i });
    await userEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalledWith(DayOfWeek.MONDAY);
  });

  it('renders a delete button for days with existing availability', () => {
    render(
      <WeeklyScheduleGrid availability={mockAvailability} onRemove={onRemove} onAdd={onAdd} />
    );
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onRemove with availability id when delete is clicked', async () => {
    render(
      <WeeklyScheduleGrid availability={mockAvailability} onRemove={onRemove} onAdd={onAdd} />
    );
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    await userEvent.click(deleteButtons[0]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('renders with data-testid for the grid', () => {
    render(<WeeklyScheduleGrid availability={[]} onRemove={onRemove} onAdd={onAdd} />);
    expect(screen.getByTestId('weekly-schedule-grid')).toBeInTheDocument();
  });
});
