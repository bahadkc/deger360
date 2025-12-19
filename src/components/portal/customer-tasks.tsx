import { CheckCircle2, Circle, Upload, Camera, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface CustomerTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  actionUrl?: string;
}

interface CustomerTasksProps {
  tasks: CustomerTask[];
  className?: string;
}

export function CustomerTasks({ tasks, className }: CustomerTasksProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  const toggleTask = (id: string) => {
    setLocalTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          // Müşteri görevi tamamladı - sadece tamamlanmamış görevleri tamamlanmış yapabilir
          if (!task.completed) {
            return { ...task, completed: true };
          }
        }
        return task;
      })
    );
  };

  const completedCount = localTasks.filter((t) => t.completed).length;
  const allCompleted = completedCount === localTasks.length;

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800 mb-1">Sizin Yapmanız Gerekenler</h2>
            <p className="text-sm text-neutral-600">
              {completedCount} / {localTasks.length} tamamlandı
            </p>
          </div>
          {allCompleted && (
            <div className="text-4xl animate-bounce">😊</div>
          )}
        </div>

        <div className="space-y-3">
          {localTasks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300" />
              <p>Tüm görevler tamamlandı!</p>
            </div>
          ) : (
            <>
              {localTasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg border transition-all',
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 hover:border-primary-orange/30'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => !task.completed && toggleTask(task.id)}
                      disabled={task.completed}
                      className={cn(
                        'mt-0.5 flex-shrink-0 transition-all',
                        task.completed 
                          ? 'cursor-default' 
                          : 'cursor-pointer hover:scale-110'
                      )}
                      title={task.completed ? 'Tamamlandı' : 'Tamamlandı olarak işaretle'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-neutral-400 hover:text-primary-orange transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg flex-shrink-0',
                            task.completed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-primary-orange/10 text-primary-orange'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              'font-semibold text-sm mb-1',
                              task.completed
                                ? 'line-through text-neutral-500'
                                : 'text-neutral-800'
                            )}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-neutral-600">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {allCompleted && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">😊</div>
              <div>
                <p className="font-semibold text-green-800 mb-1">Harika! Tüm görevler tamamlandı</p>
                <p className="text-sm text-green-700">
                  Gerisini biz hallederiz. Dosyanızın durumunu takip etmeye devam edebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
