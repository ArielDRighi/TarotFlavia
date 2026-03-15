import { Injectable, Inject } from '@nestjs/common';
import { IAvailabilityRepository } from '../../domain/interfaces/availability-repository.interface';
import { AVAILABILITY_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';

@Injectable()
export class AdminGetWeeklyAvailabilityUseCase {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepo: IAvailabilityRepository,
  ) {}

  async execute(tarotistaId: number): Promise<TarotistAvailability[]> {
    return this.availabilityRepo.getWeeklyAvailability(tarotistaId);
  }
}
