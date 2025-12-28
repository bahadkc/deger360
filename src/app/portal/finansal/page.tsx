'use client';

import { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/portal/portal-layout';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/portal/status-badge';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserCases } from '@/lib/supabase/auth';

export default function FinansalPage() {
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    loadFinancialData();

    // Real-time subscription for customers table (IBAN, payment_person_name, etc.)
    const customerChannel = supabase
      .channel('customer_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customers',
        },
        (payload) => {
          // Update customer data if it's the current customer
          if (customerData && payload.new.id === customerData.id) {
            setCustomerData(payload.new as any);
          } else {
            // Reload if we don't know which customer it is
            loadFinancialData();
          }
        }
      )
      .subscribe();

    // Real-time subscription for cases table (financial data)
    const caseChannel = supabase
      .channel('case_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
        },
        (payload) => {
          // Update case data if it's the current case
          if (caseData && payload.new.id === caseData.id) {
            setCaseData((prev: any) => ({ ...prev, ...payload.new }));
          } else {
            loadFinancialData();
          }
        }
      )
      .subscribe();

    // Real-time subscription for payments table
    const paymentChannel = supabase
      .channel('payment_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          loadFinancialData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(customerChannel);
      supabase.removeChannel(caseChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, [customerData?.id, caseData?.id]);

  const loadFinancialData = async () => {
    try {
      console.log('Financial: Loading data...');
      // Get current user's cases (now includes customer data)
      const cases = await getCurrentUserCases();
      console.log('Financial: Cases received:', cases);
      
      if (cases && cases.length > 0) {
        const currentCase = cases[0]; // Get first active case
        console.log('Financial: Current case:', currentCase);
        console.log('Financial: Customer data:', currentCase.customers);
        
        // Case already includes customer data from getCurrentUserCases
        setCaseData(currentCase);
        setCustomerData(currentCase.customers);
        
        console.log('Financial: IBAN:', currentCase.customers?.iban);

        // Get payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('case_id', currentCase.id)
          .order('payment_date', { ascending: false });

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);
      } else {
        console.warn('Financial: No cases found for current user');
      }
    } catch (error) {
      console.error('Financial: Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate values from case data
  const degerKaybi = parseFloat(caseData?.value_loss_amount?.toString() || '0');
  const karsiTarafKusurOrani = parseFloat(caseData?.fault_rate?.toString() || '0');
  const noterVeDosyaMasraflari = parseFloat(caseData?.notary_and_file_expenses?.toString() || '0');
  
  // Toplam Beklenen Net Gelir = Değer Kaybı * Karşı Taraf Kusur Oranı * 80/10000
  const sizeKalacakTutar = (degerKaybi * karsiTarafKusurOrani * 80) / 10000;

  const odemeDurumu = caseData?.status === 'completed' ? 'completed' : 'waiting';
  const tahminiOdemeTarihi = caseData?.estimated_completion_date
    ? new Date(caseData.estimated_completion_date).toLocaleDateString('tr-TR', {
        month: 'long',
        year: 'numeric',
      })
    : 'Belirlenmedi';

  const toplamOdenen = payments.reduce((sum, p) => sum + parseFloat(p.amount?.toString() || '0'), 0);

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
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Finansal Bilgiler</h1>
          <p className="text-neutral-600">Tazminat ve ödeme bilgilerinizi takip edin</p>
        </div>

        {/* Compensation Summary Card */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-4 md:mb-6">Tazminat Özet Bilgileri</h2>
          
          {/* Toplam Beklenen Net Gelir - Focus */}
          <div className="mb-6 p-5 md:p-6 bg-gradient-to-r from-primary-blue to-primary-orange rounded-xl text-white shadow-lg">
            <p className="text-sm md:text-base mb-2 opacity-90">Toplam Beklenen Net Gelir</p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">💰 {sizeKalacakTutar.toLocaleString('tr-TR')} TL</p>
            <p className="text-xs md:text-sm opacity-80">
              Bu tutar, tüm kesintilerden sonra size kalacak net tutardır
            </p>
          </div>

          {/* İstatistikler - 4'lü Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="p-3 md:p-4 hover:shadow-md transition-shadow">
              <p className="text-xs md:text-sm text-neutral-600 mb-1">Değer Kaybı</p>
              <p className="text-lg md:text-xl font-bold text-neutral-800">
                  {degerKaybi.toLocaleString('tr-TR')} TL
                </p>
            </Card>
            
            <Card className="p-3 md:p-4 hover:shadow-md transition-shadow">
              <p className="text-xs md:text-sm text-neutral-600 mb-1">Karşı Tarafın Kusur Oranı</p>
              <p className="text-lg md:text-xl font-bold text-neutral-800">
                %{karsiTarafKusurOrani.toFixed(0)}
                </p>
            </Card>

            <Card className="p-3 md:p-4 hover:shadow-md transition-shadow bg-green-100 border-green-400">
              <p className="text-xs md:text-sm text-neutral-600 mb-1">Noter ve Dosya Masrafları</p>
              <p className="text-lg md:text-xl font-bold text-neutral-800 mb-1">
                {noterVeDosyaMasraflari.toLocaleString('tr-TR')} TL
                </p>
              <p className="text-xs text-green-800 font-semibold">Biz karşılıyoruz!</p>
            </Card>

            <Card className="p-3 md:p-4 hover:shadow-md transition-shadow">
              <p className="text-xs md:text-sm text-neutral-600 mb-1">Müşteri Hakediş Oranı</p>
              <p className="text-lg md:text-xl font-bold text-neutral-800">
                %80
                </p>
            </Card>
              </div>

          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-yellow-800">
                <strong>Uyarı:</strong> Bu rakamlar tahminidir. Kesin tutar sigorta/mahkeme kararına
                göre değişebilir.
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Status Details */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-4">Ödeme Durumu</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-4">
            <StatusBadge status={odemeDurumu} label="Bekleniyor" />
            <p className="text-sm md:text-base text-neutral-700">
              Sigorta şirketi kararından sonra ödeme yapılacaktır.
            </p>
          </div>
          <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs md:text-sm text-blue-800">
              <strong>Tahmini Ödeme Tarihi:</strong> {tahminiOdemeTarihi}
            </p>
          </div>
        </Card>

        {/* Cost Breakdown */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-4">Maliyet Dökümü</h2>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm md:text-base font-medium text-neutral-800">Eksper</span>
              </div>
              <span className="text-sm md:text-base font-semibold text-green-700">0 TL (Biz karşılıyoruz)</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm md:text-base font-medium text-neutral-800">Avukatlık Ücreti</span>
              </div>
              <span className="text-sm md:text-base font-semibold text-green-700">Ödeme sonrası tazminattan kesilecek</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm md:text-base font-medium text-neutral-800">Mahkeme Harçları ve Tahkim Ücreti</span>
              </div>
              <span className="text-sm md:text-base font-semibold text-green-700">Ödeme sonrası tazminattan kesilecek</span>
            </div>
          </div>
          <div className="mt-4 p-3 md:p-4 bg-green-100 rounded-lg border border-green-300">
            <p className="text-xs md:text-sm font-semibold text-green-800">
              ✅ Sizden hiçbir ön ödeme talep edilmeyecek!
            </p>
          </div>
        </Card>

        {/* Payment Account Info */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-4">Ödeme Hesap Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                IBAN Bilginiz
              </label>
              <input
                type="text"
                value={customerData?.iban || 'Henüz girilmedi'}
                readOnly
                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-neutral-300 rounded-lg bg-neutral-50 font-mono"
              />
            </div>
            {customerData?.payment_person_name && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Ödeme Yapılacak Kişi
                </label>
                <input
                  type="text"
                  value={customerData.payment_person_name}
                  readOnly
                  className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-neutral-300 rounded-lg bg-neutral-50"
                />
              </div>
            )}
            <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-yellow-800">
                  ⚠️ Ödeme bu hesaba yapılacaktır. Lütfen bilgilerinizi kontrol edin.
                </p>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </PortalLayout>
  );
}
