'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AdminUser } from '@/lib/supabase/admin-auth';
import { supabase } from '@/lib/supabase/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, CheckCircle, Clock, Trophy, AlertTriangle } from 'lucide-react';
import { isCaseCompleted, CHECKLIST_ITEMS } from '@/lib/checklist-sections';

type ReportPeriod = '1_month' | '3_months' | '1_year' | 'all_time';

interface AvukatPerformance {
  ad: string;
  dosyaSayisi: number;
  ortalamaSure: number;
  tamamlanan: number;
  aktif: number;
}

interface AcentePerformance {
  ad: string;
  musteriSayisi: number;
  aktif: number;
  toplamKomisyon: number;
}

interface AdminPerformance {
  ad: string;
  getirilen: number;
  aktif: number;
  tamamlanan: number;
}

interface EnIyiler {
  enCokDosya: { ad: string; deger: number };
  enHizli: { ad: string; deger: number };
  enCokMusteri: { ad: string; deger: number };
}

interface ReportData {
  // Genel Bakış
  toplamCiro: number;
  yeniMusteri: number;
  aktifDosya: number;
  bitenDosya: number;
  ortalamaSure: number;
  // Performans Tabloları
  avukatlar: AvukatPerformance[];
  acenteler: AcentePerformance[];
  adminler: AdminPerformance[];
  // En İyiler
  enIyiler: EnIyiler;
  // Uyarılar
  uyarilar: string[];
  // Trend Data
  aylikTrend: { ay: string; ciro: number; yeniMusteri: number }[];
}

export function SuperAdminReport({ adminUser, period }: { adminUser: AdminUser; period: ReportPeriod }) {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    loadReportData();
  }, [period]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      console.log('SuperAdmin Report: Loading data for period:', period);
      const now = new Date();

      // Calculate date range based on period
      let startDate: Date;
      let endDate: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      switch (period) {
        case '1_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case '3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case '1_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'all_time':
          startDate = new Date(2000, 0, 1); // Very early date
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Load all cases (superadmin sees everything)
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select(`
          id,
          case_number,
          status,
          board_stage,
          assigned_lawyer,
          created_at,
          start_date,
          updated_at,
          value_loss_amount,
          fault_rate,
          estimated_compensation,
          customers (
            id,
            full_name,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('Error loading cases:', casesError);
        throw casesError;
      }

      // Load all admins, lawyers, acentes
      const { data: adminsData, error: adminsError } = await supabase
        .from('user_auth')
        .select(`
          id,
          name,
          role
        `)
        .in('role', ['admin', 'lawyer', 'acente']);

      if (adminsError) {
        console.error('Error loading admins:', adminsError);
        throw adminsError;
      }

      // Load case assignments
      const { data: caseAdminsData, error: caseAdminsError } = await supabase
        .from('case_admins')
        .select('*');

      if (caseAdminsError) {
        console.error('Error loading case_admins:', caseAdminsError);
        throw caseAdminsError;
      }

      // Load all checklist items for all cases
      const { data: checklistData, error: checklistError } = await supabase
        .from('admin_checklist')
        .select('case_id, task_key, completed');

      if (checklistError) {
        console.error('Error loading checklist:', checklistError);
        throw checklistError;
      }

      const casesList = casesData || [];
      const adminsList = adminsData || [];
      const caseAdminsList = caseAdminsData || [];
      const checklistList = checklistData || [];

      // Helper function to check if a case is completed
      const checkCaseCompleted = (caseItem: any): boolean => {
        // If board_stage is 'tamamlandi', it's completed
        if (caseItem.board_stage === 'tamamlandi') {
          return true;
        }
        
        // Get checklist items for this case
        const caseChecklist = checklistList
          .filter((c: any) => c.case_id === caseItem.id)
          .map((c: any) => ({ task_key: c.task_key, completed: c.completed }));
        
        // Check if all checklist items are completed
        const allTaskKeys = CHECKLIST_ITEMS.map((item) => item.key);
        const completedTaskKeys = caseChecklist
          .filter((item: any) => item.completed)
          .map((item: any) => item.task_key);
        
        return allTaskKeys.every((key) => completedTaskKeys.includes(key));
      };

      // Filter cases for this period
      const periodCases = casesList.filter((c: any) => {
        const createdAt = new Date(c.created_at);
        return createdAt >= startDate && createdAt <= endDate;
      });

      console.log('SuperAdmin Report: Filtered cases:', {
        totalCases: casesList.length,
        periodCases: periodCases.length,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Calculate general stats
      // A case is completed if: board_stage === 'tamamlandi' OR all checklist items completed
      const aktifDosya = periodCases.filter((c: any) => !checkCaseCompleted(c)).length;
      const bitenDosya = periodCases.filter((c: any) => checkCaseCompleted(c)).length;
      const yeniMusteri = periodCases.length;

      // Calculate total ciro: Sum of 20% of completed cases' estimated_compensation
      // Include cases that are completed (by board_stage or checklist)
      const toplamCiro = periodCases
        .filter((c: any) => checkCaseCompleted(c))
        .reduce((sum: number, c: any) => {
          const compensation = c.estimated_compensation || 0;
          return sum + (compensation * 0.20); // 20% commission
        }, 0);

      // Calculate average duration for completed cases
      // Duration = customer created_at to case updated_at (when completed)
      const completedCases = periodCases.filter((c: any) => checkCaseCompleted(c));
      let totalDuration = 0;
      completedCases.forEach((c: any) => {
        // Use customer's created_at as start date
        const customerCreatedAt = c.customers?.created_at || c.created_at;
        // Use case's updated_at as completion date
        const caseUpdatedAt = c.updated_at || c.created_at;
        const start = new Date(customerCreatedAt);
        const end = new Date(caseUpdatedAt);
        const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        totalDuration += days;
      });
      const ortalamaSure = completedCases.length > 0 ? Math.round(totalDuration / completedCases.length) : 0;

      // Calculate lawyer performance
      const lawyers = adminsList.filter((a: any) => a.role === 'lawyer');
      const avukatlar: AvukatPerformance[] = lawyers.map((lawyer: any) => {
        const lawyerCases = periodCases.filter((c: any) => {
          const isAssigned = caseAdminsList.some(
            (ca: any) => ca.case_id === c.id && ca.admin_id === lawyer.id
          );
          return isAssigned || c.assigned_lawyer === lawyer.name;
        });

        const lawyerCompleted = lawyerCases.filter((lc: any) => checkCaseCompleted(lc)).length;
        const lawyerActive = lawyerCases.filter((lc: any) => !checkCaseCompleted(lc)).length;

        // Calculate average duration for this lawyer's completed cases
        // Duration = customer created_at to case updated_at (when completed)
        const lawyerCompletedCases = lawyerCases.filter((lc: any) => checkCaseCompleted(lc));
        let lawyerTotalDuration = 0;
        lawyerCompletedCases.forEach((lc: any) => {
          const customerCreatedAt = lc.customers?.created_at || lc.created_at;
          const caseUpdatedAt = lc.updated_at || lc.created_at;
          const start = new Date(customerCreatedAt);
          const end = new Date(caseUpdatedAt);
          const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          lawyerTotalDuration += days;
        });
        const lawyerOrtalamaSure = lawyerCompletedCases.length > 0
          ? Math.round(lawyerTotalDuration / lawyerCompletedCases.length)
          : 0;

        return {
          ad: lawyer.name || `Avukat ${lawyer.id.substring(0, 8)}` || 'Bilinmeyen',
          dosyaSayisi: lawyerCases.length,
          ortalamaSure: lawyerOrtalamaSure,
          tamamlanan: lawyerCompleted,
          aktif: lawyerActive,
        };
      }).filter((a: AvukatPerformance) => a.dosyaSayisi > 0);

      // Calculate acente performance
      const acentes = adminsList.filter((a: any) => a.role === 'acente');
      const acenteler: AcentePerformance[] = acentes.map((acente: any) => {
        const acenteCases = periodCases.filter((c: any) => {
          return caseAdminsList.some(
            (ca: any) => ca.case_id === c.id && ca.admin_id === acente.id
          );
        });

        const acenteActive = acenteCases.filter((ac: any) => !checkCaseCompleted(ac)).length;

        // Calculate total commission (15000 TL per customer)
        const toplamKomisyon = acenteCases.length * 15000;

        return {
          ad: acente.name || `Acente ${acente.id.substring(0, 8)}` || 'Bilinmeyen',
          musteriSayisi: acenteCases.length,
          aktif: acenteActive,
          toplamKomisyon,
        };
      }).filter((a: AcentePerformance) => a.musteriSayisi > 0);

      // Calculate admin performance
      const admins = adminsList.filter((a: any) => a.role === 'admin');
      const adminler: AdminPerformance[] = admins.map((admin: any) => {
        const adminCases = periodCases.filter((c: any) => {
          return caseAdminsList.some(
            (ca: any) => ca.case_id === c.id && ca.admin_id === admin.id
          );
        });

        const adminCompleted = adminCases.filter((ac: any) => checkCaseCompleted(ac)).length;
        const adminActive = adminCases.filter((ac: any) => !checkCaseCompleted(ac)).length;

        return {
          ad: admin.name || `Admin ${admin.id.substring(0, 8)}` || 'Bilinmeyen',
          getirilen: adminCases.length,
          aktif: adminActive,
          tamamlanan: adminCompleted,
        };
      }).filter((a: AdminPerformance) => a.getirilen > 0);

      // Calculate "En İyiler"
      let enCokDosya = { ad: '-', dosyaSayisi: 0 };
      if (avukatlar.length > 0) {
        enCokDosya = avukatlar.reduce((max, a) => (a.dosyaSayisi > max.dosyaSayisi ? a : max), avukatlar[0]);
      }

      let enHizli = { ad: '-', ortalamaSure: 0 };
      const lawyersWithDuration = avukatlar.filter((a) => a.ortalamaSure > 0);
      if (lawyersWithDuration.length > 0) {
        enHizli = lawyersWithDuration.reduce((min, a) => (a.ortalamaSure < min.ortalamaSure ? a : min), lawyersWithDuration[0]);
      }

      let enCokMusteri = { ad: '-', musteriSayisi: 0 };
      if (acenteler.length > 0) {
        enCokMusteri = acenteler.reduce((max, a) => (a.musteriSayisi > max.musteriSayisi ? a : max), acenteler[0]);
      }

      const enIyiler: EnIyiler = {
        enCokDosya: { ad: enCokDosya.ad, deger: enCokDosya.dosyaSayisi },
        enHizli: { ad: enHizli.ad, deger: enHizli.ortalamaSure },
        enCokMusteri: { ad: enCokMusteri.ad, deger: enCokMusteri.musteriSayisi },
      };

      // Generate warnings
      const uyarilar: string[] = [];
      const longOpenCases = periodCases.filter((c: any) => {
        if (c.status !== 'active') return false;
        const start = new Date(c.start_date || c.created_at);
        const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 90;
      });
      if (longOpenCases.length > 0) {
        uyarilar.push(`${longOpenCases.length} dosya 90+ gündür açık`);
      }

      // Check for acentes with no new customers in last 2 months
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      acentes.forEach((acente: any) => {
        const acenteName = acente.name || `Acente ${acente.id.substring(0, 8)}`;
        const recentCases = periodCases.filter((c: any) => {
          const isAssigned = caseAdminsList.some(
            (ca: any) => ca.case_id === c.id && ca.admin_id === acente.id
          );
          if (!isAssigned) return false;
          const createdAt = new Date(c.created_at);
          return createdAt >= twoMonthsAgo;
        });
        const acenteHasCases = acenteler.some((a) => a.ad === acenteName);
        if (recentCases.length === 0 && acenteHasCases) {
          uyarilar.push(`${acenteName} 2 aydır yeni müşteri göndermedi`);
        }
      });

      // Calculate monthly trend
      const monthsToShow = period === '1_month' ? 1 : period === '3_months' ? 3 : period === '1_year' ? 12 : 12;
      const aylikTrend: { ay: string; ciro: number; yeniMusteri: number }[] = [];
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const monthCases = periodCases.filter((c: any) => {
          const createdAt = new Date(c.created_at);
          return createdAt >= monthDate && createdAt <= monthEnd;
        });
        const monthCiro = monthCases
          .filter((c: any) => checkCaseCompleted(c))
          .reduce((sum: number, c: any) => {
            const compensation = c.estimated_compensation || 0;
            return sum + (compensation * 0.20); // 20% commission
          }, 0);
        aylikTrend.push({
          ay: monthDate.toLocaleDateString('tr-TR', { month: 'short' }),
          ciro: monthCiro,
          yeniMusteri: monthCases.length,
        });
      }

      const report: ReportData = {
        toplamCiro,
        yeniMusteri,
        aktifDosya,
        bitenDosya,
        ortalamaSure,
        avukatlar,
        acenteler,
        adminler,
        enIyiler,
        uyarilar,
        aylikTrend,
      };

      console.log('SuperAdmin Report: Data loaded successfully', report);
      setReportData(report);
    } catch (error) {
      console.error('Error loading superadmin report:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case '1_month':
        return '1 Aylık';
      case '3_months':
        return '3 Aylık';
      case '1_year':
        return '1 Yıllık';
      case 'all_time':
        return 'Baştan Sona';
      default:
        return 'Rapor';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 mb-2">Rapor verisi bulunamadı</p>
        <p className="text-sm text-neutral-500">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">
          {adminUser.name ? `${adminUser.name}'in Raporu` : 'Raporlarım'}
        </h1>
        <p className="text-neutral-600 mt-1">{getPeriodLabel()} Genel Sistem Raporu</p>
      </div>

      {/* A. GENEL BAKIŞ - 5 Büyük Kart (Başarı Oranı kaldırıldı) */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-center">
            <p className="text-xs text-blue-700 font-medium mb-2">Toplam Ciro</p>
            <p className="text-2xl font-bold text-blue-900">
              {(reportData.toplamCiro / 1000).toFixed(0)}K TL
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-center">
            <p className="text-xs text-green-700 font-medium mb-2">Yeni Müşteri</p>
            <p className="text-2xl font-bold text-green-900">{reportData.yeniMusteri}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="text-center">
            <p className="text-xs text-orange-700 font-medium mb-2">Aktif Dosya</p>
            <p className="text-2xl font-bold text-orange-900">{reportData.aktifDosya}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="text-center">
            <p className="text-xs text-indigo-700 font-medium mb-2">Biten Dosya</p>
            <p className="text-2xl font-bold text-indigo-900">{reportData.bitenDosya}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <div className="text-center">
            <p className="text-xs text-pink-700 font-medium mb-2">Ort. Süre</p>
            <p className="text-2xl font-bold text-pink-900">{reportData.ortalamaSure} gün</p>
          </div>
        </Card>
      </div>

      {/* B. AVUKAT PERFORMANSI */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-neutral-800 mb-4">Avukat Performansı</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Avukat</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Dosya</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Ort.Süre</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Tamamlanan</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Aktif</th>
              </tr>
            </thead>
            <tbody>
              {reportData.avukatlar.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-neutral-500">Avukat bulunamadı</td>
                </tr>
              ) : (
                reportData.avukatlar.map((avukat, index) => (
                  <tr key={index} className="border-b border-neutral-100">
                    <td className="py-3 px-4">{avukat.ad}</td>
                    <td className="py-3 px-4">{avukat.dosyaSayisi}</td>
                    <td className="py-3 px-4">{avukat.ortalamaSure} gün</td>
                    <td className="py-3 px-4">{avukat.tamamlanan}</td>
                    <td className="py-3 px-4">{avukat.aktif}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* C. ACENTE PERFORMANSI */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-neutral-800 mb-4">Acente Performansı</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Acente</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Müşteri</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Aktif</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Toplam Kom.</th>
              </tr>
            </thead>
            <tbody>
              {reportData.acenteler.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-neutral-500">Acente bulunamadı</td>
                </tr>
              ) : (
                reportData.acenteler.map((acente, index) => (
                  <tr key={index} className="border-b border-neutral-100">
                    <td className="py-3 px-4">{acente.ad}</td>
                    <td className="py-3 px-4">{acente.musteriSayisi}</td>
                    <td className="py-3 px-4">{acente.aktif}</td>
                    <td className="py-3 px-4">{(acente.toplamKomisyon / 1000).toFixed(0)}K TL</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* D. ADMIN PERFORMANSI */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-neutral-800 mb-4">Admin Performansı</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Admin</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Getirilen</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Aktif</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Tamamlanan</th>
              </tr>
            </thead>
            <tbody>
              {reportData.adminler.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-neutral-500">Admin bulunamadı</td>
                </tr>
              ) : (
                reportData.adminler.map((admin, index) => (
                  <tr key={index} className="border-b border-neutral-100">
                    <td className="py-3 px-4">{admin.ad}</td>
                    <td className="py-3 px-4">{admin.getirilen}</td>
                    <td className="py-3 px-4">{admin.aktif}</td>
                    <td className="py-3 px-4">{admin.tamamlanan}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* E. EN İYİLER */}
      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-neutral-800">BU DÖNEM ŞAMPİYONLARI</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💪</span>
            <div>
              <p className="text-sm text-neutral-600">En Çok Dosya</p>
              <p className="font-bold text-neutral-800">
                {reportData.enIyiler.enCokDosya.ad} ({reportData.enIyiler.enCokDosya.deger})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm text-neutral-600">En Hızlı</p>
              <p className="font-bold text-neutral-800">
                {reportData.enIyiler.enHizli.ad} ({reportData.enIyiler.enHizli.deger} gün)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-sm text-neutral-600">En Çok Müşteri</p>
              <p className="font-bold text-neutral-800">
                {reportData.enIyiler.enCokMusteri.ad} ({reportData.enIyiler.enCokMusteri.deger})
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* F. DİKKAT GEREKENLER */}
      {reportData.uyarilar.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold text-neutral-800">DİKKAT EDİLMESİ GEREKENLER</h3>
          </div>
          <ul className="space-y-2">
            {reportData.uyarilar.map((uyari, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span className="text-neutral-700">{uyari}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* G. TREND GRAFİKLERİ */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-neutral-800 mb-4">Aylık Performans Trendi</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-neutral-600 mb-2">Ciro (TL)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={reportData.aylikTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ay" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(0)}K TL`} />
                <Bar dataKey="ciro" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-sm font-medium text-neutral-600 mb-2">Yeni Müşteri</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reportData.aylikTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ay" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="yeniMusteri" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
