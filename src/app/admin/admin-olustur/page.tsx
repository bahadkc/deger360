'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isSuperAdmin } from '@/lib/supabase/admin-auth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AdminOlusturPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAdmin, setCreatedAdmin] = useState<{ name: string; email: string; role: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'lawyer' | 'acente',
  });

  useEffect(() => {
    const checkAccess = async () => {
      const superAdmin = await isSuperAdmin();
      setIsSuperAdminUser(superAdmin);
      setLoading(false);

      if (!superAdmin) {
        router.push('/admin');
      }
    };
    checkAccess();

    // Real-time subscription for user_auth table (to detect when new admin is created)
    // This ensures the admin list updates immediately when a new admin is created
    const channel = supabase
      .channel('admin_creation_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_auth',
          filter: 'role=in.(superadmin,admin,lawyer,acente)',
        },
        () => {
          // Admin created, but we don't need to do anything here
          // The admin assignment dropdown will update via its own subscription
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Admin oluşturulurken bir hata oluştu');
      }

      setSuccess(true);
      setCreatedAdmin({
        name: data.user?.name || data.user?.email || '',
        email: data.user?.email || '',
        role: data.user?.role || '',
      });
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
      });

      // Trigger a custom event to notify other components about new admin
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adminCreated', { 
          detail: { adminId: data.user?.id } 
        }));
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setCreatedAdmin(null);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Admin oluşturulurken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!isSuperAdminUser) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-800">Admin Oluştur</h1>
          <p className="text-xs md:text-sm text-neutral-600">Yeni bir admin hesabı oluşturun</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Success Message */}
              {success && (
                <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 md:gap-3">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-green-800">Admin başarıyla oluşturuldu!</p>
                    <p className="text-xs text-green-700 mt-1 break-words">
                      {createdAdmin && (
                        <>
                          <strong>{createdAdmin.name}</strong> ({createdAdmin.email}) hesabı oluşturuldu ve sisteme eklendi.
                        </>
                      )}
                      {!createdAdmin && 'Yeni admin hesabı oluşturuldu ve sisteme eklendi.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 md:gap-3">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-red-800">Hata</p>
                    <p className="text-xs text-red-700 mt-1 break-words">{error}</p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
                  İsim Soyisim <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ad Soyad"
                  required
                  disabled={saving}
                  className="text-sm md:text-base"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
                  E-posta Adresi <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  required
                  disabled={saving}
                  className="text-sm md:text-base"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="En az 6 karakter"
                  required
                  disabled={saving}
                  minLength={6}
                  className="text-sm md:text-base"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Şifre en az 6 karakter olmalıdır
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
                  Şifre Tekrar <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Şifreyi tekrar girin"
                  required
                  disabled={saving}
                  minLength={6}
                  className="text-sm md:text-base"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'lawyer' | 'acente' })}
                  disabled={saving}
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-colors"
                >
                  <option value="admin">Admin</option>
                  <option value="lawyer">Avukat</option>
                  <option value="acente">Acente</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  <strong>Admin:</strong> Değişiklik yapabilir, admin ataması yapamaz, kendine atanmamış müşterileri göremez<br className="hidden sm:block"/>
                  <strong>Avukat:</strong> Değişiklik yapabilir, admin ataması yapamaz, kendine atanmamış müşterileri göremez<br className="hidden sm:block"/>
                  <strong>Acente:</strong> Sadece kendine atananları görebilir, hiçbir değişiklik yapamaz
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 pt-3 md:pt-4 border-t border-neutral-200">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto min-w-[120px] text-sm md:text-base"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Oluşturuluyor...' : 'Admin Oluştur'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="p-4 md:p-6 mt-4 md:mt-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-2 md:gap-3">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-semibold text-blue-800 mb-1 md:mb-2">Bilgilendirme</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Oluşturulan admin hesabı otomatik olarak onaylanır</li>
                  <li>Admin hemen sisteme giriş yapabilir</li>
                  <li>Admin, kendisine atanan müşterileri görebilir</li>
                  <li>Şifre güvenli bir şekilde saklanır</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
