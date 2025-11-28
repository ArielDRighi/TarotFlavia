import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UpdateUserUseCase } from './update-user.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { User, UserRole, UserPlan } from '../../entities/user.entity';

// Mock bcrypt
jest.mock('bcryptjs');

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get(USER_REPOSITORY);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
      } as unknown as User;

      const updateDto = {
        name: 'Jane Smith',
      };

      const updatedUser = {
        ...mockUser,
        ...updateDto,
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await useCase.execute(1, updateDto);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should update email when new email is provided', async () => {
      const mockUser = {
        id: 1,
        email: 'old@example.com',
      } as unknown as User;

      const updateDto = {
        email: 'new@example.com',
      };

      const updatedUser = {
        ...mockUser,
        email: 'new@example.com',
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await useCase.execute(1, updateDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'new@example.com',
      );
      expect(result.email).toBe('new@example.com');
    });

    it('should throw ConflictException if new email already exists', async () => {
      const mockUser = {
        id: 1,
        email: 'old@example.com',
      } as unknown as User;

      const existingUser = {
        id: 2,
        email: 'existing@example.com',
      } as unknown as User;

      const updateDto = {
        email: 'existing@example.com',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(useCase.execute(1, updateDto)).rejects.toThrow(
        new ConflictException('Email already in use'),
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should hash password when new password is provided', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      } as unknown as User;

      const updateDto = {
        password: 'newPassword123',
      };

      const salt = 'mockedSalt';
      const hashedPassword = 'hashedNewPassword123';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({
        ...mockUser,
      } as unknown as User);

      await useCase.execute(1, updateDto);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', salt);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: hashedPassword }),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, { name: 'Test' })).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(1, { name: 'Test' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should not check email uniqueness when email is the same', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'John',
      } as unknown as User;

      const updateDto = {
        email: 'test@example.com',
        name: 'Jane',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      } as unknown as User);

      await useCase.execute(1, updateDto);

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });
  });
});
