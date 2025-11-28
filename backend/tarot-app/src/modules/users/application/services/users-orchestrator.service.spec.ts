import { Test, TestingModule } from '@nestjs/testing';
import { UsersOrchestratorService } from './users-orchestrator.service';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { UpdateUserPlanUseCase } from '../use-cases/update-user-plan.use-case';
import { ManageUserRolesUseCase } from '../use-cases/manage-user-roles.use-case';
import { ManageUserBanUseCase } from '../use-cases/manage-user-ban.use-case';
import { GetUserDetailUseCase } from '../use-cases/get-user-detail.use-case';
import {
  USER_REPOSITORY,
  TAROTISTA_REPOSITORY,
} from '../../domain/interfaces/repository.tokens';

describe('UsersOrchestratorService', () => {
  let service: UsersOrchestratorService;
  let mockUserRepository: any;
  let mockTarotistaRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findWithFilters: jest.fn(),
    };

    mockTarotistaRepository = {
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersOrchestratorService,
        {
          provide: CreateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserPlanUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ManageUserRolesUseCase,
          useValue: {
            addTarotistRole: jest.fn(),
            addAdminRole: jest.fn(),
            removeRole: jest.fn(),
          },
        },
        {
          provide: ManageUserBanUseCase,
          useValue: {
            banUser: jest.fn(),
            unbanUser: jest.fn(),
          },
        },
        {
          provide: GetUserDetailUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: TAROTISTA_REPOSITORY,
          useValue: mockTarotistaRepository,
        },
      ],
    }).compile();

    service = module.get<UsersOrchestratorService>(UsersOrchestratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call repository findAll method', async () => {
      const mockUsers: any = [{ id: 1, email: 'test@test.com' }];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should call repository findById method', async () => {
      const mockUser: any = { id: 1, email: 'test@test.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findByEmail', () => {
    it('should call repository findByEmail method', async () => {
      const mockUser: any = { id: 1, email: 'test@test.com' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@test.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
    });
  });

  describe('remove', () => {
    it('should call repository delete method', async () => {
      const mockDeleteResult: any = { affected: 1 };
      mockUserRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.remove(1);

      expect(result).toEqual(mockDeleteResult);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getTarotistaByUserId', () => {
    it('should call tarotista repository findByUserId method', async () => {
      const mockTarotista: any = { id: 1, userId: 1 };
      mockTarotistaRepository.findByUserId.mockResolvedValue(mockTarotista);

      const result = await service.getTarotistaByUserId(1);

      expect(result).toEqual(mockTarotista);
      expect(mockTarotistaRepository.findByUserId).toHaveBeenCalledWith(1);
    });
  });
});
