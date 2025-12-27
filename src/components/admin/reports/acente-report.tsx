'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AdminUser } from '@/lib/supabase/admin-auth';
import { supabase } from '@/lib/supabase/client';
import { getAssignedCaseIds } from '@/lib/supabase/admin-auth';
import { StatusBadge } from './common/status-badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, CheckCircle, UserPlus } from 'lucide-react';
import { CHECKLIST_ITEMS } from '@/lib/checklist-sections';

interface ReportSection {
  period: string;
  totalCustomers: number;
  activeCases: number;
  completedCases: number;
  newCustomers: number;
  totalEarnings: number;
  thisPeriodEarnings: number;
  monthlyEarnings: { month: string; earnings: number }[];
  customers: {
    id: string;
    full_name: string;
    dosya_takip_numarasi: string;
    status: string;
    board_stage: string;
    start_date: string;
    estimated_earnings: number;
  }[];
}

export function AcenteReport({ adminUser }: { adminUser: AdminUser }) {
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [sections, setSections] = useState<ReportSection[]>([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const assignedIds = await getAssignedCaseIds();

      if (assignedIds.length === 0) {
        setTotalEarnings(0);
        setTotalCustomers(0);
        setSections([]);
        return;
      }

      // Load all cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select(`
          id,
          status,
          board_stage,
          created_at,
          start_date,
          customers (
            id,
            full_name,
            dosya_takip_numarasi
          )
        `)
        .in('id', assignedIds)
        .order('created_at', { ascending: false });

      if (casesError) throw casesError;

      // Load checklist data
      const { data: checklistData } = await supabase
        .from('admin_checklist')
        .select('case_id, task_key, completed')
        .in('case_id', assignedIds.length > 0 ? assignedIds : ['00000000-0000-0000-0000-000000000000']);

      setChecklistList(checklistData || []);
      const cases = casesData || [];
      const now = new Date();
      const estimatedEarningsPerCustomer = 15000;

      // Calculate total earnings (15000 * total customers)
      const totalCustomersCount = cases.length;
      const totalEarningsValue = totalCustomersCount * estimatedEarningsPerCustomer;

      setTotalCustomers(totalCustomersCount);
      setTotalEarnings(totalEarningsValue);

      // Prepare customer list for all periods
      const allCustomers = cases.map((caseItem: any) => ({
        id: caseItem.customers?.id || '',
        full_name: caseItem.customers?.full_name || '',
        dosya_takip_numarasi: caseItem.customers?.dosya_takip_numarasi || '',
        status: caseItem.status || 'active',
        board_stage: caseItem.board_stage || 'basvuru_alindi',
        start_date: caseItem.start_date || caseItem.created_at,
        estimated_earnings: estimatedEarningsPerCustomer,
      }));

      // Calculate sections: 1 month, 3 months, 1 year
      const sectionsData: ReportSection[] = [];

      // 1 Month Section
      const oneMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const oneMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const oneMonthCases = cases.filter((c: any) => {
        const createdAt = new Date(c.created_at);
        return createdAt >= oneMonthStart && createdAt <= oneMonthEnd;
      });
      const oneMonthCustomers = oneMonthCases.map((caseItem: any) => ({
        id: caseItem.customers?.id || '',
        case_id: caseItem.id,
        full_name: caseItem.customers?.full_name || '',
        dosya_takip_numarasi: caseItem.customers?.dosya_takip_numarasi || '',
        status: caseItem.status || 'active',
        board_stage: caseItem.board_stage || 'basvuru_alindi',
        start_date: caseItem.start_date || caseItem.created_at,
        estimated_earnings: estimatedEarningsPerCustomer,
      }));

      // Calculate monthly earnings for 1 month (just this month)
      const oneMonthMonthly: { month: string; earnings: number }[] = [];
      const monthDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const monthCustomers = cases.filter((c: any) => {
        const createdAt = new Date(c.created_at);
        return createdAt >= monthDate && createdAt <= monthEnd;
      }).length;
      oneMonthMonthly.push({
        month: monthDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        earnings: monthCustomers * estimatedEarningsPerCustomer,
      });

      sectionsData.push({
        period: '1 Aylık',
        totalCustomers: oneMonthCases.length,
        activeCases: oneMonthCases.filter((c: any) => c.status === 'active').length,
        completedCases: oneMonthCases.filter((c: any) => c.status === 'completed').length,
        newCustomers: oneMonthCases.length,
        totalEarnings: oneMonthCases.length * estimatedEarningsPerCustomer,
        thisPeriodEarnings: oneMonthCases.length * estimatedEarningsPerCustomer,
        monthlyEarnings: oneMonthMonthly,
        customers: oneMonthCustomers,
      });

      // 3 Months Section
      const threeMonthsStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const threeMonthsEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const threeMonthsCases = cases.filter((c: any) => {
        const createdAt = new Date(c.created_at);
        return createdAt >= threeMonthsStart && createdAt <= threeMonthsEnd;
      });
      const threeMonthsCustomers = threeMonthsCases.map((caseItem: any) => ({
        id: caseItem.customers?.id || '',
        full_name: caseItem.customers?.full_name || '',
        dosya_takip_numarasi: caseItem.customers?.dosya_takip_numarasi || '',
        status: caseItem.status || 'active',
        board_stage: caseItem.board_stage || 'basvuru_alindi',
        start_date: caseItem.start_date || caseItem.created_at,
        estimated_earnings: estimatedEarningsPerCustomer,
      }));

      // Calculate monthly earnings for 3 months
      const threeMonthsMonthly: { month: string; earnings: number }[] = [];
      for (let i = 2; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const monthCustomers = cases.filter((c: any) => {
          const createdAt = new Date(c.created_at);
          return createdAt >= monthDate && createdAt <= monthEnd;
        }).length;
        threeMonthsMonthly.push({
          month: monthDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
          earnings: monthCustomers * estimatedEarningsPerCustomer,
        });
      }

      sectionsData.push({
        period: '3 Aylık',
        totalCustomers: threeMonthsCases.length,
        activeCases: threeMonthsCases.filter((c: any) => c.status === 'active').length,
        completedCases: threeMonthsCases.filter((c: any) => c.status === 'completed').length,
        newCustomers: threeMonthsCases.length,
        totalEarnings: threeMonthsCases.length * estimatedEarningsPerCustomer,
        thisPeriodEarnings: threeMonthsCases.length * estimatedEarningsPerCustomer,
        monthlyEarnings: threeMonthsMonthly,
        customers: threeMonthsCustomers,
      });

      // 1 Year Section
      const oneYearStart = new Date(now.getFullYear(), 0, 1);
      const oneYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      const oneYearCases = cases.filter((c: any) => {
        const createdAt = new Date(c.created_at);
        return createdAt >= oneYearStart && createdAt <= oneYearEnd;
      });
      const oneYearCustomers = oneYearCases.map((caseItem: any) => ({
        id: caseItem.customers?.id || '',
        full_name: caseItem.customers?.full_name || '',
        dosya_takip_numarasi: caseItem.customers?.dosya_takip_numarasi || '',
        status: caseItem.status || 'active',
        board_stage: caseItem.board_stage || 'basvuru_alindi',
        start_date: caseItem.start_date || caseItem.created_at,
        estimated_earnings: estimatedEarningsPerCustomer,
      }));

      // Calculate monthly earnings for 1 year (last 12 months)
      const oneYearMonthly: { month: string; earnings: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const monthCustomers = cases.filter((c: any) => {
          const createdAt = new Date(c.created_at);
          return createdAt >= monthDate && createdAt <= monthEnd;
        }).length;
        oneYearMonthly.push({
          month: monthDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
          earnings: monthCustomers * estimatedEarningsPerCustomer,
        });
      }

      sectionsData.push({
        period: '1 Yıllık',
        totalCustomers: oneYearCases.length,
        activeCases: oneYearCases.filter((c: any) => c.status === 'active').length,
        completedCases: oneYearCases.filter((c: any) => c.status === 'completed').length,
        newCustomers: oneYearCases.length,
        totalEarnings: oneYearCases.length * estimatedEarningsPerCustomer,
        thisPeriodEarnings: oneYearCases.length * estimatedEarningsPerCustomer,
        monthlyEarnings: oneYearMonthly,
        customers: oneYearCustomers,
      });

      console.log('Acente Report: Data loaded successfully', sectionsData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Error loading acente report:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusType = (status: string, boardStage: string, caseItem?: any): string => {
    // Check if case is completed (board_stage or checklist)
    if (caseItem && checkCaseCompleted(caseItem)) return 'completed';
    if (boardStage === 'tamamlandi') return 'completed';
    if (boardStage === 'odeme' || boardStage === 'muzakere') return 'in_progress';
    return 'pending';
  };

  const renderSection = (section: ReportSection) => (
    <div key={section.period} className="space-y-6">
      <div className="border-t-4 border-primary-blue pt-6">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">{section.period} Rapor</h2>

        {/* 4 Small Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Toplam Gönderilen Müşteri</p>
                <p className="text-xl font-bold text-neutral-800">{section.totalCustomers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Aktif Dosya</p>
                <p className="text-xl font-bold text-neutral-800">{section.activeCases}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Tamamlanan Dosya</p>
                <p className="text-xl font-bold text-neutral-800">{section.completedCases}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-600">Yeni Müşteri</p>
                <p className="text-xl font-bold text-neutral-800">{section.newCustomers}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Earnings Chart */}
        {section.monthlyEarnings.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Aylık Kazanç Trendi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={section.monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString('tr-TR')} TL`} />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="#2563eb" strokeWidth={2} name="Kazanç (TL)" />
              </LineChart>
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
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Dosya Durumu</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Başlangıç Tarihi</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Tahmini Gelir</th>
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
                      <StatusBadge status={getStatusType(customer.status, customer.board_stage, { id: customer.case_id, board_stage: customer.board_stage })} />
                    </td>
                      <td className="py-3 px-4">
                        {new Date(customer.start_date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {customer.estimated_earnings.toLocaleString('tr-TR')} TL
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
        <p className="text-neutral-600 mt-1">Acente Performans Raporu</p>
      </div>

      {/* Top Total Earnings Card */}
      <Card className="p-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="text-center">
          <p className="text-sm text-green-700 font-medium mb-2">Toplam Kazanılan Para</p>
          <p className="text-5xl font-bold text-green-900">
            {loading ? '...' : `${totalEarnings.toLocaleString('tr-TR')} TL`}
          </p>
          <p className="text-sm text-green-600 mt-2">
            {totalCustomers} müşteri × 15.000 TL
          </p>
        </div>
      </Card>

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
