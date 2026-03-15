import { Injectable, Inject } from '@nestjs/common';
import { IExceptionRepository } from '../../domain/interfaces/exception-repository.interface';
import { EXCEPTION_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { AddExceptionDto } from '../dto/add-exception.dto';
import { TarotistException } from '../../entities/tarotist-exception.entity';

@Injectable()
export class AdminAddExceptionUseCase {
  constructor(
    @Inject(EXCEPTION_REPOSITORY)
    private readonly exceptionRepo: IExceptionRepository,
  ) {}

  async execute(
    tarotistaId: number,
    dto: AddExceptionDto,
  ): Promise<TarotistException> {
    return this.exceptionRepo.addException(tarotistaId, dto);
  }
}
