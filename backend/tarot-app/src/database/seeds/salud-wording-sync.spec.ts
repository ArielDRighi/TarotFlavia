import * as fs from 'fs';
import * as path from 'path';
import {
  CORPUS_REPLACEMENTS,
  CorpusReplacement,
} from '../migrations/1787583600000-ReplaceSaludWordingInSeededCorpus';

/**
 * ⚠️ Este spec vive en `seeds/` y NO en `migrations/`: el glob de TypeORM
 * (`database/migrations/*{.ts,.js}`) carga TODO lo que haya en esa carpeta, así
 * que un `.spec.ts` ahí adentro rompe el CLI de migraciones y el arranque de la
 * app (`migrationsRun: true`) con "describe is not defined".
 *
 * La migración de datos de T-SEO-013 y los archivos de seed tienen que decir lo
 * mismo: si divergen, una base nueva (sembrada) y una base migrada terminan con
 * textos distintos, y el bug no se nota hasta que alguien lee la página.
 *
 * Este test ata las dos puntas: por cada par [viejo, nuevo] verifica que el
 * texto NUEVO ya está en el seed y que el VIEJO ya no está.
 */

const SRC = path.join(__dirname, '..', '..');

/** Qué archivos de seed alimentan cada tabla que toca la migración. */
const SEED_SOURCES: Record<string, string[]> = {
  card_free_interpretation: [
    'modules/tarot/cards/seeds/card-free-interpretations.data.ts',
  ],
  reading_category: ['database/seeds/reading-categories.seeder.ts'],
  predefined_question: ['database/seeds/data/predefined-questions.data.ts'],
  tarot_card: ['database/seeds/data/tarot-cards.data.ts'],
  encyclopedia_articles: [
    'modules/encyclopedia/data/astrological-houses.data.ts',
    'modules/encyclopedia/data/activity-guides.data.ts',
  ],
  encyclopedia_tarot_cards: ['modules/encyclopedia/data/major-arcana.data.ts'],
  birth_chart_interpretations: [
    'database/seeds/birth-chart/02-planets-in-signs.md',
    'database/seeds/birth-chart/03-planets-in-houses.md',
    'database/seeds/birth-chart/04-ascendant-in-signs.md',
    'database/seeds/birth-chart/05-aspects.md',
  ],
};

function readSeed(table: string): string {
  const files = SEED_SOURCES[table];
  if (!files) throw new Error(`Falta el seed de la tabla "${table}"`);
  return files
    .map((rel) => fs.readFileSync(path.join(SRC, rel), 'utf8'))
    .join('\n');
}

describe('ReplaceSaludWordingInSeededCorpus (T-SEO-013)', () => {
  it('cubre todas las tablas con un seed conocido', () => {
    const sinFuente = CORPUS_REPLACEMENTS.map(
      (entry: CorpusReplacement) => entry.table,
    ).filter((table) => !SEED_SOURCES[table]);

    expect(sinFuente).toEqual([]);
  });

  it('deja el texto nuevo en los archivos de seed', () => {
    const faltantes: string[] = [];

    CORPUS_REPLACEMENTS.forEach((entry) => {
      const seed = readSeed(entry.table);
      entry.replacements.forEach(([, nuevo]) => {
        if (!seed.includes(nuevo)) faltantes.push(`${entry.table}: "${nuevo}"`);
      });
    });

    expect(faltantes).toEqual([]);
  });

  it('no deja el texto viejo en los archivos de seed', () => {
    const sobrantes: string[] = [];

    CORPUS_REPLACEMENTS.forEach((entry) => {
      const seed = readSeed(entry.table);
      entry.replacements.forEach(([viejo]) => {
        if (seed.includes(viejo)) sobrantes.push(`${entry.table}: "${viejo}"`);
      });
    });

    expect(sobrantes).toEqual([]);
  });

  it('no repite el mismo texto viejo dos veces dentro de una tabla', () => {
    const duplicados: string[] = [];

    CORPUS_REPLACEMENTS.forEach((entry) => {
      const vistos = new Set<string>();
      entry.replacements.forEach(([viejo]) => {
        if (vistos.has(viejo)) duplicados.push(`${entry.table}: "${viejo}"`);
        vistos.add(viejo);
      });
    });

    expect(duplicados).toEqual([]);
  });

  it('reemplaza texto que efectivamente contenía una señal YMYL', () => {
    /**
     * Señales YMYL: la palabra y sus derivados, el emoji de hospital (es señal
     * médica aunque no sea texto) y los verbos que prometen un resultado legal
     * o financiero concreto.
     */
    const SENAL_YMYL = /salud|enfermedad|🏥|promete|garantiza|augurio/i;

    const sinSenal = CORPUS_REPLACEMENTS.flatMap((entry) =>
      entry.replacements
        .filter(([viejo]) => !SENAL_YMYL.test(viejo))
        .map(([viejo]) => `${entry.table}: "${viejo}"`),
    );

    expect(sinSenal).toEqual([]);
  });

  it('no reintroduce el término prohibido en el texto nuevo', () => {
    const reincidentes = CORPUS_REPLACEMENTS.flatMap((entry) =>
      entry.replacements
        .filter(([, nuevo]) => /salud/i.test(nuevo))
        .map(([, nuevo]) => `${entry.table}: "${nuevo}"`),
    );

    expect(reincidentes).toEqual([]);
  });
});
