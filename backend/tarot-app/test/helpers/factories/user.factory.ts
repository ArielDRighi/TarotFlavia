import {
  User,
  UserPlan,
} from '../../../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

interface CreateUserFactoryOptions {
  id?: number;
  email?: string;
  password?: string;
  name?: string;
  isAdmin?: boolean;
  plan?: UserPlan;
  isBannedFlag?: boolean;
  banReason?: string | null;
  lastLogin?: Date | null;
}

/**
 * Factory para crear usuarios de prueba
 * Sigue el patrón Factory para simplificar la creación de datos de test
 */
export class UserFactory {
  private static counter = 1;

  /**
   * Crea un usuario de prueba con valores por defecto razonables
   */
  static async create(options: CreateUserFactoryOptions = {}): Promise<User> {
    const id = options.id ?? this.counter++;
    const password = options.password ?? 'Test1234!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.id = id;
    user.email = options.email ?? `user${id}@test.com`;
    user.password = hashedPassword;
    user.name = options.name ?? `Test User ${id}`;
    user.isAdmin = options.isAdmin ?? false;
    user.plan = options.plan ?? UserPlan.FREE;
    user.bannedAt = options.isBannedFlag ? new Date() : null;
    user.banReason = options.banReason ?? null;
    user.lastLogin = options.lastLogin ?? null;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return user;
  }

  /**
   * Crea un usuario admin
   */
  static async createAdmin(
    options: CreateUserFactoryOptions = {},
  ): Promise<User> {
    return this.create({
      ...options,
      isAdmin: true,
      name: options.name ?? 'Admin User',
    });
  }

  /**
   * Crea un usuario premium
   */
  static async createPremium(
    options: CreateUserFactoryOptions = {},
  ): Promise<User> {
    return this.create({
      ...options,
      plan: UserPlan.PREMIUM,
      name: options.name ?? 'Premium User',
    });
  }

  /**
   * Crea un usuario free
   */
  static async createFree(
    options: CreateUserFactoryOptions = {},
  ): Promise<User> {
    return this.create({
      ...options,
      plan: UserPlan.FREE,
      name: options.name ?? 'Free User',
    });
  }

  /**
   * Crea un usuario baneado
   */
  static async createBanned(
    options: CreateUserFactoryOptions = {},
  ): Promise<User> {
    return this.create({
      ...options,
      isBannedFlag: true,
      banReason: options.banReason ?? 'Banned for testing',
      name: options.name ?? 'Banned User',
    });
  }

  /**
   * Crea múltiples usuarios
   */
  static async createMany(
    count: number,
    options: CreateUserFactoryOptions = {},
  ): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(options));
    }
    return users;
  }

  /**
   * Resetea el contador (útil para tests aislados)
   */
  static resetCounter(): void {
    this.counter = 1;
  }
}
