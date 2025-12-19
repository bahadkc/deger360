import { CheckCircle2, Clock, AlertCircle, XCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'completed' | 'active' | 'waiting' | 'warning' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    bgColor: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-500',
    label: 'Tamamlandı',
    emoji: '✅',
  },
  active: {
    icon: Clock,
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-500',
    label: 'Devam Ediyor',
    emoji: '🔵',
  },
  waiting: {
    icon: Circle,
    bgColor: 'bg-neutral-400',
    textColor: 'text-neutral-600',
    bgLight: 'bg-neutral-50',
    borderColor: 'border-neutral-400',
    label: 'Bekliyor',
    emoji: '⚪',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    label: 'Dikkat',
    emoji: '⚠️',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500',
    textColor: 'text-red-700',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-500',
    label: 'Sorun',
    emoji: '❌',
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold',
        config.bgLight,
        config.textColor,
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {displayLabel}
    </span>
  );
}
