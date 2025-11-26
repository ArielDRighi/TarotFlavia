import { Repository } from 'typeorm';
import { TarotistaConfig } from '../../modules/tarotistas/infrastructure/entities/tarotista-config.entity';
import { Tarotista } from '../../modules/tarotistas/infrastructure/entities/tarotista.entity';
import { seedFlaviaIAConfig } from './flavia-ia-config.seeder';
import { flaviaIAConfigData } from './data/flavia-ia-config.data';

describe('FlaviaIAConfigSeeder', () => {
  let configRepository: jest.Mocked<Repository<TarotistaConfig>>;
  let tarotistaRepository: jest.Mocked<Repository<Tarotista>>;
  const mockTarotistaId = 1;

  beforeEach(() => {
    configRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<TarotistaConfig>>;

    tarotistaRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Tarotista>>;
  });

  describe('seedFlaviaIAConfig', () => {
    it('should create Flavia IA config when it does not exist', async () => {
      // Arrange
      const mockTarotista = { id: mockTarotistaId } as Tarotista;
      tarotistaRepository.findOne.mockResolvedValue(mockTarotista);
      configRepository.findOne.mockResolvedValue(null);

      const mockConfig = {
        id: 1,
        tarotistaId: mockTarotistaId,
        systemPrompt: flaviaIAConfigData.systemPrompt,
      } as TarotistaConfig;
      configRepository.create.mockReturnValue(mockConfig);
      configRepository.save.mockResolvedValue(mockConfig);

      // Act
      const configId = await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );

      // Assert
      expect(tarotistaRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTarotistaId },
      });
      expect(configRepository.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: mockTarotistaId, isActive: true },
      });
      expect(configRepository.create).toHaveBeenCalled();
      expect(configRepository.save).toHaveBeenCalled();
      expect(configId).toBe(1);
    });

    it('should return existing config ID when active config already exists', async () => {
      // Arrange
      const mockTarotista = { id: mockTarotistaId } as Tarotista;
      tarotistaRepository.findOne.mockResolvedValue(mockTarotista);

      const existingConfig = {
        id: 1,
        tarotistaId: mockTarotistaId,
        isActive: true,
      } as TarotistaConfig;
      configRepository.findOne.mockResolvedValue(existingConfig);

      // Act
      const configId = await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );

      // Assert
      expect(configRepository.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: mockTarotistaId, isActive: true },
      });
      expect(configRepository.create).not.toHaveBeenCalled();
      expect(configRepository.save).not.toHaveBeenCalled();
      expect(configId).toBe(1);
    });

    it('should throw error if tarotista does not exist', async () => {
      // Arrange
      tarotistaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        seedFlaviaIAConfig(
          mockTarotistaId,
          configRepository,
          tarotistaRepository,
        ),
      ).rejects.toThrow('Tarotista with ID 1 not found');
    });

    it('should create config with system prompt from flaviaIAConfigData', async () => {
      // Arrange
      const mockTarotista = { id: mockTarotistaId } as Tarotista;
      tarotistaRepository.findOne.mockResolvedValue(mockTarotista);
      configRepository.findOne.mockResolvedValue(null);

      const capturedConfigData = {} as TarotistaConfig;
      configRepository.create.mockImplementation(
        (data: Partial<TarotistaConfig>) => {
          Object.assign(capturedConfigData, data);
          return { ...data, id: 1 } as TarotistaConfig;
        },
      );
      configRepository.save.mockResolvedValue({ id: 1 } as TarotistaConfig);

      // Act
      await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );

      // Assert
      expect(capturedConfigData.systemPrompt).toBe(
        flaviaIAConfigData.systemPrompt,
      );
    });

    it('should create config with correct temperature (0.7)', async () => {
      // Arrange
      const mockTarotista = { id: mockTarotistaId } as Tarotista;
      tarotistaRepository.findOne.mockResolvedValue(mockTarotista);
      configRepository.findOne.mockResolvedValue(null);

      const capturedConfigData = {} as TarotistaConfig;
      configRepository.create.mockImplementation(
        (data: Partial<TarotistaConfig>) => {
          Object.assign(capturedConfigData, data);
          return { ...data, id: 1 } as TarotistaConfig;
        },
      );
      configRepository.save.mockResolvedValue({ id: 1 } as TarotistaConfig);

      // Act
      await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );

      // Assert
      expect(capturedConfigData.temperature).toBe(0.7);
    });

    it('should create config with maxTokens 1000', async () => {
      // Arrange
      const mockTarotista = { id: mockTarotistaId } as Tarotista;
      tarotistaRepository.findOne.mockResolvedValue(mockTarotista);
      configRepository.findOne.mockResolvedValue(null);

      const capturedConfigData = {} as TarotistaConfig;
      configRepository.create.mockImplementation(
        (data: Partial<TarotistaConfig>) => {
          Object.assign(capturedConfigData, data);
          return { ...data, id: 1 } as TarotistaConfig;
        },
      );
      configRepository.save.mockResolvedValue({ id: 1 } as TarotistaConfig);

      // Act
      await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );

      // Assert
      expect(capturedConfigData.maxTokens).toBe(1000);
    });

    it('should create config with version 1 and isActive true', async () => {
      // Arrange
      const mockTarotista = { id: mockTarotistaId } as Tarotista;
      tarotistaRepository.findOne.mockResolvedValue(mockTarotista);
      configRepository.findOne.mockResolvedValue(null);

      const capturedConfigData = {} as TarotistaConfig;
      configRepository.create.mockImplementation(
        (data: Partial<TarotistaConfig>) => {
          Object.assign(capturedConfigData, data);
          return { ...data, id: 1 } as TarotistaConfig;
        },
      );
      configRepository.save.mockResolvedValue({ id: 1 } as TarotistaConfig);

      // Act
      await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );

      // Assert
      expect(capturedConfigData.version).toBe(1);
      expect(capturedConfigData.isActive).toBe(true);
    });

    it('should create config with style config', async () => {
      // Arrange
      const mockTarotista = { id: mockTarotistaId } as Tarotista;
      tarotistaRepository.findOne.mockResolvedValue(mockTarotista);
      configRepository.findOne.mockResolvedValue(null);

      const capturedConfigData = {} as TarotistaConfig;
      configRepository.create.mockImplementation(
        (data: Partial<TarotistaConfig>) => {
          Object.assign(capturedConfigData, data);
          return { ...data, id: 1 } as TarotistaConfig;
        },
      );
      configRepository.save.mockResolvedValue({ id: 1 } as TarotistaConfig);

      // Act
      await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );

      // Assert
      expect(capturedConfigData.styleConfig).toEqual(
        flaviaIAConfigData.styleConfig,
      );
    });

    it('should be idempotent - running twice should not create duplicate', async () => {
      // Arrange
      const mockTarotista = { id: mockTarotistaId } as Tarotista;
      const existingConfig = {
        id: 1,
        tarotistaId: mockTarotistaId,
        isActive: true,
      } as TarotistaConfig;

      // First call - config doesn't exist
      tarotistaRepository.findOne.mockResolvedValueOnce(mockTarotista);
      configRepository.findOne.mockResolvedValueOnce(null);
      configRepository.create.mockReturnValueOnce({ id: 1 } as TarotistaConfig);
      configRepository.save.mockResolvedValueOnce({ id: 1 } as TarotistaConfig);

      // Second call - config exists
      tarotistaRepository.findOne.mockResolvedValueOnce(mockTarotista);
      configRepository.findOne.mockResolvedValueOnce(existingConfig);

      // Act
      const configId1 = await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );
      const configId2 = await seedFlaviaIAConfig(
        mockTarotistaId,
        configRepository,
        tarotistaRepository,
      );

      // Assert
      expect(configId1).toBe(configId2);
      expect(configRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
