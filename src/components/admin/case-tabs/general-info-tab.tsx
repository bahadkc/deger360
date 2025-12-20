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
    tc_kimlik: caseData.customers?.tc_kimlik || '',
    iban: caseData.customers?.iban || '',
    payment_person_name: caseData.customers?.payment_person_name || '',
    dosya_takip_numarasi: caseData.customers?.dosya_takip_numarasi || '',
  });

  // Password field
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
  });
  const [passwordWasUpdated, setPasswordWasUpdated] = useState(false);
  const [updatedPassword, setUpdatedPassword] = useState<string>(''); // Store the updated password to display

  // Calculate current password format for display/placeholder
  const getCurrentPasswordFormat = () => {
    if (vehicleData.vehicle_plate && customerData.full_name) {
      const cleanPlate = vehicleData.vehicle_plate.replace(/\s/g, '').toLowerCase();
      const surname = customerData.full_name.split(' ').pop()?.toLowerCase() || '';
      return `${cleanPlate}.${surname}`;
    }
    return '';
  };

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
      const customerId = caseData.customers?.id || caseData.customer_id || '';
      
      setCustomerData({
        full_name: caseData.customers?.full_name || '',
        phone: caseData.customers?.phone || '',
        email: caseData.customers?.email || '',
        address: caseData.customers?.address || '',
        tc_kimlik: caseData.customers?.tc_kimlik || '',
        iban: caseData.customers?.iban || '',
        payment_person_name: caseData.customers?.payment_person_name || '',
        dosya_takip_numarasi: caseData.customers?.dosya_takip_numarasi || '',
      });
      
      // Load updated password from localStorage if exists
      if (customerId && typeof window !== 'undefined') {
        const storedPassword = localStorage.getItem(`updated_password_${customerId}`);
        if (storedPassword) {
          setUpdatedPassword(storedPassword);
          setPasswordWasUpdated(true);
        } else {
          setPasswordWasUpdated(false);
          setUpdatedPassword('');
        }
      } else {
        setPasswordWasUpdated(false);
        setUpdatedPassword('');
      }
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

      // Ensure dosya takip numarası is not empty - generate if needed
      let dosyaTakipNo = customerData.dosya_takip_numarasi?.trim();
      if (!dosyaTakipNo) {
        // Generate new tracking number if empty
        const { data: existingCustomers } = await supabase
          .from('customers')
          .select('dosya_takip_numarasi')
          .not('dosya_takip_numarasi', 'is', null);

        const existingNumbers = (existingCustomers || [])
          .map((c) => parseInt(c.dosya_takip_numarasi || '0'))
          .filter((n) => !isNaN(n) && n >= 216738);

        dosyaTakipNo =
          existingNumbers.length === 0 ? '216739' : (Math.max(...existingNumbers) + 1).toString();
      }

      const { error: customerError } = await supabase
        .from('customers')
        .update({
          full_name: customerData.full_name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          tc_kimlik: customerData.tc_kimlik,
          iban: customerData.iban,
          payment_person_name: customerData.payment_person_name,
          dosya_takip_numarasi: dosyaTakipNo,
        })
        .eq('id', customerId);

      if (customerError) throw customerError;

      // Update local state with generated number if it was empty
      if (!customerData.dosya_takip_numarasi?.trim()) {
        setCustomerData({ ...customerData, dosya_takip_numarasi: dosyaTakipNo });
      }

      // Update password if provided (and not empty)
      let passwordUpdateSuccess = true;
      let passwordUpdateError = null;
      
      if (passwordData.newPassword && passwordData.newPassword.trim().length >= 6) {
        try {
          // Get auth user ID from user_auth table
          const { data: userAuth, error: userAuthError } = await supabase
            .from('user_auth')
            .select('id')
            .eq('customer_id', customerId)
            .single();

          if (userAuthError || !userAuth) {
            passwordUpdateSuccess = false;
            passwordUpdateError = 'Kullanıcı kimlik doğrulama bilgisi bulunamadı';
          } else {
            // Update password via API
            const response = await fetch('/api/update-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userAuth.id,
                newPassword: passwordData.newPassword.trim(),
              }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
              passwordUpdateSuccess = false;
              passwordUpdateError = data.error || 'Şifre güncellenirken bir hata oluştu';
              console.error('Password update error:', data.error);
              setPasswordWasUpdated(false);
              setUpdatedPassword('');
            } else {
              // Password updated successfully - save the new password for display and clear the input field
              const newPasswordValue = passwordData.newPassword.trim();
              const customerId = caseData.customers?.id || caseData.customer_id || '';
              
              setUpdatedPassword(newPasswordValue);
              setPasswordData({ newPassword: '' });
              setPasswordWasUpdated(true);
              
              // Save to localStorage so it persists after page refresh
              if (customerId && typeof window !== 'undefined') {
                localStorage.setItem(`updated_password_${customerId}`, newPasswordValue);
              }
            }
          }
        } catch (error: any) {
          passwordUpdateSuccess = false;
          passwordUpdateError = error.message || 'Şifre güncellenirken bir hata oluştu';
          console.error('Error updating password:', error);
        }
      } else if (passwordData.newPassword && passwordData.newPassword.trim().length > 0 && passwordData.newPassword.trim().length < 6) {
        // If password is provided but too short, show warning but don't block save
        passwordUpdateSuccess = false;
        passwordUpdateError = 'Şifre en az 6 karakter olmalıdır';
      }

      // If password update failed, show error but continue with other updates
      if (!passwordUpdateSuccess && passwordUpdateError) {
        console.warn('Password update failed:', passwordUpdateError);
        // Don't throw - continue with other updates, but we'll show a warning
      }

      // Calculate financial values
      const expectedNet = calculateExpectedNet();
      const totalPayment = calculateTotalPayment();

      // Update case
      const caseUpdateData: any = {
        vehicle_plate: vehicleData.vehicle_plate,
        vehicle_brand_model: vehicleData.vehicle_brand_model,
        accident_date: vehicleData.accident_date,
        value_loss_amount: parseFloat(financialData.value_loss_amount?.toString() || '0'),
        fault_rate: parseInt(financialData.fault_rate?.toString() || '0'),
        estimated_compensation: expectedNet,
        total_payment_amount: totalPayment,
        status: fileData.status,
        assigned_lawyer: fileData.assigned_lawyer,
      };

      // Only include notary_and_file_expenses if column exists (check via try-catch or make optional)
      // For now, we'll skip it since it might not exist in all databases
      
      const { error: caseError } = await supabase
        .from('cases')
        .update(caseUpdateData)
        .eq('id', caseData.id);

      if (caseError) throw caseError;

      setIsEditing(false);
      // After save, load the updated password (or current format) into input for next edit
      const currentPassword = updatedPassword || getCurrentPasswordFormat();
      setPasswordData({ newPassword: currentPassword });
      
      // Show success message
      if (passwordData.newPassword && passwordData.newPassword.trim().length >= 6) {
        if (passwordUpdateSuccess) {
          alert('Bilgiler başarıyla kaydedildi. Şifre güncellendi.');
        } else {
          alert(`Bilgiler kaydedildi ancak şifre güncellenemedi: ${passwordUpdateError || 'Bilinmeyen hata'}`);
        }
      } else {
        alert('Bilgiler başarıyla kaydedildi');
      }
      
      onUpdate();
    } catch (error: any) {
      console.error('Error saving data:', error);
      alert(`Kaydetme sırasında bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
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
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                // Restore to updated password or format when canceling
                const currentPassword = updatedPassword || getCurrentPasswordFormat();
                setPasswordData({ newPassword: currentPassword });
              }}
            >
              İptal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              setIsEditing(true);
              // Load current active password (updated password if exists, otherwise format) into input field
              const currentPassword = updatedPassword || getCurrentPasswordFormat();
              setPasswordData({ newPassword: currentPassword });
            }}
          >
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">TC Kimlik No</label>
            <Input
              value={customerData.tc_kimlik}
              onChange={(e) => setCustomerData({ ...customerData, tc_kimlik: e.target.value })}
              disabled={!isEditing}
              placeholder="11 haneli TC kimlik numarası"
              maxLength={11}
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
            {isEditing ? (
              <div>
                <Input
                  value={customerData.dosya_takip_numarasi}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, dosya_takip_numarasi: e.target.value })
                  }
                  placeholder="Dosya takip numarası (boş bırakılırsa otomatik oluşturulur)"
                  className="font-mono"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Boş bırakılırsa kaydetme sırasında otomatik olarak yeni numara oluşturulur.
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="font-mono text-xl font-bold text-primary-blue">
                  {customerData.dosya_takip_numarasi || '-'}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Şifre
            </label>
            {isEditing ? (
              <div>
                <Input
                  type="text"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ newPassword: e.target.value })}
                  placeholder="Şifre girin"
                  className="font-mono"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Şifreyi düzenleyebilir, silebilir veya üzerine yazabilirsiniz. Boş bırakılırsa mevcut şifre korunur. En az 6 karakter olmalıdır.
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="font-mono text-sm font-bold text-primary-blue">
                  {passwordWasUpdated && updatedPassword ? (
                    <div>
                      <span className="text-green-600">✓ Şifre güncellendi: </span>
                      <span className="text-neutral-800">{updatedPassword}</span>
                    </div>
                  ) : (
                    <span className="text-neutral-600">
                      {getCurrentPasswordFormat() || 'Şifre görüntülenemiyor'}
                    </span>
                  )}
                </div>
                {passwordWasUpdated && updatedPassword && (
                  <p className="text-xs text-green-600 mt-1">
                    Bu şifre Supabase ve portal girişinde aktif.
                  </p>
                )}
              </div>
            )}
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
