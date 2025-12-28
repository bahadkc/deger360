'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, Building2, Scale, UserCheck, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getAllAdmins } from '@/lib/supabase/admin-auth';
import Link from 'next/link';
import { adminRoutes } from '@/lib/config/admin-paths';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignedCustomer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  dosya_takip_numarasi: string;
  case_id: string;
  case_number: string;
  vehicle_plate: string;
  status: string;
}

export default function AdminDetayPage() {
  const params = useParams();
  const router = useRouter();
  const adminId = params?.adminId as string;
  
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [assignedCustomers, setAssignedCustomers] = useState<AssignedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'customers'>('info');

  useEffect(() => {
    if (adminId) {
      loadAdminData();

      // Real-time subscription for case_admins changes
      const caseAdminsChannel = supabase
        .channel(`admin_detay_case_admins_${adminId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'case_admins',
            filter: `admin_id=eq.${adminId}`,
          },
          () => {
            loadAdminData();
          }
        )
        .subscribe();

      // Real-time subscription for cases changes
      const casesChannel = supabase
        .channel(`admin_detay_cases_${adminId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cases',
          },
          () => {
            loadAdminData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(caseAdminsChannel);
        supabase.removeChannel(casesChannel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  const loadAdminData = async () => {
    try {
      // Load admin info
      const allAdmins = await getAllAdmins();
      const admin = allAdmins.find((a) => a.id === adminId);
      
      if (!admin) {
        router.push(adminRoutes.admins);
        return;
      }

      setAdminInfo(admin);

      // Load assigned customers
      const { data: caseAdmins, error: caseAdminsError } = await supabase
        .from('case_admins')
        .select('case_id')
        .eq('admin_id', adminId);

      if (caseAdminsError) throw caseAdminsError;

      if (caseAdmins && caseAdmins.length > 0) {
        const caseIds = caseAdmins.map((ca: { case_id: string }) => ca.case_id);
        
        const { data: cases, error: casesError } = await supabase
          .from('cases')
          .select(`
            id,
            case_number,
            vehicle_plate,
            status,
            customers (
              id,
              full_name,
              email,
              phone,
              dosya_takip_numarasi
            )
          `)
          .in('id', caseIds);

        if (casesError) throw casesError;

        const customersList: AssignedCustomer[] = (cases || []).map((caseItem: any) => ({
          id: caseItem.customers?.id || '',
          full_name: caseItem.customers?.full_name || '',
          email: caseItem.customers?.email || '',
          phone: caseItem.customers?.phone || '',
          dosya_takip_numarasi: caseItem.customers?.dosya_takip_numarasi || '',
          case_id: caseItem.id,
          case_number: caseItem.case_number || '',
          vehicle_plate: caseItem.vehicle_plate || '',
          status: caseItem.status || 'active',
        }));

        setAssignedCustomers(customersList);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <UserCheck className="w-5 h-5 text-blue-600" />;
      case 'lawyer':
        return <Scale className="w-5 h-5 text-purple-600" />;
      case 'acente':
        return <Building2 className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'lawyer':
        return 'Avukat';
      case 'acente':
        return 'Acente';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!adminInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">Admin bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => router.push(adminRoutes.admins)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">{adminInfo.name || adminInfo.email}</h1>
            <p className="text-sm text-neutral-600">{getRoleLabel(adminInfo.role)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'info'
                ? 'text-primary-blue border-primary-blue'
                : 'text-neutral-600 border-transparent hover:text-neutral-800'
            }`}
          >
            Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'customers'
                ? 'text-primary-blue border-primary-blue'
                : 'text-neutral-600 border-transparent hover:text-neutral-800'
            }`}
          >
            Atanan Müşteriler ({assignedCustomers.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'info' && (
          <div className="max-w-2xl space-y-6">
            {/* Admin Info Card */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-neutral-800 mb-4">Admin Bilgileri</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getRoleIcon(adminInfo.role)}
                  <div>
                    <p className="text-sm text-neutral-600">Rol</p>
                    <p className="font-semibold text-neutral-800">{getRoleLabel(adminInfo.role)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">İsim</p>
                    <p className="font-semibold text-neutral-800">{adminInfo.name || 'Belirtilmemiş'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">E-posta</p>
                    <p className="font-semibold text-neutral-800">{adminInfo.email}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics Card */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-neutral-800 mb-4">İstatistikler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-neutral-600">Atanan Müşteri Sayısı</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{assignedCustomers.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-neutral-600">Aktif Dosyalar</p>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {assignedCustomers.filter((c) => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4">
            {assignedCustomers.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">Bu admin&apos;e henüz müşteri atanmamış</p>
              </Card>
            ) : (
              assignedCustomers.map((customer) => (
                <Link key={customer.case_id} href={adminRoutes.customerDetail(customer.case_id)}>
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary-blue">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-neutral-800">{customer.full_name}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              customer.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {customer.status === 'active' ? 'Aktif' : 'Kapandı'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-neutral-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Dosya No: </span>
                            {customer.dosya_takip_numarasi || '-'}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-neutral-500">
                          <span className="font-medium">Plaka: </span>
                          {customer.vehicle_plate}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
