'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Spinner } from '@/components/ui/spinner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Guard: espera a que la sesión resuelva antes de decidir (T-SEO-007)
  const { isLoading, isAdmin } = useRequireAdmin();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Cerrar drawer con tecla Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Mientras se resuelve la sesión: spinner, nunca pantalla en blanco ni redirección
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" text="Verificando permisos…" />
      </div>
    );
  }

  // Si no es admin, no renderizar nada (el guard ya redirigió)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden border-r border-gray-200 bg-white md:flex md:w-64 md:flex-col">
        <div className="p-6">
          <h1 className="text-primary text-2xl font-bold">Auguria</h1>
          <p className="mt-1 text-sm text-gray-500">Panel de Administración</p>
        </div>

        <AdminSidebar pathname={pathname} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <h1 className="text-primary text-lg font-bold">Auguria Admin</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            role="presentation"
          >
            <div
              className="absolute top-0 bottom-0 left-0 w-64 overflow-y-auto bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-primary text-xl font-bold">Auguria</h1>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">Panel de Administración</p>
              </div>

              <AdminSidebar pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="bg-bg-main flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
