'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionStatus } from '@/hooks/api/useSubscription';
import { useInvalidateCapabilities } from '@/hooks/api/useUserCapabilities';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants/routes';

// ============================================================================
// Constants
// ============================================================================

const POLLING_INTERVAL_MS = 2000;
const POLLING_TIMEOUT_MS = 30000;

type CheckoutStatus = 'authorized' | 'pending' | 'failure';

// ============================================================================
// Sub-components
// ============================================================================

function LoadingState() {
  return (
    <div data-testid="activation-loading" className="flex flex-col items-center gap-6 text-center">
      <Loader2 className="h-16 w-16 animate-spin text-purple-600 dark:text-purple-400" />
      <div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
          Activando tu plan Premium...
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Estamos confirmando tu suscripción. Esto puede tomar unos segundos.
        </p>
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div data-testid="activation-success" className="flex flex-col items-center gap-6 text-center">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
          ¡Bienvenido a Premium!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Tu plan Premium fue activado exitosamente. Ahora tenés acceso a todas las funciones.
        </p>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Redirigiendo en unos segundos...</p>
    </div>
  );
}

function TimeoutState() {
  return (
    <div data-testid="activation-timeout" className="flex flex-col items-center gap-6 text-center">
      <Clock className="h-16 w-16 text-yellow-500" />
      <div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
          Pago en procesamiento
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Estamos procesando tu pago. Tu plan Premium se activará automáticamente en unos minutos.
        </p>
      </div>
      <div data-testid="btn-go-home-timeout">
        <Button asChild variant="outline" className="mt-2">
          <Link href={ROUTES.HOME}>Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}

function PendingState() {
  return (
    <div data-testid="activation-pending" className="flex flex-col items-center gap-6 text-center">
      <Clock className="h-16 w-16 text-yellow-500" />
      <div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
          Pago en proceso
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>
      </div>
      <div data-testid="btn-go-home-pending">
        <Button asChild variant="outline" className="mt-2">
          <Link href={ROUTES.HOME}>Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}

function FailureState() {
  const router = useRouter();

  return (
    <div data-testid="activation-failure" className="flex flex-col items-center gap-6 text-center">
      <XCircle className="h-16 w-16 text-red-500" />
      <div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
          Problema con el pago
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Hubo un problema con tu pago. Por favor, intentá nuevamente.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          data-testid="btn-retry"
          onClick={() => router.push(ROUTES.PREMIUM)}
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          Reintentar
        </Button>
        <div data-testid="btn-go-home-failure">
          <Button asChild variant="outline">
            <Link href={ROUTES.HOME}>Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

type ActivationState = 'loading' | 'success' | 'timeout' | 'pending' | 'failure';

export function ActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invalidateCapabilities = useInvalidateCapabilities();
  const { user, setUser } = useAuthStore();

  const status = searchParams.get('status') as CheckoutStatus | null;
  const redirectPath = searchParams.get('redirect');

  const [activationState, setActivationState] = useState<ActivationState>(() => {
    if (!status) return 'loading'; // will redirect immediately
    if (status === 'authorized') return 'loading';
    if (status === 'pending') return 'pending';
    if (status === 'failure') return 'failure';
    return 'loading';
  });

  // Track if we already handled the success (to avoid double-fire)
  const successHandled = useRef(false);

  // Polling is active only while in 'loading' state for an 'authorized' checkout
  const pollingActive = status === 'authorized' && activationState === 'loading';

  // Subscription status polling
  const { data: subscriptionStatus } = useSubscriptionStatus({
    refetchInterval: pollingActive ? POLLING_INTERVAL_MS : false,
  });

  // Redirect if no status param
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
        startTransition(() => {
          setActivationState('timeout');
        });
      }
    }, POLLING_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [status]);

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

    // Invalidate capabilities to reflect new plan
    invalidateCapabilities();

    // Show success state immediately
    startTransition(() => {
      setActivationState('success');
    });
  }, [subscriptionStatus?.plan, status, user, setUser, invalidateCapabilities]);

  // Redirect after 3 seconds once success state is reached
  useEffect(() => {
    if (activationState !== 'success') return;

    const destination = redirectPath ?? ROUTES.PERFIL;
    const redirectTimer = setTimeout(() => {
      router.push(destination);
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
