import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import AdminTarotistasPage from './page';
import { useAdminTarotistas, useTarotistaApplications } from '@/hooks/api/useAdminTarotistas';
import {
  useDeactivateTarotista,
  useReactivateTarotista,
  useApproveApplication,
  useRejectApplication,
} from '@/hooks/api/useAdminTarotistaActions';

vi.mock('@/hooks/api/useAdminTarotistas', () => ({
  useAdminTarotistas: vi.fn(),
  useTarotistaApplications: vi.fn(),
}));

vi.mock('@/hooks/api/useAdminTarotistaActions', () => ({
  useDeactivateTarotista: vi.fn(),
  useReactivateTarotista: vi.fn(),
  useApproveApplication: vi.fn(),
  useRejectApplication: vi.fn(),
}));

describe('AdminTarotistasPage', () => {
  let queryClient: QueryClient;
  const mockUseAdminTarotistas = vi.mocked(useAdminTarotistas);
  const mockUseTarotistaApplications = vi.mocked(useTarotistaApplications);
  const mockUseDeactivateTarotista = vi.mocked(useDeactivateTarotista);
  const mockUseReactivateTarotista = vi.mocked(useReactivateTarotista);
  const mockUseApproveApplication = vi.mocked(useApproveApplication);
  const mockUseRejectApplication = vi.mocked(useRejectApplication);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Configurar mocks con estado vacío inicial
    // Note: Mocks simplificados para tests de rendering básico
    // Partial types son suficientes para testear solo la UI
    mockUseAdminTarotistas.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof mockUseAdminTarotistas>> as ReturnType<
      typeof mockUseAdminTarotistas
    >);

    mockUseTarotistaApplications.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof mockUseTarotistaApplications>> as ReturnType<
      typeof mockUseTarotistaApplications
    >);

    mockUseDeactivateTarotista.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof mockUseDeactivateTarotista>> as ReturnType<
      typeof mockUseDeactivateTarotista
    >);

    mockUseReactivateTarotista.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof mockUseReactivateTarotista>> as ReturnType<
      typeof mockUseReactivateTarotista
    >);

    mockUseApproveApplication.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof mockUseApproveApplication>> as ReturnType<
      typeof mockUseApproveApplication
    >);

    mockUseRejectApplication.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof mockUseRejectApplication>> as ReturnType<
      typeof mockUseRejectApplication
    >);
  });

  it('should render admin tarotistas page with correct title', () => {
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AdminTarotistasPage)
      )
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /gestión de tarotistas/i })
    ).toBeInTheDocument();
  });

  it('should have min-h-screen class', () => {
    const { container } = render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AdminTarotistasPage)
      )
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('should have bg-bg-main class', () => {
    const { container } = render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AdminTarotistasPage)
      )
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have font-serif class on heading', () => {
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AdminTarotistasPage)
      )
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
