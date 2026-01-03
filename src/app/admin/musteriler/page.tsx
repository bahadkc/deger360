'use client';

import { useState, useEffect } from 'react';
import { CustomerList } from '@/components/admin/customer-list';
import { AddCustomerModal } from '@/components/admin/add-customer-modal';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAssignedCaseIds, isSuperAdmin, canEdit } from '@/lib/supabase/admin-auth';
import { optimizedCustomersApi, cacheInvalidation } from '@/lib/supabase/optimized-api';
import { useDebounce } from '@/lib/utils/debounce';

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [assignedCaseIds, setAssignedCaseIds] = useState<string[]>([]);
  const [canEditData, setCanEditData] = useState(false);
  
  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const superAdmin = await isSuperAdmin();
      setIsSuperAdminUser(superAdmin);
      
      const editPermission = await canEdit();
      setCanEditData(editPermission);
      
      if (!superAdmin) {
        const assignedIds = await getAssignedCaseIds();
        setAssignedCaseIds(assignedIds);
      }
    };
    checkAdminStatus();
    loadCustomers();
  }, []);

  // Reload when debounced search query changes
  useEffect(() => {
    loadCustomers(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const loadCustomers = async (search?: string) => {
    try {
      setLoading(true);
      
      // Update admin status and assigned cases
      const superAdmin = await isSuperAdmin();
      setIsSuperAdminUser(superAdmin);
      
      let assignedIds: string[] = [];
      if (!superAdmin) {
        assignedIds = await getAssignedCaseIds();
        setAssignedCaseIds(assignedIds);
        console.log('Non-superadmin: Assigned case IDs:', assignedIds);
      } else {
        console.log('Superadmin: Loading all customers');
      }

      // Use optimized API with caching and pagination
      // For superadmin, pass undefined (not empty array) to see all customers
      const data = await optimizedCustomersApi.getList({
        search: search || undefined,
        assignedCaseIds: superAdmin ? undefined : (assignedIds.length > 0 ? assignedIds : undefined),
        limit: 100, // Limit to prevent excessive data
      });

      console.log('Loaded customers:', data?.length || 0);
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      // Show error to user
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };


  // Filtering is now done server-side via optimized API
  const filteredCustomers = customers;

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
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Müşteriler</h1>
            <p className="text-xs sm:text-sm text-neutral-600">Tüm müşterileri görüntüleyin ve yönetin</p>
          </div>
          {(canEditData || isSuperAdminUser) && (
            <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Yeni Müşteri</span>
              <span className="sm:hidden">Yeni Ekle</span>
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Müşteri ara (ad, email, telefon, dosya no)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <CustomerList customers={filteredCustomers} onDelete={loadCustomers} />
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          cacheInvalidation.invalidateCustomer('all');
          loadCustomers(debouncedSearchQuery);
        }}
      />
    </div>
  );
}
