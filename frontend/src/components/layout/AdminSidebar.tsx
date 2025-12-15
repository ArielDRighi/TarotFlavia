import Link from 'next/link';
import { adminNavSections } from '@/lib/config/admin-navigation';
import { cn } from '@/lib/utils/cn';

interface AdminSidebarProps {
  pathname: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ pathname, onNavigate }: AdminSidebarProps) {
  return (
    <nav className="space-y-6 overflow-y-auto px-3 pb-4">
      {adminNavSections.map((section) => (
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
