import { Injectable, Inject } from '@nestjs/common';
import {
  IReadingRepository,
  PaginationOptions,
  ReadingFilters,
} from '../../domain/interfaces/reading-repository.interface';
import { QueryReadingsDto } from '../../dto/query-readings.dto';
import { PaginatedReadingsResponseDto } from '../../dto/paginated-readings-response.dto';
import { User, UserPlan } from '../../../../users/entities/user.entity';

@Injectable()
export class ListReadingsUseCase {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
  ) {}

  async execute(
    user: User,
    queryDto?: QueryReadingsDto,
  ): Promise<PaginatedReadingsResponseDto> {
    const page = queryDto?.page ?? 1;
    const limit = queryDto?.limit ?? 10;

    // Map snake_case from DTO to camelCase for entity
    const sortByRaw = queryDto?.sortBy ?? 'created_at';
    const sortBy = sortByRaw === 'created_at' ? 'createdAt' : 'updatedAt';
    const sortOrder = queryDto?.sortOrder ?? 'DESC';

    // Construir filtros
    const filters: ReadingFilters = {};
    if (queryDto?.categoryId !== undefined) {
      filters.categoryId = queryDto.categoryId;
    }
    // NOTE: spreadId is ignored because TarotReading entity doesn't have spread relation
    // This matches legacy behavior in readings.service.ts applyReadingFilters()

    const options: PaginationOptions = {
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
      dateFrom: queryDto?.dateFrom,
      dateTo: queryDto?.dateTo,
    };

    // Obtener lecturas del usuario
    const [readings, totalItems] = await this.readingRepo.findByUserId(
      user.id,
      options,
    );

    // Free users can only see 10 most recent readings
    const isFreeUser = user.plan === UserPlan.FREE;
    const effectiveTotalItems = isFreeUser
      ? Math.min(totalItems, 10)
      : totalItems;

    // Calculate pagination metadata
    const totalPages = Math.ceil(effectiveTotalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: readings,
      meta: {
        page,
        limit,
        totalItems: effectiveTotalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
