import { YMYL_LANGUAGE_RULES } from './ymyl-language.prompt';

describe('YMYL_LANGUAGE_RULES (T-SEO-018)', () => {
  it('prohíbe explícitamente cada familia de lenguaje determinista', () => {
    // Una por familia del alcance de la tarea: promesa, salud, dinero/legal, miedo.
    expect(YMYL_LANGUAGE_RULES).toMatch(/Nunca prometas resultados/);
    expect(YMYL_LANGUAGE_RULES).toMatch(/"garantizado"/);
    expect(YMYL_LANGUAGE_RULES).toMatch(/"predicción exacta"/);
    expect(YMYL_LANGUAGE_RULES).toMatch(/amarres ni endulzamientos/);
    expect(YMYL_LANGUAGE_RULES).toMatch(/Nunca uses vocabulario médico/);
    expect(YMYL_LANGUAGE_RULES).toMatch(
      /"curar", "sanar", "sanación", "sanador"/,
    );
    expect(YMYL_LANGUAGE_RULES).toMatch(/cuándo invertir/);
    expect(YMYL_LANGUAGE_RULES).toMatch(/resultado de un juicio/);
    expect(YMYL_LANGUAGE_RULES).toMatch(/Nunca uses lenguaje de miedo/);
    expect(YMYL_LANGUAGE_RULES).toMatch(/"advertencia", "peligro"/);
  });

  it('ofrece la alternativa, no solo la prohibición', () => {
    expect(YMYL_LANGUAGE_RULES).toMatch(
      /"sugiere", "invita a", "puede indicar"/,
    );
    expect(YMYL_LANGUAGE_RULES).toMatch(
      /acompañamiento, reflexión y autoconocimiento/,
    );
    expect(YMYL_LANGUAGE_RULES).toMatch(/tensión o un desafío/);
  });

  it('es una sola pieza de texto sin markdown ni JSON que rompa los formatos de salida', () => {
    expect(YMYL_LANGUAGE_RULES).not.toMatch(/[{}#`]/);
    expect(YMYL_LANGUAGE_RULES.startsWith('REGLAS DE LENGUAJE')).toBe(true);
  });
});
