import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkles } from 'lucide-react';

import { WidgetCard } from './WidgetCard';

describe('WidgetCard', () => {
  it('renders the title as a serif heading', () => {
    render(<WidgetCard title="Mi Widget">Contenido</WidgetCard>);

    const heading = screen.getByRole('heading', { name: 'Mi Widget' });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('font-serif');
  });

  it('renders as an h2 heading by default and honours titleAs', () => {
    const { rerender } = render(<WidgetCard title="Titulo">Contenido</WidgetCard>);
    expect(screen.getByRole('heading', { name: 'Titulo', level: 2 })).toBeInTheDocument();

    rerender(
      <WidgetCard title="Titulo" titleAs="h3">
        Contenido
      </WidgetCard>
    );
    expect(screen.getByRole('heading', { name: 'Titulo', level: 3 })).toBeInTheDocument();
  });

  it('renders the icon inside a gold-accented (secondary) slot', () => {
    render(
      <WidgetCard title="Con icono" icon={<Sparkles data-testid="widget-icon" />}>
        Contenido
      </WidgetCard>
    );

    const icon = screen.getByTestId('widget-icon');
    expect(icon).toBeInTheDocument();
    // The icon slot carries the gold brand accent token.
    expect(icon.parentElement).toHaveClass('text-secondary');
  });

  it('renders the optional action node', () => {
    render(
      <WidgetCard title="Con accion" action={<a href="/mas">Ver más</a>}>
        Contenido
      </WidgetCard>
    );

    expect(screen.getByRole('link', { name: 'Ver más' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <WidgetCard title="Con contenido">
        <p>Cuerpo del widget</p>
      </WidgetCard>
    );

    expect(screen.getByText('Cuerpo del widget')).toBeInTheDocument();
  });

  it('forwards data-testid to the card container', () => {
    render(
      <WidgetCard title="Testable" data-testid="mi-widget">
        Contenido
      </WidgetCard>
    );

    expect(screen.getByTestId('mi-widget')).toBeInTheDocument();
  });

  it('applies additional className to the card container', () => {
    render(
      <WidgetCard title="Con clase" data-testid="con-clase" className="custom-class">
        Contenido
      </WidgetCard>
    );

    expect(screen.getByTestId('con-clase')).toHaveClass('custom-class');
  });

  it('does not render a header icon slot when no icon is provided', () => {
    render(
      <WidgetCard title="Sin icono" data-testid="sin-icono">
        Contenido
      </WidgetCard>
    );

    // Only the heading should be present in the header, no empty accent slot.
    expect(screen.queryByTestId('sin-icono')?.querySelector('.text-secondary')).toBeNull();
  });
});
