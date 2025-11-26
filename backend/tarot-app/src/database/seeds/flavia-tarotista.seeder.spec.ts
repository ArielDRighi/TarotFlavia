import { Repository } from 'typeorm';
import { Tarotista } from '../../modules/tarotistas/infrastructure/entities/tarotista.entity';
import { User } from '../../modules/users/entities/user.entity';
import { seedFlaviaTarotista } from './flavia-tarotista.seeder';
import { flaviaTarotistaData } from './data/flavia-tarotista.data';

describe('FlaviaTarotistaSeeder', () => {
  let tarotistaRepository: jest.Mocked<Repository<Tarotista>>;
  let userRepository: jest.Mocked<Repository<User>>;
  const mockUserId = 1;

  beforeEach(() => {
    tarotistaRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<Tarotista>>;

    userRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;
  });

  describe('seedFlaviaTarotista', () => {
    it('should create Flavia tarotista when it does not exist', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: 'flavia@tarotflavia.com',
      } as User;
      userRepository.findOne.mockResolvedValue(mockUser);
      tarotistaRepository.findOne.mockResolvedValue(null);

      const mockTarotista = {
        id: 1,
        userId: mockUserId,
        nombrePublico: flaviaTarotistaData.nombrePublico,
      } as Tarotista;
      tarotistaRepository.create.mockReturnValue(mockTarotista);
      tarotistaRepository.save.mockResolvedValue(mockTarotista);

      // Act
      const tarotistaId = await seedFlaviaTarotista(
        mockUserId,
        tarotistaRepository,
        userRepository,
      );

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(tarotistaRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(tarotistaRepository.create).toHaveBeenCalled();
      expect(tarotistaRepository.save).toHaveBeenCalled();
      expect(tarotistaId).toBe(1);
    });

    it('should return existing tarotista ID when profile already exists', async () => {
      // Arrange
      const mockUser = { id: mockUserId } as User;
      userRepository.findOne.mockResolvedValue(mockUser);

      const existingTarotista = {
        id: 1,
        userId: mockUserId,
        nombrePublico: 'Flavia',
      } as Tarotista;
      tarotistaRepository.findOne.mockResolvedValue(existingTarotista);

      // Act
      const tarotistaId = await seedFlaviaTarotista(
        mockUserId,
        tarotistaRepository,
        userRepository,
      );

      // Assert
      expect(tarotistaRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(tarotistaRepository.create).not.toHaveBeenCalled();
      expect(tarotistaRepository.save).not.toHaveBeenCalled();
      expect(tarotistaId).toBe(1);
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        seedFlaviaTarotista(mockUserId, tarotistaRepository, userRepository),
      ).rejects.toThrow('User with ID 1 not found');
    });

    it('should create tarotista with correct data from flaviaTarotistaData', async () => {
      // Arrange
      const mockUser = { id: mockUserId } as User;
      userRepository.findOne.mockResolvedValue(mockUser);
      tarotistaRepository.findOne.mockResolvedValue(null);

      const capturedTarotistaData = {} as Tarotista;
      tarotistaRepository.create.mockImplementation(
        (data: Partial<Tarotista>) => {
          Object.assign(capturedTarotistaData, data);
          return { ...data, id: 1 } as Tarotista;
        },
      );
      tarotistaRepository.save.mockResolvedValue({ id: 1 } as Tarotista);

      // Act
      await seedFlaviaTarotista(
        mockUserId,
        tarotistaRepository,
        userRepository,
      );

      // Assert
      expect(capturedTarotistaData.nombrePublico).toBe(
        flaviaTarotistaData.nombrePublico,
      );
      expect(capturedTarotistaData.bio).toBe(flaviaTarotistaData.bio);
      expect(capturedTarotistaData.especialidades).toEqual(
        flaviaTarotistaData.especialidades,
      );
      expect(capturedTarotistaData.añosExperiencia).toBe(
        flaviaTarotistaData.añosExperiencia,
      );
    });

    it('should create tarotista with 20 years experience', async () => {
      // Arrange
      const mockUser = { id: mockUserId } as User;
      userRepository.findOne.mockResolvedValue(mockUser);
      tarotistaRepository.findOne.mockResolvedValue(null);

      const capturedTarotistaData = {} as Tarotista;
      tarotistaRepository.create.mockImplementation(
        (data: Partial<Tarotista>) => {
          Object.assign(capturedTarotistaData, data);
          return { ...data, id: 1 } as Tarotista;
        },
      );
      tarotistaRepository.save.mockResolvedValue({ id: 1 } as Tarotista);

      // Act
      await seedFlaviaTarotista(
        mockUserId,
        tarotistaRepository,
        userRepository,
      );

      // Assert
      expect(capturedTarotistaData.añosExperiencia).toBe(20);
    });

    it('should create tarotista as featured', async () => {
      // Arrange
      const mockUser = { id: mockUserId } as User;
      userRepository.findOne.mockResolvedValue(mockUser);
      tarotistaRepository.findOne.mockResolvedValue(null);

      const capturedTarotistaData = {} as Tarotista;
      tarotistaRepository.create.mockImplementation(
        (data: Partial<Tarotista>) => {
          Object.assign(capturedTarotistaData, data);
          return { ...data, id: 1 } as Tarotista;
        },
      );
      tarotistaRepository.save.mockResolvedValue({ id: 1 } as Tarotista);

      // Act
      await seedFlaviaTarotista(
        mockUserId,
        tarotistaRepository,
        userRepository,
      );

      // Assert
      expect(capturedTarotistaData.isFeatured).toBe(true);
    });

    it('should create tarotista as active and accepting new clients', async () => {
      // Arrange
      const mockUser = { id: mockUserId } as User;
      userRepository.findOne.mockResolvedValue(mockUser);
      tarotistaRepository.findOne.mockResolvedValue(null);

      const capturedTarotistaData = {} as Tarotista;
      tarotistaRepository.create.mockImplementation(
        (data: Partial<Tarotista>) => {
          Object.assign(capturedTarotistaData, data);
          return { ...data, id: 1 } as Tarotista;
        },
      );
      tarotistaRepository.save.mockResolvedValue({ id: 1 } as Tarotista);

      // Act
      await seedFlaviaTarotista(
        mockUserId,
        tarotistaRepository,
        userRepository,
      );

      // Assert
      expect(capturedTarotistaData.isActive).toBe(true);
      expect(capturedTarotistaData.isAcceptingNewClients).toBe(true);
    });

    it('should be idempotent - running twice should not create duplicate', async () => {
      // Arrange
      const mockUser = { id: mockUserId } as User;
      const existingTarotista = { id: 1, userId: mockUserId } as Tarotista;

      // First call - tarotista doesn't exist
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      tarotistaRepository.findOne.mockResolvedValueOnce(null);
      tarotistaRepository.create.mockReturnValueOnce({ id: 1 } as Tarotista);
      tarotistaRepository.save.mockResolvedValueOnce({ id: 1 } as Tarotista);

      // Second call - tarotista exists
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      tarotistaRepository.findOne.mockResolvedValueOnce(existingTarotista);

      // Act
      const tarotistaId1 = await seedFlaviaTarotista(
        mockUserId,
        tarotistaRepository,
        userRepository,
      );
      const tarotistaId2 = await seedFlaviaTarotista(
        mockUserId,
        tarotistaRepository,
        userRepository,
      );

      // Assert
      expect(tarotistaId1).toBe(tarotistaId2);
      expect(tarotistaRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
