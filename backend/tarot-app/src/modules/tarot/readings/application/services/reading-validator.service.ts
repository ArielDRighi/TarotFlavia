import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { User, UserPlan } from '../../../../users/entities/user.entity';

@Injectable()
export class ReadingValidatorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TarotReading)
    private readonly readingRepo: Repository<TarotReading>,
  ) {}

  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async validateUserIsPremium(userId: number): Promise<User> {
    const user = await this.validateUser(userId);

    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'Solo los usuarios premium pueden realizar esta acción',
      );
    }

    return user;
  }

  async validateReadingOwnership(
    readingId: number,
    userId: number,
  ): Promise<TarotReading> {
    const reading = await this.readingRepo.findOne({
      where: { id: readingId },
      relations: ['user'],
    });

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${readingId} not found`);
    }

    if (reading.user.id !== userId) {
      throw new ForbiddenException('You do not own this reading');
    }

    return reading;
  }

  validateReadingNotDeleted(reading: TarotReading): void {
    if (reading.deletedAt) {
      throw new BadRequestException('Reading is deleted');
    }
  }

  validateReadingDeleted(reading: TarotReading): void {
    if (!reading.deletedAt) {
      throw new BadRequestException('Reading is not deleted');
    }
  }

  validateRegenerationCount(reading: TarotReading): void {
    const MAX_REGENERATIONS = 3;
    if (reading.regenerationCount >= MAX_REGENERATIONS) {
      throw new BadRequestException(
        `Has alcanzado el máximo de regeneraciones (${MAX_REGENERATIONS}) para esta lectura`,
      );
    }
  }

  validateFreeUserReadingsLimit(
    totalReadings: number,
    userPlan: UserPlan,
  ): void {
    const FREE_USER_LIMIT = 10;
    if (userPlan === UserPlan.FREE && totalReadings >= FREE_USER_LIMIT) {
      throw new ForbiddenException(
        `Los usuarios free están limitados a ${FREE_USER_LIMIT} lecturas`,
      );
    }
  }
}
