import { Repository } from 'typeorm';
import { Tarotista } from '../../modules/tarotistas/entities/tarotista.entity';
import { User } from '../../modules/users/entities/user.entity';
import { flaviaTarotistaData } from './data/flavia-tarotista.data';

/**
 * Seeds Flavia tarotista profile in the database
 * Idempotent: can be run multiple times without creating duplicates
 *
 * @param userId - ID of the Flavia user
 * @param tarotistaRepository - TypeORM repository for Tarotista entity
 * @param userRepository - TypeORM repository for User entity
 * @returns tarotistaId of the created or existing tarotista profile
 */
export async function seedFlaviaTarotista(
  userId: number,
  tarotistaRepository: Repository<Tarotista>,
  userRepository: Repository<User>,
): Promise<number> {
  console.log('🔍 Checking if Flavia tarotista profile exists...');

  // Verify user exists
  const user = await userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Check if tarotista profile already exists
  const existingTarotista = await tarotistaRepository.findOne({
    where: { userId },
  });

  if (existingTarotista) {
    console.log(
      `✅ Flavia tarotista profile already exists (ID: ${existingTarotista.id})`,
    );
    return existingTarotista.id;
  }

  console.log('🌱 Creating Flavia tarotista profile...');

  // Create tarotista profile
  const tarotista = tarotistaRepository.create({
    userId,
    nombrePublico: flaviaTarotistaData.nombrePublico,
    bio: flaviaTarotistaData.bio,
    fotoPerfil: flaviaTarotistaData.fotoPerfil,
    especialidades: flaviaTarotistaData.especialidades,
    idiomas: flaviaTarotistaData.idiomas,
    añosExperiencia: flaviaTarotistaData.añosExperiencia,
    ofreceSesionesVirtuales: flaviaTarotistaData.ofreceSesionesVirtuales,
    precioSesionUsd: flaviaTarotistaData.precioSesionUsd,
    duracionSesionMinutos: flaviaTarotistaData.duracionSesionMinutos,
    isActive: flaviaTarotistaData.isActive,
    isAcceptingNewClients: flaviaTarotistaData.isAcceptingNewClients,
    isFeatured: flaviaTarotistaData.isFeatured,
    comisiónPorcentaje: flaviaTarotistaData.comisiónPorcentaje,
  });

  const savedTarotista = await tarotistaRepository.save(tarotista);

  console.log(`✅ Flavia tarotista profile created (ID: ${savedTarotista.id})`);

  return savedTarotista.id;
}
