import React, { memo, useMemo } from 'react';
import { BookedSlot, DayGroup } from '../types';
import { BookedSlotCard } from './BookedSlotCard';
import { Calendar } from 'lucide-react';

interface BookedSlotsListProps {
  bookedSlots: BookedSlot[];
  weekStart: Date;
  onSlotClick?: (slot: BookedSlot) => void;
}

// Helper function to get day name in Vietnamese
const getDayName = (dayOfWeek: number): string => {
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return dayNames[dayOfWeek];
};

// Helper function to format date as DD/MM/YYYY
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to check if a date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Helper function to group slots by day
const groupSlotsByDay = (slots: BookedSlot[], weekStart: Date): DayGroup[] => {
  const dayGroups: DayGroup[] = [];
  
  // Create 7 days starting from weekStart
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const dayOfWeek = date.getDay();
    const dayName = getDayName(dayOfWeek);
    const dayLabel = `${dayName}, ${formatDate(date)}`;
    
    // Filter slots for this day
    const daySlots = slots.filter((slot) => {
      const slotDate = new Date(slot.start_time);
      return (
        slotDate.getDate() === date.getDate() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Sort slots by start time
    daySlots.sort((a, b) => {
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
    
    dayGroups.push({
      date,
      dayName,
      dayLabel,
      isToday: isToday(date),
      slots: daySlots,
    });
  }
  
  return dayGroups;
};

export const BookedSlotsList: React.FC<BookedSlotsListProps> = memo(({
  bookedSlots,
  weekStart,
  onSlotClick,
}) => {
  // Group slots by day
  const dayGroups = useMemo(
    () => groupSlotsByDay(bookedSlots, weekStart),
    [bookedSlots, weekStart]
  );
  
  // Check if there are any slots in the week
  const hasSlots = dayGroups.some((group) => group.slots.length > 0);
  
  if (!hasSlots) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Chưa có slot nào được đặt trong tuần này</p>
          <p className="text-xs mt-1">Các slot đã đặt sẽ hiển thị ở đây</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
      {dayGroups.map((dayGroup) => {
        // Skip days with no slots
        if (dayGroup.slots.length === 0) {
          return null;
        }
        
        return (
          <div key={dayGroup.date.toISOString()} className="space-y-2">
            {/* Day header - matching Schedule page styling */}
            <div
              className={`sticky top-0 z-10 py-2 px-3 rounded-lg ${
                dayGroup.isToday
                  ? 'bg-blue-100 border-l-4 border-blue-500'
                  : 'bg-gray-100'
              }`}
            >
              <h3
                className={`text-sm font-semibold ${
                  dayGroup.isToday ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                {dayGroup.dayLabel}
                {dayGroup.isToday && (
                  <span className="ml-2 text-xs font-normal text-blue-700">(Hôm nay)</span>
                )}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {dayGroup.slots.length} slot{dayGroup.slots.length > 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Slots grid - responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 px-1">
              {dayGroup.slots.map((slot) => (
                <BookedSlotCard
                  key={slot.slotid}
                  slot={slot}
                  onClick={onSlotClick ? () => onSlotClick(slot) : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

BookedSlotsList.displayName = 'BookedSlotsList';
