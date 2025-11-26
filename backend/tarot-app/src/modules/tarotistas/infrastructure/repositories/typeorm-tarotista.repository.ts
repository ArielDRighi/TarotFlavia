import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import {
  ITarotistaRepository,
  TarotistaFindOptions,
} from '../../domain/interfaces/tarotista-repository.interface';
import { GetPublicTarotistasFilterDto } from '../../application/dto';
import { Tarotista } from '../../entities/tarotista.entity';
import { TarotistaConfig } from '../../entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../entities/tarotista-card-meaning.entity';
import {
  TarotistaApplication,
  ApplicationStatus,
} from '../../entities/tarotista-application.entity';

/**
 * TypeORM implementation of ITarotistaRepository
 * Handles all database operations for Tarotista entities
 */
@Injectable()
export class TypeOrmTarotistaRepository implements ITarotistaRepository {
  constructor(
    @InjectRepository(Tarotista)
    private readonly tarotistaRepo: Repository<Tarotista>,
    @InjectRepository(TarotistaConfig)
    private readonly configRepo: Repository<TarotistaConfig>,
    @InjectRepository(TarotistaCardMeaning)
    private readonly meaningRepo: Repository<TarotistaCardMeaning>,
    @InjectRepository(TarotistaApplication)
    private readonly applicationRepo: Repository<TarotistaApplication>,
  ) {}

  // ==================== Tarotista CRUD ====================

  async findAll(options?: TarotistaFindOptions): Promise<{
    data: Tarotista[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeConfig = false,
      includeUser = false,
    } = options || {};

    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Tarotista> = {};

    if (search) {
      const escapedSearch = search.replace(/[%_]/g, '\\$&');
      where.nombrePublico = Like(`%${escapedSearch}%`);
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const relations: string[] = [];
    if (includeConfig) relations.push('configs');
    if (includeUser) relations.push('user');

    const [data, total] = await this.tarotistaRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        [sortBy]: sortOrder,
      },
      relations: relations.length > 0 ? relations : undefined,
    });

    return { data, total };
  }

  async findById(id: number): Promise<Tarotista | null> {
    return await this.tarotistaRepo.findOne({
      where: { id },
      relations: ['configs'],
    });
  }

  async findByUserId(userId: number): Promise<Tarotista | null> {
    return await this.tarotistaRepo.findOne({
      where: { userId },
      relations: ['configs'],
    });
  }

  findBySlug(): Promise<Tarotista | null> {
    // NOTE: Tarotista entity does not have a slug field
    // This method would need slug field added to entity or removed from interface
    throw new Error(
      'findBySlug not implemented: Tarotista entity has no slug field',
    );
  }

  async create(data: Partial<Tarotista>): Promise<Tarotista> {
    const tarotista = this.tarotistaRepo.create(data);
    return await this.tarotistaRepo.save(tarotista);
  }

  async update(id: number, data: Partial<Tarotista>): Promise<Tarotista> {
    const tarotista = await this.findById(id);
    if (!tarotista) {
      throw new NotFoundException(`Tarotista con ID ${id} no encontrado`);
    }

    Object.assign(tarotista, data);
    return await this.tarotistaRepo.save(tarotista);
  }

  async delete(id: number): Promise<void> {
    const result = await this.tarotistaRepo.delete(id);
    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Tarotista con ID ${id} no encontrado`);
    }
  }

  // ==================== Config Operations ====================

  async findConfigByTarotistaId(
    tarotistaId: number,
  ): Promise<TarotistaConfig | null> {
    return await this.configRepo.findOne({
      where: { tarotistaId },
    });
  }

  async createConfig(data: Partial<TarotistaConfig>): Promise<TarotistaConfig> {
    const config = this.configRepo.create(data);
    return await this.configRepo.save(config);
  }

  async updateConfig(
    tarotistaId: number,
    data: Partial<TarotistaConfig>,
  ): Promise<TarotistaConfig> {
    let config = await this.findConfigByTarotistaId(tarotistaId);

    if (!config) {
      // Create if not exists with default values
      const defaultConfig = {
        tarotistaId,
        systemPrompt:
          data.systemPrompt ||
          'Eres un tarotista profesional y empático con años de experiencia en lecturas de tarot.',
        temperature: data.temperature ?? 0.7,
        maxTokens: data.maxTokens ?? 1000,
        topP: data.topP ?? 0.9,
        styleConfig: data.styleConfig ?? null,
      };
      config = await this.createConfig(defaultConfig);
    } else {
      Object.assign(config, data);
      config = await this.configRepo.save(config);
    }

    return config;
  }

  // ==================== Card Meanings ====================

  async findCardMeaning(
    tarotistaId: number,
    cardId: number,
  ): Promise<TarotistaCardMeaning | null> {
    return await this.meaningRepo.findOne({
      where: { tarotistaId, cardId },
    });
  }

  async findAllCardMeanings(
    tarotistaId: number,
  ): Promise<TarotistaCardMeaning[]> {
    return await this.meaningRepo.find({
      where: { tarotistaId },
      order: { cardId: 'ASC' },
    });
  }

  async upsertCardMeaning(
    data: Partial<TarotistaCardMeaning>,
  ): Promise<TarotistaCardMeaning> {
    const existing = await this.findCardMeaning(
      data.tarotistaId as number,
      data.cardId as number,
    );

    if (existing) {
      Object.assign(existing, data);
      return await this.meaningRepo.save(existing);
    }

    const meaning = this.meaningRepo.create(data);
    return await this.meaningRepo.save(meaning);
  }

  async deleteCardMeaning(
    tarotistaId: number,
    meaningId: number,
  ): Promise<void> {
    const result = await this.meaningRepo.delete({
      id: meaningId,
      tarotistaId,
    });

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(
        `Custom meaning ${meaningId} not found for tarotista ${tarotistaId}`,
      );
    }
  }

  // ==================== Applications ====================

  async createApplication(
    data: Partial<TarotistaApplication>,
  ): Promise<TarotistaApplication> {
    const application = this.applicationRepo.create(data);
    return await this.applicationRepo.save(application);
  }

  async findApplicationById(id: number): Promise<TarotistaApplication | null> {
    return await this.applicationRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findApplicationsByUserId(
    userId: number,
  ): Promise<TarotistaApplication[]> {
    return await this.applicationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingApplications(): Promise<TarotistaApplication[]> {
    return await this.applicationRepo.find({
      where: { status: ApplicationStatus.PENDING },
      order: { createdAt: 'ASC' },
      relations: ['user'],
    });
  }

  async updateApplicationStatus(
    id: number,
    status: ApplicationStatus,
    reviewedBy?: number,
    adminNotes?: string,
  ): Promise<TarotistaApplication> {
    const application = await this.findApplicationById(id);

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    application.status = status;
    if (reviewedBy) application.reviewedByUserId = reviewedBy;
    if (adminNotes) application.adminNotes = adminNotes;
    application.reviewedAt = new Date();

    return await this.applicationRepo.save(application);
  }

  // ==================== Public Endpoints ====================

  async findAllPublic(filterDto: GetPublicTarotistasFilterDto): Promise<{
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

    const queryBuilder = this.tarotistaRepo.createQueryBuilder('tarotista');

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
    const orderByField = this.getOrderByFieldPublic(orderBy);
    queryBuilder.orderBy(orderByField, order, 'NULLS LAST');

    // Pagination
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublicProfile(id: number): Promise<Tarotista | null> {
    const queryBuilder = this.tarotistaRepo.createQueryBuilder('tarotista');

    queryBuilder.where(
      'tarotista.id = :id AND tarotista.isActive = :isActive',
      { id, isActive: true },
    );

    return await queryBuilder.getOne();
  }

  private getOrderByFieldPublic(orderBy: string): string {
    const orderByMap: Record<string, string> = {
      rating: 'tarotista.ratingPromedio',
      totalLecturas: 'tarotista.totalLecturas',
      nombrePublico: 'tarotista.nombrePublico',
      createdAt: 'tarotista.createdAt',
    };

    return orderByMap[orderBy] || 'tarotista.createdAt';
  }

  // ==================== Utility ====================

  async count(where?: Record<string, unknown>): Promise<number> {
    return await this.tarotistaRepo.count({ where });
  }
}
