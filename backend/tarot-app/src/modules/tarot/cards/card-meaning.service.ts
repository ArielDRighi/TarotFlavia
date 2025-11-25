import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TarotCard } from './entities/tarot-card.entity';
import { TarotistaCardMeaning } from '../../tarotistas/entities/tarotista-card-meaning.entity';
import {
  CardMeaningResult,
  CardMeaningRequest,
} from '../../tarot-core/interfaces/card-meaning.interface';

/**
 * Service for managing card meanings with inheritance pattern:
 * - Custom meanings from tarotistas override base meanings
 * - Falls back to base card meanings when no customization exists
 * - Implements caching for performance optimization
 */
@Injectable()
export class CardMeaningService {
  private meaningCache = new Map<string, CardMeaningResult>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(
    @InjectRepository(TarotCard)
    private readonly tarotCardRepo: Repository<TarotCard>,
    @InjectRepository(TarotistaCardMeaning)
    private readonly tarotistaCardMeaningRepo: Repository<TarotistaCardMeaning>,
  ) {}

  /**
   * Get cache key for a specific card meaning
   */
  private getCacheKey(
    tarotistaId: number,
    cardId: number,
    isReversed: boolean,
  ): string {
    return `${tarotistaId}:${cardId}:${isReversed}`;
  }

  /**
   * Parse keywords from string to array
   */
  private parseKeywords(keywordsStr: string | null): string[] {
    if (!keywordsStr) return [];
    return keywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  /**
   * Get card meaning with inheritance pattern:
   * 1. Check custom meaning from tarotista
   * 2. Fall back to base card meaning
   * 3. Cache result for performance
   */
  async getCardMeaning(
    tarotistaId: number,
    cardId: number,
    isReversed: boolean,
  ): Promise<CardMeaningResult> {
    // Check cache first
    const cacheKey = this.getCacheKey(tarotistaId, cardId, isReversed);
    const cached = this.meaningCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached;
    }

    // 1. Try to get custom meaning from tarotista
    const customMeaning = await this.tarotistaCardMeaningRepo.findOne({
      where: { tarotistaId, cardId },
    });

    if (customMeaning) {
      const meaning = isReversed
        ? customMeaning.customMeaningReversed
        : customMeaning.customMeaningUpright;

      // Only use custom if the specific orientation is defined
      if (meaning) {
        const result: CardMeaningResult = {
          meaning,
          keywords: this.parseKeywords(customMeaning.customKeywords),
          isCustom: true,
          tarotistaId,
          cardId,
          isReversed,
          timestamp: Date.now(),
        };
        this.meaningCache.set(cacheKey, result);
        return result;
      }
    }

    // 2. Fall back to base card meaning
    const card = await this.tarotCardRepo.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    const result: CardMeaningResult = {
      meaning: isReversed ? card.meaningReversed : card.meaningUpright,
      keywords: this.parseKeywords(card.keywords),
      isCustom: false,
      tarotistaId,
      cardId,
      isReversed,
      timestamp: Date.now(),
    };

    this.meaningCache.set(cacheKey, result);
    return result;
  }

  /**
   * Get multiple card meanings efficiently in bulk
   * Makes only 2 DB queries regardless of number of cards
   */
  async getBulkCardMeanings(
    tarotistaId: number,
    cards: CardMeaningRequest[],
  ): Promise<CardMeaningResult[]> {
    if (cards.length === 0) {
      return [];
    }

    const results: CardMeaningResult[] = [];
    const cardIds = cards.map((c) => c.cardId);

    // Load all custom meanings for this tarotista and these cards (1 query)
    const customMeanings = await this.tarotistaCardMeaningRepo.find({
      where: { tarotistaId, cardId: In(cardIds) },
    });

    // Load all base cards (1 query)
    const baseCards = await this.tarotCardRepo.find({
      where: { id: In(cardIds) },
    });

    // Build results with inheritance pattern
    for (const { cardId, isReversed } of cards) {
      const customMeaning = customMeanings.find((cm) => cm.cardId === cardId);
      let result: CardMeaningResult | null = null;

      // Try custom meaning first
      if (customMeaning) {
        const meaning = isReversed
          ? customMeaning.customMeaningReversed
          : customMeaning.customMeaningUpright;

        if (meaning) {
          result = {
            meaning,
            keywords: this.parseKeywords(customMeaning.customKeywords),
            isCustom: true,
            tarotistaId,
            cardId,
            isReversed,
            timestamp: Date.now(),
          };
        }
      }

      // Fall back to base card if no custom found
      if (!result) {
        const baseCard = baseCards.find((bc) => bc.id === cardId);
        if (!baseCard) {
          throw new NotFoundException(`Card with ID ${cardId} not found`);
        }

        result = {
          meaning: isReversed
            ? baseCard.meaningReversed
            : baseCard.meaningUpright,
          keywords: this.parseKeywords(baseCard.keywords),
          isCustom: false,
          tarotistaId,
          cardId,
          isReversed,
          timestamp: Date.now(),
        };
      }

      results.push(result);

      // Cache the result
      const cacheKey = this.getCacheKey(tarotistaId, cardId, isReversed);
      this.meaningCache.set(cacheKey, result);
    }

    return results;
  }

  /**
   * Set or update custom meaning for a tarotista
   */
  async setCustomMeaning(
    tarotistaId: number,
    cardId: number,
    isReversed: boolean,
    meaning: string,
    keywords?: string[],
  ): Promise<TarotistaCardMeaning> {
    // Validate meaning is not empty
    if (!meaning || meaning.trim().length === 0) {
      throw new BadRequestException('Meaning cannot be empty');
    }

    // Verify card exists
    const card = await this.tarotCardRepo.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // Try to find existing custom meaning
    let customMeaning = await this.tarotistaCardMeaningRepo.findOne({
      where: { tarotistaId, cardId },
    });

    const keywordsStr = keywords?.join(', ') || null;

    if (customMeaning) {
      // Update existing
      if (isReversed) {
        customMeaning.customMeaningReversed = meaning;
      } else {
        customMeaning.customMeaningUpright = meaning;
      }
      customMeaning.customKeywords = keywordsStr;
      customMeaning.updatedAt = new Date();
    } else {
      // Create new
      customMeaning = this.tarotistaCardMeaningRepo.create({
        tarotistaId,
        cardId,
        customMeaningUpright: isReversed ? null : meaning,
        customMeaningReversed: isReversed ? meaning : null,
        customKeywords: keywordsStr,
      });
    }

    const saved = await this.tarotistaCardMeaningRepo.save(customMeaning);

    // Invalidate cache for both orientations since keywords are shared in the entity
    this.clearCache(tarotistaId, cardId, true);
    this.clearCache(tarotistaId, cardId, false);

    return saved;
  }

  /**
   * Delete custom meaning for a tarotista
   */
  async deleteCustomMeaning(
    tarotistaId: number,
    cardId: number,
    isReversed: boolean,
  ): Promise<void> {
    // For deletion, we need to check if we should delete the entire record
    // or just clear one orientation
    const customMeaning = await this.tarotistaCardMeaningRepo.findOne({
      where: { tarotistaId, cardId },
    });

    if (!customMeaning) {
      throw new NotFoundException(
        `Custom meaning not found for tarotista ${tarotistaId} and card ${cardId}`,
      );
    }

    // Check if both orientations exist
    const hasUpright = !!customMeaning.customMeaningUpright;
    const hasReversed = !!customMeaning.customMeaningReversed;

    if (isReversed) {
      if (hasUpright) {
        // Keep record but clear reversed
        customMeaning.customMeaningReversed = null;
        await this.tarotistaCardMeaningRepo.save(customMeaning);
      } else {
        // Delete entire record
        await this.tarotistaCardMeaningRepo.delete({
          tarotistaId,
          cardId,
        });
      }
    } else {
      if (hasReversed) {
        // Keep record but clear upright
        customMeaning.customMeaningUpright = null;
        await this.tarotistaCardMeaningRepo.save(customMeaning);
      } else {
        // Delete entire record
        await this.tarotistaCardMeaningRepo.delete({
          tarotistaId,
          cardId,
        });
      }
    }

    // Invalidate cache
    this.clearCache(tarotistaId, cardId, isReversed);
  }

  /**
   * Get all custom meanings for a tarotista
   */
  async getAllCustomMeanings(
    tarotistaId: number,
  ): Promise<TarotistaCardMeaning[]> {
    return this.tarotistaCardMeaningRepo.find({
      where: { tarotistaId },
      relations: ['card'],
      order: { cardId: 'ASC' },
    });
  }

  /**
   * Clear cache selectively or entirely
   */
  clearCache(
    tarotistaId?: number,
    cardId?: number,
    isReversed?: boolean,
  ): void {
    if (
      tarotistaId !== undefined &&
      cardId !== undefined &&
      isReversed !== undefined
    ) {
      // Clear specific entry
      const key = this.getCacheKey(tarotistaId, cardId, isReversed);
      this.meaningCache.delete(key);
    } else if (tarotistaId !== undefined) {
      // Clear all entries for this tarotista
      for (const key of this.meaningCache.keys()) {
        if (key.startsWith(`${tarotistaId}:`)) {
          this.meaningCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.meaningCache.clear();
    }
  }
}
