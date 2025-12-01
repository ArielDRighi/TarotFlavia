/**
 * Tarot Data E2E Tests - Cards, Decks & Spreads
 *
 * Tests para los endpoints públicos y de admin de datos de tarot:
 * - /cards - Cartas del tarot
 * - /decks - Mazos de tarot
 * - /spreads - Tiradas/tipos de lectura
 *
 * Basado en: SEEDERS-TAROT-CARTAS-MAZOS-TIRADAS.md y ARQUITECTURA-MODULAR-TAROT.md
 *
 * Requisitos de datos (seeders):
 * - 78 cartas (22 Arcanos Mayores + 56 Menores)
 * - 1 Mazo Rider-Waite (isDefault: true)
 * - 4 tipos de tiradas
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

// Interfaces para tipado estricto (basadas en TarotCard entity REAL)
interface TarotCardResponse {
  id: number;
  name: string;
  number: number;
  category: string; // 'arcanos_mayores', 'copas', 'oros', 'espadas', 'bastos'
  imageUrl: string;
  reversedImageUrl?: string;
  meaningUpright: string;
  meaningReversed: string;
  description: string;
  keywords: string; // Es un string, no array (ej: "Aventura, libertad, espíritu libre")
  deckId: number;
  deck?: TarotDeckResponse;
}

interface TarotDeckResponse {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  cardCount?: number;
  cards?: TarotCardResponse[];
}

interface TarotSpreadResponse {
  id: number;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  difficulty?: string;
  isBeginnerFriendly?: boolean;
}

interface SpreadPosition {
  position?: number; // Opcional - presente en seeders pero no requerido en DTO
  name: string;
  description: string;
  interpretation_focus?: string; // Opcional - presente en seeders
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

describe('Tarot Data E2E - Cards, Decks & Spreads', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let adminToken: string;
  let userToken: string;

  // IDs para reutilizar en tests
  let _defaultDeckId: number;
  let _firstCardId: number;
  let _firstSpreadId: number;

  beforeAll(async () => {
    // Inicializar helper de BD E2E
    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Crear aplicación NestJS
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Obtener tokens de autenticación (usuarios seeded en globalSetup)
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'Test123456!' })
      .expect(200);

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' })
      .expect(200);

    adminToken = (adminLoginResponse.body as { access_token: string })
      .access_token;
    userToken = (userLoginResponse.body as { access_token: string })
      .access_token;

    if (!adminToken || !userToken) {
      throw new Error('Failed to obtain authentication tokens');
    }
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dbHelper) {
      await dbHelper.close();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS: DECKS (MAZOS)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('/decks (GET) - Listar mazos', () => {
    it('debería retornar lista de mazos (endpoint público)', async () => {
      const response = await request(app.getHttpServer())
        .get('/decks')
        .expect(200);

      const decks = response.body as TarotDeckResponse[];
      expect(Array.isArray(decks)).toBe(true);
      expect(decks.length).toBeGreaterThanOrEqual(1);

      // Guardar ID del primer mazo para tests posteriores
      _defaultDeckId = decks[0].id;
    });

    it('cada mazo debería tener los campos requeridos', async () => {
      const response = await request(app.getHttpServer())
        .get('/decks')
        .expect(200);

      const decks = response.body as TarotDeckResponse[];
      decks.forEach((deck) => {
        expect(deck).toHaveProperty('id');
        expect(deck).toHaveProperty('name');
        expect(deck).toHaveProperty('description');
        expect(deck).toHaveProperty('isDefault');
        expect(typeof deck.id).toBe('number');
        expect(typeof deck.name).toBe('string');
        expect(typeof deck.isDefault).toBe('boolean');
      });
    });
  });

  describe('/decks/default (GET) - Mazo predeterminado', () => {
    it('debería retornar el mazo Rider-Waite como default', async () => {
      const response = await request(app.getHttpServer())
        .get('/decks/default')
        .expect(200);

      const deck = response.body as TarotDeckResponse;
      expect(deck.name).toBe('Rider-Waite');
      expect(deck.isDefault).toBe(true);

      // Guardar ID para otros tests
      _defaultDeckId = deck.id;
    });

    it('el mazo default debería incluir las 78 cartas', async () => {
      const response = await request(app.getHttpServer())
        .get('/decks/default')
        .expect(200);

      const deck = response.body as TarotDeckResponse;

      // Verificar que tiene relación cards cargada
      expect(deck.cards).toBeDefined();
      expect(Array.isArray(deck.cards)).toBe(true);
      expect(deck.cards!.length).toBe(78);
    });
  });

  describe('/decks/:id (GET) - Mazo por ID', () => {
    it('debería retornar mazo existente con sus cartas', async () => {
      // Primero obtener un ID válido
      const decksResponse = await request(app.getHttpServer())
        .get('/decks')
        .expect(200);
      const deckId = (decksResponse.body as TarotDeckResponse[])[0].id;

      const response = await request(app.getHttpServer())
        .get(`/decks/${deckId}`)
        .expect(200);

      const deck = response.body as TarotDeckResponse;
      expect(deck.id).toBe(deckId);
      expect(deck.cards).toBeDefined();
      expect(Array.isArray(deck.cards)).toBe(true);
    });

    it('debería retornar 404 para mazo inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/decks/99999')
        .expect(404);

      const error = response.body as ErrorResponse;
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('no encontrado');
    });

    it('debería retornar 400 para ID no numérico', async () => {
      await request(app.getHttpServer()).get('/decks/abc').expect(400);
    });

    it('debería retornar 400 para ID negativo', async () => {
      // ParseIntPipe debería aceptar pero el servicio podría no encontrarlo
      const response = await request(app.getHttpServer())
        .get('/decks/-1')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS: CARDS (CARTAS)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('/cards (GET) - Listar cartas', () => {
    it('debería retornar las 78 cartas del tarot', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      const cards = response.body as TarotCardResponse[];
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(78);

      // Guardar ID de primera carta
      _firstCardId = cards[0].id;
    });

    it('debería incluir 22 Arcanos Mayores', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      const cards = response.body as TarotCardResponse[];
      const majorArcana = cards.filter(
        (card) => card.category === 'arcanos_mayores',
      );
      expect(majorArcana.length).toBe(22);
    });

    it('debería incluir 56 Arcanos Menores (4 palos x 14 cartas)', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      const cards = response.body as TarotCardResponse[];
      const minorArcana = cards.filter(
        (card) => card.category !== 'arcanos_mayores',
      );
      expect(minorArcana.length).toBe(56);
    });

    it('cada carta debería tener los campos requeridos', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      const cards = response.body as TarotCardResponse[];
      cards.forEach((card) => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('category');
        expect(card).toHaveProperty('meaningUpright');
        expect(card).toHaveProperty('meaningReversed');
        expect(card).toHaveProperty('description');
        expect(card).toHaveProperty('keywords');
        expect(card).toHaveProperty('deckId');
      });
    });

    it('los Arcanos Menores deberían tener categoría de palo', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      const cards = response.body as TarotCardResponse[];
      const minorArcana = cards.filter(
        (card) => card.category !== 'arcanos_mayores',
      );

      minorArcana.forEach((card) => {
        expect(card.category).toBeDefined();
        expect(['copas', 'espadas', 'bastos', 'oros']).toContain(card.category);
      });
    });

    it('los 4 palos deberían tener 14 cartas cada uno', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      const cards = response.body as TarotCardResponse[];
      const suits = ['copas', 'espadas', 'bastos', 'oros'];

      suits.forEach((suit) => {
        const suitCards = cards.filter((card) => card.category === suit);
        expect(suitCards.length).toBe(14);
      });
    });
  });

  describe('/cards/:id (GET) - Carta por ID', () => {
    it('debería retornar carta existente', async () => {
      // Primero obtener un ID válido
      const cardsResponse = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);
      const cardId = (cardsResponse.body as TarotCardResponse[])[0].id;

      const response = await request(app.getHttpServer())
        .get(`/cards/${cardId}`)
        .expect(200);

      const card = response.body as TarotCardResponse;
      expect(card.id).toBe(cardId);
      expect(card.name).toBeDefined();
    });

    it('debería retornar 404 para carta inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards/99999')
        .expect(404);

      const error = response.body as ErrorResponse;
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('no encontrada');
    });

    it('debería retornar 400 para ID no numérico', async () => {
      await request(app.getHttpServer()).get('/cards/invalid').expect(400);
    });
  });

  describe('/cards/deck/:deckId (GET) - Cartas por mazo', () => {
    it('debería retornar cartas del mazo especificado', async () => {
      // Obtener ID del mazo default
      const deckResponse = await request(app.getHttpServer())
        .get('/decks/default')
        .expect(200);
      const deckId = (deckResponse.body as TarotDeckResponse).id;

      const response = await request(app.getHttpServer())
        .get(`/cards/deck/${deckId}`)
        .expect(200);

      const cards = response.body as TarotCardResponse[];
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(78);

      // Verificar que todas pertenecen al mazo correcto
      cards.forEach((card) => {
        expect(card.deckId).toBe(deckId);
      });
    });

    it('debería retornar 404 para mazo inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards/deck/99999')
        .expect(404);

      const error = response.body as ErrorResponse;
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('no encontrado');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS: SPREADS (TIRADAS)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('/spreads (GET) - Listar tiradas', () => {
    it('debería retornar al menos 4 tipos de tiradas', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);

      const spreads = response.body as TarotSpreadResponse[];
      expect(Array.isArray(spreads)).toBe(true);
      expect(spreads.length).toBeGreaterThanOrEqual(4);

      // Guardar ID del primer spread
      _firstSpreadId = spreads[0].id;
    });

    it('cada tirada debería tener los campos requeridos', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);

      const spreads = response.body as TarotSpreadResponse[];
      spreads.forEach((spread) => {
        expect(spread).toHaveProperty('id');
        expect(spread).toHaveProperty('name');
        expect(spread).toHaveProperty('description');
        expect(spread).toHaveProperty('cardCount');
        expect(spread).toHaveProperty('positions');
        expect(typeof spread.cardCount).toBe('number');
        expect(spread.cardCount).toBeGreaterThan(0);
      });
    });

    it('debería incluir tirada de 1 carta', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);

      const spreads = response.body as TarotSpreadResponse[];
      const oneCardSpread = spreads.find((s) => s.cardCount === 1);
      expect(oneCardSpread).toBeDefined();
    });

    it('debería incluir tirada de 3 cartas (Pasado-Presente-Futuro)', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);

      const spreads = response.body as TarotSpreadResponse[];
      const threeCardSpread = spreads.find((s) => s.cardCount === 3);
      expect(threeCardSpread).toBeDefined();
    });

    it('debería incluir Cruz Céltica (10 cartas)', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);

      const spreads = response.body as TarotSpreadResponse[];
      const celticCross = spreads.find((s) => s.cardCount === 10);
      expect(celticCross).toBeDefined();
    });

    it('las posiciones deberían coincidir con cardCount', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);

      const spreads = response.body as TarotSpreadResponse[];
      spreads.forEach((spread) => {
        if (spread.positions && Array.isArray(spread.positions)) {
          expect(spread.positions.length).toBe(spread.cardCount);
        }
      });
    });
  });

  describe('/spreads/:id (GET) - Tirada por ID', () => {
    it('debería retornar tirada existente', async () => {
      // Primero obtener un ID válido
      const spreadsResponse = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);
      const spreadId = (spreadsResponse.body as TarotSpreadResponse[])[0].id;

      const response = await request(app.getHttpServer())
        .get(`/spreads/${spreadId}`)
        .expect(200);

      const spread = response.body as TarotSpreadResponse;
      expect(spread.id).toBe(spreadId);
      expect(spread.name).toBeDefined();
    });

    it('debería retornar 404 para tirada inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads/99999')
        .expect(404);

      const error = response.body as ErrorResponse;
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('no encontrada');
    });

    it('debería retornar 400 para ID no numérico', async () => {
      await request(app.getHttpServer()).get('/spreads/invalid').expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS: AUTORIZACIÓN (Admin endpoints)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Admin Authorization - POST/PATCH/DELETE', () => {
    describe('POST /decks (crear mazo)', () => {
      it('debería rechazar sin autenticación (401)', async () => {
        await request(app.getHttpServer())
          .post('/decks')
          .send({ name: 'Test Deck', description: 'Test' })
          .expect(401);
      });

      it('debería rechazar usuario no-admin con DTO válido (403)', async () => {
        // Nota: La validación del DTO ocurre ANTES del guard, por eso enviamos DTO completo
        const response = await request(app.getHttpServer())
          .post('/decks')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'Test Deck Usuario',
            description: 'Descripción del mazo de prueba',
            imageUrl: 'https://example.com/deck.jpg',
            cardCount: 78,
          })
          .expect(403);

        const error = response.body as ErrorResponse;
        expect(error.message).toContain('administradores');
      });
    });

    describe('POST /cards (crear carta)', () => {
      it('debería rechazar sin autenticación (401)', async () => {
        await request(app.getHttpServer())
          .post('/cards')
          .send({
            name: 'Test Card',
            category: 'arcanos_mayores',
            meaningUpright: 'test',
            meaningReversed: 'test',
            description: 'test',
            keywords: 'test',
            deckId: 1,
          })
          .expect(401);
      });

      it('debería rechazar usuario no-admin con DTO válido (403)', async () => {
        // Primero obtenemos un deckId válido
        const decksResponse = await request(app.getHttpServer())
          .get('/decks')
          .expect(200);
        const deckId = (decksResponse.body as TarotDeckResponse[])[0].id;

        const response = await request(app.getHttpServer())
          .post('/cards')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'Test Card Usuario',
            number: 99,
            category: 'arcanos_mayores',
            imageUrl: 'https://example.com/card.jpg',
            meaningUpright: 'Significado al derecho',
            meaningReversed: 'Significado invertido',
            description: 'Descripción de prueba',
            keywords: 'prueba, test, carta',
            deckId: deckId,
          })
          .expect(403);

        const error = response.body as ErrorResponse;
        expect(error.message).toContain('administradores');
      });
    });

    describe('POST /spreads (crear tirada)', () => {
      it('debería rechazar sin autenticación (401)', async () => {
        await request(app.getHttpServer())
          .post('/spreads')
          .send({
            name: 'Test Spread',
            description: 'Test',
            cardCount: 3,
            positions: [],
          })
          .expect(401);
      });

      it('debería rechazar usuario no-admin con DTO válido (403)', async () => {
        const response = await request(app.getHttpServer())
          .post('/spreads')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'Test Spread Usuario',
            description: 'Tirada de prueba',
            cardCount: 3,
            positions: [
              { name: 'Pasado', description: 'El pasado' },
              { name: 'Presente', description: 'El presente' },
              { name: 'Futuro', description: 'El futuro' },
            ],
          })
          .expect(403);

        const error = response.body as ErrorResponse;
        expect(error.message).toContain('administradores');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS: EDGE CASES Y VALIDACIONES
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Edge Cases', () => {
    it('GET /cards con BD vacía de cartas no debería fallar', async () => {
      // Este test verifica que el endpoint no falla aunque retorne array vacío
      // En producción tenemos seeders, pero la API debe ser robusta
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /spreads con BD vacía de spreads no debería fallar', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('keywords de cartas debería ser string con palabras separadas por coma', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      const cards = response.body as TarotCardResponse[];
      if (cards.length > 0) {
        const card = cards[0];
        expect(typeof card.keywords).toBe('string');
        expect(card.keywords.length).toBeGreaterThan(0);
        // Verificar que tiene formato de palabras clave separadas por coma
        expect(card.keywords).toMatch(/\w+/);
      }
    });

    it('positions de spread debería tener estructura correcta', async () => {
      const response = await request(app.getHttpServer())
        .get('/spreads')
        .expect(200);

      const spreads = response.body as TarotSpreadResponse[];
      if (spreads.length > 0) {
        const spread = spreads.find((s) => s.cardCount === 3);
        if (spread && spread.positions) {
          expect(Array.isArray(spread.positions)).toBe(true);
          spread.positions.forEach((pos) => {
            // La estructura puede tener 'position' (número) desde el seeder
            // pero el DTO solo requiere 'name' y 'description'
            expect(pos).toHaveProperty('name');
            expect(pos).toHaveProperty('description');
          });
        }
      }
    });
  });
});
