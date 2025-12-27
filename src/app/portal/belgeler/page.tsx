'use client';

import { PortalLayout } from '@/components/portal/portal-layout';
import { Card } from '@/components/ui/card';
import { Download, Eye, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  documentData?: {
  id: string;
    file_path: string;
    file_name?: string;
    file_size?: number;
    created_at: string;
    uploaded_by_name?: string;
  };
}

type DocumentCategory = 'all' | string;

export default function BelgelerPage() {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('all');
  const [documents, setDocuments] = useState<DocumentDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();

    // Real-time subscription for documents
    const documentsChannel = supabase
      .channel('portal_documents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        () => {
          loadDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(documentsChannel);
    };
  }, []);

  const loadDocuments = async () => {
    try {
      console.log('Documents: Loading data...');
      const cases = await getCurrentUserCases();
      console.log('Documents: Cases received:', cases);
      
      if (cases && cases.length > 0) {
        const currentCase = cases[0];
        console.log('Documents: Current case:', currentCase);
        
        // Load uploaded documents
        const { data: docsData, error } = await supabase
          .from('documents')
          .select('*')
          .eq('case_id', currentCase.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Documents: Error loading documents:', error);
        }

        // Create document display list from expected documents
        const documentDisplayList: DocumentDisplay[] = EXPECTED_DOCUMENTS.map((expectedDoc) => {
          // Find uploaded document matching this expected document
          const uploadedDoc = docsData?.find((doc) => doc.category === expectedDoc.key);
          
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

        console.log('Documents: Document display list:', documentDisplayList.length);
        setDocuments(documentDisplayList);
      } else {
        console.warn('Documents: No cases found for current user');
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
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Belgeler</h1>
          <p className="text-neutral-600">Dosyanızla ilgili tüm belgeleri görüntüleyin</p>
        </div>

        {/* Document List */}
          <div className="space-y-4">
          {loading ? (
              <div className="text-center py-12 text-neutral-500">
              <p>Yükleniyor...</p>
              </div>
            ) : (
            documents.map((doc) => {
              const isUploaded = doc.uploaded && doc.documentData;
              
              return (
                <Card
                  key={doc.key}
                  className={cn(
                    'p-6 transition-all',
                    isUploaded
                      ? 'border-neutral-200 hover:shadow-lg bg-white'
                      : 'border-neutral-200 bg-neutral-50 opacity-75'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {isUploaded ? (
                      <FileText className="w-8 h-8 text-primary-blue" />
                      ) : (
                        <FileText className="w-8 h-8 text-neutral-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            'text-lg font-bold mb-1',
                            isUploaded ? 'text-neutral-800' : 'text-neutral-500'
                          )}>
                            {doc.name}
                          </h3>
                          {isUploaded && doc.documentData?.file_name && (
                            <p className="text-sm text-neutral-600 truncate">
                              {doc.documentData.file_name}
                            </p>
                        )}
                      </div>
                        {isUploaded ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" />
                        ) : (
                          <Clock className="w-6 h-6 text-neutral-400 flex-shrink-0 ml-2" />
                        )}
                      </div>

                      {/* Description */}
                      <p className={cn(
                        'text-sm mb-3',
                        isUploaded ? 'text-neutral-600' : 'text-neutral-500'
                      )}>
                        {doc.description}
                      </p>

                      {/* Details */}
                      {isUploaded && doc.documentData ? (
                        <>
                          <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                            {doc.documentData.created_at && (
                              <span>
                                Tarih: {new Date(doc.documentData.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            )}
                            {doc.documentData.file_size && (
                              <span>Boyut: {(doc.documentData.file_size / 1024 / 1024).toFixed(2)} MB</span>
                            )}
                            {doc.documentData.uploaded_by_name && (
                              <span className="text-green-600">
                                {doc.documentData.uploaded_by_name} tarafından yüklendi
                              </span>
                      )}
                    </div>
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                        <button
                              className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors flex items-center gap-2"
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
                              <Eye className="w-4 h-4" />
                              Görüntüle
                        </button>
                        <button
                              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors flex items-center gap-2"
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
                              <Download className="w-4 h-4" />
                              İndir
                        </button>
                          </div>
                      </>
                      ) : (
                        <p className="text-sm text-neutral-500 italic">
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
