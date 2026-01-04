import { ForgotPasswordForm } from '@/components/features/auth';

export const metadata = {
  title: 'Recuperar Contraseña | Auguria',
  description: 'Recupera tu contraseña de Auguria',
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <ForgotPasswordForm />
    </div>
  );
}
