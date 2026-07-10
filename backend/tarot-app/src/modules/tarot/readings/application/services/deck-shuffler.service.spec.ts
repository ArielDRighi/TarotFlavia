import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { DeckShufflerService } from './deck-shuffler.service';

/**
 * Reemplaza `crypto.randomInt` por una secuencia determinista para poder
 * afirmar resultados exactos bajo una "semilla" fija. Usamos doble cast
 * `as unknown as` (nunca `any`) porque `crypto.randomInt` tiene sobrecargas
 * con callback que confunden la inferencia del spy.
 */
function mockRandomIntSequence(values: number[]): jest.SpyInstance {
  let call = 0;
  return jest
    .spyOn(crypto, 'randomInt')
    .mockImplementation(
      (() =>
        values[call++ % values.length]) as unknown as typeof crypto.randomInt,
    );
}

describe('DeckShufflerService', () => {
  let service: DeckShufflerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeckShufflerService],
    }).compile();

    service = module.get<DeckShufflerService>(DeckShufflerService);
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('shuffle', () => {
    it('produce una permutación determinista bajo una semilla RNG fija', () => {
      // randomInt siempre devuelve 0 → Fisher-Yates predecible
      mockRandomIntSequence([0]);

      const result = service.shuffle(['A', 'B', 'C', 'D']);

      // Con j=0 en cada paso: [A,B,C,D] → [B,C,D,A]
      expect(result).toEqual(['B', 'C', 'D', 'A']);
    });

    it('es determinista: misma semilla → mismo resultado', () => {
      const seed = [2, 1, 0];

      mockRandomIntSequence(seed);
      const first = service.shuffle([10, 20, 30, 40]);

      jest.restoreAllMocks();
      mockRandomIntSequence(seed);
      const second = service.shuffle([10, 20, 30, 40]);

      expect(first).toEqual(second);
    });

    it('no muta el array original', () => {
      mockRandomIntSequence([0]);
      const original = ['A', 'B', 'C'];

      service.shuffle(original);

      expect(original).toEqual(['A', 'B', 'C']);
    });

    it('conserva todos los elementos (mismo multiconjunto)', () => {
      mockRandomIntSequence([1, 0, 2, 1]);
      const input = [1, 2, 3, 4, 5];

      const result = service.shuffle(input);

      expect(result).toHaveLength(input.length);
      expect([...result].sort((a, b) => a - b)).toEqual(input);
    });

    it('devuelve arrays de 0 y 1 elemento sin tocar el RNG', () => {
      const spy = mockRandomIntSequence([0]);

      expect(service.shuffle([])).toEqual([]);
      expect(service.shuffle(['solo'])).toEqual(['solo']);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('draw', () => {
    it('baraja el pool y toma exactamente `count` cartas', () => {
      mockRandomIntSequence([0]);

      const result = service.draw(['A', 'B', 'C', 'D'], 2);

      // shuffle → [B,C,D,A]; slice(0,2) → [B,C]
      expect(result).toEqual(['B', 'C']);
    });

    it('las cartas devueltas pertenecen al pool y no se repiten', () => {
      mockRandomIntSequence([2, 1, 0]);
      const pool = [1, 2, 3, 4, 5];

      const result = service.draw(pool, 3);

      expect(result).toHaveLength(3);
      expect(new Set(result).size).toBe(3);
      result.forEach((card) => expect(pool).toContain(card));
    });

    it('lanza error si se piden más cartas de las disponibles en el pool', () => {
      mockRandomIntSequence([0]);

      expect(() => service.draw(['A', 'B'], 3)).toThrow(/suficientes cartas/i);
    });

    it('lanza error si count es negativo', () => {
      mockRandomIntSequence([0]);

      expect(() => service.draw(['A', 'B'], -1)).toThrow();
    });
  });

  describe('decideReversed', () => {
    it('mantiene la probabilidad de negocio del 30%', () => {
      expect(DeckShufflerService.REVERSED_PROBABILITY).toBe(0.3);
    });

    it('devuelve true cuando el RNG cae por debajo del umbral (30%)', () => {
      mockRandomIntSequence([0]);
      expect(service.decideReversed()).toBe(true);

      jest.restoreAllMocks();
      mockRandomIntSequence([29]);
      expect(service.decideReversed()).toBe(true);
    });

    it('devuelve false cuando el RNG cae en o por encima del umbral', () => {
      mockRandomIntSequence([30]);
      expect(service.decideReversed()).toBe(false);

      jest.restoreAllMocks();
      mockRandomIntSequence([99]);
      expect(service.decideReversed()).toBe(false);
    });

    it('reparte aproximadamente 30% de invertidas sobre una muestra grande', () => {
      // Valores 0..99 en ciclo → exactamente 30 de cada 100 quedan por debajo de 30
      const values = Array.from({ length: 100 }, (_, i) => i);
      mockRandomIntSequence(values);

      let reversedCount = 0;
      for (let i = 0; i < 100; i++) {
        if (service.decideReversed()) reversedCount++;
      }

      expect(reversedCount).toBe(30);
    });
  });
});
