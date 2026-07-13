'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { ResetPasswordForm } from '@/components/features/auth';

/**
 * Lee el token del enlace que llegó por email y se lo pasa al formulario.
 */
function ResetPasswordPageContent() {
  const searchParams = useSearchParams();

  return <ResetPasswordForm token={searchParams.get('token')} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={null}>
        <ResetPasswordPageContent />
      </Suspense>
    </div>
  );
}
