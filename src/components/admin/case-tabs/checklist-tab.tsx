'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { canEdit } from '@/lib/supabase/admin-auth';
import {
  CHECKLIST_SECTIONS,
  CHECKLIST_ITEMS,
  isSectionCompleted,
  getCurrentSection,
} from '@/lib/checklist-sections';

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

  useEffect(() => {
    loadChecklist();
    const checkPermissions = async () => {
      const editPermission = await canEdit();
      setCanEditData(editPermission);
    };
    checkPermissions();

    // Real-time subscription for admin_checklist changes
    const checklistChannel = supabase
      .channel(`checklist_changes_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_checklist',
          filter: `case_id=eq.${caseId}`,
        },
        () => {
          loadChecklist();
        }
      )
      .subscribe();

    // Real-time subscription for cases table (board_stage changes)
    const caseChannel = supabase
      .channel(`case_changes_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
          filter: `id=eq.${caseId}`,
        },
        () => {
          // Board stage değiştiğinde checklist'i yeniden yükle
          loadChecklist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(checklistChannel);
      supabase.removeChannel(caseChannel);
    };
  }, [caseId]);

  const loadChecklist = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_checklist')
        .select('*')
        .eq('case_id', caseId);

      if (error) throw error;

      // Merge with default checklist items
      const mergedChecklist = CHECKLIST_ITEMS.map((item) => {
        const existing = data?.find((c) => c.task_key === item.key);
        return existing || {
          id: '',
          task_key: item.key,
          title: item.title,
          completed: false,
          completed_at: null,
          completed_by: null,
        };
      });

      setChecklist(mergedChecklist);
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };


  // Section tamamlandığında bir sonraki sectiona geçiş yap
  const checkAndAdvanceSection = async (checklistItems: ChecklistItem[]) => {
    try {
      // Mevcut section'ı bul
      const currentSectionIndex = CHECKLIST_SECTIONS.findIndex(
        (section) => !isSectionCompleted(section, checklistItems.map((item) => ({ task_key: item.task_key, completed: item.completed })))
      );

      // Eğer tüm sectionlar tamamlandıysa, son section'a geç
      if (currentSectionIndex === -1) {
        const lastSection = CHECKLIST_SECTIONS[CHECKLIST_SECTIONS.length - 1];
        const { error } = await supabase
          .from('cases')
          .update({ board_stage: lastSection.boardStage })
          .eq('id', caseId);
        if (error) console.error('Error updating board stage:', error);
        return;
      }

      // Mevcut section'dan önceki sectionları kontrol et
      // Eğer bir önceki section tamamlandıysa ve mevcut section tamamlanmamışsa,
      // mevcut section'a geç
      if (currentSectionIndex > 0) {
        const previousSection = CHECKLIST_SECTIONS[currentSectionIndex - 1];
        const currentSection = CHECKLIST_SECTIONS[currentSectionIndex];
        
        // Önceki section tamamlandıysa, mevcut section'a geç
        if (isSectionCompleted(previousSection, checklistItems.map((item) => ({ task_key: item.task_key, completed: item.completed })))) {
          const { error } = await supabase
            .from('cases')
            .update({ board_stage: currentSection.boardStage })
            .eq('id', caseId);

          if (error) {
            console.error('Error updating board stage:', error);
          }
        }
      } else {
        // İlk section ise, eğer tamamlandıysa bir sonraki sectiona geç
        const firstSection = CHECKLIST_SECTIONS[0];
        if (isSectionCompleted(firstSection, checklistItems.map((item) => ({ task_key: item.task_key, completed: item.completed }))) && CHECKLIST_SECTIONS.length > 1) {
          const nextSection = CHECKLIST_SECTIONS[1];
          const { error } = await supabase
            .from('cases')
            .update({ board_stage: nextSection.boardStage })
            .eq('id', caseId);

          if (error) {
            console.error('Error updating board stage:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error checking section completion:', error);
    }
  };

  const toggleItem = async (taskKey: string, currentCompleted: boolean) => {
    try {
      const existingItem = checklist.find((item) => item.task_key === taskKey);

      if (existingItem?.id) {
        // Update existing
        const { error } = await supabase
          .from('admin_checklist')
          .update({
            completed: !currentCompleted,
            completed_at: !currentCompleted ? new Date().toISOString() : null,
            completed_by: !currentCompleted ? 'Admin' : null, // TODO: Get actual admin name
          })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from('admin_checklist').insert({
          case_id: caseId,
          task_key: taskKey,
          title: CHECKLIST_ITEMS.find((item) => item.key === taskKey)?.title || '',
          completed: true,
          completed_at: new Date().toISOString(),
          completed_by: 'Admin', // TODO: Get actual admin name
        });

        if (error) throw error;
      }

      await loadChecklist();
      
      // Yeni checklist'i al ve section kontrolü yap
      const { data: updatedChecklist } = await supabase
        .from('admin_checklist')
        .select('*')
        .eq('case_id', caseId);

      if (updatedChecklist) {
        const mergedChecklist = CHECKLIST_ITEMS.map((item) => {
          const existing = updatedChecklist.find((c) => c.task_key === item.key);
          return existing || {
            id: '',
            task_key: item.key,
            title: item.title,
            completed: false,
            completed_at: null,
            completed_by: null,
          };
        });

        // Section tamamlandı mı kontrol et ve ilerle
        await checkAndAdvanceSection(mergedChecklist);
      }

      onUpdate();
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      alert('Güncelleme sırasında bir hata oluştu');
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
                          Tamamlandı: {new Date(item.completed_at).toLocaleDateString('tr-TR')}
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
