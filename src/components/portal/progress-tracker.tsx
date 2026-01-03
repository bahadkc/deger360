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
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {steps.map((step, index) => {
        const isExpanded = expandedSteps.has(step.id);
        const isExpandable = step.expandable !== false && (step.completedTasks || step.documents || step.missingDocuments || step.checklistItems);

        return (
          <div key={step.id} className="relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-4 sm:left-6 top-10 sm:top-12 w-0.5',
                  step.status === 'completed' ? 'bg-green-500' : 'bg-neutral-300'
                )}
                style={{ height: isExpanded ? 'calc(100% + 1rem)' : '100%' }}
              />
            )}

            <div className="relative flex gap-2 sm:gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 z-10">
                <div
                  className={cn(
                    'w-8 h-8 sm:w-10 sm:h-12 rounded-full flex items-center justify-center border-2',
                    step.status === 'completed'
                      ? 'bg-green-50 border-green-500'
                      : step.status === 'active'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-neutral-300'
                  )}
                >
                  {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />}
                  {step.status === 'active' && <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />}
                  {step.status === 'waiting' && <Circle className="w-4 h-4 sm:w-6 sm:h-6 text-neutral-400" />}
                  {step.status === 'warning' && <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500" />}
                  {!step.status && <Circle className="w-4 h-4 sm:w-6 sm:h-6 text-neutral-400" />}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-4 sm:pb-6 min-w-0">
                <div className="bg-white rounded-lg border border-neutral-200 p-3 sm:p-4 shadow-sm">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-neutral-800 break-words">{step.title}</h3>
                        <div className="flex-shrink-0">
                          <StatusBadge status={step.status} />
                        </div>
                      </div>
                      {step.date && (
                        <p className="text-xs sm:text-sm text-neutral-600 mb-1 break-words">
                          {step.date}
                          {step.duration && ` • ${step.duration}`}
                        </p>
                      )}
                      {step.description && (
                        <p className="text-xs sm:text-sm text-neutral-700 mt-1 sm:mt-2 break-words">{step.description}</p>
                      )}
                    </div>

                    {isExpandable && (
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-primary-orange hover:text-white hover:bg-primary-orange border border-primary-orange rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto"
                      >
                        {isExpanded ? (
                          <>
                            <span className="hidden sm:inline">Kapat</span>
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">İncele</span>
                            <span className="sm:hidden">Detay</span>
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-200 space-y-3 sm:space-y-4">
                      {step.completedTasks && step.completedTasks.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 mb-1 sm:mb-2">
                            Tamamlanan İşler:
                          </h4>
                          <ul className="space-y-1">
                            {step.completedTasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700">
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="break-words">{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.documents && step.documents.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 mb-1 sm:mb-2">
                            İlgili Belgeler:
                          </h4>
                          <div className="space-y-1">
                            {step.documents.map((doc, docIndex) => (
                              <div
                                key={docIndex}
                                className="flex items-center gap-2 text-xs sm:text-sm text-primary-blue hover:text-primary-orange cursor-pointer"
                              >
                                <span>📄</span>
                                <span className="break-words">{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.missingDocuments && step.missingDocuments.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-yellow-700 mb-1 sm:mb-2">
                            📎 Eksik Belgeler:
                          </h4>
                          <ul className="space-y-1">
                            {step.missingDocuments.map((doc, docIndex) => (
                              <li
                                key={docIndex}
                                className="flex items-start gap-2 text-xs sm:text-sm text-yellow-700"
                              >
                                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <span className="break-words">{doc.name}</span>
                                  {doc.deadline && (
                                    <span className="text-xs text-neutral-600 ml-1">
                                      (son {doc.deadline})
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.checklistItems && step.checklistItems.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 mb-1 sm:mb-2">
                            İşlem Detayları:
                          </h4>
                          <ul className="space-y-1.5 sm:space-y-2">
                            {step.checklistItems.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="flex items-start gap-2 text-xs sm:text-sm"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-300 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <span
                                    className={
                                      item.completed
                                        ? 'text-neutral-500 line-through break-words'
                                        : 'text-neutral-700 break-words'
                                    }
                                  >
                                    {item.title}
                                  </span>
                                  {item.completed && item.completed_at && (
                                    <p className="text-xs text-neutral-400 mt-0.5" suppressHydrationWarning>
                                      Tamamlandı: {typeof window !== 'undefined' ? new Date(item.completed_at).toLocaleDateString('tr-TR', {
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
