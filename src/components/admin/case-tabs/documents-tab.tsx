'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { canEdit } from '@/lib/supabase/admin-auth';

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
  uploaded_by: string;
  uploaded_by_name: string | null;
  uploaded_at: string;
  file_path: string;
}

const DOCUMENT_CATEGORIES = [
  { key: 'kaza_tespit_tutanagi', label: 'Kaza Tespit Tutanağı' },
  { key: 'arac_fotograflari', label: 'Araç Fotoğrafları' },
  { key: 'bilir_kisi_raporu', label: 'Bilir Kişi Raporu' },
  { key: 'ruhsat', label: 'Ruhsat' },
  { key: 'kimlik', label: 'Kimlik' },
  { key: 'sigortaya_gonderilen_ihtarname', label: 'Sigortaya Gönderilen İhtarname' },
  { key: 'hakem_karari', label: 'Hakem Kararı' },
  { key: 'sigorta_odeme_dekontu', label: 'Sigorta Ödeme Dekontu' },
];

export function DocumentsTab({ caseId, caseData, onUpdate }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [canEditData, setCanEditData] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadDocuments();
    const checkPermissions = async () => {
      const editPermission = await canEdit();
      setCanEditData(editPermission);
    };
    checkPermissions();
  }, [caseId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Bilinmiyor';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${caseId}/${category}_${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath);

      // Save document record
      const { error: dbError } = await (supabase.from('documents') as any).insert({
        case_id: caseId,
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: fileExt,
        category: category,
        uploaded_by: 'admin',
        uploaded_by_name: 'Admin', // TODO: Get actual admin name
      });

      if (dbError) throw dbError;

      await loadDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Dosya yükleme sırasında bir hata oluştu');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Dosya indirme sırasında bir hata oluştu');
    }
  };

  const handleDelete = async (documentId: string, filePath: string) => {
    if (!confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase.from('documents').delete().eq('id', documentId);

      if (dbError) throw dbError;

      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Belge silme sırasında bir hata oluştu');
    }
  };

  const getDocumentForCategory = (category: string) => {
    return documents.find((doc) => doc.category === category);
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
          const document = getDocumentForCategory(category.key);
          return (
            <Card key={category.key} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-800 mb-1">{category.label}</h4>
                  {document ? (
                    <div className="space-y-1 text-sm text-neutral-600">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{document.name}</span>
                      </div>
                      <div>Boyut: {formatFileSize(document.file_size)}</div>
                      <div>
                        Yükleyen: {document.uploaded_by_name || document.uploaded_by}
                      </div>
                      <div>
                        Tarih:{' '}
                        {new Date(document.uploaded_at).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">Henüz yüklenmedi</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {document && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {canEditData && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(document.id, document.file_path)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {canEditData && (
                    <div>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[category.key] = el;
                        }}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, category.key)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        type="button"
                        onClick={() => {
                          const input = fileInputRefs.current[category.key];
                          if (input) {
                            input.click();
                          }
                        }}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {document ? 'Yenile' : 'Yükle'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
