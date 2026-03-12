import { HolisticService } from '../../entities/holistic-service.entity';

export interface IHolisticServiceRepository {
  findAllActive(): Promise<HolisticService[]>;

  findBySlug(slug: string): Promise<HolisticService | null>;

  findById(id: number): Promise<HolisticService | null>;

  findAll(): Promise<HolisticService[]>;

  save(service: Partial<HolisticService>): Promise<HolisticService>;

  update(
    id: number,
    data: Partial<HolisticService>,
  ): Promise<HolisticService | null>;
}
