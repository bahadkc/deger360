'use client';

import { PortalLayout } from '@/components/portal/portal-layout';
import { Card } from '@/components/ui/card';
import { Download, Eye, FileText, CheckCircle2, Clock, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserCases } from '@/lib/supabase/auth';
import { EXPECTED_DOCUMENTS } from '@/lib/expected-documents';

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

type DocumentCategory = 'all' | string;

export default function BelgelerPage() {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('all');
  const [documents, setDocuments] = useState<DocumentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [caseId, setCaseId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      console.log('Documents: Loading data...');
      const cases = await getCurrentUserCases();
      console.log('Documents: Cases received:', cases);
      
      if (cases && cases.length > 0) {
        const currentCase = cases[0];
        console.log('Documents: Current case:', currentCase);
        console.log('Documents: Documents data from API:', currentCase.documents);
        setCaseId(currentCase.id);
        
        // Use documents data from API if available, otherwise load separately
        let docsData: any[] | null = null;
        if (currentCase.documents && Array.isArray(currentCase.documents) && currentCase.documents.length >= 0) {
          console.log('Documents: Using documents data from API');
          docsData = currentCase.documents;
        } else {
          console.log('Documents: Loading documents data separately');
          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('case_id', currentCase.id)
            .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

          if (error) {
            console.error('Documents: Error loading documents:', error);
          } else {
            docsData = data;
          }
        }

        // Create document display list from expected documents
        const documentDisplayList: DocumentDisplay[] = EXPECTED_DOCUMENTS.map((expectedDoc) => {
          // Find all uploaded documents matching this expected document category
          const uploadedDocs = docsData?.filter((doc) => doc.category === expectedDoc.key) || [];
          
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

        console.log('Documents: Document display list:', documentDisplayList.length);
        setDocuments(documentDisplayList);
      } else {
        console.warn('Documents: No cases found for current user');
        setCaseId(null);
        // Still show expected documents even if no case
        const documentDisplayList: DocumentDisplay[] = EXPECTED_DOCUMENTS.map((expectedDoc) => ({
          key: expectedDoc.key,
          name: expectedDoc.name,
          category: expectedDoc.category,
          description: expectedDoc.description,
          uploaded: false,
        }));
        setDocuments(documentDisplayList);
      }
    } catch (error) {
      console.error('Documents: Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load data once on page entry
    loadDocuments();

    // Set up real-time subscription for documents updates
    if (caseId) {
      const documentsChannel = supabase
        .channel(`documents_updates_belgeler_${caseId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
            filter: `case_id=eq.${caseId}`,
          },
          () => {
            console.log('Documents updated in belgeler page, refreshing...');
            // Clear cache and reload data
            const { clearCasesCache } = require('@/lib/supabase/auth');
            clearCasesCache();
            loadDocuments();
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(documentsChannel);
      };
    }
  }, [caseId, loadDocuments]);

  return (
    <PortalLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">Belgeler</h1>
          <p className="text-sm sm:text-base text-neutral-600">Dosyanızla ilgili tüm belgeleri görüntüleyin</p>
        </div>

        {/* Document List */}
          <div className="space-y-3 sm:space-y-4">
          {loading ? (
              <div className="text-center py-12 text-neutral-500">
              <p>Yükleniyor...</p>
              </div>
            ) : (
            documents.map((doc) => {
              const isUploaded = doc.uploaded && doc.documentData && doc.documentData.length > 0;
              const files = doc.documentData || [];
              
              return (
                <Card
                  key={doc.key}
                  className={cn(
                    'p-4 sm:p-6 transition-all',
                    isUploaded
                      ? 'border-neutral-200 hover:shadow-lg bg-white'
                      : 'border-neutral-200 bg-neutral-50 opacity-75'
                  )}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {isUploaded ? (
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-blue" />
                      ) : (
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            'text-base sm:text-lg font-bold mb-1',
                            isUploaded ? 'text-neutral-800' : 'text-neutral-500'
                          )}>
                            {doc.name}
                          </h3>
                          {isUploaded && (
                            <p className="text-xs sm:text-sm text-neutral-600">
                              {files.length} dosya yüklendi
                            </p>
                        )}
                      </div>
                        {isUploaded ? (
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 ml-2" />
                        ) : (
                          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400 flex-shrink-0 ml-2" />
                        )}
                      </div>

                      {/* Description */}
                      <p className={cn(
                        'text-xs sm:text-sm mb-3',
                        isUploaded ? 'text-neutral-600' : 'text-neutral-500'
                      )}>
                        {doc.description}
                      </p>

                      {/* Files List */}
                      {isUploaded && files.length > 0 ? (
                        <div className="space-y-3">
                          {files.map((fileData, index) => (
                            <div
                              key={fileData.id || index}
                              className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                            >
                              <div className="flex items-start gap-3">
                                {/* File Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                  {fileData.file_type?.startsWith('image/') ? (
                                    <ImageIcon className="w-5 h-5 text-primary-blue" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-primary-blue" />
                                  )}
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-800 truncate mb-1">
                                    {fileData.file_name || doc.name}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-neutral-600">
                                    {fileData.created_at && (
                                      <span suppressHydrationWarning>
                                        {typeof window !== 'undefined' ? new Date(fileData.created_at).toLocaleDateString('tr-TR') : '--'}
                                      </span>
                                    )}
                                    {fileData.file_size && (
                                      <>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{(fileData.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                      </>
                                    )}
                                    {fileData.uploaded_by_name && (
                                      <>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="text-green-600">
                                          {fileData.uploaded_by_name} tarafından yüklendi
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 flex-shrink-0">
                                  <button
                                    className="px-3 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors flex items-center gap-1.5 text-xs sm:text-sm"
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
                                    <span className="hidden sm:inline">Görüntüle</span>
                                  </button>
                                  <button
                                    className="px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors flex items-center gap-1.5 text-xs sm:text-sm"
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
                                    <span className="hidden sm:inline">İndir</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-neutral-500 italic">
                          Bu belge ileriki zamanlarda yüklenecektir
                        </p>
                    )}
                  </div>
                </div>
                </Card>
              );
            })
            )}
          </div>
      </div>
    </PortalLayout>
  );
}
