'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PortalLayout } from '@/components/portal/portal-layout';
import { DashboardSummaryCards } from '@/components/portal/dashboard-summary-cards';
import { ProgressTracker, ProgressStep } from '@/components/portal/progress-tracker';
import { Card } from '@/components/ui/card';
import { MessageCircle, Settings, CheckCircle2, Clock, AlertCircle, Eye, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { getCurrentUserCases } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import {
  CHECKLIST_SECTIONS,
  CHECKLIST_ITEMS,
  isSectionCompleted,
  getCurrentSection,
} from '@/lib/checklist-sections';
import { EXPECTED_DOCUMENTS } from '@/lib/expected-documents';
import { cn } from '@/lib/utils';

interface DocumentDisplay {
  key: string;
  name: string;
  category: string;
  description: string;
  uploaded: boolean;
  documentData?: Array<{
    id: string;
    file_path: string;
    file_name?: string;
    file_size?: number;
    created_at: string;
    uploaded_by_name?: string;
    file_type?: string;
  }>;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [documents, setDocuments] = useState<DocumentDisplay[]>([]);

  const customerId = useMemo(() => customerData?.id, [customerData?.id]);
  const caseId = useMemo(() => caseData?.id, [caseData?.id]);

  // Progress hesaplama - Admin paneldekiyle aynı section-based sistem
  const calculateProgressPercentage = useCallback((checklistItems: any[], insuranceResponse: string | null): number => {
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
  }, []);

  // Get checklist items for progress calculation
  const getChecklistItemsForProgress = useCallback(() => {
    if (!caseData?.admin_checklist) return [];
    return CHECKLIST_ITEMS.map((item) => {
      const existing = caseData.admin_checklist.find((c: any) => c.task_key === item.key);
      return existing || {
        task_key: item.key,
        completed: false,
      };
    });
  }, [caseData]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const checklistItems = getChecklistItemsForProgress();
    const insuranceResponse = caseData?.insurance_response || null;
    return calculateProgressPercentage(checklistItems, insuranceResponse);
  }, [caseData, getChecklistItemsForProgress, calculateProgressPercentage]);

  const loadChecklistData = useCallback(async (caseId: string, insuranceResponse?: string | null) => {
    const { data: checklistData, error: checklistError } = await supabase
      .from('admin_checklist')
      .select('*')
      .eq('case_id', caseId) as { data: any[] | null; error: any };

    if (!checklistError && checklistData) {
      // Merge with default checklist items
      const mergedChecklist = CHECKLIST_ITEMS.map((item) => {
        const existing = checklistData.find((c) => c.task_key === item.key);
        return existing || {
          id: '',
          task_key: item.key,
          title: item.title,
          completed: false,
          completed_at: null,
          completed_by: null,
        };
      });

      // Mevcut section'ı belirle
      const currentSection = getCurrentSection(
        mergedChecklist.map((item) => ({ task_key: item.task_key, completed: item.completed }))
      );

      // Section'ları ProgressStep formatına dönüştür (Tamamlandı section'ını müşteri portalında gizle)
      const formattedSteps: ProgressStep[] = CHECKLIST_SECTIONS.filter(
        (section) => {
          // Hide Tamamlandı section
          if (section.title === 'Tamamlandı') return false;
          
          // Müzakere/Tahkim section filtering based on insurance response
          if (section.boardStage === 'muzakere') {
            // Show müzakere if: no response yet OR accepted
            return insuranceResponse === null || insuranceResponse === 'accepted';
          }
          if (section.boardStage === 'tahkim') {
            // Show tahkim only if rejected
            return insuranceResponse === 'rejected';
          }
          
          return true;
        }
      ).map((section) => {
        const sectionItems = mergedChecklist.filter((item) =>
          section.taskKeys.includes(item.task_key)
        );
        
        // Special handling for Sigorta Başvurusu section
        if (section.boardStage === 'sigorta_basvurusu') {
          const kabulCevabi = mergedChecklist.find(item => item.task_key === 'sigortadan_kabul_cevabi_geldi');
          const redCevabi = mergedChecklist.find(item => item.task_key === 'sigortadan_red_cevabi_geldi');
          const kabulCompleted = kabulCevabi?.completed || false;
          const redCompleted = redCevabi?.completed || false;
          
          // Filter section items based on insurance response
          const filteredSectionItems = sectionItems.filter((item) => {
            // Always show sigorta_basvurusu_yapildi
            if (item.task_key === 'sigorta_basvurusu_yapildi') return true;
            
            // If no response yet, show "Sigortadan cevap bekleniyor" (we'll add this manually)
            if (!kabulCompleted && !redCompleted) {
              // Don't show kabul/red items, we'll add a custom "cevap bekleniyor" item
              return false;
            }
            
            // If kabul completed, only show kabul
            if (kabulCompleted && item.task_key === 'sigortadan_kabul_cevabi_geldi') return true;
            
            // If red completed, only show red
            if (redCompleted && item.task_key === 'sigortadan_red_cevabi_geldi') return true;
            
            return false;
          });
          
          // Add "Sigortadan cevap bekleniyor" item if no response yet
          if (!kabulCompleted && !redCompleted) {
            filteredSectionItems.push({
              id: 'sigortadan_cevap_bekleniyor',
              task_key: 'sigortadan_cevap_bekleniyor',
              title: 'Sigortadan cevap bekleniyor',
              completed: false,
              completed_at: null,
              completed_by: null,
            });
          }
          
          sectionItems.length = 0;
          sectionItems.push(...filteredSectionItems);
        }
        
        const sectionCompleted = isSectionCompleted(
          section,
          mergedChecklist.map((item) => ({ task_key: item.task_key, completed: item.completed }))
        );
        const isCurrentSection = currentSection?.id === section.id;

        // Status belirleme
        let status: 'completed' | 'active' | 'waiting' = 'waiting';
        if (sectionCompleted) {
          status = 'completed';
        } else if (isCurrentSection) {
          status = 'active';
        }

        // İlk tamamlanan item'ın tarihini al
        const firstCompletedItem = sectionItems.find((item) => item.completed && item.completed_at);
        const date = firstCompletedItem?.completed_at
          ? new Date(firstCompletedItem.completed_at).toLocaleDateString('tr-TR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : undefined;

        // Tamamlanan item'ları al
        const completedItems = sectionItems
          .filter((item) => item.completed)
          .map((item) => item.title);

        // Section title'a insurance response'a göre etiket ekle
        let sectionTitle = `${section.emoji} ${section.title}`;
        if (section.boardStage === 'muzakere' && insuranceResponse === 'accepted') {
          sectionTitle = `${section.emoji} ${section.title} (kabul)`;
        } else if (section.boardStage === 'tahkim' && insuranceResponse === 'rejected') {
          sectionTitle = `${section.emoji} ${section.title} (red)`;
        }

        return {
          id: `section-${section.id}`,
          title: sectionTitle,
          status,
          date,
          description: sectionCompleted
            ? 'Bu aşama tamamlandı'
            : isCurrentSection
            ? 'Bu aşamada çalışılıyor'
            : undefined,
          completedTasks: completedItems.length > 0 ? completedItems : undefined,
          checklistItems: sectionItems.map((item) => ({
            task_key: item.task_key,
            title: item.title,
            completed: item.completed,
            completed_at: item.completed_at,
          })),
          expandable: true,
        };
      });

      setProgressSteps(formattedSteps);
    }
  }, []);

  const loadDocumentsData = useCallback(async (caseId: string) => {
    const { data: documentsData, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

    if (!docsError && documentsData) {
      // Create document display list from expected documents
      const documentDisplayList: DocumentDisplay[] = EXPECTED_DOCUMENTS.map((expectedDoc) => {
        // Find all uploaded documents matching this expected document category
        const uploadedDocs = documentsData.filter((doc) => doc.category === expectedDoc.key);
        return {
          key: expectedDoc.key,
          name: expectedDoc.name,
          category: expectedDoc.category,
          description: expectedDoc.description,
          uploaded: uploadedDocs.length > 0,
          documentData: uploadedDocs.length > 0 ? uploadedDocs.map((doc) => ({
            id: doc.id,
            file_path: doc.file_path,
            file_name: doc.name,
            file_size: doc.file_size,
            created_at: doc.created_at || doc.uploaded_at,
            uploaded_by_name: doc.uploaded_by_name,
            file_type: doc.file_type,
          })) : undefined,
        };
      });
      setDocuments(documentDisplayList);

      // Add documents to relevant steps
      setProgressSteps((prevSteps) =>
        prevSteps.map((step) => {
          const stepDocs = documentsData.filter((doc) => {
            if (step.title.includes('Ekspertiz') && doc.category === 'bilir_kisi_raporu')
              return true;
            if (step.title.includes('Kaza') && doc.category === 'kaza_tespit_tutanagi')
              return true;
            return false;
          });
          return {
            ...step,
            documents: stepDocs.map((doc) => ({
              name: doc.name,
              type: doc.file_type || 'pdf',
            })),
          };
        })
      );
    }
  }, []);


  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      console.log('Dashboard: Loading data...');
      const cases = await getCurrentUserCases();
      console.log('Dashboard: Cases received:', cases);
      
      if (cases && cases.length > 0) {
        const currentCase = cases[0];
        console.log('Dashboard: Current case:', currentCase);
        console.log('Dashboard: Customer data:', currentCase.customers);
        console.log('Dashboard: Checklist data:', currentCase.admin_checklist);
        console.log('Dashboard: Documents data:', currentCase.documents);
        
        setCaseData(currentCase);
        setCustomerData(currentCase.customers);

        // Use checklist data from API if available, otherwise load separately
        if (currentCase.admin_checklist && Array.isArray(currentCase.admin_checklist) && currentCase.admin_checklist.length > 0) {
          console.log('Dashboard: Using checklist data from API');
          // Process checklist data directly
          const mergedChecklist = CHECKLIST_ITEMS.map((item) => {
            const existing = currentCase.admin_checklist.find((c: any) => c.task_key === item.key);
            return existing || {
              id: '',
              task_key: item.key,
              title: item.title,
              completed: false,
              completed_at: null,
              completed_by: null,
            };
          });

          const currentSection = getCurrentSection(
            mergedChecklist.map((item) => ({ task_key: item.task_key, completed: item.completed }))
          );

          const insuranceResponse = currentCase.insurance_response;
          
          const formattedSteps: ProgressStep[] = CHECKLIST_SECTIONS.filter(
            (section) => {
              // Hide Tamamlandı section
              if (section.title === 'Tamamlandı') return false;
              
              // Müzakere/Tahkim section filtering based on insurance response
              if (section.boardStage === 'muzakere') {
                // Show müzakere if: no response yet OR accepted
                return insuranceResponse === null || insuranceResponse === 'accepted';
              }
              if (section.boardStage === 'tahkim') {
                // Show tahkim only if rejected
                return insuranceResponse === 'rejected';
              }
              
              return true;
            }
          ).map((section) => {
            const sectionItems = mergedChecklist.filter((item) =>
              section.taskKeys.includes(item.task_key)
            );
            
            // Special handling for Sigorta Başvurusu section
            if (section.boardStage === 'sigorta_basvurusu') {
              const kabulCevabi = mergedChecklist.find(item => item.task_key === 'sigortadan_kabul_cevabi_geldi');
              const redCevabi = mergedChecklist.find(item => item.task_key === 'sigortadan_red_cevabi_geldi');
              const kabulCompleted = kabulCevabi?.completed || false;
              const redCompleted = redCevabi?.completed || false;
              
              // Filter section items based on insurance response
              const filteredSectionItems = sectionItems.filter((item) => {
                // Always show sigorta_basvurusu_yapildi
                if (item.task_key === 'sigorta_basvurusu_yapildi') return true;
                
                // If no response yet, don't show kabul/red items
                if (!kabulCompleted && !redCompleted) {
                  return false;
                }
                
                // If kabul completed, only show kabul
                if (kabulCompleted && item.task_key === 'sigortadan_kabul_cevabi_geldi') return true;
                
                // If red completed, only show red
                if (redCompleted && item.task_key === 'sigortadan_red_cevabi_geldi') return true;
                
                return false;
              });
              
              // Add "Sigortadan cevap bekleniyor" item if no response yet
              if (!kabulCompleted && !redCompleted) {
                filteredSectionItems.push({
                  id: 'sigortadan_cevap_bekleniyor',
                  task_key: 'sigortadan_cevap_bekleniyor',
                  title: 'Sigortadan cevap bekleniyor',
                  completed: false,
                  completed_at: null,
                  completed_by: null,
                });
              }
              
              sectionItems.length = 0;
              sectionItems.push(...filteredSectionItems);
            }
            
            const sectionCompleted = isSectionCompleted(
              section,
              mergedChecklist.map((item) => ({ task_key: item.task_key, completed: item.completed }))
            );
            const isCurrentSection = currentSection?.id === section.id;

            let status: 'completed' | 'active' | 'waiting' = 'waiting';
            if (sectionCompleted) {
              status = 'completed';
            } else if (isCurrentSection) {
              status = 'active';
            }

            const firstCompletedItem = sectionItems.find((item) => item.completed && item.completed_at);
            const date = firstCompletedItem?.completed_at
              ? new Date(firstCompletedItem.completed_at).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : undefined;

            const completedItems = sectionItems
              .filter((item) => item.completed)
              .map((item) => item.title);

            // Section title'a insurance response'a göre etiket ekle
            let sectionTitle = `${section.emoji} ${section.title}`;
            if (section.boardStage === 'muzakere' && insuranceResponse === 'accepted') {
              sectionTitle = `${section.emoji} ${section.title} (kabul)`;
            } else if (section.boardStage === 'tahkim' && insuranceResponse === 'rejected') {
              sectionTitle = `${section.emoji} ${section.title} (red)`;
            }

            return {
              id: `section-${section.id}`,
              title: sectionTitle,
              status,
              date,
              description: sectionCompleted
                ? 'Bu aşama tamamlandı'
                : isCurrentSection
                ? 'Bu aşamada çalışılıyor'
                : undefined,
              completedTasks: completedItems.length > 0 ? completedItems : undefined,
              checklistItems: sectionItems.map((item) => ({
                task_key: item.task_key,
                title: item.title,
                completed: item.completed,
                completed_at: item.completed_at,
              })),
              expandable: true,
            };
          });

          setProgressSteps(formattedSteps);
        } else {
          console.log('Dashboard: Loading checklist data separately');
          await loadChecklistData(currentCase.id, currentCase.insurance_response);
        }

        // Use documents data from API if available, otherwise load separately
        if (currentCase.documents && Array.isArray(currentCase.documents) && currentCase.documents.length >= 0) {
          console.log('Dashboard: Using documents data from API');
          // Process documents data directly - support multiple files per category
          const documentDisplayList: DocumentDisplay[] = EXPECTED_DOCUMENTS.map((expectedDoc) => {
            // Find all uploaded documents matching this expected document category
            const uploadedDocs = currentCase.documents.filter((doc: any) => doc.category === expectedDoc.key);
            return {
              key: expectedDoc.key,
              name: expectedDoc.name,
              category: expectedDoc.category,
              description: expectedDoc.description,
              uploaded: uploadedDocs.length > 0,
              documentData: uploadedDocs.length > 0 ? uploadedDocs.map((doc: any) => ({
                id: doc.id,
                file_path: doc.file_path,
                file_name: doc.name,
                file_size: doc.file_size,
                created_at: doc.created_at || doc.uploaded_at,
                uploaded_by_name: doc.uploaded_by_name,
                file_type: doc.file_type,
              })) : undefined,
            };
          });
          setDocuments(documentDisplayList);

          // Add documents to relevant steps
          setProgressSteps((prevSteps) =>
            prevSteps.map((step) => {
              const stepDocs = currentCase.documents.filter((doc: any) => {
                if (step.title.includes('Ekspertiz') && doc.category === 'bilir_kisi_raporu')
                  return true;
                if (step.title.includes('Kaza') && doc.category === 'kaza_tespit_tutanagi')
                  return true;
                return false;
              });
              return {
                ...step,
                documents: stepDocs.map((doc: any) => ({
                  name: doc.name,
                  type: doc.file_type || 'pdf',
                })),
              };
            })
          );
        } else {
          console.log('Dashboard: Loading documents data separately');
          await loadDocumentsData(currentCase.id);
        }


      } else {
        console.warn('Dashboard: No cases found for current user');
        setError('Hesabınıza bağlı dosya bulunamadı. Lütfen destek ile iletişime geçin.');
      }
    } catch (error) {
      console.error('Dashboard: Error loading dashboard data:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  }, [loadChecklistData, loadDocumentsData]);

  useEffect(() => {
    // Load data once on page entry
    loadDashboardData();

    // Set up real-time subscriptions for customer and case updates
    if (customerId && caseId) {
      // Subscribe to customer changes
      const customerChannel = supabase
        .channel(`customer_updates_${customerId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'customers',
            filter: `id=eq.${customerId}`,
          },
          () => {
            console.log('Customer data updated, refreshing...');
            // Clear cache and reload data
            const { clearCasesCache } = require('@/lib/supabase/auth');
            clearCasesCache();
            loadDashboardData();
          }
        )
        .subscribe();

      // Subscribe to case changes
      const caseChannel = supabase
        .channel(`case_updates_${caseId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'cases',
            filter: `id=eq.${caseId}`,
          },
          () => {
            console.log('Case data updated, refreshing...');
            // Clear cache and reload data
            const { clearCasesCache } = require('@/lib/supabase/auth');
            clearCasesCache();
            loadDashboardData();
          }
        )
        .subscribe();

      // Subscribe to checklist changes (for progress tracker)
      const checklistChannel = supabase
        .channel(`checklist_updates_${caseId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'admin_checklist',
            filter: `case_id=eq.${caseId}`,
          },
          () => {
            console.log('Checklist updated, refreshing progress tracker...');
            // Reload checklist data
            if (caseId) {
              loadChecklistData(caseId, caseData?.insurance_response);
            }
          }
        )
        .subscribe();

      // Subscribe to documents changes
      const documentsChannel = supabase
        .channel(`documents_updates_${caseId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
            filter: `case_id=eq.${caseId}`,
          },
          () => {
            console.log('Documents updated, refreshing...');
            // Reload documents data
            if (caseId) {
              loadDocumentsData(caseId);
            }
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(customerChannel);
        supabase.removeChannel(caseChannel);
        supabase.removeChannel(checklistChannel);
        supabase.removeChannel(documentsChannel);
      };
    }
  }, [loadDashboardData, customerId, caseId, caseData, loadChecklistData, loadDocumentsData]);

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          <div className="text-neutral-600 text-lg">Verileriniz yükleniyor...</div>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <div className="text-neutral-800 text-xl font-semibold text-center">{error}</div>
          <button
            onClick={() => {
              setLoading(true);
              loadDashboardData();
            }}
            className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Tekrar Dene
          </button>
          <a
            href="https://wa.me/905057053305"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-blue hover:underline flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Destek ile iletişime geç
          </a>
        </div>
      </PortalLayout>
    );
  }

  if (!caseData || !customerData) {
    return (
      <PortalLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="w-16 h-16 text-yellow-500" />
          <div className="text-neutral-800 text-xl font-semibold text-center">Dosya bilgileriniz bulunamadı</div>
          <p className="text-neutral-600 text-center max-w-md">
            Hesabınıza henüz bir dosya atanmamış olabilir. Lütfen destek ekibi ile iletişime geçin.
          </p>
          <a
            href="https://wa.me/905057053305"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp ile Destek Al
          </a>
        </div>
      </PortalLayout>
    );
  }

  // Financial calculations
  const degerKaybi = caseData?.value_loss_amount ? parseFloat(caseData.value_loss_amount.toString()) : null;
  const karsiTarafKusurOrani = caseData?.fault_rate ? parseFloat(caseData.fault_rate.toString()) : null;
  const noterVeDosyaMasraflari = caseData?.notary_and_file_expenses ? parseFloat(caseData.notary_and_file_expenses.toString()) : null;
  
  // Check if values are missing
  const hasMissingValues = degerKaybi === null || degerKaybi === 0;
  
  // Toplam Beklenen Net Gelir = Değer Kaybı * Karşı Taraf Kusur Oranı * 80/10000
  const sizeKalacakTutar = hasMissingValues ? null : (degerKaybi! * (karsiTarafKusurOrani || 0) * 80) / 10000;

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Tazminat Özet Bilgileri - En Üstte */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-white to-blue-50/20 border border-blue-100 shadow-md">
          <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-4 md:mb-6">Tazminat Özet Bilgileri</h2>
          
          {/* Toplam Beklenen Net Gelir - Focus */}
          <div className="mb-6 p-5 md:p-6 bg-gradient-to-r from-primary-blue to-primary-orange rounded-xl text-white shadow-lg relative overflow-hidden">
            {/* Background Logo - Sağ taraf, eğik, şeffaf beyaz */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end opacity-10 -rotate-12 translate-x-8 translate-y-4">
              <Image
                src="/images/logo.png"
                alt="Değer360 Logo"
                width={300}
                height={100}
                className="h-32 md:h-40 lg:h-48 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
                loading="lazy"
                sizes="(max-width: 768px) 200px, (max-width: 1024px) 300px, 400px"
                quality={75}
              />
            </div>
            
            <div className="relative z-10">
              <p className="text-sm md:text-base mb-2 opacity-90">Toplam Beklenen Net Gelir</p>
              {hasMissingValues ? (
                <>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 text-yellow-200">
                    Bilir kişi raporu bekleniyor
                  </p>
                  <p className="text-xs md:text-sm opacity-80">
                    Bilir kişi raporu hazırlandıktan sonra tutar güncellenecektir
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">{sizeKalacakTutar!.toLocaleString('tr-TR')} TL</p>
                  <p className="text-xs md:text-sm opacity-80">
                    Bu tutar, tüm kesintilerden sonra size kalacak net tutardır
                  </p>
                </>
              )}
            </div>
          </div>

          {/* İstatistikler - 4'lü Grid - Sadece bilgiler girildiyse göster */}
          {!hasMissingValues && (() => {
            // Adem Uğurlu müşterisi için noter ve dosya masrafları kartını gizle
            const customerName = customerData?.full_name?.toLowerCase().trim() || '';
            const isAdemUgurlu = customerName === 'adem uğurlu' || customerName === 'adem ugurlu';
            const shouldShowNoterCard = !isAdemUgurlu;
            const gridCols = shouldShowNoterCard ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3';
            
            return (
              <div className={`grid ${gridCols} gap-3 md:gap-4`}>
                <Card className="p-3 md:p-4 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50/50 to-white border border-blue-200">
                  <p className="text-xs md:text-sm text-primary-blue mb-1 font-medium">Değer Kaybı</p>
                  <p className="text-lg md:text-xl font-bold text-neutral-800">
                    {degerKaybi === null ? (
                      <span className="text-neutral-400">Bekleniyor..</span>
                    ) : (
                      `${degerKaybi.toLocaleString('tr-TR')} TL`
                    )}
                  </p>
                </Card>
                
                <Card className="p-3 md:p-4 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50/50 to-white border border-blue-200">
                  <p className="text-xs md:text-sm text-primary-blue mb-1 font-medium">Karşı Tarafın Kusur Oranı</p>
                  <p className="text-lg md:text-xl font-bold text-neutral-800">
                    {karsiTarafKusurOrani === null ? (
                      <span className="text-neutral-400">Bekleniyor..</span>
                    ) : (
                      `%${karsiTarafKusurOrani.toFixed(0)}`
                    )}
                  </p>
                </Card>

                {shouldShowNoterCard && (
                  <Card className="p-3 md:p-4 hover:shadow-lg transition-all bg-gradient-to-br from-green-100 to-green-200/50 border-2 border-green-400 shadow-md">
                    <p className="text-xs md:text-sm text-green-800 mb-1 font-semibold">Noter ve Dosya Masrafları</p>
                    <p className="text-lg md:text-xl font-bold text-green-900 mb-1">
                      {noterVeDosyaMasraflari === null ? (
                        <span className="text-green-700">Bekleniyor..</span>
                      ) : (
                        `${noterVeDosyaMasraflari.toLocaleString('tr-TR')} TL`
                      )}
                    </p>
                    <p className="text-xs text-green-900 font-bold">Biz karşılıyoruz!</p>
                  </Card>
                )}

                <Card className="p-3 md:p-4 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50/50 to-white border border-blue-200">
                  <p className="text-xs md:text-sm text-primary-blue mb-1 font-medium">Müşteri Hakediş Oranı</p>
                  <p className="text-lg md:text-xl font-bold text-neutral-800">%80</p>
                </Card>
              </div>
            );
          })()}

          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg shadow-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-yellow-900">
                <strong>Uyarı:</strong> Bu rakamlar tahminidir. Kesin tutar sigorta/mahkeme kararına
                göre değişebilir.
              </p>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <DashboardSummaryCards
          fileNumber={caseData?.case_number || '#DK-2024-542'}
          status={caseData?.status === 'active' ? 'Aktif' : caseData?.status || 'Aktif'}
          duration="160 gün"
          insuranceCompany={customerData?.insurance_company || '-'}
          assignedLawyer={caseData?.assigned_lawyer || 'Atanmadı'}
        />

        {/* Progress Bar */}
        <Card className="p-6 bg-gradient-to-br from-white to-blue-50/20 border border-blue-200 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-neutral-800">İlerleme</h3>
              <span className="text-2xl font-bold text-primary-blue">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-5 shadow-inner">
              <div
                className="bg-gradient-to-r from-primary-blue to-primary-orange h-5 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* 2 Column Layout: Süreç Takibi (Sol, Geniş) ve Yüklenen Dosyalar (Sağ) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Süreç Takibi - Sol, Daha Geniş */}
          <div className="lg:col-span-3">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-blue-50/20 border border-blue-200 shadow-md">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4 sm:mb-6">Süreç Takibi</h2>
              <div className="overflow-x-hidden">
                <ProgressTracker steps={progressSteps} />
              </div>
            </Card>
          </div>

          {/* Yüklenen Dosyalar - Sağ */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-to-br from-white to-blue-50/20 border border-blue-200 shadow-md">
              <h2 className="text-xl font-bold text-neutral-800 mb-6">Yüklenen Dosyalar</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {documents.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">Henüz dosya yüklenmedi</p>
                ) : (
                  documents.map((doc) => {
                    const isUploaded = doc.uploaded && doc.documentData && doc.documentData.length > 0;
                    const files = doc.documentData || [];
                    return (
                      <div
                        key={doc.key}
                        className={cn(
                          'p-4 rounded-lg border transition-all',
                          isUploaded
                            ? 'border-blue-200 hover:shadow-md bg-gradient-to-br from-blue-50/30 to-white hover:from-blue-50/40'
                            : 'border-neutral-200 bg-neutral-50 opacity-75'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {isUploaded ? (
                              <FileText className="w-6 h-6 text-primary-blue" />
                            ) : (
                              <FileText className="w-6 h-6 text-neutral-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className={cn(
                                  'text-sm font-bold mb-1',
                                  isUploaded ? 'text-neutral-800' : 'text-neutral-500'
                                )}>
                                  {doc.name}
                                </h3>
                                {isUploaded && (
                                  <p className="text-xs text-neutral-600">
                                    {files.length} dosya yüklendi
                                  </p>
                                )}
                              </div>
                              {isUploaded ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                              ) : (
                                <Clock className="w-5 h-5 text-neutral-400 flex-shrink-0 ml-2" />
                              )}
                            </div>
                            
                            {isUploaded && files.length > 0 ? (
                              <div className="space-y-2 mt-3">
                                {files.map((fileData, index) => (
                                  <div
                                    key={fileData.id || index}
                                    className="flex items-center gap-2 p-2 bg-white rounded border border-neutral-200 hover:bg-neutral-50 transition-colors"
                                  >
                                    <div className="flex-shrink-0">
                                      {fileData.file_type?.startsWith('image/') ? (
                                        <ImageIcon className="w-4 h-4 text-primary-blue" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-primary-blue" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-neutral-800 truncate">
                                        {fileData.file_name || doc.name}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                                        {fileData.file_size && (
                                          <span>{(fileData.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                        )}
                                        {fileData.created_at && (
                                          <>
                                            <span>•</span>
                                            <span suppressHydrationWarning>
                                              {typeof window !== 'undefined' ? new Date(fileData.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '--'}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <button
                                        className="px-2 py-1 bg-primary-blue text-white rounded hover:bg-primary-blue/90 transition-colors text-xs"
                                        title="Görüntüle"
                                        onClick={async () => {
                                          if (fileData.file_path) {
                                            try {
                                              const response = await fetch(`/api/download-document?documentId=${fileData.id}&filePath=${encodeURIComponent(fileData.file_path)}`, {
                                                method: 'GET',
                                                credentials: 'include',
                                              });

                                              if (!response.ok) {
                                                throw new Error('View failed');
                                              }

                                              const blob = await response.blob();
                                              const url = window.URL.createObjectURL(blob);
                                              window.open(url, '_blank');
                                              setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                                            } catch (error) {
                                              console.error('Error viewing file:', error);
                                              alert('Dosya görüntüleme sırasında bir hata oluştu.');
                                            }
                                          }
                                        }}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors text-xs"
                                        title="İndir"
                                        onClick={async () => {
                                          if (fileData.file_path) {
                                            try {
                                              const response = await fetch(`/api/download-document?documentId=${fileData.id}&filePath=${encodeURIComponent(fileData.file_path)}`, {
                                                method: 'GET',
                                                credentials: 'include',
                                              });

                                              if (!response.ok) {
                                                throw new Error('Download failed');
                                              }

                                              const blob = await response.blob();
                                              const url = window.URL.createObjectURL(blob);
                                              const a = document.createElement('a');
                                              a.href = url;
                                              a.download = fileData.file_name || doc.name;
                                              document.body.appendChild(a);
                                              a.click();
                                              window.URL.revokeObjectURL(url);
                                              document.body.removeChild(a);
                                            } catch (error) {
                                              console.error('Error downloading file:', error);
                                              alert('Dosya indirme sırasında bir hata oluştu.');
                                            }
                                          }
                                        }}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-500 italic mt-2">
                                Yüklenecek
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* En Alta İki Buton: Hesap Bilgilerim ve Görüşme Talep Et */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hesap Bilgilerim */}
          <Link href="/portal/ayarlar" className="block">
            <Card className="p-6 bg-gradient-to-r from-primary-blue to-primary-orange text-white hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col items-center justify-center">
              <Settings className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-center">Hesap Bilgilerim</h3>
              <p className="text-sm text-center opacity-90">
                Kişisel bilgilerinizi görüntüleyin ve güncelleyin
              </p>
            </Card>
          </Link>

          {/* Görüşme Talep Et - WhatsApp */}
          <a
            href="https://wa.me/905057053305"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col items-center justify-center">
              <MessageCircle className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-center">Görüşme Talep Et</h3>
              <p className="text-sm text-center opacity-90">
                WhatsApp üzerinden bizimle iletişime geçin
              </p>
            </Card>
          </a>
        </div>
    </div>
    </PortalLayout>
  );
}
