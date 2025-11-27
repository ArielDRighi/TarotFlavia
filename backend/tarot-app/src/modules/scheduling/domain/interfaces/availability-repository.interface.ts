import { TarotistAvailability } from '../../entities/tarotist-availability.entity';
import { SetWeeklyAvailabilityDto } from '../../application/dto/set-weekly-availability.dto';

export interface IAvailabilityRepository {
  setWeeklyAvailability(
    tarotistaId: number,
    dto: SetWeeklyAvailabilityDto,
  ): Promise<TarotistAvailability>;

  getWeeklyAvailability(tarotistaId: number): Promise<TarotistAvailability[]>;

  removeWeeklyAvailability(
    tarotistaId: number,
    availabilityId: number,
  ): Promise<void>;

  findByTarotistaAndDay(
    tarotistaId: number,
    dayOfWeek: number,
  ): Promise<TarotistAvailability | null>;
}
