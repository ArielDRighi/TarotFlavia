import { Injectable } from '@nestjs/common';
import { CreateTarotistaUseCase } from '../use-cases/create-tarotista.use-case';
import { ListTarotistasUseCase } from '../use-cases/list-tarotistas.use-case';
import { UpdateConfigUseCase } from '../use-cases/update-config.use-case';
import { SetCustomMeaningUseCase } from '../use-cases/set-custom-meaning.use-case';
import { ApproveApplicationUseCase } from '../use-cases/approve-application.use-case';
import { RejectApplicationUseCase } from '../use-cases/reject-application.use-case';
import { ToggleActiveStatusUseCase } from '../use-cases/toggle-active-status.use-case';
import { GetTarotistaDetailsUseCase } from '../use-cases/get-tarotista-details.use-case';
import { UpdateTarotistaUseCase } from '../use-cases/update-tarotista.use-case';
import { GetConfigUseCase } from '../use-cases/get-config.use-case';
import { ListApplicationsUseCase } from '../use-cases/list-applications.use-case';
import { BulkImportMeaningsUseCase } from '../use-cases/bulk-import-meanings.use-case';
import { ListPublicTarotistasUseCase } from '../use-cases/list-public-tarotistas.use-case';
import { GetPublicProfileUseCase } from '../use-cases/get-public-profile.use-case';
import { GetTarotistaMetricsUseCase } from '../use-cases/get-tarotista-metrics.use-case';
import { GetPlatformMetricsUseCase } from '../use-cases/get-platform-metrics.use-case';
import { GenerateReportUseCase } from '../use-cases/generate-report.use-case';
import { Tarotista } from '../../infrastructure/entities/tarotista.entity';
import { TarotistaApplication } from '../../infrastructure/entities/tarotista-application.entity';
import { TarotistaConfig } from '../../infrastructure/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../infrastructure/entities/tarotista-card-meaning.entity';
import { CreateTarotistaDto } from '../dto/create-tarotista.dto';
import { GetTarotistasFilterDto } from '../dto/get-tarotistas-filter.dto';
import { UpdateTarotistaConfigDto } from '../dto/update-tarotista-config.dto';
import { SetCustomMeaningDto } from '../dto/set-custom-meaning.dto';
import { ApproveApplicationDto } from '../dto/approve-application.dto';
import { RejectApplicationDto } from '../dto/reject-application.dto';
import { UpdateTarotistaDto } from '../dto/update-tarotista.dto';
import {
  GetPublicTarotistasFilterDto,
  MetricsQueryDto,
  TarotistaMetricsDto,
  PlatformMetricsQueryDto,
  PlatformMetricsDto,
  ExportReportDto,
} from '../dto';

/**
 * Orchestrator Service - Coordinates use-cases for tarotistas module
 * Provides backward-compatible interface for existing controllers
 */
@Injectable()
export class TarotistasOrchestratorService {
  constructor(
    private readonly createTarotistaUseCase: CreateTarotistaUseCase,
    private readonly listTarotistasUseCase: ListTarotistasUseCase,
    private readonly updateConfigUseCase: UpdateConfigUseCase,
    private readonly setCustomMeaningUseCase: SetCustomMeaningUseCase,
    private readonly approveApplicationUseCase: ApproveApplicationUseCase,
    private readonly rejectApplicationUseCase: RejectApplicationUseCase,
    private readonly toggleActiveStatusUseCase: ToggleActiveStatusUseCase,
    private readonly getTarotistaDetailsUseCase: GetTarotistaDetailsUseCase,
    private readonly updateTarotistaUseCase: UpdateTarotistaUseCase,
    private readonly getConfigUseCase: GetConfigUseCase,
    private readonly listApplicationsUseCase: ListApplicationsUseCase,
    private readonly bulkImportMeaningsUseCase: BulkImportMeaningsUseCase,
    private readonly listPublicTarotistasUseCase: ListPublicTarotistasUseCase,
    private readonly getPublicProfileUseCase: GetPublicProfileUseCase,
    private readonly getTarotistaMetricsUseCase: GetTarotistaMetricsUseCase,
    private readonly getPlatformMetricsUseCase: GetPlatformMetricsUseCase,
    private readonly generateReportUseCase: GenerateReportUseCase,
  ) {}

  // ==================== Tarotista Management ====================

  async createTarotista(dto: CreateTarotistaDto): Promise<Tarotista> {
    return await this.createTarotistaUseCase.execute(dto);
  }

  async getAllTarotistas(filterDto: GetTarotistasFilterDto): Promise<{
    data: Tarotista[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const options = {
      page: filterDto.page || 1,
      limit: filterDto.limit || 20,
      search: filterDto.search,
      isActive: filterDto.isActive,
      sortBy: filterDto.sortBy || 'createdAt',
      sortOrder: filterDto.sortOrder || 'DESC',
      includeConfig: true,
      includeUser: true,
    };

    const result = await this.listTarotistasUseCase.execute(options);

    const totalPages = Math.ceil(result.total / options.limit);

    return {
      data: result.data,
      total: result.total,
      page: options.page,
      limit: options.limit,
      totalPages,
    };
  }

  async getTarotistaById(id: number): Promise<Tarotista> {
    return await this.getTarotistaDetailsUseCase.execute(id);
  }

  async getTarotistaByUserId(userId: number): Promise<Tarotista | null> {
    return await this.getTarotistaDetailsUseCase.byUserId(userId);
  }

  async toggleActiveStatus(id: number): Promise<Tarotista> {
    return await this.toggleActiveStatusUseCase.execute(id);
  }

  async setActiveStatus(id: number, isActive: boolean): Promise<Tarotista> {
    return await this.toggleActiveStatusUseCase.setStatus(id, isActive);
  }

  // ==================== Tarotista Updates ====================

  async updateTarotista(
    id: number,
    dto: UpdateTarotistaDto,
  ): Promise<Tarotista> {
    return await this.updateTarotistaUseCase.execute(id, dto);
  }

  async getTarotistaConfig(tarotistaId: number): Promise<TarotistaConfig> {
    return await this.getConfigUseCase.execute(tarotistaId);
  }

  async getAllApplications(filterDto: GetTarotistasFilterDto): Promise<{
    data: TarotistaApplication[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.listApplicationsUseCase.execute(filterDto);
  }

  async bulkImportCustomMeanings(
    tarotistaId: number,
    meanings: SetCustomMeaningDto[],
  ): Promise<TarotistaCardMeaning[]> {
    return await this.bulkImportMeaningsUseCase.execute(tarotistaId, meanings);
  }

  // ==================== Configuration Management ====================

  async updateConfig(
    tarotistaId: number,
    dto: UpdateTarotistaConfigDto,
  ): Promise<TarotistaConfig> {
    return await this.updateConfigUseCase.execute(tarotistaId, dto);
  }

  async resetConfigToDefault(tarotistaId: number): Promise<TarotistaConfig> {
    return await this.updateConfigUseCase.resetToDefault(tarotistaId);
  }

  // ==================== Custom Card Meanings ====================

  async setCustomMeaning(
    tarotistaId: number,
    dto: SetCustomMeaningDto,
  ): Promise<TarotistaCardMeaning> {
    return await this.setCustomMeaningUseCase.execute(tarotistaId, dto);
  }

  async getAllCustomMeanings(
    tarotistaId: number,
  ): Promise<TarotistaCardMeaning[]> {
    return await this.setCustomMeaningUseCase.getAllMeanings(tarotistaId);
  }

  async deleteCustomMeaning(
    tarotistaId: number,
    cardId: number,
  ): Promise<void> {
    return await this.setCustomMeaningUseCase.deleteMeaning(
      tarotistaId,
      cardId,
    );
  }

  // ==================== Application Management ====================

  async approveApplication(
    applicationId: number,
    reviewedBy: number,
    dto: ApproveApplicationDto,
  ): Promise<{ application: TarotistaApplication; tarotista: Tarotista }> {
    return await this.approveApplicationUseCase.execute(
      applicationId,
      reviewedBy,
      dto.adminNotes,
    );
  }

  async rejectApplication(
    applicationId: number,
    reviewedBy: number,
    dto: RejectApplicationDto,
  ): Promise<TarotistaApplication> {
    return await this.rejectApplicationUseCase.execute(
      applicationId,
      reviewedBy,
      dto.adminNotes,
    );
  }

  // ==================== Public Endpoints ====================

  async listPublicTarotistas(filterDto: GetPublicTarotistasFilterDto): Promise<{
    data: Tarotista[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.listPublicTarotistasUseCase.execute(filterDto);
  }

  async getPublicProfile(id: number): Promise<Tarotista | null> {
    return await this.getPublicProfileUseCase.execute(id);
  }

  // ==================== Metrics Endpoints ====================

  async getTarotistaMetrics(
    dto: MetricsQueryDto,
  ): Promise<TarotistaMetricsDto> {
    return await this.getTarotistaMetricsUseCase.execute(dto);
  }

  async getPlatformMetrics(
    dto: PlatformMetricsQueryDto,
  ): Promise<PlatformMetricsDto> {
    return await this.getPlatformMetricsUseCase.execute(dto);
  }

  // ==================== Reports Endpoints ====================

  async generateReport(
    dto: ExportReportDto,
  ): Promise<{ filename: string; content: string; mimeType: string }> {
    return await this.generateReportUseCase.execute(dto);
  }
}
