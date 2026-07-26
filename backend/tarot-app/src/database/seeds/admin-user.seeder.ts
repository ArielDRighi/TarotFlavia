import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  User,
  UserRole,
  UserPlan,
  SubscriptionStatus,
} from '../../modules/users/entities/user.entity';

/**
 * Datos de entrada para crear/promover un usuario admin.
 */
export interface AdminSeedInput {
  email: string;
  password: string;
  name: string;
}

/**
 * Resultado del seed de admin.
 * - `created`: se creó un usuario nuevo con rol admin.
 * - `promoted`: ya existía el email y se le agregó el rol admin.
 * - `already-admin`: el usuario ya existía y ya era admin (no se hizo nada).
 */
export type AdminSeedAction = 'created' | 'promoted' | 'already-admin';

export interface AdminSeedResult {
  userId: number;
  action: AdminSeedAction;
}

const BCRYPT_ROUNDS = 10;

/**
 * Crea (o promueve) un usuario administrador de forma idempotente.
 *
 * A diferencia de los seeds de Flavia / test users, las credenciales NO están
 * hardcodeadas: se reciben por parámetro (típicamente desde variables de entorno),
 * para poder crear el primer admin en producción sin exponer secretos en el repo.
 *
 * Comportamiento:
 * - Si NO existe el email → crea el usuario con roles [CONSUMER, ADMIN].
 * - Si existe y NO es admin → le agrega el rol ADMIN (no toca su password).
 * - Si existe y ya es admin → no hace nada.
 *
 * @param userRepository - Repositorio TypeORM de User
 * @param input - Email, password y nombre del admin
 * @returns Id del usuario y la acción realizada
 */
export async function seedAdminUser(
  userRepository: Repository<User>,
  input: AdminSeedInput,
): Promise<AdminSeedResult> {
  const email = input.email.trim().toLowerCase();

  const existingUser = await userRepository.findOne({ where: { email } });

  if (existingUser) {
    if (existingUser.roles?.includes(UserRole.ADMIN)) {
      console.log(
        `✅ El usuario ${email} ya es admin (ID: ${existingUser.id})`,
      );
      return { userId: existingUser.id, action: 'already-admin' };
    }

    // Promover: agregar rol admin sin sobreescribir la password existente.
    existingUser.roles = [
      ...new Set([...(existingUser.roles ?? []), UserRole.ADMIN]),
    ];
    existingUser.isAdmin = true;
    const promoted = await userRepository.save(existingUser);
    console.log(`⬆️  Usuario ${email} promovido a admin (ID: ${promoted.id})`);
    return { userId: promoted.id, action: 'promoted' };
  }

  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = userRepository.create({
    email,
    name: input.name,
    password: hashedPassword,
    roles: [UserRole.CONSUMER, UserRole.ADMIN],
    isAdmin: true,
    plan: UserPlan.PREMIUM,
    planStartedAt: new Date(),
    subscriptionStatus: SubscriptionStatus.ACTIVE,
  });

  const savedUser = await userRepository.save(user);
  console.log(`🌱 Admin creado: ${email} (ID: ${savedUser.id})`);
  return { userId: savedUser.id, action: 'created' };
}
