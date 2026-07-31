import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../../src/app.module';
import { PasswordResetToken } from '../../src/modules/auth/entities/password-reset-token.entity';
import { RefreshToken } from '../../src/modules/auth/entities/refresh-token.entity';
import { CachedInterpretation } from '../../src/modules/cache/infrastructure/entities/cached-interpretation.entity';

/**
 * Guardarraíl T-PROD-021.
 *
 * Las columnas de expiración eran `timestamp` SIN zona horaria. TypeORM las
 * escribía con la hora de pared local del proceso y las releía como UTC al
 * hidratar la entidad: con `TZ` distinto de UTC, el `Date` volvía desfasado el
 * offset entero. Con TZ=America/Argentina/Buenos_Aires, un token de reset con
 * TTL de 1 hora nacía 2 horas vencido y `validateToken` tiraba
 * "Token has expired" — reset de contraseña y login rotos para todos.
 *
 * Estos tests fijan las dos mitades del arreglo:
 *  1. el tipo de columna es `timestamptz` (un instante absoluto);
 *  2. el round-trip por TypeORM preserva el instante exacto.
 *
 * ⚠️ El (2) pasa trivialmente cuando el proceso corre en UTC — que es como corre
 * CI hoy. Para ejercitarlo de verdad hay que correr la suite con un TZ no-UTC:
 *
 *     TZ=America/Argentina/Buenos_Aires npm run test:integration
 *
 * El (1) NO depende del TZ: protege contra una migración futura que vuelva a
 * dejar estas columnas sin zona, y es el que ataja la regresión en CI.
 *
 * El round-trip usa `cached_interpretations` a propósito: es la única de las tres
 * tablas sin claves foráneas, así que no necesita sembrar un usuario ni depende
 * del estado que dejen las otras suites.
 */

interface ColumnTypeRow {
  data_type: string;
}

/** Columnas que representan un INSTANTE y se comparan contra `new Date()` en JS. */
const INSTANT_COLUMNS: ReadonlyArray<{
  table: string;
  column: string;
  rompe: string;
}> = [
  {
    table: 'password_reset_tokens',
    column: 'expires_at',
    rompe: 'reset de contraseña: todo token nace vencido',
  },
  {
    table: 'refresh_tokens',
    column: 'expires_at',
    rompe: 'sesiones: refresh siempre vencido, deslogueo permanente',
  },
  {
    table: 'cached_interpretations',
    column: 'expires_at',
    rompe: 'caché de IA siempre vencida: se vuelve a pagar cada interpretación',
  },
  {
    table: 'user',
    column: 'planExpiresAt',
    rompe: 'el cron degrada premium a free con el offset de diferencia',
  },
  {
    table: 'user_tarotista_subscriptions',
    column: 'can_change_at',
    rompe: 'el bloqueo de cambio de tarotista favorito se corre el offset',
  },
];

/** TTL real de un token de reset (`typeorm-password-reset.repository.ts`). */
const ONE_HOUR_MS = 3600000;

describe('T-PROD-021 — expiraciones independientes del timezone', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let cacheRepository: Repository<CachedInterpretation>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    cacheRepository = dataSource.getRepository(CachedInterpretation);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  function buildCacheRow(
    expiresAt: Date,
    suffix: string,
  ): CachedInterpretation {
    return cacheRepository.create({
      cache_key: `t-prod-021-${suffix}-${Date.now()}`,
      tarotista_id: null,
      spread_id: null,
      card_combination: [{ card_id: '1', position: 0, is_reversed: false }],
      question_hash: 't-prod-021',
      interpretation_text: 'fixture',
      expires_at: expiresAt,
    });
  }

  describe('tipo de columna en la base', () => {
    it.each(INSTANT_COLUMNS)(
      // Sin el separador, Jest interpreta `$table.` como un path y se come el
      // punto: el título salía "password_reset_tokensexpires_at".
      '$table / $column es timestamptz (si no: $rompe)',
      async ({ table, column }) => {
        const rows = await dataSource.query<ColumnTypeRow[]>(
          `SELECT data_type FROM information_schema.columns
           WHERE table_name = $1 AND column_name = $2`,
          [table, column],
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].data_type).toBe('timestamp with time zone');
      },
    );
  });

  describe('metadata de las entidades', () => {
    it.each([
      ['PasswordResetToken', PasswordResetToken],
      ['RefreshToken', RefreshToken],
      ['CachedInterpretation', CachedInterpretation],
    ])('%s declara su expiración como timestamptz', (_name, entity) => {
      const metadata = dataSource.getMetadata(entity);
      const column = metadata.columns.find(
        (col) => col.databaseName === 'expires_at',
      );

      expect(column).toBeDefined();
      expect(column!.type).toBe('timestamptz');
    });
  });

  describe('round-trip por TypeORM', () => {
    it('preserva el instante exacto de expires_at', async () => {
      // Con `timestamp` a secas y TZ=UTC-3 esto volvía 3 horas corrido.
      const expiresAt = new Date(Date.now() + ONE_HOUR_MS);
      const saved = await cacheRepository.save(
        buildCacheRow(expiresAt, 'exact'),
      );

      try {
        const read = await cacheRepository.findOneByOrFail({ id: saved.id });

        expect(read.expires_at.getTime()).toBe(expiresAt.getTime());
      } finally {
        await cacheRepository.delete({ id: saved.id });
      }
    });

    it('un registro con TTL de 1 hora no nace vencido', async () => {
      // La comparación que reproducía el bug: el `Date` hidratado contra
      // `new Date()` daba "ya expiró" apenas se guardaba.
      const now = new Date();
      const saved = await cacheRepository.save(
        buildCacheRow(new Date(now.getTime() + ONE_HOUR_MS), 'ttl'),
      );

      try {
        const read = await cacheRepository.findOneByOrFail({ id: saved.id });

        expect(read.expires_at.getTime()).toBeGreaterThan(now.getTime());
      } finally {
        await cacheRepository.delete({ id: saved.id });
      }
    });
  });
});
