'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string | null) => {
    if (!sectionId) {
      window.location.href = '/';
      return;
    }
    
    // Ana sayfadaysak direkt scroll et
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = 64; // Header yüksekliği (h-16 = 64px)
        const offset = sectionId === 'iletisim' ? 120 : 80; // İletişim için daha fazla offset
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // Başka sayfadaysak ana sayfaya yönlendir
      window.location.href = '/#' + sectionId;
    }
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'Değer Kaybı Hesaplama', sectionId: 'contact-form' },
    { label: 'Değer Kaybı Nedir?', sectionId: 'nedir' },
    { label: 'Süreç', sectionId: 'surec' },
    { label: 'Neden Biz?', sectionId: 'neden-biz' },
  ];

  const companyMenuItems = [
    { label: 'Hakkımızda', sectionId: 'hakkimizda' },
    { label: 'İletişim', sectionId: 'iletisim' },
    { label: 'SSS', sectionId: 'sss' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 h-16">
          {/* Logo */}
          <div className="flex-shrink-0 w-auto sm:w-[200px]">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Değer360 - Araç Değer Kaybı Tazminatı Danışmanlığı Logo"
                width={150}
                height={50}
                className="h-8 sm:h-10 md:h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu - Centered between logo and CTA */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.sectionId)}
                className="text-neutral-800 hover:text-primary-orange font-medium transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
            
            {/* Şirketimiz Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setCompanyMenuOpen(true)}
              onMouseLeave={() => setCompanyMenuOpen(false)}
            >
              <button
                className="text-neutral-800 hover:text-primary-orange font-medium transition-colors whitespace-nowrap flex items-center gap-1"
              >
                Şirketimiz
                <ChevronDown className={`w-4 h-4 transition-transform ${companyMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {companyMenuOpen && (
                <div className="absolute top-full left-0 pt-2 bg-transparent">
                  <div className="bg-white shadow-lg rounded-lg py-2 min-w-[180px] border border-neutral-200 z-50">
                    {companyMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          scrollToSection(item.sectionId);
                          setCompanyMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-neutral-800 hover:bg-primary-orange/10 hover:text-primary-orange transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* CTA Buttons - Right Aligned */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0 w-[200px] justify-end ml-4">
            <Link
              href="/teklif"
              className="bg-primary-orange hover:bg-primary-orange-hover text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap inline-block text-center"
            >
              Hemen Başvur
            </Link>
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
            className="lg:hidden ml-auto p-2 -mr-2"
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
            <button
              onClick={() => scrollToSection('hakkimizda')}
              className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
            >
              Hakkımızda
            </button>
            <button
              onClick={() => scrollToSection('iletisim')}
              className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
            >
              İletişim
            </button>
            <button
              onClick={() => scrollToSection('sss')}
              className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
            >
              SSS
            </button>
            <div className="mt-4 space-y-2">
              <Link
                href="/teklif"
                className="w-full bg-primary-orange text-white font-bold px-6 py-3 rounded-lg inline-block text-center"
              >
                Hemen Başvur
              </Link>
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
