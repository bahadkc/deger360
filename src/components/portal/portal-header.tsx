'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { logout } from '@/lib/supabase/auth';
import { getCurrentUserCases } from '@/lib/supabase/auth';
import { cn } from '@/lib/utils';

interface PortalHeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function PortalHeader({ 
  onMenuToggle = () => {},
  isMenuOpen = false,
}: PortalHeaderProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load customer name
  useEffect(() => {
    const loadCustomerName = async () => {
      try {
        const cases = await getCurrentUserCases();
        if (cases && cases.length > 0 && cases[0].customers) {
          setCustomerName(cases[0].customers.full_name || null);
        }
      } catch (error) {
        console.error('Error loading customer name:', error);
      }
    };

    loadCustomerName();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isProfileOpen]);

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
      setIsProfileOpen(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-md border-b border-neutral-200 z-[100]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Sol taraf */}
          <Link href="/portal" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Değer360 - Araç Değer Kaybı Tazminatı Danışmanlığı Logo"
              width={150}
              height={50}
              className="h-8 sm:h-10 md:h-12 w-auto"
              priority
              sizes="(max-width: 640px) 120px, (max-width: 768px) 150px, 200px"
              quality={90}
            />
          </Link>

          {/* Menu Toggle Button - Mobile */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -mr-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Profile Dropdown - Desktop */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-orange to-primary-blue flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(customerName)}
              </div>
              <span className="text-sm font-medium text-neutral-700">
                {customerName || 'Yükleniyor...'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-[110]">
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-500 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
