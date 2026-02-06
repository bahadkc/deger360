'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useMemo, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { OptimizedLogo } from '@/components/ui/optimized-logo';

export const Header = memo(function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const isTeklifPage = pathname === '/teklif';
  const isHomePage = pathname === '/';

  // Memoize scrollToSection to prevent unnecessary re-renders
  const scrollToSection = useCallback((sectionId: string | null) => {
    if (!sectionId) {
      window.location.href = '/';
      return;
    }
    
    // Ana sayfadaysak direkt scroll et
    if (window.location.pathname === '/') {
      // Use requestIdleCallback to avoid forced reflows - batch layout reads
      const performScroll = () => {
        const element = document.getElementById(sectionId);
        if (!element) return false;
        
        // Batch all layout reads together before any writes to prevent forced reflows
        // Use scrollIntoView with CSS scroll-margin instead of manual calculations
        // This avoids reading getBoundingClientRect() which forces layout recalculation
        const headerHeight = 64; // Header yüksekliği (h-16 = 64px)
        const offset = sectionId === 'iletisim' ? 120 : 80; // İletişim için daha fazla offset
        
        // Set scroll-margin-top temporarily to account for header and offset
        const originalScrollMargin = element.style.scrollMarginTop;
        element.style.scrollMarginTop = `${headerHeight + offset}px`;
        
        // Use scrollIntoView which is optimized by the browser and doesn't force reflow
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        
        // Restore original scroll-margin after a delay
        setTimeout(() => {
          element.style.scrollMarginTop = originalScrollMargin;
        }, 1000);
        
        return true;
      };
      
      // Use requestIdleCallback for non-critical scroll operations to avoid blocking
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          if (!performScroll()) {
            // Element not found, try again after a short delay
            let attempts = 0;
            const maxAttempts = 10;
            const interval = setInterval(() => {
              attempts++;
              if (performScroll() || attempts >= maxAttempts) {
                clearInterval(interval);
              }
            }, 100);
          }
        }, { timeout: 500 });
      } else {
        // Fallback: use requestAnimationFrame
        requestAnimationFrame(() => {
          if (!performScroll()) {
            let attempts = 0;
            const maxAttempts = 10;
            const interval = setInterval(() => {
              attempts++;
              if (performScroll() || attempts >= maxAttempts) {
                clearInterval(interval);
              }
            }, 100);
          }
        });
      }
    } else {
      // Başka sayfadaysak ana sayfaya yönlendir
      window.location.href = '/#' + sectionId;
    }
    setMobileMenuOpen(false);
  }, []);

  // Memoize menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => [
    { label: 'Değer Kaybı Hesaplama', sectionId: 'contact-form' },
    { label: 'Değer Kaybı Nedir?', sectionId: 'nedir' },
    { label: 'Süreç', sectionId: 'surec' },
    { label: 'Neden Biz?', sectionId: 'neden-biz' },
  ], []);

  const companyMenuItems = useMemo(() => [
    { label: 'Hakkımızda', sectionId: 'hakkimizda' },
    { label: 'İletişim', sectionId: 'iletisim' },
    { label: 'SSS', sectionId: 'sss' },
    { label: 'Bloglar', href: '/blog' },
  ], []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50" style={{ isolation: 'isolate' }}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 h-16">
          {/* Logo - Optimized with Next.js Image Optimization API (AVIF/WebP conversion, responsive sizes) */}
          <div className="flex-shrink-0 w-auto sm:w-[200px]">
            <Link href="/" className="flex items-center gap-2">
              <OptimizedLogo />
            </Link>
          </div>

          {/* Desktop Menu - Centered between logo and CTA */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {menuItems.map((item) => {
              // Süreç için akıllı linkleme: Ana sayfadaysa scroll, değilse /#surec
              if (item.sectionId === 'surec') {
                if (isHomePage) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.sectionId)}
                      className="text-neutral-800 hover:text-primary-orange font-medium transition-colors whitespace-nowrap"
                    >
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href="/#surec"
                    className="text-neutral-800 hover:text-primary-orange font-medium transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                );
              }
              // Diğerleri için scroll-to-section
              return (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.sectionId)}
                  className="text-neutral-800 hover:text-primary-orange font-medium transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              );
            })}
            
            {/* Şirketimiz Dropdown */}
            <div 
              className="relative z-[60]"
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
                <div className="absolute top-full left-0 pt-2 bg-transparent z-[60]">
                  <div className="bg-white shadow-lg rounded-lg py-2 min-w-[180px] border border-neutral-200 relative z-[60]">
                    {companyMenuItems.map((item) => {
                      // Bloglar için direkt link
                      if (item.href) {
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setCompanyMenuOpen(false)}
                            className="w-full text-left px-4 py-2 text-neutral-800 hover:bg-primary-orange/10 hover:text-primary-orange transition-colors block"
                          >
                            {item.label}
                          </Link>
                        );
                      }
                      // Hakkımızda ve SSS için akıllı linkleme
                      if (item.sectionId === 'hakkimizda' || item.sectionId === 'sss') {
                        if (isHomePage) {
                          return (
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
                          );
                        }
                        const href = item.sectionId === 'hakkimizda' ? '/#hakkimizda' : '/#sss';
                        return (
                          <Link
                            key={item.label}
                            href={href}
                            onClick={() => setCompanyMenuOpen(false)}
                            className="w-full text-left px-4 py-2 text-neutral-800 hover:bg-primary-orange/10 hover:text-primary-orange transition-colors block"
                          >
                            {item.label}
                          </Link>
                        );
                      }
                      // İletişim için scroll-to-section
                      if (item.sectionId) {
                        return (
                          <button
                            key={item.label}
                            onClick={() => {
                              scrollToSection(item.sectionId!);
                              setCompanyMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-neutral-800 hover:bg-primary-orange/10 hover:text-primary-orange transition-colors"
                          >
                            {item.label}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* CTA Buttons - Right Aligned */}
          {!isTeklifPage && (
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
          )}

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
            {menuItems.map((item) => {
              // Süreç için akıllı linkleme
              if (item.sectionId === 'surec') {
                if (isHomePage) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.sectionId)}
                      className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
                    >
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href="/#surec"
                    className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              }
              // Diğerleri için scroll-to-section
              return (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.sectionId)}
                  className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
                >
                  {item.label}
                </button>
              );
            })}
            {isHomePage ? (
              <button
                onClick={() => scrollToSection('hakkimizda')}
                className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
              >
                Hakkımızda
              </button>
            ) : (
              <Link
                href="/#hakkimizda"
                className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hakkımızda
              </Link>
            )}
            <button
              onClick={() => scrollToSection('iletisim')}
              className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
            >
              İletişim
            </button>
            {isHomePage ? (
              <button
                onClick={() => scrollToSection('sss')}
                className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
              >
                SSS
              </button>
            ) : (
              <Link
                href="/#sss"
                className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                SSS
              </Link>
            )}
            <Link
              href="/blog"
              className="block w-full text-left py-2 text-neutral-800 hover:text-primary-orange font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bloglar
            </Link>
            {!isTeklifPage && (
              <div className="mt-4 space-y-2">
                <Link
                  href="/teklif"
                  className="w-full bg-primary-orange text-white font-bold px-6 py-3 rounded-lg inline-block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hemen Başvur
                </Link>
                <Link
                  href="/portal/giris"
                  className="w-full bg-primary-orange text-white font-bold px-6 py-3 rounded-lg inline-block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dosyam Nerede?
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
});
