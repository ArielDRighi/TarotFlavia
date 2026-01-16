import { TarotReading } from '../../entities/tarot-reading.entity';
import { UserPlan } from '../../../../users/entities/user.entity';

export interface IReadingRepository {
  create(reading: Partial<TarotReading>): Promise<TarotReading>;
  findById(id: number, relations?: string[]): Promise<TarotReading | null>;
  findByUserId(
    userId: number,
    options?: PaginationOptions,
  ): Promise<[TarotReading[], number]>;
  findAll(options?: PaginationOptions): Promise<[TarotReading[], number]>;
  findTrashed(userId: number): Promise<TarotReading[]>;
  findAllForAdmin(includeDeleted?: boolean): Promise<[TarotReading[], number]>;
  update(id: number, data: Partial<TarotReading>): Promise<TarotReading>;
  softDelete(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  hardDelete(olderthanDays: number): Promise<number>;
  findByShareToken(token: string): Promise<TarotReading | null>;
  incrementViewCount(id: number): Promise<void>;
  incrementShareCount(id: number): Promise<TarotReading>;
  /**
   * Archiva (soft-delete) lecturas que exceden el periodo de retencion
   * @param userPlan Plan del usuario
   * @param retentionDays Dias de retencion para ese plan
   * @returns Numero de lecturas archivadas
   */
  archiveOldReadings(
    userPlan: UserPlan,
    retentionDays: number,
  ): Promise<number>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  filters?: ReadingFilters;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  dateFrom?: string;
  dateTo?: string;
}

export interface ReadingFilters {
  categoryId?: number;
  // Future filters can be added here with proper types
}
