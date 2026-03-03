import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EncyclopediaTarotCard } from '../../entities/encyclopedia-tarot-card.entity';
import { ArcanaType, Suit } from '../../enums/tarot.enums';
import { CardFiltersDto } from '../dto/card-filters.dto';
import { CardDetailDto, CardSummaryDto } from '../dto/card-response.dto';

/**
 * DTO de navegación entre cartas
 * Permite avanzar/retroceder en el listado ordenado de la enciclopedia
 */
export interface CardNavigationDto {
  previous: CardSummaryDto | null;
  next: CardSummaryDto | null;
}

/**
 * Servicio de la Enciclopedia de Tarot
 *
 * Gestiona la consulta de las 78 cartas del Tarot con soporte para
 * filtros, búsqueda, detalle y navegación.
 *
 * Acceso público — sin restricciones de plan de usuario.
 */
@Injectable()
export class EncyclopediaService {
  constructor(
    @InjectRepository(EncyclopediaTarotCard)
    private readonly cardRepository: Repository<EncyclopediaTarotCard>,
  ) {}

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Retorna todas las cartas con filtros opcionales
   * Ordenadas por: arcanaType → suit → number
   */
  async findAll(filters?: CardFiltersDto): Promise<CardSummaryDto[]> {
    const qb = this.cardRepository.createQueryBuilder('card');

    if (filters?.arcanaType) {
      qb.andWhere('card.arcanaType = :arcanaType', {
        arcanaType: filters.arcanaType,
      });
    }

    if (filters?.suit) {
      qb.andWhere('card.suit = :suit', { suit: filters.suit });
    }

    if (filters?.element) {
      qb.andWhere('card.element = :element', { element: filters.element });
    }

    if (filters?.courtOnly) {
      qb.andWhere('card.courtRank IS NOT NULL');
    }

    if (filters?.search) {
      qb.andWhere('(card.nameEs ILIKE :search OR card.nameEn ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    qb.orderBy('card.arcanaType', 'ASC');
    qb.addOrderBy('card.suit', 'ASC');
    qb.addOrderBy('card.number', 'ASC');

    const cards = await qb.getMany();
    return cards.map((card) => this.toSummaryDto(card));
  }

  /**
   * Retorna solo los 22 Arcanos Mayores
   */
  async getMajorArcana(): Promise<CardSummaryDto[]> {
    return this.findAll({ arcanaType: ArcanaType.MAJOR });
  }

  /**
   * Retorna las cartas de un palo específico
   */
  async getBySuit(suit: Suit): Promise<CardSummaryDto[]> {
    return this.findAll({ suit });
  }

  /**
   * Retorna el ID de una carta dado su slug, sin incrementar el contador de vistas.
   * Usar en endpoints auxiliares (related, navigation) donde el detalle no se solicita.
   * @throws NotFoundException si el slug no existe
   */
  async findIdBySlug(slug: string): Promise<number> {
    const card = await this.cardRepository.findOne({
      where: { slug },
      select: ['id'],
    });
    if (!card) {
      throw new NotFoundException(`Carta "${slug}" no encontrada`);
    }
    return card.id;
  }

  /**
   * Retorna el detalle completo de una carta por su slug
   * Incrementa el contador de vistas
   * @throws NotFoundException si el slug no existe
   */
  async findBySlug(slug: string): Promise<CardDetailDto> {
    const card = await this.cardRepository.findOne({ where: { slug } });
    if (!card) {
      throw new NotFoundException(`Carta "${slug}" no encontrada`);
    }

    await this.incrementViewCount(card.id);
    return this.toDetailDto(card);
  }

  /**
   * Retorna el detalle completo de una carta por su ID
   * @throws NotFoundException si el ID no existe
   */
  async findById(id: number): Promise<CardDetailDto> {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException(`Carta con ID ${id} no encontrada`);
    }
    return this.toDetailDto(card);
  }

  /**
   * Retorna las cartas relacionadas de una carta por su ID
   * @throws NotFoundException si la carta no existe
   */
  async getRelatedCards(id: number): Promise<CardSummaryDto[]> {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException(`Carta con ID ${id} no encontrada`);
    }

    if (!card.relatedCards || card.relatedCards.length === 0) {
      return [];
    }

    const related = await this.cardRepository.find({
      where: { id: In(card.relatedCards) },
    });
    return related.map((c) => this.toSummaryDto(c));
  }

  /**
   * Busca cartas por término en nombre español o inglés
   */
  async search(term: string): Promise<CardSummaryDto[]> {
    return this.findAll({ search: term });
  }

  /**
   * Retorna la navegación anterior/siguiente para una carta
   * Usa el mismo orden que findAll (arcanaType → suit → number)
   * @throws NotFoundException si la carta no existe
   */
  async getNavigation(id: number): Promise<CardNavigationDto> {
    // findById valida que la carta exista y lanza NotFoundException si no
    await this.findById(id);

    const allCards = await this.findAll();
    const index = allCards.findIndex((c) => c.id === id);

    // Defensa ante inconsistencia (ej: carta recién eliminada entre llamadas)
    if (index === -1) {
      throw new NotFoundException(`Carta con ID ${id} no encontrada`);
    }

    return {
      previous: index > 0 ? allCards[index - 1] : null,
      next: index < allCards.length - 1 ? allCards[index + 1] : null,
    };
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Incrementa el view_count de la carta sin cargar la entidad completa
   */
  private async incrementViewCount(id: number): Promise<void> {
    await this.cardRepository
      .createQueryBuilder()
      .update(EncyclopediaTarotCard)
      .set({ viewCount: () => 'view_count + 1' })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * Mapea una entidad a CardSummaryDto
   * thumbnailUrl tiene fallback a imageUrl si es null
   */
  private toSummaryDto(card: EncyclopediaTarotCard): CardSummaryDto {
    return {
      id: card.id,
      slug: card.slug,
      nameEs: card.nameEs,
      arcanaType: card.arcanaType,
      number: card.number,
      suit: card.suit,
      thumbnailUrl: card.thumbnailUrl ?? card.imageUrl,
    };
  }

  /**
   * Mapea una entidad a CardDetailDto (incluye todos los campos)
   */
  private toDetailDto(card: EncyclopediaTarotCard): CardDetailDto {
    return {
      ...this.toSummaryDto(card),
      nameEn: card.nameEn,
      romanNumeral: card.romanNumeral,
      courtRank: card.courtRank,
      element: card.element,
      planet: card.planet,
      zodiacSign: card.zodiacSign,
      meaningUpright: card.meaningUpright,
      meaningReversed: card.meaningReversed,
      description: card.description,
      keywords: card.keywords,
      imageUrl: card.imageUrl,
      relatedCards: card.relatedCards,
    };
  }
}
