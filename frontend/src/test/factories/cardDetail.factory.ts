/**
 * Factory de fichas de tarot para tests (T-SEO-010).
 *
 * `createMockCardDetail` devuelve la ficha **real** de `five-of-swords`: la más
 * corta de las 78 que cargó T-SEO-009 (579 palabras propias medidas sobre la
 * base). Es el canario del guardarraíl de largo: si el render deja de sacar a la
 * página alguna de las secciones, la ficha más corta del corpus es la primera
 * que cae por debajo del piso de `MIN_CARD_DETAIL_WORDS`.
 *
 * ⚠️ No recortar este contenido para "achicar el fixture": el número que mide el
 * guardarraíl deja de significar nada si el texto no es el que se publica.
 * La fuente es `backend/tarot-app/src/modules/encyclopedia/data/` —
 * `minor-arcana.data.ts` (campos base) y `extended/swords-extended.data.ts`
 * (secciones extendidas).
 */

import { ArcanaType, Element, Suit } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';

/**
 * Ficha completa con las siete secciones extendidas pobladas.
 *
 * @param overrides - Campos a pisar (por ejemplo `{ combinations: undefined }`
 *   para simular una ficha a medio cargar).
 */
export function createMockCardDetail(overrides: Partial<CardDetail> = {}): CardDetail {
  return {
    id: 51,
    slug: 'five-of-swords',
    nameEs: 'Cinco de Espadas',
    nameEn: 'Five of Swords',
    arcanaType: ArcanaType.MINOR,
    number: 5,
    suit: Suit.SWORDS,
    romanNumeral: null,
    courtRank: null,
    element: Element.AIR,
    planet: null,
    zodiacSign: null,
    meaningUpright:
      'Conflicto sin ganadores reales, derrota humillante, traición y victoria pírrica que deja un sabor amargo.',
    meaningReversed:
      'Reconciliación después del conflicto, aprender la lección de las batallas perdidas y soltar el rencor.',
    description:
      'Una figura sonríe recogiendo tres espadas mientras dos figuras derrotadas caminan en dirección opuesta. El cielo está nublado y tormentoso. Representa los conflictos en los que nadie gana realmente, las victorias que tienen un costo demasiado alto y las situaciones donde el orgullo causa más daño que el conflicto en sí.',
    keywords: {
      upright: ['conflicto', 'derrota', 'traición', 'victoria pírrica', 'orgullo', 'humillación'],
      reversed: ['reconciliación', 'aprender la lección', 'soltar el rencor', 'paz', 'rendición'],
    },
    imageUrl: '/images/tarot/five-of-swords.webp',
    thumbnailUrl: '/images/tarot/five-of-swords-thumb.webp',
    relatedCards: null,
    meaningLove:
      'Se gana la discusión y se pierde el vínculo. Aparece en peleas donde alguien necesita tener razón por encima de todo, en reproches que humillan y en conversaciones que dejan cicatriz. También marca vínculos donde la competencia reemplazó a la complicidad. La carta no reparte culpas de manera prolija: muestra que el costo del triunfo es la distancia. Si vienes de una discusión así, la pregunta útil no es quién tenía razón sino qué quieres conservar.',
    meaningWork:
      'Ambiente hostil: competencia desleal, alguien que se lleva el crédito, victorias conseguidas pasando por encima de otros. Puede ser que estés del lado que gana o del que perdió, y en ninguno de los dos la carta trae buenas noticias de fondo. Es un aviso para elegir bien las batallas y para revisar si ese logro vale el clima que deja. En el bolsillo, ganancias con costo relacional: contratos que se firman rompiendo confianza.',
    meaningWellbeing:
      'La hostilidad sostenida desgasta más que el trabajo. El cuerpo acumula tensión, el sueño se pone liviano y el ánimo se vuelve irritable con cualquiera. Lo que ayuda es sacar la energía del conflicto: mover el cuerpo, alejarte físicamente del ambiente tenso, cortar las conversaciones que se repiten sin avanzar. Revisa cuánto tiempo por día dedicas a discutir en la cabeza con alguien que ni siquiera está presente.',
    symbolism:
      'Un hombre de expresión burlona recoge tres espadas y mira por encima del hombro a dos figuras que se alejan cabizbajas hacia la orilla, dejando sus armas en el suelo. El vencedor está solo en primer plano: ganó y no tiene con quién festejar. El cielo está agitado con nubes irregulares y el mar detrás se ve revuelto. Es una de las pocas cartas del Tarot narradas desde el punto de vista del que gana, y aun así el clima es de derrota. La pregunta que deja es cuánto costó ese triunfo.',
    advice:
      'Elige entre tener razón y tener el vínculo. Si la discusión ya llegó al punto de humillar, retírate aunque estés ganando: no hay victoria que compense un puente quemado. Si fuiste el que perdió, junta tus espadas y sal del campo sin dar la revancha. Y revisa qué necesidad tuya se está satisfaciendo con esa pelea.',
    yesNo:
      'No, o sí a un costo que no conviene pagar. La carta advierte que el resultado se obtiene rompiendo algo importante en el camino.',
    combinations: [
      {
        cardSlug: 'seven-of-swords',
        reading:
          'Hay engaño detrás del conflicto. Alguien está jugando con información oculta o quedándose con algo que no le corresponde: revisa los detalles antes de seguir discutiendo de frente.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'La pelea se volvió un vínculo en sí misma. Discuten porque no saben estar de otra manera: la dupla pide cortar el circuito antes de buscar quién empezó.',
      },
      {
        cardSlug: 'temperance',
        reading:
          'Hay una salida negociada disponible. Si alguno baja el tono primero, el conflicto se desarma más rápido de lo que ambos creen. Sé tú quien lo hace.',
      },
      {
        cardSlug: 'six-of-swords',
        reading:
          'Después del conflicto, la partida. No hay reconciliación en el corto plazo: lo que corresponde es alejarse y dejar que el tiempo baje la temperatura.',
      },
    ],
    ...overrides,
  };
}

/**
 * Nombres en español de las cartas que aparecen en las combinaciones del
 * fixture. Es lo que la ruta resuelve en el servidor y pasa al render.
 */
export const MOCK_COMBINATION_CARD_NAMES: Record<string, string> = {
  'seven-of-swords': 'Siete de Espadas',
  'the-devil': 'El Diablo',
  temperance: 'La Templanza',
  'six-of-swords': 'Seis de Espadas',
};
