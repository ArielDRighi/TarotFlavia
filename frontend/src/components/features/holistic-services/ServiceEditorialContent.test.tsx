import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import {
  SERVICE_DETAILS,
  MIN_SERVICE_EDITORIAL_WORDS,
  SERVICE_DETAIL_SLUGS,
  type ServiceDetailContent,
} from '@/lib/constants/service-details.data';
import { countWords } from '@/lib/utils/text';
import { ServiceEditorialContent } from './ServiceEditorialContent';

/**
 * El bloque editorial de la ficha de servicio (T-SEO-012).
 *
 * El guardarraíl de largo de acá mide el **DOM renderizado**, no los datos, por
 * el mismo motivo que el de `CardDetailView.test.tsx`: `service-details.data.ts`
 * ya tiene su propio test de largo, y lo que ese test no puede ver es si el
 * render efectivamente saca el texto a la página.
 */

const contenidoMinimo: ServiceDetailContent = {
  title: 'Cómo es la sesión',
  lead: 'Una entrada breve.',
  sections: [{ heading: 'Un bloque', body: 'El cuerpo del bloque.' }],
  faq: [{ question: '¿Una pregunta?', answer: 'Una respuesta.' }],
  disclaimer: 'No reemplaza nada.',
};

describe('ServiceEditorialContent', () => {
  it('renderiza el título como h2: el h1 es el nombre del servicio', () => {
    const { container } = render(<ServiceEditorialContent content={contenidoMinimo} />);

    expect(container.querySelectorAll('h1')).toHaveLength(0);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Cómo es la sesión' })
    ).toBeInTheDocument();
  });

  it('renderiza el lead, cada sección y el disclaimer', () => {
    render(<ServiceEditorialContent content={contenidoMinimo} />);

    expect(screen.getByText('Una entrada breve.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Un bloque' })).toBeInTheDocument();
    expect(screen.getByText('El cuerpo del bloque.')).toBeInTheDocument();
    expect(screen.getByTestId('service-editorial-disclaimer')).toHaveTextContent(
      'No reemplaza nada.'
    );
  });

  it('renderiza las preguntas frecuentes con su respuesta', () => {
    render(<ServiceEditorialContent content={contenidoMinimo} />);

    const faq = screen.getByTestId('service-editorial-faq');

    expect(faq).toHaveTextContent('¿Una pregunta?');
    expect(faq).toHaveTextContent('Una respuesta.');
  });

  it('no renderiza el bloque de preguntas frecuentes cuando no hay ninguna', () => {
    render(<ServiceEditorialContent content={{ ...contenidoMinimo, faq: [] }} />);

    expect(screen.queryByTestId('service-editorial-faq')).not.toBeInTheDocument();
  });

  describe('guardarraíl de largo', () => {
    it.each(SERVICE_DETAIL_SLUGS)(
      `%s pone en la página más de ${MIN_SERVICE_EDITORIAL_WORDS} palabras propias`,
      (slug) => {
        render(<ServiceEditorialContent content={SERVICE_DETAILS[slug]} />);

        const bloque = screen.getByTestId('service-editorial').textContent ?? '';

        expect(countWords([bloque])).toBeGreaterThanOrEqual(MIN_SERVICE_EDITORIAL_WORDS);
      }
    );

    it('un contenido recortado no llega al piso: el guardarraíl mide de verdad', () => {
      render(<ServiceEditorialContent content={contenidoMinimo} />);

      const bloque = screen.getByTestId('service-editorial').textContent ?? '';

      expect(countWords([bloque])).toBeLessThan(MIN_SERVICE_EDITORIAL_WORDS);
    });
  });
});
