'use client';

import { PortalLayout } from '@/components/portal/portal-layout';
import { Card } from '@/components/ui/card';
import { User, Car, Bell, MessageCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
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

  const customerId = useMemo(() => customerData?.id, [customerData?.id]);
  const caseId = useMemo(() => caseData?.id, [caseData?.id]);

  const loadAccountData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Settings: Loading data...');
      const { data: cases, error: casesError } = await getCurrentUserCases();
      
      if (casesError) {
        console.error('Settings: Error loading cases:', casesError);
        return;
      }
      
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
  }, []);

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
  }, [customerId, caseId, loadAccountData, customerData, caseData]);

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
                value={customerData?.full_name || '-'}
                readOnly
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              />
              <div className="mt-3 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-yellow-800">
                    Sadece müşteri adına olan hesaba ödeme yapılabilir.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Sigorta Şirketi</label>
              <input
                type="text"
                value={customerData?.insurance_company || '-'}
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
          href="https://wa.me/905057053305"
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
