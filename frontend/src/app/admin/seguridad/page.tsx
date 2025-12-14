/**
 * Admin Seguridad Page
 *
 * Rate limiting and security events monitoring
 */

'use client';

import { SecurityManagementContent } from '@/components/features/admin/SecurityManagementContent';

export default function AdminSeguridadPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Rate Limiting y Seguridad</h1>
        <p className="text-muted-foreground mt-2">
          Monitorea violaciones, IPs bloqueadas y eventos de seguridad
        </p>
      </div>

      <SecurityManagementContent />
    </div>
  );
}
