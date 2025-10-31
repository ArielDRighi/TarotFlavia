import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotReading } from './entities/tarot-reading.entity';
import { User } from '../../users/entities/user.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { CreateReadingDto } from './dto/create-reading.dto';

@Injectable()
export class ReadingsService {
  constructor(
    @InjectRepository(TarotReading)
    private readingsRepository: Repository<TarotReading>,
  ) {}

  async create(
    user: User,
    createReadingDto: CreateReadingDto,
  ): Promise<TarotReading> {
    // Determinar tipo de pregunta y establecer campos apropiados
    const questionType = createReadingDto.predefinedQuestionId
      ? ('predefined' as const)
      : ('custom' as const);

    const reading = this.readingsRepository.create({
      predefinedQuestionId: createReadingDto.predefinedQuestionId || null,
      customQuestion: createReadingDto.customQuestion || null,
      questionType,
      user,
      deck: { id: createReadingDto.deckId } as Pick<TarotDeck, 'id'>,
      cardPositions: createReadingDto.cardPositions,
      interpretation: createReadingDto.generateInterpretation
        ? 'Interpretation will be generated'
        : null,
    });

    return await this.readingsRepository.save(reading);
  }

  async findAll(userId: number): Promise<TarotReading[]> {
    return this.readingsRepository.find({
      where: { user: { id: userId } },
      relations: ['deck', 'cards', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    id: number,
    userId: number,
    isAdmin = false,
  ): Promise<TarotReading> {
    const reading = await this.readingsRepository.findOne({
      where: { id },
      relations: ['deck', 'cards', 'user'],
    });

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    if (!isAdmin && reading.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this reading',
      );
    }

    return reading;
  }

  async update(
    id: number,
    userId: number,
    updateData: Partial<TarotReading>,
  ): Promise<TarotReading> {
    const reading = await this.findOne(id, userId);

    Object.assign(reading, updateData);

    return this.readingsRepository.save(reading);
  }

  async remove(id: number, userId: number): Promise<void> {
    const reading = await this.findOne(id, userId);

    // Soft delete using TypeORM's DeleteDateColumn
    reading.deletedAt = new Date();
    await this.readingsRepository.save(reading);
  }
}
