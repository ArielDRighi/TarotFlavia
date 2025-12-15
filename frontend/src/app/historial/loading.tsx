import { Spinner } from '@/components/ui/spinner';

/**
 * Loading component for /historial route.
 * Automatically shown by Next.js during page transitions.
 */
export default function Loading() {
  return (
    <div data-testid="loading-container" className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" text="Cargando..." />
    </div>
  );
}
