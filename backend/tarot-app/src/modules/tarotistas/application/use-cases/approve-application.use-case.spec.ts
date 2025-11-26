import { Test, TestingModule } from '@nestjs/testing';
import { ApproveApplicationUseCase } from './approve-application.use-case';
import { ApplicationStatus } from '../../entities/tarotista-application.entity';

describe('ApproveApplicationUseCase', () => {
  let useCase: ApproveApplicationUseCase;

  const mockRepository = {
    updateApplicationStatus: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveApplicationUseCase,
        {
          provide: 'ITarotistaRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ApproveApplicationUseCase>(ApproveApplicationUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should approve application and create tarotista', async () => {
      const application = {
        id: 1,
        userId: 10,
        nombrePublico: 'Luna',
        biografia: 'Experiencia en tarot',
        especialidades: ['amor'],
        status: ApplicationStatus.APPROVED,
      };

      const newTarotista = {
        id: 1,
        userId: 10,
        nombrePublico: 'Luna',
        bio: 'Experiencia en tarot',
        especialidades: ['amor'],
        isActive: true,
      };

      mockRepository.updateApplicationStatus.mockResolvedValue(application);
      mockRepository.findByUserId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(newTarotista);

      const result = await useCase.execute(1, 5, 'Aprobado');

      expect(mockRepository.updateApplicationStatus).toHaveBeenCalledWith(
        1,
        ApplicationStatus.APPROVED,
        5,
        'Aprobado',
      );
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 10,
        nombrePublico: 'Luna',
        bio: 'Experiencia en tarot',
        especialidades: ['amor'],
        isActive: true,
        isAcceptingNewClients: true,
        comisiónPorcentaje: 30.0,
        totalLecturas: 0,
        totalReviews: 0,
      });
      expect(result.application).toEqual(application);
      expect(result.tarotista).toEqual(newTarotista);
    });

    it('should return existing tarotista if user already is one', async () => {
      const application = {
        id: 1,
        userId: 10,
        status: ApplicationStatus.APPROVED,
      };

      const existingTarotista = {
        id: 5,
        userId: 10,
        nombrePublico: 'Existing',
      };

      mockRepository.updateApplicationStatus.mockResolvedValue(application);
      mockRepository.findByUserId.mockResolvedValue(existingTarotista);

      const result = await useCase.execute(1, 5);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result.tarotista).toEqual(existingTarotista);
    });
  });
});
