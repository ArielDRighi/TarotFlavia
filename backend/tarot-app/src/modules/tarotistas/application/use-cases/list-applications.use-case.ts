import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { TarotistaApplication } from '../../infrastructure/entities/tarotista-application.entity';
import { GetTarotistasFilterDto } from '../dto/get-tarotistas-filter.dto';

/**
 * Use Case: List Tarotista Applications
 * Responsibility: Retrieve paginated list of tarotista applications
 *
 * NOTE: Simplified implementation - returns empty list for now
 * TODO: Implement full application filtering in repository
 */
@Injectable()
export class ListApplicationsUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepo: ITarotistaRepository,
  ) {}

  execute(filterDto: GetTarotistasFilterDto): Promise<{
    data: TarotistaApplication[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Simplified: Return empty result
    // Full implementation requires adding findAllApplications to repository interface
    void filterDto; // Mark as intentionally unused
    return Promise.resolve({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
  }
}
