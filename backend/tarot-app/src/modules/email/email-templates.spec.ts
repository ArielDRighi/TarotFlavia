import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { createMailerOptions } from './mailer.config';

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
    'provider-cost-warning',
    'provider-cost-limit-reached',
    'contact-message',
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

/**
 * Render real de los templates (T-PROD-012).
 *
 * Los tests de `EmailService` mockean `MailerService`, así que **nadie compilaba un
 * `.hbs`**: un template roto (o un `{{placeholder}}` que el servicio no pasa en el
 * contexto) pasaba todo el ciclo de calidad y explotaba en producción.
 *
 * Estos tests montan el `MailerModule` **de verdad** con `jsonTransport` — el mismo
 * modo en que corre el dev local — y lo hacen renderizar. El `HandlebarsAdapter` corre
 * con `strict: true`, así que una variable faltante en el contexto **lanza**.
 */
describe('Email templates (render)', () => {
  /**
   * jsonTransport no envía nada: serializa el mail (con el HTML ya renderizado) en
   * `info.message` como JSON.
   */
  interface JsonTransportInfo {
    message: string;
  }

  interface RenderedMail {
    html: string;
    subject: string;
  }

  async function render(
    template: string,
    context: Record<string, string>,
  ): Promise<RenderedMail> {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot(
          createMailerOptions(new ConfigService({ NODE_ENV: 'test' })),
        ),
      ],
    }).compile();

    const mailerService = moduleRef.get(MailerService);

    const info = (await mailerService.sendMail({
      to: 'destinatario@example.com',
      subject: 'Asunto de prueba',
      template,
      context,
    })) as JsonTransportInfo;

    return JSON.parse(info.message) as RenderedMail;
  }

  /** El contexto que `email.service.ts` le pasa a cada template. */
  const TEMPLATE_CONTEXTS: Record<string, Record<string, string>> = {
    welcome: {
      userName: 'Flavia',
      email: 'flavia@example.com',
      frontendUrl: 'https://auguriatarot.com',
    },
    'password-reset': {
      userName: 'Flavia',
      resetUrl: 'https://auguriatarot.com/restablecer-password?token=un-token',
    },
    'plan-change': {
      userName: 'Flavia',
      oldPlan: 'Free',
      newPlan: 'Premium',
      changeDate: '12/07/2026',
    },
    'quota-warning-80': {
      userName: 'Flavia',
      plan: 'Free',
      requestsUsed: '8',
      requestsRemaining: '2',
      quotaLimit: '10',
      percentageUsed: '80.0',
      resetDate: '01/08/2026',
      frontendUrl: 'https://auguriatarot.com',
    },
    'quota-limit-reached': {
      userName: 'Flavia',
      plan: 'Free',
      requestsUsed: '10',
      quotaLimit: '10',
      resetDate: '01/08/2026',
      frontendUrl: 'https://auguriatarot.com',
    },
    'provider-cost-warning': {
      provider: 'groq',
      currentCost: '16.50',
      monthlyLimit: '20.00',
      percentageUsed: '82.5',
      adminUrl: 'https://auguriatarot.com/admin/consumo',
    },
    'provider-cost-limit-reached': {
      provider: 'groq',
      currentCost: '20.00',
      monthlyLimit: '20.00',
      adminUrl: 'https://auguriatarot.com/admin/consumo',
    },
    'holistic-service-confirmation': {
      userName: 'Flavia',
      serviceName: 'Lectura holística',
      amountArs: '25000',
      bookingUrl: 'https://auguriatarot.com/reservar',
      whatsappNumber: '+54 9 11 1234-5678',
      whatsappNumberForLink: '5491112345678',
    },
    'contact-message': {
      name: 'Ana Pérez',
      email: 'ana@example.com',
      subject: 'Consulta por una lectura',
      message: 'Hola, quería saber cómo reservar una sesión.',
    },
  };

  it.each(Object.keys(TEMPLATE_CONTEXTS))(
    'renderiza %s con el contexto que le pasa EmailService',
    async (template) => {
      const mail = await render(template, TEMPLATE_CONTEXTS[template]);

      expect(mail.html).toBeTruthy();
      // Si quedara un placeholder sin resolver, el .hbs y el servicio se habrían separado.
      expect(mail.html).not.toContain('{{');
    },
  );

  it('renderiza el link de recuperación en password-reset: es el email crítico, sin él el usuario queda afuera de su cuenta', async () => {
    const resetUrl =
      'https://auguriatarot.com/restablecer-password?token=un-token';

    const mail = await render('password-reset', {
      userName: 'Flavia',
      resetUrl,
    });

    expect(mail.html).toContain(resetUrl);
    expect(mail.html).toContain('Flavia');
  });

  describe('contact-message (T-PROD-014)', () => {
    it('incluye los datos del cliente y su mensaje: si falta alguno, el email llega inútil', async () => {
      const mail = await render(
        'contact-message',
        TEMPLATE_CONTEXTS['contact-message'],
      );

      expect(mail.html).toContain('Ana Pérez');
      expect(mail.html).toContain('ana@example.com');
      expect(mail.html).toContain('Consulta por una lectura');
      expect(mail.html).toContain('Hola, quería saber cómo reservar');
    });

    // Los tres campos los escribe un desconocido sin autenticar, no solo el cuerpo.
    it.each([
      ['message', '<script>alert(1)</script>', '&lt;script&gt;'],
      ['name', '<img src=x onerror=alert(1)>', '&lt;img'],
      ['subject', '<b onmouseover=alert(1)>hola</b>', '&lt;b'],
    ])(
      'escapa el HTML de %s: lo escribe un desconocido sin autenticar',
      async (field, payload, escaped) => {
        const mail = await render('contact-message', {
          ...TEMPLATE_CONTEXTS['contact-message'],
          [field]: payload,
        });

        expect(mail.html).not.toContain(payload);
        expect(mail.html).toContain(escaped);
      },
    );
  });

  describe('plan-change: contenido veraz del email de cambio de plan', () => {
    it('usa la marca "Auguria", nunca "Tarot App"', async () => {
      const mail = await render('plan-change', {
        userName: 'Flavia',
        oldPlan: 'Gratuito',
        newPlan: 'Premium',
        changeDate: '22 de julio de 2026',
      });

      expect(mail.html).toContain('Auguria');
      expect(mail.html).not.toContain('Tarot App');
    });

    it('no promete beneficios que el plan Premium no ofrece', async () => {
      const mail = await render('plan-change', {
        userName: 'Flavia',
        oldPlan: 'Gratuito',
        newPlan: 'Premium',
        changeDate: '22 de julio de 2026',
      });

      // Premium NO es ilimitado (1 carta/día + 3 tiradas/día) ni ofrece estas
      // features inexistentes: eran texto genérico erróneo.
      // El núcleo del bug era prometer algo "ilimitado": lo bloqueamos por raíz
      // para atajar futuras reintroducciones ("tiradas ilimitadas", etc.).
      expect(mail.html).not.toMatch(/ilimitad/i);
      expect(mail.html).not.toContain('Soporte prioritario');
      expect(mail.html).not.toContain('Sin publicidad');
      expect(mail.html).not.toContain('Historial completo');
    });

    it('lista los beneficios reales del plan Premium', async () => {
      const mail = await render('plan-change', {
        userName: 'Flavia',
        oldPlan: 'Gratuito',
        newPlan: 'Premium',
        changeDate: '22 de julio de 2026',
      });

      expect(mail.html).toContain('1 carta del día');
      expect(mail.html).toContain('3 tiradas de tarot diarias');
      expect(mail.html).toContain('Preguntas personalizadas');
      expect(mail.html).toContain('Tiradas avanzadas');
      expect(mail.html).toContain('Comparte tus lecturas');
    });
  });
});
