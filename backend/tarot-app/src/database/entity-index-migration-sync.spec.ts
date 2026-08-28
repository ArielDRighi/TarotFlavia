import * as fs from 'fs';
import * as path from 'path';
import { QueryRunner } from 'typeorm';
import { AddSessionMetricsIndexes1787832000000 } from './migrations/1787832000000-AddSessionMetricsIndexes';

/**
 * ⚠️ Este spec vive en `database/` y NO en `database/migrations/`: el glob de
 * TypeORM (`database/migrations/*{.ts,.js}`) carga TODO lo que haya en esa
 * carpeta, así que un `.spec.ts` ahí adentro rompe el CLI de migraciones y el
 * arranque de la app (`migrationsRun: true`) con "describe is not defined".
 *
 * Con `synchronize: false` —que es lo correcto— un `@Index('nombre', ...)` en
 * una entidad **no crea nada**: es documentación que no se ejecuta. Si ninguna
 * migración lo crea, el índice no existe en ninguna base (ni dev, ni staging,
 * ni producción) y el decorador miente.
 *
 * Eso fue T-DEUDA-002: cinco índices declarados y cero creados. Dos eran
 * índices compuestos de performance sobre `sessions` (se crearon en la
 * migración `AddSessionMetricsIndexes`) y tres eran `UNIQUE` sobre columnas que
 * ya tenían un constraint `UNIQUE` propio —o sea, índices duplicados: escritura
 * extra en cada INSERT sin ningún beneficio de lectura— y se borraron de las
 * entidades.
 *
 * Este test ata las dos puntas para que no vuelva a pasar: por cada `@Index`
 * con nombre explícito, alguna migración tiene que **crearlo**.
 */

const SRC = path.join(__dirname, '..');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/** Índices declarados con nombre explícito: `@Index('idx_algo', ...)`. */
const NAMED_INDEX_REGEX = /@Index\(\s*'([a-zA-Z0-9_]+)'/g;

/**
 * Cuántos `@Index` con nombre hay hoy. Es un canario contra un regex roto: sin
 * esto, un scanner que no encuentra nada dejaría el test de abajo en verde sin
 * haber verificado nada. Medido el 27-ago-2026: **48**. Si este número baja,
 * revisar a mano si se borraron decoradores o si se rompió el escaneo.
 */
const INDICES_CON_NOMBRE_ESPERADOS = 45;

interface DeclaredIndex {
  name: string;
  file: string;
}

function listFiles(dir: string, suffix: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full, suffix);
    return entry.isFile() && entry.name.endsWith(suffix) ? [full] : [];
  });
}

/**
 * Saca comentarios de bloque y de línea. Sin esto, un `@Index` comentado en una
 * entidad exigiría una migración para un decorador que no existe, y —peor— el
 * docblock de una migración que *nombra* un índice alcanzaría para dar por
 * creado un `CREATE INDEX` que alguien borró.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function collectDeclaredIndexes(): DeclaredIndex[] {
  return listFiles(SRC, '.entity.ts').flatMap((file) => {
    const content = stripComments(fs.readFileSync(file, 'utf8'));
    const names: DeclaredIndex[] = [];
    for (const match of content.matchAll(NAMED_INDEX_REGEX)) {
      names.push({ name: match[1], file: path.relative(SRC, file) });
    }
    return names;
  });
}

function readMigrations(): string {
  return listFiles(MIGRATIONS_DIR, '.ts')
    .map((file) => stripComments(fs.readFileSync(file, 'utf8')))
    .join('\n');
}

/**
 * Una migración crea un índice de dos formas en este repo: SQL crudo
 * (`CREATE INDEX "nombre" ON ...`) o la API de TypeORM
 * (`new TableIndex({ name: 'nombre', ... })`). Las dos cuentan.
 *
 * El lookahead final evita el falso verde por prefijo: `idx_birth_chart_user`
 * NO puede darse por creado porque exista `idx_birth_chart_user_birth`.
 */
function creaElIndice(migrationsSource: string, name: string): boolean {
  const noEsPrefijo = '(?![A-Za-z0-9_])';
  const sqlCrudo = `CREATE\\s+(?:UNIQUE\\s+)?INDEX\\s+(?:CONCURRENTLY\\s+)?(?:IF\\s+NOT\\s+EXISTS\\s+)?"?${name}${noEsPrefijo}`;
  const apiTypeorm = `name:\\s*['"]${name}['"]`;

  return new RegExp(`${sqlCrudo}|${apiTypeorm}`).test(migrationsSource);
}

describe('Sincronía entre los @Index de las entidades y las migraciones (T-DEUDA-002)', () => {
  const declared = collectDeclaredIndexes();
  const migrationsSource = readMigrations();

  it('encuentra los índices con nombre declarados en las entidades', () => {
    expect(declared.length).toBeGreaterThanOrEqual(
      INDICES_CON_NOMBRE_ESPERADOS,
    );
  });

  it('crea en una migración todos los índices que las entidades declaran', () => {
    const huerfanos = declared.filter(
      (index) => !creaElIndice(migrationsSource, index.name),
    );

    expect(huerfanos.map((index) => `${index.name} (${index.file})`)).toEqual(
      [],
    );
  });
});

describe('AddSessionMetricsIndexes (T-DEUDA-002)', () => {
  /**
   * El orden de las columnas es el punto de la tarea: todo el beneficio medido
   * (11×–24× en las queries de métricas) viene de que las igualdades van
   * primero y el rango sobre `completed_at` al final. Invertirlas lo tira.
   */
  const INDEXES: { name: string; columnas: string }[] = [
    {
      name: 'idx_session_completed_at_status',
      columnas: '("status", "completed_at")',
    },
    {
      name: 'idx_session_tarotista_completed',
      columnas: '("tarotista_id", "status", "completed_at")',
    },
  ];

  async function runMigration(direction: 'up' | 'down'): Promise<string[]> {
    const sentencias: string[] = [];
    const queryRunner = {
      query: jest.fn((sql: string) => {
        sentencias.push(sql);
        return Promise.resolve();
      }),
    } as unknown as QueryRunner;

    const migration = new AddSessionMetricsIndexes1787832000000();
    await (direction === 'up'
      ? migration.up(queryRunner)
      : migration.down(queryRunner));

    return sentencias;
  }

  /** Normaliza los saltos de línea del template literal para poder asertar. */
  function buscar(sentencias: string[], name: string): string | undefined {
    return sentencias
      .map((sql) => sql.replace(/\s+/g, ' ').trim())
      .find((sql) => sql.includes(name));
  }

  it('crea los dos índices de métricas con IF NOT EXISTS y en el orden de columnas correcto', async () => {
    const sentencias = await runMigration('up');

    expect(sentencias).toHaveLength(INDEXES.length);
    for (const { name, columnas } of INDEXES) {
      const sentencia = buscar(sentencias, name);
      expect(sentencia).toBeDefined();
      expect(sentencia).toContain('CREATE INDEX IF NOT EXISTS');
      expect(sentencia).toContain('ON "sessions"');
      expect(sentencia).toContain(columnas);
    }
  });

  it('es reversible: down() borra los dos índices que crea up()', async () => {
    const sentencias = await runMigration('down');

    expect(sentencias).toHaveLength(INDEXES.length);
    for (const { name } of INDEXES) {
      const sentencia = buscar(sentencias, name);
      expect(sentencia).toBeDefined();
      expect(sentencia).toContain('DROP INDEX IF EXISTS');
    }
  });
});
