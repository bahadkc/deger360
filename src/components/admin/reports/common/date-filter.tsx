'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export type DateRangeType = 'this_month' | 'last_3_months' | 'this_year' | 'custom';

interface DateFilterProps {
  onDateRangeChange: (range: DateRangeType, startDate?: Date, endDate?: Date) => void;
}

export function DateFilter({ onDateRangeChange }: DateFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRangeType>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    // Initialize with this month on mount
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    onDateRangeChange('this_month', startDate, endDate);
  }, [onDateRangeChange]);

  const handleRangeChange = (range: DateRangeType) => {
    setSelectedRange(range);
    
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (range) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'last_3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        // Will be handled by custom date inputs
        return;
    }

    if (startDate && endDate) {
      onDateRangeChange(range, startDate, endDate);
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      onDateRangeChange('custom', start, end);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-neutral-200">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-neutral-600" />
        <span className="font-medium text-neutral-700">Tarih Aralığı:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleRangeChange('this_month')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedRange === 'this_month'
              ? 'bg-primary-blue text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Bu Ay
        </button>
        <button
          onClick={() => handleRangeChange('last_3_months')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedRange === 'last_3_months'
              ? 'bg-primary-blue text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Son 3 Ay
        </button>
        <button
          onClick={() => handleRangeChange('this_year')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedRange === 'this_year'
              ? 'bg-primary-blue text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Bu Yıl
        </button>
        <button
          onClick={() => handleRangeChange('custom')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedRange === 'custom'
              ? 'bg-primary-blue text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Özel
        </button>
      </div>

      {selectedRange === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg"
          />
          <span className="text-neutral-600">-</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg"
          />
          <button
            onClick={handleCustomDateApply}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
          >
            Uygula
          </button>
        </div>
      )}
    </div>
  );
}
