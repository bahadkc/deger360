'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string | null) => {
    if (!sectionId) {
      window.location.href = '/';
      return;
    }
    
    // Ana sayfadaysak direkt scroll et
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Başka sayfadaysak ana sayfaya yönlendir
      window.location.href = '/#' + sectionId;
    }
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'Rakamlar', sectionId: 'hizmetlerimiz' },
    { label: 'Süreç', sectionId: 'surec' },
    { label: 'Hakkımızda', sectionId: 'hakkimizda' },
    { label: 'SSS', sectionId: 'sss' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 gap-2">
            <Image
              src="/images/logo.png"
              alt="Değer360 Logo"
              width={150}
              height={50}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu - Centered with offset */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center ml-24">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.sectionId)}
                className="text-neutral-800 hover:text-primary-orange font-medium transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons - Right Aligned */}
          <div className="hidden lg:flex items-center gap-2 w-[280px] justify-end flex-shrink-0">
            <button
              onClick={() => scrollToSection('contact-form')}
              className="bg-primary-orange hover:bg-primary-orange-hover text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Hemen Başvur
            </button>
            <Link
              href="/portal/giris"
              className="bg-primary-orange hover:bg-primary-orange-hover text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap inline-block"
            >
              Dosyam Nerede?
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.sectionId)}
                className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
              >
                {item.label}
              </button>
            ))}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => scrollToSection('contact-form')}
                className="w-full bg-primary-orange text-white font-bold px-6 py-3 rounded-lg"
              >
                Hemen Başvur
              </button>
              <Link
                href="/portal/giris"
                className="w-full bg-primary-orange text-white font-bold px-6 py-3 rounded-lg inline-block text-center"
              >
                Dosyam Nerede?
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
