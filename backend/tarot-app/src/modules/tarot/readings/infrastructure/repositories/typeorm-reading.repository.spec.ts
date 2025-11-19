import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TypeOrmReadingRepository } from './typeorm-reading.repository';
import { TarotReading } from '../../entities/tarot-reading.entity';

describe('TypeOrmReadingRepository - BUG HUNTING', () => {
  let repository: TypeOrmReadingRepository;
  let _readingRepo: Repository<TarotReading>; // Prefixed with _ to indicate intentionally unused

  // Mock QueryBuilder
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
  };

  const mockReadingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
    restore: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmReadingRepository,
        {
          provide: getRepositoryToken(TarotReading),
          useValue: mockReadingRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmReadingRepository>(TypeOrmReadingRepository);
    _readingRepo = module.get<Repository<TarotReading>>(
      getRepositoryToken(TarotReading),
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return reading with relations', async () => {
      const mockReading = { id: 1, question: 'Test' } as TarotReading;
      const mockSavedReading = { id: 1 } as TarotReading;
      const mockReadingWithRelations = {
        id: 1,
        question: 'Test',
        user: { id: 1 },
        deck: { id: 1 },
      } as any;

      mockReadingRepository.create.mockReturnValue(mockReading);
      mockReadingRepository.save.mockResolvedValue(mockSavedReading);
      mockReadingRepository.findOne.mockResolvedValue(mockReadingWithRelations);

      const result = await repository.create({ question: 'Test' } as any);

      expect(result).toEqual(mockReadingWithRelations);
      expect(mockReadingRepository.create).toHaveBeenCalledWith({
        question: 'Test',
      });
      expect(mockReadingRepository.save).toHaveBeenCalledWith(mockReading);
      expect(mockReadingRepository.findOne).toHaveBeenCalled();
    });

    // BUG HUNTING: What if findById returns null after save?
    it('should throw error if reading not found after save', async () => {
      const mockReading = { id: 1 } as TarotReading;

      mockReadingRepository.create.mockReturnValue(mockReading);
      mockReadingRepository.save.mockResolvedValue({ id: 1 } as any);
      mockReadingRepository.findOne.mockResolvedValue(null);

      await expect(repository.create({} as any)).rejects.toThrow(
        'Failed to retrieve created reading',
      );
    });

    // BUG HUNTING: Empty data
    it('should handle empty object creation', async () => {
      const mockReading = {} as TarotReading;

      mockReadingRepository.create.mockReturnValue(mockReading);
      mockReadingRepository.save.mockResolvedValue({ id: 1 } as any);
      mockReadingRepository.findOne.mockResolvedValue({ id: 1 } as any);

      const result = await repository.create({});

      expect(result).toBeDefined();
      expect(mockReadingRepository.create).toHaveBeenCalledWith({});
    });

    // BUG HUNTING: null/undefined data
    it('should handle null data', async () => {
      mockReadingRepository.create.mockReturnValue({} as any);
      mockReadingRepository.save.mockResolvedValue({ id: 1 } as any);
      mockReadingRepository.findOne.mockResolvedValue({ id: 1 } as any);

      await repository.create(null as any);

      expect(mockReadingRepository.create).toHaveBeenCalledWith(null);
    });
  });

  describe('findById', () => {
    it('should find reading with default relations', async () => {
      const mockReading = { id: 1, user: { id: 1 } } as any;
      mockReadingRepository.findOne.mockResolvedValue(mockReading);

      const result = await repository.findById(1);

      expect(result).toEqual(mockReading);
      expect(mockReadingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['deck', 'user', 'cards', 'interpretations'],
      });
    });

    it('should find reading with custom relations', async () => {
      const mockReading = { id: 1 } as any;
      mockReadingRepository.findOne.mockResolvedValue(mockReading);

      const result = await repository.findById(1, ['deck']);

      expect(result).toEqual(mockReading);
      expect(mockReadingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['deck'],
      });
    });

    it('should return null when reading not found', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    // BUG HUNTING: Zero/negative IDs
    it('should handle id = 0', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(0);

      expect(result).toBeNull();
      expect(mockReadingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 0 },
        relations: expect.any(Array),
      });
    });

    it('should handle negative id', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(-1);

      expect(result).toBeNull();
    });

    // BUG HUNTING: Empty relations array
    it('should handle empty relations array', async () => {
      mockReadingRepository.findOne.mockResolvedValue({ id: 1 } as any);

      const result = await repository.findById(1, []);

      expect(result).toBeDefined();
      expect(mockReadingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [],
      });
    });
  });

  describe('findByUserId', () => {
    beforeEach(() => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    });

    it('should find readings with default pagination', async () => {
      const mockReadings = [{ id: 1, userId: 1 }] as any;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockReadings, 1]);

      const result = await repository.findByUserId(1);

      expect(result).toEqual([mockReadings, 1]);
      expect(mockReadingRepository.createQueryBuilder).toHaveBeenCalledWith(
        'reading',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'reading.userId = :userId',
        { userId: 1 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reading.deletedAt IS NULL',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // (1-1)*10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should handle custom pagination options', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, {
        page: 2,
        limit: 20,
        sortBy: 'id',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20); // (2-1)*20
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'reading.id',
        'ASC',
      );
    });

    // BUG HUNTING: Page = 0
    it('should handle page = 0 by correcting to page = 1', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, { page: 0, limit: 10 });

      // Math.max(1, 0) = 1, (1-1)*10 = 0
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    // BUG HUNTING: Negative page
    it('should handle negative page by correcting to page = 1', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, { page: -5, limit: 10 });

      // Math.max(1, -5) = 1, (1-1)*10 = 0
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    // BUG HUNTING: Zero limit
    it('should handle limit = 0 by correcting to limit = 1', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, { page: 1, limit: 0 });

      // Math.min(Math.max(1, 0), 100) = 1
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(1);
    });

    // BUG HUNTING: Negative limit
    it('should handle negative limit by correcting to limit = 1', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, { page: 1, limit: -10 });

      // Math.min(Math.max(1, -10), 100) = 1
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(1);
    });

    // BUG HUNTING: Very large limit (potential DOS)
    it('should cap very large limit at 100', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, { page: 1, limit: 1000000 });

      // Math.min(Math.max(1, 1000000), 100) = 100
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(100);
    });

    // BUG HUNTING: SQL injection in sortBy
    it('should reject potentially malicious sortBy and use default', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, {
        page: 1,
        limit: 10,
        sortBy: 'id; DROP TABLE users--' as any,
      });

      // Whitelisted fields only, malicious string rejected
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'reading.createdAt',
        'DESC',
      );
    });

    // BUG HUNTING: Invalid sortOrder
    it('should handle invalid sortOrder by using default DESC', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, {
        page: 1,
        limit: 10,
        sortOrder: 'INVALID' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'reading.createdAt',
        'DESC',
      );
    });

    // BUG HUNTING: Filters with special characters
    it('should handle filters correctly', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(1, {
        page: 1,
        limit: 10,
        filters: { categoryId: 1 },
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reading.categoryId = :categoryId',
        { categoryId: 1 },
      );
    });

    // BUG HUNTING: Date filters with invalid dates
    it('should handle dateFrom filter by converting string to Date', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      const testDate = '2025-01-01';

      await repository.findByUserId(1, {
        page: 1,
        limit: 10,
        dateFrom: testDate,
      });

      // Date parsed and validated
      const calls = mockQueryBuilder.andWhere.mock.calls;
      const dateFromCall = calls.find((call) => call[0].includes('dateFrom'));
      expect(dateFromCall).toBeDefined();
      expect(dateFromCall[1].dateFrom).toBeInstanceOf(Date);
    });

    it('should handle dateTo filter by converting string to Date', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      const testDate = '2025-12-31';

      await repository.findByUserId(1, {
        page: 1,
        limit: 10,
        dateTo: testDate,
      });

      const calls = mockQueryBuilder.andWhere.mock.calls;
      const dateToCall = calls.find((call) => call[0].includes('dateTo'));
      expect(dateToCall).toBeDefined();
      expect(dateToCall[1].dateTo).toBeInstanceOf(Date);
    });

    // BUG HUNTING: Invalid date objects
    it('should reject invalid dateFrom by not adding it to query', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      const invalidDate = 'invalid-date';

      await repository.findByUserId(1, {
        page: 1,
        limit: 10,
        dateFrom: invalidDate,
      });

      // Invalid date should NOT be added to query
      const calls = mockQueryBuilder.andWhere.mock.calls;
      const dateFromCall = calls.find(
        (call) => call[0] && call[0].includes('dateFrom'),
      );
      expect(dateFromCall).toBeUndefined();
    });

    // BUG HUNTING: userId = 0
    it('should handle userId = 0', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(0);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'reading.userId = :userId',
        { userId: 0 },
      );
    });

    // BUG HUNTING: Negative userId
    it('should handle negative userId', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId(-1);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'reading.userId = :userId',
        { userId: -1 },
      );
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    });

    it('should find all readings with default pagination', async () => {
      const mockReadings = [{ id: 1 }] as any;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockReadings, 1]);

      const result = await repository.findAll();

      expect(result).toEqual([mockReadings, 1]);
      expect(mockReadingRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reading.deletedAt IS NULL',
      );
    });

    it('should handle pagination', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findAll({ page: 3, limit: 25 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(50); // (3-1)*25
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(25);
    });

    // BUG HUNTING: Same issues as findByUserId
    it('should handle negative page by correcting to page = 1', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findAll({ page: -1, limit: 10 });

      // Math.max(1, -1) = 1, (1-1)*10 = 0
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });
  });

  describe('findTrashed', () => {
    beforeEach(() => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
    });

    it('should find trashed readings within 30 days', async () => {
      const mockTrashed = [{ id: 1, deletedAt: new Date() }] as any;
      mockQueryBuilder.getMany.mockResolvedValue(mockTrashed);

      const result = await repository.findTrashed(1);

      expect(result).toEqual(mockTrashed);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'reading.userId = :userId',
        { userId: 1 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reading.deletedAt IS NOT NULL',
      );
      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
    });

    // BUG HUNTING: Date calculation bug
    it('should use 30 days ago cutoff date', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findTrashed(1);

      // Verify date calculation is correct
      const callArgs = mockQueryBuilder.andWhere.mock.calls.find((call) =>
        call[0].includes('thirtyDaysAgo'),
      );
      expect(callArgs).toBeDefined();
      expect(callArgs[1].thirtyDaysAgo).toBeInstanceOf(Date);

      // Check date is approximately 30 days ago (within 1 minute tolerance)
      const passedDate = callArgs[1].thirtyDaysAgo as Date;
      const diff = Math.abs(passedDate.getTime() - thirtyDaysAgo.getTime());
      expect(diff).toBeLessThan(60000); // 1 minute in ms
    });

    // BUG HUNTING: userId = 0 or negative
    it('should handle userId = 0', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findTrashed(0);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'reading.userId = :userId',
        { userId: 0 },
      );
    });
  });

  describe('findAllForAdmin', () => {
    beforeEach(() => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    });

    it('should find all readings without deleted ones by default', async () => {
      const mockReadings = [{ id: 1 }] as any;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockReadings, 1]);

      const result = await repository.findAllForAdmin(false);

      expect(result).toEqual([mockReadings, 1]);
      expect(mockQueryBuilder.withDeleted).not.toHaveBeenCalled();
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
    });

    it('should include deleted readings when flag is true', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await repository.findAllForAdmin(true);

      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update reading and return updated entity', async () => {
      const mockUpdated = { id: 1, question: 'Updated' } as any;

      mockReadingRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockReadingRepository.findOne.mockResolvedValue(mockUpdated);

      const result = await repository.update(1, { question: 'Updated' } as any);

      expect(result).toEqual(mockUpdated);
      expect(mockReadingRepository.update).toHaveBeenCalledWith(1, {
        question: 'Updated',
      });
    });

    it('should throw NotFoundException if reading not found after update', async () => {
      mockReadingRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockReadingRepository.findOne.mockResolvedValue(null);

      await expect(
        repository.update(999, { question: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        repository.update(999, { question: 'Test' } as any),
      ).rejects.toThrow('Reading with ID 999 not found after update');
    });

    // BUG HUNTING: Empty data update
    it('should handle empty update data', async () => {
      mockReadingRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockReadingRepository.findOne.mockResolvedValue({ id: 1 } as any);

      const result = await repository.update(1, {});

      expect(result).toBeDefined();
      expect(mockReadingRepository.update).toHaveBeenCalledWith(1, {});
    });

    // BUG HUNTING: null data
    it('should handle null update data', async () => {
      mockReadingRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockReadingRepository.findOne.mockResolvedValue({ id: 1 } as any);

      await repository.update(1, null as any);

      expect(mockReadingRepository.update).toHaveBeenCalledWith(1, null);
    });

    // BUG HUNTING: id = 0 or negative
    it('should handle id = 0', async () => {
      mockReadingRepository.update.mockResolvedValue({ affected: 0 } as any);
      mockReadingRepository.findOne.mockResolvedValue(null);

      await expect(repository.update(0, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete existing reading', async () => {
      const mockReading = { id: 1 } as any;
      mockReadingRepository.findOne.mockResolvedValue(mockReading);
      mockReadingRepository.softRemove.mockResolvedValue(mockReading);

      await repository.softDelete(1);

      expect(mockReadingRepository.findOne).toHaveBeenCalled();
      expect(mockReadingRepository.softRemove).toHaveBeenCalledWith(
        mockReading,
      );
    });

    // BUG HUNTING: What if reading doesn't exist?
    it('should not throw if reading not found', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      // Silent failure - is this intended?
      await expect(repository.softDelete(999)).resolves.not.toThrow();
      expect(mockReadingRepository.softRemove).not.toHaveBeenCalled();
    });

    // BUG HUNTING: id = 0 or negative
    it('should handle id = 0', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      await repository.softDelete(0);

      expect(mockReadingRepository.softRemove).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore deleted reading', async () => {
      mockReadingRepository.restore.mockResolvedValue({ affected: 1 } as any);

      await repository.restore(1);

      expect(mockReadingRepository.restore).toHaveBeenCalledWith({ id: 1 });
    });

    // BUG HUNTING: No validation if reading exists
    it('should not throw even if reading does not exist', async () => {
      mockReadingRepository.restore.mockResolvedValue({ affected: 0 } as any);

      // Silent failure
      await expect(repository.restore(999)).resolves.not.toThrow();
    });

    // BUG HUNTING: id = 0 or negative
    it('should handle id = 0', async () => {
      mockReadingRepository.restore.mockResolvedValue({ affected: 0 } as any);

      await repository.restore(0);

      expect(mockReadingRepository.restore).toHaveBeenCalledWith({ id: 0 });
    });
  });

  describe('hardDelete', () => {
    it('should hard delete readings older than specified days', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40);

      const mockReadings = [
        { id: 1, deletedAt: oldDate },
        { id: 2, deletedAt: oldDate },
      ] as any;

      mockQueryBuilder.getMany.mockResolvedValue(mockReadings);
      mockReadingRepository.remove.mockResolvedValue(mockReadings);

      const result = await repository.hardDelete(30);

      expect(result).toBe(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'reading.deletedAt IS NOT NULL',
      );
      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
      expect(mockReadingRepository.remove).toHaveBeenCalledWith(mockReadings);
    });

    it('should return 0 if no readings to delete', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await repository.hardDelete(30);

      expect(result).toBe(0);
      expect(mockReadingRepository.remove).not.toHaveBeenCalled();
    });

    // BUG HUNTING: olderThanDays = 0
    it('should handle olderThanDays = 0', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.hardDelete(0);

      // Cutoff date is today, will delete all readings with deletedAt < today
      const callArgs = mockQueryBuilder.andWhere.mock.calls[0];
      expect(callArgs[0]).toContain('deletedAt < :cutoffDate');
    });

    // BUG HUNTING: Negative olderThanDays
    it('should handle negative olderThanDays', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.hardDelete(-10);

      // Cutoff date is in the future, won't delete anything
      // But no validation, could be unexpected
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    // BUG HUNTING: Very large olderThanDays
    it('should handle very large olderThanDays', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.hardDelete(365000); // 1000 years

      // No validation, accepts any number
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findByShareToken', () => {
    it('should find public reading by share token', async () => {
      const mockReading = {
        id: 1,
        sharedToken: 'abc123',
        isPublic: true,
      } as any;
      mockReadingRepository.findOne.mockResolvedValue(mockReading);

      const result = await repository.findByShareToken('abc123');

      expect(result).toEqual(mockReading);
      expect(mockReadingRepository.findOne).toHaveBeenCalledWith({
        where: { sharedToken: 'abc123', isPublic: true },
        relations: ['cards', 'deck', 'category', 'predefinedQuestion'],
      });
    });

    it('should return null if token not found', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByShareToken('invalid');

      expect(result).toBeNull();
    });

    // BUG HUNTING: Empty token
    it('should handle empty token', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByShareToken('');

      expect(result).toBeNull();
      expect(mockReadingRepository.findOne).toHaveBeenCalledWith({
        where: { sharedToken: '', isPublic: true },
        relations: expect.any(Array),
      });
    });

    // BUG HUNTING: null/undefined token
    it('should handle null token', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      await repository.findByShareToken(null as any);

      expect(mockReadingRepository.findOne).toHaveBeenCalledWith({
        where: { sharedToken: null, isPublic: true },
        relations: expect.any(Array),
      });
    });

    // BUG HUNTING: SQL injection in token
    it('should handle potentially malicious token', async () => {
      mockReadingRepository.findOne.mockResolvedValue(null);

      await repository.findByShareToken("'; DROP TABLE readings--");

      // TypeORM should escape this, but worth testing
      expect(mockReadingRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count by 1', async () => {
      mockReadingRepository.increment.mockResolvedValue({ affected: 1 } as any);

      await repository.incrementViewCount(1);

      expect(mockReadingRepository.increment).toHaveBeenCalledWith(
        { id: 1 },
        'viewCount',
        1,
      );
    });

    // BUG HUNTING: No validation if reading exists
    it('should not throw if reading does not exist', async () => {
      mockReadingRepository.increment.mockResolvedValue({ affected: 0 } as any);

      // Silent failure
      await expect(repository.incrementViewCount(999)).resolves.not.toThrow();
    });

    // BUG HUNTING: id = 0 or negative
    it('should handle id = 0', async () => {
      mockReadingRepository.increment.mockResolvedValue({ affected: 0 } as any);

      await repository.incrementViewCount(0);

      expect(mockReadingRepository.increment).toHaveBeenCalledWith(
        { id: 0 },
        'viewCount',
        1,
      );
    });

    it('should handle negative id', async () => {
      mockReadingRepository.increment.mockResolvedValue({ affected: 0 } as any);

      await repository.incrementViewCount(-1);

      expect(mockReadingRepository.increment).toHaveBeenCalledWith(
        { id: -1 },
        'viewCount',
        1,
      );
    });
  });
});
