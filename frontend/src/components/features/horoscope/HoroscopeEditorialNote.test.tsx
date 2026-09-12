import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { HoroscopeEditorialNote } from './HoroscopeEditorialNote';
import {
  DAILY_HOROSCOPE_BASIS,
  DAILY_HOROSCOPE_METHOD,
} from '@/lib/constants/editorial-policy.data';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Pie del horóscopo diario (T-SEO-017): la misma fórmula de producción que
 * declara `/politica-editorial`, con la fecha del día al que corresponde la
 * predicción. Reencuadra el proceso sin badge de "generado por".
 */
describe('HoroscopeEditorialNote', () => {
  it('renderiza la fórmula editorial literal de la política', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" />);

    const note = screen.getByTestId('horoscope-editorial-note');

    expect(note).toHaveTextContent(DAILY_HOROSCOPE_BASIS);
    expect(note).toHaveTextContent(DAILY_HOROSCOPE_METHOD);
  });

  it('muestra la fecha del horóscopo en español, con año, sin correr un día', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" />);

    const note = screen.getByTestId('horoscope-editorial-note');

    expect(note).toHaveTextContent(/12 de septiembre de 2026/);
    expect(note).not.toHaveTextContent(/11 de septiembre/);
  });

  it('la fecha va en minúscula porque queda a mitad de oración', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" />);

    expect(screen.getByTestId('horoscope-editorial-note')).toHaveTextContent(
      /para el sábado 12 de septiembre de 2026,/
    );
  });

  it('tiene nombre accesible como nota complementaria', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" />);

    expect(screen.getByRole('complementary', { name: /nota editorial/i })).toBeInTheDocument();
  });

  it('marca la fecha con <time dateTime> legible por máquina', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" />);

    const time = screen.getByTestId('horoscope-editorial-note').querySelector('time');

    expect(time).not.toBeNull();
    expect(time).toHaveAttribute('dateTime', '2026-09-12');
  });

  it('enlaza a /politica-editorial con un <a href> real', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" />);

    expect(screen.getByRole('link', { name: /política editorial/i })).toHaveAttribute(
      'href',
      ROUTES.POLITICA_EDITORIAL
    );
  });

  it('⚠️ no dice "IA" ni "generado por"', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" />);

    const text = screen.getByTestId('horoscope-editorial-note').textContent ?? '';

    expect(text).not.toMatch(/\bIA\b/);
    expect(text).not.toMatch(/generad[oa]s? por/i);
  });

  it('acepta un prefijo de testid para que cada consumidor tenga el suyo', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" testIdPrefix="home-horoscope" />);

    expect(screen.getByTestId('home-horoscope-editorial-note')).toBeInTheDocument();
  });

  it('acepta clases adicionales', () => {
    render(<HoroscopeEditorialNote horoscopeDate="2026-09-12" className="mt-8" />);

    expect(screen.getByTestId('horoscope-editorial-note')).toHaveClass('mt-8');
  });
});
