import { Repository } from 'typeorm';
import {
  User,
  UserRole,
  UserPlan,
} from '../../modules/users/entities/user.entity';
import { seedFlaviaUser } from './flavia-user.seeder';
import { flaviaUserData } from './data/flavia-user.data';

describe('FlaviaUserSeeder', () => {
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;
  });

  describe('seedFlaviaUser', () => {
    it('should create Flavia user when it does not exist', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      const mockUser = {
        id: 1,
        email: flaviaUserData.email,
        name: flaviaUserData.name,
        roles: flaviaUserData.roles,
        plan: flaviaUserData.plan,
        isAdmin: flaviaUserData.isAdmin,
      } as User;
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Act
      const userId = await seedFlaviaUser(userRepository);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: flaviaUserData.email },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(userId).toBe(1);
    });

    it('should return existing user ID when user already exists', async () => {
      // Arrange
      const existingUser = {
        id: 1,
        email: flaviaUserData.email,
        name: flaviaUserData.name,
      } as User;
      userRepository.findOne.mockResolvedValue(existingUser);

      // Act
      const userId = await seedFlaviaUser(userRepository);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: flaviaUserData.email },
      });
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(userId).toBe(1);
    });

    it('should create user with correct roles (TAROTIST and ADMIN)', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      const capturedUserData = {} as User;
      userRepository.create.mockImplementation((data: Partial<User>) => {
        Object.assign(capturedUserData, data);
        return { ...data, id: 1 } as User;
      });
      userRepository.save.mockResolvedValue({ id: 1 } as User);

      // Act
      await seedFlaviaUser(userRepository);

      // Assert
      expect(capturedUserData.roles).toContain(UserRole.TAROTIST);
      expect(capturedUserData.roles).toContain(UserRole.ADMIN);
    });

    it('should create user with PREMIUM plan', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      const capturedUserData = {} as User;
      userRepository.create.mockImplementation((data: Partial<User>) => {
        Object.assign(capturedUserData, data);
        return { ...data, id: 1 } as User;
      });
      userRepository.save.mockResolvedValue({ id: 1 } as User);

      // Act
      await seedFlaviaUser(userRepository);

      // Assert
      expect(capturedUserData.plan).toBe(UserPlan.PREMIUM);
    });

    it('should hash password using bcrypt', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      const capturedUserData = {} as User;
      userRepository.create.mockImplementation((data: Partial<User>) => {
        Object.assign(capturedUserData, data);
        return { ...data, id: 1 } as User;
      });
      userRepository.save.mockResolvedValue({ id: 1 } as User);

      // Act
      await seedFlaviaUser(userRepository);

      // Assert
      expect(capturedUserData.password).toBeDefined();
      expect(capturedUserData.password).not.toBe('FlaviaSecurePassword2024!');
      // Verify it's a bcrypt hash (starts with $2b$)
      expect(capturedUserData.password).toMatch(/^\$2b\$/);
    });

    it('should set isAdmin to true for backward compatibility', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      const capturedUserData = {} as User;
      userRepository.create.mockImplementation((data: Partial<User>) => {
        Object.assign(capturedUserData, data);
        return { ...data, id: 1 } as User;
      });
      userRepository.save.mockResolvedValue({ id: 1 } as User);

      // Act
      await seedFlaviaUser(userRepository);

      // Assert
      expect(capturedUserData.isAdmin).toBe(true);
    });

    it('should be idempotent - running twice should not create duplicate', async () => {
      // Arrange
      const existingUser = {
        id: 1,
        email: flaviaUserData.email,
      } as User;

      // First call - user doesn't exist
      userRepository.findOne.mockResolvedValueOnce(null);
      userRepository.create.mockReturnValueOnce({ id: 1 } as User);
      userRepository.save.mockResolvedValueOnce({ id: 1 } as User);

      // Second call - user exists
      userRepository.findOne.mockResolvedValueOnce(existingUser);

      // Act
      const userId1 = await seedFlaviaUser(userRepository);
      const userId2 = await seedFlaviaUser(userRepository);

      // Assert
      expect(userId1).toBe(userId2);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
