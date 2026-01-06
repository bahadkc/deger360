import NoSSR from '@/components/NoSSR';
import AdminGirisPageContent from '@/components/admin/admin-giris-content';

export default function AdminGirisPage() {
  return (
    <NoSSR>
      {/* Login sayfası NoSSR içinde - sunucuda render edilmez */}
      {/* Böylece hydration hatası (server/client uyuşmazlığı) imkansız hale gelir */}
      <AdminGirisPageContent />
    </NoSSR>
  );
}
