import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { PendulumUsageGuide } from './PendulumUsageGuide';
import { PENDULUM_GUIDE } from '@/lib/constants/pendulum-guide.data';

describe('PendulumUsageGuide (T-SEO-015)', () => {
  it('renderiza el título como h2 y las secciones como h3', () => {
    render(<PendulumUsageGuide />);

    const guide = screen.getByTestId('pendulum-usage-guide');
    expect(within(guide).getByRole('heading', { level: 2 })).toHaveTextContent(
      PENDULUM_GUIDE.title
    );
    const h3 = within(guide)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(h3).toContain(PENDULUM_GUIDE.goodQuestions.heading);
    expect(h3).toContain(PENDULUM_GUIDE.badQuestions.heading);
    expect(h3).toContain(PENDULUM_GUIDE.movements.heading);
    PENDULUM_GUIDE.sections.forEach((section) => expect(h3).toContain(section.heading));
  });

  it('lista los ejemplos de preguntas y los tres movimientos con su respuesta', () => {
    render(<PendulumUsageGuide />);

    expect(screen.getByTestId('pendulum-good-questions').querySelectorAll('li')).toHaveLength(
      PENDULUM_GUIDE.goodQuestions.items.length
    );
    expect(screen.getByTestId('pendulum-bad-questions').querySelectorAll('li')).toHaveLength(
      PENDULUM_GUIDE.badQuestions.items.length
    );
    const movements = screen.getByTestId('pendulum-movements');
    expect(movements).toHaveTextContent('Vertical');
    expect(movements).toHaveTextContent('Quizás');
  });

  it('enlaza a la entrada específica de la enciclopedia, no al índice', () => {
    render(<PendulumUsageGuide />);

    expect(screen.getByRole('link', { name: PENDULUM_GUIDE.links[0].label })).toHaveAttribute(
      'href',
      '/enciclopedia/guias/guia-pendulo'
    );
    expect(screen.queryByText(/ver más en la enciclopedia/i)).not.toBeInTheDocument();
  });
});
