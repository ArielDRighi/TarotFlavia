/**
 * Tests for ManageRolesModal component
 * TDD Red phase - written before implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManageRolesModal } from './ManageRolesModal';
import type { AdminUser } from '@/types/admin-users.types';

describe('ManageRolesModal', () => {
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

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  it('should render modal when open', () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Gestionar Roles')).toBeInTheDocument();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show role checkboxes for consumer, tarotist and admin', () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    expect(screen.getByTestId('role-checkbox-consumer')).toBeInTheDocument();
    expect(screen.getByTestId('role-checkbox-tarotist')).toBeInTheDocument();
    expect(screen.getByTestId('role-checkbox-admin')).toBeInTheDocument();
  });

  it('should pre-check roles that user already has', () => {
    const userWithMultipleRoles: AdminUser = {
      ...mockUser,
      roles: ['consumer', 'tarotist'],
    };

    render(
      <ManageRolesModal
        user={userWithMultipleRoles}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    expect(screen.getByTestId('role-checkbox-consumer')).toBeChecked();
    expect(screen.getByTestId('role-checkbox-tarotist')).toBeChecked();
    expect(screen.getByTestId('role-checkbox-admin')).not.toBeChecked();
  });

  it('should show confirmation dialog when removing admin role', async () => {
    const adminUser: AdminUser = {
      ...mockUser,
      roles: ['consumer', 'admin'],
    };

    render(
      <ManageRolesModal
        user={adminUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    // Uncheck admin role
    fireEvent.click(screen.getByTestId('role-checkbox-admin'));

    // Click save to trigger confirmation
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/removerá el acceso al panel admin/i)).toBeInTheDocument();
    });
  });

  it('should call onSave with only the roles diff (add tarotist)', async () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    // Check tarotist
    fireEvent.click(screen.getByTestId('role-checkbox-tarotist'));

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        toAdd: ['tarotist'],
        toRemove: [],
      });
    });
  });

  it('should call onSave with diff when removing a role', async () => {
    const userWithTarotist: AdminUser = {
      ...mockUser,
      roles: ['consumer', 'tarotist'],
    };

    render(
      <ManageRolesModal
        user={userWithTarotist}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    // Uncheck tarotist
    fireEvent.click(screen.getByTestId('role-checkbox-tarotist'));

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        toAdd: [],
        toRemove: ['tarotist'],
      });
    });
  });

  it('should not call onSave if no changes', () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    // No changes, click save directly
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onClose when cancel is clicked', () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable buttons when isPending is true', () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={true}
      />
    );

    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
  });

  it('should show current user email in description', () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    expect(screen.getByText(mockUser.email, { exact: false })).toBeInTheDocument();
  });

  it('should display role labels in Spanish', () => {
    render(
      <ManageRolesModal
        user={mockUser}
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isPending={false}
      />
    );

    expect(screen.getByText('Consumidor')).toBeInTheDocument();
    expect(screen.getByText('Tarotista')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });
});
