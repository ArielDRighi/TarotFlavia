'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  BookOpen,
  Settings,
  Menu,
  X,
  TrendingUp,
  Brain,
  Shield,
  Database,
  ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'PRINCIPAL',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Métricas', href: '/admin/metricas', icon: TrendingUp },
    ],
  },
  {
    title: 'GESTIÓN',
    items: [
      { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
      { name: 'Tarotistas', href: '/admin/tarotistas', icon: Sparkles },
      { name: 'Lecturas', href: '/admin/lecturas', icon: BookOpen },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { name: 'Uso de IA', href: '/admin/ai-usage', icon: Brain },
      { name: 'Configuración de Planes', href: '/admin/planes', icon: Settings },
      { name: 'Seguridad', href: '/admin/seguridad', icon: Shield },
      { name: 'Caché', href: '/admin/cache', icon: Database },
      { name: 'Audit Logs', href: '/admin/audit', icon: ScrollText },
    ],
  },
];

interface SidebarNavProps {
  pathname: string;
  onNavigate?: () => void;
}

function SidebarNav({ pathname, onNavigate }: SidebarNavProps) {
  return (
    <nav className="space-y-6 overflow-y-auto px-3 pb-4">
      {navSections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-2 px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {section.title}
          </h2>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
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
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
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

        <SidebarNav pathname={pathname} />
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

              <SidebarNav pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="bg-bg-main flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
