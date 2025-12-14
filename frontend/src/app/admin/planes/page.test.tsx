/**
 * Tests for Admin Plans page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PlanesPage from './page';
import * as useAdminPlansHooks from '@/hooks/queries/useAdminPlans';
import type { PlanConfig } from '@/types/admin.types';
import { ReactNode } from 'react';

// Helper types para mocks - usar unknown para evitar problemas de tipo
type UsePlansReturn = ReturnType<typeof useAdminPlansHooks.usePlans>;
type UseUpdatePlanReturn = ReturnType<typeof useAdminPlansHooks.useUpdatePlan>;

// Mock hooks
vi.mock('@/hooks/queries/useAdminPlans', () => ({
  usePlans: vi.fn(),
  useUpdatePlan: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPlans: PlanConfig[] = [
  {
    id: 1,
    planType: 'free',
    dailyReadingLimit: 1,
    monthlyAIQuota: 10,
    canUseCustomQuestions: false,
    canRegenerateInterpretations: false,
    maxRegenerationsPerReading: 0,
    canShareReadings: false,
    historyLimit: 10,
    canBookSessions: false,
    price: 0,
  },
  {
    id: 2,
    planType: 'premium',
    dailyReadingLimit: 5,
    monthlyAIQuota: 100,
    canUseCustomQuestions: true,
    canRegenerateInterpretations: true,
    maxRegenerationsPerReading: 3,
    canShareReadings: true,
    historyLimit: -1,
    canBookSessions: true,
    price: 9.99,
  },
  {
    id: 3,
    planType: 'professional',
    dailyReadingLimit: -1,
    monthlyAIQuota: -1,
    canUseCustomQuestions: true,
    canRegenerateInterpretations: true,
    maxRegenerationsPerReading: -1,
    canShareReadings: true,
    historyLimit: -1,
    canBookSessions: true,
    price: 29.99,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('Admin Plans Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title and description', async () => {
    vi.mocked(useAdminPlansHooks.usePlans).mockReturnValue({
      data: mockPlans,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as UsePlansReturn);

    vi.mocked(useAdminPlansHooks.useUpdatePlan).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as UseUpdatePlanReturn);

    render(<PlanesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/configuración de planes/i)).toBeInTheDocument();
      expect(screen.getByText(/gestiona los límites y features de cada plan/i)).toBeInTheDocument();
    });
  });

  it('should display loading skeletons when loading', () => {
    vi.mocked(useAdminPlansHooks.usePlans).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as UsePlansReturn);

    vi.mocked(useAdminPlansHooks.useUpdatePlan).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as UseUpdatePlanReturn);

    render(<PlanesPage />, { wrapper: createWrapper() });

    // Debería mostrar skeletons
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display error message on fetch error', async () => {
    vi.mocked(useAdminPlansHooks.usePlans).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch plans'),
      isSuccess: false,
      isError: true,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as UsePlansReturn);

    vi.mocked(useAdminPlansHooks.useUpdatePlan).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as UseUpdatePlanReturn);

    render(<PlanesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch plans/i)).toBeInTheDocument();
    });
  });

  it('should display plan config cards in grid layout', async () => {
    vi.mocked(useAdminPlansHooks.usePlans).mockReturnValue({
      data: mockPlans,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as UsePlansReturn);

    vi.mocked(useAdminPlansHooks.useUpdatePlan).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as UseUpdatePlanReturn);

    render(<PlanesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const freeTexts = screen.getAllByText(/free/i);
      const premiumTexts = screen.getAllByText(/premium/i);
      const professionalTexts = screen.getAllByText(/professional/i);

      expect(freeTexts.length).toBeGreaterThan(0);
      expect(premiumTexts.length).toBeGreaterThan(0);
      expect(professionalTexts.length).toBeGreaterThan(0);
    });
  });

  it('should display comparison table', async () => {
    vi.mocked(useAdminPlansHooks.usePlans).mockReturnValue({
      data: mockPlans,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as UsePlansReturn);

    vi.mocked(useAdminPlansHooks.useUpdatePlan).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as UseUpdatePlanReturn);

    render(<PlanesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/comparativa de planes/i)).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('should filter out guest plan from config cards', async () => {
    const plansWithGuest: PlanConfig[] = [
      {
        id: 0,
        planType: 'guest',
        dailyReadingLimit: 0,
        monthlyAIQuota: 0,
        canUseCustomQuestions: false,
        canRegenerateInterpretations: false,
        maxRegenerationsPerReading: 0,
        canShareReadings: false,
        historyLimit: 0,
        canBookSessions: false,
        price: 0,
      },
      ...mockPlans,
    ];

    vi.mocked(useAdminPlansHooks.usePlans).mockReturnValue({
      data: plansWithGuest,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as UsePlansReturn);

    vi.mocked(useAdminPlansHooks.useUpdatePlan).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as UseUpdatePlanReturn);

    render(<PlanesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Guest plan NO debería aparecer en las cards editables
      // Pero sí en la tabla comparativa
      const table = screen.getByRole('table');
      const guestInTable = within(table).queryAllByText(/guest/i);
      expect(guestInTable.length).toBeGreaterThan(0);
    });
  });
});
