import { Test, TestingModule } from '@nestjs/testing';
import { NumerologyService } from './numerology.service';
import { CalculateNumerologyDto } from './dto/calculate-numerology.dto';
import { NumerologyInterpretation } from './entities/numerology-interpretation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AIProviderService } from '../ai/application/services/ai-provider.service';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

describe('NumerologyService', () => {
  let service: NumerologyService;

  const mockInterpretationRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAIProviderService = {
    generateCompletion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NumerologyService,
        {
          provide: getRepositoryToken(NumerologyInterpretation),
          useValue: mockInterpretationRepo,
        },
        {
          provide: AIProviderService,
          useValue: mockAIProviderService,
        },
      ],
    }).compile();

    service = module.get<NumerologyService>(NumerologyService);

    // Reset mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should calculate numerology with only birthDate', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
      };

      const result = service.calculate(dto);

      expect(result).toBeDefined();
      expect(result.birthDate).toBe('1990-03-25');
      expect(result.lifePath).toBeDefined();
      expect(result.lifePath.value).toBeGreaterThanOrEqual(1);
      expect(result.lifePath.value).toBeLessThanOrEqual(33);
      expect(result.birthday).toBeDefined();
      expect(result.personalYear).toBeGreaterThanOrEqual(1);
      expect(result.personalYear).toBeLessThanOrEqual(9);
      expect(result.personalMonth).toBeGreaterThanOrEqual(1);
      expect(result.personalMonth).toBeLessThanOrEqual(9);
      // Sin nombre, estos deben ser null
      expect(result.expression).toBeNull();
      expect(result.soulUrge).toBeNull();
      expect(result.personality).toBeNull();
      expect(result.fullName).toBeNull();
    });

    it('should calculate numerology with birthDate and fullName', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
        fullName: 'Juan Carlos Pérez',
      };

      const result = service.calculate(dto);

      expect(result).toBeDefined();
      expect(result.birthDate).toBe('1990-03-25');
      expect(result.fullName).toBe('Juan Carlos Pérez');
      expect(result.lifePath).toBeDefined();
      expect(result.birthday).toBeDefined();
      // Con nombre, estos NO deben ser null
      expect(result.expression).toBeDefined();
      expect(result.expression).not.toBeNull();
      expect(result.soulUrge).toBeDefined();
      expect(result.soulUrge).not.toBeNull();
      expect(result.personality).toBeDefined();
      expect(result.personality).not.toBeNull();
    });

    it('should detect master numbers correctly', () => {
      // 1991-11-07 debe dar Life Path 11 (maestro)
      const dto: CalculateNumerologyDto = {
        birthDate: '1991-11-07',
      };

      const result = service.calculate(dto);

      expect(result.lifePath.value).toBe(11);
      expect(result.lifePath.isMaster).toBe(true);
      expect(result.lifePath.name).toContain('Visionario');
    });

    it('should include interpretations in number details', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
      };

      const result = service.calculate(dto);

      expect(result.lifePath.name).toBeDefined();
      expect(result.lifePath.name).not.toBe('');
      expect(result.lifePath.keywords).toBeDefined();
      expect(result.lifePath.keywords.length).toBeGreaterThan(0);
      expect(result.lifePath.description).toBeDefined();
      expect(result.lifePath.description).not.toBe('');
    });

    it('should handle dates with different Life Path numbers', () => {
      const testCases = [
        { birthDate: '1990-01-01', expectedRange: [1, 33] },
        { birthDate: '1985-05-15', expectedRange: [1, 33] },
        { birthDate: '2000-12-31', expectedRange: [1, 33] },
      ];

      testCases.forEach((testCase) => {
        const dto: CalculateNumerologyDto = {
          birthDate: testCase.birthDate,
        };

        const result = service.calculate(dto);

        expect(result.lifePath.value).toBeGreaterThanOrEqual(
          testCase.expectedRange[0],
        );
        expect(result.lifePath.value).toBeLessThanOrEqual(
          testCase.expectedRange[1],
        );
        // Verificar que solo sean números válidos (1-9, 11, 22, 33)
        const validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
        expect(validNumbers).toContain(result.lifePath.value);
      });
    });
  });

  describe('getInterpretation', () => {
    it('should return interpretation for valid number', () => {
      const interpretation = service.getInterpretation(7);

      expect(interpretation).toBeDefined();
      expect(interpretation).not.toBeNull();
      if (interpretation) {
        expect(interpretation.number).toBe(7);
        expect(interpretation.name).toBeDefined();
        expect(interpretation.keywords).toBeDefined();
        expect(interpretation.description).toBeDefined();
      }
    });

    it('should return interpretation for master numbers', () => {
      const masterNumbers = [11, 22, 33];

      masterNumbers.forEach((num) => {
        const interpretation = service.getInterpretation(num);

        expect(interpretation).toBeDefined();
        expect(interpretation).not.toBeNull();
        if (interpretation) {
          expect(interpretation.number).toBe(num);
          expect(interpretation.isMaster).toBe(true);
        }
      });
    });

    it('should return null for invalid number', () => {
      const interpretation = service.getInterpretation(99);

      expect(interpretation).toBeNull();
    });

    it('should return interpretation for all valid numbers (1-9)', () => {
      for (let i = 1; i <= 9; i++) {
        const interpretation = service.getInterpretation(i);

        expect(interpretation).toBeDefined();
        expect(interpretation).not.toBeNull();
        if (interpretation) {
          expect(interpretation.number).toBe(i);
          expect(interpretation.isMaster).toBe(false);
        }
      }
    });
  });

  describe('getCompatibility', () => {
    it('should return compatibility for valid number pair', () => {
      const compatibility = service.getCompatibility(1, 2);

      expect(compatibility).toBeDefined();
      expect(compatibility).not.toBeNull();
      if (compatibility) {
        expect(compatibility.numbers).toContain(1);
        expect(compatibility.numbers).toContain(2);
        expect(compatibility.level).toBeDefined();
        expect(compatibility.description).toBeDefined();
        expect(compatibility.strengths).toBeDefined();
        expect(compatibility.challenges).toBeDefined();
      }
    });

    it('should return same compatibility regardless of order', () => {
      const compatibility1 = service.getCompatibility(1, 2);
      const compatibility2 = service.getCompatibility(2, 1);

      // Debe ser la misma compatibilidad
      if (compatibility1 && compatibility2) {
        expect(compatibility1.level).toBe(compatibility2.level);
        expect(compatibility1.description).toBe(compatibility2.description);
      }
    });

    it('should return null for non-existent compatibility pair', () => {
      // Asumiendo que no hay compatibilidad para todos los pares
      const compatibility = service.getCompatibility(99, 88);

      expect(compatibility).toBeNull();
    });
  });

  describe('getNumberDetail (private method behavior)', () => {
    it('should create number detail with correct structure', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
      };

      const result = service.calculate(dto);

      // Verificar estructura de NumberDetailDto
      expect(result.lifePath).toHaveProperty('value');
      expect(result.lifePath).toHaveProperty('name');
      expect(result.lifePath).toHaveProperty('keywords');
      expect(result.lifePath).toHaveProperty('description');
      expect(result.lifePath).toHaveProperty('isMaster');

      // Verificar tipos
      expect(typeof result.lifePath.value).toBe('number');
      expect(typeof result.lifePath.name).toBe('string');
      expect(Array.isArray(result.lifePath.keywords)).toBe(true);
      expect(typeof result.lifePath.description).toBe('string');
      expect(typeof result.lifePath.isMaster).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates correctly', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '2000-02-29',
      };

      const result = service.calculate(dto);

      expect(result).toBeDefined();
      expect(result.birthDate).toBe('2000-02-29');
      expect(result.birthday.value).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty string for fullName', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
        fullName: '',
      };

      const result = service.calculate(dto);

      // Empty string debe tratarse como sin nombre
      expect(result.expression).toBeNull();
      expect(result.soulUrge).toBeNull();
      expect(result.personality).toBeNull();
    });

    it('should handle names with special characters and accents', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
        fullName: 'José María García-López',
      };

      const result = service.calculate(dto);

      expect(result).toBeDefined();
      expect(result.expression).toBeDefined();
      expect(result.expression).not.toBeNull();
    });

    it('should calculate personal year correctly for current year', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: `1990-03-25`,
      };

      const result = service.calculate(dto);

      // Personal year debe estar entre 1-9
      expect(result.personalYear).toBeGreaterThanOrEqual(1);
      expect(result.personalYear).toBeLessThanOrEqual(9);
    });
  });

  describe('getExistingInterpretation', () => {
    it('should return interpretation if exists', async () => {
      const mockInterpretation = {
        id: 1,
        userId: 123,
        lifePath: 7,
        birthdayNumber: 25,
        expressionNumber: 5,
        soulUrge: 3,
        personality: 2,
        birthDate: new Date('1990-03-25'),
        fullName: 'Juan Pérez',
        interpretation: 'Tu numerología indica...',
        aiProvider: 'groq',
        aiModel: 'llama-3.1-70b-versatile',
        tokensUsed: 1500,
        generationTimeMs: 3500,
        generatedAt: new Date(),
      } as NumerologyInterpretation;

      mockInterpretationRepo.findOne.mockResolvedValue(mockInterpretation);

      const result = await service.getExistingInterpretation(123);

      expect(result).toBeDefined();
      expect(result).toBe(mockInterpretation);
      expect(mockInterpretationRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 123 },
      });
    });

    it('should return null if interpretation does not exist', async () => {
      mockInterpretationRepo.findOne.mockResolvedValue(null);

      const result = await service.getExistingInterpretation(123);

      expect(result).toBeNull();
      expect(mockInterpretationRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 123 },
      });
    });
  });

  describe('generateAndSaveInterpretation', () => {
    const mockUser: User = {
      id: 123,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'hashed',
      birthDate: '1990-03-25',
      plan: UserPlan.PREMIUM,
      isAdmin: false,
      profilePicture: null,
      roles: [UserRole.CONSUMER],
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      planStartedAt: new Date(),
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      readings: [],
      banReason: null,
      bannedAt: null,
      lastLogin: null,
      aiRequestsUsedMonth: 0,
      aiCostUsdMonth: 0,
      aiTokensUsedMonth: 0,
      aiProviderUsed: null,
      quotaWarningSent: false,
      aiUsageResetAt: null,
      isPremium: jest.fn().mockReturnValue(true),
      hasPlanExpired: jest.fn().mockReturnValue(false),
      hasRole: jest.fn().mockReturnValue(false),
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasAllRoles: jest.fn().mockReturnValue(false),
      isConsumer: jest.fn().mockReturnValue(true),
      isTarotist: jest.fn().mockReturnValue(false),
      isAdminRole: jest.fn().mockReturnValue(false),
      get isAdminUser() {
        return false;
      },
      isBanned: jest.fn().mockReturnValue(false),
      ban: jest.fn(),
      unban: jest.fn(),
    } as unknown as User;

    it('should return existing interpretation if already exists', async () => {
      const existingInterpretation = {
        id: 1,
        userId: 123,
        lifePath: 7,
        interpretation: 'Existing interpretation',
        aiProvider: 'groq',
        aiModel: 'llama-3.1-70b-versatile',
      } as NumerologyInterpretation;

      mockInterpretationRepo.findOne.mockResolvedValue(existingInterpretation);

      const result = await service.generateAndSaveInterpretation(mockUser);

      expect(result).toBe(existingInterpretation);
      expect(mockInterpretationRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 123 },
      });
      // NO debe llamar a generateCompletion ni save
      expect(mockAIProviderService.generateCompletion).not.toHaveBeenCalled();
      expect(mockInterpretationRepo.save).not.toHaveBeenCalled();
    });

    it('should generate and save new interpretation if not exists', async () => {
      mockInterpretationRepo.findOne.mockResolvedValue(null);

      const mockAIResponse = {
        content: '### Tu Esencia Numerológica\n\nInterpretación generada...',
        provider: 'groq',
        model: 'llama-3.1-70b-versatile',
        tokensUsed: { prompt: 500, completion: 1000, total: 1500 },
        durationMs: 3500,
      };

      mockAIProviderService.generateCompletion.mockResolvedValue(
        mockAIResponse,
      );

      const mockCreatedInterpretation = {
        id: 1,
        userId: 123,
        lifePath: 2,
        birthdayNumber: 7,
        expressionNumber: 1,
        soulUrge: 3,
        personality: 7,
        birthDate: new Date('1990-03-25'),
        fullName: 'Juan Pérez',
        interpretation: mockAIResponse.content,
        aiProvider: mockAIResponse.provider,
        aiModel: mockAIResponse.model,
        tokensUsed: mockAIResponse.tokensUsed.total,
        generationTimeMs: mockAIResponse.durationMs,
        generatedAt: new Date(),
      } as NumerologyInterpretation;

      mockInterpretationRepo.create.mockReturnValue(mockCreatedInterpretation);
      mockInterpretationRepo.save.mockResolvedValue(mockCreatedInterpretation);

      const result = await service.generateAndSaveInterpretation(mockUser);

      expect(result).toBeDefined();
      expect(result.userId).toBe(123);
      expect(result.interpretation).toBe(mockAIResponse.content);
      expect(result.aiProvider).toBe('groq');

      // Verificar que se llamó al repositorio
      expect(mockInterpretationRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 123 },
      });
      expect(mockAIProviderService.generateCompletion).toHaveBeenCalled();
      expect(mockInterpretationRepo.create).toHaveBeenCalled();
      expect(mockInterpretationRepo.save).toHaveBeenCalled();
    });

    it('should include all calculated numbers in the interpretation', async () => {
      mockInterpretationRepo.findOne.mockResolvedValue(null);

      const mockAIResponse = {
        content: 'Interpretación...',
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        tokensUsed: { prompt: 400, completion: 800, total: 1200 },
        durationMs: 2500,
      };

      mockAIProviderService.generateCompletion.mockResolvedValue(
        mockAIResponse,
      );

      const mockCreated = {
        lifePath: 2,
        birthdayNumber: 7,
        expressionNumber: 1,
        soulUrge: 3,
        personality: 7,
      } as NumerologyInterpretation;

      mockInterpretationRepo.create.mockReturnValue(mockCreated);
      mockInterpretationRepo.save.mockResolvedValue(mockCreated);

      await service.generateAndSaveInterpretation(mockUser);

      // Verificar que create fue llamado con los números correctos
      const createCall = mockInterpretationRepo.create.mock.calls[0][0];
      expect(createCall.lifePath).toBeDefined();
      expect(createCall.birthdayNumber).toBeDefined();
      expect(createCall.birthDate).toBeDefined();
      expect(createCall.fullName).toBe('Juan Pérez');
    });

    it('should handle user without name (only birthDate)', async () => {
      const userWithoutName = {
        ...mockUser,
        name: null,
      } as unknown as User;

      mockInterpretationRepo.findOne.mockResolvedValue(null);

      const mockAIResponse = {
        content: 'Interpretación sin nombre...',
        provider: 'deepseek',
        model: 'deepseek-chat',
        tokensUsed: { prompt: 300, completion: 700, total: 1000 },
        durationMs: 2000,
      };

      mockAIProviderService.generateCompletion.mockResolvedValue(
        mockAIResponse,
      );

      const mockCreated = {
        expressionNumber: null,
        soulUrge: null,
        personality: null,
        fullName: null,
      } as NumerologyInterpretation;

      mockInterpretationRepo.create.mockReturnValue(mockCreated);
      mockInterpretationRepo.save.mockResolvedValue(mockCreated);

      await service.generateAndSaveInterpretation(userWithoutName);

      const createCall = mockInterpretationRepo.create.mock.calls[0][0];
      expect(createCall.expressionNumber).toBeNull();
      expect(createCall.soulUrge).toBeNull();
      expect(createCall.personality).toBeNull();
      expect(createCall.fullName).toBeNull();
    });

    it('should track generation time correctly', async () => {
      mockInterpretationRepo.findOne.mockResolvedValue(null);

      const mockAIResponse = {
        content: 'Content',
        provider: 'groq',
        model: 'llama-3.1-70b-versatile',
        tokensUsed: { prompt: 100, completion: 200, total: 300 },
        durationMs: 4200,
      };

      mockAIProviderService.generateCompletion.mockResolvedValue(
        mockAIResponse,
      );

      const mockCreated = {
        generationTimeMs: 4200,
      } as NumerologyInterpretation;

      mockInterpretationRepo.create.mockReturnValue(mockCreated);
      mockInterpretationRepo.save.mockResolvedValue(mockCreated);

      await service.generateAndSaveInterpretation(mockUser);

      // Verificar que el tiempo de generación se guardó
      const createCall = mockInterpretationRepo.create.mock.calls[0][0];
      expect(createCall.generationTimeMs).toBeGreaterThanOrEqual(0);
    });
  });
});
