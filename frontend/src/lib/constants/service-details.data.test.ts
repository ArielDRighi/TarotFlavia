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
 * Vocabulario clínico. Misma lista que el corpus del backend
 * (`no-salud-user-facing.spec.ts`, T-SEO-013), más `salud`, que en el frontend
 * ya cubre `src/no-salud-user-facing.test.ts` pero conviene tener acá al lado
 * del texto que protege.
 */
const VOCABULARIO_CLINICO =
  /\b(salud|enfermedad|enfermedades|diagn[óo]stic\w*|tratamient\w*|s[íi]ntoma\w*|medicament\w*|m[ée]dic\w*|dolenci\w*|patolog[íi]\w*|remedi\w*|receta\w*|cur(a|ar|ación)\w*|terap[ée]utic\w*)\b/i;

/** Verbo de promesa cruzado con vocabulario económico o legal (T-SEO-013). */
const VERBO_DE_PROMESA = /\b(garanti\w*|augur\w*|asegur\w*)\b/i;
const VOCABULARIO_ECONOMICO_LEGAL =
  /\b(dinero|econ[óo]mic\w*|financier\w*|ingres\w*|deuda\w*|juicio\w*|legal\w*|herencia\w*|deman\w*|sentenci\w*)\b/i;

function oraciones(texto: string): string[] {
  return texto.split(/(?<=[.!?])\s+/);
}

function textoDe(content: ServiceDetailContent): string[] {
  return getServiceEditorialParagraphs(content);
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
    const hits = [...textoDe(SERVICE_DETAILS[slug]), SERVICE_DETAILS[slug].disclaimer]
      .flatMap(oraciones)
      .filter(
        (oracion) => VERBO_DE_PROMESA.test(oracion) && VOCABULARIO_ECONOMICO_LEGAL.test(oracion)
      );

    expect(hits).toEqual([]);
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
