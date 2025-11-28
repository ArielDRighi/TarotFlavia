import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ManageUserBanUseCase } from './manage-user-ban.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { User, UserRole, UserPlan } from '../../entities/user.entity';

describe('ManageUserBanUseCase', () => {
  let useCase: ManageUserBanUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageUserBanUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<ManageUserBanUseCase>(ManageUserBanUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('banUser', () => {
    it('should ban a user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
        isBanned: false,
        ban: jest.fn(),
      } as unknown as User;

      const savedUser = { ...mockUser, isBanned: true } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.banUser(1, 'Violated terms of service');

      expect(mockUser.ban).toHaveBeenCalledWith('Violated terms of service');
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(savedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.banUser(999, 'Spam')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const mockUser = {
        id: 1,
        ban: jest.fn(),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.banUser(1, 'Reason')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('unbanUser', () => {
    it('should unban a user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
        isBanned: true,
        unban: jest.fn(),
      } as unknown as User;

      const savedUser = { ...mockUser, isBanned: false } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.unbanUser(1);

      expect(mockUser.unban).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(savedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.unbanUser(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const mockUser = {
        id: 1,
        unban: jest.fn(),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.unbanUser(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
