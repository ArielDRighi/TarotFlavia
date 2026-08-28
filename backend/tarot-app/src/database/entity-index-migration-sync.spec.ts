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
 * con nombre explícito, alguna migración tiene que nombrarlo.
 */

const SRC = path.join(__dirname, '..');
const MIGRATIONS_DIR = path.join(SRC, 'database', 'migrations');

/** Índices declarados con nombre explícito: `@Index('idx_algo', ...)`. */
const NAMED_INDEX_REGEX = /@Index\(\s*'([a-zA-Z0-9_]+)'/g;

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

function collectDeclaredIndexes(): DeclaredIndex[] {
  return listFiles(SRC, '.entity.ts').flatMap((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const names: DeclaredIndex[] = [];
    for (const match of content.matchAll(NAMED_INDEX_REGEX)) {
      names.push({ name: match[1], file: path.relative(SRC, file) });
    }
    return names;
  });
}

function readMigrations(): string {
  return listFiles(MIGRATIONS_DIR, '.ts')
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');
}

describe('Sincronía entre los @Index de las entidades y las migraciones (T-DEUDA-002)', () => {
  const declared = collectDeclaredIndexes();
  const migrationsSource = readMigrations();

  it('encuentra índices con nombre declarados en las entidades', () => {
    // Guarda contra un regex roto: si el scanner deja de encontrar nada, el
    // test de abajo pasaría en verde sin haber verificado nada.
    expect(declared.length).toBeGreaterThan(40);
  });

  it('crea en una migración todos los índices que las entidades declaran', () => {
    const huerfanos = declared.filter(
      (index) => !migrationsSource.includes(index.name),
    );

    expect(huerfanos.map((index) => `${index.name} (${index.file})`)).toEqual(
      [],
    );
  });
});

describe('AddSessionMetricsIndexes (T-DEUDA-002)', () => {
  const INDEXES = [
    'idx_session_completed_at_status',
    'idx_session_tarotista_completed',
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

  it('crea los dos índices de métricas con IF NOT EXISTS', async () => {
    const sentencias = await runMigration('up');

    expect(sentencias).toHaveLength(2);
    for (const indice of INDEXES) {
      const sentencia = sentencias.find((sql) => sql.includes(indice));
      expect(sentencia).toBeDefined();
      expect(sentencia).toContain('CREATE INDEX IF NOT EXISTS');
      expect(sentencia).toContain('"sessions"');
    }
  });

  it('es reversible: down() borra los dos índices que crea up()', async () => {
    const sentencias = await runMigration('down');

    expect(sentencias).toHaveLength(2);
    for (const indice of INDEXES) {
      const sentencia = sentencias.find((sql) => sql.includes(indice));
      expect(sentencia).toBeDefined();
      expect(sentencia).toContain('DROP INDEX IF EXISTS');
    }
  });
});
