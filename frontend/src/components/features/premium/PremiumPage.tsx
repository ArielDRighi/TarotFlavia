'use client';

// 1. React & Next.js
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// 2. Icons
import { Check, X, Shield, Star, HelpCircle } from 'lucide-react';
// 5. Components (ui → features)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Reveal } from '@/components/common/Reveal';
import { PremiumHero } from './PremiumHero';
// 4. Custom hooks
import { usePublicPlans } from '@/hooks/api/usePublicPlans';
import { useCreatePreapproval } from '@/hooks/api/useSubscription';
import { useAuthStore } from '@/stores/authStore';
// 6. Utils & types
import { ROUTES } from '@/lib/constants/routes';
import { CTA_PREMIUM } from '@/lib/constants/cta-copy';
import { formatPriceArs } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import type { EditorialImage } from '@/lib/data/encyclopedia-editorial.data';
import type { PlanConfig } from '@/types/admin.types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Brand-night gradient reused as the comparison table header background, kept in
 * sync with `PremiumHero`/`DashboardHero` and the `--color-bg-hero` tokens.
 */
const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const CREAM = '#f9f7f2';
const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

/**
 * Themed header image for the mystic welcome band (T-PREM-004). `PremiumHero`
 * degrades to its gradient band if the asset ever fails to load.
 */
const PREMIUM_HERO_IMAGE: EditorialImage = {
  src: '/images/premium/premium-hero.webp',
  alt: 'Llave dorada abriendo una carta de tarot con geometría sagrada, bajo un cielo nocturno violeta con luna creciente y estrellas',
};

interface PlanFeature {
  text: string;
  free: boolean;
  premium: boolean;
}

const COMPARISON_FEATURES: PlanFeature[] = [
  { text: 'Carta del día', free: true, premium: true },
  { text: 'Lecturas de tarot', free: true, premium: true },
  { text: 'Tiradas básicas (1 carta)', free: true, premium: true },
  { text: 'Tiradas avanzadas (3, 5 cartas y Cruz Céltica)', free: false, premium: true },
  { text: 'Interpretación con IA personalizada', free: false, premium: true },
  { text: 'Preguntas personalizadas', free: false, premium: true },
  { text: 'Historial de 365 días', free: false, premium: true },
  { text: 'Compartir lecturas', free: false, premium: true },
  { text: 'Horóscopo y numerología', free: true, premium: true },
  { text: 'Rituales recomendados por IA', free: false, premium: true },
];

const FAQ_ITEMS = [
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer:
      'Sí, podés cancelar tu suscripción en cualquier momento desde tu perfil. No hay contratos ni penalidades.',
  },
  {
    question: '¿Cómo funciona el pago?',
    answer:
      'El pago se procesa de forma segura a través de MercadoPago. Se renueva automáticamente cada mes hasta que canceles.',
  },
  {
    question: '¿Qué pasa con mis lecturas si cancelo?',
    answer:
      'Tu historial de lecturas se conserva. Solo perderás acceso a las funciones Premium al vencer el período pagado.',
  },
  {
    question: '¿Hay período de prueba?',
    answer:
      'Por el momento no ofrecemos período de prueba gratuito, pero podés probar las funciones básicas con la cuenta Free sin costo.',
  },
];

// ============================================================================
// Sub-components
// ============================================================================

function PremiumPageSkeleton() {
  return (
    <div data-testid="premium-page-loading" className="container mx-auto max-w-5xl px-4 py-10">
      <Skeleton className="mb-8 h-64 w-full rounded-2xl" />
      <Skeleton className="mx-auto mb-10 h-8 w-2/3" />
      <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

interface PremiumCtaButtonProps {
  premiumPlan: PlanConfig | undefined;
  testId?: string;
  /** When rendered over the dark hero band, adapt the "already premium" text to cream. */
  onDark?: boolean;
}

function PremiumCtaButton({ premiumPlan, testId, onDark = false }: PremiumCtaButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: createPreapproval, isPending } = useCreatePreapproval();

  const handleClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.REGISTER);
      return;
    }

    if (user?.plan === 'free') {
      createPreapproval(undefined, {
        onSuccess: (data: { initPoint: string }) => {
          window.location.href = data.initPoint;
        },
      });
    }
  }, [isAuthenticated, user, router, createPreapproval]);

  if (user?.plan === 'premium') {
    return (
      <div className="flex flex-col items-center gap-2" data-testid={testId}>
        <div
          className={cn('flex items-center gap-2 font-semibold', !onDark && 'text-foreground')}
          style={onDark ? { color: CREAM } : undefined}
        >
          <Star className="text-secondary h-5 w-5" aria-hidden="true" />
          <span>Ya tenés Premium</span>
        </div>
        <Link
          href={ROUTES.PERFIL}
          className={cn(
            'focus-visible:ring-secondary rounded-sm text-sm underline transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            onDark
              ? 'focus-visible:ring-offset-bg-hero'
              : 'text-muted-foreground hover:text-foreground'
          )}
          style={onDark ? { color: CREAM_MUTED } : undefined}
        >
          Ver mi cuenta
        </Link>
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      size="lg"
      data-testid={testId}
      className="focus-visible:ring-secondary w-full"
    >
      {isPending ? 'Redirigiendo...' : CTA_PREMIUM.PURCHASE}
      {premiumPlan && !isPending && (
        <span className="ml-2 text-sm opacity-80">{formatPriceArs(premiumPlan.price)}/mes</span>
      )}
    </Button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PremiumPage() {
  const { data: plans, isLoading } = usePublicPlans();

  if (isLoading) {
    return <PremiumPageSkeleton />;
  }

  const freePlan = plans?.find((p) => p.planType === 'free');
  const premiumPlan = plans?.find((p) => p.planType === 'premium');

  const heroSubtitle = (
    <>
      Interpretaciones personalizadas con IA, tiradas avanzadas, historial completo y mucho más
      {premiumPlan ? (
        <>
          {' '}
          por{' '}
          <span className="text-secondary font-bold">{formatPriceArs(premiumPlan.price)}/mes</span>
        </>
      ) : (
        ' por un precio accesible'
      )}
    </>
  );

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-10">
      {/* Banda mística de bienvenida */}
      <Reveal index={0}>
        <PremiumHero
          badge="Plan Premium"
          title="Desbloquea todo el potencial del Tarot"
          subtitle={heroSubtitle}
          image={PREMIUM_HERO_IMAGE}
        >
          <PremiumCtaButton premiumPlan={premiumPlan} testId="cta-hero" onDark />
        </PremiumHero>
      </Reveal>

      {/* Comparativa de planes */}
      <Reveal index={1}>
        <section data-testid="plan-comparison" className="py-14 sm:py-16">
          <h2 className="text-foreground mb-12 text-center font-serif text-3xl font-bold">
            ¿Qué plan se adapta a ti?
          </h2>

          {/* Tarjetas de plan */}
          <div className="mb-16 grid items-stretch gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-3xl">
            {/* Plan Free */}
            <Card className="flex flex-col">
              <CardHeader className="text-center">
                <h3 className="text-card-foreground mb-2 font-serif text-2xl font-bold">
                  {freePlan?.name ?? 'Free'}
                </h3>
                <p className="text-foreground mb-4 text-4xl font-bold">Gratis</p>
                <p className="text-muted-foreground text-sm">
                  {freePlan?.description ?? 'Empieza tu viaje espiritual'}
                </p>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href={ROUTES.REGISTER}>Registrarse gratis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plan Premium (destacado) */}
            <Card className="border-secondary relative flex flex-col shadow-[var(--shadow-soft)]">
              <span className="bg-secondary text-bg-hero absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold tracking-[0.08em] uppercase">
                Recomendado
              </span>
              <CardHeader className="text-center">
                <h3 className="text-card-foreground mb-2 font-serif text-2xl font-bold">
                  {premiumPlan?.name ?? 'Premium'}
                </h3>
                <p className="text-foreground mb-4 text-4xl font-bold">
                  {premiumPlan ? formatPriceArs(premiumPlan.price) : '---'}
                  <span className="text-muted-foreground text-lg font-normal">/mes</span>
                </p>
                <p className="text-muted-foreground text-sm">
                  {premiumPlan?.description ?? 'Desbloquea todo el potencial'}
                </p>
              </CardHeader>
              <CardContent className="mt-auto">
                <PremiumCtaButton premiumPlan={premiumPlan} testId="cta-card" />
              </CardContent>
            </Card>
          </div>

          {/* Tabla comparativa */}
          <div className="border-border mx-auto max-w-2xl overflow-hidden rounded-xl border">
            <table className="w-full">
              <thead>
                <tr style={{ background: HERO_GRADIENT }}>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold"
                    style={{ color: CREAM }}
                  >
                    Característica
                  </th>
                  <th
                    className="px-4 py-4 text-center text-sm font-semibold"
                    style={{ color: CREAM_MUTED }}
                  >
                    Free
                  </th>
                  <th
                    className="px-4 py-4 text-center text-sm font-semibold"
                    style={{ color: CREAM }}
                  >
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {COMPARISON_FEATURES.map((feature) => (
                  <tr key={feature.text} className="hover:bg-muted/40">
                    <td className="text-foreground px-6 py-3 text-sm">{feature.text}</td>
                    <td className="px-4 py-3 text-center">
                      {feature.free ? (
                        <Check className="text-secondary mx-auto h-5 w-5" aria-label="Incluido" />
                      ) : (
                        <X
                          className="text-muted-foreground mx-auto h-5 w-5"
                          aria-label="No incluido"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {feature.premium ? (
                        <Check className="text-secondary mx-auto h-5 w-5" aria-label="Incluido" />
                      ) : (
                        <X
                          className="text-muted-foreground mx-auto h-5 w-5"
                          aria-label="No incluido"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* Sin compromiso */}
      <Reveal index={2}>
        <section className="pb-14">
          <Card className="mx-auto max-w-xl p-8 text-center">
            <Shield className="text-secondary mx-auto mb-4 h-12 w-12" aria-hidden="true" />
            <h2 className="text-card-foreground mb-3 font-serif text-2xl font-bold">
              Sin compromiso
            </h2>
            <p className="text-muted-foreground">
              Cancelá cuando quieras, sin compromiso ni cargos adicionales. Tu historial y lecturas
              se conservan siempre.
            </p>
          </Card>
        </section>
      </Reveal>

      {/* Preguntas frecuentes */}
      <Reveal index={3}>
        <section data-testid="faq-section" className="mx-auto max-w-2xl pb-14">
          <h2 className="text-foreground mb-10 text-center font-serif text-3xl font-bold">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <Card key={item.question} className="p-6">
                <div className="mb-2 flex items-start gap-3">
                  <HelpCircle
                    className="text-secondary mt-0.5 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <h3 className="text-card-foreground font-semibold">{item.question}</h3>
                </div>
                <p className="text-muted-foreground pl-8">{item.answer}</p>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      {/* CTA final */}
      <Reveal index={4}>
        <section className="mx-auto max-w-xl pb-8 text-center">
          <h2 className="text-foreground mb-4 font-serif text-2xl font-bold">
            ¿Listo para comenzar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Únete a nuestra comunidad y descubre el poder del tarot con interpretaciones
            personalizadas.
          </p>
          <div className="mx-auto max-w-xs">
            <PremiumCtaButton premiumPlan={premiumPlan} testId="cta-bottom" />
          </div>
        </section>
      </Reveal>
    </main>
  );
}
