import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { HoroscopeGenerationService } from './horoscope-generation.service';
import { DailyHoroscope } from '../../entities/daily-horoscope.entity';
import { ZodiacSign } from '../../entities/zodiac-sign.enum';
import { AIProviderService } from '../../../ai/application/services/ai-provider.service';
import {
  AIProviderType,
  AIResponse,
} from '../../../ai/domain/interfaces/ai-provider.interface';

describe('HoroscopeGenerationService', () => {
  let service: HoroscopeGenerationService;
  let repository: jest.Mocked<Repository<DailyHoroscope>>;
  let aiProviderService: jest.Mocked<AIProviderService>;

  const mockAIResponse: AIResponse = {
    content: JSON.stringify({
      generalContent:
        'Hoy la energía cósmica te impulsa hacia nuevos horizontes.',
      areas: {
        love: {
          content: 'Es un buen día para expresar tus sentimientos.',
          score: 8,
        },
        wellness: {
          content: 'Tu energía vital está en su punto máximo.',
          score: 9,
        },
        money: {
          content: 'Oportunidades financieras pueden aparecer.',
          score: 7,
        },
      },
      luckyNumber: 7,
      luckyColor: 'Verde esmeralda',
      luckyTime: 'Media mañana',
    }),
    provider: AIProviderType.GROQ,
    model: 'llama-3.1-70b-versatile',
    tokensUsed: {
      prompt: 100,
      completion: 200,
      total: 300,
    },
    durationMs: 1500,
  };

  const mockDailyHoroscope: DailyHoroscope = {
    id: 1,
    zodiacSign: ZodiacSign.ARIES,
    horoscopeDate: new Date('2026-01-17'),
    generalContent:
      'Hoy la energía cósmica te impulsa hacia nuevos horizontes.',
    areas: {
      love: {
        content: 'Es un buen día para expresar tus sentimientos.',
        score: 8,
      },
      wellness: {
        content: 'Tu energía vital está en su punto máximo.',
        score: 9,
      },
      money: {
        content: 'Oportunidades financieras pueden aparecer.',
        score: 7,
      },
    },
    luckyNumber: 7,
    luckyColor: 'Verde esmeralda',
    luckyTime: 'Media mañana',
    aiProvider: 'groq',
    aiModel: 'llama-3.1-70b-versatile',
    tokensUsed: 300,
    generationTimeMs: 1500,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockAIProvider = {
      generateCompletion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoroscopeGenerationService,
        {
          provide: getRepositoryToken(DailyHoroscope),
          useValue: mockRepository,
        },
        {
          provide: AIProviderService,
          useValue: mockAIProvider,
        },
      ],
    }).compile();

    service = module.get<HoroscopeGenerationService>(
      HoroscopeGenerationService,
    );
    repository = module.get(getRepositoryToken(DailyHoroscope));
    aiProviderService = module.get(AIProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateForSign', () => {
    it('should generate a new horoscope when none exists', async () => {
      const date = new Date('2026-01-17');
      const sign = ZodiacSign.ARIES;

      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockDailyHoroscope);
      repository.save.mockResolvedValue(mockDailyHoroscope);

      const result = await service.generateForSign(sign, date);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          zodiacSign: sign,
        }),
      });
      expect(aiProviderService.generateCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' }),
        ]),
        null,
        null,
        {
          temperature: 0.8,
          maxTokens: 1000,
        },
      );
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockDailyHoroscope);
    });

    it('should return existing horoscope if already generated', async () => {
      const date = new Date('2026-01-17');
      const sign = ZodiacSign.ARIES;

      repository.findOne.mockResolvedValue(mockDailyHoroscope);

      const result = await service.generateForSign(sign, date);

      expect(repository.findOne).toHaveBeenCalled();
      expect(aiProviderService.generateCompletion).not.toHaveBeenCalled();
      expect(result).toEqual(mockDailyHoroscope);
    });

    it('should throw error if AI response cannot be parsed', async () => {
      const date = new Date('2026-01-17');
      const sign = ZodiacSign.ARIES;

      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue({
        ...mockAIResponse,
        content: 'invalid json',
      });

      await expect(service.generateForSign(sign, date)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should strip markdown code blocks from AI response', async () => {
      const date = new Date('2026-01-17');
      const sign = ZodiacSign.ARIES;

      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue({
        ...mockAIResponse,
        content: '```json\n' + mockAIResponse.content + '\n```',
      });
      repository.create.mockReturnValue(mockDailyHoroscope);
      repository.save.mockResolvedValue(mockDailyHoroscope);

      const result = await service.generateForSign(sign, date);

      expect(result).toEqual(mockDailyHoroscope);
    });

    it('should use current date if no date provided', async () => {
      const sign = ZodiacSign.ARIES;

      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockDailyHoroscope);
      repository.save.mockResolvedValue(mockDailyHoroscope);

      await service.generateForSign(sign);

      expect(repository.findOne).toHaveBeenCalled();
      expect(aiProviderService.generateCompletion).toHaveBeenCalled();
    });
  });

  describe('findBySignAndDate', () => {
    it('should find horoscope by sign and date', async () => {
      const date = new Date('2026-01-17');
      const sign = ZodiacSign.ARIES;

      repository.findOne.mockResolvedValue(mockDailyHoroscope);

      const result = await service.findBySignAndDate(sign, date);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          zodiacSign: sign,
        }),
      });
      expect(result).toEqual(mockDailyHoroscope);
    });

    it('should return null if horoscope not found', async () => {
      const date = new Date('2026-01-17');
      const sign = ZodiacSign.ARIES;

      repository.findOne.mockResolvedValue(null);

      const result = await service.findBySignAndDate(sign, date);

      expect(result).toBeNull();
    });
  });

  describe('findAllByDate', () => {
    it('should find all horoscopes for a specific date', async () => {
      const date = new Date('2026-01-17');
      const mockHoroscopes = [
        mockDailyHoroscope,
        { ...mockDailyHoroscope, id: 2, zodiacSign: ZodiacSign.TAURUS },
      ];

      repository.find.mockResolvedValue(mockHoroscopes);

      const result = await service.findAllByDate(date);

      expect(repository.find).toHaveBeenCalledWith({
        where: expect.any(Object),
        order: { zodiacSign: 'ASC' },
      });
      expect(result).toEqual(mockHoroscopes);
    });

    it('should return empty array if no horoscopes found', async () => {
      const date = new Date('2026-01-17');

      repository.find.mockResolvedValue([]);

      const result = await service.findAllByDate(date);

      expect(result).toEqual([]);
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count for a horoscope', async () => {
      const id = 1;
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.incrementViewCount(id);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        viewCount: expect.any(Function),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id = :id', { id });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('cleanupOldHoroscopes', () => {
    it('should delete horoscopes older than retention days', async () => {
      const retentionDays = 30;

      repository.delete.mockResolvedValue({ affected: 10, raw: {} });

      const result = await service.cleanupOldHoroscopes(retentionDays);

      expect(repository.delete).toHaveBeenCalledWith({
        horoscopeDate: expect.any(Object),
      });
      expect(result).toBe(10);
    });

    it('should return 0 if no horoscopes deleted', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      const result = await service.cleanupOldHoroscopes(30);

      expect(result).toBe(0);
    });

    it('should handle undefined affected count', async () => {
      repository.delete.mockResolvedValue({ affected: undefined, raw: {} });

      const result = await service.cleanupOldHoroscopes(30);

      expect(result).toBe(0);
    });
  });
});
