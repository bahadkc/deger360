import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
  urgent?: boolean;
}

interface UpcomingTasksProps {
  tasks: Task[];
  className?: string;
}

export function UpcomingTasks({ tasks, className }: UpcomingTasksProps) {
  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-neutral-800">Yaklaşan Görevler</h2>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300" />
              <p>Tüm görevler tamamlandı!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <label
                key={task.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  task.completed
                    ? 'bg-green-50 border-green-200'
                    : task.urgent
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                )}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="mt-1 w-4 h-4 text-primary-orange rounded focus:ring-primary-orange"
                />
                <div className="flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      task.completed ? 'line-through text-neutral-500' : 'text-neutral-800'
                    )}
                  >
                    {task.title}
                  </p>
                  {task.deadline && !task.completed && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {task.urgent && '⚠️ '}
                      {task.deadline}
                    </p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
