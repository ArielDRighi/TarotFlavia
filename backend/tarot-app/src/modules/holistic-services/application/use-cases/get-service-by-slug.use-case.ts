import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  IHolisticServiceRepository,
} from '../../domain/interfaces';
import { HolisticServiceDetailResponseDto } from '../dto/holistic-service-response.dto';
import { HolisticService } from '../../entities/holistic-service.entity';

@Injectable()
export class GetServiceBySlugUseCase {
  constructor(
    @Inject(HOLISTIC_SERVICE_REPOSITORY)
    private readonly holisticServiceRepository: IHolisticServiceRepository,
  ) {}

  async execute(slug: string): Promise<HolisticServiceDetailResponseDto> {
    const service = await this.holisticServiceRepository.findBySlug(slug);

    if (!service || !service.isActive) {
      throw new NotFoundException(`Servicio holístico no encontrado: ${slug}`);
    }

    return this.mapToDetailResponseDto(service);
  }

  private mapToDetailResponseDto(
    service: HolisticService,
  ): HolisticServiceDetailResponseDto {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      shortDescription: service.shortDescription,
      longDescription: service.longDescription,
      priceArs: service.priceArs,
      durationMinutes: service.durationMinutes,
      sessionType: service.sessionType,
      imageUrl: service.imageUrl,
      displayOrder: service.displayOrder,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
