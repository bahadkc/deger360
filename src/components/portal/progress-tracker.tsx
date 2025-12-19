'use client';

import { CheckCircle2, Clock, Circle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge, StatusType } from './status-badge';
import { useState } from 'react';

export interface ProgressStep {
  id: string;
  title: string;
  status: StatusType;
  date?: string;
  duration?: string;
  description?: string;
  completedTasks?: string[];
  documents?: Array<{ name: string; type: string }>;
  missingDocuments?: Array<{ name: string; deadline?: string }>;
  expandable?: boolean;
  checklistItems?: Array<{ task_key: string; title: string; completed: boolean; completed_at?: string | null }>;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ProgressTracker({ steps, orientation = 'vertical', className }: ProgressTrackerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'active':
        return <Clock className="w-6 h-6 text-blue-500" />;
      case 'waiting':
        return <Circle className="w-6 h-6 text-neutral-400" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Circle className="w-6 h-6 text-neutral-400" />;
    }
  };

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-2 overflow-x-auto pb-4', className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex flex-col items-center gap-2 min-w-[120px]">
              {getStatusIcon(step.status)}
              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-800">{step.title}</p>
                {step.date && <p className="text-xs text-neutral-600">{step.date}</p>}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-neutral-300 flex-shrink-0"></div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {steps.map((step, index) => {
        const isExpanded = expandedSteps.has(step.id);
        const isExpandable = step.expandable !== false && (step.completedTasks || step.documents || step.missingDocuments || step.checklistItems);

        return (
          <div key={step.id} className="relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-6 top-12 w-0.5',
                  step.status === 'completed' ? 'bg-green-500' : 'bg-neutral-300'
                )}
                style={{ height: isExpanded ? 'calc(100% + 1.5rem)' : '100%' }}
              />
            )}

            <div className="relative flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 z-10">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2',
                    step.status === 'completed'
                      ? 'bg-green-50 border-green-500'
                      : step.status === 'active'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-neutral-300'
                  )}
                >
                  {getStatusIcon(step.status)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-800">{step.title}</h3>
                        <StatusBadge status={step.status} />
                      </div>
                      {step.date && (
                        <p className="text-sm text-neutral-600 mb-1">
                          {step.date}
                          {step.duration && ` • ${step.duration}`}
                        </p>
                      )}
                      {step.description && (
                        <p className="text-sm text-neutral-700 mt-2">{step.description}</p>
                      )}
                    </div>

                    {isExpandable && (
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="flex-shrink-0 px-3 py-1.5 text-sm text-primary-orange hover:text-white hover:bg-primary-orange border border-primary-orange rounded-lg transition-colors flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>Kapat</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>İncele</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
                      {step.completedTasks && step.completedTasks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-800 mb-2">
                            Tamamlanan İşler:
                          </h4>
                          <ul className="space-y-1">
                            {step.completedTasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-center gap-2 text-sm text-neutral-700">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.documents && step.documents.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-800 mb-2">
                            İlgili Belgeler:
                          </h4>
                          <div className="space-y-1">
                            {step.documents.map((doc, docIndex) => (
                              <div
                                key={docIndex}
                                className="flex items-center gap-2 text-sm text-primary-blue hover:text-primary-orange cursor-pointer"
                              >
                                <span>📄</span>
                                {doc.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.missingDocuments && step.missingDocuments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-700 mb-2">
                            📎 Eksik Belgeler:
                          </h4>
                          <ul className="space-y-1">
                            {step.missingDocuments.map((doc, docIndex) => (
                              <li
                                key={docIndex}
                                className="flex items-center gap-2 text-sm text-yellow-700"
                              >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {doc.name}
                                {doc.deadline && (
                                  <span className="text-xs text-neutral-600">
                                    (son {doc.deadline})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.checklistItems && step.checklistItems.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-800 mb-2">
                            İşlem Detayları:
                          </h4>
                          <ul className="space-y-2">
                            {step.checklistItems.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="flex items-start gap-2 text-sm"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-4 h-4 text-neutral-300 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <span
                                    className={
                                      item.completed
                                        ? 'text-neutral-500 line-through'
                                        : 'text-neutral-700'
                                    }
                                  >
                                    {item.title}
                                  </span>
                                  {item.completed && item.completed_at && (
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                      Tamamlandı: {new Date(item.completed_at).toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
