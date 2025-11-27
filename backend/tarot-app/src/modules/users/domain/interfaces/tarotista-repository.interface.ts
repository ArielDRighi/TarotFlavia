import { Tarotista } from '../../../tarotistas/entities/tarotista.entity';

/**
 * Interface para el repositorio de tarotistas
 * Solo define la operación necesaria para el módulo users
 */
export interface ITarotistaRepository {
  /**
   * Busca un tarotista por ID de usuario
   * @param userId - ID del usuario
   * @returns Tarotista encontrado o null
   */
  findByUserId(userId: number): Promise<Tarotista | null>;
}
