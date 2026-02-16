import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';
import { BirthChart } from '../src/modules/birth-chart/entities/birth-chart.entity';
import { JwtService } from '@nestjs/jwt';
import { UserPlan, UserRole } from '../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { ValidationPipe } from '@nestjs/common';

/**
 * Configuración de test data para carta astral
 */
export const TEST_BIRTH_DATA = {
  name: 'Test User',
  birthDate: '1990-05-15',
  birthTime: '14:30',
  birthPlace: 'Buenos Aires, Argentina',
  latitude: -34.6037,
  longitude: -58.3816,
  timezone: 'America/Argentina/Buenos_Aires',
};

/**
 * Interfaz para datos de usuario de test
 */
export interface TestUserData {
  email: string;
  password: string;
  name: string;
  plan: UserPlan;
  roles?: UserRole[];
}

/**
 * Tipo para resultado de query SQL de usuario
 */
interface UserQueryResult {
  id: number;
  email: string;
  name: string;
  plan: UserPlan;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipo para resultado de query SQL de carta astral
 */
interface BirthChartQueryResult {
  id: number;
  userId: number;
  name: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  chartData: string;
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Crea y configura la aplicación de test
 */
export async function createTestingApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * Crea un usuario de test con plan específico
 */
export async function createTestUser(
  app: INestApplication,
  overrides: Partial<TestUserData> = {},
): Promise<User> {
  const dataSource = app.get(DataSource);
  const timestamp = Date.now();

  const userData = {
    email: `test-${timestamp}@example.com`,
    password: await bcrypt.hash('TestPassword123!', 10),
    name: 'Test User',
    plan: UserPlan.FREE,
    roles: [UserRole.CONSUMER],
    ...overrides,
  };

  const result = await dataSource.query<UserQueryResult[]>(
    `
    INSERT INTO "user" (email, password, name, plan, roles)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, name, plan, roles, "createdAt", "updatedAt"
  `,
    [
      userData.email,
      userData.password,
      userData.name,
      userData.plan,
      userData.roles,
    ],
  );

  const userResult = result[0];
  if (!userResult) {
    throw new Error('Failed to create test user');
  }

  return userResult as unknown as User;
}

/**
 * Genera token JWT para un usuario
 */
export function generateAuthToken(app: INestApplication, user: User): string {
  const jwtService = app.get(JwtService);
  return jwtService.sign({
    sub: user.id,
    email: user.email,
    plan: user.plan,
    roles: user.roles,
  });
}

/**
 * Limpia cartas de test de la base de datos
 */
export async function cleanupBirthCharts(
  app: INestApplication,
  userId?: number,
): Promise<void> {
  const dataSource = app.get(DataSource);

  if (userId) {
    await dataSource.query('DELETE FROM birth_charts WHERE "userId" = $1', [
      userId,
    ]);
  } else {
    await dataSource.query("DELETE FROM birth_charts WHERE name LIKE '%Test%'");
  }
}

/**
 * Limpia usuarios de test de la base de datos
 */
export async function cleanupTestUsers(
  app: INestApplication,
  email?: string,
): Promise<void> {
  const dataSource = app.get(DataSource);

  if (email) {
    await dataSource.query('DELETE FROM "user" WHERE email = $1', [email]);
  } else {
    await dataSource.query('DELETE FROM "user" WHERE email LIKE \'test-%\'');
  }
}

/**
 * Crea una carta astral de test en la base de datos
 */
export async function createTestBirthChart(
  app: INestApplication,
  userId: number,
  overrides: Partial<BirthChart> = {},
): Promise<BirthChart> {
  const dataSource = app.get(DataSource);

  const chartData = {
    userId,
    name: overrides.name || 'Test Chart',
    birthDate: overrides.birthDate || new Date('1990-05-15'),
    birthTime: overrides.birthTime || '14:30:00',
    birthPlace: overrides.birthPlace || TEST_BIRTH_DATA.birthPlace,
    latitude: overrides.latitude || TEST_BIRTH_DATA.latitude,
    longitude: overrides.longitude || TEST_BIRTH_DATA.longitude,
    timezone: overrides.timezone || TEST_BIRTH_DATA.timezone,
    chartData: overrides.chartData || {
      planets: [],
      houses: [],
      aspects: [],
      ascendant: {
        planet: 'ascendant',
        longitude: 0,
        sign: 'aries',
        signDegree: 0,
        house: 1,
        isRetrograde: false,
      },
      midheaven: {
        planet: 'midheaven',
        longitude: 0,
        sign: 'cancer',
        signDegree: 0,
        house: 10,
        isRetrograde: false,
      },
      distribution: {
        elements: { fire: 3, earth: 2, air: 3, water: 2 },
        modalities: { cardinal: 3, fixed: 4, mutable: 3 },
        polarity: { masculine: 6, feminine: 4 },
      },
    },
    sunSign: overrides.sunSign || 'taurus',
    moonSign: overrides.moonSign || 'scorpio',
    ascendantSign: overrides.ascendantSign || 'virgo',
  };

  const result = await dataSource.query<BirthChartQueryResult[]>(
    `
    INSERT INTO birth_charts (
      "userId", name, "birthDate", "birthTime", "birthPlace",
      latitude, longitude, timezone, "chartData",
      "sunSign", "moonSign", "ascendantSign"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `,
    [
      chartData.userId,
      chartData.name,
      chartData.birthDate,
      chartData.birthTime,
      chartData.birthPlace,
      chartData.latitude,
      chartData.longitude,
      chartData.timezone,
      JSON.stringify(chartData.chartData),
      chartData.sunSign,
      chartData.moonSign,
      chartData.ascendantSign,
    ],
  );

  const chartResult = result[0];
  if (!chartResult) {
    throw new Error('Failed to create test birth chart');
  }

  return chartResult as unknown as BirthChart;
}

/**
 * Genera un fingerprint único para tests anónimos
 */
export function generateTestFingerprint(): string {
  return `test-fingerprint-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
