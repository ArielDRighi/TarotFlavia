import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Guarda de regresión (T-PROD-015).
 *
 * `nest build` es tsc: NO copia los `.hbs`. Si el glob de assets de `nest-cli.json` se
 * pierde, el build compila igual, los tests unitarios pasan igual (ts-jest corre desde
 * `src/`, donde los templates existen) y **en producción todos los emails se caen con
 * ENOENT**, en silencio, porque los llamadores tragan el error. Ya pasó: hasta este
 * commit, `dist/` no tenía un solo template.
 */
describe('Email templates (build)', () => {
  const emailModuleDir = __dirname;
  const projectRoot = join(__dirname, '..', '..', '..');

  /** Templates que `email.service.ts` referencia por nombre */
  const REQUIRED_TEMPLATES = [
    'welcome',
    'password-reset',
    'plan-change',
    'quota-warning-80',
    'quota-limit-reached',
    'holistic-service-confirmation',
  ];

  it.each(REQUIRED_TEMPLATES)(
    'debe existir el template %s.hbs que usa EmailService',
    (template) => {
      expect(
        existsSync(join(emailModuleDir, 'templates', `${template}.hbs`)),
      ).toBe(true);
    },
  );

  it('nest-cli.json debe copiar los templates al build (si no, ningún email sale en producción)', () => {
    interface NestCliConfig {
      compilerOptions?: {
        assets?: Array<{ include: string; outDir: string }>;
      };
    }

    const nestCli = JSON.parse(
      readFileSync(join(projectRoot, 'nest-cli.json'), 'utf-8'),
    ) as NestCliConfig;

    const assets = nestCli.compilerOptions?.assets ?? [];
    const templatesAsset = assets.find((asset) =>
      asset.include.includes('modules/email/templates'),
    );

    expect(templatesAsset).toBeDefined();
    expect(templatesAsset?.include).toContain('.hbs');
    expect(templatesAsset?.outDir).toBe('dist/src');
  });
});
