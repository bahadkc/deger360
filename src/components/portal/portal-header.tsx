'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

interface PortalHeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function PortalHeader({ 
  onMenuToggle = () => {},
  isMenuOpen = false,
}: PortalHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-md border-b border-neutral-200 z-[100]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Sol taraf */}
          <Link href="/portal" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Değer360 Logo"
              width={150}
              height={50}
              className="h-10 sm:h-12 w-auto"
              priority
            />
          </Link>

          {/* Menu Button - Sağ taraf */}
          <button
            onClick={onMenuToggle}
            className="p-2 sm:p-2.5 text-neutral-700 hover:text-white hover:bg-primary-orange transition-all rounded-lg border-2 border-neutral-300 hover:border-primary-orange shadow-sm hover:shadow-md"
            aria-label="Menü"
            title="Menüyü aç/kapat"
          >
            {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}
