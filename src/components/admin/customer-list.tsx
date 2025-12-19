'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  dosya_takip_numarasi: string | null;
  case: {
    id: string;
    case_number: string;
    status: string;
    vehicle_plate: string;
    vehicle_brand_model: string;
    value_loss_amount: number | null;
    fault_rate: number | null;
    board_stage: string;
    assigned_lawyer: string | null;
    created_at: string;
  } | null;
}

interface CustomerListProps {
  customers: Customer[];
}

export function CustomerList({ customers }: CustomerListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getBoardStageLabel = (stage: string) => {
    const stages: Record<string, string> = {
      basvuru_alindi: 'Başvuru Alındı',
      ilk_gorusme: 'İlk Görüşme',
      evrak_ekspertiz: 'Evrak Toplama ve Ekspertiz',
      sigorta_basvurusu: 'Sigorta Başvurusu',
      muzakere: 'Müzakere',
      odeme: 'Ödeme',
    };
    return stages[stage] || stage;
  };

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-neutral-600">Henüz müşteri bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => {
        if (!customer.case) {
          return (
            <Card key={customer.id} className="p-3 bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-800">{customer.full_name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">Henüz dosya oluşturulmamış</p>
                </div>
              </div>
            </Card>
          );
        }

        const caseId = customer.case?.id;
        const detailUrl = caseId ? `/admin/musteriler/${caseId}` : null;

        return (
          <Link key={customer.id} href={detailUrl || '#'} className="block">
            <Card
              className="p-4 cursor-pointer hover:shadow-md transition-all bg-white border border-neutral-200 hover:border-primary-blue"
              onClick={(e) => {
                if (!caseId) {
                  e.preventDefault();
                  alert('Bu müşterinin henüz dosyası bulunmuyor.');
                }
              }}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Sol Taraf - Müşteri Bilgileri */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-2xl">👤</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-800 truncate">{customer.full_name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-neutral-600">
                      {customer.case.vehicle_plate && (
                        <span className="flex items-center gap-1">
                          <span>🚗</span>
                          <span>{customer.case.vehicle_plate}</span>
                        </span>
                      )}
                      {customer.case.value_loss_amount && (
                        <span className="flex items-center gap-1">
                          <span>💸</span>
                          <span className="font-medium text-primary-blue">
                            {customer.case.value_loss_amount.toLocaleString('tr-TR')} TL
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf - Avukat ve Durum */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {customer.case.assigned_lawyer && (
                    <div className="text-right">
                      <div className="text-xs text-neutral-500">Avukat</div>
                      <div className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                        <span>⚖️</span>
                        <span>{customer.case.assigned_lawyer}</span>
                      </div>
                    </div>
                  )}
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      getStatusColor(customer.case.status)
                    )}
                  >
                    {customer.case.status === 'active' ? 'Aktif' : 'Kapandı'}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
