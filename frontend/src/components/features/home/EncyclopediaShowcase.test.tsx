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
});
