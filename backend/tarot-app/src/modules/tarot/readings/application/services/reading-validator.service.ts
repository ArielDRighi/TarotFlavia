import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
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
    includeDeleted = false,
  ): Promise<TarotReading> {
    const queryBuilder = this.readingRepo
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.user', 'user')
      .where('reading.id = :id', { id: readingId });

    if (includeDeleted) {
      queryBuilder.withDeleted();
    }

    const reading = await queryBuilder.getOne();

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${readingId} not found`);
    }

    // BUG FIX: Validate that reading has a user relation loaded
    if (!reading.user) {
      throw new BadRequestException(
        'Reading data is corrupted: missing user relation',
      );
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
    // BUG FIX: Validate that regenerationCount is a valid number
    if (
      reading.regenerationCount === null ||
      reading.regenerationCount === undefined ||
      typeof reading.regenerationCount !== 'number' ||
      isNaN(reading.regenerationCount)
    ) {
      throw new BadRequestException(
        'Reading data is corrupted: invalid regenerationCount',
      );
    }

    const MAX_REGENERATIONS = 3;
    if (reading.regenerationCount >= MAX_REGENERATIONS) {
      throw new HttpException(
        `Has alcanzado el máximo de regeneraciones (${MAX_REGENERATIONS}) para esta lectura`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  validateFreeUserReadingsLimit(
    totalReadings: number,
    userPlan: UserPlan,
  ): void {
    // BUG FIX: Validate that totalReadings is a valid number
    if (
      totalReadings === null ||
      totalReadings === undefined ||
      typeof totalReadings !== 'number' ||
      isNaN(totalReadings) ||
      totalReadings < 0
    ) {
      throw new BadRequestException(
        'Invalid totalReadings value: must be a non-negative number',
      );
    }

    // BUG FIX: Validate that userPlan is valid
    if (!userPlan || !Object.values(UserPlan).includes(userPlan)) {
      throw new BadRequestException('Invalid user plan');
    }

    const FREE_USER_LIMIT = 10;
    if (userPlan === UserPlan.FREE && totalReadings >= FREE_USER_LIMIT) {
      throw new ForbiddenException(
        `Los usuarios free están limitados a ${FREE_USER_LIMIT} lecturas`,
      );
    }
  }
}
