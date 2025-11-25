import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import {
  ITarotistaRepository,
  TarotistaFindOptions,
} from '../../domain/interfaces/tarotista-repository.interface';
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

  async findBySlug(slug: string): Promise<Tarotista | null> {
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
      // Create if not exists
      config = await this.createConfig({ tarotistaId, ...data });
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

  async deleteCardMeaning(tarotistaId: number, cardId: number): Promise<void> {
    const result = await this.meaningRepo.delete({
      tarotistaId,
      cardId,
    });

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(
        `Custom meaning for card ${cardId} not found for tarotista ${tarotistaId}`,
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

  // ==================== Utility ====================

  async count(where?: any): Promise<number> {
    return await this.tarotistaRepo.count({ where });
  }
}
