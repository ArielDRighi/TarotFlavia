import { ALL_TAROT_CARDS, CardSeedData } from './cards-seed.data';
import { CARD_EXTENDED_CONTENT } from './card-extended-content.data';
import {
  CardCombinationSeed,
  CardExtendedContent,
} from './extended/card-extended-content.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Normaliza un texto para comparar unicidad: minúsculas, sin acentos, sin
 * puntuación y con los espacios colapsados. Dos párrafos que solo difieren en
 * comas siguen siendo el mismo párrafo.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ALL_SLUGS: string[] = ALL_TAROT_CARDS.map((card) => card.slug);
const CONTENT_ENTRIES: Array<[string, CardExtendedContent]> = Object.entries(
  CARD_EXTENDED_CONTENT,
);

/** Secciones de texto plano, sin `combinations`. */
const TEXT_SECTIONS = [
  'meaningLove',
  'meaningWork',
  'meaningWellbeing',
  'symbolism',
  'advice',
  'yesNo',
] as const;

type TextSection = (typeof TEXT_SECTIONS)[number];

/** Rangos de palabras por sección, con tolerancia sobre el objetivo del backlog. */
const WORD_RANGES: Record<TextSection, { min: number; max: number }> = {
  meaningLove: { min: 65, max: 130 },
  meaningWork: { min: 65, max: 130 },
  meaningWellbeing: { min: 55, max: 120 },
  symbolism: { min: 75, max: 150 },
  advice: { min: 45, max: 110 },
  yesNo: { min: 12, max: 50 },
};

/** Palabras propias que ya aportaban las secciones previas a T-SEO-009. */
function countBaseWords(card: CardSeedData): number {
  return (
    countWords(card.meaningUpright) +
    countWords(card.meaningReversed) +
    countWords(card.description)
  );
}

function countExtendedWords(content: CardExtendedContent): number {
  const textWords = TEXT_SECTIONS.reduce(
    (total, section) => total + countWords(content[section]),
    0,
  );
  const combinationWords = content.combinations.reduce(
    (total, combination) => total + countWords(combination.reading),
    0,
  );
  return textWords + combinationWords;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CARD_EXTENDED_CONTENT (T-SEO-009)', () => {
  // ---- Cobertura -----------------------------------------------------------

  describe('cobertura', () => {
    it('cubre las 78 cartas del mazo', () => {
      expect(CONTENT_ENTRIES).toHaveLength(78);
    });

    it('no tiene slugs que no existan en el mazo', () => {
      const huerfanos = CONTENT_ENTRIES.map(([slug]) => slug).filter(
        (slug) => !ALL_SLUGS.includes(slug),
      );
      expect(huerfanos).toEqual([]);
    });

    it('no deja ninguna carta sin contenido extendido', () => {
      const faltantes = ALL_SLUGS.filter(
        (slug) => CARD_EXTENDED_CONTENT[slug] === undefined,
      );
      expect(faltantes).toEqual([]);
    });

    it('ninguna sección queda vacía en ninguna ficha', () => {
      const vacias: string[] = [];

      CONTENT_ENTRIES.forEach(([slug, content]) => {
        TEXT_SECTIONS.forEach((section) => {
          if (!content[section] || content[section].trim().length === 0) {
            vacias.push(`${slug}.${section}`);
          }
        });
        if (content.combinations.length === 0) {
          vacias.push(`${slug}.combinations`);
        }
      });

      expect(vacias).toEqual([]);
    });
  });

  // ---- Largo ---------------------------------------------------------------

  describe('largo del contenido', () => {
    it('respeta el rango de palabras de cada sección', () => {
      const fueraDeRango: string[] = [];

      CONTENT_ENTRIES.forEach(([slug, content]) => {
        TEXT_SECTIONS.forEach((section) => {
          const words = countWords(content[section]);
          const { min, max } = WORD_RANGES[section];
          if (words < min || words > max) {
            fueraDeRango.push(`${slug}.${section}: ${words} palabras`);
          }
        });
      });

      expect(fueraDeRango).toEqual([]);
    });

    it('deja cada ficha por encima de las 500 palabras propias', () => {
      const cortas: string[] = [];

      ALL_TAROT_CARDS.forEach((card) => {
        const content = CARD_EXTENDED_CONTENT[card.slug];
        if (!content) {
          cortas.push(`${card.slug}: sin contenido extendido`);
          return;
        }
        const total = countBaseWords(card) + countExtendedWords(content);
        if (total < 500) {
          cortas.push(`${card.slug}: ${total} palabras`);
        }
      });

      expect(cortas).toEqual([]);
    });

    it('mantiene yesNo dentro del varchar(500) de la columna', () => {
      const largas = CONTENT_ENTRIES.filter(
        ([, content]) => content.yesNo.length > 500,
      ).map(([slug]) => slug);

      expect(largas).toEqual([]);
    });
  });

  // ---- Unicidad ------------------------------------------------------------

  describe('unicidad entre cartas', () => {
    it.each(TEXT_SECTIONS)(
      'no repite el texto de %s entre dos cartas',
      (section) => {
        const vistos = new Map<string, string>();
        const repetidos: string[] = [];

        CONTENT_ENTRIES.forEach(([slug, content]) => {
          const key = normalize(content[section]);
          const previo = vistos.get(key);
          if (previo) {
            repetidos.push(`${section}: ${previo} === ${slug}`);
          } else {
            vistos.set(key, slug);
          }
        });

        expect(repetidos).toEqual([]);
      },
    );

    it('no repite ninguna lectura de combinación en todo el mazo', () => {
      const vistos = new Map<string, string>();
      const repetidos: string[] = [];

      CONTENT_ENTRIES.forEach(([slug, content]) => {
        content.combinations.forEach((combination) => {
          const key = normalize(combination.reading);
          const previo = vistos.get(key);
          if (previo) {
            repetidos.push(`${previo} === ${slug} (${combination.cardSlug})`);
          } else {
            vistos.set(key, slug);
          }
        });
      });

      expect(repetidos).toEqual([]);
    });

    it('no repite oraciones largas entre secciones de distintas cartas', () => {
      const vistas = new Map<string, string>();
      const repetidas: string[] = [];

      CONTENT_ENTRIES.forEach(([slug, content]) => {
        TEXT_SECTIONS.forEach((section) => {
          content[section]
            .split(/(?<=[.;:!?])\s+/)
            .map(normalize)
            .filter((sentence) => countWords(sentence) >= 8)
            .forEach((sentence) => {
              const previo = vistas.get(sentence);
              if (previo && previo !== slug) {
                repetidas.push(`"${sentence}" en ${previo} y ${slug}`);
              } else {
                vistas.set(sentence, slug);
              }
            });
        });
      });

      expect(repetidas).toEqual([]);
    });
  });

  // ---- Combinaciones -------------------------------------------------------

  describe('combinaciones', () => {
    const todasLasCombinaciones: Array<[string, CardCombinationSeed]> =
      CONTENT_ENTRIES.flatMap(([slug, content]) =>
        content.combinations.map(
          (combination): [string, CardCombinationSeed] => [slug, combination],
        ),
      );

    it('tiene entre 3 y 5 combinaciones por ficha', () => {
      const fueraDeRango = CONTENT_ENTRIES.filter(
        ([, content]) =>
          content.combinations.length < 3 || content.combinations.length > 5,
      ).map(([slug, content]) => `${slug}: ${content.combinations.length}`);

      expect(fueraDeRango).toEqual([]);
    });

    it('referencia únicamente slugs de cartas existentes', () => {
      const muertos = todasLasCombinaciones
        .filter(([, combination]) => !ALL_SLUGS.includes(combination.cardSlug))
        .map(([slug, combination]) => `${slug} → "${combination.cardSlug}"`);

      expect(muertos).toEqual([]);
    });

    it('nunca se combina una carta consigo misma', () => {
      const autoreferencias = todasLasCombinaciones
        .filter(([slug, combination]) => combination.cardSlug === slug)
        .map(([slug]) => slug);

      expect(autoreferencias).toEqual([]);
    });

    it('no repite la misma carta dos veces en una ficha', () => {
      const duplicadas: string[] = [];

      CONTENT_ENTRIES.forEach(([slug, content]) => {
        const slugs = content.combinations.map((c) => c.cardSlug);
        if (new Set(slugs).size !== slugs.length) {
          duplicadas.push(slug);
        }
      });

      expect(duplicadas).toEqual([]);
    });

    it('escribe lecturas de 25 a 70 palabras', () => {
      const fueraDeRango = todasLasCombinaciones
        .map(([slug, combination]): [string, number] => [
          `${slug} + ${combination.cardSlug}`,
          countWords(combination.reading),
        ])
        .filter(([, words]) => words < 25 || words > 70)
        .map(([label, words]) => `${label}: ${words} palabras`);

      expect(fueraDeRango).toEqual([]);
    });
  });

  // ---- Terminología (T-SEO-013) --------------------------------------------

  describe('terminología YMYL', () => {
    /** "salud" y derivados: la regla transversal los prohíbe en texto visible. */
    const TERMINO_PROHIBIDO = /salud/i;

    /**
     * Vocabulario médico: la sección de bienestar habla de energía, descanso,
     * hábitos y ánimo; no de enfermedades ni tratamientos.
     */
    const VOCABULARIO_MEDICO =
      /\b(enfermedad|enfermedades|diagn[oó]stic\w*|tratamiento\w*|s[ií]ntoma\w*|medicament\w*|m[eé]dic\w*|dolencia\w*|patolog[ií]a\w*|remedio\w*|receta\w*)\b/i;

    function todosLosTextos(content: CardExtendedContent): string[] {
      return [
        ...TEXT_SECTIONS.map((section) => content[section]),
        ...content.combinations.map((combination) => combination.reading),
      ];
    }

    it('no usa la palabra "salud" ni sus derivados', () => {
      const infractores: string[] = [];

      CONTENT_ENTRIES.forEach(([slug, content]) => {
        todosLosTextos(content).forEach((text) => {
          if (TERMINO_PROHIBIDO.test(text)) {
            infractores.push(slug);
          }
        });
      });

      expect(infractores).toEqual([]);
    });

    it('no usa la palabra "salud" en los datos base de las 78 cartas', () => {
      const infractores = ALL_TAROT_CARDS.filter((card) =>
        [
          card.meaningUpright,
          card.meaningReversed,
          card.description,
          ...card.keywords.upright,
          ...card.keywords.reversed,
        ].some((text) => TERMINO_PROHIBIDO.test(text)),
      ).map((card) => card.slug);

      expect(infractores).toEqual([]);
    });

    it('no da consejo médico en ninguna sección', () => {
      const infractores: string[] = [];

      CONTENT_ENTRIES.forEach(([slug, content]) => {
        todosLosTextos(content).forEach((text) => {
          const match = VOCABULARIO_MEDICO.exec(text);
          if (match) {
            infractores.push(`${slug}: "${match[0]}"`);
          }
        });
      });

      expect(infractores).toEqual([]);
    });
  });

  // ---- Integración con el seed --------------------------------------------

  describe('integración con ALL_TAROT_CARDS', () => {
    it('deja las siete secciones cargadas en cada carta del seed', () => {
      const incompletas = ALL_TAROT_CARDS.filter(
        (card) =>
          !card.meaningLove ||
          !card.meaningWork ||
          !card.meaningWellbeing ||
          !card.symbolism ||
          !card.advice ||
          !card.yesNo ||
          !card.combinations?.length,
      ).map((card) => card.slug);

      expect(incompletas).toEqual([]);
    });

    it('no pisa el contenido original de la carta', () => {
      const elLoco = ALL_TAROT_CARDS.find((card) => card.slug === 'the-fool');

      expect(elLoco?.meaningUpright).toContain('El Loco');
      expect(elLoco?.meaningLove).toBeDefined();
    });
  });
});
