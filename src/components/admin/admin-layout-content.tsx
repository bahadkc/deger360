'use client';

import { ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, FileText, LogOut, UserPlus, Shield, Menu, X, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAdmin, getCurrentAdmin, isSuperAdmin } from '@/lib/supabase/admin-auth';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { adminRoutes } from '@/lib/config/admin-paths';
import { OptimizedLogo } from '@/components/ui/optimized-logo';

interface AdminLayoutContentProps {
  children: ReactNode;
}

export function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkAdminAccess = useCallback(async () => {
    try {
      // Don't check admin status on login page
      if (pathname === adminRoutes.login) {
        setLoading(false);
        return;
      }

      const adminStatus = await isAdmin();
      if (!adminStatus) {
        // Admin değil - ama önce client-side session kontrolü yap
        // Only check if supabase client is available
        if (typeof window !== 'undefined' && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            // Gerçekten logout olmuş
            router.push(adminRoutes.login);
            setLoading(false);
            return;
          }
        }
        // Client-side session var ama admin değil - belki cache sorunu
        // Force refresh dene
        const refreshedStatus = await isAdmin(true);
        if (!refreshedStatus) {
          router.push(adminRoutes.login);
          setLoading(false);
          return;
        }
      }
      
      // User is admin, get admin details from cache
      const admin = await getCurrentAdmin();
      setAdminUser(admin);
      
      // Check if user is superadmin from cache
      const superAdmin = await isSuperAdmin();
      setIsSuperAdminUser(superAdmin);
    } catch (error) {
      console.error('Error checking admin access:', error);
      if (pathname !== adminRoutes.login) {
        router.push(adminRoutes.login);
      }
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  useEffect(() => {
    checkAdminAccess();
    
    // Listen for auth changes (only on sign out, not on sign in or token refresh)
    // Only subscribe if supabase client is available
    if (supabase && typeof supabase.auth !== 'undefined') {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          // Clear cache on sign out and redirect to login
          import('@/lib/supabase/admin-auth').then(({ clearAdminStatusCache }) => {
            clearAdminStatusCache();
          });
          router.push(adminRoutes.login);
        }
        
        // Handle token refresh errors - if session is null after refresh, user is logged out
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Refresh token is invalid or expired - clear cache and redirect to login
          import('@/lib/supabase/admin-auth').then(({ clearAdminStatusCache }) => {
            clearAdminStatusCache();
          });
          router.push(adminRoutes.login);
        }
        // SIGNED_IN ve TOKEN_REFRESHED event'lerinde cache'i kullan, API'ye istek atma
      });

      return () => subscription.unsubscribe();
    }
  }, [checkAdminAccess, router]);

  const handleLogout = async () => {
    // Clear admin status cache on logout
    const { clearAdminStatusCache } = await import('@/lib/supabase/admin-auth');
    clearAdminStatusCache();
    await supabase.auth.signOut();
    router.push(adminRoutes.login);
  };

  // Check if user can see documents summary (superadmin, admin, lawyer)
  // IMPORTANT: Hook'lar her zaman aynı sırada çağrılmalı, bu yüzden erken return'den önce çağrıyoruz
  const canSeeDocumentsSummary = useMemo(() => {
    return adminUser?.role === 'superadmin' || 
           adminUser?.role === 'admin' || 
           adminUser?.role === 'lawyer';
  }, [adminUser?.role]);

  const navItems = useMemo(() => [
    { href: adminRoutes.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: adminRoutes.customers, label: 'Müşteriler', icon: Users },
    ...(canSeeDocumentsSummary ? [{ href: adminRoutes.documentsSummary, label: 'Döküman Özeti', icon: ClipboardList }] : []),
    { href: adminRoutes.reports, label: 'Raporlar', icon: FileText },
  ], [canSeeDocumentsSummary]);

  // Don't show layout on login page
  if (pathname === adminRoutes.login) {
    return <>{children}</>;
  }

  // Show loading state if still checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <header className="bg-white border-b border-neutral-200 flex-shrink-0">
          <div className="px-4 sm:px-6 py-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-6 sm:h-8 w-[150px] bg-neutral-200 animate-pulse rounded" />
                <h1 className="text-base sm:text-lg font-bold text-primary-blue hidden sm:block">Admin Panel</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-4 w-32 bg-neutral-200 animate-pulse rounded hidden md:block" />
                <div className="h-7 sm:h-8 w-20 bg-neutral-200 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden relative">
          <aside className="fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-64 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col">
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              <div className="h-12 bg-neutral-100 animate-pulse rounded-lg" />
              <div className="h-12 bg-neutral-100 animate-pulse rounded-lg" />
              <div className="h-12 bg-neutral-100 animate-pulse rounded-lg" />
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto flex items-center justify-center">
            <div className="text-neutral-600">Yükleniyor...</div>
          </main>
        </div>
      </div>
    );
  }

  // Superadmin only items
  const superAdminNavItems = [
    { href: adminRoutes.createAdmin, label: 'Admin Oluştur', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-neutral-200 flex-shrink-0">
        <div className="px-4 sm:px-6 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 -ml-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {sidebarOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
              <OptimizedLogo 
                alt="Değer360 Logo"
              />
              <h1 className="text-base sm:text-lg font-bold text-primary-blue hidden sm:block">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-neutral-600 hidden md:block truncate max-w-[200px]">{adminUser?.email || ''}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-7 sm:h-8 px-3 sm:px-4">
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
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
          "fixed top-[52px] bottom-0 left-0 z-50 lg:z-auto w-64 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="p-4 pt-6 space-y-2 flex-1 overflow-y-auto">
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
            
            {/* Adminler - Superadmin Only */}
            {isSuperAdminUser && (
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
        <main className="flex-1 overflow-y-auto lg:ml-64">{children}</main>
      </div>
    </div>
  );
}

