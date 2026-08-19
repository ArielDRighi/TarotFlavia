import { Suspense } from 'react';

import { RegisterPage } from '@/components/features/auth';

/**
 * `RegisterPage` lee `?message=` con `useSearchParams`, así que necesita un
 * límite de Suspense propio. Antes se lo prestaba el `app/loading.tsx` global,
 * que se eliminó en T-SEO-006: ese límite hacía que Next confirmara el 200 y
 * emitiera el esqueleto antes de renderizar la página, y con la respuesta ya
 * confirmada `notFound()` no podía emitir un 404.
 */
export default function RegistroPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
