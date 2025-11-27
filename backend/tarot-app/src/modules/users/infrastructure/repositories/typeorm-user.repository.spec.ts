import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { User } from '../../entities/user.entity';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let mockTypeOrmRepository: Partial<Repository<User>>;

  beforeEach(async () => {
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const mockUser: any = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        name: 'Test User',
      };

      (mockTypeOrmRepository.create as jest.Mock).mockReturnValue(mockUser);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.create(
        'test@test.com',
        'hashedPassword',
        'Test User',
      );

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'test@test.com');
      expect(result).toHaveProperty('name', 'Test User');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email (lowercase)', async () => {
      const mockUser: any = { id: 1, email: 'test@test.com' };
      (mockTypeOrmRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findByEmail('Test@Test.com');

      expect(result).toEqual(mockUser);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser: any = { id: 1, email: 'test@test.com' };
      (mockTypeOrmRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
