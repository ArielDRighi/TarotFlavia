import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TarotistException } from '../../entities/tarotist-exception.entity';
import { AddExceptionDto } from '../../application/dto/add-exception.dto';
import { ExceptionType } from '../../domain/enums/exception-type.enum';
import { IExceptionRepository } from '../../domain/interfaces/exception-repository.interface';

@Injectable()
export class TypeOrmExceptionRepository implements IExceptionRepository {
  constructor(
    @InjectRepository(TarotistException)
    private readonly repository: Repository<TarotistException>,
  ) {}

  async addException(
    tarotistaId: number,
    dto: AddExceptionDto,
  ): Promise<TarotistException> {
    // Validar que la fecha sea futura
    const exceptionDate = new Date(dto.exceptionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (exceptionDate < today) {
      throw new ConflictException(
        'No se pueden agregar excepciones en el pasado',
      );
    }

    // Si es custom_hours, validar tiempos
    if (
      dto.exceptionType === ExceptionType.CUSTOM_HOURS &&
      dto.startTime &&
      dto.endTime
    ) {
      if (dto.startTime >= dto.endTime) {
        throw new ConflictException(
          'La hora de inicio debe ser anterior a la hora de fin',
        );
      }
    }

    // Verificar si ya existe excepción para esta fecha
    const existing = await this.findByTarotistaAndDate(
      tarotistaId,
      dto.exceptionDate,
    );

    if (existing) {
      throw new ConflictException('Ya existe una excepción para esta fecha');
    }

    const exception = this.repository.create({
      tarotistaId,
      exceptionDate: dto.exceptionDate,
      exceptionType: dto.exceptionType,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });

    return this.repository.save(exception);
  }

  async getExceptions(tarotistaId: number): Promise<TarotistException[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.repository.find({
      where: {
        tarotistaId,
        exceptionDate: Between(today.toISOString().split('T')[0], '2099-12-31'),
      },
      order: { exceptionDate: 'ASC' },
    });
  }

  async getExceptionsByDateRange(
    tarotistaId: number,
    startDate: string,
    endDate: string,
  ): Promise<TarotistException[]> {
    return this.repository.find({
      where: {
        tarotistaId,
        exceptionDate: Between(startDate, endDate),
      },
    });
  }

  async removeException(
    tarotistaId: number,
    exceptionId: number,
  ): Promise<void> {
    const exception = await this.repository.findOne({
      where: { id: exceptionId, tarotistaId },
    });

    if (!exception) {
      throw new NotFoundException('Excepción no encontrada');
    }

    await this.repository.remove(exception);
  }

  async findByTarotistaAndDate(
    tarotistaId: number,
    exceptionDate: string,
  ): Promise<TarotistException | null> {
    return this.repository.findOne({
      where: { tarotistaId, exceptionDate },
    });
  }
}
