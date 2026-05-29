'use client';

/**
 * Chinese Horoscope Admin Page
 *
 * Panel de administración para gestionar la generación de horóscopos chinos.
 * Permite ver el estado del año actual y generar las combinaciones faltantes.
 */

import { ChineseHoroscopeAdminPanel } from '@/components/features/admin/ChineseHoroscopeAdminPanel';

export default function ChineseHoroscopeAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Horóscopo Chino — Admin</h1>
        <p className="text-muted-foreground">
          Estado de generación de horóscopos chinos y herramientas de administración
        </p>
      </div>

      <ChineseHoroscopeAdminPanel />
    </div>
  );
}
