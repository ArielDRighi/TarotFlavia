import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TarotistaConfig } from '../../../tarotistas/entities/tarotista-config.entity';
import { TarotCard } from '../../../tarot/cards/entities/tarot-card.entity';
import { TarotistaCardMeaning } from '../../../tarotistas/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../../../tarotistas/entities/tarotista.entity';

interface CardMeaning {
  meaning: string;
  keywords: string[];
  isCustom: boolean;
}

interface InterpretationPrompt {
  systemPrompt: string;
  userPrompt: string;
  config: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
}

interface SelectedCard {
  cardId: number;
  position: string;
  isReversed: boolean;
}

/**
 * Service responsible for building dynamic prompts based on tarotista configuration
 * This is the core of the marketplace differentiation: each tarotista can have their own
 * unique prompt configuration, card meanings, and AI parameters
 */
@Injectable()
export class PromptBuilderService {
  private readonly logger = new Logger(PromptBuilderService.name);
  private configCache = new Map<
    number,
    { config: TarotistaConfig; timestamp: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(TarotistaConfig)
    private tarotistaConfigRepo: Repository<TarotistaConfig>,
    @InjectRepository(TarotCard)
    private tarotCardRepo: Repository<TarotCard>,
    @InjectRepository(TarotistaCardMeaning)
    private tarotistaCardMeaningRepo: Repository<TarotistaCardMeaning>,
    @InjectRepository(Tarotista)
    private tarotistaRepo: Repository<Tarotista>,
  ) {}

  /**
   * Get active configuration for a tarotista
   * Falls back to Flavia's default config if not found
   * Caches configs for 5 minutes to reduce DB queries
   */
  async getActiveConfig(tarotistaId: number): Promise<TarotistaConfig> {
    // Check cache first
    const cached = this.configCache.get(tarotistaId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Config cache HIT for tarotista ${tarotistaId}`);
      return cached.config;
    }

    this.logger.debug(`Config cache MISS for tarotista ${tarotistaId}`);

    // Try to find config for this tarotista
    let config = await this.tarotistaConfigRepo.findOne({
      where: { tarotistaId, isActive: true },
    });

    // If not found, fallback to Flavia's config
    if (!config) {
      this.logger.warn(
        `No active config found for tarotista ${tarotistaId}, falling back to Flavia`,
      );

      const flavia = await this.tarotistaRepo.findOne({
        where: { nombrePublico: 'Flavia' },
      });

      if (!flavia) {
        throw new NotFoundException(
          'Default tarotista (Flavia) not found in database',
        );
      }

      config = await this.tarotistaConfigRepo.findOne({
        where: { tarotistaId: flavia.id, isActive: true },
      });

      if (!config) {
        throw new NotFoundException(
          'Default config for Flavia not found in database',
        );
      }
    }

    // Cache the config
    this.configCache.set(tarotistaId, {
      config,
      timestamp: Date.now(),
    });

    return config;
  }

  /**
   * Get card meaning for a specific tarotista
   * Returns custom meaning if exists, otherwise returns base meaning from TarotCard
   * @param tarotistaId - ID of the tarotista
   * @param cardId - ID of the card
   * @param isReversed - Whether the card is reversed
   * @returns CardMeaning object with meaning text, keywords, and custom flag
   */
  async getCardMeaning(
    tarotistaId: number,
    cardId: number,
    isReversed: boolean,
  ): Promise<CardMeaning> {
    // Try to find custom meaning first
    const customMeaning = await this.tarotistaCardMeaningRepo.findOne({
      where: { tarotistaId, cardId },
    });

    if (customMeaning) {
      const meaning = isReversed
        ? customMeaning.customMeaningReversed
        : customMeaning.customMeaningUpright;

      // If custom meaning exists for this orientation
      if (meaning) {
        return {
          meaning,
          keywords: customMeaning.customKeywords
            ? customMeaning.customKeywords.split(',').map((k) => k.trim())
            : [],
          isCustom: true,
        };
      }
    }

    // Fallback to base card meaning
    const card = await this.tarotCardRepo.findOne({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    return {
      meaning: isReversed ? card.meaningReversed : card.meaningUpright,
      keywords: card.keywords.split(',').map((k) => k.trim()),
      isCustom: false,
    };
  }

  /**
   * Build complete interpretation prompt for a tarotista
   * Loads tarotista config, gets card meanings (custom or base), and constructs prompts
   * Optimized to avoid N+1 queries by batching all database calls
   * @param tarotistaId - ID of the tarotista
   * @param cards - Array of selected cards with positions
   * @param question - User's question
   * @param category - Reading category
   * @returns InterpretationPrompt with system prompt, user prompt, and AI config
   */
  async buildInterpretationPrompt(
    tarotistaId: number,
    cards: SelectedCard[],
    question: string,
    category: string,
  ): Promise<InterpretationPrompt> {
    // Load tarotista configuration
    const config = await this.getActiveConfig(tarotistaId);

    // Batch-fetch all card entities to avoid N+1 queries
    const cardIds = cards.map((card) => card.cardId);
    const cardEntities = await this.tarotCardRepo.find({
      where: { id: In(cardIds) },
    });

    // Create a map for O(1) lookup: cardId -> TarotCard
    const cardEntityMap = new Map(cardEntities.map((card) => [card.id, card]));

    // Batch-fetch all custom meanings for this tarotista and these cards
    const customMeanings = await this.tarotistaCardMeaningRepo.find({
      where: {
        tarotistaId,
        cardId: In(cardIds),
      },
    });

    // Create a map for O(1) lookup: cardId -> TarotistaCardMeaning
    const customMeaningMap = new Map(
      customMeanings.map((meaning) => [meaning.cardId, meaning]),
    );

    // Build user prompt with card meanings
    let userPrompt = `# CONTEXTO DE LA LECTURA\n\n`;
    userPrompt += `**Pregunta del Consultante**: "${question}"\n`;
    userPrompt += `**Categoría**: ${category}\n\n`;
    userPrompt += `# CARTAS EN LA LECTURA\n\n`;

    // Process each card using pre-fetched data
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardEntity = cardEntityMap.get(card.cardId);

      if (!cardEntity) {
        throw new NotFoundException(`Card with ID ${card.cardId} not found`);
      }

      // Get meaning: prefer custom, fallback to base
      const customMeaning = customMeaningMap.get(card.cardId);
      let cardMeaning: CardMeaning;

      if (customMeaning) {
        const meaning = card.isReversed
          ? customMeaning.customMeaningReversed
          : customMeaning.customMeaningUpright;

        // If custom meaning exists for this orientation
        if (meaning) {
          cardMeaning = {
            meaning,
            keywords: customMeaning.customKeywords
              ? customMeaning.customKeywords.split(',').map((k) => k.trim())
              : [],
            isCustom: true,
          };
        } else {
          // Custom meaning exists but not for this orientation, use base
          cardMeaning = {
            meaning: card.isReversed
              ? cardEntity.meaningReversed
              : cardEntity.meaningUpright,
            keywords: cardEntity.keywords.split(',').map((k) => k.trim()),
            isCustom: false,
          };
        }
      } else {
        // No custom meaning, use base card meaning
        cardMeaning = {
          meaning: card.isReversed
            ? cardEntity.meaningReversed
            : cardEntity.meaningUpright,
          keywords: cardEntity.keywords.split(',').map((k) => k.trim()),
          isCustom: false,
        };
      }

      const orientation = card.isReversed ? 'Invertida ↓' : 'Derecha ↑';

      userPrompt += `## Posición ${i + 1}: ${card.position}\n`;
      userPrompt += `**Carta**: ${cardEntity.name} (${orientation})\n`;
      userPrompt += `**Significado**: ${cardMeaning.meaning}\n`;
      userPrompt += `**Palabras Clave**: ${cardMeaning.keywords.join(', ')}\n`;

      if (cardMeaning.isCustom) {
        userPrompt += `_[Significado personalizado del tarotista]_\n`;
      }

      userPrompt += `\n---\n\n`;
    }

    userPrompt += `# INSTRUCCIONES FINALES\n\n`;
    userPrompt += `Por favor interpreta esta lectura considerando:\n\n`;
    userPrompt += `1. El significado específico de cada carta en su posición asignada\n`;
    userPrompt += `2. La relación entre las cartas y su flujo temporal/energético\n`;
    userPrompt += `3. Cómo responden a la pregunta "${question}"\n`;
    userPrompt += `4. La categoría "${category}" para enfocar la interpretación\n\n`;

    return {
      systemPrompt: config.systemPrompt,
      userPrompt,
      config: {
        temperature: Number(config.temperature),
        maxTokens: config.maxTokens,
        topP: Number(config.topP),
      },
    };
  }

  /**
   * Clear cached config for a specific tarotista or all configs
   * Useful when tarotista updates their configuration
   * @param tarotistaId - Optional ID of tarotista to clear cache for
   */
  clearConfigCache(tarotistaId?: number): void {
    if (tarotistaId) {
      this.configCache.delete(tarotistaId);
      this.logger.log(`Cleared config cache for tarotista ${tarotistaId}`);
    } else {
      this.configCache.clear();
      this.logger.log('Cleared all config cache');
    }
  }
}
