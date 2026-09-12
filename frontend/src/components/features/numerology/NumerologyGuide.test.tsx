import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { NumerologyGuide } from './NumerologyGuide';
import { NUMEROLOGY_GUIDE } from '@/lib/constants/numerology-guide.data';

describe('NumerologyGuide (T-SEO-015)', () => {
  it('renderiza el título como h2 y los bloques como h3', () => {
    render(<NumerologyGuide />);

    const guide = screen.getByTestId('numerology-guide');
    expect(within(guide).getByRole('heading', { level: 2 })).toHaveTextContent(
      NUMEROLOGY_GUIDE.title
    );
    const h3 = within(guide)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(h3).toContain(NUMEROLOGY_GUIDE.calculation.heading);
    expect(h3).toContain(NUMEROLOGY_GUIDE.numbers.heading);
    expect(h3).toContain(NUMEROLOGY_GUIDE.reading.heading);
    expect(h3).toContain(NUMEROLOGY_GUIDE.faq.heading);
    expect(h3).toContain(NUMEROLOGY_GUIDE.limits.heading);
  });

  it('la tabla trae una fila por número (9 + 3 maestros)', () => {
    render(<NumerologyGuide />);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(
      NUMEROLOGY_GUIDE.numbers.rows.length + 1
    );
    expect(table).toHaveTextContent('33');
  });

  it('las preguntas frecuentes se renderizan como lista de definiciones', () => {
    render(<NumerologyGuide />);

    const faq = screen.getByTestId('numerology-faq');
    expect(faq.querySelectorAll('dt')).toHaveLength(NUMEROLOGY_GUIDE.faq.items.length);
    expect(faq).toHaveTextContent(NUMEROLOGY_GUIDE.faq.items[0].answer);
  });

  it('enlaza a la entrada específica de la enciclopedia', () => {
    render(<NumerologyGuide />);

    expect(screen.getByRole('link', { name: NUMEROLOGY_GUIDE.links[0].label })).toHaveAttribute(
      'href',
      '/enciclopedia/guias/guia-numerologia'
    );
  });
});
