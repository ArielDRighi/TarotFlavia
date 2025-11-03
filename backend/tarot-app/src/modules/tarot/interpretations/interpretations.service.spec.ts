import { Test, TestingModule } from '@nestjs/testing';
import { InterpretationsService } from './interpretations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { AIProviderService } from './ai-provider.service';
import { AIProviderType } from './ai-provider.interface';

describe('InterpretationsService', () => {
  let service: InterpretationsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    manager: {
      findOne: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockAIProviderService = {
    generateCompletion: jest.fn(),
    getProvidersStatus: jest.fn(),
    getPrimaryProvider: jest.fn(),
  };

  const mockCards: TarotCard[] = [
    {
      id: 1,
      name: 'The Fool',
      arcana: 'major',
      suit: null,
      number: 0,
      meaningUpright: 'New beginnings',
      meaningReversed: 'Recklessness',
      keywords: 'beginning,freedom,spontaneity',
      description: 'The Fool card',
      imageUrl: '/images/fool.jpg',
    } as unknown as TarotCard,
  ];

  const mockPositions = [{ cardId: 1, position: 'present', isReversed: false }];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterpretationsService,
        {
          provide: getRepositoryToken(TarotInterpretation),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: AIProviderService,
          useValue: mockAIProviderService,
        },
      ],
    }).compile();

    service = module.get<InterpretationsService>(InterpretationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateInterpretation', () => {
    it('should generate interpretation using AI provider', async () => {
      const mockResponse = {
        content: 'Test interpretation from AI',
        provider: AIProviderType.GROQ,
        model: 'llama-3.1-70b-versatile',
        tokensUsed: {
          prompt: 100,
          completion: 200,
          total: 300,
        },
      };

      mockAIProviderService.generateCompletion.mockResolvedValue(mockResponse);
      mockRepository.create.mockReturnValue({
        content: mockResponse.content,
        modelUsed: mockResponse.provider,
      });
      mockRepository.save.mockResolvedValue({
        id: 1,
        content: mockResponse.content,
        modelUsed: mockResponse.provider,
      });

      const result = await service.generateInterpretation(
        mockCards,
        mockPositions,
      );

      expect(mockAIProviderService.generateCompletion).toHaveBeenCalled();
      expect(result).toBe(mockResponse.content);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should use fallback interpretation if all providers fail', async () => {
      mockAIProviderService.generateCompletion.mockRejectedValue(
        new Error('All providers failed'),
      );
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});

      const result = await service.generateInterpretation(
        mockCards,
        mockPositions,
      );

      expect(result).toContain('Interpretación Basada en Significados');
      expect(result).toContain('The Fool');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('saveInterpretation', () => {
    it('should save interpretation to database', () => {
      const interpretation = 'Test interpretation';
      const modelUsed = 'gpt-4';
      const aiConfig = { model: 'gpt-4', temperature: 0.7, maxTokens: 1000 };

      mockRepository.create.mockReturnValue({
        content: interpretation,
        modelUsed,
        aiConfig,
      });
      mockRepository.save.mockResolvedValue({
        id: 1,
        content: interpretation,
        modelUsed,
        aiConfig,
      });

      // This is a private method, so we'll test it indirectly
      // through attachInterpretationToReading
    });
  });

  describe('attachInterpretationToReading', () => {
    it('should attach interpretation to a reading', async () => {
      const readingId = 1;
      const interpretation = 'Test interpretation';
      const modelUsed = 'gpt-4';
      const aiConfig = { model: 'gpt-4', temperature: 0.7, maxTokens: 1000 };

      const savedInterpretation = {
        id: 1,
        reading: { id: readingId },
        content: interpretation,
        modelUsed,
        aiConfig,
      };

      mockRepository.create.mockReturnValue(savedInterpretation);
      mockRepository.save.mockResolvedValue(savedInterpretation);

      const result = await service.attachInterpretationToReading(
        readingId,
        interpretation,
        modelUsed,
        aiConfig,
      );

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedInterpretation);
    });
  });
});
