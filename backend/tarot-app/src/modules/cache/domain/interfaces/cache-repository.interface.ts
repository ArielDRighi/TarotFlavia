// TODO: TASK-ARCH-006 (Fase 3 - Separar Capas) - Replace infrastructure entity import
// with pure domain model. Currently violates clean architecture dependency rule,
// but acceptable for Phase 1 (Quick Wins) incremental refactoring approach.
// See PLAN_REFACTORIZACION.md - Fase 3 for domain model creation strategy.
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
