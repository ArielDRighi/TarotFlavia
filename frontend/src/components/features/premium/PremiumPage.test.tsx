import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PremiumPage } from './PremiumPage';
import type { PlanConfig } from '@/types/admin.types';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock Next.js Link (forward className so focus-ring assertions can inspect it)
vi.mock('next/link', () => ({
  default: function MockLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
}));

// Mock Next.js Image (PremiumHero uses next/image for the mystic band asset)
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock plan data
const mockPremiumPlan: PlanConfig = {
  id: 2,
  planType: 'premium',
  name: 'Plan Premium',
  description: 'Acceso completo a todas las funciones',
  price: 7000,
  readingsLimit: -1,
  aiQuotaMonthly: -1,
  birthChartMonthlyLimit: -1,
  allowCustomQuestions: true,
  allowSharing: true,
  allowAdvancedSpreads: true,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockFreePlan: PlanConfig = {
  id: 1,
  planType: 'free',
  name: 'Plan Gratuito',
  description: 'Empieza tu viaje espiritual',
  price: 0,
  readingsLimit: 3,
  aiQuotaMonthly: 0,
  birthChartMonthlyLimit: -1,
  allowCustomQuestions: false,
  allowSharing: false,
  allowAdvancedSpreads: false,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// Mock subscription hook
const mockMutate = vi.fn();
vi.mock('@/hooks/api/useSubscription', () => ({
  useCreatePreapproval: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

// Default auth mock (unauthenticated)
const mockAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore(),
}));

// Mock public plans hook
const mockUsePlans = vi.fn();
vi.mock('@/hooks/api/usePublicPlans', () => ({
  usePublicPlans: () => mockUsePlans(),
}));

// Query client factory
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('PremiumPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render loading skeleton when plans are loading', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });
      mockUsePlans.mockReturnValue({ data: undefined, isLoading: true, isError: false });

      renderWithProviders(<PremiumPage />);

      expect(screen.getByTestId('premium-page-loading')).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      mockUsePlans.mockReturnValue({
        data: [mockFreePlan, mockPremiumPlan],
        isLoading: false,
        isError: false,
      });
    });

    it('should render page title', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });

      renderWithProviders(<PremiumPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render dynamic price from API data', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });

      renderWithProviders(<PremiumPage />);

      // Price appears in multiple places (hero text, plan card, button); getAllByText is correct here
      const priceElements = screen.getAllByText(/7\.000/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should render plan comparison section', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });

      renderWithProviders(<PremiumPage />);

      expect(screen.getByTestId('plan-comparison')).toBeInTheDocument();
    });

    it('should render FAQ section', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });

      renderWithProviders(<PremiumPage />);

      expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    });

    it('should render guarantee section', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });

      renderWithProviders(<PremiumPage />);

      expect(screen.getByText(/cancelá cuando quieras/i)).toBeInTheDocument();
    });

    // Canon visual (T-PREM-002 / PREM-002)
    it('should render the mystic premium hero band', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });

      renderWithProviders(<PremiumPage />);

      expect(screen.getByTestId('premium-hero')).toBeInTheDocument();
    });

    it('should render the "Recomendado" chip with night text on gold for AA contrast', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });

      renderWithProviders(<PremiumPage />);

      const chip = screen.getByText('Recomendado');
      // Texto noche (#1a0a2e) sobre dorado (#d69e2e) ≈ 7:1 (AA); blanco falla.
      expect(chip).toHaveClass('text-bg-hero');
      expect(chip).not.toHaveClass('text-white');
    });

    it('should not use raw purple/gray utility classes (brand canon, only tokens)', () => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });

      const { container } = renderWithProviders(<PremiumPage />);

      expect(container.querySelector('[class*="purple"]')).toBeNull();
      expect(container.querySelector('[class*="text-gray-"]')).toBeNull();
      expect(container.querySelector('[class*="bg-gray-"]')).toBeNull();
    });

    // Accesibilidad — cierre del circuito premium (T-PREM-008)
    describe('Accesibilidad (T-PREM-008)', () => {
      beforeEach(() => {
        mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });
      });

      it('should render a visible focus ring on every plan CTA (foco visible)', () => {
        renderWithProviders(<PremiumPage />);

        for (const testId of ['cta-hero', 'cta-card', 'cta-bottom']) {
          const cta = screen.getByTestId(testId);
          expect(cta.className).toMatch(/focus-visible:ring-secondary/);
        }
      });

      it('should render a visible focus ring on the "Ver mi cuenta" link for premium users (foco en links)', () => {
        // Usuario premium: el CTA se convierte en el link "Ver mi cuenta".
        mockAuthStore.mockReturnValue({
          user: { id: 1, email: 'test@test.com', plan: 'premium' },
          isAuthenticated: true,
        });

        renderWithProviders(<PremiumPage />);

        const accountLinks = screen.getAllByRole('link', { name: /ver mi cuenta/i });
        expect(accountLinks.length).toBeGreaterThan(0);
        accountLinks.forEach((link) =>
          expect(link.className).toMatch(/focus-visible:ring-secondary/)
        );
      });

      it('should label the comparison table check/cross icons for screen readers', () => {
        renderWithProviders(<PremiumPage />);

        // Cada fila aporta un icono por columna (Free/Premium) con etiqueta textual.
        expect(screen.getAllByLabelText('Incluido').length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText('No incluido').length).toBeGreaterThan(0);
      });

      it('should wrap sections in Reveal (base para respetar prefers-reduced-motion)', () => {
        const { container } = renderWithProviders(<PremiumPage />);

        // Las secciones se envuelven en `Reveal` (marcado con `data-reveal`). La
        // lógica de movimiento reducido en sí está testeada en `Reveal.test`/
        // `useReducedMotion.test`; aquí solo se fija que las secciones la usen.
        expect(container.querySelectorAll('[data-reveal]').length).toBeGreaterThan(0);
      });

      it('should render the hero band asset with a Spanish alt (imagen con alt)', () => {
        renderWithProviders(<PremiumPage />);

        const heroImage = screen.getByTestId('next-image');
        expect(heroImage).toHaveAttribute('alt');
        expect(heroImage.getAttribute('alt')?.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('CTA - Unauthenticated user', () => {
    beforeEach(() => {
      mockAuthStore.mockReturnValue({ user: null, isAuthenticated: false });
      mockUsePlans.mockReturnValue({
        data: [mockFreePlan, mockPremiumPlan],
        isLoading: false,
        isError: false,
      });
    });

    it('should render "Comenzar Premium" CTA button', () => {
      renderWithProviders(<PremiumPage />);

      expect(screen.getByTestId('cta-hero')).toBeInTheDocument();
    });

    it('should redirect to /registro when unauthenticated user clicks CTA', async () => {
      renderWithProviders(<PremiumPage />);

      fireEvent.click(screen.getByTestId('cta-hero'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/registro');
      });
    });
  });

  describe('CTA - Free user', () => {
    beforeEach(() => {
      mockAuthStore.mockReturnValue({
        user: { id: 1, email: 'test@test.com', plan: 'free' },
        isAuthenticated: true,
      });
      mockUsePlans.mockReturnValue({
        data: [mockFreePlan, mockPremiumPlan],
        isLoading: false,
        isError: false,
      });
    });

    it('should render "Comenzar Premium" CTA button for free user', () => {
      renderWithProviders(<PremiumPage />);

      expect(screen.getByTestId('cta-hero')).toBeInTheDocument();
    });

    it('should call useCreatePreapproval when free user clicks CTA', async () => {
      renderWithProviders(<PremiumPage />);

      fireEvent.click(screen.getByTestId('cta-hero'));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });
  });

  describe('CTA - Premium user', () => {
    beforeEach(() => {
      mockAuthStore.mockReturnValue({
        user: { id: 2, email: 'premium@test.com', plan: 'premium' },
        isAuthenticated: true,
      });
      mockUsePlans.mockReturnValue({
        data: [mockFreePlan, mockPremiumPlan],
        isLoading: false,
        isError: false,
      });
    });

    it('should show "Ya tenés Premium" message for premium user', () => {
      renderWithProviders(<PremiumPage />);

      const messages = screen.getAllByText(/ya tenés premium/i);
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should render link to profile for premium user', () => {
      renderWithProviders(<PremiumPage />);

      const profileLinks = screen.getAllByRole('link', { name: /ver mi cuenta/i });
      expect(profileLinks[0]).toHaveAttribute('href', '/perfil');
    });
  });
});
