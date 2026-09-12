import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { BirthChartGuide } from './BirthChartGuide';
import { BIRTH_CHART_GUIDE } from '@/lib/constants/birth-chart-guide.data';

describe('BirthChartGuide (T-SEO-015)', () => {
  it('renderiza el título como h2 y los bloques como h3', () => {
    render(<BirthChartGuide />);

    const guide = screen.getByTestId('birth-chart-guide');
    expect(within(guide).getByRole('heading', { level: 2 })).toHaveTextContent(
      BIRTH_CHART_GUIDE.title
    );
    const h3 = within(guide)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(h3).toContain(BIRTH_CHART_GUIDE.requirements.heading);
    expect(h3).toContain(BIRTH_CHART_GUIDE.trio.heading);
    expect(h3).toContain(BIRTH_CHART_GUIDE.example.heading);
    expect(h3).toContain(BIRTH_CHART_GUIDE.mistakes.heading);
    expect(h3).toContain(BIRTH_CHART_GUIDE.limits.heading);
  });

  it('el trío Sol / Luna / Ascendente va como lista de definiciones y los errores como lista numerada', () => {
    render(<BirthChartGuide />);

    const trio = screen.getByTestId('birth-chart-trio');
    expect(trio.querySelectorAll('dt')).toHaveLength(3);
    expect(trio).toHaveTextContent('Ascendente');

    const mistakes = screen.getByTestId('birth-chart-mistakes');
    expect(mistakes.tagName).toBe('OL');
    expect(mistakes.querySelectorAll('li')).toHaveLength(BIRTH_CHART_GUIDE.mistakes.items.length);
  });

  it('enlaza a la guía de la enciclopedia y a signos, planetas y casas', () => {
    render(<BirthChartGuide />);

    expect(screen.getByRole('link', { name: BIRTH_CHART_GUIDE.links[0].label })).toHaveAttribute(
      'href',
      '/enciclopedia/guias/guia-carta-astral'
    );
    expect(screen.getByRole('link', { name: /las 12 casas/i })).toHaveAttribute(
      'href',
      '/enciclopedia/astrologia/casas'
    );
  });
});
