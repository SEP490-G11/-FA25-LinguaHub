import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavigatorProps {
  currentWeek: Date;
  dateRange: string;
  isCurrentWeek: boolean;
  onWeekChange: (direction: 'prev' | 'next') => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeek,
  dateRange,
  isCurrentWeek,
  onWeekChange,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-white border-b border-gray-200">
      <Button
        onClick={() => onWeekChange('prev')}
        variant="outline"
        size="sm"
        className="h-8 px-3 text-xs"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Tuần trước
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">
          {dateRange}
        </span>
        {isCurrentWeek && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            Tuần này
          </span>
        )}
      </div>

      <Button
        onClick={() => onWeekChange('next')}
        variant="outline"
        size="sm"
        className="h-8 px-3 text-xs"
      >
        Tuần sau
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};
