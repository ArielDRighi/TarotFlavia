import { Injectable, Inject } from '@nestjs/common';
import { IExceptionRepository } from '../../domain/interfaces/exception-repository.interface';
import { EXCEPTION_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { TarotistException } from '../../entities/tarotist-exception.entity';

@Injectable()
export class AdminGetExceptionsUseCase {
  constructor(
    @Inject(EXCEPTION_REPOSITORY)
    private readonly exceptionRepo: IExceptionRepository,
  ) {}

  async execute(tarotistaId: number): Promise<TarotistException[]> {
    return this.exceptionRepo.getExceptions(tarotistaId);
  }
}
