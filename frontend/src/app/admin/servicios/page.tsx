/**
 * Admin Servicios Page
 *
 * Gestión de servicios holísticos y aprobación de pagos
 */

'use client';

import { HolisticServicesManagement } from '@/components/features/admin/HolisticServicesManagement';

export default function AdminServiciosPage() {
  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 font-serif text-3xl">Gestión de Servicios</h1>

        <HolisticServicesManagement />
      </div>
    </div>
  );
}
