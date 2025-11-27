import { User, UserWithoutPassword } from '../../entities/user.entity';
import { DeleteResult } from 'typeorm';
import { UserQueryDto } from '../../application/dto/user-query.dto';
import { UserListResponseDto } from '../../application/dto/user-list-response.dto';

/**
 * Interface para el repositorio de usuarios
 * Define las operaciones de persistencia sin depender de TypeORM
 */
export interface IUserRepository {
  /**
   * Crea un nuevo usuario
   * @param email - Email del usuario (normalizado a lowercase)
   * @param hashedPassword - Contraseña hasheada
   * @param name - Nombre del usuario
   * @returns Usuario creado sin contraseña
   */
  create(
    email: string,
    hashedPassword: string,
    name: string,
  ): Promise<UserWithoutPassword>;

  /**
   * Busca un usuario por email
   * @param email - Email del usuario
   * @returns Usuario encontrado o null
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca un usuario por ID
   * @param id - ID del usuario
   * @returns Usuario encontrado o null
   */
  findById(id: number): Promise<User | null>;

  /**
   * Obtiene todos los usuarios
   * @returns Lista de usuarios sin contraseñas
   */
  findAll(): Promise<User[]>;

  /**
   * Actualiza un usuario
   * @param user - Usuario con los cambios
   * @returns Usuario actualizado sin contraseña
   */
  save(user: User): Promise<UserWithoutPassword>;

  /**
   * Elimina un usuario
   * @param id - ID del usuario a eliminar
   * @returns Resultado de la eliminación
   */
  delete(id: number): Promise<DeleteResult>;

  /**
   * Busca usuarios con filtros, paginación y ordenamiento
   * @param query - Parámetros de búsqueda
   * @returns Lista paginada de usuarios
   */
  findWithFilters(query: UserQueryDto): Promise<UserListResponseDto>;

  /**
   * Busca un usuario con sus readings
   * @param userId - ID del usuario
   * @returns Usuario con readings o null
   */
  findByIdWithReadings(userId: number): Promise<User | null>;
}
