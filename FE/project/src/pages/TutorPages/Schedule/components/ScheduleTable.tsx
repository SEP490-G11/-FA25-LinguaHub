import React, { memo } from 'react';
import { DaySchedule, TimeSlot, BookingPlan } from '@/pages/TutorPages/Schedule/type';

interface ScheduleTableProps {
  schedule: DaySchedule[];
  getSlotForTime: (day: DaySchedule, timeId: string) => TimeSlot | null;
  bookingPlans?: BookingPlan[];
  isEditMode?: boolean;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = memo(({
  schedule,
  getSlotForTime,
  bookingPlans = [],
  isEditMode = false,
}) => {
  const enabledDays = schedule.filter((day) => day.isEnabled);

  // Helper function to convert TimeObject to string format
  const timeObjectToString = (timeObj: { hour: number; minute: number }) => {
    return `${timeObj.hour.toString().padStart(2, '0')}:${timeObj.minute.toString().padStart(2, '0')}`;
  };

  // Helper function to generate time slots from booking plan
  const generateTimeSlotsFromBookingPlan = (plan: BookingPlan): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startTime = timeObjectToString(plan.start_hours);
    const endTime = timeObjectToString(plan.end_hours);
    const duration = plan.slot_duration;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes + duration <= endMinutes) {
      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const endM = currentMinutes + duration;
      const endH = Math.floor(endM / 60);
      const endMinute = endM % 60;

      slots.push({
        id: `${startH}:${startM.toString().padStart(2, '0')}-${endH}:${endMinute.toString().padStart(2, '0')}`,
        startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
        endTime: `${endH.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
      });

      currentMinutes += duration;
    }

    return slots;
  };

  // Helper function to get existing booking plan for a day
  const getExistingBookingPlan = (dayShortName: string): BookingPlan | null => {
    return bookingPlans.find(plan => plan.title === dayShortName) || null;
  };

  // Helper function to check if a time slot exists in existing booking plan
  const getExistingSlotForTime = (dayShortName: string, timeId: string): TimeSlot | null => {
    const existingPlan = getExistingBookingPlan(dayShortName);
    if (!existingPlan) return null;

    const existingSlots = generateTimeSlotsFromBookingPlan(existingPlan);
    return existingSlots.find(slot => slot.id === timeId) || null;
  };

  // Get all time slots including both new schedule and existing booking plans
  const getAllTimeSlotsIncludingExisting = (): string[] => {
    const allSlots = new Set<string>();
    
    // Add slots from current schedule (new/preview slots)
    schedule.forEach(day => {
      if (day.isEnabled && day.slots.length > 0) {
        day.slots.forEach(slot => {
          allSlots.add(slot.id);
        });
      }
    });

    // Add slots from existing booking plans
    bookingPlans.forEach(plan => {
      const existingSlots = generateTimeSlotsFromBookingPlan(plan);
      existingSlots.forEach(slot => {
        allSlots.add(slot.id);
      });
    });

    return Array.from(allSlots).sort((a, b) => {
      const [aStartTime] = a.split('-');
      const [bStartTime] = b.split('-');
      const [aHour, aMin] = aStartTime.split(':').map(Number);
      const [bHour, bMin] = bStartTime.split(':').map(Number);
      const aMinutes = aHour * 60 + aMin;
      const bMinutes = bHour * 60 + bMin;
      return aMinutes - bMinutes;
    });
  };

  // Get all days to display (both enabled days and days with existing booking plans)
  const getAllDaysToDisplay = () => {
    const daysMap = new Map<string, DaySchedule>();
    
    // Add enabled days from current schedule
    enabledDays.forEach(day => {
      daysMap.set(day.shortName, day);
    });

    // Add days from existing booking plans
    bookingPlans.forEach(plan => {
      if (!daysMap.has(plan.title)) {
        // Create a virtual day for existing booking plan
        const virtualDay: DaySchedule = {
          id: 0, // Virtual ID
          name: plan.title,
          shortName: plan.title,
          isEnabled: false,
          startTime: timeObjectToString(plan.start_hours),
          endTime: timeObjectToString(plan.end_hours),
          slots: generateTimeSlotsFromBookingPlan(plan)
        };
        daysMap.set(plan.title, virtualDay);
      }
    });

    return Array.from(daysMap.values()).sort((a, b) => {
      // Sort by day order: T2, T3, T4, T5, T6, T7, CN
      const dayOrder = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      const aIndex = dayOrder.indexOf(a.shortName);
      const bIndex = dayOrder.indexOf(b.shortName);
      return aIndex - bIndex;
    });
  };

  const displayTimeSlots = getAllTimeSlotsIncludingExisting();
  const displayDays = getAllDaysToDisplay();

  if (displayTimeSlots.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xs">Chưa có lịch làm việc</p>
          <p className="text-xs mt-1">
            {bookingPlans.length > 0 
              ? "Chọn ngày và nhấn 'Xem lịch' để hiển thị lịch hiện có"
              : "Vui lòng cấu hình và nhấn 'Tạo lịch'"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      {/* Legend for visual indicators */}
      {(displayDays.some(day => getExistingBookingPlan(day.shortName)) || displayDays.some(day => day.isEnabled)) && (
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-3 py-2">
          <div className="flex flex-wrap gap-4 text-xs">
            {displayDays.some(day => day.isEnabled) && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded"></div>
                <span className="text-emerald-600 font-medium">Lịch mới</span>
              </div>
            )}
            {displayDays.some(day => getExistingBookingPlan(day.shortName)) && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                <span className="text-blue-600 font-medium">Lịch hiện có</span>
              </div>
            )}
            {isEditMode && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
                <span className="text-amber-600 font-medium">Đang chỉnh sửa</span>
              </div>
            )}
          </div>
        </div>
      )}
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="bg-blue-600 text-white font-semibold text-center py-1.5 border-r border-blue-700 min-w-[80px]">
              Giờ
            </th>
            {displayDays.map((day) => {
              const hasExistingPlan = getExistingBookingPlan(day.shortName);
              const hasNewSchedule = day.isEnabled;
              const isBeingEdited = isEditMode && hasExistingPlan;
              
              // Determine header styling based on day type
              let headerClasses = 'text-white font-semibold text-center py-1.5 border-r border-blue-700 last:border-r-0 min-w-[70px] relative ';
              
              if (isBeingEdited) {
                headerClasses += 'bg-amber-600';
              } else if (hasNewSchedule) {
                headerClasses += 'bg-emerald-600';
              } else if (hasExistingPlan) {
                headerClasses += 'bg-blue-600';
              } else {
                headerClasses += 'bg-gray-500';
              }

              return (
                <th
                  key={`${day.shortName}-${day.id}`}
                  className={headerClasses}
                >
                  <div className="relative">
                    {day.shortName}
                    {/* Visual indicator for day type */}
                    {hasNewSchedule && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-300 rounded-full border border-white" title="Có lịch mới"></div>
                    )}
                    {hasExistingPlan && !hasNewSchedule && (
                      <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                        isBeingEdited ? 'bg-amber-300' : 'bg-blue-300'
                      }`} title={isBeingEdited ? "Đang chỉnh sửa" : "Có lịch hiện có"}></div>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayTimeSlots.map((timeId) => {
            const [startTime, endTime] = timeId.split('-');
            const [startH, startM] = startTime.split(':');
            const [endH, endM] = endTime.split(':');

            return (
              <tr key={timeId}>
                <td className="bg-gray-50 text-center py-1.5 font-medium border-r border-b border-gray-200 text-gray-700">
                  {startH.padStart(2, '0')}:{startM.padStart(2, '0')}-
                  {endH.padStart(2, '0')}:{endM.padStart(2, '0')}
                </td>
                {displayDays.map((day) => {
                  // Check for new schedule slot (from current form)
                  const newSlot = getSlotForTime(day, timeId);
                  // Check for existing booking plan slot
                  const existingSlot = getExistingSlotForTime(day.shortName, timeId);
                  
                  // Determine which slot to display and its type
                  const hasNewSlot = !!newSlot;
                  const hasExistingSlot = !!existingSlot;
                  const isExistingPlan = getExistingBookingPlan(day.shortName);
                  const isBeingEdited = isEditMode && isExistingPlan;

                  // Determine cell styling based on slot type and mode
                  let cellClasses = 'text-center py-1.5 font-medium border-r border-b border-gray-200 last:border-r-0 relative ';
                  let textContent = '';
                  
                  if (hasNewSlot) {
                    // New slot (preview from form)
                    cellClasses += 'bg-emerald-50 text-emerald-600 border-emerald-200';
                    textContent = `${newSlot.startTime}-${newSlot.endTime}`;
                  } else if (hasExistingSlot) {
                    if (isBeingEdited) {
                      // Existing slot being edited
                      cellClasses += 'bg-amber-50 text-amber-600 border-amber-200';
                    } else {
                      // Regular existing slot
                      cellClasses += 'bg-blue-50 text-blue-600 border-blue-200';
                    }
                    textContent = `${existingSlot.startTime}-${existingSlot.endTime}`;
                  } else {
                    // Empty slot
                    cellClasses += 'bg-white';
                  }

                  return (
                    <td
                      key={`${day.shortName}-${timeId}`}
                      className={cellClasses}
                    >
                      <div className="relative">
                        {textContent}
                        {/* Visual indicator for slot type */}
                        {hasNewSlot && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white" title="Lịch mới"></div>
                        )}
                        {hasExistingSlot && !hasNewSlot && (
                          <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                            isBeingEdited ? 'bg-amber-400' : 'bg-blue-400'
                          }`} title={isBeingEdited ? "Đang chỉnh sửa" : "Lịch hiện có"}></div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
