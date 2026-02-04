import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { PendulumService } from './pendulum.service';
import { PendulumQuery } from '../../entities/pendulum-query.entity';
import { PendulumInterpretationService } from './pendulum-interpretation.service';
import { PendulumContentValidatorService } from './pendulum-content-validator.service';
import { LunarPhaseService } from '../../../rituals/application/services/lunar-phase.service';
import {
  PendulumResponse,
  PendulumMovement,
} from '../../domain/enums/pendulum.enums';

describe('PendulumService', () => {
  let service: PendulumService;
  let _queryRepository: Repository<PendulumQuery>;
  let _interpretationService: PendulumInterpretationService;
  let _contentValidator: PendulumContentValidatorService;
  let _lunarService: LunarPhaseService;

  const mockQueryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockInterpretationService = {
    getRandomInterpretation: jest.fn(),
  };

  const mockContentValidator = {
    validateQuestion: jest.fn(),
  };

  const mockLunarService = {
    getCurrentPhase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendulumService,
        {
          provide: getRepositoryToken(PendulumQuery),
          useValue: mockQueryRepository,
        },
        {
          provide: PendulumInterpretationService,
          useValue: mockInterpretationService,
        },
        {
          provide: PendulumContentValidatorService,
          useValue: mockContentValidator,
        },
        {
          provide: LunarPhaseService,
          useValue: mockLunarService,
        },
      ],
    }).compile();

    service = module.get<PendulumService>(PendulumService);
    _queryRepository = module.get<Repository<PendulumQuery>>(
      getRepositoryToken(PendulumQuery),
    );
    _interpretationService = module.get<PendulumInterpretationService>(
      PendulumInterpretationService,
    );
    _contentValidator = module.get<PendulumContentValidatorService>(
      PendulumContentValidatorService,
    );
    _lunarService = module.get<LunarPhaseService>(LunarPhaseService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('query', () => {
    beforeEach(() => {
      // Setup default mocks
      mockContentValidator.validateQuestion.mockReturnValue({ isValid: true });
      mockLunarService.getCurrentPhase.mockReturnValue({
        phase: 'full_moon',
        phaseName: 'Luna Llena',
      });
      mockInterpretationService.getRandomInterpretation.mockResolvedValue(
        'El universo afirma tu camino.',
      );
      mockQueryRepository.create.mockReturnValue({});
      mockQueryRepository.save.mockResolvedValue({ id: 1 });
    });

    it('should generate a random response (yes/no/maybe)', async () => {
      const result = await service.query({}, 1);

      expect(result.response).toBeDefined();
      expect([
        PendulumResponse.YES,
        PendulumResponse.NO,
        PendulumResponse.MAYBE,
      ]).toContain(result.response);
    });

    it('should return correct movement for YES response', async () => {
      // Mock Math.random para forzar YES (< 0.4)
      jest.spyOn(Math, 'random').mockReturnValue(0.2);

      const result = await service.query({}, 1);

      expect(result.response).toBe(PendulumResponse.YES);
      expect(result.movement).toBe(PendulumMovement.VERTICAL);
      expect(result.responseText).toBe('Sí');

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should return correct movement for NO response', async () => {
      // Mock Math.random para forzar NO (0.4 <= x < 0.8)
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.query({}, 1);

      expect(result.response).toBe(PendulumResponse.NO);
      expect(result.movement).toBe(PendulumMovement.HORIZONTAL);
      expect(result.responseText).toBe('No');

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should return correct movement for MAYBE response', async () => {
      // Mock Math.random para forzar MAYBE (>= 0.8)
      jest.spyOn(Math, 'random').mockReturnValue(0.85);

      const result = await service.query({}, 1);

      expect(result.response).toBe(PendulumResponse.MAYBE);
      expect(result.movement).toBe(PendulumMovement.CIRCULAR);
      expect(result.responseText).toBe('Quizás');

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should include lunar phase information', async () => {
      const result = await service.query({}, 1);

      expect(result.lunarPhase).toBe('full_moon');
      expect(result.lunarPhaseName).toBe('Luna Llena');
      expect(mockLunarService.getCurrentPhase).toHaveBeenCalled();
    });

    it('should include random interpretation', async () => {
      const result = await service.query({}, 1);

      expect(result.interpretation).toBe('El universo afirma tu camino.');
      expect(
        mockInterpretationService.getRandomInterpretation,
      ).toHaveBeenCalledWith(result.response);
    });

    it('should save query to history when userId is provided', async () => {
      const userId = 42;
      const dto = { question: '¿Es el momento?' };

      await service.query(dto, userId);

      expect(mockQueryRepository.create).toHaveBeenCalled();
      expect(mockQueryRepository.save).toHaveBeenCalled();

      const createCall = mockQueryRepository.create.mock.calls[0][0];
      expect(createCall.userId).toBe(userId);
      expect(createCall.question).toBe(dto.question);
    });

    it('should NOT save query when userId is not provided', async () => {
      await service.query({}, undefined);

      expect(mockQueryRepository.create).not.toHaveBeenCalled();
      expect(mockQueryRepository.save).not.toHaveBeenCalled();
    });

    it('should return queryId when saved to history', async () => {
      mockQueryRepository.save.mockResolvedValue({ id: 123 });

      const result = await service.query({}, 1);

      expect(result.queryId).toBe(123);
    });

    it('should return null queryId when not saved', async () => {
      const result = await service.query({}, undefined);

      expect(result.queryId).toBeNull();
    });

    it('should validate question content when provided', async () => {
      const dto = { question: '¿Debo aceptar este trabajo?' };

      await service.query(dto, 1);

      expect(mockContentValidator.validateQuestion).toHaveBeenCalledWith(
        dto.question,
      );
    });

    it('should throw BadRequestException when question contains blocked content', async () => {
      mockContentValidator.validateQuestion.mockReturnValue({
        isValid: false,
        blockedCategory: 'salud',
      });

      const dto = { question: '¿Tengo cáncer?' };

      await expect(service.query(dto, 1)).rejects.toThrow(BadRequestException);
      await expect(service.query(dto, 1)).rejects.toThrow(/salud/);
    });

    it('should include proper error code when content is blocked', async () => {
      mockContentValidator.validateQuestion.mockReturnValue({
        isValid: false,
        blockedCategory: 'financiero',
      });

      try {
        await service.query({ question: '¿Debo invertir en Bitcoin?' }, 1);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toMatchObject({
          code: 'BLOCKED_CONTENT',
          category: 'financiero',
        });
      }
    });

    it('should NOT validate questions when no userId provided', async () => {
      await service.query({ question: '¿Test?' }, undefined);
      expect(mockContentValidator.validateQuestion).not.toHaveBeenCalled();
    });

    it('should NOT validate when question is empty even with userId', async () => {
      await service.query({}, 1);
      expect(mockContentValidator.validateQuestion).not.toHaveBeenCalled();
    });

    it('should save null for question when not provided', async () => {
      await service.query({}, 1);

      const createCall = mockQueryRepository.create.mock.calls[0][0];
      expect(createCall.question).toBeNull();
    });

    it('should respect probability distribution (deterministic test)', () => {
      // Mock Math.random con valores que cubran todos los rangos
      const randomValues = [
        0.2, // YES (< 0.4)
        0.5, // NO (0.4 <= x < 0.8)
        0.85, // MAYBE (>= 0.8)
        0.1, // YES
        0.6, // NO
        0.9, // MAYBE
      ];
      let callIndex = 0;
      jest.spyOn(Math, 'random').mockImplementation(() => {
        const value = randomValues[callIndex % randomValues.length];
        callIndex++;
        return value;
      });

      // Generar respuestas con valores deterministas
      const responses = [
        service['generateResponse'](), // 0.2 → YES
        service['generateResponse'](), // 0.5 → NO
        service['generateResponse'](), // 0.85 → MAYBE
        service['generateResponse'](), // 0.1 → YES
        service['generateResponse'](), // 0.6 → NO
        service['generateResponse'](), // 0.9 → MAYBE
      ];

      // Verificar que cada rango genera la respuesta correcta
      expect(responses[0]).toBe(PendulumResponse.YES);
      expect(responses[1]).toBe(PendulumResponse.NO);
      expect(responses[2]).toBe(PendulumResponse.MAYBE);
      expect(responses[3]).toBe(PendulumResponse.YES);
      expect(responses[4]).toBe(PendulumResponse.NO);
      expect(responses[5]).toBe(PendulumResponse.MAYBE);

      jest.spyOn(Math, 'random').mockRestore();
    });
  });
});
