'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/common/Reveal';
import { PremiumHero } from './PremiumHero';
import { useQueryClient } from '@tanstack/react-query';
import { useSubscriptionStatus } from '@/hooks/api/useSubscription';
import { useAuthStore } from '@/stores/authStore';
import { invalidateUserData } from '@/lib/utils/invalidate-user-data';
import { ROUTES } from '@/lib/constants/routes';
import type { EditorialImage } from '@/lib/data/encyclopedia-editorial.data';

// ============================================================================
// Constants
// ============================================================================

const POLLING_INTERVAL_MS = 2000;
// MercadoPago webhooks routinely take more than 30s in production. Give the
// happy path a wider window before falling back to the "en procesamiento" UI.
const POLLING_TIMEOUT_MS = 90000;

/**
 * Themed image for the success band (T-PREM-004). `PremiumHero` degrades to its
 * gradient band if the asset ever fails to load, so contrast never breaks.
 */
const ACTIVATION_SUCCESS_IMAGE: EditorialImage = {
  src: '/images/premium/premium-activacion.webp',
  alt: 'Mandala dorado de luz floreciendo entre estrellas, en un cielo nocturno violeta con luna creciente',
};

const VALID_CHECKOUT_STATUSES = ['authorized', 'pending', 'failure'] as const;
type CheckoutStatus = (typeof VALID_CHECKOUT_STATUSES)[number];

/** Parse and validate the status query param — returns null for missing/invalid values */
function parseCheckoutStatus(raw: string | null): CheckoutStatus | null {
  if (raw === null) return null;
  if ((VALID_CHECKOUT_STATUSES as readonly string[]).includes(raw)) {
    return raw as CheckoutStatus;
  }
  return null;
}

/** Sanitize redirect path to prevent open-redirect attacks */
function sanitizeRedirectPath(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('://')) {
    return raw;
  }
  return ROUTES.PERFIL;
}

// ============================================================================
// Sub-components
// ============================================================================

interface StatusPanelProps {
  /** `data-testid` del panel para las pruebas. */
  testId: string;
  /** Icono superior (dorado o destructivo según el estado). */
  icon: ReactNode;
  /** Título en Cormorant. */
  title: string;
  /** Descripción del estado. */
  description: string;
  /** Acciones opcionales (botones). */
  children?: ReactNode;
}

/**
 * Panel de estado del canon: tarjeta crema centrada con icono dorado, título
 * Cormorant y texto con tokens. Compartido por los estados de carga, pendiente,
 * procesamiento y error para mantener una atmósfera de marca coherente.
 *
 * Usa `<section>` (no `<main>`): el landmark `main` ya lo aporta el root layout.
 */
function StatusPanel({ testId, icon, title, description, children }: StatusPanelProps) {
  return (
    <section className="container mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 py-12">
      <Reveal index={0} className="w-full">
        <Card data-testid={testId} className="p-8 text-center sm:p-10">
          <div className="flex justify-center">{icon}</div>
          <div>
            <h1 className="text-card-foreground mb-3 font-serif text-2xl font-bold sm:text-3xl">
              {title}
            </h1>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
          {children && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">{children}</div>
          )}
        </Card>
      </Reveal>
    </section>
  );
}

function LoadingState() {
  return (
    <StatusPanel
      testId="activation-loading"
      icon={<Loader2 className="text-secondary h-14 w-14 animate-spin" aria-hidden="true" />}
      title="Activando tu plan Premium..."
      description="Estamos confirmando tu suscripción. Esto puede tomar unos segundos."
    />
  );
}

function SuccessState() {
  return (
    <section
      data-testid="activation-success"
      className="container mx-auto max-w-3xl px-4 py-10 sm:py-12"
    >
      <Reveal index={0}>
        <PremiumHero
          badge="¡Pago confirmado!"
          title="¡Bienvenido a Premium!"
          subtitle="Tu plan Premium fue activado exitosamente. Ahora tenés acceso a todas las funciones."
          image={ACTIVATION_SUCCESS_IMAGE}
        />
      </Reveal>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Redirigiendo en unos segundos...
      </p>
    </section>
  );
}

function TimeoutState() {
  return (
    <StatusPanel
      testId="activation-timeout"
      icon={<Clock className="text-secondary h-14 w-14" aria-hidden="true" />}
      title="Pago en procesamiento"
      description="Estamos procesando tu pago. Tu plan Premium se activará automáticamente en unos minutos."
    >
      <div data-testid="btn-go-home-timeout">
        <Button asChild variant="outline">
          <Link href={ROUTES.HOME}>Ir al inicio</Link>
        </Button>
      </div>
    </StatusPanel>
  );
}

function PendingState() {
  return (
    <StatusPanel
      testId="activation-pending"
      icon={<Clock className="text-secondary h-14 w-14" aria-hidden="true" />}
      title="Pago en proceso"
      description="Tu pago está siendo procesado. Te notificaremos cuando se confirme."
    >
      <div data-testid="btn-go-home-pending">
        <Button asChild variant="outline">
          <Link href={ROUTES.HOME}>Ir al inicio</Link>
        </Button>
      </div>
    </StatusPanel>
  );
}

function FailureState() {
  const router = useRouter();

  return (
    <StatusPanel
      testId="activation-failure"
      icon={<XCircle className="text-destructive h-14 w-14" aria-hidden="true" />}
      title="Problema con el pago"
      description="Hubo un problema con tu pago. Por favor, intentá nuevamente."
    >
      <Button
        data-testid="btn-retry"
        onClick={() => router.push(ROUTES.PREMIUM)}
        className="focus-visible:ring-secondary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        Intentar de nuevo
      </Button>
      <div data-testid="btn-go-home-failure">
        <Button asChild variant="outline">
          <Link href={ROUTES.HOME}>Ir al inicio</Link>
        </Button>
      </div>
    </StatusPanel>
  );
}

// ============================================================================
// Main Component
// ============================================================================

type ActivationState = 'loading' | 'success' | 'timeout' | 'pending' | 'failure';

export function ActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const status = parseCheckoutStatus(searchParams.get('status'));
  const redirectPath = sanitizeRedirectPath(searchParams.get('redirect'));

  const [activationState, setActivationState] = useState<ActivationState>(() => {
    if (!status) return 'loading'; // will redirect immediately
    if (status === 'authorized') return 'loading';
    if (status === 'pending') return 'pending';
    if (status === 'failure') return 'failure';
    return 'loading';
  });

  // Track if we already handled the success (to avoid double-fire)
  const successHandled = useRef(false);

  // Keep polling in both 'loading' and 'timeout' states: if the MercadoPago
  // webhook lands after the timeout fell back to the "en procesamiento" UI, the
  // polling still detects it and recovers to the success state (invalidating the
  // caches) instead of leaving the user with stale free capabilities.
  const pollingActive =
    status === 'authorized' && (activationState === 'loading' || activationState === 'timeout');

  // Subscription status polling — only enabled for authorized + loading flow
  const { data: subscriptionStatus } = useSubscriptionStatus({
    enabled: pollingActive,
    refetchInterval: pollingActive ? POLLING_INTERVAL_MS : false,
  });

  // Redirect if no status param (or invalid status)
  useEffect(() => {
    if (!status) {
      router.push(ROUTES.PREMIUM);
    }
  }, [status, router]);

  // Timeout: stop polling after 30 seconds without activation
  useEffect(() => {
    if (status !== 'authorized') return;

    const timer = setTimeout(() => {
      if (!successHandled.current) {
        // Invalidate user data on the way into the timeout state so that, if the
        // webhook landed between the last poll and now, any later navigation
        // (or window focus) already reflects premium instead of stale free.
        void invalidateUserData(queryClient);
        startTransition(() => {
          setActivationState('timeout');
        });
      }
    }, POLLING_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [status, queryClient]);

  // Detect premium activation via polling
  useEffect(() => {
    if (
      status !== 'authorized' ||
      successHandled.current ||
      subscriptionStatus?.plan !== 'premium'
    ) {
      return;
    }

    successHandled.current = true;

    // Update Zustand store with new plan
    if (user) {
      setUser({
        ...user,
        plan: 'premium',
        subscriptionStatus: 'active',
      });
    }

    // Invalidate BOTH capabilities and profile (refetchType:'all' refetches even
    // inactive queries) so every plan-gated surface reflects premium immediately,
    // not just capabilities.
    void invalidateUserData(queryClient);

    // Show success state immediately
    startTransition(() => {
      setActivationState('success');
    });
  }, [subscriptionStatus?.plan, status, user, setUser, queryClient]);

  // Redirect after 3 seconds once success state is reached
  useEffect(() => {
    if (activationState !== 'success') return;

    const redirectTimer = setTimeout(() => {
      router.push(redirectPath);
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [activationState, redirectPath, router]);

  // Render based on activation state
  if (activationState === 'success') return <SuccessState />;
  if (activationState === 'timeout') return <TimeoutState />;
  if (activationState === 'pending') return <PendingState />;
  if (activationState === 'failure') return <FailureState />;

  // Default: loading (authorized + waiting for polling)
  return <LoadingState />;
}
