import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { User, UserRole, UserPlan } from '../../entities/user.entity';
import { UserQueryDto } from '../../application/dto/user-query.dto';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
      } as unknown as User;

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await repository.create(
        'test@example.com',
        'hashedPassword',
        'Test User',
      );

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email (case-insensitive)', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('Test@Example.COM');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await repository.findById(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('save', () => {
    it('should save user and return without password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      } as User;

      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await repository.save(mockUser);

      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('findWithFilters', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated users with default values', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          password: 'hash1',
          name: 'User 1',
        },
        {
          id: 2,
          email: 'user2@example.com',
          password: 'hash2',
          name: 'User 2',
        },
      ] as User[];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, 2]);

      const query: UserQueryDto = {};

      const result = await repository.findWithFilters(query);

      expect(result.users).toHaveLength(2);
      expect(result.users[0]).not.toHaveProperty('password');
      expect(result.meta).toEqual({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 2,
        totalPages: 1,
      });
    });

    it('should apply search filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: UserQueryDto = { search: 'test' };

      await repository.findWithFilters(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.name) LIKE LOWER(:search))',
        { search: '%test%' },
      );
    });

    it('should apply banned filter (true)', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: UserQueryDto = { banned: true };

      await repository.findWithFilters(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.bannedAt IS NOT NULL',
      );
    });

    it('should apply pagination', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 25]);

      const query: UserQueryDto = {
        page: 2,
        limit: 20,
      };

      await repository.findWithFilters(query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });

  describe('findByIdWithReadings', () => {
    it('should find user with readings relation', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        readings: [{ id: 1 }, { id: 2 }],
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await repository.findByIdWithReadings(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['readings'],
      });
      expect(result).toEqual(mockUser);
      expect(result?.readings).toHaveLength(2);
    });
  });
});
