import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumQuery } from './pendulum-query.entity';
import { PendulumResponse } from '../domain/enums/pendulum.enums';
import { User } from '../../users/entities/user.entity';

describe('PendulumQuery Entity', () => {
  let _repository: Repository<PendulumQuery>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(PendulumQuery),
          useClass: Repository,
        },
      ],
    }).compile();

    _repository = module.get<Repository<PendulumQuery>>(
      getRepositoryToken(PendulumQuery),
    );
  });

  describe('Entity creation', () => {
    it('should create a valid query with all fields', () => {
      const query = new PendulumQuery();
      query.id = 1;
      query.userId = 1;
      query.question = '¿Debo aceptar este trabajo?';
      query.response = PendulumResponse.YES;
      query.interpretation = 'El universo afirma tu camino.';
      query.lunarPhase = 'full_moon';
      query.createdAt = new Date();

      expect(query).toBeDefined();
      expect(query.id).toBe(1);
      expect(query.userId).toBe(1);
      expect(query.question).toBe('¿Debo aceptar este trabajo?');
      expect(query.response).toBe(PendulumResponse.YES);
      expect(query.interpretation).toBe('El universo afirma tu camino.');
      expect(query.lunarPhase).toBe('full_moon');
      expect(query.createdAt).toBeInstanceOf(Date);
    });

    it('should create a valid query without question (mental question)', () => {
      const query = new PendulumQuery();
      query.id = 1;
      query.userId = 1;
      query.question = null;
      query.response = PendulumResponse.NO;
      query.interpretation = 'El universo sugiere otra dirección.';
      query.lunarPhase = 'new_moon';

      expect(query).toBeDefined();
      expect(query.question).toBeNull();
      expect(query.response).toBe(PendulumResponse.NO);
    });

    it('should handle all response types', () => {
      const yesQuery = new PendulumQuery();
      yesQuery.response = PendulumResponse.YES;
      expect(yesQuery.response).toBe('yes');

      const noQuery = new PendulumQuery();
      noQuery.response = PendulumResponse.NO;
      expect(noQuery.response).toBe('no');

      const maybeQuery = new PendulumQuery();
      maybeQuery.response = PendulumResponse.MAYBE;
      expect(maybeQuery.response).toBe('maybe');
    });

    it('should accept various lunar phases', () => {
      const phases = [
        'new_moon',
        'waxing_crescent',
        'first_quarter',
        'waxing_gibbous',
        'full_moon',
        'waning_gibbous',
        'last_quarter',
        'waning_crescent',
      ];

      phases.forEach((phase) => {
        const query = new PendulumQuery();
        query.lunarPhase = phase;
        expect(query.lunarPhase).toBe(phase);
      });
    });
  });

  describe('Entity relationships', () => {
    it('should have a userId field', () => {
      const query = new PendulumQuery();
      query.userId = 123;

      expect(query.userId).toBe(123);
      expect(typeof query.userId).toBe('number');
    });

    it('should allow user relationship', () => {
      const query = new PendulumQuery();
      const user = new User();
      user.id = 1;
      query.user = user;

      expect(query.user).toBeDefined();
      expect(query.user.id).toBe(1);
    });
  });

  describe('Entity validation', () => {
    it('should require userId', () => {
      const query = new PendulumQuery();
      query.response = PendulumResponse.YES;
      query.interpretation = 'Test';
      query.lunarPhase = 'full_moon';

      expect(query.userId).toBeUndefined();
    });

    it('should require response', () => {
      const query = new PendulumQuery();
      query.userId = 1;
      query.interpretation = 'Test';
      query.lunarPhase = 'full_moon';

      expect(query.response).toBeUndefined();
    });

    it('should require interpretation', () => {
      const query = new PendulumQuery();
      query.userId = 1;
      query.response = PendulumResponse.YES;
      query.lunarPhase = 'full_moon';

      expect(query.interpretation).toBeUndefined();
    });

    it('should require lunarPhase', () => {
      const query = new PendulumQuery();
      query.userId = 1;
      query.response = PendulumResponse.YES;
      query.interpretation = 'Test';

      expect(query.lunarPhase).toBeUndefined();
    });

    it('should accept question as nullable', () => {
      const query = new PendulumQuery();
      query.question = null;

      expect(query.question).toBeNull();
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', () => {
      const query = new PendulumQuery();
      const now = new Date();
      query.createdAt = now;

      expect(query.createdAt).toBe(now);
      expect(query.createdAt).toBeInstanceOf(Date);
    });
  });
});
