import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionsList } from './SessionsList';
import type { SessionDetail } from '@/types/session.types';

// Mock hooks
const mockUseMySessions = vi.fn();
const mockMutate = vi.fn();
const mockUseCancelSession = vi.fn(() => ({
  mutate: mockMutate,
  isPending: false,
}));

vi.mock('@/hooks/api/useSessions', () => ({
  useMySessions: () => mockUseMySessions(),
  useCancelSession: () => mockUseCancelSession(),
}));

// Mock SessionCard
vi.mock('./SessionCard', () => ({
  SessionCard: ({
    session,
    onCancel,
    onJoin,
  }: {
    session: SessionDetail;
    onCancel?: (id: number) => void;
    onJoin?: (link: string) => void;
  }) => (
    <div data-testid={`session-card-${session.id}`}>
      <span>{session.sessionDate}</span>
      <span>{session.status}</span>
      {onCancel && <button onClick={() => onCancel(session.id)}>Cancelar</button>}
      {onJoin && <button onClick={() => onJoin(session.googleMeetLink)}>Unirse</button>}
    </div>
  ),
}));

const createMockSession = (overrides: Partial<SessionDetail> = {}): SessionDetail => ({
  id: 1,
  tarotistaId: 1,
  userId: 1,
  sessionDate: '2025-12-15',
  sessionTime: '10:00',
  durationMinutes: 60,
  sessionType: 'TAROT_READING',
  status: 'pending',
  priceUsd: 50,
  paymentStatus: 'PENDING',
  googleMeetLink: 'https://meet.google.com/abc-def-ghi',
  userEmail: 'user@example.com',
  createdAt: '2025-12-13',
  updatedAt: '2025-12-13',
  tarotista: {
    id: 1,
    nombre: 'Flavia',
    foto: 'https://example.com/photo.jpg',
  },
  ...overrides,
});

describe('SessionsList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    mockUseMySessions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Tabs Rendering', () => {
    it('should render all tab triggers', () => {
      mockUseMySessions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<SessionsList />, { wrapper });

      expect(screen.getByRole('tab', { name: /próximas/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /completadas/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /canceladas/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /todas/i })).toBeInTheDocument();
    });

    it('should switch between tabs when clicked', async () => {
      mockUseMySessions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<SessionsList />, { wrapper });

      const completadasTab = screen.getByRole('tab', { name: /completadas/i });
      await user.click(completadasTab);

      await waitFor(() => {
        expect(completadasTab).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('Data Fetching', () => {
    it('should show loading state initially', () => {
      mockUseMySessions.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<SessionsList />, { wrapper });

      expect(screen.getAllByTestId(/skeleton/).length).toBeGreaterThan(0);
    });

    it('should fetch all sessions by default (Próximas tab)', () => {
      mockUseMySessions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<SessionsList />, { wrapper });

      expect(mockUseMySessions).toHaveBeenCalled();
    });
  });

  describe('Session List Rendering', () => {
    it('should render sessions in date order (upcoming first)', () => {
      const sessions = [
        createMockSession({ id: 1, sessionDate: '2025-12-20', status: 'confirmed' }),
        createMockSession({ id: 2, sessionDate: '2025-12-15', status: 'pending' }),
        createMockSession({ id: 3, sessionDate: '2025-12-25', status: 'confirmed' }),
      ];

      mockUseMySessions.mockReturnValue({
        data: sessions,
        isLoading: false,
        error: null,
      });

      render(<SessionsList />, { wrapper });

      const cards = screen.getAllByTestId(/session-card/);
      expect(cards).toHaveLength(3);
      // Should be ordered by date ascending
      expect(cards[0]).toHaveAttribute('data-testid', 'session-card-2');
      expect(cards[1]).toHaveAttribute('data-testid', 'session-card-1');
      expect(cards[2]).toHaveAttribute('data-testid', 'session-card-3');
    });

    it('should pass correct props to SessionCard', () => {
      const session = createMockSession();

      mockUseMySessions.mockReturnValue({
        data: [session],
        isLoading: false,
        error: null,
      });

      render(<SessionsList />, { wrapper });

      // Verify card is rendered with session data
      expect(screen.getByTestId(`session-card-${session.id}`)).toBeInTheDocument();
    });
  });

  describe('Filtering by Tab', () => {
    it('should filter pending and confirmed sessions in "Próximas" tab', () => {
      const sessions = [
        createMockSession({ id: 1, status: 'pending' }),
        createMockSession({ id: 2, status: 'confirmed' }),
        createMockSession({ id: 3, status: 'completed' }),
        createMockSession({ id: 4, status: 'cancelled_by_user' }),
      ];

      mockUseMySessions.mockReturnValue({
        data: sessions,
        isLoading: false,
        error: null,
      });

      render(<SessionsList />, { wrapper });

      // Default tab is "Próximas" - should show only pending and confirmed
      expect(screen.getByTestId('session-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('session-card-2')).toBeInTheDocument();
      expect(screen.queryByTestId('session-card-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('session-card-4')).not.toBeInTheDocument();
    });

    it('should filter completed sessions in "Completadas" tab', async () => {
      const sessions = [
        createMockSession({ id: 1, status: 'pending' }),
        createMockSession({ id: 2, status: 'completed' }),
        createMockSession({ id: 3, status: 'completed' }),
      ];

      mockUseMySessions.mockReturnValue({
        data: sessions,
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<SessionsList />, { wrapper });

      await user.click(screen.getByRole('tab', { name: /completadas/i }));

      await waitFor(() => {
        expect(screen.getByTestId('session-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('session-card-3')).toBeInTheDocument();
        expect(screen.queryByTestId('session-card-1')).not.toBeInTheDocument();
      });
    });

    it('should filter cancelled sessions in "Canceladas" tab', async () => {
      const sessions = [
        createMockSession({ id: 1, status: 'pending' }),
        createMockSession({ id: 2, status: 'cancelled_by_user' }),
        createMockSession({ id: 3, status: 'cancelled_by_tarotist' }),
      ];

      mockUseMySessions.mockReturnValue({
        data: sessions,
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<SessionsList />, { wrapper });

      await user.click(screen.getByRole('tab', { name: /canceladas/i }));

      await waitFor(() => {
        expect(screen.getByTestId('session-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('session-card-3')).toBeInTheDocument();
        expect(screen.queryByTestId('session-card-1')).not.toBeInTheDocument();
      });
    });

    it('should show all sessions in "Todas" tab', async () => {
      const sessions = [
        createMockSession({ id: 1, status: 'pending' }),
        createMockSession({ id: 2, status: 'completed' }),
        createMockSession({ id: 3, status: 'cancelled_by_user' }),
      ];

      mockUseMySessions.mockReturnValue({
        data: sessions,
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<SessionsList />, { wrapper });

      await user.click(screen.getByRole('tab', { name: /todas/i }));

      await waitFor(() => {
        expect(screen.getByTestId('session-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('session-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('session-card-3')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state for "Próximas" tab when no upcoming sessions', () => {
      mockUseMySessions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<SessionsList />, { wrapper });

      expect(screen.getByText(/no tienes sesiones programadas/i)).toBeInTheDocument();
    });

    it('should show empty state for "Completadas" tab', async () => {
      mockUseMySessions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<SessionsList />, { wrapper });

      await user.click(screen.getByRole('tab', { name: /completadas/i }));

      await waitFor(() => {
        expect(screen.getByText(/aún no has tenido sesiones/i)).toBeInTheDocument();
      });
    });

    it('should show empty state for "Canceladas" tab', async () => {
      mockUseMySessions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<SessionsList />, { wrapper });

      await user.click(screen.getByRole('tab', { name: /canceladas/i }));

      await waitFor(() => {
        expect(screen.getByText(/no tienes sesiones canceladas/i)).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('should call onJoin with meet link when join button clicked', async () => {
      const session = createMockSession({
        status: 'confirmed',
        googleMeetLink: 'https://meet.google.com/test',
      });

      mockUseMySessions.mockReturnValue({
        data: [session],
        isLoading: false,
        error: null,
      });

      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const user = userEvent.setup();
      render(<SessionsList />, { wrapper });

      const joinButton = screen.getByText('Unirse');
      await user.click(joinButton);

      expect(openSpy).toHaveBeenCalledWith('https://meet.google.com/test', '_blank');
    });

    it('should call cancel mutation when cancel button clicked', async () => {
      const session = createMockSession({ status: 'pending' });

      mockUseMySessions.mockReturnValue({
        data: [session],
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<SessionsList />, { wrapper });

      const cancelButton = screen.getByText('Cancelar');
      await user.click(cancelButton);

      // Should show confirmation modal
      await waitFor(() => {
        expect(screen.getByText(/¿estás seguro/i)).toBeInTheDocument();
      });

      // Confirm cancellation
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          { id: session.id, reason: 'Cancelado por el usuario' },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {
      mockUseMySessions.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch sessions'),
      });

      render(<SessionsList />, { wrapper });

      expect(screen.getByText(/error al cargar las sesiones/i)).toBeInTheDocument();
    });
  });
});
