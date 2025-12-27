import { FileText, Clock, Building2, User } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { Card } from '@/components/ui/card';

interface SummaryCard {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'completed' | 'active' | 'waiting' | 'warning' | 'error';
}

interface DashboardSummaryCardsProps {
  fileNumber?: string;
  status?: string;
  duration?: string;
  insuranceCompany?: string;
  assignedLawyer?: string;
}

export function DashboardSummaryCards({
  fileNumber = '#DK-2024-542',
  status = 'Aktif',
  duration = '160 gün',
  insuranceCompany = '-',
  assignedLawyer = 'Atanmadı',
}: DashboardSummaryCardsProps) {
  const cards: SummaryCard[] = [
    {
      label: 'Dosya No',
      value: fileNumber,
      icon: FileText,
    },
    {
      label: 'Durum',
      value: status,
      icon: Clock,
      status: 'active',
    },
    {
      label: 'Tahmini Süre',
      value: duration,
      icon: Clock,
    },
    {
      label: 'Sigorta Şirketi',
      value: insuranceCompany,
      icon: Building2,
    },
    {
      label: 'Sorumlu Avukat',
      value: assignedLawyer,
      icon: User,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-primary-blue/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary-blue" />
              </div>
              {card.status && <StatusBadge status={card.status} />}
            </div>
            <p className="text-sm text-neutral-600 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-neutral-800">{card.value}</p>
          </Card>
        );
      })}
    </div>
  );
}
