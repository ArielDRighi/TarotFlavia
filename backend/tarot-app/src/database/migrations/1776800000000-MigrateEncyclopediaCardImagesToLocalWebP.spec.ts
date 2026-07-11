import { QueryRunner } from 'typeorm';
import { ALL_TAROT_CARDS } from '../../modules/encyclopedia/data/cards-seed.data';
import { MigrateEncyclopediaCardImagesToLocalWebP1776800000000 } from './1776800000000-MigrateEncyclopediaCardImagesToLocalWebP';

type QueryRunnerMock = jest.Mocked<Pick<QueryRunner, 'query'>>;

/**
 * Crea un QueryRunner mockeado con solo el método usado por la migración.
 * El doble cast es necesario porque la migración recibe el QueryRunner completo.
 */
function createQueryRunnerMock(): {
  mock: QueryRunnerMock;
  asQueryRunner: QueryRunner;
} {
  const mock: QueryRunnerMock = {
    query: jest.fn().mockResolvedValue(undefined),
  };
  return { mock, asQueryRunner: mock as unknown as QueryRunner };
}

function executedQueries(mock: QueryRunnerMock): string[] {
  return mock.query.mock.calls.map((call) => String(call[0]));
}

describe('MigrateEncyclopediaCardImagesToLocalWebP1776800000000', () => {
  let migration: MigrateEncyclopediaCardImagesToLocalWebP1776800000000;

  beforeEach(() => {
    migration = new MigrateEncyclopediaCardImagesToLocalWebP1776800000000();
    jest.clearAllMocks();
  });

  describe('up', () => {
    it('debe actualizar la tabla encyclopedia_tarot_cards con una única sentencia', async () => {
      const { mock, asQueryRunner } = createQueryRunnerMock();

      await migration.up(asQueryRunner);

      const queries = executedQueries(mock);
      expect(queries).toHaveLength(1);
      expect(queries[0]).toContain('encyclopedia_tarot_cards');
      expect(queries[0]).toContain('UPDATE');
    });

    it('debe derivar image_url del slug apuntando a las WebP locales', async () => {
      const { mock, asQueryRunner } = createQueryRunnerMock();

      await migration.up(asQueryRunner);

      const [query] = executedQueries(mock);
      expect(query).toContain('"image_url"');
      expect(query).toContain(`'/images/tarot/'`);
      expect(query).toContain(`'.webp'`);
      expect(query).toContain('"slug"');
    });

    it('debe ser idempotente: no toca las filas que ya apuntan a las WebP locales', async () => {
      const { mock, asQueryRunner } = createQueryRunnerMock();

      await migration.up(asQueryRunner);

      const [query] = executedQueries(mock);
      expect(query).toContain('NOT LIKE');
      expect(query).toContain(`'/images/tarot/%'`);
    });

    it('la URL derivada del slug debe coincidir con el imageUrl de las 78 cartas sembradas', () => {
      expect(ALL_TAROT_CARDS).toHaveLength(78);

      ALL_TAROT_CARDS.forEach((card) => {
        expect(card.imageUrl).toBe(`/images/tarot/${card.slug}.webp`);
      });
    });
  });

  describe('down', () => {
    it('debe restaurar las URLs de Wikimedia para las 78 cartas', async () => {
      const { mock, asQueryRunner } = createQueryRunnerMock();

      await migration.down(asQueryRunner);

      const queries = executedQueries(mock);
      expect(queries).toHaveLength(78);
      queries.forEach((query) => {
        expect(query).toContain('encyclopedia_tarot_cards');
        expect(query).toContain('upload.wikimedia.org');
      });
    });

    it('debe cubrir todos los slugs sembrados, uno por sentencia', async () => {
      const { mock, asQueryRunner } = createQueryRunnerMock();

      await migration.down(asQueryRunner);

      const queries = executedQueries(mock);
      ALL_TAROT_CARDS.forEach((card) => {
        const matching = queries.filter((query) =>
          query.includes(`"slug" = '${card.slug}'`),
        );
        expect(matching).toHaveLength(1);
      });
    });
  });
});
