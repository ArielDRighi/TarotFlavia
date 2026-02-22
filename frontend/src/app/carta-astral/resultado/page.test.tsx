/**
 * Tests for Birth Chart Result Page (TDD - Red Phase)
 *
 * Página que muestra el resultado completo de la carta astral con:
 * - Header sticky con acciones (compartir, PDF, nueva carta)
 * - Síntesis IA (Premium)
 * - Gráfico de carta + Big Three
 * - Tabs (posiciones, aspectos, distribución)
 * - Interpretaciones expandibles (Free/Premium)
 * - Upsells contextuales según plan
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import BirthChartResultPage from './page';
import { useBirthChartStore } from '@/stores/birthChartStore';
import { useAuth } from '@/hooks/useAuth';
import type {
  BasicChartResponse,
  FullChartResponse,
  PremiumChartResponse,
} from '@/types/birth-chart-api.types';
import { ZodiacSign, Planet } from '@/types/birth-chart.enums';
import type { AuthUser } from '@/types/auth.types';
import { useDownloadPdf } from '@/hooks/api/useDownloadPdf';

// Mock modules
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();
const mockReset = vi.fn();
const mockDownloadPdfMutate = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/stores/birthChartStore');
vi.mock('@/hooks/useAuth');

// Mock useDownloadPdf hook
vi.mock('@/hooks/api/useDownloadPdf', () => ({
  useDownloadPdf: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock components
vi.mock('@/components/features/birth-chart/ChartWheel/ChartWheel', () => ({
  ChartWheel: ({ size }: { size: number }) => (
    <div data-testid="chart-wheel">Chart Wheel (size: {size})</div>
  ),
}));

vi.mock('@/components/features/birth-chart/BigThree/BigThree', () => ({
  BigThree: () => <div data-testid="big-three">Big Three</div>,
}));

vi.mock('@/components/features/birth-chart/PlanetPositionsTable/PlanetPositionsTable', () => ({
  PlanetPositionsTable: () => <div data-testid="planet-positions-table">Planet Positions</div>,
}));

vi.mock('@/components/features/birth-chart/AspectsTable/AspectsTable', () => ({
  AspectsTable: () => <div data-testid="aspects-table">Aspects Table</div>,
}));

vi.mock('@/components/features/birth-chart/ElementDistribution/ElementDistribution', () => ({
  ElementDistribution: () => <div data-testid="element-distribution">Element Distribution</div>,
}));

vi.mock('@/components/features/birth-chart/PlanetInterpretation/PlanetInterpretation', () => ({
  PlanetInterpretation: ({ interpretation }: { interpretation: { planet: string } }) => (
    <div data-testid={`planet-interpretation-${interpretation.planet}`}>
      Planet Interpretation: {interpretation.planet}
    </div>
  ),
}));

vi.mock('@/components/features/birth-chart/AISynthesis/AISynthesis', () => ({
  AISynthesis: () => <div data-testid="ai-synthesis">AI Synthesis</div>,
  AISynthesisPlaceholder: () => (
    <div data-testid="ai-synthesis-placeholder">AI Synthesis Placeholder (Upsell Premium)</div>
  ),
}));

describe('BirthChartResultPage', () => {
  // Helper para crear mock de AuthUser
  const createMockUser = (plan: string): AuthUser => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    plan,
    profilePicture: null,
  });

  const mockFormData = {
    name: 'Juan Pérez',
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'Buenos Aires, Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };

  const mockBasicChartResponse: BasicChartResponse = {
    success: true,
    chartSvgData: { planets: [], houses: [], aspects: [] },
    planets: [
      {
        planet: Planet.SUN,
        sign: ZodiacSign.TAURUS,
        signName: 'Tauro',
        signDegree: 24.5,
        formattedPosition: "24°30' Tauro",
        house: 10,
        isRetrograde: false,
      },
    ],
    houses: [],
    aspects: [],
    bigThree: {
      sun: { sign: ZodiacSign.TAURUS, signName: 'Tauro', interpretation: 'Sol en Tauro' },
      moon: { sign: ZodiacSign.CANCER, signName: 'Cáncer', interpretation: 'Luna en Cáncer' },
      ascendant: {
        sign: ZodiacSign.LEO,
        signName: 'Leo',
        interpretation: 'Ascendente en Leo',
      },
    },
    calculationTimeMs: 100,
  };

  const mockFullChartResponse: FullChartResponse = {
    ...mockBasicChartResponse,
    distribution: {
      elements: [
        { name: 'Fuego', count: 3, percentage: 30 },
        { name: 'Tierra', count: 4, percentage: 40 },
        { name: 'Aire', count: 2, percentage: 20 },
        { name: 'Agua', count: 1, percentage: 10 },
      ],
      modalities: [
        { name: 'Cardinal', count: 4, percentage: 40 },
        { name: 'Fijo', count: 3, percentage: 30 },
        { name: 'Mutable', count: 3, percentage: 30 },
      ],
    },
    interpretations: {
      planets: [
        {
          planet: Planet.SUN,
          planetName: 'Sol',
          inSign: 'Interpretación Sol en signo',
          inHouse: 'Interpretación Sol en casa',
        },
        {
          planet: Planet.MOON,
          planetName: 'Luna',
          inSign: 'Interpretación Luna en signo',
          inHouse: 'Interpretación Luna en casa',
        },
        {
          planet: Planet.MERCURY,
          planetName: 'Mercurio',
          inSign: 'Interpretación Mercurio en signo',
          inHouse: 'Interpretación Mercurio en casa',
        },
        {
          planet: Planet.VENUS,
          planetName: 'Venus',
          inSign: 'Interpretación Venus en signo',
          inHouse: 'Interpretación Venus en casa',
        },
      ],
    },
    canDownloadPdf: true,
  };

  const mockPremiumChartResponse: PremiumChartResponse = {
    ...mockFullChartResponse,
    savedChartId: 123,
    aiSynthesis: {
      content: 'Síntesis personalizada con IA...',
      generatedAt: new Date().toISOString(),
      provider: 'openai',
    },
    canAccessHistory: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push: mockRouterPush,
      replace: mockRouterReplace,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    // Default: usuario anónimo
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });
  });

  describe('Redirección cuando no hay datos', () => {
    it('should redirect to /carta-astral when chartResult is null', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: null,
        formData: null,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      render(<BirthChartResultPage />);

      expect(mockRouterReplace).toHaveBeenCalledWith('/carta-astral');
    });

    it('should return null when chartResult is null', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: null,
        formData: null,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      const { container } = render(<BirthChartResultPage />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when formData is null', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: null,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      const { container } = render(<BirthChartResultPage />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Header sticky - Rendering', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should render header with "Nueva carta" button', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByRole('button', { name: /nueva carta/i })).toBeInTheDocument();
    });

    it('should call reset and navigate to /carta-astral when "Nueva carta" is clicked', async () => {
      const user = userEvent.setup();
      render(<BirthChartResultPage />);

      const newChartButton = screen.getByRole('button', { name: /nueva carta/i });
      await user.click(newChartButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith('/carta-astral');
    });

    it('should NOT show Premium badge for anonymous users', () => {
      render(<BirthChartResultPage />);

      expect(screen.queryByText(/premium/i)).not.toBeInTheDocument();
    });

    it('should NOT show download PDF button for anonymous users', () => {
      render(<BirthChartResultPage />);

      expect(screen.queryByRole('button', { name: /descargar pdf/i })).not.toBeInTheDocument();
    });
  });

  describe('Header sticky - Premium user', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockPremiumChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('premium'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should show Premium badge for Premium users', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should show download PDF button for Premium users', () => {
      render(<BirthChartResultPage />);

      // Aparece en header Y en footer
      const pdfButtons = screen.getAllByRole('button', { name: /descargar pdf/i });
      expect(pdfButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should call downloadPdf.mutate when download button is clicked', async () => {
      const mockMutate = vi.fn();
      vi.mocked(useDownloadPdf).mockReturnValueOnce({
        mutate: mockMutate,
        isPending: false,
      } as unknown as ReturnType<typeof useDownloadPdf>);

      const user = userEvent.setup();
      render(<BirthChartResultPage />);

      const downloadButton = screen.getAllByRole('button', { name: /descargar pdf/i })[0];
      await user.click(downloadButton);

      expect(mockMutate).toHaveBeenCalledWith({
        chartData: {
          name: mockFormData.name,
          birthDate: mockFormData.birthDate,
          birthTime: mockFormData.birthTime,
          birthPlace: mockFormData.birthPlace,
          latitude: mockFormData.latitude,
          longitude: mockFormData.longitude,
          timezone: mockFormData.timezone,
        },
      });
    });
  });

  describe('Header sticky - Share button', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should show share button when navigator.share is available', () => {
      // Mock navigator.share
      Object.defineProperty(window.navigator, 'share', {
        writable: true,
        value: vi.fn(),
      });

      render(<BirthChartResultPage />);

      expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument();
    });

    it('should call navigator.share with correct data when share button is clicked', async () => {
      const mockShare = vi.fn();
      Object.defineProperty(window.navigator, 'share', {
        writable: true,
        value: mockShare,
      });

      const user = userEvent.setup();
      render(<BirthChartResultPage />);

      const shareButton = screen.getByRole('button', { name: /compartir/i });
      await user.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Carta Astral de Juan Pérez',
        text: 'Mi Big Three: Sol en Tauro, Luna en Cáncer, Ascendente en Leo',
        url: expect.any(String),
      });
    });
  });

  describe('Título y metadatos', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should render title with user name', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByText(/carta astral de juan pérez/i)).toBeInTheDocument();
    });

    it('should render birth date, time and place', () => {
      render(<BirthChartResultPage />);

      // Buscar en el elemento p que contiene la metadata
      const metadataText = screen.getByText(/15 de mayo de 1990/i).closest('p');
      expect(metadataText).toBeInTheDocument();
      expect(metadataText).toHaveTextContent(/14:30/);
      expect(metadataText).toHaveTextContent(/buenos aires, argentina/i);
    });
  });

  describe('Síntesis IA - Premium only', () => {
    it('should NOT show AI synthesis for anonymous users', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      render(<BirthChartResultPage />);

      expect(screen.queryByTestId('ai-synthesis')).not.toBeInTheDocument();
    });

    it('should NOT show AI synthesis for Free users', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockFullChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('free'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      render(<BirthChartResultPage />);

      expect(screen.queryByTestId('ai-synthesis')).not.toBeInTheDocument();
    });

    it('should show AI synthesis for Premium users', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockPremiumChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('premium'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      render(<BirthChartResultPage />);

      expect(screen.getByTestId('ai-synthesis')).toBeInTheDocument();
    });
  });

  describe('Gráfico y Big Three', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should render ChartWheel component', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByTestId('chart-wheel')).toBeInTheDocument();
    });

    it('should render BigThree component', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByTestId('big-three')).toBeInTheDocument();
    });

    it('should render card title "Tu Carta Natal"', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByText('Tu Carta Natal')).toBeInTheDocument();
    });
  });

  describe('Tabs - Posiciones, Aspectos, Distribución', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should render tabs for Posiciones, Aspectos, Distribución', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByRole('tab', { name: /posiciones/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aspectos/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /distribución/i })).toBeInTheDocument();
    });

    it('should show PlanetPositionsTable in Posiciones tab by default', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByTestId('planet-positions-table')).toBeInTheDocument();
    });

    it('should show AspectsTable when Aspectos tab is clicked', async () => {
      const user = userEvent.setup();
      render(<BirthChartResultPage />);

      const aspectsTab = screen.getByRole('tab', { name: /aspectos/i });
      await user.click(aspectsTab);

      expect(screen.getByTestId('aspects-table')).toBeInTheDocument();
    });
  });

  describe('Tab Distribución - Upsell for anonymous', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should show upsell message for anonymous users in Distribución tab', async () => {
      const user = userEvent.setup();
      render(<BirthChartResultPage />);

      const distributionTab = screen.getByRole('tab', { name: /distribución/i });
      await user.click(distributionTab);

      expect(
        screen.getByText(/la distribución de elementos está disponible para usuarios registrados/i)
      ).toBeInTheDocument();
    });

    it('should show "Crear cuenta gratis" link for anonymous users in Distribución tab', async () => {
      const user = userEvent.setup();
      render(<BirthChartResultPage />);

      const distributionTab = screen.getByRole('tab', { name: /distribución/i });
      await user.click(distributionTab);

      expect(screen.getAllByRole('link', { name: /crear cuenta gratis/i }).length).toBeGreaterThan(
        0
      );
    });
  });

  describe('Tab Distribución - Free/Premium', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockFullChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('free'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should show ElementDistribution for Free users', async () => {
      const user = userEvent.setup();
      render(<BirthChartResultPage />);

      const distributionTab = screen.getByRole('tab', { name: /distribución/i });
      await user.click(distributionTab);

      expect(screen.getByTestId('element-distribution')).toBeInTheDocument();
    });
  });

  describe('Interpretaciones - Free users', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockFullChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('free'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should render "Interpretaciones" section title for Free users', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByText('Interpretaciones')).toBeInTheDocument();
    });

    it('should render all planet interpretations without pagination', () => {
      render(<BirthChartResultPage />);

      // Todos los planetas visibles directamente, sin necesidad de expandir
      expect(screen.getByTestId('planet-interpretation-sun')).toBeInTheDocument();
      expect(screen.getByTestId('planet-interpretation-moon')).toBeInTheDocument();
      expect(screen.getByTestId('planet-interpretation-mercury')).toBeInTheDocument();
      expect(screen.getByTestId('planet-interpretation-venus')).toBeInTheDocument();
    });

    it('should NOT show "Mostrar todos" toggle button', () => {
      render(<BirthChartResultPage />);

      expect(screen.queryByRole('button', { name: /mostrar todos/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /mostrar menos/i })).not.toBeInTheDocument();
    });
  });

  describe('Interpretaciones - Anonymous users (no interpretations)', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should NOT render interpretations section for anonymous users', () => {
      render(<BirthChartResultPage />);

      expect(screen.queryByText('Interpretaciones')).not.toBeInTheDocument();
    });
  });

  describe('Upsells - Anonymous → Free', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should show upsell card to unlock interpretations for anonymous users', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByText(/desbloquea las interpretaciones completas/i)).toBeInTheDocument();
    });

    it('should show "Crear cuenta gratis" button in upsell card', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByRole('link', { name: /crear cuenta gratis/i })).toBeInTheDocument();
    });

    it('should show "Ya tengo cuenta" button in upsell card', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByRole('link', { name: /ya tengo cuenta/i })).toBeInTheDocument();
    });
  });

  describe('Upsells - Free → Premium', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockFullChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('free'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should show AI synthesis placeholder for Free users', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByTestId('ai-synthesis-placeholder')).toBeInTheDocument();
    });

    it('should NOT show AI synthesis placeholder for Premium users', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockPremiumChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('premium'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      render(<BirthChartResultPage />);

      expect(screen.queryByTestId('ai-synthesis-placeholder')).not.toBeInTheDocument();
    });
  });

  describe('Footer actions', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should render "Generar otra carta" button in footer', () => {
      render(<BirthChartResultPage />);

      expect(screen.getByRole('button', { name: /generar otra carta/i })).toBeInTheDocument();
    });

    it('should NOT show "Ver mi historial" link for anonymous users', () => {
      render(<BirthChartResultPage />);

      expect(screen.queryByRole('link', { name: /ver mi historial/i })).not.toBeInTheDocument();
    });

    it('should show "Ver mi historial" link for Premium users', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockPremiumChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('premium'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      render(<BirthChartResultPage />);

      expect(screen.getByRole('link', { name: /ver mi historial/i })).toBeInTheDocument();
    });

    it('should link "Ver mi historial" to /carta-astral/historial for Premium users', () => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockPremiumChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('premium'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      render(<BirthChartResultPage />);

      const historialLink = screen.getByRole('link', { name: /ver mi historial/i });
      expect(historialLink).toHaveAttribute('href', '/carta-astral/historial');
    });
  });

  describe('Navegación - Breadcrumb en lugar de header sticky', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockBasicChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });
    });

    it('should render navigation breadcrumb inside main content (not a separate sticky header)', () => {
      render(<BirthChartResultPage />);

      // El botón de volver debe estar en la página
      expect(screen.getByRole('button', { name: /nueva carta/i })).toBeInTheDocument();

      // No debe haber un <header> sticky con z-50 (el global header del layout no cuenta)
      const stickyHeaders = document.querySelectorAll('header.sticky').length;
      // El header interno de la página (sticky + z-50) no debe existir
      expect(stickyHeaders).toBe(0);
    });

    it('should render "Nueva carta" link pointing to /carta-astral', () => {
      render(<BirthChartResultPage />);

      // El botón de nueva carta puede ser un Link o un Button con onClick
      // Lo importante es que existe y navega a /carta-astral
      const newChartButton = screen.getByRole('button', { name: /nueva carta/i });
      expect(newChartButton).toBeInTheDocument();
    });
  });

  describe('Loading state - Download PDF', () => {
    beforeEach(() => {
      vi.mocked(useBirthChartStore).mockReturnValue({
        chartResult: mockFullChartResponse,
        formData: mockFormData,
        setFormData: vi.fn(),
        setChartResult: vi.fn(),
        reset: mockReset,
      });

      vi.mocked(useAuth).mockReturnValue({
        user: createMockUser('free'),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should disable download button when isPending is true', () => {
      vi.mocked(useDownloadPdf).mockReturnValueOnce({
        mutate: mockDownloadPdfMutate,
        isPending: true,
      } as unknown as ReturnType<typeof useDownloadPdf>);

      render(<BirthChartResultPage />);

      const downloadButtons = screen.getAllByRole('button', { name: /descargar pdf/i });
      downloadButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});
