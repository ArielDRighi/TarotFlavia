'use client';

import { useSearchParams } from 'next/navigation';
import { RegisterForm } from '@/components/features/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

/**
 * Message mapping for registration prompts
 */
const messages: Record<string, string> = {
  'register-for-readings': 'Regístrate gratis para crear tus lecturas de tarot personalizadas',
};

export default function RegistroPage() {
  const searchParams = useSearchParams();
  const messageKey = searchParams.get('message');
  const message = messageKey && messages[messageKey] ? messages[messageKey] : null;

  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {message && (
          <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30">
            <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertDescription className="text-purple-800 dark:text-purple-200">
              {message}
            </AlertDescription>
          </Alert>
        )}
        <RegisterForm />
      </div>
    </div>
  );
}
