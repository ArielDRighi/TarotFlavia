import { describe, it, expect } from 'vitest';

import {
  SERVICE_DETAILS,
  MIN_SERVICE_EDITORIAL_WORDS,
  SERVICE_DETAIL_SLUGS,
  getServiceEditorialContent,
  getServiceEditorialWordCount,
  getServiceEditorialParagraphs,
  type ServiceDetailContent,
  type ServiceDetailSlug,
} from './service-details.data';

/**
 * Guardarraíl de contenido de las fichas de servicio (T-SEO-012).
 *
 * Mismo criterio que `listing-intros.data.test.ts` y
 * `chinese-zodiac-profiles.data.test.ts`: si alguien recorta el texto, se entera
 * acá y no en el próximo rechazo de AdSense.
 *
 * El segundo bloque de tests es el que importa de verdad en esta tarea: las
 * fichas de servicio son las páginas **comerciales** del sitio y
 * `limpiezas-energeticas` es la más expuesta a prometer un efecto terapéutico.
 * Por eso el vocabulario clínico está prohibido en todo el contenido salvo en el
 * `disclaimer`, que existe justamente para nombrar lo que la sesión NO es.
 */

const SLUGS = Object.keys(SERVICE_DETAILS) as ServiceDetailSlug[];

/**
 * Vocabulario clínico.
 *
 * ⚠️ **No existe en el backend.** El guardarraíl de T-SEO-013
 * (`no-salud-user-facing.spec.ts`) escanea una sola palabra, `salud`, porque su
 * criterio de aceptación era literalmente un `grep -i salud` sobre el HTML
 * servido. Esta lista es propia de T-SEO-012 y existe porque las fichas de
 * servicio son las páginas comerciales del sitio: `limpiezas-energeticas` es la
 * más expuesta a prometer un efecto terapéutico, y ahí `salud` sola no alcanza.
 *
 * `sanar` y `sanación` quedan **fuera a propósito**: son vocabulario estándar
 * del rubro y describen la práctica, no un desenlace clínico. Es el mismo
 * criterio con el que T-SEO-013 dejó `promete` fuera de la lista de promesas.
 *
 * ⚠️ `cur` va con las terminaciones enumeradas y no como `cur\w*`: esa versión
 * marcaba *curiosidad*, *curso* y *curva*. Un guardarraíl con falsos positivos
 * se termina relajando, y relajado no sirve para nada.
 */
const VOCABULARIO_CLINICO =
  /\b(salud|enferm\w*|diagn[óo]stic\w*|tratamient\w*|s[íi]ntoma\w*|medicament\w*|m[ée]dic\w*|dolenci\w*|patolog[íi]\w*|remedi\w*|receta\w*|cur(a|as|an|ar|ás|é|ó|aba|ando|ad[oa]s?|aci[óo]n|aciones|ativ[oa]s?)|terap\w*|psic[oó]log\w*|psiqui[áa]tr\w*)\b/i;

/**
 * Verbo de promesa cruzado con vocabulario económico o legal.
 *
 * La lista económica es la del backend (`no-salud-user-facing.spec.ts`, T-SEO-013)
 * **tal cual**, más `herencia`, `demanda` y `sentencia`, que en fichas de árbol
 * genealógico y de limpiezas aparecen con más facilidad que en el corpus de
 * tarot. `negocio` viene de esa lista y es el término que más importa acá: la
 * ficha de limpiezas habla de locales y emprendimientos.
 */
const VERBO_DE_PROMESA = /\b(garanti\w*|augur\w*|asegur\w*)\b/i;
const VOCABULARIO_ECONOMICO_LEGAL =
  /\b(financier\w*|econ[oó]mic\w*|dinero|finanzas|inversi[oó]n\w*|inversiones|contrato\w*|legal\w*|juicio\w*|deuda\w*|ingresos?|sueldo\w*|salario\w*|prosperidad|ganancias?|capital|patrimonio|laboral\w*|negocios?|ascensos?|promoci[oó]n\w*|promociones|herencia\w*|deman\w*|sentenci\w*)\b/i;

function oraciones(texto: string): string[] {
  return texto.split(/(?<=[.!?])\s+/);
}

function textoDe(content: ServiceDetailContent): string[] {
  return getServiceEditorialParagraphs(content);
}

/** Oraciones que cruzan un verbo de promesa con vocabulario económico o legal. */
function promesasDe(content: ServiceDetailContent): string[] {
  return [...textoDe(content), content.disclaimer]
    .flatMap(oraciones)
    .filter(
      (oracion) => VERBO_DE_PROMESA.test(oracion) && VOCABULARIO_ECONOMICO_LEGAL.test(oracion)
    );
}

describe('SERVICE_DETAILS', () => {
  it('cubre exactamente los servicios sembrados del catálogo', () => {
    expect([...SLUGS].sort()).toEqual([...SERVICE_DETAIL_SLUGS].sort());
  });

  it.each(SERVICE_DETAIL_SLUGS)(
    '%s aporta al menos MIN_SERVICE_EDITORIAL_WORDS palabras propias',
    (slug) => {
      expect(getServiceEditorialWordCount(SERVICE_DETAILS[slug])).toBeGreaterThanOrEqual(
        MIN_SERVICE_EDITORIAL_WORDS
      );
    }
  );

  it.each(SERVICE_DETAIL_SLUGS)('%s trae la estructura completa que pide la tarea', (slug) => {
    const content = SERVICE_DETAILS[slug];

    expect(content.title.trim().length).toBeGreaterThan(0);
    expect(content.lead.trim().length).toBeGreaterThan(0);
    // En qué consiste, cómo se prepara, durante, después, para quién sí y no.
    expect(content.sections.length).toBeGreaterThanOrEqual(5);
    expect(content.faq.length).toBeGreaterThanOrEqual(3);
    expect(content.disclaimer.trim().length).toBeGreaterThan(0);

    content.sections.forEach((section) => {
      expect(section.heading.trim().length).toBeGreaterThan(0);
      expect(section.body.trim().length).toBeGreaterThan(0);
    });
    content.faq.forEach((item) => {
      expect(item.question.trim().endsWith('?')).toBe(true);
      expect(item.answer.trim().length).toBeGreaterThan(0);
    });
  });

  it('⚠️ no repite títulos entre servicios: dos URLs con el mismo texto son duplicadas', () => {
    const titulos = SLUGS.map((slug) => SERVICE_DETAILS[slug].title);

    expect(new Set(titulos).size).toBe(titulos.length);
  });

  it('⚠️ no repite ningún párrafo entre servicios', () => {
    const parrafos = SLUGS.flatMap((slug) => textoDe(SERVICE_DETAILS[slug]));

    expect(new Set(parrafos).size).toBe(parrafos.length);
  });

  it('no repite ninguna pregunta frecuente entre servicios', () => {
    const preguntas = SLUGS.flatMap((slug) =>
      SERVICE_DETAILS[slug].faq.map((item) => item.question)
    );

    expect(new Set(preguntas).size).toBe(preguntas.length);
  });
});

describe('SERVICE_DETAILS — guardarraíl YMYL', () => {
  it.each(SERVICE_DETAIL_SLUGS)('%s no usa vocabulario clínico fuera del disclaimer', (slug) => {
    const hits = textoDe(SERVICE_DETAILS[slug]).filter((parrafo) =>
      VOCABULARIO_CLINICO.test(parrafo)
    );

    expect(hits).toEqual([]);
  });

  it.each(SERVICE_DETAIL_SLUGS)(
    '%s declara explícitamente lo que la sesión no reemplaza',
    (slug) => {
      // El disclaimer es el único lugar donde nombrar la medicina está permitido:
      // es una afirmación **negativa**, que es lo que protege. Mismo criterio con
      // el que T-SEO-013 dejó intactas las instrucciones "NO uses…" de los prompts.
      expect(SERVICE_DETAILS[slug].disclaimer).toMatch(/\bno\b/i);
      expect(SERVICE_DETAILS[slug].disclaimer).toMatch(/(reemplaza|sustituye)/i);
    }
  );

  it.each(SERVICE_DETAIL_SLUGS)('%s no promete un desenlace económico ni legal', (slug) => {
    expect(promesasDe(SERVICE_DETAILS[slug])).toEqual([]);
  });

  /**
   * Los dos guardarraíles de arriba afirman una lista vacía, así que un regex
   * que no matchea nada los deja en verde para siempre. Estos dos casos son los
   * que impiden que pasen por construcción: si alguien recorta la lista, acá se
   * entera.
   */
  describe('los guardarraíles miden de verdad', () => {
    it('detecta vocabulario clínico si alguien lo mete en una sección', () => {
      const roto: ServiceDetailContent = {
        ...SERVICE_DETAILS['limpiezas-energeticas'],
        lead: 'La sesión alivia los síntomas de tu enfermedad sin tratamiento médico.',
      };

      expect(textoDe(roto).filter((parrafo) => VOCABULARIO_CLINICO.test(parrafo))).not.toEqual([]);
    });

    it('detecta la palabra que el disclaimer sí puede usar cuando aparece fuera de él', () => {
      const roto: ServiceDetailContent = {
        ...SERVICE_DETAILS['pendulo-hebreo'],
        lead: 'Es una terapia de acompañamiento psicológico.',
      };

      expect(textoDe(roto).filter((parrafo) => VOCABULARIO_CLINICO.test(parrafo))).not.toEqual([]);
    });

    it('detecta una promesa de desenlace económico', () => {
      const roto: ServiceDetailContent = {
        ...SERVICE_DETAILS['limpiezas-energeticas'],
        lead: 'La limpieza garantiza que el negocio recupere sus ingresos.',
      };

      expect(promesasDe(roto)).not.toEqual([]);
    });

    it('no confunde una promesa sin desenlace económico con una infracción', () => {
      const sano: ServiceDetailContent = {
        ...SERVICE_DETAILS['limpiezas-energeticas'],
        lead: 'Nadie te asegura que el lugar se sienta distinto el mismo día.',
      };

      expect(promesasDe(sano)).toEqual([]);
    });
  });
});

describe('getServiceEditorialWordCount', () => {
  const content: ServiceDetailContent = {
    title: 'Título de prueba',
    lead: 'una dos tres',
    sections: [{ heading: 'Encabezado', body: 'cuatro cinco' }],
    faq: [{ question: '¿Seis?', answer: 'siete ocho' }],
    disclaimer: 'nueve',
  };

  it('suma lead, cuerpo de secciones, respuestas y disclaimer', () => {
    expect(getServiceEditorialWordCount(content)).toBe(8);
  });

  it('no cuenta los encabezados, las preguntas ni los espacios de más', () => {
    expect(getServiceEditorialWordCount({ ...content, lead: '  una   dos    tres  ' })).toBe(8);
  });
});

describe('getServiceEditorialContent', () => {
  it.each(SERVICE_DETAIL_SLUGS)('devuelve el bloque de %s', (slug) => {
    expect(getServiceEditorialContent(slug)).toBe(SERVICE_DETAILS[slug]);
  });

  it('devuelve undefined para un servicio creado desde el admin', () => {
    expect(getServiceEditorialContent('registros-akashicos')).toBeUndefined();
  });

  it('no confunde una propiedad heredada de Object con un servicio', () => {
    expect(getServiceEditorialContent('constructor')).toBeUndefined();
    expect(getServiceEditorialContent('toString')).toBeUndefined();
  });
});
