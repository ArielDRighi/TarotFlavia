import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ManageUserRolesUseCase } from './manage-user-roles.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { User, UserRole, UserPlan } from '../../entities/user.entity';

describe('ManageUserRolesUseCase', () => {
  let useCase: ManageUserRolesUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageUserRolesUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<ManageUserRolesUseCase>(ManageUserRolesUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('addTarotistRole', () => {
    it('should add TAROTIST role successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
        hasRole: jest.fn().mockReturnValue(false),
      } as unknown as User;

      const savedUser = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.addTarotistRole(1);

      expect(mockUser.hasRole).toHaveBeenCalledWith(UserRole.TAROTIST);
      expect(mockUser.roles).toContain(UserRole.TAROTIST);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(savedUser);
    });

    it('should throw BadRequestException if user already has TAROTIST role', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
        hasRole: jest.fn().mockReturnValue(true),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.addTarotistRole(1)).rejects.toThrow(
        new BadRequestException('User already has TAROTIST role'),
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.addTarotistRole(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER],
        hasRole: jest.fn().mockReturnValue(false),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.addTarotistRole(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('addAdminRole', () => {
    it('should add ADMIN role and sync isAdmin flag', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
        isAdmin: false,
        hasRole: jest.fn().mockReturnValue(false),
      } as unknown as User;

      const savedUser = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
        isAdmin: true,
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.addAdminRole(1);

      expect(mockUser.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
      expect(mockUser.roles).toContain(UserRole.ADMIN);
      expect(mockUser.isAdmin).toBe(true);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(savedUser);
    });

    it('should throw BadRequestException if user already has ADMIN role', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
        isAdmin: true,
        hasRole: jest.fn().mockReturnValue(true),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.addAdminRole(1)).rejects.toThrow(
        new BadRequestException('User already has ADMIN role'),
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.addAdminRole(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('removeRole', () => {
    it('should remove TAROTIST role successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
        plan: UserPlan.FREE,
      } as unknown as User;

      const savedUser = {
        ...mockUser,
        roles: [UserRole.CONSUMER],
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.removeRole(1, UserRole.TAROTIST);

      expect(mockUser.roles).not.toContain(UserRole.TAROTIST);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(savedUser);
    });

    it('should remove ADMIN role and sync isAdmin flag', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
        isAdmin: true,
      } as unknown as User;

      const savedUser = {
        ...mockUser,
        roles: [UserRole.CONSUMER],
        isAdmin: false,
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.removeRole(1, UserRole.ADMIN);

      expect(mockUser.roles).not.toContain(UserRole.ADMIN);
      expect(mockUser.isAdmin).toBe(false);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(savedUser);
    });

    it('should throw BadRequestException when trying to remove CONSUMER role', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER],
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.removeRole(1, UserRole.CONSUMER)).rejects.toThrow(
        new BadRequestException('Cannot remove CONSUMER role'),
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user does not have the role', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER],
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.removeRole(1, UserRole.TAROTIST)).rejects.toThrow(
        new BadRequestException('User does not have tarotist role'),
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.removeRole(999, UserRole.TAROTIST)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.removeRole(1, UserRole.TAROTIST)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
