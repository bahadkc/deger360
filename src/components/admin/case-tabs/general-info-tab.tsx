'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface GeneralInfoTabProps {
  caseData: any;
  onUpdate: () => void;
}

export function GeneralInfoTab({ caseData, onUpdate }: GeneralInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Customer fields
  const [customerData, setCustomerData] = useState({
    full_name: caseData.customers?.full_name || '',
    phone: caseData.customers?.phone || '',
    email: caseData.customers?.email || '',
    address: caseData.customers?.address || '',
    iban: caseData.customers?.iban || '',
    payment_person_name: caseData.customers?.payment_person_name || '',
  });

  // Vehicle fields
  const [vehicleData, setVehicleData] = useState({
    vehicle_plate: caseData.vehicle_plate || '',
    vehicle_brand_model: caseData.vehicle_brand_model || '',
    accident_date: caseData.accident_date || '',
  });

  // Financial fields
  const [financialData, setFinancialData] = useState({
    value_loss_amount: caseData.value_loss_amount || '',
    fault_rate: caseData.fault_rate || 0,
    notary_and_file_expenses: caseData.notary_and_file_expenses || 0,
  });

  // File fields
  const [fileData, setFileData] = useState({
    case_number: caseData.case_number || '',
    status: caseData.status || 'active',
    assigned_lawyer: caseData.assigned_lawyer || '',
    created_at: caseData.created_at || '',
  });

  // Update state when caseData changes
  useEffect(() => {
    if (caseData) {
      setCustomerData({
        full_name: caseData.customers?.full_name || '',
        phone: caseData.customers?.phone || '',
        email: caseData.customers?.email || '',
        address: caseData.customers?.address || '',
        iban: caseData.customers?.iban || '',
        payment_person_name: caseData.customers?.payment_person_name || '',
      });
      setVehicleData({
        vehicle_plate: caseData.vehicle_plate || '',
        vehicle_brand_model: caseData.vehicle_brand_model || '',
        accident_date: caseData.accident_date || '',
      });
      setFinancialData({
        value_loss_amount: caseData.value_loss_amount || '',
        fault_rate: caseData.fault_rate || 0,
        notary_and_file_expenses: caseData.notary_and_file_expenses || 0,
      });
      setFileData({
        case_number: caseData.case_number || '',
        status: caseData.status || 'active',
        assigned_lawyer: caseData.assigned_lawyer || '',
        created_at: caseData.created_at || '',
      });
    }
  }, [caseData]);

  const calculateExpectedNet = () => {
    const valueLoss = parseFloat(financialData.value_loss_amount?.toString() || '0');
    const faultRate = parseFloat(financialData.fault_rate?.toString() || '0');
    return (valueLoss * faultRate) / 100;
  };

  const calculateTotalPayment = () => {
    const expectedNet = calculateExpectedNet();
    return (expectedNet * 80) / 100;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update customer
      const customerId = caseData.customers?.id || caseData.customer_id;
      if (!customerId) {
        throw new Error('Customer ID not found');
      }

      const { error: customerError } = await supabase
        .from('customers')
        .update({
          full_name: customerData.full_name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          iban: customerData.iban,
          payment_person_name: customerData.payment_person_name,
        })
        .eq('id', customerId);

      if (customerError) throw customerError;

      // Calculate financial values
      const expectedNet = calculateExpectedNet();
      const totalPayment = calculateTotalPayment();

      // Update case
      const { error: caseError } = await supabase
        .from('cases')
        .update({
          vehicle_plate: vehicleData.vehicle_plate,
          vehicle_brand_model: vehicleData.vehicle_brand_model,
          accident_date: vehicleData.accident_date,
          value_loss_amount: parseFloat(financialData.value_loss_amount?.toString() || '0'),
          fault_rate: parseInt(financialData.fault_rate?.toString() || '0'),
          notary_and_file_expenses: parseFloat(financialData.notary_and_file_expenses?.toString() || '0'),
          estimated_compensation: expectedNet,
          total_payment_amount: totalPayment,
          status: fileData.status,
          assigned_lawyer: fileData.assigned_lawyer,
        })
        .eq('id', caseData.id);

      if (caseError) throw caseError;

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
        )}
      </div>

      {/* Müşteri Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">Müşteri Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Ad Soyad</label>
            <Input
              value={customerData.full_name}
              onChange={(e) => setCustomerData({ ...customerData, full_name: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Telefon</label>
            <Input
              value={customerData.phone}
              onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">E-posta</label>
            <Input
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Adres</label>
            <Input
              value={customerData.address}
              onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">IBAN</label>
            <Input
              value={customerData.iban}
              onChange={(e) => setCustomerData({ ...customerData, iban: e.target.value })}
              disabled={!isEditing}
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
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>

      {/* Araç Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">Araç Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Plaka</label>
            <Input
              value={vehicleData.vehicle_plate}
              onChange={(e) => setVehicleData({ ...vehicleData, vehicle_plate: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Marka/Model</label>
            <Input
              value={vehicleData.vehicle_brand_model}
              onChange={(e) =>
                setVehicleData({ ...vehicleData, vehicle_brand_model: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Kaza Tarihi</label>
            <Input
              type="date"
              value={vehicleData.accident_date}
              onChange={(e) => setVehicleData({ ...vehicleData, accident_date: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>

      {/* Finansal Bilgiler */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">Finansal Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Toplam Değer Kaybı
            </label>
            <Input
              type="number"
              step="0.01"
              value={financialData.value_loss_amount}
              onChange={(e) =>
                setFinancialData({ ...financialData, value_loss_amount: e.target.value })
              }
              disabled={!isEditing}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Kusur Oranı (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={financialData.fault_rate}
              onChange={(e) =>
                setFinancialData({ ...financialData, fault_rate: e.target.value })
              }
              disabled={!isEditing}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Noter ve Dosya Masrafları (TL)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={financialData.notary_and_file_expenses}
              onChange={(e) =>
                setFinancialData({ ...financialData, notary_and_file_expenses: e.target.value })
              }
              disabled={!isEditing}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Beklenen Net Tutar
            </label>
            <div className="px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-lg">
              <span className="text-lg font-semibold text-primary-blue">
                {calculateExpectedNet().toLocaleString('tr-TR')} TL
              </span>
              <p className="text-xs text-neutral-500 mt-1">
                (Toplam Değer Kaybı × Kusur Oranı)
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Yapılacak Toplam Ödeme
            </label>
            <div className="px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-lg">
              <span className="text-lg font-semibold text-green-600">
                {calculateTotalPayment().toLocaleString('tr-TR')} TL
              </span>
              <p className="text-xs text-neutral-500 mt-1">(Beklenen Net Tutar × 80%)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Dosya Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">Dosya Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Dosya Takip No
            </label>
            <Input value={fileData.case_number} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Durum</label>
            <select
              value={fileData.status}
              onChange={(e) => setFileData({ ...fileData, status: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
            >
              <option value="active">Aktif</option>
              <option value="completed">Kapandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Oluşturulma Zamanı
            </label>
            <Input
              value={new Date(fileData.created_at).toLocaleString('tr-TR')}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Sorumlu Avukat
            </label>
            <Input
              value={fileData.assigned_lawyer}
              onChange={(e) => setFileData({ ...fileData, assigned_lawyer: e.target.value })}
              disabled={!isEditing}
              placeholder="Av. Ad Soyad"
            />
          </div>
        </div>
      </Card>

      {/* Portal Giriş Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">🔐 Portal Giriş Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Dosya Takip Numarası
            </label>
            <div className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="font-mono text-xl font-bold text-primary-blue">
                {caseData.customers?.dosya_takip_numarasi || '-'}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Şifre
            </label>
            <div className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="font-mono text-xl font-bold text-primary-blue">
                {(() => {
                  // Calculate password: araçplakası.soyisim
                  if (vehicleData.vehicle_plate && customerData.full_name) {
                    const cleanPlate = vehicleData.vehicle_plate.replace(/\s/g, '').toLowerCase();
                    const surname = customerData.full_name.split(' ').pop()?.toLowerCase() || '';
                    return `${cleanPlate}.${surname}`;
                  }
                  return '-';
                })()}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            💡 Müşteri portalına giriş için bu bilgileri kullanabilirsiniz.
          </p>
        </div>
      </Card>
    </div>
  );
}
