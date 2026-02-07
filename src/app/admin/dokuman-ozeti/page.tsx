'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { adminRoutes } from '@/lib/config/admin-paths';
import { cn } from '@/lib/utils';

interface DocumentStatus {
  key: string;
  name: string;
  uploaded: boolean;
  required: boolean;
}

interface CustomerSummary {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  dosya_takip_numarasi: string;
  case_id: string;
  case_number: string;
  vehicle_plate: string;
  vehicle_brand_model: string;
  documentStatus: DocumentStatus[];
}

export default function DokumanOzetiPage() {
  const router = useRouter();
  const [allCustomers, setAllCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-customers-documents-summary', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load customers');
      }

      const data = await response.json();
      setAllCustomers(data.customers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setAllCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering like adminler page
  const filterCustomers = (customers: CustomerSummary[]) => {
    if (!searchQuery) return customers;
    const searchLower = searchQuery.toLowerCase();
    return customers.filter((customer) => {
      return (
        customer.full_name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower) ||
        customer.dosya_takip_numarasi?.toLowerCase().includes(searchLower) ||
        customer.case_number?.toLowerCase().includes(searchLower) ||
        customer.vehicle_plate?.toLowerCase().includes(searchLower)
      );
    });
  };

  const customers = filterCustomers(allCustomers);

  const handleCustomerClick = (caseId: string) => {
    router.push(adminRoutes.customerDetail(caseId));
  };

  const getMissingDocumentsCount = (documentStatus: DocumentStatus[]) => {
    return documentStatus.filter((doc) => doc.required && !doc.uploaded).length;
  };

  const getTotalDocumentsCount = (documentStatus: DocumentStatus[]) => {
    return documentStatus.filter((doc) => doc.required).length;
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
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Döküman Özeti</h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Tüm müşterilerin döküman durumlarını görüntüleyin
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Müşteri ara (ad, email, telefon, dosya no, plaka)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {customers.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-600 text-lg mb-2">Müşteri bulunamadı</p>
            <p className="text-neutral-500 text-sm">
              {searchQuery ? 'Arama kriterlerinize uygun müşteri bulunamadı.' : 'Henüz müşteri kaydı bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {customers.map((customer) => {
              const missingCount = getMissingDocumentsCount(customer.documentStatus);
              const totalCount = getTotalDocumentsCount(customer.documentStatus);
              const completedCount = totalCount - missingCount;

              return (
                <Card
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer.case_id)}
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary-blue',
                    'border-2',
                    missingCount > 0 ? 'border-orange-200 bg-orange-50/50' : 'border-green-200 bg-green-50/50'
                  )}
                >
                  {/* Customer Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-neutral-800 text-sm sm:text-base mb-1 truncate">
                      {customer.full_name || 'İsimsiz Müşteri'}
                    </h3>
                    <p className="text-xs text-neutral-600 truncate">
                      {customer.dosya_takip_numarasi || customer.case_number}
                    </p>
                    {customer.vehicle_plate && (
                      <p className="text-xs text-neutral-500 mt-1">
                        🚗 {customer.vehicle_plate}
                        {customer.vehicle_brand_model && ` • ${customer.vehicle_brand_model}`}
                      </p>
                    )}
                  </div>

                  {/* Document Status Summary */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-700">Döküman Durumu</span>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded',
                        missingCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      )}>
                        {completedCount}/{totalCount}
                      </span>
                    </div>

                    {/* Document List */}
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {customer.documentStatus
                        .filter((doc) => doc.required)
                        .map((doc) => (
                          <div
                            key={doc.key}
                            className="flex items-center gap-2 text-xs"
                          >
                            {doc.uploaded ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                            )}
                            <span className={cn(
                              'truncate flex-1',
                              doc.uploaded ? 'text-neutral-700' : 'text-orange-700 font-medium'
                            )}>
                              {doc.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Missing Documents Warning */}
                  {missingCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <p className="text-xs text-orange-700 font-medium">
                        ⚠️ {missingCount} döküman eksik
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
