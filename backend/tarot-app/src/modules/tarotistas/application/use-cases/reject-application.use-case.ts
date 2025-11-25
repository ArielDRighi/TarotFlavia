import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { ApplicationStatus } from '../../entities/tarotista-application.entity';
import { TarotistaApplication } from '../../entities/tarotista-application.entity';

/**
 * Use case: Reject tarotista application
 */
@Injectable()
export class RejectApplicationUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepository: ITarotistaRepository,
  ) {}

  /**
   * Reject application with admin notes
   */
  async execute(
    applicationId: number,
    reviewedBy: number,
    adminNotes: string,
  ): Promise<TarotistaApplication> {
    return await this.tarotistaRepository.updateApplicationStatus(
      applicationId,
      ApplicationStatus.REJECTED,
      reviewedBy,
      adminNotes,
    );
  }
}
