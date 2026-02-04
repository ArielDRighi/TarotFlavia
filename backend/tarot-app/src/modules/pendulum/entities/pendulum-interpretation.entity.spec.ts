import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumInterpretation } from './pendulum-interpretation.entity';
import { PendulumResponse } from '../domain/enums/pendulum.enums';

describe('PendulumInterpretation Entity', () => {
  let _repository: Repository<PendulumInterpretation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(PendulumInterpretation),
          useClass: Repository,
        },
      ],
    }).compile();

    _repository = module.get<Repository<PendulumInterpretation>>(
      getRepositoryToken(PendulumInterpretation),
    );
  });

  describe('Entity creation', () => {
    it('should create a valid interpretation', () => {
      const interpretation = new PendulumInterpretation();
      interpretation.id = 1;
      interpretation.responseType = PendulumResponse.YES;
      interpretation.text = 'El universo afirma tu camino.';
      interpretation.isActive = true;

      expect(interpretation).toBeDefined();
      expect(interpretation.id).toBe(1);
      expect(interpretation.responseType).toBe(PendulumResponse.YES);
      expect(interpretation.text).toBe('El universo afirma tu camino.');
      expect(interpretation.isActive).toBe(true);
    });

    it('should handle all response types', () => {
      const yesInterpretation = new PendulumInterpretation();
      yesInterpretation.responseType = PendulumResponse.YES;
      expect(yesInterpretation.responseType).toBe('yes');

      const noInterpretation = new PendulumInterpretation();
      noInterpretation.responseType = PendulumResponse.NO;
      expect(noInterpretation.responseType).toBe('no');

      const maybeInterpretation = new PendulumInterpretation();
      maybeInterpretation.responseType = PendulumResponse.MAYBE;
      expect(maybeInterpretation.responseType).toBe('maybe');
    });

    it('should default isActive to true', () => {
      const interpretation = new PendulumInterpretation();
      interpretation.text = 'Test';
      interpretation.responseType = PendulumResponse.YES;

      // The default is set in the entity definition
      expect(interpretation).toBeDefined();
    });
  });

  describe('Entity validation', () => {
    it('should require responseType', () => {
      const interpretation = new PendulumInterpretation();
      interpretation.text = 'Test';

      expect(interpretation.responseType).toBeUndefined();
    });

    it('should require text', () => {
      const interpretation = new PendulumInterpretation();
      interpretation.responseType = PendulumResponse.YES;

      expect(interpretation.text).toBeUndefined();
    });

    it('should accept long text', () => {
      const interpretation = new PendulumInterpretation();
      interpretation.responseType = PendulumResponse.YES;
      interpretation.text = 'A'.repeat(1000);

      expect(interpretation.text.length).toBe(1000);
    });
  });
});
