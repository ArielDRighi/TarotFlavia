import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';
import { SetWeeklyAvailabilityDto } from '../../application/dto/set-weekly-availability.dto';
import { IAvailabilityRepository } from '../../domain/interfaces/availability-repository.interface';

@Injectable()
export class TypeOrmAvailabilityRepository implements IAvailabilityRepository {
  constructor(
    @InjectRepository(TarotistAvailability)
    private readonly repository: Repository<TarotistAvailability>,
  ) {}

  async setWeeklyAvailability(
    tarotistaId: number,
    dto: SetWeeklyAvailabilityDto,
  ): Promise<TarotistAvailability> {
    // Validar que startTime < endTime
    if (dto.startTime >= dto.endTime) {
      throw new ConflictException(
        'La hora de inicio debe ser anterior a la hora de fin',
      );
    }

    // Buscar disponibilidad existente para este día
    const existing = await this.findByTarotistaAndDay(
      tarotistaId,
      dto.dayOfWeek,
    );

    if (existing) {
      // Actualizar existente
      existing.startTime = dto.startTime;
      existing.endTime = dto.endTime;
      existing.isActive = true;
      return this.repository.save(existing);
    }

    // Crear nueva disponibilidad
    const availability = this.repository.create({
      tarotistaId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isActive: true,
    });

    return this.repository.save(availability);
  }

  async getWeeklyAvailability(
    tarotistaId: number,
  ): Promise<TarotistAvailability[]> {
    return this.repository.find({
      where: { tarotistaId, isActive: true },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async removeWeeklyAvailability(
    tarotistaId: number,
    availabilityId: number,
  ): Promise<void> {
    const availability = await this.repository.findOne({
      where: { id: availabilityId, tarotistaId },
    });

    if (!availability) {
      throw new NotFoundException('Disponibilidad no encontrada');
    }

    await this.repository.remove(availability);
  }

  async findByTarotistaAndDay(
    tarotistaId: number,
    dayOfWeek: number,
  ): Promise<TarotistAvailability | null> {
    return this.repository.findOne({
      where: { tarotistaId, dayOfWeek },
    });
  }
}
