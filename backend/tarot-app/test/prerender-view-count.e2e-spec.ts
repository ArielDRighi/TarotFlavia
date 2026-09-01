import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { EncyclopediaTarotCard } from '../src/modules/encyclopedia/entities/encyclopedia-tarot-card.entity';
import { EncyclopediaArticle } from '../src/modules/encyclopedia/entities/encyclopedia-article.entity';
import { Ritual } from '../src/modules/rituals/entities/ritual.entity';
import { ArcanaType } from '../src/modules/encyclopedia/enums/tarot.enums';
import { ArticleCategory } from '../src/modules/encyclopedia/enums/article.enums';
import { RitualCategory } from '../src/modules/rituals/domain/enums/ritual-category.enum';
import { RitualDifficulty } from '../src/modules/rituals/domain/enums/ritual-difficulty.enum';
import { PRERENDER_HEADER } from '../src/common/decorators/is-prerender.decorator';

/**
 * T-DEPLOY-002 — el header `X-Prerender` de punta a punta, sobre HTTP real.
 *
 * **Por qué este archivo existe y no alcanzaba con los unitarios.** Los specs
 * de controller le pasan el booleano a mano
 * (`controller.getCardBySlug('the-fool', true)`), así que **nunca ejercitan el
 * decorador**. Sacar el `@IsPrerender()` de un controller dejando el parámetro
 * hace que `isPrerender` quede `undefined`, `countView: !undefined` sea `true`
 * y el fix desaparezca — con los 237 tests del módulo, el `build` y el
 * `validate-architecture` **en verde**. Lo encontró la revisión mutando
 * exactamente eso.
 *
 * Este spec levanta la app entera y manda el header por HTTP, que es el único
 * lugar donde el cableado decorador → controller → servicio se puede afirmar.
 *
 * De paso ata los dos extremos del nombre del header: acá se manda la
 * capitalización que usa el frontend (`X-Prerender`, ver
 * `frontend/src/lib/api/prerender.ts`) contra la constante que declara el
 * backend.
 */
describe('Prerender y contador de vistas (e2e)', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let dataSource: DataSource;

  const SUFIJO = 'e2e-prerender';

  beforeAll(async () => {
    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = app.get(DataSource);

    await dataSource.getRepository(EncyclopediaTarotCard).save({
      slug: `carta-${SUFIJO}`,
      nameEn: 'Prerender Card',
      nameEs: 'Carta de Prerender',
      arcanaType: ArcanaType.MAJOR,
      number: 99,
      meaningUpright: 'Significado al derecho',
      meaningReversed: 'Significado invertido',
      keywords: { upright: ['prueba'], reversed: ['prueba'] },
      imageUrl: '/images/tarot/prerender.webp',
      viewCount: 0,
    });

    await dataSource.getRepository(EncyclopediaArticle).save({
      slug: `articulo-${SUFIJO}`,
      nameEs: 'Artículo de Prerender',
      category: ArticleCategory.ZODIAC_SIGN,
      snippet: 'Resumen de prueba',
      content: '# Contenido de prueba',
      viewCount: 0,
    });

    await dataSource.getRepository(Ritual).save({
      slug: `ritual-${SUFIJO}`,
      title: 'Ritual de Prerender',
      description: 'Descripción de prueba',
      category: RitualCategory.LUNAR,
      difficulty: RitualDifficulty.BEGINNER,
      durationMinutes: 10,
      viewCount: 0,
      isActive: true,
    });
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource
        .getRepository(EncyclopediaTarotCard)
        .delete({ slug: `carta-${SUFIJO}` });
      await dataSource
        .getRepository(EncyclopediaArticle)
        .delete({ slug: `articulo-${SUFIJO}` });
      await dataSource
        .getRepository(Ritual)
        .delete({ slug: `ritual-${SUFIJO}` });
    }
    if (app) await app.close();
    if (dbHelper) await dbHelper.close();
  });

  /**
   * El contador es fire-and-forget (T-DEPLOY-001), así que la respuesta vuelve
   * antes de que el UPDATE termine. Sondear es correcto acá: lo que se afirma
   * es "termina incrementando", no "incrementa antes de responder".
   */
  async function esperarViewCount(
    leer: () => Promise<number>,
    esperado: number,
  ): Promise<number> {
    for (let intento = 0; intento < 20; intento++) {
      const actual = await leer();
      if (actual === esperado) return actual;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return leer();
  }

  describe.each([
    [
      'ficha de tarot',
      `/api/v1/encyclopedia/cards/carta-${SUFIJO}`,
      () => EncyclopediaTarotCard,
      `carta-${SUFIJO}`,
    ],
    [
      'artículo',
      `/api/v1/encyclopedia/articles/articulo-${SUFIJO}`,
      () => EncyclopediaArticle,
      `articulo-${SUFIJO}`,
    ],
    [
      'ritual',
      `/api/v1/rituals/ritual-${SUFIJO}`,
      () => Ritual,
      `ritual-${SUFIJO}`,
    ],
  ])('%s', (_nombre, url, entidad, slug) => {
    async function viewCount(): Promise<number> {
      const fila = await dataSource
        .getRepository(entidad())
        .findOne({ where: { slug } });
      return (fila as { viewCount: number } | null)?.viewCount ?? -1;
    }

    it('cuenta la vista de una visita normal', async () => {
      const antes = await viewCount();

      await request(app.getHttpServer()).get(url).expect(200);

      expect(await esperarViewCount(viewCount, antes + 1)).toBe(antes + 1);
    });

    /**
     * El test que atrapa el decorador desconectado: sin `@IsPrerender()` en el
     * controller, este header no llega a ningún lado y el contador sube igual.
     */
    it('no cuenta la vista cuando llega el header de prerender', async () => {
      const antes = await viewCount();

      await request(app.getHttpServer())
        .get(url)
        .set(PRERENDER_HEADER, '1')
        .expect(200);

      // Se le da la misma ventana que al caso anterior: si fuera a incrementar,
      // acá ya lo habría hecho.
      await esperarViewCount(viewCount, antes + 1);
      expect(await viewCount()).toBe(antes);
    });

    /**
     * El frontend manda `X-Prerender`; Express normaliza a minúsculas. Se
     * verifica contra Express de verdad y no contra el mock del unitario.
     */
    it('acepta el header con cualquier capitalización', async () => {
      const antes = await viewCount();

      await request(app.getHttpServer())
        .get(url)
        .set('X-PRERENDER', '1')
        .expect(200);

      await esperarViewCount(viewCount, antes + 1);
      expect(await viewCount()).toBe(antes);
    });
  });
});
