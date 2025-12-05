import { ForgotPasswordForm } from '@/components/features/auth';

export const metadata = {
  title: 'Recuperar Contraseña | TarotFlavia',
  description: 'Recupera tu contraseña de TarotFlavia',
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <ForgotPasswordForm />
    </div>
  );
}
