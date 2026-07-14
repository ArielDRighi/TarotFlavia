/**
 * URL base de la aplicación.
 *
 * Se lee en cada llamada (y no en un `const` de módulo) para que `robots.ts` y
 * `sitemap.ts` la resuelvan en el entorno donde corren, y para que los tests
 * puedan simular staging y producción.
 */
export function getBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (appUrl) return appUrl;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable must be set in production.');
  }

  return 'http://localhost:3001';
}
