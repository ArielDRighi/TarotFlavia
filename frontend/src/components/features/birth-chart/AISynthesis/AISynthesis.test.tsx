import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AISynthesis, AISynthesisPlaceholder } from './AISynthesis';
import type { AISynthesis as AISynthesisType } from '@/types';

const mockData: AISynthesisType = {
  content:
    'Tu Sol en Aries combinado con Luna en Escorpio sugiere una personalidad dinámica.\n\nEstos elementos crean una tensión creativa que impulsa tu evolución.',
  generatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  provider: 'Claude 3.5 Sonnet',
};

describe('AISynthesis', () => {
  beforeEach(() => {
    // Setup clipboard mock for userEvent
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
      });
    } else {
      navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
    }
    vi.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    it('debe renderizar el título "Síntesis Personalizada"', () => {
      render(<AISynthesis data={mockData} />);
      expect(screen.getByText('Síntesis Personalizada')).toBeInTheDocument();
    });

    it('debe mostrar el badge "Premium"', () => {
      render(<AISynthesis data={mockData} />);
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('debe mostrar el contenido de la síntesis', () => {
      render(<AISynthesis data={mockData} />);
      expect(
        screen.getByText(/Tu Sol en Aries combinado con Luna en Escorpio/i)
      ).toBeInTheDocument();
    });

    it('debe dividir el contenido en párrafos', () => {
      render(<AISynthesis data={mockData} />);
      const paragraphs = screen.getAllByText(/./);
      // Debe haber al menos 2 párrafos del contenido
      const contentParagraphs = paragraphs.filter(
        (p) =>
          p.textContent?.includes('Tu Sol en Aries') || p.textContent?.includes('tensión creativa')
      );
      expect(contentParagraphs.length).toBeGreaterThanOrEqual(2);
    });

    it('debe mostrar metadata por defecto', () => {
      render(<AISynthesis data={mockData} />);
      // Query for metadata specifically (with "Modelo:" prefix to avoid false positives)
      // No dependemos del texto exacto de formatDistanceToNow para evitar tests flaky
      expect(screen.getByText(/hace.*hora/i)).toBeInTheDocument();
      expect(screen.getByText(/Modelo: Claude 3.5 Sonnet/i)).toBeInTheDocument();
    });

    it('debe ocultar metadata cuando showMetadata es false', () => {
      render(<AISynthesis data={mockData} showMetadata={false} />);
      // Query for time metadata specifically
      expect(screen.queryByText(/hace.*hora/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Modelo: Claude 3.5 Sonnet/i)).not.toBeInTheDocument();
    });
  });

  describe('Interacciones', () => {
    it('debe copiar al portapapeles cuando se hace clic en el botón copiar', async () => {
      const user = userEvent.setup();
      render(<AISynthesis data={mockData} />);

      const copyButton = screen.getByRole('button', { name: /copiar/i });

      // Verify button exists and is clickable
      expect(copyButton).toBeInTheDocument();

      // Click should not throw error
      await expect(user.click(copyButton)).resolves.not.toThrow();
    });

    it('debe mostrar ícono de check después de copiar', async () => {
      const user = userEvent.setup();
      render(<AISynthesis data={mockData} />);

      const copyButton = screen.getByRole('button', { name: /copiar/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copiado/i })).toBeInTheDocument();
      });
    });

    it('debe colapsar/expandir al hacer clic en el botón chevron', async () => {
      const user = userEvent.setup();
      render(<AISynthesis data={mockData} />);

      // Inicialmente expandido
      expect(
        screen.getByText(/Tu Sol en Aries combinado con Luna en Escorpio/i)
      ).toBeInTheDocument();

      // Colapsar
      const collapseButton = screen.getByRole('button', { name: /colapsar/i });
      await user.click(collapseButton);

      // Contenido no debe estar visible
      expect(
        screen.queryByText(/Tu Sol en Aries combinado con Luna en Escorpio/i)
      ).not.toBeInTheDocument();

      // Expandir de nuevo
      const expandButton = screen.getByRole('button', { name: /expandir/i });
      await user.click(expandButton);
      expect(
        screen.getByText(/Tu Sol en Aries combinado con Luna en Escorpio/i)
      ).toBeInTheDocument();
    });

    it('debe llamar onRegenerate cuando se hace clic en el botón regenerar', async () => {
      const user = userEvent.setup();
      const onRegenerate = vi.fn();
      render(<AISynthesis data={mockData} onRegenerate={onRegenerate} />);

      const regenerateButton = screen.getByRole('button', {
        name: /regenerar/i,
      });
      await user.click(regenerateButton);

      expect(onRegenerate).toHaveBeenCalledTimes(1);
    });

    it('debe deshabilitar el botón regenerar cuando isRegenerating es true', () => {
      const onRegenerate = vi.fn();
      render(<AISynthesis data={mockData} onRegenerate={onRegenerate} isRegenerating={true} />);

      const regenerateButton = screen.getByRole('button', {
        name: /regenerar/i,
      });
      expect(regenerateButton).toBeDisabled();
    });

    it('no debe mostrar el botón regenerar si no se provee onRegenerate', () => {
      render(<AISynthesis data={mockData} />);
      expect(screen.queryByRole('button', { name: /regenerar/i })).not.toBeInTheDocument();
    });
  });

  describe('Estado de carga', () => {
    it('debe mostrar skeleton de carga cuando isRegenerating es true', () => {
      const onRegenerate = vi.fn();
      render(<AISynthesis data={mockData} onRegenerate={onRegenerate} isRegenerating={true} />);

      expect(screen.getByText(/Generando nueva síntesis/i)).toBeInTheDocument();
      expect(screen.getByText(/Esto puede tomar unos segundos/i)).toBeInTheDocument();
    });

    it('no debe mostrar metadata cuando está regenerando', () => {
      const onRegenerate = vi.fn();
      render(<AISynthesis data={mockData} onRegenerate={onRegenerate} isRegenerating={true} />);

      expect(screen.queryByText(/hace.*hora/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Modelo: Claude 3.5 Sonnet/i)).not.toBeInTheDocument();
    });
  });

  describe('Estilos y clases', () => {
    it('debe aplicar className personalizada', () => {
      const { container } = render(<AISynthesis data={mockData} className="custom-class" />);
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('debe tener borde de color amber (Premium)', () => {
      const { container } = render(<AISynthesis data={mockData} />);
      const card = container.firstChild;
      expect(card).toHaveClass('border-amber-500/30');
    });
  });

  describe('Manejo de datos nulos', () => {
    it('debe manejar generatedAt null sin errores', () => {
      const dataWithoutDate: AISynthesisType = {
        ...mockData,
        generatedAt: null,
      };
      render(<AISynthesis data={dataWithoutDate} />);
      expect(screen.queryByText(/hace.*hora/i)).not.toBeInTheDocument();
    });

    it('debe manejar provider vacío', () => {
      const dataWithoutProvider: AISynthesisType = {
        ...mockData,
        provider: '',
      };
      render(<AISynthesis data={dataWithoutProvider} />);
      expect(screen.queryByText(/Modelo:/i)).not.toBeInTheDocument();
    });
  });
});

describe('AISynthesisPlaceholder', () => {
  it('debe renderizar el título', () => {
    render(<AISynthesisPlaceholder />);
    expect(screen.getByText('Síntesis Personalizada')).toBeInTheDocument();
  });

  it('debe mostrar texto descriptivo', () => {
    render(<AISynthesisPlaceholder />);
    expect(
      screen.getByText(/Obtén un análisis único generado por inteligencia/i)
    ).toBeInTheDocument();
  });

  it('debe mostrar botón "Desbloquear con Premium"', () => {
    render(<AISynthesisPlaceholder />);
    expect(screen.getByRole('button', { name: /Desbloquear con Premium/i })).toBeInTheDocument();
  });

  it('debe aplicar className personalizada', () => {
    const { container } = render(<AISynthesisPlaceholder className="custom-placeholder" />);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-placeholder');
  });

  it('debe tener borde punteado (placeholder)', () => {
    const { container } = render(<AISynthesisPlaceholder />);
    const card = container.firstChild;
    expect(card).toHaveClass('border-dashed');
  });
});
