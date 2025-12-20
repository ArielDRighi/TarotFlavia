/**
 * Admin Tarotistas Page
 *
 * Gestión de tarotistas con tabs para activos y aplicaciones pendientes
 */

'use client';

import { TarotistasManagementContent } from '@/components/features/admin/TarotistasManagementContent';

export default function AdminTarotistasPage() {
  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 font-serif text-3xl">Gestión de Tarotistas</h1>

        <TarotistasManagementContent />
      </div>
    </div>
  );
}
