import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DaySchedule } from '@/pages/TutorPages/Schedule/type';

interface DaySelectionProps {
  schedule: DaySchedule[];
  onDayToggle: (dayId: number) => void;
}

export const DaySelection: React.FC<DaySelectionProps> = ({
  schedule,
  onDayToggle,
}) => {
  return (
    <div className=" space-y-2">
      <Label className="text-xs font-medium">Chọn ngày làm việc</Label>
      <div className="grid grid-cols-2 gap-1.5">
        {schedule.map((day) => (
          <div key={day.id} className="flex items-center gap-1.5">
            <Checkbox
              id={`day-${day.id}`}
              checked={day.isEnabled}
              onCheckedChange={() => onDayToggle(day.id)}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor={`day-${day.id}`} className="text-xs cursor-pointer">
              {day.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
