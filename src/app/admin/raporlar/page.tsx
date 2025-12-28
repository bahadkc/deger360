'use client';

import { useState, useEffect } from 'react';
import { getCurrentAdmin } from '@/lib/supabase/admin-auth';
import { AdminUser } from '@/lib/supabase/admin-auth';
import { AcenteReport } from '@/components/admin/reports/acente-report';
import { AvukatReport } from '@/components/admin/reports/avukat-report';
import { AdminReport } from '@/components/admin/reports/admin-report';
import { SuperAdminReport } from '@/components/admin/reports/superadmin-report';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

type ReportPeriod = '1_month' | '3_months' | '1_year' | 'all_time';

export default function RaporlarPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod | null>(null);

  useEffect(() => {
    loadAdminUser();
  }, []);

  const loadAdminUser = async () => {
    try {
      const admin = await getCurrentAdmin();
      setAdminUser(admin);
    } catch (error) {
      console.error('Error loading admin user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (adminUser?.role === 'superadmin' && !selectedPeriod) {
      // Superadmin must select period first
      return;
    }
    setReportGenerated(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Admin bilgisi yüklenemedi</div>
      </div>
    );
  }

  // Show generate button if report not generated
  if (!reportGenerated) {
    // Superadmin needs to select period first
    if (adminUser.role === 'superadmin') {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-4 sm:space-y-6 max-w-md w-full">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-400 mx-auto" />
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Rapor Oluştur</h2>
            <p className="text-sm sm:text-base text-neutral-600">Rapor süresini seçin</p>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <button
                onClick={() => setSelectedPeriod('1_month')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                  selectedPeriod === '1_month'
                    ? 'border-primary-blue bg-primary-blue text-white'
                    : 'border-neutral-200 hover:border-primary-blue'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📅</div>
                <div className="font-medium text-sm sm:text-base">1 Aylık</div>
              </button>
              
              <button
                onClick={() => setSelectedPeriod('3_months')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                  selectedPeriod === '3_months'
                    ? 'border-primary-blue bg-primary-blue text-white'
                    : 'border-neutral-200 hover:border-primary-blue'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📆</div>
                <div className="font-medium text-sm sm:text-base">3 Aylık</div>
              </button>
              
              <button
                onClick={() => setSelectedPeriod('1_year')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                  selectedPeriod === '1_year'
                    ? 'border-primary-blue bg-primary-blue text-white'
                    : 'border-neutral-200 hover:border-primary-blue'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🗓️</div>
                <div className="font-medium text-sm sm:text-base">1 Yıllık</div>
              </button>
              
              <button
                onClick={() => setSelectedPeriod('all_time')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                  selectedPeriod === 'all_time'
                    ? 'border-primary-blue bg-primary-blue text-white'
                    : 'border-neutral-200 hover:border-primary-blue'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">∞</div>
                <div className="font-medium text-sm sm:text-base">Baştan Sona</div>
              </button>
            </div>
            
            <Button 
              onClick={handleGenerateReport} 
              size="lg" 
              className="mt-6"
              disabled={!selectedPeriod}
            >
              <FileText className="w-5 h-5 mr-2" />
              Rapor Oluştur
            </Button>
          </div>
        </div>
      );
    }
    
    // Other roles don't need period selection
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4 max-w-md w-full">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-400 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Rapor Oluştur</h2>
          <p className="text-sm sm:text-base text-neutral-600">Detaylı raporunuzu görmek için butona tıklayın</p>
          <Button onClick={handleGenerateReport} size="lg" className="mt-4 w-full sm:w-auto">
            <FileText className="w-5 h-5 mr-2" />
            Rapor Oluştur
          </Button>
        </div>
      </div>
    );
  }

  // Render role-specific report
  const renderReport = () => {
    try {
      switch (adminUser.role) {
        case 'acente':
          return <AcenteReport adminUser={adminUser} />;
        case 'lawyer':
          return <AvukatReport adminUser={adminUser} />;
        case 'admin':
          return <AdminReport adminUser={adminUser} />;
        case 'superadmin':
          return <SuperAdminReport adminUser={adminUser} period={selectedPeriod || 'all_time'} />;
        default:
          return <div className="text-red-600">Geçersiz rol: {adminUser.role}</div>;
      }
    } catch (error) {
      console.error('Error rendering report:', error);
      return (
        <div className="text-red-600 p-4">
          <p>Rapor yüklenirken bir hata oluştu.</p>
          <p className="text-sm mt-2">{error instanceof Error ? error.message : String(error)}</p>
        </div>
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {renderReport()}
    </div>
  );
}
