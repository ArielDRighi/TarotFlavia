import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createUserDto: CreateUserDto = {
      email: 'Test@Test.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create a user successfully', async () => {
      const mockUserWithoutPassword: any = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUserWithoutPassword);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await useCase.execute(createUserDto);

      expect(result).toEqual(mockUserWithoutPassword);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        'test@test.com',
        'hashedPassword',
        'Test User',
      );
    });

    it('should normalize email to lowercase', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({});
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await useCase.execute(createUserDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should throw InternalServerErrorException if repository fails', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(new Error('Database error'));
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
