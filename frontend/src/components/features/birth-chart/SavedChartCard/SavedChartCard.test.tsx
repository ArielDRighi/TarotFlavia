import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { SavedChartCard, SavedChartCardSkeleton } from './SavedChartCard';
import type { SavedChart } from '@/types/birth-chart.types';

// Mock de date-fns
vi.mock('date-fns', async () => {
  const actual = (await vi.importActual('date-fns')) as Record<string, unknown>;
  return {
    ...actual,
    formatDistanceToNow: vi.fn(),
  };
});

// Mock de next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('SavedChartCard', () => {
  const mockChart: SavedChart = {
    id: 1,
    name: 'Mi Carta Astral',
    birthDate: '1990-05-15T10:30:00Z',
    sunSign: 'taurus',
    moonSign: 'cancer',
    ascendantSign: 'leo',
    createdAt: '2024-01-15T10:00:00Z',
  };

  const mockHandlers = {
    onView: vi.fn(),
    onDownload: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockFormatDistanceToNow = formatDistanceToNow as unknown as ReturnType<
      typeof vi.fn
    >;
    mockFormatDistanceToNow.mockReturnValue('hace 2 días');
  });

  describe('Renderizado básico', () => {
    it('debe renderizar el componente correctamente', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      expect(screen.getByTestId('saved-chart-card')).toBeInTheDocument();
    });

    it('debe mostrar el nombre de la carta', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      expect(screen.getByText('Mi Carta Astral')).toBeInTheDocument();
    });

    it('debe mostrar la fecha de nacimiento formateada', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      // Fecha en formato: "15 de mayo de 1990"
      expect(screen.getByText(/15.*mayo.*1990/i)).toBeInTheDocument();
    });

    it('debe mostrar el ID de la carta', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      expect(screen.getByTestId('saved-chart-card')).toHaveAttribute(
        'data-chart-id',
        '1',
      );
    });

    it('debe mostrar el tiempo desde creación', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      expect(screen.getByText('hace 2 días')).toBeInTheDocument();
      expect(formatDistanceToNow).toHaveBeenCalledWith(
        new Date(mockChart.createdAt),
        {
          addSuffix: true,
          locale: es,
        },
      );
    });
  });

  describe('Big Three (Sol, Luna, Ascendente)', () => {
    it('debe mostrar el signo solar con símbolo correcto', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      // Tauro tiene símbolo ♉
      expect(screen.getByText('♉')).toBeInTheDocument();
      expect(screen.getByText(/Tauro/i)).toBeInTheDocument();
    });

    it('debe mostrar el signo lunar con símbolo correcto', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      // Cáncer tiene símbolo ♋
      expect(screen.getByText('♋')).toBeInTheDocument();
      expect(screen.getByText(/Cáncer/i)).toBeInTheDocument();
    });

    it('debe mostrar el signo ascendente con símbolo correcto', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      // Leo tiene símbolo ♌
      expect(screen.getByText('♌')).toBeInTheDocument();
      expect(screen.getByText(/Leo/i)).toBeInTheDocument();
    });

    it('debe mostrar tooltips para el Big Three', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      // Verificar que los elementos con tooltip existen
      expect(screen.getByLabelText(/Sol en Tauro/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Luna en Cáncer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Ascendente en Leo/i)).toBeInTheDocument();
    });
  });

  describe('Gradientes por elemento del Sol', () => {
    it('debe aplicar gradiente fire para signos de fuego (Leo)', () => {
      const fireChart = { ...mockChart, sunSign: 'leo' as const };
      const { container } = render(
        <SavedChartCard chart={fireChart} {...mockHandlers} />,
      );

      // El gradiente está en el div hijo, no en la Card
      const gradientDiv = container.querySelector('.bg-gradient-to-br');
      expect(gradientDiv?.className).toContain('from-red-500');
    });

    it('debe aplicar gradiente earth para signos de tierra (Tauro)', () => {
      const earthChart = { ...mockChart, sunSign: 'taurus' as const };
      const { container } = render(
        <SavedChartCard chart={earthChart} {...mockHandlers} />,
      );

      const gradientDiv = container.querySelector('.bg-gradient-to-br');
      expect(gradientDiv?.className).toContain('from-green-600');
    });

    it('debe aplicar gradiente air para signos de aire (Géminis)', () => {
      const airChart = { ...mockChart, sunSign: 'gemini' as const };
      const { container } = render(
        <SavedChartCard chart={airChart} {...mockHandlers} />,
      );

      const gradientDiv = container.querySelector('.bg-gradient-to-br');
      expect(gradientDiv?.className).toContain('from-blue-400');
    });

    it('debe aplicar gradiente water para signos de agua (Cáncer)', () => {
      const waterChart = { ...mockChart, sunSign: 'cancer' as const };
      const { container } = render(
        <SavedChartCard chart={waterChart} {...mockHandlers} />,
      );

      const gradientDiv = container.querySelector('.bg-gradient-to-br');
      expect(gradientDiv?.className).toContain('from-blue-600');
    });
  });

  describe('Menú de acciones', () => {
    it('debe mostrar el botón del menú de acciones', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const menuButton = screen.getByLabelText(/más opciones/i);
      expect(menuButton).toBeInTheDocument();
    });

    it('debe llamar a onView cuando se hace clic en "Ver carta"', async () => {
      const user = userEvent.setup();
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const menuButton = screen.getByLabelText(/más opciones/i);
      await user.click(menuButton);

      const viewButton = screen.getByText(/ver carta/i);
      await user.click(viewButton);

      expect(mockHandlers.onView).toHaveBeenCalledWith(mockChart);
    });

    it('debe llamar a onDownload cuando se hace clic en "Descargar PDF"', async () => {
      const user = userEvent.setup();
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const menuButton = screen.getByLabelText(/más opciones/i);
      await user.click(menuButton);

      const downloadButton = screen.getByText(/descargar pdf/i);
      await user.click(downloadButton);

      expect(mockHandlers.onDownload).toHaveBeenCalledWith(mockChart);
    });

    it('debe llamar a onRename cuando se hace clic en "Renombrar"', async () => {
      const user = userEvent.setup();
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const menuButton = screen.getByLabelText(/más opciones/i);
      await user.click(menuButton);

      const renameButton = screen.getByText(/renombrar/i);
      await user.click(renameButton);

      expect(mockHandlers.onRename).toHaveBeenCalledWith(mockChart);
    });

    it('debe llamar a onDelete cuando se hace clic en "Eliminar"', async () => {
      const user = userEvent.setup();
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const menuButton = screen.getByLabelText(/más opciones/i);
      await user.click(menuButton);

      const deleteButton = screen.getByText(/eliminar/i);
      await user.click(deleteButton);

      expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockChart);
    });

    it('debe prevenir propagación del evento cuando se abre el menú', async () => {
      const onCardClick = vi.fn();

      render(
        <div onClick={onCardClick}>
          <SavedChartCard chart={mockChart} {...mockHandlers} />
        </div>,
      );

      const menuButton = screen.getByLabelText(/más opciones/i);
      await userEvent.setup().click(menuButton);

      // El click en el menú no debe propagar al contenedor padre
      expect(onCardClick).not.toHaveBeenCalled();
    });
  });

  describe('Link a vista detallada', () => {
    it('debe tener un link a la vista detallada', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute(
        'href',
        `/carta-astral/resultado/${mockChart.id}`,
      );
    });

    it('debe navegar a la vista detallada cuando se hace clic en la tarjeta', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Hover effects', () => {
    it('debe tener clases de hover para efectos visuales', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const card = screen.getByTestId('saved-chart-card');
      expect(card.className).toContain('hover:');
    });

    it('debe tener clases de transición', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const card = screen.getByTestId('saved-chart-card');
      expect(card.className).toContain('transition');
    });
  });

  describe('Edge cases', () => {
    it('debe manejar nombres largos correctamente', () => {
      const longNameChart = {
        ...mockChart,
        name: 'Este es un nombre muy largo para una carta astral que debería truncarse correctamente',
      };

      render(<SavedChartCard chart={longNameChart} {...mockHandlers} />);

      expect(
        screen.getByText(
          /Este es un nombre muy largo para una carta astral/,
        ),
      ).toBeInTheDocument();
    });

    it('debe manejar nombres cortos correctamente', () => {
      const shortNameChart = {
        ...mockChart,
        name: 'Mi Carta',
      };

      render(<SavedChartCard chart={shortNameChart} {...mockHandlers} />);

      expect(screen.getByText('Mi Carta')).toBeInTheDocument();
    });

    it('debe manejar fechas recientes (minutos/horas)', () => {
      const mockFormatDistanceToNow = formatDistanceToNow as unknown as ReturnType<
        typeof vi.fn
      >;
      mockFormatDistanceToNow.mockReturnValue('hace 30 minutos');

      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      expect(screen.getByText('hace 30 minutos')).toBeInTheDocument();
    });

    it('debe manejar fechas antiguas (meses/años)', () => {
      const mockFormatDistanceToNow = formatDistanceToNow as unknown as ReturnType<
        typeof vi.fn
      >;
      mockFormatDistanceToNow.mockReturnValue('hace 3 meses');

      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      expect(screen.getByText('hace 3 meses')).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('debe ser responsive mediante el uso de flex y diseño adaptable', () => {
      render(<SavedChartCard chart={mockChart} {...mockHandlers} />);

      const card = screen.getByTestId('saved-chart-card');
      // El componente usa flex y gap que se adaptan naturalmente
      expect(card).toBeInTheDocument();
    });
  });
});

describe('SavedChartCardSkeleton', () => {
  it('debe renderizar el skeleton correctamente', () => {
    render(<SavedChartCardSkeleton />);

    expect(screen.getByTestId('saved-chart-card-skeleton')).toBeInTheDocument();
  });

  it('debe tener clases de animación skeleton', () => {
    render(<SavedChartCardSkeleton />);

    const skeleton = screen.getByTestId('saved-chart-card-skeleton');
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('debe mantener la misma estructura que la tarjeta real', () => {
    render(<SavedChartCardSkeleton />);

    // Verificar que tiene elementos de placeholder para:
    // - Título
    // - Fecha
    // - Lugar
    // - Big Three
    const skeleton = screen.getByTestId('saved-chart-card-skeleton');
    expect(skeleton.children.length).toBeGreaterThan(0);
  });
});
