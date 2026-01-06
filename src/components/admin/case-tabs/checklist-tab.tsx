'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { canEdit } from '@/lib/supabase/admin-auth';
import {
  CHECKLIST_SECTIONS,
  CHECKLIST_ITEMS,
  isSectionCompleted,
  getCurrentSection,
  ChecklistSection,
} from '@/lib/checklist-sections';
import { DateDisplay } from '@/components/ui/date-display';

interface ChecklistTabProps {
  caseId: string;
  onUpdate: () => void;
}

interface ChecklistItem {
  id: string;
  task_key: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
}

export function ChecklistTab({ caseId, onUpdate }: ChecklistTabProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEditData, setCanEditData] = useState(false);

  const loadChecklist = useCallback(async () => {
    try {
      // Use API route to bypass RLS
      const response = await fetch(`/api/get-checklist?caseId=${caseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load checklist');
      }

      const data = await response.json();
      setChecklist(data.checklist || []);
    } catch (error) {
      console.error('Error loading checklist:', error);
      setChecklist([]);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadChecklist();
    const checkPermissions = async () => {
      const editPermission = await canEdit();
      setCanEditData(editPermission);
    };
    checkPermissions();

    // Note: Real-time subscriptions removed - using API routes instead
    // If needed, can be re-added with proper authentication
  }, [caseId, loadChecklist]);


  // Section advancement is now handled by the API route

  const toggleItem = async (taskKey: string, currentCompleted: boolean) => {
    if (!canEditData) {
      alert('Bu işlem için yetkiniz bulunmamaktadır.');
      return;
    }

    try {
      // Use API route to update checklist
      const response = await fetch('/api/update-checklist', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          taskKey,
          completed: !currentCompleted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update checklist');
      }

      const data = await response.json();

      // Reload checklist to get updated data
      await loadChecklist();

      // Update board stage if changed (API already updated it)
      if (data.boardStage) {
        onUpdate();
      }

      onUpdate();
    } catch (error: any) {
      console.error('Error toggling checklist item:', error);
      alert(`Görev durumu güncellenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentSection = getCurrentSection(checklist);

  // Her section için item'ları filtrele
  const getSectionItems = (section: ChecklistSection): ChecklistItem[] => {
    return checklist.filter((item) => section.taskKeys.includes(item.task_key));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary-blue to-primary-orange text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">İlerleme Durumu</h3>
            <p className="text-sm opacity-90">
              {completedCount} / {totalCount} görev tamamlandı
            </p>
            {currentSection && (
              <p className="text-sm opacity-90 mt-1">
                Mevcut Aşama: {currentSection.emoji} {currentSection.title}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{progressPercentage}%</div>
          </div>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-4">
          <div
            className="bg-white h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </Card>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {CHECKLIST_SECTIONS.map((section) => {
          const sectionItems = getSectionItems(section);
          const sectionCompleted = isSectionCompleted(section, checklist.map((item) => ({ task_key: item.task_key, completed: item.completed })));
          const sectionCompletedCount = sectionItems.filter((item) => item.completed).length;
          const sectionTotalCount = sectionItems.length;
          const isCurrentSection = currentSection?.id === section.id;

          return (
            <Card
              key={section.id}
              className={`p-6 border-2 ${
                sectionCompleted
                  ? 'bg-green-50 border-green-300'
                  : isCurrentSection
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.emoji}</span>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-800">{section.title}</h3>
                    <p className="text-sm text-neutral-600">
                      {sectionCompletedCount} / {sectionTotalCount} görev tamamlandı
                    </p>
                  </div>
                </div>
                {sectionCompleted && (
                  <div className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                    ✓ Tamamlandı
                  </div>
                )}
                {isCurrentSection && !sectionCompleted && (
                  <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                    🔄 Devam Ediyor
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {sectionItems.map((item) => (
                  <div
                    key={item.task_key}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      canEditData ? 'hover:bg-white cursor-pointer' : 'cursor-not-allowed opacity-75'
                    }`}
                    onClick={() => {
                      if (canEditData) {
                        toggleItem(item.task_key, item.completed);
                      }
                    }}
                  >
                    <button className="flex-shrink-0">
                      {item.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-neutral-300" />
                      )}
                    </button>
                    <div className="flex-1">
                      <span
                        className={`${
                          item.completed
                            ? 'text-neutral-500 line-through'
                            : 'text-neutral-800 font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.completed && item.completed_at && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Tamamlandı: <DateDisplay date={item.completed_at} format="date" />
                          {item.completed_by && ` - ${item.completed_by}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
