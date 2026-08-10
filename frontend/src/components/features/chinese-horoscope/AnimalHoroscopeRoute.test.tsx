/**
 * AnimalHoroscopeRoute - Tests (T-SEO-002)
 *
 * Es el componente de ruta (servidor) de `/horoscopo-chino/[animal]`: valida el
 * segmento, sirve la ficha estática y aísla la parte interactiva en `<Suspense>`
 * para que su `useSearchParams` no deopte el prerender de toda la ruta.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AnimalHoroscopeRoute } from './AnimalHoroscopeRoute';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

vi.mock('./AnimalHoroscopePanel', () => ({
  AnimalHoroscopePanel: () => <div data-testid="animal-horoscope-panel" />,
}));

describe('AnimalHoroscopeRoute', () => {
  describe('animal válido', () => {
    it('renderiza la ficha estática del animal', () => {
      render(<AnimalHoroscopeRoute animal={ChineseZodiacAnimal.DRAGON} />);

      expect(screen.getByTestId('animal-profile')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Dragón/ })).toBeInTheDocument();
    });

    it('renderiza el panel interactivo del horóscopo', () => {
      render(<AnimalHoroscopeRoute animal={ChineseZodiacAnimal.DRAGON} />);

      expect(screen.getByTestId('animal-horoscope-panel')).toBeInTheDocument();
    });

    it('sirve la ficha estática antes del panel interactivo', () => {
      render(<AnimalHoroscopeRoute animal={ChineseZodiacAnimal.DRAGON} />);

      const profile = screen.getByTestId('animal-profile');
      const panel = screen.getByTestId('animal-horoscope-panel');

      expect(profile.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it('vuelve al listado con un enlace real (rastreable), no con un onClick', () => {
      render(<AnimalHoroscopeRoute animal={ChineseZodiacAnimal.DRAGON} />);

      expect(screen.getByRole('link', { name: /Todos los animales/i })).toHaveAttribute(
        'href',
        '/horoscopo-chino'
      );
    });
  });

  describe('animal inválido', () => {
    it('muestra el mensaje de animal no válido', () => {
      render(<AnimalHoroscopeRoute animal="unicornio" />);

      expect(screen.getByText('Animal no válido')).toBeInTheDocument();
    });

    it('no renderiza la ficha ni el panel', () => {
      render(<AnimalHoroscopeRoute animal="unicornio" />);

      expect(screen.queryByTestId('animal-profile')).not.toBeInTheDocument();
      expect(screen.queryByTestId('animal-horoscope-panel')).not.toBeInTheDocument();
    });

    it('ofrece un enlace al listado de animales', () => {
      render(<AnimalHoroscopeRoute animal="unicornio" />);

      expect(screen.getByRole('link', { name: /Ver todos los animales/i })).toHaveAttribute(
        'href',
        '/horoscopo-chino'
      );
    });
  });
});
