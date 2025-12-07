import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

/**
 * Global prefix for API routes (must match main.ts)
 */
export const API_PREFIX = 'api/v1';

/**
 * Configuration options for creating a test application
 */
export interface CreateTestAppOptions {
  /**
   * Custom module builder function to override providers
   */
  moduleBuilder?: (builder: TestingModuleBuilder) => TestingModuleBuilder;
}

/**
 * Creates a NestJS test application with the same configuration as production.
 * This ensures consistency between tests and the actual application.
 *
 * Features:
 * - Sets global API prefix (api/v1)
 * - Configures validation pipes
 * - Uses production AppModule
 *
 * @param options - Optional configuration options
 * @returns Promise with the configured NestJS application
 *
 * @example
 * ```typescript
 * let app: INestApplication;
 *
 * beforeAll(async () => {
 *   app = await createTestApp();
 * });
 *
 * afterAll(async () => {
 *   await app.close();
 * });
 *
 * it('should access the API', async () => {
 *   await request(app.getHttpServer())
 *     .get('/api/v1/health')
 *     .expect(200);
 * });
 * ```
 */
export async function createTestApp(
  options?: CreateTestAppOptions,
): Promise<INestApplication> {
  let moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  // Apply custom module builder if provided
  if (options?.moduleBuilder) {
    moduleBuilder = options.moduleBuilder(moduleBuilder);
  }

  const moduleFixture: TestingModule = await moduleBuilder.compile();

  const app = moduleFixture.createNestApplication();

  // Set global API prefix (must match main.ts)
  app.setGlobalPrefix(API_PREFIX);

  // Configure validation pipes (must match main.ts)
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
 * Helper to build API paths with the correct prefix
 *
 * @param path - The path without prefix (e.g., '/readings')
 * @returns The full path with prefix (e.g., '/api/v1/readings')
 *
 * @example
 * ```typescript
 * await request(app.getHttpServer())
 *   .get(apiPath('/readings'))
 *   .expect(200);
 * ```
 */
export function apiPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${API_PREFIX}${normalizedPath}`;
}
