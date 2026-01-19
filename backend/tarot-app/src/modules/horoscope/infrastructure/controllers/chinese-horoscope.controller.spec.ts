import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChineseHoroscopeController } from './chinese-horoscope.controller';
import { ChineseHoroscopeService } from '../../application/services/chinese-horoscope.service';
import { UsersService } from '../../../users/users.service';
import { ChineseZodiacAnimal } from '../../../../common/utils/chinese-zodiac.utils';
import { ChineseHoroscope } from '../../entities/chinese-horoscope.entity';

describe('ChineseHoroscopeController', () => {
  let controller: ChineseHoroscopeController;
  let chineseService: jest.Mocked<ChineseHoroscopeService>;
  let usersService: jest.Mocked<UsersService>;

  const mockChineseHoroscope: ChineseHoroscope = {
    id: 1,
    animal: ChineseZodiacAnimal.DRAGON,
    year: 2026,
    generalOverview: 'Un año de transformación para el Dragón.',
    areas: {
      love: { content: 'El amor florecerá este año.', score: 8 },
      career: { content: 'Oportunidades profesionales abundan.', score: 9 },
      wellness: { content: 'Mantén tu energía alta.', score: 7 },
      finance: { content: 'Estabilidad financiera.', score: 8 },
    },
    luckyElements: {
      numbers: [3, 7, 9],
      colors: ['Rojo', 'Dorado'],
      directions: ['Sur', 'Este'],
      months: [3, 6, 9],
    },
    compatibility: {
      best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY],
      good: [ChineseZodiacAnimal.ROOSTER],
      challenging: [ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.RABBIT],
    },
    monthlyHighlights: 'Marzo y junio serán meses clave.',
    aiProvider: 'groq',
    aiModel: 'llama-3.1-70b-versatile',
    tokensUsed: 1200,
    generationTimeMs: 2500,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    birthDate: '1988-03-15', // Dragón
    plan: { name: 'free' },
  };

  beforeEach(async () => {
    const mockChineseService = {
      findByAnimalAndYear: jest.fn(),
      findAllByYear: jest.fn(),
      findForUser: jest.fn(),
      generateAllForYear: jest.fn(),
      incrementViewCount: jest.fn().mockResolvedValue(undefined),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChineseHoroscopeController],
      providers: [
        {
          provide: ChineseHoroscopeService,
          useValue: mockChineseService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<ChineseHoroscopeController>(
      ChineseHoroscopeController,
    );
    chineseService = module.get(ChineseHoroscopeService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateAnimal', () => {
    it('should calculate Chinese zodiac animal from birth date', () => {
      const dto = { birthDate: '1988-03-15' };

      const result = controller.calculateAnimal(dto);

      expect(result).toBeDefined();
      expect(result.animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(result.animalInfo).toBeDefined();
      expect(result.animalInfo.nameEs).toBe('Dragón');
      expect(result.animalInfo.nameEn).toBe('Dragon');
      expect(result.animalInfo.emoji).toBe('🐉');
      expect(result.chineseYear).toBe(1988);
      // Nuevos campos Wu Xing
      expect(result.birthElement).toBe('earth');
      expect(result.birthElementEs).toBe('Tierra');
      expect(result.fixedElement).toBe('earth');
      expect(result.fullZodiacType).toBe('Dragón de Tierra');
    });

    it('should calculate correct animal for birth before Chinese New Year', () => {
      const dto = { birthDate: '1988-01-15' }; // Antes del CNY (17 de febrero)

      const result = controller.calculateAnimal(dto);

      expect(result.animal).toBe(ChineseZodiacAnimal.RABBIT);
      expect(result.chineseYear).toBe(1988); // Still 1988 as the year
    });

    it('should throw BadRequestException for invalid date format', () => {
      const dto = { birthDate: 'invalid-date' };

      expect(() => controller.calculateAnimal(dto)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllByYear', () => {
    it('should return all horoscopes for a year', async () => {
      const year = 2026;
      const mockHoroscopes = [mockChineseHoroscope];
      chineseService.findAllByYear.mockResolvedValue(mockHoroscopes);

      const result = await controller.getAllByYear(year);

      expect(result).toHaveLength(1);
      expect(result[0].animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(chineseService.findAllByYear).toHaveBeenCalledWith(year);
    });

    it('should throw BadRequestException for year out of range', async () => {
      const invalidYear = 2051;

      await expect(controller.getAllByYear(invalidYear)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for year below minimum', async () => {
      const invalidYear = 2019;

      await expect(controller.getAllByYear(invalidYear)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getByYearAndAnimal', () => {
    it('should return horoscope for specific year and animal', async () => {
      const year = 2026;
      const animal = ChineseZodiacAnimal.DRAGON;
      chineseService.findByAnimalAndYear.mockResolvedValue(
        mockChineseHoroscope,
      );

      const result = await controller.getByYearAndAnimal(year, animal);

      expect(result).toBeDefined();
      expect(result.animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(result.year).toBe(2026);
      expect(chineseService.findByAnimalAndYear).toHaveBeenCalledWith(
        animal,
        year,
      );
      expect(chineseService.incrementViewCount).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when horoscope does not exist', async () => {
      const year = 2026;
      const animal = ChineseZodiacAnimal.DRAGON;
      chineseService.findByAnimalAndYear.mockResolvedValue(null);

      await expect(controller.getByYearAndAnimal(year, animal)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyAnimalHoroscope', () => {
    it('should return horoscope for authenticated user', async () => {
      const currentUser = { userId: 1 };
      usersService.findById.mockResolvedValue(mockUser as any);
      chineseService.findForUser.mockResolvedValue(mockChineseHoroscope);

      const result = await controller.getMyAnimalHoroscope(currentUser);

      expect(result).toBeDefined();
      expect(result.animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(chineseService.findForUser).toHaveBeenCalledWith(
        expect.any(Date),
        new Date().getFullYear(),
      );
    });

    it('should use specified year when provided', async () => {
      const currentUser = { userId: 1 };
      const year = 2027;
      usersService.findById.mockResolvedValue(mockUser as any);
      chineseService.findForUser.mockResolvedValue(mockChineseHoroscope);

      await controller.getMyAnimalHoroscope(currentUser, year);

      expect(chineseService.findForUser).toHaveBeenCalledWith(
        expect.any(Date),
        year,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      const currentUser = { userId: 1 };
      usersService.findById.mockResolvedValue(null);

      await expect(
        controller.getMyAnimalHoroscope(currentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user has no birthDate', async () => {
      const currentUser = { userId: 1 };
      const userWithoutBirthDate = { ...mockUser, birthDate: null };
      usersService.findById.mockResolvedValue(userWithoutBirthDate as any);

      await expect(
        controller.getMyAnimalHoroscope(currentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when horoscope not available', async () => {
      const currentUser = { userId: 1 };
      usersService.findById.mockResolvedValue(mockUser as any);
      chineseService.findForUser.mockResolvedValue(null);

      await expect(
        controller.getMyAnimalHoroscope(currentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should increment view count', async () => {
      const currentUser = { userId: 1 };
      usersService.findById.mockResolvedValue(mockUser as any);
      chineseService.findForUser.mockResolvedValue(mockChineseHoroscope);

      await controller.getMyAnimalHoroscope(currentUser);

      expect(chineseService.incrementViewCount).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when year is below 2020', async () => {
      const currentUser = { userId: 1 };
      const invalidYear = 2019;
      usersService.findById.mockResolvedValue(mockUser as any);

      await expect(
        controller.getMyAnimalHoroscope(currentUser, invalidYear),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when year is above 2050', async () => {
      const currentUser = { userId: 1 };
      const invalidYear = 2051;
      usersService.findById.mockResolvedValue(mockUser as any);

      await expect(
        controller.getMyAnimalHoroscope(currentUser, invalidYear),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateForYear', () => {
    it('should generate horoscopes for all animals of a year (admin only)', () => {
      const year = 2027;
      const mockResult = {
        successful: 12,
        failed: 0,
        results: [],
      };
      chineseService.generateAllForYear.mockResolvedValue(mockResult as any);

      const result = controller.generateForYear(year);

      expect(result.message).toContain('2027');
      expect(result.details).toBeDefined();
      expect(chineseService.generateAllForYear).toHaveBeenCalledWith(year);
    });

    it('should throw BadRequestException for year out of range (too high)', () => {
      const invalidYear = 2051;

      expect(() => controller.generateForYear(invalidYear)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for year out of range (too low)', () => {
      const invalidYear = 2019;

      expect(() => controller.generateForYear(invalidYear)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('toResponseDto helper', () => {
    it('should correctly transform entity to DTO', async () => {
      const year = 2026;
      const animal = ChineseZodiacAnimal.DRAGON;
      chineseService.findByAnimalAndYear.mockResolvedValue(
        mockChineseHoroscope,
      );

      const result = await controller.getByYearAndAnimal(year, animal);

      // Verify DTO structure
      expect(result).toEqual({
        id: mockChineseHoroscope.id,
        animal: mockChineseHoroscope.animal,
        year: mockChineseHoroscope.year,
        generalOverview: mockChineseHoroscope.generalOverview,
        areas: mockChineseHoroscope.areas,
        luckyElements: mockChineseHoroscope.luckyElements,
        compatibility: mockChineseHoroscope.compatibility,
        monthlyHighlights: mockChineseHoroscope.monthlyHighlights,
      });

      // Verify sensitive fields are NOT exposed
      expect(result).not.toHaveProperty('aiProvider');
      expect(result).not.toHaveProperty('aiModel');
      expect(result).not.toHaveProperty('tokensUsed');
      expect(result).not.toHaveProperty('generationTimeMs');
    });
  });
});
