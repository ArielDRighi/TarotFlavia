import { Injectable, Inject } from '@nestjs/common';
import {
  ITarotistaRepository,
  TarotistaFindOptions,
} from '../../../domain/interfaces/tarotista-repository.interface';
import { GetTarotistasFilterDto } from '../../dto/get-tarotistas-filter.dto';
import { Tarotista } from '../../../infrastructure/entities/tarotista.entity';

/**
 * Use Case: List Tarotistas with filtering and pagination
 * Responsibility: Handle the business logic for listing tarotistas
 */
@Injectable()
export class ListTarotistasUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepo: ITarotistaRepository,
  ) {}

  async execute(filterDto: GetTarotistasFilterDto): Promise<{
    data: Tarotista[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const options: TarotistaFindOptions = {
      page,
      limit,
      search,
      isActive,
      sortBy,
      sortOrder,
      includeConfig: true,
    };

    const { data, total } = await this.tarotistaRepo.findAll(options);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
