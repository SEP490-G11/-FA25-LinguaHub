import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DaySchedule } from '@/pages/TutorPages/Schedule/type';

interface DayTimeCustomizationProps {
  schedule: DaySchedule[];
  onDayTimeChange: (dayId: number, field: 'startTime' | 'endTime', value: string) => void;
}

export const DayTimeCustomization: React.FC<DayTimeCustomizationProps> = ({
  schedule,
  onDayTimeChange,
}) => {
  const enabledDays = schedule.filter((day) => day.isEnabled);

  if (enabledDays.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Tùy chỉnh giờ cho từng ngày</Label>
      {enabledDays.map((day) => (
        <div key={day.id} className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">{day.name}</Label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min="0"
              max="23"
              value={parseInt(day.startTime.split(':')[0])}
              onChange={(e) => {
                const hour = e.target.value.padStart(2, '0');
                onDayTimeChange(day.id, 'startTime', `${hour}:00`);
              }}
              className="h-7 text-xs"
            />
            <span className="text-xs text-gray-500">-</span>
            <Input
              type="number"
              min="0"
              max="23"
              value={parseInt(day.endTime.split(':')[0])}
              onChange={(e) => {
                const hour = e.target.value.padStart(2, '0');
                onDayTimeChange(day.id, 'endTime', `${hour}:00`);
              }}
              className="h-7 text-xs"
            />
            <span className="text-xs text-gray-500">giờ</span>
          </div>
        </div>
      ))}
    </div>
  );
};
