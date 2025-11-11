import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';

export interface ICacheRepository {
  findByKey(key: string): Promise<CachedInterpretation | null>;
  save(entry: CachedInterpretation): Promise<CachedInterpretation>;
  delete(key: string): Promise<void>;
  deleteExpired(): Promise<number>;
  deleteByPattern(pattern: string): Promise<number>;
  deleteByTarotistaId(tarotistaId: number): Promise<number>;
  getStats(): Promise<{
    total: number;
    expired: number;
    hits: number;
    misses: number;
  }>;
}
