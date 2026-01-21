import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NumerologyController } from './numerology.controller';
import { NumerologyService } from './numerology.service';
import { UsersService } from '../users/users.service';
import { UserPlan } from '../users/entities/user.entity';
import { calculateDayNumber } from '../../common/utils/numerology.utils';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { AIQuotaGuard } from '../ai-usage/infrastructure/guards/ai-quota.guard';
import { RequiresPremiumForNumerologyAIGuard } from './guards/requires-premium-for-numerology-ai.guard';

describe('NumerologyController', () => {
  let controller: NumerologyController;
  let numerologyService: jest.Mocked<NumerologyService>;
  let usersService: jest.Mocked<UsersService>;

  const mockNumerologyProfile = {
    lifePath: {
      value: 7,
      name: 'El Buscador',
      keywords: ['Análisis', 'Introspección'],
      description: 'Descripción del número 7',
      isMaster: false,
    },
    birthday: {
      value: 7,
      name: 'El Buscador',
      keywords: ['Análisis'],
      description: 'Descripción',
      isMaster: false,
    },
    expression: null,
    soulUrge: null,
    personality: null,
    personalYear: 5,
    personalMonth: 8,
    birthDate: '1990-03-25',
    fullName: null,
  };

  const mockInterpretation = {
    id: 1,
    userId: 123,
    interpretation: '### Tu esencia numerológica...',
    lifePath: 7,
    expressionNumber: null,
    soulUrge: null,
    personality: null,
    birthdayNumber: 7,
    generatedAt: new Date('2026-01-18T10:00:00.000Z'),
    aiProvider: 'groq',
    aiModel: 'llama-3.1-70b-versatile',
  };

  const expectedInterpretationDto = {
    id: 1,
    userId: 123,
    interpretation: '### Tu esencia numerológica...',
    lifePath: 7,
    expressionNumber: null,
    soulUrge: null,
    personality: null,
    birthdayNumber: 7,
    generatedAt: '2026-01-18T10:00:00.000Z',
    aiProvider: 'groq',
    aiModel: 'llama-3.1-70b-versatile',
  };

  const mockMeaning = {
    number: 7,
    name: 'El Buscador',
    keywords: ['Análisis', 'Introspección', 'Sabiduría'],
    description: 'El número 7 representa...',
    strengths: ['Pensamiento analítico'],
    challenges: ['Tendencia al aislamiento'],
    careers: ['Investigador', 'Filósofo'],
    lifePurpose: 'Buscar la verdad',
    lessonsToLearn: ['Conectar con otros'],
    isMaster: false,
  };

  const mockUser = {
    id: 123,
    email: 'test@test.com',
    name: 'Test User',
    birthDate: '1990-03-25',
    plan: UserPlan.PREMIUM,
  };

  beforeEach(async () => {
    const mockNumerologyService = {
      calculate: jest.fn(),
      getInterpretation: jest.fn(),
      getCompatibility: jest.fn(),
      getExistingInterpretation: jest.fn(),
      generateAndSaveInterpretation: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NumerologyController],
      providers: [
        {
          provide: NumerologyService,
          useValue: mockNumerologyService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RequiresPremiumForNumerologyAIGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AIQuotaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NumerologyController>(NumerologyController);
    numerologyService = module.get(NumerologyService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculate', () => {
    it('should calculate numerology profile for anonymous user', () => {
      const dto = { birthDate: '1990-03-25' };
      numerologyService.calculate.mockReturnValue(mockNumerologyProfile);

      const result = controller.calculate(dto);

      expect(result).toEqual(mockNumerologyProfile);
      expect(numerologyService.calculate).toHaveBeenCalledWith(dto);
    });

    it('should calculate with name if provided', () => {
      const dto = { birthDate: '1990-03-25', fullName: 'Juan Pérez' };
      const profileWithName = {
        ...mockNumerologyProfile,
        fullName: 'Juan Pérez',
      };
      numerologyService.calculate.mockReturnValue(profileWithName);

      const result = controller.calculate(dto);

      expect(result.fullName).toBe('Juan Pérez');
      expect(numerologyService.calculate).toHaveBeenCalledWith(dto);
    });
  });

  describe('getMyProfile', () => {
    it('should return profile for authenticated user with birthDate', async () => {
      const currentUser = { userId: 123, plan: UserPlan.FREE };
      usersService.findById.mockResolvedValue(mockUser as any);
      numerologyService.calculate.mockReturnValue(mockNumerologyProfile);

      const result = await controller.getMyProfile(currentUser);

      expect(result).toEqual(mockNumerologyProfile);
      expect(usersService.findById).toHaveBeenCalledWith(123);
    });

    it('should throw NotFoundException if user not found', async () => {
      const currentUser = { userId: 999, plan: UserPlan.FREE };
      usersService.findById.mockResolvedValue(null);

      await expect(controller.getMyProfile(currentUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getMyProfile(currentUser)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('should throw BadRequestException if user has no birthDate', async () => {
      const currentUser = { userId: 123, plan: UserPlan.FREE };
      const userWithoutBirthDate = { ...mockUser, birthDate: null };
      usersService.findById.mockResolvedValue(userWithoutBirthDate as any);

      await expect(controller.getMyProfile(currentUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getMyProfile(currentUser)).rejects.toThrow(
        'Configura tu fecha de nacimiento para ver tu perfil numerológico',
      );
    });
  });

  describe('interpretMyProfile', () => {
    it('should generate new interpretation for premium user', async () => {
      const currentUser = { userId: 123, plan: UserPlan.PREMIUM };
      usersService.findById.mockResolvedValue(mockUser as any);
      numerologyService.getExistingInterpretation.mockResolvedValue(null);
      numerologyService.generateAndSaveInterpretation.mockResolvedValue(
        mockInterpretation as any,
      );

      const result = await controller.interpretMyProfile(currentUser);

      expect(result).toEqual(expectedInterpretationDto);
      expect(numerologyService.getExistingInterpretation).toHaveBeenCalledWith(
        123,
      );
      expect(
        numerologyService.generateAndSaveInterpretation,
      ).toHaveBeenCalled();
    });

    it('should return existing interpretation if already exists', async () => {
      const currentUser = { userId: 123, plan: UserPlan.PREMIUM };
      usersService.findById.mockResolvedValue(mockUser as any);
      numerologyService.getExistingInterpretation.mockResolvedValue(
        mockInterpretation as any,
      );

      const result = await controller.interpretMyProfile(currentUser);

      expect(result).toEqual(expectedInterpretationDto);
      expect(numerologyService.getExistingInterpretation).toHaveBeenCalledWith(
        123,
      );
      expect(
        numerologyService.generateAndSaveInterpretation,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user has no birthDate', async () => {
      const currentUser = { userId: 123, plan: UserPlan.PREMIUM };
      const userWithoutBirthDate = { ...mockUser, birthDate: null };
      usersService.findById.mockResolvedValue(userWithoutBirthDate as any);

      await expect(controller.interpretMyProfile(currentUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.interpretMyProfile(currentUser)).rejects.toThrow(
        'Configura tu fecha de nacimiento para ver tu perfil numerológico',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const currentUser = { userId: 999, plan: UserPlan.PREMIUM };
      usersService.findById.mockResolvedValue(null);

      await expect(controller.interpretMyProfile(currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllMeanings', () => {
    it('should return all 12 meanings (1-9, 11, 22, 33)', () => {
      const validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
      numerologyService.getInterpretation.mockImplementation((num) => {
        if (validNumbers.includes(num)) {
          return { ...mockMeaning, number: num };
        }
        return null;
      });

      const result = controller.getAllMeanings();

      expect(result).toHaveLength(12);
      expect(result.map((m) => m.number)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33,
      ]);
    });
  });

  describe('getMeaning', () => {
    it('should return meaning for valid number', () => {
      numerologyService.getInterpretation.mockReturnValue(mockMeaning);

      const result = controller.getMeaning(7);

      expect(result).toEqual(mockMeaning);
      expect(numerologyService.getInterpretation).toHaveBeenCalledWith(7);
    });

    it('should throw NotFoundException if meaning not found', () => {
      numerologyService.getInterpretation.mockReturnValue(null);

      expect(() => controller.getMeaning(7)).toThrow(NotFoundException);
      expect(() => controller.getMeaning(7)).toThrow(
        'Significado del número 7 no encontrado',
      );
    });

    it('should throw BadRequestException for invalid number', () => {
      expect(() => controller.getMeaning(99)).toThrow(BadRequestException);
      expect(() => controller.getMeaning(99)).toThrow(
        'Número inválido. Debe ser 1-9, 11, 22 o 33',
      );
    });

    it('should throw BadRequestException for negative number', () => {
      expect(() => controller.getMeaning(-1)).toThrow(BadRequestException);
    });

    it('should accept master numbers (11, 22, 33)', () => {
      numerologyService.getInterpretation.mockReturnValue({
        ...mockMeaning,
        number: 11,
        isMaster: true,
      });

      const result = controller.getMeaning(11);

      expect(result.isMaster).toBe(true);
    });
  });

  describe('getDayNumber', () => {
    it('should return day number for today', () => {
      const today = new Date();
      const dayNum = calculateDayNumber(today);
      numerologyService.getInterpretation.mockReturnValue({
        ...mockMeaning,
        number: dayNum,
      });

      const result = controller.getDayNumber();

      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('dayNumber', dayNum);
      expect(result).toHaveProperty('meaning');
      expect(result.dayNumber).toBeGreaterThanOrEqual(1);
      expect(result.dayNumber).toBeLessThanOrEqual(9);
    });

    it('should include meaning in response', () => {
      const today = new Date();
      const dayNum = calculateDayNumber(today);
      numerologyService.getInterpretation.mockReturnValue({
        ...mockMeaning,
        number: dayNum,
      });

      const result = controller.getDayNumber();

      expect(result.meaning).toBeDefined();
      expect(result.meaning?.number).toBe(result.dayNumber);
    });

    it('should handle missing meaning gracefully', () => {
      numerologyService.getInterpretation.mockReturnValue(null);

      const result = controller.getDayNumber();

      expect(result.meaning).toBeNull();
    });
  });
});
