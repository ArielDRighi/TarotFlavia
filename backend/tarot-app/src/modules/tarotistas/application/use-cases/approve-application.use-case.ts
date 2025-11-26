import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { ApplicationStatus } from '../../infrastructure/entities/tarotista-application.entity';
import { TarotistaApplication } from '../../infrastructure/entities/tarotista-application.entity';
import { Tarotista } from '../../infrastructure/entities/tarotista.entity';

/**
 * Use case: Approve tarotista application
 * Creates tarotista record when application is approved
 */
@Injectable()
export class ApproveApplicationUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepository: ITarotistaRepository,
  ) {}

  /**
   * Approve application and create tarotista profile
   */
  async execute(
    applicationId: number,
    reviewedBy: number,
    adminNotes?: string,
  ): Promise<{ application: TarotistaApplication; tarotista: Tarotista }> {
    // 1. Update application status
    const application = await this.tarotistaRepository.updateApplicationStatus(
      applicationId,
      ApplicationStatus.APPROVED,
      reviewedBy,
      adminNotes,
    );

    // 2. Check if tarotista already exists
    const existingTarotista = await this.tarotistaRepository.findByUserId(
      application.userId,
    );

    if (existingTarotista) {
      return { application, tarotista: existingTarotista };
    }

    // 3. Create tarotista from application
    const tarotista = await this.tarotistaRepository.create({
      userId: application.userId,
      nombrePublico: application.nombrePublico,
      bio: application.biografia,
      especialidades: application.especialidades,
      isActive: true,
      isAcceptingNewClients: true,
      comisiónPorcentaje: 30.0, // Default commission
      totalLecturas: 0,
      totalReviews: 0,
    });

    return { application, tarotista };
  }
}
