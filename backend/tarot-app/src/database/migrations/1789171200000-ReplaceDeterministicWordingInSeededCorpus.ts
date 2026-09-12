import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-SEO-018 — saca el lenguaje determinista (YMYL) del corpus YA SEMBRADO en
 * la base: el vocabulario de sanación/curación que quedó después de T-SEO-013,
 * "advertencia" y "peligro" (miedo/urgencia) y una promesa de resultado
 * ("garantizando éxito").
 *
 * Por qué una migración y no un re-seed: los seeders del corpus son
 * *skip-if-exists* (`seedBirthChartInterpretations`, `seedEncyclopediaArticles`,
 * `seedTarotCards`, `seedHolisticServices`, `seedCardFreeInterpretations`) o
 * *backfill* de columnas vacías (`seedEncyclopediaTarotCards`,
 * `seedDailyFreeInterpretations` pisa, pero no corre en el deploy). En una base
 * ya poblada, volver a correrlos no cambia una sola letra.
 *
 * Cómo: mismo patrón quirúrgico que
 * `1787583600000-ReplaceSaludWordingInSeededCorpus`. Un `REPLACE` por subcadena
 * exacta, parametrizado y acotado por `POSITION(...) > 0`: si una fila no trae
 * el texto viejo —porque alguien la editó— la sentencia no la toca. Correrla
 * dos veces no cambia nada la segunda.
 *
 * Novedad respecto de T-SEO-013: columnas `jsonb` (`keywords` y `combinations`
 * de `encyclopedia_tarot_cards`). Se reemplaza sobre el texto del JSON
 * (`col::text`) y se vuelve a castear; las palabras clave, que son tokens de
 * una sola palabra, van ancladas por `slug` para que un `"sanación"` de otra
 * carta no reciba el reemplazo pensado para ésta.
 *
 * SQL escrito a mano: NO viene de `migration:generate` (Regla A del workflow de
 * backend). No toca el esquema, solo datos.
 *
 * Los pares son los mismos que quedaron aplicados en los archivos de seed
 * (`deterministic-wording-sync.spec.ts` lo verifica), para que una base nueva y
 * una base migrada terminen con el mismo texto.
 */

export interface CorpusReplacement {
  /** Tabla sembrada a corregir. */
  table: string;
  /** Columnas de texto donde puede aparecer la subcadena. */
  columns?: string[];
  /** Columnas `jsonb`: el reemplazo se hace sobre `col::text` y se recastea. */
  jsonbColumns?: string[];
  /** Pares [texto viejo, texto nuevo]. */
  replacements: [string, string][];
  /**
   * Ancla opcional: limita el UPDATE a la fila de ese `slug`. Se usa cuando el
   * texto viejo es tan corto que existe en otras filas con otro reemplazo.
   */
  slug?: string;
}

export const CORPUS_REPLACEMENTS: CorpusReplacement[] = [
  {
    table: 'birth_chart_interpretations',
    columns: ['content'],
    replacements: [
      [
        'un líder compasivo capaz de sanar y guiar desde el corazón',
        'un líder compasivo capaz de contener y guiar desde el corazón',
      ],
      [
        'buscando siempre optimizar, sanar y ordenar el caos',
        'buscando siempre optimizar, reparar y ordenar el caos',
      ],
      [
        'canalizas tu intensidad hacia la sanación y la transformación personal',
        'canalizas tu intensidad hacia el autoconocimiento y la transformación personal',
      ],
      [
        'eres un canal de amor universal y sanación.',
        'eres un canal de amor universal y consuelo.',
      ],
      [
        'Para ti, hablar es sanar.',
        'Para ti, hablar es ordenar lo que sientes.',
      ],
      [
        'se convierte en una fuerza sanadora de un poder incalculable',
        'se convierte en una fuerza restauradora de un poder incalculable',
      ],
      [
        'Tienes el poder de sanar o destruir con la palabra',
        'Tienes el poder de reparar o destruir con la palabra',
      ],
      [
        'amas de una forma que sana y hace crecer',
        'amas de una forma que repara y hace crecer',
      ],
      [
        'tienes el poder de sanar heridas profundas',
        'tienes el poder de reparar heridas profundas',
      ],
      [
        'tienes el don de sanar y mejorar la realidad material',
        'tienes el don de reparar y mejorar la realidad material',
      ],
      [
        'eres un canal de esperanza y sanación, capaz de',
        'eres un canal de esperanza y consuelo, capaz de',
      ],
      [
        'trabajar en instituciones de ayuda, arte o sanación,',
        'trabajar en instituciones de ayuda, arte o acompañamiento,',
      ],
      [
        'la capacidad de sanar traumas colectivos sacándolos a la luz',
        'la capacidad de transformar heridas colectivas sacándolas a la luz',
      ],
      [
        'actuar basándote en ilusiones peligrosas',
        'actuar basándote en ilusiones que te desorientan',
      ],
      [
        'tienes la capacidad de sanar el alma colectiva a través del cuidado',
        'tienes la capacidad de reconfortar el alma colectiva a través del cuidado',
      ],
      [
        'entendiendo que curar el cuerpo es también curar el alma',
        'entendiendo que cuidar el cuerpo es también cuidar el alma',
      ],
      [
        'con una devoción práctica y sanadora.',
        'con una devoción práctica y reparadora.',
      ],
      [
        'Eres un sanador profundo que entiende',
        'Eres un guía profundo que entiende',
      ],
      [
        'utilizar la intuición y la tecnología para sanar a la sociedad',
        'utilizar la intuición y la tecnología para transformar a la sociedad',
      ],
      [
        'la capacidad de sanar traumas ancestrales, destruir tabúes',
        'la capacidad de transformar heridas ancestrales, destruir tabúes',
      ],
      [
        'sanando las heridas del alma a un nivel global y profundo',
        'reparando las heridas del alma a un nivel global y profundo',
      ],
      [
        'Brillas cuando organizas, sanas o perfeccionas sistemas.',
        'Brillas cuando organizas, reparas o perfeccionas sistemas.',
      ],
      [
        'sanando tus propias sombras y ayudando',
        'integrando tus propias sombras y ayudando',
      ],
      [
        'tienes la capacidad de sanar traumas profundos propios y ajenos.',
        'tienes la capacidad de transformar heridas profundas propias y ajenas.',
      ],
      [
        'retirarte a meditar o dormir para sanar emociones',
        'retirarte a meditar o dormir para ordenar emociones',
      ],
      [
        'o buscas sanarla a través del amor',
        'o buscas repararla a través del amor',
      ],
      [
        'Tienes el poder de sanar a través de la intimidad.',
        'Tienes el poder de transformar a través de la intimidad.',
      ],
      [
        'socios comerciales con los que compites sanamente',
        'socios comerciales con los que compites con lealtad',
      ],
      [
        'viajar de mochilero a lugares peligrosos',
        'viajar de mochilero a lugares remotos',
      ],
      [
        'aprender a expresar tu enojo de forma sana',
        'aprender a expresar tu enojo de forma constructiva',
      ],
      [
        'Tu don es sanar y servir con alegría.',
        'Tu don es cuidar y servir con alegría.',
      ],
      [
        'sanar traumas profundos con facilidad',
        'transformar heridas profundas con facilidad',
      ],
      [
        'la capacidad de sanación espiritual',
        'la capacidad de consuelo espiritual',
      ],
      [
        'El desafío es sanar al niño interior',
        'El desafío es reconciliarte con tu niño interior',
      ],
      [
        'Tu don es la sanación y la ayuda desinteresada.',
        'Tu don es el cuidado y la ayuda desinteresada.',
      ],
      [
        'El desafío es sanar el resentimiento familiar',
        'El desafío es soltar el resentimiento familiar',
      ],
      [
        'dedicarte a profesiones de sanación profunda y eliminación de residuos',
        'dedicarte a profesiones de transformación profunda y eliminación de residuos',
      ],
      [
        'Tu don es la capacidad de sanar y resolver problemas complejos',
        'Tu don es la capacidad de reparar y resolver problemas complejos',
      ],
      [
        'la capacidad de transformar y sanar a través del compromiso profundo',
        'la capacidad de transformar y reparar a través del compromiso profundo',
      ],
      [
        'Tu don es la sanación psicológica profunda y la capacidad de regenerar',
        'Tu don es la transformación interior profunda y la capacidad de regenerar',
      ],
      [
        'y sanar patrones profundos a través del conflicto',
        'y transformar patrones profundos a través del conflicto',
      ],
      [
        'la capacidad artística o sanadora que toca el alma',
        'la capacidad artística o consoladora que toca el alma',
      ],
      [
        'Eres un sanador emocional potente una vez',
        'Eres un apoyo emocional potente una vez',
      ],
      [
        'usar tu agudeza mental para sanar y empoderar',
        'usar tu agudeza mental para reparar y empoderar',
      ],
      [
        'la música, la poesía o la sanación.',
        'la música, la poesía o el acompañamiento.',
      ],
      [
        'Tu don es la capacidad de sanar y consolar a nivel del alma',
        'Tu don es la capacidad de reconfortar y consolar a nivel del alma',
      ],
      [
        'la capacidad natural de sanar traumas profundos propios y ajenos sin miedo',
        'la capacidad natural de transformar heridas profundas propias y ajenas sin miedo',
      ],
      [
        'Tus palabras tienen un efecto sanador y encantador.',
        'Tus palabras tienen un efecto reparador y encantador.',
      ],
      [
        'una experiencia mística y sanadora.',
        'una experiencia mística y reparadora.',
      ],
      [
        'combina acción con confianza, garantizando éxito en tus iniciativas',
        'combina acción con confianza, y eso suele favorecer tus iniciativas',
      ],
      [
        'la capacidad de sanar a otros con tu sola presencia',
        'la capacidad de calmar a otros con tu sola presencia',
      ],
      [
        'usas tu intensidad para empoderarte y sanar, en lugar de',
        'usas tu intensidad para empoderarte y reparar, en lugar de',
      ],
      [
        'para el arte o la sanación consciente',
        'para el arte o el autoconocimiento consciente',
      ],
      [
        'te transformas en un sanador emocional indestructible',
        'te transformas en un apoyo emocional indestructible',
      ],
      [
        'usar tu agudeza mental para sanar y transformar, no para manipular',
        'usar tu agudeza mental para reparar y transformar, no para manipular',
      ],
      [
        'Esta tensión te empuja a sanar tu propia sombra.',
        'Esta tensión te empuja a integrar tu propia sombra.',
      ],
    ],
  },
  {
    table: 'tarot_card',
    columns: ['meaningUpright', 'meaningReversed', 'keywords'],
    replacements: [
      [
        'periodo de dudas, advertencia, momento de realizar cambios',
        'periodo de dudas, señal de alerta, momento de realizar cambios',
      ],
      [
        'Algo importante se oculta, peligros o enemigos ocultos, chismes',
        'Algo importante se oculta, riesgos o enemigos ocultos, chismes',
      ],
      [
        'Curación de las viejas heridas, armonía',
        'Reparación de las viejas heridas, armonía',
      ],
      [
        'empatía, sanación emocional, espiritualidad',
        'empatía, reparación emocional, espiritualidad',
      ],
      ['amor maternal, sanación', 'amor maternal, cuidado'],
      [
        'Sanación, perdón, recuperación del dolor',
        'Alivio, perdón, recuperación del dolor',
      ],
      [
        'retiro, contemplación, sanación.',
        'retiro, contemplación, recuperación.',
      ],
      ['buscar ayuda, sanación mental.', 'buscar ayuda, alivio mental.'],
    ],
  },
  {
    table: 'tarot_card',
    columns: ['dailyFreeUpright', 'dailyFreeReversed'],
    replacements: [
      [
        'date tiempo para sanar antes de abrirte',
        'date tiempo para reponerte antes de abrirte',
      ],
    ],
  },
  {
    table: 'card_free_interpretation',
    columns: ['content'],
    replacements: [
      [
        'Es un período de sanación y renovación.',
        'Es un período de recuperación y renovación.',
      ],
      [
        'Recuperá la fe en tu capacidad de sanar y buscá apoyo',
        'Recuperá la fe en tu capacidad de reponerte y buscá apoyo',
      ],
      ['que impiden sanar la relación', 'que impiden recomponer la relación'],
    ],
  },
  {
    table: 'holistic_services',
    columns: ['short_description', 'long_description'],
    replacements: [
      [
        'Sanar no es romper con la familia, es liberar tu línea',
        'Reparar no es romper con la familia, es liberar tu línea',
      ],
      [
        'empezar un verdadero camino de sanación.',
        'empezar un verdadero camino de transformación.',
      ],
      [
        'Sanación y transformación energética con letras hebreas',
        'Armonización y transformación energética con letras hebreas',
      ],
      [
        'Tiene por objeto tratar, sanar y transformar la energía',
        'Tiene por objeto trabajar, armonizar y transformar la energía',
      ],
      [
        'llevando armonía y sanación allí donde son necesarias',
        'llevando armonía y equilibrio allí donde son necesarios',
      ],
    ],
  },
  {
    table: 'encyclopedia_articles',
    columns: ['snippet', 'content'],
    replacements: [
      [
        '**Maestro 33 (El Maestro Sanador):** Enfocado en la sanación y elevación de la conciencia humana',
        '**Maestro 33 (El Maestro Compasivo):** Enfocado en el cuidado y la elevación de la conciencia humana',
      ],
      [
        'Excelentes para la sanación espiritual.',
        'Excelentes para el trabajo espiritual.',
      ],
      ['Lavanda (paz y sanación)', 'Lavanda (paz y calma)'],
      [
        'El sanador analítico, perfeccionista',
        'El artesano analítico, perfeccionista',
      ],
      ['desarrollar una sana autoestima', 'desarrollar una autoestima sólida'],
      [
        'implica sanar las heridas del hogar de origen',
        'implica reparar las heridas del hogar de origen',
      ],
      [
        'Trabajo en campos de sanación, sensibilidad',
        'Trabajo en campos de acompañamiento, sensibilidad',
      ],
      [
        'integrar el inconsciente, sanar el karma, desarrollar',
        'integrar el inconsciente, resolver el karma, desarrollar',
      ],
      ['el artesano y el sanador', 'el artesano y el cuidador'],
      ['- Capacidad de sanación', '- Capacidad de contención'],
      [
        'poderosas para la sanación emocional, la clarividencia',
        'poderosas para el equilibrio emocional, la clarividencia',
      ],
      [
        'las heridas ancestrales que deben sanarse.',
        'las heridas ancestrales que piden ser integradas.',
      ],
      [
        'el arquetipo del artesano y el sanador.',
        'el arquetipo del artesano y el cuidador.',
      ],
      [
        '- Habilidades sanadoras y de cuidado',
        '- Habilidades de cuidado y de servicio',
      ],
    ],
  },
  {
    table: 'encyclopedia_tarot_cards',
    columns: [
      'meaning_love',
      'meaning_work',
      'meaning_wellbeing',
      'symbolism',
      'advice',
      'yes_no',
    ],
    jsonbColumns: ['combinations'],
    replacements: [
      [
        'La combinación anuncia una sanación emocional genuina',
        'La combinación anuncia una recuperación emocional genuina',
      ],
      [
        'La advertencia es no confundir buena onda con contrato',
        'La salvedad es no confundir buena onda con contrato',
      ],
      [
        'La advertencia es leve: cuidado con que todo',
        'El reparo es leve: cuidado con que todo',
      ],
      [
        'Es la advertencia más clara del mazo:',
        'Es el aviso más claro del mazo:',
      ],
      ['y es también la más peligrosa.', 'y es también la más engañosa.'],
      [
        'La única advertencia es la autocomplacencia',
        'El único reparo es la autocomplacencia',
      ],
      [
        'La advertencia mínima: cuidado con exigirle',
        'La única salvedad: cuidado con exigirle',
      ],
      [
        'La advertencia es práctica: revisa el contrato',
        'El aviso es práctico: revisa el contrato',
      ],
      [
        'con la advertencia de que la rueda sigue girando',
        'con la salvedad de que la rueda sigue girando',
      ],
      [
        'así que no siempre es una advertencia.',
        'así que no siempre es una señal de alarma.',
      ],
      [
        'vínculos que sanan y la capacidad',
        'vínculos que se recomponen y la capacidad',
      ],
      [
        'El corazón se abre después de sanar.',
        'El corazón se abre después de reponerse.',
      ],
      [
        'La combinación es una advertencia directa:',
        'La combinación es un aviso directo:',
      ],
      [
        'marca circulación sana: entra y sale',
        'marca circulación fluida: entra y sale',
      ],
      [
        'con la advertencia obvia: la previsibilidad',
        'con el reparo obvio: la previsibilidad',
      ],
      ['Es la advertencia clásica del mazo:', 'Es el aviso clásico del mazo:'],
      [
        'atento a un peligro que quizás ya no está',
        'atento a una amenaza que quizás ya no está',
      ],
      [
        'Distingue el peligro actual de la memoria del peligro anterior',
        'Distingue la amenaza actual de la memoria de la amenaza anterior',
      ],
    ],
  },
  {
    table: 'encyclopedia_tarot_cards',
    columns: ['description', 'meaning_upright', 'meaning_reversed'],
    replacements: [
      ['Para sanarlo, debes', 'Para superarlo, debes'],
      [
        'para sanar problemas de imagen corporal o complejos de inferioridad',
        'para reconciliarte con tu imagen corporal y los complejos de inferioridad',
      ],
      [
        'el arcángel Rafael (sanador divino)',
        'el arcángel Rafael (mensajero divino)',
      ],
      [
        'Para sanar esto, debes dejar de pelear',
        'Para superar esto, debes dejar de pelear',
      ],
      [
        'la paciencia y la sanación profunda.',
        'la paciencia y la reparación profunda.',
      ],
      [
        'y la curación de viejas heridas afectivas',
        'y el cierre de viejas heridas afectivas',
      ],
      [
        'elevándote como un sanador consciente',
        'elevándote como un alquimista consciente',
      ],
      [
        'esperanza renovada, sanación profunda, paz espiritual',
        'esperanza renovada, alivio profundo, paz espiritual',
      ],
      [
        'sanación de viejos traumas de pareja',
        'reparación de viejas heridas de pareja',
      ],
      [
        'abrazar a tu niño interior sanamente, sin evadir',
        'abrazar a tu niño interior con equilibrio, sin evadir',
      ],
      ['curación milagrosa de rupturas', 'reparación inesperada de rupturas'],
      [
        'la competencia sana, el debate de ideas',
        'la competencia leal, el debate de ideas',
      ],
      [
        'la proyección de heridas no sanadas en la pareja',
        'la proyección de heridas no resueltas en la pareja',
      ],
      [
        'El perdón, la sanación y la capacidad de dejar el pasado atrás',
        'El perdón, la recuperación y la capacidad de dejar el pasado atrás',
      ],
      [
        'y a la curación que proviene de recordar',
        'y a la reparación que proviene de recordar',
      ],
      [
        'Arquetipo de la sanadora, canalizadora y madre espiritual',
        'Arquetipo de la cuidadora, canalizadora y madre espiritual',
      ],
      [
        'Recuperación del dolor, sanar heridas del pasado, perdonar',
        'Recuperación del dolor, cerrar heridas del pasado, perdonar',
      ],
      [
        'el retiro estratégico para sanar y recuperar fuerzas',
        'el retiro estratégico para reponerse y recuperar fuerzas',
      ],
      ['y el viaje que sana.', 'y el viaje que alivia.'],
      [
        'la circulación sana de la abundancia',
        'la circulación equilibrada de la abundancia',
      ],
    ],
  },
  {
    table: 'encyclopedia_tarot_cards',
    jsonbColumns: ['keywords'],
    slug: 'five-of-cups',
    replacements: [['"sanación"', '"recuperación"']],
  },
  {
    table: 'encyclopedia_tarot_cards',
    jsonbColumns: ['keywords'],
    slug: 'queen-of-cups',
    replacements: [['"sanación"', '"cuidado"']],
  },
  {
    table: 'encyclopedia_tarot_cards',
    jsonbColumns: ['keywords'],
    slug: 'three-of-swords',
    replacements: [['"sanación"', '"reparación"']],
  },
  {
    table: 'encyclopedia_tarot_cards',
    jsonbColumns: ['keywords'],
    slug: 'six-of-swords',
    replacements: [['"sanación"', '"alivio"']],
  },
];

/** REPLACE por subcadena exacta; no toca las filas que no la contienen. */
async function replaceSubstring(
  queryRunner: QueryRunner,
  entry: CorpusReplacement,
  column: string,
  from: string,
  to: string,
  jsonb: boolean,
): Promise<void> {
  const anclaSlug = entry.slug === undefined ? '' : ' AND "slug" = $3';
  const params = entry.slug === undefined ? [from, to] : [from, to, entry.slug];
  const origen = jsonb ? `"${column}"::text` : `"${column}"`;
  const destino = jsonb
    ? `REPLACE(${origen}, $1, $2)::jsonb`
    : `REPLACE(${origen}, $1, $2)`;

  await queryRunner.query(
    `UPDATE "${entry.table}"
     SET "${column}" = ${destino}
     WHERE POSITION($1 IN ${origen}) > 0${anclaSlug}`,
    params,
  );
}

async function applyAll(
  queryRunner: QueryRunner,
  entry: CorpusReplacement,
  direction: 'up' | 'down',
): Promise<void> {
  const order = <T>(items: T[]): T[] =>
    direction === 'up' ? items : [...items].reverse();
  const targets = [
    ...(entry.columns ?? []).map((column) => ({ column, jsonb: false })),
    ...(entry.jsonbColumns ?? []).map((column) => ({ column, jsonb: true })),
  ];

  for (const { column, jsonb } of order(targets)) {
    for (const [from, to] of order(entry.replacements)) {
      if (direction === 'up') {
        await replaceSubstring(queryRunner, entry, column, from, to, jsonb);
      } else {
        await replaceSubstring(queryRunner, entry, column, to, from, jsonb);
      }
    }
  }
}

export class ReplaceDeterministicWordingInSeededCorpus1789171200000 implements MigrationInterface {
  name = 'ReplaceDeterministicWordingInSeededCorpus1789171200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const entry of CORPUS_REPLACEMENTS) {
      await applyAll(queryRunner, entry, 'up');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const entry of [...CORPUS_REPLACEMENTS].reverse()) {
      await applyAll(queryRunner, entry, 'down');
    }
  }
}
