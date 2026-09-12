import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { RitualsEditorialGuide } from './RitualsEditorialGuide';
import { RITUALS_HUB_GUIDE } from '@/lib/constants/rituals-hub.data';

describe('RitualsEditorialGuide (T-SEO-015)', () => {
  it('renderiza el título como h2 y los bloques como h3', () => {
    render(<RitualsEditorialGuide />);

    const guide = screen.getByTestId('rituals-editorial-guide');
    expect(within(guide).getByRole('heading', { level: 2 })).toHaveTextContent(
      RITUALS_HUB_GUIDE.title
    );
    const h3 = within(guide)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(h3).toContain(RITUALS_HUB_GUIDE.phases.heading);
    expect(h3).toContain(RITUALS_HUB_GUIDE.categories.heading);
    RITUALS_HUB_GUIDE.sections.forEach((section) => expect(h3).toContain(section.heading));
  });

  it('las fases lunares van como lista de definiciones con las cuatro fases', () => {
    render(<RitualsEditorialGuide />);

    const phases = screen.getByTestId('rituals-lunar-phases');
    expect(phases.querySelectorAll('dt')).toHaveLength(4);
    expect(phases).toHaveTextContent('Luna nueva');
    expect(phases).toHaveTextContent('Luna menguante');
  });

  it('las categorías van como lista con una entrada por categoría', () => {
    render(<RitualsEditorialGuide />);

    const categories = screen.getByTestId('rituals-categories');
    expect(categories.querySelectorAll('li')).toHaveLength(
      RITUALS_HUB_GUIDE.categories.items.length
    );
  });

  it('enlaza a la entrada específica de la enciclopedia', () => {
    render(<RitualsEditorialGuide />);

    expect(screen.getByRole('link', { name: RITUALS_HUB_GUIDE.links[0].label })).toHaveAttribute(
      'href',
      '/enciclopedia/guias/guia-rituales'
    );
  });
});
