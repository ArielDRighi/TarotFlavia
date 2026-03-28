'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Shield, Star, Zap, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicPlans } from '@/hooks/api/usePublicPlans';
import { useCreatePreapproval } from '@/hooks/api/useSubscription';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants/routes';
import type { PlanConfig } from '@/types/admin.types';

// ============================================================================
// Constants
// ============================================================================

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
    <div data-testid="premium-page-loading" className="container mx-auto px-4 py-12">
      <Skeleton className="mx-auto mb-4 h-12 w-2/3" />
      <Skeleton className="mx-auto mb-12 h-6 w-1/2" />
      <div className="grid gap-8 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-96 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

interface PremiumCtaButtonProps {
  premiumPlan: PlanConfig | undefined;
  testId?: string;
}

function PremiumCtaButton({ premiumPlan, testId }: PremiumCtaButtonProps) {
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
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <Star className="h-5 w-5" />
          <span className="font-semibold">Ya tenés Premium</span>
        </div>
        <Link
          href={ROUTES.PERFIL}
          className="text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
      className="w-full bg-purple-600 text-white hover:bg-purple-700"
    >
      {isPending ? 'Redirigiendo...' : 'Comenzar Premium'}
      {premiumPlan && !isPending && (
        <span className="ml-2 text-sm opacity-80">${premiumPlan.price.toFixed(2)}/mes</span>
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

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white px-4 py-16 text-center dark:from-purple-950 dark:to-gray-900">
        <div className="container mx-auto max-w-3xl">
          <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            <Zap className="mr-1 h-3 w-3" />
            Plan Premium
          </Badge>
          <h1 className="mb-6 font-serif text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Desbloquea todo el potencial del Tarot
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            Interpretaciones personalizadas con IA, tiradas avanzadas, historial completo y mucho
            más por{' '}
            {premiumPlan ? (
              <span className="font-bold text-purple-600 dark:text-purple-400">
                ${premiumPlan.price.toFixed(2)}/mes
              </span>
            ) : (
              'un precio accesible'
            )}
          </p>
          <PremiumCtaButton premiumPlan={premiumPlan} testId="cta-hero" />
        </div>
      </section>

      {/* Plan Comparison Section */}
      <section data-testid="plan-comparison" className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center font-serif text-3xl font-bold text-gray-900 dark:text-white">
          ¿Qué plan se adapta a ti?
        </h2>

        {/* Plan Cards */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {/* Free Plan Card */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="text-center">
              <h3 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {freePlan?.name ?? 'Free'}
              </h3>
              <p className="mb-4 text-4xl font-bold text-gray-600 dark:text-gray-300">Gratis</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {freePlan?.description ?? 'Empieza tu viaje espiritual'}
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href={ROUTES.REGISTER}>Registrarse gratis</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan Card */}
          <Card className="relative border-purple-300 shadow-lg dark:border-purple-700">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-purple-600 px-4 py-1">
              Recomendado
            </Badge>
            <CardHeader className="text-center">
              <h3 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {premiumPlan?.name ?? 'Premium'}
              </h3>
              <p className="mb-4 text-4xl font-bold text-purple-600 dark:text-purple-400">
                {premiumPlan ? `$${premiumPlan.price.toFixed(2)}` : '---'}
                <span className="text-lg font-normal">/mes</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {premiumPlan?.description ?? 'Desbloquea todo el potencial'}
              </p>
            </CardHeader>
            <CardContent>
              <PremiumCtaButton premiumPlan={premiumPlan} testId="cta-card" />
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Característica
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Free
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {COMPARISON_FEATURES.map((feature) => (
                <tr key={feature.text} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {feature.text}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {feature.free ? (
                      <Check className="mx-auto h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {feature.premium ? (
                      <Check className="mx-auto h-5 w-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="bg-purple-50 px-4 py-12 text-center dark:bg-purple-950/30">
        <div className="container mx-auto max-w-xl">
          <Shield className="mx-auto mb-4 h-12 w-12 text-purple-600 dark:text-purple-400" />
          <h2 className="mb-3 font-serif text-2xl font-bold text-gray-900 dark:text-white">
            Sin compromiso
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Cancelá cuando quieras, sin compromiso ni cargos adicionales. Tu historial y lecturas se
            conservan siempre.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section data-testid="faq-section" className="container mx-auto max-w-2xl px-4 py-16">
        <h2 className="mb-10 text-center font-serif text-3xl font-bold text-gray-900 dark:text-white">
          Preguntas frecuentes
        </h2>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-gray-200 p-6 dark:border-gray-700"
            >
              <div className="mb-3 flex items-start gap-3">
                <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.question}</h3>
              </div>
              <p className="pl-8 text-gray-600 dark:text-gray-300">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto max-w-xl px-4 pb-16 text-center">
        <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900 dark:text-white">
          ¿Listo para comenzar?
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          Únete a nuestra comunidad y descubre el poder del tarot con interpretaciones
          personalizadas.
        </p>
        <PremiumCtaButton premiumPlan={premiumPlan} testId="cta-bottom" />
      </section>
    </main>
  );
}
