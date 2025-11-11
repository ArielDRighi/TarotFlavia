import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Like } from 'typeorm';
import { ICacheRepository } from '../../domain/interfaces/cache-repository.interface';
import { CachedInterpretation } from '../entities/cached-interpretation.entity';

@Injectable()
export class TypeOrmCacheRepository implements ICacheRepository {
  constructor(
    @InjectRepository(CachedInterpretation)
    private readonly cacheRepo: Repository<CachedInterpretation>,
  ) {}

  async findByKey(key: string): Promise<CachedInterpretation | null> {
    return this.cacheRepo.findOne({
      where: { cache_key: key },
    });
  }

  async save(entry: CachedInterpretation): Promise<CachedInterpretation> {
    return this.cacheRepo.save(entry);
  }

  async delete(key: string): Promise<void> {
    await this.cacheRepo.delete({ cache_key: key });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.cacheRepo.delete({
      expires_at: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const result = await this.cacheRepo.delete({
      cache_key: Like(`%${pattern}%`),
    });
    return result.affected || 0;
  }

  async deleteByTarotistaId(tarotistaId: number): Promise<number> {
    const result = await this.cacheRepo.delete({
      tarotista_id: tarotistaId,
    });
    return result.affected || 0;
  }

  async getStats(): Promise<{
    total: number;
    expired: number;
    hits: number;
    misses: number;
  }> {
    const total = await this.cacheRepo.count();
    const expired = await this.cacheRepo.count({
      where: { expires_at: LessThan(new Date()) },
    });

    // Calcular hits basado en hit_count
    const entries = await this.cacheRepo.find({
      select: ['hit_count'],
    });
    const hits = entries.reduce((sum, entry) => sum + entry.hit_count, 0);

    return {
      total,
      expired,
      hits,
      misses: 0, // TODO: Implementar tracking de misses si es necesario
    };
  }
}
