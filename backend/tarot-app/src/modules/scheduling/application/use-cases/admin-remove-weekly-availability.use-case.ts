import { Injectable, Inject } from '@nestjs/common';
import { IAvailabilityRepository } from '../../domain/interfaces/availability-repository.interface';
import { AVAILABILITY_REPOSITORY } from '../../domain/interfaces/repository.tokens';

@Injectable()
export class AdminRemoveWeeklyAvailabilityUseCase {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepo: IAvailabilityRepository,
  ) {}

  async execute(tarotistaId: number, availabilityId: number): Promise<void> {
    return this.availabilityRepo.removeWeeklyAvailability(
      tarotistaId,
      availabilityId,
    );
  }
}
