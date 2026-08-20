import { MAJOR_ARCANA_EXTENDED_CONTENT } from './extended/major-arcana-extended.data';
import { WANDS_EXTENDED_CONTENT } from './extended/wands-extended.data';
import { CUPS_EXTENDED_CONTENT } from './extended/cups-extended.data';
import { SWORDS_EXTENDED_CONTENT } from './extended/swords-extended.data';
import { PENTACLES_EXTENDED_CONTENT } from './extended/pentacles-extended.data';
import { CardExtendedContentMap } from './extended/card-extended-content.types';

/**
 * Contenido extendido de las 78 fichas de tarot (T-SEO-009)
 *
 * Siete secciones por carta —amor, trabajo, bienestar, simbolismo, consejo,
 * sí/no y combinaciones— que llevan cada ficha de ~166 a más de 500 palabras
 * propias. Ver `extended/card-extended-content.types.ts` para las reglas.
 *
 * Se inyecta en `ALL_TAROT_CARDS` (`cards-seed.data.ts`), de donde lo toma el
 * seeder. `card-extended-content.data.spec.ts` verifica cobertura, largos,
 * unicidad, slugs de combinaciones y terminología.
 */
export const CARD_EXTENDED_CONTENT: CardExtendedContentMap = {
  ...MAJOR_ARCANA_EXTENDED_CONTENT,
  ...WANDS_EXTENDED_CONTENT,
  ...CUPS_EXTENDED_CONTENT,
  ...SWORDS_EXTENDED_CONTENT,
  ...PENTACLES_EXTENDED_CONTENT,
};

/**
 * Los archivos por palo se exportan también sueltos: los tests de datos y los
 * scripts de verificación los recorren de a uno para reportar por grupo.
 */
export {
  MAJOR_ARCANA_EXTENDED_CONTENT,
  WANDS_EXTENDED_CONTENT,
  CUPS_EXTENDED_CONTENT,
  SWORDS_EXTENDED_CONTENT,
  PENTACLES_EXTENDED_CONTENT,
};
