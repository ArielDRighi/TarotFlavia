/**
 * Admin Audit Logs Page
 *
 * Audit trail of all administrative actions
 */

'use client';

import { AuditLogsContent } from '@/components/features/admin/AuditLogsContent';

export default function AuditLogsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Registro de Auditoría</h1>
        <p className="text-muted-foreground mt-2">
          Historial de todas las acciones administrativas
        </p>
      </div>
      <AuditLogsContent />
    </div>
  );
}
