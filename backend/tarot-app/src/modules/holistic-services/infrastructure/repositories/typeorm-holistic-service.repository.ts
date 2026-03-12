import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HolisticService } from '../../entities/holistic-service.entity';
import { IHolisticServiceRepository } from '../../domain/interfaces/holistic-service-repository.interface';

type HolisticServiceUpdateData = Pick<
  HolisticService,
  | 'name'
  | 'slug'
  | 'shortDescription'
  | 'longDescription'
  | 'priceArs'
  | 'durationMinutes'
  | 'sessionType'
  | 'whatsappNumber'
  | 'mercadoPagoLink'
  | 'imageUrl'
  | 'displayOrder'
  | 'isActive'
>;

@Injectable()
export class TypeOrmHolisticServiceRepository implements IHolisticServiceRepository {
  constructor(
    @InjectRepository(HolisticService)
    private readonly repository: Repository<HolisticService>,
  ) {}

  async findAllActive(): Promise<HolisticService[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<HolisticService | null> {
    return this.repository.findOne({
      where: { slug },
    });
  }

  async findById(id: number): Promise<HolisticService | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<HolisticService[]> {
    return this.repository.find({
      order: { displayOrder: 'ASC' },
    });
  }

  async save(serviceData: Partial<HolisticService>): Promise<HolisticService> {
    const entity = this.repository.create(serviceData);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    data: Partial<HolisticService>,
  ): Promise<HolisticService | null> {
    // Build a safe update payload by picking only the allowed scalar/value
    // fields. This prevents relation fields (purchases) and immutable fields
    // (id, createdAt, updatedAt) from ever leaking into the TypeORM update.
    const allowedKeys: (keyof HolisticServiceUpdateData)[] = [
      'name',
      'slug',
      'shortDescription',
      'longDescription',
      'priceArs',
      'durationMinutes',
      'sessionType',
      'whatsappNumber',
      'mercadoPagoLink',
      'imageUrl',
      'displayOrder',
      'isActive',
    ];
    const updateData: Partial<HolisticServiceUpdateData> = {};
    for (const key of allowedKeys) {
      if (key in data) {
        (updateData as Record<string, unknown>)[key] = (
          data as Record<string, unknown>
        )[key];
      }
    }
    await this.repository.update(id, updateData);
    return this.repository.findOne({ where: { id } });
  }
}
