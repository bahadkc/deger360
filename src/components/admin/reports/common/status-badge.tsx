'use client';

import { cn } from '@/lib/utils';

export type StatusType = 'completed' | 'pending' | 'in_progress' | 'urgent';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
}

const statusConfig: Record<string, { color: string; bgColor: string; emoji: string }> = {
  completed: { color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', emoji: '🟢' },
  pending: { color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', emoji: '🟡' },
  in_progress: { color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', emoji: '🔵' },
  urgent: { color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', emoji: '🔴' },
  active: { color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', emoji: '🔵' },
  'basvuru_alindi': { color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', emoji: '📝' },
  'evrak_ekspertiz': { color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', emoji: '📋' },
  'sigorta_basvurusu': { color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200', emoji: '📮' },
  'muzakere': { color: 'text-pink-700', bgColor: 'bg-pink-50 border-pink-200', emoji: '🤝' },
  'odeme': { color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', emoji: '💰' },
  'tamamlandi': { color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', emoji: '✅' },
};

const statusLabels: Record<string, string> = {
  completed: 'Tamamlandı',
  pending: 'Beklemede',
  in_progress: 'İşlemde',
  urgent: 'Acil',
  active: 'Aktif',
  'basvuru_alindi': 'Başvuru Alındı',
  'evrak_ekspertiz': 'Evrak Toplama ve Bilir Kişi',
  'sigorta_basvurusu': 'Sigorta Başvurusu',
  'muzakere': 'Müzakere',
  'odeme': 'Ödeme',
  'tamamlandi': 'Tamamlandı',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const displayLabel = label || statusLabels[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border',
        config.color,
        config.bgColor
      )}
    >
      <span>{config.emoji}</span>
      <span>{displayLabel}</span>
    </span>
  );
}
