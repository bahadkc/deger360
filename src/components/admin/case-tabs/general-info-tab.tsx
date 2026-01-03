'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Edit2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getAllAdmins, isSuperAdmin, canEdit, canAssignAdmins } from '@/lib/supabase/admin-auth';

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
    insurance_company: caseData.customers?.insurance_company || '',
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

  // Admin assignment fields
  const [assignedAdmins, setAssignedAdmins] = useState<string[]>([]);
  const [initialAssignedAdmins, setInitialAssignedAdmins] = useState<string[]>([]);
  const [allAdmins, setAllAdmins] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [canEditData, setCanEditData] = useState(false);
  const [canAssignAdminsData, setCanAssignAdminsData] = useState(false);

  // Load admins and check permissions
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const admins = await getAllAdmins();
        setAllAdmins(admins);
        
        const superAdmin = await isSuperAdmin();
        setIsSuperAdminUser(superAdmin);
        
        const editPermission = await canEdit();
        setCanEditData(editPermission);
        
        const assignPermission = await canAssignAdmins();
        setCanAssignAdminsData(assignPermission);
      } catch (error) {
        console.error('Error loading admins:', error);
      }
    };

    // Initial load
    loadAdmins();

    // Listen for custom event when admin is created
    const handleAdminCreated = () => {
      console.log('Admin created event received, reloading admin list...');
      loadAdmins();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('adminCreated', handleAdminCreated);
    }

    // Real-time subscription for user_auth table (to update admin list when new admin is created)
    const channel = supabase
      .channel('user_auth_changes_for_admins')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_auth',
        },
        (payload) => {
          // Check if the new record is an admin role
          if (payload.new && ['superadmin', 'admin', 'lawyer', 'acente'].includes(payload.new.role)) {
            console.log('New admin created via real-time, reloading admin list...');
            loadAdmins();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_auth',
        },
        (payload) => {
          // Check if role changed to/from admin role
          if (payload.new && ['superadmin', 'admin', 'lawyer', 'acente'].includes(payload.new.role)) {
            console.log('Admin updated via real-time, reloading admin list...');
            loadAdmins();
          }
        }
      )
      .subscribe();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('adminCreated', handleAdminCreated);
      }
      supabase.removeChannel(channel);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isAdminDropdownOpen && !target.closest('.admin-dropdown-container')) {
        setIsAdminDropdownOpen(false);
      }
    };

    if (isAdminDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isAdminDropdownOpen]);

  // Load assigned admins for this case
  useEffect(() => {
    const loadAssignedAdmins = async () => {
      if (!caseData?.id) return;
      
      try {
        const { data, error } = await (supabase
          .from('case_admins')
          .select('admin_id')
          .eq('case_id', caseData.id) as any);

        if (error) {
          console.error('Error loading assigned admins:', error);
          return;
        }

        const adminIds = (data || []).map((item: any) => item.admin_id);
        setAssignedAdmins(adminIds);
        setInitialAssignedAdmins(adminIds);
      } catch (error) {
        console.error('Error loading assigned admins:', error);
      }
    };
    loadAssignedAdmins();
  }, [caseData?.id]);

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
        insurance_company: caseData.customers?.insurance_company || '',
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
    // Prevent save if user cannot edit (e.g., acente)
    if (!canEditData) {
      alert('Bu işlem için yetkiniz bulunmamaktadır.');
      return;
    }
    
    setSaving(true);
    try {
      const customerId = caseData.customers?.id || caseData.customer_id;
      if (!customerId) {
        throw new Error('Customer ID not found');
      }

      // Ensure dosya takip numarası is not empty - generate if needed
      let dosyaTakipNo = customerData.dosya_takip_numarasi?.trim();
      if (!dosyaTakipNo) {
        // Generate new tracking number if empty - this will be handled by API
        dosyaTakipNo = 'AUTO_GENERATE';
      }

      // Calculate financial values
      const expectedNet = calculateExpectedNet();
      const totalPayment = calculateTotalPayment();

      // Prepare updates
      const customerUpdates: any = {
        full_name: customerData.full_name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        tc_kimlik: customerData.tc_kimlik,
        iban: customerData.iban,
        payment_person_name: customerData.payment_person_name,
        dosya_takip_numarasi: dosyaTakipNo === 'AUTO_GENERATE' ? null : dosyaTakipNo,
        insurance_company: customerData.insurance_company,
      };

      const caseUpdates: any = {
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

      // Try to include notary_and_file_expenses if it exists
      try {
        const notaryExpenses = parseFloat(financialData.notary_and_file_expenses?.toString() || '0');
        if (notaryExpenses > 0) {
          caseUpdates.notary_and_file_expenses = notaryExpenses;
        }
      } catch (error) {
        // Ignore if column doesn't exist
      }

      // Use API route to update case and customer
      const response = await fetch('/api/update-case', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: caseData.id,
          caseUpdates,
          customerUpdates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update case');
      }

      const data = await response.json();

      // Update password if provided
      let passwordUpdateSuccess = true;
      let passwordUpdateError = null;
      
      if (passwordData.newPassword && passwordData.newPassword.trim().length >= 6) {
        try {
          // Get user ID from auth
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) {
            passwordUpdateSuccess = false;
            passwordUpdateError = 'Kullanıcı kimlik doğrulama bilgisi bulunamadı';
          } else {
            const passwordResponse = await fetch('/api/update-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: authUser.id,
                newPassword: passwordData.newPassword.trim(),
              }),
            });

            const passwordData_result = await passwordResponse.json();

            if (!passwordResponse.ok || !passwordData_result.success) {
              passwordUpdateSuccess = false;
              passwordUpdateError = passwordData_result.error || 'Şifre güncellenirken bir hata oluştu';
            } else {
              const newPasswordValue = passwordData.newPassword.trim();
              setUpdatedPassword(newPasswordValue);
              setPasswordData({ newPassword: '' });
              setPasswordWasUpdated(true);
              
              if (customerId && typeof window !== 'undefined') {
                localStorage.setItem(`updated_password_${customerId}`, newPasswordValue);
              }
            }
          }
        } catch (error: any) {
          passwordUpdateSuccess = false;
          passwordUpdateError = error.message || 'Şifre güncellenirken bir hata oluştu';
        }
      }

      // Save admin assignments (only if superadmin and assignments changed) - separate API call
      // Check if admin assignments have changed by comparing with initial state
      const adminAssignmentsChanged = 
        canAssignAdminsData && 
        JSON.stringify(assignedAdmins.sort()) !== JSON.stringify(initialAssignedAdmins.sort());
      
      if (adminAssignmentsChanged) {
        try {
          const assignmentsResponse = await fetch('/api/update-case-assignments', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              caseId: caseData.id,
              adminIds: assignedAdmins,
            }),
          });

          if (!assignmentsResponse.ok) {
            const errorData = await assignmentsResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Admin atama başarısız');
          }

          // Update initial state after successful assignment
          setInitialAssignedAdmins([...assignedAdmins]);
          
          // ✅ İşlem başarılı - SAYFAYI YENİLE (onUpdate yerine)
          setSaving(false);
          setIsEditing(false);
          alert('✅ Admin atama başarılı! Sayfa yenileniyor...');
          
          // 500ms bekle, sonra sayfayı yenile
          setTimeout(() => {
            window.location.reload();
          }, 500);
          
          return; // ← Burada durdur, onUpdate çağırma

        } catch (error: any) {
          console.error('Error saving admin assignments:', error);
          alert(`❌ Admin atama başarısız: ${error.message || 'Bilinmeyen hata'}`);
          setSaving(false);
          // Don't return here - continue with normal save flow
          // This way if admin assignment fails, other changes can still be saved
        }
      }

      setIsEditing(false);
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
      
      // Clear cache to ensure fresh data is loaded
      // This ensures that if customer portal is open, it will get fresh data
      if (typeof window !== 'undefined') {
        // Clear any localStorage cache if exists
        localStorage.removeItem('cases_cache');
      }
      
      // Reload case data via onUpdate callback
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
      {canEditData && (
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
      )}

      {/* Müşteri Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">Müşteri Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Ad Soyad</label>
            <Input
              value={customerData.full_name}
              onChange={(e) => setCustomerData({ ...customerData, full_name: e.target.value })}
              disabled={!isEditing || !canEditData}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Telefon</label>
            <Input
              value={customerData.phone}
              onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
              disabled={!isEditing || !canEditData}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">E-posta</label>
            <Input
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              disabled={!isEditing || !canEditData}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">TC Kimlik No</label>
            <Input
              value={customerData.tc_kimlik}
              onChange={(e) => setCustomerData({ ...customerData, tc_kimlik: e.target.value })}
              disabled={!isEditing || !canEditData}
              placeholder="11 haneli TC kimlik numarası"
              maxLength={11}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Adres</label>
            <Input
              value={customerData.address}
              onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
              disabled={!isEditing || !canEditData}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">IBAN</label>
            <Input
              value={customerData.iban}
              onChange={(e) => setCustomerData({ ...customerData, iban: e.target.value })}
              disabled={!isEditing || !canEditData}
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
              disabled={!isEditing || !canEditData}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Sigorta Şirketi
            </label>
            <Input
              value={customerData.insurance_company}
              onChange={(e) =>
                setCustomerData({ ...customerData, insurance_company: e.target.value })
              }
              disabled={!isEditing || !canEditData}
              placeholder="Örn: Allianz Sigorta, Anadolu Sigorta"
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
              disabled={!isEditing || !canEditData}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Marka/Model</label>
            <Input
              value={vehicleData.vehicle_brand_model}
              onChange={(e) =>
                setVehicleData({ ...vehicleData, vehicle_brand_model: e.target.value })
              }
              disabled={!isEditing || !canEditData}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Kaza Tarihi</label>
            <Input
              type="date"
              value={vehicleData.accident_date}
              onChange={(e) => setVehicleData({ ...vehicleData, accident_date: e.target.value })}
              disabled={!isEditing || !canEditData}
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
              disabled={!isEditing || !canEditData}
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
              disabled={!isEditing || !canEditData}
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
              disabled={!isEditing || !canEditData}
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
              disabled={!isEditing || !canEditData}
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
              disabled={!isEditing || !canEditData}
              placeholder="Av. Ad Soyad"
            />
          </div>
        </div>
      </Card>

      {/* Admin Atama (Sadece Superadmin) */}
      {canAssignAdminsData && (
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-neutral-800 mb-3 md:mb-4">👥 Admin Atama</h3>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
                Bu müşteriye atanan adminler
              </label>
              <div className="relative admin-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  disabled={!isEditing || !canEditData}
                  className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 transition-colors text-left flex items-center justify-between text-sm md:text-base ${
                    !isEditing
                      ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed'
                      : 'bg-white border-neutral-200 hover:border-primary-blue cursor-pointer'
                  }`}
                >
                  <span className="text-xs md:text-sm text-neutral-700 truncate pr-2">
                    {assignedAdmins.length === 0
                      ? 'Admin seçin (birden fazla seçebilirsiniz)'
                      : `${assignedAdmins.length} admin seçildi`}
                  </span>
                  {isEditing && (
                    <span className="flex-shrink-0">{isAdminDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
                  )}
                </button>
                {isEditing && isAdminDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto admin-dropdown-container">
                    {allAdmins.length === 0 ? (
                      <div className="p-3 md:p-4 text-xs md:text-sm text-neutral-500">Admin bulunamadı</div>
                    ) : (
                      allAdmins.map((admin) => {
                        const isSelected = assignedAdmins.includes(admin.id);
                        return (
                          <label
                            key={admin.id}
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAssignedAdmins([...assignedAdmins, admin.id]);
                                } else {
                                  setAssignedAdmins(assignedAdmins.filter((id) => id !== admin.id));
                                }
                              }}
                              className="w-4 h-4 text-primary-blue border-neutral-300 rounded focus:ring-primary-blue flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs md:text-sm font-medium text-neutral-800 truncate">{admin.name || admin.email}</div>
                              <div className="text-xs text-neutral-500 break-words">
                                {admin.role === 'superadmin' ? 'Superadmin' : admin.role === 'admin' ? 'Admin' : admin.role === 'lawyer' ? 'Avukat' : 'Acente'}
                                {admin.email && admin.name && (
                                  <span className="hidden sm:inline"> • {admin.email}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {assignedAdmins.length > 0 && (
                <div className="mt-2 md:mt-3 flex flex-wrap gap-1.5 md:gap-2">
                  {assignedAdmins.map((adminId) => {
                    const admin = allAdmins.find((a) => a.id === adminId);
                    if (!admin) return null;
                    return (
                      <div
                        key={adminId}
                        className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm"
                      >
                        <span className="truncate max-w-[150px] md:max-w-none">{admin.name || admin.email}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setAssignedAdmins(assignedAdmins.filter((id) => id !== adminId));
                            }}
                            className="hover:text-blue-600 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                💡 Bir müşteriye birden fazla admin atayabilirsiniz. Adminler sadece kendilerine atanan müşterileri görebilir.
              </p>
            </div>
          </div>
        </Card>
      )}

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
