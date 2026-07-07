import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sparkles } from 'lucide-react';
import { WidgetEmptyState } from './WidgetEmptyState';

// Next.js Image se reemplaza por un <img> plano para poder inspeccionar `src`/`alt`.
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Next.js Link se reemplaza por un <a> plano que conserva `href` y clases.
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('WidgetEmptyState', () => {
  describe('Renderizado básico', () => {
    it('muestra el título y el mensaje', () => {
      render(<WidgetEmptyState title="Sin datos" message="Todavía no hay nada por aquí." />);

      expect(screen.getByText('Sin datos')).toBeInTheDocument();
      expect(screen.getByText('Todavía no hay nada por aquí.')).toBeInTheDocument();
    });

    it('renderiza el título con tipografía serif de marca', () => {
      render(<WidgetEmptyState title="Sin datos" message="Mensaje" />);

      expect(screen.getByText('Sin datos')).toHaveClass('font-serif');
    });

    it('aplica color atenuado al mensaje', () => {
      render(<WidgetEmptyState title="Sin datos" message="Mensaje" />);

      expect(screen.getByText('Mensaje')).toHaveClass('text-muted-foreground');
    });

    it('centra el contenido en columna', () => {
      const { container } = render(<WidgetEmptyState title="Sin datos" message="Mensaje" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('text-center');
    });

    it('reenvía data-testid y className al contenedor', () => {
      render(
        <WidgetEmptyState
          title="Sin datos"
          message="Mensaje"
          className="custom-class"
          data-testid="mi-empty"
        />
      );

      const wrapper = screen.getByTestId('mi-empty');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Ilustración e ícono', () => {
    it('renderiza la ilustración con su texto alternativo cuando se provee', () => {
      render(
        <WidgetEmptyState
          title="Sin datos"
          message="Mensaje"
          illustration={{ src: '/images/dashboard/empty-calendar.webp', alt: 'Rueda del año' }}
        />
      );

      const img = screen.getByRole('img', { name: 'Rueda del año' });
      expect(img).toHaveAttribute('src', '/images/dashboard/empty-calendar.webp');
    });

    it('renderiza el ícono con acento dorado cuando no hay ilustración', () => {
      render(
        <WidgetEmptyState
          title="Sin datos"
          message="Mensaje"
          icon={<Sparkles data-testid="empty-icon" />}
        />
      );

      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
      const iconWrapper = screen.getByTestId('widget-empty-state-icon');
      expect(iconWrapper).toHaveClass('text-secondary');
    });

    it('prioriza la ilustración sobre el ícono cuando se proveen ambos', () => {
      render(
        <WidgetEmptyState
          title="Sin datos"
          message="Mensaje"
          illustration={{ src: '/images/dashboard/empty-rituals.webp', alt: 'Altar ritual' }}
          icon={<Sparkles data-testid="empty-icon" />}
        />
      );

      expect(screen.getByRole('img', { name: 'Altar ritual' })).toBeInTheDocument();
      expect(screen.queryByTestId('empty-icon')).not.toBeInTheDocument();
    });

    it('no renderiza contenedor de ícono ni imagen cuando no se proveen', () => {
      render(<WidgetEmptyState title="Sin datos" message="Mensaje" />);

      expect(screen.queryByTestId('widget-empty-state-icon')).not.toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('CTA', () => {
    it('no renderiza CTA cuando no se provee', () => {
      render(<WidgetEmptyState title="Sin datos" message="Mensaje" />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renderiza el CTA como enlace con el href correcto', () => {
      render(
        <WidgetEmptyState
          title="Sin datos"
          message="Mensaje"
          cta={{ label: 'Configurar', href: '/perfil' }}
        />
      );

      const link = screen.getByRole('link', { name: /configurar/i });
      expect(link).toHaveAttribute('href', '/perfil');
    });

    it('el CTA es enfocable y expone estilos de foco visible', () => {
      render(
        <WidgetEmptyState
          title="Sin datos"
          message="Mensaje"
          cta={{ label: 'Configurar', href: '/perfil' }}
        />
      );

      const link = screen.getByRole('link', { name: /configurar/i });
      // Estilo de foco visible heredado de la primitiva Button (focus-visible ring).
      expect(link.className).toMatch(/focus-visible:ring/);

      link.focus();
      expect(link).toHaveFocus();
    });

    it('renderiza el ícono opcional dentro del CTA', () => {
      render(
        <WidgetEmptyState
          title="Sin datos"
          message="Mensaje"
          cta={{ label: 'Configurar', href: '/perfil', icon: <Sparkles data-testid="cta-icon" /> }}
        />
      );

      expect(screen.getByTestId('cta-icon')).toBeInTheDocument();
    });
  });
});
