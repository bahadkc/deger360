'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { AdminUser } from '@/lib/supabase/admin-auth';
import { StatusBadge } from './common/status-badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FileText, Target, CheckCircle2, Clock } from 'lucide-react';
import { CHECKLIST_ITEMS } from '@/lib/checklist-sections';
import { getReportData } from '@/lib/cache/report-data-cache';

interface ReportSection {
  period: string;
  activeCases: number;
  successRate: number;
  completedCases: number;
  averageCaseDuration: number;
  stageDistribution: { name: string; value: number }[];
  cases: {
    id: string;
    case_number: string;
    customer_name: string;
    status: string;
    board_stage: string;
    daysElapsed: number;
    lastActivity: string;
  }[];
}

const STAGE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#10b981'];

export function AvukatReport({ adminUser }: { adminUser: AdminUser }) {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [checklistList, setChecklistList] = useState<any[]>([]);
  const hasLoadedRef = useRef(false);

  // Helper function to check if a case is completed
  const checkCaseCompleted = useCallback((caseItem: any): boolean => {
    if (caseItem.board_stage === 'tamamlandi') return true;
    const caseChecklist = checklistList
      .filter((c: any) => c.case_id === caseItem.id)
      .map((c: any) => ({ task_key: c.task_key, completed: c.completed }));
    const allTaskKeys = CHECKLIST_ITEMS.map((item) => item.key);
    const completedTaskKeys = caseChecklist
      .filter((item: any) => item.completed)
      .map((item: any) => item.task_key);
    return allTaskKeys.every((key) => completedTaskKeys.includes(key));
  }, [checklistList]);

  const loadReportData = useCallback(async () => {
    // Prevent multiple calls
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      setLoading(true);

      // Load data via cache (will fetch from API only once)
      const reportData = await getReportData('lawyer');
      const casesList = reportData.cases || [];
      const checklistListData = reportData.checklist || [];
      setChecklistList(checklistListData);

      if (casesList.length === 0) {
        setSections([]);
        return;
      }
      const now = new Date();

      const calculateSection = (startDate: Date, endDate: Date, period: string): ReportSection => {
        const periodCases = casesList.filter((c: any) => {
          const createdAt = new Date(c.created_at);
          return createdAt >= startDate && createdAt <= endDate;
        });

        const activeCases = periodCases.filter((c: any) => !checkCaseCompleted(c)).length;
        const completedCases = periodCases.filter((c: any) => checkCaseCompleted(c)).length;
        const totalCases = periodCases.length;
        const successRate = totalCases > 0 ? (completedCases / totalCases) * 100 : 0;

        // Calculate average case duration for completed cases
        const completedCasesWithDuration = periodCases.filter((c: any) => c.status === 'completed');
        let totalDuration = 0;
        completedCasesWithDuration.forEach((c: any) => {
          const start = new Date(c.start_date || c.created_at);
          const end = new Date(c.updated_at || c.created_at);
          const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          totalDuration += days;
        });
        const averageCaseDuration = completedCasesWithDuration.length > 0
          ? Math.round(totalDuration / completedCasesWithDuration.length)
          : 0;

        // Calculate stage distribution
        const stageCounts: Record<string, number> = {
          'Evrak Toplama': 0,
          'Sigorta Başvurusu': 0,
          'Müzakere': 0,
          'Ödeme Bekliyor': 0,
          'Tamamlandı': 0,
        };

        periodCases.forEach((c: any) => {
          const stage = c.board_stage;
          if (stage === 'evrak_ekspertiz') stageCounts['Evrak Toplama']++;
          else if (stage === 'sigorta_basvurusu') stageCounts['Sigorta Başvurusu']++;
          else if (stage === 'muzakere') stageCounts['Müzakere']++;
          else if (stage === 'odeme') stageCounts['Ödeme Bekliyor']++;
          else if (stage === 'tamamlandi' || checkCaseCompleted(c)) stageCounts['Tamamlandı']++;
        });

        const stageDistribution = Object.entries(stageCounts)
          .filter(([_, count]) => count > 0)
          .map(([name, value]) => ({ name, value }));

        // Prepare case list
        const casesFormatted = periodCases.map((caseItem: any) => {
          const startDate = new Date(caseItem.start_date || caseItem.created_at);
          const lastUpdate = new Date(caseItem.updated_at || caseItem.created_at);
          const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const hoursSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));
          const daysSinceUpdate = Math.floor(hoursSinceUpdate / 24);
          
          let lastActivity = '';
          if (daysSinceUpdate > 0) {
            lastActivity = `${daysSinceUpdate} gün önce`;
          } else if (hoursSinceUpdate > 0) {
            lastActivity = `${hoursSinceUpdate} saat önce`;
          } else {
            lastActivity = 'Az önce';
          }

          return {
            id: caseItem.id,
            case_number: caseItem.case_number || '',
            customer_name: caseItem.customers?.full_name || '',
            status: caseItem.status || 'active',
            board_stage: caseItem.board_stage || 'basvuru_alindi',
            daysElapsed,
            lastActivity,
          };
        });

        return {
          period,
          activeCases,
          successRate,
          completedCases,
          averageCaseDuration,
          stageDistribution,
          cases: casesFormatted,
        };
      };

      // Calculate sections
      const sectionsData: ReportSection[] = [];

      // 1 Month
      const oneMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const oneMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      sectionsData.push(calculateSection(oneMonthStart, oneMonthEnd, '1 Aylık'));

      // 3 Months
      const threeMonthsStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const threeMonthsEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      sectionsData.push(calculateSection(threeMonthsStart, threeMonthsEnd, '3 Aylık'));

      // 1 Year
      const oneYearStart = new Date(now.getFullYear(), 0, 1);
      const oneYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      sectionsData.push(calculateSection(oneYearStart, oneYearEnd, '1 Yıllık'));

      console.log('Avukat Report: Data loaded successfully', sectionsData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Error loading avukat report:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [checkCaseCompleted]);

  useEffect(() => {
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusType = (status: string, boardStage: string, caseItem?: any): string => {
    if (caseItem && checkCaseCompleted && checkCaseCompleted(caseItem)) return 'completed';
    if (boardStage === 'tamamlandi') return 'completed';
    if (boardStage === 'odeme' || boardStage === 'muzakere') return 'in_progress';
    return 'pending';
  };

  const renderSection = (section: ReportSection) => (
    <div key={section.period} className="space-y-6">
      <div className="border-t-4 border-primary-blue pt-6">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">{section.period} Rapor</h2>

        {/* 4 Top Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Aktif Dosya</p>
                <p className="text-2xl font-bold text-neutral-800">{section.activeCases}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Başarı Oranı</p>
                <p className="text-2xl font-bold text-neutral-800">{section.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Tamamlanan Dosya</p>
                <p className="text-2xl font-bold text-neutral-800">{section.completedCases}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Ortalama Süre</p>
                <p className="text-2xl font-bold text-neutral-800">{section.averageCaseDuration} gün</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stage Distribution Donut Chart */}
        {section.stageDistribution.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Durum Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={section.stageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {section.stageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Case List Table */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">Dosya Listesi</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Dosya Numarası</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Müşteri Adı</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Durum</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Geçen Süre</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Son İşlem</th>
                </tr>
              </thead>
              <tbody>
                {section.cases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-neutral-500">Dosya bulunamadı</td>
                  </tr>
                ) : (
                  section.cases.map((caseItem) => (
                    <tr key={caseItem.id} className="border-b border-neutral-100">
                      <td className="py-3 px-4 font-medium">{caseItem.case_number}</td>
                      <td className="py-3 px-4">{caseItem.customer_name}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={getStatusType(caseItem.status, caseItem.board_stage, caseItem)} />
                      </td>
                      <td className="py-3 px-4">{caseItem.daysElapsed} gün</td>
                      <td className="py-3 px-4 text-sm text-neutral-600">{caseItem.lastActivity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">
          {adminUser.name ? `${adminUser.name}'in Raporu` : 'Raporlarım'}
        </h1>
        <p className="text-neutral-600 mt-1">Avukat Performans Raporu</p>
      </div>

      {/* Report Sections */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Yükleniyor...</div>
      ) : sections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-2">Rapor verisi bulunamadı</p>
          <p className="text-sm text-neutral-500">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
        </div>
      ) : (
        sections.map(renderSection)
      )}
    </div>
  );
}
