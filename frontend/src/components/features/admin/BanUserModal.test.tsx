/**
 * Tests for BanUserModal component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BanUserModal } from './BanUserModal';
import type { AdminUser } from '@/types/admin-users.types';

describe('BanUserModal', () => {
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
      <BanUserModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('should require reason field', async () => {
    render(
      <BanUserModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /banear usuario/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with valid reason', async () => {
    render(
      <BanUserModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Spam and inappropriate content' } });

    const submitButton = screen.getByRole('button', { name: /banear usuario/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        reason: 'Spam and inappropriate content',
      });
    });
  });

  it('should show destructive button style', () => {
    render(
      <BanUserModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /banear usuario/i });
    expect(submitButton).toHaveClass('bg-destructive');
  });

  it('should disable buttons when pending', () => {
    render(
      <BanUserModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isPending={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /baneando/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });

    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
