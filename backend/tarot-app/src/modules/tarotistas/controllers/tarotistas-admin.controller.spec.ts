import { Test, TestingModule } from '@nestjs/testing';
import { TarotistasAdminController } from './tarotistas-admin.controller';
import { TarotistasOrchestratorService } from '../application/services/tarotistas-orchestrator.service';
import {
  CreateTarotistaDto,
  UpdateTarotistaDto,
  UpdateTarotistaConfigDto,
  SetCustomMeaningDto,
  ApproveApplicationDto,
  RejectApplicationDto,
  GetTarotistasFilterDto,
} from '../dto';
import { Tarotista } from '../entities/tarotista.entity';
import { TarotistaConfig } from '../entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../entities/tarotista-card-meaning.entity';
import {
  TarotistaApplication,
  ApplicationStatus,
} from '../entities/tarotista-application.entity';

describe('TarotistasAdminController', () => {
  let controller: TarotistasAdminController;
  let orchestrator: TarotistasOrchestratorService;

  const mockOrchestrator = {
    createTarotista: jest.fn(),
    getAllTarotistas: jest.fn(),
    updateTarotista: jest.fn(),
    setActiveStatus: jest.fn(),
    getTarotistaConfig: jest.fn(),
    updateConfig: jest.fn(),
    resetConfigToDefault: jest.fn(),
    setCustomMeaning: jest.fn(),
    getAllCustomMeanings: jest.fn(),
    deleteCustomMeaning: jest.fn(),
    bulkImportCustomMeanings: jest.fn(),
    getAllApplications: jest.fn(),
    approveApplication: jest.fn(),
    rejectApplication: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarotistasAdminController],
      providers: [
        {
          provide: TarotistasOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    }).compile();

    controller = module.get<TarotistasAdminController>(
      TarotistasAdminController,
    );
    orchestrator = module.get<TarotistasOrchestratorService>(
      TarotistasOrchestratorService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTarotista', () => {
    it('should create a tarotista', async () => {
      const createDto = {
        userId: 1,
        nombrePublico: 'Luna Mística',
        biografia: 'Tarotista profesional',
        especialidades: ['amor', 'trabajo'],
      } as unknown as CreateTarotistaDto;

      const expectedResult = {
        id: 1,
        userId: 1,
        nombrePublico: 'Luna Mística',
        bio: 'Tarotista profesional',
        especialidades: ['amor', 'trabajo'],
        isActive: true,
      } as unknown as Tarotista;

      mockOrchestrator.createTarotista.mockResolvedValue(expectedResult);

      const result = await controller.createTarotista(createDto);

      expect(orchestrator.createTarotista).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllTarotistas', () => {
    it('should return paginated tarotistas', async () => {
      const filterDto = {
        page: 1,
        limit: 20,
      } as unknown as GetTarotistasFilterDto;

      const expectedResult = {
        data: [
          {
            id: 1,
            nombrePublico: 'Luna Mística',
          } as unknown as Tarotista,
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockOrchestrator.getAllTarotistas.mockResolvedValue(expectedResult);

      const result = await controller.getAllTarotistas(filterDto);

      expect(orchestrator.getAllTarotistas).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(expectedResult);
    });

    it('should filter by search term', async () => {
      const filterDto = {
        page: 1,
        limit: 20,
        search: 'Luna',
      } as unknown as GetTarotistasFilterDto;

      const expectedResult = {
        data: [
          {
            id: 1,
            nombrePublico: 'Luna Mística',
          } as unknown as Tarotista,
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockOrchestrator.getAllTarotistas.mockResolvedValue(expectedResult);

      const result = await controller.getAllTarotistas(filterDto);

      expect(orchestrator.getAllTarotistas).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(expectedResult);
    });

    it('should filter by isActive', async () => {
      const filterDto = {
        page: 1,
        limit: 20,
        isActive: true,
      } as unknown as GetTarotistasFilterDto;

      mockOrchestrator.getAllTarotistas.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await controller.getAllTarotistas(filterDto);

      expect(orchestrator.getAllTarotistas).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('updateTarotista', () => {
    it('should update a tarotista', async () => {
      const updateDto = {
        nombrePublico: 'Luna Mística Actualizada',
      } as unknown as UpdateTarotistaDto;

      const expectedResult = {
        id: 1,
        nombrePublico: 'Luna Mística Actualizada',
      } as unknown as Tarotista;

      mockOrchestrator.updateTarotista.mockResolvedValue(expectedResult);

      const result = await controller.updateTarotista(1, updateDto);

      expect(orchestrator.updateTarotista).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deactivateTarotista', () => {
    it('should deactivate a tarotista', async () => {
      const expectedResult = {
        id: 1,
        isActive: false,
      } as unknown as Tarotista;

      mockOrchestrator.setActiveStatus.mockResolvedValue(expectedResult);

      const result = await controller.deactivateTarotista(1);

      expect(orchestrator.setActiveStatus).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('reactivateTarotista', () => {
    it('should reactivate a tarotista', async () => {
      const expectedResult = {
        id: 1,
        isActive: true,
      } as unknown as Tarotista;

      mockOrchestrator.setActiveStatus.mockResolvedValue(expectedResult);

      const result = await controller.reactivateTarotista(1);

      expect(orchestrator.setActiveStatus).toHaveBeenCalledWith(1, true);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTarotistaConfig', () => {
    it('should get tarotista config', async () => {
      const expectedResult = {
        id: 1,
        tarotistaId: 1,
        systemPrompt: 'Eres un tarotista profesional',
        temperature: 0.7,
        maxTokens: 500,
      } as unknown as TarotistaConfig;

      mockOrchestrator.getTarotistaConfig.mockResolvedValue(expectedResult);

      const result = await controller.getTarotistaConfig(1);

      expect(orchestrator.getTarotistaConfig).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateConfig', () => {
    it('should update tarotista config', async () => {
      const updateDto = {
        temperature: 0.8,
      } as unknown as UpdateTarotistaConfigDto;

      const expectedResult = {
        id: 1,
        tarotistaId: 1,
        temperature: 0.8,
      } as unknown as TarotistaConfig;

      mockOrchestrator.updateConfig.mockResolvedValue(expectedResult);

      const result = await controller.updateTarotistaConfig(1, updateDto);

      expect(orchestrator.updateConfig).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('resetConfigToDefault', () => {
    it('should reset config to default values', async () => {
      const expectedResult = {
        id: 1,
        tarotistaId: 1,
        systemPrompt: 'Eres un tarotista profesional y empático...',
        temperature: 0.7,
        maxTokens: 500,
        topP: 0.9,
        styleConfig: null,
      } as unknown as TarotistaConfig;

      mockOrchestrator.resetConfigToDefault.mockResolvedValue(expectedResult);

      const result = await controller.resetConfigToDefault(1);

      expect(orchestrator.resetConfigToDefault).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('setCustomMeaning', () => {
    it('should set custom card meaning', async () => {
      const meaningDto = {
        cardId: 1,
        customMeaningUpright: 'Significado personalizado',
      } as unknown as SetCustomMeaningDto;

      const expectedResult = {
        id: 1,
        tarotistaId: 1,
        cardId: 1,
        customMeaningUpright: 'Significado personalizado',
      } as unknown as TarotistaCardMeaning;

      mockOrchestrator.setCustomMeaning.mockResolvedValue(expectedResult);

      const result = await controller.setCustomMeaning(1, meaningDto);

      expect(orchestrator.setCustomMeaning).toHaveBeenCalledWith(1, meaningDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllCustomMeanings', () => {
    it('should get all custom meanings for tarotista', async () => {
      const expectedResult = [
        {
          id: 1,
          tarotistaId: 1,
          cardId: 1,
          customMeaningUpright: 'Significado personalizado',
        } as unknown as TarotistaCardMeaning,
      ];

      mockOrchestrator.getAllCustomMeanings.mockResolvedValue(expectedResult);

      const result = await controller.getAllCustomMeanings(1);

      expect(orchestrator.getAllCustomMeanings).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteCustomMeaning', () => {
    it('should delete custom meaning', async () => {
      mockOrchestrator.deleteCustomMeaning.mockResolvedValue(undefined);

      await controller.deleteCustomMeaning(1, 5);

      expect(orchestrator.deleteCustomMeaning).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('bulkImportMeanings', () => {
    it('should bulk import custom meanings', async () => {
      const meanings = [
        {
          cardId: 1,
          customMeaningUpright: 'Significado 1',
        } as unknown as SetCustomMeaningDto,
        {
          cardId: 2,
          customMeaningUpright: 'Significado 2',
        } as unknown as SetCustomMeaningDto,
      ];

      const bulkDto = { meanings };

      const expectedResult = [
        {
          id: 1,
          tarotistaId: 1,
          cardId: 1,
          customMeaningUpright: 'Significado 1',
        } as unknown as TarotistaCardMeaning,
        {
          id: 2,
          tarotistaId: 1,
          cardId: 2,
          customMeaningUpright: 'Significado 2',
        } as unknown as TarotistaCardMeaning,
      ];

      mockOrchestrator.bulkImportCustomMeanings.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.bulkImportMeanings(1, bulkDto as any);

      expect(orchestrator.bulkImportCustomMeanings).toHaveBeenCalledWith(
        1,
        meanings,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllApplications', () => {
    it('should get all applications', async () => {
      const filterDto = {
        page: 1,
        limit: 20,
      } as unknown as GetTarotistasFilterDto;

      const expectedResult = {
        data: [
          {
            id: 1,
            userId: 10,
            nombrePublico: 'Luna Mística',
            status: ApplicationStatus.PENDING,
          } as unknown as TarotistaApplication,
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockOrchestrator.getAllApplications.mockResolvedValue(expectedResult);

      const result = await controller.getAllApplications(filterDto);

      expect(orchestrator.getAllApplications).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('approveApplication', () => {
    it('should approve application', async () => {
      const approveDto = {
        adminNotes: 'Excelente perfil',
      } as unknown as ApproveApplicationDto;

      const req = { user: { userId: 100 } };

      const application = {
        id: 1,
        status: ApplicationStatus.APPROVED,
        reviewedByUserId: 100,
        adminNotes: 'Excelente perfil',
      } as unknown as TarotistaApplication;

      mockOrchestrator.approveApplication.mockResolvedValue({
        application,
        tarotista: {} as any,
      });

      const result = await controller.approveApplication(1, req, approveDto);

      expect(orchestrator.approveApplication).toHaveBeenCalledWith(
        1,
        100,
        approveDto,
      );
      expect(result).toEqual(application);
    });
  });

  describe('rejectApplication', () => {
    it('should reject application', async () => {
      const rejectDto = {
        adminNotes: 'No cumple con los requisitos',
      } as unknown as RejectApplicationDto;

      const req = { user: { userId: 100 } };

      const expectedResult = {
        id: 1,
        status: ApplicationStatus.REJECTED,
        reviewedByUserId: 100,
        adminNotes: 'No cumple con los requisitos',
      } as unknown as TarotistaApplication;

      mockOrchestrator.rejectApplication.mockResolvedValue(expectedResult);

      const result = await controller.rejectApplication(1, req, rejectDto);

      expect(orchestrator.rejectApplication).toHaveBeenCalledWith(
        1,
        100,
        rejectDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
