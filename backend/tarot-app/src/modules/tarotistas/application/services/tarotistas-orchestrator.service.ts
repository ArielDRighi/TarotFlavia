import { Injectable } from '@nestjs/common';
import { CreateTarotistaUseCase } from '../use-cases/create-tarotista.use-case';
import { ListTarotistasUseCase } from '../use-cases/list-tarotistas.use-case';
import { UpdateConfigUseCase } from '../use-cases/update-config.use-case';
import { SetCustomMeaningUseCase } from '../use-cases/set-custom-meaning.use-case';
import { ApproveApplicationUseCase } from '../use-cases/approve-application.use-case';
import { RejectApplicationUseCase } from '../use-cases/reject-application.use-case';
import { ToggleActiveStatusUseCase } from '../use-cases/toggle-active-status.use-case';
import { GetTarotistaDetailsUseCase } from '../use-cases/get-tarotista-details.use-case';
import { TarotistasAdminService } from '../../services/tarotistas-admin.service';
import { Tarotista } from '../../entities/tarotista.entity';
import { TarotistaApplication } from '../../entities/tarotista-application.entity';
import { TarotistaConfig } from '../../entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../entities/tarotista-card-meaning.entity';
import { CreateTarotistaDto } from '../../dto/create-tarotista.dto';
import { GetTarotistasFilterDto } from '../../dto/get-tarotistas-filter.dto';
import { UpdateTarotistaConfigDto } from '../../dto/update-tarotista-config.dto';
import { SetCustomMeaningDto } from '../../dto/set-custom-meaning.dto';
import { ApproveApplicationDto } from '../../dto/approve-application.dto';
import { RejectApplicationDto } from '../../dto/reject-application.dto';
import { UpdateTarotistaDto } from '../../dto/update-tarotista.dto';

/**
 * Orchestrator Service - Coordinates use-cases for tarotistas module
 * Provides backward-compatible interface for existing controllers
 *
 * NOTE: Some methods still delegate to TarotistasAdminService (PRESERVE phase)
 * TODO: Create use-cases for remaining methods and remove delegation
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
    // PRESERVE: Keep old service for methods without use-cases yet
    private readonly legacyService: TarotistasAdminService,
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

  // TODO: Create UpdateTarotistaUseCase
  async updateTarotista(
    id: number,
    dto: UpdateTarotistaDto,
  ): Promise<Tarotista> {
    return await this.legacyService.updateTarotista(id, dto);
  }

  // TODO: Create GetConfigUseCase
  async getTarotistaConfig(tarotistaId: number): Promise<TarotistaConfig> {
    return await this.legacyService.getTarotistaConfig(tarotistaId);
  }

  // TODO: Create GetAllApplicationsUseCase
  async getAllApplications(filterDto: GetTarotistasFilterDto): Promise<{
    data: TarotistaApplication[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.legacyService.getAllApplications(filterDto);
  }

  // TODO: Create BulkImportMeaningsUseCase
  async bulkImportCustomMeanings(
    tarotistaId: number,
    meanings: SetCustomMeaningDto[],
  ): Promise<TarotistaCardMeaning[]> {
    // Map SetCustomMeaningDto[] to the format expected by legacy service
    const mappedMeanings = meanings.map((m) => ({
      cardId: m.cardId,
      customMeaning: m.customMeaningUpright || m.customDescription || '',
    }));
    return await this.legacyService.bulkImportCustomMeanings(
      tarotistaId,
      mappedMeanings,
    );
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
}
