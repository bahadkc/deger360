'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
        kaza_tespit_tutanagi: null,
        arac_fotograflari: null,
        bilir_kisi_raporu: null,
        ruhsat: null,
        kimlik: null,
        sigortaya_gonderilen_ihtarname: null,
        hakem_karari: null,
        sigorta_odeme_dekontu: null,
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

  // Step 3: Documents
  const [documents, setDocuments] = useState<Record<string, File | null>>({
    kaza_tespit_tutanagi: null,
    arac_fotograflari: null,
    bilir_kisi_raporu: null,
    ruhsat: null,
    kimlik: null,
    sigortaya_gonderilen_ihtarname: null,
    hakem_karari: null,
    sigorta_odeme_dekontu: null,
  });

  const documentLabels: Record<string, string> = {
    kaza_tespit_tutanagi: 'Kaza Tespit Tutanağı',
    arac_fotograflari: 'Araç Fotoğrafları',
    bilir_kisi_raporu: 'Bilir Kişi Raporu',
    ruhsat: 'Ruhsat',
    kimlik: 'Kimlik',
    sigortaya_gonderilen_ihtarname: 'Sigortaya Gönderilen İhtarname',
    hakem_karari: 'Hakem Kararı',
    sigorta_odeme_dekontu: 'Sigorta Ödeme Dekontu',
  };

  const handleFileChange = (category: string, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [category]: file }));
  };

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
      // Convert files to base64
      const documentsData: Record<string, any> = {};
      for (const [category, file] of Object.entries(documents)) {
        if (file) {
          documentsData[category] = await fileToBase64(file);
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
        kaza_tespit_tutanagi: null,
        arac_fotograflari: null,
        bilir_kisi_raporu: null,
        ruhsat: null,
        kimlik: null,
        sigortaya_gonderilen_ihtarname: null,
        hakem_karari: null,
        sigorta_odeme_dekontu: null,
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(documentLabels).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileChange(key, file);
                        }}
                        className="flex-1"
                      />
                      {documents[key] && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Yüklendi
                        </span>
                      )}
                    </div>
                  </div>
                ))}
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
}
