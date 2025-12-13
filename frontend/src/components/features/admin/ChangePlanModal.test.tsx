/**
 * Tests for ChangePlanModal component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePlanModal } from './ChangePlanModal';
import type { AdminUser } from '@/types/admin-users.types';

describe('ChangePlanModal', () => {
  const mockUser: AdminUser = {
    id: 1,
    email: 'test@test.com',
    name: 'Test User',
    roles: ['consumer'],
    plan: 'free',
    lastLogin: null,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
    bannedAt: null,
    banReason: null,
  };

  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  it('should render modal when open', () => {
    render(
      <ChangePlanModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.getByText(/cambiar plan/i)).toBeInTheDocument();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <ChangePlanModal
        user={mockUser}
        open={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.queryByText(/cambiar plan/i)).not.toBeInTheDocument();
  });

  it('should display all plan options', () => {
    render(
      <ChangePlanModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should call onSubmit with selected plan', async () => {
    render(
      <ChangePlanModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should disable submit button when pending', () => {
    render(
      <ChangePlanModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /confirmando/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call onClose when cancel button clicked', () => {
    render(
      <ChangePlanModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
