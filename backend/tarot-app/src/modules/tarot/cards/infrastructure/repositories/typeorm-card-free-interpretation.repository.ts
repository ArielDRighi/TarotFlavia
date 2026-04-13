import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICardFreeInterpretationRepository } from '../../domain/interfaces/card-free-interpretation-repository.interface';
import { CardFreeInterpretation } from '../../entities/card-free-interpretation.entity';

@Injectable()
export class TypeOrmCardFreeInterpretationRepository implements ICardFreeInterpretationRepository {
  constructor(
    @InjectRepository(CardFreeInterpretation)
    private readonly repo: Repository<CardFreeInterpretation>,
  ) {}

  async findByCardsAndCategory(
    cardIds: number[],
    orientations: ('upright' | 'reversed')[],
    categoryId: number,
  ): Promise<CardFreeInterpretation[]> {
    if (cardIds.length === 0 || orientations.length === 0) {
      return [];
    }

    // Construir condiciones OR: (cardId=X AND orientation=Y AND categoryId=Z) para todas las combinaciones
    const conditions = cardIds.flatMap((cardId) =>
      orientations.map((orientation) => ({
        cardId,
        categoryId,
        orientation,
      })),
    );

    return this.repo.find({ where: conditions });
  }
}
