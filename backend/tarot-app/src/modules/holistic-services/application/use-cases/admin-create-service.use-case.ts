import { Injectable, Inject, ConflictException } from '@nestjs/common';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  IHolisticServiceRepository,
} from '../../domain/interfaces';
import { CreateHolisticServiceDto } from '../dto/create-holistic-service.dto';
import { HolisticServiceAdminResponseDto } from '../dto/holistic-service-response.dto';
import { HolisticService } from '../../entities/holistic-service.entity';

@Injectable()
export class AdminCreateServiceUseCase {
  constructor(
    @Inject(HOLISTIC_SERVICE_REPOSITORY)
    private readonly holisticServiceRepository: IHolisticServiceRepository,
  ) {}

  async execute(
    dto: CreateHolisticServiceDto,
  ): Promise<HolisticServiceAdminResponseDto> {
    const existing = await this.holisticServiceRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(
        `Ya existe un servicio con el slug: ${dto.slug}`,
      );
    }

    const service = await this.holisticServiceRepository.save({
      ...dto,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.mapToAdminResponseDto(service);
  }

  private mapToAdminResponseDto(
    service: HolisticService,
  ): HolisticServiceAdminResponseDto {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      shortDescription: service.shortDescription,
      longDescription: service.longDescription,
      priceArs: service.priceArs,
      durationMinutes: service.durationMinutes,
      sessionType: service.sessionType,
      whatsappNumber: service.whatsappNumber,
      mercadoPagoLink: service.mercadoPagoLink,
      imageUrl: service.imageUrl,
      displayOrder: service.displayOrder,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
