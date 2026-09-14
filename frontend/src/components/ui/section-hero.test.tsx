import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { SectionHero } from './section-hero';
import { DECORATIVE_STARS } from '@/lib/constants/section-hero';

describe('SectionHero', () => {
  it('renderiza un <header> con data-testid="section-hero" y el título como h1 único', () => {
    render(<SectionHero title="Numerología" />);

    const hero = screen.getByTestId('section-hero');
    expect(hero.tagName).toBe('HEADER');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(within(hero).getByRole('heading', { level: 1 })).toHaveTextContent('Numerología');
  });

  it('muestra la bajada solo cuando se pasa lead', () => {
    const { rerender } = render(<SectionHero title="Rituales" />);
    expect(screen.queryByTestId('section-hero-lead')).not.toBeInTheDocument();

    rerender(<SectionHero title="Rituales" lead="Guías paso a paso para tu práctica espiritual" />);
    expect(screen.getByTestId('section-hero-lead')).toHaveTextContent(
      'Guías paso a paso para tu práctica espiritual'
    );
  });

  it('con icon renderiza el medallón decorativo de la familia hubs sobre el título', () => {
    render(<SectionHero title="Péndulo Digital" icon={{ family: 'hubs', name: 'pendulum' }} />);

    const medallion = screen.getByTestId('section-hero-icon');
    expect(medallion).toHaveAttribute('aria-hidden', 'true');
    const img = medallion.querySelector('img');
    expect(img).not.toBeNull();
    expect(decodeURIComponent(img?.getAttribute('src') ?? '')).toContain(
      '/images/icons/hubs/pendulum.webp'
    );
    // El título ya nombra la sección: el icono no se anuncia dos veces.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('acepta iconos de la familia rituals (Servicios usa rituals/tarot)', () => {
    render(
      <SectionHero title="Servicios Holísticos" icon={{ family: 'rituals', name: 'tarot' }} />
    );

    const img = screen.getByTestId('section-hero-icon').querySelector('img');
    expect(decodeURIComponent(img?.getAttribute('src') ?? '')).toContain(
      '/images/icons/rituals/tarot.webp'
    );
  });

  it('sin icon no renderiza ningún medallón', () => {
    render(<SectionHero title="Servicios Holísticos" />);
    expect(screen.queryByTestId('section-hero-icon')).not.toBeInTheDocument();
  });

  it('renderiza badge y actions en sus ranuras', () => {
    render(
      <SectionHero
        title="Carta Astral"
        badge="1 carta gratis"
        actions={<button type="button">Mis reservas</button>}
      />
    );

    expect(screen.getByTestId('section-hero-badge')).toHaveTextContent('1 carta gratis');
    expect(
      within(screen.getByTestId('section-hero-actions')).getByRole('button', {
        name: 'Mis reservas',
      })
    ).toBeInTheDocument();
  });

  it('omite las ranuras de badge y actions cuando no se pasan', () => {
    render(<SectionHero title="Tarot del día" />);
    expect(screen.queryByTestId('section-hero-badge')).not.toBeInTheDocument();
    expect(screen.queryByTestId('section-hero-actions')).not.toBeInTheDocument();
  });

  it('size="lg" usa el padding alto de la enciclopedia y "md" el compacto', () => {
    const { rerender } = render(<SectionHero title="Enciclopedia Mística" size="lg" />);
    expect(screen.getByTestId('section-hero-content')).toHaveClass('py-12', 'sm:py-16');

    rerender(<SectionHero title="Horóscopo" />);
    expect(screen.getByTestId('section-hero-content')).toHaveClass('py-7', 'sm:py-10');
  });

  it('en md la bajada baja a text-base en móvil; en lg conserva text-lg fijo', () => {
    const { rerender } = render(<SectionHero title="Horóscopo" lead="Bajada" />);
    expect(screen.getByTestId('section-hero-lead')).toHaveClass('text-base', 'sm:text-lg');

    rerender(<SectionHero title="Enciclopedia Mística" lead="Bajada" size="lg" />);
    expect(screen.getByTestId('section-hero-lead')).toHaveClass('text-lg');
    expect(screen.getByTestId('section-hero-lead')).not.toHaveClass('text-base');
  });

  it('la decoración (estrellas y luna) está oculta a lectores de pantalla', () => {
    render(<SectionHero title="Horóscopo" />);
    const hero = screen.getByTestId('section-hero');
    const decorative = hero.querySelectorAll('[aria-hidden="true"]');
    // estrellas + luna + filete dorado
    expect(decorative).toHaveLength(DECORATIVE_STARS.length + 2);
  });

  it('acepta className adicional en el header', () => {
    render(<SectionHero title="Horóscopo" className="mb-4" />);
    expect(screen.getByTestId('section-hero')).toHaveClass('mb-4');
  });
});
