import { Injectable, Inject } from '@nestjs/common';
import { CreateReadingUseCase } from '../use-cases/create-reading.use-case';
import { ListReadingsUseCase } from '../use-cases/list-readings.use-case';
import { GetReadingUseCase } from '../use-cases/get-reading.use-case';
import { ShareReadingUseCase } from '../use-cases/share-reading.use-case';
import { RegenerateReadingUseCase } from '../use-cases/regenerate-reading.use-case';
import { DeleteReadingUseCase } from '../use-cases/delete-reading.use-case';
import { RestoreReadingUseCase } from '../use-cases/restore-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { CreateReadingDto } from '../../dto/create-reading.dto';
import { QueryReadingsDto } from '../../dto/query-readings.dto';
import { PaginatedReadingsResponseDto } from '../../dto/paginated-readings-response.dto';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { User } from '../../../../users/entities/user.entity';

/**
 * Orquestador principal para operaciones de readings.
 * Delega la lógica de negocio a use cases específicos.
 * Mantiene métodos adicionales que no encajan en use cases puros.
 */
@Injectable()
export class ReadingsOrchestratorService {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly createReadingUC: CreateReadingUseCase,
    private readonly listReadingsUC: ListReadingsUseCase,
    private readonly getReadingUC: GetReadingUseCase,
    private readonly shareReadingUC: ShareReadingUseCase,
    private readonly regenerateReadingUC: RegenerateReadingUseCase,
    private readonly deleteReadingUC: DeleteReadingUseCase,
    private readonly restoreReadingUC: RestoreReadingUseCase,
  ) {}

  // ==================== Use Case Delegations ====================

  async create(user: User, dto: CreateReadingDto): Promise<TarotReading> {
    return this.createReadingUC.execute(user, dto);
  }

  async findAll(
    user: User,
    queryDto?: QueryReadingsDto,
  ): Promise<PaginatedReadingsResponseDto> {
    return this.listReadingsUC.execute(user, queryDto);
  }

  async findOne(
    id: number,
    userId: number,
    isAdmin = false,
  ): Promise<TarotReading> {
    return this.getReadingUC.execute(id, userId, isAdmin);
  }

  async shareReading(
    id: number,
    userId: number,
  ): Promise<{ sharedToken: string; shareUrl: string; isPublic: boolean }> {
    return this.shareReadingUC.execute(id, userId);
  }

  async regenerateInterpretation(
    id: number,
    userId: number,
  ): Promise<TarotReading> {
    return this.regenerateReadingUC.execute(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    return this.deleteReadingUC.execute(id, userId);
  }

  async restore(id: number, userId: number): Promise<TarotReading> {
    return this.restoreReadingUC.execute(id, userId);
  }

  // ==================== Direct Repository Delegations ====================

  async update(
    id: number,
    userId: number,
    updateData: Partial<TarotReading>,
  ): Promise<TarotReading> {
    // Primero validar ownership (podríamos crear un use case si se complejiza)
    await this.getReadingUC.execute(id, userId);
    return this.readingRepo.update(id, updateData);
  }

  async findTrashedReadings(userId: number): Promise<TarotReading[]> {
    return this.readingRepo.findTrashed(userId);
  }

  async findAllForAdmin(
    includeDeleted = false,
  ): Promise<PaginatedReadingsResponseDto> {
    const [data, totalItems] =
      await this.readingRepo.findAllForAdmin(includeDeleted);

    return {
      data,
      meta: {
        page: 1,
        limit: 50,
        totalItems,
        totalPages: Math.ceil(totalItems / 50),
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  async cleanupOldDeletedReadings(): Promise<number> {
    return this.readingRepo.hardDelete(30);
  }

  async unshareReading(
    id: number,
    userId: number,
  ): Promise<{
    message: string;
    isPublic: boolean;
    sharedToken: string | null;
  }> {
    // Validar ownership
    await this.getReadingUC.execute(id, userId);

    // Actualizar
    await this.readingRepo.update(id, {
      sharedToken: null,
      isPublic: false,
    });

    return {
      message: 'Lectura dejó de ser compartida con éxito',
      isPublic: false,
      sharedToken: null,
    };
  }

  async getSharedReading(token: string): Promise<TarotReading> {
    const reading = await this.readingRepo.findByShareToken(token);

    if (!reading) {
      throw new Error('Lectura compartida no encontrada o no está pública');
    }

    // Incrementar el contador de visualizaciones
    await this.readingRepo.incrementViewCount(reading.id);

    return reading;
  }
}
