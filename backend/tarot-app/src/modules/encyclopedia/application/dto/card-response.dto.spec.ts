import { plainToInstance } from 'class-transformer';
import { ArcanaType, Suit } from '../../enums/tarot.enums';
import {
  CardCombinationDto,
  CardDetailDto,
  CardKeywordsDto,
  CardSummaryDto,
} from './card-response.dto';

describe('CardKeywordsDto', () => {
  it('debe crear una instancia válida', () => {
    const dto = plainToInstance(CardKeywordsDto, {
      upright: ['Nuevos comienzos', 'Inocencia'],
      reversed: ['Imprudencia'],
    });

    expect(dto.upright).toEqual(['Nuevos comienzos', 'Inocencia']);
    expect(dto.reversed).toEqual(['Imprudencia']);
  });
});

describe('CardCombinationDto (T-SEO-008)', () => {
  it('debe crear una instancia válida con slug y lectura', () => {
    const dto = plainToInstance(CardCombinationDto, {
      cardSlug: 'the-magician',
      reading: 'El impulso encuentra por fin una herramienta concreta.',
    });

    expect(dto.cardSlug).toBe('the-magician');
    expect(dto.reading).toBe(
      'El impulso encuentra por fin una herramienta concreta.',
    );
  });
});

describe('CardSummaryDto', () => {
  const summaryPayload = {
    id: 1,
    slug: 'the-fool',
    nameEs: 'El Loco',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    suit: null,
    thumbnailUrl: '/images/tarot/major/00-the-fool-thumb.webp',
  };

  it('debe crear una instancia válida con IDs numéricos', () => {
    const dto = plainToInstance(CardSummaryDto, summaryPayload);

    expect(typeof dto.id).toBe('number');
    expect(dto.slug).toBe('the-fool');
    expect(dto.suit).toBeNull();
  });

  it('no debe transportar las secciones extendidas del detalle', () => {
    const dto = plainToInstance(CardSummaryDto, summaryPayload);

    expect(Object.keys(dto).sort()).toEqual([
      'arcanaType',
      'id',
      'nameEs',
      'number',
      'slug',
      'suit',
      'thumbnailUrl',
    ]);
  });
});

describe('CardDetailDto (T-SEO-008)', () => {
  const basePayload = {
    id: 1,
    slug: 'the-fool',
    nameEs: 'El Loco',
    nameEn: 'The Fool',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    suit: null as Suit | null,
    romanNumeral: '0',
    courtRank: null,
    element: null,
    planet: null,
    zodiacSign: null,
    meaningUpright: 'Nuevos comienzos, inocencia y espíritu libre.',
    meaningReversed: 'Imprudencia y decisiones precipitadas.',
    description: 'Un joven al borde de un precipicio.',
    keywords: { upright: ['Inocencia'], reversed: ['Imprudencia'] },
    imageUrl: '/images/tarot/major/00-the-fool.webp',
    thumbnailUrl: '/images/tarot/major/00-the-fool-thumb.webp',
    relatedCards: [2, 3],
  };

  it('debe aceptar todas las secciones extendidas', () => {
    const dto = plainToInstance(CardDetailDto, {
      ...basePayload,
      meaningLove: 'En el amor, habla de un vínculo que empieza sin garantías.',
      meaningWork: 'En el trabajo, propone aceptar un proyecto sin forma.',
      meaningWellbeing:
        'En la energía y el bienestar, invita a moverse y soltar el encierro.',
      symbolism: 'El precipicio, el perro blanco y el sol naciente.',
      advice: 'Dar el paso, pero mirando dónde se pisa.',
      yesNo: 'Sí, con la condición de animarse a lo desconocido.',
      combinations: [
        { cardSlug: 'the-magician', reading: 'Impulso con herramienta.' },
      ],
    });

    expect(dto.meaningLove).toContain('vínculo');
    expect(dto.meaningWork).toContain('trabajo');
    expect(dto.meaningWellbeing).toContain('bienestar');
    expect(dto.symbolism).toContain('precipicio');
    expect(dto.advice).toContain('paso');
    expect(dto.yesNo).toContain('Sí');
    expect(dto.combinations).toHaveLength(1);
    expect(dto.combinations?.[0].cardSlug).toBe('the-magician');
  });

  it('debe seguir siendo válido sin ninguna sección extendida (contrato actual)', () => {
    const dto = plainToInstance(CardDetailDto, basePayload);

    expect(dto.meaningUpright).toBe(basePayload.meaningUpright);
    expect(dto.keywords.upright).toEqual(['Inocencia']);
    // Sin contenido cargado las secciones quedan `undefined` y por lo tanto no
    // se serializan en la respuesta JSON del endpoint de detalle.
    expect(dto.meaningLove).toBeUndefined();
    expect(dto.combinations).toBeUndefined();
  });

  it('no debe exponer un campo meaningHealth (regla YMYL de terminología)', () => {
    const dto = plainToInstance(CardDetailDto, basePayload);

    expect(dto).not.toHaveProperty('meaningHealth');
  });
});
