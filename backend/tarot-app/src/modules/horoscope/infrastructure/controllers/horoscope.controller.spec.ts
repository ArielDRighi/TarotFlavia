import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { HoroscopeController } from './horoscope.controller';
import { HoroscopeGenerationService } from '../../application/services/horoscope-generation.service';
import { UsersService } from '../../../users/users.service';
import { ZodiacSign } from '../../../../common/utils/zodiac.utils';
import { DailyHoroscope } from '../../entities/daily-horoscope.entity';

describe('HoroscopeController', () => {
  let controller: HoroscopeController;
  let horoscopeService: jest.Mocked<HoroscopeGenerationService>;
  let usersService: jest.Mocked<UsersService>;

  const mockDate = new Date('2026-01-17T00:00:00.000Z');

  const mockHoroscope: DailyHoroscope = {
    id: 1,
    zodiacSign: ZodiacSign.ARIES,
    horoscopeDate: mockDate,
    generalContent: 'Hoy es un gran día para Aries.',
    areas: {
      love: {
        content: 'El amor está en el aire.',
        score: 9,
      },
      wellness: {
        content: 'Tu energía está al máximo.',
        score: 8,
      },
      money: {
        content: 'Oportunidades financieras.',
        score: 7,
      },
    },
    luckyNumber: 7,
    luckyColor: 'Rojo',
    luckyTime: 'Mañana',
    aiProvider: 'groq',
    aiModel: 'llama-3.1-70b-versatile',
    tokensUsed: 500,
    generationTimeMs: 1200,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    birthDate: new Date('1990-03-25'), // Aries
    plan: { name: 'free' },
  };

  beforeEach(async () => {
    const mockHoroscopeService = {
      getTodayUTC: jest.fn(),
      findAllByDate: jest.fn(),
      findBySignAndDate: jest.fn(),
      incrementViewCount: jest.fn(),
      generateForSign: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HoroscopeController],
      providers: [
        {
          provide: HoroscopeGenerationService,
          useValue: mockHoroscopeService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<HoroscopeController>(HoroscopeController);
    horoscopeService = module.get(HoroscopeGenerationService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodayAll', () => {
    it('should return all horoscopes for today', async () => {
      const mockHoroscopes = [
        mockHoroscope,
        { ...mockHoroscope, id: 2, zodiacSign: ZodiacSign.TAURUS },
      ];

      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findAllByDate.mockResolvedValue(mockHoroscopes);

      const result = await controller.getTodayAll();

      expect(horoscopeService.getTodayUTC).toHaveBeenCalled();
      expect(horoscopeService.findAllByDate).toHaveBeenCalledWith(mockDate);
      expect(result).toHaveLength(2);
      expect(result[0].zodiacSign).toBe(ZodiacSign.ARIES);
      expect(result[1].zodiacSign).toBe(ZodiacSign.TAURUS);
    });

    it('should return empty array when no horoscopes available', async () => {
      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findAllByDate.mockResolvedValue([]);

      const result = await controller.getTodayAll();

      expect(result).toEqual([]);
    });
  });

  describe('getTodayBySign', () => {
    it('should return horoscope for specific sign', async () => {
      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findBySignAndDate.mockResolvedValue(mockHoroscope);
      horoscopeService.incrementViewCount.mockResolvedValue(undefined);

      const result = await controller.getTodayBySign(ZodiacSign.ARIES);

      expect(horoscopeService.getTodayUTC).toHaveBeenCalled();
      expect(horoscopeService.findBySignAndDate).toHaveBeenCalledWith(
        ZodiacSign.ARIES,
        mockDate,
      );
      expect(horoscopeService.incrementViewCount).toHaveBeenCalledWith(1);
      expect(result.zodiacSign).toBe(ZodiacSign.ARIES);
    });

    it('should throw NotFoundException when horoscope not found', async () => {
      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findBySignAndDate.mockResolvedValue(null);

      await expect(controller.getTodayBySign(ZodiacSign.ARIES)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should increment view count asynchronously', async () => {
      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findBySignAndDate.mockResolvedValue(mockHoroscope);
      horoscopeService.incrementViewCount.mockResolvedValue(undefined);

      await controller.getTodayBySign(ZodiacSign.ARIES);

      expect(horoscopeService.incrementViewCount).toHaveBeenCalledWith(1);
    });

    it('should not fail if incrementViewCount throws error', async () => {
      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findBySignAndDate.mockResolvedValue(mockHoroscope);
      horoscopeService.incrementViewCount.mockRejectedValue(
        new Error('Database error'),
      );

      // No debe lanzar error, es fire-and-forget
      const result = await controller.getTodayBySign(ZodiacSign.ARIES);

      expect(result).toBeDefined();
      expect(result.zodiacSign).toBe(ZodiacSign.ARIES);
    });
  });

  describe('getMySignHoroscope', () => {
    it('should return horoscope for authenticated user', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);
      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findBySignAndDate.mockResolvedValue(mockHoroscope);
      horoscopeService.incrementViewCount.mockResolvedValue(undefined);

      const result = await controller.getMySignHoroscope({ userId: 1 });

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(horoscopeService.findBySignAndDate).toHaveBeenCalledWith(
        ZodiacSign.ARIES,
        mockDate,
      );
      expect(result.zodiacSign).toBe(ZodiacSign.ARIES);
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        controller.getMySignHoroscope({ userId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user has no birth date', async () => {
      const userWithoutBirthDate = { ...mockUser, birthDate: null };
      usersService.findById.mockResolvedValue(userWithoutBirthDate as any);

      await expect(
        controller.getMySignHoroscope({ userId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when horoscope not available', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);
      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findBySignAndDate.mockResolvedValue(null);

      await expect(
        controller.getMySignHoroscope({ userId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByDate', () => {
    it('should return horoscopes for specific date', async () => {
      const dateStr = '2026-01-17';
      const mockHoroscopes = [mockHoroscope];

      horoscopeService.findAllByDate.mockResolvedValue(mockHoroscopes);

      const result = await controller.getByDate(dateStr);

      expect(horoscopeService.findAllByDate).toHaveBeenCalledWith(
        new Date(dateStr),
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array for date without horoscopes', async () => {
      const dateStr = '2026-01-17';

      horoscopeService.findAllByDate.mockResolvedValue([]);

      const result = await controller.getByDate(dateStr);

      expect(result).toEqual([]);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      const invalidDate = 'not-a-date';

      await expect(controller.getByDate(invalidDate)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getByDateAndSign', () => {
    it('should return horoscope for specific date and sign', async () => {
      const dateStr = '2026-01-17';

      horoscopeService.findBySignAndDate.mockResolvedValue(mockHoroscope);
      horoscopeService.incrementViewCount.mockResolvedValue(undefined);

      const result = await controller.getByDateAndSign(
        dateStr,
        ZodiacSign.ARIES,
      );

      expect(horoscopeService.findBySignAndDate).toHaveBeenCalledWith(
        ZodiacSign.ARIES,
        new Date(dateStr),
      );
      // Verificar que se incrementa el contador de vistas
      expect(horoscopeService.incrementViewCount).toHaveBeenCalledWith(
        mockHoroscope.id,
      );
      expect(result.zodiacSign).toBe(ZodiacSign.ARIES);
    });

    it('should throw NotFoundException when horoscope not found', async () => {
      const dateStr = '2026-01-17';

      horoscopeService.findBySignAndDate.mockResolvedValue(null);

      await expect(
        controller.getByDateAndSign(dateStr, ZodiacSign.ARIES),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid date', async () => {
      const invalidDate = 'invalid-date';

      await expect(
        controller.getByDateAndSign(invalidDate, ZodiacSign.ARIES),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('toResponseDto', () => {
    it('should transform entity to DTO correctly', async () => {
      horoscopeService.getTodayUTC.mockReturnValue(mockDate);
      horoscopeService.findAllByDate.mockResolvedValue([mockHoroscope]);

      const result = await controller.getTodayAll();

      expect(result[0]).toEqual({
        id: 1,
        zodiacSign: ZodiacSign.ARIES,
        horoscopeDate: '2026-01-17',
        generalContent: 'Hoy es un gran día para Aries.',
        areas: mockHoroscope.areas,
        luckyNumber: 7,
        luckyColor: 'Rojo',
        luckyTime: 'Mañana',
      });
    });
  });
});
