import * as fs from 'fs';
import * as path from 'path';
import { QueryRunner } from 'typeorm';
import {
  CORPUS_REPLACEMENTS,
  CorpusReplacement,
  ReplaceDeterministicWordingInSeededCorpus1789171200000,
} from '../migrations/1789171200000-ReplaceDeterministicWordingInSeededCorpus';

/**
 * ⚠️ Este spec vive en `seeds/` y NO en `migrations/`: el glob de TypeORM
 * (`database/migrations/*{.ts,.js}`) carga TODO lo que haya en esa carpeta, así
 * que un `.spec.ts` ahí adentro rompe el CLI de migraciones y el arranque de la
 * app (`migrationsRun: true`) con "describe is not defined".
 *
 * La migración de datos de T-SEO-018 y los archivos de seed tienen que decir lo
 * mismo: si divergen, una base nueva (sembrada) y una base migrada terminan con
 * textos distintos, y el bug no se nota hasta que alguien lee la página.
 *
 * Este test ata las dos puntas: por cada par [viejo, nuevo] verifica que el
 * texto NUEVO ya está en el seed y que el VIEJO ya no está. Es el mismo
 * contrato que `salud-wording-sync.spec.ts` (T-SEO-013).
 */

const SRC = path.join(__dirname, '..', '..');

/** Qué archivos de seed alimentan cada tabla que toca la migración. */
const SEED_SOURCES: Record<string, string[]> = {
  birth_chart_interpretations: [
    'database/seeds/birth-chart/02-planets-in-signs.md',
    'database/seeds/birth-chart/03-planets-in-houses.md',
    'database/seeds/birth-chart/04-ascendant-in-signs.md',
    'database/seeds/birth-chart/05-aspects.md',
  ],
  // `dailyFreeUpright`/`dailyFreeReversed` los escribe otro seeder sobre la
  // misma tabla: van los dos archivos.
  tarot_card: [
    'database/seeds/data/tarot-cards.data.ts',
    'modules/tarot/cards/seeds/daily-free-interpretations.data.ts',
  ],
  card_free_interpretation: [
    'modules/tarot/cards/seeds/card-free-interpretations.data.ts',
  ],
  holistic_services: ['database/seeds/holistic-services.seeder.ts'],
  // Los archivos que componen `ALL_ARTICLES_DATA` (`articles-seed.data.ts`).
  encyclopedia_articles: [
    'modules/encyclopedia/data/zodiac-signs.data.ts',
    'modules/encyclopedia/data/planets.data.ts',
    'modules/encyclopedia/data/astrological-houses.data.ts',
    'modules/encyclopedia/data/elements-modalities.data.ts',
    'modules/encyclopedia/data/activity-guides.data.ts',
  ],
  // Significados base (T-SEO-009) + las 7 secciones extendidas por palo.
  encyclopedia_tarot_cards: [
    'modules/encyclopedia/data/major-arcana.data.ts',
    'modules/encyclopedia/data/minor-arcana.data.ts',
    'modules/encyclopedia/data/extended/major-arcana-extended.data.ts',
    'modules/encyclopedia/data/extended/cups-extended.data.ts',
    'modules/encyclopedia/data/extended/pentacles-extended.data.ts',
    'modules/encyclopedia/data/extended/swords-extended.data.ts',
    'modules/encyclopedia/data/extended/wands-extended.data.ts',
  ],
};

function readSeed(table: string): string {
  const files = SEED_SOURCES[table];
  if (!files) throw new Error(`Falta el seed de la tabla "${table}"`);
  return files
    .map((rel) => fs.readFileSync(path.join(SRC, rel), 'utf8'))
    .join('\n');
}

/**
 * Los pares de columnas `jsonb` se escriben como se ven en `col::text` (con
 * comillas dobles); en el seed TS el mismo token va entre comillas simples.
 */
function comoEnElSeed(texto: string): string {
  return texto.replace(/^"(.*)"$/, '$1');
}

describe('ReplaceDeterministicWordingInSeededCorpus (T-SEO-018)', () => {
  it('cubre todas las tablas con un seed conocido', () => {
    const sinFuente = CORPUS_REPLACEMENTS.map(
      (entry: CorpusReplacement) => entry.table,
    ).filter((table) => !SEED_SOURCES[table]);

    expect(sinFuente).toEqual([]);
  });

  it('cada entrada declara al menos una columna', () => {
    const vacias = CORPUS_REPLACEMENTS.filter(
      (entry) => !entry.columns?.length && !entry.jsonbColumns?.length,
    ).map((entry) => entry.table);

    expect(vacias).toEqual([]);
  });

  it('deja el texto nuevo en los archivos de seed', () => {
    const faltantes: string[] = [];

    CORPUS_REPLACEMENTS.forEach((entry) => {
      const seed = readSeed(entry.table);
      entry.replacements.forEach(([, nuevo]) => {
        if (!seed.includes(comoEnElSeed(nuevo)))
          faltantes.push(`${entry.table}: "${nuevo}"`);
      });
    });

    expect(faltantes).toEqual([]);
  });

  it('no deja el texto viejo en los archivos de seed', () => {
    const sobrantes: string[] = [];

    CORPUS_REPLACEMENTS.forEach((entry) => {
      const seed = readSeed(entry.table);
      entry.replacements.forEach(([viejo]) => {
        if (seed.includes(comoEnElSeed(viejo)))
          sobrantes.push(`${entry.table}: "${viejo}"`);
      });
    });

    expect(sobrantes).toEqual([]);
  });

  it('no repite el mismo texto viejo dos veces dentro de una tabla sin ancla', () => {
    const duplicados: string[] = [];
    const vistos = new Map<string, Set<string>>();

    CORPUS_REPLACEMENTS.filter((entry) => entry.slug === undefined).forEach(
      (entry) => {
        const set = vistos.get(entry.table) ?? new Set<string>();
        entry.replacements.forEach(([viejo]) => {
          if (set.has(viejo)) duplicados.push(`${entry.table}: "${viejo}"`);
          set.add(viejo);
        });
        vistos.set(entry.table, set);
      },
    );

    expect(duplicados).toEqual([]);
  });

  it('reemplaza texto que efectivamente contenía una señal YMYL', () => {
    /** Las cuatro familias de T-SEO-018 (ver `no-salud-user-facing.spec.ts`). */
    const SENAL_YMYL =
      /sana|cura|advertencia|peligro|garanti|amarre|endulzamiento|infalible|nadie te dice/i;

    const sinSenal = CORPUS_REPLACEMENTS.flatMap((entry) =>
      entry.replacements
        .filter(([viejo]) => !SENAL_YMYL.test(viejo))
        .map(([viejo]) => `${entry.table}: "${viejo}"`),
    );

    expect(sinSenal).toEqual([]);
  });

  it('no reintroduce un término prohibido en el texto nuevo', () => {
    const PROHIBIDO = /salud|\bsana\w*|\bcura\w*|advertencia|peligro|garanti/i;

    const reincidentes = CORPUS_REPLACEMENTS.flatMap((entry) =>
      entry.replacements
        .filter(([, nuevo]) => PROHIBIDO.test(nuevo))
        .map(([, nuevo]) => `${entry.table}: "${nuevo}"`),
    );

    expect(reincidentes).toEqual([]);
  });

  it('ancla por slug los reemplazos de palabras clave (jsonb de una palabra)', () => {
    const sinAncla = CORPUS_REPLACEMENTS.filter(
      (entry) =>
        entry.jsonbColumns?.includes('keywords') && entry.slug === undefined,
    ).map((entry) => entry.table);

    expect(sinAncla).toEqual([]);
  });
});

/**
 * Sin base de datos a mano, lo que se puede fijar es el SQL que la migración
 * emite: que las columnas `jsonb` se reemplacen sobre `::text` y se recasteen,
 * que las palabras clave vayan ancladas por `slug`, y que `down` deshaga
 * exactamente lo que `up` hizo, en orden inverso.
 */
describe('ReplaceDeterministicWordingInSeededCorpus — SQL emitido', () => {
  type Llamada = { sql: string; params: unknown[] };

  async function correr(direction: 'up' | 'down'): Promise<Llamada[]> {
    const llamadas: Llamada[] = [];
    const queryRunner = {
      query: jest.fn((sql: string, params: unknown[]) => {
        llamadas.push({ sql: sql.replace(/\s+/g, ' '), params });
        return Promise.resolve([]);
      }),
    } as unknown as QueryRunner;
    const migracion =
      new ReplaceDeterministicWordingInSeededCorpus1789171200000();
    await migracion[direction](queryRunner);
    return llamadas;
  }

  it('emite un UPDATE por (columna, par), parametrizado y acotado por POSITION', async () => {
    const llamadas = await correr('up');
    const esperadas = CORPUS_REPLACEMENTS.reduce(
      (total, entry) =>
        total +
        ((entry.columns?.length ?? 0) + (entry.jsonbColumns?.length ?? 0)) *
          entry.replacements.length,
      0,
    );

    expect(llamadas).toHaveLength(esperadas);
    llamadas.forEach(({ sql, params }) => {
      expect(sql).toMatch(/^UPDATE "[a-z_]+" SET "[A-Za-z_]+" = REPLACE\(/);
      expect(sql).toContain('WHERE POSITION($1 IN');
      expect(sql).not.toMatch(/'[^']*(sana|advertencia|peligro)[^']*'/i);
      expect(params.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('las columnas jsonb se reemplazan sobre ::text y se recastean', async () => {
    const llamadas = await correr('up');
    const jsonb = llamadas.filter(({ sql }) => sql.includes('::jsonb'));

    expect(jsonb.length).toBeGreaterThan(0);
    jsonb.forEach(({ sql }) => {
      expect(sql).toMatch(
        /SET "(keywords|combinations)" = REPLACE\("(keywords|combinations)"::text, \$1, \$2\)::jsonb WHERE POSITION\(\$1 IN "(keywords|combinations)"::text\) > 0/,
      );
    });
  });

  it('las palabras clave van ancladas por slug con un tercer parámetro', async () => {
    const llamadas = await correr('up');
    // `tarot_card.keywords` es texto plano; acá interesan las jsonb de la enciclopedia.
    const keywords = llamadas.filter(({ sql }) =>
      sql.includes('"keywords"::text'),
    );

    expect(keywords.length).toBe(4);
    keywords.forEach(({ sql, params }) => {
      expect(sql).toContain('AND "slug" = $3');
      expect(params).toHaveLength(3);
      expect(params[0]).toBe('"sanación"');
      expect(typeof params[2]).toBe('string');
    });
    expect(new Set(keywords.map(({ params }) => params[2])).size).toBe(4);
  });

  it('down invierte cada par y recorre en orden inverso', async () => {
    const up = await correr('up');
    const down = await correr('down');

    expect(down).toHaveLength(up.length);
    up.forEach(({ sql, params }, i) => {
      const espejo = down[down.length - 1 - i];
      expect(espejo.sql).toBe(sql);
      expect(espejo.params[0]).toBe(params[1]);
      expect(espejo.params[1]).toBe(params[0]);
      expect(espejo.params[2]).toBe(params[2]);
    });
  });
});
