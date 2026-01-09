'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase/client';

interface MultiFileUploadProps {
  caseId: string;
  category: string;
  onUploadComplete: () => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  acceptedTypes?: string;
  maxFileSizeMB?: number;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function MultiFileUpload({
  caseId,
  category,
  onUploadComplete,
  onUploadError,
  disabled = false,
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.webp',
  maxFileSizeMB = 20,
}: MultiFileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<File> => {
    // Only compress image files
    if (!file.type.startsWith('image/')) {
      return file;
    }

    const options = {
      maxSizeMB: 2, // Maximum file size after compression (2MB)
      maxWidthOrHeight: 1920, // Maximum width or height
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      
      // Create a new File object with the original filename and extension
      // to preserve the original file name and extension
      const originalFileName = file.name;
      
      // Create a new File with the original name but compressed content
      const finalFile = new File(
        [compressedFile],
        originalFileName,
        {
          type: file.type,
          lastModified: file.lastModified,
        }
      );
      
      console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(finalFile.size / 1024 / 1024).toFixed(2)}MB`);
      return finalFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      // Return original file if compression fails
      return file;
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Dosya boyutu çok büyük. Maksimum ${maxFileSizeMB}MB olmalı.`;
    }

    // Check file type
    const acceptedExtensions = acceptedTypes.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedExtensions.includes(fileExtension)) {
      return `Desteklenmeyen dosya tipi. İzin verilen tipler: ${acceptedTypes}`;
    }

    return null;
  };

  const uploadFile = async (file: File, fileId: string) => {
    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error' as const, error: validationError }
            : f
        ));
        return;
      }

      // Compress image if needed
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: 10 } : f
        ));
        fileToUpload = await compressImage(file);
      }

      // Get admin name
      const { data: { user } } = await supabase.auth.getUser();
      
      let uploadedByName = 'Admin';
      if (user?.id) {
        try {
          const response = await fetch('/api/check-admin-status', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            uploadedByName = data.admin?.name || 'Admin';
          }
        } catch (error) {
          console.error('Error getting admin name:', error);
        }
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('files', fileToUpload);
      formData.append('caseId', caseId);
      formData.append('category', category);
      formData.append('uploadedByName', uploadedByName);

      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 50 } : f
      ));

      // Upload file
      const response = await fetch('/api/upload-document', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Dosya yükleme başarısız');
      }

      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 100, status: 'success' as const } : f
      ));

      // Remove from list after a short delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
        onUploadComplete();
      }, 1000);

    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error' as const, error: error.message || 'Yükleme hatası' }
          : f
      ));
      if (onUploadError) {
        onUploadError(error.message || 'Dosya yükleme sırasında bir hata oluştu');
      }
    }
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Add files to uploading list
    const newFiles: UploadingFile[] = fileArray.map(file => ({
      id: `${Date.now()}_${Math.random()}`,
      name: file.name,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Upload files sequentially to avoid overwhelming the server
    for (let i = 0; i < fileArray.length; i++) {
      await uploadFile(fileArray[i], newFiles[i].id);
    }
  }, [caseId, category, onUploadComplete, onUploadError]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-2">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-neutral-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-neutral-400'}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          disabled={disabled}
        />
        <Upload className={`w-6 h-6 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-neutral-400'}`} />
        <p className="text-sm text-neutral-600">
          {isDragging ? 'Dosyaları buraya bırakın' : 'Dosya seçin veya sürükleyip bırakın'}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Çoklu dosya seçebilirsiniz • Maksimum {maxFileSizeMB}MB • {acceptedTypes}
        </p>
      </div>

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 p-2 bg-neutral-50 rounded border"
            >
              <div className="flex-shrink-0">
                {file.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                {file.status === 'success' && <FileText className="w-4 h-4 text-green-500" />}
                {file.status === 'error' && <X className="w-4 h-4 text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{file.name}</p>
                {file.status === 'uploading' && (
                  <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                {file.status === 'error' && file.error && (
                  <p className="text-xs text-red-600 mt-1">{file.error}</p>
                )}
                {file.status === 'success' && (
                  <p className="text-xs text-green-600 mt-1">Yüklendi</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeUploadingFile(file.id)}
                className="flex-shrink-0 border-0 bg-transparent hover:bg-neutral-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
