'use client';

import { useState, useEffect } from 'react';
import { AdminBoard } from '@/components/admin/admin-board';
import { Card } from '@/components/ui/card';

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
      // Use API route to bypass RLS
      const response = await fetch('/api/get-dashboard-stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching dashboard stats:', errorData.error || response.statusText);
        setStats({
          totalCases: 0,
          activeCases: 0,
          completedCases: 0,
        });
        return;
      }

      const data = await response.json();
      setStats(data.stats || {
        totalCases: 0,
        activeCases: 0,
        completedCases: 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStats({
        totalCases: 0,
        activeCases: 0,
        completedCases: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Stats Cards - Compact Header */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Süreç Yönetimi</h1>
            <p className="text-xs sm:text-sm text-neutral-600">Tüm dosyaları ve süreçleri yönetin</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
