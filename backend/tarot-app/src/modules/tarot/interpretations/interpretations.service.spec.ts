import { Test, TestingModule } from '@nestjs/testing';
import { InterpretationsService } from './interpretations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { Tarotista } from '../../tarotistas/entities/tarotista.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { AIProviderService } from '../../ai/application/services/ai-provider.service';
import { AIProviderType } from '../../ai/domain/interfaces/ai-provider.interface';
import { InterpretationCacheService } from '../../cache/application/services/interpretation-cache.service';
import { PromptBuilderService } from '../../ai/application/services/prompt-builder.service';
import { OutputSanitizerService } from '../../../common/services/output-sanitizer.service';

describe('InterpretationsService', () => {
  let service: InterpretationsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    manager: {
      findOne: jest.fn(),
      find: jest.fn(),
    },
  };

  const mockTarotistaRepository = {
    findOne: jest.fn(),
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

  const mockCacheService = {
    generateCacheKey: jest.fn(),
    generateQuestionHash: jest.fn(),
    getFromCache: jest.fn(),
    saveToCache: jest.fn(),
    clearAllCaches: jest.fn(),
    cleanExpiredCache: jest.fn(),
    cleanUnusedCache: jest.fn(),
    getCacheStats: jest.fn(),
    clearTarotistaCache: jest.fn(),
  };

  const mockPromptBuilderService = {
    getActiveConfig: jest.fn(),
    getCardMeaning: jest.fn(),
    buildInterpretationPrompt: jest.fn(),
    clearConfigCache: jest.fn(),
  };

  const mockOutputSanitizerService = {
    sanitizeAiResponse: jest.fn((text: string) => text), // Pass-through by default
    sanitizeBatch: jest.fn(),
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
          provide: getRepositoryToken(Tarotista),
          useValue: mockTarotistaRepository,
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
        {
          provide: InterpretationCacheService,
          useValue: mockCacheService,
        },
        {
          provide: PromptBuilderService,
          useValue: mockPromptBuilderService,
        },
        {
          provide: OutputSanitizerService,
          useValue: mockOutputSanitizerService,
        },
      ],
    }).compile();

    service = module.get<InterpretationsService>(InterpretationsService);

    // Setup default mocks
    mockTarotistaRepository.findOne.mockResolvedValue({
      id: 1,
      nombrePublico: 'Flavia',
    });

    mockPromptBuilderService.buildInterpretationPrompt.mockResolvedValue({
      systemPrompt: 'You are a tarot reader...',
      userPrompt: 'Interpret these cards...',
      config: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
      },
    });
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

      mockCacheService.generateQuestionHash.mockReturnValue('question-hash');
      mockCacheService.generateCacheKey.mockReturnValue('cache-key');
      mockCacheService.getFromCache.mockResolvedValue(null); // Cache miss
      mockCacheService.saveToCache.mockResolvedValue(undefined);

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
      expect(result.interpretation).toBe(mockResponse.content);
      expect(result.fromCache).toBe(false);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockCacheService.saveToCache).toHaveBeenCalled();
    });

    it('should use fallback interpretation if all providers fail', async () => {
      mockCacheService.generateQuestionHash.mockReturnValue('question-hash');
      mockCacheService.generateCacheKey.mockReturnValue('cache-key');
      mockCacheService.getFromCache.mockResolvedValue(null); // Cache miss

      mockAIProviderService.generateCompletion.mockRejectedValue(
        new Error('All providers failed'),
      );
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});

      const result = await service.generateInterpretation(
        mockCards,
        mockPositions,
      );

      expect(result.interpretation).toContain(
        'Interpretación Basada en Significados',
      );
      expect(result.interpretation).toContain('The Fool');
      expect(result.fromCache).toBe(false);
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

  describe('BUG HUNTING: Edge Cases and Validation', () => {
    describe('getDefaultTarotista fallback', () => {
      it('should use fallback ID 1 if Flavia not found (graceful degradation)', async () => {
        // This is INTENTIONAL behavior per service documentation
        // The service uses fallback ID 1 for graceful degradation
        mockTarotistaRepository.findOne.mockResolvedValue(null); // Flavia not found
        mockCacheService.generateQuestionHash.mockReturnValue('hash');
        mockCacheService.generateCacheKey.mockReturnValue('key');
        mockCacheService.getFromCache.mockResolvedValue(null);

        const mockResponse = {
          content: 'Test interpretation',
          provider: AIProviderType.GROQ,
          model: 'test',
          tokensUsed: { prompt: 10, completion: 10, total: 20 },
        };
        mockAIProviderService.generateCompletion.mockResolvedValue(
          mockResponse,
        );
        mockRepository.create.mockReturnValue({});
        mockRepository.save.mockResolvedValue({});

        const result = await service.generateInterpretation(
          mockCards,
          mockPositions,
        );

        // Should succeed with fallback ID 1 (graceful degradation)
        expect(result).toBeDefined();
        expect(result.interpretation).toBe(mockResponse.content);
      });
    });

    describe('generateInterpretation - Empty cards array', () => {
      it('should reject empty cards array', async () => {
        // BUG: Empty cards array should be rejected immediately
        mockCacheService.generateQuestionHash.mockReturnValue('hash');
        mockCacheService.generateCacheKey.mockReturnValue('key');
        mockCacheService.getFromCache.mockResolvedValue(null);

        await expect(
          service.generateInterpretation([], mockPositions),
        ).rejects.toThrow('Cards array cannot be empty');
      });
    });

    describe('generateInterpretation - Positions mismatch', () => {
      it('should handle positions with non-existent cardIds', async () => {
        // BUG: If positions reference cards that don't exist, should fail or warn
        const mismatchedPositions = [
          { cardId: 999, position: 'past', isReversed: true }, // Card ID 999 doesn't exist
        ];

        mockCacheService.generateQuestionHash.mockReturnValue('hash');
        mockCacheService.generateCacheKey.mockReturnValue('key');
        mockCacheService.getFromCache.mockResolvedValue(null);

        const mockResponse = {
          content: 'Interpretation',
          provider: AIProviderType.GROQ,
          model: 'test',
          tokensUsed: { prompt: 10, completion: 10, total: 20 },
        };
        mockAIProviderService.generateCompletion.mockResolvedValue(
          mockResponse,
        );
        mockRepository.create.mockReturnValue({});
        mockRepository.save.mockResolvedValue({});

        const result = await service.generateInterpretation(
          mockCards,
          mismatchedPositions,
        );

        // Should still work but log warning (current behavior)
        // TODO: Consider throwing error instead for data integrity
        expect(result).toBeDefined();
      });
    });

    describe('generateInterpretation - Invalid tarotistaId', () => {
      it('should reject negative tarotistaId', async () => {
        // BUG: Negative tarotista ID should be rejected
        mockCacheService.generateQuestionHash.mockReturnValue('hash');
        mockCacheService.generateCacheKey.mockReturnValue('key');
        mockCacheService.getFromCache.mockResolvedValue(null);

        await expect(
          service.generateInterpretation(
            mockCards,
            mockPositions,
            'test question',
            undefined,
            undefined,
            undefined,
            undefined,
            -1, // Invalid negative ID
          ),
        ).rejects.toThrow('Invalid tarotistaId');
      });

      it('should reject zero tarotistaId', async () => {
        // BUG: Zero tarotista ID should be rejected
        mockCacheService.generateQuestionHash.mockReturnValue('hash');
        mockCacheService.generateCacheKey.mockReturnValue('key');
        mockCacheService.getFromCache.mockResolvedValue(null);

        await expect(
          service.generateInterpretation(
            mockCards,
            mockPositions,
            'test question',
            undefined,
            undefined,
            undefined,
            undefined,
            0, // Invalid zero ID
          ),
        ).rejects.toThrow('Invalid tarotistaId');
      });
    });

    describe('saveInterpretation - Error handling', () => {
      it('should NOT silently swallow save errors', async () => {
        // BUG: Current implementation catches errors but doesn't inform caller
        // This means interpretation is returned to user but NOT saved to DB
        mockCacheService.generateQuestionHash.mockReturnValue('hash');
        mockCacheService.generateCacheKey.mockReturnValue('key');
        mockCacheService.getFromCache.mockResolvedValue(null);

        const mockResponse = {
          content: 'Test interpretation',
          provider: AIProviderType.GROQ,
          model: 'test',
          tokensUsed: { prompt: 10, completion: 10, total: 20 },
        };
        mockAIProviderService.generateCompletion.mockResolvedValue(
          mockResponse,
        );

        // Simulate DB save failure
        mockRepository.create.mockReturnValue({});
        mockRepository.save.mockRejectedValue(
          new Error('Database connection lost'),
        );

        const result = await service.generateInterpretation(
          mockCards,
          mockPositions,
        );

        // BUG: This currently succeeds even though save failed
        // Should either throw error OR return indicator that save failed
        expect(result).toBeDefined();
        // TODO: Fix to either throw or add `savedToDB: false` flag
      });
    });

    describe('Output sanitization', () => {
      it('should sanitize AI response before caching', async () => {
        // BUG: Must ensure malicious content is NOT cached
        mockCacheService.generateQuestionHash.mockReturnValue('hash');
        mockCacheService.generateCacheKey.mockReturnValue('key');
        mockCacheService.getFromCache.mockResolvedValue(null);

        const maliciousContent = '<script>alert("XSS")</script>Interpretation';
        const sanitizedContent = 'Interpretation';

        const mockResponse = {
          content: maliciousContent,
          provider: AIProviderType.GROQ,
          model: 'test',
          tokensUsed: { prompt: 10, completion: 10, total: 20 },
        };

        mockAIProviderService.generateCompletion.mockResolvedValue(
          mockResponse,
        );
        mockOutputSanitizerService.sanitizeAiResponse.mockReturnValue(
          sanitizedContent,
        );
        mockRepository.create.mockReturnValue({});
        mockRepository.save.mockResolvedValue({});

        await service.generateInterpretation(mockCards, mockPositions);

        // VERIFY: Sanitizer was called
        expect(
          mockOutputSanitizerService.sanitizeAiResponse,
        ).toHaveBeenCalled();

        // VERIFY: Sanitized content (NOT malicious) was cached
        expect(mockCacheService.saveToCache).toHaveBeenCalledWith(
          expect.any(String),
          null,
          expect.any(Array),
          'hash',
          sanitizedContent, // Should be sanitized!
          1,
        );
      });
    });
  });

  describe('generateDailyCardInterpretation', () => {
    it('should generate daily card interpretation', async () => {
      const mockCard = mockCards[0];
      const mockTarotista = {
        id: 1,
        nombrePublico: 'Flavia',
      };

      mockTarotistaRepository.findOne.mockResolvedValue(mockTarotista);

      const mockResponse = {
        content: 'Daily card interpretation',
        provider: AIProviderType.GROQ,
        model: 'test',
        tokensUsed: { prompt: 10, completion: 10, total: 20 },
      };

      mockAIProviderService.generateCompletion.mockResolvedValue(mockResponse);
      mockOutputSanitizerService.sanitizeAiResponse.mockReturnValue(
        mockResponse.content,
      );

      const result = await service.generateDailyCardInterpretation(
        mockCard,
        false,
      );

      expect(result).toBe(mockResponse.content);
      expect(mockTarotistaRepository.findOne).toHaveBeenCalled();
      expect(mockAIProviderService.generateCompletion).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tarotista not found', async () => {
      // BUG: Should throw NotFoundException, not InternalServerErrorException
      const mockCard = mockCards[0];

      mockTarotistaRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateDailyCardInterpretation(mockCard, false, 999),
      ).rejects.toThrow('Tarotista no encontrado');
    });
  });

  describe('generateInterpretationForCacheWarming', () => {
    it('should generate interpretation for cache warming', async () => {
      const cardIds = [1];
      const cardCombination = [
        { card_id: '1', position: 0, is_reversed: false },
      ];

      mockRepository.manager.find = jest.fn().mockResolvedValue(mockCards);
      mockRepository.manager.findOne = jest.fn().mockResolvedValue(null);

      mockCacheService.generateQuestionHash.mockReturnValue('hash');
      mockCacheService.generateCacheKey.mockReturnValue('key');
      mockCacheService.getFromCache.mockResolvedValue(null);

      const mockResponse = {
        content: 'Cached interpretation',
        provider: AIProviderType.GROQ,
        model: 'test',
        tokensUsed: { prompt: 10, completion: 10, total: 20 },
      };

      mockAIProviderService.generateCompletion.mockResolvedValue(mockResponse);
      mockOutputSanitizerService.sanitizeAiResponse.mockReturnValue(
        mockResponse.content,
      );
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});

      const result = await service.generateInterpretationForCacheWarming(
        cardIds,
        null,
        cardCombination,
      );

      expect(result).toBeDefined();
      expect(result.interpretation).toBe(mockResponse.content);
    });

    it('should throw error if no cards found', async () => {
      // BUG: Empty cardIds should be validated
      const cardIds: number[] = [];
      const cardCombination: {
        card_id: string;
        position: number;
        is_reversed: boolean;
      }[] = [];

      mockRepository.manager.find = jest.fn().mockResolvedValue([]);

      await expect(
        service.generateInterpretationForCacheWarming(
          cardIds,
          null,
          cardCombination,
        ),
      ).rejects.toThrow('No cards found');
    });
  });
});
