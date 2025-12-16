import type { Metadata } from 'next';
import { RegisterForm } from '@/components/features/auth';
import { registerMetadata } from '@/lib/metadata/seo';

export const metadata: Metadata = registerMetadata;

export default function RegistroPage() {
  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
