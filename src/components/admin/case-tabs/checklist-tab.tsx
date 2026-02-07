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

// Document category to checklist task key mapping
const DOCUMENT_TO_TASK_MAPPING: Record<string, string> = {
  'kaza_tespit_tutanagi': 'kaza_tespit_tutanagi',
  'arac_fotograflari': 'arac_fotograflari',
  'ruhsat': 'ruhsat_fotokopisi',
  'kimlik': 'kimlik_fotokopisi',
  'karsi_tarafin_ruhsati': 'karsi_tarafin_ruhsati_alindi',
  'karsi_tarafin_ehliyeti': 'karsi_tarafin_ehliyeti_alindi',
  'bilir_kisi_raporu': 'eksper_raporu_alindi',
  'bilirkisi_raporu': 'bilirkisi_rapor_hazirlandi',
  'hakem_karari': 'hakem_karari_dokumani_eklendi',
  // sigorta_odeme_dekontu is handled specially in upload-document route based on case board_stage
};

export function ChecklistTab({ caseId, onUpdate }: ChecklistTabProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEditData, setCanEditData] = useState(false);
  const [insuranceResponse, setInsuranceResponse] = useState<string | null>(null);
  const [boardStage, setBoardStage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [skippedCategories, setSkippedCategories] = useState<Set<string>>(new Set());

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
      setInsuranceResponse(data.insuranceResponse || null);
    } catch (error) {
      console.error('Error loading checklist:', error);
      setChecklist([]);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const loadDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/get-documents?caseId=${caseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);

      // Load skipped document categories
      const skippedResponse = await fetch(`/api/get-skipped-documents?caseId=${caseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (skippedResponse.ok) {
        const skippedData = await skippedResponse.json();
        setSkippedCategories(new Set(skippedData.categories || []));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
  }, [caseId]);

  // Sync documents with checklist items - only when documents are updated (not on manual checklist changes)
  const syncDocumentsWithChecklist = useCallback(async (currentDocuments: any[], currentChecklist: ChecklistItem[]) => {
    if (currentDocuments.length === 0 || currentChecklist.length === 0) return;

    const syncPromises: Promise<void>[] = [];

    // Check each document category and sync with checklist
    Object.entries(DOCUMENT_TO_TASK_MAPPING).forEach(([docCategory, taskKey]) => {
      const hasDocument = currentDocuments.some(doc => doc.category === docCategory);
      const checklistItem = currentChecklist.find(item => item.task_key === taskKey);
      
      if (checklistItem) {
        const shouldBeCompleted = hasDocument;
        const isCurrentlyCompleted = checklistItem.completed;

        // Only update if document exists and checklist item is not completed
        // This ensures we only check items when documents are added, not uncheck when manually unchecked
        if (hasDocument && !isCurrentlyCompleted) {
          syncPromises.push(
            fetch('/api/update-checklist', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                caseId,
                taskKey,
                completed: true,
              }),
            }).then(async (res) => {
              if (res.ok) {
                // Reload checklist after sync
                await loadChecklist();
              }
            }).catch(err => {
              console.error(`Error syncing ${taskKey}:`, err);
            })
          );
        }
      }
    });

    // Special handling for sigorta_odeme_dekontu - determine based on insurance_response
    const hasSigortaOdemeDekontu = currentDocuments.some(doc => doc.category === 'sigorta_odeme_dekontu');
    if (hasSigortaOdemeDekontu) {
      // Determine which checklist item to mark based on insurance_response
      const taskKeyForSigortaOdeme = insuranceResponse === 'rejected' 
        ? 'sigortanin_yaptigi_odeme_dekontu_tahkim'
        : 'sigortanin_yaptigi_odeme_dekontu_muzakere';
      
      const checklistItem = currentChecklist.find(item => item.task_key === taskKeyForSigortaOdeme);
      
      if (checklistItem && !checklistItem.completed) {
        syncPromises.push(
          fetch('/api/update-checklist', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              caseId,
              taskKey: taskKeyForSigortaOdeme,
              completed: true,
            }),
          }).then(async (res) => {
            if (res.ok) {
              // Reload checklist after sync
              await loadChecklist();
            }
          }).catch(err => {
            console.error(`Error syncing ${taskKeyForSigortaOdeme}:`, err);
          })
        );
      }
    }

    if (syncPromises.length > 0) {
      await Promise.all(syncPromises);
      onUpdate();
    }
  }, [caseId, insuranceResponse, loadChecklist, onUpdate]);

  useEffect(() => {
    loadChecklist();
    loadDocuments();
    const checkPermissions = async () => {
      const editPermission = await canEdit();
      setCanEditData(editPermission);
    };
    checkPermissions();

    // Listen for document updates from other tabs
    const handleDocumentUpdate = async () => {
      // Reload documents and skipped categories
      await loadDocuments();
      
      // Reload checklist to get current state
      await loadChecklist();
    };
    
    // Listen for custom event when documents are updated
    window.addEventListener('documents-updated', handleDocumentUpdate);

    return () => {
      window.removeEventListener('documents-updated', handleDocumentUpdate);
    };
  }, [caseId, loadChecklist, loadDocuments]);


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

  const handleInsuranceResponseToggle = async (taskKey: string, currentCompleted: boolean) => {
    if (!canEditData) {
      alert('Bu işlem için yetkiniz bulunmamaktadır.');
      return;
    }

    const isAcceptedItem = taskKey === 'sigortadan_kabul_cevabi_geldi';
    const isRejectedItem = taskKey === 'sigortadan_red_cevabi_geldi';
    
    if (!isAcceptedItem && !isRejectedItem) {
      // Not an insurance response item, use normal toggle
      toggleItem(taskKey, currentCompleted);
      return;
    }

    try {
      const newCompleted = !currentCompleted;
      let newResponse: 'accepted' | 'rejected' | null = null;
      let otherTaskKey: string | null = null;

      if (isAcceptedItem) {
        newResponse = newCompleted ? 'accepted' : null;
        otherTaskKey = 'sigortadan_red_cevabi_geldi';
      } else {
        newResponse = newCompleted ? 'rejected' : null;
        otherTaskKey = 'sigortadan_kabul_cevabi_geldi';
      }

      // If selecting one, unselect the other
      if (newCompleted && otherTaskKey) {
        // Unselect the other item
        await fetch('/api/update-checklist', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            caseId,
            taskKey: otherTaskKey,
            completed: false,
          }),
        });
      }

      // Update the clicked item
      const checklistResponse = await fetch('/api/update-checklist', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          taskKey,
          completed: newCompleted,
        }),
      });

      if (!checklistResponse.ok) {
        const errorData = await checklistResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update checklist');
      }

      // Update insurance_response in case and set board_stage
      const newBoardStage = newResponse === 'accepted' ? 'muzakere' : (newResponse === 'rejected' ? 'tahkim' : 'sigorta_basvurusu');
      
      const res = await fetch('/api/update-case', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          caseUpdates: {
            insurance_response: newResponse,
            board_stage: newBoardStage,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update insurance response');
      }

      // Reload checklist to get updated insurance response and board stage
      await loadChecklist();
      onUpdate();
    } catch (error: any) {
      console.error('Error updating insurance response:', error);
      alert(`Sigorta cevabı güncellenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  // Calculate progress percentage based on section-based system
  const calculateProgressPercentage = (checklistItems: ChecklistItem[], insuranceResponse: string | null): number => {
    const checklistData = checklistItems.map(item => ({ task_key: item.task_key, completed: item.completed }));
    let totalProgress = 0;

    // 1. Başvuru Alındı (0% -> 5%)
    const basvuruSection = CHECKLIST_SECTIONS.find(s => s.boardStage === 'basvuru_alindi');
    if (basvuruSection) {
      const basvuruItems = checklistData.filter(item => basvuruSection.taskKeys.includes(item.task_key));
      const basvuruCompleted = basvuruItems.filter(item => item.completed).length;
      const basvuruTotal = basvuruItems.length;
      if (basvuruTotal > 0) {
        totalProgress = (basvuruCompleted / basvuruTotal) * 5;
      }
    }

    // 2. Evrak Toplama ve Eksper (5% -> 20%)
    const evrakSection = CHECKLIST_SECTIONS.find(s => s.boardStage === 'evrak_ekspertiz');
    if (evrakSection) {
      const evrakItems = checklistData.filter(item => evrakSection.taskKeys.includes(item.task_key));
      const evrakCompleted = evrakItems.filter(item => item.completed).length;
      const evrakTotal = evrakItems.length;
      if (evrakTotal > 0) {
        const evrakProgress = (evrakCompleted / evrakTotal) * 15; // 15% range (5% to 20%)
        // Always calculate evrak progress from 5% base, regardless of başvuru completion
        totalProgress = Math.max(totalProgress, 5 + evrakProgress);
      }
    }

    // 3. Sigorta Başvurusu (20% -> 30%)
    const sigortaSection = CHECKLIST_SECTIONS.find(s => s.boardStage === 'sigorta_basvurusu');
    if (sigortaSection) {
      const basvuruYapildi = checklistData.find(item => item.task_key === 'sigorta_basvurusu_yapildi')?.completed || false;
      const kabulCevabi = checklistData.find(item => item.task_key === 'sigortadan_kabul_cevabi_geldi')?.completed || false;
      const redCevabi = checklistData.find(item => item.task_key === 'sigortadan_red_cevabi_geldi')?.completed || false;
      
      if (basvuruYapildi && (kabulCevabi || redCevabi)) {
        totalProgress = Math.max(totalProgress, 30); // Section completed
      } else if (basvuruYapildi) {
        totalProgress = Math.max(totalProgress, 25); // Başvuru yapıldı, halfway
      }
    }

    // 4. Müzakere or Tahkim (30% -> 50% -> 95%)
    // Only calculate if sigorta section is at least partially complete (reached 30%)
    if (totalProgress >= 30) {
      if (insuranceResponse === 'accepted') {
        // Müzakere path
        const odemeBekleniyor = checklistData.find(item => item.task_key === 'odeme_bekleniyor_muzakere')?.completed || false;
        const odemeAlindi = checklistData.find(item => item.task_key === 'odeme_alindi_muzakere')?.completed || false;
        
        if (odemeAlindi) {
          totalProgress = 95;
        } else if (odemeBekleniyor) {
          totalProgress = 50;
        }
      } else if (insuranceResponse === 'rejected') {
        // Tahkim path
        const tahkimSection = CHECKLIST_SECTIONS.find(s => s.boardStage === 'tahkim');
        if (tahkimSection) {
          const tahkimItems = checklistData.filter(item => tahkimSection.taskKeys.includes(item.task_key));
          const odemeBekleniyorTahkim = checklistData.find(item => item.task_key === 'odeme_bekleniyor_tahkim')?.completed || false;
          const odemeAlindiTahkim = checklistData.find(item => item.task_key === 'odeme_alindi_tahkim')?.completed || false;
          
          // Items before odeme_bekleniyor_tahkim: tahkime_basvuru_yapildi, bilirkisi_rapor_hazirlandi, tahkim_sonucu_belirlendi
          const beforeOdemeItems = tahkimItems.filter(item => 
            ['tahkime_basvuru_yapildi', 'bilirkisi_rapor_hazirlandi', 'tahkim_sonucu_belirlendi'].includes(item.task_key)
          );
          const beforeOdemeCompleted = beforeOdemeItems.filter(item => item.completed).length;
          const beforeOdemeTotal = beforeOdemeItems.length;
          
          if (odemeAlindiTahkim) {
            totalProgress = 95;
          } else if (odemeBekleniyorTahkim) {
            totalProgress = 50;
          } else if (beforeOdemeTotal > 0) {
            const tahkimProgress = 30 + (beforeOdemeCompleted / beforeOdemeTotal) * 20;
            totalProgress = Math.max(totalProgress, tahkimProgress);
          }
        }
      }
    }

    // 5. Ödeme (95% -> 100%)
    // Only calculate if müzakere/tahkim reached 95%
    if (totalProgress >= 95) {
      const odemeSection = CHECKLIST_SECTIONS.find(s => s.boardStage === 'odeme');
      if (odemeSection) {
        const odemeItems = checklistData.filter(item => odemeSection.taskKeys.includes(item.task_key));
        const odemeCompleted = odemeItems.filter(item => item.completed).length;
        const odemeTotal = odemeItems.length;
        if (odemeTotal > 0) {
          const odemeProgress = 95 + (odemeCompleted / odemeTotal) * 5;
          totalProgress = Math.max(totalProgress, odemeProgress);
        }
      }
    }

    // 6. Tamamlandı (100%)
    const tamamlandiSection = CHECKLIST_SECTIONS.find(s => s.boardStage === 'tamamlandi');
    if (tamamlandiSection) {
      const tamamlandiItems = checklistData.filter(item => tamamlandiSection.taskKeys.includes(item.task_key));
      const tamamlandiCompleted = tamamlandiItems.filter(item => item.completed).length;
      if (tamamlandiCompleted > 0) {
        totalProgress = 100;
      }
    }

    return Math.min(Math.round(totalProgress), 100);
  };

  // Filter out skipped document checklist items for progress calculation
  const getSkippedTaskKeys = () => {
    const skippedTaskKeys = new Set<string>();
    Object.entries(DOCUMENT_TO_TASK_MAPPING).forEach(([docCategory, taskKey]) => {
      if (skippedCategories.has(docCategory)) {
        skippedTaskKeys.add(taskKey);
      }
    });
    
    // Special handling for sigorta_odeme_dekontu - it maps to different task keys based on insurance response
    if (skippedCategories.has('sigorta_odeme_dekontu')) {
      if (insuranceResponse === 'accepted') {
        skippedTaskKeys.add('sigortanin_yaptigi_odeme_dekontu_muzakere');
      } else if (insuranceResponse === 'rejected') {
        skippedTaskKeys.add('sigortanin_yaptigi_odeme_dekontu_tahkim');
      } else {
        // If no response yet, add both possibilities
        skippedTaskKeys.add('sigortanin_yaptigi_odeme_dekontu_muzakere');
        skippedTaskKeys.add('sigortanin_yaptigi_odeme_dekontu_tahkim');
      }
    }
    
    return skippedTaskKeys;
  };

  const skippedTaskKeys = getSkippedTaskKeys();
  
  // Filter checklist to exclude skipped items for display and progress
  const visibleChecklist = checklist.filter((item) => !skippedTaskKeys.has(item.task_key));
  
  const progressPercentage = calculateProgressPercentage(visibleChecklist, insuranceResponse);
  const currentSection = getCurrentSection(visibleChecklist.map(item => ({ task_key: item.task_key, completed: item.completed })));
  
  // Calculate completed and total counts for display (excluding skipped items)
  const completedCount = visibleChecklist.filter((item) => item.completed).length;
  const totalCount = visibleChecklist.length;

  // Her section için item'ları filtrele ve sırala (skip edilen dökümanların checklist item'larını gizle)
  const getSectionItems = (section: ChecklistSection): ChecklistItem[] => {
    // Use the already calculated skippedTaskKeys from above
    const items = checklist.filter((item) => {
      // Include item if it's in the section and not corresponding to a skipped document
      return section.taskKeys.includes(item.task_key) && !skippedTaskKeys.has(item.task_key);
    });
    
    // Section'daki taskKeys sırasına göre sırala
    return items.sort((a, b) => {
      const indexA = section.taskKeys.indexOf(a.task_key);
      const indexB = section.taskKeys.indexOf(b.task_key);
      return indexA - indexB;
    });
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
          // Skip Müzakere section if insurance response is rejected (show only for accepted)
          if (section.boardStage === 'muzakere' && insuranceResponse !== 'accepted') {
            return null;
          }
          // Skip Tahkim section if insurance response is accepted (show only for rejected)
          if (section.boardStage === 'tahkim' && insuranceResponse !== 'rejected') {
            return null;
          }

          const sectionItems = getSectionItems(section);
          
          // Special handling for Sigorta Başvurusu section
          const isInsuranceSection = section.boardStage === 'sigorta_basvurusu';
          const sigortaBasvurusuYapildi = visibleChecklist.find(item => item.task_key === 'sigorta_basvurusu_yapildi')?.completed || false;
          
          let sectionCompleted = isSectionCompleted(section, visibleChecklist.map((item) => ({ task_key: item.task_key, completed: item.completed })));
          
          // Calculate section completed count - special handling for insurance section
          let sectionCompletedCount: number;
          let sectionTotalCount: number;
          
          if (isInsuranceSection) {
            // For insurance section: count only basvuru_yapildi + (kabul OR red) = max 2
            const basvuruCompleted = sigortaBasvurusuYapildi ? 1 : 0;
            const responseCompleted = insuranceResponse ? 1 : 0;
            sectionCompletedCount = basvuruCompleted + responseCompleted;
            sectionTotalCount = 2; // Always 2 for insurance section
          } else {
            sectionCompletedCount = sectionItems.filter((item) => item.completed).length;
            sectionTotalCount = sectionItems.length;
          }
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
                {sectionItems.map((item) => {
                  // Special styling for insurance response items
                  const isInsuranceResponseItem = isInsuranceSection && 
                    (item.task_key === 'sigortadan_kabul_cevabi_geldi' || item.task_key === 'sigortadan_red_cevabi_geldi');
                  
                  const isAcceptedItem = item.task_key === 'sigortadan_kabul_cevabi_geldi';
                  const isRejectedItem = item.task_key === 'sigortadan_red_cevabi_geldi';
                  
                  // If one is selected, hide the other
                  if (isInsuranceResponseItem) {
                    if (insuranceResponse === 'accepted' && isRejectedItem) {
                      return null;
                    }
                    if (insuranceResponse === 'rejected' && isAcceptedItem) {
                      return null;
                    }
                  }
                  
                  return (
                    <div
                      key={item.task_key}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isInsuranceResponseItem
                          ? item.completed
                            ? isAcceptedItem
                              ? 'bg-green-50 border-2 border-green-500'
                              : 'bg-red-50 border-2 border-red-500'
                            : isAcceptedItem
                            ? 'bg-green-50 border-2 border-green-300 hover:bg-green-100'
                            : 'bg-red-50 border-2 border-red-300 hover:bg-red-100'
                          : ''
                      } ${
                        canEditData ? 'hover:bg-white cursor-pointer' : 'cursor-not-allowed opacity-75'
                      }`}
                      onClick={() => {
                        if (canEditData) {
                          if (isInsuranceResponseItem) {
                            handleInsuranceResponseToggle(item.task_key, item.completed);
                          } else {
                            toggleItem(item.task_key, item.completed);
                          }
                        }
                      }}
                    >
                      <button className="flex-shrink-0">
                        {item.completed ? (
                          <CheckCircle2 className={`w-6 h-6 ${isInsuranceResponseItem ? (isAcceptedItem ? 'text-green-600' : 'text-red-600') : 'text-green-600'}`} />
                        ) : (
                          <Circle className={`w-6 h-6 ${isInsuranceResponseItem ? (isAcceptedItem ? 'text-green-400' : 'text-red-400') : 'text-neutral-300'}`} />
                        )}
                      </button>
                      <div className="flex-1">
                        <span
                          className={`${
                            item.completed
                              ? 'text-neutral-500 line-through'
                              : isInsuranceResponseItem
                              ? isAcceptedItem
                                ? 'text-green-700 font-medium'
                                : 'text-red-700 font-medium'
                              : 'text-neutral-800 font-medium'
                          }`}
                        >
                          {isInsuranceResponseItem && !item.completed && (
                            <span className="mr-2">{isAcceptedItem ? '✓' : '✗'}</span>
                          )}
                          {item.title}
                        </span>
                        {item.completed && item.completed_at && (
                          <p className={`text-xs mt-1 ${isInsuranceResponseItem ? (isAcceptedItem ? 'text-green-600' : 'text-red-600') : 'text-neutral-400'}`}>
                            Tamamlandı: <DateDisplay date={item.completed_at} format="date" />
                            {item.completed_by && ` - ${item.completed_by}`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
