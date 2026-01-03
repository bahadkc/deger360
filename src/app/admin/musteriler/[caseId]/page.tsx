'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneralInfoTab } from '@/components/admin/case-tabs/general-info-tab';
import { DocumentsTab } from '@/components/admin/case-tabs/documents-tab';
import { ChecklistTab } from '@/components/admin/case-tabs/checklist-tab';
import { cn } from '@/lib/utils';
import { adminRoutes } from '@/lib/config/admin-paths';

type TabType = 'general' | 'documents' | 'checklist';

export default function MusteriDetayPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;
  
  console.log('MusteriDetayPage rendered, caseId:', caseId);
  
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCaseData = useCallback(async () => {
    if (!caseId) {
      console.warn('loadCaseData called but no caseId');
      return;
    }
    
    console.log('Loading case data for caseId:', caseId);
    try {
      // Use API route to bypass RLS
      const response = await fetch(`/api/get-case/${caseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData.error || response.statusText);
        
        // If unauthorized, don't throw - let layout handle it
        if (response.status === 401) {
          console.warn('Unauthorized - layout will handle redirect');
          setLoading(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to load case data');
      }

      const data = await response.json();
      console.log('Case data loaded:', data.case);
      setCaseData(data.case);
    } catch (error) {
      console.error('Error loading case data:', error);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    console.log('useEffect triggered, caseId:', caseId);
    if (caseId) {
      loadCaseData();
    } else {
      console.warn('No caseId found in params');
    }
  }, [caseId, loadCaseData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">Dosya bulunamadı</p>
          <Button onClick={() => router.push(adminRoutes.customers)}>
            Müşteriler Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(adminRoutes.customers)}
              className="w-fit"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Geri</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-800 truncate">
                {caseData.case_number || 'Dosya Detayı'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 truncate">
                {caseData.customers?.full_name || 'Müşteri bilgileri'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              'px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-xs sm:text-base whitespace-nowrap',
              activeTab === 'general'
                ? 'text-primary-blue border-b-2 border-primary-blue'
                : 'text-neutral-600 hover:text-neutral-800'
            )}
          >
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={cn(
              'px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-xs sm:text-base whitespace-nowrap',
              activeTab === 'documents'
                ? 'text-primary-blue border-b-2 border-primary-blue'
                : 'text-neutral-600 hover:text-neutral-800'
            )}
          >
            Dökümanlar
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={cn(
              'px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-xs sm:text-base whitespace-nowrap',
              activeTab === 'checklist'
                ? 'text-primary-blue border-b-2 border-primary-blue'
                : 'text-neutral-600 hover:text-neutral-800'
            )}
          >
            Yapılacaklar Listesi
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === 'general' && (
          <GeneralInfoTab caseData={caseData} onUpdate={loadCaseData} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab caseId={caseId} caseData={caseData} onUpdate={loadCaseData} />
        )}
        {activeTab === 'checklist' && (
          <ChecklistTab caseId={caseId} onUpdate={loadCaseData} />
        )}
      </div>
    </div>
  );
}
