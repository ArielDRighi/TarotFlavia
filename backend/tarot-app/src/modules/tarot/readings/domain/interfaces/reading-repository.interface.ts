import { TarotReading } from '../../entities/tarot-reading.entity';

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
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  dateFrom?: string;
  dateTo?: string;
}
