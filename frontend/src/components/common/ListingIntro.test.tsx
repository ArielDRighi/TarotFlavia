import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ListingIntro } from './ListingIntro';
import type { ListingIntroData } from '@/lib/constants/listing-intros.data';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const intro: ListingIntroData = {
  title: 'Qué vas a encontrar acá',
  lead: 'Un párrafo de entrada que explica la sección.',
  sections: [
    { heading: 'Cómo leerlo', body: 'Primer bloque explicativo de la sección.' },
    { heading: 'Por dónde seguir', body: 'Segundo bloque explicativo de la sección.' },
  ],
  links: [{ label: 'Ver el tarot', href: '/enciclopedia/tarot' }],
};

describe('ListingIntro', () => {
  it('renderiza el título como encabezado de segundo nivel', () => {
    render(<ListingIntro intro={intro} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Qué vas a encontrar acá' })
    ).toBeVisible();
  });

  it('⚠️ T-SEO-003: renderiza el lead y el cuerpo de cada sección en el HTML', () => {
    render(<ListingIntro intro={intro} />);

    expect(screen.getByText('Un párrafo de entrada que explica la sección.')).toBeVisible();
    expect(screen.getByText('Primer bloque explicativo de la sección.')).toBeVisible();
    expect(screen.getByText('Segundo bloque explicativo de la sección.')).toBeVisible();
  });

  it('renderiza los encabezados de sección como h3', () => {
    render(<ListingIntro intro={intro} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Cómo leerlo' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 3, name: 'Por dónde seguir' })).toBeVisible();
  });

  it('renderiza los enlaces internos como anclas reales para que el crawler los recorra', () => {
    render(<ListingIntro intro={intro} />);

    expect(screen.getByRole('link', { name: 'Ver el tarot' })).toHaveAttribute(
      'href',
      '/enciclopedia/tarot'
    );
  });

  it('funciona sin enlaces', () => {
    render(<ListingIntro intro={{ ...intro, links: undefined }} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByTestId('listing-intro')).toBeInTheDocument();
  });

  it('acepta clases adicionales', () => {
    render(<ListingIntro intro={intro} className="mt-10" />);

    expect(screen.getByTestId('listing-intro')).toHaveClass('mt-10');
  });
});
