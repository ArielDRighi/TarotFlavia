import { Suspense } from 'react';

import { ActivationPage } from '@/components/features/premium';

/**
 * `ActivationPage` lee `?status=` con `useSearchParams`; el límite de Suspense
 * es propio de la ruta desde T-SEO-006 (antes lo prestaba el `app/loading.tsx`
 * global, que impedía emitir 404 en las rutas dinámicas).
 */
export default function PremiumActivacionPage() {
  return (
    <Suspense fallback={null}>
      <ActivationPage />
    </Suspense>
  );
}
