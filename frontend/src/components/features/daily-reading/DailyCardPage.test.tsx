import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { DailyCardPage } from './DailyCardPage';
import { DAILY_CARD_GUIDE } from '@/lib/constants/daily-card-guide.data';
import { ROUTES } from '@/lib/constants/routes';
import { ArcanaType } from '@/types/encyclopedia.types';
import type { CardDetail, CardSummary } from '@/types/encyclopedia.types';
import type { DailyCardPageData } from '@/types/home.types';

// La herramienta interactiva (cliente, con sesión y capabilities) tiene sus
// propios tests, incluido el flujo anónimo; acá interesa que la página la monte.
vi.mock('./DailyCardExperience', () => ({
  DailyCardExperience: () => <div data-testid="daily-card-experience" />,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

function buildSummary(id: number): CardSummary {
  return {
    id,
    slug: `carta-${id}`,
    nameEs: `Carta ${id}`,
    arcanaType: ArcanaType.MAJOR,
    number: id,
    suit: null,
    thumbnailUrl: `/images/tarot/carta-${id}.webp`,
  };
}

const CARD: CardDetail = {
  ...buildSummary(7),
  nameEs: 'El Carro',
  slug: 'el-carro',
  nameEn: 'The Chariot',
  romanNumeral: 'VII',
  courtRank: null,
  element: null,
  planet: null,
  zodiacSign: null,
  meaningUpright: 'Significado al derecho del Carro.',
  meaningReversed: 'Significado invertido.',
  description: 'Descripción de la lámina.',
  keywords: { upright: ['voluntad'], reversed: ['dispersión'] },
  imageUrl: '/images/tarot/el-carro.webp',
  relatedCards: null,
  meaningLove: 'El Carro en el amor.',
  meaningWork: 'El Carro en el trabajo.',
  advice: 'Consejo del Carro.',
};

const DATA: DailyCardPageData = {
  today: { canonicalDate: '2026-09-12', card: CARD },
  archive: [
    { date: '2026-09-11', card: buildSummary(1) },
    { date: '2026-09-10', card: buildSummary(2) },
  ],
};

describe('DailyCardPage (T-SEO-015)', () => {
  it('h1 único y la carta canónica de hoy con fecha, interpretación y enlace a la ficha', () => {
    render(<DailyCardPage data={DATA} />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    const today = screen.getByTestId('daily-card-today');
    expect(within(today).getByTestId('daily-card-today-date')).toHaveTextContent(
      /12 de septiembre de 2026/i
    );
    expect(within(today).getByRole('heading', { level: 2 })).toHaveTextContent('El Carro');
    expect(today).toHaveTextContent('Significado al derecho del Carro.');
    expect(today).toHaveTextContent('El Carro en el amor.');
    expect(today).toHaveTextContent('El Carro en el trabajo.');
    expect(today).toHaveTextContent('Consejo del Carro.');
    expect(within(today).getByRole('link', { name: /ver la ficha/i })).toHaveAttribute(
      'href',
      ROUTES.ENCICLOPEDIA_TAROT_CARD('el-carro')
    );
  });

  it('T-UI-13: abre con la banda de marca <SectionHero> y un solo h1', () => {
    render(<DailyCardPage data={DATA} />);

    const hero = screen.getByTestId('section-hero');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(within(hero).getByRole('heading', { level: 1 })).toHaveTextContent('Tarot del día');
    expect(within(hero).getByTestId('section-hero-icon')).toBeInTheDocument();
  });

  it('monta la herramienta interactiva debajo de la carta de hoy: sigue usable sin registro', () => {
    render(<DailyCardPage data={DATA} />);

    const today = screen.getByTestId('daily-card-today');
    const tool = screen.getByTestId('daily-card-experience');
    expect(today.compareDocumentPosition(tool) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renderiza la guía permanente completa con sus pasos como h3', () => {
    render(<DailyCardPage data={DATA} />);

    const guide = screen.getByTestId('daily-card-guide');
    expect(within(guide).getByRole('heading', { level: 2 })).toHaveTextContent(
      DAILY_CARD_GUIDE.title
    );
    expect(within(guide).getAllByRole('heading', { level: 3 })).toHaveLength(
      DAILY_CARD_GUIDE.steps.length
    );
    expect(guide).toHaveTextContent(DAILY_CARD_GUIDE.steps[0].paragraphs[0]);
  });

  it('lista el archivo de los últimos días con fecha y enlace a cada ficha', () => {
    render(<DailyCardPage data={DATA} />);

    const archive = screen.getByTestId('daily-card-archive');
    const items = within(archive).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/11 de septiembre/i);
    expect(within(items[0]).getByRole('link', { name: /carta 1/i })).toHaveAttribute(
      'href',
      ROUTES.ENCICLOPEDIA_TAROT_CARD('carta-1')
    );
  });

  it('degrada por bloque: sin API sigue sirviendo la herramienta y la guía', () => {
    render(<DailyCardPage data={{ today: undefined, archive: undefined }} />);

    expect(screen.getByTestId('daily-card-today-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('daily-card-archive')).not.toBeInTheDocument();
    expect(screen.getByTestId('daily-card-experience')).toBeInTheDocument();
    expect(screen.getByTestId('daily-card-guide')).toBeInTheDocument();
  });

  it('no usa la plantilla "emoji + 3 bullets": no hay ServiceIntro', () => {
    render(<DailyCardPage data={DATA} />);

    expect(screen.queryByText(/ver más en la enciclopedia/i)).not.toBeInTheDocument();
  });
});
