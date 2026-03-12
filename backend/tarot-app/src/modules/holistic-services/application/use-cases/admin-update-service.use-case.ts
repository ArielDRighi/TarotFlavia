import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  IHolisticServiceRepository,
} from '../../domain/interfaces';
import { UpdateHolisticServiceDto } from '../dto/update-holistic-service.dto';
import { HolisticServiceAdminResponseDto } from '../dto/holistic-service-response.dto';
import { HolisticService } from '../../entities/holistic-service.entity';

@Injectable()
export class AdminUpdateServiceUseCase {
  constructor(
    @Inject(HOLISTIC_SERVICE_REPOSITORY)
    private readonly holisticServiceRepository: IHolisticServiceRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateHolisticServiceDto,
  ): Promise<HolisticServiceAdminResponseDto> {
    const service = await this.holisticServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Servicio holístico no encontrado: ${id}`);
    }

    if (dto.slug && dto.slug !== service.slug) {
      const existing = await this.holisticServiceRepository.findBySlug(
        dto.slug,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe un servicio con el slug: ${dto.slug}`,
        );
      }
    }

    const updated = await this.holisticServiceRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Error al actualizar el servicio: ${id}`);
    }

    return this.mapToAdminResponseDto(updated);
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
