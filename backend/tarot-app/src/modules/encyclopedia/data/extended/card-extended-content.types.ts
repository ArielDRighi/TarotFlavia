/**
 * Contenido extendido de una ficha de la enciclopedia de tarot (T-SEO-009)
 *
 * Las siete secciones que T-SEO-008 agregó a la entidad viven acá, separadas de
 * `major-arcana.data.ts` / `minor-arcana.data.ts` para que los archivos de datos
 * originales sigan siendo legibles: son ~450 palabras por carta × 78 cartas.
 *
 * ⚠️ La sección de bienestar habla de energía, descanso, hábitos y ánimo.
 * NUNCA de enfermedades, diagnósticos, tratamientos ni de la palabra "salud"
 * (regla transversal de terminología, T-SEO-013). Hay un test que lo verifica.
 */

/**
 * Combinación de esta carta con otra del mazo.
 *
 * `cardSlug` DEBE ser el slug de una carta existente: el frontend arma el
 * cross-link con ese valor y el backend no valida la referencia. El test de
 * `card-extended-content.data.spec.ts` es la única red que hay.
 */
export interface CardCombinationSeed {
  cardSlug: string;
  reading: string;
}

/**
 * Las siete secciones extendidas de una ficha.
 *
 * Todas obligatorias: una carta tiene el bloque completo o no tiene ninguno.
 * El guardarraíl de T-SEO-010 falla si alguna sección queda vacía.
 */
export interface CardExtendedContent {
  /** La carta en el amor y los vínculos (70–100 palabras) */
  meaningLove: string;
  /** La carta en el trabajo y el dinero (70–100 palabras) */
  meaningWork: string;
  /** La carta en la energía y el bienestar (60–90 palabras) */
  meaningWellbeing: string;
  /** Lectura de la imagen: figuras, colores y números (80–120 palabras) */
  symbolism: string;
  /** Qué hacer cuando sale esta carta (50–80 palabras) */
  advice: string;
  /** Respuesta en tiradas de sí/no, con su matiz (20–40 palabras, máx. 500 chars) */
  yesNo: string;
  /** Combinaciones con otras cartas: 3 a 5 por ficha, 30–50 palabras cada una */
  combinations: CardCombinationSeed[];
}

/**
 * Mapa slug → contenido extendido.
 */
export type CardExtendedContentMap = Record<string, CardExtendedContent>;
