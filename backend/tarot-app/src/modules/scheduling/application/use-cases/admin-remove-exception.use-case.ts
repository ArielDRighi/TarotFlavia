import { Injectable, Inject } from '@nestjs/common';
import { IExceptionRepository } from '../../domain/interfaces/exception-repository.interface';
import { EXCEPTION_REPOSITORY } from '../../domain/interfaces/repository.tokens';

@Injectable()
export class AdminRemoveExceptionUseCase {
  constructor(
    @Inject(EXCEPTION_REPOSITORY)
    private readonly exceptionRepo: IExceptionRepository,
  ) {}

  async execute(tarotistaId: number, exceptionId: number): Promise<void> {
    return this.exceptionRepo.removeException(tarotistaId, exceptionId);
  }
}
