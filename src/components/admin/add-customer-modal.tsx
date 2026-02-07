'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Info, Upload, FileText, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { isSuperAdmin } from '@/lib/supabase/admin-auth';
import imageCompression from 'browser-image-compression';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3;

export function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ dosyaTakipNo: string; password: string } | null>(null);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check if user is superadmin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      const superAdmin = await isSuperAdmin();
      setIsSuperAdminUser(superAdmin);
    };
    if (isOpen) {
      checkSuperAdmin();
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !credentials) {
      setCurrentStep(1);
      setCustomerData({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        tc_kimlik: '',
        iban: '',
        payment_person_name: '',
      });
      setVehicleData({
        vehicle_plate: '',
        vehicle_brand_model: '',
        accident_date: '',
        accident_location: '',
      });
      setDocuments({
        kaza_tespit_tutanagi: [],
        arac_fotograflari: [],
        bilir_kisi_raporu: [],
        ruhsat: [],
        kimlik: [],
        karsi_tarafin_ruhsati: [],
        karsi_tarafin_ehliyeti: [],
        hakem_karari: [],
        sigorta_odeme_dekontu: [],
      });
    }
  }, [isOpen, credentials]);

  // Step 1: Customer Info
  const [customerData, setCustomerData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    tc_kimlik: '',
    iban: '',
    payment_person_name: '',
  });

  // Step 2: Vehicle Info
  const [vehicleData, setVehicleData] = useState({
    vehicle_plate: '',
    vehicle_brand_model: '',
    accident_date: '',
    accident_location: '',
  });

  // Step 3: Documents - Now supports multiple files per category
  const [documents, setDocuments] = useState<Record<string, File[]>>({
    kaza_tespit_tutanagi: [],
    arac_fotograflari: [],
    bilir_kisi_raporu: [],
    ruhsat: [],
    kimlik: [],
    karsi_tarafin_ruhsati: [],
    karsi_tarafin_ehliyeti: [],
    hakem_karari: [],
    sigorta_odeme_dekontu: [],
  });

  const documentLabels: Record<string, string> = {
    kaza_tespit_tutanagi: 'Kaza Tespit Tutanağı',
    arac_fotograflari: 'Araç Fotoğrafları',
    bilir_kisi_raporu: 'Eksper Raporu',
    ruhsat: 'Ruhsat',
    kimlik: 'Kimlik',
    karsi_tarafin_ruhsati: 'Karşı Tarafın Ruhsatı',
    karsi_tarafin_ehliyeti: 'Karşı Tarafın Ehliyeti',
    hakem_karari: 'Hakem Kararı',
    sigorta_odeme_dekontu: 'Sigorta Ödeme Dekontu',
  };

  const handleFilesChange = (category: string, files: File[]) => {
    setDocuments((prev) => ({ ...prev, [category]: files }));
  };

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
      
      return finalFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      // Return original file if compression fails
      return file;
    }
  };

  const processFiles = async (files: FileList | null, category: string) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const processedFiles: File[] = [];

    for (const file of fileArray) {
      try {
        // Compress if image
        const processedFile = await compressImage(file);
        processedFiles.push(processedFile);
      } catch (error) {
        console.error('Error processing file:', error);
        // Add original file if processing fails
        processedFiles.push(file);
      }
    }

    // Add to existing files
    setDocuments((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), ...processedFiles],
    }));
  };

  const removeFile = (category: string, index: number) => {
    setDocuments((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fileToBase64 = (file: File): Promise<{ name: string; content: string; type: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Content = base64.split(',')[1];
        resolve({
          name: file.name,
          content: base64Content,
          type: file.name.split('.').pop() || 'pdf',
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convert files to base64 - support multiple files per category
      const documentsData: Record<string, any> = {};
      for (const [category, files] of Object.entries(documents)) {
        if (files && files.length > 0) {
          // Convert all files to base64
          documentsData[category] = await Promise.all(
            files.map(file => fileToBase64(file))
          );
        }
      }

      // Call API route
      const response = await fetch('/api/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerData,
          vehicleData,
          documents: documentsData,
        }),
      });

      const result = await response.json();
      
      console.log('API Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Müşteri oluşturulamadı');
      }

      if (!result.credentials) {
        console.error('No credentials in response:', result);
        throw new Error('Giriş bilgileri oluşturulamadı');
      }

      // Show credentials
      console.log('Setting credentials:', result.credentials);
      setCredentials({
        dosyaTakipNo: result.credentials.dosyaTakipNo,
        password: result.credentials.password,
      });
      
      console.log('Credentials state set, should be visible now');

      // Reset form (but keep modal open to show credentials)
      setCurrentStep(1);
      setCustomerData({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        tc_kimlik: '',
        iban: '',
        payment_person_name: '',
      });
      setVehicleData({
        vehicle_plate: '',
        vehicle_brand_model: '',
        accident_date: '',
        accident_location: '',
      });
      setDocuments({
        kaza_tespit_tutanagi: [],
        arac_fotograflari: [],
        bilir_kisi_raporu: [],
        ruhsat: [],
        kimlik: [],
        hakem_karari: [],
        sigorta_odeme_dekontu: [],
      });

      // Don't call onSuccess() here - let user see credentials first
      // onSuccess() will be called when user clicks "Tamam" button
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Müşteri oluşturulurken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-800">Yeni Müşteri Ekle</h2>
            <button
              onClick={() => {
                if (credentials) {
                  // If credentials are shown, just close
                  setCredentials(null);
                  setCurrentStep(1);
                }
                onClose();
              }}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credentials Display - Show prominently when available */}
          {credentials ? (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">✅</div>
                  <h3 className="text-2xl font-bold text-green-800">Müşteri Başarıyla Oluşturuldu! 🎉</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-blue-300 shadow-md">
                    <div className="text-sm font-semibold text-neutral-600 mb-2">📋 Dosya Takip Numarası:</div>
                    <div className="font-mono text-2xl font-bold text-primary-blue tracking-wider">
                      {credentials.dosyaTakipNo}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border-2 border-blue-300 shadow-md">
                    <div className="text-sm font-semibold text-neutral-600 mb-2">🔑 Şifre:</div>
                    <div className="font-mono text-2xl font-bold text-primary-blue tracking-wider">
                      {credentials.password}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span>Bu bilgileri not alın! Müşteri portalına giriş için gereklidir.</span>
                    </p>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => {
                        setCredentials(null);
                        setCurrentStep(1);
                        onSuccess(); // Refresh customer list
                        onClose();
                      }}
                      className="px-6"
                    >
                      Tamam, Anladım
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Step 1: Customer Info */}
          {!credentials && currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Müşteri Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Ad Soyad *
                  </label>
                  <Input
                    value={customerData.full_name}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, full_name: e.target.value })
                    }
                    placeholder="Ahmet Yılmaz"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    E-posta *
                  </label>
                  <Input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    placeholder="ahmet@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Telefon</label>
                  <Input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="0532 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">TC Kimlik</label>
                  <Input
                    value={customerData.tc_kimlik}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, tc_kimlik: e.target.value })
                    }
                    placeholder="12345678901"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Adres</label>
                  <Input
                    value={customerData.address}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, address: e.target.value })
                    }
                    placeholder="İstanbul, Türkiye"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">IBAN</label>
                  <Input
                    value={customerData.iban}
                    onChange={(e) => setCustomerData({ ...customerData, iban: e.target.value })}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Ödeme Yapılacak Kişi
                  </label>
                  <Input
                    value={customerData.payment_person_name}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, payment_person_name: e.target.value })
                    }
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => {
                    if (customerData.full_name && customerData.email) {
                      setCurrentStep(2);
                    } else {
                      alert('Lütfen en azından Ad Soyad ve E-posta bilgilerini doldurun.');
                    }
                  }}
                >
                  Sonraki <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle Info */}
          {!credentials && currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Araç Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Plaka *
                  </label>
                  <Input
                    value={vehicleData.vehicle_plate}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, vehicle_plate: e.target.value })
                    }
                    placeholder="34 ABC 123"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Marka/Model *
                  </label>
                  <Input
                    value={vehicleData.vehicle_brand_model}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, vehicle_brand_model: e.target.value })
                    }
                    placeholder="Renault Megane"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Kaza Tarihi *
                  </label>
                  <Input
                    type="date"
                    value={vehicleData.accident_date}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, accident_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Kaza Yeri
                  </label>
                  <Input
                    value={vehicleData.accident_location}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, accident_location: e.target.value })
                    }
                    placeholder="İstanbul, Beşiktaş"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri
                </Button>
                <Button
                  onClick={() => {
                    if (
                      vehicleData.vehicle_plate &&
                      vehicleData.vehicle_brand_model &&
                      vehicleData.accident_date
                    ) {
                      setCurrentStep(3);
                    } else {
                      alert('Lütfen en azından Plaka, Marka/Model ve Kaza Tarihi bilgilerini doldurun.');
                    }
                  }}
                >
                  Sonraki <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {!credentials && currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Dökümanlar (Opsiyonel)</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(documentLabels).map(([key, label]) => {
                  const categoryFiles = documents[key] || [];
                  return (
                    <Card key={key} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-neutral-700">
                            {label}
                          </label>
                          <span className="text-xs text-neutral-500">
                            {categoryFiles.length} dosya
                          </span>
                        </div>

                        {/* File List */}
                        {categoryFiles.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {categoryFiles.map((file, index) => (
                              <div
                                key={`${file.name}-${index}`}
                                className="flex items-center gap-2 p-2 bg-neutral-50 rounded border"
                              >
                                <div className="flex-shrink-0 text-neutral-600">
                                  {file.type.startsWith('image/') ? (
                                    <ImageIcon className="w-4 h-4" />
                                  ) : (
                                    <FileText className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-800 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-neutral-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFile(key, index)}
                                  className="flex-shrink-0 h-8 w-8 p-0 border-0 bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Area */}
                        <div
                          onClick={() => fileInputRefs.current[key]?.click()}
                          className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-neutral-400 transition-colors"
                        >
                          <input
                            ref={(el) => {
                              fileInputRefs.current[key] = el;
                            }}
                            type="file"
                            multiple
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => {
                              processFiles(e.target.files, key);
                              e.target.value = ''; // Reset input
                            }}
                          />
                          <Upload className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                          <p className="text-sm text-neutral-600">
                            Dosya seçin veya sürükleyip bırakın
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Çoklu dosya seçebilirsiniz • Maksimum 20MB • PDF, JPG, PNG
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Oluşturuluyor...' : 'Müşteriyi Oluştur'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // Use portal to render modal at document root for proper viewport positioning
  if (!mounted || typeof window === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}
