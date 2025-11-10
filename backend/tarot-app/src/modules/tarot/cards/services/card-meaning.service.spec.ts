import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CardMeaningService } from './card-meaning.service';
import { TarotCard } from '../entities/tarot-card.entity';
import { TarotistaCardMeaning } from '../../../tarotistas/entities/tarotista-card-meaning.entity';
import { CardMeaningRequest } from '../../../tarot-core/interfaces/card-meaning.interface';

describe('CardMeaningService', () => {
  let service: CardMeaningService;

  const mockTarotCard: TarotCard = {
    id: 1,
    name: 'The Fool',
    number: 0,
    category: 'major',
    imageUrl: '/images/fool.jpg',
    reversedImageUrl: '/images/fool-reversed.jpg',
    meaningUpright: 'Base upright meaning',
    meaningReversed: 'Base reversed meaning',
    description: 'The Fool is card 0',
    keywords: 'new beginnings, innocence, spontaneity',
    deckId: 1,
    deck: {} as TarotCard['deck'],
    readings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomMeaning: TarotistaCardMeaning = {
    id: 1,
    tarotistaId: 2,
    cardId: 1,
    customMeaningUpright: 'Custom upright interpretation',
    customMeaningReversed: 'Custom reversed interpretation',
    customKeywords: 'custom, keywords, here',
    customDescription: 'Custom description',
    privateNotes: 'Private notes',
    tarotista: {} as TarotistaCardMeaning['tarotista'],
    card: {} as TarotistaCardMeaning['card'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTarotCardRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTarotistaCardMeaningRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardMeaningService,
        {
          provide: getRepositoryToken(TarotCard),
          useValue: mockTarotCardRepo,
        },
        {
          provide: getRepositoryToken(TarotistaCardMeaning),
          useValue: mockTarotistaCardMeaningRepo,
        },
      ],
    }).compile();

    service = module.get<CardMeaningService>(CardMeaningService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clear cache after each test
    service.clearCache();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCardMeaning - Inheritance Pattern', () => {
    it('should return custom meaning when exists (upright)', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);

      const result = await service.getCardMeaning(2, 1, false);

      expect(result.isCustom).toBe(true);
      expect(result.meaning).toBe('Custom upright interpretation');
      expect(result.keywords).toEqual(['custom', 'keywords', 'here']);
      expect(result.tarotistaId).toBe(2);
      expect(result.cardId).toBe(1);
      expect(result.isReversed).toBe(false);
      expect(mockTarotistaCardMeaningRepo.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: 2, cardId: 1 },
      });
    });

    it('should return custom meaning when exists (reversed)', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);

      const result = await service.getCardMeaning(2, 1, true);

      expect(result.isCustom).toBe(true);
      expect(result.meaning).toBe('Custom reversed interpretation');
      expect(result.keywords).toEqual(['custom', 'keywords', 'here']);
      expect(result.isReversed).toBe(true);
    });

    it('should return base meaning when no custom exists (upright)', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(null);
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);

      const result = await service.getCardMeaning(3, 1, false);

      expect(result.isCustom).toBe(false);
      expect(result.meaning).toBe('Base upright meaning');
      expect(result.keywords).toEqual([
        'new beginnings',
        'innocence',
        'spontaneity',
      ]);
      expect(result.tarotistaId).toBe(3);
      expect(result.cardId).toBe(1);
      expect(result.isReversed).toBe(false);
    });

    it('should return base meaning when no custom exists (reversed)', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(null);
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);

      const result = await service.getCardMeaning(3, 1, true);

      expect(result.isCustom).toBe(false);
      expect(result.meaning).toBe('Base reversed meaning');
      // Keywords are shared in the entity, not separate for reversed
      expect(result.keywords).toEqual([
        'new beginnings',
        'innocence',
        'spontaneity',
      ]);
      expect(result.isReversed).toBe(true);
    });

    it('should throw NotFoundException when card does not exist', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(null);
      mockTarotCardRepo.findOne.mockResolvedValue(null);

      await expect(service.getCardMeaning(3, 999, false)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getCardMeaning(3, 999, false)).rejects.toThrow(
        'Card with ID 999 not found',
      );
    });

    it('should isolate meanings between tarotists', async () => {
      // Tarotist 2 has custom, tarotist 3 doesn't
      mockTarotistaCardMeaningRepo.findOne
        .mockResolvedValueOnce(mockCustomMeaning)
        .mockResolvedValueOnce(null);
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);

      const result2 = await service.getCardMeaning(2, 1, false);
      const result3 = await service.getCardMeaning(3, 1, false);

      expect(result2.isCustom).toBe(true);
      expect(result2.meaning).toBe('Custom upright interpretation');
      expect(result3.isCustom).toBe(false);
      expect(result3.meaning).toBe('Base upright meaning');
      expect(result2.meaning).not.toBe(result3.meaning);
    });

    it('should use cache on second call for same parameters', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);

      const result1 = await service.getCardMeaning(2, 1, false);
      const result2 = await service.getCardMeaning(2, 1, false);

      expect(result1).toEqual(result2);
      expect(mockTarotistaCardMeaningRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should not use cache for different tarotista', async () => {
      mockTarotistaCardMeaningRepo.findOne
        .mockResolvedValueOnce(mockCustomMeaning)
        .mockResolvedValueOnce(null);
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);

      await service.getCardMeaning(2, 1, false);
      await service.getCardMeaning(3, 1, false);

      expect(mockTarotistaCardMeaningRepo.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('getBulkCardMeanings', () => {
    const card1 = { ...mockTarotCard, id: 1, name: 'Card 1' };
    const card2 = { ...mockTarotCard, id: 2, name: 'Card 2' };
    const card3 = { ...mockTarotCard, id: 3, name: 'Card 3' };

    it('should load mix of custom and base meanings efficiently', async () => {
      const custom1 = { ...mockCustomMeaning, cardId: 1 };
      const custom2 = { ...mockCustomMeaning, cardId: 2 };

      mockTarotistaCardMeaningRepo.find.mockResolvedValue([custom1, custom2]);
      mockTarotCardRepo.find.mockResolvedValue([card1, card2, card3]);

      const requests: CardMeaningRequest[] = [
        { cardId: 1, isReversed: false },
        { cardId: 2, isReversed: false },
        { cardId: 3, isReversed: false },
      ];

      const results = await service.getBulkCardMeanings(2, requests);

      expect(results).toHaveLength(3);
      expect(results.filter((r) => r.isCustom)).toHaveLength(2);
      expect(results.filter((r) => !r.isCustom)).toHaveLength(1);
      expect(results[0].cardId).toBe(1);
      expect(results[0].isCustom).toBe(true);
      expect(results[2].cardId).toBe(3);
      expect(results[2].isCustom).toBe(false);
    });

    it('should handle all base meanings when no customs exist', async () => {
      mockTarotistaCardMeaningRepo.find.mockResolvedValue([]);
      mockTarotCardRepo.find.mockResolvedValue([card1, card2, card3]);

      const requests: CardMeaningRequest[] = [
        { cardId: 1, isReversed: false },
        { cardId: 2, isReversed: false },
        { cardId: 3, isReversed: false },
      ];

      const results = await service.getBulkCardMeanings(3, requests);

      expect(results).toHaveLength(3);
      expect(results.every((r) => !r.isCustom)).toBe(true);
    });

    it('should handle reversed cards correctly in bulk', async () => {
      mockTarotistaCardMeaningRepo.find.mockResolvedValue([]);
      mockTarotCardRepo.find.mockResolvedValue([card1]);

      const requests: CardMeaningRequest[] = [
        { cardId: 1, isReversed: false },
        { cardId: 1, isReversed: true },
      ];

      const results = await service.getBulkCardMeanings(2, requests);

      expect(results).toHaveLength(2);
      expect(results[0].isReversed).toBe(false);
      expect(results[0].meaning).toBe('Base upright meaning');
      expect(results[1].isReversed).toBe(true);
      expect(results[1].meaning).toBe('Base reversed meaning');
    });

    it('should throw NotFoundException when card not found in bulk', async () => {
      mockTarotistaCardMeaningRepo.find.mockResolvedValue([]);
      mockTarotCardRepo.find.mockResolvedValue([card1]);

      const requests: CardMeaningRequest[] = [
        { cardId: 1, isReversed: false },
        { cardId: 999, isReversed: false },
      ];

      await expect(service.getBulkCardMeanings(2, requests)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getBulkCardMeanings(2, requests)).rejects.toThrow(
        'Card 999 not found',
      );
    });

    it('should make only 2 queries regardless of number of cards', async () => {
      mockTarotistaCardMeaningRepo.find.mockResolvedValue([]);
      mockTarotCardRepo.find.mockResolvedValue([
        card1,
        card2,
        card3,
        { ...card1, id: 4 },
        { ...card1, id: 5 },
      ]);

      const requests: CardMeaningRequest[] = [
        { cardId: 1, isReversed: false },
        { cardId: 2, isReversed: false },
        { cardId: 3, isReversed: false },
        { cardId: 4, isReversed: false },
        { cardId: 5, isReversed: false },
      ];

      await service.getBulkCardMeanings(2, requests);

      expect(mockTarotistaCardMeaningRepo.find).toHaveBeenCalledTimes(1);
      expect(mockTarotCardRepo.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('setCustomMeaning', () => {
    it('should create new custom meaning when none exists', async () => {
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(null);
      mockTarotistaCardMeaningRepo.create.mockReturnValue({
        ...mockCustomMeaning,
        id: undefined,
      });
      mockTarotistaCardMeaningRepo.save.mockResolvedValue(mockCustomMeaning);

      const result = await service.setCustomMeaning(
        2,
        1,
        false,
        'New custom meaning',
        ['new', 'keywords'],
      );

      expect(result).toEqual(mockCustomMeaning);
      expect(mockTarotistaCardMeaningRepo.create).toHaveBeenCalled();
      expect(mockTarotistaCardMeaningRepo.save).toHaveBeenCalled();
    });

    it('should update existing custom meaning', async () => {
      const existing = { ...mockCustomMeaning };
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(existing);
      mockTarotistaCardMeaningRepo.save.mockResolvedValue({
        ...existing,
        customMeaningUpright: 'Updated meaning',
      });

      const result = await service.setCustomMeaning(
        2,
        1,
        false,
        'Updated meaning',
        ['updated'],
      );

      expect(result.customMeaningUpright).toBe('Updated meaning');
      expect(mockTarotistaCardMeaningRepo.create).not.toHaveBeenCalled();
      expect(mockTarotistaCardMeaningRepo.save).toHaveBeenCalled();
    });

    it('should handle reversed meanings correctly', async () => {
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);
      mockTarotistaCardMeaningRepo.save.mockResolvedValue({
        ...mockCustomMeaning,
        customMeaningReversed: 'New reversed meaning',
      });

      const result = await service.setCustomMeaning(
        2,
        1,
        true,
        'New reversed meaning',
        ['reversed'],
      );

      expect(result.customMeaningReversed).toBe('New reversed meaning');
    });

    it('should throw NotFoundException when card does not exist', async () => {
      mockTarotCardRepo.findOne.mockResolvedValue(null);

      await expect(
        service.setCustomMeaning(2, 999, false, 'meaning', []),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.setCustomMeaning(2, 999, false, 'meaning', []),
      ).rejects.toThrow('Card 999 not found');
    });

    it('should invalidate cache after setting custom meaning', async () => {
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(null);
      mockTarotistaCardMeaningRepo.create.mockReturnValue(mockCustomMeaning);
      mockTarotistaCardMeaningRepo.save.mockResolvedValue(mockCustomMeaning);

      // First get to populate cache
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValueOnce(null);
      await service.getCardMeaning(2, 1, false);

      // Set custom meaning (should clear cache)
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValueOnce(null);
      await service.setCustomMeaning(2, 1, false, 'New meaning', []);

      // Get again should hit DB, not cache
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValueOnce(
        mockCustomMeaning,
      );
      const result = await service.getCardMeaning(2, 1, false);

      expect(result.isCustom).toBe(true);
      expect(mockTarotistaCardMeaningRepo.findOne).toHaveBeenCalledTimes(3);
    });
  });

  describe('deleteCustomMeaning', () => {
    it('should delete custom meaning successfully', async () => {
      // Mock finding the custom meaning first
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue({
        ...mockCustomMeaning,
        customMeaningUpright: 'Some upright',
        customMeaningReversed: null, // Only upright exists
      });
      mockTarotistaCardMeaningRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteCustomMeaning(2, 1, false);

      expect(mockTarotistaCardMeaningRepo.delete).toHaveBeenCalledWith({
        tarotistaId: 2,
        cardId: 1,
      });
    });

    it('should throw NotFoundException when custom meaning does not exist', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(null);
      mockTarotistaCardMeaningRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteCustomMeaning(2, 999, false)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteCustomMeaning(2, 999, false)).rejects.toThrow(
        'Custom meaning not found for tarotista 2 and card 999',
      );
    });

    it('should invalidate cache after deleting custom meaning', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);
      await service.getCardMeaning(2, 1, false);

      mockTarotistaCardMeaningRepo.delete.mockResolvedValue({ affected: 1 });
      await service.deleteCustomMeaning(2, 1, false);

      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(null);
      mockTarotCardRepo.findOne.mockResolvedValue(mockTarotCard);
      const result = await service.getCardMeaning(2, 1, false);

      expect(result.isCustom).toBe(false);
    });
  });

  describe('getAllCustomMeanings', () => {
    it('should return all custom meanings for a tarotista', async () => {
      const meanings = [
        { ...mockCustomMeaning, cardId: 1 },
        { ...mockCustomMeaning, cardId: 2 },
        { ...mockCustomMeaning, cardId: 3 },
      ];
      mockTarotistaCardMeaningRepo.find.mockResolvedValue(meanings);

      const result = await service.getAllCustomMeanings(2);

      expect(result).toHaveLength(3);
      expect(mockTarotistaCardMeaningRepo.find).toHaveBeenCalledWith({
        where: { tarotistaId: 2 },
        relations: ['card'],
        order: { cardId: 'ASC' },
      });
    });

    it('should return empty array when tarotista has no custom meanings', async () => {
      mockTarotistaCardMeaningRepo.find.mockResolvedValue([]);

      const result = await service.getAllCustomMeanings(999);

      expect(result).toHaveLength(0);
    });
  });

  describe('Cache Management', () => {
    it('should clear specific cache entry', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);

      await service.getCardMeaning(2, 1, false);
      service.clearCache(2, 1, false);

      await service.getCardMeaning(2, 1, false);

      expect(mockTarotistaCardMeaningRepo.findOne).toHaveBeenCalledTimes(2);
    });

    it('should clear all entries for a tarotista', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);

      await service.getCardMeaning(2, 1, false);
      await service.getCardMeaning(2, 2, false);
      await service.getCardMeaning(2, 3, false);

      service.clearCache(2);

      await service.getCardMeaning(2, 1, false);
      await service.getCardMeaning(2, 2, false);

      expect(mockTarotistaCardMeaningRepo.findOne).toHaveBeenCalledTimes(5);
    });

    it('should clear all cache entries', async () => {
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);

      await service.getCardMeaning(2, 1, false);
      await service.getCardMeaning(3, 1, false);

      service.clearCache();

      await service.getCardMeaning(2, 1, false);

      expect(mockTarotistaCardMeaningRepo.findOne).toHaveBeenCalledTimes(3);
    });

    it('should respect cache TTL', async () => {
      jest.useFakeTimers();
      mockTarotistaCardMeaningRepo.findOne.mockResolvedValue(mockCustomMeaning);

      await service.getCardMeaning(2, 1, false);

      // Fast-forward 16 minutes (past TTL of 15 minutes)
      jest.advanceTimersByTime(16 * 60 * 1000);

      await service.getCardMeaning(2, 1, false);

      expect(mockTarotistaCardMeaningRepo.findOne).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });
});
