'use client';

import { PortalLayout } from '@/components/portal/portal-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Car, Bell, MessageCircle, Lock, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserCases } from '@/lib/supabase/auth';

export default function AyarlarPage() {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadAccountData();

    // Real-time subscription for customers table
    const customerChannel = supabase
      .channel('settings_customer_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customers',
        },
        (payload) => {
          if (customerData && payload.new.id === customerData.id) {
            setCustomerData(payload.new as any);
          } else {
            loadAccountData();
          }
        }
      )
      .subscribe();

    // Real-time subscription for cases table
    const caseChannel = supabase
      .channel('settings_case_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
        },
        (payload) => {
          if (caseData && payload.new.id === caseData.id) {
            setCaseData((prev: any) => ({ ...prev, ...payload.new }));
          } else {
            loadAccountData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(customerChannel);
      supabase.removeChannel(caseChannel);
    };
  }, [customerData?.id, caseData?.id]);

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor');
      return;
    }

    setChangingPassword(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User error:', userError);
        throw new Error(`Kullanıcı bilgisi alınamadı: ${userError.message}`);
      }

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
      }

      // Update password via API
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data.error || `Şifre güncellenirken bir hata oluştu (${response.status})`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Şifre güncellenirken bir hata oluştu');
      }

      alert('Şifreniz başarıyla güncellendi');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.message || 'Şifre güncellenirken bir hata oluştu';
      alert(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const loadAccountData = async () => {
    try {
      console.log('Settings: Loading data...');
      const cases = await getCurrentUserCases();
      console.log('Settings: Cases received:', cases);
      
      if (cases && cases.length > 0) {
        const currentCase = cases[0];
        console.log('Settings: Current case:', currentCase);
        console.log('Settings: Customer data:', currentCase.customers);
        
        // Case already includes customer data from getCurrentUserCases
        setCaseData(currentCase);
        setCustomerData(currentCase.customers);
      } else {
        console.warn('Settings: No cases found for current user');
      }
    } catch (error) {
      console.error('Settings: Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">Yükleniyor...</div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Hesap Bilgileri</h1>
          <p className="text-neutral-600">Hesap bilgilerinizi görüntüleyin</p>
        </div>

        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary-blue" />
              <h2 className="text-xl font-bold text-neutral-800">Kişisel Bilgiler</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Ad Soyad</label>
              <input
                type="text"
                value={customerData?.full_name || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Telefon</label>
              <input
                type="tel"
                value={customerData?.phone || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">E-Posta</label>
              <input
                type="email"
                value={customerData?.email || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">TC Kimlik No</label>
              <input
                type="text"
                value={customerData?.tc_kimlik || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Adres</label>
              <input
                type="text"
                value={customerData?.address || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">IBAN</label>
              <input
                type="text"
                value={customerData?.iban || 'Henüz girilmedi'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 font-mono text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Ödeme Yapılacak Kişi</label>
              <input
                type="text"
                value={customerData?.payment_person_name || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
          </div>
        </Card>

        {/* Vehicle Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary-blue" />
              <h2 className="text-xl font-bold text-neutral-800">Araç Bilgileri</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Plaka</label>
              <input
                type="text"
                value={caseData?.vehicle_plate || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Marka/Model</label>
              <input
                type="text"
                value={caseData?.vehicle_brand_model || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Kaza Tarihi</label>
              <input
                type="text"
                value={
                  caseData?.accident_date
                    ? new Date(caseData.accident_date).toLocaleDateString('tr-TR')
                    : '-'
                }
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
            </div>
          </div>
        </Card>

        {/* Password Change */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-blue" />
              <h2 className="text-lg md:text-xl font-bold text-neutral-800">Şifre Değiştir</h2>
            </div>
            {!isChangingPassword && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                className="text-sm md:text-base"
              >
                Şifre Değiştir
              </Button>
            )}
          </div>
          {isChangingPassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Yeni Şifre
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Yeni şifrenizi girin"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Şifre Tekrar
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Şifrenizi tekrar girin"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    changingPassword ||
                    !passwordData.newPassword ||
                    passwordData.newPassword !== passwordData.confirmPassword ||
                    passwordData.newPassword.length < 6
                  }
                  className="flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </Button>
              </div>
              <p className="text-xs text-neutral-500">
                Şifre en az 6 karakter olmalıdır.
              </p>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-4 md:p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Bilgi Güncelleme</h3>
              <p className="text-sm text-blue-800">
                Bilgileriniz admin panel üzerinden yönetilmektedir. Herhangi bir değişiklik için lütfen admin panel ile iletişime geçin.
              </p>
            </div>
          </div>
        </Card>

        {/* WhatsApp Contact Bubble */}
        <a
          href="https://wa.me/905551234567"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center justify-center">
              <MessageCircle className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-center">Değişiklik İçin İletişime Geçin</h3>
              <p className="text-sm text-center opacity-90">
                WhatsApp üzerinden bizimle iletişime geçin
              </p>
            </div>
          </Card>
        </a>
      </div>
    </PortalLayout>
  );
}
