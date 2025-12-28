'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AdminUser } from '@/lib/supabase/admin-auth';
import { supabase } from '@/lib/supabase/client';
import { getAssignedCaseIds } from '@/lib/supabase/admin-auth';
import { StatusBadge } from './common/status-badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, CheckCircle, UserPlus } from 'lucide-react';
import { CHECKLIST_ITEMS } from '@/lib/checklist-sections';

interface ReportSection {
  period: string;
  totalCustomers: number;
  activeCases: number;
  completedCases: number;
  newCustomers: number;
  monthlyCustomers: { month: string; customers: number }[];
  customers: {
    id: string;
    case_id: string;
    full_name: string;
    assigned_lawyer: string | null;
    status: string;
    board_stage: string;
    start_date: string;
  }[];
}

export function AdminReport({ adminUser }: { adminUser: AdminUser }) {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [checklistList, setChecklistList] = useState<any[]>([]);

  // Helper function to check if a case is completed
  const checkCaseCompleted = (caseItem: any): boolean => {
    if (caseItem.board_stage === 'tamamlandi') return true;
    const caseChecklist = checklistList
      .filter((c: any) => c.case_id === caseItem.id)
      .map((c: any) => ({ task_key: c.task_key, completed: c.completed }));
    const allTaskKeys = CHECKLIST_ITEMS.map((item) => item.key);
    const completedTaskKeys = caseChecklist
      .filter((item: any) => item.completed)
      .map((item: any) => item.task_key);
    return allTaskKeys.every((key) => completedTaskKeys.includes(key));
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const assignedIds = await getAssignedCaseIds();

      if (assignedIds.length === 0) {
        setSections([]);
        return;
      }

      // Load all cases
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
          customers (
            id,
            full_name
          )
        `)
        .in('id', assignedIds)
        .order('created_at', { ascending: false });

      if (casesError) throw casesError;

      const casesList = casesData || [];
      const now = new Date();

      const calculateSection = (startDate: Date, endDate: Date, period: string): ReportSection => {
        const periodCases = casesList.filter((c: any) => {
          const createdAt = new Date(c.created_at);
          return createdAt >= startDate && createdAt <= endDate;
        });

        const totalCustomers = periodCases.length;
        const activeCases = periodCases.filter((c: any) => c.status === 'active').length;
        const completedCases = periodCases.filter((c: any) => c.status === 'completed').length;
        const newCustomers = periodCases.length;

        // Calculate monthly customers for chart
        const monthlyData: { month: string; customers: number }[] = [];
        const monthsToShow = period === '1 Aylık' ? 1 : period === '3 Aylık' ? 3 : 12;
        
        for (let i = monthsToShow - 1; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
          const monthCustomers = periodCases.filter((c: any) => {
            const createdAt = new Date(c.created_at);
            return createdAt >= monthDate && createdAt <= monthEnd;
          }).length;
          monthlyData.push({
            month: monthDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
            customers: monthCustomers,
          });
        }

        // Prepare customer list
        const customersList = periodCases.map((caseItem: any) => ({
          id: caseItem.customers?.id || '',
          case_id: caseItem.id || '',
          full_name: caseItem.customers?.full_name || '',
          assigned_lawyer: caseItem.assigned_lawyer || null,
          status: caseItem.status || 'active',
          board_stage: caseItem.board_stage || 'basvuru_alindi',
          start_date: caseItem.start_date || caseItem.created_at,
        }));

        return {
          period,
          totalCustomers,
          activeCases,
          completedCases,
          newCustomers,
          monthlyCustomers: monthlyData,
          customers: customersList,
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

      console.log('Admin Report: Data loaded successfully', sectionsData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Error loading admin report:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusType = (status: string, boardStage: string, caseItem?: any): string => {
    if (caseItem && checkCaseCompleted(caseItem)) return 'completed';
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
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Toplam Getirilen Müşteri</p>
                <p className="text-2xl font-bold text-neutral-800">{section.totalCustomers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Aktif Dosya</p>
                <p className="text-2xl font-bold text-neutral-800">{section.activeCases}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
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
                <UserPlus className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Yeni Müşteri</p>
                <p className="text-2xl font-bold text-neutral-800">{section.newCustomers}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Customers Chart */}
        {section.monthlyCustomers.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Aylık Getirilen Müşteri Trendi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={section.monthlyCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" fill="#2563eb" name="Müşteri Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Customer List Table */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">Müşteri Listesi</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Müşteri Adı</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Hangi Avukata Atandı</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Dosya Durumu</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Başlangıç Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {section.customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-neutral-500">Müşteri bulunamadı</td>
                  </tr>
                ) : (
                  section.customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-neutral-100">
                      <td className="py-3 px-4">{customer.full_name}</td>
                      <td className="py-3 px-4">
                        {customer.assigned_lawyer || <span className="text-neutral-400">Atanmamış</span>}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={getStatusType(customer.status, customer.board_stage, { id: customer.case_id, board_stage: customer.board_stage })} />
                      </td>
                      <td className="py-3 px-4">
                        {new Date(customer.start_date).toLocaleDateString('tr-TR')}
                      </td>
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
        <p className="text-neutral-600 mt-1">Admin Performans Raporu</p>
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
