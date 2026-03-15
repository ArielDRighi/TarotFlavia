import { Injectable } from '@nestjs/common';
import { AdminGetWeeklyAvailabilityUseCase } from '../use-cases/admin-get-weekly-availability.use-case';
import { AdminSetWeeklyAvailabilityUseCase } from '../use-cases/admin-set-weekly-availability.use-case';
import { AdminRemoveWeeklyAvailabilityUseCase } from '../use-cases/admin-remove-weekly-availability.use-case';
import { AdminGetExceptionsUseCase } from '../use-cases/admin-get-exceptions.use-case';
import { AdminAddExceptionUseCase } from '../use-cases/admin-add-exception.use-case';
import { AdminRemoveExceptionUseCase } from '../use-cases/admin-remove-exception.use-case';
import { SetWeeklyAvailabilityDto } from '../dto/set-weekly-availability.dto';
import { AddExceptionDto } from '../dto/add-exception.dto';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';
import { TarotistException } from '../../entities/tarotist-exception.entity';

@Injectable()
export class AdminSchedulingOrchestratorService {
  constructor(
    private readonly adminGetWeeklyAvailabilityUseCase: AdminGetWeeklyAvailabilityUseCase,
    private readonly adminSetWeeklyAvailabilityUseCase: AdminSetWeeklyAvailabilityUseCase,
    private readonly adminRemoveWeeklyAvailabilityUseCase: AdminRemoveWeeklyAvailabilityUseCase,
    private readonly adminGetExceptionsUseCase: AdminGetExceptionsUseCase,
    private readonly adminAddExceptionUseCase: AdminAddExceptionUseCase,
    private readonly adminRemoveExceptionUseCase: AdminRemoveExceptionUseCase,
  ) {}

  async getWeeklyAvailability(
    tarotistaId: number,
  ): Promise<TarotistAvailability[]> {
    return this.adminGetWeeklyAvailabilityUseCase.execute(tarotistaId);
  }

  async setWeeklyAvailability(
    tarotistaId: number,
    dto: SetWeeklyAvailabilityDto,
  ): Promise<TarotistAvailability> {
    return this.adminSetWeeklyAvailabilityUseCase.execute(tarotistaId, dto);
  }

  async removeWeeklyAvailability(
    tarotistaId: number,
    availabilityId: number,
  ): Promise<void> {
    return this.adminRemoveWeeklyAvailabilityUseCase.execute(
      tarotistaId,
      availabilityId,
    );
  }

  async getExceptions(tarotistaId: number): Promise<TarotistException[]> {
    return this.adminGetExceptionsUseCase.execute(tarotistaId);
  }

  async addException(
    tarotistaId: number,
    dto: AddExceptionDto,
  ): Promise<TarotistException> {
    return this.adminAddExceptionUseCase.execute(tarotistaId, dto);
  }

  async removeException(
    tarotistaId: number,
    exceptionId: number,
  ): Promise<void> {
    return this.adminRemoveExceptionUseCase.execute(tarotistaId, exceptionId);
  }
}
