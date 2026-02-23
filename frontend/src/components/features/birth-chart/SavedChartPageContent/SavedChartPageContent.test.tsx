import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SavedChartPageContent } from './SavedChartPageContent';
import type { SavedChartResponse } from '@/types/birth-chart-api.types';
import { ZodiacSign } from '@/types/birth-chart.enums';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: '1' }),
}));

// Mock de next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock de hooks de birth chart
vi.mock('@/hooks/api/useBirthChart', () => ({
  useSavedChart: vi.fn(),
  useRenameChart: vi.fn(),
  useDeleteChart: vi.fn(),
}));

// Mock de hook de descarga PDF
vi.mock('@/hooks/api/useDownloadPdf', () => ({
  useDownloadSavedChartPdf: vi.fn(),
}));

// Mock de componentes complejos de birth-chart
vi.mock('@/components/features/birth-chart/ChartWheel/ChartWheel', () => ({
  ChartWheel: () => <div data-testid="chart-wheel-mock">ChartWheel</div>,
}));

vi.mock('@/components/features/birth-chart/BigThree/BigThree', () => ({
  BigThree: () => <div data-testid="big-three-mock">BigThree</div>,
}));

vi.mock('@/components/features/birth-chart/PlanetPositionsTable/PlanetPositionsTable', () => ({
  PlanetPositionsTable: () => <div data-testid="planet-positions-mock">PlanetPositionsTable</div>,
}));

vi.mock('@/components/features/birth-chart/AspectsTable/AspectsTable', () => ({
  AspectsTable: () => <div data-testid="aspects-table-mock">AspectsTable</div>,
}));

vi.mock('@/components/features/birth-chart/ElementDistribution/ElementDistribution', () => ({
  ElementDistribution: () => <div data-testid="element-distribution-mock">ElementDistribution</div>,
}));

vi.mock('@/components/features/birth-chart/PlanetInterpretation/PlanetInterpretation', () => ({
  PlanetInterpretation: () => (
    <div data-testid="planet-interpretation-mock">PlanetInterpretation</div>
  ),
}));

vi.mock('@/components/features/birth-chart/AISynthesis/AISynthesis', () => ({
  AISynthesis: () => <div data-testid="ai-synthesis-mock">AISynthesis</div>,
}));

// Imports del módulo después de los mocks
import { useSavedChart, useRenameChart, useDeleteChart } from '@/hooks/api/useBirthChart';
import { useDownloadSavedChartPdf } from '@/hooks/api/useDownloadPdf';

// Tipos de retorno de los hooks mockeados
type UseSavedChartReturn = ReturnType<typeof useSavedChart>;
type UseRenameChartReturn = ReturnType<typeof useRenameChart>;
type UseDeleteChartReturn = ReturnType<typeof useDeleteChart>;
type UseDownloadSavedChartPdfReturn = ReturnType<typeof useDownloadSavedChartPdf>;

const mockUseSavedChart = useSavedChart as unknown as ReturnType<typeof vi.fn>;
const mockUseRenameChart = useRenameChart as unknown as ReturnType<typeof vi.fn>;
const mockUseDeleteChart = useDeleteChart as unknown as ReturnType<typeof vi.fn>;
const mockUseDownloadSavedChartPdf = useDownloadSavedChartPdf as unknown as ReturnType<
  typeof vi.fn
>;

// Datos de carta de prueba con datos de nacimiento
const mockChart: SavedChartResponse = {
  success: true,
  name: 'Carta de Ana',
  createdAt: '2026-02-23T15:00:00.000Z',
  birthDate: '1990-08-15',
  birthTime: '14:30',
  birthPlace: 'Buenos Aires, Argentina',
  savedChartId: 1,
  canDownloadPdf: true,
  canAccessHistory: true,
  chartSvgData: {
    planets: [],
    houses: [],
    aspects: [],
  },
  planets: [],
  houses: [],
  aspects: [],
  bigThree: {
    sun: {
      sign: ZodiacSign.LEO,
      signName: 'Leo',
      interpretation: '',
    },
    moon: {
      sign: ZodiacSign.CANCER,
      signName: 'Cáncer',
      interpretation: '',
    },
    ascendant: {
      sign: ZodiacSign.SCORPIO,
      signName: 'Escorpio',
      interpretation: '',
    },
  },
  calculationTimeMs: 100,
  distribution: {
    elements: [],
    modalities: [],
  },
  interpretations: {
    planets: [],
  },
  aiSynthesis: {
    content: 'Síntesis IA de prueba',
    generatedAt: '2026-02-23T15:00:00.000Z',
    provider: 'openai',
  },
};

// Defaults para los hooks auxiliares
const defaultRenameChartMock: Partial<UseRenameChartReturn> = {
  mutate: vi.fn(),
  isPending: false,
};

const defaultDeleteChartMock: Partial<UseDeleteChartReturn> = {
  mutate: vi.fn(),
  isPending: false,
};

const defaultDownloadPdfMock: Partial<UseDownloadSavedChartPdfReturn> = {
  mutate: vi.fn(),
  isPending: false,
};

describe('SavedChartPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRenameChart.mockReturnValue(defaultRenameChartMock);
    mockUseDeleteChart.mockReturnValue(defaultDeleteChartMock);
    mockUseDownloadSavedChartPdf.mockReturnValue(defaultDownloadPdfMock);
  });

  describe('Datos de nacimiento en subtítulo', () => {
    beforeEach(() => {
      const savedChartReturn: Partial<UseSavedChartReturn> = {
        data: mockChart,
        isLoading: false,
        error: null,
      };
      mockUseSavedChart.mockReturnValue(savedChartReturn);
    });

    it('debe mostrar la fecha de nacimiento formateada en el subtítulo', () => {
      render(<SavedChartPageContent />);

      // "15 de agosto de 1990" en español
      expect(screen.getByText(/15.*agosto.*1990/i)).toBeInTheDocument();
    });

    it('debe mostrar la hora de nacimiento en el subtítulo', () => {
      render(<SavedChartPageContent />);

      expect(screen.getByText(/14:30/)).toBeInTheDocument();
    });

    it('debe mostrar el lugar de nacimiento en el subtítulo', () => {
      render(<SavedChartPageContent />);

      expect(screen.getByText(/Buenos Aires, Argentina/)).toBeInTheDocument();
    });

    it('debe mostrar los datos de nacimiento con data-testid "birth-info-subtitle"', () => {
      render(<SavedChartPageContent />);

      const subtitleElement = screen.getByTestId('birth-info-subtitle');
      expect(subtitleElement).toBeInTheDocument();
      expect(subtitleElement.textContent).toMatch(/agosto.*1990/i);
      expect(subtitleElement.textContent).toContain('14:30');
      expect(subtitleElement.textContent).toContain('Buenos Aires, Argentina');
    });

    it('NO debe mostrar la fecha de creación en el subtítulo', () => {
      render(<SavedChartPageContent />);

      // "Guardada el" texto no debe aparecer
      expect(screen.queryByText(/Guardada el/i)).not.toBeInTheDocument();
    });
  });

  describe('Datos de nacimiento parciales', () => {
    it('debe mostrar solo la fecha si birthTime y birthPlace no están disponibles', () => {
      const chartSinHoraLugar: SavedChartResponse = {
        ...mockChart,
        birthDate: '1990-08-15',
        birthTime: undefined,
        birthPlace: undefined,
      };
      const savedChartReturn: Partial<UseSavedChartReturn> = {
        data: chartSinHoraLugar,
        isLoading: false,
        error: null,
      };
      mockUseSavedChart.mockReturnValue(savedChartReturn);

      render(<SavedChartPageContent />);

      expect(screen.getByText(/15.*agosto.*1990/i)).toBeInTheDocument();
      // No debe mostrar "•" si no hay hora ni lugar
      const subtitleElement = screen.getByTestId('birth-info-subtitle');
      expect(subtitleElement.textContent).not.toContain('•');
    });

    it('debe mostrar fecha y hora si birthPlace no está disponible', () => {
      const chartSinLugar: SavedChartResponse = {
        ...mockChart,
        birthDate: '1990-08-15',
        birthTime: '14:30',
        birthPlace: undefined,
      };
      const savedChartReturn: Partial<UseSavedChartReturn> = {
        data: chartSinLugar,
        isLoading: false,
        error: null,
      };
      mockUseSavedChart.mockReturnValue(savedChartReturn);

      render(<SavedChartPageContent />);

      const subtitleElement = screen.getByTestId('birth-info-subtitle');
      expect(subtitleElement.textContent).toMatch(/agosto.*1990/i);
      expect(subtitleElement.textContent).toContain('14:30');
      expect(subtitleElement.textContent).not.toContain('Buenos Aires');
    });

    it('no debe mostrar el subtítulo si no hay ningún dato de nacimiento', () => {
      const chartSinDatos: SavedChartResponse = {
        ...mockChart,
        birthDate: undefined,
        birthTime: undefined,
        birthPlace: undefined,
      };
      const savedChartReturn: Partial<UseSavedChartReturn> = {
        data: chartSinDatos,
        isLoading: false,
        error: null,
      };
      mockUseSavedChart.mockReturnValue(savedChartReturn);

      render(<SavedChartPageContent />);

      expect(screen.queryByTestId('birth-info-subtitle')).not.toBeInTheDocument();
    });
  });

  describe('Estado de carga', () => {
    it('debe mostrar esqueleto de carga cuando isLoading es true', () => {
      const savedChartReturn: Partial<UseSavedChartReturn> = {
        data: undefined,
        isLoading: true,
        error: null,
      };
      mockUseSavedChart.mockReturnValue(savedChartReturn);

      render(<SavedChartPageContent />);

      // No debe mostrar el contenido principal
      expect(screen.queryByTestId('birth-info-subtitle')).not.toBeInTheDocument();
    });
  });

  describe('Estado de error', () => {
    it('debe mostrar mensaje de error cuando hay un error', () => {
      const savedChartReturn: Partial<UseSavedChartReturn> = {
        data: undefined,
        isLoading: false,
        error: new Error('Not found'),
      };
      mockUseSavedChart.mockReturnValue(savedChartReturn);

      render(<SavedChartPageContent />);

      expect(screen.getByText(/Carta no encontrada/i)).toBeInTheDocument();
    });
  });

  describe('Nombre de la carta', () => {
    it('debe mostrar el nombre de la carta como título principal', () => {
      const savedChartReturn: Partial<UseSavedChartReturn> = {
        data: mockChart,
        isLoading: false,
        error: null,
      };
      mockUseSavedChart.mockReturnValue(savedChartReturn);

      render(<SavedChartPageContent />);

      expect(screen.getByText('Carta de Ana')).toBeInTheDocument();
    });
  });
});
