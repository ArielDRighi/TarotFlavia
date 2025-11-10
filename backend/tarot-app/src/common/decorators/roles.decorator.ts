import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator para proteger endpoints con roles específicos.
 * Usa lógica OR: el usuario necesita tener AL MENOS uno de los roles especificados.
 *
 * @example
 * // Solo ADMIN puede acceder
 * @Roles(UserRole.ADMIN)
 *
 * @example
 * // TAROTIST o ADMIN pueden acceder
 * @Roles(UserRole.TAROTIST, UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
