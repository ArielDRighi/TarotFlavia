import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-SEO-013 — saca las señales YMYL del corpus YA SEMBRADO en la base: la
 * palabra "salud" y, en tres arcanos mayores, la promesa de un resultado legal
 * o financiero concreto.
 *
 * Por qué una migración y no un re-seed: los seeders del corpus son
 * *skip-if-exists* —`seedReadingCategories`, `seedEncyclopediaArticles`,
 * `seedBirthChartInterpretations`, `seedPredefinedQuestions` y `seedTarotCards`
 * cortan apenas encuentran una fila—, así que en una base ya poblada volver a
 * correrlos no cambia una sola letra. Producción quedaría con el texto viejo
 * por más que el repo esté limpio.
 *
 * Cómo: mismo patrón quirúrgico que
 * `1787274000000-ReplaceSaludWordingInTarotCards`. Un `REPLACE` por subcadena
 * exacta, parametrizado (nada de interpolar texto en el SQL) y acotado por
 * `POSITION(...) > 0`: si una fila no trae el texto viejo —porque alguien la
 * editó— la sentencia no la toca. Correrla dos veces no cambia nada la segunda.
 *
 * SQL escrito a mano: NO viene de `migration:generate` (ver Regla A del
 * workflow de backend). No toca el esquema, solo datos.
 *
 * ⚠️ El slug `salud-bienestar` NO se migra. El gating de los planes FREE filtra
 * por slug en `reading-validator.service.ts` y en `TarotPageContent.tsx`:
 * renombrarlo dejaría a esos usuarios sin una de sus tres categorías. Lo que
 * cambia es el `name`, la `description` y el `icon` (🏥 → 🌿), que es lo que ve
 * el visitante.
 *
 * Los pares son los mismos que quedaron aplicados en los archivos de seed, para
 * que una base nueva y una base migrada terminen con el mismo texto.
 */

export interface CorpusReplacement {
  /** Tabla sembrada a corregir. */
  table: string;
  /** Columnas de texto donde puede aparecer la subcadena. */
  columns: string[];
  /** Pares [texto viejo, texto nuevo]. */
  replacements: [string, string][];
  /**
   * Ancla opcional: limita el UPDATE a la fila de ese `slug`. Se usa cuando el
   * texto viejo es tan corto que podría existir en otra fila por casualidad.
   */
  slug?: string;
}

export const CORPUS_REPLACEMENTS: CorpusReplacement[] = [
  {
    table: 'card_free_interpretation',
    columns: ['content'],
    replacements: [
      [
        'objetivos de salud con disciplina',
        'objetivos de bienestar con disciplina',
      ],
      [
        'altibajos en tu energía o salud.',
        'altibajos en tu energía o tu ánimo.',
      ],
      [
        'conscientes sobre tu salud darán',
        'conscientes sobre tu bienestar darán',
      ],
      [
        'pero es el inicio de una salud más integral.',
        'pero es el inicio de un equilibrio más integral.',
      ],
      ['en algún área de tu salud.', 'en algún área de tu bienestar.'],
      [
        'Puede haber una crisis de salud que funcione como llamado de atención.',
        'Puede haber una crisis que funcione como llamado de atención.',
      ],
      [
        'real en términos de salud y tomar',
        'real en términos de bienestar y tomar',
      ],
      [
        'visión negativa sobre tu salud.',
        'visión negativa sobre tu bienestar.',
      ],
      [
        'transformar tu relación con la salud.',
        'transformar tu relación con tu cuerpo.',
      ],
      [
        'Puede haber algo pendiente de resolver en tu salud antes de alcanzar el bienestar pleno.',
        'Puede haber algo pendiente de resolver antes de alcanzar el bienestar pleno.',
      ],
    ],
  },
  {
    table: 'reading_category',
    columns: ['name', 'description'],
    replacements: [
      ['Salud y Bienestar', 'Energía y Bienestar'],
      [
        'Consultas sobre salud física, bienestar emocional y equilibrio en tu vida.',
        'Consultas sobre energía, bienestar emocional y equilibrio en tu vida.',
      ],
    ],
  },
  {
    // El ícono de hospital era la misma señal YMYL que el nombre. Va en su
    // propia entrada, anclada a la columna `icon` y al slug: un emoji es una
    // subcadena de un solo carácter y sin anclar el `down` reescribiría
    // cualquier 🌿 de la tabla a 🏥.
    table: 'reading_category',
    columns: ['icon'],
    replacements: [['🏥', '🌿']],
    slug: 'salud-bienestar',
  },
  {
    table: 'predefined_question',
    columns: ['question_text'],
    replacements: [
      [
        '¿Qué aspectos de mi salud requieren atención',
        '¿Qué aspectos de mi bienestar requieren atención',
      ],
      [
        'emociones están afectando mi salud física?',
        'emociones están afectando mi energía física?',
      ],
    ],
  },
  {
    table: 'tarot_card',
    columns: ['meaningUpright'],
    replacements: [
      ['iniciar una vida más saludable', 'iniciar una vida más equilibrada'],
      [
        'las obligaciones y cuidar la salud',
        'las obligaciones y cuidar tu energía',
      ],
      // Promesas de resultado económico: mismo criterio YMYL que los tres
      // arcanos mayores de más abajo.
      [
        'Buen augurio de rápidos resultados o avances importantes tanto en lo económico como laboral.',
        'Señala un momento de rápidos resultados y avances importantes, tanto en lo económico como en lo laboral.',
      ],
      [
        'En finanzas es muy positiva, augura llegada de dinero inesperado, suerte en el azar, estado de mejoría.',
        'En finanzas es muy positiva: habla de dinero inesperado, de suerte en el azar y de una etapa de mejoría.',
      ],
    ],
  },
  {
    table: 'encyclopedia_articles',
    columns: ['snippet', 'content'],
    replacements: [
      [
        'Vitalidad y salud del cuerpo físico',
        'Vitalidad y energía del cuerpo físico',
      ],
      [
        'rige el trabajo cotidiano, la salud y el servicio',
        'rige el trabajo cotidiano, el bienestar y el servicio',
      ],
      [
        'los hábitos saludables y la capacidad de ser útil',
        'los hábitos sostenidos y la capacidad de ser útil',
      ],
      [
        'rige el mundo del trabajo cotidiano, la salud y el servicio',
        'rige el mundo del trabajo cotidiano, el bienestar y el servicio',
      ],
      [
        'los hábitos de salud, la organización',
        'los hábitos de cuidado, la organización',
      ],
      [
        '- Salud, alimentación y hábitos físicos',
        '- Bienestar, alimentación y hábitos físicos',
      ],
      [
        'Identidad centrada en el trabajo y la salud',
        'Identidad centrada en el trabajo y el bienestar',
      ],
      [
        'Trabajo activo y enérgico, posibles problemas inflamatorios de salud',
        'Trabajo activo y enérgico, posible desgaste por exceso de exigencia',
      ],
      [
        'Disciplina laboral excepcional, aprendizajes a través de la enfermedad',
        'Disciplina laboral excepcional, aprendizajes a través de la constancia',
      ],
      [
        'Trabajo abundante y expansivo, buena recuperación de enfermedades',
        'Trabajo abundante y expansivo, gran capacidad de recuperación',
      ],
      [
        'sensibilidad a sustancias, enfermedades difusas',
        'sensibilidad a los ambientes, límites difusos',
      ],
      [
        'el trabajo implica desarrollar hábitos saludables',
        'el trabajo implica desarrollar hábitos sostenidos',
      ],
      [
        'Rutina diaria, trabajo, salud física, mascotas',
        'Rutina diaria, trabajo, bienestar físico, mascotas',
      ],
    ],
  },
  {
    // Hallazgo derivado de T-SEO-012, asignado a esta tarea: tres arcanos
    // mayores PROMETÍAN un resultado concreto —"promete… prosperidad
    // financiera", "garantiza resolución a favor en temas legales", "augurio
    // excelente… disciplina financiera"—. Prometer un desenlace legal o
    // financiero es territorio YMYL igual que hablar de salud: el sitio no
    // puede acreditar quién lo firma. Las fichas ahora describen el simbolismo
    // en vez de garantizar el resultado.
    table: 'encyclopedia_tarot_cards',
    columns: ['meaning_upright'],
    replacements: [
      [
        'En el trabajo, promete el crecimiento exuberante de tus proyectos, prosperidad financiera y éxito creativo sin precedentes.',
        'En el trabajo, habla del crecimiento exuberante de tus proyectos, de abundancia material y de un empuje creativo poco común.',
      ],
      [
        'En el trabajo, es un augurio excelente para ascensos, emprendimientos con bases firmes, disciplina financiera y organización sistemática.',
        'En el trabajo, se asocia a los ascensos, a los emprendimientos con bases firmes, al orden en las cuentas y a la organización sistemática.',
      ],
      [
        'En el trabajo, garantiza resolución a favor en temas legales, firmas de contratos importantes y recompensas proporcionales a tu esfuerzo puro.',
        'En el trabajo, se asocia a los asuntos que se destraban, a las firmas de contratos importantes y a las recompensas proporcionales a tu esfuerzo.',
      ],
      [
        'En el trabajo, augura victorias contundentes, ambición bien canalizada, viajes de negocios y promociones merecidas.',
        'En el trabajo, habla de victorias contundentes, ambición bien canalizada, viajes de negocios y promociones merecidas.',
      ],
    ],
  },
  {
    table: 'birth_chart_interpretations',
    columns: ['content'],
    replacements: [
      [
        'cuidando la salud de tus vínculos',
        'cuidando la calidad de tus vínculos',
      ],
      [
        'canalizas tu energía física a través de la salud o la artesanía',
        'canalizas tu energía física a través del deporte o la artesanía',
      ],
      [
        'mejorando tus habilidades, cuidando tu salud y siendo útil',
        'mejorando tus habilidades, cuidando tu cuerpo y siendo útil',
      ],
      [
        'la disciplina se manifiesta en el trabajo, la salud y el servicio',
        'la disciplina se manifiesta en el trabajo, las rutinas y el servicio',
      ],
      [
        'revoluciona el trabajo, la salud y la vida cotidiana',
        'revoluciona el trabajo, los hábitos y la vida cotidiana',
      ],
      [
        'sea más libre, saludable y funcional para todos',
        'sea más libre, ligera y funcional para todos',
      ],
      [
        'busca la espiritualidad en el detalle, el servicio y la salud',
        'busca la espiritualidad en el detalle, el servicio y el cuidado',
      ],
      [
        'transformó el trabajo, la salud y el servicio',
        'transformó el trabajo, los hábitos y el servicio',
      ],
      [
        'el trabajo diario y la mejora de la salud',
        'el trabajo diario y la mejora de tus rutinas',
      ],
      [
        'adoptar un estilo de vida saludable ejemplar',
        'adoptar un estilo de vida ejemplarmente ordenado',
      ],
      // Media señal clínica que quedaba en pie en el mismo párrafo que ya se
      // reescribió (Neptuno en Casa 6).
      [
        'El desafío es el caos en la rutina diaria y el diagnóstico difícil de enfermedades.',
        'El desafío es el caos en la rutina diaria y las señales confusas que te manda el cuerpo.',
      ],
      [
        'trabajar en instituciones de salud, dedicarte a la meditación',
        'trabajar en instituciones de ayuda, dedicarte a la meditación',
      ],
      [
        'vincula tus emociones con tu salud y tu rutina diaria',
        'vincula tus emociones con tu cuerpo y tu rutina diaria',
      ],
      [
        'trabajar en áreas de salud y bienestar',
        'trabajar en áreas de cuidado y bienestar',
      ],
      [
        'Te interesan los temas de salud, higiene y eficiencia',
        'Te interesan los temas de bienestar, higiene y eficiencia',
      ],
      [
        'paseos estéticos por tu barrio saludando a todos',
        'paseos estéticos por tu barrio charlando con todos',
      ],
      [
        'rituales de belleza y salud que sean placenteros',
        'rituales de belleza y cuidado que sean placenteros',
      ],
      [
        'Tu salud se beneficia del equilibrio y la paz mental',
        'Tu bienestar se beneficia del equilibrio y la paz mental',
      ],
      [
        'disfrutar cocinando comidas saludables y bonitas',
        'disfrutar cocinando comidas nutritivas y bonitas',
      ],
      [
        'Necesitas actividad física regular para mantener la salud',
        'Necesitas actividad física regular para mantener tu energía',
      ],
      [
        'Tienes una salud robusta, aunque debes cuidarte de los excesos',
        'Tienes una vitalidad robusta, aunque debes cuidarte de los excesos',
      ],
      [
        'trabajar en ONGs, salud o educación',
        'trabajar en ONGs, en tareas de cuidado o en educación',
      ],
      [
        'Puedes sufrir problemas de salud crónicos (huesos, piel, dientes) causados por el estrés y la autoexigencia.',
        'El estrés y la autoexigencia pueden pasarte factura en el cuerpo si no aflojas el ritmo.',
      ],
      [
        'gestionar tu salud con disciplina férrea',
        'gestionar tus rutinas con disciplina férrea',
      ],
      [
        'Tu salud puede sufrir por estrés nervioso; necesitas terapias alternativas.',
        'Tu energía puede resentirse por el estrés nervioso; necesitas enfoques alternativos.',
      ],
      [
        'Tu don es la innovación en procesos y salud.',
        'Tu don es la innovación en procesos y hábitos.',
      ],
      [
        'usar biohacking para mejorar tu salud',
        'usar biohacking para mejorar tu rendimiento',
      ],
      ['tu salud es psicosomática', 'tu cuerpo responde a lo emocional'],
      [
        'Tu salud está ligada a tus emociones reprimidas',
        'Tu energía está ligada a tus emociones reprimidas',
      ],
      [
        'Eres honesto y franco desde el primer saludo',
        'Eres honesto y franco desde el primer encuentro',
      ],
      [
        'ideal para desarrollar hábitos saludables y rutinas eficientes',
        'ideal para desarrollar hábitos sostenidos y rutinas eficientes',
      ],
    ],
  },
];

/** REPLACE por subcadena exacta; no toca las filas que no la contienen. */
async function replaceSubstring(
  queryRunner: QueryRunner,
  entry: CorpusReplacement,
  column: string,
  from: string,
  to: string,
): Promise<void> {
  const anclaSlug = entry.slug === undefined ? '' : ' AND "slug" = $3';
  const params = entry.slug === undefined ? [from, to] : [from, to, entry.slug];

  await queryRunner.query(
    `UPDATE "${entry.table}"
     SET "${column}" = REPLACE("${column}", $1, $2)
     WHERE POSITION($1 IN "${column}") > 0${anclaSlug}`,
    params,
  );
}

export class ReplaceSaludWordingInSeededCorpus1787583600000 implements MigrationInterface {
  name = 'ReplaceSaludWordingInSeededCorpus1787583600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const entry of CORPUS_REPLACEMENTS) {
      for (const column of entry.columns) {
        for (const [from, to] of entry.replacements) {
          await replaceSubstring(queryRunner, entry, column, from, to);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const entry of [...CORPUS_REPLACEMENTS].reverse()) {
      for (const column of [...entry.columns].reverse()) {
        for (const [from, to] of [...entry.replacements].reverse()) {
          await replaceSubstring(queryRunner, entry, column, to, from);
        }
      }
    }
  }
}
