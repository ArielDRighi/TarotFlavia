import { Injectable } from '@nestjs/common';
import { GetAvailableSlotsUseCase } from '../use-cases/get-available-slots.use-case';
import { AvailableSlotDto } from '../dto/session-response.dto';

@Injectable()
export class AvailabilityOrchestratorService {
  constructor(
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
  ) {}

  async getAvailableSlots(
    tarotistaId: number,
    startDate: string,
    endDate: string,
    durationMinutes: number,
  ): Promise<AvailableSlotDto[]> {
    return this.getAvailableSlotsUseCase.execute(
      tarotistaId,
      startDate,
      endDate,
      durationMinutes,
    );
  }
}
