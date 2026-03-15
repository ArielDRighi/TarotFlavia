import { Injectable, Inject } from '@nestjs/common';
import { IAvailabilityRepository } from '../../domain/interfaces/availability-repository.interface';
import { AVAILABILITY_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { SetWeeklyAvailabilityDto } from '../dto/set-weekly-availability.dto';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';

@Injectable()
export class AdminSetWeeklyAvailabilityUseCase {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepo: IAvailabilityRepository,
  ) {}

  async execute(
    tarotistaId: number,
    dto: SetWeeklyAvailabilityDto,
  ): Promise<TarotistAvailability> {
    return this.availabilityRepo.setWeeklyAvailability(tarotistaId, dto);
  }
}
