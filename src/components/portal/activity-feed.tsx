import { Bell, FileText, MessageSquare, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
export interface ActivityItem {
  id: string;
  type: 'document' | 'message' | 'status' | 'milestone';
  title: string;
  description?: string;
  timestamp: Date;
  user?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const activityIcons = {
  document: FileText,
  message: MessageSquare,
  status: CheckCircle2,
  milestone: Sparkles,
};

const activityColors = {
  document: 'text-blue-500',
  message: 'text-purple-500',
  status: 'text-green-500',
  milestone: 'text-primary-orange',
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return minutes <= 0 ? 'Az önce' : `${minutes} dakika önce`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return hours === 1 ? '1 saat önce' : `${hours} saat önce`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      if (days === 1) return 'Dün';
      return `${days} gün önce`;
    }
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-primary-orange" />
          <h2 className="text-xl font-bold text-neutral-800">Son Hareketler</h2>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p>Henüz aktivite bulunmuyor</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const iconColor = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0 last:pb-0"
                >
                  <div className={`flex-shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-neutral-800">{activity.title}</p>
                      <span className="text-xs text-neutral-500 whitespace-nowrap">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-neutral-600">{activity.description}</p>
                    )}
                    {activity.user && (
                      <p className="text-xs text-neutral-500 mt-1">{activity.user}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
