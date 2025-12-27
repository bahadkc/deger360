'use client';

import { useState, useEffect } from 'react';
import { AdminBoard } from '@/components/admin/admin-board';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { getAssignedCaseIds, isSuperAdmin } from '@/lib/supabase/admin-auth';
import { CHECKLIST_ITEMS } from '@/lib/checklist-sections';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const superAdmin = await isSuperAdmin();
      let assignedIds: string[] = [];
      
      if (!superAdmin) {
        assignedIds = await getAssignedCaseIds();
      }

      // Build query based on admin assignment - need board_stage and checklist data
      let casesQuery = supabase
        .from('cases')
        .select('id, status, board_stage');
      
      if (!superAdmin && assignedIds.length > 0) {
        casesQuery = casesQuery.in('id', assignedIds);
      } else if (!superAdmin && assignedIds.length === 0) {
        setStats({
          totalCases: 0,
          activeCases: 0,
          completedCases: 0,
        });
        return;
      }

      const { data: casesData, error: casesError } = await casesQuery;
      if (casesError) throw casesError;

      // Load checklist data for all cases
      const caseIds = (casesData || []).map((c: any) => c.id);
      const { data: checklistData } = await supabase
        .from('admin_checklist')
        .select('case_id, task_key, completed')
        .in('case_id', caseIds.length > 0 ? caseIds : ['00000000-0000-0000-0000-000000000000']); // Dummy ID if no cases

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

      const cases = casesData || [];
      const totalCases = cases.length;
      const completedCases = cases.filter((c: any) => checkCaseCompleted(c)).length;
      const activeCases = totalCases - completedCases;

      setStats({
        totalCases,
        activeCases,
        completedCases,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Stats Cards - Compact Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Süreç Yönetimi</h1>
            <p className="text-sm text-neutral-600">Tüm dosyaları ve süreçleri yönetin</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl">📁</div>
            <div>
              <p className="text-xs text-neutral-600">Toplam Dosya</p>
              <p className="text-xl font-bold text-blue-700">
                {loading ? '...' : stats.totalCases}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl">⚡</div>
            <div>
              <p className="text-xs text-neutral-600">Aktif</p>
              <p className="text-xl font-bold text-green-700">
                {loading ? '...' : stats.activeCases}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl">✅</div>
            <div>
              <p className="text-xs text-neutral-600">Tamamlanan</p>
              <p className="text-xl font-bold text-purple-700">
                {loading ? '...' : stats.completedCases}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Board View - Full Height Scrollable */}
      <div className="flex-1 overflow-hidden">
        <AdminBoard />
      </div>
    </div>
  );
}
