'use client';

import { useState, useEffect } from 'react';
import { PortalHeader } from './portal-header';
import { PortalSidebar } from './portal-sidebar';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Portal sayfalarında sticky mobile CTA'yı gizle
  useEffect(() => {
    const stickyCTA = document.querySelector('[class*="fixed"][class*="bottom-0"]');
    if (stickyCTA) {
      (stickyCTA as HTMLElement).style.display = 'none';
    }

    return () => {
      if (stickyCTA) {
        (stickyCTA as HTMLElement).style.display = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50" data-portal-page>
      <PortalHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
      />
      
      <div className="relative">
        {/* Sidebar - Overlay style, sağ üstten açılır */}
        <PortalSidebar
          isMobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        {/* Main Content - Ortalanmış, header için padding-top ekle */}
        <main className="min-h-screen pt-16">
          <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
