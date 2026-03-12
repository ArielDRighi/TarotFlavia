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
    // Explicitly exclude relation fields and immutable fields (id, createdAt,
    // updatedAt) so they can never leak into the TypeORM update payload.
    const {
      id: _id,
      purchases: _purchases,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...updateData
    } = data as HolisticService;
    await this.repository.update(
      id,
      updateData as Partial<HolisticServiceUpdateData>,
    );
    return this.repository.findOne({ where: { id } });
  }
}
