import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { EditorialHome } from './EditorialHome';
import type { EditorialHomeData } from '@/types/home.types';

vi.mock('./EditorialHero', () => ({
  EditorialHero: () => (
    <section data-testid="home-hero">
      <h1>Tarot y astrología en español</h1>
    </section>
  ),
}));
vi.mock('./DailyHoroscopeDigest', () => ({
  DailyHoroscopeDigest: ({ daily }: { daily: unknown }) => (
    <section data-testid="home-horoscope">{daily ? 'con datos' : 'sin datos'}</section>
  ),
}));
vi.mock('./DailyCardSpotlight', () => ({
  DailyCardSpotlight: ({ dailyCard }: { dailyCard: unknown }) => (
    <section data-testid="home-daily-card">{dailyCard ? 'con datos' : 'sin datos'}</section>
  ),
}));
vi.mock('./LatestGuides', () => ({
  LatestGuides: ({ guides }: { guides: unknown }) => (
    <section data-testid="home-guides">{guides ? 'con datos' : 'sin datos'}</section>
  ),
}));
vi.mock('./EncyclopediaShowcase', () => ({
  EncyclopediaShowcase: () => <section data-testid="home-encyclopedia" />,
}));
vi.mock('./AboutTeaser', () => ({
  AboutTeaser: () => <section data-testid="home-about" />,
}));
vi.mock('./ServicesStrip', () => ({
  ServicesStrip: () => <aside data-testid="home-services" />,
}));

const EMPTY: EditorialHomeData = {
  dailyHoroscopes: undefined,
  dailyCard: undefined,
  latestGuides: undefined,
};

describe('EditorialHome (T-SEO-014)', () => {
  it('compone las siete secciones en el orden acordado, sin <main> propio', () => {
    const { container } = render(<EditorialHome data={EMPTY} />);

    // El landmark `main` lo aporta el root layout: acá no puede haber otro.
    expect(container.querySelector('main')).toBeNull();

    const root = screen.getByTestId('editorial-home');
    const order = Array.from(root.querySelectorAll('[data-testid^="home-"]')).map((node) =>
      node.getAttribute('data-testid')
    );
    expect(order).toEqual([
      'home-hero',
      'home-horoscope',
      'home-daily-card',
      'home-guides',
      'home-encyclopedia',
      'home-about',
      'home-services',
    ]);
  });

  it('tiene un único h1', () => {
    render(<EditorialHome data={EMPTY} />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('pasa cada bloque de datos a su sección', () => {
    render(
      <EditorialHome
        data={{
          dailyHoroscopes: {
            canonicalDate: '2026-09-12',
            horoscopes: [],
            isShowingPreviousDay: false,
          },
          dailyCard: undefined,
          latestGuides: [],
        }}
      />
    );

    expect(screen.getByTestId('home-horoscope')).toHaveTextContent('con datos');
    expect(screen.getByTestId('home-daily-card')).toHaveTextContent('sin datos');
    expect(screen.getByTestId('home-guides')).toHaveTextContent('con datos');
  });
});
