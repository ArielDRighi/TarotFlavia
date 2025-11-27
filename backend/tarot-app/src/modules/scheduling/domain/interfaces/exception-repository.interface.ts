import { TarotistException } from '../../entities/tarotist-exception.entity';
import { AddExceptionDto } from '../../application/dto/add-exception.dto';

export interface IExceptionRepository {
  addException(
    tarotistaId: number,
    dto: AddExceptionDto,
  ): Promise<TarotistException>;

  getExceptions(tarotistaId: number): Promise<TarotistException[]>;

  getExceptionsByDateRange(
    tarotistaId: number,
    startDate: string,
    endDate: string,
  ): Promise<TarotistException[]>;

  removeException(tarotistaId: number, exceptionId: number): Promise<void>;

  findByTarotistaAndDate(
    tarotistaId: number,
    exceptionDate: string,
  ): Promise<TarotistException | null>;
}
