import { DataSource } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Tarotista } from '../../src/modules/tarotistas/entities/tarotista.entity';
import { UsersService } from '../../src/modules/users/users.service';

/**
 * Configuración predeterminada de Flavia (tarotista del sistema)
 * Usada en tests de integración que requieren un tarotista existente
 */
export const DEFAULT_TAROTISTA_CONFIG = {
  email: 'flavia@tarot.local',
  password: 'FlaviaSecretPass123!',
  name: 'Flavia Sistema',
  tarotista: {
    nombrePublico: 'Flavia',
    bio: 'Tarotista predeterminada del sistema',
    especialidades: ['amor', 'trabajo', 'espiritualidad'],
    idiomas: ['español', 'inglés'],
    añosExperiencia: 15,
    isActive: true,
    ofreceSesionesVirtuales: false,
    precioSesionUsd: 50.0,
    comisionPorcentaje: 70.0,
    ratingPromedio: 4.8,
    totalReseñas: 0,
    isFeatured: true,
    ordenVisualizacion: 1,
  },
};

/**
 * Crea o retorna el tarotista predeterminado "Flavia"
 *
 * @param dataSource - Conexión TypeORM activa
 * @param usersService - Servicio de usuarios para crear usuario si no existe
 * @returns Promise con el tarotista creado/encontrado
 *
 * @example
 * ```typescript
 * const flavia = await setupDefaultTarotista(dataSource, usersService);
 * console.log(flavia.id); // ID del tarotista
 * ```
 */
export async function setupDefaultTarotista(
  dataSource: DataSource,
  usersService: UsersService,
): Promise<Tarotista> {
  const userRepo = dataSource.getRepository(User);
  const tarotistaRepo = dataSource.getRepository(Tarotista);

  // Buscar usuario Flavia existente
  let flaviaUser = await userRepo.findOne({
    where: { email: DEFAULT_TAROTISTA_CONFIG.email },
  });

  // Crear usuario si no existe
  if (!flaviaUser) {
    const createdUser = await usersService.create({
      email: DEFAULT_TAROTISTA_CONFIG.email,
      password: DEFAULT_TAROTISTA_CONFIG.password,
      name: DEFAULT_TAROTISTA_CONFIG.name,
    });

    flaviaUser = (await userRepo.findOne({
      where: { id: createdUser.id },
    }))!;
  }

  // Buscar tarotista existente
  let flaviaTarotista = await tarotistaRepo.findOne({
    where: { userId: flaviaUser.id },
  });

  // Crear tarotista si no existe
  if (!flaviaTarotista) {
    flaviaTarotista = await tarotistaRepo.save({
      userId: flaviaUser.id,
      ...DEFAULT_TAROTISTA_CONFIG.tarotista,
    });
  }

  return flaviaTarotista;
}
