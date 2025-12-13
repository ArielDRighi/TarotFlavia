'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, Sparkles, BookOpen, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { name: 'Tarotistas', href: '/admin/tarotistas', icon: Sparkles },
  { name: 'Lecturas', href: '/admin/lecturas', icon: BookOpen },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Guard: Verificar que el usuario sea admin
    if (!isAuthenticated || !user || !user.roles.includes('admin')) {
      router.push('/perfil');
    }
  }, [isAuthenticated, user, router]);

  // Si no es admin, no renderizar nada (se redirige)
  if (!isAuthenticated || !user || !user.roles.includes('admin')) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden border-r border-gray-200 bg-white md:flex md:w-64 md:flex-col">
        <div className="p-6">
          <h1 className="text-primary text-2xl font-bold">TarotFlavia</h1>
          <p className="mt-1 text-sm text-gray-500">Panel de Administración</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-primary -ml-3 border-l-4 pl-6'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <h1 className="text-primary text-lg font-bold">TarotFlavia Admin</h1>
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
          <div className="bg-opacity-50 fixed inset-0 z-50 bg-black md:hidden">
            <div className="absolute top-0 bottom-0 left-0 w-64 bg-white shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-primary text-xl font-bold">TarotFlavia</h1>
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

              <nav className="space-y-1 px-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary border-primary -ml-3 border-l-4 pl-6'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="bg-main flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
