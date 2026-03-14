/**
 * Tests for BookingCalendar component
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
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render date selector with next 30 days', () => {
    vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

    render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

    // Verificar que se muestran chips de fechas
    const dateChips = screen.getAllByRole('button', { name: /^(lun|mar|mié|jue|vie|sáb|dom)/i });
    expect(dateChips.length).toBeGreaterThan(0);
  });

  it('should show loading state when fetching slots', () => {
    vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

    render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

    // Seleccionar una fecha para trigger loading
    const firstDateChip = screen.getAllByRole('button', {
      name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
    })[0];
    fireEvent.click(firstDateChip);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
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

    // Seleccionar una fecha
    const firstDateChip = screen.getAllByRole('button', {
      name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
    })[0];
    fireEvent.click(firstDateChip);

    // Verificar que se muestran los slots disponibles
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
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

    // Seleccionar fecha
    const firstDateChip = screen.getAllByRole('button', {
      name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
    })[0];
    fireEvent.click(firstDateChip);

    // Verificar que el slot ocupado está deshabilitado
    const occupiedSlot = screen.getByRole('button', { name: '10:00' });
    expect(occupiedSlot).toBeDisabled();
  });

  it('should render duration selector with radio buttons', () => {
    vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

    render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

    // Verificar radio buttons de duración
    expect(screen.getByLabelText(/30 min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/60 min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/90 min/i)).toBeInTheDocument();
  });

  it('should display booking summary when all fields are selected', () => {
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

    // Seleccionar fecha
    const firstDateChip = screen.getAllByRole('button', {
      name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
    })[0];
    fireEvent.click(firstDateChip);

    // Seleccionar hora
    const timeSlot = screen.getByRole('button', { name: '09:00' });
    fireEvent.click(timeSlot);

    // Verificar que se muestra el resumen
    expect(screen.getByText(/fecha seleccionada/i)).toBeInTheDocument();
    expect(screen.getByText(/hora seleccionada/i)).toBeInTheDocument();
    expect(screen.getAllByText(/duración/i).length).toBeGreaterThan(0);
  });

  it('should disable confirm button when not all fields are selected', () => {
    vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

    render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

    const confirmButton = screen.getByRole('button', { name: /confirmar y reservar/i });
    expect(confirmButton).toBeDisabled();
  });

  it('should call onBook when confirm button is clicked with all fields', () => {
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

    // Seleccionar fecha
    const firstDateChip = screen.getAllByRole('button', {
      name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
    })[0];
    fireEvent.click(firstDateChip);

    // Seleccionar hora
    const timeSlot = screen.getByRole('button', { name: '09:00' });
    fireEvent.click(timeSlot);

    // Hacer click en confirmar
    const confirmButton = screen.getByRole('button', { name: /confirmar y reservar/i });
    fireEvent.click(confirmButton);

    // Verificar que se llamó onBook con los parámetros correctos
    expect(mockOnBook).toHaveBeenCalledWith(
      expect.any(String), // date
      '09:00', // time
      60 // duration
    );
  });

  it('should highlight selected date with secondary color', () => {
    vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

    render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

    const firstDateChip = screen.getAllByRole('button', {
      name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
    })[0];
    fireEvent.click(firstDateChip);

    // Verificar que el chip tiene la clase de seleccionado (bg-secondary)
    expect(firstDateChip).toHaveClass('bg-secondary');
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

    // Seleccionar fecha
    const firstDateChip = screen.getAllByRole('button', {
      name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
    })[0];
    fireEvent.click(firstDateChip);

    // Seleccionar hora
    const timeSlot = screen.getByRole('button', { name: '09:00' });
    fireEvent.click(timeSlot);

    // Verificar que el slot tiene la clase de seleccionado (bg-primary)
    expect(timeSlot).toHaveClass('bg-primary');
  });

  it('should show message when no slots are available for selected date', () => {
    vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

    render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} />, { wrapper });

    // Seleccionar fecha
    const firstDateChip = screen.getAllByRole('button', {
      name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
    })[0];
    fireEvent.click(firstDateChip);

    // Verificar mensaje de no disponibilidad
    expect(screen.getByText(/no hay horarios disponibles/i)).toBeInTheDocument();
  });

  // ============================================================================
  // readOnly prop tests
  // ============================================================================

  describe('readOnly prop', () => {
    it('should hide confirm button when readOnly is true', () => {
      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={true} />, { wrapper });

      expect(
        screen.queryByRole('button', { name: /confirmar y reservar/i })
      ).not.toBeInTheDocument();
    });

    it('should show confirm button when readOnly is false', () => {
      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={false} />, { wrapper });

      expect(screen.getByRole('button', { name: /confirmar y reservar/i })).toBeInTheDocument();
    });

    it('should show confirm button when readOnly is not provided (default behavior)', () => {
      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

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

      // Select a date first
      const firstDateChip = screen.getAllByRole('button', {
        name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
      })[0];
      fireEvent.click(firstDateChip);

      // Available slot should be disabled in readOnly mode
      const timeSlot = screen.getByRole('button', { name: '09:00' });
      expect(timeSlot).toBeDisabled();
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

      // Select a date first
      const firstDateChip = screen.getAllByRole('button', {
        name: /^(lun|mar|mié|jue|vie|sáb|dom)/i,
      })[0];
      fireEvent.click(firstDateChip);

      // Attempt to click an available slot
      const timeSlot = screen.getByRole('button', { name: '09:00' });
      fireEvent.click(timeSlot);

      expect(mockOnBook).not.toHaveBeenCalled();
    });

    it('should hide duration selector when readOnly is true', () => {
      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={true} />, { wrapper });

      expect(
        screen.queryByRole('radiogroup', { name: /duración de la sesión/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/30 min/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/60 min/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/90 min/i)).not.toBeInTheDocument();
    });

    it('should show duration selector when readOnly is false', () => {
      vi.mocked(useAvailableSlotsHook.useAvailableSlots).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useAvailableSlotsHook.useAvailableSlots>);

      render(<BookingCalendar tarotistaId={1} onBook={mockOnBook} readOnly={false} />, { wrapper });

      expect(screen.getByLabelText(/30 min/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/60 min/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/90 min/i)).toBeInTheDocument();
    });
  });
});
