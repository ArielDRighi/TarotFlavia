import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotistasAdminService } from './tarotistas-admin.service';
import { Tarotista } from '../entities/tarotista.entity';
import { TarotistaConfig } from '../entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../entities/tarotista-card-meaning.entity';
import { TarotistaApplication } from '../entities/tarotista-application.entity';
import { ApplicationStatus } from '../entities/tarotista-application.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import type {
  CreateTarotistaDto,
  UpdateTarotistaDto,
  GetTarotistasFilterDto,
  ApproveApplicationDto,
  RejectApplicationDto,
} from '../dto';

describe('TarotistasAdminService', () => {
  let service: TarotistasAdminService;
  let _tarotistaRepo: Repository<Tarotista>;
  let _configRepo: Repository<TarotistaConfig>;
  let _meaningRepo: Repository<TarotistaCardMeaning>;
  let _applicationRepo: Repository<TarotistaApplication>;

  const mockTarotistaRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockConfigRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockMeaningRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockApplicationRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarotistasAdminService,
        {
          provide: getRepositoryToken(Tarotista),
          useValue: mockTarotistaRepo,
        },
        {
          provide: getRepositoryToken(TarotistaConfig),
          useValue: mockConfigRepo,
        },
        {
          provide: getRepositoryToken(TarotistaCardMeaning),
          useValue: mockMeaningRepo,
        },
        {
          provide: getRepositoryToken(TarotistaApplication),
          useValue: mockApplicationRepo,
        },
      ],
    }).compile();

    service = module.get<TarotistasAdminService>(TarotistasAdminService);
    _tarotistaRepo = module.get<Repository<Tarotista>>(
      getRepositoryToken(Tarotista),
    );
    _configRepo = module.get<Repository<TarotistaConfig>>(
      getRepositoryToken(TarotistaConfig),
    );
    _meaningRepo = module.get<Repository<TarotistaCardMeaning>>(
      getRepositoryToken(TarotistaCardMeaning),
    );
    _applicationRepo = module.get<Repository<TarotistaApplication>>(
      getRepositoryToken(TarotistaApplication),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTarotista', () => {
    it('should create a tarotista successfully', async () => {
      const createDto = {
        userId: 1,
        nombrePublico: 'Luna Mística',
        biografia: 'Tarotista con experiencia',
        especialidades: ['amor', 'trabajo'],
      };

      const savedTarotista = { id: 1, ...createDto, isActive: true };

      mockTarotistaRepo.create.mockReturnValue(createDto);
      mockTarotistaRepo.save.mockResolvedValue(savedTarotista);

      const result = await service.createTarotista(
        createDto as unknown as CreateTarotistaDto,
      );

      expect(mockTarotistaRepo.create).toHaveBeenCalledWith({
        userId: 1,
        nombrePublico: 'Luna Mística',
        bio: 'Tarotista con experiencia',
        especialidades: ['amor', 'trabajo'],
        fotoPerfil: undefined,
        isActive: true,
      });
      expect(mockTarotistaRepo.save).toHaveBeenCalled();
      expect(result).toEqual(savedTarotista);
    });
  });

  describe('getAllTarotistas', () => {
    it('should return paginated tarotistas', async () => {
      const filterDto = { page: 1, limit: 20 };
      const mockResult = [
        [
          { id: 1, nombrePublico: 'Luna' },
          { id: 2, nombrePublico: 'Sol' },
        ],
        2,
      ];

      mockTarotistaRepo.findAndCount.mockResolvedValue(mockResult);

      const result = await service.getAllTarotistas(
        filterDto as unknown as GetTarotistasFilterDto,
      );

      expect(result).toEqual({
        data: mockResult[0],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });
  });

  describe('updateTarotista', () => {
    it('should update tarotista successfully', async () => {
      const updateDto = { nombrePublico: 'Luna Actualizada' };
      const existing = { id: 1, nombrePublico: 'Luna' };
      const updated = { ...existing, ...updateDto };

      mockTarotistaRepo.findOne.mockResolvedValue(existing);
      mockTarotistaRepo.save.mockResolvedValue(updated);

      const result = await service.updateTarotista(
        1,
        updateDto as unknown as UpdateTarotistaDto,
      );

      expect(mockTarotistaRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if tarotista not found', async () => {
      mockTarotistaRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateTarotista(999, {} as unknown as UpdateTarotistaDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivateTarotista', () => {
    it('should deactivate tarotista', async () => {
      const existing = { id: 1, isActive: true };

      mockTarotistaRepo.findOne.mockResolvedValue(existing);
      mockTarotistaRepo.save.mockResolvedValue({
        ...existing,
        isActive: false,
      });

      const result = await service.deactivateTarotista(1);

      expect(result.isActive).toBe(false);
    });
  });

  describe('approveApplication', () => {
    it('should approve application and create tarotista', async () => {
      const application = {
        id: 1,
        userId: 10,
        nombrePublico: 'Luna',
        biografia: 'Bio',
        especialidades: ['amor'],
        status: ApplicationStatus.PENDING,
      };

      const approveDto = { adminNotes: 'Approved' };

      mockApplicationRepo.findOne.mockResolvedValue(application);
      mockApplicationRepo.save.mockResolvedValue({
        ...application,
        status: ApplicationStatus.APPROVED,
        adminNotes: 'Approved',
        reviewedByUserId: 1,
      });

      mockTarotistaRepo.create.mockReturnValue({});
      mockTarotistaRepo.save.mockResolvedValue({ id: 5 });

      const result = await service.approveApplication(
        1,
        1,
        approveDto as unknown as ApproveApplicationDto,
      );

      expect(result.status).toBe(ApplicationStatus.APPROVED);
      expect(mockTarotistaRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already processed', async () => {
      const application = {
        id: 1,
        status: ApplicationStatus.APPROVED,
      };

      mockApplicationRepo.findOne.mockResolvedValue(application);

      await expect(
        service.approveApplication(
          1,
          1,
          {} as unknown as ApproveApplicationDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectApplication', () => {
    it('should reject application', async () => {
      const application = {
        id: 1,
        status: ApplicationStatus.PENDING,
      };

      const rejectDto = { adminNotes: 'Not qualified' };

      mockApplicationRepo.findOne.mockResolvedValue(application);
      mockApplicationRepo.save.mockResolvedValue({
        ...application,
        status: ApplicationStatus.REJECTED,
        adminNotes: 'Not qualified',
        reviewedByUserId: 1,
      });

      const result = await service.rejectApplication(
        1,
        1,
        rejectDto as unknown as RejectApplicationDto,
      );

      expect(result.status).toBe(ApplicationStatus.REJECTED);
    });
  });
});
