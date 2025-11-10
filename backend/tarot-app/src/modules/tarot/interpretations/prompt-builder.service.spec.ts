import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptBuilderService } from './prompt-builder.service';
import { TarotistaConfig } from '../../tarotistas/entities/tarotista-config.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { TarotistaCardMeaning } from '../../tarotistas/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../../tarotistas/entities/tarotista.entity';
import { NotFoundException } from '@nestjs/common';

describe('PromptBuilderService', () => {
  let service: PromptBuilderService;
  let tarotistaConfigRepo: Repository<TarotistaConfig>;
  let tarotCardRepo: Repository<TarotCard>;
  let tarotistaCardMeaningRepo: Repository<TarotistaCardMeaning>;
  let tarotistaRepo: Repository<Tarotista>;

  const mockTarotista = {
    id: 1,
    nombrePublico: 'Flavia',
    bio: 'Test bio',
    especialidades: ['tarot'],
    añosExperiencia: 20,
    userId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Tarotista;

  const mockConfig = {
    id: 1,
    tarotistaId: 1,
    systemPrompt: 'You are a mystical tarot reader...',
    styleConfig: {
      tone: 'empático',
      mysticism_level: 'medio',
      formality: 'informal-amigable',
    },
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    customKeywords: ['energía', 'camino'],
    additionalInstructions: null,
    version: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tarotista: mockTarotista,
  } as TarotistaConfig;

  const mockCard = {
    id: 1,
    name: 'El Loco',
    number: 0,
    category: 'arcanos_mayores',
    imageUrl: 'test.jpg',
    reversedImageUrl: 'test_reversed.jpg',
    meaningUpright: 'Nuevos comienzos, libertad',
    meaningReversed: 'Imprudencia, caos',
    description: 'Test description',
    keywords: 'aventura, libertad, espíritu libre',
    deckId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TarotCard;

  const mockCustomMeaning = {
    id: 1,
    tarotistaId: 1,
    cardId: 1,
    customMeaningUpright: 'Custom upright interpretation by tarotist',
    customMeaningReversed: 'Custom reversed interpretation by tarotist',
    customKeywords: 'custom, keywords, here',
    customDescription: 'Custom description',
    privateNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tarotista: mockTarotista,
    card: mockCard,
  } as TarotistaCardMeaning;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptBuilderService,
        {
          provide: getRepositoryToken(TarotistaConfig),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TarotCard),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(), // ← Agregar para batching
          },
        },
        {
          provide: getRepositoryToken(TarotistaCardMeaning),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(), // ← Agregar para batching
          },
        },
        {
          provide: getRepositoryToken(Tarotista),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PromptBuilderService>(PromptBuilderService);
    tarotistaConfigRepo = module.get<Repository<TarotistaConfig>>(
      getRepositoryToken(TarotistaConfig),
    );
    tarotCardRepo = module.get<Repository<TarotCard>>(
      getRepositoryToken(TarotCard),
    );
    tarotistaCardMeaningRepo = module.get<Repository<TarotistaCardMeaning>>(
      getRepositoryToken(TarotistaCardMeaning),
    );
    tarotistaRepo = module.get<Repository<Tarotista>>(
      getRepositoryToken(Tarotista),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveConfig', () => {
    it('should return active config for a tarotista', async () => {
      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(mockConfig);

      const result = await service.getActiveConfig(1);

      expect(result).toEqual(mockConfig);
      expect(tarotistaConfigRepo.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: 1, isActive: true },
      });
    });

    it('should return Flavia default config if tarotista config not found', async () => {
      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(tarotistaRepo, 'findOne').mockResolvedValue({
        ...mockTarotista,
        id: 1,
        nombrePublico: 'Flavia',
      });
      jest
        .spyOn(tarotistaConfigRepo, 'findOne')
        .mockResolvedValueOnce(mockConfig);

      const result = await service.getActiveConfig(999);

      expect(result).toEqual(mockConfig);
      expect(tarotistaRepo.findOne).toHaveBeenCalledWith({
        where: { nombrePublico: 'Flavia' },
      });
    });

    it('should throw NotFoundException if Flavia not found', async () => {
      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(tarotistaRepo, 'findOne').mockResolvedValue(null);

      await expect(service.getActiveConfig(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should cache config for 5 minutes', async () => {
      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(mockConfig);

      // Primera llamada
      await service.getActiveConfig(1);
      // Segunda llamada
      await service.getActiveConfig(1);

      // Solo debe llamar al repositorio una vez
      expect(tarotistaConfigRepo.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCardMeaning', () => {
    it('should return custom meaning when exists for upright card', async () => {
      jest
        .spyOn(tarotistaCardMeaningRepo, 'findOne')
        .mockResolvedValue(mockCustomMeaning);

      const result = await service.getCardMeaning(1, 1, false);

      expect(result).toEqual({
        meaning: 'Custom upright interpretation by tarotist',
        keywords: ['custom', 'keywords', 'here'],
        isCustom: true,
      });
      expect(tarotistaCardMeaningRepo.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: 1, cardId: 1 },
      });
    });

    it('should return custom meaning when exists for reversed card', async () => {
      jest
        .spyOn(tarotistaCardMeaningRepo, 'findOne')
        .mockResolvedValue(mockCustomMeaning);

      const result = await service.getCardMeaning(1, 1, true);

      expect(result).toEqual({
        meaning: 'Custom reversed interpretation by tarotist',
        keywords: ['custom', 'keywords', 'here'],
        isCustom: true,
      });
    });

    it('should return base meaning when custom not exists for upright card', async () => {
      jest.spyOn(tarotistaCardMeaningRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(tarotCardRepo, 'findOne').mockResolvedValue(mockCard);

      const result = await service.getCardMeaning(1, 1, false);

      expect(result).toEqual({
        meaning: 'Nuevos comienzos, libertad',
        keywords: ['aventura', 'libertad', 'espíritu libre'],
        isCustom: false,
      });
      expect(tarotCardRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return base meaning when custom not exists for reversed card', async () => {
      jest.spyOn(tarotistaCardMeaningRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(tarotCardRepo, 'findOne').mockResolvedValue(mockCard);

      const result = await service.getCardMeaning(1, 1, true);

      expect(result).toEqual({
        meaning: 'Imprudencia, caos',
        keywords: ['aventura', 'libertad', 'espíritu libre'],
        isCustom: false,
      });
    });

    it('should throw NotFoundException if card not found', async () => {
      jest.spyOn(tarotistaCardMeaningRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(tarotCardRepo, 'findOne').mockResolvedValue(null);

      await expect(service.getCardMeaning(1, 999, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('buildInterpretationPrompt', () => {
    const mockCards = [
      {
        cardId: 1,
        position: 'Presente',
        isReversed: false,
      },
    ];

    it('should build complete prompt with tarotista config', async () => {
      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(mockConfig);
      // Mock batch fetch of cards
      jest.spyOn(tarotCardRepo, 'find').mockResolvedValue([mockCard]);
      // Mock batch fetch of custom meanings
      jest
        .spyOn(tarotistaCardMeaningRepo, 'find')
        .mockResolvedValue([mockCustomMeaning]);

      const result = await service.buildInterpretationPrompt(
        1,
        mockCards,
        '¿Qué me depara el futuro?',
        'amor',
      );

      expect(result).toHaveProperty('systemPrompt');
      expect(result).toHaveProperty('userPrompt');
      expect(result).toHaveProperty('config');

      expect(result.systemPrompt).toBe(mockConfig.systemPrompt);
      expect(result.config).toEqual({
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
      });
      expect(result.userPrompt).toContain('¿Qué me depara el futuro?');
      expect(result.userPrompt).toContain('amor');
      expect(result.userPrompt).toContain('El Loco');
      expect(result.userPrompt).toContain(
        'Custom upright interpretation by tarotist',
      );
    });

    it('should use base meanings when no custom meanings exist', async () => {
      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(mockConfig);
      // Mock batch fetch - no custom meanings
      jest.spyOn(tarotCardRepo, 'find').mockResolvedValue([mockCard]);
      jest.spyOn(tarotistaCardMeaningRepo, 'find').mockResolvedValue([]);

      const result = await service.buildInterpretationPrompt(
        1,
        mockCards,
        '¿Qué me depara el futuro?',
        'amor',
      );

      expect(result.userPrompt).toContain('Nuevos comienzos, libertad');
    });

    it('should include reversed meaning for reversed cards', async () => {
      const reversedCards = [
        {
          cardId: 1,
          position: 'Presente',
          isReversed: true,
        },
      ];

      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(mockConfig);
      // Mock batch fetch with custom meanings
      jest.spyOn(tarotCardRepo, 'find').mockResolvedValue([mockCard]);
      jest
        .spyOn(tarotistaCardMeaningRepo, 'find')
        .mockResolvedValue([mockCustomMeaning]);

      const result = await service.buildInterpretationPrompt(
        1,
        reversedCards,
        'Test question',
        'general',
      );

      expect(result.userPrompt).toContain(
        'Custom reversed interpretation by tarotist',
      );
    });

    it('should handle multiple cards correctly', async () => {
      const multipleCards = [
        { cardId: 1, position: 'Pasado', isReversed: false },
        { cardId: 1, position: 'Presente', isReversed: true },
        { cardId: 1, position: 'Futuro', isReversed: false },
      ];

      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(mockConfig);
      // Mock batch fetch - find returns array with same card 3 times
      jest.spyOn(tarotCardRepo, 'find').mockResolvedValue([mockCard]);
      jest.spyOn(tarotistaCardMeaningRepo, 'find').mockResolvedValue([]);

      const result = await service.buildInterpretationPrompt(
        1,
        multipleCards,
        'Test question',
        'general',
      );

      expect(result.userPrompt).toContain('Pasado');
      expect(result.userPrompt).toContain('Presente');
      expect(result.userPrompt).toContain('Futuro');
    });
  });

  describe('clearConfigCache', () => {
    it('should clear cached config for specific tarotista', async () => {
      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(mockConfig);

      // Cachear primero
      await service.getActiveConfig(1);
      expect(tarotistaConfigRepo.findOne).toHaveBeenCalledTimes(1);

      // Limpiar cache
      service.clearConfigCache(1);

      // Debe llamar de nuevo al repositorio
      await service.getActiveConfig(1);
      expect(tarotistaConfigRepo.findOne).toHaveBeenCalledTimes(2);
    });

    it('should clear all cached configs when no tarotistaId provided', async () => {
      jest.spyOn(tarotistaConfigRepo, 'findOne').mockResolvedValue(mockConfig);

      // Cachear configs de diferentes tarotistas
      await service.getActiveConfig(1);
      await service.getActiveConfig(2);
      expect(tarotistaConfigRepo.findOne).toHaveBeenCalledTimes(2);

      // Limpiar todo el cache
      service.clearConfigCache();

      // Debe llamar de nuevo al repositorio para ambos
      await service.getActiveConfig(1);
      await service.getActiveConfig(2);
      expect(tarotistaConfigRepo.findOne).toHaveBeenCalledTimes(4);
    });
  });
});
