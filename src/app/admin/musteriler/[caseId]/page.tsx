'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneralInfoTab } from '@/components/admin/case-tabs/general-info-tab';
import { DocumentsTab } from '@/components/admin/case-tabs/documents-tab';
import { ChecklistTab } from '@/components/admin/case-tabs/checklist-tab';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type TabType = 'general' | 'documents' | 'checklist';

export default function MusteriDetayPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;
  
  console.log('MusteriDetayPage rendered, caseId:', caseId);
  
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect triggered, caseId:', caseId);
    if (caseId) {
      loadCaseData();
    } else {
      console.warn('No caseId found in params');
    }
  }, [caseId]);

  const loadCaseData = async () => {
    if (!caseId) {
      console.warn('loadCaseData called but no caseId');
      return;
    }
    
    console.log('Loading case data for caseId:', caseId);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          customers (*)
        `)
        .eq('id', caseId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Case data loaded:', data);
      setCaseData(data);
    } catch (error) {
      console.error('Error loading case data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Button onClick={() => router.push('/admin/musteriler')}>
            Müşteriler Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/musteriler')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">
                {caseData.case_number || 'Dosya Detayı'}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                {caseData.customers?.full_name || 'Müşteri bilgileri'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              'px-6 py-4 font-medium transition-colors',
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
              'px-6 py-4 font-medium transition-colors',
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
              'px-6 py-4 font-medium transition-colors',
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
      <div className="flex-1 overflow-y-auto p-6">
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
