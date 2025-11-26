import { Tarotista } from '../../infrastructure/entities/tarotista.entity';
import { TarotistaConfig } from '../../infrastructure/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../infrastructure/entities/tarotista-card-meaning.entity';
import {
  TarotistaApplication,
  ApplicationStatus,
} from '../../infrastructure/entities/tarotista-application.entity';
import { GetPublicTarotistasFilterDto } from '../../application/dto';

/**
 * Interface for Tarotista repository operations
 * Abstracts data access layer from business logic
 */
export interface ITarotistaRepository {
  // Tarotista CRUD
  findAll(options?: TarotistaFindOptions): Promise<{
    data: Tarotista[];
    total: number;
  }>;
  findById(id: number): Promise<Tarotista | null>;
  findByUserId(userId: number): Promise<Tarotista | null>;
  findBySlug(slug: string): Promise<Tarotista | null>;
  create(data: Partial<Tarotista>): Promise<Tarotista>;
  update(id: number, data: Partial<Tarotista>): Promise<Tarotista>;
  delete(id: number): Promise<void>;

  // Public endpoints
  findAllPublic(filterDto: GetPublicTarotistasFilterDto): Promise<{
    data: Tarotista[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findPublicProfile(id: number): Promise<Tarotista | null>;

  // Config operations
  findConfigByTarotistaId(tarotistaId: number): Promise<TarotistaConfig | null>;
  createConfig(data: Partial<TarotistaConfig>): Promise<TarotistaConfig>;
  updateConfig(
    tarotistaId: number,
    data: Partial<TarotistaConfig>,
  ): Promise<TarotistaConfig>;

  // Card meanings
  findCardMeaning(
    tarotistaId: number,
    cardId: number,
  ): Promise<TarotistaCardMeaning | null>;
  findAllCardMeanings(tarotistaId: number): Promise<TarotistaCardMeaning[]>;
  upsertCardMeaning(
    data: Partial<TarotistaCardMeaning>,
  ): Promise<TarotistaCardMeaning>;
  deleteCardMeaning(tarotistaId: number, cardId: number): Promise<void>;

  // Applications
  createApplication(
    data: Partial<TarotistaApplication>,
  ): Promise<TarotistaApplication>;
  findApplicationById(id: number): Promise<TarotistaApplication | null>;
  findApplicationsByUserId(userId: number): Promise<TarotistaApplication[]>;
  findPendingApplications(): Promise<TarotistaApplication[]>;
  updateApplicationStatus(
    id: number,
    status: ApplicationStatus,
    reviewedBy?: number,
    adminNotes?: string,
  ): Promise<TarotistaApplication>;

  // Utility
  count(where?: any): Promise<number>;
}

export interface TarotistaFindOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeConfig?: boolean;
  includeUser?: boolean;
}
