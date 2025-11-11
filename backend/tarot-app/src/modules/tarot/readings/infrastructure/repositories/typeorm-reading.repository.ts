import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IReadingRepository,
  PaginationOptions,
} from '../../domain/interfaces/reading-repository.interface';
import { TarotReading } from '../../entities/tarot-reading.entity';

@Injectable()
export class TypeOrmReadingRepository implements IReadingRepository {
  constructor(
    @InjectRepository(TarotReading)
    private readonly readingRepo: Repository<TarotReading>,
  ) {}

  async create(reading: Partial<TarotReading>): Promise<TarotReading> {
    const newReading = this.readingRepo.create(reading);
    return this.readingRepo.save(newReading);
  }

  async findById(
    id: number,
    relations: string[] = ['deck', 'user', 'cards', 'interpretations'],
  ): Promise<TarotReading | null> {
    return this.readingRepo.findOne({
      where: { id },
      relations,
    });
  }

  async findByUserId(
    userId: number,
    options?: PaginationOptions,
  ): Promise<[TarotReading[], number]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      filters,
      dateFrom,
      dateTo,
    } = options || {};

    const skip = (page - 1) * limit;

    const query = this.readingRepo
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.deck', 'deck')
      .leftJoinAndSelect('reading.cards', 'cards')
      .leftJoinAndSelect('reading.user', 'user')
      .leftJoinAndSelect('reading.category', 'category')
      .where('reading.userId = :userId', { userId })
      .andWhere('reading.deletedAt IS NULL')
      .orderBy(`reading.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    // Aplicar filtros adicionales si existen
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.andWhere(`reading.${key} = :${key}`, {
          [key]: value as string | number | boolean,
        });
      });
    }

    // Aplicar filtros de fecha
    if (dateFrom) {
      query.andWhere('reading.createdAt >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      query.andWhere('reading.createdAt <= :dateTo', { dateTo });
    }

    return query.getManyAndCount();
  }

  async findAll(
    options?: PaginationOptions,
  ): Promise<[TarotReading[], number]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      filters,
    } = options || {};

    const skip = (page - 1) * limit;

    const query = this.readingRepo
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.deck', 'deck')
      .leftJoinAndSelect('reading.cards', 'cards')
      .leftJoinAndSelect('reading.user', 'user')
      .leftJoinAndSelect('reading.category', 'category')
      .andWhere('reading.deletedAt IS NULL')
      .orderBy(`reading.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.andWhere(`reading.${key} = :${key}`, {
          [key]: value as string | number | boolean,
        });
      });
    }

    return query.getManyAndCount();
  }

  async findTrashed(userId: number): Promise<TarotReading[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.readingRepo
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.deck', 'deck')
      .leftJoinAndSelect('reading.cards', 'cards')
      .leftJoinAndSelect('reading.category', 'category')
      .where('reading.userId = :userId', { userId })
      .andWhere('reading.deletedAt IS NOT NULL')
      .andWhere('reading.deletedAt > :thirtyDaysAgo', { thirtyDaysAgo })
      .withDeleted()
      .orderBy('reading.deletedAt', 'DESC')
      .getMany();
  }

  async findAllForAdmin(
    includeDeleted = false,
  ): Promise<[TarotReading[], number]> {
    const query = this.readingRepo
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.deck', 'deck')
      .leftJoinAndSelect('reading.cards', 'cards')
      .leftJoinAndSelect('reading.user', 'user')
      .leftJoinAndSelect('reading.category', 'category')
      .orderBy('reading.createdAt', 'DESC')
      .take(50);

    if (includeDeleted) {
      query.withDeleted();
    }

    return query.getManyAndCount();
  }

  async update(id: number, data: Partial<TarotReading>): Promise<TarotReading> {
    // TypeORM update requiere un tipo específico, usamos any para simplificar
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.readingRepo.update(id, data as any);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Reading with ID ${id} not found after update`);
    }
    return updated;
  }

  async softDelete(id: number): Promise<void> {
    const reading = await this.findById(id, []);
    if (reading) {
      await this.readingRepo.softRemove(reading);
    }
  }

  async restore(id: number): Promise<void> {
    await this.readingRepo.restore({ id });
  }

  async hardDelete(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const readingsToDelete = await this.readingRepo
      .createQueryBuilder('reading')
      .where('reading.deletedAt IS NOT NULL')
      .andWhere('reading.deletedAt < :cutoffDate', { cutoffDate })
      .withDeleted()
      .getMany();

    if (readingsToDelete.length === 0) {
      return 0;
    }

    await this.readingRepo.remove(readingsToDelete);
    return readingsToDelete.length;
  }

  async findByShareToken(token: string): Promise<TarotReading | null> {
    return this.readingRepo.findOne({
      where: { sharedToken: token, isPublic: true },
      relations: ['cards', 'deck', 'category'],
    });
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.readingRepo.increment({ id }, 'viewCount', 1);
  }
}
