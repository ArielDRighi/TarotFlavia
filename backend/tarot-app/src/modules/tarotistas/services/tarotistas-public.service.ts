import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarotista } from '../entities/tarotista.entity';
import { GetPublicTarotistasFilterDto } from '../dto';

@Injectable()
export class TarotistasPublicService {
  constructor(
    @InjectRepository(Tarotista)
    private readonly tarotistaRepository: Repository<Tarotista>,
  ) {}

  async getAllPublic(filterDto: GetPublicTarotistasFilterDto): Promise<{
    data: Tarotista[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 20;
    const search = filterDto.search;
    const especialidad = filterDto.especialidad;
    const orderBy = filterDto.orderBy ?? 'createdAt';
    const order = filterDto.order ?? 'DESC';

    const skip = (page - 1) * limit;

    const queryBuilder =
      this.tarotistaRepository.createQueryBuilder('tarotista');

    // Only show active tarotistas
    queryBuilder.where('tarotista.isActive = :isActive', { isActive: true });

    // Search filter (nombrePublico or bio)
    if (search) {
      // Escape special characters to prevent SQL injection
      const escapedSearch = search.replace(/[%_]/g, '\\$&');
      queryBuilder.andWhere(
        '(LOWER(tarotista.nombrePublico) LIKE LOWER(:search) OR LOWER(tarotista.bio) LIKE LOWER(:search))',
        { search: `%${escapedSearch}%` },
      );
    }

    // Especialidad filter (array contains)
    if (especialidad) {
      queryBuilder.andWhere(':especialidad = ANY(tarotista.especialidades)', {
        especialidad,
      });
    }

    // Sorting
    const orderByField = this.getOrderByField(orderBy);
    queryBuilder.orderBy(orderByField, order, 'NULLS LAST');

    // Pagination
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async getPublicProfile(id: number): Promise<Tarotista | null> {
    const queryBuilder =
      this.tarotistaRepository.createQueryBuilder('tarotista');

    queryBuilder.where(
      'tarotista.id = :id AND tarotista.isActive = :isActive',
      { id, isActive: true },
    );

    return await queryBuilder.getOne();
  }

  private getOrderByField(orderBy: string): string {
    const orderByMap: Record<string, string> = {
      rating: 'tarotista.ratingPromedio',
      totalLecturas: 'tarotista.totalLecturas',
      nombrePublico: 'tarotista.nombrePublico',
      createdAt: 'tarotista.createdAt',
    };

    return orderByMap[orderBy] || 'tarotista.createdAt';
  }
}
