import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UpdatePasswordUseCase } from './update-password.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { User, UserRole, UserPlan } from '../../entities/user.entity';

// Mock bcrypt
jest.mock('bcryptjs');

describe('UpdatePasswordUseCase', () => {
  let useCase: UpdatePasswordUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePasswordUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePasswordUseCase>(UpdatePasswordUseCase);
    userRepository = module.get(USER_REPOSITORY);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update password successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashedCurrentPassword',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
      } as unknown as User;

      const currentPassword = 'currentPassword123';
      const newPassword = 'newPassword456';
      const hashedNewPassword = 'hashedNewPassword';

      userRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        password: hashedNewPassword,
      } as User);

      await useCase.execute(1, currentPassword, newPassword);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentPassword,
        'hashedCurrentPassword',
      );
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 'salt');
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedNewPassword,
        }),
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(999, 'currentPassword', 'newPassword'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.execute(999, 'currentPassword', 'newPassword'),
      ).rejects.toThrow('User with ID 999 not found');

      expect(userRepository.findById).toHaveBeenCalledWith(999);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when current password is incorrect', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashedCurrentPassword',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
      } as unknown as User;

      const currentPassword = 'wrongPassword';
      const newPassword = 'newPassword456';

      userRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        useCase.execute(1, currentPassword, newPassword),
      ).rejects.toThrow(BadRequestException);
      await expect(
        useCase.execute(1, currentPassword, newPassword),
      ).rejects.toThrow('Current password is incorrect');

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentPassword,
        'hashedCurrentPassword',
      );
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when save fails', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashedCurrentPassword',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
      } as unknown as User;

      const currentPassword = 'currentPassword123';
      const newPassword = 'newPassword456';
      const hashedNewPassword = 'hashedNewPassword';

      userRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      userRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        useCase.execute(1, currentPassword, newPassword),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        useCase.execute(1, currentPassword, newPassword),
      ).rejects.toThrow('Error updating password');

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentPassword,
        mockUser.password,
      );
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should hash new password before saving', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashedCurrentPassword',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
      } as unknown as User;
      const currentPassword = 'currentPassword123';
      const newPassword = 'newPassword456';
      const salt = 'randomSalt';
      const hashedNewPassword = 'hashedNewPassword';

      userRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        password: hashedNewPassword,
      } as User);

      await useCase.execute(1, currentPassword, newPassword);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, salt);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedNewPassword,
        }),
      );
    });

    it('should not change other user properties', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashedCurrentPassword',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
      } as unknown as User;
      const currentPassword = 'currentPassword123';
      const newPassword = 'newPassword456';
      const hashedNewPassword = 'hashedNewPassword';

      const originalUser = { ...mockUser };

      userRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      userRepository.save.mockImplementation((user) => Promise.resolve(user));

      await useCase.execute(1, currentPassword, newPassword);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: originalUser.id,
          email: originalUser.email,
          name: originalUser.name,
          roles: originalUser.roles,
          plan: originalUser.plan,
        }),
      );
    });
  });
});
