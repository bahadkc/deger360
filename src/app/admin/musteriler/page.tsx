'use client';

import { useState, useEffect } from 'react';
import { CustomerList } from '@/components/admin/customer-list';
import { AddCustomerModal } from '@/components/admin/add-customer-modal';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          cases (
            id,
            case_number,
            status,
            vehicle_plate,
            vehicle_brand_model,
            value_loss_amount,
            fault_rate,
            board_stage,
            assigned_lawyer,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Her müşterinin ilk case'ini al (çoğu müşterinin tek case'i var)
      const customersWithCases = (data || []).map((customer: any) => ({
        ...customer,
        case: customer.cases && customer.cases.length > 0 ? customer.cases[0] : null,
      }));

      setCustomers(customersWithCases);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };


  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.case?.case_number?.toLowerCase().includes(query) ||
      customer.dosya_takip_numarasi?.toLowerCase().includes(query)
    );
  });

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Müşteriler</h1>
            <p className="text-sm text-neutral-600">Tüm müşterileri görüntüleyin ve yönetin</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Müşteri
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Müşteri ara (ad, email, telefon, dosya no)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto p-6">
        <CustomerList customers={filteredCustomers} />
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          loadCustomers();
        }}
      />
    </div>
  );
}
