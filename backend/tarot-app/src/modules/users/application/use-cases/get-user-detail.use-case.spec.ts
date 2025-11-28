import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserDetailUseCase } from './get-user-detail.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import {
  USER_REPOSITORY,
  TAROTISTA_REPOSITORY,
} from '../../domain/interfaces/repository.tokens';
import { User, UserRole, UserPlan } from '../../entities/user.entity';

describe('GetUserDetailUseCase', () => {
  let useCase: GetUserDetailUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByIdWithReadings: jest.fn(),
    };

    const mockTarotistaRepository = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserDetailUseCase,
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

    useCase = module.get<GetUserDetailUseCase>(GetUserDetailUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user details with statistics', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'John Doe',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
        readings: [
          { id: 1, createdAt: new Date('2025-01-01') },
          { id: 2, createdAt: new Date('2025-01-15') },
        ],
      } as unknown as User;

      userRepository.findByIdWithReadings.mockResolvedValue(mockUser);

      const result = await useCase.execute(1);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: 1,
          email: 'test@example.com',
          name: 'John Doe',
        }),
        statistics: {
          totalReadings: 2,
          lastReadingDate: new Date('2025-01-15'),
          totalAIUsage: 2,
        },
      });
      expect(result.user).not.toHaveProperty('password');
      expect(userRepository.findByIdWithReadings).toHaveBeenCalledWith(1);
    });

    it('should return statistics with zero values when user has no readings', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'John',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
        readings: [],
      } as unknown as User;

      userRepository.findByIdWithReadings.mockResolvedValue(mockUser);

      const result = await useCase.execute(1);

      expect(result.statistics).toEqual({
        totalReadings: 0,
        lastReadingDate: null,
        totalAIUsage: 0,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findByIdWithReadings.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
      expect(userRepository.findByIdWithReadings).toHaveBeenCalledWith(999);
    });
  });
});
