import { ReactNode } from 'react';
import NoSSR from '@/components/NoSSR';
import { AdminLayoutContent } from '@/components/admin/admin-layout-content';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-wrapper">
      <NoSSR>
        {/* Tüm admin layout içeriği NoSSR içinde - sunucuda render edilmez */}
        {/* Böylece hydration hatası (server/client uyuşmazlığı) imkansız hale gelir */}
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </NoSSR>
    </div>
  );
}
