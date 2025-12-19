'use client';

import { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/portal/portal-layout';
import { DashboardSummaryCards } from '@/components/portal/dashboard-summary-cards';
import { ProgressTracker, ProgressStep } from '@/components/portal/progress-tracker';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { getCurrentUserCases } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import {
  CHECKLIST_SECTIONS,
  CHECKLIST_ITEMS,
  isSectionCompleted,
  getCurrentSection,
} from '@/lib/checklist-sections';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);

  useEffect(() => {
    loadDashboardData();

    // Real-time subscription for cases table
    const caseChannel = supabase
      .channel('dashboard_case_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
        },
        (payload) => {
          if (caseData && payload.new.id === caseData.id) {
            setCaseData((prev: any) => ({ ...prev, ...payload.new }));
          } else {
            loadDashboardData();
          }
        }
      )
      .subscribe();

    // Real-time subscription for admin_checklist
    const checklistChannel = supabase
      .channel('dashboard_checklist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_checklist',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    // Real-time subscription for cases (board_stage changes)
    const casesChannel2 = supabase
      .channel('dashboard_cases_board_stage_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
        },
        (payload) => {
          if (caseData && payload.new.id === caseData.id) {
            setCaseData((prev: any) => ({ ...prev, ...payload.new }));
            loadDashboardData();
          }
        }
      )
      .subscribe();

    // Real-time subscription for documents
    const documentsChannel = supabase
      .channel('dashboard_documents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(caseChannel);
      supabase.removeChannel(checklistChannel);
      supabase.removeChannel(casesChannel2);
      supabase.removeChannel(documentsChannel);
    };
  }, [caseData?.id]);

  const loadDashboardData = async () => {
    try {
      console.log('Dashboard: Loading data...');
      const cases = await getCurrentUserCases();
      console.log('Dashboard: Cases received:', cases);
      
      if (cases && cases.length > 0) {
        const currentCase = cases[0];
        console.log('Dashboard: Current case:', currentCase);
        console.log('Dashboard: Customer data:', currentCase.customers);
        setCaseData(currentCase);

        // Load admin checklist
        const { data: checklistData, error: checklistError } = await supabase
          .from('admin_checklist')
          .select('*')
          .eq('case_id', currentCase.id);

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

          // Section'ları ProgressStep formatına dönüştür
          const formattedSteps: ProgressStep[] = CHECKLIST_SECTIONS.map((section) => {
            const sectionItems = mergedChecklist.filter((item) =>
              section.taskKeys.includes(item.task_key)
            );
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

            return {
              id: `section-${section.id}`,
              title: `${section.emoji} ${section.title}`,
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

        // Load documents for progress steps
        const { data: documents, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('case_id', currentCase.id);

        if (!docsError && documents) {
          // Add documents to relevant steps
          setProgressSteps((prevSteps) =>
            prevSteps.map((step) => {
              const stepDocs = documents.filter((doc) => {
                // Map document categories to step titles
                if (step.title.includes('Ekspertiz') && doc.category === 'ekspertiz_raporu')
                  return true;
                if (step.title.includes('Kaza') && doc.category === 'kaza_tespit_tutanagi')
                  return true;
                if (step.title.includes('Tamir') && doc.category === 'tamir_faturasi') return true;
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

      } else {
        console.warn('Dashboard: No cases found for current user');
      }
    } catch (error) {
      console.error('Dashboard: Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">Yükleniyor...</div>
        </div>
      </PortalLayout>
    );
  }


  // Progress hesaplama
  const completedSteps = progressSteps.filter((s) => s.status === 'completed').length;
  const totalSteps = progressSteps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Dashboard</h1>
          <p className="text-neutral-600">Dosyanızın genel durumunu takip edin</p>
        </div>

        {/* Summary Cards */}
        <DashboardSummaryCards
          fileNumber={caseData?.case_number || '#DK-2024-542'}
          status={caseData?.status === 'active' ? 'Aktif' : caseData?.status || 'Aktif'}
          duration={
            caseData?.start_date
              ? `${Math.floor(
                  (Date.now() - new Date(caseData.start_date).getTime()) / (1000 * 60 * 60 * 24)
                )} gün`
              : '45 gün'
          }
          estimatedCompensation={
            caseData?.estimated_compensation
              ? `${caseData.estimated_compensation.toLocaleString('tr-TR')} TL`
              : '42.000 TL'
          }
          assignedLawyer={caseData?.assigned_lawyer || 'Atanmadı'}
        />

        {/* Progress Bar */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-neutral-800">İlerleme</h3>
              <span className="text-2xl font-bold text-primary-blue">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-primary-blue to-primary-orange h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Progress Tracker - Full Width */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-6">Süreç Takibi</h2>
          <ProgressTracker steps={progressSteps} />
        </Card>

        {/* Next Step Cards - Two Bubbles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sırada Ne Var - Wider */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-to-r from-primary-blue to-primary-orange text-white h-full">
              <h3 className="text-lg font-bold mb-2">🎯 Sırada Ne Var?</h3>
              <p className="mb-4">Sigorta şirketinin cevabı bekleniyor</p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Beklenen Süre:</strong> 7-10 gün
                </p>
                <p>
                  <strong>Tahmini Tarih:</strong> 25 Aralık 2024
                </p>
              </div>
              <p className="mt-4 text-sm opacity-90">
                Ne Yapmanız Gerekiyor? → Hiçbir şey! Biz hallederiz 😊
              </p>
            </Card>
          </div>

          {/* Görüşme Talep Et - WhatsApp */}
          <div className="lg:col-span-1">
            <a
              href="https://wa.me/905551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white h-full flex flex-col items-center justify-center hover:shadow-lg transition-shadow cursor-pointer">
                <MessageCircle className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-center">Görüşme Talep Et</h3>
                <p className="text-sm text-center opacity-90">
                  WhatsApp üzerinden bizimle iletişime geçin
                </p>
              </Card>
            </a>
          </div>
        </div>
    </div>
    </PortalLayout>
  );
}
