import type { Metadata } from 'next';
import { LoginForm } from '@/components/features/auth';
import { loginMetadata } from '@/lib/metadata/seo';

export const metadata: Metadata = loginMetadata;

export default function LoginPage() {
  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
