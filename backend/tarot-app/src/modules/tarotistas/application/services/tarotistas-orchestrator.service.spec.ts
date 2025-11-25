import { Test, TestingModule } from '@nestjs/testing';
import { TarotistasOrchestratorService } from './tarotistas-orchestrator.service';
import { CreateTarotistaUseCase } from '../use-cases/create-tarotista.use-case';
import { ListTarotistasUseCase } from '../use-cases/list-tarotistas.use-case';
import { UpdateConfigUseCase } from '../use-cases/update-config.use-case';
import { SetCustomMeaningUseCase } from '../use-cases/set-custom-meaning.use-case';
import { ApproveApplicationUseCase } from '../use-cases/approve-application.use-case';
import { RejectApplicationUseCase } from '../use-cases/reject-application.use-case';
import { ToggleActiveStatusUseCase } from '../use-cases/toggle-active-status.use-case';
import { GetTarotistaDetailsUseCase } from '../use-cases/get-tarotista-details.use-case';

describe('TarotistasOrchestratorService', () => {
  let service: TarotistasOrchestratorService;

  const mockCreateUseCase = { execute: jest.fn() };
  const mockListUseCase = { execute: jest.fn() };
  const mockUpdateConfigUseCase = {
    execute: jest.fn(),
    resetToDefault: jest.fn(),
  };
  const mockSetCustomMeaningUseCase = {
    execute: jest.fn(),
    getAllMeanings: jest.fn(),
    deleteMeaning: jest.fn(),
  };
  const mockApproveUseCase = { execute: jest.fn() };
  const mockRejectUseCase = { execute: jest.fn() };
  const mockToggleUseCase = { execute: jest.fn(), setStatus: jest.fn() };
  const mockGetDetailsUseCase = { execute: jest.fn(), byUserId: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarotistasOrchestratorService,
        { provide: CreateTarotistaUseCase, useValue: mockCreateUseCase },
        { provide: ListTarotistasUseCase, useValue: mockListUseCase },
        { provide: UpdateConfigUseCase, useValue: mockUpdateConfigUseCase },
        {
          provide: SetCustomMeaningUseCase,
          useValue: mockSetCustomMeaningUseCase,
        },
        { provide: ApproveApplicationUseCase, useValue: mockApproveUseCase },
        { provide: RejectApplicationUseCase, useValue: mockRejectUseCase },
        { provide: ToggleActiveStatusUseCase, useValue: mockToggleUseCase },
        {
          provide: GetTarotistaDetailsUseCase,
          useValue: mockGetDetailsUseCase,
        },
      ],
    }).compile();

    service = module.get<TarotistasOrchestratorService>(
      TarotistasOrchestratorService,
    );
    jest.clearAllMocks();
  });

  describe('createTarotista', () => {
    it('should delegate to CreateTarotistaUseCase', async () => {
      const dto = { userId: 1, nombrePublico: 'Test' } as any;
      const expected = { id: 1, nombrePublico: 'Test' };

      mockCreateUseCase.execute.mockResolvedValue(expected);

      const result = await service.createTarotista(dto);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getAllTarotistas', () => {
    it('should return paginated tarotistas with correct format', async () => {
      const filterDto = { page: 1, limit: 10 } as any;
      const useCaseResult = {
        data: [{ id: 1 }, { id: 2 }],
        total: 25,
      };

      mockListUseCase.execute.mockResolvedValue(useCaseResult);

      const result = await service.getAllTarotistas(filterDto);

      expect(result).toEqual({
        data: useCaseResult.data,
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3, // ceil(25/10)
      });
    });

    it('should use default pagination values', async () => {
      const filterDto = {} as any;
      mockListUseCase.execute.mockResolvedValue({ data: [], total: 0 });

      await service.getAllTarotistas(filterDto);

      expect(mockListUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        }),
      );
    });
  });

  describe('approveApplication', () => {
    it('should approve application with correct parameters', async () => {
      const dto = { adminNotes: 'Approved' } as any;
      const expected = { application: {}, tarotista: {} };

      mockApproveUseCase.execute.mockResolvedValue(expected);

      const result = await service.approveApplication(1, 5, dto);

      expect(mockApproveUseCase.execute).toHaveBeenCalledWith(1, 5, 'Approved');
      expect(result).toEqual(expected);
    });
  });

  describe('toggleActiveStatus', () => {
    it('should toggle status', async () => {
      const expected = { id: 1, isActive: false };
      mockToggleUseCase.execute.mockResolvedValue(expected);

      const result = await service.toggleActiveStatus(1);

      expect(mockToggleUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });

    it('should set specific status', async () => {
      const expected = { id: 1, isActive: true };
      mockToggleUseCase.setStatus.mockResolvedValue(expected);

      const result = await service.setActiveStatus(1, true);

      expect(mockToggleUseCase.setStatus).toHaveBeenCalledWith(1, true);
      expect(result).toEqual(expected);
    });
  });
});
