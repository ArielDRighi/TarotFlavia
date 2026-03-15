import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the hooks
vi.mock('@/hooks/api/useAdminScheduling', () => ({
  useAdminWeeklyAvailability: vi.fn(),
  useAdminBlockedDates: vi.fn(),
  useSetWeeklyAvailability: vi.fn(),
  useRemoveWeeklyAvailability: vi.fn(),
  useAddBlockedDate: vi.fn(),
  useRemoveBlockedDate: vi.fn(),
}));

import {
  useAdminWeeklyAvailability,
  useAdminBlockedDates,
  useSetWeeklyAvailability,
  useRemoveWeeklyAvailability,
  useAddBlockedDate,
  useRemoveBlockedDate,
} from '@/hooks/api/useAdminScheduling';
import { AgendaManagementContent } from './AgendaManagementContent';
import { DayOfWeek, ExceptionType } from '@/types';
import type { TarotistAvailability, TarotistException } from '@/types';

const mockAvailability: TarotistAvailability[] = [
  {
    id: 1,
    tarotistaId: 1,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const mockExceptions: TarotistException[] = [
  {
    id: 1,
    tarotistaId: 1,
    exceptionDate: '2026-04-01',
    exceptionType: ExceptionType.BLOCKED,
    startTime: null,
    endTime: null,
    reason: 'Feriado',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const mutationMock = { mutate: vi.fn(), isPending: false };

describe('AgendaManagementContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAdminWeeklyAvailability).mockReturnValue({
      data: mockAvailability,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAdminWeeklyAvailability>);

    vi.mocked(useAdminBlockedDates).mockReturnValue({
      data: mockExceptions,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAdminBlockedDates>);

    vi.mocked(useSetWeeklyAvailability).mockReturnValue(
      mutationMock as unknown as ReturnType<typeof useSetWeeklyAvailability>
    );
    vi.mocked(useRemoveWeeklyAvailability).mockReturnValue(
      mutationMock as unknown as ReturnType<typeof useRemoveWeeklyAvailability>
    );
    vi.mocked(useAddBlockedDate).mockReturnValue(
      mutationMock as unknown as ReturnType<typeof useAddBlockedDate>
    );
    vi.mocked(useRemoveBlockedDate).mockReturnValue(
      mutationMock as unknown as ReturnType<typeof useRemoveBlockedDate>
    );
  });

  it('renders data-testid for the container', () => {
    render(<AgendaManagementContent />);
    expect(screen.getByTestId('agenda-management-content')).toBeInTheDocument();
  });

  it('renders the Disponibilidad Semanal tab', () => {
    render(<AgendaManagementContent />);
    expect(screen.getByRole('tab', { name: /disponibilidad semanal/i })).toBeInTheDocument();
  });

  it('renders the Fechas Bloqueadas tab', () => {
    render(<AgendaManagementContent />);
    expect(screen.getByRole('tab', { name: /fechas bloqueadas/i })).toBeInTheDocument();
  });

  it('shows weekly schedule grid by default', () => {
    render(<AgendaManagementContent />);
    expect(screen.getByTestId('weekly-schedule-grid')).toBeInTheDocument();
  });

  it('switches to blocked dates tab when clicked', async () => {
    render(<AgendaManagementContent />);
    await userEvent.click(screen.getByRole('tab', { name: /fechas bloqueadas/i }));
    expect(screen.getByTestId('blocked-dates-list')).toBeInTheDocument();
  });

  it('renders loading skeleton when availability is loading', () => {
    vi.mocked(useAdminWeeklyAvailability).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useAdminWeeklyAvailability>);

    render(<AgendaManagementContent />);
    expect(screen.getByTestId('availability-loading')).toBeInTheDocument();
  });

  it('renders error state when availability fails', () => {
    vi.mocked(useAdminWeeklyAvailability).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    } as ReturnType<typeof useAdminWeeklyAvailability>);

    render(<AgendaManagementContent />);
    expect(screen.getByText(/error al cargar la disponibilidad/i)).toBeInTheDocument();
  });

  it('shows add availability form when Agregar is clicked on a day', async () => {
    render(<AgendaManagementContent />);
    // Sunday has no availability → click its Agregar button
    const sundayRow = screen.getByTestId('day-row-0');
    await userEvent.click(sundayRow.querySelector('button[aria-label="Agregar disponibilidad"]')!);
    expect(screen.getByTestId('weekly-availability-form')).toBeInTheDocument();
  });

  it('shows add blocked date form when Agregar Fecha Bloqueada is clicked', async () => {
    render(<AgendaManagementContent />);
    await userEvent.click(screen.getByRole('tab', { name: /fechas bloqueadas/i }));
    await userEvent.click(screen.getByRole('button', { name: /agregar fecha bloqueada/i }));
    expect(screen.getByTestId('add-blocked-date-form')).toBeInTheDocument();
  });
});
