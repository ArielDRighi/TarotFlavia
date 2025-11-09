import { Repository } from 'typeorm';
import { TarotistaConfig } from '../../modules/tarotistas/entities/tarotista-config.entity';
import { Tarotista } from '../../modules/tarotistas/entities/tarotista.entity';
import { flaviaIAConfigData } from './data/flavia-ia-config.data';

/**
 * Seeds Flavia IA configuration in the database
 * Idempotent: can be run multiple times without creating duplicates
 *
 * @param tarotistaId - ID of the Flavia tarotista profile
 * @param configRepository - TypeORM repository for TarotistaConfig entity
 * @param tarotistaRepository - TypeORM repository for Tarotista entity
 * @returns configId of the created or existing IA configuration
 */
export async function seedFlaviaIAConfig(
  tarotistaId: number,
  configRepository: Repository<TarotistaConfig>,
  tarotistaRepository: Repository<Tarotista>,
): Promise<number> {
  console.log('🔍 Checking if Flavia IA config exists...');

  // Verify tarotista exists
  const tarotista = await tarotistaRepository.findOne({
    where: { id: tarotistaId },
  });

  if (!tarotista) {
    throw new Error(`Tarotista with ID ${tarotistaId} not found`);
  }

  // Check if active config already exists
  const existingConfig = await configRepository.findOne({
    where: { tarotistaId, isActive: true },
  });

  if (existingConfig) {
    console.log(
      `✅ Flavia IA config already exists (ID: ${existingConfig.id})`,
    );
    return existingConfig.id;
  }

  console.log('🌱 Creating Flavia IA config...');

  // Create IA config
  const config = configRepository.create({
    tarotistaId,
    systemPrompt: flaviaIAConfigData.systemPrompt,
    styleConfig: flaviaIAConfigData.styleConfig as Record<string, unknown>,
    temperature: flaviaIAConfigData.temperature,
    maxTokens: flaviaIAConfigData.maxTokens,
    topP: flaviaIAConfigData.topP,
    customKeywords: flaviaIAConfigData.customKeywords,
    additionalInstructions: flaviaIAConfigData.additionalInstructions,
    version: flaviaIAConfigData.version,
    isActive: flaviaIAConfigData.isActive,
  });

  const savedConfig = await configRepository.save(config);

  console.log(`✅ Flavia IA config created (ID: ${savedConfig.id})`);

  return savedConfig.id;
}
