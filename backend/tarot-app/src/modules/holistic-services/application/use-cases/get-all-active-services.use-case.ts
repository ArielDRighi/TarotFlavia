import { Injectable, Inject } from '@nestjs/common';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  IHolisticServiceRepository,
} from '../../domain/interfaces';
import { HolisticServiceResponseDto } from '../dto/holistic-service-response.dto';
import { HolisticService } from '../../entities/holistic-service.entity';

@Injectable()
export class GetAllActiveServicesUseCase {
  constructor(
    @Inject(HOLISTIC_SERVICE_REPOSITORY)
    private readonly holisticServiceRepository: IHolisticServiceRepository,
  ) {}

  async execute(): Promise<HolisticServiceResponseDto[]> {
    const services = await this.holisticServiceRepository.findAllActive();
    return services.map((service) => this.mapToResponseDto(service));
  }

  private mapToResponseDto(
    service: HolisticService,
  ): HolisticServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      shortDescription: service.shortDescription,
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
