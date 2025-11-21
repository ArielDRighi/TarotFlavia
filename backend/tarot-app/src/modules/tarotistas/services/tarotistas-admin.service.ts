import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Tarotista } from '../entities/tarotista.entity';
import { TarotistaConfig } from '../entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../entities/tarotista-card-meaning.entity';
import {
  TarotistaApplication,
  ApplicationStatus,
} from '../entities/tarotista-application.entity';
import {
  CreateTarotistaDto,
  UpdateTarotistaDto,
  UpdateTarotistaConfigDto,
  SetCustomMeaningDto,
  ApplyToBeTarotistaDto,
  ApproveApplicationDto,
  RejectApplicationDto,
  GetTarotistasFilterDto,
} from '../dto';

@Injectable()
export class TarotistasAdminService {
  constructor(
    @InjectRepository(Tarotista)
    private readonly tarotistaRepository: Repository<Tarotista>,
    @InjectRepository(TarotistaConfig)
    private readonly configRepository: Repository<TarotistaConfig>,
    @InjectRepository(TarotistaCardMeaning)
    private readonly meaningRepository: Repository<TarotistaCardMeaning>,
    @InjectRepository(TarotistaApplication)
    private readonly applicationRepository: Repository<TarotistaApplication>,
  ) {}

  async createTarotista(createDto: CreateTarotistaDto): Promise<Tarotista> {
    // Check if tarotista already exists for this user
    const existing = await this.tarotistaRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (existing) {
      throw new BadRequestException(
        `El usuario con ID ${createDto.userId} ya es tarotista`,
      );
    }

    const tarotista = this.tarotistaRepository.create({
      userId: createDto.userId,
      nombrePublico: createDto.nombrePublico,
      bio: createDto.biografia, // Map biografia -> bio
      especialidades: createDto.especialidades,
      fotoPerfil: createDto.fotoPerfil,
      isActive: true,
    });

    const saved = await this.tarotistaRepository.save(tarotista);

    // Create default config if custom prompts provided
    if (createDto.systemPromptIdentity || createDto.systemPromptGuidelines) {
      const systemPrompt = this.buildSystemPrompt(
        createDto.systemPromptIdentity,
        createDto.systemPromptGuidelines,
      );
      await this.createDefaultConfig(saved.id, systemPrompt);
    }

    return saved;
  }

  async getAllTarotistas(filterDto: GetTarotistasFilterDto): Promise<{
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
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Tarotista> = {};
    if (search) {
      // Escape special characters % and _ to prevent SQL injection
      const escapedSearch = search.replace(/[%_]/g, '\\$&');
      where.nombrePublico = Like(`%${escapedSearch}%`);
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.tarotistaRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        [sortBy]: sortOrder,
      },
      relations: ['configs'],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateTarotista(
    id: number,
    updateDto: UpdateTarotistaDto,
  ): Promise<Tarotista> {
    const tarotista = await this.tarotistaRepository.findOne({
      where: { id },
    });

    if (!tarotista) {
      throw new NotFoundException(`Tarotista con ID ${id} no encontrado`);
    }

    // Only assign allowed fields from UpdateTarotistaDto (whitelist approach)
    if (updateDto.nombrePublico !== undefined) {
      tarotista.nombrePublico = updateDto.nombrePublico;
    }
    if (updateDto.biografia !== undefined) {
      tarotista.bio = updateDto.biografia;
    }
    if (updateDto.especialidades !== undefined) {
      tarotista.especialidades = updateDto.especialidades;
    }
    if (updateDto.fotoPerfil !== undefined) {
      tarotista.fotoPerfil = updateDto.fotoPerfil;
    }

    return await this.tarotistaRepository.save(tarotista);
  }

  async deactivateTarotista(id: number): Promise<Tarotista> {
    const tarotista = await this.tarotistaRepository.findOne({
      where: { id },
    });

    if (!tarotista) {
      throw new NotFoundException(`Tarotista con ID ${id} no encontrado`);
    }

    tarotista.isActive = false;
    return await this.tarotistaRepository.save(tarotista);
  }

  async reactivateTarotista(id: number): Promise<Tarotista> {
    const tarotista = await this.tarotistaRepository.findOne({
      where: { id },
    });

    if (!tarotista) {
      throw new NotFoundException(`Tarotista con ID ${id} no encontrado`);
    }

    tarotista.isActive = true;
    return await this.tarotistaRepository.save(tarotista);
  }

  async getTarotistaConfig(tarotistaId: number): Promise<TarotistaConfig> {
    const config = await this.configRepository.findOne({
      where: { tarotistaId },
    });

    if (!config) {
      throw new NotFoundException(
        `Configuración para tarotista ${tarotistaId} no encontrada`,
      );
    }

    return config;
  }

  async updateTarotistaConfig(
    tarotistaId: number,
    updateDto: UpdateTarotistaConfigDto,
  ): Promise<TarotistaConfig> {
    let config = await this.configRepository.findOne({
      where: { tarotistaId },
    });

    if (!config) {
      // Create default if not exists
      config = await this.createDefaultConfig(tarotistaId);
    }

    Object.assign(config, updateDto);
    return await this.configRepository.save(config);
  }

  async resetTarotistaConfigToDefault(
    tarotistaId: number,
  ): Promise<TarotistaConfig> {
    await this.configRepository.update(
      { tarotistaId },
      {
        systemPrompt: this.getDefaultSystemPrompt(),
        temperature: 0.7,
        maxTokens: 500,
        topP: 0.9,
        styleConfig: null,
      },
    );

    return await this.getTarotistaConfig(tarotistaId);
  }

  async setCustomCardMeaning(
    tarotistaId: number,
    meaningDto: SetCustomMeaningDto,
  ): Promise<TarotistaCardMeaning> {
    // Validar cardId - usar aserción de tipo porque class-validator garantiza el tipo en runtime
    const cardId = meaningDto.cardId as unknown as number;

    // Check if meaning exists
    const existing = await this.meaningRepository.findOne({
      where: {
        tarotistaId,
        cardId,
      },
    });

    if (existing) {
      // Update existing meaning
      const updates: Partial<TarotistaCardMeaning> = {};

      if (meaningDto.customMeaningUpright !== undefined) {
        updates.customMeaningUpright =
          (meaningDto.customMeaningUpright as unknown as string) || null;
      }
      if (meaningDto.customMeaningReversed !== undefined) {
        updates.customMeaningReversed =
          (meaningDto.customMeaningReversed as unknown as string) || null;
      }
      if (meaningDto.customKeywords !== undefined) {
        updates.customKeywords =
          (meaningDto.customKeywords as unknown as string) || null;
      }
      if (meaningDto.customDescription !== undefined) {
        updates.customDescription =
          (meaningDto.customDescription as unknown as string) || null;
      }
      if (meaningDto.privateNotes !== undefined) {
        updates.privateNotes =
          (meaningDto.privateNotes as unknown as string) || null;
      }

      Object.assign(existing, updates);
      return await this.meaningRepository.save(existing);
    }

    // Create new meaning
    const meaning = this.meaningRepository.create({
      tarotistaId,
      cardId,
      customMeaningUpright:
        (meaningDto.customMeaningUpright as unknown as string) || null,
      customMeaningReversed:
        (meaningDto.customMeaningReversed as unknown as string) || null,
      customKeywords: (meaningDto.customKeywords as unknown as string) || null,
      customDescription:
        (meaningDto.customDescription as unknown as string) || null,
      privateNotes: (meaningDto.privateNotes as unknown as string) || null,
    });

    return await this.meaningRepository.save(meaning);
  }

  async getAllCustomMeanings(
    tarotistaId: number,
  ): Promise<TarotistaCardMeaning[]> {
    return await this.meaningRepository.find({
      where: { tarotistaId },
      order: { cardId: 'ASC' },
    });
  }

  async deleteCustomMeaning(
    tarotistaId: number,
    meaningId: number,
  ): Promise<void> {
    const result = await this.meaningRepository.delete({
      id: meaningId,
      tarotistaId,
    });

    if (!result.affected) {
      throw new NotFoundException(
        `Significado personalizado ${meaningId} no encontrado`,
      );
    }
  }

  async bulkImportCustomMeanings(
    tarotistaId: number,
    meanings: SetCustomMeaningDto[],
  ): Promise<TarotistaCardMeaning[]> {
    // Process meanings in parallel for better performance
    return await Promise.all(
      meanings.map((meaningDto) =>
        this.setCustomCardMeaning(tarotistaId, meaningDto),
      ),
    );
  }

  async applyToBeTarotist(
    userId: number,
    applyDto: ApplyToBeTarotistaDto,
  ): Promise<TarotistaApplication> {
    // Check if user already has a pending application
    const existingPending = await this.applicationRepository.findOne({
      where: { userId, status: ApplicationStatus.PENDING },
    });

    if (existingPending) {
      throw new BadRequestException('Ya tienes una aplicación pendiente');
    }

    const application = this.applicationRepository.create({
      userId,
      nombrePublico: applyDto.nombrePublico as unknown as string,
      biografia: applyDto.biografia as unknown as string,
      especialidades: applyDto.especialidades as unknown as string[],
      motivacion: applyDto.motivacion as unknown as string,
      experiencia: applyDto.experiencia as unknown as string,
      status: ApplicationStatus.PENDING,
    });

    return await this.applicationRepository.save(application);
  }

  async approveApplication(
    applicationId: number,
    adminUserId: number,
    approveDto: ApproveApplicationDto,
  ): Promise<TarotistaApplication> {
    // Use transaction to ensure atomicity and prevent race conditions
    return await this.applicationRepository.manager.transaction(
      async (manager) => {
        const application = await manager.findOne(TarotistaApplication, {
          where: { id: applicationId },
        });

        if (!application) {
          throw new NotFoundException(
            `Aplicación ${applicationId} no encontrada`,
          );
        }

        if (application.status !== ApplicationStatus.PENDING) {
          throw new BadRequestException('Esta aplicación ya fue procesada');
        }

        // Check if tarotista already exists for this user
        const existingTarotista = await manager.findOne(Tarotista, {
          where: { userId: application.userId },
        });

        if (existingTarotista) {
          throw new BadRequestException('El usuario ya es tarotista');
        }

        // Create tarotista from application
        const tarotista = manager.create(Tarotista, {
          userId: application.userId,
          nombrePublico: application.nombrePublico,
          bio: application.biografia, // Map biografia -> bio
          especialidades: application.especialidades,
          isActive: true,
        });

        try {
          await manager.save(Tarotista, tarotista);
        } catch (err) {
          // Handle unique constraint violation (race condition)
          // PostgreSQL error code: 23505 (unique_violation)
          // MySQL error code: ER_DUP_ENTRY
          const errorCode =
            err &&
            typeof err === 'object' &&
            'code' in err &&
            typeof (err as { code: unknown }).code === 'string'
              ? (err as { code: string }).code
              : '';
          if (errorCode === '23505' || errorCode === 'ER_DUP_ENTRY') {
            throw new BadRequestException('El usuario ya es tarotista');
          }
          throw err;
        }

        // Update application status
        application.status = ApplicationStatus.APPROVED;
        application.reviewedByUserId = adminUserId;
        application.reviewedAt = new Date();
        application.adminNotes = approveDto.adminNotes || null;

        return await manager.save(TarotistaApplication, application);
      },
    );
  }

  async rejectApplication(
    applicationId: number,
    adminUserId: number,
    rejectDto: RejectApplicationDto,
  ): Promise<TarotistaApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(`Aplicación ${applicationId} no encontrada`);
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Esta aplicación ya fue procesada');
    }

    application.status = ApplicationStatus.REJECTED;
    application.reviewedByUserId = adminUserId;
    application.reviewedAt = new Date();
    application.adminNotes = rejectDto.adminNotes;

    return await this.applicationRepository.save(application);
  }

  async getAllApplications(filterDto: GetTarotistasFilterDto): Promise<{
    data: TarotistaApplication[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = filterDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.applicationRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Helper methods
  private async createDefaultConfig(
    tarotistaId: number,
    systemPrompt?: string,
  ): Promise<TarotistaConfig> {
    const config = this.configRepository.create({
      tarotistaId,
      systemPrompt: systemPrompt || this.getDefaultSystemPrompt(),
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.9,
      isActive: true,
    });

    return await this.configRepository.save(config);
  }

  private getDefaultSystemPrompt(): string {
    return 'Eres un tarotista profesional y empático que realiza lecturas de tarot con sabiduría y compasión.';
  }

  private buildSystemPrompt(identity?: string, guidelines?: string): string {
    let prompt = '';
    if (identity) {
      prompt += identity;
    }
    if (guidelines) {
      if (prompt) prompt += '\n\n';
      prompt += guidelines;
    }
    return prompt || this.getDefaultSystemPrompt();
  }
}
