'use client';

import { useSearchParams } from 'next/navigation';
import { RegisterForm } from '@/components/features/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Lock } from 'lucide-react';

/**
 * Message mapping for registration prompts
 */
const messages: Record<string, string> = {
  'register-for-readings': 'Regístrate gratis para crear tus lecturas de tarot personalizadas',
};

const isWhitelistActive = process.env.NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE === 'true';

export default function RegistroPage() {
  const searchParams = useSearchParams();
  const messageKey = searchParams.get('message');
  const message = messageKey && messages[messageKey] ? messages[messageKey] : null;

  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {isWhitelistActive && (
          <Alert className="border-amber-200 bg-amber-50">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              El registro está limitado al equipo de testing. Usá el email que te fue asignado.
            </AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="border-purple-200 bg-purple-50">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">{message}</AlertDescription>
          </Alert>
        )}
        <RegisterForm />
      </div>
    </div>
  );
}
