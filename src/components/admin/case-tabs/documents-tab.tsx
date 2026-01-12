'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { canEdit } from '@/lib/supabase/admin-auth';
import { DateDisplay } from '@/components/ui/date-display';
import { MultiFileUpload } from '@/components/admin/multi-file-upload';

interface DocumentsTabProps {
  caseId: string;
  caseData: any;
  onUpdate: () => void;
}

interface Document {
  id: string;
  name: string;
  category: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string;
  uploaded_by_name: string | null;
  uploaded_at: string;
  file_path: string;
}

const DOCUMENT_CATEGORIES = [
  { key: 'kaza_tespit_tutanagi', label: 'Kaza Tespit Tutanağı' },
  { key: 'arac_fotograflari', label: 'Araç Fotoğrafları' },
  { key: 'bilir_kisi_raporu', label: 'Eksper Raporu' },
  { key: 'ruhsat', label: 'Ruhsat' },
  { key: 'kimlik', label: 'Kimlik' },
  { key: 'sigortaya_gonderilen_ihtarname', label: 'Sigortaya Yapılan Başvuru' },
  { key: 'hakem_karari', label: 'Hakem Kararı' },
  { key: 'sigorta_odeme_dekontu', label: 'Sigorta Ödeme Dekontu' },
  { key: 'bilirkisi_raporu', label: 'Bilirkişi Raporu' },
];

export function DocumentsTab({ caseId, caseData, onUpdate }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEditData, setCanEditData] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      // Use API route to bypass RLS
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
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadDocuments();
    const checkPermissions = async () => {
      const editPermission = await canEdit();
      setCanEditData(editPermission);
    };
    checkPermissions();
  }, [caseId, loadDocuments]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Bilinmiyor';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="w-4 h-4" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleUploadComplete = useCallback(() => {
    loadDocuments();
    onUpdate();
    // Dispatch custom event to notify other tabs (like checklist) that documents were updated
    window.dispatchEvent(new CustomEvent('documents-updated'));
  }, [loadDocuments, onUpdate]);

  const handleDownload = async (doc: Document) => {
    try {
      // Use API route to download document
      const response = await fetch(`/api/download-document?documentId=${doc.id}&filePath=${encodeURIComponent(doc.file_path)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download document');
      }

      // Get blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      alert(`Dosya indirme sırasında bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleDelete = async (documentId: string, filePath: string) => {
    if (!confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return;

    try {
      // Use API route to delete document
      const response = await fetch(`/api/delete-document?documentId=${documentId}&filePath=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete document');
      }

      await loadDocuments();
      onUpdate();
      // Dispatch custom event to notify other tabs (like checklist) that documents were updated
      window.dispatchEvent(new CustomEvent('documents-updated'));
    } catch (error: any) {
      console.error('Error deleting document:', error);
      alert(`Belge silme sırasında bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  const getDocumentsForCategory = (category: string) => {
    return documents.filter((doc) => doc.category === category);
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-800">Dökümanlar</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_CATEGORIES.map((category) => {
          const categoryDocuments = getDocumentsForCategory(category.key);
          return (
            <Card key={category.key} className="p-4 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-neutral-800">{category.label}</h4>
                <span className="text-xs text-neutral-500">
                  {categoryDocuments.length} dosya
                </span>
              </div>

              {/* Documents List */}
              <div className="flex-1 min-h-0 mb-3">
                {categoryDocuments.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {categoryDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 p-2 bg-neutral-50 rounded border hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex-shrink-0 text-neutral-600">
                          {getFileIcon(doc.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>•</span>
                            <span>
                              {doc.uploaded_by_name || doc.uploaded_by}
                            </span>
                            <span>•</span>
                            <DateDisplay 
                              date={doc.uploaded_at} 
                              format="date"
                              options={{
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            className="h-8 w-8 p-0 border-0 bg-transparent hover:bg-neutral-200"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {canEditData && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(doc.id, doc.file_path)}
                              className="h-8 w-8 p-0 border-0 bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 py-4 text-center">
                    Henüz dosya yüklenmedi
                  </p>
                )}
              </div>

              {/* Upload Component */}
              {canEditData && (
                <div className="mt-auto">
                  <MultiFileUpload
                    caseId={caseId}
                    category={category.key}
                    onUploadComplete={handleUploadComplete}
                    onUploadError={(error) => {
                      alert(`Hata: ${error}`);
                    }}
                    disabled={loading}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
