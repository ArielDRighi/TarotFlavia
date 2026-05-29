import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IpWhitelistTab } from './IpWhitelistTab';
import * as useAdminIpWhitelistHooks from '@/hooks/api/useAdminIpWhitelist';
import type { WhitelistResponse } from '@/types/admin-security.types';

vi.mock('@/hooks/api/useAdminIpWhitelist');

const mockUseIpWhitelist = vi.mocked(useAdminIpWhitelistHooks.useIpWhitelist);
const mockUseAddIpToWhitelist = vi.mocked(useAdminIpWhitelistHooks.useAddIpToWhitelist);
const mockUseRemoveIpFromWhitelist = vi.mocked(useAdminIpWhitelistHooks.useRemoveIpFromWhitelist);

const mockMutate = vi.fn();

function setupMocks(
  whitelistData: Partial<WhitelistResponse> | null = { ips: ['192.168.1.1'], count: 1 },
  options: { isLoading?: boolean; isError?: boolean } = {}
) {
  mockUseIpWhitelist.mockReturnValue({
    data: whitelistData as WhitelistResponse,
    isLoading: options.isLoading ?? false,
    isError: options.isError ?? false,
    refetch: vi.fn(),
    isSuccess: !options.isLoading && !options.isError,
  } as unknown as ReturnType<typeof useAdminIpWhitelistHooks.useIpWhitelist>);

  mockUseAddIpToWhitelist.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useAdminIpWhitelistHooks.useAddIpToWhitelist>);

  mockUseRemoveIpFromWhitelist.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useAdminIpWhitelistHooks.useRemoveIpFromWhitelist>);
}

describe('IpWhitelistTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render skeleton while loading', () => {
      setupMocks(null, { isLoading: true });
      render(<IpWhitelistTab />);
      expect(screen.getByTestId('skeleton-whitelist')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should render error display when fetch fails', () => {
      setupMocks(null, { isError: true });
      render(<IpWhitelistTab />);
      expect(screen.getByTestId('error-whitelist')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no IPs are configured', () => {
      setupMocks({ ips: [], count: 0 });
      render(<IpWhitelistTab />);
      expect(screen.getByTestId('empty-whitelist')).toBeInTheDocument();
    });
  });

  describe('with data', () => {
    it('should render the list of whitelisted IPs', () => {
      setupMocks({ ips: ['192.168.1.1', '10.0.0.1'], count: 2 });
      render(<IpWhitelistTab />);
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
      expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    });

    it('should show the count of whitelisted IPs', () => {
      setupMocks({ ips: ['192.168.1.1', '10.0.0.1'], count: 2 });
      render(<IpWhitelistTab />);
      expect(screen.getByTestId('whitelist-count')).toHaveTextContent('2');
    });

    it('should render the add IP form with accessible label', () => {
      setupMocks();
      render(<IpWhitelistTab />);
      expect(screen.getByTestId('add-ip-input')).toBeInTheDocument();
      expect(screen.getByTestId('add-ip-button')).toBeInTheDocument();
      // El input debe tener un label accesible asociado
      const input = screen.getByLabelText(/dirección ip a agregar/i);
      expect(input).toBeInTheDocument();
    });
  });

  describe('system IPs (loopback)', () => {
    it('should render system IPs with Sistema badge and no remove button', () => {
      setupMocks({ ips: ['127.0.0.1', '::1', '::ffff:127.0.0.1', '10.0.0.1'], count: 4 });
      render(<IpWhitelistTab />);

      // Sistema badge visible para loopback IPs
      const sistemaBadges = screen.getAllByText('Sistema');
      expect(sistemaBadges).toHaveLength(3);

      // No debe existir botón de eliminar para las IPs de sistema
      expect(screen.queryByTestId('remove-ip-127.0.0.1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remove-ip-::1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remove-ip-::ffff:127.0.0.1')).not.toBeInTheDocument();

      // Sí debe existir botón de eliminar para IPs no-sistema
      expect(screen.getByTestId('remove-ip-10.0.0.1')).toBeInTheDocument();
    });
  });

  describe('add IP flow', () => {
    it('should call addIp mutation when form is submitted with valid IP', async () => {
      setupMocks();
      render(<IpWhitelistTab />);

      const input = screen.getByTestId('add-ip-input');
      const button = screen.getByTestId('add-ip-button');

      await userEvent.type(input, '203.0.113.45');
      await userEvent.click(button);

      expect(mockMutate).toHaveBeenCalledWith(
        { ip: '203.0.113.45' },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      );
    });

    it('should not submit when IP input is empty', async () => {
      setupMocks();
      render(<IpWhitelistTab />);

      const button = screen.getByTestId('add-ip-button');
      await userEvent.click(button);

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('remove IP flow', () => {
    it('should show confirm dialog when remove button is clicked', async () => {
      setupMocks({ ips: ['192.168.1.1'], count: 1 });
      render(<IpWhitelistTab />);

      const removeButton = screen.getByTestId('remove-ip-192.168.1.1');
      expect(removeButton).toHaveAttribute('aria-label', 'Eliminar 192.168.1.1 de la whitelist');
      await userEvent.click(removeButton);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByRole('alertdialog')).toHaveTextContent('192.168.1.1');
    });

    it('should call removeIp mutation when confirmed', async () => {
      setupMocks({ ips: ['192.168.1.1'], count: 1 });
      render(<IpWhitelistTab />);

      const removeButton = screen.getByTestId('remove-ip-192.168.1.1');
      await userEvent.click(removeButton);

      const confirmButton = screen.getByRole('button', { name: /eliminar/i });
      await userEvent.click(confirmButton);

      expect(mockMutate).toHaveBeenCalledWith(
        { ip: '192.168.1.1' },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      );
    });

    it('should close dialog when cancelled', async () => {
      setupMocks({ ips: ['192.168.1.1'], count: 1 });
      render(<IpWhitelistTab />);

      const removeButton = screen.getByTestId('remove-ip-192.168.1.1');
      await userEvent.click(removeButton);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });
});
