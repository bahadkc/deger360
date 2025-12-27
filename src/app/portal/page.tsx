'use client';

import { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/portal/portal-layout';
import { DashboardSummaryCards } from '@/components/portal/dashboard-summary-cards';
import { ProgressTracker, ProgressStep } from '@/components/portal/progress-tracker';
import { Card } from '@/components/ui/card';
import { MessageCircle, Settings, CheckCircle2, Clock, AlertCircle, Eye, Download, FileText } from 'lucide-react';
import { getCurrentUserCases } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
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
  documentData?: {
    id: string;
    file_path: string;
    file_name?: string;
    file_size?: number;
    created_at: string;
    uploaded_by_name?: string;
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [documents, setDocuments] = useState<DocumentDisplay[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

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

    // Real-time subscription for payments
    const paymentsChannel = supabase
      .channel('dashboard_payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
  },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    // Real-time subscription for customers
    const customersChannel = supabase
      .channel('dashboard_customers_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customers',
        },
        (payload) => {
          if (customerData && payload.new.id === customerData.id) {
            setCustomerData(payload.new as any);
          } else {
            loadDashboardData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(caseChannel);
      supabase.removeChannel(checklistChannel);
      supabase.removeChannel(casesChannel2);
      supabase.removeChannel(documentsChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(customersChannel);
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
        setCustomerData(currentCase.customers);

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

          // Section'ları ProgressStep formatına dönüştür (Tamamlandı section'ını müşteri portalında gizle)
          const formattedSteps: ProgressStep[] = CHECKLIST_SECTIONS.filter(
            (section) => section.title !== 'Tamamlandı'
          ).map((section) => {
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

        // Load documents
        const { data: documentsData, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('case_id', currentCase.id)
          .order('created_at', { ascending: false });

        if (!docsError && documentsData) {
          // Create document display list from expected documents
          const documentDisplayList: DocumentDisplay[] = EXPECTED_DOCUMENTS.map((expectedDoc) => {
            const uploadedDoc = documentsData.find((doc) => doc.category === expectedDoc.key);
            return {
              key: expectedDoc.key,
              name: expectedDoc.name,
              category: expectedDoc.category,
              description: expectedDoc.description,
              uploaded: !!uploadedDoc,
              documentData: uploadedDoc ? {
                id: uploadedDoc.id,
                file_path: uploadedDoc.file_path,
                file_name: uploadedDoc.name,
                file_size: uploadedDoc.file_size,
                created_at: uploadedDoc.created_at,
                uploaded_by_name: uploadedDoc.uploaded_by_name,
              } : undefined,
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

        // Load payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('case_id', currentCase.id)
          .order('payment_date', { ascending: false });

        if (!paymentsError && paymentsData) {
          setPayments(paymentsData || []);
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

  // Financial calculations
  const degerKaybi = parseFloat(caseData?.value_loss_amount?.toString() || '0');
  const karsiTarafKusurOrani = parseFloat(caseData?.fault_rate?.toString() || '0');
  const noterVeDosyaMasraflari = parseFloat(caseData?.notary_and_file_expenses?.toString() || '0');
  
  // Toplam Beklenen Net Gelir = Değer Kaybı * Karşı Taraf Kusur Oranı * 80/10000
  const sizeKalacakTutar = (degerKaybi * karsiTarafKusurOrani * 80) / 10000;

  // Total paid amount
  const toplamOdenen = payments.reduce((sum, p) => sum + parseFloat(p.amount?.toString() || '0'), 0);

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Tazminat Özet Bilgileri - En Üstte */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-4 md:mb-6">Tazminat Özet Bilgileri</h2>
          
          {/* Toplam Beklenen Net Gelir - Focus */}
          <div className="mb-6 p-5 md:p-6 bg-gradient-to-r from-primary-blue to-primary-orange rounded-xl text-white shadow-lg">
            <p className="text-sm md:text-base mb-2 opacity-90">Toplam Beklenen Net Gelir</p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">💰 {sizeKalacakTutar.toLocaleString('tr-TR')} TL</p>
            <p className="text-xs md:text-sm opacity-80">
              Bu tutar, tüm kesintilerden sonra size kalacak net tutardır
            </p>
          </div>

          {/* İstatistikler - 4'lü Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="p-3 md:p-4 hover:shadow-md transition-shadow">
              <p className="text-xs md:text-sm text-neutral-600 mb-1">Değer Kaybı</p>
              <p className="text-lg md:text-xl font-bold text-neutral-800">
                {degerKaybi.toLocaleString('tr-TR')} TL
              </p>
            </Card>
            
            <Card className="p-3 md:p-4 hover:shadow-md transition-shadow">
              <p className="text-xs md:text-sm text-neutral-600 mb-1">Karşı Tarafın Kusur Oranı</p>
              <p className="text-lg md:text-xl font-bold text-neutral-800">
                %{karsiTarafKusurOrani.toFixed(0)}
              </p>
            </Card>

            <Card className="p-3 md:p-4 hover:shadow-md transition-shadow bg-green-100 border-green-400">
              <p className="text-xs md:text-sm text-neutral-600 mb-1">Noter ve Dosya Masrafları</p>
              <p className="text-lg md:text-xl font-bold text-neutral-800 mb-1">
                {noterVeDosyaMasraflari.toLocaleString('tr-TR')} TL
              </p>
              <p className="text-xs text-green-800 font-semibold">Biz karşılıyoruz!</p>
            </Card>

            <Card className="p-3 md:p-4 hover:shadow-md transition-shadow">
              <p className="text-xs md:text-sm text-neutral-600 mb-1">Müşteri Hakediş Oranı</p>
              <p className="text-lg md:text-xl font-bold text-neutral-800">
                %80
              </p>
            </Card>
        </div>

          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-yellow-800">
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

        {/* 2 Column Layout: Süreç Takibi (Sol, Geniş) ve Yüklenen Dosyalar (Sağ) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Süreç Takibi - Sol, Daha Geniş */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-6">Süreç Takibi</h2>
              <ProgressTracker steps={progressSteps} />
            </Card>
          </div>

          {/* Yüklenen Dosyalar - Sağ */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-6">Yüklenen Dosyalar</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {documents.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">Henüz dosya yüklenmedi</p>
                ) : (
                  documents.map((doc) => {
                    const isUploaded = doc.uploaded && doc.documentData;
                    return (
                      <div
                        key={doc.key}
                        className={cn(
                          'p-4 rounded-lg border transition-all',
                          isUploaded
                            ? 'border-neutral-200 hover:shadow-md bg-white'
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
                            <h3 className={cn(
                              'text-sm font-bold mb-1',
                              isUploaded ? 'text-neutral-800' : 'text-neutral-500'
                            )}>
                              {doc.name}
                            </h3>
                            {isUploaded && doc.documentData?.file_name && (
                              <p className="text-xs text-neutral-600 truncate mb-2">
                                {doc.documentData.file_name}
                              </p>
                            )}
                            {isUploaded ? (
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  className="px-3 py-1.5 bg-primary-blue text-white text-xs rounded-lg hover:bg-primary-blue/90 transition-colors flex items-center gap-1"
                                  onClick={async () => {
                                    if (doc.documentData?.file_path) {
                                      const { data, error } = await supabase.storage
                                        .from('documents')
                                        .download(doc.documentData.file_path);
                                      if (!error && data) {
                                        const url = URL.createObjectURL(data);
                                        window.open(url, '_blank');
                                      }
                                    }
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                  Görüntüle
                                </button>
                                <button
                                  className="px-3 py-1.5 bg-neutral-200 text-neutral-700 text-xs rounded-lg hover:bg-neutral-300 transition-colors flex items-center gap-1"
                                  onClick={async () => {
                                    if (doc.documentData?.file_path) {
                                      const { data, error } = await supabase.storage
                                        .from('documents')
                                        .download(doc.documentData.file_path);
                                      if (!error && data) {
                                        const url = URL.createObjectURL(data);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = doc.documentData.file_name || doc.name;
                                        a.click();
                                      }
                                    }
                                  }}
                                >
                                  <Download className="w-3 h-3" />
                                  İndir
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-500 italic mt-1">
                                Yüklenecek
                              </p>
                            )}
                          </div>
                          {isUploaded ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                          )}
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
