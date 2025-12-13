import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionCard } from './SessionCard';
import type { Session, SessionDetail } from '@/types/session.types';

/**
 * Test Suite: SessionCard Component
 *
 * Tests covering:
 * - Rendering session information (date, time, duration, status)
 * - Tarotista avatar and name display
 * - Status badge rendering
 * - Conditional action buttons based on status and time
 * - Cancel and Join button callbacks
 * - Responsive layout and styling
 */

describe('SessionCard', () => {
  const mockTarotista = {
    id: 1,
    nombre: 'Flavia Luna',
    foto: '/tarotistas/flavia.jpg',
  };

  const baseSession: Session = {
    id: 1,
    tarotistaId: 1,
    userId: 2,
    sessionDate: '2025-12-15',
    sessionTime: '15:00',
    durationMinutes: 60,
    sessionType: 'TAROT_READING',
    status: 'confirmed',
    priceUsd: 30,
    paymentStatus: 'PAID',
    googleMeetLink: 'https://meet.google.com/abc-defg-hij',
    userEmail: 'user@example.com',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
  };

  describe('Basic Rendering', () => {
    it('should render session card', () => {
      render(<SessionCard session={baseSession} />);
      expect(screen.getByTestId('session-card')).toBeInTheDocument();
    });

    it('should display session date formatted correctly', () => {
      render(<SessionCard session={baseSession} />);
      // "Domingo 15 de Diciembre - 15:00"
      expect(screen.getByText(/15 de Diciembre/i)).toBeInTheDocument();
    });

    it('should display session time', () => {
      render(<SessionCard session={baseSession} />);
      expect(screen.getByText(/15:00/)).toBeInTheDocument();
    });

    it('should display duration', () => {
      render(<SessionCard session={baseSession} />);
      expect(screen.getByText('60 minutos')).toBeInTheDocument();
    });
  });

  describe('Tarotista Information', () => {
    it('should display tarotista name when provided', () => {
      const sessionWithTarotista: SessionDetail = {
        ...baseSession,
        tarotista: mockTarotista,
      };

      render(<SessionCard session={sessionWithTarotista} />);
      expect(screen.getByText('Flavia Luna')).toBeInTheDocument();
    });

    it('should render tarotista avatar image when foto is provided', () => {
      const sessionWithTarotista: SessionDetail = {
        ...baseSession,
        tarotista: mockTarotista,
      };

      render(<SessionCard session={sessionWithTarotista} />);
      const avatar = screen.getByTestId('tarotista-avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('should render avatar fallback with initials when no foto', () => {
      const sessionWithTarotista: SessionDetail = {
        ...baseSession,
        tarotista: { ...mockTarotista, foto: undefined },
      };

      render(<SessionCard session={sessionWithTarotista} />);
      expect(screen.getByText('FL')).toBeInTheDocument();
    });

    it('should handle missing tarotista gracefully', () => {
      render(<SessionCard session={baseSession} />);
      expect(screen.queryByTestId('tarotista-avatar')).not.toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('should display pending status badge', () => {
      const pendingSession = { ...baseSession, status: 'pending' as const };
      render(<SessionCard session={pendingSession} />);
      expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    });

    it('should display confirmed status badge', () => {
      const confirmedSession = { ...baseSession, status: 'confirmed' as const };
      render(<SessionCard session={confirmedSession} />);
      expect(screen.getByText(/confirmada/i)).toBeInTheDocument();
    });

    it('should display completed status badge', () => {
      const completedSession = { ...baseSession, status: 'completed' as const };
      render(<SessionCard session={completedSession} />);
      expect(screen.getByText(/completada/i)).toBeInTheDocument();
    });

    it('should display cancelled status badge', () => {
      const cancelledSession = { ...baseSession, status: 'cancelled_by_user' as const };
      render(<SessionCard session={cancelledSession} />);
      expect(screen.getByText(/cancelada/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    describe('Join Button', () => {
      it('should show join button for confirmed session within 24 hours', () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(now.getHours() + 2);

        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const hours = String(tomorrow.getHours()).padStart(2, '0');
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

        const upcomingSession = {
          ...baseSession,
          status: 'confirmed' as const,
          sessionDate: `${year}-${month}-${day}`,
          sessionTime: `${hours}:${minutes}`,
        };

        render(<SessionCard session={upcomingSession} onJoin={vi.fn()} />);
        const joinButton = screen.getByRole('button', { name: /unirse/i });
        expect(joinButton).toBeInTheDocument();
        expect(joinButton).toHaveClass(/bg-accent-success|bg-green/);
      });

      it('should call onJoin with meet link when join button clicked', () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(now.getHours() + 2);

        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const hours = String(tomorrow.getHours()).padStart(2, '0');
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

        const upcomingSession = {
          ...baseSession,
          status: 'confirmed' as const,
          sessionDate: `${year}-${month}-${day}`,
          sessionTime: `${hours}:${minutes}`,
        };

        const onJoin = vi.fn();
        render(<SessionCard session={upcomingSession} onJoin={onJoin} />);

        const joinButton = screen.getByRole('button', { name: /unirse/i });
        fireEvent.click(joinButton);

        expect(onJoin).toHaveBeenCalledWith(upcomingSession.googleMeetLink);
      });

      it('should not show join button if session is not within 24 hours', () => {
        const futureSession = {
          ...baseSession,
          status: 'confirmed' as const,
          sessionDate: '2025-12-30',
          sessionTime: '15:00',
        };

        render(<SessionCard session={futureSession} onJoin={vi.fn()} />);
        expect(screen.queryByRole('button', { name: /unirse/i })).not.toBeInTheDocument();
      });

      it('should not show join button for pending sessions', () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(now.getHours() + 2);

        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const hours = String(tomorrow.getHours()).padStart(2, '0');
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

        const pendingSession = {
          ...baseSession,
          status: 'pending' as const,
          sessionDate: `${year}-${month}-${day}`,
          sessionTime: `${hours}:${minutes}`,
        };

        render(<SessionCard session={pendingSession} onJoin={vi.fn()} />);
        expect(screen.queryByRole('button', { name: /unirse/i })).not.toBeInTheDocument();
      });
    });

    describe('Cancel Button', () => {
      it('should show cancel button for pending session', () => {
        const pendingSession = {
          ...baseSession,
          status: 'pending' as const,
          sessionDate: '2025-12-30',
        };

        render(<SessionCard session={pendingSession} onCancel={vi.fn()} />);
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      });

      it('should show cancel button for confirmed session more than 24h away', () => {
        const futureSession = {
          ...baseSession,
          status: 'confirmed' as const,
          sessionDate: '2025-12-30',
        };

        render(<SessionCard session={futureSession} onCancel={vi.fn()} />);
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      });

      it('should call onCancel with session id when cancel clicked', () => {
        const pendingSession = {
          ...baseSession,
          status: 'pending' as const,
          sessionDate: '2025-12-30',
        };

        const onCancel = vi.fn();
        render(<SessionCard session={pendingSession} onCancel={onCancel} />);

        const cancelButton = screen.getByRole('button', { name: /cancelar/i });
        fireEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalledWith(pendingSession.id);
      });

      it('should disable cancel button within 24 hours of session', () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(now.getHours() + 12);

        // Format date/time properly to avoid timezone issues
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const hours = String(tomorrow.getHours()).padStart(2, '0');
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

        const soonSession = {
          ...baseSession,
          status: 'confirmed' as const,
          sessionDate: `${year}-${month}-${day}`,
          sessionTime: `${hours}:${minutes}`,
        };

        render(<SessionCard session={soonSession} onCancel={vi.fn()} />);
        const cancelButton = screen.getByRole('button', { name: /cancelar/i });
        expect(cancelButton).toBeDisabled();
      });

      it('should not show cancel button for completed sessions', () => {
        const completedSession = { ...baseSession, status: 'completed' as const };
        render(<SessionCard session={completedSession} onCancel={vi.fn()} />);
        expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument();
      });

      it('should not show cancel button for cancelled sessions', () => {
        const cancelledSession = { ...baseSession, status: 'cancelled_by_user' as const };
        render(<SessionCard session={cancelledSession} onCancel={vi.fn()} />);
        expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument();
      });
    });

    describe('Completed Session Icon', () => {
      it('should show check icon for completed sessions', () => {
        const completedSession = { ...baseSession, status: 'completed' as const };
        render(<SessionCard session={completedSession} />);
        expect(screen.getByTestId('completed-icon')).toBeInTheDocument();
      });

      it('should not show check icon for non-completed sessions', () => {
        render(<SessionCard session={baseSession} />);
        expect(screen.queryByTestId('completed-icon')).not.toBeInTheDocument();
      });
    });
  });

  describe('Styling and Responsive', () => {
    it('should render as horizontal card on desktop', () => {
      render(<SessionCard session={baseSession} />);
      const card = screen.getByTestId('session-card');
      expect(card).toHaveClass(/flex-row/);
    });

    it('should have colored left border based on status', () => {
      const confirmedSession = { ...baseSession, status: 'confirmed' as const };
      render(<SessionCard session={confirmedSession} />);
      const card = screen.getByTestId('session-card');
      expect(card).toHaveClass(/border-l-4/);
    });

    it('should apply soft shadow', () => {
      render(<SessionCard session={baseSession} />);
      const card = screen.getByTestId('session-card');
      expect(card).toHaveClass(/shadow/);
    });

    it('should apply custom className', () => {
      render(<SessionCard session={baseSession} className="custom-class" />);
      const card = screen.getByTestId('session-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle session with no callbacks provided', () => {
      render(<SessionCard session={baseSession} />);
      expect(screen.getByTestId('session-card')).toBeInTheDocument();
    });

    it('should handle different duration formats', () => {
      const session30min = { ...baseSession, durationMinutes: 30 };
      const { rerender } = render(<SessionCard session={session30min} />);
      expect(screen.getByText('30 minutos')).toBeInTheDocument();

      const session90min = { ...baseSession, durationMinutes: 90 };
      rerender(<SessionCard session={session90min} />);
      expect(screen.getByText('90 minutos')).toBeInTheDocument();
    });

    it('should handle session with userNotes', () => {
      const sessionWithNotes = {
        ...baseSession,
        userNotes: 'Necesito consejo sobre mi carrera',
      };
      render(<SessionCard session={sessionWithNotes} />);
      // Notes might not be displayed in card, but component should handle them
      expect(screen.getByTestId('session-card')).toBeInTheDocument();
    });
  });
});
