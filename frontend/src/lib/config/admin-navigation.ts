import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Sparkles,
  BookOpen,
  Brain,
  Settings,
  Shield,
  Database,
  ScrollText,
  HandHeart,
  CalendarClock,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const adminNavSections: NavSection[] = [
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
      { name: 'Servicios', href: '/admin/servicios', icon: HandHeart },
      { name: 'Agenda', href: '/admin/agenda', icon: CalendarClock },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { name: 'Uso de Interpretaciones', href: '/admin/ai-usage', icon: Brain },
      { name: 'Configuración de Planes', href: '/admin/planes', icon: Settings },
      { name: 'Seguridad', href: '/admin/seguridad', icon: Shield },
      { name: 'Caché', href: '/admin/cache', icon: Database },
      { name: 'Audit Logs', href: '/admin/audit', icon: ScrollText },
    ],
  },
];
