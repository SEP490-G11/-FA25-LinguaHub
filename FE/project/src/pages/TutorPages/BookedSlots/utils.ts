// Utility functions for date and slot management

import { BookedSlot, DayGroup, WeekData } from './types';

/**
 * Get the start of the week (Sunday) for a given date
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = day; // Days to subtract to get to Sunday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of the week (Saturday) for a given date
 */
export const getWeekEnd = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = 6 - day; // Days to add to get to Saturday
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Format date to Vietnamese format: DD/MM/YYYY
 */
export const formatDateVietnamese = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Get Vietnamese day name
 */
export const getVietnameseDayName = (date: Date): string => {
  const dayOfWeek = date.getDay();
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return dayNames[dayOfWeek];
};

/**
 * Format day label in Vietnamese format: "Thứ X, DD/MM/YYYY"
 */
export const formatDayLabel = (date: Date): string => {
  const dayName = getVietnameseDayName(date);
  const dateStr = formatDateVietnamese(date);
  return `${dayName}, ${dateStr}`;
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Filter slots by week
 * Returns slots that fall within the given week (Sunday to Saturday)
 */
export const filterSlotsByWeek = (slots: BookedSlot[], weekStart: Date): BookedSlot[] => {
  const weekEnd = getWeekEnd(weekStart);
  
  return slots.filter(slot => {
    const slotDate = new Date(slot.start_time);
    return slotDate >= weekStart && slotDate <= weekEnd;
  });
};

/**
 * Group slots by day
 * Returns an array of DayGroup objects, one for each day in the week
 */
export const groupSlotsByDay = (slots: BookedSlot[], weekStart: Date): DayGroup[] => {
  const dayGroups: DayGroup[] = [];
  
  // Create a group for each day of the week (Sunday to Saturday)
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    
    // Filter slots for this specific day
    const daySlots = slots.filter(slot => {
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
      date: date,
      dayName: getVietnameseDayName(date),
      dayLabel: formatDayLabel(date),
      isToday: isToday(date),
      slots: daySlots,
    });
  }
  
  return dayGroups;
};

/**
 * Get week data including date range and grouped slots
 */
export const getWeekData = (slots: BookedSlot[], selectedWeek: Date): WeekData => {
  const weekStart = getWeekStart(selectedWeek);
  const weekEnd = getWeekEnd(selectedWeek);
  
  const filteredSlots = filterSlotsByWeek(slots, weekStart);
  const dayGroups = groupSlotsByDay(filteredSlots, weekStart);
  
  const dateRange = `${formatDateVietnamese(weekStart)} - ${formatDateVietnamese(weekEnd)}`;
  
  return {
    weekStart,
    weekEnd,
    dateRange,
    dayGroups,
  };
};

/**
 * Navigate to previous week
 */
export const getPreviousWeek = (currentWeek: Date): Date => {
  const newWeek = new Date(currentWeek);
  newWeek.setDate(newWeek.getDate() - 7);
  return newWeek;
};

/**
 * Navigate to next week
 */
export const getNextWeek = (currentWeek: Date): Date => {
  const newWeek = new Date(currentWeek);
  newWeek.setDate(newWeek.getDate() + 7);
  return newWeek;
};

/**
 * Format time from ISO string to HH:mm format
 */
export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format time range from start and end ISO strings
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};
