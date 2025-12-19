'use client';

import { useState, useEffect } from 'react';
import { CaseCard } from './case-card';
import { supabase } from '@/lib/supabase/client';

export interface CaseData {
  id: string;
  case_number: string;
  customer: {
    id: string;
    full_name: string;
    phone: string | null;
    email: string;
  };
  vehicle_plate: string;
  vehicle_brand_model: string;
  board_stage: string;
  status: string;
  assigned_lawyer: string | null;
  value_loss_amount: number | null;
  fault_rate: number | null;
  created_at: string;
}

const BOARD_STAGES = [
  { key: 'basvuru_alindi', label: 'Başvuru Alındı', emoji: '📝', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
  { key: 'ilk_gorusme', label: 'İlk Görüşme', emoji: '👋', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700' },
  { key: 'evrak_ekspertiz', label: 'Evrak Toplama ve Ekspertiz', emoji: '📋', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
  { key: 'sigorta_basvurusu', label: 'Sigorta Başvurusu', emoji: '📮', color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-700' },
  { key: 'muzakere', label: 'Müzakere', emoji: '🤝', color: 'bg-pink-50 border-pink-200', textColor: 'text-pink-700' },
  { key: 'odeme', label: 'Ödeme', emoji: '💰', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
  { key: 'tamamlandi', label: 'Tamamlandı', emoji: '✅', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
];

export function AdminBoard() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCase, setDraggedCase] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
    
    // Real-time subscription for cases
    const casesChannel = supabase
      .channel('cases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
        },
        () => {
          loadCases();
        }
      )
      .subscribe();

    // Real-time subscription for admin_checklist (to update board when checklist changes)
    const checklistChannel = supabase
      .channel('checklist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_checklist',
        },
        () => {
          loadCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(casesChannel);
      supabase.removeChannel(checklistChannel);
    };
  }, []);

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          case_number,
          vehicle_plate,
          vehicle_brand_model,
          board_stage,
          status,
          assigned_lawyer,
          value_loss_amount,
          fault_rate,
          created_at,
          customers (
            id,
            full_name,
            phone,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCases: CaseData[] = (data || []).map((caseItem: any) => ({
        id: caseItem.id,
        case_number: caseItem.case_number,
        customer: {
          id: caseItem.customers.id,
          full_name: caseItem.customers.full_name,
          phone: caseItem.customers.phone,
          email: caseItem.customers.email,
        },
        vehicle_plate: caseItem.vehicle_plate,
        vehicle_brand_model: caseItem.vehicle_brand_model,
        board_stage: caseItem.board_stage || 'basvuru_alindi',
        status: caseItem.status,
        assigned_lawyer: caseItem.assigned_lawyer,
        value_loss_amount: caseItem.value_loss_amount,
        fault_rate: caseItem.fault_rate,
        created_at: caseItem.created_at,
      }));

      setCases(formattedCases);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (caseId: string) => {
    setDraggedCase(caseId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStage: string) => {
    if (!draggedCase) return;

    try {
      const { error } = await supabase
        .from('cases')
        .update({ board_stage: targetStage })
        .eq('id', draggedCase);

      if (error) throw error;

      // Update local state
      setCases((prevCases) =>
        prevCases.map((caseItem) =>
          caseItem.id === draggedCase
            ? { ...caseItem, board_stage: targetStage }
            : caseItem
        )
      );
    } catch (error) {
      console.error('Error updating case stage:', error);
    } finally {
      setDraggedCase(null);
    }
  };

  const getCasesForStage = (stageKey: string) => {
    return cases.filter((caseItem) => caseItem.board_stage === stageKey);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden p-6">
      <div className="flex gap-4 h-full min-w-max">
        {BOARD_STAGES.map((stage) => {
          const stageCases = getCasesForStage(stage.key);
          return (
            <div
              key={stage.key}
              className={`flex-shrink-0 w-80 ${stage.color} rounded-lg p-4 flex flex-col h-full border-2`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="mb-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{stage.emoji}</span>
                  <h3 className={`font-bold ${stage.textColor} text-lg`}>{stage.label}</h3>
                </div>
                <span className={`text-sm ${stage.textColor} opacity-75`}>
                  {stageCases.length} dosya
                </span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageCases.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-sm">
                    Bu aşamada dosya yok
                  </div>
                ) : (
                  stageCases.map((caseItem) => (
                    <CaseCard
                      key={caseItem.id}
                      caseData={caseItem}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
