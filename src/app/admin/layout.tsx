'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, FileText, LogOut, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAdmin, getCurrentAdmin, isSuperAdmin } from '@/lib/supabase/admin-auth';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);

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
      if (!adminStatus && pathname !== '/admin/giris') {
        router.push('/admin/giris');
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
      if (pathname !== '/admin/giris') {
        router.push('/admin/giris');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/giris');
  };

  // Don't show layout on login page
  if (pathname === '/admin/giris') {
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
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/musteriler', label: 'Müşteriler', icon: Users },
    { href: '/admin/raporlar', label: 'Raporlar', icon: FileText },
  ];

  // Superadmin only items
  const superAdminNavItems = [
    { href: '/admin/admin-olustur', label: 'Admin Oluştur', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-neutral-200 flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo.png"
                alt="Değer360 Logo"
                width={150}
                height={50}
                className="h-10 md:h-12 w-auto"
                priority
              />
              <h1 className="text-xl font-bold text-primary-blue hidden sm:block">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">{adminUser?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col">
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
                  href="/admin/adminler"
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    pathname === '/admin/adminler'
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
