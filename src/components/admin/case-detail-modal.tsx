'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GeneralInfoTab } from './case-tabs/general-info-tab';
import { DocumentsTab } from './case-tabs/documents-tab';
import { ChecklistTab } from './case-tabs/checklist-tab';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface CaseDetailModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'documents' | 'checklist';

export function CaseDetailModal({ caseId, isOpen, onClose }: CaseDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCaseData = useCallback(async () => {
    if (!caseId) return;
    
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          customers (*)
        `)
        .eq('id', caseId)
        .single();

      if (error) throw error;
      setCaseData(data);
    } catch (error) {
      console.error('Error loading case data:', error);
      alert('Dosya bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (isOpen && caseId) {
      setLoading(true);
      setCaseData(null);
      setActiveTab('general');
      loadCaseData();
    }
  }, [isOpen, caseId, loadCaseData]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">
              {caseData?.case_number || 'Dosya Detayı'}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {caseData?.customers?.full_name || 'Müşteri bilgileri yükleniyor...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 flex-shrink-0">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-neutral-600">Yükleniyor...</div>
            </div>
          ) : caseData ? (
            <>
              {activeTab === 'general' && (
                <GeneralInfoTab caseData={caseData} onUpdate={loadCaseData} />
              )}
              {activeTab === 'documents' && (
                <DocumentsTab caseId={caseId} caseData={caseData} onUpdate={loadCaseData} />
              )}
              {activeTab === 'checklist' && (
                <ChecklistTab caseId={caseId} onUpdate={loadCaseData} />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-600">Dosya bilgileri yüklenemedi</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-neutral-200 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}
