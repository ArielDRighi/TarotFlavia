/**
 * Admin Agenda Page
 *
 * Gestión de disponibilidad semanal y fechas bloqueadas de la tarotista
 */

'use client';

import { AgendaManagementContent } from '@/components/features/admin/AgendaManagementContent';

export default function AdminAgendaPage() {
  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 font-serif text-3xl">Gestión de Agenda</h1>

        <AgendaManagementContent />
      </div>
    </div>
  );
}
