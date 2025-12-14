'use client';

/**
 * Cache Management Page
 *
 * Admin page for viewing cache statistics and manually invalidating cache
 */

import { CacheManagementContent } from '@/components/features/admin/CacheManagementContent';

export default function CachePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Caché</h1>
        <p className="text-muted-foreground">
          Monitoreo de estadísticas de caché y control de invalidación manual
        </p>
      </div>

      <CacheManagementContent />
    </div>
  );
}
