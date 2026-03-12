import { Injectable, Inject } from '@nestjs/common';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  IHolisticServiceRepository,
} from '../../domain/interfaces';
import { HolisticServiceAdminResponseDto } from '../dto/holistic-service-response.dto';
import { HolisticService } from '../../entities/holistic-service.entity';

@Injectable()
export class AdminGetAllServicesUseCase {
  constructor(
    @Inject(HOLISTIC_SERVICE_REPOSITORY)
    private readonly holisticServiceRepository: IHolisticServiceRepository,
  ) {}

  async execute(): Promise<HolisticServiceAdminResponseDto[]> {
    const services = await this.holisticServiceRepository.findAll();
    return services.map((service) => this.mapToAdminResponseDto(service));
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
