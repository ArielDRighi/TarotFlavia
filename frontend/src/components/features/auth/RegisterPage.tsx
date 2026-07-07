'use client';

// 1. React & Next.js
import { useSearchParams } from 'next/navigation';
// 2. Icons
import { Info, Lock } from 'lucide-react';
// 5. Components (ui → features)
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RegisterForm } from './RegisterForm';

// ─── Constants ──────────────────────────────────────────────────────────────

/** Mensajes contextuales que se muestran sobre el formulario según `?message=`. */
const MESSAGES: Record<string, string> = {
  'register-for-readings': 'Regístrate gratis para crear tus lecturas de tarot personalizadas',
};

/** El registro puede limitarse a una whitelist de testing vía variable de entorno. */
const isWhitelistActive = process.env.NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE === 'true';

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * RegisterPage
 *
 * Contenido del circuito de registro al canon místico: fondo papiro, avisos
 * contextuales como callouts dorados de marca y el `RegisterForm` centrado.
 * Concentra la lógica de `?message=` y whitelist para que `app/registro` solo
 * enrute (T-PREM-005).
 */
export function RegisterPage() {
  const searchParams = useSearchParams();
  const messageKey = searchParams.get('message');
  const message = messageKey && MESSAGES[messageKey] ? MESSAGES[messageKey] : null;

  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {isWhitelistActive && (
          <Alert className="border-secondary/40 bg-secondary/10">
            <Lock className="text-secondary h-4 w-4" />
            <AlertDescription className="text-text-primary">
              El registro está limitado al equipo de testing. Usá el email que te fue asignado.
            </AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="border-secondary/30 bg-secondary/10">
            <Info className="text-secondary h-4 w-4" />
            <AlertDescription className="text-text-primary">{message}</AlertDescription>
          </Alert>
        )}
        <RegisterForm />
      </div>
    </div>
  );
}
