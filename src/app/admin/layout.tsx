'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, FileText, LogOut, UserPlus, Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAdmin, getCurrentAdmin, isSuperAdmin } from '@/lib/supabase/admin-auth';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { adminRoutes, isAdminPath } from '@/lib/config/admin-paths';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminAccess();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const adminStatus = await isAdmin();
      if (!adminStatus && pathname !== adminRoutes.login) {
        router.push(adminRoutes.login);
        return;
      }
      
      if (adminStatus) {
        const admin = await getCurrentAdmin();
        setAdminUser(admin);
        
        // Check if user is superadmin
        const superAdmin = await isSuperAdmin();
        setIsSuperAdminUser(superAdmin);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      if (pathname !== adminRoutes.login) {
        router.push(adminRoutes.login);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(adminRoutes.login);
  };

  // Don't show layout on login page
  if (pathname === adminRoutes.login) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    );
  }

  const navItems = [
    { href: adminRoutes.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: adminRoutes.customers, label: 'Müşteriler', icon: Users },
    { href: adminRoutes.reports, label: 'Raporlar', icon: FileText },
  ];

  // Superadmin only items
  const superAdminNavItems = [
    { href: adminRoutes.createAdmin, label: 'Admin Oluştur', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-neutral-200 flex-shrink-0">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <Image
                src="/images/logo.png"
                alt="Değer360 Logo"
                width={150}
                height={50}
                className="h-8 sm:h-10 md:h-12 w-auto"
                priority
              />
              <h1 className="text-lg sm:text-xl font-bold text-primary-blue hidden sm:block">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-neutral-600 hidden md:block truncate max-w-[200px]">{adminUser?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-64 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-blue text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Adminler - Superadmin Only, above divider */}
            {isSuperAdminUser && (
              <>
                <Link
                  href={adminRoutes.admins}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    pathname === adminRoutes.admins
                      ? 'bg-primary-blue text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Adminler</span>
                </Link>
              </>
            )}
            
            {/* Superadmin Only Items */}
            {isSuperAdminUser && (
              <>
                <div className="my-4 border-t border-neutral-200"></div>
                {superAdminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary-blue text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
