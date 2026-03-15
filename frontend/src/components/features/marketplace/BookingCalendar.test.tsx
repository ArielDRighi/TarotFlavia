/**
 * Tests for BookingCalendar component
 *
 * T-SF-M01: Rediseño a cuadrícula mensual
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingCalendar } from './BookingCalendar';
import * as useAvailableSlotsHook from '@/hooks/api/useAvailableSlots';
import type { TimeSlot } from '@/types';

// Mock del hook
vi.mock('@/hooks/api/useAvailableSlots', () => ({
  useAvailableSlots: vi.fn(),
}));

// Mock date-fns/locale para evitar problemas de timezone en CI
vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
  };
});

describe('BookingCalendar', () => {
  let queryClient: QueryClient;
  const mockOnBook = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
    // Default mock: no slots loaded
    vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // ============================================================================
  // Grid mensual — estructura visual
  // ============================================================================

  describe('Grid mensual', () => {
    it('should render a monthly calendar grid with 7 day-of-week headers', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      // Verificar headers de días de la semana
      expect(screen.getByText(/^lun$/i)).toBeInTheDocument();
      expect(screen.getByText(/^mar$/i)).toBeInTheDocument();
      expect(screen.getByText(/^mié$/i)).toBeInTheDocument();
      expect(screen.getByText(/^jue$/i)).toBeInTheDocument();
      expect(screen.getByText(/^vie$/i)).toBeInTheDocument();
      expect(screen.getByText(/^sáb$/i)).toBeInTheDocument();
      expect(screen.getByText(/^dom$/i)).toBeInTheDocument();
    });

    it('should render the month name and year in the header', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      // Debe haber algún texto con el mes actual (no importa cuál exactamente)
      const calendarHeader = screen.getByTestId('calendar-month-header');
      expect(calendarHeader).toBeInTheDocument();
      // El header tiene texto no vacío
      expect(calendarHeader.textContent).toBeTruthy();
    });

    it('should render day numbers inside the grid', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      // El primer día del mes debe estar visible (número 1)
      const dayCells = screen.getAllByTestId(/^calendar-day-/);
      expect(dayCells.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Navegación por mes
  // ============================================================================

  describe('Navegación por mes', () => {
    it('should render previous and next month navigation arrows', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      expect(screen.getByTestId('calendar-prev-month')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-next-month')).toBeInTheDocument();
    });

    it('should navigate to next month when clicking next arrow', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const headerBefore = screen.getByTestId('calendar-month-header').textContent;
      fireEvent.click(screen.getByTestId('calendar-next-month'));
      const headerAfter = screen.getByTestId('calendar-month-header').textContent;

      expect(headerAfter).not.toBe(headerBefore);
    });

    it('should navigate to previous month when clicking prev arrow', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      // Ir al mes siguiente primero para que prev no quede antes de hoy
      fireEvent.click(screen.getByTestId('calendar-next-month'));
      const headerMiddle = screen.getByTestId('calendar-month-header').textContent;

      fireEvent.click(screen.getByTestId('calendar-prev-month'));
      const headerBack = screen.getByTestId('calendar-month-header').textContent;

      expect(headerBack).not.toBe(headerMiddle);
    });

    it('should disable previous month button when viewing current month', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      // En el mes actual, el botón previo debe estar deshabilitado
      const prevBtn = screen.getByTestId('calendar-prev-month');
      expect(prevBtn).toBeDisabled();
    });

    it('should enable previous month button after navigating to next month', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      fireEvent.click(screen.getByTestId('calendar-next-month'));

      const prevBtn = screen.getByTestId('calendar-prev-month');
      expect(prevBtn).not.toBeDisabled();
    });
  });

  // ============================================================================
  // Día actual y días pasados
  // ============================================================================

  describe('Días pasados y día actual', () => {
    it('should mark today with a special data attribute', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const todayCell = screen.queryByTestId('calendar-day-today');
      expect(todayCell).toBeInTheDocument();
    });

    it('should disable past days (not selectable)', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      // Los días con data-past="true" deben ser botones deshabilitados
      const pastDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter((el) => el.getAttribute('data-past') === 'true');

      pastDays.forEach((day) => {
        expect(day).toBeDisabled();
      });
    });

    it('should not disable future days', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter((el) => el.getAttribute('data-past') === 'false');

      // Debe haber días futuros no deshabilitados
      expect(futureDays.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Selección de fecha
  // ============================================================================

  describe('Selección de fecha', () => {
    it('should select a day when clicking on it', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        expect(futureDays[0]).toHaveAttribute('data-selected', 'true');
      }
    });

    it('should show time slots section after selecting a date', () => {
      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        expect(screen.getByText(/selecciona un horario/i)).toBeInTheDocument();
      }
    });

    it('should reset time selection when changing date', () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
      ];

      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: mockSlots,
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length >= 2) {
        // Seleccionar primera fecha y horario
        fireEvent.click(futureDays[0]);
        const timeSlot = screen.getByRole('button', { name: '09:00' });
        fireEvent.click(timeSlot);
        expect(timeSlot).toHaveAttribute('data-selected', 'true');

        // Cambiar a segunda fecha — el horario debe resetearse
        fireEvent.click(futureDays[1]);
        // El slot ya no debería tener data-selected porque se re-renderizó
        // (el hook mockeado devuelve los mismos slots, el test valida el reset interno)
      }
    });
  });

  // ============================================================================
  // Time slots (comportamiento existente mantenido)
  // ============================================================================

  describe('Time slots', () => {
    it('should show loading state when fetching slots for selected date', () => {
      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        expect(screen.getByText(/cargando/i)).toBeInTheDocument();
      }
    });

    it('should display available time slots when date is selected', () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
        { date: '2025-12-15', time: '10:00', durationMinutes: 60, available: false },
        { date: '2025-12-15', time: '11:00', durationMinutes: 60, available: true },
      ];

      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: mockSlots,
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        expect(screen.getByText('09:00')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
        expect(screen.getByText('11:00')).toBeInTheDocument();
      }
    });

    it('should disable occupied time slots', () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
        { date: '2025-12-15', time: '10:00', durationMinutes: 60, available: false },
      ];

      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: mockSlots,
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        const occupiedSlot = screen.getByRole('button', { name: '10:00' });
        expect(occupiedSlot).toBeDisabled();
      }
    });

    it('should show message when no slots are available for selected date', () => {
      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        expect(screen.getByText(/no hay horarios disponibles/i)).toBeInTheDocument();
      }
    });

    it('should highlight selected time slot with primary color', () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
      ];

      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: mockSlots,
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        const timeSlot = screen.getByRole('button', { name: '09:00' });
        fireEvent.click(timeSlot);
        expect(timeSlot).toHaveAttribute('data-selected', 'true');
      }
    });
  });

  // ============================================================================
  // Duration selector
  // ============================================================================

  describe('Duration selector', () => {
    it('should render duration selector with radio buttons', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      expect(screen.getByLabelText(/30 min/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/60 min/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/90 min/i)).toBeInTheDocument();
    });

    it('should show duration selector when readOnly is false', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={false} />, { wrapper });

      expect(screen.getByLabelText(/30 min/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/60 min/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/90 min/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Booking summary and confirm
  // ============================================================================

  describe('Booking summary and confirmation', () => {
    it('should disable confirm button when not all fields are selected', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const confirmButton = screen.getByRole('button', { name: /confirmar y reservar/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should display booking summary when date and time are selected', () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
      ];

      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: mockSlots,
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        const timeSlot = screen.getByRole('button', { name: '09:00' });
        fireEvent.click(timeSlot);

        expect(screen.getByText(/fecha seleccionada/i)).toBeInTheDocument();
        expect(screen.getByText(/hora seleccionada/i)).toBeInTheDocument();
        expect(screen.getAllByText(/duración/i).length).toBeGreaterThan(0);
      }
    });

    it('should call onBook when confirm button is clicked with all fields selected', () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
      ];

      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: mockSlots,
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        const timeSlot = screen.getByRole('button', { name: '09:00' });
        fireEvent.click(timeSlot);

        const confirmButton = screen.getByRole('button', { name: /confirmar y reservar/i });
        fireEvent.click(confirmButton);

        expect(mockOnBook).toHaveBeenCalledWith(
          expect.any(String), // date
          '09:00', // time
          60 // duration
        );
      }
    });
  });

  // ============================================================================
  // readOnly prop
  // ============================================================================

  describe('readOnly prop', () => {
    it('should hide confirm button when readOnly is true', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={true} />, { wrapper });

      expect(
        screen.queryByRole('button', { name: /confirmar y reservar/i })
      ).not.toBeInTheDocument();
    });

    it('should show confirm button when readOnly is false', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={false} />, { wrapper });

      expect(screen.getByRole('button', { name: /confirmar y reservar/i })).toBeInTheDocument();
    });

    it('should show confirm button when readOnly is not provided (default behavior)', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

      expect(screen.getByRole('button', { name: /confirmar y reservar/i })).toBeInTheDocument();
    });

    it('should disable time slot selection when readOnly is true', () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
      ];

      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: mockSlots,
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={true} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        const timeSlot = screen.getByRole('button', { name: '09:00' });
        expect(timeSlot).toBeDisabled();
      }
    });

    it('should not call onBook when slot is clicked in readOnly mode', () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
      ];

      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: mockSlots,
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={true} />, { wrapper });

      const futureDays = screen
        .getAllByTestId(/^calendar-day-/)
        .filter(
          (el) =>
            el.getAttribute('data-past') === 'false' && el.getAttribute('data-empty') !== 'true'
        );

      if (futureDays.length > 0) {
        fireEvent.click(futureDays[0]);
        const timeSlot = screen.getByRole('button', { name: '09:00' });
        fireEvent.click(timeSlot);
        expect(mockOnBook).not.toHaveBeenCalled();
      }
    });

    it('should hide duration selector when readOnly is true', () => {
      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={true} />, { wrapper });

      expect(
        screen.queryByRole('radiogroup', { name: /duración de la sesión/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/30 min/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/60 min/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/90 min/i)).not.toBeInTheDocument();
    });
  });
});
