import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ServicesStrip } from './ServicesStrip';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

describe('ServicesStrip (T-SEO-014)', () => {
  it('es una línea con los dos enlaces, sin tabla ni precios', () => {
    render(<ServicesStrip />);

    const strip = screen.getByTestId('home-services');
    expect(strip).toHaveTextContent(HOME_EDITORIAL.services.text);

    for (const link of HOME_EDITORIAL.services.links) {
      expect(within(strip).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.href
      );
    }

    expect(strip.querySelector('table')).toBeNull();
    expect(strip).not.toHaveTextContent(/\$/);
  });

  it('lleva una miniatura de la carta astral a la izquierda y sigue siendo una línea (T-SEO-022)', () => {
    render(<ServicesStrip />);

    const thumbnail = screen.getByTestId('home-services-thumbnail');
    expect(thumbnail).toHaveAttribute('src', expect.stringContaining('birth-chart-promo.webp'));
    expect(thumbnail).toHaveAttribute('alt', '');
    expect(thumbnail).toHaveAttribute('loading', 'lazy');
    expect(screen.getByTestId('home-services').querySelector('table')).toBeNull();
  });
});
