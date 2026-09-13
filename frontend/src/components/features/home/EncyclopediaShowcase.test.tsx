import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EncyclopediaShowcase } from './EncyclopediaShowcase';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

describe('EncyclopediaShowcase (T-SEO-014)', () => {
  it('muestra las cinco cifras, cada una enlazada a su índice', () => {
    render(<EncyclopediaShowcase />);

    const section = screen.getByTestId('home-encyclopedia');
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(
      HOME_EDITORIAL.encyclopedia.heading
    );

    for (const figure of HOME_EDITORIAL.encyclopedia.figures) {
      // Por href y no por nombre accesible: "12 signos" es prefijo de "12 signos chinos".
      const link = section.querySelector(`a[href="${figure.href}"]`);
      expect(link).not.toBeNull();
      expect(link).toHaveTextContent(figure.label);
      expect(link).toHaveTextContent(figure.detail);
    }
  });

  it('incluye la bajada, el cierre y el enlace a la enciclopedia', () => {
    render(<EncyclopediaShowcase />);

    expect(screen.getByText(HOME_EDITORIAL.encyclopedia.lead)).toBeInTheDocument();
    expect(screen.getByText(HOME_EDITORIAL.encyclopedia.body)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: HOME_EDITORIAL.encyclopedia.linkLabel })
    ).toHaveAttribute('href', HOME_EDITORIAL.encyclopedia.href);
  });

  it('cada cifra va sobre su ilustración del catálogo, decorativa y con carga diferida (T-SEO-022)', () => {
    render(<EncyclopediaShowcase />);

    const expected = [
      'hub-tarot.webp',
      'astro-signos.webp',
      'astro-casas.webp',
      'astro-planetas.webp',
      'horoscopo-chino-animales.webp',
    ];
    const images = screen.getAllByTestId('home-encyclopedia-figure-image');
    expect(images).toHaveLength(5);
    images.forEach((image, index) => {
      expect(image).toHaveAttribute('src', expect.stringContaining(expected[index]));
      expect(image).toHaveAttribute('alt', '');
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('sizes');
    });
  });

  it('es la sección oscura de la portada: encabezado en tono oscuro (T-SEO-022)', () => {
    render(<EncyclopediaShowcase />);

    expect(screen.getByTestId('home-encyclopedia')).toHaveAttribute('data-tone', 'dark');
    expect(screen.getByTestId('home-section-header')).toHaveAttribute('data-tone', 'dark');
  });
});
