import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { MigrateEncyclopediaCardImagesToLocalWebP1776800000000 } from '../../src/database/migrations/1776800000000-MigrateEncyclopediaCardImagesToLocalWebP';

jest.setTimeout(30000);

/**
 * Verifica la migración de imágenes de la enciclopedia contra una DB real.
 *
 * La seed data pasó por tres estados históricos y la migración tiene que normalizar los tres:
 * URL de Wikimedia, path local legacy con subcarpeta (TASK-302, archivo inexistente) y el valor
 * canónico actual. Se usan slugs sintéticos para no pisar filas sembradas por otros specs.
 */
describe('MigrateEncyclopediaCardImagesToLocalWebP (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let migration: MigrateEncyclopediaCardImagesToLocalWebP1776800000000;

  const WIKIMEDIA_SLUG = 'mig-test-wikimedia';
  const LEGACY_PATH_SLUG = 'mig-test-legacy-path';
  const ALREADY_LOCAL_SLUG = 'mig-test-already-local';
  const TEST_SLUGS = [WIKIMEDIA_SLUG, LEGACY_PATH_SLUG, ALREADY_LOCAL_SLUG];

  const canonicalUrl = (slug: string): string => `/images/tarot/${slug}.webp`;

  async function deleteTestCards(): Promise<void> {
    await dataSource.query(
      `DELETE FROM "encyclopedia_tarot_cards" WHERE "slug" = ANY($1)`,
      [TEST_SLUGS],
    );
  }

  async function insertTestCard(slug: string, imageUrl: string): Promise<void> {
    await dataSource.query(
      `INSERT INTO "encyclopedia_tarot_cards"
         ("slug", "name_en", "name_es", "arcana_type", "number",
          "meaning_upright", "meaning_reversed", "keywords", "image_url")
       VALUES ($1, $2, $3, 'major', 0, 'derecho', 'invertido', '[]'::jsonb, $4)`,
      [slug, `Test ${slug}`, `Prueba ${slug}`, imageUrl],
    );
  }

  async function imageUrlOf(slug: string): Promise<string> {
    const rows: Array<{ image_url: string }> = await dataSource.query(
      `SELECT "image_url" FROM "encyclopedia_tarot_cards" WHERE "slug" = $1`,
      [slug],
    );
    return rows[0].image_url;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
    migration = new MigrateEncyclopediaCardImagesToLocalWebP1776800000000();
  });

  afterAll(async () => {
    await deleteTestCards();
    await queryRunner.release();
    await app.close();
  });

  beforeEach(async () => {
    await deleteTestCards();
    await insertTestCard(
      WIKIMEDIA_SLUG,
      'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg',
    );
    await insertTestCard(
      LEGACY_PATH_SLUG,
      '/images/tarot/major/00-the-fool.jpg',
    );
    await insertTestCard(ALREADY_LOCAL_SLUG, canonicalUrl(ALREADY_LOCAL_SLUG));
  });

  it('debe reemplazar las URLs remotas de Wikimedia por la WebP local derivada del slug', async () => {
    await migration.up(queryRunner);

    expect(await imageUrlOf(WIKIMEDIA_SLUG)).toBe(canonicalUrl(WIKIMEDIA_SLUG));
  });

  it('debe corregir el path local legacy con subcarpeta (TASK-302), que apunta a un archivo inexistente', async () => {
    // Este es el caso que un `WHERE image_url NOT LIKE '/images/tarot/%'` dejaría sin tocar.
    await migration.up(queryRunner);

    expect(await imageUrlOf(LEGACY_PATH_SLUG)).toBe(
      canonicalUrl(LEGACY_PATH_SLUG),
    );
  });

  it('debe dejar intactas las filas que ya apuntan a la WebP local canónica', async () => {
    await migration.up(queryRunner);

    expect(await imageUrlOf(ALREADY_LOCAL_SLUG)).toBe(
      canonicalUrl(ALREADY_LOCAL_SLUG),
    );
  });

  it('debe ser idempotente: correrla dos veces deja el mismo estado', async () => {
    await migration.up(queryRunner);
    const afterFirstRun = await Promise.all(TEST_SLUGS.map(imageUrlOf));

    await migration.up(queryRunner);
    const afterSecondRun = await Promise.all(TEST_SLUGS.map(imageUrlOf));

    expect(afterSecondRun).toEqual(afterFirstRun);
    expect(afterSecondRun).toEqual(TEST_SLUGS.map(canonicalUrl));
  });

  it('no debe dejar ninguna URL remota en la tabla después de correr', async () => {
    await migration.up(queryRunner);

    const remaining: Array<{ count: string }> = await dataSource.query(
      `SELECT COUNT(*)::text AS count FROM "encyclopedia_tarot_cards" WHERE "image_url" NOT LIKE '/images/tarot/%.webp'`,
    );
    expect(remaining[0].count).toBe('0');
  });
});
