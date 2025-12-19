'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  Settings,
  HelpCircle,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { logout } from '@/lib/supabase/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'Belgeler', href: '/portal/belgeler', icon: FolderOpen },
  { label: 'Finansal Bilgiler', href: '/portal/finansal', icon: DollarSign },
  { label: 'Hesap Bilgileri', href: '/portal/ayarlar', icon: Settings },
  { label: 'Yardım & SSS', href: '/portal/yardim', icon: HelpCircle },
];

interface PortalSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function PortalSidebar({ isMobileOpen = false, onMobileClose }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/portal/giris');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
      alert('Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[55]"
          onClick={onMobileClose}
        ></div>
      )}

      {/* Sidebar - Sağ üstten açılır dropdown */}
      <aside
        className={cn(
          'fixed top-16 right-4 bg-white border border-neutral-200 rounded-lg shadow-2xl z-[60] w-64 max-h-[calc(100vh-5rem)] transform transition-all duration-300 ease-in-out',
          isMobileOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-4 invisible pointer-events-none'
        )}
      >
        <div className="flex flex-col max-h-full overflow-hidden">
          {/* User Info Card */}
          <div className="p-4 bg-gradient-to-r from-primary-blue to-primary-orange text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-orange to-primary-blue flex items-center justify-center text-white font-bold">
                AB
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">Ahmet Bey</p>
                <p className="text-xs text-neutral-400 truncate">#DK-2024-542</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/portal' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative group',
                    isActive
                      ? 'bg-primary-orange text-white'
                      : 'text-neutral-800 hover:bg-neutral-100'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-2 border-t border-neutral-200">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-500 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
            </button>
          </div>

          {/* Close Button */}
          <div className="p-2 border-t border-neutral-200">
            <button
              onClick={onMobileClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-primary-orange transition-colors rounded-lg hover:bg-neutral-50"
            >
              <X className="w-4 h-4" />
              Kapat
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
