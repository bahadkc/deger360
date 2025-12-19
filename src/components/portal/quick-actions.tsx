import { Upload, MessageSquare, Phone, FileDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Belge Yükle',
    icon: Upload,
    href: '/portal/belgeler',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    label: 'Mesaj Gönder',
    icon: MessageSquare,
    href: '/portal/mesajlar',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    label: 'Görüşme Talep Et',
    icon: Phone,
    href: '/portal/mesajlar',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    label: 'Rapor İndir',
    icon: FileDown,
    href: '/portal/belgeler',
    color: 'bg-primary-orange hover:bg-primary-orange-hover',
  },
];

export function QuickActions() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-neutral-800 mb-6">Hızlı İşlemler</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center gap-2 transition-all hover:shadow-lg transform hover:-translate-y-1`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-semibold text-center">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
