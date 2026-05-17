/**
 * Tests for ChineseHoroscopeAdminPanel (TDD - Red Phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChineseHoroscopeAdminPanel } from './ChineseHoroscopeAdminPanel';
import * as hooks from '@/hooks/api/useAdminChineseHoroscope';
import type { ChineseHoroscopeYearStatus } from '@/types/admin-chinese-horoscope.types';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

vi.mock('@/hooks/api/useAdminChineseHoroscope');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const CURRENT_YEAR = new Date().getFullYear();

const mockStatusComplete: ChineseHoroscopeYearStatus = {
  year: CURRENT_YEAR,
  total: 60,
  generated: 60,
  missing: [],
};

const mockStatusPartial: ChineseHoroscopeYearStatus = {
  year: CURRENT_YEAR,
  total: 60,
  generated: 58,
  missing: [
    { animal: ChineseZodiacAnimal.RAT, element: 'metal' },
    { animal: ChineseZodiacAnimal.OX, element: 'water' },
  ],
};

const mockMutate = vi.fn();

function setupMocks(
  statusData: ChineseHoroscopeYearStatus | undefined,
  {
    isLoading = false,
    isError = false,
    isMutating = false,
  }: { isLoading?: boolean; isError?: boolean; isMutating?: boolean } = {}
) {
  vi.mocked(hooks.useChineseHoroscopeAdminStatus).mockReturnValue({
    data: statusData,
    isLoading,
    isError,
    isSuccess: !!statusData,
    isFetching: false,
    error: isError ? new Error('Error') : null,
    refetch: vi.fn(),
    status: isLoading ? 'pending' : isError ? 'error' : 'success',
    fetchStatus: 'idle',
  } as unknown as ReturnType<typeof hooks.useChineseHoroscopeAdminStatus>);

  vi.mocked(hooks.useGenerateMissingChineseHoroscopes).mockReturnValue({
    mutate: mockMutate,
    mutateAsync: vi.fn(),
    isPending: isMutating,
    isSuccess: false,
    isError: false,
    isIdle: !isMutating,
    status: isMutating ? 'pending' : 'idle',
    data: undefined,
    error: null,
    variables: undefined,
    reset: vi.fn(),
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as ReturnType<typeof hooks.useGenerateMissingChineseHoroscopes>);
}

describe('ChineseHoroscopeAdminPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading spinner when fetching', () => {
    setupMocks(undefined, { isLoading: true });
    render(<ChineseHoroscopeAdminPanel />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should render error state when fetch fails', () => {
    setupMocks(undefined, { isError: true });
    render(<ChineseHoroscopeAdminPanel />);
    expect(screen.getByText(/no se pudo obtener el estado/i)).toBeInTheDocument();
  });

  it('should display generated count and total', async () => {
    setupMocks(mockStatusPartial);
    render(<ChineseHoroscopeAdminPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('chinese-horoscope-admin-panel')).toBeInTheDocument();
    });
    expect(screen.getByTestId('generated-counter')).toBeInTheDocument();
    expect(screen.getByTestId('generated-counter').textContent).toMatch(/58/);
  });

  it('should show "Generar faltantes" button when there are missing horoscopes', async () => {
    setupMocks(mockStatusPartial);
    render(<ChineseHoroscopeAdminPanel />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generar faltantes/i })).toBeInTheDocument();
    });
  });

  it('should not show "Generar faltantes" button when all horoscopes are generated', async () => {
    setupMocks(mockStatusComplete);
    render(<ChineseHoroscopeAdminPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('chinese-horoscope-admin-panel')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /generar faltantes/i })).not.toBeInTheDocument();
  });

  it('should call generate mutation when "Generar faltantes" is clicked', async () => {
    setupMocks(mockStatusPartial);
    render(<ChineseHoroscopeAdminPanel />);

    const button = await screen.findByRole('button', { name: /generar faltantes/i });
    await userEvent.click(button);

    expect(mockMutate).toHaveBeenCalledWith(CURRENT_YEAR, expect.any(Object));
  });

  it('should show missing combinations in collapsible table', async () => {
    setupMocks(mockStatusPartial);
    render(<ChineseHoroscopeAdminPanel />);

    const toggleButton = await screen.findByRole('button', { name: /faltantes \(2\)/i });
    await userEvent.click(toggleButton);

    expect(screen.getByText(/rata/i)).toBeInTheDocument();
    expect(screen.getByText(/metal/i)).toBeInTheDocument();
  });

  it('should show 60/60 when fully generated', async () => {
    setupMocks(mockStatusComplete);
    render(<ChineseHoroscopeAdminPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('generated-counter').textContent).toMatch(/60/);
    });
  });

  it('should disable generate button while mutation is pending', async () => {
    setupMocks(mockStatusPartial, { isMutating: true });
    render(<ChineseHoroscopeAdminPanel />);

    const button = await screen.findByRole('button', { name: /generando/i });
    expect(button).toBeDisabled();
  });
});
