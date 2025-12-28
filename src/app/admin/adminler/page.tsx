'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Search, UserCheck, Scale, Building2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { getAllAdmins, isSuperAdmin } from '@/lib/supabase/admin-auth';
import Link from 'next/link';
import { adminRoutes } from '@/lib/config/admin-paths';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedCaseCount?: number;
}

export default function AdminlerPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [lawyers, setLawyers] = useState<AdminUser[]>([]);
  const [acentes, setAcentes] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const superAdmin = await isSuperAdmin();
      setIsSuperAdminUser(superAdmin);
    };
    checkSuperAdmin();
    loadAdmins();

    // Real-time subscription for user_auth changes (when new admins are created)
    const userAuthChannel = supabase
      .channel('adminler_user_auth_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_auth',
        },
        () => {
          loadAdmins();
        }
      )
      .subscribe();

    // Real-time subscription for case_admins changes (when admin assignments change)
    const caseAdminsChannel = supabase
      .channel('adminler_case_admins_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_admins',
        },
        () => {
          loadAdmins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userAuthChannel);
      supabase.removeChannel(caseAdminsChannel);
    };
  }, []);

  const loadAdmins = async () => {
    try {
      const allAdmins = await getAllAdmins();
      
      // Get assigned case counts for each admin
      const adminsWithCounts = await Promise.all(
        allAdmins.map(async (admin) => {
          const { count } = await supabase
            .from('case_admins')
            .select('*', { count: 'exact', head: true })
            .eq('admin_id', admin.id);
          
          return {
            ...admin,
            assignedCaseCount: count || 0,
          };
        })
      );

      // Separate by role (exclude superadmin)
      setAdmins(adminsWithCounts.filter((a) => a.role === 'admin'));
      setLawyers(adminsWithCounts.filter((a) => a.role === 'lawyer'));
      setAcentes(adminsWithCounts.filter((a) => a.role === 'acente'));
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (users: AdminUser[]) => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`"${adminName}" adlı admini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      setDeletingId(adminId);
      const response = await fetch(`/api/delete-admin?id=${adminId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Admin silinirken bir hata oluştu');
      }

      // Reload admins list
      await loadAdmins();
    } catch (error: any) {
      alert(error.message || 'Admin silinirken bir hata oluştu');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-800">Adminler</h1>
          <p className="text-sm text-neutral-600">Tüm adminleri görüntüleyin ve yönetin</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Admin ara (isim, email)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content - 3 Sections */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Adminler Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-neutral-800">Adminler</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {filterUsers(admins).length}
              </span>
            </div>
            <div className="space-y-3">
              {filterUsers(admins).map((admin) => (
                <Link key={admin.id} href={adminRoutes.adminDetail(admin.id)}>
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-blue-300 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-800 mb-1">{admin.name || admin.email}</h3>
                        <p className="text-sm text-neutral-600 mb-2">{admin.email}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-neutral-500">Atanan Müşteri:</span>
                          <span className="font-semibold text-blue-600">{admin.assignedCaseCount || 0}</span>
                        </div>
                      </div>
                      {isSuperAdminUser && (
                        <button
                          onClick={(e) => handleDeleteAdmin(admin.id, admin.name || admin.email, e)}
                          disabled={deletingId === admin.id}
                          className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Admini Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
              {filterUsers(admins).length === 0 && (
                <Card className="p-4 text-center text-neutral-500">
                  Admin bulunamadı
                </Card>
              )}
            </div>
          </div>

          {/* Avukatlar Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-neutral-800">Avukatlar</h2>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                {filterUsers(lawyers).length}
              </span>
            </div>
            <div className="space-y-3">
              {filterUsers(lawyers).map((lawyer) => (
                <Link key={lawyer.id} href={adminRoutes.adminDetail(lawyer.id)}>
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-purple-300 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-800 mb-1">{lawyer.name || lawyer.email}</h3>
                        <p className="text-sm text-neutral-600 mb-2">{lawyer.email}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-neutral-500">Atanan Müşteri:</span>
                          <span className="font-semibold text-purple-600">{lawyer.assignedCaseCount || 0}</span>
                        </div>
                      </div>
                      {isSuperAdminUser && (
                        <button
                          onClick={(e) => handleDeleteAdmin(lawyer.id, lawyer.name || lawyer.email, e)}
                          disabled={deletingId === lawyer.id}
                          className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Avukatı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
              {filterUsers(lawyers).length === 0 && (
                <Card className="p-4 text-center text-neutral-500">
                  Avukat bulunamadı
                </Card>
              )}
            </div>
          </div>

          {/* Acenteler Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-neutral-800">Acenteler</h2>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {filterUsers(acentes).length}
              </span>
            </div>
            <div className="space-y-3">
              {filterUsers(acentes).map((acente) => (
                <Link key={acente.id} href={adminRoutes.adminDetail(acente.id)}>
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-green-300 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-800 mb-1">{acente.name || acente.email}</h3>
                        <p className="text-sm text-neutral-600 mb-2">{acente.email}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-neutral-500">Atanan Müşteri:</span>
                          <span className="font-semibold text-green-600">{acente.assignedCaseCount || 0}</span>
                        </div>
                      </div>
                      {isSuperAdminUser && (
                        <button
                          onClick={(e) => handleDeleteAdmin(acente.id, acente.name || acente.email, e)}
                          disabled={deletingId === acente.id}
                          className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Acenteyi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
              {filterUsers(acentes).length === 0 && (
                <Card className="p-4 text-center text-neutral-500">
                  Acente bulunamadı
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
