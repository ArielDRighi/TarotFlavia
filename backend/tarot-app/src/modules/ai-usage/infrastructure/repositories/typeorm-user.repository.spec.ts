import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { User } from '../../../users/entities/user.entity';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      increment: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
    userRepository = module.get(getRepositoryToken(User));

    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUsersApproachingQuota', () => {
    it('should return empty array when FREE has zero AI quota (T-FBK-006)', async () => {
      // Con Free sin IA (cuota 0), ningún usuario "se acerca" a su cuota:
      // no debe devolver a todos los Free (threshold sería 0).
      const result = await repository.findUsersApproachingQuota();

      expect(result).toEqual([]);
      expect(userRepository.find).not.toHaveBeenCalled();
    });
  });
});
