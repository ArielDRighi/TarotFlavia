/**
 * ZodiacSignProfile - Tests (T-SEO-004)
 *
 * Es la ficha estática de `/horoscopo/[sign]`: el contenido que el crawler ve
 * sin depender de la API ni del día local del visitante. Los tests verifican que
 * el texto llegue al HTML y que el enlazado interno de las 12 URLs exista.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ZodiacSignProfile } from './ZodiacSignProfile';
import { ZODIAC_SIGN_PROFILES } from '@/lib/constants/zodiac-sign-profiles.data';
import { getHarmonicSigns, getOppositeSign } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';

const SIGNS = Object.values(ZodiacSign);

describe('ZodiacSignProfile', () => {
  it('renderiza la ficha con el nombre del signo como h1', () => {
    render(<ZodiacSignProfile sign={ZodiacSign.ARIES} />);

    expect(screen.getByTestId('zodiac-sign-profile')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Aries/ })).toBeInTheDocument();
  });

  it('sirve el contenido editorial del signo', () => {
    const profile = ZODIAC_SIGN_PROFILES[ZodiacSign.TAURUS];
    render(<ZodiacSignProfile sign={ZodiacSign.TAURUS} />);

    expect(screen.getByText(profile.tagline)).toBeInTheDocument();
    profile.intro.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });
    expect(screen.getByText(profile.dailyAreas.love)).toBeInTheDocument();
    expect(screen.getByText(profile.dailyAreas.wellness)).toBeInTheDocument();
    expect(screen.getByText(profile.dailyAreas.money)).toBeInTheDocument();
    expect(screen.getByText(profile.bestMoment)).toBeInTheDocument();
    expect(screen.getByText(profile.watchOut)).toBeInTheDocument();
    expect(screen.getByText(profile.harmonyNote)).toBeInTheDocument();
    expect(screen.getByText(profile.oppositeNote)).toBeInTheDocument();
    profile.dailyKeywords.forEach((keyword) => {
      expect(screen.getByText(keyword)).toBeInTheDocument();
    });
  });

  it('muestra los datos derivados del signo (fechas, elemento, modalidad y regente)', () => {
    render(<ZodiacSignProfile sign={ZodiacSign.GEMINI} />);

    expect(screen.getByText('21 de mayo — 20 de junio')).toBeInTheDocument();
    expect(screen.getByText('Elemento Aire')).toBeInTheDocument();
    expect(screen.getByText('Modalidad Mutable')).toBeInTheDocument();
    expect(screen.getByText('Regente: Mercurio')).toBeInTheDocument();
  });

  it('enlaza a los signos afines y al opuesto, para que el crawler recorra las 12 URLs', () => {
    render(<ZodiacSignProfile sign={ZodiacSign.ARIES} />);

    getHarmonicSigns(ZodiacSign.ARIES).forEach((partner) => {
      const link = screen.getByTestId(`harmonic-sign-${partner}`);
      expect(link).toHaveAttribute('href', `/horoscopo/${partner}`);
    });

    expect(screen.getByTestId('opposite-sign-link')).toHaveAttribute(
      'href',
      `/horoscopo/${getOppositeSign(ZodiacSign.ARIES)}`
    );
  });

  it.each([
    [ZodiacSign.ARIES, '/enciclopedia/astrologia/signos/aries'],
    [ZodiacSign.TAURUS, '/enciclopedia/astrologia/signos/tauro'],
    [ZodiacSign.SCORPIO, '/enciclopedia/astrologia/signos/escorpio'],
  ])('enlaza al artículo de enciclopedia de %s en %s', (sign, href) => {
    // El artículo de la enciclopedia es el perfil astrológico completo; esta
    // ficha cuenta la lectura diaria. El enlace es lo que le dice a Google que
    // son dos páginas distintas y complementarias, no una duplicada.
    render(<ZodiacSignProfile sign={sign} />);

    expect(screen.getByTestId('encyclopedia-article-link')).toHaveAttribute('href', href);
  });

  it('enlaza de vuelta al hub del horóscopo', () => {
    render(<ZodiacSignProfile sign={ZodiacSign.LEO} />);

    expect(screen.getByTestId('horoscope-hub-link')).toHaveAttribute('href', '/horoscopo');
  });

  it.each(SIGNS)('la ficha de %s tiene un único h1', (sign) => {
    render(<ZodiacSignProfile sign={sign} />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
